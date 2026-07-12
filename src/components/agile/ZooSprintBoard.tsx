"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { advanceZooSprintAction, resolveZooSprintAction, saveZooChoiceAction } from "@/lib/actions/zooGame";
import { ZOO_TASKS, ZOO_TASK_BY_ID } from "@/lib/agileGames/zoo";

export type ZooBoardTeam = { id:string; name:string; color:string; visitors:number; budget:number; crises:string[]; selected:number[] };

export function ZooSprintBoard({ sprintId, sprintNumber, status, teams }: { sprintId:string; sprintNumber:number; status:string; teams:ZooBoardTeam[] }) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [quickIds, setQuickIds] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const team = teams[active] ?? teams[0];
  const spent = useMemo(() => team?.selected.reduce((sum,id) => sum + (ZOO_TASK_BY_ID.get(id)?.cost ?? 0), 0) ?? 0, [team]);
  if (!team) return <p className="rounded-2xl bg-amber-50 p-5 font-bold text-amber-900">Ta sesja nie ma drużyn.</p>;

  const choose = (taskId:number) => startTransition(async () => { setMessage(null); const result=await saveZooChoiceAction(sprintId,team.id,taskId); if(!result.ok)setMessage(result.error); router.refresh(); });
  const addNumbers = () => startTransition(async () => { setMessage(null); const ids=[...new Set(quickIds.split(/[\s,;]+/).map(Number).filter(Number.isFinite))]; for(const id of ids){if(team.selected.includes(id))continue;const result=await saveZooChoiceAction(sprintId,team.id,id);if(!result.ok){setMessage(`#${id}: ${result.error}`);break;}}setQuickIds("");router.refresh(); });
  const reveal = () => startTransition(async () => { const result=await resolveZooSprintAction(sprintId); if(!result.ok)setMessage(result.error); router.refresh(); });
  const advance = () => startTransition(async () => { const result=await advanceZooSprintAction(sprintId); if(!result.ok)setMessage(result.error); router.refresh(); });
  const hasCrisis = teams.some(item => item.crises.length > 0);

  return <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white">
    <div className="p-6" style={{backgroundImage:"linear-gradient(rgb(2 6 23/.82),rgb(2 6 23/.9)),url('/agile-games/zoo-sprint.png')",backgroundSize:"cover"}}>
      <p className="font-black text-amber-300">ZOO SPRINT · SPRINT {sprintNumber}/6 · WSPÓLNY BUDŻET DRUŻYNY</p>
      <div className="mt-4 flex flex-wrap gap-2">{teams.map((item,index)=><button key={item.id} onClick={()=>setActive(index)} className={`rounded-xl px-3 py-2 font-black ${active===index?"bg-amber-300 text-slate-950":"bg-white/15"}`}><span className="mr-2 inline-block size-2 rounded-full" style={{background:item.color}}/>{item.name} · {item.visitors} tys.</button>)}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div><h2 className="text-3xl font-black">{team.name}: zadania specjalistów</h2><p className="mt-2 text-cyan-100">Wybierz wiele zadań. Wszystkie obciążają jedną pulę drużyny.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{ZOO_TASKS.map(task=>{const chosen=team.selected.includes(task.id);const blocked=!chosen&&(spent+task.cost>team.budget||team.selected.some(id=>task.blocks?.includes(id)||ZOO_TASK_BY_ID.get(id)?.blocks?.includes(task.id)));return <button key={task.id} disabled={pending||status!=="planning"||blocked} onClick={()=>choose(task.id)} className={`rounded-2xl border p-4 text-left ${chosen?"border-emerald-300 bg-emerald-400/25":"border-white/20 bg-white/10"} disabled:opacity-35`}><b>#{task.id} · {task.role}</b><span className="mt-1 block font-black">{task.title}</span><span className="mt-2 block text-sm">{task.cost} pkt · odwiedzający {task.visitors>0?`+${task.visitors}`:task.visitors}%</span>{task.blocks?<span className="mt-1 block text-xs text-amber-200">Wariant alternatywny — blokuje inne rozwiązanie.</span>:null}</button>})}</div></div>
        <aside className="rounded-2xl bg-white/12 p-5 backdrop-blur"><p className="text-sm font-bold text-cyan-100">Budżet {team.name}</p><p className="text-5xl font-black text-amber-300">{team.budget-spent}/{team.budget}</p><p className="mt-3 text-sm">Wybrane: {team.selected.join(", ")||"—"}</p>{team.crises.length?<p className="mt-4 rounded-xl bg-rose-500/25 p-3 text-sm">Kryzysy: {team.crises.join(" ")}</p>:null}{status==="planning"?<div className="mt-5 border-t border-white/15 pt-4"><label className="text-sm font-black">Szybkie numery GM<input value={quickIds} onChange={event=>setQuickIds(event.target.value)} placeholder="np. 11, 21, 32" className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"/></label><button onClick={addNumbers} disabled={pending||!quickIds.trim()} className="mt-2 w-full rounded-xl bg-cyan-300 p-3 font-black text-cyan-950 disabled:bg-slate-500">Dodaj numery</button></div>:null}</aside>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">{status==="planning"?<button onClick={reveal} disabled={pending} className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 disabled:bg-slate-500">GM: odkryj skutki sprintu</button>:status==="revealed"?<button onClick={advance} disabled={pending} className="rounded-xl bg-white px-5 py-3 font-black text-indigo-700">Rozpocznij sprint {sprintNumber+1}</button>:<span className="rounded-xl bg-amber-300 px-5 py-3 font-black text-slate-950">Gra zakończona</span>}{message?<p className="rounded-xl bg-rose-500/25 px-4 py-3 font-bold">{message}</p>:null}</div>
      <div className="mt-5 rounded-2xl bg-white/10 p-4"><b>Ranking:</b>{[...teams].sort((a,b)=>b.visitors-a.visitors).map((item,index)=><span key={item.id} className="ml-3">{index+1}. {item.name} {item.visitors} tys.</span>)}</div>
    </div>
    {status!=="planning"?<div className="grid min-h-64 place-items-center bg-cover bg-center p-8 text-center" style={{backgroundImage:`linear-gradient(rgb(2 6 23/.48),rgb(2 6 23/.72)),url('${hasCrisis?"/agile-games/zoo-crisis.png":"/agile-games/zoo-success.png"}')`}}><div><p className="text-5xl">{hasCrisis?"⚠️":"🏆"}</p><h2 className="mt-3 text-3xl font-black">{hasCrisis?"Zoo mierzy się z konsekwencjami":"Udany sprint — zoo rośnie"}</h2><p className="mt-2 text-lg text-white/90">Omówcie wynik przed rozpoczęciem kolejnego sprintu.</p></div></div>:null}
  </section>;
}
