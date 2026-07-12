"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startAgileGameAction } from "@/lib/actions/agileGames";

export function TeacherAgileGameControls({sessionId,boardHref}:{sessionId:string;boardHref?:string}){
  const router=useRouter();const [message,setMessage]=useState<string|null>(null);const [pending,startTransition]=useTransition();
  const start=(boardOnly=false)=>startTransition(async()=>{setMessage(null);const result=await startAgileGameAction(sessionId,boardOnly);if(!result.ok)setMessage(result.error??"Nie udało się rozpocząć gry.");else boardHref?router.push(boardHref):router.refresh();});
  return <div><div className="flex flex-wrap gap-2"><button type="button" disabled={pending} onClick={()=>start()} className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-emerald-950 disabled:bg-slate-300">{pending?"Uruchamianie…":"Start z uczniami"}</button>{boardHref?<button type="button" disabled={pending} onClick={()=>start(true)} className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 font-black text-white disabled:bg-slate-500">🎓 Start solo na tablicy</button>:null}</div>{boardHref?<p className="mt-2 max-w-md text-xs font-bold text-slate-300">Tryb na tablicy działa bez tabletów: nauczyciel prowadzi drużyny i zaznacza ich decyzje na wspólnej planszy.</p>:null}{message?<p className="mt-2 text-sm font-bold text-white">{message}</p>:null}</div>;
}
