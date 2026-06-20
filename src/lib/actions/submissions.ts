"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function parseNumericAnswer(raw: FormDataEntryValue | null): number {
  if (raw === null) {
    return 0;
  }

  const text = raw.toString().trim();
  if (!text || text === "-") {
    return 0;
  }

  const value = Number(text);
  return Number.isFinite(value) ? value : 0;
}

export async function startTestAction(formData: FormData) {
  await requireRole("student");
  const supabase = await createClient();
  const assignmentId = formData.get("assignmentId")?.toString();

  if (!assignmentId) {
    throw new Error("Brakuje identyfikatora testu.");
  }

  const { error } = await supabase.rpc("start_assignment_attempt", {
    target_assignment_id: assignmentId,
  });

  if (error) {
    redirect(`/uczen/testy/${assignmentId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/uczen/testy/${assignmentId}`);
  revalidatePath("/uczen/testy");
  redirect(`/uczen/testy/${assignmentId}`);
}

export async function submitTestAction(formData: FormData) {
  await requireRole("student");
  const supabase = await createClient();
  const assignmentId = formData.get("assignmentId")?.toString();
  const itemIdsJson = formData.get("itemIdsJson")?.toString();

  if (!assignmentId || !itemIdsJson) {
    throw new Error("Brakuje danych testu.");
  }

  let itemIds: string[];

  try {
    const parsedItemIds = JSON.parse(itemIdsJson);
    if (!Array.isArray(parsedItemIds) || !parsedItemIds.every((itemId) => typeof itemId === "string")) {
      throw new Error("Invalid item id payload.");
    }
    itemIds = parsedItemIds;
  } catch {
    throw new Error("Nie udało się odczytać odpowiedzi testu. Odśwież stronę i spróbuj ponownie.");
  }

  const answers = itemIds.map((itemId) => {
    const fieldPrefix = `answer-${itemId}`;
    const kind = formData.get(`${fieldPrefix}.kind`)?.toString();

    if (kind === "word-problem") {
      const partIds =
        formData
          .get(`${fieldPrefix}.partIds`)
          ?.toString()
          .split(",")
          .filter(Boolean) ?? [];
      const parts: Record<string, number> = {};
      for (const partId of partIds) {
        parts[partId] = parseNumericAnswer(formData.get(`${fieldPrefix}.part.${partId}`));
      }
      return { testItemId: itemId, answer: { parts } };
    }

    if (kind === "fraction") {
      return {
        testItemId: itemId,
        answer: {
          numerator: parseNumericAnswer(formData.get(`${fieldPrefix}.numerator`)),
          denominator: parseNumericAnswer(formData.get(`${fieldPrefix}.denominator`)) || 1,
        },
      };
    }

    if (kind === "comparison") {
      return {
        testItemId: itemId,
        answer: {
          comparison: formData.get(`${fieldPrefix}.comparison`)?.toString() ?? "=",
        },
      };
    }

    return {
      testItemId: itemId,
      answer: {
        result: parseNumericAnswer(formData.get(`${fieldPrefix}.result`)),
      },
    };
  });

  const { data: submissionId, error } = await supabase.rpc("submit_assignment", {
    target_assignment_id: assignmentId,
    answers,
  });

  if (error || !submissionId) {
    throw new Error(error?.message ?? "Nie udało się zapisać testu.");
  }

  revalidatePath("/uczen/testy");
  revalidatePath(`/uczen/testy/${assignmentId}`);
  redirect(`/uczen/wyniki/${submissionId}`);
}
