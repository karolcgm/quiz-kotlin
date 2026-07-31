"use client";

import { useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createWholeFromPercentTask, isWholeFromPercentActivity, type WholeFromPercentActivity } from "@/lib/math/decimals/wholeFromPercent";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: WholeFromPercentActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  presentationMode?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Field = "knownValue" | "knownPercent" | "firstFactor" | "intermediateValue" | "intermediatePercent" | "secondFactor" | "answer";
type Status = "missing" | "correct" | "wrong" | null;

const parseNumber = (value: string) => {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

function NumberField({ value, active, label, disabled, onClick }: { value: string; active: boolean; label: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`min-h-12 min-w-20 rounded-xl border-2 bg-white px-3 text-xl font-black ${active ? "border-cyan-500 ring-4 ring-cyan-100" : "border-violet-300"}`}
    >
      {value || "□"}
    </button>
  );
}

function ProportionRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-[minmax(7rem,1fr)_2rem_minmax(7rem,1fr)] items-center text-center text-xl font-black">
      <span className="inline-flex items-center justify-center gap-2">{left}</span>
      <span aria-hidden="true">—</span>
      <span className="inline-flex items-center justify-center gap-2">{right}</span>
    </div>
  );
}

function ArrowStep({ symbol, factor }: { symbol: ":" | "·"; factor: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1 py-2 text-center font-black text-violet-800">
      <span className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-3 py-1">{symbol} {factor}</span>
      <div className="grid w-full grid-cols-2">
        <span aria-hidden="true" className="text-3xl leading-none">↓</span>
        <span aria-hidden="true" className="text-3xl leading-none">↓</span>
      </div>
    </div>
  );
}

export function WholeFromPercentLab(props: Props) {
  return <WholeFromPercentRound key={`${props.activity}-${props.taskSeed ?? props.seed}-${props.questionNumber ?? 1}`} {...props} />;
}

function WholeFromPercentRound({ activity, seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const task = useMemo(() => createWholeFromPercentTask({ seed: taskSeed ?? seed, activity }), [activity, seed, taskSeed]);
  const worked = activity === "whole-from-percent-example";
  const advanced = task.intermediatePercent !== undefined;
  const progressive = questionNumber ?? 1;
  const required = useMemo<Field[]>(() => {
    if (worked) return [];
    if (advanced) return ["knownValue", "knownPercent", "firstFactor", "intermediateValue", "intermediatePercent", "secondFactor", "answer"];
    return progressive >= 5 ? ["knownValue", "knownPercent", "firstFactor", "answer"] : ["firstFactor", "answer"];
  }, [advanced, progressive, worked]);
  const expected = useMemo<Record<Field, number>>(() => ({
    knownValue: task.knownValue,
    knownPercent: task.knownPercent,
    firstFactor: task.firstFactor,
    intermediateValue: task.intermediateValue ?? task.answer,
    intermediatePercent: task.intermediatePercent ?? 100,
    secondFactor: task.secondFactor ?? 1,
    answer: task.answer,
  }), [task]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState<Field>(required[0] ?? "answer");
  const [status, setStatus] = useState<Status>(null);

  const shown = (name: Field) => (worked || readOnly || !required.includes(name)) ? String(expected[name]).replace(".", ",") : values[name] ?? "";
  const field = (name: Field, label: string) => (
    <NumberField value={shown(name)} active={active === name} label={label} disabled={worked || readOnly || !required.includes(name)} onClick={() => setActive(name)} />
  );
  const handleKey = (key: string) => {
    if (worked || readOnly) return;
    setValues((current) => {
      const value = current[active] ?? "";
      if (key === "backspace") return { ...current, [active]: value.slice(0, -1) };
      if (key === ",") return value.includes(",") ? current : { ...current, [active]: value ? `${value},` : "0," };
      return value.length >= 7 ? current : { ...current, [active]: `${value}${key}` };
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
      const value = parseNumber(values[name]!);
      return value !== null && Math.abs(value - expected[name]) < 1e-9;
    });
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${task.knownPercent}% liczby ${task.answer} to ${task.knownValue}`);
  };

  const unit = task.unit ? <b>{task.unit}</b> : null;
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Procenty"
      heading={worked ? "Jak znaleźć 100%?" : "Obliczanie liczby, gdy dany jest jej procent"}
      description={worked ? "Szukana liczba odpowiada 100%. Wykonaj tę samą operację po obu stronach schematu." : task.prompt}
      questionNumber={worked ? undefined : questionNumber}
      questionCount={worked ? undefined : questionCount}
    >
      <div className="space-y-5">
        <section className="mx-auto max-w-2xl rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 shadow-sm">
          <div className="mb-5 rounded-2xl border-2 border-violet-300 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{task.prompt}</p>
            <p className="mt-2 font-bold text-violet-800">Szukamy wartości odpowiadającej 100%.</p>
          </div>
          <ProportionRow left={<>{field("knownValue", "Wartość podana w zadaniu")} {unit}</>} right={<>{field("knownPercent", "Procent podany w zadaniu")} <b>%</b></>} />
          <ArrowStep symbol={task.firstOperation === "divide" ? ":" : "·"} factor={field("firstFactor", "Liczba nad pierwszą strzałką")} />
          {advanced ? (
            <>
              <ProportionRow left={<>{field("intermediateValue", "Wartość po pierwszej operacji")} {unit}</>} right={<>{field("intermediatePercent", "Procent po pierwszej operacji")} <b>%</b></>} />
              <ArrowStep symbol="·" factor={field("secondFactor", "Liczba nad drugą strzałką")} />
            </>
          ) : null}
          <ProportionRow left={<>{field("answer", "Szukana liczba")} {unit}</>} right={<b>100%</b>} />
        </section>

        {!worked && !readOnly ? <LessonNumericKeypad onKey={handleKey} onConfirm={check} allowSeparator label="Klawiatura do szukania 100%" helperText="Wybierz kratkę, wpisz wartość i zatwierdź wszystkie pola raz na końcu." /> : null}
        {status === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola przed zatwierdzeniem.</p> : null}
        {status === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Znaleziona wartość odpowiada 100%.</p> : null}
        {status === "wrong" ? <p role="status" className="rounded-xl bg-amber-50 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer}{task.unit ? ` ${task.unit}` : ""}. Dziś bez punktu.</p> : null}
      </div>
    </LessonTaskFrame>
  );
}

export { isWholeFromPercentActivity };
