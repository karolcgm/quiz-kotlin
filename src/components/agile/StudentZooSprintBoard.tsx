"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveStudentZooChoiceAction } from "@/lib/actions/zooGame";
import { ZOO_EVENT_BY_ID, ZOO_TASKS } from "@/lib/agileGames/zoo";

export function StudentZooSprintBoard({sprintId,eventId,roles,selected,budget,spent}:{sprintId:string;eventId?:string|null;roles:string[];selected:number[];budget:number;spent:number}){
  const router=useRouter();const boardRef=useRef<HTMLElement>(null);const [fullscreen,setFullscreen]=useState(false);const [message,setMessage]=useState<string|null>(null);const [pending,startTransition]=useTransition();const tasks=ZOO_TASKS.filter(task=>roles.includes(task.role));const sprintEvent=eventId?ZOO_EVENT_BY_ID.get(eventId):undefined;
  useEffect(()=>{const update=()=>setFullscreen(document.fullscreenElement===boardRef.current);document.addEventListener("fullscreenchange",update);return()=>document.removeEventListener("fullscreenchange",update)},[]);
  const toggleFullscreen=async()=>{if(document.fullscreenElement)await document.exitFullscreen();else await boardRef.current?.requestFullscreen()};
  return <section ref={boardRef} className={`overflow-auto bg-slate-950 p-5 text-white ${fullscreen?"h-screen w-screen rounded-none":"rounded-3xl"}`}>
    <div className="mb-4 flex justify-end"><button type="button" onClick={()=>void toggleFullscreen()} className="min-h-11 rounded-xl bg-white px-4 py-2 font-black text-slate-950">{fullscreen?"⤓ Wyjdź":"⛶ Pełny ekran gry"}</button></div>
    {sprintEvent?<div className="mb-4 rounded-2xl border-2 border-rose-300 bg-rose-950 p-4"><p className="text-xs font-black uppercase tracking-widest text-rose-200">⚠ Kryzys sprintu</p><h2 className="mt-1 text-xl font-black">{sprintEvent.title}</h2><p className="mt-2 text-sm">{sprintEvent.body}</p><p className="mt-2 text-sm font-bold text-amber-200">Wybierzcie reakcję na podstawie sytuacji. Wynik i konsekwencje pozostają ukryte do końca sprintu.</p></div>:null}
    <p className="text-sm font-black uppercase text-cyan-300">Twoje specjalizacje: {roles.join(" · ")}</p><div className="mt-3 rounded-xl bg-white/10 p-3 font-black text-amber-300">Wspólna pula drużyny: {budget-spent}/{budget} pkt</div><div className="mt-4 grid gap-3">{tasks.map(task=><button key={task.id} disabled={pending} onClick={()=>startTransition(async()=>{setMessage(null);const result=await saveStudentZooChoiceAction(sprintId,task.id);if(!result.ok)setMessage(result.error);router.refresh();})} className={`rounded-2xl border p-4 text-left ${selected.includes(task.id)?"border-emerald-300 bg-emerald-400/20":"border-white/20 bg-white/10"}`}><b>#{task.id} · {task.title}</b><span className="mt-1 block text-sm">Koszt: {task.cost} pkt</span></button>)}</div>{!tasks.length?<p className="mt-4 text-slate-300">Nauczyciel musi rozpocząć grę, aby rozdzielić role.</p>:null}{message?<p className="mt-3 rounded-xl bg-rose-500/20 p-3 font-bold">{message}</p>:null}
  </section>;
}
