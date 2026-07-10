"use client";

import { useMemo, useState } from "react";
import { decomposeNumber } from "@/lib/math/placeValue";

interface PlaceValueFactoryModelProps {
  seed: number;
  readOnly?: boolean;
  presentationMode?: boolean;
}

type Place = "hundreds" | "tens" | "ones";
type Digits = Record<Place, number | null>;

const STATIONS: Array<{ id: Place; name: string; unit: string; color: string; glow: string }> = [
  { id: "hundreds", name: "SETKI", unit: "×100", color: "from-violet-600 to-indigo-700", glow: "ring-violet-300" },
  { id: "tens", name: "DZIESIĄTKI", unit: "×10", color: "from-cyan-500 to-blue-600", glow: "ring-cyan-300" },
  { id: "ones", name: "JEDNOŚCI", unit: "×1", color: "from-amber-400 to-orange-500", glow: "ring-amber-300" },
];

function numberFromSeed(seed: number): number {
  return ((seed % 7) + 2) * 100 + ((seed * 3) % 9) * 10 + ((seed * 7) % 10);
}

function targetDigits(value: number): Digits {
  const parts = decomposeNumber(value);
  return { hundreds: parts.hundreds, tens: parts.tens, ones: parts.ones };
}

export function PlaceValueFactoryModel({ seed, readOnly = false, presentationMode = false }: PlaceValueFactoryModelProps) {
  const target = useMemo(() => numberFromSeed(seed), [seed]);
  const targetParts = useMemo(() => targetDigits(target), [target]);
  const [digits, setDigits] = useState<Digits>(() => presentationMode || readOnly ? targetParts : { hundreds: null, tens: null, ones: null });
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const palette = useMemo(() => {
    const hundreds = targetParts.hundreds ?? 0;
    const tens = targetParts.tens ?? 0;
    const ones = targetParts.ones ?? 0;
    return Array.from(new Set([hundreds, tens, ones, (ones + 3) % 10, (tens + 5) % 10, (hundreds + 2) % 10]));
  }, [targetParts]);
  const built = Object.values(digits).every((digit) => digit !== null);
  const builtNumber = built ? (digits.hundreds ?? 0) * 100 + (digits.tens ?? 0) * 10 + (digits.ones ?? 0) : null;
  const isCorrect = builtNumber === target;

  const setPlace = (place: Place, digit: number) => {
    if (readOnly) return;
    setDigits((current) => ({ ...current, [place]: digit }));
    setSelectedDigit(null);
    setCelebrating(false);
  };

  const reset = () => {
    setDigits(presentationMode ? targetParts : { hundreds: null, tens: null, ones: null });
    setSelectedDigit(null);
    setCelebrating(false);
  };

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(139,92,246,.35),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(6,182,212,.28),transparent_28%)]" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.24em] text-cyan-300">FABRYKA LICZB · STREFA DOTYKOWA</p>
          <h3 className="mt-1 text-2xl font-black sm:text-4xl">Zbuduj liczbę {presentationMode ? "dla klasy" : "z zamówienia"}</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">{presentationMode ? "Dotknij cyfr w stacjach i zmieniaj przykład na żywo. Nic nie jest oceniane ani zdradzane." : `Zamówienie: ${target}. Przeciągnij cyfry na właściwą taśmę produkcyjną.`}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center backdrop-blur">
          <p className="text-[10px] font-bold tracking-widest text-slate-300">NA TAŚMIE</p>
          <p className="text-4xl font-black tabular-nums">{builtNumber ?? "? ? ?"}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {STATIONS.map((station) => {
          const digit = digits[station.id];
          return (
            <div
              key={station.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => { event.preventDefault(); const value = Number(event.dataTransfer.getData("text/plain")); if (Number.isInteger(value)) setPlace(station.id, value); }}
              className={`rounded-3xl border border-white/15 bg-gradient-to-b ${station.color} p-[1px] shadow-lg`}
            >
              <button type="button" disabled={readOnly} onClick={() => selectedDigit !== null && setPlace(station.id, selectedDigit)} className={`min-h-52 w-full rounded-[1.35rem] bg-slate-950/90 p-5 text-center transition hover:bg-slate-900 disabled:cursor-default ${selectedDigit !== null ? `ring-4 ${station.glow}` : ""}`}>
                <div className="flex items-center justify-between text-xs font-black tracking-widest text-slate-300"><span>{station.name}</span><span>{station.unit}</span></div>
                <div className="mt-5 flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5"><span className="text-7xl font-black tabular-nums">{digit ?? "?"}</span></div>
                <p className="mt-4 text-xs font-semibold text-slate-300">{presentationMode ? "Dotknij cyfrę poniżej, potem stację" : "Upuść cyfrę tutaj"}</p>
              </button>
            </div>
          );
        })}
      </div>

      {!readOnly ? (
        <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold">Magazyn cyfr — przeciągnij albo wybierz i dotknij stacji</p><button type="button" onClick={reset} className="rounded-xl px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-white/10">Wyczyść taśmę</button></div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {palette.map((digit) => <button key={digit} type="button" draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(digit))} onClick={() => setSelectedDigit(digit)} className={`touch-manipulation grid h-16 w-16 place-items-center rounded-2xl border text-3xl font-black ${selectedDigit === digit ? "border-cyan-200 bg-cyan-300 text-slate-950 ring-4 ring-cyan-300/40" : "border-white/20 bg-white text-slate-950"}`}>{digit}</button>)}
          </div>
        </div>
      ) : null}

      {!presentationMode && built ? <div className={`mt-5 rounded-2xl px-5 py-4 text-center font-bold ${isCorrect ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>{isCorrect ? "Maszyna rusza! Liczba jest zbudowana poprawnie." : "Spójrz jeszcze raz na rząd każdej cyfry — popraw bez podpowiedzi gotowego układu."}{isCorrect && !celebrating ? <button type="button" onClick={() => setCelebrating(true)} className="ml-3 rounded-lg bg-emerald-950 px-3 py-1 text-xs text-white">Uruchom fanfary</button> : null}</div> : null}
      {celebrating ? <div className="mt-4 text-center text-3xl" aria-label="Sukces">✦ ✦ ✦</div> : null}
    </section>
  );
}
