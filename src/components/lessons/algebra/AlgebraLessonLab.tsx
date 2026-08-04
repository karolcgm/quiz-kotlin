"use client";

import Image from "next/image";
import { Fragment, useMemo, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { AlgebraBalanceScene3D, AlgebraMachineScene3D, AlgebraTilesScene3D } from "@/components/lessons/algebra/AlgebraScenes3D";
import { generateAlgebraTask, type AlgebraActivity, type AlgebraBalanceBuildTask, type AlgebraTask } from "@/lib/math/algebra/grade6Algebra";
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

type StandardAlgebraTask = Exclude<AlgebraTask, { kind: "balance-builder" }>;

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
        <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black text-violet-950 sm:text-3xl">{values[step]}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" disabled={readOnly || step === 0} onClick={() => setStep((current) => current - 1)} className="min-h-12 rounded-xl border-2 border-violet-300 bg-white px-5 font-black text-violet-950 disabled:opacity-40">← Poprzedni krok</button>
        <button type="button" disabled={readOnly || step === 3} onClick={() => setStep((current) => current + 1)} className="min-h-12 rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">Następny krok →</button>
        <button type="button" disabled={readOnly} onClick={() => { setInput((current) => current === 7 ? 2 : current + 1); setStep(0); }} className="min-h-12 rounded-xl bg-cyan-700 px-5 font-black text-white disabled:opacity-40">Zmień wartość x</button>
      </div>
    </div>
  </LessonTaskFrame>;
}

function ScalePan({ xCount, units, side }: { xCount: number; units: number; side: "lewa" | "prawa" }) {
  return <div className="flex min-h-24 flex-wrap items-end justify-center gap-2 rounded-b-[2.5rem] border-4 border-slate-400 border-t-slate-600 bg-gradient-to-b from-white to-slate-100 px-4 pb-4 pt-3 shadow-lg" aria-label={`${side} szalka: ${xCount ? `${xCount} razy x` : "bez x"}${units ? ` oraz ${units}` : ""}`} data-scale-pan={side}>
    {Array.from({ length: xCount }, (_, index) => <span key={index} className="grid h-14 w-14 place-items-center rounded-xl border-4 border-violet-500 bg-violet-200 text-3xl font-black text-violet-950 shadow" data-scale-x>x</span>)}
    {units > 0 ? <span className="grid h-14 min-w-14 place-items-center rounded-full border-4 border-cyan-600 bg-cyan-200 px-3 text-2xl font-black text-cyan-950 shadow" data-scale-number>{units}</span> : null}
    {xCount === 0 && units === 0 ? <span className="font-bold text-slate-400">pusta</span> : null}
  </div>;
}

function EquationScaleDiagram({ leftX = 0, leftUnits = 0, rightX = 0, rightUnits = 0, equation, showEquality = false }: { leftX?: number; leftUnits?: number; rightX?: number; rightUnits?: number; equation?: string; showEquality?: boolean }) {
  return <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-b from-sky-50 to-indigo-100 p-4" aria-label="Waga przedstawiająca równanie" data-equation-scale>
    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
      <ScalePan xCount={leftX} units={leftUnits} side="lewa" />
      <span className="pb-7 text-4xl font-black text-indigo-900">=</span>
      <ScalePan xCount={rightX} units={rightUnits} side="prawa" />
    </div>
    <div className="mx-8 h-2 rounded-full bg-slate-700 shadow" />
    <div className="mx-auto h-0 w-0 border-x-[28px] border-b-[58px] border-x-transparent border-b-slate-500" />
    {showEquality ? <p className="mx-auto -mt-1 max-w-2xl rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">To jest równanie, ponieważ obie strony wagi mają taką samą wartość.</p> : null}
    {equation ? <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-center font-mono text-3xl font-black text-indigo-950 shadow-sm"><AlgebraMathText value={equation} /></p> : null}
  </section>;
}

function EquationMeaningDemo({ readOnly }: { readOnly: boolean }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const examples = [
    { leftX: 1, leftUnits: 3, rightX: 0, rightUnits: 8, equation: "x + 3 = 8", description: "Na lewej szalce są x i 3, a na prawej 8." },
    { leftX: 2, leftUnits: 0, rightX: 0, rightUnits: 12, equation: "2x = 12", description: "Dwa jednakowe x równoważą liczbę 12." },
    { leftX: 0, leftUnits: 18, rightX: 2, rightUnits: 0, equation: "18 = 2x", description: "Liczba 18 ma taką samą wartość jak dwa x." },
  ];
  const example = examples[exampleIndex]!;
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 4" heading="Równanie to równe szalki" description="Równanie mówi, że wyrażenie po lewej stronie ma taką samą wartość jak wyrażenie po prawej stronie.">
    <div className="space-y-5">
      <p className="rounded-2xl bg-cyan-50 px-5 py-4 text-center text-lg font-black text-cyan-950">{example.description}</p>
      <EquationScaleDiagram {...example} showEquality />
      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((item, index) => <button key={item.equation} type="button" disabled={readOnly} onClick={() => setExampleIndex(index)} className={`min-h-12 rounded-xl px-5 font-black ${index === exampleIndex ? "bg-violet-700 text-white ring-4 ring-violet-200" : "border-2 border-violet-300 bg-white text-violet-950"}`}>Waga {index + 1}</button>)}
      </div>
    </div>
  </LessonTaskFrame>;
}

function SolutionMeaningDemo({ readOnly }: { readOnly: boolean }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const examples = [
    { equation: "x + 3 = 8", candidate: "5", leftAfter: "5 + 3", leftValue: "8", rightValue: "8", satisfies: true },
    { equation: "3x = 15", candidate: "4", leftAfter: "3 · 4", leftValue: "12", rightValue: "15", satisfies: false },
  ];
  const example = examples[exampleIndex]!;
  return <LessonTaskFrame eyebrow="Dział 8 · Temat 5" heading="Co znaczy: liczba spełnia równanie?" description="Liczba spełnia równanie, jeśli po podstawieniu jej za x lewa i prawa strona mają taką samą wartość.">
    <div className="space-y-5">
      <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5 text-center" aria-label="Równanie i sprawdzana liczba">
        <p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">Sprawdzamy</p>
        <p className="mt-2 font-mono text-3xl font-black text-amber-950 sm:text-4xl"><AlgebraMathText value={example.equation} /></p>
        <p className="mt-3 inline-flex rounded-2xl bg-white px-5 py-3 font-mono text-2xl font-black text-violet-950 shadow">x = {example.candidate}</p>
      </section>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <section className="rounded-3xl border-2 border-violet-300 bg-violet-50 p-5 text-center" aria-label="Obliczenie lewej strony">
          <p className="text-xs font-black uppercase tracking-wider text-violet-700">Lewa strona po podstawieniu</p>
          <p className="mt-3 whitespace-nowrap font-mono text-2xl font-black text-violet-950"><AlgebraMathText value={`${example.leftAfter} = ${example.leftValue}`} /></p>
        </section>
        <span className="grid place-items-center text-4xl font-black text-slate-700">{example.satisfies ? "=" : "≠"}</span>
        <section className="rounded-3xl border-2 border-cyan-300 bg-cyan-50 p-5 text-center" aria-label="Wartość prawej strony">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-700">Prawa strona</p>
          <p className="mt-3 font-mono text-2xl font-black text-cyan-950">{example.rightValue}</p>
        </section>
      </div>
      <p className={`rounded-2xl px-5 py-4 text-center text-lg font-black ${example.satisfies ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>Liczba {example.candidate} {example.satisfies ? "spełnia to równanie" : "nie spełnia tego równania"}.</p>
      <div className="flex flex-wrap justify-center gap-3">
        {examples.map((item, index) => <button key={item.candidate} type="button" disabled={readOnly} onClick={() => setExampleIndex(index)} className={`min-h-12 rounded-xl px-5 font-black ${index === exampleIndex ? "bg-violet-700 text-white ring-4 ring-violet-200" : "border-2 border-violet-300 bg-white text-violet-950"}`}>{index === 0 ? "Przykład: spełnia" : "Przykład: nie spełnia"}</button>)}
      </div>
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
  return value.replace(/([-−]?)(\d*x|\d+|x)\/([-−]?(?:\d+|x))/gu, (_fraction, sign: string, numerator: string, denominator: string) => `${sign ? "minus " : ""}${numerator} podzielone przez ${denominator.startsWith("−") || denominator.startsWith("-") ? `minus ${denominator.slice(1)}` : denominator}`);
}

function AlgebraMathText({ value }: { value: string }) {
  return <>{value.split(/([-−]?(?:\d*x|\d+|x)\/[-−]?(?:\d+|x))/gu).map((part, index) => {
    const fraction = /^([-−]?)(\d*x|\d+|x)\/([-−]?(?:\d+|x))$/u.exec(part);
    if (!fraction) return <span key={`${part}-${index}`}>{part}</span>;
    return <span key={`${part}-${index}`} className="inline-flex items-center whitespace-nowrap align-middle" aria-label={expressionAriaLabel(part)}>
      {fraction[1] ? <span aria-hidden="true">−</span> : null}
      <span className="inline-flex min-w-8 flex-col items-stretch leading-none" aria-hidden="true">
        <span className="border-b-2 border-current px-1 pb-0.5 text-center">{fraction[2]}</span>
        <span className="px-1 pt-0.5 text-center">{fraction[3]}</span>
      </span>
    </span>;
  })}</>;
}

function AlgebraExpression({ value }: { value: string }) {
  return <AlgebraMathText value={value} />;
}

function EvaluationPrompt({ prompt }: { prompt: string }) {
  const assignment = /^(.*)\s(dla x = )(.+?)(\.)$/u.exec(prompt);
  if (!assignment) return <AlgebraMathText value={prompt} />;
  return <><AlgebraMathText value={assignment[1]} />{" "}<span className="whitespace-nowrap" data-evaluation-assignment>{assignment[2]}<AlgebraMathText value={assignment[3]} />{assignment[4]}</span></>;
}

function SimplificationPrompt({ expression }: { expression: string }) {
  return <div className="space-y-3">
    <p className="text-xl font-black text-slate-950 sm:text-2xl">Uprość wyrażenie:</p>
    <div className="overflow-x-auto pb-1" data-simplification-expression>
      <p className="inline-flex min-h-16 min-w-full items-center justify-center whitespace-nowrap px-2 py-1 font-mono text-3xl font-black text-violet-950 sm:text-4xl"><AlgebraMathText value={expression} /></p>
    </div>
    <p className="text-base font-bold text-slate-700 sm:text-lg">Wpisz całe uproszczone wyrażenie.</p>
  </div>;
}

function FlowerIcon() {
  return <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0 drop-shadow-sm" aria-hidden="true" data-flower-token>
    <circle cx="20" cy="9" r="7" fill="#c084fc" />
    <circle cx="31" cy="17" r="7" fill="#a855f7" />
    <circle cx="27" cy="30" r="7" fill="#8b5cf6" />
    <circle cx="13" cy="30" r="7" fill="#7c3aed" />
    <circle cx="9" cy="17" r="7" fill="#d8b4fe" />
    <circle cx="20" cy="20" r="7" fill="#facc15" stroke="#854d0e" strokeWidth="1.5" />
  </svg>;
}

function NumberDot() {
  return <span className="h-7 w-7 shrink-0 rounded-full border-2 border-cyan-700 bg-cyan-300 shadow-sm" aria-hidden="true" data-number-token />;
}

function GraphicGroup({ kind, count, label }: { kind: "flower" | "number"; count: number; label: string }) {
  return <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center shadow-sm" role="img" aria-label={label}>
    <div className="flex min-h-12 flex-wrap items-center justify-center gap-1.5">{Array.from({ length: count }, (_, index) => kind === "flower" ? <FlowerIcon key={index} /> : <NumberDot key={index} />)}</div>
    <p className="mt-2 whitespace-nowrap font-mono text-xl font-black text-slate-950">{label}</p>
  </div>;
}

function LikeTermsFlowerGuide({ taskId }: { taskId: string }) {
  const variants: Record<string, { groups: Array<{ kind: "flower" | "number"; count: number; label: string }>; separator: string; note: string }> = {
    l1: { groups: [{ kind: "flower", count: 3, label: "3x" }, { kind: "flower", count: 5, label: "5x" }], separator: "i", note: "Oba wyrazy mają ten sam symbol x — tak jak obie grupy zawierają kwiatki." },
    l2: { groups: [{ kind: "flower", count: 2, label: "2x" }, { kind: "flower", count: 4, label: "4x" }], separator: "+", note: "Kwiatki łączymy z kwiatkami, dlatego wyrazy z x możemy zebrać w jedną grupę." },
    l3: { groups: [{ kind: "flower", count: 2, label: "2x" }, { kind: "number", count: 3, label: "3" }], separator: "+", note: "Kwiatki i zwykłe liczby to dwa różne rodzaje. Zostają w osobnych grupach." },
    l4: { groups: [{ kind: "flower", count: 1, label: "x" }, { kind: "flower", count: 1, label: "x" }, { kind: "number", count: 4, label: "4" }, { kind: "number", count: 2, label: "2" }], separator: "+", note: "Najpierw łączymy dwa x, a osobno liczby 4 i 2." },
  };
  const variant = variants[taskId] ?? variants.l1!;
  return <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-4" aria-label="Graficzny przykład wyrazów podobnych" data-like-terms-flowers={taskId}>
    <p className="text-center text-xs font-black uppercase tracking-[.16em] text-violet-700">Najpierw prosty przykład</p>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white p-3 text-2xl font-black text-violet-950 shadow-sm">
      <FlowerIcon /><span>+</span><FlowerIcon /><span>=</span><FlowerIcon /><FlowerIcon />
    </div>
    <p className="mt-2 text-center text-lg font-black text-violet-950">kwiatek + kwiatek = 2 kwiatki</p>
    <p className="mt-1 text-center font-bold text-slate-700">W algebrze robimy podobnie: wyrazy z x łączymy z innymi wyrazami z x.</p>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2" data-current-like-terms-example>
      {variant.groups.map((group, index) => <Fragment key={`${group.label}-${index}`}>
        {index > 0 ? <span className="px-1 text-2xl font-black text-violet-700">{variant.separator}</span> : null}
        <GraphicGroup {...group} />
      </Fragment>)}
    </div>
    <p className="mt-4 rounded-2xl bg-violet-100 px-4 py-3 text-center font-black text-violet-950">{variant.note}</p>
  </section>;
}

function normalizeExpression(value: string) {
  return value.replace(/\s+/gu, "").replace(/-/gu, "−").toLowerCase();
}

function ExpressionLanguageGuide({ visual }: { visual: AlgebraTask["visual"] }) {
  if (visual === "solution-check") {
    return <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Sposób sprawdzania liczby">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-800">Jak znaleźć właściwą liczbę?</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <p className="rounded-xl bg-white px-3 py-3 text-center font-black text-slate-900 shadow-sm"><span className="block text-violet-700">1. Podstaw</span>Wstaw wybraną liczbę za x.</p>
        <p className="rounded-xl bg-white px-3 py-3 text-center font-black text-slate-900 shadow-sm"><span className="block text-violet-700">2. Oblicz</span>Oblicz lewą i prawą stronę.</p>
        <p className="rounded-xl bg-white px-3 py-3 text-center font-black text-slate-900 shadow-sm"><span className="block text-violet-700">3. Porównaj</span>Wybierz liczbę, dla której strony są równe.</p>
      </div>
    </section>;
  }
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
  if (visual === "simplify-work") {
    return <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Zasady upraszczania wyrażeń">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-800">Jak upraszczamy?</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <p className="rounded-xl bg-white px-3 py-3 text-center text-sm font-black text-slate-900 shadow-sm"><span className="block text-violet-700">Dodawanie i odejmowanie</span>Łącz tylko wyrazy z taką samą literą.</p>
        <p className="rounded-xl bg-white px-3 py-3 text-center text-sm font-black text-slate-900 shadow-sm"><span className="block text-violet-700">Mnożenie i dzielenie</span>Wykonaj działanie na liczbach stojących przy x.</p>
        <p className="rounded-xl bg-white px-3 py-3 text-center text-sm font-black text-slate-900 shadow-sm"><span className="block text-violet-700">Kilka działań</span>Najpierw mnożenie i dzielenie, potem dodawanie i odejmowanie.</p>
      </div>
    </section>;
  }
  return null;
}

function AlgebraExpressionKeypad({ disabled, onKey }: { disabled: boolean; onKey: (key: string) => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "x", "+", "−", "·", ":", "=", "(", ")"];
  return <section className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg" aria-label="Klawiatura do zapisu wyrażenia" data-algebra-expression-keypad>
    <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-200">Klawiatura do zapisu wyrażenia</p>
    <div className="grid grid-cols-5 gap-2">
      {keys.map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onKey(key)} className={`min-h-12 rounded-xl text-xl font-black shadow disabled:opacity-35 ${key === "x" ? "bg-violet-300 text-violet-950" : ["+", "−", "·", ":", "="].includes(key) ? "bg-cyan-200 text-cyan-950" : "bg-white text-slate-950"}`}>{key}</button>)}
      <button type="button" disabled={disabled} onClick={() => onKey("backspace")} className="col-span-3 min-h-12 rounded-xl bg-rose-300 px-3 font-black text-rose-950 disabled:opacity-35">← Usuń</button>
    </div>
  </section>;
}

function substitutionChoices(task: AlgebraTask) {
  const xDisplay = task.xDisplay ?? String(task.xValue);
  const fraction = /^(\d+)\/(\d+)$/u.exec(xDisplay);
  const negative = /^−(\d+)$/u.exec(xDisplay);
  const choices = fraction
    ? [`${fraction[2]}/${fraction[1]}`, xDisplay, `${fraction[1]}/${Number(fraction[2]) + 1}`]
    : negative
      ? [`−${Number(negative[1]) + 1}`, xDisplay, negative[1]]
      : [String(Math.max(0, Number(xDisplay) - 1)), xDisplay, String(Number(xDisplay) + 1)];
  const offset = Array.from(task.id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % choices.length;
  return [...choices.slice(offset), ...choices.slice(0, offset)];
}

function SubstitutionWorkbench({ task, substituted, disabled, onChange, onInteraction }: { task: AlgebraTask; substituted: boolean; disabled: boolean; onChange: (substituted: boolean) => void; onInteraction: () => void }) {
  const [xSelected, setXSelected] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const xDisplay = task.xDisplay ?? String(task.xValue);
  const sourceParts = (task.sourceExpression ?? "x").split("x");
  const chooseValue = (value: string) => {
    if (disabled || substituted) return;
    onInteraction();
    if (value === xDisplay) {
      setHint(null);
      onChange(true);
      return;
    }
    setHint("Sprawdź jeszcze raz, jaką wartość x podano w treści zadania.");
  };
  return <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5" aria-label="Samodzielne podstawianie liczby za x" data-substitution-workbench>
    <p className="text-center text-xs font-black uppercase tracking-[.16em] text-amber-700">Krok 1 · Podstaw liczbę</p>
    <p className="mt-2 text-center font-black text-amber-950">Dotknij x w wyrażeniu, a następnie wybierz liczbę, którą wstawisz w jego miejsce.</p>
    <div className="mt-3 grid gap-3 text-center sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className={`rounded-2xl p-4 ${substituted ? "bg-white text-slate-500" : "bg-violet-700 text-white ring-4 ring-violet-200"}`}><p className="text-xs font-black uppercase tracking-wider">Wyrażenie</p><p className="mt-2 flex min-h-12 items-center justify-center whitespace-nowrap font-mono text-3xl font-black">{sourceParts.map((part, index) => <Fragment key={`${part}-${index}`}><AlgebraMathText value={part} />{index < sourceParts.length - 1 ? <button type="button" disabled={disabled || substituted} onClick={() => { onInteraction(); setXSelected(true); setHint(null); }} aria-label="Wybierz x do zastąpienia" className={`mx-1 inline-grid h-12 min-w-12 place-items-center rounded-xl border-2 transition ${xSelected ? "border-amber-200 bg-amber-300 text-amber-950 ring-4 ring-amber-200/60" : "border-white bg-white/15 text-white"}`}>x</button> : null}</Fragment>)}</p></div>
      <span className="text-3xl font-black text-amber-700">→</span>
      <div className={`rounded-2xl p-4 ${substituted ? "bg-emerald-200 text-emerald-950 ring-4 ring-emerald-100" : "bg-white text-slate-500"}`}><p className="text-xs font-black uppercase tracking-wider">Po podstawieniu <span className="whitespace-nowrap">x = <AlgebraMathText value={xDisplay} /></span></p><p className="mt-1 flex min-h-10 items-center justify-center font-mono font-black"><span className="inline-flex whitespace-nowrap text-lg sm:text-xl" data-substituted-expression>{substituted ? <AlgebraMathText value={task.expression ?? ""} /> : "?"}</span></p></div>
    </div>
    {!substituted ? <div className="mx-auto mt-5 max-w-xl rounded-2xl bg-white p-4 text-center shadow-sm">
      {!xSelected ? <p className="font-black text-slate-700">Najpierw dotknij wyróżnionego x w wyrażeniu.</p> : <><p className="mb-3 text-sm font-black uppercase tracking-wider text-violet-700">Wybierz liczbę do podstawienia</p><div className="grid grid-cols-3 gap-2" role="group" aria-label="Wybierz liczbę do podstawienia">{substitutionChoices(task).map((choice) => <button key={choice} type="button" disabled={disabled} onClick={() => chooseValue(choice)} aria-label={`Wstaw ${expressionAriaLabel(choice)} w miejsce x`} className="min-h-14 rounded-xl border-2 border-violet-300 bg-violet-50 px-2 text-xl font-black text-violet-950 shadow-sm disabled:opacity-40"><AlgebraMathText value={choice} /></button>)}</div></>}
      {hint ? <p role="status" className="mt-3 rounded-xl bg-amber-100 px-3 py-2 font-black text-amber-950">{hint}</p> : null}
    </div> : <p className="mt-4 text-center font-black text-emerald-950">Brawo, x zostało zastąpione liczbą <AlgebraMathText value={xDisplay} />. Teraz oblicz wartość.</p>}
  </section>;
}

function WrittenSubstitutionWorkbench({ task, substituted, disabled, onChange, onInteraction }: { task: AlgebraTask; substituted: boolean; disabled: boolean; onChange: (substituted: boolean) => void; onInteraction: () => void }) {
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  if (task.kind !== "numeric" || !task.substitutionAnswer) return null;
  const xDisplay = task.xDisplay ?? String(task.xValue);
  const expressionKey = (value: string) => {
    if (disabled || substituted) return;
    onInteraction();
    setDraft((current) => value === "backspace" ? current.slice(0, -1) : current.length < 28 ? `${current}${value}` : current);
    setHint(null);
  };
  const checkSubstitution = () => {
    onInteraction();
    if (!draft) {
      setHint("Wpisz całe działanie po podstawieniu x.");
      return;
    }
    if (normalizeExpression(draft) !== normalizeExpression(task.substitutionAnswer ?? "")) {
      setHint("Spróbuj jeszcze raz. Zastąp x podaną liczbą, zapisz mnożenie kropką, a liczbę ujemną umieść w nawiasie.");
      return;
    }
    setHint(null);
    onChange(true);
  };
  return <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 p-5" aria-label="Samodzielny zapis działania po podstawieniu" data-written-substitution-workbench>
    <p className="text-center text-xs font-black uppercase tracking-[.16em] text-amber-700">Krok 1 · Napisz działanie po podstawieniu</p>
    <p className="mt-2 text-center font-black text-amber-950">Zastąp każde x podaną liczbą. Gdy podstawiasz liczbę ujemną, zapisz ją w nawiasie.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center">
        <p className="text-xs font-black uppercase tracking-wider text-violet-700">Wyrażenie</p>
        <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black text-violet-950"><AlgebraMathText value={task.sourceExpression ?? ""} /></p>
      </div>
      <div className="rounded-2xl border-2 border-cyan-200 bg-white p-4 text-center">
        <p className="text-xs font-black uppercase tracking-wider text-cyan-700">Podstawiamy</p>
        <p className="mt-2 whitespace-nowrap font-mono text-2xl font-black text-cyan-950">x = <AlgebraMathText value={xDisplay} /></p>
      </div>
    </div>
    <div className="mx-auto mt-4 max-w-2xl space-y-4">
      <label className={`block rounded-3xl border-4 bg-white p-4 text-center ${draft ? "border-violet-500" : "border-slate-200"}`}>
        <span className="block text-sm font-black uppercase tracking-[.14em] text-violet-700">Działanie po podstawieniu x</span>
        <input aria-label="Działanie po podstawieniu x" inputMode="none" readOnly value={draft} className="mt-3 h-16 w-full rounded-2xl border-2 border-violet-300 bg-white px-3 text-center font-mono text-2xl font-black text-slate-950 outline-none sm:text-3xl" />
      </label>
      {!substituted ? <AlgebraExpressionKeypad disabled={disabled} onKey={expressionKey} /> : null}
      {!substituted ? <button type="button" disabled={disabled} onClick={checkSubstitution} className="min-h-14 w-full rounded-2xl bg-violet-700 px-5 text-lg font-black text-white shadow-lg disabled:opacity-40">Sprawdź podstawienie</button> : null}
      {hint ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">{hint}</p> : null}
      {substituted ? <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Podstawienie jest poprawne. Teraz oblicz wynik.</p> : null}
    </div>
  </section>;
}

function TaskVisual({ task, machineProgress = 1, machineResult }: { task: AlgebraTask; machineProgress?: number; machineResult?: string }) {
  if (task.visual === "like-terms") return <LikeTermsFlowerGuide taskId={task.id} />;
  if (task.visual === "relationship" || task.visual === "operation-words" || task.visual === "simplify-work" || task.visual === "solution-check") return <ExpressionLanguageGuide visual={task.visual} />;
  if (task.visual === "word-problem") return <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4" aria-label="Dane z zadania">
    <p className="mb-3 text-center text-xs font-black uppercase tracking-[.16em] text-cyan-800">Dane</p>
    <div className="grid gap-2 sm:grid-cols-2">{task.facts?.map((fact) => <p key={fact} className="rounded-xl bg-white px-4 py-3 text-center font-black text-slate-900 shadow-sm">{fact}</p>)}</div>
    {task.sought ? <div className="mt-3 rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center"><p className="text-xs font-black uppercase tracking-wider text-amber-700">Szukane</p><p className="mt-1 font-black text-amber-950">{task.sought}</p></div> : null}
  </section>;
  if (task.visual === "balance-equation") return <EquationScaleDiagram leftX={task.leftX ?? 0} leftUnits={task.leftUnits ?? 0} rightX={task.rightX ?? 0} rightUnits={task.rightUnits ?? 0} showEquality />;
  if (task.visual === "balance") return <AlgebraBalanceScene3D leftX={task.leftX ?? 1} leftUnits={task.leftUnits ?? 0} rightX={task.rightX ?? 0} rightUnits={task.rightUnits ?? ((task.xValue ?? 5) + (task.leftUnits ?? 0))} xValue={task.xValue ?? 5} revealValue={task.prompt.includes("Czy x =")} />;
  if (task.visual === "machine") {
    const xDisplay = task.xDisplay ?? String(task.xValue ?? 4);
    const calculation = task.kind === "numeric" && task.substitutionAnswer && machineProgress < 2 ? "Twoje działanie" : task.expression ?? "oblicz";
    const calculationSize = calculation.length > 14 ? "text-[.55rem] sm:text-[.65rem]" : calculation.length > 10 ? "text-[.625rem] sm:text-xs" : "text-xs sm:text-sm";
    return <AlgebraMachineScene3D input={task.xValue ?? 4} inputLabel={expressionAriaLabel(xDisplay)} progress={machineProgress} labels={["Wyrażenie z x", `Wstaw ${expressionAriaLabel(xDisplay)} za x`, "Oblicz działania", "Wpisz wynik"]} stepValues={[<AlgebraMathText key="source" value={task.sourceExpression ?? `x = ${xDisplay}`} />, <span key="value" className="whitespace-nowrap">x = <AlgebraMathText value={xDisplay} /></span>, <span key="calculation" className={`inline-flex whitespace-nowrap tracking-[-0.04em] ${calculationSize}`} data-machine-calculation><AlgebraMathText value={calculation} /></span>, machineResult === undefined ? "?" : <AlgebraMathText key="result" value={machineResult} />]} />;
  }
  if (task.visual === "tiles") return <AlgebraTilesScene3D xCount={Math.max(1, task.leftX ?? task.rightX ?? 3)} unitCount={task.leftUnits ?? 0} />;
  if (task.visual === "story") return <StoryMap />;
  return <section className="rounded-3xl bg-gradient-to-br from-violet-100 via-white to-cyan-100 p-6"><MysteryBoxCard value={task.xValue ?? 5} open={false} /></section>;
}

function BalanceBuilderControls({ side, xCount, units, numberOptions, disabled, onXChange, onUnitsChange }: { side: "lewej" | "prawej"; xCount: number; units: number; numberOptions: number[]; disabled: boolean; onXChange: (value: number) => void; onUnitsChange: (value: number) => void }) {
  return <section className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4" aria-label={`Elementy ${side} szalki`}>
    <p className="text-center font-black text-violet-950">{side === "lewej" ? "Lewa szalka" : "Prawa szalka"}</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button type="button" disabled={disabled || xCount >= 3} onClick={() => onXChange(xCount + 1)} className="min-h-12 rounded-xl bg-violet-700 px-3 font-black text-white disabled:opacity-40">Dodaj x</button>
      <button type="button" disabled={disabled || xCount === 0} onClick={() => onXChange(xCount - 1)} className="min-h-12 rounded-xl border-2 border-violet-300 bg-white px-3 font-black text-violet-950 disabled:opacity-40">Usuń x</button>
    </div>
    <p className="mb-2 mt-4 text-center text-xs font-black uppercase tracking-wider text-cyan-800">Wybierz odważnik liczbowy</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" disabled={disabled} onClick={() => onUnitsChange(0)} className={`min-h-11 rounded-xl px-4 font-black ${units === 0 ? "bg-cyan-700 text-white" : "border-2 border-cyan-300 bg-white text-cyan-950"}`}>bez liczby</button>
      {numberOptions.map((value) => <button key={value} type="button" disabled={disabled} onClick={() => onUnitsChange(value)} className={`min-h-11 min-w-12 rounded-xl px-3 font-black ${units === value ? "bg-cyan-700 text-white ring-4 ring-cyan-200" : "border-2 border-cyan-300 bg-white text-cyan-950"}`}>{value}</button>)}
    </div>
  </section>;
}

function BalanceBuilderTaskCard({ task, topicNumber, questionNumber, questionCount, readOnly, onResultChange }: { task: AlgebraBalanceBuildTask; topicNumber: number; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: AlgebraLessonLabProps["onResultChange"] }) {
  const [leftX, setLeftX] = useState(0);
  const [leftUnits, setLeftUnits] = useState(0);
  const [rightX, setRightX] = useState(0);
  const [rightUnits, setRightUnits] = useState(0);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const numberOptions = Array.from(new Set([task.targetLeftUnits, task.targetRightUnits, Math.max(1, Math.min(20, task.targetLeftUnits + 1))])).filter((value) => value > 0).sort((a, b) => a - b);
  const interacted = leftX + leftUnits + rightX + rightUnits > 0;
  const resetFeedback = () => { setFeedback(null); onResultChange?.(null); };
  const check = () => {
    if (!interacted) {
      setFeedback("Ułóż elementy na obu szalkach, zanim sprawdzisz wagę.");
      onResultChange?.(null);
      return;
    }
    const isCorrect = leftX === task.targetLeftX && leftUnits === task.targetLeftUnits && rightX === task.targetRightX && rightUnits === task.targetRightUnits;
    setCorrect(isCorrect);
    setFeedback(isCorrect ? `Brawo! ${task.explanation}` : `Spróbuj innym razem. Poprawny wynik to ${task.expression}. Dziś bez punktu. ${task.explanation}`);
    onResultChange?.(isCorrect, task.answer);
  };
  const disabled = readOnly || correct !== null;
  return <LessonTaskFrame eyebrow={`Dział 8 · Temat ${topicNumber}`} heading="Ułóż równanie na wadze" questionNumber={questionNumber} questionCount={questionCount} data-algebra-task>
    <div className="space-y-5">
      <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 px-5 py-6 text-center shadow-md" data-algebra-task-prompt>
        <p className="text-xs font-black uppercase tracking-[.18em] text-amber-700">Równanie do ułożenia</p>
        <p className="mt-3 whitespace-nowrap font-mono text-3xl font-black text-amber-950 sm:text-4xl"><AlgebraMathText value={task.expression ?? ""} /></p>
      </section>
      <EquationScaleDiagram leftX={leftX} leftUnits={leftUnits} rightX={rightX} rightUnits={rightUnits} showEquality={correct === true} />
      <div className="grid gap-3 lg:grid-cols-2">
        <BalanceBuilderControls side="lewej" xCount={leftX} units={leftUnits} numberOptions={numberOptions} disabled={disabled} onXChange={(value) => { resetFeedback(); setLeftX(value); }} onUnitsChange={(value) => { resetFeedback(); setLeftUnits(value); }} />
        <BalanceBuilderControls side="prawej" xCount={rightX} units={rightUnits} numberOptions={numberOptions} disabled={disabled} onXChange={(value) => { resetFeedback(); setRightX(value); }} onUnitsChange={(value) => { resetFeedback(); setRightUnits(value); }} />
      </div>
      {!readOnly && correct === null ? <button type="button" onClick={check} className="min-h-14 w-full rounded-2xl bg-indigo-700 px-5 text-lg font-black text-white shadow-lg">Sprawdź wagę</button> : null}
      {feedback ? <p role="status" className={`rounded-2xl px-5 py-4 text-center font-black leading-relaxed ${correct ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
    </div>
  </LessonTaskFrame>;
}

function TaskCard({ task, topicNumber, questionNumber, questionCount, readOnly, onResultChange }: { task: StandardAlgebraTask; topicNumber: number; questionNumber?: number; questionCount?: number; readOnly: boolean; onResultChange?: AlgebraLessonLabProps["onResultChange"] }) {
  const [answer, setAnswer] = useState("");
  const [meaningAnswer, setMeaningAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [substituted, setSubstituted] = useState(false);
  const isEvaluationTask = task.kind === "numeric" && task.visual === "machine" && Boolean(task.sourceExpression);
  const requiresWrittenSubstitution = isEvaluationTask && task.kind === "numeric" && Boolean(task.substitutionAnswer);
  const isStoryEquation = task.kind === "written" && Boolean(task.xMeaningAnswer);
  const isBasicEquation = task.kind === "written" && task.id.startsWith("be");
  const isEquationWriting = isStoryEquation || isBasicEquation || task.visual === "balance-equation";
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
    setAnswer((current) => value === "backspace" ? current.slice(0, -1) : value === "minus" ? current.startsWith("-") ? current.slice(1) : `-${current}` : current.length < 5 ? `${current}${value}` : current);
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
      setFeedback(requiresWrittenSubstitution ? "Najpierw wpisz i sprawdź całe działanie po podstawieniu x." : `Najpierw dotknij x i wstaw w jego miejsce liczbę ${expressionAriaLabel(task.xDisplay ?? String(task.xValue))}.`);
      setCorrect(null);
      onResultChange?.(null);
      return;
    }
    if (isStoryEquation && !meaningAnswer) {
      setFeedback("Najpierw wybierz, co oznacza x w tym zadaniu.");
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
    const writtenAnswers = task.kind === "written" ? [task.answer, ...(task.acceptedAnswers ?? [])].map(normalizeExpression) : [];
    const isCorrect = task.kind === "choice" ? answer === task.answer : task.kind === "written" ? writtenAnswers.includes(normalizeExpression(answer)) && (!task.xMeaningAnswer || meaningAnswer === task.xMeaningAnswer) : Number(answer) === task.answer;
    setCorrect(isCorrect);
    const expected = task.kind === "choice" ? expressionAriaLabel(task.answer) : task.kind === "written" ? task.answer.replace(/([+−])/gu, " $1 ") : `${task.answer}${task.suffix ? ` ${task.suffix}` : ""}`;
    setFeedback(isCorrect ? `Brawo! ${task.explanation}` : `Spróbuj innym razem. Poprawny wynik to ${expected}. Dziś bez punktu. ${task.explanation}`);
    onResultChange?.(isCorrect, isStoryEquation ? `${meaningAnswer} | ${answer}` : answer);
  };

  const isLanguageTask = task.visual === "relationship" || task.visual === "operation-words" || task.visual === "word-problem" || task.visual === "simplify-work" || task.visual === "like-terms" || task.visual === "balance-equation" || task.visual === "solution-check";
  const hasProminentPrompt = isLanguageTask || isEvaluationTask;

  return <LessonTaskFrame eyebrow={`Dział 8 · Temat ${topicNumber}`} heading={requiresWrittenSubstitution ? "Samodzielne podstawienie" : task.visual === "solution-check" ? "Wybierz liczbę spełniającą równanie" : task.visual === "story" ? "Algebraiczny detektyw" : task.visual === "balance" ? "Laboratorium równowagi" : task.visual === "balance-equation" ? "Zapisz równanie z wagi" : task.visual === "machine" ? "Oblicz wartość wyrażenia" : task.visual === "like-terms" ? "Wyrazy podobne" : task.visual === "tiles" ? "Klocki algebraiczne" : isStoryEquation ? "Zapisz równanie do treści" : task.visual === "word-problem" ? "Zapisz wyrażenie do treści" : task.visual === "simplify-work" ? "Uprość wyrażenie" : isBasicEquation ? "Zapisz równanie" : isLanguageTask ? "Zapisz wyrażenie" : "Poznaj język algebry"} description={hasProminentPrompt ? undefined : task.prompt} questionNumber={questionNumber} questionCount={questionCount} data-algebra-task>
    <div className="space-y-5">
      {hasProminentPrompt ? <section className="rounded-3xl border-4 border-amber-300 bg-amber-50 px-5 py-6 text-center shadow-md" data-algebra-task-prompt>
        <p className="text-xs font-black uppercase tracking-[.18em] text-amber-700">Treść zadania</p>
        <div className="mt-2 text-2xl font-black leading-snug text-slate-950 sm:text-3xl">{task.visual === "simplify-work" ? <SimplificationPrompt expression={task.sourceExpression ?? task.prompt} /> : isEvaluationTask ? <EvaluationPrompt prompt={task.prompt} /> : <AlgebraMathText value={task.prompt} />}</div>
      </section> : null}
      {requiresWrittenSubstitution ? <WrittenSubstitutionWorkbench task={task} substituted={substituted} disabled={readOnly || correct !== null} onInteraction={() => { setFeedback(null); onResultChange?.(null); }} onChange={(next) => { setSubstituted(next); setAnswer(""); setFeedback(null); onResultChange?.(null); }} /> : isEvaluationTask ? <SubstitutionWorkbench task={task} substituted={substituted} disabled={readOnly || correct !== null} onInteraction={() => { setFeedback(null); onResultChange?.(null); }} onChange={(next) => { setSubstituted(next); setAnswer(""); setFeedback(null); onResultChange?.(null); }} /> : null}
      <TaskVisual task={task} machineProgress={isEvaluationTask ? correct === true ? 3 : substituted ? 2 : 0 : 1} machineResult={isEvaluationTask && correct === true && task.kind === "numeric" ? String(task.answer) : undefined} />
      {task.expression && !isEvaluationTask ? <p className="rounded-2xl bg-amber-100 px-5 py-4 text-center font-mono text-3xl font-black text-amber-950"><AlgebraMathText value={task.expression} /></p> : null}
      {task.kind === "choice" ? <div className={`grid gap-3 ${orderedOptions.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`} role="group" aria-label="Wybierz odpowiedź">
        {orderedOptions.map((option) => <LessonTaskChoice key={option} aria-label={expressionAriaLabel(option)} selected={answer === option} disabled={readOnly || correct !== null} onClick={() => choose(option)} className="min-h-16 whitespace-nowrap text-base"><AlgebraExpression value={option} /></LessonTaskChoice>)}
      </div> : task.kind === "written" ? <div className="mx-auto max-w-2xl space-y-4">
        {isStoryEquation ? <fieldset className="rounded-3xl border-2 border-amber-300 bg-amber-50 p-4">
          <legend className="px-2 text-sm font-black uppercase tracking-[.12em] text-amber-800">Co oznacza x?</legend>
          <div className="mt-2 grid gap-2">{task.xMeaningOptions?.map((option) => <button key={option} type="button" disabled={readOnly || correct !== null} onClick={() => { setMeaningAnswer(option); setFeedback(null); onResultChange?.(null); }} className={`min-h-12 rounded-xl border-2 px-4 text-left font-black ${meaningAnswer === option ? "border-amber-600 bg-amber-200 text-amber-950 ring-4 ring-amber-100" : "border-amber-200 bg-white text-slate-800"}`}>x oznacza {option}</button>)}</div>
        </fieldset> : null}
        <label className={`block rounded-3xl border-4 bg-white p-4 text-center ${answer ? "border-violet-500" : "border-slate-200"}`}>
          <span className="block text-sm font-black uppercase tracking-[.14em] text-violet-700">{isEquationWriting ? "Twoje równanie" : "Twoje wyrażenie"}</span>
          <input aria-label={isEquationWriting ? "Zapis równania" : "Zapis wyrażenia algebraicznego"} inputMode="none" readOnly value={answer} className="mt-3 h-16 w-full rounded-2xl border-2 border-violet-300 bg-white px-4 text-center font-mono text-3xl font-black text-slate-950 outline-none" />
        </label>
        <AlgebraExpressionKeypad disabled={readOnly || correct !== null} onKey={expressionKey} />
      </div> : <div className="mx-auto max-w-xl space-y-4">
        <label className={`flex min-h-24 items-center justify-center gap-3 rounded-2xl border-4 bg-white p-4 font-black ${answer ? "border-violet-500" : "border-slate-200"}`}>
          <span>Wartość odpowiedzi:</span>
          <input aria-label="Wartość odpowiedzi" inputMode="none" readOnly disabled={isEvaluationTask && !substituted} value={answer} onFocus={() => undefined} className="h-14 w-32 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none disabled:bg-slate-100 disabled:text-slate-400" />
          {task.suffix ? <span className="text-2xl">{task.suffix}</span> : null}
        </label>
        <LessonNumericKeypad onKey={key} allowNegative disabled={readOnly || correct !== null || (isEvaluationTask && !substituted)} label="Klawiatura odpowiedzi" />
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
  if (activity === "solution-meaning") return <SolutionMeaningDemo readOnly={readOnly} />;
  const task = generateAlgebraTask(activity, taskSeed ?? seed);
  if (!task) return null;
  if (task.kind === "balance-builder") return <BalanceBuilderTaskCard task={task} topicNumber={topicNumber} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskCard task={task} topicNumber={topicNumber} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
