"use client";

import { useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPercentOfNumberTask, isPercentOfNumberActivity, type PercentOfNumberActivity } from "@/lib/math/decimals/percentOfNumber";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: PercentOfNumberActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Field = "divisor" | "base" | "multiplier" | "answer" | `table-${number}`;
type Status = "missing" | "correct" | "wrong" | null;

const format = (value: number) => Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
const parse = (value: string) => {
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

function ValueField({ value, active, label, readOnly, onClick }: { value: string; active: boolean; label: string; readOnly: boolean; onClick: () => void }) {
  return <button type="button" disabled={readOnly} onClick={onClick} aria-label={label} className={`min-h-12 min-w-20 rounded-xl border-2 bg-white px-3 text-xl font-black ${active ? "border-cyan-500 ring-4 ring-cyan-100" : "border-violet-300"}`}>{value || "□"}</button>;
}

function ArrowStep({ operation, label }: { operation: ReactNode; label: string }) {
  const arrow = <span aria-hidden="true" className="relative block h-8 w-5">
    <span className="absolute left-1/2 top-0 h-6 w-1 -translate-x-1/2 rounded-full bg-violet-600" />
    <span className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 -rotate-45 border-b-4 border-l-4 border-violet-600" />
  </span>;

  return <div className="mx-auto grid w-full max-w-sm grid-cols-[minmax(5rem,1fr)_2rem_minmax(5rem,1fr)] items-start py-2 text-center font-black text-violet-800" aria-label={`Ta sama operacja po obu stronach: ${label}`}>
    <span className="inline-flex flex-col items-center justify-center gap-1"><span className="inline-flex items-center justify-center gap-2">{operation}</span>{arrow}</span>
    <span aria-hidden="true" />
    <span className="inline-flex flex-col items-center justify-center gap-1"><span className="inline-flex items-center justify-center gap-2">{operation}</span>{arrow}</span>
  </div>;
}

function ProportionRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-sm grid-cols-[minmax(5rem,1fr)_2rem_minmax(5rem,1fr)] items-center text-center text-xl font-black">
    <span className="inline-flex items-center justify-center gap-2">{left}</span>
    <span aria-hidden="true">—</span>
    <span className="inline-flex items-center justify-center gap-2">{right}</span>
  </div>;
}

export function PercentOfNumberLab(props: Props) {
  return <PercentOfNumberRound key={`${props.activity}-${props.taskSeed ?? props.seed}-${props.questionNumber ?? 1}`} {...props} />;
}

function PercentOfNumberRound(props: Props) {
  const { activity, seed, taskSeed, difficulty, readOnly = false, questionNumber, questionCount, onResultChange } = props;
  const task = useMemo(() => createPercentOfNumberTask({ seed: taskSeed ?? seed, activity, difficulty }), [activity, difficulty, seed, taskSeed]);
  const worked = activity === "percent-six-of-example" || activity === "percent-six-of-story-example";
  const table = activity === "percent-six-of-table";
  const progressive = Math.max(1, questionNumber ?? 1);
  const required = useMemo<Field[]>(() => {
    if (table) return (task.tableRows ?? []).map((_, index) => `table-${index}` as Field);
    if (progressive <= 2) return ["answer"];
    if (progressive <= 4) return ["base", "answer"];
    return ["divisor", "base", "multiplier", "answer"];
  }, [progressive, table, task.tableRows]);
  const expected = useMemo<Record<Field, number>>(() => {
    const values = { divisor: task.divisor, base: task.whole / task.divisor, multiplier: task.multiplier, answer: task.answer } as Record<Field, number>;
    task.tableRows?.forEach((row, index) => { values[`table-${index}`] = row.answer; });
    return values;
  }, [task]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Field>(required[0] ?? "answer");
  const [status, setStatus] = useState<Status>(null);

  const shown = (field: Field) => {
    if (readOnly || worked || !required.includes(field)) return format(expected[field]);
    return values[field] ?? "";
  };
  const field = (name: Field, label: string) => <ValueField value={shown(name)} active={active === name} label={label} readOnly={readOnly || worked || !required.includes(name)} onClick={() => setActive(name)} />;
  const key = (keyValue: string) => {
    if (readOnly || worked) return;
    setValues((current) => {
      const value = current[active] ?? "";
      if (keyValue === "backspace") return { ...current, [active]: value.slice(0, -1) };
      if (keyValue === ",") return value.includes(",") ? current : { ...current, [active]: value ? `${value},` : "0," };
      return value.length >= 7 ? current : { ...current, [active]: `${value}${keyValue}` };
    });
    setStatus(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (required.some((name) => !values[name] || values[name]!.endsWith(","))) {
      setStatus("missing");
      onResultChange?.(null);
      return;
    }
    const correct = required.every((name) => {
      const value = parse(values[name]!);
      return value !== null && Math.abs(value - expected[name]) < 1e-9;
    });
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${task.percent}% z ${format(task.whole)} = ${format(task.answer)} ${task.unit}`.trim());
  };

  return <LessonTaskFrame
    eyebrow="Dział 6 · Procenty"
    heading={table ? "Procenty w pamięci" : activity.includes("story") ? "Obliczenia procentowe w zadaniach" : "Oblicz procent danej liczby"}
    description={task.prompt}
    questionNumber={worked ? undefined : questionNumber}
    questionCount={worked ? undefined : questionCount}
  >
    <div className="space-y-5">
      {task.story ? <section className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-5 text-center text-lg font-black text-cyan-950">{task.story}</section> : null}

      {table ? <section className="overflow-hidden rounded-2xl border-2 border-violet-300">
        <div className="grid grid-cols-2 bg-violet-700 text-center font-black text-white"><div className="border-r-2 border-violet-300 p-3">Procent</div><div className="p-3">Wartość z {format(task.whole)} {task.unit}</div></div>
        {task.tableRows?.map((row, index) => <div key={row.percent} className="grid grid-cols-2 items-center border-t-2 border-violet-200 bg-white text-center"><div className="border-r-2 border-violet-200 p-3 text-xl font-black">{row.percent}%</div><div className="p-2">{field(`table-${index}`, `${row.percent}% z ${task.whole}`)} <b>{task.unit}</b></div></div>)}
      </section> : <section className="mx-auto max-w-2xl rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 shadow-sm">
        {!task.story ? <div className="mx-auto mb-5 max-w-lg rounded-2xl border-2 border-violet-300 bg-white px-5 py-4 text-center shadow-sm">
          <p className="text-2xl font-black text-slate-950">{task.prompt}</p>
        </div> : null}
        <p className="mb-4 text-center font-black text-slate-700">Najpierw ustal całość: <span className="text-violet-800">100%</span>.</p>
        <ProportionRow left={<>{format(task.whole)} {task.unit}</>} right={<>100%</>} />
        <ArrowStep
          label={`podziel przez ${task.divisor}`}
          operation={<><span>:</span>{required.includes("divisor") ? field("divisor", "Liczba, przez którą dzielimy") : <span>{task.divisor}</span>}</>}
        />
        <ProportionRow left={required.includes("base") ? field("base", "Wartość po pierwszym kroku") : <>{format(task.whole / task.divisor)} {task.unit}</>} right={<>{task.basePercent}%</>} />
        <ArrowStep
          label={`pomnóż przez ${task.multiplier}`}
          operation={<><span>·</span>{required.includes("multiplier") ? field("multiplier", "Liczba, przez którą mnożymy") : <span>{task.multiplier}</span>}</>}
        />
        <ProportionRow left={<>{field("answer", "Wynik")} <b>{task.unit}</b></>} right={<>{task.percent}%</>} />
      </section>}

      {!readOnly && !worked ? <LessonNumericKeypad onKey={key} onConfirm={check} allowSeparator label="Klawiatura do obliczeń procentowych" helperText="Wybierz puste pole, wpisz wartość i zatwierdź wszystkie pola raz na końcu." /> : null}
      {status === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie puste pola przed zatwierdzeniem.</p> : null}
      {status === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Ta sama operacja została wykonana po obu stronach.</p> : null}
      {status === "wrong" ? <p role="status" className="rounded-xl bg-amber-50 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {format(task.answer)} {task.unit}. Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

export { isPercentOfNumberActivity };
