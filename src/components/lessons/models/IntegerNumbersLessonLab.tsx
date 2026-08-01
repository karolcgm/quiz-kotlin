"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { Grade6SignedNumbersLessonLab, type Grade6SignedNumbersActivity } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";

export type IntegerNumbersActivity =
  | "integer-introduction"
  | "integer-number-line"
  | "integer-select"
  | "integer-temperatures"
  | "integer-compare"
  | "integer-opposites"
  | "g6-number-sets"
  | "g6-absolute-value"
  | "g6-number-line"
  | "g6-select"
  | "g6-compare"
  | "g6-opposites";

interface IntegerNumbersLessonLabProps {
  activity: IntegerNumbersActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface ChoiceTask {
  id: string;
  prompt: string;
  detail?: string;
  options: string[];
  answer: string;
  success: string;
  reference?: number;
  emphasis?: "greater" | "smaller";
  left?: number;
  right?: number;
}

interface SelectManyTask {
  id: string;
  prompt: string;
  values: number[];
  answer: number[];
  success: string;
}

interface TemperatureTask {
  id: string;
  prompt: string;
  cities: Array<{ name: string; value: number; x: number; y: number }>;
  answer: string;
  success: string;
}

const formatInteger = (value: number, showPositiveSign = false) => value > 0 && showPositiveSign ? `+${value}` : String(value);

function NumberLine({ reference, emphasis, compact = false }: { reference?: number; emphasis?: "greater" | "smaller"; compact?: boolean }) {
  const values = Array.from({ length: 21 }, (_, index) => index - 10);
  const xFor = (value: number) => 44 + (value + 10) * 33;
  const highlightedText = reference === undefined
    ? "Na osi liczbowej liczby rosną w prawo, a maleją w lewo."
    : emphasis === "greater"
      ? `Liczby większe od ${formatInteger(reference)} leżą na prawo od tej liczby.`
      : emphasis === "smaller"
        ? `Liczby mniejsze od ${formatInteger(reference)} leżą na lewo od tej liczby.`
        : `Zaznaczona liczba to ${formatInteger(reference)}.`;

  return (
    <figure className={`rounded-3xl border-2 border-sky-200 bg-sky-50 p-3 ${compact ? "" : "shadow-sm"}`}>
      <svg role="img" aria-label={highlightedText} viewBox="0 0 760 150" className="mx-auto block w-full min-w-[620px] max-w-none">
        <defs>
          <linearGradient id="integer-line-bg" x1="0" x2="1">
            <stop offset="0" stopColor="#dbeafe" />
            <stop offset=".5" stopColor="#f5f3ff" />
            <stop offset="1" stopColor="#dcfce7" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="740" height="126" rx="24" fill="url(#integer-line-bg)" />
        {reference !== undefined && emphasis ? (
          <rect
            x={emphasis === "greater" ? xFor(reference) : 30}
            y="28"
            width={emphasis === "greater" ? 710 - xFor(reference) : xFor(reference) - 30}
            height="72"
            rx="16"
            fill={emphasis === "greater" ? "#bbf7d0" : "#fecdd3"}
            opacity=".78"
          />
        ) : null}
        <line x1="30" y1="76" x2="725" y2="76" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        <path d="M 725 76 l -16 -10 M 725 76 l -16 10" fill="none" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        <path d="M 30 76 l 16 -10 M 30 76 l 16 10" fill="none" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        {values.map((value) => {
          const x = xFor(value);
          const isZero = value === 0;
          const isReference = value === reference;
          return <g key={value}>
            <line x1={x} y1="59" x2={x} y2="94" stroke={isZero ? "#7e22ce" : "#1e3a8a"} strokeWidth={isZero ? "5" : "3"} />
            <circle cx={x} cy="76" r={isReference ? "13" : isZero ? "10" : "6"} fill={isReference ? "#facc15" : isZero ? "#c084fc" : "white"} stroke={isReference ? "#a16207" : "#1e3a8a"} strokeWidth={isReference || isZero ? "4" : "2"} />
            <text x={x} y="119" textAnchor="middle" fill={isZero ? "#6b21a8" : "#172554"} fontSize="19" fontWeight="800">{formatInteger(value, value > 0)}</text>
          </g>;
        })}
      </svg>
      <figcaption className="mt-1 text-center text-sm font-black text-sky-950">{highlightedText}</figcaption>
    </figure>
  );
}

function Feedback({ text, solved }: { text: string | null; solved?: boolean }) {
  if (!text) return null;
  return <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p>;
}

const MOTION_SCENARIOS = [
  {
    id: "add-positive",
    label: "Dodaj +4",
    start: -2,
    change: 4,
    expression: "−2 + 4 = 2",
    explanation: "Dodanie liczby dodatniej oznacza ruch w prawo.",
    color: "#16a34a",
  },
  {
    id: "add-negative",
    label: "Dodaj −3",
    start: 4,
    change: -3,
    expression: "4 + (−3) = 1",
    explanation: "Dodanie liczby ujemnej oznacza ruch w lewo.",
    color: "#2563eb",
  },
  {
    id: "subtract-positive",
    label: "Odejmij +4",
    start: 3,
    change: -4,
    expression: "3 − 4 = −1",
    explanation: "Odjęcie liczby dodatniej oznacza ruch w lewo.",
    color: "#dc2626",
  },
  {
    id: "subtract-negative",
    label: "Odejmij −3",
    start: -4,
    change: 3,
    expression: "−4 − (−3) = −1",
    explanation: "Odjęcie liczby ujemnej oznacza ruch w prawo.",
    color: "#7c3aed",
  },
] as const;

function AxisMotionPreview({ readOnly }: { readOnly: boolean }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const scenario = MOTION_SCENARIOS[scenarioIndex]!;
  const totalSteps = Math.abs(scenario.change);
  const direction = Math.sign(scenario.change);
  const current = scenario.start + direction * step;
  const target = scenario.start + scenario.change;
  const values = Array.from({ length: 21 }, (_, index) => index - 10);
  const xFor = (value: number) => 44 + (value + 10) * 33;

  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  const goOneStep = () => {
    if (readOnly || step >= totalSteps) return;
    setStep((value) => value + 1);
  };
  const play = () => {
    if (readOnly) return;
    if (step >= totalSteps) setStep(0);
    stop();
    setPlaying(true);
    timer.current = window.setInterval(() => {
      setStep((value) => {
        if (value >= totalSteps - 1) {
          stop();
          return totalSteps;
        }
        return value + 1;
      });
    }, 520);
  };
  const selectScenario = (index: number) => {
    stop();
    setScenarioIndex(index);
    setStep(0);
  };

  return (
    <section className="overflow-hidden rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 shadow-sm sm:p-5" aria-label="Animacja ruchu po osi liczbowej">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-violet-800">Animacja: ruch po osi</p>
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">Każda zmiana to krok w prawo albo w lewo</h3>
        </div>
      </div>
      <div className="mt-4 rounded-3xl border-2 border-violet-300 bg-white px-4 py-4 text-center shadow-sm">
        <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Obliczamy</p>
        <p className="mt-1 font-mono text-4xl font-black tracking-tight text-violet-950 sm:text-6xl">{scenario.expression}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Wybierz ruch po osi">
        {MOTION_SCENARIOS.map((item, index) => <button key={item.id} type="button" disabled={readOnly} onClick={() => selectScenario(index)} className={`min-h-11 rounded-xl border-2 px-4 font-black transition disabled:opacity-50 ${index === scenarioIndex ? "border-violet-700 bg-violet-700 text-white" : "border-violet-200 bg-white text-violet-950"}`}>{item.label}</button>)}
      </div>
      <div className="mt-4 rounded-3xl border-2 border-sky-200 bg-white p-3 sm:p-4">
        <p className="mb-2 text-center text-xs font-black uppercase tracking-[.16em] text-sky-800">Ruch na osi dla tego działania</p>
        <div className="overflow-x-auto">
          <svg role="img" aria-label={`Ruch od ${formatInteger(scenario.start)} do ${formatInteger(target)} po osi liczbowej`} viewBox="0 0 760 185" className="block min-w-[660px] w-full">
          <rect x="12" y="10" width="736" height="160" rx="24" fill="#ffffff" stroke="#ddd6fe" strokeWidth="3" />
          <line x1="30" y1="102" x2="725" y2="102" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
          <path d="M 725 102 l -16 -10 M 725 102 l -16 10 M 30 102 l 16 -10 M 30 102 l 16 10" fill="none" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
          <line x1={xFor(scenario.start)} y1="55" x2={xFor(current)} y2="55" stroke={scenario.color} strokeWidth="9" strokeLinecap="round" />
          {values.map((value) => <g key={value}>
            <line x1={xFor(value)} y1="86" x2={xFor(value)} y2="119" stroke={value === 0 ? "#7e22ce" : "#1e3a8a"} strokeWidth={value === 0 ? "5" : "3"} />
            <text x={xFor(value)} y="148" textAnchor="middle" fill={value === 0 ? "#6b21a8" : "#172554"} fontSize="18" fontWeight="800">{formatInteger(value, value > 0)}</text>
          </g>)}
          <circle cx={xFor(scenario.start)} cy="102" r="12" fill="#facc15" stroke="#a16207" strokeWidth="4" />
          <circle cx={xFor(target)} cy="102" r="12" fill="#bbf7d0" stroke="#15803d" strokeWidth="4" />
          <circle cx={xFor(current)} cy="55" r="15" fill={scenario.color} stroke="white" strokeWidth="5" className="transition-all duration-500" />
          <text x={xFor(scenario.start)} y="37" textAnchor="middle" fill="#854d0e" fontSize="17" fontWeight="900">start</text>
          <text x={xFor(target)} y="82" textAnchor="middle" fill="#166534" fontSize="16" fontWeight="900">wynik</text>
          </svg>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <button type="button" disabled={readOnly || step >= totalSteps} onClick={goOneStep} className="min-h-12 rounded-xl bg-sky-700 px-5 font-black text-white disabled:opacity-40">Krok po kroku</button>
        <button type="button" disabled={readOnly || playing} onClick={play} className="min-h-12 rounded-xl bg-violet-700 px-5 font-black text-white disabled:opacity-40">{step >= totalSteps ? "Odtwórz od początku" : "Odtwórz animację"}</button>
        <span className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-800">Krok {step}/{totalSteps} · teraz: {formatInteger(current)}</span>
      </div>
      <p className="mt-3 text-center font-bold text-slate-700">{scenario.explanation}</p>
    </section>
  );
}

function ChoiceSeries({
  heading,
  description,
  tasks,
  readOnly,
  onResultChange,
  visual,
}: {
  heading: string;
  description: string;
  tasks: ChoiceTask[];
  readOnly: boolean;
  onResultChange?: IntegerNumbersLessonLabProps["onResultChange"];
  visual?: (task: ChoiceTask) => ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const choose = (option: string) => {
    if (readOnly || solved) return;
    setSelected(option);
    onResultChange?.(null);
    if (option !== task.answer) {
      setFeedback("To jeszcze nie ta odpowiedź. Spójrz na oś lub przeczytaj treść ponownie.");
      return;
    }
    setSolved(true);
    setFeedback(task.success);
    if (index === tasks.length - 1) {
      onResultChange?.(true, task.answer);
      return;
    }
    timer.current = window.setTimeout(() => {
      setIndex((value) => value + 1);
      setSelected(null);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 850);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 7 · Temat 1" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length}>
      <div className="space-y-5">
        {visual ? visual(task) : null}
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          <p className="text-xl font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
          {task.detail ? <p className="mt-2 font-bold text-amber-800">{task.detail}</p> : null}
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          {task.options.map((option) => <LessonTaskChoice key={option} selected={selected === option} disabled={readOnly || solved} onClick={() => choose(option)} className="min-h-16 text-lg sm:text-xl">{option}</LessonTaskChoice>)}
        </div>
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function TemperatureMap({ cities }: Pick<TemperatureTask, "cities">) {
  return (
    <figure className="relative isolate overflow-hidden rounded-3xl border-2 border-sky-200 bg-gradient-to-b from-sky-100 to-cyan-50 p-3 shadow-sm">
      <Image src="/lessons/illustrations/integers/temperature-poland-map.png" alt="" fill sizes="(max-width: 768px) 100vw, 768px" className="z-0 object-contain opacity-85" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-sky-50/10" />
      <svg role="img" aria-label="Mapa Polski z zaznaczonymi temperaturami" viewBox="0 0 600 330" className="pointer-events-none relative z-10 mx-auto block w-full max-w-3xl">
        {cities.map((city) => <g key={city.name}>
          <circle cx={city.x} cy={city.y} r="16" fill={city.value < 0 ? "#2563eb" : "#f97316"} stroke="white" strokeWidth="5" />
          <text x={city.x} y={city.y - 25} textAnchor="middle" fill="#172554" fontSize="20" fontWeight="900">{city.name}</text>
          <text x={city.x} y={city.y + 43} textAnchor="middle" fill="#172554" fontSize="22" fontWeight="900">{formatInteger(city.value, city.value > 0)}°C</text>
        </g>)}
      </svg>
      <figcaption className="text-center text-sm font-black text-sky-950">Niebieski punkt oznacza temperaturę ujemną, a pomarańczowy — dodatnią.</figcaption>
    </figure>
  );
}

function SelectManySeries({ readOnly, onResultChange }: Pick<IntegerNumbersLessonLabProps, "readOnly" | "onResultChange">) {
  const tasks: SelectManyTask[] = [
    { id: "greater-neg4", prompt: "Wybierz wszystkie liczby większe od −4.", values: [-8, -4, -3, 0, 5, -1], answer: [-3, 0, 5, -1], success: "Dobrze. Wszystkie te liczby leżą na prawo od −4." },
    { id: "smaller-neg2", prompt: "Wybierz wszystkie liczby mniejsze od −2.", values: [3, -1, -7, -2, -4, 0], answer: [-7, -4], success: "Dobrze. −7 i −4 leżą na lewo od −2." },
    { id: "positive", prompt: "Wybierz wszystkie liczby dodatnie.", values: [-6, 0, 4, -1, 9, 2], answer: [4, 9, 2], success: "Dobrze. Liczby dodatnie leżą na prawo od zera." },
    { id: "negative", prompt: "Wybierz wszystkie liczby ujemne.", values: [0, -5, 7, -2, 3, -9], answer: [-5, -2, -9], success: "Dobrze. Liczby ujemne leżą na lewo od zera." },
    { id: "at-least-zero", prompt: "Wybierz liczby większe lub równe 0.", values: [-3, 0, 1, -1, 8, -6], answer: [0, 1, 8], success: "Dobrze. Zero nie jest dodatnie ani ujemne, ale jest większe od każdej liczby ujemnej." },
    { id: "smaller-3", prompt: "Wybierz wszystkie liczby mniejsze od 3.", values: [3, -4, 2, 6, 0, -1], answer: [-4, 2, 0, -1], success: "Dobrze. Na osi wszystkie te liczby są na lewo od 3." },
  ];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const toggle = (value: number) => {
    if (readOnly || solved) return;
    setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    const right = selected.length === task.answer.length && selected.every((value) => task.answer.includes(value));
    if (!right) {
      setFeedback("Sprawdź wszystkie zaznaczone liczby. Pamiętaj: na osi liczby rosną w prawo.");
      return;
    }
    setSolved(true);
    setFeedback(task.success);
    if (index === tasks.length - 1) {
      onResultChange?.(true, task.answer.join(", "));
      return;
    }
    timer.current = window.setTimeout(() => {
      setIndex((value) => value + 1);
      setSelected([]);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 850);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 7 · Temat 1" heading="Wybierz właściwe liczby" description="Zaznacz wszystkie liczby spełniające warunek. Zero traktuj osobno: nie jest ani dodatnie, ani ujemne." questionNumber={index + 1} questionCount={tasks.length}>
      <div className="space-y-5">
        <NumberLine compact />
        <section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="text-xl font-black text-amber-950 sm:text-2xl">{task.prompt}</p></section>
        <div className="flex flex-wrap justify-center gap-3">{task.values.map((value) => <LessonTaskChoice key={value} selected={selected.includes(value)} disabled={readOnly || solved} onClick={() => toggle(value)} className="min-h-16 min-w-20 text-2xl">{formatInteger(value, value > 0)}</LessonTaskChoice>)}</div>
        <button type="button" disabled={readOnly || solved} onClick={check} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Sprawdź</button>
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function OppositeNumbersTable({ readOnly, onResultChange }: Pick<IntegerNumbersLessonLabProps, "readOnly" | "onResultChange">) {
  const values = [-7, 5, 0, -2, 8, -10, 3, 1];
  const [answers, setAnswers] = useState(values.map(() => ""));
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const update = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => current.map((value, index) => {
      if (index !== active) return value;
      if (key === "backspace") return value.slice(0, -1);
      if (key === "minus") return value ? value : "-";
      return `${value}${key}`.slice(0, 3);
    }));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answers.some((answer) => answer === "" || answer === "-")) {
      setFeedback("Uzupełnij wszystkie komórki tabeli.");
      return;
    }
    const correct = answers.every((answer, index) => Number(answer) === -values[index]!);
    if (!correct) {
      setFeedback("Sprawdź liczby leżące po przeciwnej stronie zera. Ich odległość od zera musi być taka sama.");
      return;
    }
    setSolved(true);
    setFeedback("Świetnie. Każda para liczb przeciwnych leży po przeciwnej stronie zera w tej samej odległości.");
    onResultChange?.(true, answers.join(", "));
  };

  return (
    <LessonTaskFrame eyebrow="Dział 7 · Temat 1" heading="Liczby przeciwne" description="Liczby przeciwne leżą po przeciwnych stronach zera i są od niego tak samo odległe. Wpisz liczbę przeciwną do każdej podanej liczby." questionNumber={1} questionCount={1}>
      <div className="space-y-5">
        <NumberLine compact />
        <div className="overflow-x-auto rounded-3xl border-2 border-indigo-200">
          <table className="min-w-full border-collapse text-center">
            <thead className="bg-indigo-100 text-indigo-950"><tr><th className="p-3 text-left font-black">Podana liczba</th>{values.map((value) => <th key={value} className="min-w-18 border-l border-indigo-200 p-3 text-xl font-black">{formatInteger(value, value > 0)}</th>)}</tr></thead>
            <tbody><tr><th scope="row" className="bg-indigo-50 p-3 text-left font-black text-indigo-950">Liczba przeciwna</th>{values.map((value, index) => <td key={value} className="border-l border-t border-indigo-200 p-2"><input aria-label={`Liczba przeciwna do ${formatInteger(value)}`} inputMode="none" readOnly value={answers[index]} onFocus={() => setActive(index)} onClick={() => setActive(index)} className={`h-14 w-16 rounded-xl border-2 bg-white text-center text-xl font-black text-slate-950 outline-none ${active === index ? "border-violet-700 ring-4 ring-violet-100" : "border-violet-300"}`} /></td>)}</tr></tbody>
          </table>
        </div>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 rounded-3xl bg-slate-100 p-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "minus", "0", "backspace"].map((key) => <button key={key} type="button" disabled={readOnly || solved} onClick={() => update(key)} className={`min-h-12 rounded-xl font-black disabled:opacity-40 ${key === "minus" ? "bg-amber-300 text-amber-950" : key === "backspace" ? "bg-rose-200 text-rose-950" : "bg-white text-slate-950"}`}>{key === "minus" ? "−" : key === "backspace" ? "← Usuń" : key}</button>)}
          <button type="button" disabled={readOnly || solved} onClick={check} className="col-span-4 min-h-12 rounded-xl bg-indigo-700 font-black text-white disabled:opacity-40">Zatwierdź</button>
        </div>
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

const introductionTasks: ChoiceTask[] = [
  { id: "intro-negative", prompt: "Jaką liczbą jest −6?", options: ["liczbą dodatnią", "liczbą ujemną", "zerem", "liczbą przeciwną"], answer: "liczbą ujemną", success: "Dobrze. Liczby ujemne leżą na lewo od zera.", reference: -6 },
  { id: "intro-zero", prompt: "Jaką liczbą jest 0?", options: ["liczbą dodatnią", "liczbą ujemną", "ani dodatnią, ani ujemną", "liczbą przeciwną do 1"], answer: "ani dodatnią, ani ujemną", success: "Dobrze. Zero oddziela liczby ujemne od dodatnich.", reference: 0 },
  { id: "intro-positive", prompt: "Jaką liczbą jest +4?", options: ["liczbą ujemną", "zerem", "liczbą dodatnią", "liczbą mniejszą od −4"], answer: "liczbą dodatnią", success: "Dobrze. Liczby dodatnie leżą na prawo od zera.", reference: 4 },
  { id: "intro-context", prompt: "Na termometrze jest −3°C. Co oznacza zapis −3?", options: ["3 stopnie powyżej zera", "3 stopnie poniżej zera", "zero stopni", "temperaturę dodatnią"], answer: "3 stopnie poniżej zera", success: "Dobrze. Znak minus na termometrze oznacza temperaturę poniżej zera.", reference: -3 },
];

const numberLineTasks: ChoiceTask[] = [
  { id: "greater-neg5", prompt: "Która liczba jest większa od −5?", options: ["−7", "−2", "−8", "−6"], answer: "−2", success: "Dobrze. −2 leży na prawo od −5.", reference: -5, emphasis: "greater" },
  { id: "smaller-neg3", prompt: "Która liczba jest mniejsza od −3?", options: ["0", "−1", "−6", "4"], answer: "−6", success: "Dobrze. −6 leży na lewo od −3.", reference: -3, emphasis: "smaller" },
  { id: "greater-neg1", prompt: "Która liczba jest większa od −1?", options: ["−4", "−2", "2", "−8"], answer: "2", success: "Dobrze. 2 leży na prawo od −1.", reference: -1, emphasis: "greater" },
  { id: "smaller-zero", prompt: "Która liczba jest mniejsza od 0?", options: ["3", "0", "−4", "5"], answer: "−4", success: "Dobrze. Wszystkie liczby ujemne są mniejsze od zera.", reference: 0, emphasis: "smaller" },
  { id: "greater-two", prompt: "Która liczba jest większa od 2?", options: ["−3", "0", "5", "1"], answer: "5", success: "Dobrze. 5 leży na prawo od 2.", reference: 2, emphasis: "greater" },
  { id: "smaller-neg6", prompt: "Która liczba jest mniejsza od −6?", options: ["−4", "−8", "−2", "0"], answer: "−8", success: "Dobrze. −8 leży na lewo od −6.", reference: -6, emphasis: "smaller" },
  { id: "greater-zero", prompt: "Która liczba jest większa od 0?", options: ["−1", "−7", "6", "−3"], answer: "6", success: "Dobrze. Wszystkie liczby dodatnie są większe od zera.", reference: 0, emphasis: "greater" },
  { id: "smaller-four", prompt: "Która liczba jest mniejsza od 4?", options: ["7", "5", "−1", "8"], answer: "−1", success: "Dobrze. −1 leży na lewo od 4.", reference: 4, emphasis: "smaller" },
];

const comparisonTasks: ChoiceTask[] = [
  { id: "compare-5-2", prompt: "Wstaw właściwy znak.", detail: "−5 □ −2", options: ["<", ">", "="], answer: "<", success: "Dobrze. −5 leży na lewo od −2.", left: -5, right: -2 },
  { id: "compare-3-1", prompt: "Wstaw właściwy znak.", detail: "−3 □ 1", options: ["<", ">", "="], answer: "<", success: "Dobrze. Każda liczba ujemna jest mniejsza od każdej dodatniej.", left: -3, right: 1 },
  { id: "compare-0-neg4", prompt: "Wstaw właściwy znak.", detail: "0 □ −4", options: ["<", ">", "="], answer: ">", success: "Dobrze. Zero leży na prawo od −4.", left: 0, right: -4 },
  { id: "compare-6-6", prompt: "Wstaw właściwy znak.", detail: "6 □ 6", options: ["<", ">", "="], answer: "=", success: "Dobrze. Te same liczby są równe.", left: 6, right: 6 },
  { id: "compare-neg8-neg10", prompt: "Wstaw właściwy znak.", detail: "−8 □ −10", options: ["<", ">", "="], answer: ">", success: "Dobrze. −8 leży na prawo od −10.", left: -8, right: -10 },
  { id: "compare-2-neg2", prompt: "Wstaw właściwy znak.", detail: "2 □ −2", options: ["<", ">", "="], answer: ">", success: "Dobrze. Liczba dodatnia jest większa od ujemnej.", left: 2, right: -2 },
  { id: "compare-neg1-zero", prompt: "Wstaw właściwy znak.", detail: "−1 □ 0", options: ["<", ">", "="], answer: "<", success: "Dobrze. −1 leży na lewo od zera.", left: -1, right: 0 },
  { id: "compare-9-4", prompt: "Wstaw właściwy znak.", detail: "9 □ 4", options: ["<", ">", "="], answer: ">", success: "Dobrze. 9 leży na prawo od 4.", left: 9, right: 4 },
  { id: "compare-neg7-neg7", prompt: "Wstaw właściwy znak.", detail: "−7 □ −7", options: ["<", ">", "="], answer: "=", success: "Dobrze. Obie strony przedstawiają tę samą liczbę.", left: -7, right: -7 },
  { id: "compare-4-neg9", prompt: "Wstaw właściwy znak.", detail: "4 □ −9", options: ["<", ">", "="], answer: ">", success: "Dobrze. 4 leży na prawo od −9.", left: 4, right: -9 },
];

const temperatureTasks: TemperatureTask[] = [
  { id: "temp-warmest", prompt: "W którym mieście jest najcieplej?", cities: [{ name: "Gdańsk", value: -2, x: 190, y: 85 }, { name: "Warszawa", value: 1, x: 330, y: 148 }, { name: "Zakopane", value: -6, x: 290, y: 245 }], answer: "Warszawa", success: "Dobrze. +1°C jest większe od −2°C i −6°C." },
  { id: "temp-coldest", prompt: "W którym mieście jest najzimniej?", cities: [{ name: "Szczecin", value: 3, x: 145, y: 135 }, { name: "Lublin", value: -4, x: 420, y: 183 }, { name: "Kraków", value: -1, x: 300, y: 245 }], answer: "Lublin", success: "Dobrze. −4°C jest najmniejszą temperaturą na mapie." },
  { id: "temp-negative", prompt: "Wskaż miasto z temperaturą ujemną.", cities: [{ name: "Poznań", value: 2, x: 220, y: 145 }, { name: "Białystok", value: -3, x: 440, y: 105 }, { name: "Wrocław", value: 0, x: 205, y: 235 }], answer: "Białystok", success: "Dobrze. Tylko −3°C jest temperaturą ujemną." },
  { id: "temp-compare", prompt: "W Krakowie jest −5°C, a w Gdańsku 0°C. Które zdanie jest prawdziwe?", cities: [{ name: "Gdańsk", value: 0, x: 190, y: 85 }, { name: "Kraków", value: -5, x: 300, y: 245 }, { name: "Łódź", value: -2, x: 295, y: 160 }], answer: "W Gdańsku jest cieplej", success: "Dobrze. 0°C jest większe od −5°C." },
];

export function integerNumbersActivityFromStageId(stageId: string): IntegerNumbersActivity {
  if (stageId.includes("m6-7-1")) {
    const activitiesBySuffix: Record<string, IntegerNumbersActivity> = {
      "number-sets": "g6-number-sets",
      "absolute-value": "g6-absolute-value",
      "number-line": "g6-number-line",
      select: "g6-select",
      compare: "g6-compare",
      opposites: "g6-opposites",
    };
    const activity = Object.entries(activitiesBySuffix).find(([suffix]) =>
      stageId.endsWith(`-${suffix}`),
    )?.[1];
    if (activity) return activity;

    const stageNumber = stageId.match(/-s(\d+)$/)?.[1];
    const activities: Record<string, IntegerNumbersActivity> = {
      "1": "g6-number-sets",
      "2": "g6-absolute-value",
      "3": "g6-number-line",
      "4": "g6-select",
      "5": "g6-compare",
      "6": "g6-opposites",
    };
    return activities[stageNumber ?? ""] ?? "g6-number-sets";
  }
  if (stageId.endsWith("-s1")) return "integer-introduction";
  if (stageId.endsWith("-s2")) return "integer-number-line";
  if (stageId.endsWith("-s3")) return "integer-select";
  if (stageId.endsWith("-s4")) return "integer-temperatures";
  if (stageId.endsWith("-s5")) return "integer-compare";
  return "integer-opposites";
}

export function IntegerNumbersLessonLab({ activity, readOnly = false, onResultChange }: IntegerNumbersLessonLabProps) {
  if (activity.startsWith("g6-")) return <Grade6SignedNumbersLessonLab activity={activity as Grade6SignedNumbersActivity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "integer-introduction") {
    return <ChoiceSeries key="integer-introduction" heading="Liczby dodatnie, ujemne i zero" description="Liczby ujemne spotykasz np. na termometrze. Zero leży pośrodku osi i nie jest ani dodatnie, ani ujemne." tasks={introductionTasks} readOnly={readOnly} onResultChange={onResultChange} visual={(task) => <div className="space-y-4"><NumberLine reference={task.reference} /><div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-center sm:grid-cols-3"><div className="rounded-2xl bg-rose-100 p-3 font-black text-rose-950">−<br /><span className="text-sm">liczby ujemne</span></div><div className="rounded-2xl bg-violet-100 p-3 font-black text-violet-950">0<br /><span className="text-sm">ani dodatnie, ani ujemne</span></div><div className="rounded-2xl bg-emerald-100 p-3 font-black text-emerald-950">+<br /><span className="text-sm">liczby dodatnie</span></div></div></div>} />;
  }
  if (activity === "integer-number-line") return <ChoiceSeries key="integer-number-line" heading="Porównywanie na osi liczbowej" description="Na osi liczbowej liczby po prawej są większe, a liczby po lewej — mniejsze. Stosujemy znaki > i <." tasks={numberLineTasks} readOnly={readOnly} onResultChange={onResultChange} visual={(task) => <div className="space-y-5"><AxisMotionPreview readOnly={readOnly} /><section className="rounded-3xl border-2 border-indigo-200 bg-white p-3 shadow-sm sm:p-4"><p className="mb-2 text-center text-xs font-black uppercase tracking-[.16em] text-indigo-800">Oś do bieżącego pytania</p><NumberLine reference={task.reference} emphasis={task.emphasis} /></section></div>} />;
  if (activity === "integer-select") return <SelectManySeries readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "integer-temperatures") return <ChoiceSeries key="integer-temperatures" heading="Temperatury na mapie" description="Ujemne i dodatnie temperatury porównujesz tak samo jak liczby na osi: większa temperatura leży bardziej na prawo." tasks={temperatureTasks.map((task) => ({ ...task, options: task.id === "temp-compare" ? ["W Krakowie jest cieplej", "W Gdańsku jest cieplej", "W obu miastach jest tak samo"] : task.cities.map((city) => city.name) }))} readOnly={readOnly} onResultChange={onResultChange} visual={(task) => <TemperatureMap cities={temperatureTasks.find((item) => item.id === task.id)!.cities} />} />;
  if (activity === "integer-compare") return <ChoiceSeries key="integer-compare" heading="Porównaj liczby całkowite" description="Wstaw znak <, > lub =. Najpierw zaznacz liczby na osi w myślach, a potem wybierz znak." tasks={comparisonTasks} readOnly={readOnly} onResultChange={onResultChange} visual={(task) => <><NumberLine reference={task.left} emphasis={task.left !== undefined && task.right !== undefined && task.right > task.left ? "greater" : "smaller"} /><p className="text-center text-4xl font-black text-indigo-950 sm:text-6xl">{formatInteger(task.left ?? 0)} <span className="mx-3 text-violet-600">□</span> {formatInteger(task.right ?? 0)}</p></>} />;
  return <OppositeNumbersTable readOnly={readOnly} onResultChange={onResultChange} />;
}
