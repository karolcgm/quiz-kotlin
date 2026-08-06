"use client";

import { useEffect, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type PrismVolumeActivity = "formula" | "calculate" | "stories";

export function prismVolumeActivityFromStageId(stageId: string): PrismVolumeActivity {
  if (stageId.includes("stories")) return "stories";
  if (stageId.includes("calculate")) return "calculate";
  return "formula";
}

type BaseKind = "triangle" | "trapezoid" | "rhombus" | "parallelogram";

type VolumeTask = {
  baseKind: BaseKind;
  baseName: string;
  prompt: string;
  detail: string;
  heightLabel: string;
  unitArea: string;
  unitVolume: string;
  labels: readonly string[];
  answers: { pp: number; v: number };
};

const CALCULATION_TASKS: readonly VolumeTask[] = [
  {
    baseKind: "triangle", baseName: "trójkąt prostokątny", heightLabel: "H = 7 cm", unitArea: "cm²", unitVolume: "cm³",
    prompt: "Oblicz objętość graniastosłupa trójkątnego.", detail: "Podstawa jest trójkątem prostokątnym o przyprostokątnych 5 cm i 8 cm.", labels: ["5 cm", "8 cm"], answers: { pp: 20, v: 140 },
  },
  {
    baseKind: "trapezoid", baseName: "trapez", heightLabel: "H = 8 cm", unitArea: "cm²", unitVolume: "cm³",
    prompt: "Oblicz objętość graniastosłupa czworokątnego.", detail: "Podstawa jest trapezem o podstawach 9 cm i 5 cm oraz wysokości 4 cm.", labels: ["9 cm", "5 cm", "4 cm"], answers: { pp: 28, v: 224 },
  },
  {
    baseKind: "rhombus", baseName: "romb", heightLabel: "H = 9 dm", unitArea: "dm²", unitVolume: "dm³",
    prompt: "Oblicz objętość graniastosłupa o podstawie rombu.", detail: "Przekątne rombu mają długości 10 dm i 6 dm.", labels: ["e = 10 dm", "f = 6 dm"], answers: { pp: 30, v: 270 },
  },
  {
    baseKind: "parallelogram", baseName: "równoległobok", heightLabel: "H = 6 m", unitArea: "m²", unitVolume: "m³",
    prompt: "Oblicz objętość graniastosłupa czworokątnego.", detail: "Podstawa jest równoległobokiem o boku 8 m i wysokości opuszczonej na ten bok równej 3 m.", labels: ["a = 8 m", "h = 3 m"], answers: { pp: 24, v: 144 },
  },
];

const STORY_TASKS: readonly VolumeTask[] = [
  {
    baseKind: "triangle", baseName: "trójkąt prostokątny", heightLabel: "H = 12 m", unitArea: "m²", unitVolume: "m³",
    prompt: "Tunel ma kształt graniastosłupa trójkątnego. Jaką objętość ma jego wnętrze?", detail: "Przekrój tunelu jest trójkątem prostokątnym o podstawie 6 m i wysokości 4 m. Tunel ma długość 12 m.", labels: ["6 m", "4 m"], answers: { pp: 12, v: 144 },
  },
  {
    baseKind: "trapezoid", baseName: "trapez", heightLabel: "H = 10 m", unitArea: "m²", unitVolume: "m³",
    prompt: "Rów odpływowy ma kształt graniastosłupa o podstawie trapezu. Oblicz objętość rowu.", detail: "Równoległe boki przekroju mają 5 m i 3 m, wysokość trapezu wynosi 2 m, a długość rowu 10 m.", labels: ["5 m", "3 m", "2 m"], answers: { pp: 8, v: 80 },
  },
  {
    baseKind: "rhombus", baseName: "romb", heightLabel: "H = 5 cm", unitArea: "cm²", unitVolume: "cm³",
    prompt: "Ozdobne pudełko ma podstawę w kształcie rombu. Oblicz pojemność jego wnętrza w centymetrach sześciennych.", detail: "Przekątne podstawy mają 12 cm i 8 cm, a wysokość pudełka wynosi 5 cm.", labels: ["e = 12 cm", "f = 8 cm"], answers: { pp: 48, v: 240 },
  },
  {
    baseKind: "parallelogram", baseName: "równoległobok", heightLabel: "H = 4 dm", unitArea: "dm²", unitVolume: "dm³",
    prompt: "Pojemnik ma podstawę w kształcie równoległoboku. Oblicz jego objętość.", detail: "Bok podstawy ma 7 dm, wysokość opuszczona na ten bok 3 dm, a wysokość pojemnika 4 dm.", labels: ["a = 7 dm", "h = 3 dm"], answers: { pp: 21, v: 84 },
  },
];

type DrawingPoint = readonly [number, number];

function BaseDrawing({ kind, labels }: { kind: BaseKind; labels: readonly string[] }) {
  return <svg viewBox="0 0 300 220" className="h-auto w-full" aria-hidden="true">
    {kind === "triangle" ? <>
      <polygon points="65,180 235,180 65,50" fill="#fde68a" stroke="#92400e" strokeWidth="4" />
      <path d="M65 163h17v17" fill="none" stroke="#92400e" strokeWidth="3" />
      <text x="150" y="207" textAnchor="middle" fontWeight="800">{labels[1]}</text><text x="38" y="118" textAnchor="middle" fontWeight="800">{labels[0]}</text>
    </> : null}
    {kind === "trapezoid" ? <>
      <polygon points="45,180 255,180 205,55 95,55" fill="#fde68a" stroke="#92400e" strokeWidth="4" />
      <line x1="95" y1="55" x2="95" y2="180" stroke="#92400e" strokeWidth="3" strokeDasharray="7 6" /><path d="M95 163h17v17" fill="none" stroke="#92400e" strokeWidth="3" />
      <text x="150" y="207" textAnchor="middle" fontWeight="800">{labels[0]}</text><text x="150" y="42" textAnchor="middle" fontWeight="800">{labels[1]}</text><text x="72" y="120" textAnchor="middle" fontWeight="800">{labels[2]}</text>
    </> : null}
    {kind === "rhombus" ? <>
      <polygon points="150,25 265,110 150,195 35,110" fill="#fde68a" stroke="#92400e" strokeWidth="4" />
      <line x1="150" y1="25" x2="150" y2="195" stroke="#92400e" strokeWidth="3" strokeDasharray="7 6" /><line x1="35" y1="110" x2="265" y2="110" stroke="#92400e" strokeWidth="3" strokeDasharray="7 6" />
      <text x="160" y="82" fontWeight="800">{labels[0]}</text><text x="150" y="132" textAnchor="middle" fontWeight="800">{labels[1]}</text>
    </> : null}
    {kind === "parallelogram" ? <>
      <polygon points="55,180 255,180 220,55 20,55" fill="#fde68a" stroke="#92400e" strokeWidth="4" />
      <line x1="220" y1="55" x2="220" y2="180" stroke="#92400e" strokeWidth="3" strokeDasharray="7 6" /><path d="M203 180v-17h17" fill="none" stroke="#92400e" strokeWidth="3" />
      <text x="155" y="207" textAnchor="middle" fontWeight="800">{labels[0]}</text><text x="236" y="120" textAnchor="middle" fontWeight="800">{labels[1]}</text>
    </> : null}
  </svg>;
}

function prismTopPoints(kind: BaseKind): DrawingPoint[] {
  if (kind === "triangle") return [[125, 30], [205, 70], [45, 70]];
  if (kind === "trapezoid") return [[45, 75], [205, 75], [180, 32], [75, 32]];
  if (kind === "rhombus") return [[125, 22], [205, 62], [125, 100], [45, 62]];
  return [[70, 32], [210, 32], [180, 82], [40, 82]];
}

function pointsAttribute(points: readonly DrawingPoint[]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function PrismDrawing({ kind, heightLabel }: { kind: BaseKind; heightLabel: string }) {
  const top = prismTopPoints(kind);
  const bottom = top.map(([x, y]) => [x, y + 100] as const);
  return <svg viewBox="0 0 300 220" className="h-auto w-full" aria-hidden="true">
    <polygon points={pointsAttribute(bottom)} fill="#cffafe" stroke="#164e63" strokeWidth="4" />
    {top.map((point, index) => {
      const next = (index + 1) % top.length;
      return <polygon key={`${point[0]}-${point[1]}`} points={pointsAttribute([point, top[next], bottom[next], bottom[index]])} fill={index % 2 ? "#a5f3fc" : "#67e8f9"} fillOpacity="0.78" stroke="#164e63" strokeWidth="3" />;
    })}
    <polygon points={pointsAttribute(top)} fill="#c4b5fd" stroke="#312e81" strokeWidth="4" />
    {top.map(([x, y], index) => <line key={`${x}-${y}`} x1={x} y1={y} x2={bottom[index][0]} y2={bottom[index][1]} stroke="#172554" strokeWidth="3" />)}
    <line x1="245" y1="60" x2="245" y2="160" stroke="#be123c" strokeWidth="3" /><path d="M238 68l7-8 7 8M238 152l7 8 7-8" fill="none" stroke="#be123c" strokeWidth="3" />
    <text x="250" y="190" textAnchor="middle" fill="#9f1239" fontWeight="800">{heightLabel}</text>
  </svg>;
}

function PrismVolumeDiagram({ task }: { task: VolumeTask }) {
  return <section className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2" role="img" aria-label={`Graniastosłup o podstawie: ${task.baseName}. ${task.heightLabel}. Wymiary podstawy: ${task.labels.join(", ")}.`}>
    <div className="rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-3"><p className="mb-1 text-center font-black text-cyan-950">BRYŁA</p><PrismDrawing kind={task.baseKind} heightLabel={task.heightLabel} /></div>
    <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-3"><p className="mb-1 text-center font-black text-amber-950">PODSTAWA</p><BaseDrawing kind={task.baseKind} labels={task.labels} /></div>
  </section>;
}

function FormulaSlide({ readOnly }: { readOnly: boolean }) {
  const [index, setIndex] = useState(0);
  const task = CALCULATION_TASKS[index];
  return <LessonTaskFrame eyebrow="Dział 9 · Temat 6" heading="Objętość graniastosłupa prostego" description="Najpierw oblicz pole podstawy, a potem pomnóż je przez wysokość graniastosłupa.">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CALCULATION_TASKS.map((item, itemIndex) => <LessonTaskChoice key={item.baseKind} selected={index === itemIndex} disabled={readOnly} onClick={() => setIndex(itemIndex)}>{item.baseName}</LessonTaskChoice>)}
      </div>
      <PrismVolumeDiagram task={task} />
      <div className="rounded-3xl bg-violet-100 p-5 text-center text-violet-950">
        <p className="text-sm font-black uppercase tracking-wider">Wzór na objętość</p>
        <p className="mt-2 whitespace-nowrap text-3xl font-black">V = Pp · H</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-violet-100 p-3"><strong className="block text-xl text-violet-800">Pp</strong><span className="text-sm font-bold">pole podstawy</span></div>
        <div className="rounded-2xl bg-cyan-100 p-3"><strong className="block text-xl text-cyan-800">H</strong><span className="text-sm font-bold">wysokość graniastosłupa</span></div>
        <div className="rounded-2xl bg-amber-100 p-3"><strong className="block text-xl text-amber-800">V</strong><span className="text-sm font-bold">objętość</span></div>
      </div>
    </div>
  </LessonTaskFrame>;
}

function parseAnswer(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

function TaskSeries({ tasks, stories, readOnly, onResultChange }: { tasks: readonly VolumeTask[]; stories?: boolean; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({ pp: "", v: "" });
  const [activeField, setActiveField] = useState<keyof typeof answers>("pp");
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index];
  const solved = feedback === "correct" || feedback === "wrong";

  const nextTask = () => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && feedback !== "wrong", `Pp=${answers.pp}, V=${answers.v}`);
      return;
    }
    setIndex((value) => value + 1);
    setAnswers({ pp: "", v: "" });
    setActiveField("pp");
    setFeedback(null);
    setPendingAdvance(false);
  };

  useEffect(() => {
    if (!pendingAdvance) return;
    const timeout = window.setTimeout(nextTask, 700);
    return () => window.clearTimeout(timeout);
  });

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => {
      const previous = current[activeField];
      const value = key === "backspace" ? previous.slice(0, -1) : key === "," ? (previous.includes(",") ? previous : `${previous},`) : `${previous}${key}`.slice(0, 8);
      return { ...current, [activeField]: value };
    });
    setFeedback(null);
  };

  const check = () => {
    if (Object.values(answers).some((value) => !value.trim())) {
      setFeedback("empty");
      return;
    }
    const correct = parseAnswer(answers.pp) === task.answers.pp && parseAnswer(answers.v) === task.answers.v;
    if (correct) {
      setFeedback("correct");
      if (index === tasks.length - 1) onResultChange?.(!mistakeMade, `Pp=${answers.pp}, V=${answers.v}`);
      else setPendingAdvance(true);
      return;
    }
    setMistakeMade(true);
    setFeedback("wrong");
    onResultChange?.(false, `Pp=${answers.pp}, V=${answers.v}`);
  };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 6" heading={stories ? "Objętość w zadaniach tekstowych" : "Oblicz objętość"} description="Oblicz pole podstawy, a następnie zastosuj wzór V = Pp · H." questionNumber={index + 1} questionCount={tasks.length}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-4 text-center"><p className="text-lg font-black text-amber-950 sm:text-xl">{task.prompt}</p>{stories ? null : <p className="mt-2 font-bold text-slate-700">{task.detail}</p>}</section>
      {stories ? <section className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950"><p className="font-black">Dane</p><p className="mt-1 font-bold">{task.detail}</p></section> : null}
      <PrismVolumeDiagram task={task} />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["pp", "v"] as const).map((field) => <label key={field} className={`rounded-2xl border-2 bg-white p-3 text-center font-black ${activeField === field ? "border-violet-600 ring-4 ring-violet-100" : "border-slate-200"}`}>
          <span className="mb-2 block">{field === "pp" ? "Pp — pole podstawy" : "V — objętość"}</span>
          <span className="flex items-center justify-center gap-2"><input aria-label={field === "pp" ? "Pp — pole podstawy" : "V — objętość"} inputMode="none" readOnly value={answers[field]} onFocus={() => setActiveField(field)} onClick={() => setActiveField(field)} className="h-12 w-28 rounded-xl border-2 border-violet-300 text-center text-xl font-black" /><span>{field === "pp" ? task.unitArea : task.unitVolume}</span></span>
        </label>)}
      </div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij Pp oraz V.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Pole podstawy i objętość są obliczone poprawnie.{stories ? ` Odpowiedź: objętość wynosi ${task.answers.v} ${task.unitVolume}.` : ""}</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to: Pp = {task.answers.pp} {task.unitArea}, V = {task.answers.v} {task.unitVolume}. Dziś bez punktu.</p><button type="button" onClick={nextTask} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
      <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Kalkulator do objętości graniastosłupa" helperText="Dotknij kratki Pp lub V, wpisz wynik i zatwierdź obie odpowiedzi." />
    </div>
  </LessonTaskFrame>;
}

export function PrismVolumeLessonLab({ activity, readOnly = false, onResultChange }: { activity: PrismVolumeActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  if (activity === "formula") return <FormulaSlide readOnly={readOnly} />;
  if (activity === "stories") return <TaskSeries tasks={STORY_TASKS} stories readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskSeries tasks={CALCULATION_TASKS} readOnly={readOnly} onResultChange={onResultChange} />;
}
