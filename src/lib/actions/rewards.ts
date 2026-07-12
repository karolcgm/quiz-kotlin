"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { RewardNotification } from "@/types/rewards";

export async function getUnseenRewardNotificationsAction(): Promise<RewardNotification[]> {
  const student = await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("student_reward_notifications")
    .select("id, kind, reward_key, title, message")
    .eq("student_id", student.id)
    .is("seen_at", null)
    .order("created_at", { ascending: true })
    .limit(20);
  if (error || !data) return [];
  return data as RewardNotification[];
}

export async function awardStudentStickerAction(input: {
  studentId: string;
  collectionId: number;
  reason: string;
  sessionId?: string;
}): Promise<{ ok: true; stickerId: number } | { ok: false; error: string }> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("teacher_award_student_sticker", {
    target_student_id: input.studentId,
    target_collection: input.collectionId,
    target_reason: input.reason.trim(),
    target_session_id: input.sessionId ?? null,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "Nie udało się przyznać naklejki." };
  revalidatePath("/nauczyciel/uczniowie");
  if (input.sessionId) revalidatePath(`/nauczyciel/sesje/${input.sessionId}/podsumowanie`);
  return { ok: true, stickerId: Number((data as Record<string, unknown>).stickerId) };
}

export async function recordRewardClicksAction(delta: number): Promise<{ clickCount?: number; unlocked?: string[]; error?: string }> {
  await requireRole("student");
  const supabase = await createClient();
  const safeDelta = Math.max(1, Math.min(25, Math.trunc(delta)));
  const { data, error } = await supabase.rpc("record_student_reward_clicks", { click_delta: safeDelta });
  if (error) return { error: error.message };
  const result = data as Record<string, unknown>;
  return { clickCount: Number(result.clickCount ?? 0), unlocked: (result.unlocked as string[]) ?? [] };
}

export async function selectStudentCosmeticsAction(formData: FormData) {
  await requireRole("student");
  const stickerRaw = formData.get("stickerId")?.toString();
  const themeRaw = formData.get("themeId")?.toString();
  const supabase = await createClient();
  const { error } = await supabase.rpc("select_student_cosmetics", {
    target_sticker: stickerRaw ? Number(stickerRaw) : null,
    target_theme: themeRaw || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/uczen");
  revalidatePath("/uczen/klaser");
}

export async function selectStudentAvatarFrameAction(formData: FormData) {
  await requireRole("student");
  const frameId = formData.get("frameId")?.toString();
  if (!frameId) throw new Error("Brak ramki.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("select_student_avatar_frame", { target_frame: frameId });
  if (error) throw new Error(error.message);
  revalidatePath("/uczen");
  revalidatePath("/uczen/klaser");
}

export async function selectStudentFanfareAction(formData: FormData) {
  await requireRole("student");
  const fanfareId = formData.get("fanfareId")?.toString();
  if (!fanfareId) throw new Error("Brak fanfary.");
  const supabase = await createClient();
  const { error } = await supabase.rpc("select_student_fanfare", { target_fanfare: fanfareId });
  if (error) throw new Error(error.message);
  revalidatePath("/uczen");
  revalidatePath("/uczen/klaser");
}

export async function markRewardNotificationsSeenAction(ids: string[]) {
  await requireRole("student");
  if (ids.length === 0) return;
  const supabase = await createClient();
  await supabase.rpc("mark_reward_notifications_seen", { target_ids: ids.slice(0, 20) });
}
