"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAgileGameTemplate } from "@/lib/agileGames/catalog";
import { createClient } from "@/lib/supabase/server";

const TEAM_SEEDS = [["Lwy", "#f97316"], ["Pandy", "#8b5cf6"], ["Delfiny", "#06b6d4"], ["Sowy", "#10b981"], ["Liski", "#ec4899"]] as const;

export async function createAgileGameAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const classId = String(formData.get("classId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const template = getAgileGameTemplate(templateId);
  if (!template || !classId) throw new Error("Wybierz klasę i grę.");
  const supabase = await createClient();
  const { data: classRow } = await supabase.from("teacher_classes").select("id").eq("id", classId).eq("teacher_id", teacher.id).maybeSingle();
  if (!classRow) throw new Error("Nie masz dostępu do tej klasy.");
  const { data: session, error } = await supabase.from("agile_game_sessions").insert({ class_id: classId, teacher_id: teacher.id, template_id: template.id, title: template.title }).select("id").single();
  if (error || !session) throw new Error("Nie udało się utworzyć gry.");
  const { error: teamsError } = await supabase.from("agile_game_teams").insert(TEAM_SEEDS.map(([name, color]) => ({ session_id: session.id, name, color })));
  if (teamsError) throw new Error("Nie udało się utworzyć zespołów.");
  redirect(`/nauczyciel/gry-agile/${session.id}`);
}

export async function joinAgileTeamAction(sessionId: string, teamId: string) {
  const student = await requireRole("student");
  const supabase = await createClient();
  const { data: session } = await supabase.from("agile_game_sessions").select("id, class_id, status").eq("id", sessionId).maybeSingle<{ id: string; class_id: string; status: string }>();
  if (!session || session.status !== "lobby") return { ok: false, error: "Zapisy do zespołów są już zamknięte." };
  const [{ data: membership }, { data: team }] = await Promise.all([
    supabase.from("class_members").select("student_id").eq("class_id", session.class_id).eq("student_id", student.id).maybeSingle(),
    supabase.from("agile_game_teams").select("id").eq("id", teamId).eq("session_id", sessionId).maybeSingle(),
  ]);
  if (!membership || !team) return { ok: false, error: "Nie możesz dołączyć do tego zespołu." };
  const { error } = await supabase.from("agile_game_players").upsert({ session_id: sessionId, student_id: student.id, team_id: teamId, roles: [] }, { onConflict: "session_id,student_id" });
  if (error) return { ok: false, error: "Nie udało się zapisać zespołu." };
  revalidatePath(`/uczen/gry-agile/${sessionId}`);
  return { ok: true };
}

export async function startAgileGameAction(sessionId: string) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { data: session } = await supabase.from("agile_game_sessions").select("id, template_id").eq("id", sessionId).eq("teacher_id", teacher.id).maybeSingle<{ id: string; template_id: string }>();
  const template = session ? getAgileGameTemplate(session.template_id) : null;
  if (!session || !template) return { ok: false, error: "Nie znaleziono gry." };
  const { data: players } = await supabase.from("agile_game_players").select("session_id, student_id, team_id").eq("session_id", sessionId);
  if (!players?.length) return { ok: false, error: "Poczekaj, aż co najmniej jeden uczeń dołączy do zespołu." };
  const byTeam = new Map<string, Array<{ session_id: string; student_id: string; team_id: string }>>();
  for (const player of players) byTeam.set(player.team_id, [...(byTeam.get(player.team_id) ?? []), player]);
  const updates = [...byTeam.values()].flatMap((members) => members.map((member, index) => ({ ...member, roles: template.roles.filter((_, roleIndex) => roleIndex % members.length === index) })));
  const { error: rolesError } = await supabase.from("agile_game_players").upsert(updates, { onConflict: "session_id,student_id" });
  if (rolesError) return { ok: false, error: "Nie udało się rozdzielić ról." };
  const { error } = await supabase.from("agile_game_sessions").update({ status: "active", started_at: new Date().toISOString() }).eq("id", sessionId).eq("teacher_id", teacher.id);
  if (error) return { ok: false, error: "Nie udało się rozpocząć gry." };
  revalidatePath(`/nauczyciel/gry-agile/${sessionId}`);
  return { ok: true };
}

export async function addAgileMoveAction(sessionId: string, kind: "plan" | "deliver" | "retro", content: string) {
  const student = await requireRole("student");
  const safeContent = content.trim().slice(0, 280);
  if (!safeContent) return { ok: false, error: "Wpisz treść karty." };
  const supabase = await createClient();
  const { data: player } = await supabase.from("agile_game_players").select("team_id, agile_game_sessions!inner(status)").eq("session_id", sessionId).eq("student_id", student.id).maybeSingle<{ team_id: string; agile_game_sessions: { status: string } }>();
  if (!player || player.agile_game_sessions.status !== "active") return { ok: false, error: "Ta gra nie jest aktywna." };
  const { error } = await supabase.from("agile_game_moves").insert({ session_id: sessionId, team_id: player.team_id, student_id: student.id, kind, content: safeContent });
  if (error) return { ok: false, error: "Nie udało się dodać karty." };
  revalidatePath(`/uczen/gry-agile/${sessionId}`);
  return { ok: true };
}
