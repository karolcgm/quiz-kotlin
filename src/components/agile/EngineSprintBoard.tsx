"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { describeEngineOutcome, getEngineGame } from "@/lib/agileGames/engine";
import { advanceEngineSprintAction, finishEngineGameAction, resolveEngineSprintAction, saveEngineChoiceAction } from "@/lib/actions/engineGame";
import { AgileFinalScreen } from "@/components/agile/AgileFinalScreen";

type Team = { id:string; name:string; color:string; visitors:number; budget:number; crises:string[]; selected:number[]; used:number[]; history?:Array<{sprint:number;visitors:number;budget:number}>; story?:Array<{sprint:number;body:string}> };

export function EngineSprintBoard({ sprintId, sprintNumber, status, templateId, eventId, teams }: { sessionId:string; sprintId:string; sprintNumber:number; status:string; templateId:string; eventId:string|null; teams:Team[] }) {
  const game = getEngineGame(templateId); const router = useRouter();
  const [teamIndex, setTeamIndex] = useState(0); const [role, setRole] = useState(game?.roles[0] ?? "");
  const [message, setMessage] = useState<string | null>(null); const [localSelections, setLocalSelections] = useState<Record<string, number[]>>({});
  const [pending, startTransition] = useTransition();
  useEffect(() => setLocalSelections({}), [sprintId]);
  if (!game || !teams.length) return null;
  if (status === "finished") return <AgileFinalScreen templateId={templateId} teams={teams.map(team => ({ ...team, choices: team.selected }))} />;
  const baseTeam = teams[teamIndex] ?? teams[0]; const selected = localSelections[baseTeam.id] ?? baseTeam.selected; const team = { ...baseTeam, selected };
  const spent = selected.reduce((sum, id) => sum + (game.tasks.find(task => task.id === id)?.cost ?? 0), 0);
  const crisis = game.crises.find(item => item.id === eventId); const setup = eventId === `${templateId}-setup` ? game.setup : null;
  const accent = { "mars-mission":"border-orange-300 bg-orange-300 text-orange-950", "game-studio":"border-fuchsia-300 bg-fuchsia-300 text-fuchsia-950", "future-city":"border-emerald-300 bg-emerald-300 text-emerald-950" }[templateId] ?? "border-cyan-300 bg-cyan-300 text-cyan-950";

  const choose = (taskId:number) => {
    const before = selected; const after = before.includes(taskId) ? before.filter(id => id !== taskId) : [...before, taskId];
    setLocalSelections(current => ({ ...current, [team.id]: after }));
    startTransition(async () => { const result = await saveEngineChoiceAction(sprintId, team.id, taskId); if (!result.ok) { setLocalSelections(current => ({ ...current, [team.id]: before })); setMessage(result.error ?? "Nie udało się zapisać decyzji."); } else router.refresh(); });
  };
  const run = (action:()=>Promise<{ok:boolean;error?:string}>) => startTransition(async () => { setMessage(null); const result = await action(); if (!result.ok) setMessage(result.error ?? "Nie udało się zapisać."); router.refresh(); });

  return <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl"><div className="p-6 sm:p-8" style={{ backgroundImage:`linear-gradient(rgb(2 6 23/.72),rgb(2 6 23/.84)),url('${game.image}')`, backgroundSize:"cover" }}>
    <p className="text-sm font-black uppercase tracking-[.18em] text-amber-300">{game.title} · sprint {sprintNumber}/4</p><h1 className="mt-2 text-4xl font-black">Wybierzcie wartość, potem sprawdźcie skutek</h1>
    {setup ? <div className="mt-5 rounded-2xl border border-amber-300/60 bg-slate-950/85 p-5"><p className="text-xs font-black uppercase tracking-widest text-amber-200">Sytuacja startowa</p><h2 className="mt-1 text-2xl font-black">{setup.title}</h2><p className="mt-2 text-slate-100">{setup.body}</p><p className="mt-3 rounded-xl bg-amber-300/15 p-3 font-bold text-amber-100">Na początku: {setup.focus}</p></div> : crisis ? <div className="mt-5 rounded-2xl border border-rose-300/60 bg-rose-950/85 p-5"><p className="text-xs font-black uppercase tracking-widest text-rose-200">Kryzys sprintu</p><h2 className="mt-1 text-2xl font-black">{crisis.title}</h2><p className="mt-2 text-rose-50">{crisis.body}</p>{status !== "planning" ? <p className="mt-3 font-bold text-amber-100">{crisis.fixes.some(id => selected.includes(id)) ? "Zespół zareagował na kryzys w tym sprincie." : crisis.consequence}</p> : null}</div> : null}
    <div className="mt-5 flex flex-wrap gap-2">{teams.map((item, index) => <button key={item.id} onClick={() => setTeamIndex(index)} className={`rounded-xl px-3 py-2 font-black ${index === teamIndex ? accent : "bg-white/10"}`}>{item.name} · {item.visitors} pkt</button>)}</div>
    <div className="mt-4 flex flex-wrap gap-2">{game.roles.map(item => <button key={item} onClick={() => setRole(item)} className={`rounded-xl px-3 py-2 font-bold ${role === item ? accent : "bg-white/10"}`}>{item}</button>)}</div>
    <div className="mt-5 grid gap-3 md:grid-cols-3">{game.tasks.filter(task => task.role === role).map(task => { const chosen = selected.includes(task.id); const blocked = !chosen && (team.used.includes(task.id) || spent + task.cost > team.budget); return <button key={task.id} disabled={status !== "planning" || blocked} onClick={() => choose(task.id)} className={`rounded-2xl border p-4 text-left disabled:opacity-40 ${chosen ? "border-emerald-300 bg-emerald-400/20" : "border-white/20 bg-white/10"}`}><b>#{task.id} · {task.title}</b><span className="mt-2 block text-sm">Koszt: {task.cost} pkt</span>{task.budgetImpact!==0?<span className={`mt-1 block text-xs font-black ${task.budgetImpact>0?"text-emerald-200":"text-amber-200"}`}>Budżet po sprincie: {task.budgetImpact>0?"+":""}{task.budgetImpact} pkt</span>:null}{status !== "planning" && chosen ? <span className="mt-2 block rounded-lg bg-slate-950/70 p-2 text-xs"><b>Skutek decyzji:</b> {task.visitors > 0 ? describeEngineOutcome(templateId, task.title) : task.bad}<strong className={`mt-2 block text-sm ${task.visitors > 0 ? "text-emerald-200" : "text-rose-200"}`}>{task.visitors > 0 ? `+${task.visitors}` : task.visitors} pkt</strong></span> : null}</button>; })}</div>
    <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-white/10 p-4"><b>Budżet {team.name}: <span className="text-amber-300">{team.budget-spent}/{team.budget}</span></b>{status === "planning" ? <button disabled={pending} onClick={() => run(() => resolveEngineSprintAction(sprintId))} className="rounded-xl bg-emerald-400 px-4 py-3 font-black text-emerald-950">Odkryj skutki</button> : sprintNumber < 4 ? <button disabled={pending} onClick={() => run(() => advanceEngineSprintAction(sprintId))} className="rounded-xl bg-white px-4 py-3 font-black text-slate-950">Następny sprint</button> : <button disabled={pending} onClick={() => run(() => finishEngineGameAction(sprintId))} className="rounded-xl bg-amber-300 px-4 py-3 font-black text-slate-950">Pokaż finał</button>}{message ? <span className="font-bold text-rose-200">{message}</span> : null}</div>
  </div></section>;
}
