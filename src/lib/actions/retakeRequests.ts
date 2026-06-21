"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function requestRetakeAction(formData: FormData) {
  await requireRole("student");
  const supabase = await createClient();
  const submissionId = formData.get("submissionId")?.toString();
  const message = formData.get("message")?.toString() ?? null;

  if (!submissionId) {
    throw new Error("Brakuje identyfikatora wyniku.");
  }

  const { error } = await supabase.rpc("request_retake", {
    target_submission_id: submissionId,
    request_message: message,
  });

  if (error) {
    redirect(`/uczen/wyniki/${submissionId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/uczen/wyniki/${submissionId}`);
  revalidatePath("/uczen/wyniki");
  revalidatePath("/", "layout");
  redirect(`/uczen/wyniki/${submissionId}?requested=1`);
}
