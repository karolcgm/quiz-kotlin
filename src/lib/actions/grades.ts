"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function updateGradeAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const submissionId = requiredString(formData, "submissionId");
  const mark = Number(requiredString(formData, "mark1To6"));
  const feedback = requiredString(formData, "feedbackText");

  if (!Number.isInteger(mark) || mark < 1 || mark > 6) {
    throw new Error("Ocena musi być liczbą od 1 do 6.");
  }

  const { error } = await supabase
    .from("submission_scores")
    .update({
      mark_1_6: mark,
      manual_feedback_text: feedback,
      feedback_text: feedback,
      is_teacher_override: true,
      graded_by: teacher.id,
      updated_at: new Date().toISOString(),
    })
    .eq("submission_id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/nauczyciel/wyniki/${submissionId}`);
}

export async function allowRetakeAction(formData: FormData) {
  const submissionId = requiredString(formData, "submissionId");
  const supabase = await createClient();
  await requireRole("teacher");

  const { error } = await supabase
    .from("submission_scores")
    .update({
      retake_allowed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("submission_id", submissionId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/nauczyciel/wyniki/${submissionId}`);
}
