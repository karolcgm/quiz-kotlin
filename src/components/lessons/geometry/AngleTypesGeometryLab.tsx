"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  ANGLE_TYPE_LABELS,
  angleArmLengths,
  angleMatchesTarget,
  angleMeasureDegrees,
  angleRotationDegrees,
  angleTypesSeedFor,
  classifyAngleState,
  createAngleTypesGeometryState,
  createPublicAngleTypesTask,
  rotateWholeAngleBy,
  rotateWholeAngleTo,
  setAngleArmLength,
  setAngleMeasure,
} from "@/lib/math/geometry/angleTypes";
import type {
  AngleTypeKind,
  AngleTypesActivity,
} from "@/lib/math/geometry/angleTypes";
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
import styles from "@/components/lessons/geometry/angleTypes.module.css";

type AngleElementLabel = "vertex" | "arm" | "arc";
type AngleDiagnosticCode =
  | "ANGLE_EMPTY_PREDICTION"
  | "ANGLE_LABEL_NOT_SELECTED"
  | "ANGLE_TYPE_MISCLASSIFIED"
  | "ANGLE_ELEMENT_MISPLACED"
  | "ANGLE_LENGTH_BIAS"
  | "ANGLE_TARGET_NOT_REACHED"
  | "ANGLE_INTERFACE_INPUT";

const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  support: "Przykład 1",
  core: "Przykład 2",
  challenge: "Przykład 3",
};

const ACTIVITY_TITLES: Record<AngleTypesActivity, string> = {
  predict: "Rozchyl ramiona",
  elements: "Co tworzy kąt?",
  "length-invariance": "Długie ramię nie znaczy większy kąt",
  gates: "Bramki 90° i 180°",
  spotlights: "Reflektory sceniczne",
  independent: "Samodzielna klasyfikacja",
};

const ELEMENT_LABELS: Record<AngleElementLabel, string> = {
  vertex: "wierzchołek",
  arm: "ramię",
  arc: "łuk",
};

const DIAGNOSTIC_COPY: Record<AngleDiagnosticCode, DiagnosticFeedbackCopy> = {
  ANGLE_EMPTY_PREDICTION: {
    area: "Nie wybrano jeszcze przewidywanego rodzaju kąta.",
    guidingQuestion: "Czy rozchylenie jest mniejsze, równe czy większe od kąta prostego?",
    visualHint: "Porównaj łuk z bramką 90° i dopiero wybierz nazwę.",
    analogousExample: "Kąt 40° jest mniejszy od 90°, więc jest ostry.",
  },
  ANGLE_LABEL_NOT_SELECTED: {
    area: "Nie wybrano etykiety do umieszczenia.",
    guidingQuestion: "Który napis chcesz teraz połączyć z elementem modelu?",
    visualHint: "Najpierw wybierz przycisk ● wierzchołek, → ramię albo ⌒ łuk, a potem wskaż cel.",
    analogousExample: "Dla ∠ABC najpierw wybierz „wierzchołek”, a potem wskaż punkt B.",
  },
  ANGLE_TYPE_MISCLASSIFIED: {
    area: "Wybrana nazwa nie zgadza się z aktualnym rozchyleniem ramion.",
    guidingQuestion: "Po której stronie granicy 90° znajduje się aktualna miara?",
    visualHint: "Łuk, symbol granicy i miara są oznaczone różnymi wzorami, nie tylko kolorem.",
    analogousExample: "89° to nadal kąt ostry, a dopiero dokładnie 90° to kąt prosty.",
  },
  ANGLE_ELEMENT_MISPLACED: {
    area: "Etykieta trafiła na inny element kąta.",
    guidingQuestion: "Czy wskazujesz wspólny początek ramion, półprostą czy zakrzywiony znacznik rozchylenia?",
    visualHint: "Wierzchołek ma symbol ●, ramię strzałkę →, a łuk zakrzywiony znak ⌒.",
    analogousExample: "W ∠ABC środkowa litera B oznacza wierzchołek.",
  },
  ANGLE_LENGTH_BIAS: {
    area: "Porównano długość ramion zamiast ich rozchylenia.",
    guidingQuestion: "Co stanie się po nałożeniu krótszych ramion na dłuższe przy wspólnym wierzchołku?",
    visualHint: "Przerywany krótszy kąt pokrywa się z pełnymi ramionami i ma ten sam łuk.",
    analogousExample: "Dwa kąty po 60° pozostają równe, nawet gdy jeden narysowano dłuższymi ramionami.",
  },
  ANGLE_TARGET_NOT_REACHED: {
    area: "Reflektor nie ma jeszcze wymaganego rodzaju kąta.",
    guidingQuestion: "Czy trzeba zmniejszyć rozchylenie, ustawić dokładnie 90°, czy przekroczyć 90° bez osiągania 180°?",
    visualHint: "Karta sytuacji podaje nazwę celu, a tabela pokazuje aktualną miarę i rodzaj.",
    analogousExample: "Dla szerokiej kurtyny 120° spełnia warunek kąta rozwartego.",
  },
  ANGLE_INTERFACE_INPUT: {
    area: "Pole liczbowe jest puste albo zawiera wartość poza dostępnym zakresem.",
    guidingQuestion: "Czy wpisano liczbę z zakresu podanego przy polu?",
    visualHint: "Miara kąta: 1–180°, obrót: 0–359°, długość ramienia: 70–240.",
    analogousExample: "Wpis 90 w polu miary ustawia dokładnie kąt prosty.",
  },
};

const DIAGNOSTIC_SOLUTIONS: Record<AngleDiagnosticCode, DiagnosticSolution> = {
  ANGLE_EMPTY_PREDICTION: { steps: ["Porównaj rozchylenie z 90°.", "Wybierz jedną nazwę.", "Dopiero wtedy odsłoń klasyfikację."] },
  ANGLE_LABEL_NOT_SELECTED: { steps: ["Wybierz jedną etykietę.", "Wskaż pasujący symbol na modelu.", "Powtórz dla pozostałych dwóch etykiet."] },
  ANGLE_TYPE_MISCLASSIFIED: { steps: ["Odczytaj miarę po przewidywaniu.", "Porównaj ją z 90° i 180°.", "Zmień nazwę zgodnie z właściwym przedziałem."] },
  ANGLE_ELEMENT_MISPLACED: { steps: ["Wybierz etykietę.", "Znajdź odpowiadający jej symbol na modelu.", "Użyj wybierz → umieść ponownie."] },
  ANGLE_LENGTH_BIAS: { steps: ["Nałóż kąty na wspólny wierzchołek.", "Porównaj kierunki ramion.", "Wybierz: kąty są równe."] },
  ANGLE_TARGET_NOT_REACHED: { steps: ["Odczytaj wymagany rodzaj.", "Zmień miarę strzałkami lub liczbą.", "Sprawdź właściwą granicę i zatwierdź."] },
  ANGLE_INTERFACE_INPUT: { steps: ["Sprawdź zakres pola.", "Wpisz pełną liczbę.", "Zatwierdź zmianę i odczytaj komunikat modelu."] },
};

function diagnosticPresentation(code: AngleDiagnosticCode) {
  const memberIds = code === "ANGLE_ELEMENT_MISPLACED"
    ? ["vertex-b", "ray-ba", "ray-bc", "angle-abc"]
    : ["ray-ba", "ray-bc", "angle-abc"];
  const highlight: DiagnosticHighlightTarget = {
    id: `angle-${code.toLocaleLowerCase("en-US")}`,
    kind: code === "ANGLE_ELEMENT_MISPLACED" || code === "ANGLE_LABEL_NOT_SELECTED" ? "vertex" : "pair",
    memberIds,
    label: DIAGNOSTIC_COPY[code].area,
    state: "attention",
    pattern: "dashed",
    symbol: code === "ANGLE_ELEMENT_MISPLACED" || code === "ANGLE_LABEL_NOT_SELECTED" ? "● → ⌒" : "∠ ?",
    accent: code === "ANGLE_LENGTH_BIAS" ? "violet" : "amber",
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
  const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
}

function directionTo(vertex: GeometryPointCoordinates, point: GeometryPointCoordinates): number {
  return ((Math.atan2(point.y - vertex.y, point.x - vertex.x) * 180 / Math.PI) % 360 + 360) % 360;
}

function angleArc(
  vertex: GeometryPointCoordinates,
  rotation: number,
  measure: number,
  radius = 62,
): { path: string; label: GeometryPointCoordinates } {
  const firstRadians = rotation * Math.PI / 180;
  const secondRadians = (rotation + measure) * Math.PI / 180;
  const middleRadians = (rotation + measure / 2) * Math.PI / 180;
  const start = { x: vertex.x + Math.cos(firstRadians) * radius, y: vertex.y + Math.sin(firstRadians) * radius };
  const end = { x: vertex.x + Math.cos(secondRadians) * radius, y: vertex.y + Math.sin(secondRadians) * radius };
  return {
    path: `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`,
    label: { x: vertex.x + Math.cos(middleRadians) * (radius + 34), y: vertex.y + Math.sin(middleRadians) * (radius + 34) },
  };
}

function activateWithKeyboard(event: KeyboardEvent<SVGElement>, action: () => void): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

export interface AngleTypesGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  highContrast?: boolean;
  assessmentSubmitted?: boolean;
  onStateChange?: (state: GeometryLabState) => void;
}

export function AngleTypesGeometryLab({
  seed,
  mode = "practice",
  readOnly = false,
  highContrast = false,
  assessmentSubmitted = false,
  onStateChange,
}: AngleTypesGeometryLabProps) {
  const initialTask = createPublicAngleTypesTask(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => createGeometryHistory(createAngleTypesGeometryState(seed, mode)));
  const state = history.present;
  const stateSeed = Math.round(pointById(state.points, "seed-marker")?.x ?? seed);
  const task = createPublicAngleTypesTask(stateSeed);
  const activity = task.activity;
  const measure = angleMeasureDegrees(state);
  const rotation = angleRotationDegrees(state);
  const lengths = angleArmLengths(state);
  const kind = classifyAngleState(state);
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [prediction, setPrediction] = useState<AngleTypeKind | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<AngleElementLabel | null>(null);
  const [placedLabels, setPlacedLabels] = useState<AngleElementLabel[]>([]);
  const [comparisonAnswer, setComparisonAnswer] = useState<"first" | "second" | "equal" | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState<AngleDiagnosticCode | null>(null);
  const [internalSubmitted, setInternalSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState("Model gotowy. Najpierw wykonaj polecenie, potem sprawdź klasyfikację.");
  const drag = useRef<"measure" | "rotation" | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const locked = readOnly || assessmentSubmitted || (mode === "assessment" && internalSubmitted);

  const resetResponse = () => {
    setPrediction(null);
    setRevealed(false);
    setSelectedLabel(null);
    setPlacedLabels([]);
    setComparisonAnswer(null);
    setDiagnosticCode(null);
    setInternalSubmitted(false);
  };

  const publish = (next: GeometryLabState) => onStateChange?.(next);

  const commit = (next: GeometryLabState, message: string, keepResponse = false) => {
    const normalized = { ...next, mode };
    setHistory((current) => commitGeometryHistory(current, normalized));
    if (!keepResponse && (activity === "predict" || activity === "independent")) {
      setPrediction(null);
      setRevealed(false);
    }
    setDiagnosticCode(null);
    setInternalSubmitted(false);
    setAnnouncement(message);
    publish(normalized);
  };

  const chooseDifficulty = (nextDifficulty: LessonDifficulty) => {
    const nextSeed = angleTypesSeedFor(activity, nextDifficulty);
    const next = createAngleTypesGeometryState(nextSeed, mode);
    setDifficulty(nextDifficulty);
    setHistory(createGeometryHistory(next));
    resetResponse();
    setAnnouncement(`Poziom ${DIFFICULTY_LABELS[nextDifficulty]}. Ustawiono nową deterministyczną konfigurację.`);
    publish(next);
  };

  const changeHistory = (next: GeometryHistoryState, message: string) => {
    setHistory(next);
    resetResponse();
    setAnnouncement(message);
    publish(next.present);
  };

  const changeMeasure = (degrees: number, message = "Zmieniono rozchylenie ramion.") => {
    if (locked) return;
    commit(setAngleMeasure(state, degrees), message);
  };

  const changeRotation = (degrees: number) => {
    if (locked) return;
    commit(rotateWholeAngleTo(state, degrees), "Obrócono całą figurę bez zmiany miary kąta.", true);
  };

  const readNumber = (raw: string, min: number, max: number): number | null => {
    const value = Number(raw);
    if (raw.trim() === "" || !Number.isFinite(value) || value < min || value > max) {
      setDiagnosticCode("ANGLE_INTERFACE_INPUT");
      setAnnouncement(`Wpisz liczbę od ${min} do ${max}. Poprzednie ustawienie pozostaje bez zmian.`);
      return null;
    }
    return value;
  };

  const startMeasureDrag = (event: PointerEvent<SVGElement>) => {
    if (locked) return;
    drag.current = "measure";
    dragStart.current = state;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const startRotationDrag = (event: PointerEvent<SVGElement>) => {
    if (locked) return;
    drag.current = "rotation";
    dragStart.current = state;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const continueDrag = (event: PointerEvent<SVGElement>) => {
    if (!drag.current || locked) return;
    const point = pointFromPointer(event, state);
    const vertex = pointById(state.points, "vertex-b");
    if (!point || !vertex) return;
    let next = state;
    if (drag.current === "rotation") {
      next = rotateWholeAngleTo(state, directionTo(vertex, point));
    } else {
      const pointerDirection = directionTo(vertex, point);
      const clockwise = ((pointerDirection - rotation) % 360 + 360) % 360;
      const candidate = clockwise > 180 ? 360 - clockwise : clockwise;
      next = setAngleMeasure(state, Math.max(1, candidate));
    }
    setHistory((current) => ({ ...current, present: next, future: [] }));
    if (activity === "predict" || activity === "independent") {
      setPrediction(null);
      setRevealed(false);
    }
    setDiagnosticCode(null);
    setInternalSubmitted(false);
    setAnnouncement(`Aktualna miara: ${angleMeasureDegrees(next).toFixed(0)}°. Klasyfikacja zaktualizowana.`);
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

  const handleMeasureKey = (event: KeyboardEvent<SVGElement>) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step;
    changeMeasure(measure + delta, `Zmieniono miarę o ${Math.abs(delta)}°.`);
  };

  const handleRotationKey = (event: KeyboardEvent<SVGElement>) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    const delta = event.key === "ArrowRight" || event.key === "ArrowUp" ? step : -step;
    if (locked) return;
    commit(rotateWholeAngleBy(state, delta), `Obrócono całą figurę o ${Math.abs(delta)}° bez zmiany kąta.`, true);
  };

  const makePrediction = (answer: AngleTypeKind) => {
    setPrediction(answer);
    setRevealed(true);
    const correct = answer === kind;
    setDiagnosticCode(correct ? null : "ANGLE_TYPE_MISCLASSIFIED");
    setInternalSubmitted(mode === "assessment");
    setAnnouncement(correct
      ? `✓ Trafne przewidywanie: ${ANGLE_TYPE_LABELS[kind]}.`
      : "Przewidywanie zapisane. Porównaj miarę z bramkami 90° i 180°.");
  };

  const placeLabel = (target: AngleElementLabel) => {
    if (!selectedLabel) {
      setDiagnosticCode("ANGLE_LABEL_NOT_SELECTED");
      setAnnouncement("Najpierw wybierz etykietę, potem wskaż miejsce.");
      return;
    }
    if (selectedLabel !== target) {
      setDiagnosticCode("ANGLE_ELEMENT_MISPLACED");
      setAnnouncement(`Etykieta „${ELEMENT_LABELS[selectedLabel]}” nie pasuje do wskazanego miejsca.`);
      return;
    }
    setPlacedLabels((current) => current.includes(target) ? current : [...current, target]);
    setSelectedLabel(null);
    setDiagnosticCode(null);
    setAnnouncement(`✓ Umieszczono etykietę „${ELEMENT_LABELS[target]}”.`);
  };

  const checkComparison = (answer: "first" | "second" | "equal") => {
    setComparisonAnswer(answer);
    const correct = answer === "equal";
    setDiagnosticCode(correct ? null : "ANGLE_LENGTH_BIAS");
    setAnnouncement(correct
      ? "✓ Kąty są równe: długość ramion nie zmienia rozchylenia."
      : "Porównano długość ramion. Nałóż łuki i sprawdź rozchylenie.");
  };

  const checkSpotlight = () => {
    const correct = task.targetKind ? angleMatchesTarget(state, task.targetKind) : false;
    setDiagnosticCode(correct ? null : "ANGLE_TARGET_NOT_REACHED");
    setInternalSubmitted(mode === "assessment");
    setAnnouncement(correct
      ? `✓ Reflektor ustawiony: ${ANGLE_TYPE_LABELS[kind]}.`
      : "Ustawienie nie spełnia jeszcze warunku sytuacji. Sprawdź granicę kąta.");
  };

  const vertex = pointById(state.points, "vertex-b")!;
  const first = pointById(state.points, "point-a")!;
  const second = pointById(state.points, "point-c")!;
  const arc = angleArc(vertex, rotation, measure);
  const shortFirstRadians = rotation * Math.PI / 180;
  const shortSecondRadians = (rotation + measure) * Math.PI / 180;
  const shortFirst = { x: vertex.x + Math.cos(shortFirstRadians) * 90, y: vertex.y + Math.sin(shortFirstRadians) * 90 };
  const shortSecond = { x: vertex.x + Math.cos(shortSecondRadians) * 90, y: vertex.y + Math.sin(shortSecondRadians) * 90 };
  const showClassification = activity !== "predict" && activity !== "independent" || revealed || assessmentSubmitted;
  const diagnostic = diagnosticCode ? diagnosticPresentation(diagnosticCode) : null;
  const rows = [
    { element: "Wierzchołek", value: "B", property: "wspólny początek ramion BA i BC" },
    { element: "Ramię 1", value: `${lengths.first.toFixed(0)} j.`, property: "półprosta BA" },
    { element: "Ramię 2", value: `${lengths.second.toFixed(0)} j.`, property: "półprosta BC" },
    { element: "Miara", value: showClassification ? `${measure.toFixed(0)}°` : "ukryta do przewidywania", property: "z bieżących współrzędnych" },
    { element: "Rodzaj", value: showClassification ? ANGLE_TYPE_LABELS[kind] : "ukryty do przewidywania", property: "granice 90° i 180°" },
    { element: "Obrót figury", value: `${rotation.toFixed(0)}°`, property: "nie zmienia miary kąta" },
  ];

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-geometry-lab data-angle-types-lab data-activity={activity} data-difficulty={difficulty} data-mode={mode}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>geometry-lab · M5-4.2 · {DIFFICULTY_LABELS[difficulty]}</p>
          <h2 className={styles.title}>{ACTIVITY_TITLES[activity]}</h2>
          <p className={styles.description}>{task.prompt}</p>
        </div>
        <span className={styles.kindBadge} data-kind={showClassification ? kind : "hidden"}>
          {showClassification ? `∠ABC · ${ANGLE_TYPE_LABELS[kind]}` : "? najpierw przewidź"}
        </span>
      </header>

      <div className={`${styles.controls} ${styles.interactiveOnly}`} aria-label="Trzy deterministyczne poziomy">
        {(["support", "core", "challenge"] as const).map((item) => (
          <button key={item} type="button" disabled={locked} aria-pressed={difficulty === item} onClick={() => chooseDifficulty(item)}>{DIFFICULTY_LABELS[item]}</button>
        ))}
      </div>

      {activity === "spotlights" ? (
        <div className={`${styles.scenarios} ${styles.interactiveOnly}`} aria-label="Trzy sytuacje reflektorów">
          <button type="button" disabled={locked} onClick={() => chooseDifficulty("support")}>1 · Wąski snop</button>
          <button type="button" disabled={locked} onClick={() => chooseDifficulty("core")}>2 · Narożnik</button>
          <button type="button" disabled={locked} onClick={() => chooseDifficulty("challenge")}>3 · Kurtyna</button>
        </div>
      ) : null}

      <div className={`${styles.history} ${styles.interactiveOnly}`}>
        <button type="button" disabled={locked || history.past.length === 0} onClick={() => changeHistory(undoGeometryHistory(history), "Cofnięto zmianę.")}>↶ Cofnij</button>
        <button type="button" disabled={locked || history.future.length === 0} onClick={() => changeHistory(redoGeometryHistory(history), "Ponowiono zmianę.")}>↷ Ponów</button>
        <button type="button" disabled={locked} onClick={() => changeHistory(resetGeometryHistory(history), "Przywrócono konfigurację początkową.")}>Reset</button>
      </div>

      {(activity === "predict" || activity === "independent") ? (
        <div className={`${styles.predictions} ${styles.interactiveOnly}`} aria-label="Przewidź rodzaj kąta">
          {(Object.keys(ANGLE_TYPE_LABELS) as AngleTypeKind[]).map((answer) => (
            <button key={answer} type="button" disabled={locked} aria-pressed={prediction === answer} onClick={() => makePrediction(answer)}>{ANGLE_TYPE_LABELS[answer]}</button>
          ))}
        </div>
      ) : null}

      {activity === "gates" ? (
        <div className={`${styles.gates} ${styles.interactiveOnly}`} aria-label="Bramki klasyfikacji">
          {[89, 90, 91, 180].map((degrees) => <button key={degrees} type="button" disabled={locked} onClick={() => changeMeasure(degrees, `Ustawiono dokładnie ${degrees}°.`)}>{degrees}°</button>)}
        </div>
      ) : null}

      {activity === "elements" ? (
        <div className={`${styles.labels} ${styles.interactiveOnly}`} aria-label="Etykiety elementów kąta">
          {(Object.keys(ELEMENT_LABELS) as AngleElementLabel[]).map((label) => (
            <button key={label} type="button" disabled={locked || placedLabels.includes(label)} aria-pressed={selectedLabel === label} onClick={() => setSelectedLabel(label)}>{label === "vertex" ? "●" : label === "arm" ? "→" : "⌒"} {ELEMENT_LABELS[label]}</button>
          ))}
          <span>{placedLabels.length}/3 umieszczone</span>
        </div>
      ) : null}

      {activity === "length-invariance" ? (
        <div className={`${styles.predictions} ${styles.interactiveOnly}`} aria-label="Porównanie kątów o różnych ramionach">
          <span>Który kąt jest większy?</span>
          <button type="button" aria-pressed={comparisonAnswer === "first"} onClick={() => checkComparison("first")}>z dłuższymi ramionami</button>
          <button type="button" aria-pressed={comparisonAnswer === "second"} onClick={() => checkComparison("second")}>z krótszymi ramionami</button>
          <button type="button" aria-pressed={comparisonAnswer === "equal"} onClick={() => checkComparison("equal")}>są równe</button>
        </div>
      ) : null}

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={`${ACTIVITY_TITLES[activity]} — kąt ABC`}
          description={`Kąt ABC ma wierzchołek B i ramiona BA oraz BC. ${showClassification ? `Miara ${measure.toFixed(0)} stopni, ${ANGLE_TYPE_LABELS[kind]}.` : "Miara i rodzaj pozostają ukryte do przewidywania."} Obrót całej figury ${rotation.toFixed(0)} stopni.`}
          viewBox="0 0 720 460"
          className={styles.svg}
          columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Własność" }]}
          rows={rows}
        >
          <defs>
            <pattern id="angle-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" /></pattern>
            <marker id="angle-arrow-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={highContrast ? "#000" : "#075985"} /></marker>
            <marker id="angle-arrow-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill={highContrast ? "#444" : "#7c3aed"} /></marker>
          </defs>
          <rect width="720" height="460" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="720" height="460" fill="url(#angle-grid)" opacity={highContrast ? ".18" : ".62"} />

          {activity === "spotlights" ? <circle cx={vertex.x} cy={vertex.y} r="135" fill="#fef3c7" opacity=".22" data-stage-light /> : null}
          {activity === "length-invariance" ? (
            <g data-short-angle-overlay>
              <line x1={vertex.x} y1={vertex.y} x2={shortFirst.x} y2={shortFirst.y} stroke="#0f766e" strokeWidth="9" strokeDasharray="5 7" />
              <line x1={vertex.x} y1={vertex.y} x2={shortSecond.x} y2={shortSecond.y} stroke="#0f766e" strokeWidth="9" strokeDasharray="5 7" />
              <text x={vertex.x + 10} y={vertex.y + 86} fill="#115e59" fontSize="16" fontWeight="900">nałożenie: ten sam łuk ⌒</text>
            </g>
          ) : null}

          <line x1={vertex.x} y1={vertex.y} x2={first.x} y2={first.y} stroke={highContrast ? "#000" : "#075985"} strokeWidth="11" strokeLinecap="round" markerEnd="url(#angle-arrow-a)" data-angle-arm="BA" />
          <line x1={vertex.x} y1={vertex.y} x2={second.x} y2={second.y} stroke={highContrast ? "#444" : "#7c3aed"} strokeWidth="9" strokeDasharray="18 7" strokeLinecap="round" markerEnd="url(#angle-arrow-c)" data-angle-arm="BC" />
          <path d={arc.path} fill="none" stroke="#c2410c" strokeWidth="7" data-angle-type-arc />

          {measure === 90 ? <path d={`M ${vertex.x + Math.cos(rotation * Math.PI / 180) * 24} ${vertex.y + Math.sin(rotation * Math.PI / 180) * 24} L ${vertex.x + Math.cos(rotation * Math.PI / 180) * 24 + Math.cos((rotation + 90) * Math.PI / 180) * 24} ${vertex.y + Math.sin(rotation * Math.PI / 180) * 24 + Math.sin((rotation + 90) * Math.PI / 180) * 24} L ${vertex.x + Math.cos((rotation + 90) * Math.PI / 180) * 24} ${vertex.y + Math.sin((rotation + 90) * Math.PI / 180) * 24}`} fill="none" stroke="#111827" strokeWidth="4" data-right-angle-square /> : null}
          {showClassification ? <text x={arc.label.x} y={arc.label.y} textAnchor="middle" fill="#9a3412" fontSize="21" fontWeight="900" data-angle-measure>{measure.toFixed(0)}° · {ANGLE_TYPE_LABELS[kind]}</text> : <text x={arc.label.x} y={arc.label.y} textAnchor="middle" fill="#9a3412" fontSize="25" fontWeight="900">?</text>}

          <circle cx={vertex.x} cy={vertex.y} r="10" fill="#fff" stroke="#be123c" strokeWidth="5" />
          <text x={first.x + 12} y={first.y - 12} fill="#075985" fontSize="22" fontWeight="900">A</text>
          <text x={vertex.x + 15} y={vertex.y + 28} fill="#9f1239" fontSize="22" fontWeight="900">B · ●</text>
          <text x={second.x + 12} y={second.y - 12} fill="#6d28d9" fontSize="22" fontWeight="900">C</text>

          {activity === "elements" ? (
            <g data-angle-label-targets>
              <circle cx={vertex.x} cy={vertex.y} r="26" fill="transparent" stroke={selectedLabel === "vertex" ? "#0ea5e9" : "transparent"} strokeWidth="4" role="button" tabIndex={0} aria-label="Umieść etykietę na wierzchołku B" onClick={() => placeLabel("vertex")} onKeyDown={(event) => activateWithKeyboard(event, () => placeLabel("vertex"))} />
              <line x1={vertex.x} y1={vertex.y} x2={first.x} y2={first.y} stroke="transparent" strokeWidth="52" role="button" tabIndex={0} aria-label="Umieść etykietę na ramieniu BA" onClick={() => placeLabel("arm")} onKeyDown={(event) => activateWithKeyboard(event, () => placeLabel("arm"))} />
              <path d={arc.path} fill="none" stroke="transparent" strokeWidth="52" role="button" tabIndex={0} aria-label="Umieść etykietę na łuku kąta" onClick={() => placeLabel("arc")} onKeyDown={(event) => activateWithKeyboard(event, () => placeLabel("arc"))} />
              {placedLabels.includes("vertex") ? <text x={vertex.x - 95} y={vertex.y + 6} fill="#111827" fontSize="18" fontWeight="900">● wierzchołek</text> : null}
              {placedLabels.includes("arm") ? <text x={(vertex.x + first.x) / 2} y={(vertex.y + first.y) / 2 - 18} fill="#111827" fontSize="18" fontWeight="900">→ ramię</text> : null}
              {placedLabels.includes("arc") ? <text x={arc.label.x} y={arc.label.y + 25} textAnchor="middle" fill="#111827" fontSize="18" fontWeight="900">⌒ łuk</text> : null}
            </g>
          ) : !locked ? (
            <g className={styles.interactiveOnly}>
              <circle cx={second.x} cy={second.y} r="26" fill="transparent" stroke="#f59e0b" strokeWidth="4" role="slider" tabIndex={0} aria-label={`Rozchyl ramię BC. Kąt ${measure.toFixed(0)} stopni`} aria-valuemin={1} aria-valuemax={180} aria-valuenow={Math.round(measure)} data-angle-measure-handle onKeyDown={handleMeasureKey} onPointerDown={startMeasureDrag} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "grab", touchAction: "none" }} />
              <circle cx={first.x} cy={first.y} r="26" fill="transparent" stroke="#0ea5e9" strokeWidth="4" role="slider" tabIndex={0} aria-label={`Obróć całą figurę. Obrót ${rotation.toFixed(0)} stopni`} aria-valuemin={0} aria-valuemax={359} aria-valuenow={Math.round(rotation)} data-angle-rotation-handle onKeyDown={handleRotationKey} onPointerDown={startRotationDrag} onPointerMove={continueDrag} onPointerUp={finishDrag} onPointerCancel={finishDrag} style={{ cursor: "grab", touchAction: "none" }} />
            </g>
          ) : null}
        </AccessibleMathSvg>
      </div>

      <div className={`${styles.numeric} ${styles.interactiveOnly}`}>
        <InteractionAlternativePanel title="Ustaw kąt bez przeciągania" instruction="Strzałki zmieniają miarę lub obrót o 1°, Shift + strzałka o 5°. Wpisanie liczby i zmiana długości ramion są równoważnymi alternatywami dotyku.">
          <label>Miara ° <input aria-label="Miara kąta" type="number" inputMode="numeric" min="1" max="180" value={Math.round(measure)} disabled={locked} onChange={(event) => { const value = readNumber(event.target.value, 1, 180); if (value !== null) changeMeasure(value); }} /></label>
          <button type="button" disabled={locked} onClick={() => changeMeasure(measure - 1)}>−1°</button>
          <button type="button" disabled={locked} onClick={() => changeMeasure(measure + 1)}>+1°</button>
          <label>Obrót figury ° <input aria-label="Obrót całej figury" type="number" inputMode="numeric" min="0" max="359" value={Math.round(rotation)} disabled={locked} onChange={(event) => { const value = readNumber(event.target.value, 0, 359); if (value !== null) changeRotation(value); }} /></label>
          <button type="button" disabled={locked} onClick={() => commit(rotateWholeAngleBy(state, -1), "Obrócono całą figurę o 1°.", true)}>↶ 1°</button>
          <button type="button" disabled={locked} onClick={() => commit(rotateWholeAngleBy(state, 1), "Obrócono całą figurę o 1°.", true)}>1° ↷</button>
          <label>Ramię BA <input aria-label="Długość ramienia BA" type="number" min="70" max="240" value={Math.round(lengths.first)} disabled={locked} onChange={(event) => { const value = readNumber(event.target.value, 70, 240); if (value !== null) commit(setAngleArmLength(state, "first", value), "Zmieniono długość BA; miara kąta pozostała stała.", true); }} /></label>
          <label>Ramię BC <input aria-label="Długość ramienia BC" type="number" min="70" max="240" value={Math.round(lengths.second)} disabled={locked} onChange={(event) => { const value = readNumber(event.target.value, 70, 240); if (value !== null) commit(setAngleArmLength(state, "second", value), "Zmieniono długość BC; miara kąta pozostała stała.", true); }} /></label>
        </InteractionAlternativePanel>
      </div>

      {activity === "spotlights" ? <button className={`${styles.checkButton} ${styles.interactiveOnly}`} type="button" disabled={locked} onClick={checkSpotlight}>Sprawdź reflektor</button> : null}

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

      <p className={styles.printOnly}>Na wydruku podpisz wierzchołek B, ramiona BA i BC oraz łuk. Klasyfikuj po rozchyleniu: mniej niż 90° — ostry, dokładnie 90° — prosty, między 90° a 180° — rozwarty, dokładnie 180° — półpełny.</p>
    </section>
  );
}
