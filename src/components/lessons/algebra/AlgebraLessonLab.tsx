"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { AlgebraBalanceScene3D, AlgebraMachineScene3D, AlgebraTilesScene3D } from "@/components/lessons/algebra/AlgebraScenes3D";
import { generateAlgebraTask, type AlgebraActivity, type AlgebraTask } from "@/lib/math/algebra/grade6Algebra";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface AlgebraLessonLabProps {
  activity: AlgebraActivity;
  seed?: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  topicNumber?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function MysteryBoxCard({ value, open }: { value: number; open: boolean }) {
  return <div className={`relative mx-auto grid h-40 w-48 place-items-center rounded-[2rem] border-4 shadow-xl transition duration-500 ${open ? "border-emerald-300 bg-emerald-100" : "border-violet-300 bg-gradient-to-br from-violet-600 to-fuchsia-700"}`} data-mystery-box>
    <span className={`text-7xl font-black ${open ? "text-emerald-950" : "text-white"}`}>{open ? value : "x"}</span>
    <span className="absolute -bottom-4 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">{open ? "wartość x" : "liczba jest ukryta"}</span>
  </div>;
}

function MeetXDemo({ readOnly }: { readOnly: boolean }) {
  const [value, setValue] = useState(4);
  const [open, setOpen] = useState(false);
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Kim jest x?" description="x jest etykietą liczby. Może oznaczać liczbę przedmiotów, cenę, wiek albo odległość — zależnie od historii.">
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Image src="/lessons/m6/section-8/x-mystery-lab.png" alt="Fioletowe zamknięte pudełko w matematycznym laboratorium" width={1536} height={1024} className="h-full min-h-64 w-full rounded-3xl object-cover" priority />
        <section className="grid place-items-center rounded-3xl bg-violet-50 p-6 text-center">
          <MysteryBoxCard value={value} open={open} />
          <p className="mt-8 font-black text-slate-800">W tym doświadczeniu pudełko przechowuje liczbę {value}. Dopóki go nie otworzymy, nazywamy ją x.</p>
        </section>
      </div>
      <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {[`x naklejek = ${value} naklejki`, `x złotych = ${value} zł`, `x kroków = ${value} kroki`].map((text) => <p key={text} className="rounded-2xl bg-white px-4 py-4 text-center text-lg font-black text-cyan-950 shadow-sm">{open ? text : text.replace(String(value), "?")}</p>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button type="button" disabled={readOnly} onClick={() => setValue((current) => current === 8 ? 2 : current + 1)} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white disabled:opacity-40">Zmień ukrytą liczbę</button>
          <button type="button" disabled={readOnly} onClick={() => setOpen((current) => !current)} className="min-h-12 rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">{open ? "Zamknij pudełko" : "Otwórz pudełko"}</button>
        </div>
      </section>
      <p className="rounded-2xl bg-amber-100 px-5 py-4 text-center text-xl font-black text-amber-950">W jednym obliczeniu każde x oznacza tę samą liczbę.</p>
    </div>
  </LessonTaskFrame>;
}

function SameXDemo({ readOnly }: { readOnly: boolean }) {
  const [value, setValue] = useState(3);
  const [open, setOpen] = useState(false);
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 1" heading="Ta sama litera — ta sama wartość" description="Dwa pudełka oznaczone x są kopiami tej samej liczby, a nie dwoma losowymi pudełkami.">
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <MysteryBoxCard value={value} open={open} />
        <span className="text-center text-5xl font-black text-amber-600">=</span>
        <MysteryBoxCard value={value} open={open} />
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={readOnly} onClick={() => setOpen((current) => !current)} className="min-h-12 rounded-xl bg-violet-700 px-5 font-black text-white">{open ? "Ukryj liczbę" : "Sprawdź oba pudełka"}</button>
        <button type="button" disabled={readOnly} onClick={() => { setValue((current) => current === 7 ? 2 : current + 1); setOpen(false); }} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white">Nowe doświadczenie</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">x + x to dwie takie same liczby, więc zapisujemy 2x.</p>
        <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Jeśli potrzebujemy innej liczby, używamy innej litery, na przykład y.</p>
      </div>
    </div>
  </LessonTaskFrame>;
}

function MachineDemo({ readOnly }: { readOnly: boolean }) {
  const [input, setInput] = useState(4);
  const [step, setStep] = useState(0);
  const values = [`x = ${input}`, `2 · ${input} + 3`, `${input * 2} + 3`, String(input * 2 + 3)];
  const labels = [`Wstaw ${input} w miejsce x`, `Pomnóż 2 · ${input}`, "Dodaj 3", "Odczytaj wartość"];
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 2" heading="Maszyna wartości wyrażenia" description="Zobacz, jak wyrażenie 2x + 3 zmienia się po podstawieniu liczby za x.">
    <div className="space-y-5">
      <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-5 text-center" aria-label="Informacja o wartości wyrażenia">
        <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-800">Informacja</p>
        <p className="mt-2 text-lg font-black leading-relaxed text-slate-950 sm:text-xl">Jeżeli w miejsce litery w wyrażeniu algebraicznym wstawimy liczbę, to po wykonaniu obliczeń otrzymamy <span className="text-violet-700">wartość wyrażenia algebraicznego</span>.</p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Wyrażenie i podstawiana liczba">
        <div className="rounded-3xl border-4 border-violet-300 bg-violet-50 p-5 text-center"><p className="text-xs font-black uppercase tracking-widest text-violet-700">Wyrażenie</p><p className="mt-2 font-mono text-4xl font-black text-violet-950">2x + 3</p></div>
        <div className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5 text-center"><p className="text-xs font-black uppercase tracking-widest text-amber-700">Podstawiamy</p><p className="mt-2 font-mono text-4xl font-black text-amber-950">x = {input}</p></div>
      </section>
      <Image src="/lessons/m6/section-8/algebra-machine.png" alt="Przezroczysta maszyna z trzema komorami przetwarzania" width={1536} height={1024} className="max-h-72 w-full rounded-3xl object-cover" />
      <AlgebraMachineScene3D input={input} progress={step} labels={labels} stepValues={values} />
      <div className="rounded-3xl bg-violet-50 p-5 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-violet-700">Aktualny krok</p>
        <p className="mt-1 font-black text-slate-700">{labels[step]}</p>
        <p className="mt-2 font-mono text-4xl font-black text-violet-950">{values[step]}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={readOnly || step === 0} onClick={() => setStep((current) => current - 1)} className="min-h-12 rounded-xl border-2 border-violet-300 bg-white px-5 font-black text-violet-950 disabled:opacity-40">← Poprzedni krok</button>
        <button type="button" disabled={readOnly || step === 3} onClick={() => setStep((current) => current + 1)} className="min-h-12 rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">Następny krok →</button>
        <button type="button" disabled={readOnly} onClick={() => { setInput((current) => current === 7 ? 2 : current + 1); setStep(0); }} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white disabled:opacity-40">Zmień wartość x</button>
      </div>
    </div>
  </LessonTaskFrame>;
}

function EquationMeaningDemo({ readOnly }: { readOnly: boolean }) {
  const [extra, setExtra] = useState(0);
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 4" heading="Równanie to równowaga" description="Znak równości nie znaczy „teraz podaj wynik”. Mówi, że wartość lewej strony jest taka sama jak wartość prawej strony.">
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Image src="/lessons/m6/section-8/balance-workshop.png" alt="Waga szalkowa, fioletowe pudełko i błękitne klocki jednostkowe" width={1536} height={1024} className="h-full min-h-64 w-full rounded-3xl object-cover" />
        <AlgebraBalanceScene3D leftX={1} leftUnits={3 + extra} rightUnits={8} xValue={5} />
      </div>
      <p className="rounded-2xl bg-amber-100 p-4 text-center font-mono text-3xl font-black text-amber-950">x + {3 + extra} {extra === 0 ? "=" : "≠"} 8</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={readOnly || extra === 1} onClick={() => setExtra(1)} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white">Dołóż 1 tylko z lewej</button>
        <button type="button" disabled={readOnly || extra === 0} onClick={() => setExtra(0)} className="min-h-12 rounded-xl bg-emerald-700 px-5 font-black text-white">Przywróć równowagę</button>
      </div>
      <p className="text-center font-black text-slate-800">Jeżeli zmienimy tylko jedną stronę, równanie przestaje być prawdziwe.</p>
    </div>
  </LessonTaskFrame>;
}

function StoryMap() {
  return <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5" aria-label="Mapa rozwiązania zadania tekstowego">
    <Image src="/lessons/m6/section-8/equation-detective.png" alt="Pudełko, waga, klocki i lupa w pracowni algebraicznego detektywa" width={1536} height={1024} className="mb-5 max-h-72 w-full rounded-2xl object-cover" />
    <div className="grid gap-3 sm:grid-cols-4">
      {["1. Co oznacza x?", "2. Jaka jest zależność?", "3. Zapisz równanie", "4. Rozwiąż i sprawdź"].map((step, index) => <div key={step} className="relative rounded-2xl bg-white px-3 py-4 text-center font-black text-indigo-950 shadow-sm"><span className="block text-2xl">{["🔎", "🧩", "⚖️", "✅"][index]}</span>{step}</div>)}
    </div>
    <p className="mt-4 text-center text-sm font-bold text-indigo-800">Wartość x pozostaje ukryta. Otworzymy pudełko dopiero podczas sprawdzania odpowiedzi.</p>
  </section>;
}

function expressionAriaLabel(value: string) {
  const fraction = /^(.+)\/(.+)$/u.exec(value);
  return fraction ? `${fraction[1]} podzielone przez ${fraction[2]}` : value;
}

function AlgebraExpression({ value }: { value: string }) {
  const fraction = /^(.+)\/(.+)$/u.exec(value);
  if (!fraction) return <>{value}</>;
  return <span className="inline-flex min-w-10 flex-col items-stretch align-middle leading-none" aria-hidden="true">
    <span className="border-b-2 border-current px-1 pb-1 text-center">{fraction[1]}</span>
    <span className="px-1 pt-1 text-center">{fraction[2]}</span>
  </span>;
}

function ExpressionLanguageGuide({ visual }: { visual: AlgebraTask["visual"] }) {
  if (visual === "relationship") {
    return <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Informacja pomocnicza">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-800">Informacja</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">O ile?</p>
          <p className="mt-1 font-black text-slate-900">większa: dodaj · mniejsza: odejmij</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-violet-700">Ile razy?</p>
          <p className="mt-1 font-black text-slate-900">większa: pomnóż · mniejsza: podziel</p>
        </div>
      </div>
    </section>;
  }
  if (visual === "operation-words") {
    return <section className="rounded-3xl border-2 border-violet-200 bg-violet-50 p-4" aria-label="Informacja pomocnicza">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-violet-800">Informacja</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {["suma → dodawanie", "różnica → odejmowanie", "iloczyn → mnożenie", "iloraz → dzielenie"].map((label) => <p key={label} className="rounded-xl bg-white px-3 py-3 text-center text-sm font-black text-violet-950 shadow-sm">{label}</p>)}
      </div>
    </section>;
  }
  return null;
}

function AlgebraExpressionKeypad({ disabled, onKey }: { disabled: boolean; onKey: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x", "+", "−", "·", ":", "(", ")"];
  return <section className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg" aria-label="Klawiatura do zapisu wyrażenia" data-algebra-expression-keypad>
    <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-200">Klawiatura do zapisu wyrażenia</p>
    <div className="grid grid-cols-5 gap-2">
      {keys.map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onKey(key)} className={`min-h-12 rounded-xl text-xl font-black shadow disabled:opacity-35 ${key === "x" ? "bg-violet-300 text-violet-950" : ["+", "−", "·", ":"].includes(key) ? "bg-cyan-200 text-cyan-950" : "bg-white text-slate-950"}`}>{key}</button>)}
      <button type="button" disabled={disabled} onClick={() => onKey("backspace")} className="col-span-3 min-h-12 rounded-xl bg-rose-300 px-3 font-black text-rose-950 disabled:opacity-35">← Usuń</button>
    </div>
  </section>;
}

function SubstitutionSlider({ task, substituted, disabled, onChange }: { task: AlgebraTask; substituted: boolean; disabled: boolean; onChange: (substituted: boolean) => void }) {
  return <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5" aria-label="Suwak podstawienia liczby za x" data-substitution-slider>
    <p className="text-center text-xs font-black uppercase tracking-[.16em] text-amber-700">Krok 1 · Podstaw liczbę</p>
    <div className="mt-3 grid gap-3 text-center sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className={`rounded-2xl p-4 ${substituted ? "bg-white text-slate-500" : "bg-violet-700 text-white ring-4 ring-violet-200"}`}><p className="text-xs font-black uppercase tracking-wider">Wyrażenie</p><p className="mt-1 font-mono text-3xl font-black">{task.sourceExpression}</p></div>
      <span className="text-3xl font-black text-amber-700">→</span>
      <div className={`rounded-2xl p-4 ${substituted ? "bg-emerald-200 text-emerald-950 ring-4 ring-emerald-100" : "bg-white text-slate-500"}`}><p className="text-xs font-black uppercase tracking-wider">Po podstawieniu x = {task.xValue}</p><p className="mt-1 font-mono text-3xl font-black">{substituted ? task.expression : "?"}</p></div>
    </div>
    <div className="mx-auto mt-5 max-w-xl">
      <div className="flex items-center justify-between text-sm font-black text-slate-800"><span>x</span><span>{task.xValue}</span></div>
      <input type="range" min="0" max="1" step="1" value={substituted ? 1 : 0} disabled={disabled} onChange={(event) => onChange(event.currentTarget.value === "1")} aria-label={`Zamień x na ${task.xValue}`} className="mt-1 h-4 w-full cursor-pointer accent-violet-700 disabled:cursor-not-allowed disabled:opacity-50" />
      <p className="mt-3 text-center font-black text-amber-950">{substituted ? `Każde x zostało zastąpione liczbą ${task.xValue}. Teraz oblicz wartość.` : `Przesuń suwak z x na ${task.xValue}.`}</p>
    </div>
  </section>;
}

function TaskVisual({ task, machineProgress = 1 }: { task: AlgebraTask; machineProgress?: number }) {
  if (task.visual === "relationship" || task.visual === "operation-words") return <ExpressionLanguageGuide visual={task.visual} />;
  if (task.visual === "word-problem") return <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Dane z zadania">
    <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-800">Dane</p>
    <div className="grid gap-2 sm:grid-cols-2">{task.facts?.map((fact) => <p key={fact} className="rounded-xl bg-white px-4 py-3 text-center font-black text-slate-900 shadow-sm">{fact}</p>)}</div>
  </section>;
  if (task.visual === "balance") return <AlgebraBalanceScene3D leftX={task.leftX ?? 1} leftUnits={task.leftUnits ?? 0} rightX={task.rightX ?? 0} rightUnits={task.rightUnits ?? ((task.xValue ?? 5) + (task.leftUnits ?? 0))} xValue={task.xValue ?? 5} revealValue={task.prompt.includes("Czy x =")} />;
  if (task.visual === "machine") return <AlgebraMachineScene3D input={task.xValue ?? 4} progress={machineProgress} labels={["Wyrażenie z x", `Wstaw ${task.xValue ?? 4} za x`, "Oblicz działania", "Wpisz wynik"]} stepValues={[task.sourceExpression ?? `x = ${task.xValue ?? 4}`, `x = ${task.xValue ?? 4}`, task.expression ?? "oblicz", "?"]} />;
  if (task.visual === "tiles") return <AlgebraTilesScene3D xCount={Math.max(1, task.leftX ?? task.rightX ?? 3)} unitCount={task.leftUnits ?? 0} />;
  if (task.visual === "story") return <StoryMap />;
  return <section className="rounded-3xl bg-gradient-to-br from-violet-100 via-white to-cyan-100 p-6"><MysteryBoxCard value={task.xValue ?? 5} open={false} /></section>;
}

function TaskCard({ task, topicNumber, questionNumber, questionCount, readOnly, onResultChange }: { task: AlgebraTask; topicNumber: number; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: AlgebraLessonLabProps["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [substituted, setSubstituted] = useState(false);
  const isEvaluationTask = task.kind === "numeric" && task.visual === "machine" && Boolean(task.sourceExpression);
  const orderedOptions = useMemo(() => {
    if (task.kind !== "choice") return [];
    const offset = Array.from(task.id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % task.options.length;
    return [...task.options.slice(offset), ...task.options.slice(0, offset)];
  }, [task]);

  const choose = (value: string) => {
    if (readOnly || correct !== null) return;
    setAnswer(value);
    setFeedback(null);
    onResultChange?.(null);
  };
  const key = (value: string) => {
    if (readOnly || correct !== null || task.kind !== "numeric" || (isEvaluationTask && !substituted)) return;
    setAnswer((current) => value === "backspace" ? current.slice(0, -1) : current.length < 5 ? `${current}${value}` : current);
    setFeedback(null);
    onResultChange?.(null);
  };
  const expressionKey = (value: string) => {
    if (readOnly || correct !== null || task.kind !== "written") return;
    setAnswer((current) => value === "backspace" ? current.slice(0, -1) : current.length < 18 ? `${current}${value}` : current);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (isEvaluationTask && !substituted) {
      setFeedback(`Najpierw przesuń suwak i zamień x na ${task.xValue}.`);
      setCorrect(null);
      onResultChange?.(null);
      return;
    }
    if (!answer) {
      setFeedback("Uzupełnij odpowiedź, zanim ją sprawdzisz.");
      setCorrect(null);
      onResultChange?.(null);
      return;
    }
    const normalizeExpression = (value: string) => value.replace(/\s+/gu, "").replace(/-/gu, "−").toLowerCase();
    const isCorrect = task.kind === "choice" ? answer === task.answer : task.kind === "written" ? normalizeExpression(answer) === normalizeExpression(task.answer) : Number(answer) === task.answer;
    setCorrect(isCorrect);
    const expected = task.kind === "choice" ? expressionAriaLabel(task.answer) : task.kind === "written" ? task.answer.replace(/([+−])/gu, " $1 ") : `${task.answer}${task.suffix ? ` ${task.suffix}` : ""}`;
    setFeedback(isCorrect ? `Brawo! ${task.explanation}` : `Spróbuj innym razem. Poprawny wynik to ${expected}. Dziś bez punktu. ${task.explanation}`);
    onResultChange?.(isCorrect, answer);
  };

  const isLanguageTask = task.visual === "relationship" || task.visual === "operation-words" || task.visual === "word-problem";
  const hasProminentPrompt = isLanguageTask || isEvaluationTask;

  return <LessonTaskFrame eyebrow={`Dział 8 · Temat ${topicNumber}`} heading={task.visual === "story" ? "Algebraiczny detektyw" : task.visual === "balance" ? "Laboratorium równowagi" : task.visual === "machine" ? "Oblicz wartość wyrażenia" : task.visual === "tiles" ? "Klocki algebraiczne" : task.visual === "word-problem" ? "Zapisz wyrażenie do treści" : isLanguageTask ? "Zapisz wyrażenie" : "Poznaj język algebry"} description={hasProminentPrompt ? undefined : task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-algebra-task>
    <div className="space-y-5">
      {hasProminentPrompt ? <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 px-5 py-6 text-center shadow-md" data-algebra-task-prompt>
        <p className="text-xs font-black uppercase tracking-[.18em] text-amber-700">Treść zadania</p>
        <p className="mt-2 text-2xl font-black leading-snug text-slate-950 sm:text-3xl">{task.prompt}</p>
      </section> : null}
      {isEvaluationTask ? <SubstitutionSlider task={task} substituted={substituted} disabled={readOnly || correct !== null} onChange={(next) => { setSubstituted(next); setAnswer(""); setFeedback(null); onResultChange?.(null); }} /> : null}
      <TaskVisual task={task} machineProgress={isEvaluationTask ? substituted ? 2 : 0 : 1} />
      {task.expression && !isEvaluationTask ? <p className="rounded-2xl bg-amber-100 px-5 py-4 text-center font-mono text-3xl font-black text-amber-950">{task.expression}</p> : null}
      {task.kind === "choice" ? <div className={`grid gap-3 ${orderedOptions.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`} role="group" aria-label="Wybierz odpowiedź">
        {orderedOptions.map((option) => <LessonTaskChoice key={option} aria-label={expressionAriaLabel(option)} selected={answer === option} disabled={readOnly || correct !== null} onClick={() => choose(option)} className="min-h-16 whitespace-nowrap text-base"><AlgebraExpression value={option} /></LessonTaskChoice>)}
      </div> : task.kind === "written" ? <div className="mx-auto max-w-2xl space-y-4">
        <label className={`block rounded-3xl border-4 bg-white p-4 text-center ${answer ? "border-violet-500" : "border-slate-200"}`}>
          <span className="block text-sm font-black uppercase tracking-[.14em] text-violet-700">Twoje wyrażenie</span>
          <input aria-label="Zapis wyrażenia algebraicznego" inputMode="none" readOnly value={answer} className="mt-3 h-16 w-full rounded-2xl border-2 border-violet-300 bg-white px-4 text-center font-mono text-3xl font-black text-slate-950 outline-none" />
        </label>
        <AlgebraExpressionKeypad disabled={readOnly || correct !== null} onKey={expressionKey} />
      </div> : <div className="mx-auto max-w-xl space-y-4">
        <label className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl border-4 bg-white p-4 font-black ${answer ? "border-violet-500" : "border-slate-200"}`}>
          <span>Wartość odpowiedzi:</span>
          <input aria-label="Wartość odpowiedzi" inputMode="none" readOnly disabled={isEvaluationTask && !substituted} value={answer} onFocus={() => undefined} className="h-14 w-32 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none disabled:bg-slate-100 disabled:text-slate-400" />
          {task.suffix ? <span className="text-2xl">{task.suffix}</span> : null}
        </label>
        <LessonNumericKeypad onKey={key} disabled={readOnly || correct !== null || (isEvaluationTask && !substituted)} label="Klawiatura odpowiedzi" />
      </div>}
      {!readOnly && correct === null ? <button type="button" onClick={check} className="min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white shadow-lg">Sprawdź odpowiedź</button> : null}
      {feedback ? <p role="status" className={`rounded-2xl px-5 py-4 text-center font-black leading-relaxed ${correct ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
    </div>
  </LessonTaskFrame>;
}

export function AlgebraLessonLab({ activity, seed = 1, taskSeed, topicNumber = 1, questionNumber, questionCount, readOnly = false, onResultChange }: AlgebraLessonLabProps) {
  if (activity === "meet-x") return <MeetXDemo readOnly={readOnly} />;
  if (activity === "same-x") return <SameXDemo readOnly={readOnly} />;
  if (activity === "substitution-machine") return <MachineDemo readOnly={readOnly} />;
  if (activity === "equation-meaning") return <EquationMeaningDemo readOnly={readOnly} />;
  const task = generateAlgebraTask(activity, taskSeed ?? seed);
  if (!task) return null;
  return <TaskCard task={task} topicNumber={topicNumber} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
