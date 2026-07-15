"use client";

import { useMemo, useState } from "react";
import { createPublicTriangleAngleSumTask, triangleAngleSumValue } from "@/lib/math/geometry/triangleAngleSum";
import type { GeometryLabMode } from "@/types/geometry";
import type { LessonDifficulty } from "@/types/lessonPackage";
import styles from "@/components/lessons/geometry/geometry.module.css";

export interface TriangleAngleSumGeometryLabProps {
  seed: number;
  mode?: GeometryLabMode;
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export function TriangleAngleSumGeometryLab({ seed, mode = "practice", difficulty = "core", readOnly = false, onResultChange }: TriangleAngleSumGeometryLabProps) {
  const task = useMemo(() => createPublicTriangleAngleSumTask(seed, difficulty), [seed, difficulty]);
  const [angles, setAngles] = useState<[number, number, number]>([...task.angles]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const updateAngle = (index: 0 | 1, value: number) => {
    const next = [...angles] as [number, number, number];
    next[index] = value;
    next[2] = Math.max(1, 180 - next[0] - next[1]);
    setAngles(next);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    const expected = task.angles[task.missingIndex]!;
    const correct = Number(answer) === expected && triangleAngleSumValue(angles) === 180;
    const message = correct ? "Suma kątów wynosi 180°. Rachunek i model są zgodne." : `Najpierw użyj 180° − ${task.angles.filter((_, i) => i !== task.missingIndex).join("° − ")}°. Dodaj krótkie uzasadnienie słowami: suma kątów trójkąta.`;
    setFeedback(message);
    onResultChange?.(correct, `${answer}°; suma ${triangleAngleSumValue(angles)}°`);
  };
  const points = [[80, 210], [320, 210], [190, 55]] as const;
  return <section className={`${styles.lab} space-y-4`} data-geometry-lab data-triangle-angle-sum-lab data-mode={mode} data-seed={seed}>
    <header><p className={styles.eyebrow}>geometry-lab · M5-4.8 · suma kątów trójkąta</p><h2 className={styles.title}>Rozerwij i złóż 180°</h2><p className={styles.description}>Przeciągaj suwaki. Trzeci kąt zmienia się tak, aby cały trójkąt zachował sumę 180°.</p></header>
    <svg viewBox="0 0 400 250" role="img" aria-label="Trójkąt z trzema aktualnymi miarami kątów" className="h-auto w-full rounded-2xl bg-sky-50">
      <polygon points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="rgba(99,102,241,.16)" stroke="currentColor" strokeWidth="4" />
      {points.map(([x, y], index) => <text key={index} x={x} y={y + (index === 2 ? -12 : 24)} textAnchor="middle" fontWeight="800">{"ABC"[index]}: {angles[index]}°</text>)}
    </svg>
    <div className="grid gap-3 sm:grid-cols-2"><label className="form-label">kąt A: {angles[0]}°<input className="form-range" type="range" min="10" max="150" value={angles[0]} disabled={readOnly} onChange={(event) => updateAngle(0, Number(event.target.value))} /></label><label className="form-label">kąt B: {angles[1]}°<input className="form-range" type="range" min="10" max={Math.max(10, 169 - angles[0])} value={angles[1]} disabled={readOnly} onChange={(event) => updateAngle(1, Number(event.target.value))} /></label></div>
    <div className="rounded-2xl bg-white p-4"><p className="font-black">{task.prompt}</p><div className="mt-3 flex flex-wrap items-end gap-3"><label className="form-label">Brakujący kąt (°)<input className="form-control w-28" inputMode="numeric" value={answer} disabled={readOnly} onChange={(event) => { setAnswer(event.target.value); setFeedback(null); onResultChange?.(null); }} /></label>{!readOnly ? <button type="button" className="btn btn-primary" onClick={check}>Sprawdź</button> : null}</div></div>
    <p className="text-sm font-bold" role="status">Suma aktualnych kątów: {triangleAngleSumValue(angles)}°{feedback ? ` — ${feedback}` : ""}</p>
  </section>;
}
