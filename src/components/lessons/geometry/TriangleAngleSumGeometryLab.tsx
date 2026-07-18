"use client";

import { useMemo, useState } from "react";
import { createPublicTriangleAngleSumTask, triangleAngleSumValue } from "@/lib/math/geometry/triangleAngleSum";
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

function TriangleAngleDiagram({ angles, caption }: { angles: TriangleAngles; caption: string }) {
  const points = trianglePointsFromAngles(angles);
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
          <path d={mark.path} className={styles.angleArc} />
          <text x={mark.label.x} y={mark.label.y} className={styles.angleLabel}>{angles[index]}°</text>
        </g>
      ))}
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
        <TriangleAngleDiagram angles={pageAngles} caption={`${title}. Miary kątów: ${pageAngles.join("°, ")}°.`} />
        <p className={styles.equation}>{pageAngles[0]}° + {pageAngles[1]}° + {pageAngles[2]}° = 180°</p>
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

function TriangleAngleSumExercise({ seed, mode, difficulty, readOnly = false, onResultChange }: Required<Pick<TriangleAngleSumGeometryLabProps, "seed" | "mode" | "difficulty">> & Pick<TriangleAngleSumGeometryLabProps, "readOnly" | "onResultChange">) {
  const task = useMemo(() => createPublicTriangleAngleSumTask(seed, difficulty), [seed, difficulty]);
  const [angles, setAngles] = useState<[number, number, number]>([...task.angles]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const updateAngle = (index: 0 | 1, rawValue: number) => {
    const otherIndex = index === 0 ? 1 : 0;
    const value = Math.max(MIN_ANGLE, Math.min(MAX_PAIR_SUM - angles[otherIndex], rawValue));
    const next = [...angles] as [number, number, number];
    next[index] = value;
    next[2] = 180 - next[0] - next[1];
    setAngles(next);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    const expected = task.angles[task.missingIndex]!;
    const correct = Number(answer) === expected && triangleAngleSumValue(angles) === 180;
    const message = correct ? "Suma kątów wynosi 180°. Rachunek i model są zgodne." : `Najpierw użyj 180° − ${task.angles.filter((_, index) => index !== task.missingIndex).join("° − ")}°. Dodaj krótkie uzasadnienie słowami: suma kątów trójkąta.`;
    setFeedback(message);
    onResultChange?.(correct, `${answer}°; suma ${triangleAngleSumValue(angles)}°`);
  };
  return (
    <section className={styles.lab} data-geometry-lab data-triangle-angle-sum-lab data-mode={mode} data-seed={seed}>
      <header><p className={styles.eyebrow}>Miary kątów w trójkącie</p><h2 className={styles.exerciseTitle}>Oblicz brakujący kąt</h2></header>
      <TriangleAngleDiagram angles={angles} caption={`Trójkąt z kątami ${angles.join("°, ")}°.`} />
      <div className={styles.sliders}><label>Kąt A: <strong>{angles[0]}°</strong><input type="range" min={MIN_ANGLE} max={MAX_PAIR_SUM - angles[1]} value={angles[0]} disabled={readOnly} onChange={(event) => updateAngle(0, Number(event.target.value))} /></label><label>Kąt B: <strong>{angles[1]}°</strong><input type="range" min={MIN_ANGLE} max={MAX_PAIR_SUM - angles[0]} value={angles[1]} disabled={readOnly} onChange={(event) => updateAngle(1, Number(event.target.value))} /></label></div>
      <div className={styles.answerCard}><p>{task.prompt}</p><label>Brakujący kąt (°)<input inputMode="numeric" value={answer} disabled={readOnly} onChange={(event) => { setAnswer(event.target.value); setFeedback(null); onResultChange?.(null); }} /></label>{!readOnly ? <button type="button" onClick={check}>Sprawdź</button> : null}</div>
      <p className={styles.feedback} role="status">Suma aktualnych kątów: {triangleAngleSumValue(angles)}°{feedback ? ` — ${feedback}` : ""}</p>
    </section>
  );
}

export function TriangleAngleSumGeometryLab({ seed, mode = "practice", difficulty = "core", readOnly = false, onResultChange }: TriangleAngleSumGeometryLabProps) {
  const task = useMemo(() => createPublicTriangleAngleSumTask(seed, difficulty), [seed, difficulty]);
  const isInformationSlide = Math.abs(Math.trunc(seed)) % 100 === 1;
  if (isInformationSlide) return <AngleSumInformationSeries initialAngles={task.angles} readOnly={readOnly} onResultChange={onResultChange} />;
  return <TriangleAngleSumExercise seed={seed} mode={mode} difficulty={difficulty} readOnly={readOnly} onResultChange={onResultChange} />;
}
