"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function requestBillingUpgradeAction(requestedSeats: number): Promise<{ ok: true; annualPrice: number } | { ok: false; error: string }> {
  const teacher = await requireRole("teacher");
  const seats = Math.max(21, Math.min(500, Math.round(requestedSeats)));
  const supabase = await createClient();
  const { data: rows, error: studentsError } = await supabase.rpc("list_teacher_students");
  if (studentsError) return { ok: false, error: "Nie udało się policzyć uczniów." };
  const currentStudents = new Set(((rows ?? []) as Array<{ student_id: string }>).map((row) => row.student_id)).size;
  const annualPrice = 240 + Math.max(0, seats - 20) * 2;
  const { error } = await supabase.from("billing_upgrade_requests").insert({
    teacher_id: teacher.id,
    current_students: currentStudents,
    requested_seats: seats,
    annual_price: annualPrice,
  });
  if (error) return { ok: false, error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." };
  revalidatePath("/nauczyciel/rozliczenia");
  return { ok: true, annualPrice };
}
