"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createLessonGradeResult, toPublicLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  commitGeometryHistory,
  createGeometryHistory,
  redoGeometryHistory,
  resetGeometryHistory,
  undoGeometryHistory,
} from "@/lib/math/geometry/geometryState";
import { polygonEdgeObjects } from "@/lib/math/geometry/geometryMath";
import {
  addPolygonVertex,
  analyzePolygonLessonState,
  createPolygonGeometryState,
  createPolygonStateForValidityCase,
  createPublicPolygonTask,
  diagonalEndpointIds,
  movePolygonVertex,
  polygonNameForSideCount,
  polygonPoint,
  polygonSeedFor,
  removePolygonVertex,
  setPolygonClosed,
  type PolygonLessonActivity,
  type PolygonValidityCase,
} from "@/lib/math/geometry/polygons";
import type {
  DiagnosticFeedbackCopy,
  DiagnosticHighlightTarget,
  DiagnosticSolution,
  PublicLessonGradeResult,
} from "@/types/diagnosticFeedback";
import type { LessonDifficulty } from "@/types/lessonPackage";
import type { GeometryLabMode, GeometryLabState, GeometryPointCoordinates } from "@/types/geometry";
import styles from "@/components/lessons/geometry/polygonBuilder.module.css";

type PolygonChoice = "polygon" | "not-polygon";
type ConditionChoice = "closed" | "straight" | "no-crossing" | "all";
type PolygonDiagnosticCode =
  | "POLYGON_NOT_CLOSED"
  | "POLYGON_CURVED_EDGE"
  | "GEO_SELF_INTERSECTION"
  | "GEO_DEGENERATE"
  | "POLYGON_TARGET_COUNT"
  | "POLYGON_NAME_INCORRECT"
  | "POLYGON_ELEMENT_INCORRECT"
  | "POLYGON_DIAGONAL_INCORRECT"
  | "POLYGON_PERIMETER_INCORRECT"
  | "POLYGON_VALIDITY_JUSTIFICATION"
  | "POLYGON_INTERFACE_INPUT";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Wsparcie",
  core: "Poziom podstawowy",
  challenge: "Wyzwanie",
};

const ACTIVITY_TITLES: Record<PolygonLessonActivity, string> = {
  builder: "Budowniczy wielokątów",
  validity: "Czy to wielokąt?",
  elements: "Nazwij elementy",
  reshape: "Zmieniaj kształt",
  "stained-glass": "Witraż bez prostokątów",
  independent: "Praca samodzielna",
};

const VALIDITY_LABELS: Record<PolygonValidityCase, string> = {
  open: "Linia otwarta",
  curved: "Figura z łukiem",
  "self-intersecting": "Boki skrzyżowane",
  "valid-concave": "Poprawny wielokąt wklęsły",
};

const CONDITION_LABELS: Record<ConditionChoice, string> = {
  closed: "rysunek nie jest domknięty",
  straight: "brzeg nie składa się wyłącznie z odcinków",
  "no-crossing": "boki przecinają się poza wierzchołkami",
  all: "wszystkie trzy warunki są spełnione",
};

const DIAGNOSTIC_COPY: Record<PolygonDiagnosticCode, DiagnosticFeedbackCopy> = {
  POLYGON_NOT_CLOSED: {
    area: "Pierwszy i ostatni odcinek nie tworzą zamkniętego brzegu.",
    guidingQuestion: "Który punkt trzeba wybrać po ustawieniu ostatniego wierzchołka?",
    visualHint: "Początek A i ostatni punkt mają obrys przerywany; wybierz A, aby dodać ostatni bok.",
    analogousExample: "Trzy odcinki tworzą trójkąt dopiero wtedy, gdy ostatni wraca do pierwszego punktu.",
  },
  POLYGON_CURVED_EDGE: {
    area: "Jedna krawędź jest łukiem, a bok wielokąta musi być odcinkiem.",
    guidingQuestion: "Czy każdy fragment brzegu jest prostym odcinkiem między dwoma wierzchołkami?",
    visualHint: "Łuk ma falowany obrys i symbol ≋; zastąp go odcinkiem.",
    analogousExample: "Koło jest domknięte, ale nie jest wielokątem, bo jego brzeg nie składa się z odcinków.",
  },
  GEO_SELF_INTERSECTION: {
    area: "Dwa niesąsiednie boki przecinają się wewnątrz rysunku.",
    guidingQuestion: "Które dwie krawędzie spotkały się poza wspólnym wierzchołkiem?",
    visualHint: "Obie przecinające się krawędzie mają podwójny obrys i symbol ×.",
    analogousExample: "Kokarda z czterech odcinków jest domknięta, lecz skrzyżowanie boków nie jest wierzchołkiem wielokąta.",
  },
  GEO_DEGENERATE: {
    area: "Co najmniej dwa wierzchołki pokrywają się albo wszystkie leżą na jednej prostej.",
    guidingQuestion: "Czy każdy wierzchołek ma inne współrzędne i czy figura ma wnętrze?",
    visualHint: "Powtarzające się wierzchołki są zaznaczone symbolem !.",
    analogousExample: "Trzy różne punkty na jednej prostej nie ograniczają trójkąta.",
  },
  POLYGON_TARGET_COUNT: {
    area: "Liczba ustawionych wierzchołków nie zgadza się z celem zadania.",
    guidingQuestion: "Ile wierzchołków i boków ma mieć nazwana figura?",
    visualHint: "Licznik wierzchołków porównuje stan bieżący z celem 3–8.",
    analogousExample: "Pięciokąt ma dokładnie pięć różnych wierzchołków i pięć boków.",
  },
  POLYGON_NAME_INCORRECT: {
    area: "Wybrana nazwa nie odpowiada liczbie boków poprawnej figury.",
    guidingQuestion: "Ile boków pokazuje licznik po domknięciu?",
    visualHint: "Nazwa pojawia się dopiero dla poprawnego, domkniętego wielokąta.",
    analogousExample: "Sześć boków oznacza sześciokąt niezależnie od ustawienia figury.",
  },
  POLYGON_ELEMENT_INCORRECT: {
    area: "Nie wskazano jeszcze osobno wierzchołka i boku.",
    guidingQuestion: "Który punkt jest końcem dwóch boków, a który odcinek łączy sąsiednie punkty?",
    visualHint: "Wierzchołek ma okrągły znacznik, a bok szeroki liniowy cel dotykowy.",
    analogousExample: "W czworokącie ABCD punkt B jest wierzchołkiem, a BC jest bokiem.",
  },
  POLYGON_DIAGONAL_INCORRECT: {
    area: "Wybrany odcinek nie łączy dwóch niesąsiednich wierzchołków.",
    guidingQuestion: "Które punkty nie są wybranym punktem ani jego sąsiadami?",
    visualHint: "Najpierw wybierz początek, potem niesąsiedni wierzchołek; przekątna ma linię przerywaną.",
    analogousExample: "W czworokącie ABCD z punktu A przekątną jest AC, ale nie AB ani AD.",
  },
  POLYGON_PERIMETER_INCORRECT: {
    area: "Wpisany obwód nie zgadza się z sumą aktualnych długości boków.",
    guidingQuestion: "Czy zsumowano długości wszystkich boków po ostatnim przesunięciu?",
    visualHint: "Monitor obwodu aktualizuje się w czasie rzeczywistym i podaje wynik do 0,1 jednostki.",
    analogousExample: "Po przesunięciu jednego wierzchołka trzeba ponownie dodać wszystkie długości boków.",
  },
  POLYGON_VALIDITY_JUSTIFICATION: {
    area: "Decyzja lub wskazany warunek wielokąta nie pasuje do rysunku.",
    guidingQuestion: "Czy rysunek jest domknięty, zbudowany z odcinków i bez samoprzecięcia?",
    visualHint: "Sprawdź trzy znaczniki warunków pod monitorem.",
    analogousExample: "Poprawny wielokąt może być wklęsły i ukośny, jeśli spełnia wszystkie trzy warunki.",
  },
  POLYGON_INTERFACE_INPUT: {
    area: "Pole współrzędnej lub obwodu nie zawiera poprawnej liczby.",
    guidingQuestion: "Czy wpisano liczbę mieszczącą punkt na siatce albo nieujemny obwód?",
    visualHint: "Popraw pole oznaczone jako x, y lub obwód.",
    analogousExample: "Współrzędne (180, 140) umieszczają punkt na przecięciu linii siatki.",
  },
};

const SOLUTION: DiagnosticSolution = {
  steps: [
    "Policz różne wierzchołki i sprawdź, czy ostatni bok wraca do A.",
    "Sprawdź kolejno: wyłącznie odcinki, brak skrzyżowania niesąsiednich boków i różne wierzchołki.",
    "Nazwij figurę według liczby boków; ukośny albo wklęsły wygląd nie zmienia nazwy.",
    "Przekątną poprowadź do niesąsiedniego wierzchołka, a obwód oblicz jako sumę wszystkich boków.",
  ],
};

export interface PolygonBuilderGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

function pointerCoordinates(
  event: PointerEvent<SVGCircleElement>,
  state: GeometryLabState,
): GeometryPointCoordinates | null {
  const svg = event.currentTarget.ownerSVGElement;
  const bounds = svg?.getBoundingClientRect();
  if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;
  return {
    x: (event.clientX - bounds.left) * state.viewport.width / bounds.width,
    y: (event.clientY - bounds.top) * state.viewport.height / bounds.height,
  };
}

function expectedCondition(validityCase: PolygonValidityCase): ConditionChoice {
  if (validityCase === "open") return "closed";
  if (validityCase === "curved") return "straight";
  if (validityCase === "self-intersecting") return "no-crossing";
  return "all";
}

function gradeStatus(score: number, maxScore: number): PublicLessonGradeResult["status"] {
  if (score === maxScore) return "correct";
  if (score > 0) return "partially-correct";
  return "incorrect";
}

export function PolygonBuilderGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: PolygonBuilderGeometryLabProps) {
  const [activeSeed, setActiveSeed] = useState(seed);
  const task = useMemo(() => createPublicPolygonTask(activeSeed), [activeSeed]);
  const [validityCase, setValidityCase] = useState<PolygonValidityCase>(task.validityCase);
  const initialState = useMemo(
    () => task.activity === "validity"
      ? createPolygonStateForValidityCase(activeSeed, validityCase, mode)
      : createPolygonGeometryState(activeSeed, mode),
    [activeSeed, mode, task.activity, validityCase],
  );
  const [history, setHistory] = useState(() => createGeometryHistory(initialState));
  const state = history.present;
  const [selectedName, setSelectedName] = useState("");
  const [validityAnswer, setValidityAnswer] = useState<PolygonChoice | null>(null);
  const [conditionChoice, setConditionChoice] = useState<ConditionChoice | null>(null);
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [diagonal, setDiagonal] = useState<[string, string] | null>(null);
  const [perimeterInput, setPerimeterInput] = useState("");
  const [xInput, setXInput] = useState(String(state.points[0]?.x ?? 0));
  const [yInput, setYInput] = useState(String(state.points[0]?.y ?? 0));
  const [feedback, setFeedback] = useState<{
    result: PublicLessonGradeResult;
    code: PolygonDiagnosticCode;
    highlights: DiagnosticHighlightTarget[];
  } | null>(null);
  const [announcement, setAnnouncement] = useState("Model gotowy.");
  const dragId = useRef<string | null>(null);
  const pointerMoved = useRef(false);

  const hasCurvedEdge = task.activity === "validity" && validityCase === "curved";
  const analysis = analyzePolygonLessonState(state, { hasCurvedEdge });
  const edges = polygonEdgeObjects(state);
  const firstId = state.polygon.vertexIds[0] ?? "";
  const selectedPoint = polygonPoint(state, state.selectedPointId ?? "") ?? state.points[0];

  const commit = (next: GeometryLabState, message: string) => {
    if (next === state) return;
    setHistory((current) => commitGeometryHistory(current, next));
    setFeedback(null);
    setAnnouncement(message);
    onStateChange?.(next);
  };

  const resetAnswers = () => {
    setSelectedName("");
    setValidityAnswer(null);
    setConditionChoice(null);
    setSelectedVertexId(null);
    setSelectedEdgeId(null);
    setDiagonal(null);
    setPerimeterInput("");
    setFeedback(null);
  };

  const replaceTaskState = (nextSeed: number, nextCase?: PolygonValidityCase) => {
    const nextTask = createPublicPolygonTask(nextSeed);
    const actualCase = nextCase ?? nextTask.validityCase;
    const next = nextTask.activity === "validity"
      ? createPolygonStateForValidityCase(nextSeed, actualCase, mode)
      : createPolygonGeometryState(nextSeed, mode);
    setActiveSeed(nextSeed);
    setValidityCase(actualCase);
    setHistory(createGeometryHistory(next));
    resetAnswers();
    setXInput(String(next.points[0]?.x ?? 0));
    setYInput(String(next.points[0]?.y ?? 0));
    setAnnouncement(`Wczytano poziom: ${DIFFICULTY_LABELS[nextTask.difficulty]}.`);
    onStateChange?.(next);
  };

  const switchValidityCase = (nextCase: PolygonValidityCase) => {
    const next = createPolygonStateForValidityCase(activeSeed, nextCase, mode);
    setValidityCase(nextCase);
    setHistory(createGeometryHistory(next));
    resetAnswers();
    setAnnouncement(`Karta: ${VALIDITY_LABELS[nextCase]}.`);
    onStateChange?.(next);
  };

  const chooseVertex = (pointId: string) => {
    if ((task.activity === "builder" || task.activity === "independent") && !state.polygon.closed && pointId === firstId) {
      commit(setPolygonClosed(state, true), "Wybrano A. Figura została domknięta.");
      return;
    }
    if (selectedVertexId && diagonalEndpointIds(state, selectedVertexId).includes(pointId)) {
      setDiagonal([selectedVertexId, pointId]);
      setAnnouncement(`Zaznaczono przekątną ${polygonPoint(state, selectedVertexId)?.label}${polygonPoint(state, pointId)?.label}.`);
      setFeedback(null);
      return;
    }
    setSelectedVertexId(pointId);
    setDiagonal(null);
    commit({ ...state, selectedPointId: pointId }, `Wybrano wierzchołek ${polygonPoint(state, pointId)?.label}.`);
  };

  const movePoint = (pointId: string, coordinates: GeometryPointCoordinates, message: string) => {
    if (readOnly) return;
    commit(movePolygonVertex(state, pointId, coordinates), message);
  };

  const handlePointKey = (event: KeyboardEvent<SVGCircleElement>, pointId: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseVertex(pointId);
      return;
    }
    const directions: Record<string, GeometryPointCoordinates> = {
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    const point = polygonPoint(state, pointId);
    if (!direction || !point || readOnly) return;
    event.preventDefault();
    const step = state.grid.step * (event.shiftKey ? 5 : 1);
    movePoint(pointId, { x: point.x + direction.x * step, y: point.y + direction.y * step }, `Przesunięto ${point.label} klawiaturą.`);
  };

  const diagnosticHighlights = (codes: string[]): DiagnosticHighlightTarget[] => {
    const targets: DiagnosticHighlightTarget[] = [];
    analysis.offendingEdgeIds.forEach((edgeId, index) => targets.push({
      id: `polygon-edge-highlight-${index}`,
      kind: "edge",
      memberIds: [edgeId],
      label: "Krawędź wymagająca uwagi",
      state: "attention",
      pattern: analysis.selfIntersecting ? "double" : "dashed",
      symbol: analysis.selfIntersecting ? "×" : "!",
      accent: "amber",
    }));
    analysis.offendingVertexIds.forEach((pointId, index) => targets.push({
      id: `polygon-vertex-highlight-${index}`,
      kind: "vertex",
      memberIds: [pointId],
      label: "Powtarzający się wierzchołek",
      state: "attention",
      pattern: "dotted",
      symbol: "!",
      accent: "violet",
    }));
    if (codes.includes("POLYGON_ELEMENT_INCORRECT") || codes.includes("POLYGON_DIAGONAL_INCORRECT")) {
      targets.push({
        id: "polygon-element-highlight",
        kind: diagonal ? "pair" : "vertex",
        memberIds: diagonal ?? [selectedVertexId ?? firstId],
        label: diagonal ? "Sprawdzana para końców odcinka" : "Początek wyboru elementu",
        state: "attention",
        pattern: "dashed",
        symbol: "?",
        accent: "cyan",
      });
    }
    return targets;
  };

  const submit = () => {
    const errors: PolygonDiagnosticCode[] = [];
    let score = 0;
    let maxScore = 1;

    if (task.activity === "validity") {
      maxScore = 2;
      const isExpectedPolygon = validityCase === "valid-concave";
      if (validityAnswer === (isExpectedPolygon ? "polygon" : "not-polygon")) score += 1;
      else errors.push("POLYGON_VALIDITY_JUSTIFICATION");
      if (conditionChoice === expectedCondition(validityCase)) score += 1;
      else errors.push("POLYGON_VALIDITY_JUSTIFICATION");
    } else if (task.activity === "elements") {
      maxScore = 3;
      if (selectedVertexId) score += 1;
      else errors.push("POLYGON_ELEMENT_INCORRECT");
      if (selectedEdgeId) score += 1;
      else errors.push("POLYGON_ELEMENT_INCORRECT");
      if (diagonal) score += 1;
      else errors.push("POLYGON_DIAGONAL_INCORRECT");
    } else if (task.activity === "reshape") {
      maxScore = 2;
      if (analysis.validPolygon) score += 1;
      else errors.push((analysis.errorCodes[0] as PolygonDiagnosticCode | undefined) ?? "GEO_DEGENERATE");
      if (analysis.vertexCount === task.targetVertexCount) score += 1;
      else errors.push("POLYGON_TARGET_COUNT");
    } else {
      const independent = task.activity === "independent";
      const needsDiagonal = independent && task.difficulty !== "support";
      const needsPerimeter = independent && task.difficulty === "challenge";
      maxScore = 2 + (needsDiagonal ? 1 : 0) + (needsPerimeter ? 1 : 0);
      if (analysis.validPolygon && analysis.vertexCount === task.targetVertexCount) score += 1;
      else {
        if (!analysis.validPolygon) errors.push((analysis.errorCodes[0] as PolygonDiagnosticCode | undefined) ?? "GEO_DEGENERATE");
        if (analysis.vertexCount !== task.targetVertexCount) errors.push("POLYGON_TARGET_COUNT");
      }
      if (selectedName === polygonNameForSideCount(task.targetVertexCount)) score += 1;
      else errors.push("POLYGON_NAME_INCORRECT");
      if (needsDiagonal) {
        if (diagonal) score += 1;
        else errors.push("POLYGON_DIAGONAL_INCORRECT");
      }
      if (needsPerimeter) {
        const entered = Number(perimeterInput.replace(",", "."));
        if (Number.isFinite(entered) && analysis.perimeter !== null && Math.abs(entered - analysis.perimeter) <= 0.1) score += 1;
        else errors.push(Number.isFinite(entered) ? "POLYGON_PERIMETER_INCORRECT" : "POLYGON_INTERFACE_INPUT");
      }
    }

    const uniqueErrors = Array.from(new Set(errors));
    const result = toPublicLessonGradeResult(createLessonGradeResult({
      status: gradeStatus(score, maxScore),
      score,
      maxScore,
      errorCodes: score === maxScore ? [] : uniqueErrors.length ? uniqueErrors : ["POLYGON_VALIDITY_JUSTIFICATION"],
      feedbackKey: `polygon-${task.activity}-${task.difficulty}-${score}-${uniqueErrors.join("-") || "ok"}`,
    }));
    setFeedback({
      result,
      code: uniqueErrors[0] ?? "POLYGON_VALIDITY_JUSTIFICATION",
      highlights: diagnosticHighlights(uniqueErrors),
    });
    setAnnouncement(score === maxScore ? "Wszystkie sprawdzane warunki są spełnione." : `Wynik ${score} z ${maxScore}. Sprawdź diagnostykę.`);
  };

  const undo = () => {
    const next = undoGeometryHistory(history);
    setHistory(next);
    setFeedback(null);
    setAnnouncement("Cofnięto ostatnią zmianę.");
    onStateChange?.(next.present);
  };

  const redo = () => {
    const next = redoGeometryHistory(history);
    setHistory(next);
    setFeedback(null);
    setAnnouncement("Ponowiono zmianę.");
    onStateChange?.(next.present);
  };

  const reset = () => {
    const next = resetGeometryHistory(history);
    setHistory(next);
    resetAnswers();
    setAnnouncement("Przywrócono stan początkowy.");
    onStateChange?.(next.present);
  };

  const applyCoordinates = () => {
    const x = Number(xInput);
    const y = Number(yInput);
    if (!selectedPoint || !Number.isFinite(x) || !Number.isFinite(y)) {
      const result = toPublicLessonGradeResult(createLessonGradeResult({
        status: "incorrect", score: 0, maxScore: 1, errorCodes: ["POLYGON_INTERFACE_INPUT"], feedbackKey: "polygon-coordinate-input",
      }));
      setFeedback({ result, code: "POLYGON_INTERFACE_INPUT", highlights: [] });
      return;
    }
    movePoint(selectedPoint.id, { x, y }, `Umieszczono ${selectedPoint.label} we współrzędnych (${x}, ${y}).`);
  };

  const moveSelectedBy = (dx: number, dy: number) => {
    if (!selectedPoint) return;
    const step = state.grid.step;
    const next = { x: selectedPoint.x + dx * step, y: selectedPoint.y + dy * step };
    setXInput(String(next.x));
    setYInput(String(next.y));
    movePoint(selectedPoint.id, next, `Przesunięto ${selectedPoint.label} o jedno pole siatki.`);
  };

  return (
    <section
      className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`}
      data-polygon-builder
      data-activity={task.activity}
      data-difficulty={task.difficulty}
      data-mode={mode}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>M5-4.5 · {DIFFICULTY_LABELS[task.difficulty]}</p>
          <h2>{ACTIVITY_TITLES[task.activity]}</h2>
          <p>{task.prompt}</p>
        </div>
        <div className={styles.difficulty} role="group" aria-label="Poziom zadania">
          {(Object.keys(DIFFICULTY_LABELS) as LessonDifficulty[]).map((difficulty) => (
            <button
              key={difficulty}
              type="button"
              aria-pressed={task.difficulty === difficulty}
              onClick={() => replaceTaskState(polygonSeedFor(task.activity, difficulty))}
            >
              {DIFFICULTY_LABELS[difficulty]}
            </button>
          ))}
        </div>
      </header>

      {task.activity === "validity" ? (
        <div className={styles.casePicker} role="group" aria-label="Przykłady i kontrprzykłady">
          {(Object.keys(VALIDITY_LABELS) as PolygonValidityCase[]).map((candidate) => (
            <button key={candidate} type="button" aria-pressed={validityCase === candidate} onClick={() => switchValidityCase(candidate)}>
              {VALIDITY_LABELS[candidate]}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles.workspace}>
        <div className={styles.sceneCard}>
          <svg
            viewBox={`0 0 ${state.viewport.width} ${state.viewport.height}`}
            role="img"
            aria-label={`Siatka konstrukcyjna. ${analysis.vertexCount} wierzchołków, ${analysis.drawnSegmentCount} narysowanych odcinków. ${analysis.validPolygon ? `Poprawny ${analysis.polygonName}.` : "Figura wymaga sprawdzenia."}`}
            className={styles.scene}
          >
            <defs>
              <pattern id={`polygon-grid-${activeSeed}`} width={state.grid.step} height={state.grid.step} patternUnits="userSpaceOnUse">
                <path d={`M ${state.grid.step} 0 L 0 0 0 ${state.grid.step}`} className={styles.gridLine} fill="none" />
              </pattern>
              <pattern id={`glass-${activeSeed}`} width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M0 80 80 0M-20 20 20-20M60 100 100 60" className={styles.glassLine} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#polygon-grid-${activeSeed})`} />
            {task.activity === "stained-glass" ? <rect x="38" y="28" width="564" height="364" rx="28" fill={`url(#glass-${activeSeed})`} className={styles.glassBackground} /> : null}

            {edges.map((edge, index) => {
              const start = polygonPoint(state, edge.startPointId);
              const end = polygonPoint(state, edge.endPointId);
              if (!start || !end) return null;
              const attention = analysis.offendingEdgeIds.includes(edge.id);
              const selected = selectedEdgeId === edge.id;
              const edgeClass = `${styles.edge} ${attention ? styles.edgeAttention : ""} ${selected ? styles.edgeSelected : ""}`;
              if (hasCurvedEdge && index === 0) {
                const midX = (start.x + end.x) / 2;
                const midY = Math.min(start.y, end.y) - 70;
                return (
                  <g key={edge.id} data-polygon-edge={edge.id} data-diagnostic={attention ? "attention" : undefined}>
                    <path d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`} className={edgeClass} fill="none" />
                    <text x={midX} y={midY - 8} className={styles.edgeWarning}>≋ łuk</text>
                  </g>
                );
              }
              return (
                <g key={edge.id} data-polygon-edge={edge.id} data-diagnostic={attention ? "attention" : undefined}>
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={edgeClass} />
                  <line
                    x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    className={styles.edgeHit}
                    role="button"
                    tabIndex={0}
                    aria-label={`Bok ${start.label}${end.label}`}
                    onClick={() => { setSelectedEdgeId(edge.id); setAnnouncement(`Wybrano bok ${start.label}${end.label}.`); setFeedback(null); }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedEdgeId(edge.id);
                        setAnnouncement(`Wybrano bok ${start.label}${end.label}.`);
                      }
                    }}
                  />
                </g>
              );
            })}

            {diagonal ? (() => {
              const start = polygonPoint(state, diagonal[0]);
              const end = polygonPoint(state, diagonal[1]);
              return start && end ? (
                <g data-polygon-diagonal>
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={styles.diagonal} />
                  <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 10} className={styles.diagonalLabel}>przekątna {start.label}{end.label}</text>
                </g>
              ) : null;
            })() : null}

            {analysis.selfIntersecting ? analysis.offendingEdgeIds.slice(0, 1).map((_, index) => {
              const crossing = analyzePolygonLessonState(state).selfIntersecting;
              return crossing ? <text key={index} x="310" y="215" className={styles.crossingMark}>×</text> : null;
            }) : null}

            {state.polygon.vertexIds.map((pointId) => {
              const point = polygonPoint(state, pointId);
              if (!point) return null;
              const selected = selectedVertexId === point.id || state.selectedPointId === point.id;
              const attention = analysis.offendingVertexIds.includes(point.id) || (!state.polygon.closed && (point.id === firstId || point.id === state.polygon.vertexIds.at(-1)));
              return (
                <g key={point.id} data-polygon-vertex={point.id} data-diagnostic={attention ? "attention" : undefined}>
                  <circle cx={point.x} cy={point.y} r="9" className={`${styles.vertex} ${selected ? styles.vertexSelected : ""} ${attention ? styles.vertexAttention : ""}`} />
                  <circle
                    cx={point.x} cy={point.y} r="26" fill="transparent"
                    className={styles.vertexHit}
                    role="button"
                    tabIndex={0}
                    aria-label={`Wierzchołek ${point.label}, x ${Math.round(point.x)}, y ${Math.round(point.y)}`}
                    data-touch-target="52"
                    onKeyDown={(event) => handlePointKey(event, point.id)}
                    onClick={() => {
                      if (pointerMoved.current) { pointerMoved.current = false; return; }
                      chooseVertex(point.id);
                    }}
                    onPointerDown={(event) => {
                      if (readOnly) return;
                      dragId.current = point.id;
                      pointerMoved.current = false;
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                    }}
                    onPointerMove={(event) => {
                      if (dragId.current !== point.id || readOnly) return;
                      const coordinates = pointerCoordinates(event, state);
                      if (!coordinates) return;
                      pointerMoved.current = true;
                      movePoint(point.id, coordinates, `Przesuwanie ${point.label}: (${Math.round(coordinates.x)}, ${Math.round(coordinates.y)}).`);
                    }}
                    onPointerUp={(event) => {
                      dragId.current = null;
                      event.currentTarget.releasePointerCapture?.(event.pointerId);
                    }}
                  />
                  <text x={point.x + 14} y={point.y - 14} className={styles.vertexLabel}>{point.label}</text>
                </g>
              );
            })}
          </svg>

          <div className={styles.historyControls} role="group" aria-label="Historia konstrukcji">
            <button type="button" onClick={undo} disabled={history.past.length === 0}>Cofnij</button>
            <button type="button" onClick={redo} disabled={history.future.length === 0}>Ponów</button>
            <button type="button" onClick={reset}>Reset</button>
            {(task.activity === "builder" || task.activity === "independent") ? (
              <>
                <button type="button" onClick={() => commit(addPolygonVertex(state), "Dodano kolejny wierzchołek.")} disabled={state.polygon.vertexIds.length >= 8 || readOnly}>+ wierzchołek</button>
                <button type="button" onClick={() => commit(removePolygonVertex(state), "Usunięto ostatni wierzchołek.")} disabled={state.polygon.vertexIds.length <= 3 || readOnly}>− wierzchołek</button>
              </>
            ) : null}
          </div>
          {!state.polygon.closed && (task.activity === "builder" || task.activity === "independent") ? (
            <p className={styles.closeHint}>Wybierz pierwszy punkt <strong>A</strong>, aby domknąć figurę. Samo ustawienie ostatniego punktu nie dodaje boku zamykającego.</p>
          ) : null}
        </div>

        <aside className={styles.monitor} aria-label="Monitor wielokąta">
          <h3>Monitor w czasie rzeczywistym</h3>
          <dl className={styles.metrics}>
            <div><dt>Wierzchołki</dt><dd data-polygon-vertices>{analysis.vertexCount}</dd></div>
            <div><dt>{analysis.validPolygon ? "Boki" : "Odcinki"}</dt><dd data-polygon-sides>{analysis.validPolygon ? analysis.sideCount : analysis.drawnSegmentCount}</dd></div>
            <div><dt>Obwód</dt><dd data-polygon-perimeter>{analysis.perimeter === null ? "—" : analysis.perimeter.toFixed(1)}</dd></div>
            <div><dt>Nazwa</dt><dd data-polygon-name>{analysis.polygonName ?? "—"}</dd></div>
          </dl>
          <ul className={styles.conditions} aria-label="Warunki wielokąta">
            <li data-condition={analysis.closed ? "ok" : "error"}><span>{analysis.closed ? "✓" : "!"}</span> brzeg domknięty</li>
            <li data-condition={!analysis.hasCurvedEdge ? "ok" : "error"}><span>{!analysis.hasCurvedEdge ? "✓" : "!"}</span> tylko odcinki</li>
            <li data-condition={!analysis.selfIntersecting ? "ok" : "error"}><span>{!analysis.selfIntersecting ? "✓" : "!"}</span> bez samoprzecięcia</li>
            <li data-condition={!analysis.degenerate ? "ok" : "error"}><span>{!analysis.degenerate ? "✓" : "!"}</span> różne wierzchołki i wnętrze</li>
          </ul>
          {analysis.validPolygon ? <p className={styles.validStatus}>Poprawny wielokąt{analysis.concave ? " — nietypowy, wklęsły przykład" : ""}.</p> : <p className={styles.invalidStatus}>To jeszcze nie jest poprawny wielokąt.</p>}
        </aside>
      </div>

      <InteractionAlternativePanel
        title="Umieść wierzchołek bez przeciągania"
        instruction="Wybierz punkt, wpisz współrzędne albo przesuń go przyciskami o jedno pole siatki. Na uchwycie działają też strzałki; Shift oznacza pięć pól."
      >
        <label>Wierzchołek
          <select
            aria-label="Wierzchołek"
            value={selectedPoint?.id ?? ""}
            onChange={(event) => {
              const point = polygonPoint(state, event.target.value);
              if (!point) return;
              commit({ ...state, selectedPointId: point.id }, `Wybrano ${point.label} do wpisania współrzędnych.`);
              setXInput(String(point.x));
              setYInput(String(point.y));
            }}
          >
            {state.polygon.vertexIds.map((id) => {
              const point = polygonPoint(state, id);
              return point ? <option key={id} value={id}>{point.label}</option> : null;
            })}
          </select>
        </label>
        <label>x <input aria-label="x" inputMode="numeric" value={xInput} onChange={(event) => setXInput(event.target.value)} /></label>
        <label>y <input aria-label="y" inputMode="numeric" value={yInput} onChange={(event) => setYInput(event.target.value)} /></label>
        <button type="button" onClick={applyCoordinates}>Umieść</button>
        <button type="button" aria-label="Przesuń w lewo" onClick={() => moveSelectedBy(-1, 0)}>←</button>
        <button type="button" aria-label="Przesuń w górę" onClick={() => moveSelectedBy(0, -1)}>↑</button>
        <button type="button" aria-label="Przesuń w dół" onClick={() => moveSelectedBy(0, 1)}>↓</button>
        <button type="button" aria-label="Przesuń w prawo" onClick={() => moveSelectedBy(1, 0)}>→</button>
      </InteractionAlternativePanel>

      <section className={styles.response} aria-label="Odpowiedź do zadania">
        {task.activity === "validity" ? (
          <>
            <fieldset><legend>Czy pokazany rysunek jest wielokątem?</legend>
              <label><input type="radio" name="polygon-choice" checked={validityAnswer === "polygon"} onChange={() => setValidityAnswer("polygon")} /> Tak, jest wielokątem</label>
              <label><input type="radio" name="polygon-choice" checked={validityAnswer === "not-polygon"} onChange={() => setValidityAnswer("not-polygon")} /> Nie jest wielokątem</label>
            </fieldset>
            <label>Najważniejszy warunek
              <select aria-label="Najważniejszy warunek" value={conditionChoice ?? ""} onChange={(event) => setConditionChoice(event.target.value as ConditionChoice)}>
                <option value="">Wybierz uzasadnienie</option>
                {(Object.keys(CONDITION_LABELS) as ConditionChoice[]).map((condition) => <option key={condition} value={condition}>{CONDITION_LABELS[condition]}</option>)}
              </select>
            </label>
          </>
        ) : null}

        {task.activity !== "validity" && task.activity !== "elements" && task.activity !== "reshape" ? (
          <label>Nazwa figury
            <select aria-label="Nazwa figury" value={selectedName} onChange={(event) => setSelectedName(event.target.value)}>
              <option value="">Wybierz nazwę</option>
              {[3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={polygonNameForSideCount(count)}>{polygonNameForSideCount(count)}</option>)}
            </select>
          </label>
        ) : null}

        {(task.activity === "elements" || task.activity === "independent") ? (
          <div className={styles.elementEvidence}>
            <p><strong>Wierzchołek:</strong> {polygonPoint(state, selectedVertexId ?? "")?.label ?? "—"}</p>
            <p><strong>Bok:</strong> {selectedEdgeId ? edges.find((edge) => edge.id === selectedEdgeId)?.label ?? "wybrany" : "—"}</p>
            <p><strong>Przekątna:</strong> {diagonal ? `${polygonPoint(state, diagonal[0])?.label}${polygonPoint(state, diagonal[1])?.label}` : "—"}</p>
            <p className={styles.small}>Wybierz punkt, bok i następnie niesąsiedni punkt. W poziomie Wsparcie zadania samodzielnego przekątna jest opcjonalna.</p>
          </div>
        ) : null}

        {task.activity === "independent" && task.difficulty === "challenge" ? (
          <label>Obwód do 0,1 jednostki
            <input aria-label="Obwód do 0,1 jednostki" inputMode="decimal" value={perimeterInput} onChange={(event) => setPerimeterInput(event.target.value)} />
          </label>
        ) : null}

        <button type="button" className={styles.checkButton} onClick={submit}>Sprawdź odpowiedź</button>
      </section>

      <p role="status" aria-live="polite" className={styles.announcement}>{announcement}</p>

      {feedback ? (
        mode === "assessment" && !assessmentSubmitted ? (
          <DiagnosticFeedbackPanel result={feedback.result} copy={DIAGNOSTIC_COPY[feedback.code]} highlights={feedback.highlights} mode="assessment" submitted={false} />
        ) : mode === "assessment" ? (
          <DiagnosticFeedbackPanel result={feedback.result} copy={DIAGNOSTIC_COPY[feedback.code]} highlights={feedback.highlights} mode="assessment" submitted solution={SOLUTION} />
        ) : (
          <DiagnosticFeedbackPanel result={feedback.result} copy={DIAGNOSTIC_COPY[feedback.code]} highlights={feedback.highlights} mode="practice" submitted solution={SOLUTION} />
        )
      ) : null}

      <section className={styles.dataTable} aria-label="Współrzędne i diagnostyka elementów">
        <h3>Współrzędne wierzchołków</h3>
        <table>
          <thead><tr><th>Wierzchołek</th><th>x</th><th>y</th><th>Stan</th></tr></thead>
          <tbody>
            {state.polygon.vertexIds.map((id) => {
              const point = polygonPoint(state, id)!;
              const attention = analysis.offendingVertexIds.includes(id);
              return <tr key={id} data-diagnostic={attention ? "attention" : "ok"}><th>{point.label}</th><td>{Math.round(point.x)}</td><td>{Math.round(point.y)}</td><td>{attention ? "powtarza się" : "różny"}</td></tr>;
            })}
          </tbody>
        </table>
        <p>Krawędzie wymagające uwagi: {analysis.offendingEdgeIds.length ? analysis.offendingEdgeIds.map((id) => edges.find((edge) => edge.id === id)?.label ?? id).join(", ") : "brak"}.</p>
      </section>

      <section className={styles.printOnly} data-polygon-print>
        <h2>{ACTIVITY_TITLES[task.activity]} — zapis papierowy</h2>
        <p>Narysuj aktualną figurę na siatce. Oznacz wierzchołki literami, boki linią ciągłą, a jedną przekątną linią przerywaną.</p>
        <p>Wierzchołki: ____ · Boki: ____ · Nazwa: ____ · Obwód: ____.</p>
        <p>Sprawdzenie: □ domknięta □ tylko odcinki □ bez samoprzecięcia □ różne wierzchołki.</p>
      </section>
    </section>
  );
}
