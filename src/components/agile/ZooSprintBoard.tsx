"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { advanceZooSprintAction, resolveZooSprintAction, saveZooChoiceAction } from "@/lib/actions/zooGame";
import { ZOO_EVENT_BY_ID, ZOO_TASKS, ZOO_TASK_BY_ID, ZOO_ROLES } from "@/lib/agileGames/zoo";

export type ZooBoardTeam = { id:string; name:string; color:string; visitors:number; budget:number; crises:string[]; selected:number[] };

export function ZooSprintBoard({ sprintId, sprintNumber, status, eventId, teams }: { sprintId:string; sprintNumber:number; status:string; eventId?:string|null; teams:ZooBoardTeam[] }) {
  const router = useRouter();
  const boardRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [active, setActive] = useState(0);
  const [activeRole, setActiveRole] = useState(ZOO_ROLES[0]);
  const [quickIds, setQuickIds] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [localSelections, setLocalSelections] = useState<Record<string,number[]>>({});
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === boardRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await boardRef.current?.requestFullscreen();
  };
  const baseTeam = teams[active] ?? teams[0];
  const selectionFor = (item:ZooBoardTeam) => localSelections[item.id] ?? item.selected;
  const team = baseTeam ? {...baseTeam, selected: selectionFor(baseTeam)} : baseTeam;
  const spent = useMemo(() => team?.selected.reduce((sum,id) => sum + (ZOO_TASK_BY_ID.get(id)?.cost ?? 0), 0) ?? 0, [team]);
  if (!team) return <p className="rounded-2xl bg-amber-50 p-5 font-bold text-amber-900">Ta sesja nie ma drużyn.</p>;

  const choose = (taskId:number) => startTransition(async () => { setMessage(null); const before=team.selected; setLocalSelections(current=>({...current,[team.id]:before.includes(taskId)?before.filter(id=>id!==taskId):[...before,taskId]})); const result=await saveZooChoiceAction(sprintId,team.id,taskId); if(!result.ok){setLocalSelections(current=>({...current,[team.id]:before}));setMessage(result.error);} router.refresh(); });
  const addNumbers = () => startTransition(async () => { setMessage(null); const ids=[...new Set(quickIds.split(/[\s,;]+/).map(Number).filter(Number.isFinite))]; for(const id of ids){if(team.selected.includes(id))continue;const result=await saveZooChoiceAction(sprintId,team.id,id);if(!result.ok){setMessage(`#${id}: ${result.error}`);break;}}setQuickIds("");router.refresh(); });
  const reveal = () => startTransition(async () => { const result=await resolveZooSprintAction(sprintId); if(!result.ok)setMessage(result.error); router.refresh(); });
  const advance = () => startTransition(async () => { const result=await advanceZooSprintAction(sprintId); if(!result.ok)setMessage(result.error); router.refresh(); });
  const hasCrisis = teams.some(item => item.crises.length > 0);
  const sprintEvent = eventId ? ZOO_EVENT_BY_ID.get(eventId) : undefined;
  const sprintEventResolved = Boolean(sprintEvent?.requiredTaskIds.some(id=>team.selected.includes(id)));

  return <section ref={boardRef} className={`overflow-auto bg-slate-950 text-white ${fullscreen?"h-screen w-screen rounded-none":"rounded-[2rem]"}`}>
    <div className="p-6" style={{backgroundImage:"linear-gradient(rgb(2 6 23/.82),rgb(2 6 23/.9)),url('/agile-games/zoo-sprint.png')",backgroundSize:"cover"}}>
      <div className="mb-4 flex justify-end"><button type="button" onClick={()=>void toggleFullscreen()} className="min-h-11 rounded-xl bg-white px-4 py-2 font-black text-slate-950 shadow-lg">{fullscreen?"⤓ Wyjdź z pełnego ekranu":"⛶ Pełny ekran gry"}</button></div>
      {sprintEvent?<div className="mb-4 rounded-2xl border-2 border-rose-300 bg-rose-950/85 p-5 shadow-xl"><p className="text-sm font-black uppercase tracking-widest text-rose-200">⚠ Kryzys sprintu</p><h2 className="mt-1 text-2xl font-black">{sprintEvent.title}</h2><p className="mt-2 text-rose-50">{sprintEvent.body}</p>{status!=="planning"?<p className={`mt-3 rounded-xl p-3 font-bold ${sprintEventResolved?"bg-emerald-400/20 text-emerald-100":"bg-rose-400/20 text-rose-100"}`}><b>{sprintEventResolved?"Kryzys opanowany: ":"Kryzys nierozwiązany: "}</b>{sprintEventResolved?sprintEvent.success:sprintEvent.failure}</p>:<p className="mt-3 font-bold text-amber-200">Drużyna musi sama zdecydować, które działania odpowiedzą na kryzys. Skutki decyzji są ukryte.</p>}</div>:null}
      <p className="font-black text-amber-300">ZOO SPRINT · SPRINT {sprintNumber}/6 · WSPÓLNY BUDŻET DRUŻYNY</p>
      <div className="mt-4 flex flex-wrap gap-2">{teams.map((item,index)=><button key={item.id} onClick={()=>setActive(index)} className={`rounded-xl px-3 py-2 font-black ${active===index?"bg-amber-300 text-slate-950":"bg-white/15"}`}><span className="mr-2 inline-block size-2 rounded-full" style={{background:item.color}}/>{item.name} · {item.visitors} tys.</button>)}</div>
      <div className="mt-4 flex flex-wrap gap-2">{ZOO_ROLES.map((role,index)=><button key={role} onClick={()=>setActiveRole(role)} className={`rounded-xl px-4 py-2 font-black ${activeRole===role?"bg-cyan-300 text-cyan-950":"bg-white/10"}`}>{index+1}. {role}</button>)}</div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div><h2 className="text-3xl font-black">{activeRole} · 15 decyzji</h2><p className="mt-2 text-cyan-100">Wybierz drużynę po prawej, potem zaznacz jej decyzje. Skutki pozostają ukryte aż do zakończenia sprintu.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ZOO_TASKS.filter(task=>task.role===activeRole).map(task=>{const chosen=team.selected.includes(task.id);const blocked=!chosen&&(spent+task.cost>team.budget||team.selected.some(id=>task.blocks?.includes(id)||ZOO_TASK_BY_ID.get(id)?.blocks?.includes(task.id)));const markers=teams.map((item,index)=>({item,index})).filter(({item})=>selectionFor(item).includes(task.id));return <button key={task.id} disabled={pending||status!=="planning"||blocked} onClick={()=>choose(task.id)} className={`relative rounded-2xl border p-4 pt-8 text-left ${chosen?"border-emerald-300 bg-emerald-400/25":"border-white/20 bg-white/10"} disabled:opacity-35`}><span className="absolute left-3 top-2 flex gap-1">{markers.map(({item,index})=><span key={item.id} className="grid size-6 place-items-center rounded-md text-xs font-black text-white" style={{background:item.color}}>{index+1}</span>)}</span><b>#{task.id}</b><span className="mt-1 block font-black">{task.title}</span><span className="mt-2 block text-sm">Koszt: {task.cost} pkt</span>{task.blocks?<span className="mt-1 block text-xs text-amber-200">Wariant alternatywny — blokuje inne rozwiązanie.</span>:null}{status!=="planning"&&chosen?<span className="mt-3 block rounded-xl bg-slate-950/70 p-3 text-sm leading-relaxed text-cyan-50"><b>Skutek decyzji:</b> {task.outcome}</span>:null}</button>})}</div></div>
        <aside className="rounded-2xl bg-white/12 p-5 backdrop-blur"><p className="text-sm font-black text-cyan-100">Drużyny</p><div className="mt-2 grid gap-2">{teams.map((item,index)=><button key={item.id} onClick={()=>setActive(index)} className={`flex items-center gap-2 rounded-xl p-2 text-left font-black ${active===index?"bg-white text-slate-950":"bg-white/10"}`}><span className="grid size-7 place-items-center rounded-md text-sm text-white" style={{background:item.color}}>{index+1}</span>{item.name}</button>)}</div><p className="mt-5 text-sm font-bold text-cyan-100">Budżet {team.name}</p><p className="text-5xl font-black text-amber-300">{team.budget-spent}/{team.budget}</p><p className="mt-3 text-sm">Wybrane: {team.selected.join(", ")||"—"}</p>{team.crises.length?<p className="mt-4 rounded-xl bg-rose-500/25 p-3 text-sm">Kryzysy: {team.crises.join(" ")}</p>:null}{status==="planning"?<div className="mt-5 border-t border-white/15 pt-4"><label className="text-sm font-black">Szybkie numery GM<input value={quickIds} onChange={event=>setQuickIds(event.target.value)} placeholder="np. 101, 201, 305" className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"/></label><button onClick={addNumbers} disabled={pending||!quickIds.trim()} className="mt-2 w-full rounded-xl bg-cyan-300 p-3 font-black text-cyan-950 disabled:bg-slate-500">Dodaj numery</button></div>:null}</aside>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">{status==="planning"?<button onClick={reveal} disabled={pending} className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 disabled:bg-slate-500">GM: odkryj skutki sprintu</button>:status==="revealed"?<button onClick={advance} disabled={pending} className="rounded-xl bg-white px-5 py-3 font-black text-indigo-700">Rozpocznij sprint {sprintNumber+1}</button>:<span className="rounded-xl bg-amber-300 px-5 py-3 font-black text-slate-950">Gra zakończona</span>}{message?<p className="rounded-xl bg-rose-500/25 px-4 py-3 font-bold">{message}</p>:null}</div>
      <div className="mt-5 rounded-2xl bg-white/10 p-4"><b>Ranking:</b>{[...teams].sort((a,b)=>b.visitors-a.visitors).map((item,index)=><span key={item.id} className="ml-3">{index+1}. {item.name} {item.visitors} tys.</span>)}</div>
    </div>
    {status!=="planning"?<div className="grid min-h-64 place-items-center bg-cover bg-center p-8 text-center" style={{backgroundImage:`linear-gradient(rgb(2 6 23/.48),rgb(2 6 23/.72)),url('${hasCrisis?"/agile-games/zoo-crisis.png":"/agile-games/zoo-success.png"}')`}}><div><p className="text-5xl">{hasCrisis?"⚠️":"🏆"}</p><h2 className="mt-3 text-3xl font-black">{hasCrisis?"Zoo mierzy się z konsekwencjami":"Udany sprint — zoo rośnie"}</h2><p className="mt-2 text-lg text-white/90">Omówcie wynik przed rozpoczęciem kolejnego sprintu.</p></div></div>:null}
  </section>;
}
