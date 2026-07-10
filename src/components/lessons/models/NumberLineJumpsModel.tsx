"use client";

import { useMemo } from "react";
import { buildEquation, describeMovement } from "@/lib/math/numberLine";

interface NumberLineJumpsModelProps {
  seed: number;
  readOnly?: boolean;
}

export function NumberLineJumpsModel({ seed, readOnly = false }: NumberLineJumpsModelProps) {
  const { start, change, result } = useMemo(() => {
    const startVal = 20 + (seed % 41);
    const delta = ((seed % 7) + 1) * (seed % 2 === 0 ? 1 : -1);
    return { start: startVal, change: delta, result: startVal + delta };
  }, [seed]);

  const min = Math.min(start, result) - 2;
  const max = Math.max(start, result) + 2;
  const span = max - min;

  const toX = (value: number) => 40 + ((value - min) / span) * 320;

  return (
    <div className="space-y-4">
      <svg viewBox="0 0 400 120" className="w-full max-w-lg rounded-xl bg-slate-50 p-2" role="img" aria-label="Oś liczbowa ze skokiem">
        <line x1="30" y1="60" x2="370" y2="60" stroke="#334155" strokeWidth="3" />
        <circle cx={toX(start)} cy="60" r="8" fill="#4f46e5" />
        <circle cx={toX(result)} cy="60" r="8" fill="#059669" />
        <path
          d={`M ${toX(start)} 45 Q ${(toX(start) + toX(result)) / 2} 20 ${toX(result)} 45`}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <text x={toX(start)} y="90" textAnchor="middle" className="fill-slate-800 text-sm font-bold">
          {start}
        </text>
        <text x={toX(result)} y="90" textAnchor="middle" className="fill-slate-800 text-sm font-bold">
          {result}
        </text>
      </svg>
      <p className="text-center text-lg font-bold text-slate-900">{buildEquation(start, change, result)}</p>
      <p className="text-center text-sm text-slate-600">{describeMovement(change)}</p>
      {!readOnly ? (
        <p className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">
          Strategia: rozkład na dziesiątki albo dopełnienie do pełnej dziesiątki — wybierz wygodniejszą.
        </p>
      ) : null}
    </div>
  );
}
