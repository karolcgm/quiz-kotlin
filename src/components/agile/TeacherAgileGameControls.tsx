"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startAgileGameAction } from "@/lib/actions/agileGames";

export function TeacherAgileGameControls({sessionId,boardHref}:{sessionId:string;boardHref?:string}){const router=useRouter();const [message,setMessage]=useState<string|null>(null);const [pending,startTransition]=useTransition();return <div><button type="button" disabled={pending} onClick={()=>startTransition(async()=>{const result=await startAgileGameAction(sessionId);if(!result.ok)setMessage(result.error??"Nie udało się rozpocząć gry.");else boardHref?router.push(boardHref):router.refresh();})} className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-emerald-950 disabled:bg-slate-300">{pending?"Uruchamianie…":"Start gry"}</button>{message?<p className="mt-2 text-sm font-bold text-white">{message}</p>:null}</div>}
