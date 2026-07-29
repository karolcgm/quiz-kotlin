"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  LENGTH_CONVERSION_TASKS,
  MASS_CONVERSION_TASKS,
  PRICE_PER_KILOGRAM_TASKS,
  type MeasurementNumericTask,
  type MeasurementUnitsActivity,
} from "@/lib/math/everyday/measurementUnits";

interface Props {
  activity: MeasurementUnitsActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

function UnitArrow({
  from,
  to,
  operation,
  note,
  tone,
}: {
  from: string;
  to: string;
  operation: string;
  note: string;
  tone: "cyan" | "amber";
}) {
  return (
    <div className={`grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-2 rounded-2xl border-2 p-3 ${tone === "cyan" ? "border-cyan-200 bg-cyan-50" : "border-amber-200 bg-amber-50"}`}>
      <b className="rounded-xl bg-white px-3 py-2 text-lg text-slate-950 shadow-sm">{from}</b>
      <div className="grid justify-items-center">
        <b className={tone === "cyan" ? "text-cyan-900" : "text-amber-900"}>{operation}</b>
        <span className="h-1 w-full rounded-full bg-slate-800" />
        <small className="mt-1 text-center font-bold text-slate-600">{note}</small>
      </div>
      <b className="rounded-xl bg-white px-3 py-2 text-lg text-slate-950 shadow-sm">{to}</b>
    </div>
  );
}

function UnitsGuide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 2"
      heading="Jednostki długości i jednostki masy"
      description="Przechodząc do mniejszej jednostki, liczba rośnie. Przechodząc do większej jednostki, liczba maleje."
      data-measurement-units="units-guide"
    >
      <div className="grid gap-5">
        <section className="rounded-3xl border-2 border-cyan-200 bg-white p-4 shadow-sm">
          <h3 className="text-center text-xl font-black text-cyan-950">Jednostki długości</h3>
          <div className="mt-4 grid grid-cols-5 gap-1 text-center">
            {["km", "m", "dm", "cm", "mm"].map((unit, index) => (
              <div key={unit} className="min-w-0">
                <div className="rounded-xl bg-cyan-100 px-1 py-3 text-lg font-black text-cyan-950">{unit}</div>
                {index < 4 ? <span className="mt-1 block text-xs font-black text-slate-500">→</span> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-center text-sm font-bold text-slate-700 sm:grid-cols-2">
            <p className="rounded-xl bg-slate-50 p-3">1 km = 1000 m</p>
            <p className="rounded-xl bg-slate-50 p-3">1 m = 10 dm = 100 cm = 1000 mm</p>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-amber-200 bg-white p-4 shadow-sm">
          <h3 className="text-center text-xl font-black text-amber-950">Jednostki masy</h3>
          <div className="mt-4 grid grid-cols-5 gap-1 text-center">
            {["t", "kg", "dag", "g", "mg"].map((unit, index) => (
              <div key={unit} className="min-w-0">
                <div className="rounded-xl bg-amber-100 px-1 py-3 text-lg font-black text-amber-950">{unit}</div>
                {index < 4 ? <span className="mt-1 block text-xs font-black text-slate-500">→</span> : null}
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 text-center text-sm font-bold text-slate-700 sm:grid-cols-2">
            <p className="rounded-xl bg-slate-50 p-3">1 t = 1000 kg</p>
            <p className="rounded-xl bg-slate-50 p-3">1 kg = 100 dag = 1000 g</p>
            <p className="rounded-xl bg-slate-50 p-3 sm:col-span-2">1 g = 1000 mg, więc 1 kg = 1 000 000 mg</p>
          </div>
        </section>

        <section className="grid gap-3">
          <UnitArrow from="2,35 m" to="235 cm" operation="· 100" note="przecinek o 2 miejsca w prawo" tone="cyan" />
          <UnitArrow from="4200 mg" to="4,2 g" operation=": 1000" note="przecinek o 3 miejsca w lewo" tone="amber" />
        </section>

        <aside className="rounded-2xl bg-violet-100 p-4 text-center font-bold text-violet-950">
          Gdy po przesunięciu przecinka brakuje cyfr, dopisz zera. Najpierw zawsze sprawdź, ile mniejszych jednostek mieści się w jednej większej.
        </aside>
      </div>
    </LessonTaskFrame>
  );
}

function emptyValues(task: MeasurementNumericTask) {
  return Object.fromEntries(task.fields.map((field) => [field.id, ""])) as Record<string, string>;
}

function parsePolishNumber(value: string) {
  return Number(value.replace(",", "."));
}

function NumericSeries({
  activity,
  tasks,
  heading,
  description,
  readOnly,
  onResultChange,
}: Props & {
  tasks: MeasurementNumericTask[];
  heading: string;
  description: string;
}) {
  const [index, setIndex] = useState(0);
  const task = tasks[index];
  const [values, setValues] = useState<Record<string, string>>(() => emptyValues(tasks[0]));
  const [active, setActive] = useState(tasks[0].fields[0].id);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);

  const showTask = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(tasks.length - 1, nextIndex));
    const nextTask = tasks[safeIndex];
    setIndex(safeIndex);
    setValues(emptyValues(nextTask));
    setActive(nextTask.fields[0]?.id ?? "");
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };

  const advance = (currentCorrect = false) => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, Object.values(values).join("; "));
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setValues(emptyValues(tasks[nextIndex]));
    setActive(tasks[nextIndex].fields[0].id);
    setFeedback(null);
    onResultChange?.(null);
  };

  const edit = (key: string) => {
    if (readOnly || feedback === "correct") return;
    setValues((current) => {
      const previous = current[active] ?? "";
      if (key === "backspace") return { ...current, [active]: previous.slice(0, -1) };
      if (key === "," && previous.includes(",")) return current;
      if (key === "," && !previous) return { ...current, [active]: "0," };
      return { ...current, [active]: `${previous}${key}`.slice(0, 8) };
    });
    setFeedback(null);
  };

  const check = () => {
    if (task.fields.some((field) => !(values[field.id] ?? "").trim())) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = task.fields.every((field) => Math.abs(parsePolishNumber(values[field.id]) - field.answer) < 0.000001);
    setFeedback(correct ? "correct" : "incorrect");
    if (!correct) {
      setMistakeMade(true);
      onResultChange?.(null, Object.values(values).join("; "));
    } else {
      window.setTimeout(() => advance(true), 650);
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 2"
      heading={heading}
      description={description}
      questionNumber={index + 1}
      questionCount={tasks.length}
      data-measurement-units={activity}
    >
      <div className="grid gap-5">
        {readOnly ? (
          <nav
            aria-label="Nawigacja po zadaniach"
            className="grid grid-cols-2 gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3"
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={() => showTask(index - 1)}
              className="min-h-11 rounded-xl border border-indigo-200 bg-white px-3 font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Poprzednie zadanie
            </button>
            <button
              type="button"
              disabled={index === tasks.length - 1}
              onClick={() => showTask(index + 1)}
              className="min-h-11 rounded-xl border border-indigo-200 bg-white px-3 font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Następne zadanie →
            </button>
          </nav>
        ) : null}
        {task.image ? (
          <figure className="grid min-h-48 place-items-center overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-3">
            <Image src={task.image.src} alt={task.image.alt} width={1254} height={1254} className="h-44 w-auto object-contain sm:h-52" />
          </figure>
        ) : null}

        <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-5 text-center">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
          {task.detail ? <p className="mx-auto mt-3 max-w-2xl font-semibold text-slate-700">{task.detail}</p> : null}
          {task.equation ? (
            <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-2xl bg-white px-5 py-3 text-2xl font-black text-indigo-950 shadow">
              <span>{task.equation.value} {task.equation.fromUnit}</span>
              <span>=</span>
              <span className="min-w-20 border-b-4 border-indigo-300">&nbsp;</span>
              <span>{task.equation.toUnit}</span>
            </div>
          ) : null}
        </section>

        <div className={`grid gap-3 ${task.fields.length > 1 ? "sm:grid-cols-2" : "mx-auto w-full max-w-sm"}`}>
          {task.fields.map((field) => (
            <label
              key={field.id}
              className={`grid min-h-28 place-items-center gap-2 rounded-2xl border-2 p-3 text-center ${active === field.id ? "border-violet-700 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 bg-white"}`}
            >
              <span className="font-black text-slate-700">{field.label}</span>
              <span className="flex items-center gap-2">
                <input
                  aria-label={field.label}
                  inputMode="none"
                  readOnly
                  value={values[field.id] ?? ""}
                  onClick={() => setActive(field.id)}
                  onFocus={() => setActive(field.id)}
                  className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none"
                />
                {field.unit ? <b className="text-lg text-slate-950">{field.unit}</b> : null}
              </span>
            </label>
          ))}
        </div>

        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wyniki przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">{index === tasks.length - 1 ? "✓ Dobrze. Ukończono serię zadań." : "✓ Dobrze. Za chwilę pojawi się następne zadanie."}</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3">
            <p role="status" className="rounded-xl bg-rose-100 p-3 text-center font-black text-rose-950">Sprawdź obliczenie. {task.hint}</p>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}

        {!readOnly && feedback !== "correct" && feedback !== "incorrect" ? (
          <LessonNumericKeypad
            onKey={edit}
            onConfirm={check}
            allowSeparator
            label={activity === "price-per-kilogram" ? "Kalkulator do zadania tekstowego" : "Kalkulator do zamiany jednostek"}
            helperText="Dotknij wybranej kratki, wpisz wynik i zatwierdź."
          />
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

export function MeasurementUnitsLessonLab(props: Props) {
  if (props.activity === "units-guide") return <UnitsGuide />;
  if (props.activity === "length-conversions") {
    return <NumericSeries key="length-conversions" {...props} tasks={LENGTH_CONVERSION_TASKS} heading="Zamiana jednostek długości" description="Ustal zależność między jednostkami, a następnie przesuń przecinek lub dopisz potrzebne zera." />;
  }
  if (props.activity === "mass-conversions") {
    return <NumericSeries key="mass-conversions" {...props} tasks={MASS_CONVERSION_TASKS} heading="Zamiana jednostek masy" description="Pamiętaj także o miligramach: 1 g = 1000 mg." />;
  }
  return <NumericSeries {...props} tasks={PRICE_PER_KILOGRAM_TASKS} heading="Cena produktu za 1 kilogram" description="Najpierw oblicz liczbę jednakowych porcji w 1 kg, a potem cenę całego kilograma." />;
}
