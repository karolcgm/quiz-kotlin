"use client";

import { useEffect, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";

export type PrismSurfaceAreaActivity = "formula" | "calculate" | "stories";

export function prismSurfaceAreaActivityFromStageId(stageId: string): PrismSurfaceAreaActivity {
  if (stageId.includes("stories")) return "stories";
  if (stageId.includes("calculate")) return "calculate";
  return "formula";
}

type BaseKind = "triangle" | "trapezoid" | "rhombus" | "parallelogram";

type AreaTask = {
  baseKind: BaseKind;
  baseName: string;
  prompt: string;
  detail: string;
  heightLabel: string;
  unitLength: string;
  unitArea: string;
  labels: readonly string[];
  answers: { pp: number; pb: number; pc: number };
};

const CALCULATION_TASKS: readonly AreaTask[] = [
  {
    baseKind: "triangle", baseName: "trójkąt prostokątny", heightLabel: "H = 10 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Oblicz pole powierzchni graniastosłupa trójkątnego.", detail: "Podstawa jest trójkątem prostokątnym o bokach 3 cm, 4 cm i 5 cm.", labels: ["3 cm", "4 cm", "5 cm"],
    answers: { pp: 6, pb: 120, pc: 132 },
  },
  {
    baseKind: "trapezoid", baseName: "trapez równoramienny", heightLabel: "H = 6 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Oblicz pole powierzchni graniastosłupa czworokątnego.", detail: "Podstawa jest trapezem o podstawach 10 cm i 4 cm, wysokości 4 cm oraz ramionach długości 5 cm.", labels: ["10 cm", "4 cm", "4 cm", "5 cm"],
    answers: { pp: 28, pb: 144, pc: 200 },
  },
  {
    baseKind: "rhombus", baseName: "romb", heightLabel: "H = 7 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Oblicz pole powierzchni graniastosłupa czworokątnego.", detail: "Podstawa jest rombem o przekątnych 6 cm i 8 cm oraz boku 5 cm.", labels: ["e = 6 cm", "f = 8 cm", "a = 5 cm"],
    answers: { pp: 24, pb: 140, pc: 188 },
  },
  {
    baseKind: "parallelogram", baseName: "równoległobok", heightLabel: "H = 8 dm", unitLength: "dm", unitArea: "dm²",
    prompt: "Oblicz pole powierzchni graniastosłupa czworokątnego.", detail: "Podstawa jest równoległobokiem o bokach 7 dm i 5 dm oraz wysokości opuszczonej na bok 7 dm równej 4 dm.", labels: ["a = 7 dm", "b = 5 dm", "h = 4 dm"],
    answers: { pp: 28, pb: 192, pc: 248 },
  },
];

const STORY_TASKS: readonly AreaTask[] = [
  {
    baseKind: "triangle", baseName: "trójkąt prostokątny", heightLabel: "H = 20 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Pudełko ma kształt graniastosłupa trójkątnego. Ile kartonu potrzeba na wykonanie całego zamkniętego pudełka?", detail: "Podstawa jest trójkątem prostokątnym o przyprostokątnych 5 cm i 12 cm oraz przeciwprostokątnej 13 cm. Długość pudełka wynosi 20 cm.", labels: ["5 cm", "12 cm", "13 cm"],
    answers: { pp: 30, pb: 600, pc: 660 },
  },
  {
    baseKind: "trapezoid", baseName: "trapez równoramienny", heightLabel: "H = 8 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Ozdobne zamknięte opakowanie ma kształt graniastosłupa o podstawie trapezu. Oblicz pole materiału potrzebnego na całe opakowanie.", detail: "Podstawy trapezu mają 12 cm i 6 cm, wysokość trapezu 4 cm, oba ramiona po 5 cm, a wysokość graniastosłupa 8 cm.", labels: ["12 cm", "6 cm", "4 cm", "5 cm"],
    answers: { pp: 36, pb: 224, pc: 296 },
  },
  {
    baseKind: "rhombus", baseName: "romb", heightLabel: "H = 4 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Lampion ma kształt zamkniętego graniastosłupa o podstawie rombu. Jakie jest pole całej jego powierzchni?", detail: "Przekątne rombu mają 10 cm i 24 cm, bok rombu 13 cm, a wysokość lampionu 4 cm.", labels: ["e = 10 cm", "f = 24 cm", "a = 13 cm"],
    answers: { pp: 120, pb: 208, pc: 448 },
  },
  {
    baseKind: "parallelogram", baseName: "równoległobok", heightLabel: "H = 6 cm", unitLength: "cm", unitArea: "cm²",
    prompt: "Zamknięty pojemnik ma kształt graniastosłupa o podstawie równoległoboku. Oblicz pole jego powierzchni.", detail: "Boki równoległoboku mają 9 cm i 5 cm, wysokość do boku 9 cm ma 4 cm, a wysokość graniastosłupa wynosi 6 cm.", labels: ["a = 9 cm", "b = 5 cm", "h = 4 cm"],
    answers: { pp: 36, pb: 168, pc: 240 },
  },
];

function BaseDrawing({ kind, labels }: { kind: BaseKind; labels: readonly string[] }) {
  if (kind === "triangle") return <>
    <polygon points="270,195 395,195 270,95" fill="#fde68a" stroke="#92400e" strokeWidth="3" />
    <path d="M270 180h15v15" fill="none" stroke="#92400e" strokeWidth="2" />
    <text x="332" y="218" textAnchor="middle">{labels[1]}</text><text x="248" y="148" textAnchor="middle">{labels[0]}</text><text x="346" y="137" textAnchor="middle">{labels[2]}</text>
  </>;
  if (kind === "trapezoid") return <>
    <polygon points="265,195 405,195 372,95 305,95" fill="#fde68a" stroke="#92400e" strokeWidth="3" />
    <line x1="305" y1="95" x2="305" y2="195" stroke="#92400e" strokeWidth="2" strokeDasharray="6 5" />
    <path d="M305 180h15v15" fill="none" stroke="#92400e" strokeWidth="2" />
    <text x="335" y="218" textAnchor="middle">{labels[0]}</text><text x="338" y="84" textAnchor="middle">{labels[1]}</text><text x="288" y="148" textAnchor="middle">{labels[2]}</text><text x="389" y="140" textAnchor="middle">{labels[3]}</text>
  </>;
  if (kind === "rhombus") return <>
    <polygon points="335,80 410,145 335,210 260,145" fill="#fde68a" stroke="#92400e" strokeWidth="3" />
    <line x1="335" y1="80" x2="335" y2="210" stroke="#92400e" strokeWidth="2" strokeDasharray="6 5" /><line x1="260" y1="145" x2="410" y2="145" stroke="#92400e" strokeWidth="2" strokeDasharray="6 5" />
    <text x="347" y="145">{labels[0]}</text><text x="335" y="164" textAnchor="middle">{labels[1]}</text><text x="384" y="105" textAnchor="middle">{labels[2]}</text>
  </>;
  return <>
    <polygon points="270,195 405,195 375,95 240,95" fill="#fde68a" stroke="#92400e" strokeWidth="3" />
    <line x1="375" y1="95" x2="375" y2="195" stroke="#92400e" strokeWidth="2" strokeDasharray="6 5" /><path d="M360 195v-15h15" fill="none" stroke="#92400e" strokeWidth="2" />
    <text x="338" y="218" textAnchor="middle">{labels[0]}</text><text x="248" y="150" textAnchor="middle">{labels[1]}</text><text x="388" y="148" textAnchor="middle">{labels[2]}</text>
  </>;
}

function PrismDrawing({ kind, heightLabel }: { kind: BaseKind; heightLabel: string }) {
  const top = kind === "triangle" ? "105,42 165,72 45,72" : kind === "trapezoid" ? "48,75 168,75 148,38 68,38" : kind === "rhombus" ? "108,30 170,62 108,92 46,62" : "60,40 170,40 150,82 40,82";
  const bottom = top.split(" ").map((pair) => { const [x, y] = pair.split(",").map(Number); return `${x},${y + 112}`; }).join(" ");
  const topPoints = top.split(" ");
  const bottomPoints = bottom.split(" ");
  return <>
    <polygon points={bottom} fill="#a5f3fc" stroke="#164e63" strokeWidth="3" />
    {topPoints.map((point, index) => { const [x1, y1] = point.split(",").map(Number); const [x2, y2] = bottomPoints[index].split(",").map(Number); return <line key={point} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#164e63" strokeWidth="3" />; })}
    <polygon points={top} fill="#c4b5fd" stroke="#312e81" strokeWidth="3" />
    <line x1="195" y1="62" x2="195" y2="174" stroke="#be123c" strokeWidth="3" /><path d="M188 70l7-8 7 8M188 166l7 8 7-8" fill="none" stroke="#be123c" strokeWidth="3" />
    <text x="200" y="123" fill="#9f1239">{heightLabel}</text>
  </>;
}

function PrismAreaDiagram({ task }: { task: AreaTask }) {
  return <svg viewBox="0 0 450 245" className="h-auto w-full rounded-3xl bg-slate-50" role="img" aria-label={`Graniastosłup o podstawie: ${task.baseName}. ${task.heightLabel}. Wymiary podstawy: ${task.labels.join(", ")}.`}>
    <title>Graniastosłup i osobny rysunek jego podstawy</title>
    <PrismDrawing kind={task.baseKind} heightLabel={task.heightLabel} />
    <BaseDrawing kind={task.baseKind} labels={task.labels} />
    <text x="110" y="232" textAnchor="middle" fontWeight="800">BRYŁA</text><text x="335" y="232" textAnchor="middle" fontWeight="800">PODSTAWA</text>
  </svg>;
}

function FormulaSlide({ readOnly }: { readOnly: boolean }) {
  const [index, setIndex] = useState(0);
  const task = CALCULATION_TASKS[index];
  return <LessonTaskFrame eyebrow="Dział 9 · Temat 4" heading="Jak obliczamy pole powierzchni?" description="Najpierw zajmij się podstawą, potem ścianami bocznymi, a na końcu dodaj wszystkie pola.">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {CALCULATION_TASKS.map((item, itemIndex) => <LessonTaskChoice key={item.baseKind} selected={index === itemIndex} disabled={readOnly} onClick={() => setIndex(itemIndex)}>{item.baseName}</LessonTaskChoice>)}
      </div>
      <PrismAreaDiagram task={task} />
      <div className="space-y-2 rounded-3xl bg-cyan-50 p-4 font-bold text-cyan-950">
        <p><strong>1. Pole jednej podstawy:</strong> oblicz <span className="text-violet-700">Pp</span> ze wzoru odpowiedniego dla figury w podstawie.</p>
        <p><strong>2. Pole boczne:</strong> oblicz obwód podstawy <span className="text-violet-700">Op</span>, a następnie <span className="whitespace-nowrap">Pb = Op · H</span>.</p>
        <p><strong>3. Pole całkowite:</strong> dodaj dwie podstawy i pole boczne: <span className="whitespace-nowrap">Pc = 2 · Pp + Pb</span>.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-violet-100 p-3"><strong className="block text-xl text-violet-800">Pp</strong><span className="text-sm font-bold">pole podstawy</span></div>
        <div className="rounded-2xl bg-cyan-100 p-3"><strong className="block text-xl text-cyan-800">Pb</strong><span className="text-sm font-bold">pole boczne</span></div>
        <div className="rounded-2xl bg-amber-100 p-3"><strong className="block text-xl text-amber-800">Pc</strong><span className="text-sm font-bold">pole całkowite</span></div>
      </div>
    </div>
  </LessonTaskFrame>;
}

function parseAnswer(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^-?\d+(?:\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

function TaskSeries({ tasks, stories, readOnly, onResultChange }: { tasks: readonly AreaTask[]; stories?: boolean; readOnly: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({ pp: "", pb: "", pc: "" });
  const [activeField, setActiveField] = useState<keyof typeof answers>("pp");
  const [feedback, setFeedback] = useState<"empty" | "correct" | "wrong" | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index];
  const solved = feedback === "correct" || feedback === "wrong";

  const nextTask = () => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && feedback !== "wrong", `Pp=${answers.pp}, Pb=${answers.pb}, Pc=${answers.pc}`);
      return;
    }
    setIndex((value) => value + 1);
    setAnswers({ pp: "", pb: "", pc: "" });
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
    const correct = (Object.keys(task.answers) as (keyof typeof task.answers)[]).every((field) => parseAnswer(answers[field]) === task.answers[field]);
    if (correct) {
      setFeedback("correct");
      if (index === tasks.length - 1) onResultChange?.(!mistakeMade, `Pp=${answers.pp}, Pb=${answers.pb}, Pc=${answers.pc}`);
      else setPendingAdvance(true);
      return;
    }
    setMistakeMade(true);
    setFeedback("wrong");
    onResultChange?.(false, `Pp=${answers.pp}, Pb=${answers.pb}, Pc=${answers.pc}`);
  };

  return <LessonTaskFrame eyebrow="Dział 9 · Temat 4" heading={stories ? "Zadania tekstowe" : "Oblicz pole powierzchni"} description="Oblicz kolejno pole podstawy, pole boczne i pole całkowite." questionNumber={index + 1} questionCount={tasks.length}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-amber-50 p-4 text-center"><p className="text-lg font-black text-amber-950 sm:text-xl">{task.prompt}</p>{stories ? null : <p className="mt-2 font-bold text-slate-700">{task.detail}</p>}</section>
      {stories ? <section className="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-950"><p className="font-black">Dane</p><p className="mt-1 font-bold">{task.detail}</p></section> : null}
      <PrismAreaDiagram task={task} />
      <div className="grid gap-3 sm:grid-cols-3">
        {(["pp", "pb", "pc"] as const).map((field) => <label key={field} className={`rounded-2xl border-2 bg-white p-3 text-center font-black ${activeField === field ? "border-violet-600 ring-4 ring-violet-100" : "border-slate-200"}`}>
          <span className="mb-2 block">{field === "pp" ? "Pp — pole podstawy" : field === "pb" ? "Pb — pole boczne" : "Pc — pole całkowite"}</span>
          <span className="flex items-center justify-center gap-2"><input aria-label={field === "pp" ? "Pp — pole podstawy" : field === "pb" ? "Pb — pole boczne" : "Pc — pole całkowite"} inputMode="none" readOnly value={answers[field]} onFocus={() => setActiveField(field)} onClick={() => setActiveField(field)} className="h-12 w-24 rounded-xl border-2 border-violet-300 text-center text-xl font-black" /><span>{task.unitArea}</span></span>
        </label>)}
      </div>
      {feedback === "empty" ? <p role="status" className="rounded-2xl bg-amber-100 px-4 py-3 text-center font-black text-amber-950">Uzupełnij Pp, Pb i Pc.</p> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 px-4 py-3 text-center font-black text-emerald-950">Brawo! Wszystkie trzy pola są obliczone poprawnie.{stories ? ` Odpowiedź: pole całej powierzchni wynosi ${task.answers.pc} ${task.unitArea}.` : ""}</p> : null}
      {feedback === "wrong" ? <div className="space-y-3 rounded-2xl bg-amber-100 px-4 py-3 text-center font-bold text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to: Pp = {task.answers.pp} {task.unitArea}, Pb = {task.answers.pb} {task.unitArea}, Pc = {task.answers.pc} {task.unitArea}. Dziś bez punktu.</p><button type="button" onClick={nextTask} className="rounded-xl bg-violet-700 px-5 py-3 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
      <LessonNumericKeypad onKey={onKey} onConfirm={check} disabled={readOnly || solved} allowSeparator label="Kalkulator do pola graniastosłupa" helperText="Dotknij kratki Pp, Pb lub Pc, wpisz wynik i zatwierdź wszystkie odpowiedzi." />
    </div>
  </LessonTaskFrame>;
}

export function PrismSurfaceAreaLessonLab({ activity, readOnly = false, onResultChange }: { activity: PrismSurfaceAreaActivity; readOnly?: boolean; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  if (activity === "formula") return <FormulaSlide readOnly={readOnly} />;
  if (activity === "stories") return <TaskSeries tasks={STORY_TASKS} stories readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskSeries tasks={CALCULATION_TASKS} readOnly={readOnly} onResultChange={onResultChange} />;
}
