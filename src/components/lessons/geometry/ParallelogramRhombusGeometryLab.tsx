"use client";

import { useEffect, useState } from "react";
import type { GeometryLabMode } from "@/types/geometry";
import styles from "@/components/lessons/geometry/parallelogramRhombus.module.css";

interface Props {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

interface ChoiceTask {
  prompt: string;
  options: readonly string[];
  correct: string;
  hint: string;
}

const FIGURE_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Która figura ma wszystkie cztery boki tej samej długości?",
    options: ["Równoległobok", "Romb", "Każdy czworokąt"],
    correct: "Romb",
    hint: "Romb ma cztery boki tej samej długości.",
  },
  {
    prompt: "Które zdanie jest prawdziwe zarówno o równoległoboku, jak i o rombie?",
    options: ["Wszystkie kąty mają 90°", "Każdy bok ma inną długość", "Przeciwległe boki są równoległe"],
    correct: "Przeciwległe boki są równoległe",
    hint: "Obie figury mają dwie pary boków równoległych.",
  },
  {
    prompt: "Które zdanie najdokładniej opisuje romb?",
    options: ["To równoległobok o czterech równych bokach", "To prostokąt o różnych bokach", "To figura bez boków równoległych"],
    correct: "To równoległobok o czterech równych bokach",
    hint: "Romb zachowuje własności równoległoboku i ma dodatkowo cztery równe boki.",
  },
];

const DIAGONAL_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Co dzieje się z przekątnymi w równoległoboku?",
    options: ["Nie przecinają się", "Przecinają się i dzielą wzajemnie na połowy", "Zawsze są prostopadłe"],
    correct: "Przecinają się i dzielą wzajemnie na połowy",
    hint: "Punkt przecięcia jest środkiem każdej przekątnej.",
  },
  {
    prompt: "Która własność przekątnych odróżnia romb od ogólnego równoległoboku?",
    options: ["Są prostopadłe", "Nie mają punktu wspólnego", "Każda ma inną połowę"],
    correct: "Są prostopadłe",
    hint: "Przekątne rombu przecinają się pod kątem prostym.",
  },
  {
    prompt: "Przekątne figury przecinają się w połowie i są prostopadłe. Która z poznanych figur na pewno ma obie te własności?",
    options: ["Dowolny równoległobok", "Trapez", "Romb"],
    correct: "Romb",
    hint: "W rombie przekątne dzielą się na połowy i są prostopadłe.",
  },
];

const ANGLE_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Kąt A równoległoboku ma 65°. Ile ma sąsiedni kąt B?",
    options: ["115°", "65°", "25°"],
    correct: "115°",
    hint: "Kąty sąsiednie w równoległoboku mają razem 180°.",
  },
  {
    prompt: "Kąt A równoległoboku ma 65°. Ile ma leżący naprzeciwko kąt C?",
    options: ["25°", "115°", "65°"],
    correct: "65°",
    hint: "Kąty leżące naprzeciwko w równoległoboku są równe.",
  },
  {
    prompt: "Jeden kąt równoległoboku ma 128°. Jakie miary mają trzy pozostałe kąty?",
    options: ["52°, 128°, 52°", "128°, 128°, 52°", "62°, 118°, 62°"],
    correct: "52°, 128°, 52°",
    hint: "Kąt naprzeciwko ma 128°, a każdy kąt sąsiedni ma 180° − 128°.",
  },
];

const FIGURE_FACTS = [
  "Równoległobok ma dwie pary boków równoległych. Przeciwległe boki mają tę samą długość.",
  "Romb jest równoległobokiem, w którym wszystkie cztery boki mają tę samą długość.",
  "Przeciwległe kąty obu figur są równe.",
] as const;

const DIAGONAL_FACTS = [
  "Przekątne równoległoboku przecinają się w swoich środkach — dzielą się wzajemnie na połowy.",
  "Przekątne rombu także dzielą się wzajemnie na połowy.",
  "W rombie przekątne są dodatkowo prostopadłe do siebie.",
] as const;

const ANGLE_FACTS = [
  "Kąty leżące naprzeciwko w równoległoboku są równe.",
  "Dwa kąty sąsiednie w równoległoboku mają razem 180°.",
] as const;

function FiguresVisual({ diagonals = false }: { diagonals?: boolean }) {
  return <svg viewBox="0 0 900 330" className={styles.visual} role="img" aria-label={diagonals ? "Przekątne równoległoboku i rombu" : "Równoległobok i romb"}>
    <rect width="900" height="330" rx="28" className={styles.background} />
    <g data-parallelogram-figure>
      <polygon points="55,235 125,70 410,70 340,235" className={styles.parallelogram} />
      {diagonals ? <>
        <path d="M55 235L410 70M125 70L340 235" className={styles.diagonal} data-diagonal />
        <circle cx="232.5" cy="152.5" r="7" className={styles.midpoint} />
      </> : null}
      <text x="232" y="292" className={styles.label}>RÓWNOLEGŁOBOK</text>
    </g>
    <g data-rhombus-figure>
      <polygon points="660,42 830,152 660,262 490,152" className={styles.rhombus} />
      {diagonals ? <>
        <path d="M660 42L660 262M490 152L830 152" className={styles.diagonal} data-diagonal />
        <circle cx="660" cy="152" r="7" className={styles.midpoint} />
        <path d="M660 121 A31 31 0 0 1 691 152" className={styles.rightAngleArc} data-rhombus-perpendicular />
        <circle cx="678" cy="134" r="4.5" className={styles.rightAngleDot} />
      </> : null}
      <text x="660" y="308" className={styles.label}>ROMB</text>
    </g>
  </svg>;
}

function AnglesVisual() {
  return <svg viewBox="0 0 760 360" className={styles.angleVisual} role="img" aria-label="Kąty równoległoboku">
    <rect width="760" height="360" rx="28" className={styles.background} />
    <polygon points="90,275 175,70 650,70 565,275" className={styles.parallelogram} />
    <path d="M135 275 A45 45 0 0 1 108 233" className={styles.angleArcA} />
    <path d="M156 116 A48 48 0 0 1 215 70" className={styles.angleArcB} />
    <path d="M605 70 A45 45 0 0 1 632 112" className={styles.angleArcA} />
    <path d="M584 229 A48 48 0 0 1 525 275" className={styles.angleArcB} />
    <text x="120" y="252" className={styles.angleValue}>A = 65°</text>
    <text x="178" y="116" className={styles.angleName}>B</text>
    <text x="611" y="113" className={styles.angleName}>C</text>
    <text x="535" y="245" className={styles.angleName}>D</text>
    <text x="370" y="325" className={styles.sumLabel}>kąty sąsiednie: 65° + 115° = 180°</text>
  </svg>;
}

function ChoiceSeries({ title, description, facts, tasks, visual, readOnly = false, onResultChange }: {
  title: string;
  description: string;
  facts: readonly string[];
  tasks: readonly ChoiceTask[];
  visual: "figures" | "diagonals" | "angles";
} & Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = tasks[index]!;

  useEffect(() => {
    if (!solved || index === tasks.length - 1) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => current + 1);
      setSelected("");
      setFeedback("");
      setSolved(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved, tasks.length]);

  const confirm = () => {
    if (!selected) {
      setFeedback("Najpierw wybierz odpowiedź.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (selected !== task.correct) {
      setFeedback(task.hint);
      onResultChange?.(false, selected);
      return;
    }
    setFeedback("Dobrze. Odpowiedź wynika z własności pokazanej na rysunku.");
    setSolved(true);
    if (index === tasks.length - 1) onResultChange?.(true, `ukończono ${tasks.length} zadania: ${title}`);
    else onResultChange?.(null);
  };

  return <section className={styles.lab} data-parallelogram-rhombus-series={visual}>
    {visual === "angles" ? <AnglesVisual /> : <FiguresVisual diagonals={visual === "diagonals"} />}
    <header className={styles.header}>
      <p>Równoległoboki i romby</p>
      <h2>{title}</h2>
      <span>{description}</span>
    </header>
    <div className={styles.facts}>{facts.map((fact) => <p key={fact}>{fact}</p>)}</div>
    <div className={styles.taskCard}>
      <b>Zadanie {index + 1}/{tasks.length}</b>
      <p>{task.prompt}</p>
      <div className={styles.options}>{task.options.map((option) => <button key={option} type="button" disabled={readOnly || solved} aria-pressed={selected === option} onClick={() => { setSelected(option); setFeedback(""); onResultChange?.(null); }}>{option}</button>)}</div>
      <button type="button" className={styles.confirm} disabled={readOnly || solved} onClick={confirm}>Zatwierdź</button>
      <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
    </div>
  </section>;
}

export function ParallelogramRhombusGeometryLab({ seed, readOnly = false, assessmentSubmitted = false, mode = "practice", onResultChange }: Props) {
  const activity = Math.abs(Math.trunc(seed)) % 100;
  const locked = readOnly || mode === "assessment" && assessmentSubmitted;
  if (activity === 1) return <ChoiceSeries title="Jak rozpoznać obie figury?" description="Porównaj kształt i najważniejsze własności równoległoboku oraz rombu." facts={FIGURE_FACTS} tasks={FIGURE_TASKS} visual="figures" readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 2) return <ChoiceSeries title="Przekątne równoległoboku i rombu" description="Przekątna łączy dwa przeciwległe wierzchołki. Odczytaj punkt przecięcia obu przekątnych." facts={DIAGONAL_FACTS} tasks={DIAGONAL_TASKS} visual="diagonals" readOnly={locked} onResultChange={onResultChange} />;
  return <ChoiceSeries title="Kąty równoległoboku" description="Korzystaj z równości kątów przeciwległych i sumy 180° kątów sąsiednich." facts={ANGLE_FACTS} tasks={ANGLE_TASKS} visual="angles" readOnly={locked} onResultChange={onResultChange} />;
}
