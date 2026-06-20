"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function activateTeacherAction(formData: FormData) {
  const teacherId = formData.get("teacherId");
  if (typeof teacherId !== "string") {
    throw new Error("Brak nauczyciela do aktywacji.");
  }

  const admin = await requireRole("admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      status: "active",
      activated_at: new Date().toISOString(),
      activated_by: admin.id,
    })
    .eq("id", teacherId)
    .eq("role", "teacher")
    .eq("status", "pending_admin");

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/nauczyciele");
}
