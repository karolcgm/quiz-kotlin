"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectStudentSlideBrightnessAction } from "@/lib/actions/rewards";

export function SlideBrightnessControl({ initialValue = 30 }: { initialValue?: number }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const frameValue = Math.min(70, value + 10);

  return <div className="grid gap-4 rounded-3xl border border-indigo-100 bg-white p-4 sm:grid-cols-[1fr_220px] sm:items-center">
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="slide-dim" className="font-black text-slate-950">Przyciemnienie slajdów</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{value}% / {frameValue}%</span>
      </div>
      <input id="slide-dim" type="range" min="0" max="60" step="5" value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-4 w-full accent-indigo-600" />
      <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wide text-slate-500"><span>Jaśniej</span><span>Ciemniej</span></div>
      <p className="mt-2 text-xs text-slate-600">Pierwsza wartość dotyczy tła prezentacji, druga właściwej karty zadania.</p>
      {error ? <p className="mt-2 text-xs font-bold text-rose-700">{error}</p> : null}
      <button type="button" disabled={pending || value === savedValue} onClick={() => startTransition(async () => { setError(null); const response = await selectStudentSlideBrightnessAction(value); if (!response.ok) { setError(response.error); return; } setSavedValue(response.dimPercent); router.refresh(); })} className="mt-3 min-h-10 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Zapisywanie…" : value === savedValue ? "Jasność zapisana" : "Zapisz jasność"}</button>
    </div>
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-700 p-3" style={{ boxShadow: `inset 0 0 0 999px rgb(2 6 23 / ${value / 100})` }} aria-label="Podgląd jasności slajdu">
      <div className="rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 p-4 text-white shadow-xl" style={{ boxShadow: `inset 0 0 0 999px rgb(2 6 23 / ${frameValue / 100})` }}><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100">Podgląd slajdu</p><p className="mt-1 text-lg font-black">Czytelna matematyka</p><p className="mt-1 text-xs text-indigo-100">Treść pozostaje wyraźna.</p></div>
    </div>
  </div>;
}
