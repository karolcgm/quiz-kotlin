"use client";

import { useEffect, useState } from "react";
import type { GeometryLabMode } from "@/types/geometry";
import styles from "@/components/lessons/geometry/symmetryAxis.module.css";

interface Props {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type FigureKind = "heart" | "square" | "rectangle" | "rhombus" | "parallelogram" | "isosceles-triangle" | "equilateral-triangle" | "scalene-triangle" | "isosceles-trapezoid" | "circle";

interface AxisExample {
  kind: FigureKind;
  name: string;
  count: string;
  axes: readonly ("vertical" | "horizontal" | "diagonal-a" | "diagonal-b")[];
}

interface AxisTask {
  kind: FigureKind;
  expected: string;
  options: readonly string[];
  hint: string;
}

const EXAMPLES: readonly AxisExample[] = [
  { kind: "square", name: "Kwadrat", count: "4 osie symetrii", axes: ["vertical", "horizontal", "diagonal-a", "diagonal-b"] },
  { kind: "rectangle", name: "Prostokąt", count: "2 osie symetrii", axes: ["vertical", "horizontal"] },
  { kind: "rhombus", name: "Romb", count: "2 osie symetrii", axes: ["vertical", "horizontal"] },
  { kind: "isosceles-triangle", name: "Trójkąt równoramienny", count: "1 oś symetrii", axes: ["vertical"] },
  { kind: "equilateral-triangle", name: "Trójkąt równoboczny", count: "3 osie symetrii", axes: ["vertical", "diagonal-a", "diagonal-b"] },
  { kind: "isosceles-trapezoid", name: "Trapez równoramienny", count: "1 oś symetrii", axes: ["vertical"] },
  { kind: "parallelogram", name: "Równoległobok", count: "0 osi symetrii", axes: [] },
  { kind: "circle", name: "Koło", count: "Nieskończenie wiele osi", axes: ["vertical", "horizontal", "diagonal-a", "diagonal-b"] },
];

const TASKS: readonly AxisTask[] = [
  { kind: "rectangle", expected: "2", options: ["1", "2", "4", "0"], hint: "Sprawdź prostą pionową i poziomą przechodzącą przez środek." },
  { kind: "scalene-triangle", expected: "0", options: ["3", "1", "0", "2"], hint: "Żadne złożenie tego trójkąta nie nałoży jego części na siebie." },
  { kind: "square", expected: "4", options: ["2", "1", "0", "4"], hint: "Oprócz osi pionowej i poziomej sprawdź obie przekątne." },
  { kind: "isosceles-trapezoid", expected: "1", options: ["0", "1", "2", "4"], hint: "Jedna prosta przechodzi przez środki obu podstaw." },
  { kind: "parallelogram", expected: "0", options: ["2", "0", "1", "4"], hint: "Zwykły równoległobok nie nakłada się na siebie po złożeniu wzdłuż prostej." },
  { kind: "equilateral-triangle", expected: "3", options: ["1", "2", "3", "0"], hint: "Każda oś przechodzi przez wierzchołek i środek przeciwległego boku." },
  { kind: "rhombus", expected: "2", options: ["4", "1", "0", "2"], hint: "Obie przekątne rombu są jego osiami symetrii." },
  { kind: "circle", expected: "nieskończenie wiele", options: ["1", "nieskończenie wiele", "4", "0"], hint: "Każda prosta przechodząca przez środek koła jest osią symetrii." },
];

function FigureShape({ kind }: { kind: FigureKind }) {
  if (kind === "heart") return <path className={styles.shape} d="M150 158C110 126 52 88 70 45c15-35 61-24 80 8 19-32 65-43 80-8 18 43-40 81-80 113z" />;
  if (kind === "square") return <rect className={styles.shape} x="79" y="24" width="142" height="142" rx="2" />;
  if (kind === "rectangle") return <rect className={styles.shape} x="38" y="53" width="224" height="92" rx="2" />;
  if (kind === "rhombus") return <polygon className={styles.warmShape} points="150,18 252,95 150,172 48,95" />;
  if (kind === "parallelogram") return <polygon className={styles.warmShape} points="42,150 92,42 258,42 208,150" />;
  if (kind === "isosceles-triangle") return <polygon className={styles.greenShape} points="150,18 75,162 225,162" />;
  if (kind === "equilateral-triangle") return <polygon className={styles.greenShape} points="150,10 58,169 242,169" />;
  if (kind === "scalene-triangle") return <polygon className={styles.greenShape} points="92,25 35,160 263,145" />;
  if (kind === "isosceles-trapezoid") return <polygon className={styles.shape} points="45,155 95,42 205,42 255,155" />;
  return <circle className={styles.shape} cx="150" cy="95" r="74" />;
}

function FigureWithAxes({ kind, axes = [], label }: { kind: FigureKind; axes?: AxisExample["axes"]; label: string }) {
  return <svg viewBox="0 0 300 190" className={styles.figure} role="img" aria-label={label}>
    <rect className={styles.canvas} x="2" y="2" width="296" height="186" rx="18" />
    <FigureShape kind={kind} />
    {axes.includes("vertical") ? <line className={styles.axis} x1="150" y1="7" x2="150" y2="183" /> : null}
    {axes.includes("horizontal") ? <line className={styles.axis} x1="24" y1="95" x2="276" y2="95" /> : null}
    {axes.includes("diagonal-a") ? <line className={styles.axis} x1={kind === "square" ? 70 : kind === "equilateral-triangle" ? 35 : 45} y1={kind === "equilateral-triangle" ? 182 : 170} x2={kind === "square" ? 230 : kind === "equilateral-triangle" ? 265 : 255} y2={kind === "equilateral-triangle" ? 50 : 20} /> : null}
    {axes.includes("diagonal-b") ? <line className={styles.axis} x1={kind === "square" ? 70 : kind === "equilateral-triangle" ? 35 : 45} y1={kind === "equilateral-triangle" ? 50 : 20} x2={kind === "square" ? 230 : kind === "equilateral-triangle" ? 265 : 255} y2={kind === "equilateral-triangle" ? 182 : 170} /> : null}
  </svg>;
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return <header className={styles.header}><p>Dział 4 · Figury na płaszczyźnie</p><h2>{title}</h2><span>{subtitle}</span></header>;
}

function DefinitionView() {
  return <section className={styles.lab} data-symmetry-axis data-view="definition">
    <Header title="Co to jest oś symetrii?" subtitle="Oś symetrii to prosta, która dzieli figurę na dwie części pasujące do siebie jak odbicie w lustrze." />
    <FigureWithAxes kind="heart" axes={["vertical"]} label="Figura z pionową osią symetrii" />
    <div className={styles.definitionCards}>
      <article><h3>Oś symetrii</h3><p>Po złożeniu figury wzdłuż tej prostej obie części dokładnie się pokrywają.</p></article>
      <article><h3>Figura osiowosymetryczna</h3><p>Tak nazywamy figurę, która ma co najmniej jedną oś symetrii.</p></article>
    </div>
    <p className={styles.important}>Oś symetrii może przebiegać pionowo, poziomo albo ukośnie.</p>
  </section>;
}

function ExamplesView() {
  return <section className={styles.lab} data-symmetry-axis data-view="examples">
    <Header title="Ile osi symetrii mają figury?" subtitle="Przerywane proste pokazują wszystkie osie symetrii danej figury." />
    <div className={styles.gallery}>{EXAMPLES.map((example) => <article className={styles.figureCard} key={example.kind} data-symmetry-example={example.kind}>
      <FigureWithAxes kind={example.kind} axes={example.axes} label={`${example.name}: ${example.count}`} />
      <h3>{example.name}</h3><p>{example.count}</p>
    </article>)}</div>
    <p className={styles.important}>Figura może mieć 0, 1, 2, 3, 4 albo nieskończenie wiele osi symetrii.</p>
  </section>;
}

function PracticeView({ seed, mode, readOnly, assessmentSubmitted, onResultChange }: Props) {
  const [state, setState] = useState({ seed, index: 0, selected: "", feedback: "", complete: false });
  const current = state.seed === seed ? state : { seed, index: 0, selected: "", feedback: "", complete: false };
  const task = TASKS[Math.min(current.index, TASKS.length - 1)]!;
  const locked = readOnly || mode === "assessment" && assessmentSubmitted || current.complete;
  const feedbackIsCorrect = current.feedback.startsWith("Dobrze");

  useEffect(() => { onResultChange?.(null); }, [onResultChange, seed]);

  const confirm = () => {
    if (!current.selected) {
      setState({ ...current, feedback: "Najpierw wybierz liczbę osi symetrii." });
      return;
    }
    if (current.selected !== task.expected) {
      setState({ ...current, feedback: task.hint });
      onResultChange?.(false, current.selected);
      return;
    }
    if (current.index === TASKS.length - 1) {
      setState({ ...current, feedback: "Dobrze. Rozpoznano osie symetrii wszystkich figur.", complete: true });
      onResultChange?.(true, "ukończono 8 figur: osie symetrii");
      return;
    }
    setState({ ...current, feedback: "Dobrze. Za chwilę pojawi się następna figura." });
    window.setTimeout(() => setState((previous) => previous.seed === seed ? { ...previous, index: previous.index + 1, selected: "", feedback: "" } : previous), 650);
  };

  return <section className={styles.lab} data-symmetry-axis data-view="practice">
    <Header title="Określ liczbę osi symetrii" subtitle="Obejrzyj figurę i wyobraź sobie jej złożenie wzdłuż różnych prostych." />
    <div className={styles.progress}>Figura {current.index + 1} z {TASKS.length}</div>
    <FigureWithAxes kind={task.kind} label="Figura do rozpoznania osi symetrii" />
    <div className={styles.taskCard}>
      <p>Ile osi symetrii ma ta figura?</p>
      <div className={styles.options} role="group" aria-label="Wybierz liczbę osi symetrii">{task.options.map((option) => <button key={option} type="button" disabled={locked} aria-pressed={current.selected === option} onClick={() => setState({ ...current, selected: option, feedback: "" })}>{option}</button>)}</div>
      {!locked ? <button className={styles.confirm} type="button" onClick={confirm}>Zatwierdź</button> : null}
      <p className={feedbackIsCorrect ? styles.correct : styles.feedback} data-feedback-tone={feedbackIsCorrect ? "correct" : "error"} role="status">{current.feedback}</p>
    </div>
  </section>;
}

export function SymmetryAxisGeometryLab(props: Props) {
  const view = Math.abs(Math.trunc(props.seed)) % 100;
  if (view === 1) return <DefinitionView />;
  if (view === 2) return <ExamplesView />;
  return <PracticeView {...props} />;
}
