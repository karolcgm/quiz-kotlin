"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export const DIVISIBILITY_ROUNDS = [
  { divisor: 2, animal: "Biedronka Luna", image: "/lessons/illustrations/number-properties/divisibility-ladybug-v1.webp", rule: "Liczba jest podzielna przez 2, gdy jej ostatnią cyfrą jest 0, 2, 4, 6 lub 8.", accent: "rose" },
  { divisor: 3, animal: "Kameleon Kamil", image: "/lessons/illustrations/number-properties/divisibility-chameleon-v1.webp", rule: "Liczba jest podzielna przez 3, gdy suma jej cyfr jest podzielna przez 3.", accent: "emerald" },
  { divisor: 4, animal: "Motylka Tola", image: "/lessons/illustrations/number-properties/divisibility-butterfly-v1.webp", rule: "Liczba jest podzielna przez 4, gdy liczba utworzona z jej dwóch ostatnich cyfr jest podzielna przez 4.", accent: "violet" },
  { divisor: 5, animal: "Pszczółka Mela", image: "/lessons/illustrations/number-properties/divisibility-bee-v1.webp", rule: "Liczba jest podzielna przez 5, gdy kończy się cyfrą 0 albo 5.", accent: "amber" },
  { divisor: 9, animal: "Sowa Sonia", image: "/lessons/illustrations/number-properties/divisibility-owl-v1.webp", rule: "Liczba jest podzielna przez 9, gdy suma jej cyfr jest podzielna przez 9.", accent: "indigo" },
  { divisor: 10, animal: "Ważka Wera", image: "/lessons/illustrations/number-properties/divisibility-dragonfly-v1.webp", rule: "Liczba jest podzielna przez 10, gdy jej ostatnią cyfrą jest 0.", accent: "cyan" },
  { divisor: 100, animal: "Paw Poldek", image: "/lessons/illustrations/number-properties/divisibility-peacock-v1.webp", rule: "Liczba jest podzielna przez 100, gdy jej dwie ostatnie cyfry to zera.", accent: "teal" },
] as const;

function makeRandom(seed: number) {
  let state = Math.abs(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffled<T>(values: readonly T[], seed: number) {
  const result = [...values];
  const random = makeRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

export interface DivisibilityRoundData {
  divisor: number;
  numbers: number[];
  correctNumbers: number[];
}

/** Tworzy dokładnie 25 różnych liczb: 10 poprawnych i 15 pułapek. */
export function createDivisibilityRound(divisor: number, seed: number): DivisibilityRoundData {
  const correctSmall = shuffled(range(0, 9).filter((value) => value % divisor === 0), seed + 11).slice(0, 3);
  const correctTwo = shuffled(range(10, 99).filter((value) => value % divisor === 0), seed + 23).slice(0, Math.min(4, 10 - correctSmall.length));
  const correctThree = shuffled(range(100, 999).filter((value) => value % divisor === 0), seed + 37).slice(0, 10 - correctSmall.length - correctTwo.length);
  const correctNumbers = [...correctSmall, ...correctTwo, ...correctThree];

  const incorrectSmall = shuffled(range(0, 9).filter((value) => value % divisor !== 0), seed + 41).slice(0, 4);
  const incorrectTwo = shuffled(range(10, 99).filter((value) => value % divisor !== 0), seed + 53).slice(0, 6);
  const incorrectThree = shuffled(range(100, 999).filter((value) => value % divisor !== 0), seed + 67).slice(0, 15 - incorrectSmall.length - incorrectTwo.length);
  const incorrectNumbers = [...incorrectSmall, ...incorrectTwo, ...incorrectThree];

  return {
    divisor,
    correctNumbers: [...correctNumbers].sort((a, b) => a - b),
    numbers: shuffled([...correctNumbers, ...incorrectNumbers], seed + 79),
  };
}

function sameSet(left: Set<number>, right: readonly number[]) {
  return left.size === right.length && right.every((value) => left.has(value));
}

function AnimalRound({ taskSeed, readOnly, questionNumber, questionCount, onResultChange }: Required<Pick<Props, "taskSeed" | "readOnly" | "questionNumber" | "questionCount">> & Pick<Props, "onResultChange">) {
  const roundIndex = Math.min(DIVISIBILITY_ROUNDS.length - 1, Math.max(0, questionNumber - 1));
  const round = DIVISIBILITY_ROUNDS[roundIndex]!;
  const data = useMemo(() => createDivisibilityRound(round.divisor, taskSeed + round.divisor * 1009), [round.divisor, taskSeed]);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);

  const toggle = (value: number) => {
    if (readOnly) return;
    const next = new Set(selected);
    if (next.has(value)) next.delete(value); else next.add(value);
    setSelected(next); setChecked(null); onResultChange?.(null);
  };
  const check = () => {
    const correct = sameSet(selected, data.correctNumbers);
    setChecked(correct); onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", "));
  };

  return <>
    <header className="grid gap-4 rounded-3xl bg-gradient-to-r from-indigo-800 via-violet-800 to-teal-700 p-5 sm:grid-cols-[1fr_auto] sm:items-start sm:p-7">
      <div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 3 · Cechy podzielności</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">Znajdź liczby podzielne przez {round.divisor}</h3><p className="mt-2 text-lg font-bold text-white">Przeczytaj wszystkie 25 liczb i zaznacz każdą liczbę podzielną przez {round.divisor}.</p><p id="divisibility-rule" className="mt-3 max-w-3xl rounded-2xl bg-white/10 px-4 py-3 font-bold leading-relaxed text-white"><span className="text-cyan-200">Cecha podzielności: </span>{round.rule}</p></div>
      <div className="rounded-2xl bg-white px-5 py-3 text-center text-slate-950"><span className="block text-xs font-black uppercase tracking-wide text-slate-500">Zadanie</span><b className="text-lg">{questionNumber}/{questionCount}</b><span className="mt-1 block text-sm font-bold text-slate-700">{round.animal}</span></div>
    </header>

    <div className="relative mt-4 min-h-[700px] overflow-hidden rounded-3xl border border-white/15 sm:aspect-[3/2] sm:min-h-0">
      <Image src={round.image} alt={`${round.animal} przedstawia planszę do wyszukiwania liczb podzielnych przez ${round.divisor}`} fill priority={roundIndex === 0} sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover object-top" />
      <div className="absolute inset-x-[4%] bottom-[4%] top-[34%] grid grid-cols-5 grid-rows-5 gap-2.5 sm:inset-x-[6%] sm:bottom-[5%] sm:top-[38%] sm:gap-4">
        {data.numbers.map((value) => <button key={value} type="button" aria-label={`Liczba ${value}`} aria-describedby="divisibility-rule" aria-pressed={selected.has(value)} disabled={readOnly} onClick={() => toggle(value)} className={`m-auto grid aspect-square w-[82%] min-w-10 place-items-center rounded-full border-2 text-sm font-black shadow-[0_6px_18px_rgba(0,0,0,.45)] backdrop-blur transition sm:border-4 sm:text-xl ${selected.has(value) ? "scale-105 border-amber-200 bg-amber-300 text-slate-950 ring-2 ring-white" : "border-white/70 bg-white/95 text-slate-950 hover:scale-105 hover:bg-cyan-100"}`}>{value}</button>)}
      </div>
    </div>

    <div className="mt-4 grid gap-3 rounded-3xl bg-white/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">Zaznacz pełny zestaw, a następnie sprawdź odpowiedź.</p><p className="mt-1 text-sm text-slate-300">Przyciski są oddzielone, aby każdą liczbę można było nacisnąć osobno.</p></div><button type="button" disabled={readOnly} onClick={check} className="min-h-14 rounded-2xl bg-cyan-300 px-7 text-lg font-black text-slate-950 shadow-lg disabled:opacity-35">Sprawdź zestaw</button></div>
    {checked !== null ? <div role="status" className={`mt-4 rounded-2xl px-5 py-4 text-center ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}><p className="text-xl font-black">{checked ? `Brawo! ${round.animal} otwiera następną planszę.` : "Nie wszystkie liczby są jeszcze zaznaczone poprawnie."}</p><p className="mt-1 text-sm font-bold">{checked ? "Zapisz odpowiedź, aby przejść do następnego zadania." : `W tej rundzie jest ${data.correctNumbers.length} poprawnych liczb. Zastosuj podaną cechę i spróbuj ponownie.`}</p></div> : null}
  </>;
}

function DivisibilityStoryTask({ readOnly, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const options = [2, 3, 4, 5, 9, 10, 100];
  const expected = [2, 3, 4, 5, 9, 10];
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const toggle = (value: number) => { const next = new Set(selected); if (next.has(value)) next.delete(value); else next.add(value); setSelected(next); setChecked(null); onResultChange?.(null); };
  const check = () => { const correct = sameSet(selected, expected); setChecked(correct); onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", ")); };
  return <article className="rounded-[2rem] bg-gradient-to-br from-amber-100 via-cyan-50 to-emerald-100 p-5 text-slate-950 shadow-2xl sm:p-8"><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Zadanie praktyczne</p><h3 className="mt-2 text-3xl font-black">540 koralików Chrupka</h3><p className="mt-4 max-w-4xl text-lg leading-relaxed">Chrupek ma <b>540 koralików</b>. Chce rozłożyć je do jednakowych woreczków tak, aby w każdym woreczku była taka sama liczba koralików i żeby żaden koralik nie został. Sprawdź cechy podzielności i zaznacz wszystkie liczby, które mogą oznaczać liczbę koralików w jednym woreczku.</p><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">{options.map((value) => <button key={value} type="button" aria-pressed={selected.has(value)} disabled={readOnly} onClick={() => toggle(value)} className={`min-h-20 rounded-2xl border-4 text-2xl font-black ${selected.has(value) ? "border-indigo-700 bg-indigo-600 text-white" : "border-white bg-white text-slate-950 shadow"}`}>{value}</button>)}</div><button type="button" disabled={readOnly} onClick={check} className="mt-6 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź wybór</button>{checked !== null ? <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{checked ? "Poprawnie — 540 dzieli się przez wszystkie zaznaczone liczby." : "Sprawdź kolejno cechy podzielności przez 2, 3, 4, 5, 9, 10 i 100."}</p> : null}</article>;
}

export function DivisibilityAnimalsLessonModel({ seed = 1, taskSeed = seed, readOnly = false, questionNumber = 1, questionCount = DIVISIBILITY_ROUNDS.length, onResultChange }: Props) {
  const station = Math.min(2, Math.max(1, seed));
  return <section data-seed={seed} className="overflow-hidden rounded-[2.25rem] bg-slate-950 p-3 text-white shadow-2xl sm:p-5">
    {station === 1 ? <AnimalRound taskSeed={taskSeed} readOnly={readOnly} questionNumber={questionNumber} questionCount={questionCount} onResultChange={onResultChange} /> : null}
    {station === 2 ? <DivisibilityStoryTask readOnly={readOnly} onResultChange={onResultChange} /> : null}
  </section>;
}
