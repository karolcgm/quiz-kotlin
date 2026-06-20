"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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

    if (kind === "fraction") {
      return {
        testItemId: itemId,
        answer: {
          numerator: Number(formData.get(`${fieldPrefix}.numerator`) ?? 0),
          denominator: Number(formData.get(`${fieldPrefix}.denominator`) ?? 1),
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
        result: Number(formData.get(`${fieldPrefix}.result`) ?? 0),
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

  redirect(`/uczen/wyniki/${submissionId}`);
}
