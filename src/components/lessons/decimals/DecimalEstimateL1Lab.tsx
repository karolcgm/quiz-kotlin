"use client";

import { useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { createPublicDecimalEstimateL1Task, isDecimalEstimateL1Activity, type DecimalEstimateL1Activity } from "@/lib/math/decimals/decimalEstimateL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

export { isDecimalEstimateL1Activity };

export interface DecimalEstimateL1LabProps {
  activity: DecimalEstimateL1Activity; seed: number; taskSeed?: number; difficulty?: LessonDifficulty; readOnly?: boolean; presentationMode?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

export function DecimalEstimateL1Lab(props: DecimalEstimateL1LabProps) {
  const effectiveSeed = props.taskSeed ?? props.seed;
  const task = useMemo(() => createPublicDecimalEstimateL1Task({ seed: effectiveSeed, difficulty: props.difficulty ?? "core", activity: props.activity }), [effectiveSeed, props.activity, props.difficulty]);
  const [chosen, setChosen] = useState<string | boolean | null>(null);
  const [status, setStatus] = useState<"correct" | "wrong" | null>(null);
  const choose = (value: string | boolean) => { if (props.readOnly) return; setChosen(value); setStatus(null); props.onResultChange?.(null); };
  const check = () => {
    if (chosen === null) return;
    const correct = props.activity === "decimal-estimate-round" ? chosen === (task as { answer: string }).answer : chosen === (task as { answer: boolean }).answer;
    setStatus(correct ? "correct" : "wrong");
    props.onResultChange?.(correct, String(chosen));
  };
  const isRound = props.activity === "decimal-estimate-round";
  const round = task as { expression: string; roundedExpression: string; options: readonly string[] };
  const sense = task as { expression: string; proposedResult: string; roundedExpression: string; answer: boolean };
  return <LessonTaskFrame eyebrow="Dział 5 · Ułamki dziesiętne" heading={isRound ? "Najpierw oszacuj" : "Oszacuj i znajdź błąd"} description={isRound ? "Zaokrąglij liczby w myślach i wybierz wynik przybliżony. Nie obliczaj jeszcze dokładnie." : "Oszacuj wynik działania. Wskaż wyraźnie, czy podane obliczenie jest poprawne, czy zawiera błąd."} questionNumber={props.questionNumber} questionCount={props.questionCount} contentClassName="space-y-5" data-decimal-estimate-l1 data-decimal-activity={props.activity}>
    <section className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-5 text-center">
      {!isRound ? <p className="mb-2 text-sm font-black uppercase tracking-wide text-cyan-900">Sprawdź to obliczenie</p> : null}
      <p className="text-3xl font-black text-slate-950">{isRound ? round.expression : `${sense.expression} = ${sense.proposedResult}`}</p>
      <p className="mt-3 text-lg font-black text-cyan-950">Szacunek: {isRound ? round.roundedExpression : sense.roundedExpression}</p>
    </section>
    {isRound ? <div className="grid gap-3 sm:grid-cols-3">{round.options.map((option) => <LessonTaskChoice key={option} selected={chosen === option} onClick={() => choose(option)} disabled={props.readOnly} className="min-h-16 text-2xl">około {option}</LessonTaskChoice>)}</div> : <div className="grid gap-3 sm:grid-cols-2"><LessonTaskChoice selected={chosen === true} onClick={() => choose(true)} disabled={props.readOnly} className="min-h-16 text-xl">Obliczenie jest poprawne</LessonTaskChoice><LessonTaskChoice selected={chosen === false} onClick={() => choose(false)} disabled={props.readOnly} className="min-h-16 text-xl">Obliczenie zawiera błąd</LessonTaskChoice></div>}
    {!props.readOnly ? <button type="button" disabled={chosen === null} onClick={check} className="min-h-12 w-full rounded-xl bg-slate-950 px-5 font-black text-white disabled:opacity-40">Zatwierdź</button> : null}
    {status ? <p role="status" className={`rounded-xl p-4 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{status === "correct" ? isRound ? "Dobrze! Oszacowanie pomaga sprawdzić, czy dokładny wynik ma sens." : sense.answer ? "Dobrze! To obliczenie jest policzone poprawnie — oszacowanie potwierdza właściwy rząd wielkości wyniku." : "Dobrze! To obliczenie jest źle policzone. Oszacowanie pokazuje błąd w rzędzie wielkości; sprawdź położenie przecinka i popraw wynik." : "Spróbuj jeszcze raz. Oszacuj wynik i zdecyduj, czy podane obliczenie jest poprawne, czy zawiera błąd."}</p> : null}
  </LessonTaskFrame>;
}
