"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { GeometryScene } from "@/components/lessons/geometry/GeometryScene";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  TRIANGLE_ANGLE_LABELS,
  TRIANGLE_SIDE_LABELS,
  createPublicTriangleTypesTask,
  createTriangleTypesGeometryState,
  moveTriangleVertex,
  triangleClassificationEvidence,
  triangleClassificationPairIsPossible,
  triangleClassifications,
  triangleTypesSeedFor,
  type TriangleAngleKind,
  type TriangleSideKind,
} from "@/lib/math/geometry/triangleTypes";
import {
  analyzeGeometryPolygon,
  commitGeometryHistory,
  createGeometryHistory,
  pointById,
  redoGeometryHistory,
  resetGeometryHistory,
  undoGeometryHistory,
} from "@/lib/math/geometry";
import type { DiagnosticFeedbackCopy, DiagnosticHighlightTarget, DiagnosticSolution } from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryHistoryState, GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";
import styles from "@/components/lessons/geometry/triangleTypes.module.css";

type TriangleDiagnosticCode = "TRIANGLE_PREDICTION_EMPTY" | "TRIANGLE_CLASSIFICATION_WRONG" | "TRIANGLE_DEGENERATE" | "TRIANGLE_EVIDENCE_MISSING";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = { support: "Przykład 1", core: "Przykład 2", challenge: "Przykład 3" };

const COPY: Record<TriangleDiagnosticCode, DiagnosticFeedbackCopy> = {
  TRIANGLE_PREDICTION_EMPTY: {
    area: "Brakuje jednej z dwóch klasyfikacji.",
    guidingQuestion: "Czy osobno sprawdzono długości boków i osobno największy kąt?",
    visualHint: "Kreski na bokach prowadzą do pierwszej nazwy, a łuki kątów do drugiej.",
    analogousExample: "Boki 5, 5, 8 dają nazwę równoramienny; największy kąt 106° daje nazwę rozwartokątny.",
  },
  TRIANGLE_CLASSIFICATION_WRONG: {
    area: "Co najmniej jedna nazwa nie wynika z aktualnych pomiarów.",
    guidingQuestion: "Którą nazwę rozstrzygają boki, a którą największy kąt?",
    visualHint: "Podświetlone kreski oznaczają równe boki. Dla kątów porównaj największą miarę z 90°.",
    analogousExample: "Trójkąt może być jednocześnie równoramienny i prostokątny — to dwie niezależne cechy.",
  },
  TRIANGLE_DEGENERATE: {
    area: "Punkty nie tworzą teraz trójkąta.",
    guidingQuestion: "Czy trzy wierzchołki są różne i nie leżą na jednej prostej?",
    visualHint: "Przesuń wskazany wierzchołek poza linię dwóch pozostałych punktów.",
    analogousExample: "A(0,0), B(2,0), C(1,1) tworzą trójkąt, ale C(1,0) już nie.",
  },
  TRIANGLE_EVIDENCE_MISSING: {
    area: "Nazwa jest wybrana, ale brakuje dowodu cechą figury.",
    guidingQuestion: "Które boki są równe i jaki jest największy kąt?",
    visualHint: "Nazwij parę boków zapisem |AB| = |AC| albo wskaż największy kąt i jego miarę.",
    analogousExample: "„Równoramienny, bo |AB| = |AC|; ostrokątny, bo każdy kąt ma mniej niż 90°.”",
  },
};

const SOLUTIONS: Record<TriangleDiagnosticCode, DiagnosticSolution> = {
  TRIANGLE_PREDICTION_EMPTY: { steps: ["Wybierz nazwę według boków.", "Wybierz nazwę według kątów.", "Sprawdź obie odpowiedzi razem."] },
  TRIANGLE_CLASSIFICATION_WRONG: { steps: ["Porównaj trzy długości.", "Znajdź największy kąt.", "Popraw tylko tę nazwę, której dowód się nie zgadza."] },
  TRIANGLE_DEGENERATE: { steps: ["Rozdziel złączone punkty.", "Przesuń C poza prostą AB.", "Sprawdź, czy pojawiły się trzy dodatnie długości i trzy kąty."] },
  TRIANGLE_EVIDENCE_MISSING: { steps: ["Wskaż równe boki albo zapisz, że wszystkie są różne.", "Wskaż największy kąt.", "Połącz każdą cechę z odpowiednią nazwą."] },
};

function diagnostic(code: TriangleDiagnosticCode) {
  const highlight: DiagnosticHighlightTarget = {
    id: `triangle-${code.toLowerCase()}`,
    kind: code === "TRIANGLE_DEGENERATE" ? "vertex" : "pair",
    memberIds: code === "TRIANGLE_DEGENERATE" ? ["vertex-1", "vertex-2", "vertex-3"] : ["AB", "BC", "CA", "∠A", "∠B", "∠C"],
    label: COPY[code].area,
    state: "attention",
    pattern: "dashed",
    symbol: code === "TRIANGLE_DEGENERATE" ? "△" : "≡ / ∠",
    accent: "amber",
  };
  return {
    result: createLessonGradeResult({ status: code === "TRIANGLE_EVIDENCE_MISSING" ? "partially-correct" : "incorrect", score: code === "TRIANGLE_EVIDENCE_MISSING" ? 1 : 0, maxScore: 2, errorCodes: [code], feedbackKey: `geometry.${code.toLowerCase()}` }),
    copy: COPY[code],
    highlights: [highlight],
    solution: SOLUTIONS[code],
  };
}

function pointerCoordinates(event: PointerEvent<SVGCircleElement>, state: GeometryLabState): GeometryPointCoordinates | null {
  const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

export interface TriangleTypesGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function TriangleTypesGeometryLab({ seed, mode = "practice", readOnly = false, highContrast = false, assessmentSubmitted = false, onStateChange, onResultChange }: TriangleTypesGeometryLabProps) {
  const initialTask = createPublicTriangleTypesTask(seed);
  const [currentSeed, setCurrentSeed] = useState(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => createGeometryHistory(createTriangleTypesGeometryState(seed, mode)));
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [sidePrediction, setSidePrediction] = useState<TriangleSideKind | null>(null);
  const [anglePrediction, setAnglePrediction] = useState<TriangleAngleKind | null>(null);
  const [revealed, setRevealed] = useState(!["predict", "independent"].includes(initialTask.activity));
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState<TriangleDiagnosticCode | null>(null);
  const [announcement, setAnnouncement] = useState("Model gotowy. Przesuń wierzchołek C albo wybierz gotową konfigurację.");
  const dragPoint = useRef<string | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const state = history.present;
  const task = createPublicTriangleTypesTask(currentSeed);
  const analysis = useMemo(() => analyzeGeometryPolygon(state), [state]);
  const classification = useMemo(() => triangleClassifications(state), [state]);
  const evidence = useMemo(() => triangleClassificationEvidence(state), [state]);
  const feedback = diagnosticCode ? diagnostic(diagnosticCode) : null;
  const locked = readOnly || assessmentSubmitted;
  const hideAnswer = ["predict", "independent"].includes(task.activity) && !revealed;
  const selected = pointById(state.points, state.selectedPointId ?? "");

  const publish = (next: GeometryLabState) => onStateChange?.(next);
  const commit = (next: GeometryLabState, message: string) => {
    setHistory((current) => commitGeometryHistory(current, { ...next, mode }));
    publish(next);
    setDiagnosticCode(null);
    onResultChange?.(null);
    setAnnouncement(message);
  };

  const resetResponse = () => {
    setSidePrediction(null);
    setAnglePrediction(null);
    setRevealed(!["predict", "independent"].includes(task.activity));
    setEvidenceConfirmed(false);
    setDiagnosticCode(null);
  };

  const switchDifficulty = (nextDifficulty: LessonDifficulty) => {
    if (locked) return;
    const nextSeed = triangleTypesSeedFor(task.activity, nextDifficulty);
    const next = createTriangleTypesGeometryState(nextSeed, mode);
    setDifficulty(nextDifficulty);
    setCurrentSeed(nextSeed);
    setHistory(createGeometryHistory(next));
    resetResponse();
    publish(next);
    setAnnouncement(`Wczytano poziom ${DIFFICULTY_LABELS[nextDifficulty]}.`);
  };

  const movePoint = (pointId: string, coordinates: GeometryPointCoordinates, message = "Rysunek i pomiary zaktualizowano.") => {
    if (locked) return;
    onResultChange?.(null);
    const next = moveTriangleVertex(state, pointId, coordinates);
    commit(next, message);
    if (["predict", "independent"].includes(task.activity)) {
      setRevealed(false);
      setEvidenceConfirmed(false);
    }
  };

  const check = () => {
    if (!classification) {
      setDiagnosticCode("TRIANGLE_DEGENERATE");
      setRevealed(true);
      onResultChange?.(false, "figura zdegenerowana");
      return;
    }
    if (!sidePrediction || !anglePrediction) {
      setDiagnosticCode("TRIANGLE_PREDICTION_EMPTY");
      onResultChange?.(null);
      return;
    }
    setRevealed(true);
    if (sidePrediction !== classification.side || anglePrediction !== classification.angle) {
      setDiagnosticCode("TRIANGLE_CLASSIFICATION_WRONG");
      onResultChange?.(false, `${sidePrediction}; ${anglePrediction}`);
      setAnnouncement("Sprawdź osobno boki i największy kąt. Popraw tylko błędną klasyfikację.");
      return;
    }
    if (task.activity === "independent" && !evidenceConfirmed) {
      setDiagnosticCode("TRIANGLE_EVIDENCE_MISSING");
      onResultChange?.(false, `${sidePrediction}; ${anglePrediction}; brak dowodu`);
      setAnnouncement("Obie nazwy są poprawne. Dodaj jeszcze dowód z boków i kąta.");
      return;
    }
    setDiagnosticCode(null);
    onResultChange?.(true, `${sidePrediction}; ${anglePrediction}`);
    setAnnouncement("Dobrze: obie nazwy wynikają z aktualnych cech trójkąta.");
  };

  const onPointKeyDown = (pointId: string, event: KeyboardEvent<SVGCircleElement>) => {
    const direction: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const delta = direction[event.key];
    if (!delta) return;
    event.preventDefault();
    const point = pointById(state.points, pointId);
    if (!point) return;
    const step = state.grid.step * (event.shiftKey ? 2 : 1);
    movePoint(pointId, { x: point.x + delta[0] * step, y: point.y + delta[1] * step }, `Przesunięto wierzchołek ${point.label}.`);
  };

  const rows = analysis.status === "valid" ? [
    ...analysis.sideLengths.map((length, index) => ({ element: ["AB", "BC", "CA"][index]!, value: length.exact, property: "długość boku" })),
    ...analysis.angleDegrees.map((angle, index) => ({ element: ["∠A", "∠B", "∠C"][index]!, value: `${angle.toFixed(1)}°`, property: index === analysis.angleDegrees.indexOf(Math.max(...analysis.angleDegrees)) ? "największy kąt" : "kąt" })),
  ] : [{ element: "Figura", value: "—", property: "Rozdziel punkty i utwórz trójkąt" }];

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-types-lab data-activity={task.activity}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Trójkątny plac zabaw · {DIFFICULTY_LABELS[difficulty]}</p>
          <h2>{task.activity === "tent" ? "Namiot ekspedycji" : task.activity === "possible-pair" ? "Czy taki trójkąt może istnieć?" : "Dwie klasyfikacje jednego trójkąta"}</h2>
          <p>{task.prompt}</p>
        </div>
        <div className={styles.mascot} aria-hidden="true"><span>△</span><small>A · B · C</small></div>
      </header>

      <div className={styles.levels} aria-label="Wybierz zestaw">
        {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((level) => <button key={level} type="button" aria-pressed={difficulty === level} disabled={locked} onClick={() => switchDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>)}
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => { const next = undoGeometryHistory(history); setHistory(next); publish(next.present); setAnnouncement("Cofnięto zmianę."); }}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => { const next = redoGeometryHistory(history); setHistory(next); publish(next.present); setAnnouncement("Ponowiono zmianę."); }}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => { const next = resetGeometryHistory(history); setHistory(next); resetResponse(); publish(next.present); setAnnouncement("Przywrócono początkowy trójkąt."); }}>Reset</button>
      </div>

      <div className={styles.workspace}>
        <div className={styles.canvas}>
          <AccessibleMathSvg title="Trójkąt ABC na siatce" description="Wierzchołki można przesuwać. Długości, kąty i klasyfikacje zmieniają się natychmiast." viewBox="0 0 640 420" className={styles.svg} columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Znaczenie" }]} rows={rows}>
            <GeometryScene
              state={state}
              showHandles={!locked}
              highContrast={highContrast}
              theme="playground"
              onPointSelect={(pointId) => setHistory((current) => ({ ...current, present: { ...current.present, selectedPointId: pointId } }))}
              onPointPointerDown={(pointId, event) => { if (locked) return; dragPoint.current = pointId; dragStart.current = state; event.currentTarget.setPointerCapture?.(event.pointerId); }}
              onPointPointerMove={(pointId, event) => { if (dragPoint.current !== pointId || locked) return; const coordinates = pointerCoordinates(event, state); if (!coordinates) return; const next = moveTriangleVertex(state, pointId, coordinates); setHistory((current) => ({ ...current, present: next, future: [] })); publish(next); setRevealed(false); }}
              onPointPointerUp={(pointId, event) => { if (dragPoint.current !== pointId) return; event.currentTarget.releasePointerCapture?.(event.pointerId); const start = dragStart.current; setHistory((current) => start ? { ...current, past: [...current.past, start].slice(-100), future: [] } : current); dragPoint.current = null; dragStart.current = null; setAnnouncement("Położenie, miary i klasyfikacje zaktualizowano."); }}
              onPointKeyDown={onPointKeyDown}
            />
          </AccessibleMathSvg>
          <p className={styles.live} role="status" aria-live="polite">{announcement}</p>
        </div>

        <aside className={styles.panel}>
          <div className={styles.prediction}>
            <h3>1. Przewidź dwie nazwy</h3>
            <label>Według boków<select value={sidePrediction ?? ""} disabled={locked} onChange={(event) => { setSidePrediction(event.target.value as TriangleSideKind); setDiagnosticCode(null); onResultChange?.(null); }}><option value="">Wybierz…</option>{(Object.keys(TRIANGLE_SIDE_LABELS) as TriangleSideKind[]).map((kind) => <option key={kind} value={kind}>{TRIANGLE_SIDE_LABELS[kind]}</option>)}</select></label>
            <label>Według kątów<select value={anglePrediction ?? ""} disabled={locked} onChange={(event) => { setAnglePrediction(event.target.value as TriangleAngleKind); setDiagnosticCode(null); onResultChange?.(null); }}><option value="">Wybierz…</option>{(Object.keys(TRIANGLE_ANGLE_LABELS) as TriangleAngleKind[]).map((kind) => <option key={kind} value={kind}>{TRIANGLE_ANGLE_LABELS[kind]}</option>)}</select></label>
            {task.activity === "independent" ? <label className={styles.evidenceCheck}><input type="checkbox" checked={evidenceConfirmed} disabled={locked} onChange={(event) => { setEvidenceConfirmed(event.target.checked); onResultChange?.(null); }} /> Wskazałem boki i największy kąt jako dowód.</label> : null}
            <button type="button" className={styles.check} disabled={locked} onClick={check}>Sprawdź obie klasyfikacje</button>
          </div>

          <div className={styles.results} data-hidden={hideAnswer} aria-live="polite">
            <h3>2. Wynik z aktualnych współrzędnych</h3>
            {hideAnswer ? <p className={styles.cover}>Nazwy są ukryte do chwili zatwierdzenia przewidywania.</p> : classification ? <>
              <div><span>Boki</span><strong>{TRIANGLE_SIDE_LABELS[classification.side]}</strong></div>
              <div><span>Kąty</span><strong>{TRIANGLE_ANGLE_LABELS[classification.angle]}</strong></div>
              <p className={styles.evidence}>{evidence?.equalSides.length ? `Równe boki: ${evidence.equalSides.join(", ")}. ` : "Wszystkie boki mają różne długości. "}Największy: {evidence?.greatestAngle} = {evidence?.greatestAngleDegrees.toFixed(1)}°.</p>
            </> : <p className={styles.cover}>To jeszcze nie jest trójkąt. Przesuń jeden z punktów.</p>}
          </div>

          {task.activity === "possible-pair" ? <div className={styles.possible}><h3>Test możliwości</h3><p>Wybrana para jest <strong>{sidePrediction && anglePrediction ? (triangleClassificationPairIsPossible(sidePrediction, anglePrediction) ? "możliwa — spróbuj ją zbudować" : "niemożliwa") : "gotowa do sprawdzenia po wyborze obu nazw"}</strong>.</p></div> : null}
        </aside>
      </div>

      <InteractionAlternativePanel title="Przesuń wierzchołek bez przeciągania" instruction="Wybierz punkt, użyj strzałek albo wpisz współrzędne. Każdy krok od razu zmienia rysunek i tabelę.">
        <label>Wierzchołek<select value={state.selectedPointId ?? ""} disabled={locked} onChange={(event) => setHistory((current) => ({ ...current, present: { ...current.present, selectedPointId: event.target.value } }))}>{state.polygon.vertexIds.map((id) => <option key={id} value={id}>{pointById(state.points, id)?.label}</option>)}</select></label>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x - state.grid.step, y: selected.y })}>←</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x, y: selected.y - state.grid.step })}>↑</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x, y: selected.y + state.grid.step })}>↓</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x + state.grid.step, y: selected.y })}>→</button>
        <label>x <input aria-label="Współrzędna x" type="number" value={selected?.x ?? ""} disabled={locked || !selected} onChange={(event) => selected && movePoint(selected.id, { x: Number(event.target.value), y: selected.y })} /></label>
        <label>y <input aria-label="Współrzędna y" type="number" value={selected?.y ?? ""} disabled={locked || !selected} onChange={(event) => selected && movePoint(selected.id, { x: selected.x, y: Number(event.target.value) })} /></label>
      </InteractionAlternativePanel>

      {feedback ? mode === "assessment"
        ? assessmentSubmitted
          ? <DiagnosticFeedbackPanel {...feedback} mode="assessment" submitted />
          : <DiagnosticFeedbackPanel result={feedback.result} copy={feedback.copy} highlights={feedback.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel {...feedback} mode="practice" submitted />
      : null}
    </section>
  );
}
