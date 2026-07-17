"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
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
  support: "Przykład 1",
  core: "Przykład 2",
  challenge: "Przykład 3",
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

export function AngleMeasurementGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: AngleMeasurementGeometryLabProps) {
  const initialTask = createPublicAngleMeasurementTask(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => createGeometryHistory(createAngleMeasurementGeometryState(seed, mode)));
  const state = history.present;
  const stateSeed = Math.round(pointById(state.points, "seed-marker")?.x ?? seed);
  const task = createPublicAngleMeasurementTask(stateSeed);
  const placement = analyzeProtractorPlacement(state);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [answer, setAnswer] = useState("");
  const [diagnosticCode, setDiagnosticCode] = useState<MeasurementDiagnosticCode | null>(null);
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState("Kątomierz czeka na ustawienie. Gotowość wymaga środka na B i bazy na BA.");
  const drag = useRef<"center" | "rotation" | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const locked = readOnly || assessmentSubmitted || (mode === "assessment" && internalSubmitted);

  const publish = (next: GeometryLabState) => onStateChange?.(next);

  const resetResponse = () => {
    setAnswer("");
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
    const preserved = task.activity === "series" ? state.protractor : undefined;
    const next = createAngleMeasurementGeometryState(nextSeed, mode, preserved);
    setDifficulty(nextDifficulty);
    setHistory(createGeometryHistory(next));
    resetResponse();
    setAnnouncement(task.activity === "series"
      ? `Kąt ${nextDifficulty === "support" ? "1" : nextDifficulty === "core" ? "2" : "3"}. Narzędzie zachowało położenie i obrót — nie zostało ustawione automatycznie.`
      : `Poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Ustaw narzędzie od początku.`);
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
    const numeric = readFiniteNumber(answer, 0, 180);
    let code: MeasurementDiagnosticCode | null = null;
    if (!placement.centerAligned) code = "ANGLE_CENTER_MISALIGNED";
    else if (!placement.baselineAligned) code = "ANGLE_BASELINE_MISALIGNED";
    else if (!placement.scaleCorrect) code = "ANGLE_WRONG_SCALE";
    else if (numeric === null) code = "ANGLE_EMPTY_READING";
    else if (Math.abs(numeric - measurementAngleDegrees(state)) > 1) code = "ANGLE_READING_INCORRECT";
    setDiagnosticCode(code);
    setInternalSubmitted(mode === "assessment");
    setAnnouncement(code
      ? "Pomiar wymaga poprawy. Skorzystaj z diagnostyki ustawienia lub odczytu."
      : `✓ Pomiar poprawny: ${numeric?.toFixed(0)}°. Środek, baza, skala i odczyt są zgodne.`);
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
  const rows = [
    { item: "Środek", value: `${placement.centerDistancePx.toFixed(1)} px od B`, status: placement.centerAligned ? "✓ na wierzchołku" : "ustaw" },
    { item: "Linia bazowa", value: `różnica ${placement.baselineDifferenceDegrees.toFixed(1)}°`, status: placement.baselineAligned ? "✓ na BA" : "obróć" },
    { item: "Gotowość", value: placement.ready ? "TAK" : "NIE", status: "środek ORAZ baza" },
    { item: "Skala", value: state.protractor.scale === "inner" ? "wewnętrzna" : "zewnętrzna", status: placement.scaleCorrect ? "✓ właściwe zero" : "sprawdź zero" },
    { item: "Odczyt", value: answer.trim() === "" ? "jeszcze nie wpisano" : `${answer}°`, status: selectedReading === null ? "najpierw ustaw narzędzie" : "porównaj z kreską przy BC" },
  ];

  return (
    <section
      className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-angle-measurement-lab
      data-activity={task.activity}
      data-difficulty={difficulty}
      data-mode={mode}
    >
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

      <div className={`${styles.toolRow} ${styles.interactiveOnly}`} aria-label={task.activity === "series" ? "Seria trzech kątów" : "Trzy deterministyczne poziomy"}>
        {(["support", "core", "challenge"] as const).map((item, index) => (
          <button key={item} type="button" disabled={locked} aria-pressed={difficulty === item} onClick={() => chooseDifficulty(item)}>
            {task.activity === "series" ? `Kąt ${index + 1}` : DIFFICULTY_LABELS[item]}
          </button>
        ))}
      </div>

      <div className={`${styles.toolRow} ${styles.interactiveOnly}`}>
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono położenie początkowe.")}>Reset</button>
      </div>

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={`${ACTIVITY_TITLES[task.activity]} — pomiar ∠ABC`}
          description={`Kąt ABC ma wierzchołek B. Kątomierz jest ${placement.ready ? "gotowy" : "niegotowy"}: odległość środka ${placement.centerDistancePx.toFixed(1)} piksela, różnica bazy ${placement.baselineDifferenceDegrees.toFixed(1)} stopnia. Widoczne są obie skale.`}
          viewBox="0 0 760 500"
          className={styles.svg}
          columns={[{ key: "item", label: "Kontrola" }, { key: "value", label: "Wartość" }, { key: "status", label: "Status" }]}
          rows={rows}
        >
          <defs>
            <pattern id={`measurement-grid-${stateSeed}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" /></pattern>
            <marker id={`measurement-arrow-${stateSeed}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={highContrast ? "#000" : "#1e3a8a"} /></marker>
          </defs>
          <rect width="760" height="500" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="760" height="500" fill={`url(#measurement-grid-${stateSeed})`} opacity=".55" />

          {!placement.baselineAligned ? <line x1={targetBaseStart.x} y1={targetBaseStart.y} x2={targetBaseEnd.x} y2={targetBaseEnd.y} stroke="#b45309" strokeWidth="4" strokeDasharray="10 8" data-baseline-guide /> : null}
          {!placement.centerAligned ? <line x1={center.x} y1={center.y} x2={vertex.x} y2={vertex.y} stroke="#be123c" strokeWidth="4" strokeDasharray="7 7" data-center-guide /> : null}

          <line x1={vertex.x} y1={vertex.y} x2={base.x} y2={base.y} stroke={highContrast ? "#000" : "#1e3a8a"} strokeWidth="10" strokeLinecap="round" markerEnd={`url(#measurement-arrow-${stateSeed})`} data-angle-arm="BA" />
          <line x1={vertex.x} y1={vertex.y} x2={second.x} y2={second.y} stroke={highContrast ? "#444" : "#7c3aed"} strokeWidth="9" strokeDasharray="16 7" strokeLinecap="round" markerEnd={`url(#measurement-arrow-${stateSeed})`} data-angle-arm="BC" />
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
                  <text y="-5" textAnchor="middle" fontSize="11" fontWeight={state.protractor.scale === "outer" ? "900" : "600"} fill={state.protractor.scale === "outer" ? "#9f1239" : "#334155"}>{outerValue}</text>
                  <text y="9" textAnchor="middle" fontSize="11" fontWeight={state.protractor.scale === "inner" ? "900" : "600"} fill={state.protractor.scale === "inner" ? "#5b21b6" : "#334155"}>{innerValue}</text>
                </g>
              );
            })}
            <text x={state.protractor.radius - 2} y="18" textAnchor="end" fontSize="14" fontWeight="900" fill="#9f1239" data-outer-zero>0 zewn.</text>
            <text x={-state.protractor.radius + 2} y="18" textAnchor="start" fontSize="14" fontWeight="900" fill="#5b21b6" data-inner-zero>0 wewn.</text>
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

      <div className={`${styles.readiness} ${styles.interactiveOnly}`} aria-label="Warunki gotowości">
        <span data-center-aligned={placement.centerAligned ? "true" : "false"}>{placement.centerAligned ? "✓" : "○"} środek na B</span>
        <span data-baseline-aligned={placement.baselineAligned ? "true" : "false"}>{placement.baselineAligned ? "✓" : "○"} baza na BA</span>
        <strong>{placement.ready ? "GOTOWY" : "JESZCZE NIE"}</strong>
      </div>

      <div className={`${styles.alternatives} ${styles.interactiveOnly}`}>
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
      </div>

      <fieldset className={`${styles.scaleChoice} ${styles.interactiveOnly}`} disabled={locked}>
        <legend>Wybierz zero i skalę</legend>
        <button type="button" aria-pressed={state.protractor.scale === "outer"} onClick={() => chooseScale("outer")}><span className={styles.outerMark}>0 → 180</span> skala zewnętrzna</button>
        <button type="button" aria-pressed={state.protractor.scale === "inner"} onClick={() => chooseScale("inner")}><span className={styles.innerMark}>180 ← 0</span> skala wewnętrzna</button>
      </fieldset>

      <div className={`${styles.answer} ${styles.interactiveOnly}`}>
        <label>Odczyt kąta <input aria-label="Odczyt kąta w stopniach" type="number" inputMode="numeric" min="0" max="180" value={answer} disabled={locked} onChange={(event) => { setAnswer(event.target.value); setDiagnosticCode(null); }} /> °</label>
        <button type="button" disabled={locked} onClick={checkAnswer}>Sprawdź pomiar</button>
      </div>

      <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? (
        <div className={styles.interactiveOnly}>
          {mode === "assessment"
            ? internalSubmitted || assessmentSubmitted
              ? <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted assessmentEnded solution={diagnostic.solution} />
              : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
            : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />}
        </div>
      ) : null}

      <p className={styles.printOnly}>Na wydruku ustaw środek kątomierza na B, linię 0°–180° na BA, wybierz zero przy ramieniu BA i zapisz odczyt przy BC. Każdy rysunek mierz niezależnie z dokładnością do 1°.</p>
    </section>
  );
}
