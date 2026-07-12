"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { closeAgileGameAction } from "@/lib/actions/agileGames";

export function CloseAgileGameButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <div className="mt-4"><button type="button" disabled={pending} onClick={() => startTransition(async () => { if (!window.confirm("Zamknąć tę grę? Dane lobby, drużyn i decyzji zostaną usunięte.")) return; const result = await closeAgileGameAction(sessionId); if (!result.ok) setMessage(result.error); else router.refresh(); })} className="min-h-10 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-700 hover:bg-rose-100 disabled:opacity-50">{pending ? "Zamykanie…" : "Zamknij grę"}</button>{message ? <p className="mt-2 text-sm font-bold text-rose-700">{message}</p> : null}</div>;
}
