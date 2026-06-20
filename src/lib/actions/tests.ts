"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { GradeLevel } from "@/types/curriculum";
import type { TestItem } from "@/types/test";

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function saveTestAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const title = requiredString(formData, "title");
  const schoolId = requiredString(formData, "schoolId");
  const classLevel = Number(requiredString(formData, "classLevel")) as GradeLevel;
  const description = formData.get("description")?.toString() ?? "";
  const instruction = formData.get("instruction")?.toString() ?? "";
  const intent = formData.get("intent")?.toString();
  const itemsJson = requiredString(formData, "itemsJson");
  let items: Omit<TestItem, "id">[];

  try {
    const parsedItems = JSON.parse(itemsJson);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Items payload is not an array.");
    }
    items = parsedItems as Omit<TestItem, "id">[];
  } catch {
    throw new Error("Nie udało się odczytać pytań testu. Odśwież stronę i spróbuj ponownie.");
  }
  const maxPoints = items.reduce((sum, item) => sum + Number(item.points), 0);

  const { data: test, error } = await supabase
    .from("tests")
    .insert({
      teacher_id: teacher.id,
      school_id: schoolId,
      title,
      description,
      instruction,
      class_level: classLevel,
      status: intent === "publish" ? "published" : "draft",
      max_points: maxPoints,
      config: { source: "composer" },
    })
    .select("id")
    .single();

  if (error || !test) {
    throw new Error(error?.message ?? "Nie udało się zapisać testu.");
  }

  if (items.length > 0) {
    const rows = items.map((item) => ({
      test_id: test.id,
      position: item.position,
      simulation_slug: item.simulationSlug,
      widget_kind: item.widgetKind,
      skill: item.skill,
      title: item.title,
      prompt: item.prompt,
      points: item.points,
      params: item.params,
    }));

    const { error: itemsError } = await supabase.from("test_items").insert(rows);
    if (itemsError) {
      throw new Error(itemsError.message);
    }
  }

  redirect("/nauczyciel/testy");
}
