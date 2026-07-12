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
  const wallpaperOpacity = Math.max(0, Math.min(1, (backgroundOffset + 50) / 150));
  const presentationDim = Math.max(0, Math.min(.85, .30 - slideOffset / 100));
  const frameDim = Math.max(0, Math.min(.85, .40 - slideOffset / 100));

  return <div className="grid gap-4 rounded-3xl border border-indigo-100 bg-white p-4 sm:grid-cols-[1fr_220px] sm:items-center">
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="slide-brightness" className="font-black text-slate-950">Jasność slajdów</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{formatOffset(slideOffset)}</span>
      </div>
      <input id="slide-brightness" type="range" min="-50" max="50" step="5" value={slideOffset} onChange={(event) => setSlideOffset(Number(event.target.value))} className="w-full accent-indigo-600" />

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="background-opacity" className="font-black text-slate-950">Widoczność tła</label>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{formatOffset(backgroundOffset)}%</span>
      </div>
      <input id="background-opacity" type="range" min="-50" max="100" step="5" value={backgroundOffset} onChange={(event) => setBackgroundOffset(Number(event.target.value))} className="w-full accent-indigo-600" />

      {error ? <p className="mt-2 text-xs font-bold text-rose-700">{error}</p> : null}
      <button type="button" disabled={pending || !changed} onClick={() => startTransition(async () => { setError(null); const response = await selectStudentSlideBrightnessAction(slideOffset, backgroundOffset); if (!response.ok) { setError(response.error); return; } setSaved({ slideOffset: response.slideOffset, backgroundOffset: response.backgroundOffset }); router.refresh(); })} className="min-h-10 rounded-xl bg-indigo-600 px-4 text-xs font-black text-white disabled:bg-slate-300 disabled:text-slate-600">{pending ? "Zapisywanie…" : changed ? "Zapisz ustawienia" : "Ustawienia zapisane"}</button>
    </div>
    <div className="relative overflow-hidden rounded-2xl bg-slate-100 p-3" aria-label="Podgląd slajdu i tła">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/rewards/themes/forest.jpg')", opacity: wallpaperOpacity }} />
      <div className="relative rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 p-4 text-white shadow-xl" style={{ boxShadow: `inset 0 0 0 999px rgb(2 6 23 / ${presentationDim})` }}>
        <div className="rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-700 p-3" style={{ boxShadow: `inset 0 0 0 999px rgb(2 6 23 / ${frameDim})` }}>
          <p className="text-[10px] font-black uppercase tracking-wide text-cyan-100">Podgląd slajdu</p>
          <p className="mt-1 text-lg font-black">Czytelna matematyka</p>
        </div>
      </div>
    </div>
  </div>;
}
