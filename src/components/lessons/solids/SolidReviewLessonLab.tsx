"use client";

import { useEffect, useRef, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";

export type SolidReviewActivity = "elements" | "nets" | "surface" | "volume" | "challenge";

type TaskStatus = "correct" | "wrong" | null;

interface ChoiceTask {
  id: string;
  kind: "choice";
  prompt: string;
  visual: string;
  choices: readonly string[];
  answer: string;
  success: string;
}

interface NumericField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

interface NumericTask {
  id: string;
  kind: "numeric";
  prompt: string;
  visual: string;
  fields: readonly NumericField[];
  hint: string;
  success: string;
}

type ReviewTask = ChoiceTask | NumericTask;

const ELEMENT_TASKS: readonly ChoiceTask[] = [
  {
    id: "trapezoid-prism-sides",
    kind: "choice",
    prompt: "Graniastosłup ma w podstawie trapez. Ile ma ścian bocznych?",
    visual: "trapezoid-prism",
    choices: ["3", "4", "5", "6"],
    answer: "4",
    success: "Liczba ścian bocznych jest równa liczbie boków podstawy.",
  },
  {
    id: "hex-pyramid-edges",
    kind: "choice",
    prompt: "Ile krawędzi ma ostrosłup sześciokątny?",
    visual: "hex-pyramid",
    choices: ["8", "10", "12", "18"],
    answer: "12",
    success: "Ma 6 krawędzi podstawy i 6 krawędzi bocznych.",
  },
  {
    id: "pent-prism-vertices",
    kind: "choice",
    prompt: "Które zdanie o graniastosłupie pięciokątnym jest prawdziwe?",
    visual: "pent-prism",
    choices: ["Ma 5 wierzchołków.", "Ma 7 ścian.", "Ma 10 krawędzi.", "Ma 12 ścian."],
    answer: "Ma 7 ścian.",
    success: "Ma 2 podstawy i 5 ścian bocznych, czyli 7 ścian.",
  },
  {
    id: "tetrahedron-family",
    kind: "choice",
    prompt: "Czworościan jest szczególnym przykładem…",
    visual: "tetrahedron",
    choices: ["graniastosłupa trójkątnego", "ostrosłupa trójkątnego", "ostrosłupa czworokątnego", "stożka"],
    answer: "ostrosłupa trójkątnego",
    success: "Czworościan ma trójkąt w podstawie i trzy trójkątne ściany boczne.",
  },
] as const;

const NET_TASKS: readonly ChoiceTask[] = [
  {
    id: "triangular-prism-net",
    kind: "choice",
    prompt: "Jaka bryła powstanie po złożeniu tej siatki?",
    visual: "net-tri-prism",
    choices: ["Graniastosłup trójkątny", "Ostrosłup trójkątny", "Graniastosłup czworokątny", "Ostrosłup czworokątny"],
    answer: "Graniastosłup trójkątny",
    success: "W siatce są dwie trójkątne podstawy i trzy prostokąty.",
  },
  {
    id: "trapezoid-prism-net",
    kind: "choice",
    prompt: "Podstawami są trapezy. Jak nazywa się bryła z tej siatki?",
    visual: "net-trapezoid-prism",
    choices: ["Graniastosłup czworokątny", "Graniastosłup trapezowy", "Ostrosłup czworokątny", "Prostopadłościan"],
    answer: "Graniastosłup czworokątny",
    success: "Trapez jest czworokątem, dlatego jest to graniastosłup czworokątny.",
  },
  {
    id: "quadrilateral-pyramid-net",
    kind: "choice",
    prompt: "Jaka bryła ma taką siatkę?",
    visual: "net-square-pyramid",
    choices: ["Sześcian", "Graniastosłup czworokątny", "Ostrosłup czworokątny", "Ostrosłup trójkątny"],
    answer: "Ostrosłup czworokątny",
    success: "Jedna czworokątna podstawa jest otoczona czterema trójkątami.",
  },
  {
    id: "broken-tri-prism-net",
    kind: "choice",
    prompt: "Czy z pokazanych elementów można złożyć graniastosłup trójkątny?",
    visual: "net-broken-tri-prism",
    choices: ["Tak", "Nie"],
    answer: "Nie",
    success: "Brakuje jednej prostokątnej ściany bocznej.",
  },
] as const;

const SURFACE_TASKS: readonly NumericTask[] = [
  {
    id: "surface-triangle",
    kind: "numeric",
    prompt: "Oblicz Pp, Pb i Pc graniastosłupa trójkątnego.",
    visual: "surface-triangle",
    fields: [
      { id: "pp", label: "Pp", unit: "cm²", answer: 24 },
      { id: "pb", label: "Pb", unit: "cm²", answer: 120 },
      { id: "pc", label: "Pc", unit: "cm²", answer: 168 },
    ],
    hint: "Najpierw oblicz pole trójkąta, potem pomnóż obwód podstawy przez wysokość bryły.",
    success: "Pc = 2 · Pp + Pb = 168 cm².",
  },
  {
    id: "surface-trapezoid",
    kind: "numeric",
    prompt: "Oblicz Pp, Pb i Pc graniastosłupa o podstawie trapezu.",
    visual: "surface-trapezoid",
    fields: [
      { id: "pp", label: "Pp", unit: "cm²", answer: 18 },
      { id: "pb", label: "Pb", unit: "cm²", answer: 120 },
      { id: "pc", label: "Pc", unit: "cm²", answer: 156 },
    ],
    hint: "Pole trapezu to suma podstaw pomnożona przez wysokość trapezu i podzielona przez 2.",
    success: "Pc = 2 · 18 cm² + 120 cm² = 156 cm².",
  },
  {
    id: "surface-given-base",
    kind: "numeric",
    prompt: "Pole podstawy wynosi 27 cm², jej obwód 18 cm, a wysokość bryły 7 cm. Oblicz Pb i Pc.",
    visual: "surface-given-base",
    fields: [
      { id: "pb", label: "Pb", unit: "cm²", answer: 126 },
      { id: "pc", label: "Pc", unit: "cm²", answer: 180 },
    ],
    hint: "Pb = obwód podstawy · wysokość bryły, a Pc = 2 · Pp + Pb.",
    success: "Pb = 126 cm², a Pc = 180 cm².",
  },
] as const;

const VOLUME_TASKS: readonly NumericTask[] = [
  {
    id: "volume-triangle",
    kind: "numeric",
    prompt: "Oblicz pole podstawy i objętość graniastosłupa trójkątnego.",
    visual: "volume-triangle",
    fields: [
      { id: "pp", label: "Pp", unit: "cm²", answer: 18 },
      { id: "v", label: "V", unit: "cm³", answer: 144 },
    ],
    hint: "Pp = 9 · 4 : 2. Następnie V = Pp · H.",
    success: "Pp = 18 cm², więc V = 18 · 8 = 144 cm³.",
  },
  {
    id: "volume-trapezoid",
    kind: "numeric",
    prompt: "Oblicz pole podstawy i objętość graniastosłupa o podstawie trapezu.",
    visual: "volume-trapezoid",
    fields: [
      { id: "pp", label: "Pp", unit: "dm²", answer: 20 },
      { id: "v", label: "V", unit: "dm³", answer: 100 },
    ],
    hint: "Najpierw oblicz pole trapezu, a potem pomnóż je przez wysokość bryły.",
    success: "Pp = 20 dm², więc V = 20 · 5 = 100 dm³.",
  },
  {
    id: "volume-unit-change",
    kind: "numeric",
    prompt: "Pp = 35 dm², a H = 0,2 m. Zamień wysokość na decymetry i oblicz objętość.",
    visual: "volume-unit-change",
    fields: [
      { id: "height", label: "H", unit: "dm", answer: 2 },
      { id: "v", label: "V", unit: "dm³", answer: 70 },
    ],
    hint: "0,2 m to 2 dm. Dopiero potem zastosuj V = Pp · H.",
    success: "Po zamianie H = 2 dm, dlatego V = 70 dm³.",
  },
] as const;

const CHALLENGE_TASKS: readonly ReviewTask[] = [
  {
    id: "wire-frame",
    kind: "numeric",
    prompt: "Stelaż ma kształt prostopadłościanu o wymiarach 5 cm, 3,5 cm i 2 cm. Ile centymetrów drutu potrzeba na wszystkie krawędzie?",
    visual: "challenge-wire",
    fields: [{ id: "wire", label: "Długość drutu", unit: "cm", answer: 42 }],
    hint: "Każdy z trzech wymiarów występuje na czterech krawędziach.",
    success: "4 · (5 + 3,5 + 2) = 42 cm.",
  },
  {
    id: "greenhouse-surface",
    kind: "numeric",
    prompt: "Tunel ma kształt graniastosłupa trójkątnego. Oblicz całe pole jego powierzchni.",
    visual: "challenge-greenhouse",
    fields: [{ id: "surface", label: "Pc", unit: "m²", answer: 184 }],
    hint: "Pole jednej trójkątnej podstawy to 12 m², a obwód podstawy wynosi 16 m.",
    success: "Pc = 2 · 12 m² + 16 m · 10 m = 184 m².",
  },
  {
    id: "aquarium-litres",
    kind: "numeric",
    prompt: "Akwarium ma wymiary 40 cm × 25 cm × 30 cm. Oblicz jego objętość i pojemność w litrach.",
    visual: "challenge-aquarium",
    fields: [
      { id: "volume", label: "V", unit: "cm³", answer: 30000 },
      { id: "litres", label: "Pojemność", unit: "l", answer: 30 },
    ],
    hint: "Najpierw pomnóż trzy wymiary. Pamiętaj, że 1000 cm³ to 1 l.",
    success: "V = 30 000 cm³, czyli 30 l.",
  },
  {
    id: "mystery-solid",
    kind: "choice",
    prompt: "Bryła ma 7 ścian, 10 wierzchołków i 15 krawędzi. Co to za bryła?",
    visual: "challenge-mystery",
    choices: ["Graniastosłup pięciokątny", "Ostrosłup sześciokątny", "Graniastosłup czworokątny", "Ostrosłup pięciokątny"],
    answer: "Graniastosłup pięciokątny",
    success: "Dwie pięciokątne podstawy dają 10 wierzchołków, a bryła ma łącznie 7 ścian.",
  },
] as const;

const ACTIVITY_CONTENT: Record<SolidReviewActivity, { heading: string; description: string; tasks: readonly ReviewTask[] }> = {
  elements: { heading: "Bryły i ich elementy", description: "Rozpoznaj zależności między podstawą, ścianami, krawędziami i wierzchołkami.", tasks: ELEMENT_TASKS },
  nets: { heading: "Siatki bez pułapek", description: "Rozpoznaj bryłę po siatce i sprawdź, czy wszystkie potrzebne ściany są obecne.", tasks: NET_TASKS },
  surface: { heading: "Pole powierzchni", description: "Samodzielnie oblicz Pp, Pb i Pc dla różnych graniastosłupów prostych.", tasks: SURFACE_TASKS },
  volume: { heading: "Objętość graniastosłupa", description: "Oblicz pole podstawy, ujednolić jednostki i zastosuj wzór V = Pp · H.", tasks: VOLUME_TASKS },
  challenge: { heading: "Wyzwanie końcowe", description: "Połącz wiadomości o krawędziach, polu, objętości i rozpoznawaniu brył.", tasks: CHALLENGE_TASKS },
};

function SolidSketch({ visual }: { visual: string }) {
  const common = "fill-violet-100 stroke-indigo-950 [stroke-width:3] [stroke-linejoin:round]";
  const side = "fill-cyan-100 stroke-indigo-950 [stroke-width:3] [stroke-linejoin:round]";
  const label = "fill-slate-950 text-[19px] font-black";

  if (visual.startsWith("net-")) {
    return <svg role="img" aria-label="Rysunek siatki bryły" viewBox="0 0 640 300" className="mx-auto block w-full max-w-3xl">
      {visual === "net-tri-prism" ? <>
        <rect x="170" y="105" width="100" height="90" className={common} /><rect x="270" y="105" width="100" height="90" className={side} /><rect x="370" y="105" width="100" height="90" className={common} />
        <polygon points="170,105 220,35 270,105" className="fill-amber-200 stroke-amber-900 [stroke-width:3]" /><polygon points="370,195 420,265 470,195" className="fill-rose-200 stroke-rose-900 [stroke-width:3]" />
      </> : null}
      {visual === "net-trapezoid-prism" ? <>
        <rect x="160" y="105" width="65" height="90" className={common} /><rect x="225" y="105" width="70" height="90" className={side} /><rect x="295" y="105" width="120" height="90" className={common} /><rect x="415" y="105" width="65" height="90" className={side} />
        <polygon points="225,105 295,105 320,45 200,45" className="fill-amber-200 stroke-amber-900 [stroke-width:3]" /><polygon points="295,195 415,195 390,255 320,255" className="fill-rose-200 stroke-rose-900 [stroke-width:3]" />
      </> : null}
      {visual === "net-square-pyramid" ? <>
        <rect x="250" y="100" width="140" height="100" className={side} />
        <polygon points="250,100 320,28 390,100" className="fill-amber-200 stroke-amber-900 [stroke-width:3]" /><polygon points="250,200 320,272 390,200" className="fill-rose-200 stroke-rose-900 [stroke-width:3]" /><polygon points="250,100 178,150 250,200" className={common} /><polygon points="390,100 462,150 390,200" className={common} />
      </> : null}
      {visual === "net-broken-tri-prism" ? <>
        <rect x="215" y="105" width="105" height="90" className={common} /><rect x="320" y="105" width="105" height="90" className={side} />
        <polygon points="215,105 267,35 320,105" className="fill-amber-200 stroke-amber-900 [stroke-width:3]" /><polygon points="320,195 372,265 425,195" className="fill-rose-200 stroke-rose-900 [stroke-width:3]" />
        <text x="500" y="160" textAnchor="middle" className="fill-rose-800 text-[54px] font-black">?</text>
      </> : null}
    </svg>;
  }

  if (visual === "hex-pyramid" || visual === "tetrahedron") {
    const base = visual === "tetrahedron" ? "220,220 420,220 320,110" : "210,220 280,255 390,245 450,195 390,165 275,175";
    return <svg role="img" aria-label={visual === "tetrahedron" ? "Czworościan" : "Ostrosłup sześciokątny"} viewBox="0 0 640 300" className="mx-auto block w-full max-w-3xl">
      <polygon points={base} className={common} />
      <line x1="320" y1="35" x2={visual === "tetrahedron" ? "220" : "210"} y2="220" className="stroke-indigo-950 [stroke-width:3]" />
      <line x1="320" y1="35" x2={visual === "tetrahedron" ? "420" : "280"} y2={visual === "tetrahedron" ? "220" : "255"} className="stroke-indigo-950 [stroke-width:3]" />
      <line x1="320" y1="35" x2={visual === "tetrahedron" ? "320" : "390"} y2={visual === "tetrahedron" ? "110" : "245"} className="stroke-indigo-950 [stroke-width:3]" />
      {visual === "hex-pyramid" ? <><line x1="320" y1="35" x2="450" y2="195" className="stroke-indigo-950 [stroke-width:3]" /><line x1="320" y1="35" x2="390" y2="165" className="stroke-indigo-950 [stroke-width:3]" /><line x1="320" y1="35" x2="275" y2="175" className="stroke-indigo-950 [stroke-width:3]" /></> : null}
      <circle cx="320" cy="35" r="8" className="fill-rose-500" />
    </svg>;
  }

  if (visual === "pent-prism" || visual === "trapezoid-prism" || visual === "challenge-mystery") {
    return <svg role="img" aria-label="Graniastosłup prosty" viewBox="0 0 640 300" className="mx-auto block w-full max-w-3xl">
      <polygon points={visual === "trapezoid-prism" ? "180,215 300,215 275,155 205,155" : "185,215 235,250 300,220 280,155 205,155"} className={common} />
      <polygon points={visual === "trapezoid-prism" ? "340,140 460,140 435,80 365,80" : "345,140 395,175 460,145 440,80 365,80"} className="fill-cyan-100 stroke-indigo-950 [stroke-width:3]" />
      {[[180,215,340,140],[300,215,460,140],[275,155,435,80],[205,155,365,80]].map((line, index) => <line key={index} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} className="stroke-indigo-950 [stroke-width:3]" />)}
      {visual !== "trapezoid-prism" ? <line x1="235" y1="250" x2="395" y2="175" className="stroke-indigo-950 [stroke-width:3]" /> : null}
    </svg>;
  }

  if (visual.startsWith("surface-") || visual.startsWith("volume-") || visual.startsWith("challenge-")) {
    const notes: Record<string, readonly string[]> = {
      "surface-triangle": ["podstawa: trójkąt prostokątny", "boki: 6 cm, 8 cm, 10 cm", "H = 5 cm"],
      "surface-trapezoid": ["podstawa: trapez", "boki: 8 cm, 4 cm, 3 cm, 5 cm", "h = 3 cm, H = 6 cm"],
      "surface-given-base": ["Pp = 27 cm²", "obwód podstawy = 18 cm", "H = 7 cm"],
      "volume-triangle": ["podstawa: trójkąt", "a = 9 cm, h = 4 cm", "H = 8 cm"],
      "volume-trapezoid": ["podstawa: trapez", "a = 7 dm, b = 3 dm, h = 4 dm", "H = 5 dm"],
      "volume-unit-change": ["Pp = 35 dm²", "H = 0,2 m", "V = Pp · H"],
      "challenge-wire": ["a = 5 cm", "b = 3,5 cm", "c = 2 cm"],
      "challenge-greenhouse": ["trójkąt: 6 m, 5 m, 5 m", "h = 4 m", "H = 10 m"],
      "challenge-aquarium": ["40 cm", "25 cm", "30 cm"],
    };
    const lines = notes[visual] ?? [];
    const triangular = visual === "surface-triangle" || visual === "volume-triangle" || visual === "challenge-greenhouse";
    const trapezoidal = visual === "surface-trapezoid" || visual === "volume-trapezoid";
    const polygonal = visual === "surface-given-base" || visual === "volume-unit-change";
    return <svg role="img" aria-label="Bryła i dane potrzebne do obliczeń" viewBox="0 0 640 350" className="mx-auto block w-full max-w-3xl">
      {triangular ? <>
        <polygon points="95,225 255,225 175,100" className="fill-amber-100 stroke-indigo-950 [stroke-width:3]" />
        <polygon points="275,170 435,170 355,45" className={side} />
        <polygon points="95,225 255,225 435,170 275,170" className={common} />
        <polygon points="175,100 355,45 435,170 255,225" className="fill-violet-100/80 stroke-indigo-950 [stroke-width:3]" />
        <line x1="95" y1="225" x2="275" y2="170" className="stroke-indigo-950 [stroke-width:3]" />
      </> : trapezoidal ? <>
        <polygon points="290,145 490,145 390,70 290,70" className={side} />
        <polygon points="60,235 260,235 490,145 290,145" className={common} />
        <polygon points="60,160 160,160 390,70 290,70" className="fill-violet-100/80 stroke-indigo-950 [stroke-width:3]" />
        <polygon points="260,235 160,160 390,70 490,145" className="fill-cyan-100/80 stroke-indigo-950 [stroke-width:3]" />
        <polygon points="60,235 260,235 160,160 60,160" className="fill-amber-100 stroke-indigo-950 [stroke-width:3]" />
      </> : polygonal ? <>
        <polygon points="90,185 145,235 235,220 260,145 185,110 110,125" className="fill-amber-100 stroke-indigo-950 [stroke-width:3]" />
        <polygon points="270,130 325,180 415,165 440,90 365,55 290,70" className={side} />
        {[[90,185,270,130],[145,235,325,180],[235,220,415,165],[260,145,440,90],[185,110,365,55],[110,125,290,70]].map((line, lineIndex) => <line key={lineIndex} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} className="stroke-indigo-950 [stroke-width:3]" />)}
      </> : <>
        <polygon points="80,215 260,215 390,155 210,155" className={common} />
        <polygon points="210,155 390,155 390,55 210,55" className={side} />
        <polygon points="80,215 210,155 210,55 80,115" className="fill-amber-100 stroke-indigo-950 [stroke-width:3]" />
        <line x1="80" y1="115" x2="260" y2="115" className="stroke-indigo-950 [stroke-width:3]" /><line x1="260" y1="115" x2="390" y2="55" className="stroke-indigo-950 [stroke-width:3]" /><line x1="260" y1="115" x2="260" y2="215" className="stroke-indigo-950 [stroke-width:3]" />
      </>}
      {lines.map((text, index) => <text key={text} x="320" y={278 + index * 30} textAnchor="middle" className={label}>{text}</text>)}
    </svg>;
  }

  return <svg role="img" aria-label="Bryła przestrzenna" viewBox="0 0 640 300" className="mx-auto block w-full max-w-3xl"><circle cx="320" cy="150" r="70" className="fill-cyan-100 stroke-indigo-950 [stroke-width:3]" /></svg>;
}

function TaskNumberNavigation({ statuses, index, readOnly, onGoTo }: { statuses: readonly TaskStatus[]; index: number; readOnly: boolean; onGoTo: (index: number) => void }) {
  return <nav aria-label="Wybierz zadanie z serii" className="rounded-2xl bg-violet-50 p-3">
    <div className="flex flex-wrap justify-center gap-2">
      {statuses.map((status, taskIndex) => <button
        key={taskIndex}
        type="button"
        disabled={readOnly}
        aria-current={taskIndex === index ? "step" : undefined}
        aria-label={`Przejdź do zadania ${taskIndex + 1}${status === "correct" ? ", rozwiązane poprawnie" : status === "wrong" ? ", zakończone bez punktu" : ""}`}
        onClick={() => onGoTo(taskIndex)}
        className={`min-h-10 min-w-10 rounded-xl border px-3 font-black disabled:opacity-40 ${taskIndex === index ? "border-violet-800 bg-violet-700 text-white" : status === "correct" ? "border-emerald-300 bg-emerald-100 text-emerald-950" : status === "wrong" ? "border-amber-300 bg-amber-100 text-amber-950" : "border-violet-200 bg-white text-violet-950"}`}
      >{taskIndex + 1}{status === "correct" ? " ✓" : status === "wrong" ? " •" : ""}</button>)}
    </div>
  </nav>;
}

function formatAnswer(task: ReviewTask) {
  if (task.kind === "choice") return task.answer;
  return task.fields.map((field) => `${field.label} = ${String(field.answer).replace(".", ",")} ${field.unit}`).join(", ");
}

function parsePolishNumber(value: string) {
  return Number(value.replace(",", "."));
}

export function solidReviewActivityFromStageId(stageId: string): SolidReviewActivity {
  if (stageId.includes("nets")) return "nets";
  if (stageId.includes("surface")) return "surface";
  if (stageId.includes("volume")) return "volume";
  if (stageId.includes("challenge")) return "challenge";
  return "elements";
}

export function SolidReviewLessonLab({ activity, readOnly = false, onResultChange }: { activity: SolidReviewActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const content = ACTIVITY_CONTENT[activity];
  const tasks = content.tasks;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const [statuses, setStatuses] = useState<TaskStatus[]>(() => tasks.map(() => null));
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [values, setValues] = useState<Record<number, Record<string, string>>>({});
  const [activeFields, setActiveFields] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const task = tasks[index];
  const status = statuses[index];
  const solved = status === "correct" || status === "wrong";

  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); }, []);

  const goToTask = (nextIndex: number) => {
    const target = Math.max(0, Math.min(tasks.length - 1, nextIndex));
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    indexRef.current = target;
    setIndex(target);
  };

  const nextUnresolved = (fromIndex: number, nextStatuses = statuses) => {
    for (let step = 1; step <= tasks.length; step += 1) {
      const candidate = (fromIndex + step) % tasks.length;
      if (nextStatuses[candidate] === null) return candidate;
    }
    return -1;
  };

  const resolve = (correct: boolean, answerLabel: string) => {
    if (solved) return;
    const nextStatuses = statuses.map((value, taskIndex) => taskIndex === index ? (correct ? "correct" : "wrong") : value);
    setStatuses(nextStatuses);
    const finished = nextStatuses.every(Boolean);
    setFeedbacks((current) => ({
      ...current,
      [index]: correct
        ? `Brawo! ${task.success}`
        : `Spróbuj innym razem. Poprawny wynik to: ${formatAnswer(task)}. Dziś bez punktu.`,
    }));

    if (finished) {
      onResultChange?.(nextStatuses.every((value) => value === "correct"), answerLabel);
      return;
    }
    onResultChange?.(null, answerLabel);

    if (correct) {
      const answeredIndex = index;
      const nextIndex = nextUnresolved(answeredIndex, nextStatuses);
      timerRef.current = window.setTimeout(() => {
        if (indexRef.current === answeredIndex && nextIndex >= 0) goToTask(nextIndex);
      }, 750);
    }
  };

  const choose = (answer: string) => {
    if (readOnly || solved) return;
    setChoices((current) => ({ ...current, [index]: answer }));
    setFeedbacks((current) => ({ ...current, [index]: "" }));
  };

  const edit = (key: string) => {
    if (readOnly || solved || task.kind !== "numeric") return;
    const activeField = activeFields[index] ?? task.fields[0].id;
    setValues((current) => {
      const taskValues = current[index] ?? {};
      const previous = taskValues[activeField] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : key === "," ? previous && !previous.includes(",") ? `${previous},` : previous : `${previous}${key}`.slice(0, 7);
      return { ...current, [index]: { ...taskValues, [activeField]: next } };
    });
    setFeedbacks((current) => ({ ...current, [index]: "" }));
  };

  const check = () => {
    if (readOnly || solved) return;
    if (task.kind === "choice") {
      const answer = choices[index] ?? "";
      if (!answer) {
        setFeedbacks((current) => ({ ...current, [index]: "Wybierz jedną odpowiedź." }));
        return;
      }
      resolve(answer === task.answer, answer);
      return;
    }

    const taskValues = values[index] ?? {};
    if (task.fields.some((field) => !taskValues[field.id]?.trim())) {
      setFeedbacks((current) => ({ ...current, [index]: "Uzupełnij wszystkie wyniki." }));
      return;
    }
    const correct = task.fields.every((field) => parsePolishNumber(taskValues[field.id]) === field.answer);
    resolve(correct, task.fields.map((field) => taskValues[field.id]).join(", "));
  };

  const continueWithoutPoint = () => {
    const nextIndex = nextUnresolved(index);
    if (nextIndex >= 0) goToTask(nextIndex);
  };

  const currentValues = task.kind === "numeric" ? values[index] ?? {} : {};
  const activeField = task.kind === "numeric" ? activeFields[index] ?? task.fields[0].id : "";

  return <LessonTaskFrame
    eyebrow="Dział 9 · Powtórzenie wiadomości"
    heading={content.heading}
    description={content.description}
    questionNumber={index + 1}
    questionCount={tasks.length}
    data-solid-review={activity}
  >
    <div className="space-y-4">
      <TaskNumberNavigation statuses={statuses} index={index} readOnly={readOnly} onGoTo={goToTask} />
      <section className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-violet-50 p-2 sm:p-4">
        <SolidSketch visual={task.visual} />
      </section>
      <section className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-4 text-center">
        <p className="text-lg font-black leading-relaxed text-amber-950 sm:text-2xl">{task.prompt}</p>
      </section>

      {task.kind === "choice" ? <div className={`grid gap-2 ${task.choices.length === 2 ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        {task.choices.map((option) => <LessonTaskChoice key={option} selected={choices[index] === option} disabled={readOnly || solved} onClick={() => choose(option)} className="min-h-14 py-3 text-base">{option}</LessonTaskChoice>)}
      </div> : <>
        <div className={`grid gap-3 ${task.fields.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {task.fields.map((field) => <label key={field.id} className={`flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 p-3 font-black ${activeField === field.id ? "border-violet-700 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 bg-white"}`}>
            <span className="w-full text-center text-lg text-indigo-950">{field.label} =</span>
            <input
              aria-label={field.label}
              inputMode="none"
              readOnly
              value={currentValues[field.id] ?? ""}
              onFocus={() => setActiveFields((current) => ({ ...current, [index]: field.id }))}
              onClick={() => setActiveFields((current) => ({ ...current, [index]: field.id }))}
              className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700"
            />
            <span className="text-lg text-slate-950">{field.unit}</span>
          </label>)}
        </div>
        <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Klawiatura do obliczeń" helperText="Dotknij kratki, wpisz wynik i zatwierdź." />
      </>}

      {task.kind === "choice" && !solved ? <button type="button" disabled={readOnly} onClick={check} className="w-full rounded-2xl bg-violet-700 px-5 py-3 font-black text-white disabled:opacity-40">Sprawdź odpowiedź</button> : null}
      {feedbacks[index] ? <div role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${status === "correct" ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>
        <p>{feedbacks[index]}</p>
        {status === "wrong" && statuses.some((value) => value === null) ? <button type="button" onClick={continueWithoutPoint} className="mt-3 rounded-xl bg-violet-700 px-5 py-3 text-white">Przejdź dalej bez punktu</button> : null}
      </div> : null}
      <LessonTaskNavigator
        currentIndex={index}
        taskCount={tasks.length}
        completed={solved}
        completedCount={statuses.filter(Boolean).length}
        onPrevious={() => goToTask(index - 1)}
        onNext={() => goToTask(index + 1)}
        previousDisabled={readOnly || index === 0}
        nextDisabled={readOnly || index === tasks.length - 1}
        showProgress={false}
      />
    </div>
  </LessonTaskFrame>;
}
