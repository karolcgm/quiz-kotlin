"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  analyzeAngleDrawing,
  angleDrawingSeedFor,
  createAngleDrawingGeometryState,
  createPublicAngleDrawingTask,
  expectedSecondRayDirection,
  moveDrawingProtractor,
  rotateDrawingProtractor,
  setAngleDrawingPhase,
  setAngleDrawingPoint,
  setAngleDrawingPointDirection,
  setDrawingProtractorScale,
} from "@/lib/math/geometry/angleDrawing";
import type { AngleDrawingActivity, AngleDrawingPhase } from "@/lib/math/geometry/angleDrawing";
import { pointById } from "@/lib/math/geometry";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, DiagnosticSolution } from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";
import styles from "@/components/lessons/geometry/angleDrawing.module.css";

type DrawingDiagnosticCode =
  | "ANGLE_DRAW_BASE_REQUIRED"
  | "ANGLE_DRAW_MARK_REQUIRED"
  | "ANGLE_DRAW_BASE_INCORRECT"
  | "ANGLE_DRAW_CENTER_MISALIGNED"
  | "ANGLE_DRAW_BASELINE_MISALIGNED"
  | "ANGLE_DRAW_WRONG_SCALE"
  | "ANGLE_DRAW_MARK_INCORRECT"
  | "ANGLE_DRAW_SECOND_RAY_INCORRECT"
  | "ANGLE_DRAW_EMPTY_PEER_READING"
  | "ANGLE_DRAW_PEER_DIFFERENCE";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = { support: "Przykład 1", core: "Przykład 2", challenge: "Przykład 3" };
const ACTIVITY_TITLES: Record<AngleDrawingActivity, string> = {
  workflow: "Narysuj 65°",
  variants: "Inne miary i orientacje",
  "peer-check": "Kontrola koleżeńska",
  independent: "Samodzielna konstrukcja",
};
const PHASE_LABELS: Record<AngleDrawingPhase, string> = {
  "base-ray": "1. promień bazowy",
  "measure-mark": "2. znacznik miary",
  "second-ray": "3. drugie ramię",
  complete: "konstrukcja gotowa",
};

const DIAGNOSTIC_COPY: Record<DrawingDiagnosticCode, DiagnosticFeedbackCopy> = {
  ANGLE_DRAW_BASE_REQUIRED: { area: "Najpierw trzeba zatwierdzić promień bazowy.", guidingQuestion: "Jaki jest pierwszy krok konstrukcji?", visualHint: "Kolejność nad modelem zaczyna się od BA.", analogousExample: "Dla 50° najpierw rysujemy jeden promień, nie znak miary.", },
  ANGLE_DRAW_MARK_REQUIRED: { area: "Przed drugim ramieniem trzeba zatwierdzić znacznik miary.", guidingQuestion: "Który punkt wyznacza kierunek drugiego ramienia?", visualHint: "Zaznacz kreskę właściwej skali, dopiero potem prowadź BC.", analogousExample: "Po odłożeniu 80° stawiamy punkt przy kresce 80.", },
  ANGLE_DRAW_BASE_INCORRECT: { area: "Promień bazowy nie ma jeszcze wymaganej orientacji.", guidingQuestion: "Czy BA pokrywa się z przerywanym prowadnikiem?", visualHint: "Różnica kierunków powinna wynosić najwyżej 1°.", analogousExample: "Promień bazowy może być ukośny; liczy się zgodność z prowadnikiem.", },
  ANGLE_DRAW_CENTER_MISALIGNED: { area: "Środek kątomierza nie leży na wierzchołku B.", guidingQuestion: "Gdzie spotykają się ramiona kąta?", visualHint: "Przenieś uchwyt ● na B; tolerancja położenia to 4 px.", analogousExample: "Otwór kątomierza przykładamy do początku promienia.", },
  ANGLE_DRAW_BASELINE_MISALIGNED: { area: "Linia 0°–180° nie pokrywa się z promieniem BA.", guidingQuestion: "Czy zero i linia bazowa leżą na BA?", visualHint: "Obróć uchwyt ◇ do zgodności kierunku w granicy 1°.", analogousExample: "Przy ukośnym BA obracamy cały kątomierz.", },
  ANGLE_DRAW_WRONG_SCALE: { area: "Wybrano skalę zaczynającą się od niewłaściwego zera.", guidingQuestion: "Które 0° leży na promieniu BA?", visualHint: "Czytaj jedną skalę od zera na ramieniu bazowym.", analogousExample: "Od prawego zera rosną liczby skali zewnętrznej.", },
  ANGLE_DRAW_MARK_INCORRECT: { area: "Znacznik miary nie leży przy zadanej wartości.", guidingQuestion: "Ile stopni trzeba odłożyć od BA?", visualHint: "Przesuń M do kreski; różnica może wynosić najwyżej 1°.", analogousExample: "Dla 65° punkt M stawiamy przy kresce 65 właściwej skali.", },
  ANGLE_DRAW_SECOND_RAY_INCORRECT: { area: "Drugie ramię nie przechodzi przez poprawny znacznik.", guidingQuestion: "Czy promień BC biegnie od B przez M?", visualHint: "Dopasuj kierunek BC do znacznika w granicy 1°.", analogousExample: "Linijka łączy wierzchołek z zaznaczoną kreską.", },
  ANGLE_DRAW_EMPTY_PEER_READING: { area: "Brakuje anonimowego odczytu partnera.", guidingQuestion: "Jaką miarę pokazuje kątomierz partnera?", visualHint: "Wpisz tylko liczbę, bez imienia i nazwiska.", analogousExample: "Odczyt 64° zapisujemy jako 64.", },
  ANGLE_DRAW_PEER_DIFFERENCE: { area: "Anonimowy pomiar różni się od konstrukcji o więcej niż 1°.", guidingQuestion: "Czy partner ustawił środek, bazę i właściwe zero?", visualHint: "Porównaj miarę konstrukcji i odczyt; zaakceptuj różnicę do 1°.", analogousExample: "Dla konstrukcji 65° odczyty 64°–66° przechodzą kontrolę.", },
};

const SOLUTIONS: Record<DrawingDiagnosticCode, DiagnosticSolution> = Object.fromEntries(
  (Object.keys(DIAGNOSTIC_COPY) as DrawingDiagnosticCode[]).map((code) => [
    code,
    {
      steps: [
        "Wróć do pierwszego niespełnionego kroku.",
        DIAGNOSTIC_COPY[code].visualHint,
        "Sprawdź bieżącą różnicę w tabeli pod modelem.",
      ],
    },
  ]),
) as Record<DrawingDiagnosticCode, DiagnosticSolution>;

function diagnosticPresentation(code: DrawingDiagnosticCode) {
  const highlight: DiagnosticHighlightTarget = {
    id: `drawing-${code.toLocaleLowerCase("en-US")}`,
    kind: code.includes("CENTER") ? "vertex" : code.includes("SECOND") || code.includes("BASE") ? "edge" : "pair",
    memberIds: code.includes("SECOND") ? ["ray-bc", "measure-mark"] : code.includes("BASE") ? ["ray-ba", "protractor-baseline"] : ["angle-abc", "measure-mark"],
    label: DIAGNOSTIC_COPY[code].area,
    state: "attention",
    pattern: "dashed",
    symbol: code.includes("CENTER") ? "● → B" : code.includes("MARK") ? "M" : "∠",
    accent: code.includes("SCALE") ? "violet" : "amber",
  };
  return {
    result: createLessonGradeResult({ status: "incorrect", score: 0, maxScore: 1, errorCodes: [code], feedbackKey: `geometry.${code.toLocaleLowerCase("en-US")}` }),
    copy: DIAGNOSTIC_COPY[code],
    highlights: [highlight],
    solution: SOLUTIONS[code],
  };
}

function pointAt(origin: GeometryPointCoordinates, direction: number, distance: number): GeometryPointCoordinates {
  const radians = direction * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * distance, y: origin.y + Math.sin(radians) * distance };
}

function tickPoint(degrees: number, radius: number): GeometryPointCoordinates {
  const radians = -degrees * Math.PI / 180;
  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

function finite(raw: string, minimum = -Infinity, maximum = Infinity): number | null {
  const value = Number(raw);
  return raw.trim() && Number.isFinite(value) && value >= minimum && value <= maximum ? value : null;
}

function pointFromPointer(event: PointerEvent<SVGCircleElement>, state: GeometryLabState): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return { x: (event.clientX - bounds.left) / bounds.width * state.viewport.width, y: (event.clientY - bounds.top) / bounds.height * state.viewport.height };
}

export interface AngleDrawingGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

export function AngleDrawingGeometryLab({ seed, mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false, onStateChange }: AngleDrawingGeometryLabProps) {
  const initialTask = createPublicAngleDrawingTask(seed);
  const [difficulty, setDifficulty] = useState(initialTask.difficulty);
  const [state, setState] = useState(() => createAngleDrawingGeometryState(seed, mode));
  const [diagnosticCode, setDiagnosticCode] = useState<DrawingDiagnosticCode | null>(null);
  const [announcement, setAnnouncement] = useState("Model gotowy. Zacznij od promienia bazowego.");
  const [peerReading, setPeerReading] = useState("");
  const dragging = useRef<"point-a" | "measure-mark" | "point-c" | "protractor-center" | null>(null);
  const task = useMemo(() => createPublicAngleDrawingTask(angleDrawingSeedFor(initialTask.activity, difficulty)), [difficulty, initialTask.activity]);
  const analysis = useMemo(() => analyzeAngleDrawing(state), [state]);
  const interactionLocked = readOnly || (mode === "assessment" && assessmentSubmitted);
  const diagnostic = diagnosticCode ? diagnosticPresentation(diagnosticCode) : null;
  const vertex = pointById(state.points, "vertex-b")!;
  const base = pointById(state.points, "point-a")!;
  const mark = pointById(state.points, "measure-mark")!;
  const second = pointById(state.points, "point-c")!;
  const phaseIndex = (["base-ray", "measure-mark", "second-ray", "complete"] as AngleDrawingPhase[]).indexOf(analysis.phase);
  const peerNumber = finite(peerReading, 0, 180);
  const peerDifference = peerNumber === null ? null : Math.abs(peerNumber - analysis.secondRayDegrees);

  const publish = (next: GeometryLabState, message?: string) => {
    setState({ ...next, mode });
    onStateChange?.({ ...next, mode });
    if (message) setAnnouncement(message);
  };

  const changeDifficulty = (nextDifficulty: LessonDifficulty) => {
    const nextSeed = angleDrawingSeedFor(initialTask.activity, nextDifficulty);
    setDifficulty(nextDifficulty);
    setPeerReading("");
    setDiagnosticCode(null);
    publish(createAngleDrawingGeometryState(nextSeed, mode), `Wybrano poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Zacznij od promienia bazowego.`);
  };

  const setDirection = (pointId: "point-a" | "measure-mark" | "point-c", degrees: number, message: string) => {
    publish(setAngleDrawingPointDirection(state, pointId, degrees), message);
    setDiagnosticCode(null);
  };

  const movePointBy = (pointId: "point-a" | "measure-mark" | "point-c", dx: number, dy: number, step: number) => {
    const point = pointById(state.points, pointId)!;
    publish(setAngleDrawingPoint(state, pointId, { x: point.x + dx, y: point.y + dy }), `Przesunięto ${point.label} o ${step} px.`);
    setDiagnosticCode(null);
  };

  const handlePointKey = (pointId: "point-a" | "measure-mark" | "point-c", event: KeyboardEvent<SVGCircleElement>) => {
    const direction: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const vector = direction[event.key];
    if (!vector || interactionLocked) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    movePointBy(pointId, vector[0] * step, vector[1] * step, step);
  };

  const handleCenterKey = (event: KeyboardEvent<SVGCircleElement>) => {
    const direction: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const vector = direction[event.key];
    if (!vector || interactionLocked) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    publish(moveDrawingProtractor(state, { x: state.protractor.center.x + vector[0] * step, y: state.protractor.center.y + vector[1] * step }), `Przesunięto środek kątomierza o ${step} px.`);
    setDiagnosticCode(null);
  };

  const handleRotationKey = (event: KeyboardEvent<SVGCircleElement>) => {
    if (!(["ArrowLeft", "ArrowRight"] as string[]).includes(event.key) || interactionLocked) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = event.key === "ArrowLeft" ? -step : step;
    publish(rotateDrawingProtractor(state, state.protractor.rotationDegrees + delta), `Obrócono kątomierz o ${step}°.`);
    setDiagnosticCode(null);
  };

  const handlePointerDown = (kind: typeof dragging.current, event: PointerEvent<SVGCircleElement>) => {
    if (interactionLocked) return;
    dragging.current = kind;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<SVGCircleElement>) => {
    if (!dragging.current || interactionLocked) return;
    const coordinates = pointFromPointer(event, state);
    if (!coordinates) return;
    if (dragging.current === "protractor-center") publish(moveDrawingProtractor(state, coordinates));
    else publish(setAngleDrawingPoint(state, dragging.current, coordinates));
  };

  const handlePointerUp = (event: PointerEvent<SVGCircleElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragging.current = null;
    setAnnouncement("Zaktualizowano konstrukcję.");
  };

  const approveBase = () => {
    if (analysis.baseDifferenceDegrees > 1) { setDiagnosticCode("ANGLE_DRAW_BASE_INCORRECT"); return; }
    publish(setAngleDrawingPhase(state, "measure-mark"), "Promień bazowy zatwierdzony. Teraz ustaw kątomierz i znacznik miary.");
    setDiagnosticCode(null);
  };

  const approveMark = () => {
    if (analysis.phase === "base-ray") { setDiagnosticCode("ANGLE_DRAW_BASE_REQUIRED"); return; }
    const code = !analysis.centerAligned ? "ANGLE_DRAW_CENTER_MISALIGNED"
      : !analysis.baselineAligned ? "ANGLE_DRAW_BASELINE_MISALIGNED"
      : !analysis.scaleCorrect ? "ANGLE_DRAW_WRONG_SCALE"
      : analysis.markerDifferenceDegrees > 1 ? "ANGLE_DRAW_MARK_INCORRECT" : null;
    if (code) { setDiagnosticCode(code); return; }
    publish(setAngleDrawingPhase(state, "second-ray"), "Znacznik miary zatwierdzony. Poprowadź drugie ramię od B przez M.");
    setDiagnosticCode(null);
  };

  const approveSecondRay = () => {
    if (analysis.phase === "base-ray") { setDiagnosticCode("ANGLE_DRAW_BASE_REQUIRED"); return; }
    if (analysis.phase === "measure-mark") { setDiagnosticCode("ANGLE_DRAW_MARK_REQUIRED"); return; }
    if (analysis.secondRayDifferenceDegrees > 1) { setDiagnosticCode("ANGLE_DRAW_SECOND_RAY_INCORRECT"); return; }
    publish(setAngleDrawingPhase(state, "complete"), `Konstrukcja poprawna: ${analysis.secondRayDegrees.toFixed(1)}°. Kolejność zachowana.`);
    setDiagnosticCode(null);
  };

  const checkPeer = () => {
    if (peerNumber === null) { setDiagnosticCode("ANGLE_DRAW_EMPTY_PEER_READING"); return; }
    if ((peerDifference ?? Infinity) > 1) { setDiagnosticCode("ANGLE_DRAW_PEER_DIFFERENCE"); return; }
    setDiagnosticCode(null);
    setAnnouncement(`Anonimowa kontrola przyjęta. Różnica ${peerDifference?.toFixed(1)}° mieści się w granicy 1°.`);
  };

  const textRows = [
    { element: "Etap", value: PHASE_LABELS[analysis.phase], kontrola: "kolejność" },
    { element: "Promień BA", value: `${analysis.baseDirectionDegrees.toFixed(1)}°`, kontrola: `różnica ${analysis.baseDifferenceDegrees.toFixed(1)}°` },
    { element: "Znacznik M", value: `${analysis.markerDegrees.toFixed(1)}°`, kontrola: `różnica ${analysis.markerDifferenceDegrees.toFixed(1)}°` },
    { element: "Kąt ABC", value: `${analysis.secondRayDegrees.toFixed(1)}°`, kontrola: `różnica kierunku ${analysis.secondRayDifferenceDegrees.toFixed(1)}°` },
  ];

  const protractorRotationHandle = pointAt(state.protractor.center, state.protractor.rotationDegrees - 90, state.protractor.radius + 34);

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-angle-drawing-lab data-activity={task.activity} data-phase={analysis.phase} data-mode={mode}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>M5-4.3 · L2 rysowanie</p><h2>{ACTIVITY_TITLES[task.activity]}</h2><p>{task.prompt}</p></div>
        <span className={styles.phaseBadge}>{PHASE_LABELS[analysis.phase]}</span>
      </header>

      <div className={`${styles.levels} ${styles.interactiveOnly}`} aria-label="Poziom konstrukcji">
        {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => <button key={level} type="button" aria-pressed={difficulty === level} disabled={interactionLocked} onClick={() => changeDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>)}
      </div>

      <ol className={styles.steps} aria-label="Kolejność konstrukcji">
        {(["base-ray", "measure-mark", "second-ray"] as AngleDrawingPhase[]).map((phase, index) => <li key={phase} className={phaseIndex > index ? styles.stepDone : phaseIndex === index ? styles.stepCurrent : ""}>{phaseIndex > index ? "✓ " : ""}{PHASE_LABELS[phase]}</li>)}
      </ol>

      <div className={styles.canvas}>
        <AccessibleMathSvg title={`Konstrukcja kąta ${task.targetDegrees}°`} description={`Bieżący etap: ${PHASE_LABELS[analysis.phase]}. Model aktualizuje miarę, skalę i różnice w czasie rzeczywistym.`} viewBox={`0 0 ${state.viewport.width} ${state.viewport.height}`} className={styles.svg} columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "kontrola", label: "Kontrola" }]} rows={textRows}>
          <defs><pattern id={`drawing-grid-${task.seed}`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1" /></pattern></defs>
          <rect width="760" height="520" fill={`url(#drawing-grid-${task.seed})`} />
          <line x1={vertex.x} y1={vertex.y} x2={pointAt(vertex, task.baseDirectionDegrees, 280).x} y2={pointAt(vertex, task.baseDirectionDegrees, 280).y} stroke="#94a3b8" strokeWidth="3" strokeDasharray="9 7" aria-label="Prowadnik promienia bazowego" />
          <line x1={vertex.x} y1={vertex.y} x2={base.x} y2={base.y} stroke="#1d4ed8" strokeWidth="7" strokeLinecap="round" />

          {phaseIndex >= 1 ? <g transform={`translate(${state.protractor.center.x} ${state.protractor.center.y}) rotate(${state.protractor.rotationDegrees})`} data-protractor>
            <path d={`M ${-state.protractor.radius} 0 A ${state.protractor.radius} ${state.protractor.radius} 0 0 1 ${state.protractor.radius} 0 L ${-state.protractor.radius} 0`} fill="#dbeafeaa" stroke="#1e3a8a" strokeWidth="3" />
            {Array.from({ length: 37 }, (_, index) => index * 5).map((degree) => { const outer = tickPoint(degree, state.protractor.radius); const inner = tickPoint(degree, degree % 10 === 0 ? state.protractor.radius - 14 : state.protractor.radius - 8); return <line key={degree} x1={outer.x} y1={outer.y} x2={inner.x} y2={inner.y} stroke="#172033" strokeWidth={degree % 10 === 0 ? 2 : 1} />; })}
            {[0, 30, 60, 90, 120, 150, 180].map((degree) => { const position = tickPoint(degree, state.protractor.radius - 30); return <g key={degree} transform={`translate(${position.x} ${position.y}) rotate(${-state.protractor.rotationDegrees})`}><text textAnchor="middle" fontSize="13" fontWeight="800" fill="#be123c">{degree}</text><text y="14" textAnchor="middle" fontSize="11" fontWeight="800" fill="#6d28d9">{180 - degree}</text></g>; })}
            <text x={state.protractor.radius - 8} y="19" textAnchor="end" fontSize="12" fontWeight="900" fill="#be123c" data-outer-zero>0 zewn.</text>
            <text x={-state.protractor.radius + 8} y="19" fontSize="12" fontWeight="900" fill="#6d28d9" data-inner-zero>0 wewn.</text>
          </g> : null}

          {phaseIndex >= 1 ? <><line x1={vertex.x} y1={vertex.y} x2={mark.x} y2={mark.y} stroke="#f59e0b" strokeWidth="3" strokeDasharray="7 6" /><circle cx={mark.x} cy={mark.y} r="7" fill="#f59e0b" /><text x={mark.x + 12} y={mark.y - 10} fontWeight="900">M</text></> : null}
          {phaseIndex >= 2 ? <line x1={vertex.x} y1={vertex.y} x2={second.x} y2={second.y} stroke="#059669" strokeWidth="7" strokeLinecap="round" /> : null}
          <circle cx={vertex.x} cy={vertex.y} r="8" fill="#0f172a" /><text x={vertex.x + 12} y={vertex.y + 22} fontSize="18" fontWeight="900">B</text>

          {!interactionLocked && analysis.phase === "base-ray" ? <circle role="slider" aria-label="Ustaw koniec promienia bazowego A" aria-valuetext={`${analysis.baseDirectionDegrees.toFixed(1)}°`} tabIndex={0} cx={base.x} cy={base.y} r="26" fill="#2563eb55" stroke="#1d4ed8" strokeWidth="3" data-touch-target="52" onPointerDown={(event) => handlePointerDown("point-a", event)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onKeyDown={(event) => handlePointKey("point-a", event)} /> : null}
          {!interactionLocked && analysis.phase === "measure-mark" ? <><circle role="slider" aria-label="Przenieś środek kątomierza" aria-valuetext={`x ${state.protractor.center.x}, y ${state.protractor.center.y}`} tabIndex={0} cx={state.protractor.center.x} cy={state.protractor.center.y} r="26" fill="#0ea5e955" stroke="#0369a1" strokeWidth="3" data-touch-target="52" onPointerDown={(event) => handlePointerDown("protractor-center", event)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onKeyDown={handleCenterKey} /><circle role="slider" aria-label="Obróć kątomierz" aria-valuenow={state.protractor.rotationDegrees} tabIndex={0} cx={protractorRotationHandle.x} cy={protractorRotationHandle.y} r="26" fill="#8b5cf655" stroke="#6d28d9" strokeWidth="3" data-touch-target="52" onKeyDown={handleRotationKey} /><circle role="slider" aria-label="Ustaw znacznik miary M" aria-valuenow={analysis.markerDegrees} tabIndex={0} cx={mark.x} cy={mark.y} r="26" fill="#f59e0b55" stroke="#b45309" strokeWidth="3" data-touch-target="52" onPointerDown={(event) => handlePointerDown("measure-mark", event)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onKeyDown={(event) => handlePointKey("measure-mark", event)} /></> : null}
          {!interactionLocked && analysis.phase === "second-ray" ? <circle role="slider" aria-label="Ustaw koniec drugiego ramienia C" aria-valuenow={analysis.secondRayDegrees} tabIndex={0} cx={second.x} cy={second.y} r="26" fill="#10b98155" stroke="#047857" strokeWidth="3" data-touch-target="52" onPointerDown={(event) => handlePointerDown("point-c", event)} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onKeyDown={(event) => handlePointKey("point-c", event)} /> : null}
        </AccessibleMathSvg>
      </div>

      <div className={styles.metrics} aria-label="Diagnostyka w czasie rzeczywistym">
        <div className={styles.metric}><span>Kolejność</span><strong>{PHASE_LABELS[analysis.phase]}</strong></div>
        <div className={styles.metric}><span>Znacznik</span><strong>{analysis.markerDegrees.toFixed(1)}° · Δ {analysis.markerDifferenceDegrees.toFixed(1)}°</strong></div>
        <div className={styles.metric}><span>Kąt z rysunku</span><strong>{analysis.secondRayDegrees.toFixed(1)}° · Δ {analysis.secondRayDifferenceDegrees.toFixed(1)}°</strong></div>
      </div>

      <div className={`${styles.interactiveOnly} ${styles.alternatives}`}>
        <InteractionAlternativePanel title="Ustaw bez przeciągania" instruction="Wpisz wartości lub użyj strzałek na uchwytach: 1 px / 1°, z Shift 5 px / 5°. Wszystkie wyniki aktualizują się od razu.">
          <label>Kierunek BA ° <input aria-label="Kierunek promienia bazowego" type="number" value={Math.round(analysis.baseDirectionDegrees * 10) / 10} disabled={interactionLocked || analysis.phase !== "base-ray"} onChange={(event) => { const value = finite(event.target.value); if (value !== null) setDirection("point-a", value, "Zmieniono kierunek BA."); }} /></label>
          <label>X środka <input aria-label="X środka kątomierza" type="number" value={Math.round(state.protractor.center.x)} disabled={interactionLocked || analysis.phase !== "measure-mark"} onChange={(event) => { const value = finite(event.target.value); if (value !== null) publish(moveDrawingProtractor(state, { ...state.protractor.center, x: value })); }} /></label>
          <label>Y środka <input aria-label="Y środka kątomierza" type="number" value={Math.round(state.protractor.center.y)} disabled={interactionLocked || analysis.phase !== "measure-mark"} onChange={(event) => { const value = finite(event.target.value); if (value !== null) publish(moveDrawingProtractor(state, { ...state.protractor.center, y: value })); }} /></label>
          <label>Obrót ° <input aria-label="Obrót kątomierza" type="number" value={Math.round(state.protractor.rotationDegrees * 10) / 10} disabled={interactionLocked || analysis.phase !== "measure-mark"} onChange={(event) => { const value = finite(event.target.value); if (value !== null) publish(rotateDrawingProtractor(state, value)); }} /></label>
          <label>Znacznik ° <input aria-label="Miara znacznika" type="number" min="0" max="180" value={Math.round(analysis.markerDegrees * 10) / 10} disabled={interactionLocked || analysis.phase !== "measure-mark"} onChange={(event) => { const value = finite(event.target.value, 0, 180); if (value !== null) { const direction = task.startSide === "right" ? task.baseDirectionDegrees - value : task.baseDirectionDegrees + value; setDirection("measure-mark", direction, "Zmieniono miarę znacznika."); } }} /></label>
          <label>Kierunek BC ° <input aria-label="Kierunek drugiego ramienia" type="number" value={Math.round(expectedSecondRayDirection(task) + (task.startSide === "right" ? analysis.secondRayDifferenceDegrees : -analysis.secondRayDifferenceDegrees))} disabled={interactionLocked || analysis.phase !== "second-ray"} onChange={(event) => { const value = finite(event.target.value); if (value !== null) setDirection("point-c", value, "Zmieniono kierunek BC."); }} /></label>
        </InteractionAlternativePanel>
      </div>

      {analysis.phase === "measure-mark" ? <fieldset className={`${styles.scaleChoice} ${styles.interactiveOnly}`}><legend>Skala kątomierza</legend><button type="button" aria-pressed={state.protractor.scale === "outer"} disabled={interactionLocked} onClick={() => publish(setDrawingProtractorScale(state, "outer"))}>skala zewnętrzna</button><button type="button" aria-pressed={state.protractor.scale === "inner"} disabled={interactionLocked} onClick={() => publish(setDrawingProtractorScale(state, "inner"))}>skala wewnętrzna</button></fieldset> : null}

      <div className={`${styles.steps} ${styles.interactiveOnly}`}>
        <button type="button" disabled={interactionLocked} onClick={approveBase}>1. Zatwierdź promień bazowy</button>
        <button type="button" disabled={interactionLocked} onClick={approveMark}>2. Zatwierdź znacznik miary</button>
        <button type="button" disabled={interactionLocked} onClick={approveSecondRay}>3. Zatwierdź drugie ramię</button>
      </div>

      {task.activity === "peer-check" && analysis.phase === "complete" ? <section className={`${styles.peer} ${styles.interactiveOnly}`} aria-label="Anonimowa kontrola koleżeńska"><h3>Anonimowy pomiar partnera</h3><p>Bez nazwiska: druga osoba mierzy gotową konstrukcję. Akceptowana różnica wynosi do 1°.</p><div className={styles.peerRow}><label>Odczyt partnera ° <input aria-label="Anonimowy odczyt partnera" type="number" min="0" max="180" value={peerReading} disabled={interactionLocked} onChange={(event) => { setPeerReading(event.target.value); setDiagnosticCode(null); }} /></label><strong data-peer-difference>Różnica: {peerDifference === null ? "—" : `${peerDifference.toFixed(1)}°`}</strong><button type="button" disabled={interactionLocked} onClick={checkPeer}>Sprawdź anonimowy pomiar</button></div></section> : null}

      <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? <div className={styles.interactiveOnly}>{mode === "assessment" ? assessmentSubmitted ? <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted assessmentEnded solution={diagnostic.solution} /> : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} /> : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />}</div> : null}
      <p className={styles.printOnly}>Konstrukcja: promień bazowy → znacznik {task.targetDegrees}° → drugie ramię. Zapisz kontrolę miary z dokładnością do 1°.</p>
    </section>
  );
}
