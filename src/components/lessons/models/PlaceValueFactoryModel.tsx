"use client";

import { useMemo } from "react";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { decomposeNumber } from "@/lib/math/placeValue";

interface PlaceValueFactoryModelProps {
  seed: number;
  readOnly?: boolean;
}

function numberFromSeed(seed: number): number {
  const hundreds = (seed % 7) + 1;
  const tens = (seed % 9) + 1;
  const ones = seed % 10;
  return hundreds * 100 + tens * 10 + ones;
}

export function PlaceValueFactoryModel({ seed, readOnly = false }: PlaceValueFactoryModelProps) {
  const primary = useMemo(() => numberFromSeed(seed), [seed]);
  const compare = useMemo(() => numberFromSeed(seed + 13), [seed]);
  const parts = decomposeNumber(primary);

  return (
    <div className="space-y-4">
      <PlaceValueVisual value={primary} label="Liczba na taśmie" accent="indigo" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs font-bold uppercase text-slate-500">Setki</p>
          <p className="text-2xl font-black text-slate-900">{parts.hundreds}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs font-bold uppercase text-slate-500">Dziesiątki</p>
          <p className="text-2xl font-black text-slate-900">{parts.tens}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-xs font-bold uppercase text-slate-500">Jedności</p>
          <p className="text-2xl font-black text-slate-900">{parts.ones}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-700">Porównaj z liczbą {compare}</p>
        <p className="mt-2 text-lg font-bold text-indigo-700">
          {primary} {primary === compare ? "=" : primary > compare ? ">" : "<"} {compare}
        </p>
        {!readOnly ? (
          <p className="mt-2 text-xs text-slate-500">Najpierw porównaj setki, potem dziesiątki, na końcu jedności.</p>
        ) : null}
      </div>
    </div>
  );
}
