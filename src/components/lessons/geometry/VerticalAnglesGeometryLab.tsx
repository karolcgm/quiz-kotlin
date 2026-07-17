"use client";

import { useMemo, useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import { pointById } from "@/lib/math/geometry";
import {
  atomicIntersectionSectors,
  createPublicVerticalAnglesTask,
  createVerticalAnglesGeometryState,
  intersectionLineDirection,
  intersectionSectorsForPair,
  moveIntersectionLineHandle,
  relationForAnglePair,
  setIntersectionLineDirection,
  verticalAnglesSeedFor,
  type AnglePairRelation,
  type IntersectionLineId,
  type VerticalAnglesActivity,
} from "@/lib/math/geometry/verticalAngles";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, DiagnosticSolution } from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";
import styles from "@/components/lessons/geometry/verticalAngles.module.css";

type PairChoice = "vertical" | "adjacent";
type NumericAnswerField = "vertical" | "adjacent" | "second-adjacent";
type RepairCategory = "pair" | "calculation" | "property";
type VerticalAnglesDiagnosticCode =
  | "ANGLE_PAIR_INCOMPLETE"
  | "ANGLE_VERTICAL_PAIR_INCORRECT"
  | "ANGLE_ADJACENT_PAIR_INCORRECT"
  | "ANGLE_PROPERTY_INCORRECT"
  | "ANGLE_INTERFACE_INPUT"
  | "ANGLE_CALCULATION_INCORRECT"
  | "ANGLE_PROPERTY_MISMATCH"
  | "ANGLE_REPAIR_INCORRECT";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Zadanie 1",
  core: "Zadanie 2",
  challenge: "Zadanie 3",
};

const ACTIVITY_TITLES: Record<VerticalAnglesActivity, string> = {
  crossing: "Skrzyżowanie prostych",
  pairs: "Rozpoznaj pary kątów",
  "one-angle": "Obliczamy brakujące kąty",
  "three-lines": "Kąty utworzone przez trzy proste",
  roundabout: "Oblicz miary kątów",
  repair: "Napraw błędne oznaczenie",
  independent: "Praca samodzielna",
};

const RELATION_LABELS: Record<PairChoice, string> = {
  vertical: "kąty wierzchołkowe",
  adjacent: "kąty przyległe",
};

const DIAGNOSTIC_COPY: Record<VerticalAnglesDiagnosticCode, DiagnosticFeedbackCopy> = {
  ANGLE_PAIR_INCOMPLETE: {
    area: "Nie wskazano jeszcze dokładnie dwóch kątów.",
    guidingQuestion: "Które dwa pola mają wspólny wierzchołek i tworzą sprawdzaną parę?",
    visualHint: "Wybierz dwie etykiety α, β, γ lub δ; aktywne pola dostaną gruby obrys.",
    analogousExample: "W układzie czterech pól para 1 i 3 leży naprzeciwko, a 1 i 2 obok siebie.",
  },
  ANGLE_VERTICAL_PAIR_INCORRECT: {
    area: "Wybrane kąty nie leżą naprzeciwko siebie.",
    guidingQuestion: "Czy ramiona jednego kąta są przedłużeniami ramion drugiego?",
    visualHint: "Szukaj pól z tym samym symbolem i wzorem, oddzielonych wierzchołkiem O.",
    analogousExample: "Jeśli pola 1 i 3 są naprzeciwko, tworzą parę wierzchołkową.",
  },
  ANGLE_ADJACENT_PAIR_INCORRECT: {
    area: "Wybrane kąty nie tworzą pary przyległej.",
    guidingQuestion: "Czy mają jedno wspólne ramię, a pozostałe ramiona tworzą prostą?",
    visualHint: "Para przyległa zajmuje dwa sąsiednie sektory i razem wypełnia półpełny kąt.",
    analogousExample: "Pola 1 i 2 sąsiadują i razem mają 180°.",
  },
  ANGLE_PROPERTY_INCORRECT: {
    area: "Nazwa własności nie zgadza się z położeniem wybranej pary.",
    guidingQuestion: "Czy kąty leżą naprzeciwko, czy mają wspólne ramię?",
    visualHint: "Naprzeciwko oznacza równe kąty wierzchołkowe; obok oznacza sumę 180° dla kątów przyległych.",
    analogousExample: "35° i 35° naprzeciwko są wierzchołkowe, a 35° i 145° obok są przyległe.",
  },
  ANGLE_INTERFACE_INPUT: {
    area: "Co najmniej jedno pole odpowiedzi jest puste albo nie zawiera liczby.",
    guidingQuestion: "Czy w obu polach wpisano miary w stopniach i wybrano oba uzasadnienia?",
    visualHint: "Najpierw uzupełnij pola liczbowe, potem zaznacz własność pod każdym obliczeniem.",
    analogousExample: "Dla danego 40° wpisz 40 przy kącie wierzchołkowym i 140 przy przyległym.",
  },
  ANGLE_CALCULATION_INCORRECT: {
    area: "Co najmniej jedna obliczona miara jest niepoprawna.",
    guidingQuestion: "Czy kąt naprzeciwko zachowuje miarę, a kąt obok dopełnia ją do 180°?",
    visualHint: "Porównaj pole wierzchołkowe znakiem =, a przy przyległym zapisz 180° − dana miara.",
    analogousExample: "Dla 68° kąt wierzchołkowy ma 68°, a przyległy 112°.",
  },
  ANGLE_PROPERTY_MISMATCH: {
    area: "Wyniki liczbowe są poprawne, ale wskazana własność nie uzasadnia obliczenia.",
    guidingQuestion: "Który wynik wynika z równości, a który z sumy 180°?",
    visualHint: "Połącz znak = z parą naprzeciwko i zapis + = 180° z parą sąsiednią.",
    analogousExample: "52° = 52° dla kątów wierzchołkowych; 52° + 128° = 180° dla przyległych.",
  },
  ANGLE_REPAIR_INCORRECT: {
    area: "Wskazany rodzaj błędu albo poprawka nie naprawia oznaczenia.",
    guidingQuestion: "Czy błąd dotyczy wyboru pary, rachunku, czy użytej własności?",
    visualHint: "Najpierw nazwij warstwę błędu, potem sprawdź położenie pary i zależność liczbową.",
    analogousExample: "Gdy sąsiednią parę nazwano wierzchołkową, poprawiamy parę/własność, nie dodawanie.",
  },
};

const DIAGNOSTIC_SOLUTIONS: Record<VerticalAnglesDiagnosticCode, DiagnosticSolution> = {
  ANGLE_PAIR_INCOMPLETE: { steps: ["Wybierz pierwszą etykietę.", "Wybierz drugą, inną etykietę.", "Dopiero wtedy nazwij i sprawdź parę."] },
  ANGLE_VERTICAL_PAIR_INCORRECT: { steps: ["Znajdź wierzchołek O.", "Przejdź przez O na pole naprzeciwko.", "Wybierz parę α–γ albo β–δ."] },
  ANGLE_ADJACENT_PAIR_INCORRECT: { steps: ["Zostaw pierwszy kąt.", "Wybierz pole tuż obok ze wspólnym ramieniem.", "Sprawdź, czy suma miar wynosi 180°."] },
  ANGLE_PROPERTY_INCORRECT: { steps: ["Ustal położenie pary.", "Naprzeciwko wybierz równość kątów wierzchołkowych.", "Obok wybierz sumę 180° kątów przyległych."] },
  ANGLE_INTERFACE_INPUT: { steps: ["Wpisz obie liczby.", "Wybierz własność dla obu obliczeń.", "Naciśnij Sprawdź obliczenia."] },
  ANGLE_CALCULATION_INCORRECT: { steps: ["Przepisz daną miarę dla kąta naprzeciwko.", "Od 180° odejmij daną miarę dla kąta obok.", "Sprawdź rachunek."] },
  ANGLE_PROPERTY_MISMATCH: { steps: ["Zostaw poprawne liczby.", "Przy równym wyniku wybierz kąty wierzchołkowe.", "Przy dopełnieniu do 180° wybierz kąty przyległe."] },
  ANGLE_REPAIR_INCORRECT: { steps: ["Porównaj położenie zaznaczonych pól.", "Sprawdź ich miary.", "Wybierz kategorię i poprawkę zgodną z obiema obserwacjami."] },
};

function pointAt(origin: GeometryPointCoordinates, directionDegrees: number, distance: number): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * distance, y: origin.y + Math.sin(radians) * distance };
}

function arcPath(origin: GeometryPointCoordinates, startDegrees: number, endDegrees: number, radius: number): string {
  const start = pointAt(origin, startDegrees, radius);
  const normalizedSweep = ((endDegrees - startDegrees) % 360 + 360) % 360;
  const end = pointAt(origin, endDegrees, radius);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${normalizedSweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`;
}

function readFinite(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function relationName(relation: AnglePairRelation): string {
  return relation === "vertical" ? "wierzchołkowe" : relation === "adjacent" ? "przyległe" : "inna para";
}

function diagnosticPresentation(code: VerticalAnglesDiagnosticCode, score = 0, maxScore = 1) {
  const status = score === maxScore ? "correct" : score > 0 ? "partially-correct" : "incorrect";
  return {
    result: createLessonGradeResult({ status, score, maxScore, errorCodes: status === "correct" ? [] : [code], feedbackKey: `m5-4.4-${code.toLowerCase()}` }),
    copy: DIAGNOSTIC_COPY[code],
    solution: DIAGNOSTIC_SOLUTIONS[code],
    highlights: [{
      id: "intersection-pair",
      kind: "pair",
      memberIds: ["angle-alpha", "angle-beta", "angle-gamma", "angle-delta"],
      label: code === "ANGLE_CALCULATION_INCORRECT" ? "pola obliczeń miar" : "wybrana para przy O",
      state: "attention",
      pattern: "dashed",
      symbol: code.includes("CALCULATION") ? "±" : "∠",
      accent: "amber",
    } satisfies DiagnosticHighlightTarget],
  };
}

export interface VerticalAnglesGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

const SIMPLE_ANGLE_PAIRS_SEED = 440_101;

function SimpleAngleAnswer({
  label,
  symbol,
  digits,
  activeGroup,
  group,
  disabled,
  onActivate,
}: {
  label: string;
  symbol: string;
  digits: string[];
  activeGroup: number;
  group: number;
  disabled: boolean;
  onActivate: (group: number, index: number) => void;
}) {
  return (
    <div className={styles.simpleAngleAnswer}>
      <strong>{label}: {symbol} =</strong>
      <div role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <button
            key={index}
            type="button"
            aria-label={`${label}, cyfra ${index + 1}`}
            aria-pressed={activeGroup === group}
            disabled={disabled}
            onClick={() => onActivate(group, index)}
          >
            {digit || <span aria-hidden>&nbsp;</span>}
          </button>
        ))}
        <b aria-hidden>°</b>
      </div>
    </div>
  );
}

function SimpleAnglePairsTask({
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
}: VerticalAnglesGeometryLabProps) {
  const [digits, setDigits] = useState<string[][]>([["", ""], ["", "", ""]]);
  const [active, setActive] = useState({ group: 0, index: 0 });
  const [feedback, setFeedback] = useState("Najpierw wpisz miarę kąta γ, a potem kąta β.");
  const [correct, setCorrect] = useState(false);
  const locked = readOnly || correct || assessmentSubmitted;

  const enterDigit = (key: string) => {
    if (locked) return;
    setDigits((current) => {
      const next = current.map((group) => [...group]);
      if (key === "backspace") {
        if (next[active.group]![active.index]) {
          next[active.group]![active.index] = "";
        } else if (active.index > 0) {
          const previous = active.index - 1;
          next[active.group]![previous] = "";
          setActive({ group: active.group, index: previous });
        }
        return next;
      }
      next[active.group]![active.index] = key;
      if (active.index < next[active.group]!.length - 1) {
        setActive({ group: active.group, index: active.index + 1 });
      } else if (active.group === 0) {
        setActive({ group: 1, index: 0 });
      }
      return next;
    });
    setFeedback("Uzupełnij oba wyniki i zatwierdź jeden raz na końcu.");
  };

  const check = () => {
    if (digits.flat().some((digit) => !digit)) {
      setFeedback("Uzupełnij wszystkie kratki.");
      return;
    }
    const values = digits.map((group) => group.join(""));
    if (values[0] === "50" && values[1] === "130") {
      setCorrect(true);
      setFeedback("✓ Poprawnie. Kąty wierzchołkowe są równe, a przyległe mają razem 180°.");
    } else {
      setFeedback("Skorzystaj z własności kątów wierzchołkowych dla α i γ oraz z sumy kątów przyległych α i β.");
    }
  };

  const ink = highContrast ? "#000" : "#172554";
  const accent = highContrast ? "#000" : "#be123c";
  const figureVertex = { x: 380, y: 260 };
  const diagonalUp = Math.atan2(45 - figureVertex.y, 560 - figureVertex.x) * 180 / Math.PI + 360;
  const diagonalDown = diagonalUp - 180;
  const simpleSectors = [
    { symbol: "α = 50°", start: diagonalUp, end: 360, color: accent, width: 6 },
    { symbol: "β", start: 180, end: diagonalUp, color: "#2563eb", width: 5 },
    { symbol: "γ", start: diagonalDown, end: 180, color: accent, width: 6 },
    { symbol: "δ", start: 0, end: diagonalDown, color: "#2563eb", width: 5 },
  ] as const;

  return (
    <section className={`${styles.lab} ${styles.simplePairsLab} ${highContrast ? styles.highContrast : ""}`} data-vertical-angles-lab data-simple-angle-pairs data-mode={mode}>
      <header className={styles.simplePairsHeader}>
        <p className={styles.eyebrow}>Kąty przyległe i wierzchołkowe</p>
        <h2>Kąt α ma 50°. Oblicz dwie brakujące miary.</h2>
        <p>Oblicz kolejno miarę kąta γ i miarę kąta β.</p>
      </header>

      <div className={styles.simplePairRules} aria-label="Własności kątów przyległych i wierzchołkowych">
        <article>
          <h3>Kąty przyległe</h3>
          <p>Mają wspólny wierzchołek i jedno wspólne ramię. Pozostałe ramiona tworzą prostą.</p>
          <strong>α + β = 180°</strong>
        </article>
        <article>
          <h3>Kąty wierzchołkowe</h3>
          <p>Ramiona jednego kąta są przedłużeniami ramion drugiego kąta. Ich miary są równe.</p>
          <strong>α = γ oraz β = δ</strong>
        </article>
      </div>

      <div className={styles.simplePairsFigure}>
        <svg viewBox="0 0 760 500" role="img" aria-label="Dwie proste przecinają się w punkcie O i tworzą kąty alfa, beta, gamma i delta">
          <rect width="760" height="500" rx="24" fill={highContrast ? "#fff" : "#f8fafc"} />
          <line x1="90" y1="260" x2="670" y2="260" stroke={ink} strokeWidth="7" strokeLinecap="round" />
          <line x1="200" y1="475" x2="560" y2="45" stroke={ink} strokeWidth="7" strokeLinecap="round" />
          {simpleSectors.map((sector) => {
            const labelDirection = sector.start + (((sector.end - sector.start) % 360 + 360) % 360) / 2;
            const labelPoint = pointAt(figureVertex, labelDirection, 74);
            return (
              <g key={sector.symbol} data-simple-angle-sector={sector.symbol[0]}>
                <path
                  d={arcPath(figureVertex, sector.start, sector.end, 118)}
                  fill="none"
                  stroke={sector.color}
                  strokeWidth={sector.width}
                  strokeLinecap="round"
                  data-simple-angle-arc={sector.symbol[0]}
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.simplePairsLabel}
                  data-simple-angle-label={sector.symbol[0]}
                >
                  {sector.symbol}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.simplePairsWork} data-simple-pairs-work>
        <div className={styles.simplePairsAnswers} data-simple-pairs-answers>
          <SimpleAngleAnswer label="Kąt γ" symbol="γ" digits={digits[0]!} activeGroup={active.group} group={0} disabled={locked} onActivate={(group, index) => setActive({ group, index })} />
          <SimpleAngleAnswer label="Kąt β" symbol="β" digits={digits[1]!} activeGroup={active.group} group={1} disabled={locked} onActivate={(group, index) => setActive({ group, index })} />
        </div>
        <div data-simple-pairs-keypad>
          <LessonNumericKeypad onKey={enterDigit} onConfirm={check} disabled={locked} label="Kalkulator do miar kątów" helperText="Kliknij kratkę i wpisz oba wyniki." />
        </div>
      </div>
      <p className={`${styles.feedback} ${correct ? styles.success : ""}`} role="status">{feedback}</p>
    </section>
  );
}

type WorksheetAngleArc = {
  start: number;
  end: number;
  text: string;
  tone?: "given" | "unknown";
};

type WorksheetAngleTask = {
  id: string;
  directions: number[];
  arcs: WorksheetAngleArc[];
  answers: Array<{ symbol: string; value: number }>;
  hint: string;
};

const WORKSHEET_ANGLE_TASKS: WorksheetAngleTask[] = [
  {
    id: "adjacent-134",
    directions: [0, 46],
    arcs: [
      { start: 46, end: 180, text: "134°", tone: "given" },
      { start: 0, end: 46, text: "α", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 46 }],
    hint: "Kąty α i 134° są przyległe. Razem mają 180°.",
  },
  {
    id: "vertical-127",
    directions: [18, 145],
    arcs: [
      { start: 198, end: 325, text: "127°", tone: "given" },
      { start: 18, end: 145, text: "α", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 127 }],
    hint: "Kąty leżące naprzeciwko siebie są wierzchołkowe i mają równe miary.",
  },
  {
    id: "crossing-143",
    directions: [-12, 131],
    arcs: [
      { start: 348, end: 491, text: "143°", tone: "given" },
      { start: 168, end: 311, text: "α", tone: "unknown" },
      { start: 131, end: 168, text: "β", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 143 }, { symbol: "β", value: 37 }],
    hint: "Najpierw użyj równości kątów wierzchołkowych, potem sumy 180° kątów przyległych.",
  },
  {
    id: "right-split",
    directions: [0, 40, 90],
    arcs: [
      { start: 0, end: 40, text: "40°", tone: "given" },
      { start: 40, end: 90, text: "α", tone: "unknown" },
      { start: 0, end: 90, text: "90°", tone: "given" },
    ],
    answers: [{ symbol: "α", value: 50 }],
    hint: "Dwa oznaczone kąty składają się na kąt prosty, czyli 90°.",
  },
  {
    id: "three-rays-180",
    directions: [0, 35, 110],
    arcs: [
      { start: 0, end: 35, text: "35°", tone: "given" },
      { start: 35, end: 110, text: "75°", tone: "given" },
      { start: 110, end: 180, text: "α", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 70 }],
    hint: "Trzy kąty leżą po jednej stronie prostej. Ich suma wynosi 180°.",
  },
  {
    id: "three-lines-48",
    directions: [8, 56, 146],
    arcs: [
      { start: 8, end: 56, text: "48°", tone: "given" },
      { start: 56, end: 146, text: "90°", tone: "given" },
      { start: 146, end: 188, text: "β", tone: "unknown" },
      { start: 188, end: 236, text: "γ", tone: "unknown" },
    ],
    answers: [{ symbol: "β", value: 42 }, { symbol: "γ", value: 48 }],
    hint: "Kąt γ jest wierzchołkowy do 48°. Kąty 48°, 90° i β tworzą razem 180°.",
  },
  {
    id: "crossing-65",
    directions: [30, 95],
    arcs: [
      { start: 30, end: 95, text: "65°", tone: "given" },
      { start: 95, end: 210, text: "α", tone: "unknown" },
      { start: 210, end: 275, text: "β", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 115 }, { symbol: "β", value: 65 }],
    hint: "Kąt β jest wierzchołkowy do 65°, a kąt α jest do niego przyległy.",
  },
  {
    id: "three-lines-80",
    directions: [-20, 25, 100],
    arcs: [
      { start: 340, end: 385, text: "45°", tone: "given" },
      { start: 25, end: 100, text: "75°", tone: "given" },
      { start: 100, end: 160, text: "α", tone: "unknown" },
      { start: 280, end: 340, text: "δ", tone: "unknown" },
    ],
    answers: [{ symbol: "α", value: 60 }, { symbol: "δ", value: 60 }],
    hint: "Na jednej stronie prostej suma wynosi 180°. Kąt δ jest wierzchołkowy do α.",
  },
];

function WorksheetAngleDiagram({ task, highContrast }: { task: WorksheetAngleTask; highContrast: boolean }) {
  const vertex = { x: 380, y: 230 };
  const ink = highContrast ? "#000" : "#172033";
  return (
    <svg viewBox="0 0 760 460" role="img" aria-label="Rysunek prostych i oznaczonych kątów do obliczenia">
      <rect width="760" height="460" rx="24" fill={highContrast ? "#fff" : "#f8fafc"} />
      {task.directions.map((direction) => {
        const start = pointAt(vertex, direction + 180, 285);
        const end = pointAt(vertex, direction, 285);
        return <line key={direction} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={ink} strokeWidth="5" strokeLinecap="round" />;
      })}
      {task.arcs.map((arc, index) => {
        const sweep = ((arc.end - arc.start) % 360 + 360) % 360;
        const radius = sweep >= 80 ? 92 : 76;
        const label = pointAt(vertex, arc.start + sweep / 2, radius + 30);
        return (
          <g key={`${arc.text}-${index}`} data-worksheet-angle={arc.text}>
            <path d={arcPath(vertex, arc.start, arc.end, radius)} fill="none" stroke={arc.tone === "given" ? "#2563eb" : "#be123c"} strokeWidth="4" strokeLinecap="round" />
            <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="27" fontWeight="900" fill={arc.tone === "given" ? "#1e3a8a" : "#9f1239"}>{arc.text}</text>
          </g>
        );
      })}
    </svg>
  );
}

function WorksheetAngleTasks({
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
}: VerticalAnglesGeometryLabProps) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => WORKSHEET_ANGLE_TASKS[0]!.answers.map(() => ""));
  const [activeAnswer, setActiveAnswer] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState("Oblicz zaznaczone kąty i wpisz ich miary.");
  const task = WORKSHEET_ANGLE_TASKS[taskIndex]!;
  const finished = completed.length === WORKSHEET_ANGLE_TASKS.length;
  const locked = readOnly || assessmentSubmitted || checking || finished;

  const openTask = (nextIndex: number) => {
    const nextTask = WORKSHEET_ANGLE_TASKS[nextIndex]!;
    setTaskIndex(nextIndex);
    setAnswers(nextTask.answers.map(() => ""));
    setActiveAnswer(0);
    setChecking(false);
    setFeedback("Oblicz zaznaczone kąty i wpisz ich miary.");
  };

  const enterDigit = (key: string) => {
    if (locked) return;
    setAnswers((current) => current.map((value, index) => index !== activeAnswer
      ? value
      : key === "backspace" ? value.slice(0, -1) : /^\d$/u.test(key) && value.length < 3 ? `${value}${key}` : value));
  };

  const check = () => {
    if (answers.some((answer) => !answer)) {
      setFeedback("Uzupełnij wszystkie kratki.");
      return;
    }
    const correct = task.answers.every((answer, index) => Number(answers[index]) === answer.value);
    if (!correct) {
      setFeedback(task.hint);
      return;
    }
    const nextCompleted = completed.includes(taskIndex) ? completed : [...completed, taskIndex];
    setCompleted(nextCompleted);
    setChecking(true);
    if (taskIndex === WORKSHEET_ANGLE_TASKS.length - 1) {
      setFeedback("✓ Wszystkie zadania rozwiązane poprawnie.");
      return;
    }
    setFeedback("✓ Poprawnie. Za chwilę pojawi się następne zadanie.");
    window.setTimeout(() => openTask(taskIndex + 1), 650);
  };

  return (
    <section className={`${styles.lab} ${styles.worksheetAnglesLab} ${highContrast ? styles.highContrast : ""}`} data-vertical-angles-lab data-worksheet-angle-tasks data-mode={mode}>
      <header className={styles.worksheetAnglesHeader}>
        <p className={styles.eyebrow}>Kąty przyległe i wierzchołkowe</p>
        <h2>Oblicz miary zaznaczonych kątów</h2>
        <p>Na każdym rysunku samodzielnie wybierz właściwą zależność.</p>
      </header>
      <LessonTaskNavigator
        currentIndex={taskIndex}
        taskCount={WORKSHEET_ANGLE_TASKS.length}
        onPrevious={() => openTask(Math.max(0, taskIndex - 1))}
        onNext={() => openTask(Math.min(WORKSHEET_ANGLE_TASKS.length - 1, taskIndex + 1))}
        previousDisabled={locked || taskIndex === 0}
        nextDisabled={locked || taskIndex === WORKSHEET_ANGLE_TASKS.length - 1 || !completed.includes(taskIndex)}
      />
      <div className={styles.worksheetAnglesFigure}>
        <WorksheetAngleDiagram task={task} highContrast={highContrast} />
      </div>
      <div className={styles.worksheetAnswers} aria-label="Miary kątów do uzupełnienia">
        {task.answers.map((answer, index) => (
          <label key={answer.symbol} data-active={activeAnswer === index}>
            <strong>{answer.symbol} =</strong>
            <input
              aria-label={`Miara kąta ${answer.symbol}`}
              type="text"
              inputMode="none"
              readOnly
              value={answers[index] ?? ""}
              disabled={locked}
              onFocus={() => setActiveAnswer(index)}
              onClick={() => setActiveAnswer(index)}
            />
            <span>°</span>
          </label>
        ))}
      </div>
      <LessonNumericKeypad onKey={enterDigit} onConfirm={check} disabled={locked} label="Kalkulator do miar kątów" helperText="Kliknij kratkę, wpisz wszystkie miary i zatwierdź jeden raz." />
      <p className={`${styles.feedback} ${feedback.startsWith("✓") ? styles.success : ""}`} role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}

function InteractiveVerticalAnglesGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: VerticalAnglesGeometryLabProps) {
  const initialTask = createPublicVerticalAnglesTask(seed);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [state, setState] = useState<GeometryLabState>(() => createVerticalAnglesGeometryState(seed, mode));
  const [activePair, setActivePair] = useState<readonly [IntersectionLineId, IntersectionLineId]>(["a", "b"]);
  const [selectedAngles, setSelectedAngles] = useState<number[]>([]);
  const [claimedRelation, setClaimedRelation] = useState<PairChoice | null>(null);
  const [revealedAngles, setRevealedAngles] = useState<number[]>([initialTask.givenAngleIndex]);
  const [verticalAnswer, setVerticalAnswer] = useState("");
  const [adjacentAnswer, setAdjacentAnswer] = useState("");
  const [secondAdjacentAnswer, setSecondAdjacentAnswer] = useState("");
  const [activeAnswerField, setActiveAnswerField] = useState<NumericAnswerField>("vertical");
  const [verticalReason, setVerticalReason] = useState<PairChoice | null>(null);
  const [adjacentReason, setAdjacentReason] = useState<PairChoice | null>(null);
  const [repairCategory, setRepairCategory] = useState<RepairCategory | null>(null);
  const [repairRelation, setRepairRelation] = useState<PairChoice | null>(null);
  const [repairMeasure, setRepairMeasure] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<VerticalAnglesDiagnosticCode | null>(null);
  const [diagnosticScore, setDiagnosticScore] = useState(0);
  const [diagnosticMaxScore, setDiagnosticMaxScore] = useState(1);
  const [announcement, setAnnouncement] = useState("Model przecięcia jest gotowy.");
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [completedDifficulties, setCompletedDifficulties] = useState<LessonDifficulty[]>([]);

  const task = useMemo(() => createPublicVerticalAnglesTask(verticalAnglesSeedFor(initialTask.activity, difficulty)), [difficulty, initialTask.activity]);
  const activity = task.activity;
  const locked = readOnly || assessmentSubmitted || (mode === "assessment" && internalSubmitted);
  const sectors = useMemo(() => intersectionSectorsForPair(state, activePair), [state, activePair]);
  const atomicSectors = useMemo(() => activity === "three-lines" ? atomicIntersectionSectors(state) : [], [activity, state]);
  const vertex = pointById(state.points, "vertex-o")!;
  const activeLine = activePair[1];
  const activeHandle = pointById(state.points, `${activeLine}-positive`)!;
  const givenIndex = task.givenAngleIndex;
  const verticalIndex = (givenIndex + 2) % 4;
  const adjacentIndex = (givenIndex + 1) % 4;
  const givenMeasure = sectors[givenIndex]!.measureDegrees;
  const expectedVertical = sectors[verticalIndex]!.measureDegrees;
  const expectedAdjacent = sectors[adjacentIndex]!.measureDegrees;
  const selectedInvariant = selectedAngles.length === 2 ? {
    relation: relationForAnglePair(selectedAngles[0]!, selectedAngles[1]!),
    firstDegrees: sectors[selectedAngles[0]!]!.measureDegrees,
    secondDegrees: sectors[selectedAngles[1]!]!.measureDegrees,
    sumDegrees: sectors[selectedAngles[0]!]!.measureDegrees + sectors[selectedAngles[1]!]!.measureDegrees,
  } : null;
  const direction = intersectionLineDirection(state, activeLine);

  const publish = (next: GeometryLabState) => {
    setState(next);
    onStateChange?.(next);
  };

  const resetAnswers = (given: number) => {
    setSelectedAngles([]);
    setClaimedRelation(null);
    setRevealedAngles([given]);
    setVerticalAnswer("");
    setAdjacentAnswer("");
    setSecondAdjacentAnswer("");
    setActiveAnswerField("vertical");
    setVerticalReason(null);
    setAdjacentReason(null);
    setRepairCategory(null);
    setRepairRelation(null);
    setRepairMeasure("");
    setDiagnosticCode(null);
    setDiagnosticScore(0);
    setDiagnosticMaxScore(1);
    setInternalSubmitted(false);
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    if (locked) return;
    const nextSeed = verticalAnglesSeedFor(activity, nextDifficulty);
    const nextTask = createPublicVerticalAnglesTask(nextSeed);
    const nextState = createVerticalAnglesGeometryState(nextSeed, mode);
    setDifficulty(nextDifficulty);
    setActivePair(["a", "b"]);
    resetAnswers(nextTask.givenAngleIndex);
    publish(nextState);
    setAnnouncement(`Wczytano poziom: ${DIFFICULTY_LABELS[nextDifficulty]}.`);
  };

  const completeTaskAndAdvance = () => {
    setCompletedDifficulties((current) => current.includes(difficulty) ? current : [...current, difficulty]);
    if (mode === "assessment" || difficulty === "challenge") return;
    const nextDifficulty = difficulty === "support" ? "core" : "challenge";
    window.setTimeout(() => chooseDifficulty(nextDifficulty), 900);
  };

  const changeLineDirection = (nextDirection: number, message = "Zmieniono kierunek prostej.") => {
    if (locked) return;
    const next = setIntersectionLineDirection(state, activeLine, nextDirection);
    publish(next);
    setAnnouncement(message);
  };

  const changeLineHandle = (coordinates: GeometryPointCoordinates, message = "Przesunięto uchwyt prostej.") => {
    if (locked) return;
    const next = moveIntersectionLineHandle(state, activeLine, coordinates);
    publish(next);
    setAnnouncement(message);
  };

  const selectAngle = (index: number) => {
    if (locked) return;
    setSelectedAngles((current) => current.includes(index) ? current.filter((item) => item !== index) : current.length < 2 ? [...current, index] : [current[1]!, index]);
    setDiagnosticCode(null);
  };

  const checkPair = () => {
    if (selectedAngles.length !== 2) {
      setDiagnosticCode("ANGLE_PAIR_INCOMPLETE");
      setAnnouncement("Wybierz dokładnie dwa kąty.");
      return;
    }
    if (!claimedRelation) {
      setDiagnosticCode("ANGLE_PROPERTY_INCORRECT");
      setAnnouncement("Nazwij własność wybranej pary.");
      return;
    }
    const actual = relationForAnglePair(selectedAngles[0]!, selectedAngles[1]!);
    if (actual !== claimedRelation) {
      const code = claimedRelation === "vertical" ? "ANGLE_VERTICAL_PAIR_INCORRECT" : "ANGLE_ADJACENT_PAIR_INCORRECT";
      setDiagnosticCode(code);
      setAnnouncement(`Ta para nie jest parą ${relationName(claimedRelation)}.`);
      return;
    }
    setDiagnosticCode(null);
    setInternalSubmitted(mode === "assessment");
    setAnnouncement(actual === "vertical" ? "✓ Para wierzchołkowa: miary są równe." : "✓ Para przyległa: suma miar wynosi 180°.");
    completeTaskAndAdvance();
  };

  const checkOneAngle = () => {
    const answers = [readFinite(verticalAnswer), readFinite(adjacentAnswer), readFinite(secondAdjacentAnswer)];
    setDiagnosticMaxScore(3);
    if (answers.some((value) => value === null)) {
      setDiagnosticCode("ANGLE_INTERFACE_INPUT");
      setDiagnosticScore(0);
      setAnnouncement("Uzupełnij miary wszystkich trzech brakujących kątów.");
      return;
    }
    const correct = Math.abs(answers[0]! - expectedVertical) <= 0.01
      && Math.abs(answers[1]! - expectedAdjacent) <= 0.01
      && Math.abs(answers[2]! - expectedAdjacent) <= 0.01;
    if (!correct) {
      setDiagnosticCode("ANGLE_CALCULATION_INCORRECT");
      setDiagnosticScore(0);
      setAnnouncement("Sprawdź: kąt wierzchołkowy ma tę samą miarę, a każdy przyległy dopełnia ją do 180°.");
      return;
    }
    setDiagnosticCode(null);
    setDiagnosticScore(3);
    setRevealedAngles([0, 1, 2, 3]);
    setInternalSubmitted(mode === "assessment");
    setAnnouncement("✓ Wszystkie trzy miary są poprawne.");
    completeTaskAndAdvance();
  };

  const enterNumericAnswer = (key: string) => {
    if (locked) return;
    const setter = activeAnswerField === "vertical"
      ? setVerticalAnswer
      : activeAnswerField === "adjacent" ? setAdjacentAnswer : setSecondAdjacentAnswer;
    setter((current) => key === "backspace" ? current.slice(0, -1) : /^\d$/u.test(key) && current.length < 3 ? `${current}${key}` : current);
    setDiagnosticCode(null);
  };

  const checkCalculation = () => {
    const verticalValue = readFinite(verticalAnswer);
    const adjacentValue = readFinite(adjacentAnswer);
    setDiagnosticMaxScore(3);
    if (verticalValue === null || adjacentValue === null || !verticalReason || !adjacentReason) {
      setDiagnosticCode("ANGLE_INTERFACE_INPUT");
      setDiagnosticScore(0);
      setAnnouncement("Uzupełnij dwie miary i dwa uzasadnienia.");
      return;
    }
    const numbersCorrect = Math.abs(verticalValue - expectedVertical) <= 0.01 && Math.abs(adjacentValue - expectedAdjacent) <= 0.01;
    const reasonsCorrect = verticalReason === "vertical" && adjacentReason === "adjacent";
    if (!numbersCorrect) {
      setDiagnosticCode("ANGLE_CALCULATION_INCORRECT");
      setDiagnosticScore(0);
      setAnnouncement("Sprawdź rachunek: naprzeciwko ta sama miara, obok dopełnienie do 180°.");
      return;
    }
    if (!reasonsCorrect) {
      setDiagnosticCode("ANGLE_PROPERTY_MISMATCH");
      setDiagnosticScore(2);
      setAnnouncement("Miary są poprawne. Dobierz jeszcze właściwe uzasadnienia.");
      return;
    }
    setDiagnosticCode(null);
    setDiagnosticScore(3);
    setRevealedAngles([0, 1, 2, 3]);
    setInternalSubmitted(mode === "assessment");
    setAnnouncement("✓ Miary i oba uzasadnienia są poprawne: 3/3.");
    completeTaskAndAdvance();
  };

  const expectedRepair = task.difficulty === "support"
    ? { category: "calculation" as const, relation: null, measure: expectedVertical }
    : task.difficulty === "core"
      ? { category: "pair" as const, relation: "adjacent" as const, measure: null }
      : { category: "property" as const, relation: "vertical" as const, measure: null };

  const checkRepair = () => {
    const categoryCorrect = repairCategory === expectedRepair.category;
    const relationCorrect = expectedRepair.relation === null || repairRelation === expectedRepair.relation;
    const measureCorrect = expectedRepair.measure === null || Math.abs((readFinite(repairMeasure) ?? Number.NaN) - expectedRepair.measure) <= 0.01;
    if (!categoryCorrect || !relationCorrect || !measureCorrect) {
      setDiagnosticCode("ANGLE_REPAIR_INCORRECT");
      setAnnouncement("Poprawka nie usuwa jeszcze błędu. Oddziel parę, rachunek i własność.");
      return;
    }
    setDiagnosticCode(null);
    setInternalSubmitted(mode === "assessment");
    setAnnouncement("✓ Błąd rozpoznany i naprawiony.");
    completeTaskAndAdvance();
  };

  const showMeasure = (index: number) => activity === "crossing"
    || (["one-angle", "roundabout", "independent"] as VerticalAnglesActivity[]).includes(activity) && revealedAngles.includes(index);

  const lineIds = (["a", "b", "c"] as const).filter((lineId) => pointById(state.points, `${lineId}-positive`));
  const rows = activity === "three-lines"
    ? atomicSectors.map((sector) => ({
      element: `Kąt ${sector.label}`,
      value: "miara nie jest podana",
      property: `${sector.label} = ${atomicSectors[(sector.index + 3) % 6]!.label}`,
    }))
    : sectors.map((sector) => ({
      element: `Kąt ${sector.label}`,
      value: showMeasure(sector.index) ? `${sector.measureDegrees.toFixed(0)}°` : "miara ukryta",
      property: sector.index % 2 === 0 ? "α = γ" : "β = δ",
    }));
  const diagnostic = diagnosticCode ? diagnosticPresentation(diagnosticCode, diagnosticScore, diagnosticMaxScore) : null;
  const answerRequired = (["pairs", "one-angle", "roundabout", "repair", "independent"] as VerticalAnglesActivity[]).includes(activity);

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-geometry-lab data-vertical-angles-lab data-activity={activity} data-difficulty={difficulty} data-mode={mode} data-selected-relation={claimedRelation ?? "none"}>
      <p className={styles.taskPrompt}>{task.prompt}</p>

      <LessonTaskNavigator
        currentIndex={difficulty === "support" ? 0 : difficulty === "core" ? 1 : 2}
        taskCount={3}
        onPrevious={() => chooseDifficulty(difficulty === "challenge" ? "core" : "support")}
        onNext={() => chooseDifficulty(difficulty === "support" ? "core" : "challenge")}
        previousDisabled={locked || difficulty === "support"}
        nextDisabled={locked || difficulty === "challenge" || answerRequired && !completedDifficulties.includes(difficulty)}
        className={styles.interactiveOnly}
      />

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={`${ACTIVITY_TITLES[activity]} — przecięcie w O`}
          description={activity === "three-lines"
            ? "Trzy proste przecinają się w punkcie O. Sześć kątów oznaczono literami greckimi; kąty leżące naprzeciwko siebie mają równe miary."
            : "Dwie proste przecinają się w punkcie O. Kąty oznaczono literami greckimi i łukami."}
          viewBox="0 0 760 520"
          className={styles.svg}
          columns={[{ key: "element", label: "Kąt" }, { key: "value", label: "Miara" }, { key: "property", label: "Równość" }]}
          rows={rows}
        >
          <rect width="760" height="520" fill="#fff" />

          {activity !== "three-lines" ? sectors.map((sector) => {
            const selected = selectedAngles.includes(sector.index);
            const labelPoint = pointAt(vertex, sector.bisectorDirectionDegrees, 112);
            return <g key={sector.index} data-angle-sector={sector.index} data-angle-label={sector.label} data-selected={selected ? "true" : "false"}>
              <path d={arcPath(vertex, sector.startDirectionDegrees, sector.endDirectionDegrees, 76)} fill="none" stroke={selected ? "#be123c" : "#334155"} strokeWidth={selected ? 7 : 3.5} />
              <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="900" fill={selected ? "#9f1239" : "#111827"}>{sector.label}{showMeasure(sector.index) ? ` = ${sector.measureDegrees.toFixed(0)}°` : ""}</text>
            </g>;
          }) : null}

          {atomicSectors.length ? <g data-atomic-sectors>{atomicSectors.map((sector) => {
            const label = pointAt(vertex, sector.bisectorDirectionDegrees, 112);
            const start = sector.bisectorDirectionDegrees - sector.measureDegrees / 2;
            const end = sector.bisectorDirectionDegrees + sector.measureDegrees / 2;
            return <g key={sector.index} data-atomic-sector={sector.index} data-atomic-angle-label={sector.label}>
              <path d={arcPath(vertex, start, end, 76)} fill="none" stroke="#334155" strokeWidth="3.5" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="25" fontWeight="900" fill="#111827">{sector.label}</text>
            </g>;
          })}</g> : null}

          {lineIds.map((lineId) => {
            const positive = pointById(state.points, `${lineId}-positive`)!;
            const negative = pointById(state.points, `${lineId}-negative`)!;
            return <line key={lineId} x1={negative.x} y1={negative.y} x2={positive.x} y2={positive.y} stroke="#172033" strokeWidth="4" strokeLinecap="round" data-intersection-line={lineId} data-line-active="true" />;
          })}
        </AccessibleMathSvg>
      </div>

      {activity === "three-lines" ? (
        <section className={styles.equalAnglesPanel} aria-label="Równe kąty utworzone przez trzy proste">
          <h3>Kąty leżące naprzeciwko siebie mają równe miary</h3>
          <div><strong>α = δ</strong><strong>β = ε</strong><strong>γ = ζ</strong></div>
        </section>
      ) : null}

      {activity === "crossing" || activity === "pairs" ? <div className={styles.invariants} aria-label="Własności kątów">
        <div className={styles.invariant} data-vertical-invariant><strong>α = γ</strong><span>{sectors[0]!.measureDegrees.toFixed(0)}° = {sectors[2]!.measureDegrees.toFixed(0)}° · kąty wierzchołkowe</span></div>
        <div className={styles.invariant} data-adjacent-invariant><strong>α + β = 180°</strong><span>{sectors[0]!.measureDegrees.toFixed(0)}° + {sectors[1]!.measureDegrees.toFixed(0)}° = {(sectors[0]!.measureDegrees + sectors[1]!.measureDegrees).toFixed(0)}° · kąty przyległe</span></div>
      </div> : null}

      {activity === "crossing" ? <div className={`${styles.alternatives} ${styles.interactiveOnly}`}>
        <InteractionAlternativePanel title="Ustaw przecięcie bez przeciągania" instruction="Na uchwycie: ←/→ obraca o 1°, Shift o 5°; ↑/↓ przesuwa koniec o 1 px, Shift o 5 px. Pola liczbowe i przyciski są równoważne dotykowi.">
          <label>Kierunek ° <input aria-label={`Kierunek prostej ${activeLine}`} type="number" min="0" max="359" value={Math.round(direction)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineDirection(value); }} /></label>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction - 5)}>−5°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction - 1)}>−1°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction + 1)}>+1°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction + 5)}>+5°</button>
          <label>Koniec x <input aria-label={`Współrzędna x prostej ${activeLine}`} type="number" value={Math.round(activeHandle.x)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineHandle({ x: value, y: activeHandle.y }); }} /></label>
          <label>Koniec y <input aria-label={`Współrzędna y prostej ${activeLine}`} type="number" value={Math.round(activeHandle.y)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineHandle({ x: activeHandle.x, y: value }); }} /></label>
        </InteractionAlternativePanel>
      </div> : null}

      {(["pairs", "independent"] as VerticalAnglesActivity[]).includes(activity) ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Rozpoznawanie par kątów">
          <h3>Wskaż parę i nazwij własność</h3>
          <div className={styles.pairButtons}>{sectors.map((sector) => <button key={sector.index} type="button" disabled={locked} aria-pressed={selectedAngles.includes(sector.index)} onClick={() => selectAngle(sector.index)}>kąt {sector.label}</button>)}</div>
          <div className={styles.reasonButtons}>{(["vertical", "adjacent"] as const).map((relation) => <button key={relation} type="button" disabled={locked} aria-pressed={claimedRelation === relation} onClick={() => setClaimedRelation(relation)}>{RELATION_LABELS[relation]}</button>)}</div>
          <button type="button" disabled={locked} onClick={checkPair}>Sprawdź parę</button>
          {selectedInvariant ? <p>Wybrano: {selectedInvariant.firstDegrees.toFixed(0)}° i {selectedInvariant.secondDegrees.toFixed(0)}° · położenie: {relationName(selectedInvariant.relation)} · suma {selectedInvariant.sumDegrees.toFixed(0)}°.</p> : null}
        </section>
      ) : null}

      {activity === "one-angle" ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Obliczanie trzech brakujących miar">
          <h3>Dana: kąt {sectors[givenIndex]!.label} = {givenMeasure.toFixed(0)}°</h3>
          <p>Uzupełnij wszystkie trzy miary. Nic nie jest liczone w pamięci.</p>
          <div className={styles.angleAnswerGrid}>
            <label data-active={activeAnswerField === "vertical"}><button type="button" disabled={locked} onClick={() => setActiveAnswerField("vertical")}>Kąt {sectors[verticalIndex]!.label}</button><input aria-label={`Miara kąta ${sectors[verticalIndex]!.label}`} type="text" inputMode="none" readOnly value={verticalAnswer} disabled={locked} onFocus={() => setActiveAnswerField("vertical")} /><span>°</span></label>
            <label data-active={activeAnswerField === "adjacent"}><button type="button" disabled={locked} onClick={() => setActiveAnswerField("adjacent")}>Kąt {sectors[adjacentIndex]!.label}</button><input aria-label={`Miara kąta ${sectors[adjacentIndex]!.label}`} type="text" inputMode="none" readOnly value={adjacentAnswer} disabled={locked} onFocus={() => setActiveAnswerField("adjacent")} /><span>°</span></label>
            <label data-active={activeAnswerField === "second-adjacent"}><button type="button" disabled={locked} onClick={() => setActiveAnswerField("second-adjacent")}>Kąt {sectors[(givenIndex + 3) % 4]!.label}</button><input aria-label={`Miara kąta ${sectors[(givenIndex + 3) % 4]!.label}`} type="text" inputMode="none" readOnly value={secondAdjacentAnswer} disabled={locked} onFocus={() => setActiveAnswerField("second-adjacent")} /><span>°</span></label>
          </div>
          <div className={styles.calculationNote}><strong>{sectors[givenIndex]!.label} = {sectors[verticalIndex]!.label}</strong><strong>{sectors[givenIndex]!.label} + {sectors[adjacentIndex]!.label} = 180°</strong></div>
          <LessonNumericKeypad onKey={enterNumericAnswer} onConfirm={checkOneAngle} disabled={locked} label="Kalkulator do miar kątów" helperText="Kliknij wybrane pole, wpisz miarę i zatwierdź po uzupełnieniu trzech pól." />
        </section>
      ) : null}

      {(["roundabout", "independent"] as VerticalAnglesActivity[]).includes(activity) ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Obliczenia kątów">
          <h3>Dana: kąt {sectors[givenIndex]!.label} = {givenMeasure.toFixed(0)}°</h3>
          <div className={styles.calculation}>
            <label>Kąt {sectors[verticalIndex]!.label} <input aria-label="Miara kąta wierzchołkowego" type="text" inputMode="none" readOnly value={verticalAnswer} disabled={locked} onFocus={() => setActiveAnswerField("vertical")} onClick={() => setActiveAnswerField("vertical")} />°</label>
            <span>bo</span>
            {(["vertical", "adjacent"] as const).map((relation) => <button key={`v-${relation}`} type="button" disabled={locked} aria-pressed={verticalReason === relation} onClick={() => setVerticalReason(relation)}>{RELATION_LABELS[relation]}</button>)}
          </div>
          <div className={styles.calculation}>
            <label>Kąt {sectors[adjacentIndex]!.label} <input aria-label="Miara kąta przyległego" type="text" inputMode="none" readOnly value={adjacentAnswer} disabled={locked} onFocus={() => setActiveAnswerField("adjacent")} onClick={() => setActiveAnswerField("adjacent")} />°</label>
            <span>bo</span>
            {(["vertical", "adjacent"] as const).map((relation) => <button key={`a-${relation}`} type="button" disabled={locked} aria-pressed={adjacentReason === relation} onClick={() => setAdjacentReason(relation)}>{RELATION_LABELS[relation]}</button>)}
          </div>
          <LessonNumericKeypad onKey={enterNumericAnswer} onConfirm={checkCalculation} disabled={locked} label="Kalkulator do miar kątów" helperText="Kliknij pole kąta, wpisz miarę i zatwierdź po wybraniu obu własności." />
        </section>
      ) : null}

      {activity === "repair" ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Naprawa błędnego oznaczenia">
          <h3>Napraw zapis ucznia</h3>
          <p data-repair-claim>{difficulty === "support"
            ? `„Kąt naprzeciwko ${givenMeasure.toFixed(0)}° ma ${(expectedVertical + 10).toFixed(0)}°.”`
            : difficulty === "core"
              ? `„Sąsiednie pola ${sectors[0]!.label} i ${sectors[1]!.label} to kąty wierzchołkowe.”`
              : `„Wynik ${expectedVertical.toFixed(0)}° jest poprawny, bo kąty przyległe są równe.”`}</p>
          <div className={styles.repair}><span>Rodzaj błędu:</span>{(["pair", "calculation", "property"] as const).map((category) => <button key={category} type="button" disabled={locked} aria-pressed={repairCategory === category} onClick={() => setRepairCategory(category)}>{category === "pair" ? "wybór pary" : category === "calculation" ? "obliczenie" : "własność"}</button>)}</div>
          {difficulty === "support" ? <label>Poprawna miara ° <input aria-label="Poprawiona miara" type="text" inputMode="decimal" value={repairMeasure} disabled={locked} onChange={(event) => setRepairMeasure(event.target.value)} /></label> : (
            <div className={styles.reasonButtons}>{(["vertical", "adjacent"] as const).map((relation) => <button key={relation} type="button" disabled={locked} aria-pressed={repairRelation === relation} onClick={() => setRepairRelation(relation)}>poprawka: {RELATION_LABELS[relation]}</button>)}</div>
          )}
          <button type="button" disabled={locked} onClick={checkRepair}>Sprawdź naprawę</button>
        </section>
      ) : null}

      <p className={`${styles.feedback} ${!diagnosticCode && announcement.startsWith("✓") ? styles.success : ""}`} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? <div className={styles.interactiveOnly}>{mode === "assessment"
        ? internalSubmitted || assessmentSubmitted
          ? <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted assessmentEnded solution={diagnostic.solution} />
          : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />}</div> : null}

      <p className={styles.printOnly}>{activity === "three-lines"
        ? "Trzy proste tworzą sześć kątów. Kąty leżące dokładnie naprzeciwko siebie mają równe miary."
        : "Przy przecięciu dwóch prostych kąty wierzchołkowe mają równe miary. Kąty przyległe mają wspólne ramię, a suma ich miar wynosi 180°."}</p>
    </section>
  );
}

export function VerticalAnglesGeometryLab(props: VerticalAnglesGeometryLabProps) {
  if (props.seed === SIMPLE_ANGLE_PAIRS_SEED) return <SimpleAnglePairsTask {...props} />;
  if (createPublicVerticalAnglesTask(props.seed).activity === "roundabout") return <WorksheetAngleTasks {...props} />;
  return <InteractiveVerticalAnglesGeometryLab {...props} />;
}
