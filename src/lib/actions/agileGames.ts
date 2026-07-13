"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getAgileGameTemplate } from "@/lib/agileGames/catalog";
import { createClient } from "@/lib/supabase/server";
import { initializeEngineGameAction } from "@/lib/actions/engineGame";

const TEAM_SEEDS = {
  "zoo-sprint": [["Lwy", "#f97316"], ["Pandy", "#8b5cf6"], ["Delfiny", "#06b6d4"], ["Sowy", "#10b981"], ["Liski", "#ec4899"]],
  "mars-mission": [["Orion", "#f97316"], ["Ares", "#ef4444"], ["Nova", "#8b5cf6"], ["Vega", "#06b6d4"], ["Galileo", "#eab308"]],
  "game-studio": [["Pixelowi", "#06b6d4"], ["Neonowi", "#d946ef"], ["Joysticki", "#f97316"], ["Level Up", "#10b981"], ["Respawn", "#8b5cf6"]],
  "future-city": [["Zielony Horyzont", "#10b981"], ["Miejskie Iskry", "#f59e0b"], ["Rowerowa Fala", "#06b6d4"], ["Dostępni Razem", "#8b5cf6"], ["Parkowi Strażnicy", "#65a30d"]],
} as const;

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
  const teamSeeds = TEAM_SEEDS[template.id];
  const { error: teamsError } = await supabase.from("agile_game_teams").insert(teamSeeds.map(([name, color]) => ({ session_id: session.id, name, color })));
  if (teamsError) throw new Error("Nie udało się utworzyć zespołów.");
  await supabase.rpc("send_teacher_notifications", { notification_title: `Zaproszenie: ${template.title}`, notification_body: "Nauczyciel otworzył lobby gry. Wybierz drużynę i poczekaj na start.", target_class_id: classId, target_student_ids: null, link_href: `/uczen/gry-agile/${session.id}` });
  revalidatePath("/uczen");
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

export async function startAgileGameAction(sessionId: string, boardOnly = false) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { data: session } = await supabase.from("agile_game_sessions").select("id, template_id").eq("id", sessionId).eq("teacher_id", teacher.id).maybeSingle<{ id: string; template_id: string }>();
  const template = session ? getAgileGameTemplate(session.template_id) : null;
  if (!session || !template) return { ok: false, error: "Nie znaleziono gry." };
  const { data: players } = await supabase.from("agile_game_players").select("session_id, student_id, team_id, joined_at").eq("session_id", sessionId).order("joined_at", { ascending: true });
  if (!players?.length && !boardOnly) return { ok: false, error: "Poczekaj, aż co najmniej jeden uczeń dołączy do zespołu albo uruchom tryb na tablicy." };
  if (!players?.length && boardOnly) {
    const { error } = await supabase.from("agile_game_sessions").update({ status: "active", started_at: new Date().toISOString() }).eq("id", sessionId).eq("teacher_id", teacher.id);
    if (error) return { ok: false, error: "Nie udało się rozpocząć gry." };
    if (session.template_id !== "zoo-sprint") await initializeEngineGameAction(sessionId);
    revalidatePath(`/nauczyciel/gry-agile/${sessionId}`);
    return { ok: true };
  }
  const byTeam = new Map<string, Array<{ session_id: string; student_id: string; team_id: string; joined_at: string }>>();
  for (const player of players ?? []) byTeam.set(player.team_id, [...(byTeam.get(player.team_id) ?? []), player]);
  const updates = [...byTeam.values()].flatMap((members) => members.map((member, index) => {
    const roles = members.length <= template.roles.length
      ? template.roles.slice(index * Math.floor(template.roles.length / members.length), index * Math.floor(template.roles.length / members.length) + Math.floor(template.roles.length / members.length) + (index === members.length - 1 ? template.roles.length % members.length : 0))
      : template.roles.filter((_, roleIndex) => roleIndex % members.length === index);
    return { ...member, roles };
  }));
  const roleUpdates = await Promise.all(updates.map((member) => supabase.from("agile_game_players").update({ roles: member.roles }).eq("session_id", sessionId).eq("student_id", member.student_id)));
  const rolesError = roleUpdates.find((result) => result.error)?.error;
  if (rolesError) return { ok: false, error: "Nie udało się rozdzielić ról." };
  const { error } = await supabase.from("agile_game_sessions").update({ status: "active", started_at: new Date().toISOString() }).eq("id", sessionId).eq("teacher_id", teacher.id);
  if (error) return { ok: false, error: "Nie udało się rozpocząć gry." };
  if (session.template_id !== "zoo-sprint") await initializeEngineGameAction(sessionId);
  revalidatePath(`/nauczyciel/gry-agile/${sessionId}`);
  return { ok: true };
}

export async function closeAgileGameAction(sessionId: string) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { error } = await supabase.from("agile_game_sessions").delete().eq("id", sessionId).eq("teacher_id", teacher.id);
  if (error) return { ok: false as const, error: "Nie udało się zamknąć gry." };
  revalidatePath("/nauczyciel/gry-klasowe");
  revalidatePath("/nauczyciel/gry-agile");
  revalidatePath("/uczen");
  return { ok: true as const };
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
