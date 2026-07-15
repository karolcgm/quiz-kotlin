"use client";

import { useEffect, useMemo, useState } from "react";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import {
  expectedFractionOperationsResult,
  fractionOperationsTasks,
  type FractionOperationsActivity,
  type FractionOperationsPhase,
  type FractionOperationsTask,
  type FractionOperationsTopic,
} from "@/lib/math/fractions/fractionOperationsLesson";
import { areEquivalentFractions, greatestCommonDivisor, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
import type { FractionStackValue, FractionValue } from "@/types/fractions";

interface Props {
  activity: FractionOperationsActivity;
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

const TOPIC_TITLES: Record<FractionOperationsTopic, string> = {
  "3.7": "Mnożenie ułamka przez liczbę naturalną",
  "3.8": "Obliczanie ułamka liczby naturalnej",
  "3.9": "Mnożenie ułamków",
  "3.10": "Dzielenie ułamków przez liczby naturalne",
  "3.11": "Dzielenie ułamków",
  "3.R": "Powtórzenie ułamków zwykłych",
  "3.S": "Sprawdzian — ułamki zwykłe",
};

function parseActivity(activity: FractionOperationsActivity): { topic: FractionOperationsTopic; phase: FractionOperationsPhase } {
  const match = activity.match(/^operations-(3\.(?:7|8|9|10|11|R|S))-(visual|reasoning|context|independent)$/u);
  if (!match) throw new Error(`Nieznana aktywność ułamkowa: ${activity}`);
  return { topic: match[1] as FractionOperationsTopic, phase: match[2] as FractionOperationsPhase };
}

function blankFraction(): FractionStackValue {
  return { numerator: [""], denominator: [""] };
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function sectorPath(index: number, count: number) {
  const start = polarPoint(120, 120, 94, index / count * 360);
  const end = polarPoint(120, 120, 94, (index + 1) / count * 360);
  const large = 360 / count > 180 ? 1 : 0;
  return `M 120 120 L ${start.x} ${start.y} A 94 94 0 ${large} 1 ${end.x} ${end.y} Z`;
}

function ClickablePizza({ value, onChange, readOnly }: { value: FractionValue; onChange: (value: FractionValue) => void; readOnly: boolean }) {
  return (
    <section className="rounded-3xl bg-amber-50 p-4 text-slate-950 shadow-inner" aria-label={`Interaktywna pizza: ${value.numerator}/${value.denominator}`}>
      <svg viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[270px] drop-shadow-xl" role="img" aria-label={`Pizza podzielona na ${value.denominator} części, zaznaczono ${value.numerator}`}>
        <circle cx="120" cy="120" r="108" fill="#b45309" />
        {Array.from({ length: value.denominator }, (_, index) => {
          const selected = index < value.numerator;
          return (
            <path
              key={index}
              d={sectorPath(index, value.denominator)}
              fill={selected ? "#fb923c" : "#fef3c7"}
              stroke="#7c2d12"
              strokeWidth="3"
              tabIndex={readOnly ? -1 : 0}
              role="button"
              aria-label={`${selected ? "Odznacz" : "Zaznacz"} kawałek ${index + 1}`}
              onClick={() => !readOnly && onChange({ ...value, numerator: selected ? index : index + 1 })}
              onKeyDown={(event) => {
                if (!readOnly && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  onChange({ ...value, numerator: selected ? index : index + 1 });
                }
              }}
              className="cursor-pointer transition hover:brightness-95 focus:outline-none focus-visible:stroke-cyan-600 focus-visible:stroke-[7px]"
            />
          );
        })}
        {Array.from({ length: Math.max(3, value.numerator * 2) }, (_, index) => (
          <circle key={index} cx={70 + index * 31 % 100} cy={67 + index * 47 % 105} r="5" fill="#b91c1c" opacity={index < value.numerator * 2 ? 1 : 0} />
        ))}
      </svg>
      {!readOnly ? <p className="mt-2 text-center text-sm font-black text-amber-950">Kliknij kawałek — model i ułamek zmienią się natychmiast.</p> : null}
    </section>
  );
}

function FractionBadge({ value, crossed = false }: { value: FractionValue; crossed?: boolean }) {
  return (
    <span className={`relative inline-grid min-w-16 justify-items-stretch rounded-xl bg-white px-3 py-2 text-center text-slate-950 shadow ${crossed ? "opacity-70" : ""}`} aria-label={`${value.numerator}/${value.denominator}`}>
      <b className="text-2xl">{value.numerator}</b><span className="h-0 border-t-[3px] border-slate-950" /><b className="text-2xl">{value.denominator}</b>
      {crossed ? <span aria-hidden className="absolute left-0 top-1/2 h-1 w-full -rotate-12 bg-rose-600" /> : null}
    </span>
  );
}

function GroupScene({ selectedGroups, onChange, readOnly }: { selectedGroups: number; onChange: (count: number) => void; readOnly: boolean }) {
  return (
    <div className="grid grid-cols-5 gap-3 rounded-3xl bg-emerald-50 p-4" aria-label="Pięć równych grup obiektów">
      {Array.from({ length: 5 }, (_, group) => {
        const selected = group < selectedGroups;
        return <button key={group} type="button" disabled={readOnly} aria-pressed={selected} onClick={() => onChange(selected ? group : group + 1)} className={`min-h-28 rounded-2xl border-4 p-2 transition ${selected ? "border-emerald-700 bg-emerald-200 shadow-lg" : "border-dashed border-slate-300 bg-white"}`}><span className="grid grid-cols-2 gap-1" aria-hidden>{Array.from({ length: 8 }, (_, index) => <span key={index} className="grid size-7 place-items-center rounded-full bg-amber-300 text-sm">●</span>)}</span><b className="mt-2 block text-xs text-slate-950">grupa {group + 1}</b></button>;
      })}
    </div>
  );
}

function AreaScene({ rows, columns, selectedRows, onChange, readOnly }: { rows: number; columns: number; selectedRows: number; onChange: (value: number) => void; readOnly: boolean }) {
  return (
    <div className="rounded-3xl bg-cyan-50 p-4">
      <div className="mx-auto grid max-w-lg gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label={`Model pola ${rows} na ${columns}`}>
        {Array.from({ length: rows * columns }, (_, index) => {
          const row = Math.floor(index / columns);
          const column = index % columns;
          const overlap = row < selectedRows && column === 0;
          return <button key={index} type="button" disabled={readOnly} aria-label={`Pole wiersz ${row + 1}, kolumna ${column + 1}`} onClick={() => onChange(row < selectedRows ? row : row + 1)} className={`aspect-square min-h-9 rounded-md border-2 ${overlap ? "border-violet-800 bg-violet-500" : row < selectedRows ? "border-cyan-700 bg-cyan-300" : column === 0 ? "border-amber-700 bg-amber-300" : "border-slate-300 bg-white"}`} />;
        })}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-700">Fioletowe pole to część części — przecięcie dwóch zaznaczeń.</p>
    </div>
  );
}

function ContextScene({ topic, task }: { topic: FractionOperationsTopic; task: FractionOperationsTask }) {
  const icon = topic === "3.7" ? "🐼" : topic === "3.8" ? "🚌" : topic === "3.9" ? "🎨" : topic === "3.10" ? "🍕" : "🥤";
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 p-5 text-slate-950 shadow-inner">
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-200/70" aria-hidden />
      <div className="relative grid gap-5 md:grid-cols-[auto_1fr] md:items-center">
        <div className="grid size-36 place-items-center rounded-[2rem] border-4 border-white bg-white/70 text-7xl shadow-xl" aria-hidden>{icon}</div>
        <div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Zadanie z historią</p><h3 className="mt-2 text-3xl font-black">{task.expression}</h3><p className="mt-3 text-lg font-bold leading-relaxed">{task.prompt}</p><p className="mt-4 rounded-2xl bg-white/75 p-4 text-sm font-semibold">Najpierw nazwij, co oznacza każda liczba. Dopiero potem wybierz działanie i jednostkę.</p></div>
      </div>
    </section>
  );
}

function ReasoningTrail({ task, revealCount, onReveal, readOnly }: { task: FractionOperationsTask; revealCount: number; onReveal: () => void; readOnly: boolean }) {
  return (
    <section className="rounded-3xl bg-white p-5 text-slate-950">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-100 p-4"><b className="text-3xl">{task.expression}</b><span className="text-3xl text-indigo-700">→</span><span className="rounded-xl border-4 border-dashed border-amber-500 px-4 py-2 font-black">wybierz właściwe pary</span></div>
      <ol className="mt-5 space-y-3" aria-label="Tok rozumowania">
        {task.reasoning.map((step, index) => <li key={step} className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 p-3 transition ${index < revealCount ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}><span className={`grid size-9 shrink-0 place-items-center rounded-full font-black ${index < revealCount ? "bg-emerald-600 text-white" : "bg-slate-200"}`}>{index + 1}</span><b>{index < revealCount ? step : "Najpierw spróbuj samodzielnie…"}</b></li>)}
      </ol>
      {!readOnly && revealCount < task.reasoning.length ? <button type="button" onClick={onReveal} className="mt-4 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 font-black text-cyan-950">Pokaż następny krok rozumowania</button> : null}
    </section>
  );
}

export function FractionOperationsLessonModel({ activity, seed, taskSeed, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: Props) {
  const { topic, phase } = parseActivity(activity);
  const tasks = fractionOperationsTasks(topic);
  const selectedIndex = phase === "independent" && questionNumber ? Math.min(tasks.length - 1, Math.max(0, questionNumber - 1)) : Math.abs(taskSeed ?? seed) % tasks.length;
  const task = tasks[selectedIndex]!;
  const expected = expectedFractionOperationsResult(task);
  const [pizza, setPizza] = useState<FractionValue>({ numerator: Math.min(2, Math.max(1, expected.numerator)), denominator: Math.min(8, Math.max(2, expected.denominator)) });
  const [selectedGroups, setSelectedGroups] = useState(1);
  const [selectedRows, setSelectedRows] = useState(1);
  const [revealCount, setRevealCount] = useState(presentationMode ? task.reasoning.length : 0);
  const [answer, setAnswer] = useState<FractionStackValue>(blankFraction);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; detail: string } | null>(null);
  const locked = readOnly || presentationMode && phase === "independent";

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const check = () => {
    const parsed = parseFractionStackValue(answer);
    const answerLabel = `${answer.numerator.join("") || "□"}/${answer.denominator.join("") || "□"}`;
    if (!parsed.ok) {
      const zero = answer.denominator.join("") === "0";
      setFeedback({ correct: false, message: zero ? "Mianownik nie może być zerem." : "Uzupełnij obie części ułamka.", detail: zero ? "Na zero równych części nie można podzielić całości. Wpis pozostaje widoczny — popraw dolną kratkę." : "Górna kratka to licznik, dolna to mianownik." });
      onResultChange?.(false, answerLabel);
      return;
    }
    const submitted = parsed.value;
    if (!areEquivalentFractions(submitted, expected)) {
      const multipliedBoth = topic === "3.7" && submitted.numerator === expected.numerator && submitted.denominator > expected.denominator;
      setFeedback({ correct: false, message: multipliedBoth ? "Pomnożono także mianownik — wartość porcji się nie zwiększyła." : "Wynik nie przedstawia tej samej wartości co model.", detail: multipliedBoth ? "Przekreśl zmianę mianownika. Liczba naturalna łączy się z licznikiem; mianownik nadal opisuje wielkość jednej części." : `Wróć do kroków: ${task.reasoning[0]}.` });
      onResultChange?.(false, answerLabel);
      return;
    }
    const divisor = greatestCommonDivisor(Math.abs(submitted.numerator), submitted.denominator);
    if (divisor > 1) {
      setFeedback({ correct: true, message: "Wartość jest poprawna — wykonaj jeszcze skracanie.", detail: `Licznik i mianownik można podzielić przez ${divisor}.` });
      onResultChange?.(true, answerLabel);
      return;
    }
    setFeedback({ correct: true, message: "Poprawnie — model, działanie i zapis pokazują tę samą wartość.", detail: task.unit ? `Pamiętaj o jednostce: ${task.unit}.` : "Sprawdzenie zakończone." });
    onResultChange?.(true, answerLabel);
  };

  const visual = useMemo(() => {
    if (task.visual === "groups") return <GroupScene selectedGroups={selectedGroups} onChange={setSelectedGroups} readOnly={locked} />;
    if (task.visual === "area") return <AreaScene rows={4} columns={5} selectedRows={selectedRows} onChange={setSelectedRows} readOnly={locked} />;
    return <ClickablePizza value={pizza} onChange={setPizza} readOnly={locked} />;
  }, [locked, pizza, selectedGroups, selectedRows, task.visual]);

  return (
    <article className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7" data-fraction-operations data-topic={topic} data-phase={phase}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-700 via-slate-950 to-cyan-900 opacity-60" />
      <header className="flex items-start justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Ułamki zwykłe · Temat {topic}</p><h2 className="mt-1 text-2xl font-black sm:text-4xl">{TOPIC_TITLES[topic]}</h2><p className="mt-2 max-w-3xl text-sm font-semibold text-slate-200 sm:text-lg">{phase === "independent" ? task.prompt : "Klikaj elementy modelu, obserwuj zmianę zapisu i nazywaj każdy krok."}</p></div>
        {questionNumber && questionCount ? <b className="shrink-0 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-slate-950">Zadanie {questionNumber}/{questionCount}</b> : null}
      </header>

      <div className="mt-6 space-y-5">
        {phase === "context" ? <ContextScene topic={topic} task={task} /> : null}
        {phase === "visual" || phase === "context" ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]"><div>{visual}</div><div className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-center text-sm font-black text-indigo-700">Model zmienia zapis w czasie rzeczywistym</p><div className="mt-4 flex justify-center"><FractionBadge value={pizza} /></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" disabled={locked || pizza.denominator <= 2} onClick={() => setPizza((value) => ({ numerator: Math.min(value.numerator, value.denominator - 1), denominator: value.denominator - 1 }))} className="min-h-12 rounded-xl bg-slate-100 font-black disabled:opacity-30">− część</button><button type="button" disabled={locked || pizza.denominator >= 8} onClick={() => setPizza((value) => ({ ...value, denominator: value.denominator + 1 }))} className="min-h-12 rounded-xl bg-indigo-700 font-black text-white disabled:opacity-30">+ część</button></div></div></div> : null}
        {phase === "reasoning" ? <ReasoningTrail task={task} revealCount={revealCount} onReveal={() => setRevealCount((value) => Math.min(task.reasoning.length, value + 1))} readOnly={locked} /> : null}
        {phase === "independent" ? <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]"><div className="space-y-4"><div className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-sm font-black uppercase tracking-wide text-indigo-700">Przykład {selectedIndex + 1}</p><p className="mt-2 text-4xl font-black">{task.expression}</p><p className="mt-3 font-semibold text-slate-700">{task.prompt}</p></div>{visual}<ReasoningTrail task={task} revealCount={revealCount} onReveal={() => setRevealCount((value) => Math.min(task.reasoning.length, value + 1))} readOnly={locked} /></div><div className="h-fit rounded-3xl bg-white p-5 text-slate-950"><p className="mb-4 text-center font-black">Wpisz wynik w szkolnych kratkach</p><FractionStackInput value={answer} onChange={(value) => { setAnswer(value); setFeedback(null); onResultChange?.(null); }} readOnly={locked} onSubmit={check} stepLabel="Wynik działania" /><button type="button" disabled={locked} onClick={check} className="mt-4 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-cyan-950 disabled:opacity-35">Sprawdź odpowiedź</button>{feedback ? <div role="status" className={`mt-4 rounded-2xl border-4 p-4 ${feedback.correct ? "border-emerald-400 bg-emerald-50 text-emerald-950" : "border-rose-400 bg-rose-50 text-rose-950"}`}><p className="font-black">{feedback.correct ? "✓" : "!"} {feedback.message}</p><p className="mt-2 text-sm font-semibold">{feedback.detail}</p>{!feedback.correct ? <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-white p-3"><FractionBadge value={{ numerator: pizza.numerator, denominator: pizza.denominator }} crossed /><span className="font-black text-indigo-700">→ popraw wskazaną parę kratek</span></div> : null}</div> : null}</div></section> : null}
      </div>
    </article>
  );
}
