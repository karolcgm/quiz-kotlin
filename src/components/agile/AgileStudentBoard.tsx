"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addAgileMoveAction, joinAgileTeamAction } from "@/lib/actions/agileGames";

export function AgileTeamPicker({ sessionId, teams, selectedTeamId }: { sessionId: string; teams: Array<{ id: string; name: string; color: string; count: number }>; selectedTeamId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <section className="rounded-3xl border border-indigo-100 bg-white p-5"><h2 className="text-xl font-black text-slate-950">Wybierz zespół</h2><p className="mt-1 text-slate-600">Możesz zmieniać zespół do momentu rozpoczęcia gry.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{teams.map((team) => <button key={team.id} type="button" disabled={pending} onClick={() => startTransition(async () => { setError(null); const result = await joinAgileTeamAction(sessionId, team.id); if (!result.ok) setError(result.error ?? "Nie udało się dołączyć do zespołu."); else router.refresh(); })} className={`rounded-2xl border-2 p-4 text-left transition ${selectedTeamId === team.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white hover:border-indigo-400"}`}><span className="inline-block size-3 rounded-full" style={{ backgroundColor: team.color }} /><strong className="ml-2">{team.name}</strong><span className="mt-2 block text-sm opacity-75">{team.count} osób</span></button>)}</div>{error ? <p className="mt-3 text-sm font-bold text-rose-700">{error}</p> : null}</section>;
}

export function AgileMoveComposer({ sessionId, roles }: { sessionId: string; roles: string[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<"plan" | "deliver" | "retro">("plan");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-sm font-black uppercase tracking-wide text-emerald-800">Twoje role: {roles.join(" · ") || "członek zespołu"}</p><h2 className="mt-2 text-xl font-black text-slate-950">Karta sprintu</h2><div className="mt-4 flex flex-wrap gap-2">{([['plan', 'Planuj'], ['deliver', 'Dostarcz'], ['retro', 'Ulepsz']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setKind(value)} className={`rounded-xl px-3 py-2 text-sm font-black ${kind === value ? "bg-emerald-600 text-white" : "bg-white text-emerald-900"}`}>{label}</button>)}</div><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={280} placeholder="Np. Najpierw robimy bezpieczną ścieżkę, bo rodziny muszą dotrzeć do wybiegów." className="mt-3 min-h-28 w-full rounded-2xl border border-emerald-200 bg-white p-3 text-slate-950" /><button type="button" disabled={pending || !content.trim()} onClick={() => startTransition(async () => { const result = await addAgileMoveAction(sessionId, kind, content); setMessage(result.ok ? "Karta dodana do tablicy zespołu." : result.error ?? "Nie udało się dodać karty."); if (result.ok) { setContent(""); router.refresh(); } })} className="mt-3 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white disabled:bg-slate-300">{pending ? "Dodawanie…" : "Dodaj kartę"}</button>{message ? <p className="mt-3 text-sm font-bold text-emerald-800">{message}</p> : null}</section>;
}
