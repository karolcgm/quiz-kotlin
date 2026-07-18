"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import {
  commitGeometryHistory,
  createGeometryDiagnosticResult,
  createGeometryHistory,
  intersectGeometryObjects,
  pointById,
  redoGeometryHistory,
  resetGeometryHistory,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import {
  LINE_CONSTRUCTION_LESSON_SEEDS,
  LINE_CONSTRUCTION_TUTORIAL_SEEDS,
  analyzeLineConstruction,
  constructPerpendicularFromTrySquare,
  createLineConstructionGeometryState,
  getLineConstructionSeedConfig,
  lineConstructionAngle,
  lineConstructionCenter,
  lineDirectionChangeFromReference,
  moveTrySquare,
  rotateConstructionLine,
  rotateTrySquare,
  setConstructionLinePose,
  translateConstructionLine,
  trySquarePose,
} from "@/lib/math/geometry/lineConstructions";
import type {
  LineConstructionActivity,
  LineConstructionDifficulty,
} from "@/lib/math/geometry/lineConstructions";
import type {
  GeometryHistoryState,
  GeometryLabMode,
  GeometryLabState,
  GeometryObject,
  GeometryPointCoordinates,
} from "@/types/geometry";
import styles from "@/components/lessons/geometry/lineConstruction.module.css";

const MODE_LABELS: Record<GeometryLabMode, string> = {
  demo: "Pokaz",
  guided: "Praca prowadzona",
  practice: "Ćwiczenie",
  assessment: "Ocenianie",
};

const DIFFICULTY_LABELS: Record<LineConstructionDifficulty, string> = {
  support: "Zadanie 1 · ekierka",
  core: "Zadanie 2 · przesunięcie",
  challenge: "Zadanie 3 · układ prostych",
};

const ACTIVITY_COPY: Record<LineConstructionActivity, { title: string; instruction: string }> = {
  perpendicular: {
    title: "Prostopadła przez punkt P",
    instruction: "Ustaw jedną krawędź ekierki na prostej a, a drugą przez punkt P. Potem narysuj b.",
  },
  parallel: {
    title: "Równoległa przez punkt P",
    instruction: "Przesuń prostą b do punktu P. Jej kierunek pozostaje zablokowany; ślad pokazuje przesunięcie bez obrotu.",
  },
  network: {
    title: "Układ prostych spełniający warunki",
    instruction: "Ustaw b i c tak, aby jednocześnie zachodziły: a ∥ b, b ⟂ c oraz P ∈ c.",
  },
};

type ConstructionLineId = "line-b" | "line-c";
type DragKind = "tool-move" | "tool-rotate" | "line-move" | "line-rotate";

function pointFromPointer(event: PointerEvent<SVGElement>, state: GeometryLabState): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

function clampCenter(state: GeometryLabState, point: GeometryPointCoordinates): GeometryPointCoordinates {
  return {
    x: Math.max(145, Math.min(state.viewport.width - 145, point.x)),
    y: Math.max(125, Math.min(state.viewport.height - 125, point.y)),
  };
}

function lineDisplay(state: GeometryLabState, lineId: "line-a" | ConstructionLineId) {
  const object = state.objects.find((candidate) => candidate.id === lineId)!;
  const start = pointById(state.points, object.startPointId)!;
  const end = pointById(state.points, object.endPointId)!;
  const length = Math.hypot(end.x - start.x, end.y - start.y) || 1;
  const unit = { x: (end.x - start.x) / length, y: (end.y - start.y) / length };
  const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const reach = 900;
  return {
    object,
    start,
    end,
    center,
    unit,
    extendedStart: { x: center.x - unit.x * reach, y: center.y - unit.y * reach },
    extendedEnd: { x: center.x + unit.x * reach, y: center.y + unit.y * reach },
  };
}

function rightAnglePoint(state: GeometryLabState, firstId: "line-a" | "line-b", secondId: "line-b" | "line-c") {
  const first = state.objects.find((object) => object.id === firstId) as GeometryObject;
  const second = state.objects.find((object) => object.id === secondId) as GeometryObject;
  return intersectGeometryObjects(first, second, state.points, state.tolerance.absolute)?.point ?? null;
}

export interface LineConstructionGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

type ConstructionTutorialKind = keyof typeof LINE_CONSTRUCTION_TUTORIAL_SEEDS;

const TUTORIAL_STEPS: Record<ConstructionTutorialKind, readonly { label: string; instruction: string }[]> = {
  perpendicular: [
    { label: "Przyłóż ekierkę", instruction: "Jedną przyprostokątną ekierki przyłóż dokładnie do prostej a." },
    { label: "Ustaw przez punkt P", instruction: "Przesuń ekierkę wzdłuż prostej a, aż druga przyprostokątna przejdzie przez punkt P." },
    { label: "Narysuj prostą b", instruction: "Wzdłuż drugiej przyprostokątnej narysuj prostą b i zaznacz kąt prosty." },
  ],
  parallel: [
    { label: "Przyłóż ekierkę", instruction: "Jedną krawędź ekierki przyłóż dokładnie do prostej a." },
    { label: "Przyłóż linijkę", instruction: "Do drugiej krawędzi ekierki przyłóż linijkę i trzymaj ją nieruchomo." },
    { label: "Przesuń ekierkę", instruction: "Przesuń ekierkę wzdłuż linijki bez obracania, aż jej krawędź przejdzie przez punkt P." },
    { label: "Narysuj prostą b", instruction: "Wzdłuż tej samej krawędzi ekierki narysuj prostą b przechodzącą przez P." },
  ],
};

function TutorialTrySquare({ x, y, moved = false, opacity = 1 }: { x: number; y: number; moved?: boolean; opacity?: number }) {
  return (
    <g data-tutorial-try-square data-moved={moved || undefined} opacity={opacity}>
      <path d={`M ${x} ${y} L ${x + 300} ${y} L ${x} ${y - 158} Z`} fill="#fde68a" fillOpacity=".78" stroke="#92400e" strokeWidth="5" strokeLinejoin="round" />
      <path d={`M ${x + 52} ${y - 24} L ${x + 205} ${y - 24} L ${x + 52} ${y - 105} Z`} fill="#fff" fillOpacity=".8" stroke="#b45309" strokeWidth="3" />
      <path d={`M ${x} ${y - 24} A 24 24 0 0 1 ${x + 24} ${y}`} fill="none" stroke="#92400e" strokeWidth="4" />
      <circle cx={x + 8} cy={y - 8} r="4.5" fill="#92400e" />
      <text x={x + 132} y={y - 60} fill="#78350f" fontSize="20" fontWeight="900">EKIERKA</text>
    </g>
  );
}

function LineConstructionTutorial({
  kind,
  mode,
  highContrast,
}: {
  kind: ConstructionTutorialKind;
  mode: GeometryLabMode;
  highContrast: boolean;
}) {
  const steps = TUTORIAL_STEPS[kind];
  const [step, setStep] = useState(0);
  const perpendicular = kind === "perpendicular";
  const lineColor = highContrast ? "#000" : "#1e3a8a";

  return (
    <section
      className={`${styles.lab} ${styles.tutorialLab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-line-construction-lab
      data-construction-tutorial
      data-activity={kind}
      data-mode={mode}
    >
      <header className={styles.tutorialHeader}>
        <p className={styles.eyebrow}>Instrukcja krok po kroku</p>
        <h2 className={styles.title}>{perpendicular ? "Jak narysować prostą prostopadłą?" : "Jak narysować prostą równoległą?"}</h2>
        <p className={styles.description}>Obserwuj przyrządy. Konstrukcję wykonujemy linijką i ekierką na kartce.</p>
      </header>

      <nav className={styles.tutorialSteps} aria-label="Etapy konstrukcji">
        {steps.map((item, index) => (
          <button key={item.label} type="button" aria-pressed={step === index} onClick={() => setStep(index)}>
            <span>{index + 1}</span>{item.label}
          </button>
        ))}
      </nav>

      <div className={styles.tutorialCanvas}>
        <svg viewBox="0 0 720 370" role="img" aria-label={`${perpendicular ? "Rysowanie prostej prostopadłej" : "Rysowanie prostej równoległej"}, krok ${step + 1}`}>
          <rect width="720" height="370" rx="24" fill={highContrast ? "#fff" : "#f8fafc"} />
          <line x1="80" y1="285" x2="650" y2="285" stroke={lineColor} strokeWidth="5" strokeLinecap="round" />
          <text x="660" y="294" className={styles.tutorialLineLabel}>a</text>

          {perpendicular ? (
            <>
              <circle cx="360" cy="90" r="6" fill="#be123c" />
              <text x="375" y="84" className={styles.tutorialPointLabel}>P</text>
              <g opacity={step === 2 ? .38 : 1}>
                <path d="M 360 285 L 575 285 L 360 90 Z" fill="#fde68a" fillOpacity=".78" stroke="#92400e" strokeWidth="5" strokeLinejoin="round" />
                <path d="M 405 260 L 515 260 L 405 160 Z" fill="#fff" fillOpacity=".82" stroke="#b45309" strokeWidth="3" />
                <text x="430" y="230" fill="#78350f" fontSize="20" fontWeight="900">EKIERKA</text>
              </g>
              {step === 0 ? <line x1="360" y1="285" x2="575" y2="285" stroke="#dc2626" strokeWidth="8" data-highlighted-edge="a" /> : null}
              {step === 1 ? <line x1="360" y1="285" x2="360" y2="90" stroke="#dc2626" strokeWidth="8" data-highlighted-edge="P" /> : null}
              {step === 2 ? (
                <g data-finished-construction>
                  <line x1="360" y1="45" x2="360" y2="330" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
                  <text x="374" y="55" className={styles.tutorialLineLabel}>b</text>
                  <path d="M 360 250 A 35 35 0 0 1 325 285" fill="none" stroke="#be123c" strokeWidth="4" />
                  <circle cx="335" cy="260" r="5" fill="#be123c" />
                  <text x="505" y="75" className={styles.tutorialResult}>a ⟂ b</text>
                </g>
              ) : null}
            </>
          ) : (
            <>
              <circle cx="395" cy="175" r="6" fill="#be123c" />
              <text x="410" y="168" className={styles.tutorialPointLabel}>P</text>
              {step >= 1 ? (
                <g data-tutorial-ruler>
                  <rect x="172" y="52" width="36" height="292" rx="7" fill="#bfdbfe" fillOpacity=".85" stroke="#075985" strokeWidth="4" />
                  {Array.from({ length: 11 }, (_, index) => <line key={index} x1="174" y1={72 + index * 24} x2={index % 2 === 0 ? "194" : "187"} y2={72 + index * 24} stroke="#075985" strokeWidth="2" />)}
                  <text x="151" y="205" fill="#075985" fontSize="18" fontWeight="900" transform="rotate(-90 151 205)">LINIJKA — NIE RUSZAJ</text>
                </g>
              ) : null}
              {step <= 1 ? <TutorialTrySquare x={208} y={285} /> : null}
              {step === 2 ? (
                <>
                  <TutorialTrySquare x={208} y={285} opacity={.22} />
                  <TutorialTrySquare x={208} y={175} moved />
                  <line x1="540" y1="270" x2="540" y2="195" stroke="#0f766e" strokeWidth="5" markerEnd="url(#tutorial-arrow)" data-slide-arrow />
                  <text x="555" y="242" fill="#0f766e" fontSize="18" fontWeight="900">przesuń bez obracania</text>
                </>
              ) : null}
              {step === 3 ? (
                <g data-finished-construction>
                  <TutorialTrySquare x={208} y={175} opacity={.3} moved />
                  <line x1="80" y1="175" x2="650" y2="175" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
                  <text x="660" y="184" className={styles.tutorialLineLabel}>b</text>
                  <text x="505" y="75" className={styles.tutorialResult}>a ∥ b</text>
                </g>
              ) : null}
              <defs>
                <marker id="tutorial-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f766e" />
                </marker>
              </defs>
            </>
          )}
        </svg>
      </div>

      <p className={styles.tutorialInstruction}><strong>Krok {step + 1}.</strong> {steps[step].instruction}</p>

      <div className={styles.tutorialNavigation}>
        <button type="button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>← Poprzedni krok</button>
        <button type="button" disabled={step === steps.length - 1} onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}>Następny krok →</button>
      </div>
    </section>
  );
}

export function LineConstructionGeometryLab(props: LineConstructionGeometryLabProps) {
  if (props.seed === LINE_CONSTRUCTION_TUTORIAL_SEEDS.perpendicular) {
    return <LineConstructionTutorial kind="perpendicular" mode={props.mode ?? "practice"} highContrast={props.highContrast ?? false} />;
  }
  if (props.seed === LINE_CONSTRUCTION_TUTORIAL_SEEDS.parallel) {
    return <LineConstructionTutorial kind="parallel" mode={props.mode ?? "practice"} highContrast={props.highContrast ?? false} />;
  }
  return <InteractiveLineConstructionGeometryLab {...props} />;
}

function InteractiveLineConstructionGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: LineConstructionGeometryLabProps) {
  const seedConfig = getLineConstructionSeedConfig(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => (
    createGeometryHistory(createLineConstructionGeometryState(seed, mode))
  ));
  const state = history.present;
  const [difficulty, setDifficulty] = useState<LineConstructionDifficulty>(seedConfig.difficulty);
  const [selectedLine, setSelectedLine] = useState<ConstructionLineId>("line-b");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState("Model gotowy. Sprawdź warunki konstrukcji.");
  const analysis = useMemo(() => analyzeLineConstruction(state), [state]);
  const activity = analysis.activity;
  const copy = ACTIVITY_COPY[activity];
  const locked = readOnly || assessmentSubmitted || (mode === "assessment" && internalSubmitted);
  const activeLine = activity === "network" ? selectedLine : "line-b";
  const activeCenter = lineConstructionCenter(state, activeLine);
  const activeAngle = lineConstructionAngle(state, activeLine);
  const tool = trySquarePose(state);
  const [draft, setDraft] = useState(() => ({
    x: String(Math.round(activity === "perpendicular" ? tool.origin.x : activeCenter.x)),
    y: String(Math.round(activity === "perpendicular" ? tool.origin.y : activeCenter.y)),
    angle: String(Math.round(activity === "perpendicular" ? tool.angleDegrees : activeAngle)),
  }));
  const drag = useRef<{ kind: DragKind; lineId?: ConstructionLineId } | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const dragOffset = useRef<GeometryPointCoordinates>({ x: 0, y: 0 });

  const syncDraft = (next: GeometryLabState, nextLine = activeLine) => {
    if (getLineConstructionSeedConfig(Number(pointById(next.points, "seed-marker")?.x ?? seed)).activity === "perpendicular") {
      const nextTool = trySquarePose(next);
      setDraft({ x: String(Math.round(nextTool.origin.x)), y: String(Math.round(nextTool.origin.y)), angle: String(Math.round(nextTool.angleDegrees)) });
      return;
    }
    const center = lineConstructionCenter(next, nextLine);
    setDraft({ x: String(Math.round(center.x)), y: String(Math.round(center.y)), angle: String(Math.round(lineConstructionAngle(next, nextLine))) });
  };

  const publish = (next: GeometryLabState) => onStateChange?.(next);

  const commit = (next: GeometryLabState, message: string) => {
    const normalized = { ...next, mode };
    setHistory((current) => commitGeometryHistory(current, normalized));
    setHasInteracted(true);
    setInternalSubmitted(false);
    setAnnouncement(message);
    syncDraft(normalized);
    publish(normalized);
  };

  const changeHistory = (next: GeometryHistoryState, message: string) => {
    setHistory(next);
    setHasInteracted(true);
    setInternalSubmitted(false);
    setAnnouncement(message);
    syncDraft(next.present);
    publish(next.present);
  };

  const chooseDifficulty = (nextDifficulty: LineConstructionDifficulty) => {
    const next = createLineConstructionGeometryState(LINE_CONSTRUCTION_LESSON_SEEDS[nextDifficulty], mode);
    setDifficulty(nextDifficulty);
    setSelectedLine("line-b");
    setHasInteracted(false);
    setInternalSubmitted(false);
    setHistory(createGeometryHistory(next));
    setAnnouncement(`Poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Ustawiono deterministyczne dane.`);
    syncDraft(next, "line-b");
    publish(next);
  };

  const moveLineBy = (lineId: ConstructionLineId, dx: number, dy: number) => {
    if (locked) return;
    const next = translateConstructionLine(state, lineId, dx, dy);
    commit(next, `Przesunięto prostą ${lineId === "line-b" ? "b" : "c"}. Warunki zaktualizowano.`);
  };

  const rotateLineBy = (lineId: ConstructionLineId, delta: number) => {
    if (locked || activity === "parallel") return;
    const next = rotateConstructionLine(state, lineId, lineConstructionAngle(state, lineId) + delta);
    commit(next, `Obrócono prostą ${lineId === "line-b" ? "b" : "c"} do ${Math.round(lineConstructionAngle(next, lineId))}°.`);
  };

  const moveToolBy = (dx: number, dy: number) => {
    if (locked) return;
    const origin = trySquarePose(state).origin;
    const next = moveTrySquare(state, clampCenter(state, { x: origin.x + dx, y: origin.y + dy }));
    commit(next, "Przesunięto ekierkę. Warunki ustawienia zaktualizowano.");
  };

  const rotateToolBy = (delta: number) => {
    if (locked) return;
    const next = rotateTrySquare(state, trySquarePose(state).angleDegrees + delta);
    commit(next, `Obrócono ekierkę do ${Math.round(trySquarePose(next).angleDegrees)}°.`);
  };

  const handleMoveKey = (event: KeyboardEvent<SVGElement>, target: "tool" | ConstructionLineId) => {
    const step = event.shiftKey ? 5 : 1;
    const movement: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const offset = movement[event.key];
    if (!offset) return;
    event.preventDefault();
    if (target === "tool") moveToolBy(offset[0], offset[1]);
    else moveLineBy(target, offset[0], offset[1]);
  };

  const handleRotateKey = (event: KeyboardEvent<SVGElement>, target: "tool" | ConstructionLineId) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step;
    if (target === "tool") rotateToolBy(delta);
    else rotateLineBy(target, delta);
  };

  const startDrag = (
    kind: DragKind,
    event: PointerEvent<SVGElement>,
    lineId?: ConstructionLineId,
  ) => {
    if (locked) return;
    const point = pointFromPointer(event, state);
    if (!point) return;
    if (lineId) setSelectedLine(lineId);
    drag.current = { kind, lineId };
    dragStart.current = state;
    const center = kind.startsWith("tool") ? trySquarePose(state).origin : lineConstructionCenter(state, lineId ?? "line-b");
    dragOffset.current = { x: center.x - point.x, y: center.y - point.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startLineBMoveDrag = (event: PointerEvent<SVGElement>) => startDrag("line-move", event, "line-b");
  const startLineCMoveDrag = (event: PointerEvent<SVGElement>) => startDrag("line-move", event, "line-c");
  const startLineBRotateDrag = (event: PointerEvent<SVGElement>) => startDrag("line-rotate", event, "line-b");
  const startLineCRotateDrag = (event: PointerEvent<SVGElement>) => startDrag("line-rotate", event, "line-c");

  const continueDrag = (event: PointerEvent<SVGElement>) => {
    const active = drag.current;
    if (!active || locked) return;
    const point = pointFromPointer(event, state);
    if (!point) return;
    let next = state;
    if (active.kind === "tool-move") {
      next = moveTrySquare(state, clampCenter(state, { x: point.x + dragOffset.current.x, y: point.y + dragOffset.current.y }));
    } else if (active.kind === "tool-rotate") {
      const origin = trySquarePose(state).origin;
      next = rotateTrySquare(state, Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI);
    } else if (active.kind === "line-move") {
      const lineId = active.lineId ?? "line-b";
      const center = clampCenter(state, { x: point.x + dragOffset.current.x, y: point.y + dragOffset.current.y });
      next = setConstructionLinePose(state, lineId, center, lineConstructionAngle(state, lineId));
    } else if (activity !== "parallel") {
      const lineId = active.lineId ?? "line-b";
      const center = lineConstructionCenter(state, lineId);
      next = rotateConstructionLine(state, lineId, Math.atan2(point.y - center.y, point.x - center.x) * 180 / Math.PI);
    }
    setHistory((current) => ({ ...current, present: next, future: [] }));
    setHasInteracted(true);
    setInternalSubmitted(false);
    syncDraft(next, active.lineId ?? "line-b");
    publish(next);
    const nextAnalysis = analyzeLineConstruction(next);
    setAnnouncement(`${nextAnalysis.conditions.filter((condition) => condition.met).length} z ${nextAnalysis.conditions.length} warunków spełnionych.`);
  };

  const finishDrag = (event: PointerEvent<SVGElement>) => {
    if (!drag.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const start = dragStart.current;
    setHistory((current) => start ? {
      ...current,
      past: [...current.past, start].slice(-100),
      future: [],
    } : current);
    drag.current = null;
    dragStart.current = null;
  };

  const constructPerpendicular = () => {
    if (locked) return;
    const next = constructPerpendicularFromTrySquare(state);
    const nextAnalysis = analyzeLineConstruction(next);
    commit(next, nextAnalysis.complete
      ? "✓ Konstrukcja gotowa: a ⟂ b i P ∈ b."
      : "Narysowano b wzdłuż ekierki. Sprawdź niespełnione warunki.");
  };

  const checkConstruction = () => {
    setHasInteracted(true);
    if (analysis.complete) {
      setAnnouncement("✓ Wszystkie warunki konstrukcji są spełnione. Oznaczenia są gotowe.");
      if (mode === "assessment") setInternalSubmitted(true);
    } else {
      const firstMissing = analysis.conditions.find((condition) => !condition.met);
      setAnnouncement(`△ Do poprawy: ${firstMissing?.label ?? "sprawdź konstrukcję"}.`);
    }
  };

  const applyDraft = () => {
    const x = Number(draft.x);
    const y = Number(draft.y);
    const angle = Number(draft.angle);
    if (![x, y, angle].every(Number.isFinite)) {
      setHasInteracted(true);
      setAnnouncement("Uzupełnij środek x, środek y i kąt liczbami, a potem zatwierdź.");
      return;
    }
    if (activity === "perpendicular") {
      const moved = moveTrySquare(state, clampCenter(state, { x, y }));
      commit(rotateTrySquare(moved, angle), "Ustawiono ekierkę z pól liczbowych.");
      return;
    }
    const preservedAngle = activity === "parallel" ? lineConstructionAngle(state, "line-b") : angle;
    commit(
      setConstructionLinePose(state, activeLine, clampCenter(state, { x, y }), preservedAngle),
      activity === "parallel"
        ? "Przesunięto b bez zmiany kierunku."
        : `Ustawiono prostą ${activeLine === "line-b" ? "b" : "c"} z pól liczbowych.`,
    );
  };

  const selectLine = (lineId: ConstructionLineId) => {
    setSelectedLine(lineId);
    syncDraft(state, lineId);
    setAnnouncement(`Wybrano prostą ${lineId === "line-b" ? "b" : "c"}.`);
  };

  const diagnosticCode = hasInteracted ? analysis.errorCodes[0] : undefined;
  const diagnostic = diagnosticCode
    ? createGeometryDiagnosticResult(diagnosticCode, { memberIds: ["line-a", "line-b", ...(activity === "network" ? ["line-c"] : [])] })
    : null;
  const a = lineDisplay(state, "line-a");
  const b = lineDisplay(state, "line-b");
  const c = lineDisplay(state, "line-c");
  const target = pointById(state.points, "target-p")!;
  const traceOrigin = pointById(state.points, "trace-origin")!;
  const toolRadians = tool.angleDegrees * Math.PI / 180;
  const toolBaseUnit = { x: Math.cos(toolRadians), y: Math.sin(toolRadians) };
  const toolNormal = { x: -toolBaseUnit.y, y: toolBaseUnit.x };
  const toolBaseEnd = { x: tool.origin.x + toolBaseUnit.x * 150, y: tool.origin.y + toolBaseUnit.y * 150 };
  const toolPerpEnd = { x: tool.origin.x + toolNormal.x * 115, y: tool.origin.y + toolNormal.y * 115 };
  const toolHypotenuse = { x: tool.origin.x + toolBaseUnit.x * 120 + toolNormal.x * 75, y: tool.origin.y + toolBaseUnit.y * 120 + toolNormal.y * 75 };
  const rightAngle = activity === "network"
    ? rightAnglePoint(state, "line-b", "line-c")
    : rightAnglePoint(state, "line-a", "line-b");
  const rows = [
    { element: "Prosta a", value: `${lineConstructionAngle(state, "line-a").toFixed(1)}°`, condition: "wzorzec" },
    { element: "Prosta b", value: `${lineConstructionAngle(state, "line-b").toFixed(1)}°`, condition: `różnica a–b: ${analysis.angleAB.toFixed(1)}°` },
    ...(activity === "network" ? [{ element: "Prosta c", value: `${lineConstructionAngle(state, "line-c").toFixed(1)}°`, condition: `kąt b–c: ${analysis.angleBC.toFixed(1)}°` }] : []),
    ...analysis.conditions.map((condition) => ({ element: condition.symbol, value: condition.met ? "✓ spełniony" : "△ do poprawy", condition: condition.label })),
  ];

  return (
    <section
      className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`}
      data-geometry-lab
      data-line-construction-lab
      data-activity={activity}
      data-mode={mode}
      data-difficulty={difficulty}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>geometry-lab · L2 · {MODE_LABELS[mode]}</p>
          <h2 className={styles.title}>{copy.title}</h2>
          <p className={styles.description}>{copy.instruction}</p>
        </div>
        <span className={styles.scoreBadge} data-complete={analysis.complete}>
          {analysis.complete ? "✓ konstrukcja gotowa" : `${analysis.conditions.filter((condition) => condition.met).length}/${analysis.conditions.length} warunków`}
        </span>
      </header>

      <LessonTaskNavigator
        currentIndex={(["support", "core", "challenge"] as const).indexOf(difficulty)}
        taskCount={3}
        previousDisabled={locked || difficulty === "support"}
        nextDisabled={locked || difficulty === "challenge"}
        onPrevious={() => chooseDifficulty(difficulty === "challenge" ? "core" : "support")}
        onNext={() => chooseDifficulty(difficulty === "support" ? "core" : "challenge")}
        className={styles.interactiveOnly}
      />

      <div className={`${styles.history} ${styles.interactiveOnly}`}>
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono konfigurację początkową.")}>Reset</button>
        {activity === "perpendicular" ? <button type="button" disabled={locked} onClick={constructPerpendicular}>Narysuj b wzdłuż ekierki</button> : null}
        <button type="button" disabled={locked} onClick={checkConstruction}>Sprawdź konstrukcję</button>
      </div>

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={`${copy.title} — konstrukcja prostych a, b${activity === "network" ? " i c" : ""}`}
          description={`${analysis.conditions.filter((condition) => condition.met).length} z ${analysis.conditions.length} warunków jest spełnionych. ${analysis.conditions.map((condition) => `${condition.symbol}: ${condition.met ? "tak" : "nie"}`).join(". ")}.`}
          viewBox={`0 0 ${state.viewport.width} ${state.viewport.height}`}
          className={styles.svg}
          columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "condition", label: "Warunek" }]}
          rows={rows}
        >
          <defs>
            <pattern id="construction-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" />
            </pattern>
            <marker id="construction-trace-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f766e" />
            </marker>
          </defs>
          <rect width="720" height="460" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="720" height="460" fill="url(#construction-grid)" opacity={highContrast ? ".22" : ".75"} />

          {activity === "parallel" ? (
            <g data-parallel-translation-trace>
              <line x1={traceOrigin.x - a.unit.x * 150} y1={traceOrigin.y - a.unit.y * 150} x2={traceOrigin.x + a.unit.x * 150} y2={traceOrigin.y + a.unit.y * 150} stroke="#0f766e" strokeWidth="5" strokeDasharray="8 8" opacity=".42" />
              <line x1={traceOrigin.x} y1={traceOrigin.y} x2={b.center.x} y2={b.center.y} stroke="#0f766e" strokeWidth="4" strokeDasharray="7 6" markerEnd="url(#construction-trace-arrow)" />
              <text x={(traceOrigin.x + b.center.x) / 2 + 8} y={(traceOrigin.y + b.center.y) / 2 - 8} fill="#115e59" fontSize="15" fontWeight="900">↕ bez ↻ · Δkierunku {lineDirectionChangeFromReference(state).toFixed(1)}°</text>
            </g>
          ) : null}

          <line x1={a.extendedStart.x} y1={a.extendedStart.y} x2={a.extendedEnd.x} y2={a.extendedEnd.y} stroke={highContrast ? "#000" : "#075985"} strokeWidth="11" strokeLinecap="round" data-construction-line="a" />
          <line x1={b.extendedStart.x} y1={b.extendedStart.y} x2={b.extendedEnd.x} y2={b.extendedEnd.y} stroke={highContrast ? "#444" : "#7c3aed"} strokeWidth="8" strokeDasharray="18 8" strokeLinecap="round" data-construction-line="b" />
          {activity === "network" ? <line x1={c.extendedStart.x} y1={c.extendedStart.y} x2={c.extendedEnd.x} y2={c.extendedEnd.y} stroke={highContrast ? "#777" : "#c2410c"} strokeWidth="7" strokeDasharray="5 7" strokeLinecap="round" data-construction-line="c" /> : null}
          <text x={a.end.x + 12} y={a.end.y - 10} fill="#075985" fontSize="22" fontWeight="900">• a</text>
          <text x={b.end.x + 12} y={b.end.y - 10} fill="#6d28d9" fontSize="22" fontWeight="900">◆ b</text>
          {activity === "network" ? <text x={c.end.x + 12} y={c.end.y - 10} fill="#9a3412" fontSize="22" fontWeight="900">▲ c</text> : null}

          {analysis.conditions.some((condition) => condition.id.includes("parallel") && condition.met) ? (
            <g fill="#0f766e" fontSize="23" fontWeight="900" data-parallel-markers>
              <text x={a.center.x} y={a.center.y - 16} textAnchor="middle">≫ ∥</text>
              <text x={b.center.x} y={b.center.y - 16} textAnchor="middle">≫ ∥</text>
            </g>
          ) : null}
          {rightAngle && analysis.conditions.some((condition) => condition.symbol.includes("⟂") && condition.met) ? (
            <text x={rightAngle.x + 14} y={rightAngle.y - 14} fill="#5b21b6" fontSize="30" fontWeight="900" data-right-angle-marker>□</text>
          ) : null}

          <circle cx={target.x} cy={target.y} r="10" fill="#fff" stroke="#be123c" strokeWidth="5" data-target-point="P" />
          <text x={target.x + 18} y={target.y - 14} fill="#9f1239" fontSize="23" fontWeight="900">P</text>

          {activity === "perpendicular" ? (
            <g data-screen-try-square>
              <polygon points={`${tool.origin.x},${tool.origin.y} ${toolBaseEnd.x},${toolBaseEnd.y} ${toolHypotenuse.x},${toolHypotenuse.y} ${toolPerpEnd.x},${toolPerpEnd.y}`} fill={highContrast ? "#fff" : "#fef3c7"} fillOpacity=".72" stroke="#92400e" strokeWidth="5" />
              <path d={`M ${tool.origin.x} ${tool.origin.y} l ${toolBaseUnit.x * 18} ${toolBaseUnit.y * 18} l ${toolNormal.x * 18} ${toolNormal.y * 18} l ${-toolBaseUnit.x * 18} ${-toolBaseUnit.y * 18}`} fill="none" stroke="#92400e" strokeWidth="4" data-try-square-right-angle />
              {!locked ? (
                <>
                  <circle cx={tool.origin.x} cy={tool.origin.y} r="26" fill="transparent" stroke="#0ea5e9" strokeWidth="4" role="button" tabIndex={0} aria-label={`Przesuń ekierkę. Q x ${Math.round(tool.origin.x)}, y ${Math.round(tool.origin.y)}`} data-tool-move-handle onKeyDown={(event) => handleMoveKey(event, "tool")} onPointerDown={(event) => startDrag("tool-move", event)} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "grab", touchAction: "none" }} />
                  <circle cx={toolBaseEnd.x} cy={toolBaseEnd.y} r="26" fill="transparent" stroke="#f59e0b" strokeWidth="4" role="slider" tabIndex={0} aria-label="Obrót ekierki" aria-valuemin={0} aria-valuemax={179} aria-valuenow={Math.round(tool.angleDegrees)} data-tool-rotation-handle onKeyDown={(event) => handleRotateKey(event, "tool")} onPointerDown={(event) => startDrag("tool-rotate", event)} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "crosshair", touchAction: "none" }} />
                </>
              ) : null}
            </g>
          ) : null}

          {!locked && activity !== "perpendicular" ? (["line-b", ...(activity === "network" ? ["line-c"] : [])] as ConstructionLineId[]).map((lineId) => {
            const line = lineId === "line-b" ? b : c;
            return (
              <g key={`${lineId}-handles`} data-active-line={lineId}>
                <line x1={line.extendedStart.x} y1={line.extendedStart.y} x2={line.extendedEnd.x} y2={line.extendedEnd.y} stroke="transparent" strokeWidth="52" role="button" tabIndex={0} aria-label={`Przesuń prostą ${lineId === "line-b" ? "b" : "c"}`} data-line-translation-handle={lineId} onFocus={() => selectLine(lineId)} onKeyDown={(event) => handleMoveKey(event, lineId)} onPointerDown={lineId === "line-b" ? startLineBMoveDrag : startLineCMoveDrag} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "grab", touchAction: "none" }} />
                {activity === "network" ? <circle cx={line.end.x} cy={line.end.y} r="26" fill="transparent" stroke="#f59e0b" strokeWidth="4" role="slider" tabIndex={0} aria-label={`Obrót prostej ${lineId === "line-b" ? "b" : "c"}`} aria-valuemin={0} aria-valuemax={179} aria-valuenow={Math.round(lineConstructionAngle(state, lineId))} data-line-rotation-handle={lineId} onFocus={() => selectLine(lineId)} onKeyDown={(event) => handleRotateKey(event, lineId)} onPointerDown={lineId === "line-b" ? startLineBRotateDrag : startLineCRotateDrag} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "crosshair", touchAction: "none" }} /> : null}
              </g>
            );
          }) : null}
        </AccessibleMathSvg>
      </div>

      <ul className={styles.conditions} aria-label="Warunki konstrukcji">
        {analysis.conditions.map((condition) => (
          <li key={condition.id} data-condition-met={condition.met}>
            <span aria-hidden>{condition.met ? "✓" : "△"}</span>
            <strong>{condition.symbol}</strong>
            <span>{condition.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.interactiveOnly}>
        <InteractionAlternativePanel
          title={activity === "perpendicular" ? "Ustaw ekierkę bez przeciągania" : "Ustaw prostą bez przeciągania"}
          instruction="Strzałki przesuwają o 1 px, Shift + strzałka o 5 px. Obrót zmienia się o 1° lub 5°; w zadaniu równoległym kąt jest celowo zablokowany."
        >
          {activity === "network" ? <label>Prosta <select value={selectedLine} disabled={locked} onChange={(event) => selectLine(event.target.value as ConstructionLineId)}><option value="line-b">b</option><option value="line-c">c</option></select></label> : null}
          <label>Środek x <input type="number" inputMode="numeric" value={draft.x} disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, x: event.target.value }))} /></label>
          <label>Środek y <input type="number" inputMode="numeric" value={draft.y} disabled={locked} onChange={(event) => setDraft((current) => ({ ...current, y: event.target.value }))} /></label>
          <label>Kąt ° <input type="number" inputMode="numeric" min="0" max="179" value={draft.angle} disabled={locked || activity === "parallel"} aria-readonly={activity === "parallel"} onChange={(event) => setDraft((current) => ({ ...current, angle: event.target.value }))} /></label>
          <button type="button" disabled={locked} onClick={applyDraft}>Zastosuj ustawienie</button>
          <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? moveToolBy(-1, 0) : moveLineBy(activeLine, -1, 0)}>← 1</button>
          <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? moveToolBy(1, 0) : moveLineBy(activeLine, 1, 0)}>1 →</button>
          <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? moveToolBy(0, -1) : moveLineBy(activeLine, 0, -1)}>↑ 1</button>
          <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? moveToolBy(0, 1) : moveLineBy(activeLine, 0, 1)}>1 ↓</button>
          {activity !== "parallel" ? <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? rotateToolBy(-1) : rotateLineBy(activeLine, -1)}>−1°</button> : null}
          {activity !== "parallel" ? <button type="button" disabled={locked} onClick={() => activity === "perpendicular" ? rotateToolBy(1) : rotateLineBy(activeLine, 1)}>+1°</button> : null}
        </InteractionAlternativePanel>
      </div>

      <p className={styles.feedback} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? (
        <div className={styles.interactiveOnly}>
          {mode === "assessment" ? (
            internalSubmitted || assessmentSubmitted
              ? <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted solution={diagnostic.solution} />
              : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
          ) : <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />}
        </div>
      ) : null}

      <p className={styles.printOnly}>Na wydruku wykonaj tę samą konstrukcję linijką i ekierką. Zachowaj linie pomocnicze, oznacz ∥ jednakowymi grotami, ⟂ kwadratem i podpisz proste a, b, c.</p>
    </section>
  );
}
