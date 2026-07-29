"use client";

import { useState, type PointerEvent } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import {
  BAR_CHART_READING_TASKS,
  LINE_GRAPH_READING_TASKS,
  TABLE_READING_TASKS,
  TABLE_TO_CHART_TASKS,
  TABLE_TO_LINE_GRAPH_TASKS,
  type InformationDataSet,
  type InformationQuestion,
  type InformationReadingActivity,
} from "@/lib/math/everyday/informationReading";

interface Props {
  activity: InformationReadingActivity;
  slideId?: string;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

function DataTable({ data }: { data: InformationDataSet }) {
  const rows = data.series ?? [{ label: data.unit, values: data.values, color: "violet" as const }];
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto min-w-[28rem] border-separate border-spacing-0 overflow-hidden rounded-2xl text-center">
        <caption className="mb-3 text-xl font-black text-slate-950">{data.title}</caption>
        <thead>
          <tr>
            <th className="border border-indigo-200 bg-indigo-100 px-4 py-3 text-left font-black">Kategoria</th>
            {data.labels.map((label) => <th key={label} className="border border-indigo-200 bg-indigo-100 px-4 py-3 font-black">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="border border-indigo-200 bg-cyan-50 px-4 py-3 text-left font-black">{row.label}</th>
              {row.values.map((value, index) => <td key={`${row.label}-${data.labels[index]}-${value}`} className="border border-indigo-200 bg-white px-4 py-3 text-xl font-black">{value}</td>)}
            </tr>
          ))}
          {data.series && data.showTotals !== false ? (
            <tr>
              <th className="border border-indigo-200 bg-amber-50 px-4 py-3 text-left font-black">Razem</th>
              {data.values.map((value, index) => <td key={`total-${data.labels[index]}-${value}`} className="border border-indigo-200 bg-amber-50 px-4 py-3 text-xl font-black">{value}</td>)}
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function EditableDataTable({
  data,
  values,
  activeIndex,
  disabled,
  onSelect,
}: {
  data: InformationDataSet;
  values: string[];
  activeIndex: number;
  disabled: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto min-w-[28rem] border-separate border-spacing-0 overflow-hidden rounded-2xl text-center">
        <caption className="mb-3 text-xl font-black text-slate-950">{data.title}</caption>
        <thead>
          <tr>
            <th className="border border-indigo-200 bg-indigo-100 px-4 py-3 text-left font-black">Kategoria</th>
            {data.labels.map((label) => <th key={label} className="border border-indigo-200 bg-indigo-100 px-4 py-3 font-black">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="border border-indigo-200 bg-cyan-50 px-4 py-3 text-left font-black">{data.unit}</th>
            {data.labels.map((label, index) => (
              <td key={label} className="border border-indigo-200 bg-white p-2">
                <input
                  aria-label={`Wartość w tabeli: ${label}`}
                  inputMode="none"
                  readOnly
                  disabled={disabled}
                  value={values[index] ?? ""}
                  onClick={() => onSelect(index)}
                  className={`mx-auto h-12 w-16 rounded-xl border-2 text-center text-xl font-black outline-none ${
                    activeIndex === index ? "border-cyan-500 bg-cyan-50 ring-4 ring-cyan-100" : "border-indigo-200 bg-white"
                  }`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const BAR_COLORS = {
  violet: "from-violet-800 to-violet-400",
  cyan: "from-cyan-700 to-cyan-300",
  amber: "from-amber-600 to-amber-300",
} as const;

const LINE_COLORS = {
  violet: "#6d28d9",
  cyan: "#0891b2",
  amber: "#d97706",
} as const;

function GroupedBarChart({ data }: { data: InformationDataSet }) {
  const series = data.series ?? [];
  const maximumValue = Math.max(...series.flatMap((row) => row.values));
  const maximum = Math.max(10, Math.ceil(maximumValue / 10) * 10);
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((maximum * (5 - index)) / 5));

  return (
    <figure className="grid gap-3" aria-label={`Diagram słupkowy z dwiema seriami: ${data.title}`}>
      <figcaption className="text-center text-xl font-black text-slate-950">{data.title}</figcaption>
      <div className="flex flex-wrap justify-center gap-4">
        {series.map((row) => (
          <span key={row.label} className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
            <i className={`h-4 w-4 rounded bg-gradient-to-t ${BAR_COLORS[row.color]}`} />
            {row.label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[3rem_1fr] gap-2">
        <div className="flex h-72 flex-col justify-between pb-8 text-right text-xs font-bold text-slate-600">
          {ticks.map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <div
          className="relative grid h-72 items-end gap-3 border-b-2 border-l-2 border-slate-800 px-3 pb-8"
          style={{
            gridTemplateColumns: `repeat(${data.labels.length}, minmax(0, 1fr))`,
            backgroundImage: "repeating-linear-gradient(to top, transparent 0, transparent calc(20% - 1px), #cbd5e1 20%)",
          }}
        >
          {data.labels.map((label, labelIndex) => (
            <div key={label} className="relative flex h-full items-end justify-center gap-1">
              {series.map((row) => (
                <span
                  key={`${label}-${row.label}`}
                  aria-label={`${label}, ${row.label}: ${row.values[labelIndex]} ${data.unit}`}
                  className={`relative w-[38%] rounded-t-lg bg-gradient-to-t ${BAR_COLORS[row.color]} shadow`}
                  style={{ height: `${(row.values[labelIndex]! / maximum) * 100}%` }}
                >
                  <b className="absolute inset-x-0 -top-6 text-center text-xs text-slate-900">{row.values[labelIndex]}</b>
                </span>
              ))}
              <b className="absolute inset-x-0 bottom-[-1.7rem] truncate text-center text-xs text-slate-950 sm:text-sm">{label}</b>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-bold text-slate-600">Wartości podano w: {data.unit}.</p>
    </figure>
  );
}

function LineGraph({
  data,
  values,
  interactive = false,
  onChange,
}: {
  data: InformationDataSet;
  values?: number[];
  interactive?: boolean;
  onChange?: (index: number, value: number) => void;
}) {
  const series = data.series ?? [{
    label: data.unit,
    values: values ?? data.values,
    color: "violet" as const,
  }];
  const maximumValue = Math.max(...data.values, ...series.flatMap((row) => row.values));
  const maximum = Math.max(10, Math.ceil(maximumValue / 10) * 10);
  const left = 60;
  const right = 570;
  const top = 24;
  const bottom = 248;
  const xAt = (index: number) => left + (index * (right - left)) / Math.max(1, data.labels.length - 1);
  const yAt = (value: number) => bottom - (value / maximum) * (bottom - top);
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((maximum * index) / 5));
  const setPointFromPointer = (index: number, event: PointerEvent<SVGRectElement>) => {
    if (!interactive || !onChange) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const bounds = svg.getBoundingClientRect();
    const pointerY = ((event.clientY - bounds.top) / bounds.height) * 305;
    const value = Math.round(((bottom - pointerY) / (bottom - top)) * maximum);
    onChange(index, Math.max(0, Math.min(maximum, value)));
  };

  return (
    <figure className="grid gap-3" aria-label={`Wykres liniowy: ${data.title}`}>
      <figcaption className="text-center text-xl font-black text-slate-950">{data.title}</figcaption>
      {data.series ? (
        <div className="flex flex-wrap justify-center gap-4">
          {series.map((row) => (
            <span key={row.label} className="inline-flex items-center gap-2 text-sm font-black text-slate-800">
              <i className="h-1 w-8 rounded-full" style={{ backgroundColor: LINE_COLORS[row.color] }} />
              {row.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl bg-white p-2 shadow-inner">
        <svg viewBox="0 0 600 305" className="mx-auto min-w-[36rem]" role="img" aria-label={`${data.title}. Jednostka: ${data.unit}.`}>
          {ticks.map((tick) => {
            const y = yAt(tick);
            return (
              <g key={tick}>
                <line x1={left} x2={right} y1={y} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                <text x={left - 10} y={y + 5} textAnchor="end" className="fill-slate-700 text-[13px] font-bold">{tick}</text>
              </g>
            );
          })}
          <line x1={left} x2={left} y1={top} y2={bottom} stroke="#172554" strokeWidth="3" />
          <line x1={left} x2={right} y1={bottom} y2={bottom} stroke="#172554" strokeWidth="3" />
          {data.labels.map((label, index) => (
            <g key={label}>
              <line x1={xAt(index)} x2={xAt(index)} y1={bottom} y2={bottom + 7} stroke="#172554" strokeWidth="2" />
              <text x={xAt(index)} y={bottom + 27} textAnchor="middle" className="fill-slate-900 text-[13px] font-bold">{label}</text>
            </g>
          ))}
          {series.map((row) => {
            const points = row.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
            return (
              <g key={row.label}>
                <polyline points={points} fill="none" stroke={LINE_COLORS[row.color]} strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
                {row.values.map((value, index) => (
                  <g key={`${row.label}-${data.labels[index]}`}>
                    <circle cx={xAt(index)} cy={yAt(value)} r="8" fill={LINE_COLORS[row.color]} stroke="white" strokeWidth="4">
                      <title>{`${data.labels[index]}, ${row.label}: ${value} ${data.unit}`}</title>
                    </circle>
                    <text x={xAt(index)} y={yAt(value) - 13} textAnchor="middle" className="fill-slate-950 text-[12px] font-black">{value}</text>
                  </g>
                ))}
              </g>
            );
          })}
          {interactive ? data.labels.map((label, index) => {
            const columnWidth = (right - left) / Math.max(1, data.labels.length - 1);
            return (
              <rect
                key={`interactive-${label}`}
                x={Math.max(left - 22, xAt(index) - columnWidth / 2)}
                y={top}
                width={Math.min(columnWidth, right - left + 44)}
                height={bottom - top}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Ustaw wysokość punktu ${label}`}
                className="cursor-crosshair touch-none"
                onPointerDown={(event) => setPointFromPointer(index, event)}
              />
            );
          }) : null}
          <text x={right} y={296} textAnchor="end" className="fill-slate-600 text-[12px] font-bold">jednostka: {data.unit}</text>
        </svg>
      </div>
    </figure>
  );
}

function DataMap({ data }: { data: InformationDataSet }) {
  return (
    <figure className="grid gap-3" aria-label={`Mapa danych: ${data.title}`}>
      <figcaption className="text-center text-xl font-black text-slate-950">{data.title}</figcaption>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[2rem] border-2 border-cyan-200 bg-gradient-to-b from-sky-100 to-emerald-50 shadow-inner">
        <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 h-full w-full">
          <path
            d="M21 20 40 9 60 11 72 20 86 27 81 42 88 55 75 67 70 86 52 91 38 84 21 87 14 72 8 58 14 43 10 31Z"
            fill="#dcfce7"
            stroke="#0f766e"
            strokeWidth="1.5"
          />
          <path d="M18 34 37 29 55 34 77 31M19 61 38 56 60 61 79 54M42 13 46 35 42 58 48 86" fill="none" stroke="#99f6e4" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
        {data.mapPoints?.map((point) => (
          <div
            key={point.label}
            className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
          >
            <span className="grid h-11 min-w-11 place-items-center rounded-full border-4 border-white bg-violet-700 px-2 text-base font-black text-white shadow-lg">{point.value}</span>
            <b className="mt-1 rounded-lg bg-white/90 px-2 py-0.5 text-xs text-slate-950 shadow">{point.label}</b>
          </div>
        ))}
        <span className="absolute bottom-3 right-4 rounded-xl bg-white/90 px-3 py-2 text-sm font-black text-cyan-950">jednostka: {data.unit}</span>
      </div>
    </figure>
  );
}

function BarChart({ data, values = data.values, interactive = false, onChange }: { data: InformationDataSet; values?: number[]; interactive?: boolean; onChange?: (index: number, value: number) => void }) {
  const maximum = Math.max(10, Math.ceil(Math.max(...data.values) / 10) * 10);
  const ticks = Array.from({ length: 6 }, (_, index) => Math.round((maximum * (5 - index)) / 5));

  const setFromPointer = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (!interactive || !onChange) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (rect.bottom - event.clientY) / rect.height));
    onChange(index, Math.round(ratio * maximum));
  };

  return (
    <figure className="grid gap-3" aria-label={`Diagram słupkowy: ${data.title}`}>
      <figcaption className="text-center text-xl font-black text-slate-950">{data.title}</figcaption>
      <div className="grid grid-cols-[3rem_1fr] gap-2">
        <div className="flex h-72 flex-col justify-between pb-8 text-right text-xs font-bold text-slate-600">
          {ticks.map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <div
          className="relative grid h-72 items-end gap-2 border-b-2 border-l-2 border-slate-800 px-2 pb-8 sm:gap-4"
          style={{
            gridTemplateColumns: `repeat(${data.labels.length}, minmax(0, 1fr))`,
            backgroundImage: "repeating-linear-gradient(to top, transparent 0, transparent calc(20% - 1px), #cbd5e1 20%)",
          }}
        >
          {data.labels.map((label, index) => (
            <button
              key={label}
              type="button"
              disabled={!interactive}
              onPointerDown={(event) => setFromPointer(index, event)}
              aria-label={interactive ? `Ustaw wysokość słupka ${label}. Aktualnie ${values[index]}.` : `${label}: ${values[index]} ${data.unit}`}
              className="group relative h-full min-w-0 disabled:cursor-default"
            >
              <span
                className="absolute inset-x-[12%] bottom-0 rounded-t-xl bg-gradient-to-t from-violet-700 to-cyan-400 shadow transition-[height] duration-300"
                style={{ height: `${(values[index]! / maximum) * 100}%` }}
              />
              <b className="absolute inset-x-0 bottom-[-1.7rem] truncate text-xs text-slate-950 sm:text-sm">{label}</b>
              <b className="absolute inset-x-0 text-center text-sm text-violet-950" style={{ bottom: `min(calc(${(values[index]! / maximum) * 100}% + .25rem), calc(100% - 1.25rem))` }}>{values[index]}</b>
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-sm font-bold text-slate-600">Wartości podano w: {data.unit}.</p>
    </figure>
  );
}

function InformationGuide() {
  const data: InformationDataSet = {
    title: "Uczniowie na zajęciach",
    labels: ["Piłka", "Pływanie", "Taniec", "Szachy"],
    values: [8, 5, 7, 4],
    unit: "uczniów",
  };
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 6"
      heading="Tabela i diagram słupkowy"
      description="Tabela porządkuje dane w wierszach i kolumnach. Diagram słupkowy pokazuje te same wartości za pomocą wysokości słupków."
      data-information-reading="guide"
    >
      <div className="grid gap-6">
        <DataTable data={data} />
        <BarChart data={data} />
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl bg-indigo-50 p-4 font-bold"><b className="block text-indigo-800">1. Przeczytaj tytuł</b>Sprawdź, czego dotyczą dane.</p>
          <p className="rounded-2xl bg-cyan-50 p-4 font-bold"><b className="block text-cyan-800">2. Sprawdź jednostkę</b>Ustal, co oznaczają liczby.</p>
          <p className="rounded-2xl bg-amber-50 p-4 font-bold"><b className="block text-amber-800">3. Zachowaj skalę</b>Jednakowe odstępy oznaczają jednakowy przyrost wartości.</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function LineGraphGuide() {
  const data: InformationDataSet = {
    title: "Temperatura powietrza",
    labels: ["8:00", "10:00", "12:00", "14:00", "16:00"],
    values: [7, 11, 16, 18, 14],
    unit: "°C",
  };
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 7"
      heading="Od tabeli do wykresu"
      description="Każda para: czas i wartość tworzy jeden punkt. Punkty umieszczamy nad właściwymi opisami osi, a następnie łączymy je po kolei."
      data-information-reading="line-graph-guide"
    >
      <div className="grid gap-6">
        <DataTable data={data} />
        <div className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4">
          <LineGraph data={data} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl bg-indigo-50 p-4 font-bold"><b className="block text-indigo-800">1. Odczytaj osie</b>Na osi poziomej są kolejne chwile, a na pionowej wartości.</p>
          <p className="rounded-2xl bg-cyan-50 p-4 font-bold"><b className="block text-cyan-800">2. Zaznacz punkty</b>Każda liczba z tabeli wyznacza wysokość jednego punktu.</p>
          <p className="rounded-2xl bg-amber-50 p-4 font-bold"><b className="block text-amber-800">3. Połącz po kolei</b>Linia pokazuje, jak wartość zmieniała się między pomiarami.</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function NumericSeries({ tasks, activity, readOnly = false, onResultChange }: { tasks: InformationQuestion[]; activity: "table-reading" | "bar-chart-reading" | "line-graph-reading"; readOnly?: boolean; onResultChange?: Props["onResultChange"] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index]!;
  const showTaskNavigator = readOnly || !onResultChange;

  const reset = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(tasks.length - 1, nextIndex)));
    setAnswer("");
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };
  const advance = (correct: boolean) => {
    if (index === tasks.length - 1) {
      onResultChange?.(correct && !mistakeMade, answer);
      return;
    }
    setIndex((current) => current + 1);
    setAnswer("");
    setFeedback(null);
  };
  const edit = (key: string) => {
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 6));
    setFeedback(null);
  };
  const check = () => {
    if (!answer) {
      setFeedback("missing");
      return;
    }
    const correct = Number(answer) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 650);
    else setMistakeMade(true);
  };

  return (
    <LessonTaskFrame
      eyebrow={activity === "line-graph-reading" ? "Dział 3 · Temat 7" : "Dział 3 · Temat 6"}
      heading={activity === "table-reading" ? "Odczytywanie informacji z tabel" : activity === "line-graph-reading" ? "Odczytywanie danych z wykresu" : "Odczytywanie diagramów słupkowych"}
      description={activity === "table-reading" ? "Odczytaj właściwe komórki tabeli i wykonaj potrzebne obliczenie." : activity === "line-graph-reading" ? "Odczytaj punkty i zmiany wartości przedstawione na wykresie." : "Odczytaj wysokości właściwych słupków i odpowiedz na pytanie."}
      questionNumber={showTaskNavigator ? undefined : index + 1}
      questionCount={showTaskNavigator ? undefined : tasks.length}
      data-information-reading={activity}
    >
      <div className="grid gap-5">
        {showTaskNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={tasks.length} onPrevious={() => reset(index - 1)} onNext={() => reset(index + 1)} /> : null}
        <section className="rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-4 sm:p-6">
          {activity === "table-reading"
            ? <DataTable data={task.data} />
            : activity === "line-graph-reading"
              ? <LineGraph data={task.data} />
            : task.visual === "map"
              ? <DataMap data={task.data} />
              : task.data.series
                ? <GroupedBarChart data={task.data} />
                : <BarChart data={task.data} />}
        </section>
        <section className="grid gap-4 rounded-3xl border-2 border-violet-200 bg-white p-5">
          <h3 className="text-center text-xl font-black">{task.prompt}</h3>
          <div className="flex items-center justify-center gap-2">
            <input aria-label="Odpowiedź liczbowa" inputMode="none" readOnly value={answer} className="min-h-14 w-36 rounded-2xl border-2 border-violet-400 bg-violet-50 text-center text-2xl font-black" />
            {task.answerUnit ? <b>{task.answerUnit}</b> : null}
          </div>
          {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={feedback === "correct"} label="Klawiatura do odpowiedzi" /> : null}
          {feedback === "missing" ? <p className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wynik przed zatwierdzeniem.</p> : null}
          {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Informacja została poprawnie odczytana.</p> : null}
          {feedback === "incorrect" ? (
            <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950">
              <p>Spróbuj innym razem. Poprawny wynik to {task.answer}{task.answerUnit ? ` ${task.answerUnit}` : ""}. Dziś bez punktu.</p>
              <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
            </div>
          ) : null}
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function BuildLineGraphSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState(() => TABLE_TO_LINE_GRAPH_TASKS[0]!.values.map(() => 0));
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = TABLE_TO_LINE_GRAPH_TASKS[index]!;
  const maximum = Math.max(10, Math.ceil(Math.max(...task.values) / 5) * 5);
  const showTaskNavigator = readOnly || !onResultChange;

  const reset = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(TABLE_TO_LINE_GRAPH_TASKS.length - 1, nextIndex));
    setIndex(safeIndex);
    setValues(TABLE_TO_LINE_GRAPH_TASKS[safeIndex]!.values.map(() => 0));
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };
  const advance = (correct: boolean) => {
    if (index === TABLE_TO_LINE_GRAPH_TASKS.length - 1) {
      onResultChange?.(correct && !mistakeMade, values.join(", "));
      return;
    }
    const next = index + 1;
    setIndex(next);
    setValues(TABLE_TO_LINE_GRAPH_TASKS[next]!.values.map(() => 0));
    setFeedback(null);
  };
  const changePoint = (position: number, delta: number) => {
    setValues((current) => current.map((value, valueIndex) => valueIndex === position ? Math.max(0, Math.min(maximum, value + delta)) : value));
    setFeedback(null);
  };
  const check = () => {
    if (values.some((value) => value === 0)) {
      setFeedback("missing");
      return;
    }
    const correct = values.every((value, position) => value === task.values[position]);
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 650);
    else setMistakeMade(true);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 7"
      heading="Narysuj wykres na podstawie tabeli"
      description="Ustaw każdy punkt na wysokości odczytanej z tabeli. Punkty zostaną połączone w kolejności zapisanej na osi."
      questionNumber={showTaskNavigator ? undefined : index + 1}
      questionCount={showTaskNavigator ? undefined : TABLE_TO_LINE_GRAPH_TASKS.length}
      data-information-reading="table-to-line-graph"
    >
      <div className="grid gap-5">
        {showTaskNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={TABLE_TO_LINE_GRAPH_TASKS.length} onPrevious={() => reset(index - 1)} onNext={() => reset(index + 1)} /> : null}
        <DataTable data={task} />
        <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50/60 p-4">
          <LineGraph
            data={task}
            values={values}
            interactive={!readOnly && feedback !== "correct"}
            onChange={(position, value) => {
              setValues((current) => current.map((currentValue, valueIndex) => valueIndex === position ? value : currentValue));
              setFeedback(null);
            }}
          />
          {!readOnly ? (
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${task.labels.length}, minmax(0, 1fr))` }}>
              {task.labels.map((label, position) => (
                <div key={label} className="grid gap-1 text-center">
                  <b className="truncate text-xs">{label}</b>
                  <output className="rounded-lg bg-white py-1 font-black">{values[position]}</output>
                  <button type="button" aria-label={`Podnieś punkt ${label}`} onClick={() => changePoint(position, 1)} className="min-h-10 rounded-xl bg-violet-700 font-black text-white">+</button>
                  <button type="button" aria-label={`Obniż punkt ${label}`} onClick={() => changePoint(position, -1)} className="min-h-10 rounded-xl bg-indigo-100 font-black text-indigo-950">−</button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
        {!readOnly ? <button type="button" onClick={check} disabled={feedback === "correct"} className="min-h-14 rounded-2xl bg-violet-700 px-5 text-lg font-black text-white disabled:opacity-50">Zatwierdź wykres</button> : null}
        {feedback === "missing" ? <p className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Ustaw wszystkie punkty przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze! Wszystkie punkty odpowiadają danym z tabeli.</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950">
            <p>Spróbuj innym razem. Poprawne wysokości punktów to: {task.values.join(", ")}. Dziś bez punktu.</p>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

function BuildChartSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState(() => TABLE_TO_CHART_TASKS[0]!.values.map(() => 0));
  const [tableValues, setTableValues] = useState(() => TABLE_TO_CHART_TASKS[0]!.values.map((value) => String(value)));
  const [activeTableIndex, setActiveTableIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = TABLE_TO_CHART_TASKS[index]!;
  const maximum = Math.max(10, Math.ceil(Math.max(...task.values) / 10) * 10);
  const showTaskNavigator = readOnly || !onResultChange;

  const reset = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(TABLE_TO_CHART_TASKS.length - 1, nextIndex));
    setIndex(safeIndex);
    setValues(TABLE_TO_CHART_TASKS[safeIndex]!.values.map(() => 0));
    setTableValues(TABLE_TO_CHART_TASKS[safeIndex]!.requiresTableInput ? TABLE_TO_CHART_TASKS[safeIndex]!.values.map(() => "") : TABLE_TO_CHART_TASKS[safeIndex]!.values.map(String));
    setActiveTableIndex(0);
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };
  const advance = (correct: boolean) => {
    if (index === TABLE_TO_CHART_TASKS.length - 1) {
      onResultChange?.(correct && !mistakeMade, values.join(", "));
      return;
    }
    const next = index + 1;
    setIndex(next);
    setValues(TABLE_TO_CHART_TASKS[next]!.values.map(() => 0));
    setTableValues(TABLE_TO_CHART_TASKS[next]!.requiresTableInput ? TABLE_TO_CHART_TASKS[next]!.values.map(() => "") : TABLE_TO_CHART_TASKS[next]!.values.map(String));
    setActiveTableIndex(0);
    setFeedback(null);
  };
  const check = () => {
    if (values.some((value) => value === 0) || (task.requiresTableInput && tableValues.some((value) => value === ""))) {
      setFeedback("missing");
      return;
    }
    const tableCorrect = !task.requiresTableInput || tableValues.every((value, position) => Number(value) === task.values[position]);
    const correct = tableCorrect && values.every((value, position) => value === task.values[position]);
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 650);
    else setMistakeMade(true);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 6"
      heading="Z tabeli do diagramu słupkowego"
      description="Odczytaj wartości z tabeli. Dotknij wykresu na odpowiedniej wysokości albo użyj przycisków pod słupkami."
      questionNumber={showTaskNavigator ? undefined : index + 1}
      questionCount={showTaskNavigator ? undefined : TABLE_TO_CHART_TASKS.length}
      data-information-reading="table-to-chart"
    >
      <div className="grid gap-5">
        {showTaskNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={TABLE_TO_CHART_TASKS.length} onPrevious={() => reset(index - 1)} onNext={() => reset(index + 1)} /> : null}
        {task.story ? <p className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5 text-lg font-bold leading-relaxed text-amber-950">{task.story}</p> : null}
        {task.requiresTableInput ? (
          <>
            <EditableDataTable
              data={task}
              values={tableValues}
              activeIndex={activeTableIndex}
              disabled={readOnly || feedback === "correct"}
              onSelect={setActiveTableIndex}
            />
            {!readOnly ? (
              <LessonNumericKeypad
                label="Klawiatura do uzupełnienia tabeli"
                helperText="Wybierz puste pole w tabeli i wpisz liczbę podaną w treści."
                disabled={feedback === "correct"}
                onKey={(key) => {
                  setTableValues((current) => current.map((value, valueIndex) => {
                    if (valueIndex !== activeTableIndex) return value;
                    if (key === "backspace") return value.slice(0, -1);
                    return `${value}${key}`.slice(0, 3);
                  }));
                  setFeedback(null);
                }}
              />
            ) : null}
          </>
        ) : <DataTable data={task} />}
        <section className="rounded-3xl border-2 border-cyan-200 bg-cyan-50/60 p-4">
          <BarChart
            data={task}
            values={values}
            interactive={!readOnly && feedback !== "correct"}
            onChange={(position, value) => {
              setValues((current) => current.map((entry, indexValue) => indexValue === position ? value : entry));
              setFeedback(null);
            }}
          />
          {!readOnly ? (
            <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${task.labels.length}, minmax(0, 1fr))` }}>
              {task.labels.map((label, position) => (
                <div key={label} className="grid gap-1">
                  <button type="button" aria-label={`Zwiększ słupek ${label}`} onClick={() => setValues((current) => current.map((value, indexValue) => indexValue === position ? Math.min(maximum, value + 1) : value))} className="min-h-10 rounded-xl bg-violet-700 font-black text-white">+</button>
                  <button type="button" aria-label={`Zmniejsz słupek ${label}`} onClick={() => setValues((current) => current.map((value, indexValue) => indexValue === position ? Math.max(0, value - 1) : value))} className="min-h-10 rounded-xl bg-indigo-100 font-black text-indigo-950">−</button>
                </div>
              ))}
            </div>
          ) : null}
        </section>
        {!readOnly ? <button type="button" onClick={check} disabled={feedback === "correct"} className="min-h-14 rounded-2xl bg-violet-700 px-5 text-lg font-black text-white disabled:opacity-50">Zatwierdź diagram</button> : null}
        {feedback === "missing" ? <p className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">{task.requiresTableInput ? "Uzupełnij całą tabelę i ustaw wysokość każdego słupka." : "Ustaw wysokość każdego słupka."}</p> : null}
        {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">{task.requiresTableInput ? "Dobrze! Tabela i diagram przedstawiają wszystkie dane z treści." : "Dobrze! Diagram przedstawia wszystkie dane z tabeli."}</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950">
            <p>Spróbuj innym razem. Poprawne wysokości słupków to: {task.values.join(", ")}. Dziś bez punktu.</p>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

export function InformationReadingLessonLab({ activity, slideId, readOnly = false, onResultChange }: Props) {
  const seriesKey = `${slideId ?? activity}:${activity}`;
  if (activity === "information-guide") return <InformationGuide />;
  if (activity === "line-graph-guide") return <LineGraphGuide />;
  if (activity === "table-reading") return <NumericSeries key={seriesKey} tasks={TABLE_READING_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "bar-chart-reading") return <NumericSeries key={seriesKey} tasks={BAR_CHART_READING_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "line-graph-reading") return <NumericSeries key={seriesKey} tasks={LINE_GRAPH_READING_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "table-to-line-graph") return <BuildLineGraphSeries key={seriesKey} readOnly={readOnly} onResultChange={onResultChange} />;
  return <BuildChartSeries key={seriesKey} readOnly={readOnly} onResultChange={onResultChange} />;
}
