"use client";

import { useState, useTransition } from "react";
import { requestBillingUpgradeAction } from "@/lib/actions/billing";

export function BillingUpgradeForm({ currentStudents }: { currentStudents: number }) {
  const minimum = Math.max(21, currentStudents);
  const [seats, setSeats] = useState(minimum);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const price = 240 + Math.max(0, seats - 20) * 2;

  return <div className="mt-5 rounded-2xl border border-indigo-200 bg-white p-4"><label htmlFor="billing-seats" className="block text-sm font-black text-slate-950">Liczba miejsc dla uczniów</label><div className="mt-3 flex flex-wrap items-center gap-3"><input id="billing-seats" type="number" min={minimum} max="500" value={seats} onChange={(event) => setSeats(Math.max(minimum, Number(event.target.value) || minimum))} className="w-28 rounded-xl border border-slate-300 px-3 py-2 font-black text-slate-950" /><p className="font-bold text-indigo-800">{price} zł / rok</p><button type="button" disabled={pending} onClick={() => startTransition(async () => { setMessage(null); const result = await requestBillingUpgradeAction(seats); setMessage(result.ok ? `Zgłoszenie pakietu ${seats} miejsc zapisane (${result.annualPrice} zł / rok).` : result.error); })} className="rounded-xl bg-indigo-600 px-5 py-2.5 font-black text-white disabled:bg-slate-300">{pending ? "Zapisywanie…" : "Zamów większy pakiet"}</button></div>{message ? <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p> : null}</div>;
}
