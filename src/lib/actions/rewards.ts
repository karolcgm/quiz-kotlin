"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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

export async function markRewardNotificationsSeenAction(ids: string[]) {
  await requireRole("student");
  if (ids.length === 0) return;
  const supabase = await createClient();
  await supabase.rpc("mark_reward_notifications_seen", { target_ids: ids.slice(0, 20) });
}
