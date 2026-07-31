"use client";

import { useMemo, useState } from "react";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  isPercentDiagramActivity,
  percentDiagramTask,
  type PercentDiagramActivity,
  type PercentDiagramTask,
} from "@/lib/math/decimals/percentDiagram";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface Props {
  activity: PercentDiagramActivity;
  seed: number;
  taskSeed?: number;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

const PIE_COLORS = ["#4f46e5", "#06b6d4", "#f97316", "#db2777", "#16a34a"];

function PieDiagram({ task }: { task: PercentDiagramTask }) {
  return <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
    <svg viewBox="0 0 320 320" className="mx-auto block w-full max-w-[390px]" role="img" aria-label={`Diagram kołowy: ${task.title}`}>
      <circle cx="160" cy="160" r="112" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="4" />
      {task.categories.map((category, index) => {
        const value = category.values[0]!;
        const start = task.categories.slice(0, index).reduce((sum, item) => sum + item.values[0]!, 0);
        const angle = (start + value / 2) * 3.6 - 90;
        const radians = angle * Math.PI / 180;
        const labelRadius = 72;
        return <g key={category.label}>
          <circle cx="160" cy="160" r="56" fill="none" pathLength="100" stroke={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth="112" strokeDasharray={`${value} ${100 - value}`} strokeDashoffset={-start} transform="rotate(-90 160 160)" />
          <text x={160 + Math.cos(radians) * labelRadius} y={165 + Math.sin(radians) * labelRadius} textAnchor="middle" fontSize="19" fontWeight="900" fill="white" stroke="#0f172a" strokeWidth="3" paintOrder="stroke">{value}%</text>
        </g>;
      })}
      <circle cx="160" cy="160" r="112" fill="none" stroke="white" strokeWidth="3" />
    </svg>
    <Legend task={task} pie />
  </div>;
}

function Legend({ task, pie = false }: { task: PercentDiagramTask; pie?: boolean }) {
  return <aside className="rounded-2xl border-2 border-slate-200 bg-white p-4" aria-label="Legenda diagramu">
    <h4 className="mb-3 text-base font-black text-slate-900">Legenda</h4>
    <ul className="space-y-2">
      {(pie ? task.categories : task.series).map((item, index) => {
        const label = "label" in item ? item.label : item.name;
        const color = pie ? PIE_COLORS[index % PIE_COLORS.length] : "color" in item ? item.color : PIE_COLORS[index % PIE_COLORS.length];
        return <li key={label} className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="h-5 w-5 shrink-0 rounded-md border border-black/10" style={{ backgroundColor: color }} />
          <span>{label}</span>
        </li>;
      })}
    </ul>
  </aside>;
}

function BarDiagram({ task }: { task: PercentDiagramTask }) {
  const width = 680;
  const height = 360;
  const left = 58;
  const top = 28;
  const chartHeight = 250;
  const chartWidth = 570;
  const groupWidth = chartWidth / task.categories.length;
  const barWidth = Math.min(46, groupWidth / (task.series.length + 1));
  return <div className="space-y-4">
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label={`Diagram słupkowy: ${task.title}`}>
      {[0, 20, 40, 60, 80, 100].map((tick) => {
        const y = top + chartHeight - tick / 100 * chartHeight;
        return <g key={tick}>
          <line x1={left} x2={left + chartWidth} y1={y} y2={y} stroke={tick === 0 ? "#334155" : "#cbd5e1"} strokeWidth={tick === 0 ? 3 : 1.5} />
          <text x={left - 10} y={y + 5} textAnchor="end" fontSize="15" fontWeight="800" fill="#475569">{tick}%</text>
        </g>;
      })}
      {task.categories.map((category, categoryIndex) => {
        const center = left + groupWidth * categoryIndex + groupWidth / 2;
        const totalBarsWidth = task.series.length * barWidth + (task.series.length - 1) * 8;
        const startX = center - totalBarsWidth / 2;
        return <g key={category.label}>
          {category.values.map((value, seriesIndex) => {
            const barHeight = value / 100 * chartHeight;
            const x = startX + seriesIndex * (barWidth + 8);
            const y = top + chartHeight - barHeight;
            return <g key={`${category.label}-${seriesIndex}`}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill={task.series[seriesIndex]!.color} />
              <text x={x + barWidth / 2} y={y - 7} textAnchor="middle" fontSize="15" fontWeight="900" fill="#0f172a">{value}%</text>
            </g>;
          })}
          <text x={center} y={top + chartHeight + 28} textAnchor="middle" fontSize="14" fontWeight="800" fill="#334155">{category.label}</text>
        </g>;
      })}
    </svg>
    <div className="mx-auto max-w-xl"><Legend task={task} /></div>
  </div>;
}

function Diagram({ task }: { task: PercentDiagramTask }) {
  return task.kind === "pie" ? <PieDiagram task={task} /> : <BarDiagram task={task} />;
}

function Guide() {
  const task = percentDiagramTask("percent-diagrams-guide", 0);
  return <div className="space-y-5">
    <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-4 sm:p-6">
      <h3 className="text-center text-xl font-black text-indigo-950">Każdy kolor oznacza inną kategorię</h3>
      <p className="mx-auto mt-2 max-w-2xl text-center font-semibold text-slate-700">Najpierw znajdź kolor w legendzie, potem odczytaj procent z diagramu. Wszystkie części diagramu kołowego razem tworzą 100%.</p>
      <div className="mt-4"><Diagram task={task} /></div>
    </section>
    <div className="grid gap-3 sm:grid-cols-3">
      <p className="rounded-2xl bg-cyan-50 p-4 text-center font-black text-cyan-950">Odczytaj pojedynczą wartość.</p>
      <p className="rounded-2xl bg-amber-50 p-4 text-center font-black text-amber-950">Dodaj procenty wybranych kategorii.</p>
      <p className="rounded-2xl bg-emerald-50 p-4 text-center font-black text-emerald-950">Brakującą część oblicz do 100%.</p>
    </div>
  </div>;
}

function PercentDiagramTaskLab({ activity, task, readOnly = false, questionNumber, questionCount, onResultChange }: Props & { task: PercentDiagramTask }) {
  const [answers, setAnswers] = useState<string[]>(() => task.questions.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "missing" | "correct" | "incorrect">("idle");

  const updateAnswer = (key: string) => {
    if (readOnly || status === "correct" || status === "incorrect") return;
    setStatus("idle");
    onResultChange?.(null);
    setAnswers((current) => current.map((value, index) => index === activeIndex
      ? key === "backspace" ? value.slice(0, -1) : `${value}${key}`.slice(0, 3)
      : value));
  };

  const check = () => {
    if (answers.some((answer) => answer.trim() === "")) {
      setStatus("missing");
      return;
    }
    const correct = answers.every((answer, index) => Number(answer) === task.questions[index]!.answer);
    setStatus(correct ? "correct" : "incorrect");
    onResultChange?.(correct, answers.map((answer) => `${answer}%`).join(", "));
  };

  const correctLabel = task.questions.map((question) => `${question.answer}%`).join(", ");
  const heading = activity === "percent-diagrams-guide" ? "Jak czytać diagram procentowy?" : activity === "percent-diagrams-pie" ? "Diagramy kołowe" : "Diagramy słupkowe";

  return <LessonTaskFrame
    eyebrow="Dział 6 · Temat 4"
    heading={heading}
    description={activity === "percent-diagrams-guide" ? "Kolory, legenda i wartości procentowe opisują podział całej grupy." : "Odczytaj diagram i odpowiedz na wszystkie pytania znajdujące się pod nim."}
    questionNumber={questionNumber}
    questionCount={questionCount}
    contentClassName="space-y-5"
    data-percent-diagram-lab
    data-percent-diagram-activity={activity}
  >
    {activity === "percent-diagrams-guide" ? <Guide /> : <>
      <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-3 sm:p-5">
        <h3 className="mb-3 text-center text-xl font-black text-slate-950">{task.title}</h3>
        <Diagram task={task} />
      </section>
      <section className="space-y-3" aria-label="Pytania do diagramu">
        {task.questions.map((question, index) => <div key={question.prompt} className={`grid items-center gap-3 rounded-2xl border-2 p-3 sm:grid-cols-[minmax(0,1fr)_120px] ${activeIndex === index ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}>
          <label htmlFor={`percent-diagram-answer-${index}`} className="font-bold leading-snug text-slate-900">{index + 1}. {question.prompt}</label>
          <div className="flex items-center justify-end gap-2">
            <input
              id={`percent-diagram-answer-${index}`}
              value={answers[index]}
              inputMode="none"
              readOnly
              onClick={() => setActiveIndex(index)}
              aria-label={`Odpowiedź na pytanie ${index + 1}`}
              className="h-12 w-20 rounded-xl border-2 border-violet-300 bg-white text-center text-xl font-black outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
            <span className="text-lg font-black">%</span>
          </div>
        </div>)}
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={updateAnswer} onConfirm={check} disabled={status === "correct" || status === "incorrect"} label="Klawiatura do odpowiedzi" helperText="Wybierz pole, wpisz procent i uzupełnij wszystkie trzy odpowiedzi." /> : null}
      {status === "missing" ? <p role="alert" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center font-black text-amber-950">Uzupełnij wszystkie odpowiedzi przed zatwierdzeniem.</p> : null}
      {status === "correct" ? <p role="status" className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center font-black text-emerald-950">Dobrze! Wszystkie informacje zostały poprawnie odczytane z diagramu.</p> : null}
      {status === "incorrect" ? <div className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-center font-black text-amber-950">
        <p>Spróbuj innym razem. Poprawny wynik to: {correctLabel}. Dziś bez punktu.</p>
        <p className="text-sm">Przejdź dalej bez punktu.</p>
      </div> : null}
    </>}
  </LessonTaskFrame>;
}

export function PercentDiagramLab(props: Props) {
  const effectiveSeed = props.taskSeed ?? props.seed;
  const task = useMemo(() => percentDiagramTask(props.activity, effectiveSeed), [props.activity, effectiveSeed]);
  return <PercentDiagramTaskLab key={`${props.activity}-${effectiveSeed}`} {...props} task={task} />;
}

export { isPercentDiagramActivity };
