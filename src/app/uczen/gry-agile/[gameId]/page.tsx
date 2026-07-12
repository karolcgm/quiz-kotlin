import Link from "next/link";
import { notFound } from "next/navigation";
import { AgileMoveComposer, AgileTeamPicker } from "@/components/agile/AgileStudentBoard";
import { AgileLiveRefresh } from "@/components/agile/AgileLiveRefresh";
import { StudentZooSprintBoard } from "@/components/agile/StudentZooSprintBoard";
import { ZOO_TASK_BY_ID } from "@/lib/agileGames/zoo";
import { Card } from "@/components/ui/Card";
import { getAgileGameTemplate } from "@/lib/agileGames/catalog";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function StudentAgileGameDetail({ params }: { params: Promise<{ gameId: string }> }) {
  const student = await requireRole("student");
  const { gameId } = await params;
  const supabase = await createClient();
  const { data: game } = await supabase.from("agile_game_sessions").select("id, title, template_id, status, sprint_number").eq("id", gameId).maybeSingle();
  if (!game) notFound();
  const [{ data: teams }, { data: players }, { data: me }, { data: moves }] = await Promise.all([supabase.from("agile_game_teams").select("id, name, color").eq("session_id", gameId), supabase.from("agile_game_players").select("team_id").eq("session_id", gameId), supabase.from("agile_game_players").select("team_id, roles").eq("session_id", gameId).eq("student_id", student.id).maybeSingle<{ team_id: string; roles: string[] }>(), supabase.from("agile_game_moves").select("id, kind, content").eq("session_id", gameId).order("created_at", { ascending: false }).limit(20)]);
  const template = getAgileGameTemplate(game.template_id);
  const teamCards = (teams ?? []).map((team) => ({ ...team, count: (players ?? []).filter((player) => player.team_id === team.id).length }));
  let zooBoard: React.ReactNode = null;
  if (game.template_id === "zoo-sprint" && me && game.status === "active") { const { data: sprint } = await supabase.from("agile_zoo_sprints").select("id,event_id").eq("session_id", gameId).eq("status", "planning").order("sprint_number", { ascending: false }).limit(1).maybeSingle<{ id: string; event_id:string|null }>(); const { data: state } = await supabase.from("agile_zoo_team_state").select("budget").eq("session_id", gameId).eq("team_id", me.team_id).maybeSingle<{ budget: number }>(); const { data: zooChoices } = sprint ? await supabase.from("agile_zoo_task_choices").select("task_id").eq("sprint_id", sprint.id).eq("team_id", me.team_id) : { data: [] }; const selected=(zooChoices??[]).map(row=>row.task_id); const spent=selected.reduce((sum,id)=>sum+(ZOO_TASK_BY_ID.get(id)?.cost??0),0); if(sprint) zooBoard=<StudentZooSprintBoard sprintId={sprint.id} eventId={sprint.event_id} roles={me.roles??[]} selected={selected} budget={state?.budget??50} spent={spent}/>; }
  return <main className="space-y-5"><AgileLiveRefresh active={game.status !== "finished"} /><section className="rounded-[2rem] bg-gradient-to-br from-cyan-500 to-indigo-700 p-7 text-white"><p className="text-sm font-black uppercase tracking-[.16em] text-cyan-100">{game.status === "lobby" ? "Lobby" : `Sprint ${game.sprint_number}`}</p><h1 className="mt-2 text-4xl font-black">{template?.emoji} {game.title}</h1><p className="mt-3 max-w-3xl text-indigo-100">{template?.mission}</p></section>{game.status === "lobby" ? <AgileTeamPicker sessionId={gameId} teams={teamCards} selectedTeamId={me?.team_id} /> : zooBoard ?? (me ? <AgileMoveComposer sessionId={gameId} roles={me.roles ?? []} /> : <Card><p className="font-bold text-rose-700">Nie dołączyłeś do zespołu przed startem. Poproś nauczyciela o ponowne otwarcie lobby.</p></Card>)}<Card><h2 className="text-xl font-black text-slate-950">Co dzieje się w sprincie?</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{([['plan', 'Plan'], ['deliver', 'Dostarczone'], ['retro', 'Ulepszenia']] as const).map(([kind, label]) => <div key={kind} className="rounded-2xl bg-slate-50 p-3"><h3 className="font-black text-slate-700">{label}</h3>{(moves ?? []).filter((move) => move.kind === kind).map((move) => <p key={move.id} className="mt-2 rounded-xl bg-white p-2 text-sm text-slate-700">{move.content}</p>)}</div>)}</div></Card><Link href="/uczen/gry-agile" className="inline-flex rounded-xl border border-slate-300 px-4 py-3 font-black text-slate-700">← Wszystkie gry</Link></main>;
}
