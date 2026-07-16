"use client";

import { useEffect, useState } from "react";
import { FractionStackInput } from "@/components/lessons/fractions/FractionStackInput";
import { FractionNaturalMultiplicationLessonModel } from "@/components/lessons/fractions/FractionNaturalMultiplicationLessonModel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  expectedFractionOperationsResult,
  fractionOperationsTasks,
  parseFractionOperationsActivity,
  type FractionOperationsActivity,
  type FractionOperationsTask,
  type FractionOperationsTopic,
} from "@/lib/math/fractions/fractionOperationsLesson";
import { areEquivalentFractions, greatestCommonDivisor, normalizeFraction, parseFractionStackValue } from "@/lib/math/fractions/fractionMath";
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

function blankFraction(): FractionStackValue {
  return { numerator: [""], denominator: [""] };
}

function digitCells(value: number): number {
  return String(Math.abs(value)).length;
}

function firstFractions(expression: string): FractionValue[] {
  return [...expression.matchAll(/(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)/gu)].map((match) => {
    const whole = Number(match[1] ?? 0);
    const numerator = Number(match[2]);
    const denominator = Number(match[3]);
    return { numerator: whole * denominator + numerator, denominator };
  });
}

function firstNaturalDivisor(expression: string): number {
  const match = expression.match(/:\s*(\d+)\s*$/u);
  return match ? Math.max(1, Number(match[1])) : 2;
}

function firstNaturalDividend(expression: string): FractionValue | null {
  const match = expression.match(/^\s*(\d+)\s*:/u);
  return match ? { numerator: Number(match[1]), denominator: 1 } : null;
}

function leadingMultiplier(expression: string): number {
  const match = expression.match(/^\s*(\d+)\s*[×·]/u);
  return match ? Math.max(1, Number(match[1])) : 1;
}

function displayExpression(expression: string): string {
  return expression.replaceAll("×", "·");
}

function safeFraction(value: FractionValue): FractionValue {
  return { numerator: Math.max(0, value.numerator), denominator: Math.max(1, value.denominator) };
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

function ClickablePizza({ value, onChange, readOnly, copyCount }: { value: FractionValue; onChange: (value: FractionValue) => void; readOnly: boolean; copyCount?: number }) {
  const pizzaCount = copyCount ?? Math.max(1, Math.min(4, Math.ceil(value.numerator / value.denominator)));
  return (
    <section className="rounded-3xl bg-amber-50 p-4 text-slate-950 shadow-inner" aria-label={`Interaktywna pizza: ${value.numerator}/${value.denominator}`}>
      <div className={`grid gap-3 ${pizzaCount > 1 ? "sm:grid-cols-2" : ""}`}>
        {Array.from({ length: pizzaCount }, (_, pizzaIndex) => <svg key={pizzaIndex} viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-[270px] drop-shadow-xl" role="img" aria-label={`Pizza ${pizzaIndex + 1}, podzielona na ${value.denominator} części`}>
          <circle cx="120" cy="120" r="108" fill="#b45309" />
          {Array.from({ length: value.denominator }, (_, index) => {
            const absoluteIndex = pizzaIndex * value.denominator + index;
            const selected = copyCount ? index < value.numerator : absoluteIndex < value.numerator;
            const nextNumerator = copyCount ? (selected ? index : index + 1) : (selected ? absoluteIndex : absoluteIndex + 1);
            const pieceLabel = copyCount ? `porcja ${pizzaIndex + 1}, kawałek ${index + 1}` : `kawałek ${absoluteIndex + 1}`;
            return <path key={index} d={sectorPath(index, value.denominator)} fill={selected ? "#fb923c" : "#fef3c7"} stroke="#7c2d12" strokeWidth="3" tabIndex={readOnly ? -1 : 0} role="button" aria-label={`${selected ? "Odznacz" : "Zaznacz"} ${pieceLabel}`} onClick={() => !readOnly && onChange({ ...value, numerator: nextNumerator })} onKeyDown={(event) => { if (!readOnly && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onChange({ ...value, numerator: nextNumerator }); } }} className="cursor-pointer transition hover:brightness-95 focus:outline-none focus-visible:stroke-cyan-600 focus-visible:stroke-[7px]" />;
          })}
          {Array.from({ length: 6 }, (_, index) => <circle key={index} cx={70 + index * 31 % 100} cy={67 + index * 47 % 105} r="5" fill="#b91c1c" />)}
        </svg>)}
      </div>
      {!readOnly ? <p className="mt-2 text-center text-sm font-black text-amber-950">Kliknij kawałek — obraz i zapis zmienią się razem.</p> : null}
    </section>
  );
}

function FractionBadge({ value, crossed = false }: { value: FractionValue; crossed?: boolean }) {
  return (
    <span className={`relative inline-grid min-w-16 justify-items-stretch rounded-xl bg-white px-3 py-2 text-center text-slate-950 shadow ${crossed ? "opacity-70" : ""}`} aria-label={`Zapis modelu: ${value.numerator}/${value.denominator}`}>
      <b className="text-2xl">{value.numerator}</b><span className="h-0 border-t-[3px] border-slate-950" /><b className="text-2xl">{value.denominator}</b>
      {crossed ? <span aria-hidden className="absolute left-0 top-1/2 h-1 w-full -rotate-12 bg-rose-600" /> : null}
    </span>
  );
}

function CancelNumber({ value, divisor, active, accent }: { value: number; divisor: number; active: boolean; accent: "rose" | "cyan" }) {
  const color = accent === "rose" ? "decoration-rose-600 text-rose-700" : "decoration-cyan-700 text-cyan-800";
  return <span className="relative inline-grid min-w-10 place-items-center"><b className={`text-2xl ${active && divisor > 1 ? `line-through decoration-[4px] ${color}` : "text-slate-950"}`}>{value}</b>{active && divisor > 1 ? <small className={`absolute -right-3 -top-2 rounded bg-white px-1 font-black ${accent === "rose" ? "text-rose-700" : "text-cyan-800"}`}>{value / divisor}</small> : null}</span>;
}

function OperationPairGuide({ task, revealCount }: { task: FractionOperationsTask; revealCount: number }) {
  const fractions = firstFractions(task.expression);
  const active = revealCount > 0;
  const natural = leadingMultiplier(task.expression);
  if (/[×·]/u.test(task.expression) && fractions.length >= 2) {
    const left = fractions[0]!;
    const right = fractions[1]!;
    const roseDivisor = greatestCommonDivisor(left.numerator, right.denominator);
    const cyanDivisor = greatestCommonDivisor(left.denominator, right.numerator);
    return <div className="relative mx-auto mt-4 max-w-md rounded-2xl border-4 border-slate-200 bg-white p-5" aria-label="Podświetlone pary do skracania po skosie">
      {active ? <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 400 150" aria-hidden><line x1="105" y1="42" x2="295" y2="108" stroke="#e11d48" strokeWidth="6" strokeLinecap="round" opacity=".75" /><line x1="105" y1="108" x2="295" y2="42" stroke="#0891b2" strokeWidth="6" strokeLinecap="round" opacity=".75" /></svg> : null}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-7 text-center"><span className="grid gap-2 rounded-xl bg-slate-50 p-3"><CancelNumber value={left.numerator} divisor={roseDivisor} active={active} accent="rose" /><i className="border-t-4 border-slate-900" /><CancelNumber value={left.denominator} divisor={cyanDivisor} active={active} accent="cyan" /></span><b className="text-3xl">·</b><span className="grid gap-2 rounded-xl bg-slate-50 p-3"><CancelNumber value={right.numerator} divisor={cyanDivisor} active={active} accent="cyan" /><i className="border-t-4 border-slate-900" /><CancelNumber value={right.denominator} divisor={roseDivisor} active={active} accent="rose" /></span></div>
      <p className="relative mt-3 text-center text-xs font-black text-slate-700">{active ? "Różowa i turkusowa przekątna pokazują dwie niezależne pary. Skreślaj tylko liczby ze wspólnym dzielnikiem." : "Odsłoń pierwszy krok, aby podświetlić właściwe przekątne."}</p>
    </div>;
  }
  if (task.expression.includes(":") && fractions.length >= 2) {
    const divisor = fractions[1]!;
    return <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border-4 border-slate-200 bg-white p-4 text-slate-950" aria-label="Odwracanie wyłącznie dzielnika"><FractionBadge value={fractions[0]!} /><b className="text-3xl">:</b><span className={`rounded-xl p-1 ${active ? "ring-4 ring-amber-400" : ""}`}><FractionBadge value={divisor} /></span>{active ? <><b className="text-3xl text-indigo-700">→</b><FractionBadge value={{ numerator: divisor.denominator, denominator: divisor.numerator }} /></> : null}</div>;
  }
  if (/[×·]/u.test(task.expression) && fractions.length === 1 && natural > 1) {
    const fraction = fractions[0]!;
    return <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border-4 border-slate-200 bg-white p-4 text-slate-950" aria-label="Liczba naturalna łączy się wyłącznie z licznikiem"><b className={`rounded-xl px-4 py-3 text-3xl ${active ? "bg-amber-300 ring-4 ring-amber-500" : "bg-slate-100"}`}>{natural}</b><b className="text-3xl">·</b><span className="grid gap-2 rounded-xl bg-slate-50 p-3"><b className={`rounded px-3 text-2xl ${active ? "bg-amber-300 ring-4 ring-amber-500" : ""}`}>{fraction.numerator}</b><i className="border-t-4 border-slate-900" /><b className="rounded border-2 border-dashed border-slate-400 px-3 text-2xl">{fraction.denominator}</b></span><p className="w-full text-center text-xs font-black text-slate-700">{active ? "Podświetlone pola mnożymy. Mianownik pozostaje rozmiarem jednej części." : "Odsłoń pierwszy krok, aby zobaczyć właściwe połączenie."}</p></div>;
  }
  return null;
}

function GroupScene({ totalGroups, selectedGroups, itemsPerGroup, onChange, readOnly }: { totalGroups: number; selectedGroups: number; itemsPerGroup: number; onChange: (count: number) => void; readOnly: boolean }) {
  return (
    <div className="grid gap-3 rounded-3xl bg-emerald-50 p-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${totalGroups} równych grup, wybrano ${selectedGroups}`}>
      {Array.from({ length: totalGroups }, (_, group) => {
        const selected = group < selectedGroups;
        return <button key={group} type="button" disabled={readOnly} aria-pressed={selected} onClick={() => onChange(selected ? group : group + 1)} className={`min-h-28 rounded-2xl border-4 p-2 transition ${selected ? "border-emerald-700 bg-emerald-200 shadow-lg" : "border-dashed border-slate-300 bg-white"}`}><span className="grid grid-cols-4 gap-1" aria-hidden>{Array.from({ length: itemsPerGroup }, (_, index) => <span key={index} className="grid size-6 place-items-center rounded-full bg-amber-300 text-xs">●</span>)}</span><b className="mt-2 block text-xs text-slate-950">grupa {group + 1}</b></button>;
      })}
    </div>
  );
}

function AreaScene({ rows, columns, selectedRows, selectedColumns, onRowsChange, onColumnsChange, readOnly }: { rows: number; columns: number; selectedRows: number; selectedColumns: number; onRowsChange: (value: number) => void; onColumnsChange: (value: number) => void; readOnly: boolean }) {
  return (
    <div className="rounded-3xl bg-cyan-50 p-4 text-slate-950">
      <div className="mx-auto grid max-w-lg gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-label={`Model pola: ${selectedRows}/${rows} razy ${selectedColumns}/${columns}`}>
        {Array.from({ length: rows * columns }, (_, index) => {
          const row = Math.floor(index / columns);
          const column = index % columns;
          const overlap = row < selectedRows && column < selectedColumns;
          return <button key={index} type="button" disabled={readOnly} aria-label={`Pole wiersz ${row + 1}, kolumna ${column + 1}`} onClick={() => { onRowsChange(row < selectedRows ? row : row + 1); onColumnsChange(column < selectedColumns ? column : column + 1); }} className={`aspect-square min-h-9 rounded-md border-2 transition ${overlap ? "border-violet-800 bg-violet-500" : row < selectedRows ? "border-cyan-700 bg-cyan-300" : column < selectedColumns ? "border-amber-700 bg-amber-300" : "border-slate-300 bg-white"}`} />;
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black"><span className="rounded-xl bg-cyan-200 p-2">poziomo: {selectedRows}/{rows}</span><span className="rounded-xl bg-amber-200 p-2">pionowo: {selectedColumns}/{columns}</span></div>
      <p className="mt-3 text-center text-sm font-bold text-slate-700">Fioletowe pola są częścią części. Kliknięcie zmienia oba zaznaczenia.</p>
    </div>
  );
}

function SplitScene({ source, groups, onGroupsChange, readOnly }: { source: FractionValue; groups: number; onGroupsChange: (groups: number) => void; readOnly: boolean }) {
  const cells = Math.ceil(source.numerator / source.denominator) * source.denominator * groups;
  return (
    <section className="rounded-3xl bg-rose-50 p-4 text-slate-950" aria-label={`${source.numerator}/${source.denominator} podzielone na ${groups} równe grupy`}>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cells, 24)}, minmax(0, 1fr))` }}>
        {Array.from({ length: Math.min(cells, 24) }, (_, index) => <span key={index} className={`h-14 rounded-lg border-2 ${index < source.numerator * groups ? `border-rose-600 ${index % groups === 0 ? "bg-rose-500" : "bg-rose-200"}` : "border-slate-300 bg-white"}`} />)}
      </div>
      <div className="mt-4 flex items-center justify-center gap-3"><button type="button" disabled={readOnly || groups <= 2} onClick={() => onGroupsChange(groups - 1)} className="size-12 rounded-xl bg-white text-xl font-black shadow">−</button><b className="rounded-xl bg-rose-200 px-4 py-3">{groups} grup</b><button type="button" disabled={readOnly || groups >= 6} onClick={() => onGroupsChange(groups + 1)} className="size-12 rounded-xl bg-rose-700 text-xl font-black text-white shadow">+</button></div>
      <p className="mt-3 text-center text-sm font-bold">Każda pierwotna część została pocięta na {groups} równych kawałków.</p>
    </section>
  );
}

function MeasureScene({ dividend, measure, onMeasureChange, readOnly }: { dividend: FractionValue; measure: FractionValue; onMeasureChange: (value: FractionValue) => void; readOnly: boolean }) {
  const common = Math.min(24, dividend.denominator * measure.denominator);
  const filled = Math.round(dividend.numerator / dividend.denominator * common);
  const measureWidth = Math.max(1, Math.round(measure.numerator / measure.denominator * common));
  return (
    <section className="rounded-3xl bg-sky-50 p-4 text-slate-950" aria-label={`Miara ${measure.numerator}/${measure.denominator} w ${dividend.numerator}/${dividend.denominator}`}>
      <div className="relative mx-auto flex max-w-2xl gap-1 rounded-2xl bg-white p-3 shadow-inner">
        {Array.from({ length: common }, (_, index) => <span key={index} className={`h-20 flex-1 rounded-sm ${index < filled ? "bg-sky-400" : "bg-slate-100"} ${(index + 1) % measureWidth === 0 && index < filled ? "border-r-4 border-r-indigo-800" : ""}`} />)}
      </div>
      <p className="mt-3 text-center text-sm font-black">Grube kreski kończą kolejne miary po {measure.numerator}/{measure.denominator}.</p>
      <div className="mt-4 flex justify-center gap-2"><button type="button" disabled={readOnly || measure.numerator <= 1} onClick={() => onMeasureChange({ ...measure, numerator: measure.numerator - 1 })} className="rounded-xl bg-white px-4 py-3 font-black shadow">mniejszy licznik</button><button type="button" disabled={readOnly || measure.numerator >= measure.denominator} onClick={() => onMeasureChange({ ...measure, numerator: measure.numerator + 1 })} className="rounded-xl bg-indigo-700 px-4 py-3 font-black text-white shadow">większy licznik</button></div>
    </section>
  );
}

function ContextScene({ topic, task }: { topic: FractionOperationsTopic; task: FractionOperationsTask }) {
  const icon = topic === "3.7" ? "🐼" : topic === "3.8" ? "🚌" : topic === "3.9" ? "🎨" : topic === "3.10" ? "🍕" : "🥤";
  return <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-200 via-emerald-100 to-amber-100 p-5 text-slate-950 shadow-inner"><div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-200/70" aria-hidden /><div className="relative grid gap-5 md:grid-cols-[auto_1fr] md:items-center"><div className="grid size-36 place-items-center rounded-[2rem] border-4 border-white bg-white/70 text-7xl shadow-xl" aria-hidden>{icon}</div><div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Zadanie z historią</p><h3 className="mt-2 text-3xl font-black">{displayExpression(task.expression)}</h3><p className="mt-3 text-lg font-bold leading-relaxed">{task.prompt}</p><p className="mt-4 rounded-2xl bg-white/75 p-4 text-sm font-semibold">Najpierw nazwij znaczenie liczb. Potem wybierz działanie i jednostkę.</p></div></div></section>;
}

function ReasoningTrail({ task, revealCount, onReveal, allowReveal }: { task: FractionOperationsTask; revealCount: number; onReveal: () => void; allowReveal: boolean }) {
  return (
    <section className="rounded-3xl bg-white p-5 text-slate-950">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-100 p-4"><b className="text-3xl">{displayExpression(task.expression)}</b><span className="text-3xl text-indigo-700">→</span><span className="rounded-xl border-4 border-dashed border-amber-500 px-4 py-2 font-black">wybierz właściwe pary</span></div>
      <OperationPairGuide task={task} revealCount={revealCount} />
      <ol className="mt-5 space-y-3" aria-label="Tok rozumowania">{task.reasoning.map((step, index) => <li key={step} className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 p-3 transition ${index < revealCount ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 text-slate-400"}`}><span className={`grid size-9 shrink-0 place-items-center rounded-full font-black ${index < revealCount ? "bg-emerald-600 text-white" : "bg-slate-200"}`}>{index + 1}</span><b>{index < revealCount ? step : "Najpierw spróbuj samodzielnie…"}</b></li>)}</ol>
      {allowReveal && revealCount < task.reasoning.length ? <button type="button" onClick={onReveal} className="mt-4 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 font-black text-cyan-950">Pokaż następny krok rozumowania</button> : null}
      {!allowReveal && revealCount === 0 ? <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-center text-sm font-black text-amber-950">Podpowiedź pojawi się dopiero po własnej próbie.</p> : null}
    </section>
  );
}

function FractionOperationsLessonModelContent({ activity, seed, taskSeed, readOnly = false, presentationMode = false, questionNumber, questionCount, onResultChange }: Props) {
  const { topic, level, phase } = parseFractionOperationsActivity(activity);
  const tasks = fractionOperationsTasks(topic, level);
  const selectedIndex = phase === "independent" && questionNumber ? Math.min(tasks.length - 1, Math.max(0, questionNumber - 1)) : Math.abs(taskSeed ?? seed) % tasks.length;
  const task = tasks[selectedIndex]!;
  const expected = expectedFractionOperationsResult(task);
  const sourceFractions = firstFractions(task.expression);
  const source = safeFraction(sourceFractions[0] ?? firstNaturalDividend(task.expression) ?? expected);
  const second = safeFraction(sourceFractions[1] ?? { numerator: 1, denominator: Math.max(2, source.denominator) });
  const [pizza, setPizza] = useState<FractionValue>({ numerator: Math.min(48, source.numerator), denominator: Math.min(12, source.denominator) });
  const [selectedGroups, setSelectedGroups] = useState(Math.min(source.numerator, source.denominator));
  const [selectedRows, setSelectedRows] = useState(Math.min(source.numerator, source.denominator));
  const [selectedColumns, setSelectedColumns] = useState(Math.min(second.numerator, second.denominator));
  const [splitGroups, setSplitGroups] = useState(firstNaturalDivisor(task.expression));
  const [repetitionCount, setRepetitionCount] = useState(leadingMultiplier(task.expression));
  const [measure, setMeasure] = useState(second);
  const [revealCount, setRevealCount] = useState(presentationMode && phase !== "independent" ? task.reasoning.length : 0);
  const [answer, setAnswer] = useState<FractionStackValue>(blankFraction);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; detail: string } | null>(null);
  const locked = readOnly || presentationMode && phase === "independent";

  useEffect(() => () => onResultChange?.(null), [onResultChange]);

  const modelFraction = (() => {
    if (task.visual === "groups") return { numerator: selectedGroups, denominator: source.denominator };
    if (task.visual === "area") return safeFraction(normalizeFraction({ numerator: selectedRows * selectedColumns, denominator: source.denominator * second.denominator }));
    if (task.visual === "split") return safeFraction(normalizeFraction({ numerator: source.numerator, denominator: source.denominator * splitGroups }));
    if (task.visual === "measure") return safeFraction(normalizeFraction({ numerator: source.numerator * measure.denominator, denominator: source.denominator * measure.numerator }));
    return topic === "3.7" ? safeFraction(normalizeFraction({ numerator: pizza.numerator * repetitionCount, denominator: pizza.denominator })) : pizza;
  })();

  const check = () => {
    const parsed = parseFractionStackValue(answer);
    const answerLabel = `${answer.numerator.join("") || "□"}/${answer.denominator.join("") || "□"}`;
    if (!parsed.ok) {
      const zero = answer.denominator.join("") === "0";
      setFeedback({ correct: false, message: zero ? "Mianownik nie może być zerem." : "Uzupełnij obie części ułamka.", detail: zero ? "Na zero równych części nie można podzielić całości. Popraw dolną kratkę." : "Górna kratka to licznik, dolna to mianownik." });
      onResultChange?.(false, answerLabel);
      return;
    }
    const submitted = parsed.value;
    if (!areEquivalentFractions(submitted, expected)) {
      const multipliedBoth = topic === "3.7" && submitted.numerator === expected.numerator && submitted.denominator > expected.denominator;
      setFeedback({ correct: false, message: multipliedBoth ? "Pomnożono także mianownik — porcja nie stała się większa." : "Wynik nie przedstawia tej samej wartości co działanie.", detail: multipliedBoth ? "Przekreśl zmianę mianownika. Liczba naturalna łączy się z licznikiem." : `Sprawdź pierwszy krok: ${task.reasoning[0]}.` });
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

  const visual = (() => {
    if (task.visual === "groups") return <GroupScene totalGroups={source.denominator} selectedGroups={selectedGroups} itemsPerGroup={Math.max(1, Math.min(12, Math.round((Number(task.expression.match(/z\s+(\d+)/u)?.[1]) || 24) / source.denominator)))} onChange={setSelectedGroups} readOnly={locked} />;
    if (task.visual === "area") return <AreaScene rows={source.denominator} columns={second.denominator} selectedRows={selectedRows} selectedColumns={selectedColumns} onRowsChange={setSelectedRows} onColumnsChange={setSelectedColumns} readOnly={locked} />;
    if (task.visual === "split") return <SplitScene source={source} groups={splitGroups} onGroupsChange={setSplitGroups} readOnly={locked} />;
    if (task.visual === "measure") return <MeasureScene dividend={source} measure={measure} onMeasureChange={setMeasure} readOnly={locked} />;
    return <ClickablePizza value={pizza} onChange={setPizza} readOnly={locked} copyCount={topic === "3.7" ? repetitionCount : undefined} />;
  })();

  const allowReveal = !locked && (phase !== "independent" || feedback?.correct === false);

  return (
    <LessonTaskFrame eyebrow={`Dział 3 · Temat ${topic}`} heading={TOPIC_TITLES[topic]} description={phase === "independent" ? task.prompt : "Klikaj elementy modelu, obserwuj zmianę zapisu i nazywaj każdy krok."} questionNumber={questionNumber} questionCount={questionCount} contentClassName="space-y-5 text-slate-950" data-fraction-operations data-topic={topic} data-level={level} data-phase={phase}>
      <div className="space-y-5">
        {phase === "context" ? <ContextScene topic={topic} task={task} /> : null}
        {phase === "visual" || phase === "context" ? <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]"><div>{visual}</div><div className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-center text-sm font-black text-indigo-700">Dokładny zapis aktualnego modelu</p><div className="mt-4 flex justify-center"><FractionBadge value={modelFraction} /></div>{task.visual === "pizza" ? <div className="mt-5 space-y-2"><div className="grid grid-cols-2 gap-2"><button type="button" disabled={locked || pizza.denominator <= 2} onClick={() => setPizza((value) => ({ ...value, denominator: value.denominator - 1 }))} className="min-h-12 rounded-xl bg-slate-100 font-black disabled:opacity-30">− część</button><button type="button" disabled={locked || pizza.denominator >= 12} onClick={() => setPizza((value) => ({ ...value, denominator: value.denominator + 1 }))} className="min-h-12 rounded-xl bg-indigo-700 font-black text-white disabled:opacity-30">+ część</button></div>{topic === "3.7" ? <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><button type="button" disabled={locked || repetitionCount <= 1} onClick={() => setRepetitionCount((value) => value - 1)} className="min-h-12 rounded-xl bg-slate-100 font-black disabled:opacity-30">− porcja</button><b className="rounded-xl bg-amber-100 px-3 py-3 text-center">· {repetitionCount}</b><button type="button" disabled={locked || repetitionCount >= 6} onClick={() => setRepetitionCount((value) => value + 1)} className="min-h-12 rounded-xl bg-amber-500 font-black text-amber-950 disabled:opacity-30">+ porcja</button></div> : null}</div> : <p className="mt-5 rounded-xl bg-indigo-50 p-3 text-center text-sm font-bold">Każde kliknięcie w model natychmiast aktualizuje licznik i mianownik.</p>}</div></div> : null}
        {phase === "reasoning" ? <ReasoningTrail task={task} revealCount={revealCount} onReveal={() => setRevealCount((value) => Math.min(task.reasoning.length, value + 1))} allowReveal={allowReveal} /> : null}
        {phase === "independent" ? <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]"><div className="space-y-4"><div className="rounded-3xl bg-white p-5 text-slate-950"><p className="text-sm font-black uppercase tracking-wide text-indigo-700">Przykład {selectedIndex + 1}</p><p className="mt-2 text-4xl font-black">{displayExpression(task.expression)}</p><p className="mt-3 font-semibold text-slate-700">{task.prompt}</p></div>{visual}<ReasoningTrail task={task} revealCount={revealCount} onReveal={() => setRevealCount((value) => Math.min(task.reasoning.length, value + 1))} allowReveal={allowReveal} /></div><div className="h-fit rounded-3xl bg-white p-5 text-slate-950"><p className="mb-4 text-center font-black">Wpisz wynik w szkolnych kratkach</p><FractionStackInput value={answer} onChange={(value) => { setAnswer(value); setFeedback(null); setRevealCount(0); onResultChange?.(null); }} fixedDigitCells={{ numerator: digitCells(expected.numerator), denominator: digitCells(expected.denominator) }} readOnly={locked} onSubmit={check} stepLabel="Wynik działania" /><button type="button" disabled={locked} onClick={check} className="mt-4 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-cyan-950 disabled:opacity-35">Sprawdź odpowiedź</button>{feedback ? <div role="status" className={`mt-4 rounded-2xl border-4 p-4 ${feedback.correct ? "border-emerald-400 bg-emerald-50 text-emerald-950" : "border-rose-400 bg-rose-50 text-rose-950"}`}><p className="font-black">{feedback.correct ? "✓" : "!"} {feedback.message}</p><p className="mt-2 text-sm font-semibold">{feedback.detail}</p>{!feedback.correct ? <div className="mt-3 flex items-center justify-center gap-3 rounded-xl bg-white p-3"><FractionBadge value={modelFraction} crossed /><span className="font-black text-indigo-700">→ popraw wskazaną parę kratek</span></div> : null}</div> : null}</div></section> : null}
      </div>
    </LessonTaskFrame>
  );
}

export function FractionOperationsLessonModel(props: Props) {
  const instanceKey = `${props.activity}:${props.seed}:${props.taskSeed ?? ""}:${props.questionNumber ?? ""}`;
  const parsed = parseFractionOperationsActivity(props.activity);
  if (parsed.topic === "3.7") {
    return (
      <FractionNaturalMultiplicationLessonModel
        key={instanceKey}
        phase={parsed.phase}
        readOnly={props.readOnly}
        presentationMode={props.presentationMode}
        questionNumber={props.questionNumber}
        questionCount={props.questionCount}
        onResultChange={props.onResultChange}
      />
    );
  }
  return <FractionOperationsLessonModelContent key={instanceKey} {...props} />;
}
