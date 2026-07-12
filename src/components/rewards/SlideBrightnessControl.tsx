"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { selectStudentSlideBrightnessAction } from "@/lib/actions/rewards";

function formatOffset(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function SlideBrightnessControl({ initialSlideOffset = 0, initialBackgroundOffset = 0 }: { initialSlideOffset?: number; initialBackgroundOffset?: number }) {
  const router = useRouter();
  const [slideOffset, setSlideOffset] = useState(initialSlideOffset);
  const [backgroundOffset, setBackgroundOffset] = useState(initialBackgroundOffset);
  const [saved, setSaved] = useState({ slideOffset: initialSlideOffset, backgroundOffset: initialBackgroundOffset });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const changed = slideOffset !== saved.slideOffset || backgroundOffset !== saved.backgroundOffset;
  const backgroundBrightness = Math.max(.5, Math.min(1.5, 1 + backgroundOffset / 100));
  const slideDim = Math.max(0, Math.min(.85, .40 - slideOffset / 100));

  return <div className="grid gap-4 rounded-3xl border border-indigo-100 bg-white p-4 sm:grid-cols-[1fr_220px] sm:items-center">
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="slide-brightness" className="font-black text-slate-950">Jasność slajdów</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{formatOffset(slideOffset)}</span>
      </div>
      <input id="slide-brightness" type="range" min="-50" max="50" step="5" value={slideOffset} onChange={(event) => setSlideOffset(Number(event.target.value))} className="w-full accent-indigo-600" />

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="background-brightness" className="font-black text-slate-950">Jasność tła</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{formatOffset(backgroundOffset)}</span>
      </div>
      <input id="background-brightness" type="range" min="-50" max="50" step="5" value={backgroundOffset} onChange={(event) => setBackgroundOffset(Number(event.target.value))} className="w-full accent-indigo-600" />

      {error ? <p className="mt-2 text-xs font-bold text-rose-700">{error}</p> : null}
      <button type="button" disabled={pending || !changed} onClick={() => startTransition(async () => { setError(null); const response = await selectStudentSlideBrightnessAction(slideOffset, backgroundOffset); if (!response.ok) { setError(response.error); return; } setSaved({ slideOffset: response.slideOffset, backgroundOffset: response.backgroundOffset }); router.refresh(); })} className="min-h-10 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Zapisywanie…" : changed ? "Zapisz jasność" : "Jasność zapisana"}</button>
    </div>
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-700 p-3" style={{ filter: `brightness(${backgroundBrightness})` }} aria-label="Podgląd jasności slajdu">
      <div className="rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 p-4 text-white shadow-xl" style={{ boxShadow: `inset 0 0 0 999px rgb(2 6 23 / ${slideDim})` }}><p className="text-[10px] font-black uppercase tracking-wide text-cyan-100">Podgląd slajdu</p><p className="mt-1 text-lg font-black">Czytelna matematyka</p></div>
    </div>
  </div>;
}
