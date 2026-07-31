"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPercentChangeTask, isPercentChangeActivity, type PercentChangeActivity } from "@/lib/math/decimals/percentChange";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: PercentChangeActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Field = "original" | "wholePercent" | "divisor" | "base" | "basePercent" | "multiplier" | "percent" | "change" | "final";
type Status = "missing" | "correct" | "wrong" | null;

const format = (value: number) => Number.isInteger(value) ? String(value) : String(value).replace(".", ",");

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function ProportionRow({ left, right }: { left: ReactNode; right: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-md grid-cols-[minmax(7rem,1fr)_3rem_minmax(7rem,1fr)] items-center text-center text-xl font-black">
    <span>{left}</span><span aria-hidden="true">—</span><span>{right}</span>
  </div>;
}

function ArrowOperation({ operation, label }: { operation: ReactNode; label: string }) {
  return <div className="mx-auto grid w-full max-w-md grid-cols-[minmax(7rem,1fr)_3rem_minmax(7rem,1fr)] py-2 text-center text-base font-black text-violet-700" aria-label={`Po obu stronach wykonaj ${label}`}>
    {[0, 1, 2].map((column) => column === 1 ? <span key={column} /> : <span key={column} className="flex flex-col items-center gap-1"><b className="inline-flex items-center justify-center gap-2">{operation}</b><span className="text-3xl leading-5">↓</span></span>)}
  </div>;
}

function AnswerField({ value, active, label, readOnly, onClick }: { value: string; active: boolean; label: string; readOnly: boolean; onClick: () => void }) {
  return <button type="button" disabled={readOnly} onClick={onClick} aria-label={label} className={`min-h-12 min-w-24 rounded-xl border-2 bg-white px-3 text-xl font-black ${active ? "border-cyan-500 ring-4 ring-cyan-100" : "border-violet-300"}`}>{value || "□"}</button>;
}

export function PercentChangeLab(props: Props) {
  return <PercentChangeRound key={`${props.activity}-${props.taskSeed ?? props.seed}-${props.questionNumber ?? 1}`} {...props} />;
}

function PercentChangeRound({ activity, seed, taskSeed, difficulty, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  const task = useMemo(() => createPercentChangeTask({ seed: taskSeed ?? seed, activity, difficulty }), [activity, difficulty, seed, taskSeed]);
  const worked = activity.endsWith("-example");
  const common = gcd(100, task.percent);
  const divisor = 100 / common;
  const multiplier = task.percent / common;
  const independentPractice = activity === "percent-change-discount-practice"
    || activity === "percent-change-raise-practice"
    || activity === "percent-change-products"
    || activity === "percent-change-salaries";
  const required = useMemo<Field[]>(() => independentPractice
    ? ["original", "wholePercent", "divisor", "base", "basePercent", "multiplier", "percent", "change", "final"]
    : ["change", "final"], [independentPractice]);
  const expected = useMemo<Record<Field, number>>(() => ({
    original: task.original,
    wholePercent: 100,
    divisor,
    base: task.original / divisor,
    basePercent: common,
    multiplier,
    percent: task.percent,
    change: task.change,
    final: task.final,
  }), [common, divisor, multiplier, task]);
  const [values, setValues] = useState<Partial<Record<Field, string>>>({});
  const [active, setActive] = useState<Field>(required[0] ?? "change");
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => { onResultChange?.(worked ? true : null); }, [onResultChange, worked]);

  const value = (field: Field) => worked || readOnly || !required.includes(field) ? format(expected[field]) : values[field] ?? "";
  const input = (field: Field, label: string) => <AnswerField value={value(field)} active={active === field} label={label} readOnly={readOnly || worked || !required.includes(field)} onClick={() => setActive(field)} />;

  const onKey = (key: string) => {
    if (worked || readOnly) return;
    setValues((current) => {
      const currentValue = current[active] ?? "";
      if (key === "backspace") return { ...current, [active]: currentValue.slice(0, -1) };
      if (key === ",") return currentValue.includes(",") ? current : { ...current, [active]: currentValue ? `${currentValue},` : "0," };
      return currentValue.length >= 8 ? current : { ...current, [active]: `${currentValue}${key}` };
    });
    setStatus(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (required.some((field) => !values[field] || values[field]!.endsWith(","))) {
      setStatus("missing");
      onResultChange?.(null);
      return;
    }
    const finalValue = Number(values.final!.replace(",", "."));
    const correct = Number.isFinite(finalValue) && Math.abs(finalValue - task.final) < 1e-9;
    setStatus(correct ? "correct" : "wrong");
    onResultChange?.(correct, `${task.label}: ${format(task.final)} ${task.unit}`);
  };

  const action = task.kind === "discount" ? "−" : "+";
  const heading = task.kind === "discount" ? (worked ? "Jak obliczyć cenę po obniżce?" : activity === "percent-change-products" ? "Obniżki cen w sklepie" : "Oblicz wartość po obniżce") : (worked ? "Jak obliczyć wartość po podwyżce?" : activity === "percent-change-salaries" ? "Podwyżki wynagrodzeń" : "Oblicz wartość po podwyżce");

  return <LessonTaskFrame eyebrow="Dział 6 · Procenty" heading={heading} description={task.prompt} questionNumber={worked ? undefined : questionNumber} questionCount={worked ? undefined : questionCount}>
    <div className="space-y-5">
      {task.imageSrc ? <section className="overflow-hidden rounded-3xl border-2 border-cyan-200 bg-white shadow-sm">
        <Image src={task.imageSrc} alt={task.imageAlt ?? ""} width={900} height={600} className="h-auto max-h-80 w-full object-contain" />
        <div className="border-t-2 border-cyan-100 bg-cyan-50 p-4 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-cyan-800">{task.label}</p>
          <p className="mt-1 text-xl font-black text-slate-950">{task.prompt}</p>
        </div>
      </section> : <section className="rounded-2xl border-2 border-violet-200 bg-white p-5 text-center text-2xl font-black text-slate-950">{task.prompt}</section>}

      <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 shadow-sm">
        <p className="mb-4 text-center font-black text-slate-700">Najpierw oblicz wartość {task.percent}%.</p>
        <ProportionRow left={<>{required.includes("original") ? input("original", "Wartość początkowa") : format(task.original)} {task.unit}</>} right={<>{required.includes("wholePercent") ? input("wholePercent", "Procent oznaczający całość") : "100"}%</>} />
        <ArrowOperation label="dzielenie po obu stronach" operation={<><span>:</span>{required.includes("divisor") ? input("divisor", "Liczba, przez którą dzielimy") : <span>{divisor}</span>}</>} />
        <ProportionRow left={<>{required.includes("base") ? input("base", "Wartość po podzieleniu") : format(task.original / divisor)} {task.unit}</>} right={<>{required.includes("basePercent") ? input("basePercent", "Procent po podzieleniu") : common}%</>} />
        {multiplier !== 1 || required.includes("multiplier") ? <><ArrowOperation label="mnożenie po obu stronach" operation={<><span>·</span>{required.includes("multiplier") ? input("multiplier", "Liczba, przez którą mnożymy") : <span>{multiplier}</span>}</>} /><ProportionRow left={<>{input("change", `Wartość ${task.percent}%`)} {task.unit}</>} right={<>{required.includes("percent") ? input("percent", "Procent zmiany") : task.percent}%</>} /></> : <ProportionRow left={<>{input("change", `Wartość ${task.percent}%`)} {task.unit}</>} right={<>{required.includes("percent") ? input("percent", "Procent zmiany") : task.percent}%</>} />}
        <div className="my-5 h-0.5 bg-violet-200" />
        <div className="flex flex-wrap items-center justify-center gap-3 text-xl font-black">
          <span>{required.includes("original") ? input("original", "Wartość początkowa w działaniu") : format(task.original)} {task.unit}</span><span>{action}</span><span>{input("change", "Wartość zmiany")}</span><span>=</span><span>{input("final", "Wartość po zmianie")}</span><span>{task.unit}</span>
        </div>
        <p className="mt-4 text-center font-bold text-slate-700">{task.kind === "discount" ? "Od wartości początkowej odejmij wartość obniżki." : "Do wartości początkowej dodaj wartość podwyżki."}</p>
      </section>

      {!worked && !readOnly ? <LessonNumericKeypad onKey={onKey} onConfirm={check} allowSeparator label="Klawiatura do obniżek i podwyżek" helperText="Uzupełnij kolejno wszystkie puste pola schematu i zatwierdź raz na końcu." /> : null}
      {status === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie puste pola przed zatwierdzeniem.</p> : null}
      {status === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Najpierw obliczono procent, a potem uwzględniono zmianę.</p> : null}
      {status === "wrong" ? <p role="status" className="rounded-xl bg-amber-50 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {format(task.final)} {task.unit}. Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

export { isPercentChangeActivity };
