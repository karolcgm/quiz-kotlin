"use client";

import type { UnderstandingLevel } from "@/types/understanding";

const OPTIONS: Array<{
  value: UnderstandingLevel;
  label: string;
  dotClass: string;
  cardClass: string;
}> = [
  {
    value: "understood",
    label: "Wszystko rozumiem",
    dotClass: "bg-emerald-500 shadow-emerald-200",
    cardClass: "border-emerald-200 bg-emerald-50 text-emerald-950",
  },
  {
    value: "partial",
    label: "Rozumiem, ale nie wszystko",
    dotClass: "bg-yellow-400 shadow-yellow-200",
    cardClass: "border-yellow-200 bg-yellow-50 text-yellow-950",
  },
  {
    value: "not_understood",
    label: "Nie rozumiem tematu",
    dotClass: "bg-orange-500 shadow-orange-200",
    cardClass: "border-orange-200 bg-orange-50 text-orange-950",
  },
];

export function UnderstandingCheck({
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: UnderstandingLevel | null;
  onChange: (value: UnderstandingLevel) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <section className={`rounded-[2rem] border border-indigo-100 bg-white ${compact ? "p-4" : "p-5 sm:p-7"}`}>
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Ostatni krok · obowiązkowy</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Jak dobrze rozumiesz ten temat?</h2>
        <p className="mt-2 text-sm text-slate-600">Wybierz szczerze. To nie jest ocena — nauczyciel wykorzysta odpowiedź do zaplanowania powtórki.</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Samoocena zrozumienia tematu">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`min-h-36 rounded-2xl border-2 p-4 text-center font-black transition ${option.cardClass} ${selected ? "scale-[1.02] ring-4 ring-indigo-200" : "hover:-translate-y-1 hover:shadow-md"} disabled:cursor-wait disabled:opacity-60`}
            >
              <span className={`mx-auto block h-14 w-14 rounded-full shadow-lg ${option.dotClass}`} aria-hidden />
              <span className="mt-4 block text-sm leading-snug">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
