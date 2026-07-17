"use client";

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
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
  support: "Przykład 1",
  core: "Przykład 2",
  challenge: "Przykład 3",
};

const ACTIVITY_TITLES: Record<VerticalAnglesActivity, string> = {
  crossing: "Skrzyżowanie prostych",
  pairs: "Pary, nie kolory",
  "one-angle": "Jeden kąt wystarcza",
  "three-lines": "Trzy proste",
  roundabout: "Rondo tramwajowe",
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

const PAIR_PATTERNS = ["stripes", "dots", "stripes", "dots"] as const;
const PAIR_SYMBOLS = ["●", "▲", "●", "▲"] as const;

function pointAt(origin: GeometryPointCoordinates, directionDegrees: number, distance: number): GeometryPointCoordinates {
  const radians = directionDegrees * Math.PI / 180;
  return { x: origin.x + Math.cos(radians) * distance, y: origin.y + Math.sin(radians) * distance };
}

function sectorPath(origin: GeometryPointCoordinates, startDegrees: number, endDegrees: number, radius: number): string {
  const start = pointAt(origin, startDegrees, radius);
  const normalizedSweep = ((endDegrees - startDegrees) % 360 + 360) % 360;
  const end = pointAt(origin, endDegrees, radius);
  return `M ${origin.x} ${origin.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${normalizedSweep > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`;
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

function pointerCoordinates(event: PointerEvent<SVGCircleElement>, state: GeometryLabState): GeometryPointCoordinates | null {
  const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
  if (!bounds || bounds.width === 0 || bounds.height === 0) return null;
  return {
    x: (event.clientX - bounds.left) / bounds.width * state.viewport.width,
    y: (event.clientY - bounds.top) / bounds.height * state.viewport.height,
  };
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

export function VerticalAnglesGeometryLab({
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
  const dragLine = useRef<IntersectionLineId | null>(null);

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

  const handleLineKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const step = event.shiftKey ? 5 : 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      changeLineDirection(direction + (event.key === "ArrowRight" ? step : -step), `Obrócono prostą o ${step}°.`);
      return;
    }
    changeLineHandle({ x: activeHandle.x, y: activeHandle.y + (event.key === "ArrowDown" ? step : -step) }, `Przesunięto uchwyt o ${step} px.`);
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
  };

  const revealByProperty = (property: PairChoice) => {
    if (locked) return;
    if (property === "vertical") {
      setRevealedAngles((current) => Array.from(new Set([...current, givenIndex, verticalIndex])));
      setAnnouncement("Kąt naprzeciwko odsłonięty: kąty wierzchołkowe są równe.");
    } else {
      setRevealedAngles((current) => Array.from(new Set([...current, givenIndex, adjacentIndex, (givenIndex + 3) % 4])));
      setAnnouncement("Kąty obok odsłonięte: każda para przyległa ma sumę 180°.");
    }
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
  };

  const showMeasure = (index: number) => {
    if (["crossing", "pairs", "three-lines"].includes(activity)) return true;
    if (activity === "one-angle") return revealedAngles.includes(index);
    return revealedAngles.includes(index);
  };

  const lineIds = (["a", "b", "c"] as const).filter((lineId) => pointById(state.points, `${lineId}-positive`));
  const rows = sectors.map((sector) => ({
    element: `Kąt ${sector.label} ${PAIR_SYMBOLS[sector.index]}`,
    value: showMeasure(sector.index) ? `${sector.measureDegrees.toFixed(0)}°` : "miara ukryta",
    property: sector.index % 2 === 0 ? "wzór: pasy; para α–γ" : "wzór: kropki; para β–δ",
  }));
  const diagnostic = diagnosticCode ? diagnosticPresentation(diagnosticCode, diagnosticScore, diagnosticMaxScore) : null;

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-geometry-lab data-vertical-angles-lab data-activity={activity} data-difficulty={difficulty} data-mode={mode} data-selected-relation={claimedRelation ?? "none"}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>geometry-lab · M5-4.4 · {DIFFICULTY_LABELS[difficulty]}</p>
          <h2>{ACTIVITY_TITLES[activity]}</h2>
          <p>{task.prompt}</p>
        </div>
        <span className={styles.badge}>O · 2 proste{activity === "three-lines" ? " + trzecia" : ""}</span>
      </header>

      <div className={`${styles.levels} ${styles.interactiveOnly}`} aria-label="Poziom pracy">
        {(["support", "core", "challenge"] as const).map((level) => <button key={level} type="button" disabled={locked} aria-pressed={difficulty === level} onClick={() => chooseDifficulty(level)}>{DIFFICULTY_LABELS[level]}</button>)}
      </div>

      {activity === "three-lines" ? (
        <div className={`${styles.controls} ${styles.interactiveOnly}`} aria-label="Wybór dwóch z trzech prostych">
          {([["a", "b"], ["a", "c"], ["b", "c"]] as const).map((pair) => <button key={pair.join("")} type="button" disabled={locked} aria-pressed={activePair[0] === pair[0] && activePair[1] === pair[1]} onClick={() => { setActivePair(pair); setSelectedAngles([]); setAnnouncement(`Aktywne proste: ${pair[0]} i ${pair[1]}. Trzecia jest wygaszona.`); }}>proste {pair[0]} + {pair[1]}</button>)}
        </div>
      ) : null}

      <div className={styles.canvas}>
        <AccessibleMathSvg
          title={`${ACTIVITY_TITLES[activity]} — przecięcie w O`}
          description={`Proste ${activePair[0]} i ${activePair[1]} przecinają się w O. Kąty naprzeciwko mają równe miary, a sąsiednie pary przyległe sumują się do 180 stopni.`}
          viewBox="0 0 760 520"
          className={styles.svg}
          columns={[{ key: "element", label: "Kąt" }, { key: "value", label: "Miara" }, { key: "property", label: "Oznaczenie niezależne od koloru" }]}
          rows={rows}
        >
          <defs>
            <pattern id="vertical-angle-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke={highContrast ? "#000" : "#cbd5e1"} strokeWidth="1" /></pattern>
            <pattern id="vertical-angle-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill={highContrast ? "#fff" : "#dbeafe"} /><line x1="0" y1="0" x2="0" y2="10" stroke={highContrast ? "#000" : "#2563eb"} strokeWidth="3" /></pattern>
            <pattern id="vertical-angle-dots" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill={highContrast ? "#fff" : "#fef3c7"} /><circle cx="4" cy="4" r="2.2" fill={highContrast ? "#000" : "#b45309"} /></pattern>
          </defs>
          <rect width="760" height="520" fill={highContrast ? "#fff" : "#f8fafc"} />
          <rect width="760" height="520" fill="url(#vertical-angle-grid)" opacity={highContrast ? ".16" : ".6"} />

          {sectors.map((sector) => {
            const selected = selectedAngles.includes(sector.index);
            const labelPoint = pointAt(vertex, sector.bisectorDirectionDegrees, 104);
            return <g key={sector.index} data-angle-sector={sector.index} data-angle-label={sector.label} data-pair-pattern={PAIR_PATTERNS[sector.index]} data-selected={selected ? "true" : "false"}>
              <path d={sectorPath(vertex, sector.startDirectionDegrees, sector.endDirectionDegrees, 88)} fill={`url(#vertical-angle-${PAIR_PATTERNS[sector.index]})`} opacity={selected ? ".95" : ".55"} stroke={selected ? "#be123c" : "#475569"} strokeWidth={selected ? 6 : 2} />
              <path d={arcPath(vertex, sector.startDirectionDegrees, sector.endDirectionDegrees, 62)} fill="none" stroke={sector.index % 2 === 0 ? "#1d4ed8" : "#a16207"} strokeWidth={sector.index % 2 === 0 ? 6 : 4} strokeDasharray={sector.index % 2 === 0 ? undefined : "3 7"} />
              <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="900" fill="#111827">{sector.label} {PAIR_SYMBOLS[sector.index]} {showMeasure(sector.index) ? `${sector.measureDegrees.toFixed(0)}°` : "?"}</text>
            </g>;
          })}

          {atomicSectors.length ? <g data-atomic-sectors>{atomicSectors.map((sector) => { const label = pointAt(vertex, sector.bisectorDirectionDegrees, 150); return <text key={sector.index} x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="900" fill="#334155" data-atomic-sector={sector.index}>{sector.label} · {sector.measureDegrees.toFixed(0)}°</text>; })}</g> : null}

          {lineIds.map((lineId) => {
            const positive = pointById(state.points, `${lineId}-positive`)!;
            const negative = pointById(state.points, `${lineId}-negative`)!;
            const active = activePair.includes(lineId);
            return <line key={lineId} x1={negative.x} y1={negative.y} x2={positive.x} y2={positive.y} stroke={lineId === "a" ? "#0f172a" : lineId === "b" ? "#7c3aed" : "#0f766e"} strokeWidth={active ? 9 : 6} strokeDasharray={lineId === "a" ? undefined : lineId === "b" ? "18 7" : "4 8"} strokeLinecap="round" opacity={active ? 1 : .24} data-intersection-line={lineId} data-line-active={active ? "true" : "false"} />;
          })}
          <circle cx={vertex.x} cy={vertex.y} r="9" fill="#fff" stroke="#be123c" strokeWidth="5" />
          <text x={vertex.x + 15} y={vertex.y + 27} fontSize="22" fontWeight="900" fill="#9f1239">O</text>

          {!locked ? <circle
            cx={activeHandle.x}
            cy={activeHandle.y}
            r="26"
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="5"
            role="slider"
            tabIndex={0}
            aria-label={`Uchwyt prostej ${activeLine}. Kierunek ${direction.toFixed(0)} stopni`}
            aria-valuemin={0}
            aria-valuemax={359}
            aria-valuenow={Math.round(direction)}
            data-line-handle={activeLine}
            data-touch-target="52"
            onKeyDown={handleLineKeyDown}
            onPointerDown={(event) => { dragLine.current = activeLine; event.currentTarget.setPointerCapture?.(event.pointerId); }}
            onPointerMove={(event) => { if (dragLine.current !== activeLine) return; const coordinates = pointerCoordinates(event, state); if (coordinates) changeLineHandle(coordinates, "Miary czterech kątów zaktualizowano w czasie rzeczywistym."); }}
            onPointerUp={(event) => { if (dragLine.current === activeLine) event.currentTarget.releasePointerCapture?.(event.pointerId); dragLine.current = null; }}
            onPointerCancel={() => { dragLine.current = null; }}
            style={{ cursor: "grab", touchAction: "none" }}
          /> : null}
        </AccessibleMathSvg>
      </div>

      <div className={styles.invariants} aria-label="Zależności aktualizowane w czasie rzeczywistym">
        <div className={styles.invariant} data-vertical-invariant><strong>● α = ● γ</strong><span>{sectors[0]!.measureDegrees.toFixed(0)}° = {sectors[2]!.measureDegrees.toFixed(0)}° · wierzchołkowe</span></div>
        <div className={styles.invariant} data-adjacent-invariant><strong>● α + ▲ β = 180°</strong><span>{sectors[0]!.measureDegrees.toFixed(0)}° + {sectors[1]!.measureDegrees.toFixed(0)}° = {(sectors[0]!.measureDegrees + sectors[1]!.measureDegrees).toFixed(0)}° · przyległe</span></div>
      </div>

      <div className={`${styles.alternatives} ${styles.interactiveOnly}`}>
        <InteractionAlternativePanel title="Ustaw przecięcie bez przeciągania" instruction="Na uchwycie: ←/→ obraca o 1°, Shift o 5°; ↑/↓ przesuwa koniec o 1 px, Shift o 5 px. Pola liczbowe i przyciski są równoważne dotykowi.">
          <label>Kierunek ° <input aria-label={`Kierunek prostej ${activeLine}`} type="number" min="0" max="359" value={Math.round(direction)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineDirection(value); }} /></label>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction - 5)}>−5°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction - 1)}>−1°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction + 1)}>+1°</button>
          <button type="button" disabled={locked} onClick={() => changeLineDirection(direction + 5)}>+5°</button>
          <label>Koniec x <input aria-label={`Współrzędna x prostej ${activeLine}`} type="number" value={Math.round(activeHandle.x)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineHandle({ x: value, y: activeHandle.y }); }} /></label>
          <label>Koniec y <input aria-label={`Współrzędna y prostej ${activeLine}`} type="number" value={Math.round(activeHandle.y)} disabled={locked} onChange={(event) => { const value = readFinite(event.target.value); if (value !== null) changeLineHandle({ x: activeHandle.x, y: value }); }} /></label>
        </InteractionAlternativePanel>
      </div>

      {(["pairs", "three-lines", "independent"] as VerticalAnglesActivity[]).includes(activity) ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Rozpoznawanie par kątów">
          <h3>Wskaż parę i nazwij własność</h3>
          <div className={styles.pairButtons}>{sectors.map((sector) => <button key={sector.index} type="button" disabled={locked} aria-pressed={selectedAngles.includes(sector.index)} onClick={() => selectAngle(sector.index)}>{sector.label} {PAIR_SYMBOLS[sector.index]}</button>)}</div>
          <div className={styles.reasonButtons}>{(["vertical", "adjacent"] as const).map((relation) => <button key={relation} type="button" disabled={locked} aria-pressed={claimedRelation === relation} onClick={() => setClaimedRelation(relation)}>{RELATION_LABELS[relation]}</button>)}</div>
          <button type="button" disabled={locked} onClick={checkPair}>Sprawdź parę</button>
          {selectedInvariant ? <p>Wybrano: {selectedInvariant.firstDegrees.toFixed(0)}° i {selectedInvariant.secondDegrees.toFixed(0)}° · położenie: {relationName(selectedInvariant.relation)} · suma {selectedInvariant.sumDegrees.toFixed(0)}°.</p> : null}
        </section>
      ) : null}

      {activity === "one-angle" ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Odsłanianie miar z jednej danej">
          <h3>Dana: {sectors[givenIndex]!.label} = {givenMeasure.toFixed(0)}°</h3>
          <p>Wybierz własność, której chcesz użyć. Model odsłoni tylko miary wynikające z tej decyzji.</p>
          <div className={styles.reasonButtons}>
            <button type="button" disabled={locked} onClick={() => revealByProperty("vertical")}>Naprzeciwko: kąty wierzchołkowe są równe</button>
            <button type="button" disabled={locked} onClick={() => revealByProperty("adjacent")}>Obok: kąty przyległe mają sumę 180°</button>
          </div>
        </section>
      ) : null}

      {(["roundabout", "independent"] as VerticalAnglesActivity[]).includes(activity) ? (
        <section className={`${styles.taskPanel} ${styles.interactiveOnly}`} aria-label="Obliczenia kątów">
          <h3>{activity === "roundabout" ? "Rondo tramwajowe" : "Samodzielne obliczenia"}: dana {sectors[givenIndex]!.label} = {givenMeasure.toFixed(0)}°</h3>
          <div className={styles.calculation}>
            <label>Kąt naprzeciwko ° <input aria-label="Miara kąta wierzchołkowego" type="text" inputMode="decimal" value={verticalAnswer} disabled={locked} onChange={(event) => setVerticalAnswer(event.target.value)} /></label>
            <span>bo</span>
            {(["vertical", "adjacent"] as const).map((relation) => <button key={`v-${relation}`} type="button" disabled={locked} aria-pressed={verticalReason === relation} onClick={() => setVerticalReason(relation)}>{RELATION_LABELS[relation]}</button>)}
          </div>
          <div className={styles.calculation}>
            <label>Kąt obok ° <input aria-label="Miara kąta przyległego" type="text" inputMode="decimal" value={adjacentAnswer} disabled={locked} onChange={(event) => setAdjacentAnswer(event.target.value)} /></label>
            <span>bo</span>
            {(["vertical", "adjacent"] as const).map((relation) => <button key={`a-${relation}`} type="button" disabled={locked} aria-pressed={adjacentReason === relation} onClick={() => setAdjacentReason(relation)}>{RELATION_LABELS[relation]}</button>)}
          </div>
          <button type="button" disabled={locked} onClick={checkCalculation}>Sprawdź obliczenia i uzasadnienie</button>
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

      <p className={styles.printOnly}>Przy przecięciu dwóch prostych kąty wierzchołkowe leżą naprzeciwko i są równe. Kąty przyległe mają wspólne ramię, a ich pozostałe ramiona tworzą prostą; suma miar wynosi 180°. Oznacz pary symbolem i wzorem, nie samym kolorem.</p>
    </section>
  );
}
