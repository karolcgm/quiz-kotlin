"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { GeometryPrintModel } from "@/components/lessons/geometry/GeometryPrintModel";
import { AngleTypesGeometryLab } from "@/components/lessons/geometry/AngleTypesGeometryLab";
import { AngleRecognitionGeometryLab } from "@/components/lessons/geometry/AngleRecognitionGeometryLab";
import { AngleMeasurementGeometryLab } from "@/components/lessons/geometry/AngleMeasurementGeometryLab";
import { AngleDrawingGeometryLab } from "@/components/lessons/geometry/AngleDrawingGeometryLab";
import { LineConstructionGeometryLab } from "@/components/lessons/geometry/LineConstructionGeometryLab";
import { LineFoundationsGeometryLab } from "@/components/lessons/geometry/LineFoundationsGeometryLab";
import { LineRelationsGeometryLab } from "@/components/lessons/geometry/LineRelationsGeometryLab";
import { VerticalAnglesGeometryLab } from "@/components/lessons/geometry/VerticalAnglesGeometryLab";
import { PolygonBuilderGeometryLab } from "@/components/lessons/geometry/PolygonBuilderGeometryLab";
import { TriangleTypesGeometryLab } from "@/components/lessons/geometry/TriangleTypesGeometryLab";
import { TriangleConstructionGeometryLab } from "@/components/lessons/geometry/TriangleConstructionGeometryLab";
import { TriangleAngleSumGeometryLab } from "@/components/lessons/geometry/TriangleAngleSumGeometryLab";
import { PlaneFiguresTheoryGeometryLab } from "@/components/lessons/geometry/PlaneFiguresTheoryGeometryLab";
import { GeometryScene } from "@/components/lessons/geometry/GeometryScene";
import {
  analyzeGeometryPolygon,
  commitGeometryHistory,
  createDefaultGeometryState,
  createGeometryDiagnosticResult,
  createGeometryHistory,
  createGeometryPrintSnapshot,
  geometryConstraintViolations,
  moveGeometryPoint,
  pointById,
  redoGeometryHistory,
  resetGeometryHistory,
  resizeGeometryPolygon,
  serializeGeometryState,
  squaredDistance,
  triangleSideLengthsAreValid,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import { isLineRelationLessonSeed } from "@/lib/math/geometry/lineRelations";
import { isLineConstructionLessonSeed } from "@/lib/math/geometry/lineConstructions";
import { getLineFoundationsActivity, isLineFoundationsLessonSeed } from "@/lib/math/geometry/lineFoundations";
import { isAngleTypesLessonSeed } from "@/lib/math/geometry/angleTypes";
import { getAngleRecognitionActivity, isAngleRecognitionSeed } from "@/lib/math/geometry/angleRecognition";
import { isAngleMeasurementLessonSeed } from "@/lib/math/geometry/angleMeasurement";
import { isAngleDrawingLessonSeed } from "@/lib/math/geometry/angleDrawing";
import { getVerticalAnglesSeedConfig, isVerticalAnglesLessonSeed } from "@/lib/math/geometry/verticalAngles";
import { getPolygonSeedConfig, isPolygonLessonSeed } from "@/lib/math/geometry/polygons";
import { createPublicTriangleTypesTask, getTriangleTypesSeedConfig, isTriangleTypesLessonSeed } from "@/lib/math/geometry/triangleTypes";
import { isTriangleConstructionLessonSeed } from "@/lib/math/geometry/triangleConstruction";
import { isTriangleAngleSumLessonSeed } from "@/lib/math/geometry/triangleAngleSum";
import { isPlaneFiguresTheorySeed } from "@/lib/math/geometry/planeFiguresTheory";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type {
  GeometryFeedbackCode,
  GeometryHistoryState,
  GeometryLabMode,
  GeometryLabState,
  GeometryPointCoordinates,
  GeometryPrintSnapshot,
} from "@/types/geometry";
import styles from "@/components/lessons/geometry/geometry.module.css";

const MODE_LABELS: Record<GeometryLabMode, string> = {
  demo: "Pokaz",
  guided: "Praca prowadzona",
  practice: "Ćwiczenie",
  assessment: "Ocenianie",
};

export interface GeometryLabProps {
  seed?: number;
  initialState?: GeometryLabState;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  title?: string;
  description?: string;
  expectedPointId?: string;
  expectedProtractorScale?: "inner" | "outer";
  triangleSideLengths?: readonly [number, number, number];
  classificationEvidence?: "not-required" | "provided" | "missing";
  diagnosticCode?: GeometryFeedbackCode;
  assessmentSubmitted?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onStateChange?: (state: GeometryLabState) => void;
  onPrintExport?: (snapshot: GeometryPrintSnapshot) => void;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

function pointFromPointer(
  event: PointerEvent<SVGCircleElement>,
  state: GeometryLabState,
): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

function diagnosticMembers(code: GeometryFeedbackCode, state: GeometryLabState): string[] {
  const analysis = analyzeGeometryPolygon(state);
  if (code === GEOMETRY_FEEDBACK_CODES.degenerate) {
    return analysis.duplicatePointIds.length > 0 ? analysis.duplicatePointIds : state.polygon.vertexIds;
  }
  if (code === GEOMETRY_FEEDBACK_CODES.selfIntersection) {
    return analysis.intersections.flatMap((intersection) => [intersection.firstObjectId, intersection.secondObjectId]);
  }
  if (code === GEOMETRY_FEEDBACK_CODES.angleCenterMisaligned || code === GEOMETRY_FEEDBACK_CODES.angleWrongScale) {
    const angle = state.angles[0];
    return angle ? [angle.vertexPointId, "protractor-center"] : ["protractor-center"];
  }
  return state.polygon.vertexIds;
}

function PolygonGeometryLab({
  seed = 1,
  initialState,
  mode,
  readOnly = false,
  highContrast = false,
  title = "Laboratorium geometrii",
  description,
  expectedPointId,
  expectedProtractorScale,
  triangleSideLengths,
  classificationEvidence = "not-required",
  diagnosticCode,
  assessmentSubmitted = false,
  onStateChange,
  onPrintExport,
}: GeometryLabProps) {
  const [history, setHistory] = useState<GeometryHistoryState>(() => {
    const base = initialState ?? createDefaultGeometryState({ seed, mode });
    return createGeometryHistory(mode ? { ...base, mode } : base);
  });
  const state = history.present;
  const activeMode = mode ?? state.mode;
  const interactionLocked = readOnly || (activeMode === "assessment" && assessmentSubmitted);
  const [activeInteractionCode, setActiveInteractionCode] = useState<GeometryFeedbackCode | null>(null);
  const [announcement, setAnnouncement] = useState("Model gotowy.");
  const selected = pointById(state.points, state.selectedPointId ?? "");
  const [coordinateDraft, setCoordinateDraft] = useState(() => ({
    x: String(selected?.x ?? ""),
    y: String(selected?.y ?? ""),
  }));
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printSnapshot, setPrintSnapshot] = useState<GeometryPrintSnapshot | null>(null);
  const dragPointRef = useRef<string | null>(null);
  const dragStartRef = useRef<GeometryLabState | null>(null);
  const analysis = useMemo(() => analyzeGeometryPolygon(state), [state]);

  const automaticDiagnosticCode = useMemo<GeometryFeedbackCode | null>(() => {
    if (diagnosticCode) return diagnosticCode;
    if (activeInteractionCode) return activeInteractionCode;
    if (analysis.errorCodes[0]) return analysis.errorCodes[0];
    const constraintCode = geometryConstraintViolations(state)[0];
    if (constraintCode) return constraintCode;
    const firstAngle = state.angles[0];
    if (state.protractor.visible && firstAngle) {
      const vertex = pointById(state.points, firstAngle.vertexPointId);
      if (vertex && squaredDistance(vertex, state.protractor.center) > state.tolerance.length ** 2) {
        return GEOMETRY_FEEDBACK_CODES.angleCenterMisaligned;
      }
    }
    if (expectedProtractorScale && state.protractor.scale !== expectedProtractorScale) {
      return GEOMETRY_FEEDBACK_CODES.angleWrongScale;
    }
    if (triangleSideLengths && !triangleSideLengthsAreValid(triangleSideLengths)) {
      return GEOMETRY_FEEDBACK_CODES.triangleInequality;
    }
    if (classificationEvidence === "missing") {
      return GEOMETRY_FEEDBACK_CODES.classificationEvidence;
    }
    return null;
  }, [activeInteractionCode, analysis.errorCodes, classificationEvidence, diagnosticCode, expectedProtractorScale, state, triangleSideLengths]);
  const diagnostic = automaticDiagnosticCode
    ? createGeometryDiagnosticResult(automaticDiagnosticCode, {
        memberIds: diagnosticMembers(automaticDiagnosticCode, state),
      })
    : null;

  const publish = (next: GeometryLabState) => {
    onStateChange?.(next);
    const nextSelected = pointById(next.points, next.selectedPointId ?? "");
    if (nextSelected) setCoordinateDraft({ x: String(nextSelected.x), y: String(nextSelected.y) });
  };

  const commit = (next: GeometryLabState, message?: string) => {
    setHistory((current) => commitGeometryHistory(current, { ...next, mode: activeMode }));
    publish({ ...next, mode: activeMode });
    if (message) setAnnouncement(message);
  };

  const selectPoint = (pointId: string) => {
    const point = pointById(state.points, pointId);
    if (!point) return;
    const next = { ...state, selectedPointId: pointId };
    setHistory((current) => ({ ...current, present: next }));
    setCoordinateDraft({ x: String(point.x), y: String(point.y) });
    setAnnouncement(`Wybrano wierzchołek ${point.label}.`);
  };

  const canMovePoint = (pointId: string): boolean => {
    if (interactionLocked) return false;
    if (expectedPointId && pointId !== expectedPointId) {
      setActiveInteractionCode(GEOMETRY_FEEDBACK_CODES.wrongVertex);
      const expected = pointById(state.points, expectedPointId);
      setAnnouncement(`Stan zachowany. Wybierz wierzchołek ${expected?.label ?? expectedPointId}.`);
      return false;
    }
    setActiveInteractionCode(null);
    return true;
  };

  const moveAndCommit = (pointId: string, coordinates: GeometryPointCoordinates, message: string) => {
    if (!canMovePoint(pointId)) return;
    commit(moveGeometryPoint(state, pointId, coordinates), message);
  };

  const handlePointerDown = (pointId: string, event: PointerEvent<SVGCircleElement>) => {
    if (!canMovePoint(pointId)) return;
    selectPoint(pointId);
    dragPointRef.current = pointId;
    dragStartRef.current = history.present;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (pointId: string, event: PointerEvent<SVGCircleElement>) => {
    if (dragPointRef.current !== pointId || interactionLocked) return;
    const coordinates = pointFromPointer(event, state);
    if (!coordinates) return;
    const next = moveGeometryPoint(state, pointId, coordinates);
    setHistory((current) => ({ ...current, present: next, future: [] }));
    publish(next);
    setAnnouncement(`Przesunięto ${pointById(next.points, pointId)?.label ?? pointId}: x ${pointById(next.points, pointId)?.x}, y ${pointById(next.points, pointId)?.y}.`);
  };

  const handlePointerUp = (pointId: string, event: PointerEvent<SVGCircleElement>) => {
    if (dragPointRef.current !== pointId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    const dragStart = dragStartRef.current;
    setHistory((current) => {
      if (!dragStart || serializeGeometryState(dragStart) === serializeGeometryState(current.present)) return current;
      return {
        ...current,
        past: [...current.past, dragStart].slice(-100),
        future: [],
      };
    });
    dragPointRef.current = null;
    dragStartRef.current = null;
  };

  const moveBy = (pointId: string, dx: number, dy: number) => {
    const point = pointById(state.points, pointId);
    if (!point) return;
    moveAndCommit(pointId, { x: point.x + dx, y: point.y + dy }, `Przesunięto ${point.label}.`);
  };

  const handlePointKeyDown = (pointId: string, event: KeyboardEvent<SVGCircleElement>) => {
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const baseStep = state.grid.snap ? state.grid.step : 1;
    const step = event.shiftKey ? baseStep * 5 : baseStep;
    moveBy(pointId, direction[0] * step, direction[1] * step);
  };

  const changeHistory = (next: GeometryHistoryState, message: string) => {
    setHistory(next);
    publish(next.present);
    setAnnouncement(message);
  };

  const exportPrint = () => {
    const snapshot = createGeometryPrintSnapshot({ ...state, mode: activeMode }, { title, description });
    setPrintSnapshot(snapshot);
    setShowPrintPreview(true);
    onPrintExport?.(snapshot);
    setAnnouncement("Przygotowano wersję drukową bez interaktywnych uchwytów.");
  };

  const textRows = [
    ...state.polygon.vertexIds.map((pointId) => {
      const point = pointById(state.points, pointId);
      return { element: `Punkt ${point?.label ?? "?"}`, value: `x=${point?.x ?? "—"}, y=${point?.y ?? "—"}`, property: point?.id === state.selectedPointId ? "wybrany" : "wierzchołek" };
    }),
    ...analysis.sideLengths.map((length, index) => ({
      element: `Bok ${index + 1}`,
      value: length.exact,
      property: `kwadrat długości ${length.squared}`,
    })),
    ...analysis.angleDegrees.map((angle, index) => ({
      element: `Kąt ${index + 1}`,
      value: Number.isFinite(angle) ? `${angle.toFixed(3)}°` : "—",
      property: "miara z dokładnych współrzędnych",
    })),
    { element: "Klasyfikacja", value: analysis.primaryClassification, property: analysis.status },
  ];
  const selectedStep = state.grid.snap ? state.grid.step : 1;

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-geometry-lab data-mode={activeMode}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Wspólny model SVG · {MODE_LABELS[activeMode]}</p>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description ?? "Przesuwaj punkty. Długości, kąty, przecięcia i klasyfikacja aktualizują się z bieżących współrzędnych."}</p>
        </div>
        <span className={styles.statusBadge} data-analysis-status={analysis.status}>{analysis.status === "valid" ? `✓ ${analysis.primaryClassification}` : "△ figura niepoprawna"}</span>
      </header>

      <div className={`${styles.toolbar} ${styles.interactiveOnly}`} aria-label="Narzędzia laboratorium">
        <label>Siatka co <input type="number" min="5" max="80" step="5" value={state.grid.step} disabled={interactionLocked} onChange={(event) => {
          const step = Number(event.target.value);
          if (Number.isFinite(step) && step >= 5 && step <= 80) commit({ ...state, grid: { ...state.grid, step } }, `Krok siatki: ${step}.`);
        }} /> jednostek</label>
        <label><input type="checkbox" checked={state.grid.visible} disabled={interactionLocked} onChange={(event) => commit({ ...state, grid: { ...state.grid, visible: event.target.checked } })} /> Pokaż siatkę</label>
        <label><input type="checkbox" checked={state.grid.snap} disabled={interactionLocked} onChange={(event) => commit({ ...state, grid: { ...state.grid, snap: event.target.checked } }, event.target.checked ? "Włączono przyciąganie." : "Wyłączono przyciąganie.")} /> Przyciągaj</label>
        <label>Powiększenie <select value={state.viewport.scale} disabled={interactionLocked} onChange={(event) => commit({ ...state, viewport: { ...state.viewport, scale: Number(event.target.value) } })}><option value="0.75">75%</option><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option><option value="2">200%</option></select></label>
        <label><input type="checkbox" checked={state.protractor.visible} disabled={interactionLocked} onChange={(event) => commit({ ...state, protractor: { ...state.protractor, visible: event.target.checked } })} /> Kątomierz</label>
        {state.protractor.visible ? <label>Skala <select value={state.protractor.scale} disabled={interactionLocked} onChange={(event) => commit({ ...state, protractor: { ...state.protractor, scale: event.target.value as "inner" | "outer" } })}><option value="inner">wewnętrzna</option><option value="outer">zewnętrzna</option></select></label> : null}
        {state.protractor.visible ? <label>Środek x <input aria-label="Środek kątomierza x" type="number" value={state.protractor.center.x} disabled={interactionLocked} onChange={(event) => { const x = Number(event.target.value); if (Number.isFinite(x)) commit({ ...state, protractor: { ...state.protractor, center: { ...state.protractor.center, x } } }); }} /></label> : null}
        {state.protractor.visible ? <label>Środek y <input aria-label="Środek kątomierza y" type="number" value={state.protractor.center.y} disabled={interactionLocked} onChange={(event) => { const y = Number(event.target.value); if (Number.isFinite(y)) commit({ ...state, protractor: { ...state.protractor, center: { ...state.protractor.center, y } } }); }} /></label> : null}
        {state.protractor.visible ? <label>Obrót ° <input aria-label="Obrót kątomierza" type="number" min="-360" max="360" value={state.protractor.rotationDegrees} disabled={interactionLocked} onChange={(event) => { const rotationDegrees = Number(event.target.value); if (Number.isFinite(rotationDegrees)) commit({ ...state, protractor: { ...state.protractor, rotationDegrees } }); }} /></label> : null}
      </div>

      <div className={`${styles.historyBar} ${styles.interactiveOnly}`}>
        <button type="button" disabled={interactionLocked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto ostatnią zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={interactionLocked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={interactionLocked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono stan początkowy.")}>Reset</button>
        <span aria-hidden>·</span>
        <button type="button" disabled={interactionLocked || state.polygon.vertexIds.length <= 3} onClick={() => commit(resizeGeometryPolygon(state, state.polygon.vertexIds.length - 1), "Usunięto wierzchołek.")}>− wierzchołek</button>
        <strong>{state.polygon.vertexIds.length} wierzchołki</strong>
        <button type="button" disabled={interactionLocked || state.polygon.vertexIds.length >= 8} onClick={() => commit(resizeGeometryPolygon(state, state.polygon.vertexIds.length + 1), "Dodano wierzchołek.")}>+ wierzchołek</button>
        <button type="button" onClick={exportPrint}>Przygotuj wydruk</button>
      </div>

      <div className={styles.canvasScroller}>
        <div className={styles.scaledCanvas} style={{ width: `${state.viewport.scale * 100}%` }}>
          <AccessibleMathSvg
            title={title}
            description={`${description ?? "Interaktywny model geometryczny"} Aktualnie: ${analysis.primaryClassification}. ${analysis.vertexCount} wierzchołki.`}
            viewBox={`0 0 ${state.viewport.width} ${state.viewport.height}`}
            className={styles.svg}
            columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Własność" }]}
            rows={textRows}
          >
            <GeometryScene
              state={state}
              showHandles={!interactionLocked}
              highContrast={highContrast}
              onPointSelect={selectPoint}
              onPointPointerDown={handlePointerDown}
              onPointPointerMove={handlePointerMove}
              onPointPointerUp={handlePointerUp}
              onPointKeyDown={handlePointKeyDown}
            />
          </AccessibleMathSvg>
        </div>
      </div>

      <div className={styles.interactiveOnly}>
        <InteractionAlternativePanel
          title="Umieść wierzchołek bez przeciągania"
          instruction="Wybierz wierzchołek, użyj strzałek albo wpisz współrzędne i zatwierdź. Shift + strzałka na uchwycie wykonuje większy krok."
        >
          <label>Wierzchołek <select value={state.selectedPointId ?? ""} disabled={interactionLocked} onChange={(event) => selectPoint(event.target.value)}>{state.polygon.vertexIds.map((pointId) => { const point = pointById(state.points, pointId); return <option key={pointId} value={pointId}>{point?.label ?? pointId}</option>; })}</select></label>
          <div className={styles.arrowPad} aria-label="Strzałki przesuwania">
            <button type="button" aria-label="Przesuń w górę" disabled={interactionLocked || !selected} onClick={() => selected && moveBy(selected.id, 0, -selectedStep)}>↑</button>
            <button type="button" aria-label="Przesuń w lewo" disabled={interactionLocked || !selected} onClick={() => selected && moveBy(selected.id, -selectedStep, 0)}>←</button>
            <button type="button" aria-label="Przesuń w dół" disabled={interactionLocked || !selected} onClick={() => selected && moveBy(selected.id, 0, selectedStep)}>↓</button>
            <button type="button" aria-label="Przesuń w prawo" disabled={interactionLocked || !selected} onClick={() => selected && moveBy(selected.id, selectedStep, 0)}>→</button>
          </div>
          <label>x <input type="number" inputMode="decimal" value={coordinateDraft.x} disabled={interactionLocked || !selected} onChange={(event) => setCoordinateDraft((current) => ({ ...current, x: event.target.value }))} /></label>
          <label>y <input type="number" inputMode="decimal" value={coordinateDraft.y} disabled={interactionLocked || !selected} onChange={(event) => setCoordinateDraft((current) => ({ ...current, y: event.target.value }))} /></label>
          <button type="button" disabled={interactionLocked || !selected} onClick={() => {
            if (!selected) return;
            const x = Number(coordinateDraft.x);
            const y = Number(coordinateDraft.y);
            if (!Number.isFinite(x) || !Number.isFinite(y)) {
              setAnnouncement("Uzupełnij obie współrzędne liczbami.");
              return;
            }
            moveAndCommit(selected.id, { x, y }, `Umieszczono ${selected.label}: x ${x}, y ${y}.`);
          }}>Umieść</button>
        </InteractionAlternativePanel>
      </div>

      <p className={styles.liveRegion} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>

      {diagnostic ? (
        <div className={styles.interactiveOnly}>
          {activeMode === "assessment" ? (
            assessmentSubmitted ? (
              <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted solution={diagnostic.solution} />
            ) : (
              <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="assessment" submitted={false} />
            )
          ) : (
            <DiagnosticFeedbackPanel result={diagnostic.result} copy={diagnostic.copy} highlights={diagnostic.highlights} mode="practice" submitted solution={diagnostic.solution} />
          )}
        </div>
      ) : null}

      <div className={showPrintPreview ? styles.printPreviewVisible : styles.printPreview} aria-hidden={!showPrintPreview}>
        {printSnapshot ? <GeometryPrintModel snapshot={printSnapshot} /> : null}
      </div>
    </section>
  );
}

function GeometryLabContent(props: GeometryLabProps) {
  const seed = props.seed ?? 1;
  if (!props.initialState && isPlaneFiguresTheorySeed(seed)) {
    return <PlaneFiguresTheoryGeometryLab seed={seed} mode={props.mode} readOnly={props.readOnly} assessmentSubmitted={props.assessmentSubmitted} onResultChange={props.onResultChange} />;
  }
  if (!props.initialState && isTriangleAngleSumLessonSeed(seed)) {
    return <TriangleAngleSumGeometryLab seed={seed} mode={props.mode} readOnly={props.readOnly} assessmentSubmitted={props.assessmentSubmitted} onResultChange={props.onResultChange} />;
  }
  if (!props.initialState && isTriangleConstructionLessonSeed(seed)) {
    return (
      <TriangleConstructionGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
        onResultChange={props.onResultChange}
      />
    );
  }
  if (!props.initialState && isTriangleTypesLessonSeed(seed)) {
    return (
      <TriangleTypesGeometryLab
        key={seed}
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
        onResultChange={props.onResultChange}
      />
    );
  }
  if (!props.initialState && isPolygonLessonSeed(seed)) {
    return (
      <PolygonBuilderGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
        onResultChange={props.onResultChange}
      />
    );
  }
  if (!props.initialState && isVerticalAnglesLessonSeed(seed)) {
    return (
      <VerticalAnglesGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  if (!props.initialState && isAngleDrawingLessonSeed(seed)) {
    return (
      <AngleDrawingGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  if (!props.initialState && isAngleMeasurementLessonSeed(seed)) {
    return (
      <AngleMeasurementGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  if (!props.initialState && isAngleRecognitionSeed(seed)) {
    return <AngleRecognitionGeometryLab seed={seed} mode={props.mode} readOnly={props.readOnly} onResultChange={props.onResultChange} />;
  }
  if (!props.initialState && isAngleTypesLessonSeed(seed)) {
    return (
      <AngleTypesGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  if (!props.initialState && isLineConstructionLessonSeed(seed)) {
    return (
      <LineConstructionGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  if (!props.initialState && isLineFoundationsLessonSeed(seed)) {
    return <LineFoundationsGeometryLab seed={seed} mode={props.mode} readOnly={props.readOnly} />;
  }
  if (!props.initialState && isLineRelationLessonSeed(seed)) {
    return (
      <LineRelationsGeometryLab
        seed={seed}
        mode={props.mode}
        readOnly={props.readOnly}
        highContrast={props.highContrast}
        assessmentSubmitted={props.assessmentSubmitted}
        onStateChange={props.onStateChange}
      />
    );
  }
  return <PolygonGeometryLab {...props} />;
}

function geometryTaskHeading(seed: number, fallback?: string): string {
  if (fallback) return fallback;
  if (isPlaneFiguresTheorySeed(seed)) return "Figury na płaszczyźnie";
  if (isTriangleAngleSumLessonSeed(seed)) return "Suma kątów w trójkącie";
  if (isTriangleConstructionLessonSeed(seed)) return "Konstruowanie trójkątów";
  if (isTriangleTypesLessonSeed(seed)) {
    const headings = {
      playground: "Podział trójkątów ze względu na boki",
      "angle-playground": "Podział trójkątów ze względu na kąty",
      "side-names": "Podstawa i ramiona trójkąta",
      "right-side-names": "Boki trójkąta prostokątnego",
      "identify-gallery": "Klasyfikacja trójkątów według boków i kątów",
      perimeter: "Obwód trójkąta",
      predict: "Dwie klasyfikacje trójkąta",
      "equal-sides": "Równe boki trójkąta",
      "greatest-angle": "Klasyfikacja trójkąta według kątów",
      "possible-pair": "Czy taki trójkąt może istnieć?",
      tent: "Namiot ekspedycji",
      independent: "Obwód i klasyfikacja trójkątów",
    } as const;
    return headings[getTriangleTypesSeedConfig(seed).activity];
  }
  if (isPolygonLessonSeed(seed)) {
    const headings = {
      builder: "Wielokąt — boki, wierzchołki i kąty",
      validity: "Które figury są wielokątami?",
      elements: "Przekątna wielokąta",
      reshape: "Liczba boków, wierzchołków i kątów",
      "stained-glass": "Które figury są wielokątami?",
      independent: "Obwód wielokąta",
    } as const;
    return headings[getPolygonSeedConfig(seed).activity];
  }
  if (isVerticalAnglesLessonSeed(seed)) {
    const headings = {
      crossing: "Kąty przyległe i wierzchołkowe",
      pairs: "Rozpoznawanie par kątów",
      "one-angle": "Obliczanie brakujących kątów",
      "three-lines": "Kąty utworzone przez trzy proste",
      roundabout: "Obliczanie miar kątów",
      repair: "Popraw błędne rozwiązanie",
      independent: "Obliczanie kątów przyległych i wierzchołkowych",
    } as const;
    return headings[getVerticalAnglesSeedConfig(seed).activity];
  }
  if (isAngleDrawingLessonSeed(seed)) return "Rysowanie kątów";
  if (isAngleMeasurementLessonSeed(seed)) return "Mierzenie kątów";
  if (isAngleRecognitionSeed(seed)) {
    const headings = {
      anatomy: "Budowa kąta",
      openness: "Rodzaje kątów i ich miary",
      greek: "Greckie oznaczenia kątów",
      notation: "Odczytywanie zapisu kąta",
      measures: "Rozpoznawanie kąta po mierze",
      "color-types": "Pokoloruj kąty według rodzaju",
      figure: "Kąty na figurze",
      "point-cloud": "Rysowanie kąta z rozsypanych punktów",
      "line-network": "Kąty w układzie prostych",
    } as const;
    return headings[getAngleRecognitionActivity(seed)];
  }
  if (isAngleTypesLessonSeed(seed)) return "Rodzaje kątów";
  if (isLineConstructionLessonSeed(seed)) return "Konstrukcje prostych — krok po kroku";
  if (isLineFoundationsLessonSeed(seed)) {
    const headings = {
      objects: "Punkt, prosta, półprosta i odcinek",
      segmentRelations: "Odcinki równoległe i prostopadłe",
      pointDistance: "Odległość punktu od prostej",
      parallelDistance: "Odległość między prostymi równoległymi",
    } as const;
    return headings[getLineFoundationsActivity(seed)];
  }
  if (isLineRelationLessonSeed(seed)) return "Proste równoległe i prostopadłe";
  return "Figury na siatce";
}

function geometryTaskDescription(seed: number): string {
  if (isPlaneFiguresTheorySeed(seed)) return "Najpierw odczytaj własności z rysunku i oznaczeń. Potem wykonaj kolejne zadania na slajdzie.";
  if (isTriangleTypesLessonSeed(seed)) return createPublicTriangleTypesTask(seed).prompt;
  if (isAngleRecognitionSeed(seed)) return "Rozpoznawaj elementy, oznaczenia i rodzaje kątów bez mierzenia długości ramion ani obracania całej figury.";
  if (isLineFoundationsLessonSeed(seed)) return "Odczytaj pojęcia i oznaczenia z rysunku, a następnie wskaż właściwy obiekt lub najkrótszy odcinek.";
  if (isVerticalAnglesLessonSeed(seed)) return "Korzystaj tylko z własności kątów wierzchołkowych i kątów przyległych.";
  if (isPolygonLessonSeed(seed)) return "Rozpoznaj figurę po jej bokach i uzupełnij wyłącznie informacje widoczne na rysunku.";
  if (isLineConstructionLessonSeed(seed) || isAngleDrawingLessonSeed(seed) || isTriangleConstructionLessonSeed(seed)) return "Obserwuj kolejne etapy konstrukcji i sprawdzaj ich kolejność. Rysunek odręczny wykonuje się na karcie papierowej.";
  return "Eksperymentuj na rysunku. Każda zmiana od razu aktualizuje długości, kąty i własności figury.";
}

export function GeometryLab(props: GeometryLabProps) {
  const seed = props.seed ?? 1;
  return (
    <LessonTaskFrame
      eyebrow="Dział 4 · Figury na płaszczyźnie"
      heading={geometryTaskHeading(seed, props.title)}
      description={props.description ?? geometryTaskDescription(seed)}
      questionNumber={props.questionNumber}
      questionCount={props.questionCount}
      contentClassName={styles.taskFrameContent}
      data-geometry-task-frame
    >
      <GeometryLabContent {...props} />
    </LessonTaskFrame>
  );
}
