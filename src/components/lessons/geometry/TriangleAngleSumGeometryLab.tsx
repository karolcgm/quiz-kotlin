"use client";

import { useEffect, useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { createPublicTriangleAngleSumTask } from "@/lib/math/geometry/triangleAngleSum";
import type { GeometryLabMode } from "@/types/geometry";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/geometry/triangleAngleSum.module.css";

export interface TriangleAngleSumGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type TriangleAngles = readonly [number, number, number];
type Point = { x: number; y: number };

const MIN_ANGLE = 20;
const MAX_PAIR_SUM = 160;

function trianglePointsFromAngles([angleA, , angleC]: TriangleAngles): readonly [Point, Point, Point] {
  const radiansA = angleA * Math.PI / 180;
  const radiansC = angleC * Math.PI / 180;
  const raw = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    {
      x: Math.sin((180 - angleA - angleC) * Math.PI / 180) / Math.sin(radiansC) * Math.cos(radiansA),
      y: -Math.sin((180 - angleA - angleC) * Math.PI / 180) / Math.sin(radiansC) * Math.sin(radiansA),
    },
  ] as const;
  const minX = Math.min(...raw.map((point) => point.x));
  const maxX = Math.max(...raw.map((point) => point.x));
  const minY = Math.min(...raw.map((point) => point.y));
  const maxY = Math.max(...raw.map((point) => point.y));
  const availableWidth = 410;
  const availableHeight = 220;
  const rawWidth = Math.max(.001, maxX - minX);
  const rawHeight = Math.max(.001, maxY - minY);
  const scale = Math.min(availableWidth / rawWidth, availableHeight / rawHeight);
  const offsetX = 55 + (availableWidth - rawWidth * scale) / 2;
  const offsetY = 45 + (availableHeight - rawHeight * scale) / 2;
  const mapped = raw.map((point) => ({
    x: offsetX + (point.x - minX) * scale,
    y: offsetY + (point.y - minY) * scale,
  }));
  return [mapped[0]!, mapped[1]!, mapped[2]!];
}

function normalizedVector(from: Point, to: Point): Point {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  return { x: (to.x - from.x) / length, y: (to.y - from.y) / length };
}

function angleMark(vertex: Point, first: Point, second: Point, radius = 34) {
  const firstVector = normalizedVector(vertex, first);
  const secondVector = normalizedVector(vertex, second);
  const bisectorLength = Math.hypot(firstVector.x + secondVector.x, firstVector.y + secondVector.y) || 1;
  const bisector = {
    x: (firstVector.x + secondVector.x) / bisectorLength,
    y: (firstVector.y + secondVector.y) / bisectorLength,
  };
  const start = { x: vertex.x + firstVector.x * radius, y: vertex.y + firstVector.y * radius };
  const end = { x: vertex.x + secondVector.x * radius, y: vertex.y + secondVector.y * radius };
  const control = { x: vertex.x + bisector.x * radius * 1.18, y: vertex.y + bisector.y * radius * 1.18 };
  return {
    path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
    label: { x: vertex.x + bisector.x * (radius + 22), y: vertex.y + bisector.y * (radius + 22) },
  };
}

function sideLabelPosition(first: Point, second: Point, centroid: Point) {
  const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
  const outward = normalizedVector(centroid, midpoint);
  return { x: midpoint.x + outward.x * 25, y: midpoint.y + outward.y * 25 };
}

function TriangleAngleDiagram({ angles, caption, missingIndices = [], revealMissing = false, sideLabels, displayLabels, equalAngleIndices = [] }: { angles: TriangleAngles; caption: string; missingIndices?: readonly number[]; revealMissing?: boolean; sideLabels?: readonly [string | null, string | null, string | null]; displayLabels?: readonly [string, string, string]; equalAngleIndices?: readonly number[] }) {
  const points = trianglePointsFromAngles(angles);
  const centroid = {
    x: (points[0].x + points[1].x + points[2].x) / 3,
    y: (points[0].y + points[1].y + points[2].y) / 3,
  };
  const marks = [
    angleMark(points[0], points[1], points[2]),
    angleMark(points[1], points[0], points[2]),
    angleMark(points[2], points[0], points[1]),
  ];
  return (
    <svg viewBox="0 0 520 320" role="img" aria-label={caption} className={styles.diagram}>
      <polygon points={points.map(({ x, y }) => `${x},${y}`).join(" ")} className={styles.triangle} />
      {marks.map((mark, index) => (
        <g key={index} data-angle-value={angles[index]}>
          <path d={mark.path} className={`${styles.angleArc} ${equalAngleIndices.includes(index) ? styles.equalAngleArc : ""}`} data-equal-angle-arc={equalAngleIndices.includes(index) ? "true" : undefined} />
          {angles[index] === 90 ? <circle cx={points[index].x + (mark.label.x - points[index].x) * .42} cy={points[index].y + (mark.label.y - points[index].y) * .42} r="4.5" className={styles.rightAngleDot} data-right-angle-dot /> : null}
          <text x={mark.label.x} y={mark.label.y} className={`${styles.angleLabel} ${missingIndices.includes(index) && !revealMissing ? styles.missingAngleLabel : ""} ${equalAngleIndices.includes(index) ? styles.equalAngleLabel : ""}`}>{missingIndices.includes(index) && !revealMissing ? "?" : displayLabels?.[index] ?? `${angles[index]}°`}</text>
        </g>
      ))}
      {sideLabels?.map((label, index) => {
        if (!label) return null;
        const sidePoints = index === 0 ? [points[0], points[1]] : index === 1 ? [points[1], points[2]] : [points[2], points[0]];
        const position = sideLabelPosition(sidePoints[0], sidePoints[1], centroid);
        return <text key={`side-${index}`} x={position.x} y={position.y} className={styles.sideLabel} data-side-label={index}>{label}</text>;
      })}
    </svg>
  );
}

function AngleSumInformationSeries({ initialAngles, readOnly = false, onResultChange }: { initialAngles: TriangleAngles } & Pick<TriangleAngleSumGeometryLabProps, "readOnly" | "onResultChange">) {
  const [page, setPage] = useState(0);
  const [angles, setAngles] = useState<[number, number, number]>([...initialAngles]);

  const updateAngle = (index: 0 | 1, rawValue: number) => {
    if (readOnly) return;
    const otherIndex = index === 0 ? 1 : 0;
    const value = Math.max(MIN_ANGLE, Math.min(MAX_PAIR_SUM - angles[otherIndex], rawValue));
    const next = [...angles] as [number, number, number];
    next[index] = value;
    next[2] = 180 - next[0] - next[1];
    setAngles(next);
    onResultChange?.(null);
  };

  const nextPage = () => {
    if (readOnly) return;
    if (page < 2) {
      setPage((current) => current + 1);
      onResultChange?.(page === 1 ? true : null, page === 1 ? "poznano sumę kątów oraz własności trójkąta równobocznego i równoramiennego" : undefined);
    }
  };

  const previousPage = () => {
    if (readOnly || page === 0) return;
    setPage((current) => current - 1);
    onResultChange?.(null);
  };

  const pageAngles: TriangleAngles = page === 0 ? angles : page === 1 ? [60, 60, 60] : [65, 65, 50];
  const title = page === 0
    ? "Suma kątów w trójkącie wynosi 180°"
    : page === 1
      ? "Trójkąt równoboczny"
      : "Trójkąt równoramienny";
  const explanation = page === 0
    ? "Zmieniaj kąty A i B. Kąt C dopasuje się automatycznie, dlatego za każdym razem powstaje trójkąt."
    : page === 1
      ? "W trójkącie równobocznym wszystkie kąty mają po 60°."
      : "W trójkącie równoramiennym dwa kąty przy podstawie mają taką samą miarę.";

  return (
    <section className={styles.lab} data-geometry-lab data-triangle-angle-sum-lab data-angle-sum-information-series>
      <div className={styles.seriesHeader}>
        <div>
          <p className={styles.eyebrow}>Miary kątów w trójkącie</p>
          <h2>{title}</h2>
        </div>
        <b>Informacja {page + 1}/3</b>
      </div>
      <div className={styles.informationCard}>
        <p className={styles.explanation}>{explanation}</p>
        <TriangleAngleDiagram
          angles={pageAngles}
          caption={page === 2 ? "Trójkąt równoramienny. Dwa kąty przy podstawie mają równe miary." : `${title}. Miary kątów: ${pageAngles.join("°, ")}°.`}
          displayLabels={page === 2 ? ["=", "=", ""] : undefined}
          equalAngleIndices={page === 2 ? [0, 1] : []}
        />
        {page === 2
          ? <p className={styles.equalAngleStatement}>Kąty przy podstawie mają takie same miary.</p>
          : <p className={styles.equation}>{pageAngles[0]}° + {pageAngles[1]}° + {pageAngles[2]}° = 180°</p>}
      </div>
      {page === 0 ? (
        <div className={styles.sliders} aria-label="Zmiana miar kątów trójkąta">
          <label>Kąt A: <strong>{angles[0]}°</strong><input type="range" min={MIN_ANGLE} max={MAX_PAIR_SUM - angles[1]} value={angles[0]} disabled={readOnly} onChange={(event) => updateAngle(0, Number(event.target.value))} /></label>
          <label>Kąt B: <strong>{angles[1]}°</strong><input type="range" min={MIN_ANGLE} max={MAX_PAIR_SUM - angles[0]} value={angles[1]} disabled={readOnly} onChange={(event) => updateAngle(1, Number(event.target.value))} /></label>
        </div>
      ) : null}
      <div className={styles.navigation}>
        {page > 0 ? <button type="button" disabled={readOnly} onClick={previousPage}>← Poprzednia informacja</button> : <span />}
        {page < 2 ? <button type="button" disabled={readOnly} onClick={nextPage}>Następna informacja →</button> : <strong>Trzy informacje zostały pokazane.</strong>}
      </div>
    </section>
  );
}

interface MissingAngleTask {
  id: string;
  title: string;
  prompt: string;
  angles: TriangleAngles;
  missingIndices: readonly (0 | 1 | 2)[];
  sideLabels?: readonly [string | null, string | null, string | null];
  hint: string;
}

const STAGE_TASKS = {
  l1: {
    2: { id: "general-52-68", title: "Różne kąty w trójkącie", prompt: "Dwa kąty mają miary 52° i 68°. Oblicz trzeci kąt.", angles: [52, 68, 60], missingIndices: [2], hint: "Odejmij od 180° obie podane miary." },
    3: { id: "right-35", title: "Trójkąt prostokątny", prompt: "Jeden kąt ma 90°, a drugi 35°. Oblicz trzeci kąt.", angles: [90, 35, 55], missingIndices: [2], hint: "Kąt prosty ma 90°. Wszystkie trzy kąty mają razem 180°." },
    4: { id: "isosceles-68", title: "Równe boki — równe kąty", prompt: "Dwa ramiona mają po 6 cm, a kąt między nimi ma 44°. Oblicz oba równe kąty przy podstawie.", angles: [68, 68, 44], missingIndices: [0, 1], sideLabels: [null, "6 cm", "6 cm"], hint: "Kąty leżące naprzeciw równych boków są równe. Odejmij 44° od 180° i podziel wynik przez 2." },
  },
  l2: {
    2: { id: "obtuse-102-43", title: "Trójkąt rozwartokątny", prompt: "Dwa kąty mają miary 102° i 43°. Oblicz trzeci kąt.", angles: [102, 43, 35], missingIndices: [2], hint: "Odejmij od 180° obie podane miary." },
    3: { id: "right-23", title: "Trójkąt prostokątny", prompt: "Jeden kąt ma 90°, a drugi 23°. Oblicz trzeci kąt.", angles: [90, 23, 67], missingIndices: [2], hint: "Po odjęciu kąta prostego pozostaje 90° na dwa pozostałe kąty." },
    4: { id: "isosceles-obtuse", title: "Równe boki — równe kąty", prompt: "Dwa ramiona mają po 7 cm, a kąt między nimi ma 106°. Oblicz oba kąty przy podstawie.", angles: [37, 37, 106], missingIndices: [0, 1], sideLabels: [null, "7 cm", "7 cm"], hint: "Kąty leżące naprzeciw równych boków są równe. Pozostałe 74° podziel na dwa kąty." },
  },
} as const satisfies Record<"l1" | "l2", Record<2 | 3 | 4, MissingAngleTask>>;

const PRACTICE_TASKS = {
  l1: [
    { id: "practice-general", title: "Trójkąt różnoboczny", prompt: "Kąty mają miary 47°, 63° i ?. Oblicz brakujący kąt.", angles: [47, 63, 70], missingIndices: [2], hint: "Odejmij od 180° sumę 47° i 63°." },
    { id: "practice-right", title: "Trójkąt prostokątny", prompt: "Jeden kąt ma 90°, drugi 28°, a trzeci jest nieznany.", angles: [90, 28, 62], missingIndices: [2], hint: "Od 180° odejmij 90° i 28°." },
    { id: "practice-isosceles", title: "Równe ramiona po 8 cm", prompt: "Dwa ramiona mają po 8 cm, a kąt między nimi ma 36°. Oblicz oba kąty przy podstawie.", angles: [72, 72, 36], missingIndices: [0, 1], sideLabels: [null, "8 cm", "8 cm"], hint: "Kąty przy podstawie są równe. Pozostałe 144° podziel przez 2." },
    { id: "practice-equilateral", title: "Trójkąt równoboczny", prompt: "Wszystkie boki mają po 5 cm. Uzupełnij brakującą miarę kąta.", angles: [60, 60, 60], missingIndices: [2], sideLabels: ["5 cm", "5 cm", "5 cm"], hint: "W trójkącie równobocznym każdy kąt ma 60°." },
    { id: "practice-obtuse", title: "Dwa boki po 9 cm", prompt: "Dwa boki mają po 9 cm, a kąt między nimi ma 112°. Oblicz oba kąty przy podstawie.", angles: [34, 34, 112], missingIndices: [0, 1], sideLabels: [null, "9 cm", "9 cm"], hint: "Kąty przy podstawie są równe. Pozostałe 68° podziel przez 2." },
  ],
  l2: [
    { id: "challenge-general", title: "Trójkąt różnoboczny", prompt: "Kąty mają miary 33°, 58° i ?. Oblicz brakujący kąt.", angles: [33, 58, 89], missingIndices: [2], hint: "Odejmij sumę podanych miar od 180°." },
    { id: "challenge-right", title: "Trójkąt prostokątny", prompt: "Jeden kąt ma 90°, drugi 17°, a trzeci jest nieznany.", angles: [90, 17, 73], missingIndices: [2], hint: "Od 90° odejmij miarę drugiego kąta ostrego." },
    { id: "challenge-isosceles", title: "Równe ramiona po 11 cm", prompt: "Dwa ramiona mają po 11 cm, a kąt między nimi ma 44°. Oblicz oba kąty przy podstawie.", angles: [68, 68, 44], missingIndices: [0, 1], sideLabels: [null, "11 cm", "11 cm"], hint: "Odejmij 44° od 180°, a wynik podziel przez 2." },
    { id: "challenge-equilateral", title: "Trójkąt równoboczny", prompt: "Wszystkie boki mają po 7 cm. Uzupełnij brakujący kąt.", angles: [60, 60, 60], missingIndices: [0], sideLabels: ["7 cm", "7 cm", "7 cm"], hint: "Wszystkie trzy kąty są równe." },
    { id: "challenge-obtuse", title: "Równe ramiona i kąt rozwarty", prompt: "Dwa ramiona mają po 13 cm, a kąt między nimi ma 124°. Oblicz oba kąty przy podstawie.", angles: [28, 28, 124], missingIndices: [0, 1], sideLabels: [null, "13 cm", "13 cm"], hint: "Pozostałe 56° podziel na dwa równe kąty." },
  ],
} as const satisfies Record<"l1" | "l2", readonly MissingAngleTask[]>;

function MissingAngleExercise({ task, readOnly = false, onResultChange, onSolved }: { task: MissingAngleTask; onSolved?: () => void } & Pick<TriangleAngleSumGeometryLabProps, "readOnly" | "onResultChange">) {
  const [answers, setAnswers] = useState(() => task.missingIndices.map(() => ""));
  const [activeAnswer, setActiveAnswer] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(false);

  const edit = (key: string) => {
    if (readOnly || correct) return;
    setAnswers((current) => current.map((answer, index) => index === activeAnswer
      ? key === "backspace" ? answer.slice(0, -1) : /^\d$/u.test(key) && answer.length < 3 ? `${answer}${key}` : answer
      : answer));
    setFeedback("");
    onResultChange?.(null);
  };

  const check = () => {
    if (answers.some((answer) => !answer)) {
      setFeedback(task.missingIndices.length === 1 ? "Wpisz miarę brakującego kąta." : "Uzupełnij miary obu brakujących kątów.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    const expected = task.missingIndices.map((index) => task.angles[index]);
    if (answers.some((answer, index) => Number(answer) !== expected[index])) {
      setFeedback(task.hint);
      onResultChange?.(false, answers.map((answer) => `${answer}°`).join(", "));
      return;
    }
    setCorrect(true);
    setFeedback(expected.length === 1 ? `Dobrze. Brakujący kąt ma ${expected[0]}°.` : `Dobrze. Oba brakujące kąty mają po ${expected[0]}°.`);
    if (onSolved) onSolved();
    else onResultChange?.(true, expected.map((angle) => `${angle}°`).join(", "));
  };

  return (
    <div className={styles.problem} data-missing-angle-task={task.id}>
      <div className={styles.problemHeader}>
        <div><p className={styles.eyebrow}>Uzupełnij brakujący kąt</p><h2>{task.title}</h2></div>
      </div>
      <div className={styles.problemCard}>
        <p>{task.prompt}</p>
        <TriangleAngleDiagram angles={task.angles} missingIndices={task.missingIndices} revealMissing={correct} sideLabels={task.sideLabels} caption={`${task.title}. ${task.missingIndices.length === 1 ? "Jeden kąt należy obliczyć." : "Dwa kąty należy obliczyć."}`} />
        <div className={styles.answerRow}>
          {answers.map((answer, index) => (
            <label key={task.missingIndices[index]} className={`${styles.missingAnswer} ${activeAnswer === index ? styles.missingAnswerActive : ""}`}>
              {task.missingIndices.length === 1 ? "Brakujący kąt" : `Brakujący kąt ${index + 1}`}
              <span><input aria-label={task.missingIndices.length === 1 ? "Brakujący kąt (°)" : `Brakujący kąt ${index + 1} (°)`} inputMode="none" readOnly value={answer} onClick={() => setActiveAnswer(index)} /><strong>°</strong></span>
            </label>
          ))}
        </div>
      </div>
      <LessonNumericKeypad label="Klawiatura do brakującego kąta" helperText={answers.length === 1 ? "Wpisz miarę kąta i zatwierdź odpowiedź." : "Kliknij wybraną kratkę, uzupełnij oba kąty i zatwierdź raz na końcu."} onKey={edit} onConfirm={check} disabled={readOnly || correct} />
      <p className={`${styles.feedback} ${correct ? styles.feedbackCorrect : ""}`} role="status" aria-live="polite">{feedback}</p>
    </div>
  );
}

function MissingAngleSeries({ tasks, readOnly = false, onResultChange }: { tasks: readonly MissingAngleTask[] } & Pick<TriangleAngleSumGeometryLabProps, "readOnly" | "onResultChange">) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!solved || finished) return;
    const timer = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setSolved(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [finished, solved]);

  const handleSolved = () => {
    if (taskIndex === tasks.length - 1) {
      setFinished(true);
      onResultChange?.(true, "ukończono pięć różnych zadań z miarami kątów w trójkątach");
      return;
    }
    setSolved(true);
    onResultChange?.(null);
  };

  const task = tasks[taskIndex]!;

  return (
    <section className={styles.lab} data-geometry-lab data-triangle-angle-sum-lab data-missing-angle-series>
      <div className={styles.taskCounter}><b>Zadanie {taskIndex + 1}/{tasks.length}</b></div>
      <MissingAngleExercise key={task.id} task={task} readOnly={readOnly} onResultChange={onResultChange} onSolved={handleSolved} />
      {finished ? <p className={styles.seriesComplete}>Wszystkie pięć różnych trójkątów zostało rozwiązanych.</p> : null}
    </section>
  );
}

function lessonLevel(seed: number): "l1" | "l2" {
  return Math.floor(Math.abs(Math.trunc(seed)) / 100) % 10 === 2 ? "l2" : "l1";
}

export function TriangleAngleSumGeometryLab({ seed, readOnly = false, difficulty = "core", onResultChange }: TriangleAngleSumGeometryLabProps) {
  const generatedTask = useMemo(() => createPublicTriangleAngleSumTask(seed, difficulty), [seed, difficulty]);
  const activity = Math.abs(Math.trunc(seed)) % 100;
  const level = lessonLevel(seed);
  if (activity === 1) return <AngleSumInformationSeries initialAngles={generatedTask.angles} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === 5) return <MissingAngleSeries tasks={PRACTICE_TASKS[level]} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity >= 11 && activity <= 15) {
    const task = PRACTICE_TASKS[level][activity - 11]!;
    return <section className={styles.lab} data-geometry-lab data-triangle-angle-sum-lab><MissingAngleExercise key={seed} task={task} readOnly={readOnly} onResultChange={onResultChange} /></section>;
  }
  const task = STAGE_TASKS[level][activity as 2 | 3 | 4] ?? STAGE_TASKS[level][2];
  return <section className={styles.lab} data-geometry-lab data-triangle-angle-sum-lab><MissingAngleExercise key={seed} task={task} readOnly={readOnly} onResultChange={onResultChange} /></section>;
}
