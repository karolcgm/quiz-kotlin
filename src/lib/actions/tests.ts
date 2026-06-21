"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { GradeLevel } from "@/types/curriculum";
import type { TestItem } from "@/types/test";

export interface SaveTestActionResult {
  ok: boolean;
  error?: string;
}

type ComposerItemPayload = Omit<TestItem, "id"> & {
  localId?: string;
};

type RpcItem = {
  position: number;
  simulationSlug: string;
  widgetKind: string;
  skill: string;
  title: string;
  prompt: string;
  points: number;
  params: TestItem["params"];
};

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

function mapItemsForRpc(items: ComposerItemPayload[]): RpcItem[] {
  return items.map((item, index) => ({
    position: item.position ?? index + 1,
    simulationSlug: item.simulationSlug,
    widgetKind: item.widgetKind,
    skill: item.skill,
    title: item.title,
    prompt: item.prompt,
    points: item.points ?? 1,
    params: item.params ?? {},
  }));
}

function isMissingRpcFunction(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("create_teacher_test") &&
    (normalized.includes("could not find") ||
      normalized.includes("does not exist") ||
      normalized.includes("schema cache") ||
      normalized.includes("pgrst202"))
  );
}

function formatRpcError(message: string): string {
  if (isMissingRpcFunction(message)) {
    return "Brak funkcji create_teacher_test w bazie. Uruchom migrację 006_create_teacher_test_rpc.sql w Supabase SQL Editor.";
  }

  return message;
}

async function assertTeacherSchoolAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  schoolId: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("teacher_school_memberships")
    .select("school_id")
    .eq("teacher_id", teacherId)
    .eq("school_id", schoolId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Nie masz dostępu do wybranej szkoły. Dodaj szkołę w panelu uczniów.");
  }
}

async function createTestDirectly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  input: {
    schoolId: string;
    title: string;
    description: string;
    instruction: string;
    classLevel: GradeLevel;
    status: "draft" | "published";
    items: RpcItem[];
  },
): Promise<string> {
  const maxPoints = input.items.reduce((sum, item) => sum + (item.points ?? 1), 0);

  const { data: test, error: testError } = await supabase
    .from("tests")
    .insert({
      teacher_id: teacherId,
      school_id: input.schoolId,
      title: input.title,
      description: input.description || null,
      instruction: input.instruction || null,
      class_level: input.classLevel,
      status: input.status,
      max_points: maxPoints,
      config: { source: "composer" },
    })
    .select("id")
    .single();

  if (testError || !test) {
    throw new Error(testError?.message ?? "Nie udało się utworzyć testu.");
  }

  const { error: itemsError } = await supabase.from("test_items").insert(
    input.items.map((item) => ({
      test_id: test.id,
      position: item.position,
      simulation_slug: item.simulationSlug,
      widget_kind: item.widgetKind,
      skill: item.skill,
      title: item.title,
      prompt: item.prompt,
      points: item.points,
      params: item.params,
    })),
  );

  if (itemsError) {
    await supabase.from("tests").delete().eq("id", test.id);
    throw new Error(itemsError.message);
  }

  return test.id;
}

async function createTestViaRpc(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    schoolId: string;
    title: string;
    description: string;
    instruction: string;
    classLevel: GradeLevel;
    status: "draft" | "published";
    items: RpcItem[];
  },
): Promise<string> {
  const { data: testId, error } = await supabase.rpc("create_teacher_test", {
    target_school_id: input.schoolId,
    test_title: input.title,
    test_description: input.description,
    test_instruction: input.instruction,
    target_class_level: input.classLevel,
    target_status: input.status,
    items: input.items,
  });

  if (error) {
    if (isMissingRpcFunction(error.message)) {
      throw new Error("MISSING_RPC");
    }

    throw new Error(formatRpcError(error.message));
  }

  if (!testId) {
    throw new Error("Supabase nie zwróciło identyfikatora zapisanego testu.");
  }

  return String(testId);
}

async function updateTestDirectly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  testId: string,
  input: {
    schoolId: string;
    title: string;
    description: string;
    instruction: string;
    classLevel: GradeLevel;
    status: "draft" | "published";
    items: RpcItem[];
  },
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("tests")
    .select("id")
    .eq("id", testId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (!existing) {
    throw new Error("Nie znaleziono testu do edycji.");
  }

  const maxPoints = input.items.reduce((sum, item) => sum + (item.points ?? 1), 0);

  const { error: updateError } = await supabase
    .from("tests")
    .update({
      school_id: input.schoolId,
      title: input.title,
      description: input.description || null,
      instruction: input.instruction || null,
      class_level: input.classLevel,
      status: input.status,
      max_points: maxPoints,
      updated_at: new Date().toISOString(),
    })
    .eq("id", testId)
    .eq("teacher_id", teacherId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: deleteError } = await supabase.from("test_items").delete().eq("test_id", testId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: itemsError } = await supabase.from("test_items").insert(
    input.items.map((item) => ({
      test_id: testId,
      position: item.position,
      simulation_slug: item.simulationSlug,
      widget_kind: item.widgetKind,
      skill: item.skill,
      title: item.title,
      prompt: item.prompt,
      points: item.points,
      params: item.params,
    })),
  );

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return testId;
}

export async function saveTestAction(
  _previousState: SaveTestActionResult | null,
  formData: FormData,
): Promise<SaveTestActionResult> {
  try {
    const teacher = await requireRole("teacher");
    const supabase = await createClient();
    const title = requiredString(formData, "title");
    const schoolId = requiredString(formData, "schoolId");
    const classLevel = Number(requiredString(formData, "classLevel")) as GradeLevel;
    const description = formData.get("description")?.toString() ?? "";
    const instruction = formData.get("instruction")?.toString() ?? "";
    const intent = formData.get("intent")?.toString();
    const testId = formData.get("testId")?.toString()?.trim() || null;
    const itemsJson = requiredString(formData, "itemsJson");
    let items: ComposerItemPayload[];

    try {
      const parsedItems = JSON.parse(itemsJson);
      if (!Array.isArray(parsedItems)) {
        throw new Error("Items payload is not an array.");
      }
      items = parsedItems as ComposerItemPayload[];
    } catch {
      return {
        ok: false,
        error: "Nie udało się odczytać pytań testu. Odśwież stronę i spróbuj ponownie.",
      };
    }

    if (items.length === 0) {
      return { ok: false, error: "Dodaj przynajmniej jedno pytanie do testu." };
    }

    if (!Number.isInteger(classLevel) || classLevel < 1 || classLevel > 8) {
      return { ok: false, error: "Klasa musi być liczbą od 1 do 8." };
    }

    await assertTeacherSchoolAccess(supabase, teacher.id, schoolId);

    const payload = {
      schoolId,
      title,
      description,
      instruction,
      classLevel,
      status: intent === "publish" ? ("published" as const) : ("draft" as const),
      items: mapItemsForRpc(items),
    };

    let savedTestId: string;

    if (testId) {
      savedTestId = await updateTestDirectly(supabase, teacher.id, testId, payload);
    } else {
      try {
        savedTestId = await createTestViaRpc(supabase, payload);
      } catch (error) {
        if (!(error instanceof Error) || error.message !== "MISSING_RPC") {
          throw error;
        }

        savedTestId = await createTestDirectly(supabase, teacher.id, payload);
      }
    }

    const { data: savedTest, error: verifyError } = await supabase
      .from("tests")
      .select("id")
      .eq("id", savedTestId)
      .eq("teacher_id", teacher.id)
      .maybeSingle();

    if (verifyError) {
      return { ok: false, error: verifyError.message };
    }

    if (!savedTest) {
      return {
        ok: false,
        error:
          "Test został zapisany w bazie, ale nie można go odczytać. Sprawdź polityki RLS lub uruchom migrację 006.",
      };
    }

    revalidatePath("/nauczyciel/testy");
    if (testId) {
      revalidatePath(`/nauczyciel/testy/${testId}/edytuj`);
    }
    if (payload.status === "published") {
      redirect(`/nauczyciel/testy/${savedTestId}/wyslij?published=1`);
    }

    redirect(`/nauczyciel/testy?saved=${payload.status}`);
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Nie udało się zapisać testu.",
    };
  }
}

export async function publishTestAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const testId = requiredString(formData, "testId");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tests")
    .update({ status: "published", updated_at: new Date().toISOString() })
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Nie znaleziono testu do opublikowania.");
  }

  revalidatePath("/nauczyciel/testy");
  redirect(`/nauczyciel/testy/${testId}/wyslij?published=1`);
}

export async function archiveTestAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const testId = requiredString(formData, "testId");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tests")
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Nie znaleziono testu do archiwizacji.");
  }

  revalidatePath("/nauczyciel/testy");
  redirect("/nauczyciel/testy?status=archived&archived=1");
}

export async function deleteTestAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const testId = requiredString(formData, "testId");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tests")
    .delete()
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Nie znaleziono testu do usunięcia.");
  }

  revalidatePath("/nauczyciel/testy");
  redirect("/nauczyciel/testy?deleted=1");
}
