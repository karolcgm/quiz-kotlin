"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  ANGLE_MEASUREMENT_LESSON_SEEDS,
  analyzeProtractorPlacement,
  angleMeasurementSeedFor,
  createAngleMeasurementGeometryState,
  createPublicAngleMeasurementTask,
  desiredProtractorRotationDegrees,
  measurementAngleDegrees,
  moveMeasurementProtractor,
  readingForSelectedScale,
  rotateMeasurementProtractorBy,
  rotateMeasurementProtractorTo,
  setMeasurementProtractorScale,
} from "@/lib/math/geometry/angleMeasurement";
import type { AngleMeasurementActivity } from "@/lib/math/geometry/angleMeasurement";
import {
  commitGeometryHistory,
  createGeometryHistory,
  pointById,
  redoGeometryHistory,
  resetGeometryHistory,
  serializeGeometryState,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  DiagnosticSolution,
} from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type {
  GeometryHistoryState,
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
} from "@/types/geometry";
import styles from "@/components/lessons/geometry/angleMeasurement.module.css";

type MeasurementDiagnosticCode =
  | "ANGLE_CENTER_MISALIGNED"
  | "ANGLE_BASELINE_MISALIGNED"
  | "ANGLE_WRONG_SCALE"
  | "ANGLE_READING_INCORRECT"
  | "ANGLE_EMPTY_READING";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Zadanie 1",
  core: "Zadanie 2",
  challenge: "Zadanie 3",
};

const ACTIVITY_TITLES: Record<AngleMeasurementActivity, string> = {
  setup: "Kątomierz ekranowy",
  scale: "Które zero?",
  series: "Zmierz serię",
  independent: "Samodzielny pomiar",
};

const DIAGNOSTIC_COPY: Record<MeasurementDiagnosticCode, DiagnosticFeedbackCopy> = {
  ANGLE_CENTER_MISALIGNED: {
    area: "Środek kątomierza nie pokrywa się jeszcze z wierzchołkiem B.",
    guidingQuestion: "Gdzie przecinają się ramiona kąta i gdzie znajduje się znacznik środka kątomierza?",
    visualHint: "Połącz znaczniki ● i B; odległość powinna spaść do najwyżej 4 px.",
    analogousExample: "Przy kącie w rogu kartki otwór lub krzyżyk kątomierza kładziemy dokładnie na rogu.",
  },
  ANGLE_BASELINE_MISALIGNED: {
    area: "Linia 0°–180° nie leży jeszcze na ramieniu bazowym BA.",
    guidingQuestion: "Czy prosta krawędź kątomierza ma ten sam kierunek co ramię BA?",
    visualHint: "Obróć uchwyt ◇, aż linia bazowa pokryje się z przerywanym prowadnikiem.",
    analogousExample: "Po ustawieniu środka obracamy kątomierz, nie przesuwając go z wierzchołka.",
  },
  ANGLE_WRONG_SCALE: {
    area: "Wybrano skalę, której zero nie leży na ramieniu bazowym.",
    guidingQuestion: "Który napis 0° znajduje się przy ramieniu BA?",
    visualHint: "Obie skale są widoczne. Zacznij od zera przy BA i czytaj tę samą skalę aż do BC.",
    analogousExample: "Jeśli ramię zaczyna się przy prawym 0°, czytamy liczby rosnące od prawej strony.",
  },
  ANGLE_READING_INCORRECT: {
    area: "Zapisana miara nie zgadza się z podziałką wskazaną przez ramię BC.",
    guidingQuestion: "Na której kresce właściwej skali kończy się ramię BC?",
    visualHint: "Nie zmieniaj skali w połowie odczytu. Wynik zapisz z dokładnością do 1°.",
    analogousExample: "Gdy ramię przecina kreskę 65 na skali rozpoczętej od 0, zapisujemy 65°.",
  },
  ANGLE_EMPTY_READING: {
    area: "Nie wpisano liczbowego odczytu kąta.",
    guidingQuestion: "Jaka liczba na wybranej skali leży pod ramieniem BC?",
    visualHint: "Wpisz samą liczbę; symbol ° jest już podany przy polu.",
    analogousExample: "Dla odczytu 72° wpisujemy 72.",
  },
};

const DIAGNOSTIC_SOLUTIONS: Record<MeasurementDiagnosticCode, DiagnosticSolution> = {
  ANGLE_CENTER_MISALIGNED: { steps: ["Znajdź wierzchołek B.", "Przenieś na niego znacznik środka ●.", "Sprawdź odległość w tabeli ustawienia."] },
  ANGLE_BASELINE_MISALIGNED: { steps: ["Pozostaw środek na B.", "Obracaj uchwyt ◇ po łuku.", "Pokryj linię 0°–180° z ramieniem BA."] },
  ANGLE_WRONG_SCALE: { steps: ["Znajdź ramię BA.", "Wskaż leżące na nim zero.", "Wybierz skalę zaczynającą się od tego zera."] },
  ANGLE_READING_INCORRECT: { steps: ["Zacznij od właściwego zera.", "Śledź jedną skalę do ramienia BC.", "Przepisz odczyt z dokładnością do 1°."] },
  ANGLE_EMPTY_READING: { steps: ["Ustaw narzędzie.", "Wybierz skalę.", "Wpisz odczytaną liczbę i sprawdź."] },
};

function diagnosticPresentation(code: MeasurementDiagnosticCode) {
  const highlight: DiagnosticHighlightTarget = {
    id: `measurement-${code.toLocaleLowerCase("en-US")}`,
    kind: code === "ANGLE_CENTER_MISALIGNED" ? "vertex" : "pair",
    memberIds: code === "ANGLE_CENTER_MISALIGNED"
      ? ["vertex-b", "protractor-center"]
      : ["ray-ba", "angle-abc", "protractor-baseline"],
    label: DIAGNOSTIC_COPY[code].area,
    state: "attention",
    pattern: "dashed",
    symbol: code === "ANGLE_CENTER_MISALIGNED" ? "● → B" : "0° → ∠",
    accent: code === "ANGLE_WRONG_SCALE" ? "violet" : "amber",
  };
  return {
    result: createLessonGradeResult({
      status: "incorrect",
      score: 0,
      maxScore: 1,
      errorCodes: [code],
      feedbackKey: `geometry.${code.toLocaleLowerCase("en-US")}`,
    }),
    copy: DIAGNOSTIC_COPY[code],
    highlights: [highlight],
    solution: DIAGNOSTIC_SOLUTIONS[code],
  };
}

function pointFromPointer(event: PointerEvent<SVGElement>, state: GeometryLabState): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

function directionTo(origin: GeometryPointCoordinates, point: GeometryPointCoordinates): number {
  return Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI;
}

function pointAt(origin: GeometryPointCoordinates, direction: number, distance: number): GeometryPointCoordinates {
  const radians = direction * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * distance, y: origin.y + Math.sin(radians) * distance };
}

function tickPosition(degrees: number, radius: number): GeometryPointCoordinates {
  const radians = -degrees * Math.PI / 180;
  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

function readFiniteNumber(raw: string, minimum: number, maximum: number): number | null {
  const value = Number(raw);
  return raw.trim() !== "" && Number.isFinite(value) && value >= minimum && value <= maximum ? value : null;
}

export interface AngleMeasurementGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

interface ActiveDigitCell {
  group: number;
  index: number;
}

function useDigitAnswerGroups(lengths: readonly number[]) {
  const [digits, setDigits] = useState<string[][]>(() => lengths.map((length) => Array(length).fill("")));
  const [active, setActive] = useState<ActiveDigitCell>({ group: 0, index: 0 });

  const enterDigit = (key: string) => {
    setDigits((current) => {
      const next = current.map((group) => [...group]);
      if (key === "backspace") {
        let target = active;
        if (next[target.group]![target.index] === "") {
          if (target.index > 0) target = { ...target, index: target.index - 1 };
          else if (target.group > 0) target = { group: target.group - 1, index: next[target.group - 1]!.length - 1 };
        }
        next[target.group]![target.index] = "";
        setActive(target);
        return next;
      }
      if (!/^\d$/u.test(key)) return current;
      next[active.group]![active.index] = key;
      if (active.index < next[active.group]!.length - 1) {
        setActive({ ...active, index: active.index + 1 });
      } else if (active.group < next.length - 1) {
        setActive({ group: active.group + 1, index: 0 });
      }
      return next;
    });
  };

  return {
    digits,
    active,
    setActive,
    enterDigit,
    values: digits.map((group) => group.join("")),
  };
}

function DigitAnswerGroup({
  label,
  group,
  digits,
  active,
  disabled,
  onActivate,
}: {
  label: string;
  group: number;
  digits: readonly string[];
  active: ActiveDigitCell;
  disabled: boolean;
  onActivate: (cell: ActiveDigitCell) => void;
}) {
  return (
    <div className={styles.applicationAnswerGroup}>
      <span>{label}</span>
      <div className={styles.applicationAnswerCells} role="group" aria-label={label}>
        {digits.map((digit, index) => {
          const selected = active.group === group && active.index === index;
          return (
            <button
              key={index}
              type="button"
              className={selected ? styles.applicationAnswerCellActive : styles.applicationAnswerCell}
              aria-label={`${label}, cyfra ${index + 1} z ${digits.length}`}
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onActivate({ group, index })}
            >
              {digit || <span aria-hidden>&nbsp;</span>}
            </button>
          );
        })}
        <strong aria-hidden>°</strong>
      </div>
    </div>
  );
}

function ReflexAngleDiagram({ opposite }: { opposite: boolean }) {
  const suffix = opposite ? "opposite" : "same";
  return (
    <svg className={styles.applicationSvg} viewBox="0 0 360 230" role="img" aria-label={opposite ? "Ramiona BA i BD po przeciwnych stronach ramienia BC" : "Ramiona BA i BD po tej samej stronie ramienia BC"}>
      <defs>
        <marker id={`reflex-arrow-${suffix}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#be123c" /></marker>
      </defs>
      <line x1="72" y1="170" x2="315" y2="170" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="170" x2="194" y2="42" stroke="#6d28d9" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="170" x2="275" y2={opposite ? "225" : "75"} stroke="#0f766e" strokeWidth="5" strokeLinecap="round" />
      <circle cx="72" cy="170" r="7" fill="#fff" stroke="#0f172a" strokeWidth="4" />
      <text x="55" y="194" fontSize="19" fontWeight="900">B</text>
      <text x="319" y="176" fontSize="19" fontWeight="900">C</text>
      <text x="190" y="34" fontSize="19" fontWeight="900">A</text>
      <text x="281" y={opposite ? "225" : "70"} fontSize="19" fontWeight="900">D</text>
      <text x="122" y="108" fontSize="18" fontWeight="900" fill="#5b21b6">60°</text>
      <text x="178" y={opposite ? "202" : "137"} fontSize="18" fontWeight="900" fill="#0f766e">25°</text>
      <path d={opposite ? "M 274 211 C 338 80 192 2 62 48 C 4 70 4 146 47 164" : "M 266 86 C 337 132 320 221 213 224 C 82 229 5 212 16 119 C 22 68 76 37 174 42"} fill="none" stroke="#be123c" strokeWidth="4" strokeDasharray="9 7" markerEnd={`url(#reflex-arrow-${suffix})`} />
      <text x="220" y={opposite ? "58" : "205"} fontSize="15" fontWeight="900" fill="#9f1239">kąt wklęsły DBA</text>
    </svg>
  );
}

function ReflexAngleApplication({ mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false }: AngleMeasurementGeometryLabProps) {
  const locked = readOnly || assessmentSubmitted;
  const answers = useDigitAnswerGroups([2, 3, 2, 3]);
  const [feedback, setFeedback] = useState("Rozważ oba położenia ramienia BD i uzupełnij wszystkie kratki.");
  const check = () => {
    if (answers.values.some((value) => value.length === 0)) {
      setFeedback("Uzupełnij wszystkie kratki w obu przypadkach.");
      return;
    }
    setFeedback(answers.values.join("|") === "35|325|85|275"
      ? "✓ Poprawnie. Położenie ramienia BD zmienia mniejszy kąt, dlatego otrzymujemy dwa kąty wklęsłe."
      : "Sprawdź najpierw mniejszy kąt DBA. Kąt wklęsły dopełnia go do 360°.");
  };

  return (
    <section className={`${styles.applicationLab} ${highContrast ? styles.highContrast : ""}`} data-angle-measurement-lab data-angle-application="reflex" data-mode={mode}>
      <header className={styles.applicationHeader}>
        <p className={styles.eyebrow}>Zastosowanie miar kątów</p>
        <h2>Kąt wklęsły DBA — rozważ dwa przypadki</h2>
        <p>Kąt ABC ma miarę 60°, a kąt DBC ma miarę 25°. Ramię BD może leżeć po tej samej albo po przeciwnej stronie ramienia BC. Oblicz miarę kąta wklęsłego DBA w obu ustawieniach.</p>
      </header>
      <div className={styles.applicationCases}>
        <article>
          <h3>Przypadek I · ramiona po tej samej stronie</h3>
          <ReflexAngleDiagram opposite={false} />
          <DigitAnswerGroup label="Mniejszy kąt DBA" group={0} digits={answers.digits[0]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
          <DigitAnswerGroup label="Kąt wklęsły DBA" group={1} digits={answers.digits[1]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
        </article>
        <article>
          <h3>Przypadek II · ramiona po przeciwnych stronach</h3>
          <ReflexAngleDiagram opposite />
          <DigitAnswerGroup label="Mniejszy kąt DBA" group={2} digits={answers.digits[2]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
          <DigitAnswerGroup label="Kąt wklęsły DBA" group={3} digits={answers.digits[3]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
        </article>
      </div>
      <div className={styles.applicationKeypad}>
        <LessonNumericKeypad onKey={answers.enterDigit} onConfirm={check} disabled={locked} label="Kalkulator do obu przypadków" helperText="Kliknij wybraną kratkę. Zatwierdź dopiero po uzupełnieniu obu przypadków." />
      </div>
      <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}

function ClockDial({ minutes }: { minutes: 15 | 30 }) {
  const endX = minutes === 15 ? 160 : 100;
  const endY = minutes === 15 ? 100 : 160;
  return (
    <svg className={styles.clockSvg} viewBox="0 0 200 200" role="img" aria-label={minutes === 15 ? "Wskazówka minutowa obraca się od godziny 12 do 3" : "Wskazówka minutowa obraca się od godziny 12 do 6"}>
      <defs><marker id={`clock-arrow-${minutes}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#be123c" /></marker></defs>
      <circle cx="100" cy="100" r="82" fill="#fff" stroke="#1e3a8a" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = index * 30 * Math.PI / 180;
        const x1 = 100 + Math.sin(angle) * 70;
        const y1 = 100 - Math.cos(angle) * 70;
        const x2 = 100 + Math.sin(angle) * 78;
        const y2 = 100 - Math.cos(angle) * 78;
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#334155" strokeWidth={index % 3 === 0 ? 4 : 2} />;
      })}
      <text x="94" y="38" fontSize="18" fontWeight="900">12</text><text x="163" y="106" fontSize="18" fontWeight="900">3</text><text x="95" y="176" fontSize="18" fontWeight="900">6</text><text x="27" y="106" fontSize="18" fontWeight="900">9</text>
      <line x1="100" y1="100" x2="100" y2="42" stroke="#64748b" strokeWidth="5" strokeDasharray="8 5" />
      <line x1="100" y1="100" x2={endX} y2={endY} stroke="#6d28d9" strokeWidth="6" strokeLinecap="round" />
      <circle cx="100" cy="100" r="7" fill="#fff" stroke="#0f172a" strokeWidth="4" />
      <path d={minutes === 15 ? "M 102 52 A 50 50 0 0 1 148 98" : "M 102 52 A 50 50 0 0 1 102 150"} fill="none" stroke="#be123c" strokeWidth="4" markerEnd={`url(#clock-arrow-${minutes})`} />
    </svg>
  );
}

function ClockAngleApplication({ mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false }: AngleMeasurementGeometryLabProps) {
  const locked = readOnly || assessmentSubmitted;
  const answers = useDigitAnswerGroups([1, 2, 3]);
  const [feedback, setFeedback] = useState("Najpierw ustal obrót wskazówki w ciągu jednej minuty.");
  const check = () => {
    if (answers.values.some((value) => value.length === 0)) {
      setFeedback("Uzupełnij obrót w ciągu jednej minuty, kwadransa i pół godziny.");
      return;
    }
    setFeedback(answers.values.join("|") === "6|90|180"
      ? "✓ Poprawnie. Wskazówka minutowa pokonuje 6° w każdej minucie."
      : "Tarcza ma 360° i 60 równych minut. Najpierw oblicz 360° : 60.");
  };

  return (
    <section className={`${styles.applicationLab} ${highContrast ? styles.highContrast : ""}`} data-angle-measurement-lab data-angle-application="clock" data-mode={mode}>
      <header className={styles.applicationHeader}>
        <p className={styles.eyebrow}>Kąty na zegarze</p>
        <h2>O jaki kąt obraca się wskazówka minutowa?</h2>
        <p>Pełny obrót ma 360°, a tarcza odpowiada 60 minutom. Oblicz obrót w ciągu jednej minuty, a następnie podaj obrót w ciągu kwadransa i pół godziny.</p>
      </header>
      <div className={styles.minuteStep}>
        <span>360° : 60 =</span>
        <DigitAnswerGroup label="Obrót w ciągu jednej minuty" group={0} digits={answers.digits[0]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
      </div>
      <div className={styles.clockCases}>
        <article>
          <h3>Kwadrans · 15 minut</h3>
          <ClockDial minutes={15} />
          <DigitAnswerGroup label="Obrót w ciągu kwadransa" group={1} digits={answers.digits[1]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
        </article>
        <article>
          <h3>Pół godziny · 30 minut</h3>
          <ClockDial minutes={30} />
          <DigitAnswerGroup label="Obrót w ciągu pół godziny" group={2} digits={answers.digits[2]!} active={answers.active} disabled={locked} onActivate={answers.setActive} />
        </article>
      </div>
      <div className={styles.applicationKeypad}>
        <LessonNumericKeypad onKey={answers.enterDigit} onConfirm={check} disabled={locked} label="Kalkulator do zadania z zegarem" helperText="Kliknij wybraną kratkę i wpisz wszystkie trzy wyniki." />
      </div>
      <p className={styles.feedback} role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}

export function AngleMeasurementGeometryLab(props: AngleMeasurementGeometryLabProps) {
  if (props.seed === ANGLE_MEASUREMENT_LESSON_SEEDS.scale.support) return <ReflexAngleApplication {...props} />;
  if (props.seed === ANGLE_MEASUREMENT_LESSON_SEEDS.scale.core) return <ClockAngleApplication {...props} />;
  return <AngleMeasurementToolLab {...props} />;
}

function AngleMeasurementToolLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: AngleMeasurementGeometryLabProps) {
  const initialTask = createPublicAngleMeasurementTask(seed);
  const simpleMeasurement = initialTask.seed === ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support;
  const simpleExampleSeeds = [
    ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support,
    ANGLE_MEASUREMENT_LESSON_SEEDS.setup.core,
    ANGLE_MEASUREMENT_LESSON_SEEDS.setup.challenge,
    ANGLE_MEASUREMENT_LESSON_SEEDS.scale.challenge,
    ANGLE_MEASUREMENT_LESSON_SEEDS.series.support,
    ANGLE_MEASUREMENT_LESSON_SEEDS.series.core,
    ANGLE_MEASUREMENT_LESSON_SEEDS.series.challenge,
    ANGLE_MEASUREMENT_LESSON_SEEDS.independent.support,
    ANGLE_MEASUREMENT_LESSON_SEEDS.independent.core,
    ANGLE_MEASUREMENT_LESSON_SEEDS.independent.challenge,
  ] as const;
  const prepareSimpleState = (nextSeed: number) => {
    const nextTask = createPublicAngleMeasurementTask(nextSeed);
    const nextState = setMeasurementProtractorScale(createAngleMeasurementGeometryState(nextSeed, mode), nextTask.correctScale);
    return { ...nextState, protractor: { ...nextState.protractor, radius: 175 } };
  };
  const [history, setHistory] = useState<GeometryHistoryState>(() => {
    const initialState = createAngleMeasurementGeometryState(seed, mode);
    return createGeometryHistory(simpleMeasurement
      ? prepareSimpleState(seed)
      : initialState);
  });
  const state = history.present;
  const stateSeed = Math.round(pointById(state.points, "seed-marker")?.x ?? seed);
  const task = createPublicAngleMeasurementTask(stateSeed);
  const placement = analyzeProtractorPlacement(state);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [answer, setAnswer] = useState("");
  const simpleAnswerCellCount = String(Math.round(task.angleDegrees)).length;
  const [simpleAnswerDigits, setSimpleAnswerDigits] = useState<string[]>(() => Array(simpleAnswerCellCount).fill(""));
  const [activeSimpleAnswerCell, setActiveSimpleAnswerCell] = useState(0);
  const [simpleExampleIndex, setSimpleExampleIndex] = useState(0);
  const [completedSimpleExamples, setCompletedSimpleExamples] = useState<number[]>([]);
  const [diagnosticCode, setDiagnosticCode] = useState<MeasurementDiagnosticCode | null>(null);
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState(simpleMeasurement
    ? "Ustaw kątomierz, odczytaj miarę kąta i wpisz ją w kratki."
    : "Kątomierz czeka na ustawienie. Gotowość wymaga środka na B i bazy na BA.");
  const drag = useRef<"center" | "rotation" | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const locked = readOnly || assessmentSubmitted || (mode === "assessment" && internalSubmitted);

  const publish = (next: GeometryLabState) => onStateChange?.(next);

  const resetResponse = (answerCellCount = simpleAnswerCellCount) => {
    setAnswer("");
    setSimpleAnswerDigits(Array(answerCellCount).fill(""));
    setActiveSimpleAnswerCell(0);
    setDiagnosticCode(null);
    setInternalSubmitted(false);
  };

  const commit = (next: GeometryLabState, message: string) => {
    if (locked) return;
    const normalized = { ...next, mode };
    setHistory((current) => commitGeometryHistory(current, normalized));
    setDiagnosticCode(null);
    setInternalSubmitted(false);
    setAnnouncement(message);
    publish(normalized);
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    if (locked) return;
    const nextSeed = angleMeasurementSeedFor(task.activity, nextDifficulty);
    const nextTask = createPublicAngleMeasurementTask(nextSeed);
    const preserved = task.activity === "series" ? state.protractor : undefined;
    const next = createAngleMeasurementGeometryState(nextSeed, mode, preserved);
    setDifficulty(nextDifficulty);
    setHistory(createGeometryHistory(next));
    resetResponse(String(Math.round(nextTask.angleDegrees)).length);
    setAnnouncement(simpleMeasurement
      ? `Zadanie ${nextDifficulty === "support" ? "1" : nextDifficulty === "core" ? "2" : "3"}. Ustaw kątomierz od początku i zmierz nowy kąt.`
      : task.activity === "series"
      ? `Kąt ${nextDifficulty === "support" ? "1" : nextDifficulty === "core" ? "2" : "3"}. Narzędzie zachowało położenie i obrót — nie zostało ustawione automatycznie.`
      : `Poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Ustaw narzędzie od początku.`);
    publish(next);
  };

  const chooseSimpleExample = (index: number) => {
    if (locked) return;
    const nextSeed = simpleExampleSeeds[index]!;
    const nextTask = createPublicAngleMeasurementTask(nextSeed);
    const next = prepareSimpleState(nextSeed);
    setSimpleExampleIndex(index);
    setDifficulty(nextTask.difficulty);
    setHistory(createGeometryHistory(next));
    resetResponse(String(Math.round(nextTask.angleDegrees)).length);
    setAnnouncement(`Zadanie ${index + 1} z 10. Ustaw kątomierz od początku i zmierz nowy kąt.`);
    publish(next);
  };

  const changeHistory = (next: GeometryHistoryState, message: string) => {
    if (locked) return;
    setHistory(next);
    resetResponse();
    setAnnouncement(message);
    publish(next.present);
  };

  const changeCenter = (center: GeometryPointCoordinates, message: string) => {
    commit(moveMeasurementProtractor(state, center), message);
  };

  const changeRotation = (rotation: number, message: string) => {
    commit(rotateMeasurementProtractorTo(state, rotation), message);
  };

  const handleCenterKey = (event: KeyboardEvent<SVGElement>) => {
    if (!event.key.startsWith("Arrow") || locked) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    }[event.key];
    if (!delta) return;
    changeCenter(
      { x: state.protractor.center.x + delta.x, y: state.protractor.center.y + delta.y },
      `Przesunięto środek o ${step} px.`,
    );
  };

  const handleRotationKey = (event: KeyboardEvent<SVGElement>) => {
    if (!event.key.startsWith("Arrow") || locked) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step;
    commit(rotateMeasurementProtractorBy(state, delta), `Obrócono kątomierz o ${step}°.`);
  };

  const startDrag = (kind: "center" | "rotation", event: PointerEvent<SVGElement>) => {
    if (locked) return;
    drag.current = kind;
    dragStart.current = state;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDrag = (event: PointerEvent<SVGElement>) => {
    if (!drag.current || locked) return;
    const point = pointFromPointer(event, state);
    if (!point) return;
    const next = drag.current === "center"
      ? moveMeasurementProtractor(state, point)
      : rotateMeasurementProtractorTo(state, directionTo(state.protractor.center, point));
    setHistory((current) => ({ ...current, present: { ...next, mode }, future: [] }));
    setDiagnosticCode(null);
    setInternalSubmitted(false);
    setAnnouncement(drag.current === "center" ? "Przenoszenie środka kątomierza." : "Obracanie linii bazowej kątomierza.");
    publish(next);
  };

  const finishDrag = (event: PointerEvent<SVGElement>) => {
    if (!drag.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const start = dragStart.current;
    setHistory((current) => start && serializeGeometryState(start) !== serializeGeometryState(current.present) ? {
      ...current,
      past: [...current.past, start].slice(-100),
      future: [],
    } : current);
    drag.current = null;
    dragStart.current = null;
  };

  const chooseScale = (scale: "inner" | "outer") => {
    commit(setMeasurementProtractorScale(state, scale), `Wybrano skalę ${scale === "inner" ? "wewnętrzną" : "zewnętrzną"}.`);
  };

  const checkAnswer = () => {
    const response = simpleMeasurement ? simpleAnswerDigits.join("") : answer;
    const numeric = readFiniteNumber(response, 0, 180);
    let code: MeasurementDiagnosticCode | null = null;
    if (!placement.centerAligned) code = "ANGLE_CENTER_MISALIGNED";
    else if (!placement.baselineAligned) code = "ANGLE_BASELINE_MISALIGNED";
    else if (!simpleMeasurement && !placement.scaleCorrect) code = "ANGLE_WRONG_SCALE";
    else if (numeric === null) code = "ANGLE_EMPTY_READING";
    else if (Math.abs(numeric - measurementAngleDegrees(state)) > 1) code = "ANGLE_READING_INCORRECT";
    setDiagnosticCode(code);
    if (simpleMeasurement && !code) {
      setCompletedSimpleExamples((current) => current.includes(simpleExampleIndex) ? current : [...current, simpleExampleIndex]);
      if (simpleExampleIndex < simpleExampleSeeds.length - 1 && mode !== "assessment") {
        const completedNumber = simpleExampleIndex + 1;
        chooseSimpleExample(simpleExampleIndex + 1);
        setAnnouncement(`✓ Zadanie ${completedNumber} zaliczone. Otwarto zadanie ${completedNumber + 1}.`);
        return;
      }
    }
    setInternalSubmitted(mode === "assessment");
    setAnnouncement(code
      ? simpleMeasurement
        ? code === "ANGLE_CENTER_MISALIGNED" || code === "ANGLE_BASELINE_MISALIGNED"
          ? "Ustaw środek kątomierza na punkcie B i jego prostą krawędź na ramieniu BA."
          : code === "ANGLE_EMPTY_READING"
            ? "Wpisz miarę kąta w puste kratki."
            : "Sprawdź, przy której liczbie drugie ramię przecina podziałkę kątomierza."
        : "Pomiar wymaga poprawy. Skorzystaj z diagnostyki ustawienia lub odczytu."
      : simpleMeasurement
        ? `✓ Poprawnie. Kąt ABC ma miarę ${numeric?.toFixed(0)}°.`
        : `✓ Pomiar poprawny: ${numeric?.toFixed(0)}°. Środek, baza, skala i odczyt są zgodne.`);
  };

  const enterSimpleAnswerDigit = (key: string) => {
    if (locked) return;
    setDiagnosticCode(null);
    setInternalSubmitted(false);
    setSimpleAnswerDigits((current) => {
      const next = [...current];
      if (key === "backspace") {
        const index = next[activeSimpleAnswerCell] === "" && activeSimpleAnswerCell > 0
          ? activeSimpleAnswerCell - 1
          : activeSimpleAnswerCell;
        next[index] = "";
        setActiveSimpleAnswerCell(index);
        return next;
      }
      if (!/^\d$/u.test(key)) return current;
      next[activeSimpleAnswerCell] = key;
      setActiveSimpleAnswerCell(Math.min(activeSimpleAnswerCell + 1, simpleAnswerCellCount - 1));
      return next;
    });
  };

  const vertex = pointById(state.points, "vertex-b")!;
  const base = pointById(state.points, "point-a")!;
  const second = pointById(state.points, "point-c")!;
  const center = state.protractor.center;
  const rotationHandle = pointAt(center, state.protractor.rotationDegrees, state.protractor.radius + 34);
  const targetRotation = desiredProtractorRotationDegrees(task);
  const targetBaseStart = pointAt(vertex, targetRotation + 180, 185);
  const targetBaseEnd = pointAt(vertex, targetRotation, 185);
  const diagnostic = diagnosticCode ? diagnosticPresentation(diagnosticCode) : null;
  const selectedReading = placement.ready ? readingForSelectedScale(state) : null;
  const responseAnswer = simpleMeasurement ? simpleAnswerDigits.join("") : answer;
  const detailedRows = [
    { item: "Środek", value: `${placement.centerDistancePx.toFixed(1)} px od B`, status: placement.centerAligned ? "✓ na wierzchołku" : "ustaw" },
    { item: "Linia bazowa", value: `różnica ${placement.baselineDifferenceDegrees.toFixed(1)}°`, status: placement.baselineAligned ? "✓ na BA" : "obróć" },
    { item: "Gotowość", value: placement.ready ? "TAK" : "NIE", status: "środek ORAZ baza" },
    { item: "Skala", value: state.protractor.scale === "inner" ? "wewnętrzna" : "zewnętrzna", status: placement.scaleCorrect ? "✓ właściwe zero" : "sprawdź zero" },
    { item: "Odczyt", value: responseAnswer.trim() === "" ? "jeszcze nie wpisano" : `${responseAnswer}°`, status: selectedReading === null ? "najpierw ustaw narzędzie" : "porównaj z kreską przy BC" },
  ];
  const rows = simpleMeasurement
    ? [{ item: "Zadanie", value: "Zmierz ∠ABC", status: responseAnswer.trim() === "" ? "wpisz wynik w kratki" : `wpisano ${responseAnswer}°` }]
    : detailedRows;

  return (
    <section
      className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-angle-measurement-lab
      data-activity={task.activity}
      data-difficulty={difficulty}
      data-mode={mode}
    >
      {simpleMeasurement ? (
        <header className={styles.simpleHeader}>
          <p className={styles.eyebrow}>Mierzenie kąta</p>
          <h2>Zmierz 10 kątów ABC</h2>
          <p>W każdym przykładzie przesuń środek kątomierza na punkt B. Obróć jego prostą krawędź tak, aby pokryła się z ramieniem BA. Odczytaj miarę przy drugim ramieniu i wpisz wynik.</p>
        </header>
      ) : (
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>geometry-lab · M5-4.3 · L1 pomiar</p>
            <h2>{ACTIVITY_TITLES[task.activity]}</h2>
            <p>{task.prompt}</p>
          </div>
          <span className={placement.ready ? styles.ready : styles.notReady} data-measurement-ready={placement.ready ? "true" : "false"}>
            {placement.ready ? "✓ gotowy do odczytu" : "○ ustaw środek + bazę"}
          </span>
        </header>
      )}

      {simpleMeasurement ? <LessonTaskNavigator
        currentIndex={simpleExampleIndex}
        taskCount={simpleExampleSeeds.length}
        completed={completedSimpleExamples.includes(simpleExampleIndex)}
        completedCount={completedSimpleExamples.length}
        previousDisabled={locked || simpleExampleIndex === 0}
        nextDisabled={locked || simpleExampleIndex >= simpleExampleSeeds.length - 1 || !completedSimpleExamples.includes(simpleExampleIndex)}
        onPrevious={() => chooseSimpleExample(simpleExampleIndex - 1)}
        onNext={() => chooseSimpleExample(simpleExampleIndex + 1)}
        className={styles.interactiveOnly}
      /> : null}

      {simpleMeasurement && completedSimpleExamples.length > 0 ? (
        <section className="flex flex-wrap gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3" aria-label="Ukończone pomiary">
          {completedSimpleExamples.slice().sort((left, right) => left - right).map((index) => (
            <p key={index} className="rounded-xl bg-white px-3 py-2 text-sm font-black text-emerald-900">
              ✓ Zadanie {index + 1}: {Math.round(createPublicAngleMeasurementTask(simpleExampleSeeds[index]!).angleDegrees)}°
            </p>
          ))}
        </section>
      ) : null}

      {!simpleMeasurement ? <LessonTaskNavigator
        currentIndex={(["support", "core", "challenge"] as const).indexOf(difficulty)}
        taskCount={3}
        previousDisabled={locked || difficulty === "support"}
        nextDisabled={locked || difficulty === "challenge"}
        onPrevious={() => chooseDifficulty(difficulty === "challenge" ? "core" : "support")}
        onNext={() => chooseDifficulty(difficulty === "support" ? "core" : "challenge")}
        className={styles.interactiveOnly}
      /> : null}

      {!simpleMeasurement ? <div className={`${styles.toolRow} ${styles.interactiveOnly}`}>
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono położenie początkowe.")}>Reset</button>
      </div> : null}

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={simpleMeasurement ? "Pomiar kąta ABC" : `${ACTIVITY_TITLES[task.activity]} — pomiar ∠ABC`}
          description={simpleMeasurement
            ? "Kąt ABC oraz wirtualny kątomierz, który można przesuwać i obracać. Ustaw narzędzie na kącie, odczytaj miarę i wpisz ją w kratki."
            : `Kąt ABC ma wierzchołek B. Kątomierz jest ${placement.ready ? "gotowy" : "niegotowy"}: odległość środka ${placement.centerDistancePx.toFixed(1)} piksela, różnica bazy ${placement.baselineDifferenceDegrees.toFixed(1)} stopnia. Widoczne są obie skale.`}
          viewBox="0 0 760 500"
          className={`${styles.svg} ${simpleMeasurement ? styles.simpleMeasurementSvg : ""}`}
          columns={[{ key: "item", label: "Kontrola" }, { key: "value", label: "Wartość" }, { key: "status", label: "Status" }]}
          rows={rows}
        >
          <defs>
            <pattern id={`measurement-grid-${stateSeed}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" /></pattern>
          </defs>
          <rect width="760" height="500" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="760" height="500" fill={`url(#measurement-grid-${stateSeed})`} opacity=".55" />

          {!placement.baselineAligned ? <line x1={targetBaseStart.x} y1={targetBaseStart.y} x2={targetBaseEnd.x} y2={targetBaseEnd.y} stroke="#b45309" strokeWidth="4" strokeDasharray="10 8" data-baseline-guide /> : null}
          {!placement.centerAligned ? <line x1={center.x} y1={center.y} x2={vertex.x} y2={vertex.y} stroke="#be123c" strokeWidth="4" strokeDasharray="7 7" data-center-guide /> : null}

          <line x1={vertex.x} y1={vertex.y} x2={base.x} y2={base.y} stroke={highContrast ? "#000" : "#1e3a8a"} strokeWidth="10" strokeLinecap="round" data-angle-arm="BA" />
          <line x1={vertex.x} y1={vertex.y} x2={second.x} y2={second.y} stroke={highContrast ? "#444" : "#7c3aed"} strokeWidth="9" strokeDasharray="16 7" strokeLinecap="round" data-angle-arm="BC" />
          <circle cx={vertex.x} cy={vertex.y} r="9" fill="#fff" stroke="#be123c" strokeWidth="5" />
          <text x={base.x + 8} y={base.y - 12} fontSize="21" fontWeight="900">A</text>
          <text x={vertex.x + 14} y={vertex.y + 28} fontSize="21" fontWeight="900">B</text>
          <text x={second.x + 8} y={second.y - 12} fontSize="21" fontWeight="900">C</text>

          <g transform={`translate(${center.x} ${center.y}) rotate(${state.protractor.rotationDegrees})`} data-protractor>
            <path d={`M ${-state.protractor.radius} 0 A ${state.protractor.radius} ${state.protractor.radius} 0 0 1 ${state.protractor.radius} 0 L ${-state.protractor.radius} 0 Z`} fill={highContrast ? "rgba(255,255,255,.9)" : "rgba(254,240,138,.5)"} stroke="#854d0e" strokeWidth="4" />
            <line x1={-state.protractor.radius - 8} y1="0" x2={state.protractor.radius + 8} y2="0" stroke="#111827" strokeWidth="5" data-protractor-baseline />
            {Array.from({ length: 181 }, (_, degrees) => {
              const major = degrees % 10 === 0;
              const middle = degrees % 5 === 0;
              const outer = tickPosition(degrees, state.protractor.radius);
              const inner = tickPosition(degrees, state.protractor.radius - (major ? 18 : middle ? 12 : 8));
              return <line key={degrees} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke={major ? "#111827" : "#475569"} strokeWidth={major ? 2.2 : 1} />;
            })}
            {Array.from({ length: 10 }, (_, index) => index * 20).map((outerValue) => {
              const position = tickPosition(outerValue, state.protractor.radius - 31);
              const innerValue = 180 - outerValue;
              return (
                <g key={outerValue} transform={`translate(${position.x} ${position.y}) rotate(${-state.protractor.rotationDegrees})`}>
                  <text y="-6" textAnchor="middle" fontSize={simpleMeasurement ? "15" : "11"} fontWeight={state.protractor.scale === "outer" ? "900" : "600"} fill={state.protractor.scale === "outer" ? "#9f1239" : "#334155"}>{outerValue}</text>
                  <text y={simpleMeasurement ? "12" : "9"} textAnchor="middle" fontSize={simpleMeasurement ? "15" : "11"} fontWeight={state.protractor.scale === "inner" ? "900" : "600"} fill={state.protractor.scale === "inner" ? "#5b21b6" : "#334155"}>{innerValue}</text>
                </g>
              );
            })}
            <text x={state.protractor.radius - 2} y="20" textAnchor="end" fontSize={simpleMeasurement ? "17" : "14"} fontWeight="900" fill="#9f1239" data-outer-zero>0 zewn.</text>
            <text x={-state.protractor.radius + 2} y="20" textAnchor="start" fontSize={simpleMeasurement ? "17" : "14"} fontWeight="900" fill="#5b21b6" data-inner-zero>0 wewn.</text>
            <circle cx="0" cy="0" r="10" fill="#fff" stroke="#be123c" strokeWidth="5" />
            <path d={`M ${state.protractor.radius + 19} -10 L ${state.protractor.radius + 29} 0 L ${state.protractor.radius + 19} 10 L ${state.protractor.radius + 9} 0 Z`} fill="#fff" stroke="#0369a1" strokeWidth="4" />
          </g>

          {!locked ? (
            <g className={styles.interactiveOnly}>
              <circle
                cx={center.x}
                cy={center.y}
                r="26"
                fill="transparent"
                stroke="transparent"
                role="slider"
                tabIndex={0}
                aria-label={`Przenieś środek kątomierza. X ${center.x.toFixed(0)}, Y ${center.y.toFixed(0)}`}
                data-protractor-center-handle
                data-touch-target="52"
                onKeyDown={handleCenterKey}
                onPointerDown={(event) => startDrag("center", event)}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={{ cursor: "move", touchAction: "none" }}
              />
              <circle
                cx={rotationHandle.x}
                cy={rotationHandle.y}
                r="26"
                fill="transparent"
                stroke="transparent"
                role="slider"
                tabIndex={0}
                aria-label={`Obróć kątomierz. Obrót ${state.protractor.rotationDegrees.toFixed(0)} stopni`}
                aria-valuemin={0}
                aria-valuemax={359}
                aria-valuenow={Math.round(state.protractor.rotationDegrees)}
                data-protractor-rotation-handle
                data-touch-target="52"
                onKeyDown={handleRotationKey}
                onPointerDown={(event) => startDrag("rotation", event)}
                onPointerMove={continueDrag}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={{ cursor: "grab", touchAction: "none" }}
              />
            </g>
          ) : null}
        </AccessibleMathSvg>
      </div>

      {!simpleMeasurement ? <div className={`${styles.readiness} ${styles.interactiveOnly}`} aria-label="Warunki gotowości">
        <span data-center-aligned={placement.centerAligned ? "true" : "false"}>{placement.centerAligned ? "✓" : "○"} środek na B</span>
        <span data-baseline-aligned={placement.baselineAligned ? "true" : "false"}>{placement.baselineAligned ? "✓" : "○"} baza na BA</span>
        <strong>{placement.ready ? "GOTOWY" : "JESZCZE NIE"}</strong>
      </div> : null}

      {!simpleMeasurement ? <div className={`${styles.alternatives} ${styles.interactiveOnly}`}>
        <InteractionAlternativePanel title="Ustaw bez przeciągania" instruction="Środek: strzałki 1 px, Shift + strzałki 5 px. Obrót: strzałki 1°, Shift + strzałki 5°. Pola i przyciski są równoważną alternatywą dotyku.">
          <label>X środka <input aria-label="X środka kątomierza" type="number" min="0" max="760" value={Math.round(center.x)} disabled={locked} onChange={(event) => { const value = readFiniteNumber(event.target.value, 0, 760); if (value !== null) changeCenter({ ...center, x: value }, "Zmieniono X środka."); }} /></label>
          <button type="button" disabled={locked} onClick={() => changeCenter({ ...center, x: center.x - 1 }, "Przesunięto środek o 1 px w lewo.")}>← 1 px</button>
          <button type="button" disabled={locked} onClick={() => changeCenter({ ...center, x: center.x + 1 }, "Przesunięto środek o 1 px w prawo.")}>1 px →</button>
          <label>Y środka <input aria-label="Y środka kątomierza" type="number" min="0" max="500" value={Math.round(center.y)} disabled={locked} onChange={(event) => { const value = readFiniteNumber(event.target.value, 0, 500); if (value !== null) changeCenter({ ...center, y: value }, "Zmieniono Y środka."); }} /></label>
          <button type="button" disabled={locked} onClick={() => changeCenter({ ...center, y: center.y - 1 }, "Przesunięto środek o 1 px w górę.")}>↑ 1 px</button>
          <button type="button" disabled={locked} onClick={() => changeCenter({ ...center, y: center.y + 1 }, "Przesunięto środek o 1 px w dół.")}>↓ 1 px</button>
          <label>Obrót ° <input aria-label="Obrót kątomierza" type="number" min="0" max="359" value={Math.round(state.protractor.rotationDegrees)} disabled={locked} onChange={(event) => { const value = readFiniteNumber(event.target.value, 0, 359); if (value !== null) changeRotation(value, "Zmieniono obrót kątomierza."); }} /></label>
          <button type="button" disabled={locked} onClick={() => commit(rotateMeasurementProtractorBy(state, -1), "Obrócono o 1° w lewo.")}>↶ 1°</button>
          <button type="button" disabled={locked} onClick={() => commit(rotateMeasurementProtractorBy(state, 1), "Obrócono o 1° w prawo.")}>1° ↷</button>
        </InteractionAlternativePanel>
      </div> : null}

      {!simpleMeasurement ? <fieldset className={`${styles.scaleChoice} ${styles.interactiveOnly}`} disabled={locked}>
        <legend>Wybierz zero i skalę</legend>
        <button type="button" aria-pressed={state.protractor.scale === "outer"} onClick={() => chooseScale("outer")}><span className={styles.outerMark}>0 → 180</span> skala zewnętrzna</button>
        <button type="button" aria-pressed={state.protractor.scale === "inner"} onClick={() => chooseScale("inner")}><span className={styles.innerMark}>180 ← 0</span> skala wewnętrzna</button>
      </fieldset> : null}

      {!simpleMeasurement ? <div className={`${styles.answer} ${styles.interactiveOnly}`}>
        <label>Odczyt kąta <input aria-label="Odczyt kąta w stopniach" type="number" inputMode="numeric" min="0" max="180" value={answer} disabled={locked} onChange={(event) => { setAnswer(event.target.value); setDiagnosticCode(null); }} /> °</label>
        <button type="button" disabled={locked} onClick={checkAnswer}>Sprawdź pomiar</button>
      </div> : (
        <div className={`${styles.simpleAnswerArea} ${styles.interactiveOnly}`}>
          <div>
            <h3>Wpisz miarę kąta</h3>
            <p>Uzupełnij wszystkie kratki, a potem zatwierdź odpowiedź.</p>
          </div>
          <div className={styles.simpleAnswerCells} role="group" aria-label="Miara kąta w kratkach">
            {simpleAnswerDigits.map((digit, index) => (
              <button
                key={index}
                type="button"
                className={activeSimpleAnswerCell === index ? styles.activeAnswerCell : styles.simpleAnswerCell}
                aria-label={`Cyfra ${index + 1} z ${simpleAnswerCellCount}`}
                aria-pressed={activeSimpleAnswerCell === index}
                disabled={locked}
                onClick={() => setActiveSimpleAnswerCell(index)}
              >
                {digit || <span aria-hidden>&nbsp;</span>}
              </button>
            ))}
            <span className={styles.degreeMark} aria-hidden>°</span>
          </div>
        </div>
      )}

      {simpleMeasurement ? (
        <div className={`${styles.simpleKeypad} ${styles.interactiveOnly}`}>
          <LessonNumericKeypad
            onKey={enterSimpleAnswerDigit}
            onConfirm={checkAnswer}
            disabled={locked}
            label="Klawiatura do wpisania miary kąta"
            helperText="Kliknij kratkę, wpisz cyfry i zatwierdź odpowiedź."
          />
        </div>
      ) : null}

      <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic && !simpleMeasurement ? (
        <div className={styles.interactiveOnly}>
          {mode === "assessment"
            ? internalSubmitted || assessmentSubmitted
              ? <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted assessmentEnded solution={diagnostic.solution} />
              : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
            : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />}
        </div>
      ) : null}

      <p className={styles.printOnly}>{simpleMeasurement ? "Zmierz kolejno 10 kątów ABC. W każdym ustaw środek kątomierza na B, prostą krawędź na BA i wpisz odczytaną miarę." : "Na wydruku ustaw środek kątomierza na B, linię 0°–180° na BA, wybierz zero przy ramieniu BA i zapisz odczyt przy BC. Każdy rysunek mierz niezależnie z dokładnością do 1°."}</p>
    </section>
  );
}
