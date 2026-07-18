"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { DiagnosticFeedbackPanel } from "@/components/lessons/DiagnosticFeedbackPanel";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import { GeometryScene } from "@/components/lessons/geometry/GeometryScene";
import { createLessonGradeResult } from "@/lib/lessons/diagnosticFeedback";
import {
  TRIANGLE_ANGLE_LABELS,
  TRIANGLE_SIDE_LABELS,
  TRIANGLE_SIDE_PRESET_LABELS,
  applyTriangleAnglePreset,
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
const ANGLE_PLAYGROUND_KIND: Record<LessonDifficulty, TriangleAngleKind> = { support: "acute", core: "right", challenge: "obtuse" };
const TRIANGLE_SIDE_DESCRIPTIONS: Record<TriangleSideKind, string> = {
  equilateral: "Wszystkie boki mają tę samą długość.",
  isosceles: "Dwa boki są tej samej długości.",
  scalene: "Wszystkie boki są różnej długości.",
};
const TRIANGLE_ANGLE_DESCRIPTIONS: Record<TriangleAngleKind, string> = {
  acute: "Wszystkie kąty są ostre.",
  right: "Jeden kąt jest prosty.",
  obtuse: "Jeden kąt jest rozwarty.",
};

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

type GallerySideKind = "isosceles" | "equilateral" | "scalene";
type GalleryAngleKind = "acute" | "right" | "obtuse";
type GalleryCellKey = `${GallerySideKind}-${GalleryAngleKind}`;

const TRIANGLE_GALLERY: readonly {
  number: number;
  points: string;
  label: { x: number; y: number };
  right?: { x: number; y: number };
}[] = [
  { number: 1, points: "25,130 175,130 65,85", label: { x: 88, y: 116 } },
  { number: 2, points: "40,135 160,135 100,20", label: { x: 100, y: 99 } },
  { number: 3, points: "30,135 170,135 30,30", label: { x: 76, y: 107 }, right: { x: 30, y: 135 } },
  { number: 4, points: "50,135 150,135 100,48.397", label: { x: 100, y: 111 } },
  { number: 5, points: "30,135 170,135 100,105", label: { x: 100, y: 128 } },
  { number: 6, points: "30,135 170,135 85,30", label: { x: 95, y: 105 } },
  { number: 7, points: "40,130 160,130 40,10", label: { x: 78, y: 96 }, right: { x: 40, y: 130 } },
];

const GALLERY_ROWS: readonly { kind: GallerySideKind; label: string }[] = [
  { kind: "isosceles", label: "równoramienne" },
  { kind: "equilateral", label: "równoboczne" },
  { kind: "scalene", label: "różnoboczne" },
];

const GALLERY_COLUMNS: readonly { kind: GalleryAngleKind; label: string }[] = [
  { kind: "acute", label: "ostrokątne" },
  { kind: "right", label: "prostokątne" },
  { kind: "obtuse", label: "rozwartokątne" },
];

const GALLERY_ANSWERS: Readonly<Record<GalleryCellKey, string | null>> = {
  "isosceles-acute": "2",
  "isosceles-right": "7",
  "isosceles-obtuse": "5",
  "equilateral-acute": "4",
  "equilateral-right": null,
  "equilateral-obtuse": null,
  "scalene-acute": "6",
  "scalene-right": "3",
  "scalene-obtuse": "1",
};

const GALLERY_ACTIVE_CELLS = Object.entries(GALLERY_ANSWERS)
  .filter((entry): entry is [GalleryCellKey, string] => entry[1] !== null)
  .map(([key]) => key);

function TriangleGalleryTask({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleTypesGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [answers, setAnswers] = useState<Record<GalleryCellKey, string>>(() => Object.fromEntries(GALLERY_ACTIVE_CELLS.map((key) => [key, ""])) as Record<GalleryCellKey, string>);
  const [activeCell, setActiveCell] = useState<GalleryCellKey>(GALLERY_ACTIVE_CELLS[0]!);
  const [message, setMessage] = useState("Kliknij pole tabeli i wpisz numer pasującego trójkąta.");
  const [correct, setCorrect] = useState(false);

  const writeNumber = (key: string) => {
    if (readOnly || correct) return;
    setAnswers((current) => ({ ...current, [activeCell]: key === "backspace" ? "" : key }));
    setMessage("Uzupełnij wszystkie aktywne pola i zatwierdź tabelę.");
    onResultChange?.(null);
  };

  const check = () => {
    const emptyCell = GALLERY_ACTIVE_CELLS.find((key) => !answers[key]);
    if (emptyCell) {
      setActiveCell(emptyCell);
      setMessage("Uzupełnij wszystkie siedem aktywnych pól tabeli.");
      onResultChange?.(null);
      return;
    }
    const wrongCell = GALLERY_ACTIVE_CELLS.find((key) => answers[key] !== GALLERY_ANSWERS[key]);
    if (wrongCell) {
      setActiveCell(wrongCell);
      setMessage("Nie wszystkie numery są we właściwych polach. Sprawdź jednocześnie boki i kąty każdego trójkąta.");
      onResultChange?.(false, GALLERY_ACTIVE_CELLS.map((key) => answers[key]).join(","));
      return;
    }
    setCorrect(true);
    setMessage("Dobrze. Każdy trójkąt został sklasyfikowany jednocześnie według boków i kątów.");
    onResultChange?.(true, "uzupełniono tabelę dwóch klasyfikacji");
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-gallery>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Rodzaje trójkątów</p>
          <h2>Wpisz numery trójkątów do tabeli</h2>
          <p>Każdy trójkąt ma jedną nazwę według boków i jedną według kątów. Kąt prosty oznaczono łukiem z kropką.</p>
        </div>
      </header>
      <div className={styles.triangleGallery}>
        {TRIANGLE_GALLERY.map((triangle) => (
          <figure key={triangle.number} role="img" aria-label={`Trójkąt numer ${triangle.number}`} data-triangle-number={triangle.number}>
            <svg viewBox="0 0 200 160" aria-hidden="true">
              <polygon points={triangle.points} />
              {triangle.right ? <>
                <path d={`M ${triangle.right.x + 22} ${triangle.right.y} A 22 22 0 0 0 ${triangle.right.x} ${triangle.right.y - 22}`} data-right-angle-arc />
                <circle cx={triangle.right.x + 14} cy={triangle.right.y - 14} r="4" data-right-angle-dot />
              </> : null}
              <text x={triangle.label.x} y={triangle.label.y} textAnchor="middle" dominantBaseline="middle" className={styles.triangleNumber}>{triangle.number}</text>
            </svg>
          </figure>
        ))}
      </div>
      <div className={styles.classificationTableWrap}>
        <table className={styles.classificationTable}>
          <caption>Klasyfikacja trójkątów według boków i kątów</caption>
          <thead><tr><th scope="col">Według boków ↓<br />Według kątów →</th>{GALLERY_COLUMNS.map((column) => <th key={column.kind} scope="col">{column.label}</th>)}</tr></thead>
          <tbody>{GALLERY_ROWS.map((row) => <tr key={row.kind}>
            <th scope="row">{row.label}</th>
            {GALLERY_COLUMNS.map((column) => {
              const key = `${row.kind}-${column.kind}` as GalleryCellKey;
              const expected = GALLERY_ANSWERS[key];
              return <td key={key}>{expected === null
                ? <span className={styles.impossibleCell}>nie istnieje</span>
                : <input
                    type="text"
                    inputMode="none"
                    readOnly
                    disabled={readOnly || correct}
                    data-correct={correct || undefined}
                    aria-label={`${row.label}, ${column.label}`}
                    value={answers[key]}
                    onFocus={() => setActiveCell(key)}
                    onClick={() => setActiveCell(key)}
                    className={!correct && activeCell === key ? styles.activeClassificationCell : undefined}
                  />}</td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>
      <LessonNumericKeypad
        label="Klawiatura do tabeli rodzajów trójkątów"
        helperText="Kliknij puste pole, wpisz numer trójkąta, a na końcu zatwierdź całą tabelę."
        disabled={readOnly || correct}
        onKey={writeNumber}
        onConfirm={check}
      />
      <p className={styles.galleryMessage} role="status" aria-live="polite">{message}</p>
    </section>
  );
}

type TrianglePerimeterDiagramKind = "equilateral" | "isosceles" | "right" | "scalene";

interface TrianglePerimeterTask {
  id: string;
  kind: TrianglePerimeterDiagramKind;
  title: string;
  prompt: string;
  answerLabel: string;
  answer: number;
  sides: { left?: string; right?: string; base?: string };
  perimeter?: string;
}

const TRIANGLE_PERIMETER_TASKS: readonly TrianglePerimeterTask[] = [
  {
    id: "equilateral-direct",
    kind: "equilateral",
    title: "Trójkąt równoboczny",
    prompt: "Bok trójkąta równobocznego ma 4 cm. Oblicz jego obwód.",
    answerLabel: "Obwód trójkąta równobocznego",
    answer: 12,
    sides: { base: "4 cm" },
  },
  {
    id: "isosceles-direct",
    kind: "isosceles",
    title: "Trójkąt równoramienny",
    prompt: "Ramiona mają po 7 cm, a podstawa 5 cm. Oblicz obwód trójkąta.",
    answerLabel: "Obwód trójkąta równoramiennego",
    answer: 19,
    sides: { left: "7 cm", right: "7 cm", base: "5 cm" },
  },
  {
    id: "right-direct",
    kind: "right",
    title: "Trójkąt prostokątny różnoboczny",
    prompt: "Boki trójkąta mają długości 6 cm, 8 cm i 10 cm. Oblicz jego obwód.",
    answerLabel: "Obwód trójkąta prostokątnego",
    answer: 24,
    sides: { left: "6 cm", right: "10 cm", base: "8 cm" },
  },
  {
    id: "garden-direct",
    kind: "scalene",
    title: "Zadanie tekstowe — ogrodzenie",
    prompt: "Trójkątny ogródek ma boki długości 9 m, 12 m i 13 m. Ile metrów ogrodzenia potrzeba, aby otoczyć go jeden raz?",
    answerLabel: "Długość ogrodzenia",
    answer: 34,
    sides: { left: "9 m", right: "13 m", base: "12 m" },
  },
  {
    id: "flag-inverse",
    kind: "equilateral",
    title: "Zadanie tekstowe — chorągiewka",
    prompt: "Trójkątna chorągiewka jest równoboczna i ma obwód 27 cm. Jaką długość ma jeden bok?",
    answerLabel: "Długość jednego boku",
    answer: 9,
    sides: {},
    perimeter: "27 cm",
  },
  {
    id: "frame-inverse",
    kind: "isosceles",
    title: "Zadanie tekstowe — ramka",
    prompt: "Trójkątna ramka jest równoramienna. Jej obwód wynosi 32 cm, a każde ramię ma 11 cm. Oblicz długość podstawy.",
    answerLabel: "Długość podstawy",
    answer: 10,
    sides: { left: "11 cm", right: "11 cm" },
    perimeter: "32 cm",
  },
] as const;

function TrianglePerimeterDiagram({ task }: { task: TrianglePerimeterTask }) {
  const points = task.kind === "right"
    ? "100,255 440,255 100,65"
    : task.kind === "scalene"
      ? "75,255 445,255 230,55"
      : "80,255 440,255 260,55";
  const rows = [
    ...(task.sides.left ? [{ element: "lewy bok", value: task.sides.left }] : []),
    ...(task.sides.right ? [{ element: "prawy bok", value: task.sides.right }] : []),
    ...(task.sides.base ? [{ element: "podstawa", value: task.sides.base }] : []),
    ...(task.perimeter ? [{ element: "obwód", value: task.perimeter }] : []),
  ];
  return (
    <AccessibleMathSvg
      title={task.title}
      description={task.prompt}
      viewBox="0 0 520 320"
      className={styles.perimeterSvg}
      columns={[{ key: "element", label: "Element" }, { key: "value", label: "Dane" }]}
      rows={rows}
    >
      <polygon points={points} fill="#dbeafe" stroke="#1e3a8a" strokeWidth="5" strokeLinejoin="round" />
      {task.perimeter ? <text x="260" y="31" textAnchor="middle" className={styles.perimeterCaption}>Obwód = {task.perimeter}</text> : null}
      {task.sides.left ? <text x={task.kind === "right" ? 62 : 125} y="160" textAnchor="middle" className={styles.perimeterSideLabel}>{task.sides.left}</text> : null}
      {task.sides.right ? <text x="395" y="160" textAnchor="middle" className={styles.perimeterSideLabel}>{task.sides.right}</text> : null}
      {task.sides.base ? <text x="260" y="296" textAnchor="middle" className={styles.perimeterSideLabel}>{task.sides.base}</text> : null}
      {task.kind === "isosceles" ? (
        <g stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" data-equal-side-marks>
          <line x1="166" y1="162" x2="180" y2="150" />
          <line x1="340" y1="150" x2="354" y2="162" />
        </g>
      ) : null}
      {task.kind === "right" ? (
        <>
          <path d="M 140 255 A 40 40 0 0 0 100 215" fill="none" stroke="#7c3aed" strokeWidth="4" data-right-angle-arc />
          <circle cx="124" cy="231" r="5" fill="#7c3aed" data-right-angle-dot />
        </>
      ) : null}
    </AccessibleMathSvg>
  );
}

function TrianglePerimeterSeries({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleTypesGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const task = TRIANGLE_PERIMETER_TASKS[taskIndex]!;

  useEffect(() => {
    if (!correct || finished || taskIndex === TRIANGLE_PERIMETER_TASKS.length - 1) return;
    const timer = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setAnswer("");
      setFeedback("");
      setCorrect(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, taskIndex]);

  const edit = (key: string) => {
    if (readOnly || correct || finished) return;
    setAnswer((current) => key === "backspace"
      ? current.slice(0, -1)
      : /^\d$/u.test(key) && current.length < 3 ? `${current}${key}` : current);
    setFeedback("");
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) {
      setFeedback("Wpisz odpowiedź w pustej kratce.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (Number(answer) !== task.answer) {
      setFeedback(task.perimeter
        ? "Sprawdź, które boki są równe, i wykorzystaj podany obwód."
        : "Obwód to suma długości wszystkich trzech boków.");
      onResultChange?.(false, answer);
      return;
    }
    setCorrect(true);
    if (taskIndex === TRIANGLE_PERIMETER_TASKS.length - 1) {
      setFinished(true);
      setFeedback("Dobrze. Umiesz obliczyć obwód trójkąta i brakujący bok.");
      onResultChange?.(true, "ukończono sześć zadań o obwodzie trójkąta");
      return;
    }
    setFeedback("Dobrze. Za chwilę pojawi się następne zadanie.");
    onResultChange?.(null);
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-perimeter-series>
      <div className={styles.perimeterSeriesHeader}>
        <div>
          <p className={styles.eyebrow}>Obwód trójkąta</p>
          <h2>{task.title}</h2>
        </div>
        <b>Zadanie {taskIndex + 1}/{TRIANGLE_PERIMETER_TASKS.length}</b>
      </div>
      <div className={styles.perimeterWorkCard}>
        <p className={styles.perimeterPrompt}>{task.prompt}</p>
        <TrianglePerimeterDiagram task={task} />
        <label className={styles.perimeterAnswer}>
          <span>{task.answerLabel}</span>
          <span className={styles.perimeterAnswerRow}>
            <input
              aria-label={task.answerLabel}
              inputMode="none"
              readOnly
              value={answer}
              onClick={() => setFeedback("")}
            />
            <strong>{task.id === "garden-direct" ? "m" : "cm"}</strong>
          </span>
        </label>
      </div>
      {!finished ? (
        <LessonNumericKeypad
          label="Kalkulator do obwodów trójkątów"
          helperText="Wpisz wynik w kratce. Zatwierdź dopiero po wykonaniu całego obliczenia."
          onKey={edit}
          onConfirm={check}
          disabled={readOnly || correct}
        />
      ) : null}
      <p className={`${styles.perimeterFeedback} ${correct ? styles.perimeterFeedbackCorrect : ""}`} role="status" aria-live="polite">{feedback}</p>
    </section>
  );
}

interface TriangleTextPerimeterTask {
  id: string;
  title: string;
  prompt: string;
  answerLabel: string;
  answer: number;
  unit: "cm" | "m";
  inverse?: boolean;
}

const TRIANGLE_TEXT_PERIMETER_TASKS: readonly TriangleTextPerimeterTask[] = [
  {
    id: "equilateral-5",
    title: "Trójkąt równoboczny",
    prompt: "Bok trójkąta równobocznego ma 5 cm. Oblicz obwód tego trójkąta.",
    answerLabel: "Obwód trójkąta",
    answer: 15,
    unit: "cm",
  },
  {
    id: "isosceles-6-4",
    title: "Trójkąt równoramienny",
    prompt: "Dwa równe boki trójkąta mają po 6 cm, a trzeci bok ma 4 cm. Oblicz obwód.",
    answerLabel: "Obwód trójkąta",
    answer: 16,
    unit: "cm",
  },
  {
    id: "scalene-7-8-10",
    title: "Trójkąt różnoboczny",
    prompt: "Boki trójkąta mają długości 7 cm, 8 cm i 10 cm. Oblicz jego obwód.",
    answerLabel: "Obwód trójkąta",
    answer: 25,
    unit: "cm",
  },
  {
    id: "right-6-8-10",
    title: "Trójkąt prostokątny",
    prompt: "Boki trójkąta prostokątnego mają długości 6 m, 8 m i 10 m. Oblicz jego obwód.",
    answerLabel: "Obwód trójkąta",
    answer: 24,
    unit: "m",
  },
  {
    id: "equilateral-inverse-36",
    title: "Znajdź długość boku",
    prompt: "Obwód trójkąta równobocznego wynosi 36 cm. Oblicz długość jednego boku.",
    answerLabel: "Długość jednego boku",
    answer: 12,
    unit: "cm",
    inverse: true,
  },
] as const;

function TriangleTextPerimeterSeries({ readOnly = false, highContrast = false, onResultChange }: Pick<TriangleTypesGeometryLabProps, "readOnly" | "highContrast" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);
  const task = TRIANGLE_TEXT_PERIMETER_TASKS[taskIndex]!;

  useEffect(() => {
    if (!correct || finished || taskIndex === TRIANGLE_TEXT_PERIMETER_TASKS.length - 1) return;
    const timer = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setAnswer("");
      setFeedback("");
      setCorrect(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [correct, finished, taskIndex]);

  const edit = (key: string) => {
    if (readOnly || correct || finished) return;
    setAnswer((current) => key === "backspace"
      ? current.slice(0, -1)
      : /^\d$/u.test(key) && current.length < 3 ? `${current}${key}` : current);
    setFeedback("");
    onResultChange?.(null);
  };

  const check = () => {
    if (!answer) {
      setFeedback("Wpisz odpowiedź w pustej kratce.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (Number(answer) !== task.answer) {
      setFeedback(task.inverse
        ? "Podziel podany obwód przez liczbę równych boków."
        : "Dodaj długości wszystkich trzech boków trójkąta.");
      onResultChange?.(false, answer);
      return;
    }
    setCorrect(true);
    if (taskIndex === TRIANGLE_TEXT_PERIMETER_TASKS.length - 1) {
      setFinished(true);
      setFeedback("Dobrze. Rozwiązałeś pięć zadań bez korzystania z gotowych rysunków.");
      onResultChange?.(true, "ukończono pięć tekstowych zadań o obwodzie trójkąta");
      return;
    }
    setFeedback("Dobrze. Za chwilę pojawi się następne zadanie.");
    onResultChange?.(null);
  };

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-text-perimeter-series>
      <div className={styles.perimeterSeriesHeader}>
        <div>
          <p className={styles.eyebrow}>Ćwiczenia bez rysunków</p>
          <h2>{task.title}</h2>
        </div>
        <b>Zadanie {taskIndex + 1}/{TRIANGLE_TEXT_PERIMETER_TASKS.length}</b>
      </div>
      <div className={`${styles.perimeterWorkCard} ${styles.textOnlyPerimeterCard}`}>
        <p className={styles.perimeterPrompt}>{task.prompt}</p>
        <label className={styles.perimeterAnswer}>
          <span>{task.answerLabel}</span>
          <span className={styles.perimeterAnswerRow}>
            <input aria-label={task.answerLabel} inputMode="none" readOnly value={answer} />
            <strong>{task.unit}</strong>
          </span>
        </label>
      </div>
      {!finished ? (
        <LessonNumericKeypad
          label="Kalkulator do pięciu ćwiczeń z obwodu"
          helperText="Wykonaj obliczenie bez rysunku, wpisz wynik i zatwierdź zadanie."
          onKey={edit}
          onConfirm={check}
          disabled={readOnly || correct}
        />
      ) : null}
      <p className={`${styles.perimeterFeedback} ${correct ? styles.perimeterFeedbackCorrect : ""}`} role="status" aria-live="polite">{feedback}</p>
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
  const initialAnglePlaygroundKind = ANGLE_PLAYGROUND_KIND[initialTask.difficulty];
  const [currentSeed, setCurrentSeed] = useState(seed);
  const [history, setHistory] = useState<GeometryHistoryState>(() => {
    const initialState = createTriangleTypesGeometryState(seed, mode);
    const presetState = initialTask.activity === "playground"
      ? applyTriangleSidePreset(initialState, initialPlaygroundKind)
      : initialTask.activity === "angle-playground"
        ? applyTriangleAnglePreset(initialState, initialAnglePlaygroundKind)
        : initialState;
    return createGeometryHistory(presetState);
  });
  const [difficulty, setDifficulty] = useState<LessonDifficulty>(initialTask.difficulty);
  const [sidePrediction, setSidePrediction] = useState<TriangleSideKind | null>(null);
  const [playgroundKind, setPlaygroundKind] = useState<TriangleSideKind>(initialPlaygroundKind);
  const [anglePlaygroundKind, setAnglePlaygroundKind] = useState<TriangleAngleKind>(initialAnglePlaygroundKind);
  const [anglePrediction, setAnglePrediction] = useState<TriangleAngleKind | null>(null);
  const [revealed, setRevealed] = useState(!["predict", "independent"].includes(initialTask.activity));
  const [evidenceConfirmed, setEvidenceConfirmed] = useState(false);
  const [diagnosticCode, setDiagnosticCode] = useState<TriangleDiagnosticCode | null>(null);
  const [announcement, setAnnouncement] = useState(initialTask.activity === "playground"
    ? "Model gotowy. Wybierz rodzaj trójkąta według boków."
    : initialTask.activity === "angle-playground"
      ? "Model gotowy. Wybierz rodzaj trójkąta według kątów."
      : "Model gotowy. Przesuń wierzchołek C albo wybierz gotową konfigurację.");
  const dragPoint = useRef<string | null>(null);
  const dragStart = useRef<GeometryLabState | null>(null);
  const state = history.present;
  const task = createPublicTriangleTypesTask(currentSeed);
  const isSidePlayground = task.activity === "playground";
  const isAnglePlayground = task.activity === "angle-playground";
  const isPlayground = isSidePlayground || isAnglePlayground;
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
  if (task.activity === "perimeter") return <TrianglePerimeterSeries readOnly={locked} highContrast={highContrast} onResultChange={onResultChange} />;
  if (task.activity === "independent" && task.difficulty === "support") return <TriangleTextPerimeterSeries readOnly={locked} highContrast={highContrast} onResultChange={onResultChange} />;

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
    const nextAngleKind = ANGLE_PLAYGROUND_KIND[nextDifficulty];
    const generated = createTriangleTypesGeometryState(nextSeed, mode);
    const next = task.activity === "playground"
      ? applyTriangleSidePreset(generated, nextKind)
      : task.activity === "angle-playground"
        ? applyTriangleAnglePreset(generated, nextAngleKind)
        : generated;
    setDifficulty(nextDifficulty);
    setCurrentSeed(nextSeed);
    setPlaygroundKind(nextKind);
    setAnglePlaygroundKind(nextAngleKind);
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
    commit(next, `Pokazano trójkąt ${TRIANGLE_SIDE_LABELS[kind]}. ${TRIANGLE_SIDE_DESCRIPTIONS[kind]}`);
  };

  const selectAnglePlaygroundKind = (kind: TriangleAngleKind) => {
    if (locked) return;
    const next = applyTriangleAnglePreset(state, kind);
    setAnglePlaygroundKind(kind);
    setSidePrediction(triangleClassifications(next)?.side ?? null);
    setAnglePrediction(kind);
    commit(next, `Pokazano trójkąt ${TRIANGLE_ANGLE_LABELS[kind]}. ${TRIANGLE_ANGLE_DESCRIPTIONS[kind]}`);
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

  const playgroundSideLabels = isSidePlayground ? TRIANGLE_SIDE_PRESET_LABELS[playgroundKind] : undefined;
  const rows = analysis.status === "valid" ? [
    ...analysis.sideLengths.map((length, index) => ({ element: ["AB", "BC", "CA"][index]!, value: playgroundSideLabels?.[index] ?? length.exact, property: "długość boku" })),
    ...analysis.angleDegrees.map((angle, index) => ({ element: ["∠A", "∠B", "∠C"][index]!, value: `${angle.toFixed(1)}°`, property: index === analysis.angleDegrees.indexOf(Math.max(...analysis.angleDegrees)) ? "największy kąt" : "kąt" })),
  ] : [{ element: "Figura", value: "—", property: "Rozdziel punkty i utwórz trójkąt" }];

  return (
    <section className={`${styles.lab} ${highContrast ? styles.highContrast : ""}`} data-triangle-types-lab data-activity={task.activity}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{isPlayground ? "Podział trójkątów" : "Rodzaje trójkątów"}</p>
          <h2>{isSidePlayground ? "Podział trójkątów ze względu na boki" : isAnglePlayground ? "Podział trójkątów ze względu na kąty" : task.activity === "tent" ? "Namiot ekspedycji" : task.activity === "possible-pair" ? "Czy taki trójkąt może istnieć?" : "Dwie klasyfikacje jednego trójkąta"}</h2>
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
          <AccessibleMathSvg title="Trójkąt ABC" description={isSidePlayground ? "Wybór nazwy zmienia kształt trójkąta oraz pokazane długości i oznaczenia równych boków." : isAnglePlayground ? "Wybór nazwy zmienia kształt trójkąta i miary jego trzech kątów." : "Wierzchołki można przesuwać. Długości, kąty i klasyfikacje zmieniają się natychmiast."} viewBox="0 0 640 420" className={styles.svg} columns={[{ key: "element", label: "Element" }, { key: "value", label: "Wartość" }, { key: "property", label: "Znaczenie" }]} rows={rows}>
            <GeometryScene
              state={state}
              showHandles={!locked && !isPlayground}
              highContrast={highContrast}
              theme="playground"
              sideLengthLabels={playgroundSideLabels}
              showAngleNames={!isPlayground}
              angleMeasurePrecision={isPlayground ? 0 : 1}
              rightAngleMarker={isPlayground ? "arc-dot" : "square"}
              onPointSelect={isPlayground ? undefined : (pointId) => setHistory((current) => ({ ...current, present: { ...current.present, selectedPointId: pointId } }))}
              onPointPointerDown={isPlayground ? undefined : (pointId, event) => { if (locked) return; dragPoint.current = pointId; dragStart.current = state; event.currentTarget.setPointerCapture?.(event.pointerId); }}
              onPointPointerMove={isPlayground ? undefined : (pointId, event) => { if (dragPoint.current !== pointId || locked) return; const coordinates = pointerCoordinates(event, state); if (!coordinates) return; const next = moveTriangleVertex(state, pointId, coordinates); setHistory((current) => ({ ...current, present: next, future: [] })); publish(next); setRevealed(false); }}
              onPointPointerUp={isPlayground ? undefined : (pointId, event) => { if (dragPoint.current !== pointId) return; event.currentTarget.releasePointerCapture?.(event.pointerId); const start = dragStart.current; setHistory((current) => start ? { ...current, past: [...current.past, start].slice(-100), future: [] } : current); dragPoint.current = null; dragStart.current = null; setAnnouncement("Położenie, miary i klasyfikacje zaktualizowano."); }}
              onPointKeyDown={isPlayground ? undefined : onPointKeyDown}
            />
          </AccessibleMathSvg>
          <p className={styles.live} role="status" aria-live="polite">{announcement}</p>
        </div>

        {isSidePlayground ? (
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
        ) : isAnglePlayground ? (
          <aside className={`${styles.panel} ${styles.playgroundPanel}`}>
            <div className={styles.playgroundChooser}>
              <h3>Wybierz rodzaj trójkąta według kątów</h3>
              <div className={styles.kindButtons}>
                {(Object.keys(TRIANGLE_ANGLE_LABELS) as TriangleAngleKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    disabled={locked}
                    aria-pressed={anglePlaygroundKind === kind}
                    onClick={() => selectAnglePlaygroundKind(kind)}
                  >
                    Trójkąt {TRIANGLE_ANGLE_LABELS[kind]}
                  </button>
                ))}
              </div>
              {analysis.status === "valid" ? (
                <div className={styles.sideValues} aria-label="Miary kątów wybranego trójkąta">
                  {analysis.angleDegrees.map((angle, index) => <span key={index}><b>{["∠A", "∠B", "∠C"][index]}</b> = {angle.toFixed(1)}°</span>)}
                </div>
              ) : null}
              <p className={styles.markHint}>O rodzaju decyduje największy kąt: mniejszy od 90°, równy 90° albo większy od 90°.</p>
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
