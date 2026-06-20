"use client";

import { decomposeNumber, formatPlaceValueSummary, usesCompactPlaceValue } from "@/lib/math/placeValue";

interface PlaceValueVisualProps {
  value: number;
  label?: string;
  accent?: "indigo" | "emerald" | "amber" | "sky";
  compact?: boolean;
}

const accentClasses = {
  indigo: { block: "bg-indigo-500", light: "bg-indigo-50 text-indigo-900", border: "border-indigo-200" },
  emerald: { block: "bg-emerald-500", light: "bg-emerald-50 text-emerald-900", border: "border-emerald-200" },
  amber: { block: "bg-amber-500", light: "bg-amber-50 text-amber-900", border: "border-amber-200" },
  sky: { block: "bg-sky-500", light: "bg-sky-50 text-sky-900", border: "border-sky-200" },
};

function BeadDots({ count, colorClass }: { count: number; colorClass: string }) {
  if (count <= 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={`h-4 w-4 rounded-full ${colorClass} shadow-sm`} />
      ))}
    </div>
  );
}

export function PlaceValueVisual({ value, label, accent = "indigo", compact }: PlaceValueVisualProps) {
  const parts = decomposeNumber(value);
  const colors = accentClasses[accent];
  const showCompact = compact ?? usesCompactPlaceValue(value);

  if (!showCompact && parts.total <= 20) {
    return (
      <div className={`rounded-2xl border p-4 ${colors.light} ${colors.border}`}>
        {label && <p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>}
        <p className="mb-3 text-center text-3xl font-black">{parts.total}</p>
        <BeadDots count={parts.total} colorClass={colors.block} />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 ${colors.light} ${colors.border}`}>
      {label && <p className="mb-2 text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>}
      <p className="mb-1 text-center text-3xl font-black">{parts.total}</p>
      <p className="mb-3 text-center text-xs font-semibold opacity-80">{formatPlaceValueSummary(parts.total)}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-white/80 p-2">
          <p className="text-[10px] font-bold uppercase text-slate-500">Setki</p>
          <div className="mt-2 flex flex-col items-center gap-1">
            {Array.from({ length: parts.hundreds }).map((_, index) => (
              <span key={index} className={`h-8 w-12 rounded-lg ${colors.block} opacity-90`} title="100" />
            ))}
            {parts.hundreds === 0 && <span className="text-lg font-bold text-slate-300">—</span>}
          </div>
          <p className="mt-1 text-sm font-bold">{parts.hundreds}</p>
        </div>
        <div className="rounded-xl bg-white/80 p-2">
          <p className="text-[10px] font-bold uppercase text-slate-500">Dziesiątki</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {Array.from({ length: parts.tens }).map((_, index) => (
              <span key={index} className={`h-8 w-3 rounded-full ${colors.block}`} title="10" />
            ))}
            {parts.tens === 0 && <span className="text-lg font-bold text-slate-300">—</span>}
          </div>
          <p className="mt-1 text-sm font-bold">{parts.tens}</p>
        </div>
        <div className="rounded-xl bg-white/80 p-2">
          <p className="text-[10px] font-bold uppercase text-slate-500">Jedności</p>
          <div className="mt-2">
            <BeadDots count={parts.ones} colorClass={colors.block} />
            {parts.ones === 0 && <span className="text-lg font-bold text-slate-300">—</span>}
          </div>
          <p className="mt-1 text-sm font-bold">{parts.ones}</p>
        </div>
      </div>
    </div>
  );
}
