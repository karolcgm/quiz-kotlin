"use client";

import { useMemo, useState } from "react";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { decomposeNumber } from "@/lib/math/placeValue";

interface PlaceValueFactoryModelProps { seed: number; readOnly?: boolean; }
function numberFromSeed(seed: number): number { return ((seed % 7) + 1) * 100 + ((seed % 9) + 1) * 10 + (seed % 10); }

export function PlaceValueFactoryModel({ seed, readOnly = false }: PlaceValueFactoryModelProps) {
  const primary = useMemo(() => numberFromSeed(seed), [seed]);
  const compare = useMemo(() => numberFromSeed(seed + 13), [seed]);
  const parts = decomposeNumber(primary);
  const [chosen, setChosen] = useState({ hundreds: "", tens: "", ones: "" });
  const [sign, setSign] = useState<"<" | ">" | "=" | null>(null);
  const correctBuild = Number(chosen.hundreds) === parts.hundreds && Number(chosen.tens) === parts.tens && Number(chosen.ones) === parts.ones;
  const correctSign = sign === (primary > compare ? ">" : primary < compare ? "<" : "=");

  return <div className="space-y-4">
    <PlaceValueVisual value={primary} label="Liczba do zbudowania" accent="indigo" />
    {readOnly ? <StaticParts parts={parts} /> : <>
      <p className="text-sm font-semibold text-slate-800">Wybierz cyfry, które budują liczbę {primary}.</p>
      <div className="grid gap-3 sm:grid-cols-3">{(["hundreds", "tens", "ones"] as const).map((place) => <label key={place} className="rounded-xl bg-slate-50 p-3 text-center"><span className="block text-xs font-bold uppercase text-slate-500">{place === "hundreds" ? "Setki" : place === "tens" ? "Dziesiątki" : "Jedności"}</span><select value={chosen[place]} onChange={(event) => setChosen((current) => ({ ...current, [place]: event.target.value }))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-center text-lg font-black"><option value="">?</option>{Array.from({ length: 10 }, (_, digit) => <option key={digit} value={digit}>{digit}</option>)}</select></label>)}</div>
      {chosen.hundreds && chosen.tens && chosen.ones ? <p className={`rounded-xl p-3 text-sm font-semibold ${correctBuild ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>{correctBuild ? "Dobrze — liczba jest poprawnie zbudowana." : "Sprawdź wartość cyfr w każdym rzędzie."}</p> : null}
      <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="font-semibold text-slate-800">Porównaj: {primary} ○ {compare}</p><div className="mt-3 flex gap-2">{(["<", "=", ">"] as const).map((value) => <button type="button" key={value} onClick={() => setSign(value)} className={`min-h-11 min-w-11 rounded-lg border text-lg font-black ${sign === value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"}`}>{value}</button>)}</div>{sign ? <p className={`mt-3 text-sm font-semibold ${correctSign ? "text-emerald-700" : "text-rose-700"}`}>{correctSign ? "Dobrze — porównujesz od setek." : "Spójrz najpierw na setki, potem dziesiątki."}</p> : null}</div>
    </>}
  </div>;
}
function StaticParts({ parts }: { parts: ReturnType<typeof decomposeNumber> }) { return <div className="grid gap-3 sm:grid-cols-3">{[["Setki",parts.hundreds],["Dziesiątki",parts.tens],["Jedności",parts.ones]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="text-2xl font-black text-slate-900">{value}</p></div>)}</div>; }
