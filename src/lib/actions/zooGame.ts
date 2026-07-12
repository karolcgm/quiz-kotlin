"use server";

import { revalidatePath } from "next/cache";
import { ZOO_EVENTS, ZOO_EVENT_BY_ID, ZOO_INITIAL_PROBLEMS, ZOO_TASK_BY_ID } from "@/lib/agileGames/zoo";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function pickEvent(excluded: string[] = []) {
  const available = ZOO_EVENTS.filter((event) => !event.isSetup && !excluded.includes(event.id));
  const pool = available.length ? available : ZOO_EVENTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function initializeZooGameAction(sessionId: string) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { data: session } = await supabase.from("agile_game_sessions").select("id").eq("id", sessionId).eq("teacher_id", teacher.id).eq("template_id", "zoo-sprint").maybeSingle();
  if (!session) return { ok: false as const, error: "Nie znaleziono gry Zoo." };
  const { data: teams } = await supabase.from("agile_game_teams").select("id").eq("session_id", sessionId);
  await supabase.from("agile_zoo_team_state").upsert((teams ?? []).map((team) => ({ session_id: sessionId, team_id: team.id, visitors: 150, budget: 50, crises: [] })), { onConflict: "session_id,team_id", ignoreDuplicates: true });
  const { data: first } = await supabase.from("agile_zoo_sprints").select("id,event_id").eq("session_id", sessionId).eq("sprint_number", 1).maybeSingle<{id:string;event_id:string|null}>();
  let error;
  if (!first) ({ error } = await supabase.from("agile_zoo_sprints").insert({ session_id: sessionId, sprint_number: 1, status: "planning", event_id: "zoo-after-mismanagement" }));
  else if (!first.event_id) ({ error } = await supabase.from("agile_zoo_sprints").update({ event_id: "zoo-after-mismanagement" }).eq("id", first.id));
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}

export async function saveZooChoiceAction(sprintId: string, teamId: string, taskId: number) {
  const teacher = await requireRole("teacher"); const supabase = await createClient(); const task = ZOO_TASK_BY_ID.get(taskId);
  if (!task) return { ok: false as const, error: "Nieznane zadanie." };
  const { data: sprint } = await supabase.from("agile_zoo_sprints").select("id,session_id,status,agile_game_sessions!inner(teacher_id)").eq("id", sprintId).maybeSingle<{id:string;session_id:string;status:string;agile_game_sessions:{teacher_id:string}}>();
  if (!sprint || sprint.status !== "planning" || sprint.agile_game_sessions.teacher_id !== teacher.id) return { ok:false as const,error:"Sprint jest zamknięty." };
  const [{ data: rows }, { data: state }] = await Promise.all([supabase.from("agile_zoo_task_choices").select("task_id").eq("sprint_id",sprintId).eq("team_id",teamId),supabase.from("agile_zoo_team_state").select("budget").eq("session_id",sprint.session_id).eq("team_id",teamId).maybeSingle<{budget:number}>()]);
  const selected=(rows??[]).map(row=>row.task_id);
  if(selected.includes(taskId)){const {error}=await supabase.from("agile_zoo_task_choices").delete().eq("sprint_id",sprintId).eq("team_id",teamId).eq("task_id",taskId);if(!error)revalidatePath("/nauczyciel/gry-agile/zoo");return error?{ok:false as const,error:error.message}:{ok:true as const};}
  const {data:previousSprints}=await supabase.from("agile_zoo_sprints").select("id").eq("session_id",sprint.session_id).neq("id",sprintId);
  const previousIds=(previousSprints??[]).map(row=>row.id);const {data:previousChoices}=previousIds.length?await supabase.from("agile_zoo_task_choices").select("task_id").eq("team_id",teamId).in("sprint_id",previousIds):{data:[]};
  if((previousChoices??[]).some(row=>row.task_id===taskId))return {ok:false as const,error:"Ta decyzja została już wykorzystana przez tę drużynę w poprzednim sprincie."};
  if(selected.some(id=>task.blocks?.includes(id)||ZOO_TASK_BY_ID.get(id)?.blocks?.includes(taskId)))return {ok:false as const,error:"Ten wariant blokuje inną wybraną decyzję."};
  const spent=selected.reduce((sum,id)=>sum+(ZOO_TASK_BY_ID.get(id)?.cost??0),0);if(!state||spent+task.cost>state.budget)return {ok:false as const,error:"Brak punktów we wspólnej puli drużyny."};
  const {error}=await supabase.from("agile_zoo_task_choices").insert({sprint_id:sprintId,team_id:teamId,task_id:taskId,selected_by:teacher.id});if(!error)revalidatePath("/nauczyciel/gry-agile/zoo");return error?{ok:false as const,error:error.message}:{ok:true as const};
}

export async function resolveZooSprintAction(sprintId:string){
  const teacher=await requireRole("teacher");const supabase=await createClient();
  const {data:sprint}=await supabase.from("agile_zoo_sprints").select("id,session_id,sprint_number,status,event_id,agile_game_sessions!inner(teacher_id)").eq("id",sprintId).maybeSingle<{id:string;session_id:string;sprint_number:number;status:string;event_id:string|null;agile_game_sessions:{teacher_id:string}}>();
  if(!sprint||sprint.status!=="planning"||sprint.agile_game_sessions.teacher_id!==teacher.id)return {ok:false as const,error:"Sprint nie jest gotowy."};
  const [{data:states},{data:choices},{data:previousSprints}]=await Promise.all([supabase.from("agile_zoo_team_state").select("team_id,visitors,budget,crises").eq("session_id",sprint.session_id),supabase.from("agile_zoo_task_choices").select("team_id,task_id").eq("sprint_id",sprintId),supabase.from("agile_zoo_sprints").select("id").eq("session_id",sprint.session_id).neq("id",sprintId)]);
  const previousIds=(previousSprints??[]).map(row=>row.id);const {data:previousChoices}=previousIds.length?await supabase.from("agile_zoo_task_choices").select("team_id,task_id").in("sprint_id",previousIds):{data:[]};
  const event=sprint.event_id?ZOO_EVENT_BY_ID.get(sprint.event_id):undefined;
  for(const state of states??[]){
    const ids=(choices??[]).filter(row=>row.team_id===state.team_id).map(row=>row.task_id);
    const allUsedIds=[...new Set([...ids,...(previousChoices??[]).filter(row=>row.team_id===state.team_id).map(row=>row.task_id)])];
    const picked=ids.map(id=>ZOO_TASK_BY_ID.get(id)).filter((task):task is NonNullable<typeof task>=>Boolean(task));
    const missed=sprint.sprint_number===1?ZOO_INITIAL_PROBLEMS.filter(problem=>!problem.taskIds.some(id=>ids.includes(id))):[];
    const oldCrises=Array.isArray(state.crises)?state.crises.map(String):[];
    const resolved=Boolean(event?.isSetup)||!event||event.requiredTaskIds.some(id=>allUsedIds.includes(id));
    await supabase.from("agile_zoo_team_state").update({
      visitors:Math.max(0,Number(state.visitors)+picked.reduce((sum,task)=>sum+task.visitors,0)-missed.length*4-oldCrises.length*2-(resolved?0:event!.penaltyVisitors)),
      budget:Math.max(0,Number(state.budget??50)-missed.length*2-oldCrises.length*2-(resolved?0:event!.penaltyBudget)),
      crises:[...missed.map(problem=>problem.failure),...(resolved?[]:[event!.failure])],
    }).eq("session_id",sprint.session_id).eq("team_id",state.team_id);
  }
  await supabase.from("agile_zoo_sprints").update({status:"revealed"}).eq("id",sprintId);
  revalidatePath("/nauczyciel/gry-agile/zoo");return {ok:true as const};
}

export async function finishZooGameAction(sprintId:string){
  const teacher=await requireRole("teacher");const supabase=await createClient();
  const {data:sprint}=await supabase.from("agile_zoo_sprints").select("session_id,sprint_number,status,agile_game_sessions!inner(teacher_id)").eq("id",sprintId).maybeSingle<{session_id:string;sprint_number:number;status:string;agile_game_sessions:{teacher_id:string}}>();
  if(!sprint||sprint.sprint_number!==6||sprint.status!=="revealed"||sprint.agile_game_sessions.teacher_id!==teacher.id)return {ok:false as const,error:"Nie można jeszcze zakończyć tej gry."};
  const {error}=await supabase.from("agile_game_sessions").delete().eq("id",sprint.session_id).eq("teacher_id",teacher.id);
  revalidatePath("/nauczyciel/gry-klasowe");revalidatePath("/uczen");
  return error?{ok:false as const,error:error.message}:{ok:true as const};
}

export async function advanceZooSprintAction(sprintId:string){
  const teacher=await requireRole("teacher");const supabase=await createClient();const {data:sprint}=await supabase.from("agile_zoo_sprints").select("session_id,sprint_number,status,agile_game_sessions!inner(teacher_id)").eq("id",sprintId).maybeSingle<{session_id:string;sprint_number:number;status:string;agile_game_sessions:{teacher_id:string}}>();
  if(!sprint||sprint.sprint_number>=6||sprint.status!=="revealed"||sprint.agile_game_sessions.teacher_id!==teacher.id)return {ok:false as const,error:"Nie można rozpocząć kolejnego sprintu."};
  const next=sprint.sprint_number+1;const {data:used}=await supabase.from("agile_zoo_sprints").select("event_id").eq("session_id",sprint.session_id);const event=pickEvent((used??[]).map(row=>row.event_id).filter((id):id is string=>Boolean(id)));
  const {error}=await supabase.from("agile_zoo_sprints").upsert({session_id:sprint.session_id,sprint_number:next,status:"planning",event_id:event.id},{onConflict:"session_id,sprint_number"});if(!error)await supabase.from("agile_game_sessions").update({sprint_number:next,status:"active"}).eq("id",sprint.session_id);revalidatePath("/nauczyciel/gry-agile/zoo");return error?{ok:false as const,error:error.message}:{ok:true as const};
}

export async function saveStudentZooChoiceAction(sprintId:string,taskId:number){
  const student=await requireRole("student");const supabase=await createClient();const task=ZOO_TASK_BY_ID.get(taskId);if(!task)return {ok:false as const,error:"Nieznane zadanie."};
  const {data:sprint}=await supabase.from("agile_zoo_sprints").select("id,session_id,status").eq("id",sprintId).maybeSingle<{id:string;session_id:string;status:string}>();if(!sprint||sprint.status!=="planning")return {ok:false as const,error:"Sprint jest zamknięty."};
  const {data:player}=await supabase.from("agile_game_players").select("team_id,roles").eq("session_id",sprint.session_id).eq("student_id",student.id).maybeSingle<{team_id:string;roles:string[]}>();if(!player||!player.roles.includes(task.role))return {ok:false as const,error:"To zadanie należy do innego specjalisty."};
  const [{data:rows},{data:state},{data:previousSprints}]=await Promise.all([supabase.from("agile_zoo_task_choices").select("task_id").eq("sprint_id",sprintId).eq("team_id",player.team_id),supabase.from("agile_zoo_team_state").select("budget").eq("session_id",sprint.session_id).eq("team_id",player.team_id).maybeSingle<{budget:number}>(),supabase.from("agile_zoo_sprints").select("id").eq("session_id",sprint.session_id).neq("id",sprintId)]);
  const selected=(rows??[]).map(row=>row.task_id);
  if(selected.includes(taskId)){const {error}=await supabase.from("agile_zoo_task_choices").delete().eq("sprint_id",sprintId).eq("team_id",player.team_id).eq("task_id",taskId);if(!error)revalidatePath(`/uczen/gry-agile/${sprint.session_id}`);return error?{ok:false as const,error:error.message}:{ok:true as const};}
  const previousIds=(previousSprints??[]).map(row=>row.id);const {data:previousChoices}=previousIds.length?await supabase.from("agile_zoo_task_choices").select("task_id").eq("team_id",player.team_id).in("sprint_id",previousIds):{data:[]};
  if((previousChoices??[]).some(row=>row.task_id===taskId))return {ok:false as const,error:"Ta decyzja została już wykorzystana przez drużynę."};
  if(selected.some(id=>task.blocks?.includes(id)||ZOO_TASK_BY_ID.get(id)?.blocks?.includes(taskId)))return {ok:false as const,error:"Ten wariant blokuje decyzję drużyny."};const spent=selected.reduce((sum,id)=>sum+(ZOO_TASK_BY_ID.get(id)?.cost??0),0);if(!state||spent+task.cost>state.budget)return {ok:false as const,error:"Drużyna nie ma już punktów."};
  const {error}=await supabase.from("agile_zoo_task_choices").insert({sprint_id:sprintId,team_id:player.team_id,task_id:taskId,selected_by:student.id});if(!error)revalidatePath(`/uczen/gry-agile/${sprint.session_id}`);return error?{ok:false as const,error:error.message}:{ok:true as const};
}
