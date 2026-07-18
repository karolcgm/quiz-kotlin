"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { GeometryScene } from "@/components/lessons/geometry/GeometryScene";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  TRIANGLE_ANGLE_LABELS,
  TRIANGLE_SIDE_LABELS,
  TRIANGLE_SIDE_PRESET_LABELS,
  applyTriangleSidePreset,
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

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = { support: "Zadanie 1", core: "Zadanie 2", challenge: "Zadanie 3" };
const PLAYGROUND_KIND: Record<LessonDifficulty, TriangleSideKind> = { support: "equilateral", core: "isosceles", challenge: "scalene" };

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

function TriangleSideNamesTheory({ highContrast = false }: { highContrast?: boolean }) {
  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-side-names>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rodzaje trójkątów</p>
          <h2>Podstawa i ramiona trójkąta</h2>
          <p>Każdy bok trójkąta można wybrać jako podstawę. Dwa pozostałe boki są wtedy ramionami.</p>
        </div>
      </header>
      <div className={styles.theoryFigure}>
        <AccessibleMathSvg title="Podstawa i ramiona trójkąta" description="Dolny bok jest wybraną podstawą, a dwa pozostałe boki są ramionami." viewBox="0 0 540 330" className={styles.theorySvg} columns={[{ key: "element", label: "Element" }, { key: "meaning", label: "Nazwa" }]} rows={[{ element: "dolny bok", meaning: "podstawa" }, { element: "dwa skośne boki", meaning: "ramiona" }]}>
          <polygon points="90,260 450,260 270,55" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="5" strokeLinejoin="round" />
          <line x1="90" y1="260" x2="450" y2="260" stroke="#0e7490" strokeWidth="9" strokeLinecap="round" />
          <line x1="90" y1="260" x2="270" y2="55" stroke="#7c3aed" strokeWidth="9" strokeLinecap="round" />
          <line x1="270" y1="55" x2="450" y2="260" stroke="#7c3aed" strokeWidth="9" strokeLinecap="round" />
          <text x="270" y="305" textAnchor="middle" className={styles.baseLabel}>podstawa</text>
          <text x="145" y="135" textAnchor="middle" className={styles.armLabel}>ramię</text>
          <text x="395" y="135" textAnchor="middle" className={styles.armLabel}>ramię</text>
        </AccessibleMathSvg>
        <p className={styles.theoryNote}><strong>W trójkącie równoramiennym</strong> ramiona mają taką samą długość, a trzeci bok nazywamy podstawą.</p>
      </div>
    </section>
  );
}

function RightTriangleSideNamesTheory({ highContrast = false }: { highContrast?: boolean }) {
  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-right-triangle-side-names>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rodzaje trójkątów</p>
          <h2>Boki trójkąta prostokątnego</h2>
          <p>Dwa boki tworzące kąt prosty to przyprostokątne. Bok leżący naprzeciw kąta prostego to przeciwprostokątna.</p>
        </div>
      </header>
      <div className={styles.theoryFigure}>
        <AccessibleMathSvg title="Przyprostokątne i przeciwprostokątna" description="Dwie przyprostokątne spotykają się przy kącie prostym. Przeciwprostokątna leży naprzeciw niego." viewBox="0 0 560 350" className={styles.theorySvg} columns={[{ key: "element", label: "Element" }, { key: "meaning", label: "Nazwa" }]} rows={[{ element: "dwa boki przy kącie prostym", meaning: "przyprostokątne" }, { element: "bok naprzeciw kąta prostego", meaning: "przeciwprostokątna" }]}>
          <polygon points="95,280 475,280 95,70" fill="#dcfce7" stroke="#1e3a8a" strokeWidth="5" strokeLinejoin="round" />
          <line x1="95" y1="280" x2="475" y2="280" stroke="#0e7490" strokeWidth="9" strokeLinecap="round" />
          <line x1="95" y1="280" x2="95" y2="70" stroke="#0e7490" strokeWidth="9" strokeLinecap="round" />
          <line x1="95" y1="70" x2="475" y2="280" stroke="#be123c" strokeWidth="9" strokeLinecap="round" />
          <path d="M 135 280 A 40 40 0 0 0 95 240" fill="none" stroke="#7c3aed" strokeWidth="4" data-right-angle-arc />
          <circle cx="119" cy="256" r="5" fill="#7c3aed" data-right-angle-dot />
          <text x="275" y="325" textAnchor="middle" className={styles.legLabel}>przyprostokątna</text>
          <text x="55" y="185" textAnchor="middle" className={styles.verticalLegLabel}>przyprostokątna</text>
          <text x="310" y="145" textAnchor="middle" className={styles.hypotenuseLabel}>przeciwprostokątna</text>
        </AccessibleMathSvg>
      </div>
    </section>
  );
}

const TRIANGLE_GALLERY: readonly { id: string; points: string; right?: { x: number; y: number } }[] = [
  { id: "a", points: "40,135 160,135 100,31" },
  { id: "b", points: "50,135 150,135 100,15" },
  { id: "c", points: "35,130 165,130 35,30", right: { x: 35, y: 130 } },
  { id: "d", points: "25,125 175,125 65,75" },
  { id: "e", points: "45,130 155,130 45,20", right: { x: 45, y: 130 } },
  { id: "f", points: "25,130 175,130 105,25" },
];

const GALLERY_ROUNDS = [
  { label: "równoramienne", targetIds: ["b", "e"] },
  { label: "prostokątne", targetIds: ["c", "e"] },
  { label: "różnoboczne", targetIds: ["c", "d", "f"] },
] as const;

function TriangleGalleryTask({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleTypesGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState("Kliknij wszystkie pasujące trójkąty.");
  const round = GALLERY_ROUNDS[roundIndex]!;

  const toggle = (id: string) => {
    if (readOnly) return;
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setMessage("Kliknij „Sprawdź”, gdy zaznaczysz wszystkie pasujące figury.");
    onResultChange?.(null);
  };

  const check = () => {
    const correct = selectedIds.length === round.targetIds.length && round.targetIds.every((id) => selectedIds.includes(id));
    if (!correct) {
      setMessage("Sprawdź ponownie kształt boków i oznaczenie kąta prostego.");
      onResultChange?.(false, selectedIds.join(","));
      return;
    }
    if (roundIndex < GALLERY_ROUNDS.length - 1) {
      setRoundIndex((current) => current + 1);
      setSelectedIds([]);
      setMessage("Dobrze. Oto następne zadanie.");
      onResultChange?.(null);
      return;
    }
    setMessage("Dobrze. Rozpoznajesz trójkąty według boków i kątów.");
    onResultChange?.(true, "ukończono trzy zestawy");
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-gallery>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rodzaje trójkątów</p>
          <h2>Zaznacz trójkąty {round.label}</h2>
          <p>Zadanie {roundIndex + 1} z {GALLERY_ROUNDS.length}. Na rysunkach nie podano długości ani miar kątów.</p>
        </div>
      </header>
      <div className={styles.triangleGallery}>
        {TRIANGLE_GALLERY.map((triangle) => (
          <button key={triangle.id} type="button" disabled={readOnly} aria-label={`Trójkąt ${triangle.id.toUpperCase()}`} aria-pressed={selectedIds.includes(triangle.id)} data-triangle-choice={triangle.id} onClick={() => toggle(triangle.id)}>
            <svg viewBox="0 0 200 160" aria-hidden="true">
              <polygon points={triangle.points} />
              {triangle.right ? <>
                <path d={`M ${triangle.right.x + 22} ${triangle.right.y} A 22 22 0 0 0 ${triangle.right.x} ${triangle.right.y - 22}`} data-right-angle-arc />
                <circle cx={triangle.right.x + 14} cy={triangle.right.y - 14} r="4" data-right-angle-dot />
              </> : null}
            </svg>
          </button>
        ))}
      </div>
      <button type="button" className={styles.galleryCheck} disabled={readOnly || selectedIds.length === 0} onClick={check}>Sprawdź zaznaczenie</button>
      <p className={styles.galleryMessage} role="status" aria-live="polite">{message}</p>
    </section>
  );
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
  const initialPlaygroundKind = PLAYGROUND_KIND[initialTask.difficulty];
  const [currentSeed, setCurrentSeed] = useState(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => {
    const initialState = createTriangleTypesGeometryState(seed, mode);
    return createGeometryHistory(initialTask.activity === "playground" ? applyTriangleSidePreset(initialState, initialPlaygroundKind) : initialState);
  });
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [sidePrediction, setSidePrediction] = useState<TriangleSideKind | null>(null);
  const [playgroundKind, setPlaygroundKind] = useState<TriangleSideKind>(initialPlaygroundKind);
  const [anglePrediction, setAnglePrediction] = useState<TriangleAngleKind | null>(null);
  const [revealed, setRevealed] = useState(!["predict", "independent"].includes(initialTask.activity));
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState<TriangleDiagnosticCode | null>(null);
  const [announcement, setAnnouncement] = useState(initialTask.activity === "playground"
    ? "Model gotowy. Wybierz rodzaj trójkąta według boków."
    : "Model gotowy. Przesuń wierzchołek C albo wybierz gotową konfigurację.");
  const dragPoint = useRef<string | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const state = history.present;
  const task = createPublicTriangleTypesTask(currentSeed);
  const isPlayground = task.activity === "playground";
  const analysis = useMemo(() => analyzeGeometryPolygon(state), [state]);
  const classification = useMemo(() => triangleClassifications(state), [state]);
  const evidence = useMemo(() => triangleClassificationEvidence(state), [state]);
  const feedback = diagnosticCode ? diagnostic(diagnosticCode) : null;
  const locked = readOnly || assessmentSubmitted;
  const hideAnswer = ["predict", "independent"].includes(task.activity) && !revealed;
  const selected = pointById(state.points, state.selectedPointId ?? "");

  if (task.activity === "side-names") return <TriangleSideNamesTheory highContrast={highContrast} />;
  if (task.activity === "right-side-names") return <RightTriangleSideNamesTheory highContrast={highContrast} />;
  if (task.activity === "identify-gallery") return <TriangleGalleryTask readOnly={locked} highContrast={highContrast} onResultChange={onResultChange} />;

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
    const nextKind = PLAYGROUND_KIND[nextDifficulty];
    const generated = createTriangleTypesGeometryState(nextSeed, mode);
    const next = task.activity === "playground" ? applyTriangleSidePreset(generated, nextKind) : generated;
    setDifficulty(nextDifficulty);
    setCurrentSeed(nextSeed);
    setPlaygroundKind(nextKind);
    setHistory(createGeometryHistory(next));
    resetResponse();
    publish(next);
    setAnnouncement(`Wczytano poziom ${DIFFICULTY_LABELS[nextDifficulty]}.`);
  };

  const selectPlaygroundKind = (kind: TriangleSideKind) => {
    if (locked) return;
    const next = applyTriangleSidePreset(state, kind);
    setPlaygroundKind(kind);
    setSidePrediction(kind);
    setAnglePrediction(triangleClassifications(next)?.angle ?? null);
    commit(next, `Pokazano trójkąt ${TRIANGLE_SIDE_LABELS[kind]}. Porównaj długości i kreski na bokach.`);
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

  const playgroundSideLabels = isPlayground ? TRIANGLE_SIDE_PRESET_LABELS[playgroundKind] : undefined;
  const rows = analysis.status === "valid" ? [
    ...analysis.sideLengths.map((length, index) => ({ element: ["AB", "BC", "CA"][index]!, value: playgroundSideLabels?.[index] ?? length.exact, property: "długość boku" })),
    ...analysis.angleDegrees.map((angle, index) => ({ element: ["∠A", "∠B", "∠C"][index]!, value: `${angle.toFixed(1)}°`, property: index === analysis.angleDegrees.indexOf(Math.max(...analysis.angleDegrees)) ? "największy kąt" : "kąt" })),
  ] : [{ element: "Figura", value: "—", property: "Rozdziel punkty i utwórz trójkąt" }];

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-types-lab data-activity={task.activity}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Trójkątny plac zabaw</p>
          <h2>{task.activity === "playground" ? "Rodzaje trójkątów według boków" : task.activity === "tent" ? "Namiot ekspedycji" : task.activity === "possible-pair" ? "Czy taki trójkąt może istnieć?" : "Dwie klasyfikacje jednego trójkąta"}</h2>
          <p>{task.prompt}</p>
        </div>
        <div className={styles.mascot} aria-hidden="true"><span>△</span><small>A · B · C</small></div>
      </header>

      <LessonTaskNavigator
        currentIndex={difficulty === "support" ? 0 : difficulty === "core" ? 1 : 2}
        taskCount={3}
        onPrevious={() => switchDifficulty(difficulty === "challenge" ? "core" : "support")}
        onNext={() => switchDifficulty(difficulty === "support" ? "core" : "challenge")}
        previousDisabled={locked || difficulty === "support"}
        nextDisabled={locked || difficulty === "challenge"}
      />
      <div className={styles.levels} aria-label="Historia zadania">
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => { const next = undoGeometryHistory(history); setHistory(next); publish(next.present); setAnnouncement("Cofnięto zmianę."); }}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => { const next = redoGeometryHistory(history); setHistory(next); publish(next.present); setAnnouncement("Ponowiono zmianę."); }}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => { const next = resetGeometryHistory(history); setHistory(next); resetResponse(); publish(next.present); setAnnouncement("Przywrócono początkowy trójkąt."); }}>Reset</button>
      </div>

      <div className={`${styles.workspace} ${isPlayground ? styles.playgroundWorkspace : ""}`}>
        <div className={styles.canvas}>
          <AccessibleMathSvg title="Trójkąt ABC" description={isPlayground ? "Wybór nazwy zmienia kształt trójkąta oraz pokazane długości i oznaczenia równych boków." : "Wierzchołki można przesuwać. Długości, kąty i klasyfikacje zmieniają się natychmiast."} viewBox="0 0 640 420" className={styles.svg} columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Znaczenie" }]} rows={rows}>
            <GeometryScene
              state={state}
              showHandles={!locked && !isPlayground}
              highContrast={highContrast}
              theme="playground"
              sideLengthLabels={playgroundSideLabels}
              onPointSelect={isPlayground ? undefined : (pointId) => setHistory((current) => ({ ...current, present: { ...current.present, selectedPointId: pointId } }))}
              onPointPointerDown={isPlayground ? undefined : (pointId, event) => { if (locked) return; dragPoint.current = pointId; dragStart.current = state; event.currentTarget.setPointerCapture?.(event.pointerId); }}
              onPointPointerMove={isPlayground ? undefined : (pointId, event) => { if (dragPoint.current !== pointId || locked) return; const coordinates = pointerCoordinates(event, state); if (!coordinates) return; const next = moveTriangleVertex(state, pointId, coordinates); setHistory((current) => ({ ...current, present: next, future: [] })); publish(next); setRevealed(false); }}
              onPointPointerUp={isPlayground ? undefined : (pointId, event) => { if (dragPoint.current !== pointId) return; event.currentTarget.releasePointerCapture?.(event.pointerId); const start = dragStart.current; setHistory((current) => start ? { ...current, past: [...current.past, start].slice(-100), future: [] } : current); dragPoint.current = null; dragStart.current = null; setAnnouncement("Położenie, miary i klasyfikacje zaktualizowano."); }}
              onPointKeyDown={isPlayground ? undefined : onPointKeyDown}
            />
          </AccessibleMathSvg>
          <p className={styles.live} role="status" aria-live="polite">{announcement}</p>
        </div>

        {isPlayground ? (
          <aside className={`${styles.panel} ${styles.playgroundPanel}`}>
            <div className={styles.playgroundChooser}>
              <h3>Wybierz rodzaj trójkąta według boków</h3>
              <div className={styles.kindButtons}>
                {(Object.keys(TRIANGLE_SIDE_LABELS) as TriangleSideKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    disabled={locked}
                    aria-pressed={playgroundKind === kind}
                    onClick={() => selectPlaygroundKind(kind)}
                  >
                    Trójkąt {TRIANGLE_SIDE_LABELS[kind]}
                  </button>
                ))}
              </div>
              <div className={styles.sideValues} aria-label="Długości boków wybranego trójkąta">
                {(["AB", "BC", "CA"] as const).map((label, index) => <span key={label}><b>{label}</b> = {playgroundSideLabels?.[index]}</span>)}
              </div>
              <p className={styles.markHint}>Boki z taką samą długością mają takie same kreski. Porównaj oznaczenia i podane liczby.</p>
            </div>
          </aside>
        ) : <aside className={styles.panel}>
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
        </aside>}
      </div>

      {!isPlayground ? <InteractionAlternativePanel title="Przesuń wierzchołek bez przeciągania" instruction="Wybierz punkt, użyj strzałek albo wpisz współrzędne. Każdy krok od razu zmienia rysunek i tabelę.">
        <label>Wierzchołek<select value={state.selectedPointId ?? ""} disabled={locked} onChange={(event) => setHistory((current) => ({ ...current, present: { ...current.present, selectedPointId: event.target.value } }))}>{state.polygon.vertexIds.map((id) => <option key={id} value={id}>{pointById(state.points, id)?.label}</option>)}</select></label>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x - state.grid.step, y: selected.y })}>←</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x, y: selected.y - state.grid.step })}>↑</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x, y: selected.y + state.grid.step })}>↓</button>
        <button type="button" disabled={locked || !selected} onClick={() => selected && movePoint(selected.id, { x: selected.x + state.grid.step, y: selected.y })}>→</button>
        <label>x <input aria-label="Współrzędna x" type="number" value={selected?.x ?? ""} disabled={locked || !selected} onChange={(event) => selected && movePoint(selected.id, { x: Number(event.target.value), y: selected.y })} /></label>
        <label>y <input aria-label="Współrzędna y" type="number" value={selected?.y ?? ""} disabled={locked || !selected} onChange={(event) => selected && movePoint(selected.id, { x: selected.x, y: Number(event.target.value) })} /></label>
      </InteractionAlternativePanel> : null}

      {feedback ? mode === "assessment"
        ? assessmentSubmitted
          ? <DiagnosticFeedbackPanel {...feedback} mode="assessment" submitted />
          : <DiagnosticFeedbackPanel result={feedback.result} copy={feedback.copy} highlights={feedback.highlights} mode="assessment" submitted={false} />
        : <DiagnosticFeedbackPanel {...feedback} mode="practice" submitted />
      : null}
    </section>
  );
}
