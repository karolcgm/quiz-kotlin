"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startAgileGameAction } from "@/lib/actions/agileGames";

export function TeacherAgileGameControls({ sessionId, canStart }: { sessionId: string; canStart: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!canStart) return null;
  return <div><button type="button" disabled={pending} onClick={() => startTransition(async () => { const result = await startAgileGameAction(sessionId); setMessage(result.ok ? "Gra rozpoczęta. Uczniowie otrzymali role." : result.error ?? "Nie udało się rozpocząć gry."); if (result.ok) router.refresh(); })} className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-emerald-950 disabled:bg-slate-300">{pending ? "Rozpoczynanie…" : "Rozpocznij sprint"}</button>{message ? <p className="mt-2 text-sm font-bold text-white">{message}</p> : null}</div>;
}
