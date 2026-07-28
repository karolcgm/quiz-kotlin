"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { GeometryLabMode } from "@/types/geometry";
import styles from "@/components/lessons/geometry/trapezoid.module.css";

interface Props {
  seed: number;
  mode?: GeometryLabMode;
  readOnly?: boolean;
  assessmentSubmitted?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

interface ChoiceTask {
  prompt: string;
  options: readonly string[];
  correct: string;
  hint: string;
}

interface AngleTask {
  kind: "general" | "isosceles" | "right" | "exterior";
  givenVertex: "A" | "B" | "C" | "D" | "zewnętrzny";
  given: number;
  answerVertex: "A" | "B" | "C" | "D";
  expected: number;
  prompt: string;
}

interface QuadrilateralAngleTask {
  figure: "parallelogram" | "isosceles-trapezoid";
  relation: "adjacent" | "exterior" | "vertical";
  given: number;
  answerVertex: "A" | "B" | "C" | "D";
  expected: number;
  prompt: string;
  hint: string;
}

interface MixedNumberValue {
  whole: number;
  numerator?: number;
  denominator?: number;
}

interface PerimeterTask {
  kind: "general" | "isosceles" | "right";
  prompt: ReactNode;
  given: ReactNode;
  answerLabel: string;
  expected: MixedNumberValue;
  unit: string;
  hint: string;
}

type AnswerPart = "whole" | "numerator" | "denominator";

function FormattedNumber({ whole, numerator, denominator }: MixedNumberValue) {
  const hasFraction = numerator !== undefined && denominator !== undefined;
  const label = hasFraction ? `${whole} i ${numerator}/${denominator}` : String(whole);
  return <span className={styles.mixedNumber} role="img" aria-label={label}>
    <span aria-hidden="true">{whole}</span>
    {hasFraction ? <span className={styles.stackedFraction} aria-hidden="true"><span>{numerator}</span><span className={styles.fractionLine} /><span>{denominator}</span></span> : null}
  </span>;
}

const BASE_TASKS: readonly ChoiceTask[] = [
  { prompt: "Które boki trapezu nazywamy podstawami?", options: ["Boki równoległe", "Oba ramiona", "Zawsze dwa najdłuższe boki"], correct: "Boki równoległe", hint: "Podstawami trapezu są jego dwa boki równoległe." },
  { prompt: "Jak nazywamy dwa pozostałe boki trapezu?", options: ["Przekątne", "Ramiona", "Podstawy"], correct: "Ramiona", hint: "Boki, które nie są podstawami, nazywamy ramionami." },
];

const TYPE_TASKS: readonly ChoiceTask[] = [
  { prompt: "Trapez ma dwa ramiona tej samej długości. Jaki to trapez?", options: ["Równoramienny", "Prostokątny", "Każdy trapez"], correct: "Równoramienny", hint: "Równe ramiona są cechą trapezu równoramiennego." },
  { prompt: "Trapez ma dwa kąty proste. Jaki to trapez?", options: ["Równoramienny", "Prostokątny", "Romb"], correct: "Prostokątny", hint: "Trapez prostokątny ma ramię prostopadłe do obu podstaw, więc ma dwa kąty proste." },
  { prompt: "W którym trapezie kąty przy każdej podstawie są parami równe?", options: ["W równoramiennym", "W każdym prostokątnym", "W każdym trapezie"], correct: "W równoramiennym", hint: "W trapezie równoramiennym kąty przy tej samej podstawie są równe." },
];

const ANGLE_THEORY_TASKS: readonly ChoiceTask[] = [
  { prompt: "Kąty przy tym samym ramieniu trapezu mają łącznie:", options: ["90°", "180°", "360°"], correct: "180°", hint: "Podstawy są równoległe, dlatego kąty przy jednym ramieniu uzupełniają się do 180°." },
  { prompt: "W trapezie równoramiennym kąt przy dolnej podstawie z lewej strony jest równy:", options: ["Kątowi przy dolnej podstawie z prawej strony", "Dowolnemu górnemu kątowi", "Zawsze 90°"], correct: "Kątowi przy dolnej podstawie z prawej strony", hint: "Kąty leżące przy tej samej podstawie trapezu równoramiennego są równe." },
];

const ANGLE_TASKS: readonly AngleTask[] = [
  { kind: "general", givenVertex: "A", given: 68, answerVertex: "B", expected: 112, prompt: "Kąt A ma 68°. Oblicz kąt B przy tym samym ramieniu." },
  { kind: "isosceles", givenVertex: "A", given: 72, answerVertex: "D", expected: 72, prompt: "Trapez jest równoramienny. Kąt A ma 72°. Oblicz kąt D." },
  { kind: "isosceles", givenVertex: "C", given: 118, answerVertex: "A", expected: 62, prompt: "Trapez jest równoramienny. Kąt C ma 118°. Oblicz kąt A." },
  { kind: "right", givenVertex: "C", given: 64, answerVertex: "D", expected: 116, prompt: "Trapez jest prostokątny. Kąt C ma 64°. Oblicz kąt D." },
  { kind: "exterior", givenVertex: "zewnętrzny", given: 132, answerVertex: "A", expected: 48, prompt: "Kąt zewnętrzny przyległy do kąta A ma 132°. Oblicz kąt A." },
];

const QUADRILATERAL_ANGLE_TASKS: readonly QuadrilateralAngleTask[] = [
  {
    figure: "parallelogram",
    relation: "adjacent",
    given: 74,
    answerVertex: "B",
    expected: 106,
    prompt: "Kąt A równoległoboku ma 74°. Oblicz miarę kąta B.",
    hint: "Kąty sąsiednie równoległoboku mają razem 180°.",
  },
  {
    figure: "parallelogram",
    relation: "exterior",
    given: 128,
    answerVertex: "C",
    expected: 52,
    prompt: "Kąt zewnętrzny przyległy do kąta A ma 128°. Oblicz miarę kąta C.",
    hint: "Najpierw oblicz kąt A jako przyległy do 128°, a potem użyj równości kątów przeciwległych.",
  },
  {
    figure: "parallelogram",
    relation: "vertical",
    given: 67,
    answerVertex: "D",
    expected: 67,
    prompt: "Przedłużono boki przy wierzchołku B. Zaznaczony kąt wierzchołkowy ma 67°. Oblicz miarę kąta D.",
    hint: "Kąt B jest równy zaznaczonemu kątowi wierzchołkowemu, a kąty B i D są przeciwległe.",
  },
  {
    figure: "isosceles-trapezoid",
    relation: "adjacent",
    given: 112,
    answerVertex: "A",
    expected: 68,
    prompt: "Trapez ABCD jest równoramienny. Kąt C ma 112°. Oblicz miarę kąta A.",
    hint: "Kąty przy górnej podstawie są równe, a kąty przy jednym ramieniu mają razem 180°.",
  },
  {
    figure: "isosceles-trapezoid",
    relation: "exterior",
    given: 124,
    answerVertex: "C",
    expected: 124,
    prompt: "Trapez ABCD jest równoramienny. Kąt zewnętrzny przyległy do kąta A ma 124°. Oblicz miarę kąta C.",
    hint: "Kąt A ma 56°. W trapezie równoramiennym kąt B ma 124°, a kąt C jest mu równy.",
  },
];

const PERIMETER_TASKS: readonly PerimeterTask[] = [
  { kind: "general", prompt: <>Boki trapezu mają 12 cm, 8 cm, 7 cm i 15 cm. Oblicz obwód.</>, given: <>a = 12 cm, b = 8 cm, c = 7 cm, d = 15 cm</>, answerLabel: "Obwód trapezu", expected: { whole: 42 }, unit: "cm", hint: "Dodaj długości wszystkich czterech boków." },
  { kind: "isosceles", prompt: <>Podstawy trapezu równoramiennego mają 18 cm i 10 cm, a każde ramię ma 7 cm. Oblicz obwód.</>, given: <>a = 18 cm, b = 10 cm, ramię = 7 cm</>, answerLabel: "Obwód trapezu", expected: { whole: 42 }, unit: "cm", hint: "Dodaj obie podstawy oraz dwa ramiona długości 7 cm." },
  { kind: "isosceles", prompt: <>Obwód trapezu równoramiennego wynosi 44 cm, a podstawy mają 16 cm i 12 cm. Oblicz długość ramienia.</>, given: <>Obw = 44 cm, a = 16 cm, b = 12 cm</>, answerLabel: "Długość ramienia", expected: { whole: 8 }, unit: "cm", hint: "Od obwodu odejmij obie podstawy, a pozostałą długość podziel przez 2." },
  { kind: "right", prompt: <>Podstawy trapezu prostokątnego mają <FormattedNumber whole={9} numerator={1} denominator={2} /> cm i <FormattedNumber whole={5} numerator={1} denominator={2} /> cm, a ramiona 4 cm i 6 cm. Oblicz obwód.</>, given: <>a = <FormattedNumber whole={9} numerator={1} denominator={2} /> cm, b = <FormattedNumber whole={5} numerator={1} denominator={2} /> cm, c = 4 cm, d = 6 cm</>, answerLabel: "Obwód trapezu", expected: { whole: 25 }, unit: "cm", hint: "Dodaj obie podstawy i oba ramiona. Połówki tworzą jedną całość." },
  { kind: "general", prompt: <>Obwód trapezu wynosi 36 cm. Podstawy mają 13 cm i 9 cm, a jedno ramię ma 6 cm. Oblicz drugie ramię.</>, given: <>Obw = 36 cm, a = 13 cm, b = 9 cm, c = 6 cm</>, answerLabel: "Długość drugiego ramienia", expected: { whole: 8 }, unit: "cm", hint: "Od obwodu odejmij długości trzech znanych boków." },
];

function RightAngleMark({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return <g className={styles.rightMark} data-right-angle-mark><path d={flip ? `M${x + 30} ${y} A30 30 0 0 1 ${x} ${y + 30}` : `M${x + 30} ${y} A30 30 0 0 0 ${x} ${y - 30}`} /><circle cx={x + 18} cy={flip ? y + 18 : y - 18} r="4" /></g>;
}

function BasesVisual() {
  return <svg viewBox="0 0 820 350" className={styles.visual} role="img" aria-label="Trapez ABCD z podpisanymi podstawami i ramionami">
    <rect width="820" height="350" rx="28" className={styles.background} />
    <polygon points="90,270 220,70 600,70 730,270" className={styles.trapezoid} />
    <text x="410" y="54" className={styles.baseLabel}>PODSTAWA</text><text x="410" y="315" className={styles.baseLabel}>PODSTAWA</text>
    <text x="120" y="160" className={styles.sideLabel}>RAMIĘ</text><text x="700" y="160" className={styles.sideLabel}>RAMIĘ</text>
    <text x="70" y="299" className={styles.vertex}>A</text><text x="205" y="58" className={styles.vertex}>B</text><text x="615" y="58" className={styles.vertex}>C</text><text x="750" y="299" className={styles.vertex}>D</text>
  </svg>;
}

function TypesVisual() {
  return <svg viewBox="0 0 900 350" className={styles.visual} role="img" aria-label="Trapez równoramienny i trapez prostokątny">
    <rect width="900" height="350" rx="28" className={styles.background} />
    <g><polygon points="55,250 145,70 385,70 475,250" className={styles.isosceles} /><text x="265" y="305" className={styles.figureLabel}>TRAPEZ RÓWNORAMIENNY</text></g>
    <g><polygon points="555,250 555,70 770,70 850,250" className={styles.rightTrapezoid} /><RightAngleMark x={555} y={250} /><RightAngleMark x={555} y={70} flip /><text x="703" y="305" className={styles.figureLabel}>TRAPEZ PROSTOKĄTNY</text></g>
  </svg>;
}

function AngleTheoryVisual() {
  return <svg viewBox="0 0 900 390" className={styles.visual} role="img" aria-label="Kąty przy ramieniu trapezu i kąty trapezu równoramiennego">
    <rect width="900" height="390" rx="28" className={styles.background} />
    <g><polygon points="45,270 130,80 390,80 475,270" className={styles.trapezoid} /><path d="M91 270 A46 46 0 0 0 65.5 229" className={styles.angleArcA} /><path d="M109.5 121 A46 46 0 0 0 176 80" className={styles.angleArcB} /><text x="77" y="248" className={styles.angleText}>α</text><text x="144" y="115" className={styles.angleText}>β</text><text x="260" y="330" className={styles.ruleText}>α + β = 180°</text></g>
    <g><polygon points="535,270 625,80 775,80 865,270" className={styles.isosceles} /><path d="M581 270 A46 46 0 0 0 555.5 229M819 270 A46 46 0 0 1 844.5 229" className={styles.equalBottomArcs} /><path d="M604.5 121 A46 46 0 0 0 671 80M729 80 A46 46 0 0 0 795.5 121" className={styles.equalTopArcs} /><text x="700" y="330" className={styles.ruleText}>kąty przy każdej podstawie są równe</text></g>
  </svg>;
}

function AngleTaskVisual({ task }: { task: AngleTask }) {
  const topY = 90;
  const bottomY = 270;
  const height = bottomY - topY;
  const interiorA = task.kind === "exterior" ? 180 - task.given : task.kind === "isosceles" && task.givenVertex === "C" ? 180 - task.given : task.givenVertex === "A" ? task.given : 68;
  const angleARadians = interiorA * Math.PI / 180;
  const pointA = { x: task.kind === "right" ? 100 : 80, y: bottomY };
  const pointD = { x: task.kind === "right" ? 570 : 680, y: bottomY };
  const pointB = { x: task.kind === "right" ? pointA.x : pointA.x + height / Math.tan(angleARadians), y: topY };
  const pointC = task.kind === "right"
    ? { x: pointD.x + height / Math.tan(task.given * Math.PI / 180), y: topY }
    : task.kind === "isosceles"
      ? { x: pointD.x - height / Math.tan(angleARadians), y: topY }
      : { x: 570, y: topY };
  const points = `${pointA.x},${pointA.y} ${pointB.x.toFixed(1)},${pointB.y} ${pointC.x.toFixed(1)},${pointC.y} ${pointD.x},${pointD.y}`;
  const labels: Record<"A" | "B" | "C" | "D", { x: number; y: number }> = {
    A: { x: pointA.x - 23, y: pointA.y + 29 }, B: { x: pointB.x - 17, y: pointB.y - 15 }, C: { x: pointC.x + 17, y: pointC.y - 15 }, D: { x: pointD.x + 23, y: pointD.y + 29 },
  };
  const radius = 43;
  const labelRadius = 69;
  const givenRadians = task.given * Math.PI / 180;
  let arcPath = "";
  let labelAngle = 0;
  let mark = pointA;
  if (task.givenVertex === "A") {
    arcPath = `M${pointA.x + radius} ${pointA.y} A${radius} ${radius} 0 0 0 ${(pointA.x + radius * Math.cos(givenRadians)).toFixed(1)} ${(pointA.y - radius * Math.sin(givenRadians)).toFixed(1)}`;
    labelAngle = -givenRadians / 2;
  } else if (task.givenVertex === "C") {
    mark = pointC;
    arcPath = `M${(pointC.x - radius).toFixed(1)} ${pointC.y} A${radius} ${radius} 0 0 0 ${(pointC.x + radius * Math.cos(Math.PI - givenRadians)).toFixed(1)} ${(pointC.y + radius * Math.sin(Math.PI - givenRadians)).toFixed(1)}`;
    labelAngle = Math.PI - givenRadians / 2;
  } else if (task.givenVertex === "zewnętrzny") {
    arcPath = `M${pointA.x - radius} ${pointA.y} A${radius} ${radius} 0 0 1 ${(pointA.x + radius * Math.cos(angleARadians)).toFixed(1)} ${(pointA.y - radius * Math.sin(angleARadians)).toFixed(1)}`;
    labelAngle = Math.PI + givenRadians / 2;
  }
  const givenPosition = { x: mark.x + labelRadius * Math.cos(labelAngle), y: mark.y + labelRadius * Math.sin(labelAngle) };
  return <svg viewBox="0 0 760 340" className={styles.angleTaskVisual} role="img" aria-label={`Trapez z podanym kątem ${task.given} stopni`} data-trapezoid-angle-task={task.kind}>
    <rect width="760" height="340" rx="28" className={styles.background} />
    {task.kind === "exterior" ? <path d={`M20 ${pointA.y}H${pointA.x}`} className={styles.extension} /> : null}
    <polygon points={points} className={task.kind === "isosceles" ? styles.isosceles : task.kind === "right" ? styles.rightTrapezoid : styles.trapezoid} />
    {task.kind === "right" ? <><RightAngleMark x={pointA.x} y={pointA.y} /><RightAngleMark x={pointB.x} y={pointB.y} flip /></> : null}
    <path d={arcPath} className={styles.givenAngleArc} />
    <text x={givenPosition.x} y={givenPosition.y} className={styles.givenMeasure}>{task.given}°</text>
    {Object.entries(labels).map(([vertex, position]) => <text key={vertex} x={position.x} y={position.y} className={styles.vertex}>{vertex}</text>)}
  </svg>;
}

function QuadrilateralAngleTaskVisual({ task }: { task: QuadrilateralAngleTask }) {
  const isParallelogram = task.figure === "parallelogram";
  const points = isParallelogram
    ? "100,260 190,80 620,80 530,260"
    : "100,260 210,80 510,80 620,260";
  const labels = isParallelogram
    ? { A: [77, 294], B: [173, 65], C: [635, 65], D: [548, 294] }
    : { A: [77, 294], B: [193, 65], C: [525, 65], D: [638, 294] };

  return <svg
    viewBox="0 0 720 340"
    className={styles.angleTaskVisual}
    role="img"
    aria-label={`${isParallelogram ? "Równoległobok" : "Trapez równoramienny"} z kątem ${task.given} stopni`}
    data-quadrilateral-angle-task={`${task.figure}-${task.relation}`}
  >
    <rect width="720" height="340" rx="28" className={styles.background} />
    <polygon points={points} className={isParallelogram ? styles.trapezoid : styles.isosceles} />

    {task.relation === "exterior" ? <path d="M20 260H100" className={styles.extension} strokeDasharray="12 10" data-angle-extension /> : null}
    {task.relation === "vertical" ? <>
      <path d="M55 80H190 M190 80L235 -10" className={styles.extension} strokeDasharray="12 10" data-angle-extension />
      <path d="M145 80 A45 45 0 0 0 210 40" className={styles.givenAngleArc} />
      <text x="132" y="49" className={styles.givenMeasure}>{task.given}°</text>
    </> : null}

    {task.relation === "adjacent" && isParallelogram ? <>
      <path d="M145 260 A45 45 0 0 0 120 220" className={styles.givenAngleArc} />
      <text x="143" y="232" className={styles.givenMeasure}>{task.given}°</text>
    </> : null}
    {task.relation === "adjacent" && !isParallelogram ? <>
      <path d="M465 80 A45 45 0 0 0 535 120" className={styles.givenAngleArc} />
      <text x="466" y="121" className={styles.givenMeasure}>{task.given}°</text>
    </> : null}
    {task.relation === "exterior" ? <>
      <path d="M55 260 A45 45 0 0 1 124 220" className={styles.givenAngleArc} />
      <text x="43" y="222" className={styles.givenMeasure}>{task.given}°</text>
    </> : null}

    {Object.entries(labels).map(([vertex, [x, y]]) => <text key={vertex} x={x} y={y} className={styles.vertex}>{vertex}</text>)}
    <text x="360" y="316" textAnchor="middle" className={styles.ruleText}>
      {isParallelogram ? "RÓWNOLEGŁOBOK" : "TRAPEZ RÓWNORAMIENNY"}
    </text>
  </svg>;
}

function ChoiceSeries({ title, description, visual, facts, tasks, readOnly = false, onResultChange }: { title: string; description: string; visual: ReactNode; facts: readonly string[]; tasks: readonly ChoiceTask[] } & Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = tasks[index]!;

  useEffect(() => {
    if (!solved || index === tasks.length - 1) return;
    const timer = window.setTimeout(() => { setIndex((current) => current + 1); setSelected(""); setFeedback(""); setSolved(false); }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved, tasks.length]);

  const confirm = () => {
    if (!selected) { setFeedback("Najpierw wybierz odpowiedź."); onResultChange?.(false, "brak odpowiedzi"); return; }
    if (selected !== task.correct) { setFeedback(task.hint); onResultChange?.(false, selected); return; }
    setFeedback("Dobrze. Odpowiedź wynika z własności pokazanej na rysunku.");
    setSolved(true);
    if (index === tasks.length - 1) onResultChange?.(true, `ukończono ${tasks.length} zadania: ${title}`);
    else onResultChange?.(null);
  };

  return <section className={styles.lab} data-trapezoid-series="choice">
    {visual}
    <header className={styles.header}><p>Trapezy</p><h2>{title}</h2><span>{description}</span></header>
    <div className={styles.facts}>{facts.map((fact) => <p key={fact}>{fact}</p>)}</div>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{tasks.length}</b><p>{task.prompt}</p><div className={styles.options}>{task.options.map((option) => <button key={option} type="button" disabled={readOnly || solved} aria-pressed={selected === option} onClick={() => { setSelected(option); setFeedback(""); onResultChange?.(null); }}>{option}</button>)}</div>{!readOnly ? <button type="button" className={styles.confirm} disabled={solved} onClick={confirm}>Zatwierdź</button> : null}</div>
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

function AnglePracticeSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = ANGLE_TASKS[index]!;

  useEffect(() => {
    if (!solved || index === ANGLE_TASKS.length - 1) return;
    const timer = window.setTimeout(() => { setIndex((current) => current + 1); setAnswer(""); setFeedback(""); setSolved(false); }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved]);

  const edit = (key: string) => {
    if (readOnly || solved || key !== "backspace" && !/^\d$/u.test(key)) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length < 3 ? `${current}${key}` : current);
    setFeedback(""); onResultChange?.(null);
  };

  const confirm = () => {
    if (!answer) { setFeedback("Wpisz miarę brakującego kąta."); onResultChange?.(false, "brak odpowiedzi"); return; }
    if (Number(answer) !== task.expected) { setFeedback(task.kind === "isosceles" ? "Pamiętaj o równych kątach przy podstawach trapezu równoramiennego oraz sumie 180° przy ramieniu." : "Kąty przy tym samym ramieniu lub kąty przyległe mają razem 180°."); onResultChange?.(false, answer); return; }
    setFeedback("Dobrze. Brakujący kąt został obliczony poprawnie."); setSolved(true);
    if (index === ANGLE_TASKS.length - 1) onResultChange?.(true, "ukończono pięć zadań z kątami trapezów"); else onResultChange?.(null);
  };

  return <section className={styles.lab} data-trapezoid-series="angles">
    <AngleTaskVisual task={task} />
    <header className={styles.header}><p>Trapezy</p><h2>Obliczanie kątów w trapezie</h2><span>Korzystaj z sumy 180° przy jednym ramieniu oraz własności trapezu równoramiennego.</span></header>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{ANGLE_TASKS.length}</b><p>{task.prompt}</p><div className={styles.singleAnswer}><strong>∠{task.answerVertex} =</strong><button type="button" aria-label={`Miara kąta ${task.answerVertex}`} data-active="true" disabled={readOnly || solved}>{answer || "\u00a0"}<span>°</span></button></div></div>
    <LessonNumericKeypad label="Kalkulator do kątów trapezu" helperText="Wpisz miarę brakującego kąta i zatwierdź raz na końcu zadania." onKey={edit} onConfirm={confirm} disabled={readOnly || solved} />
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

function QuadrilateralAnglePracticeSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = QUADRILATERAL_ANGLE_TASKS[index]!;

  useEffect(() => {
    if (!solved || index === QUADRILATERAL_ANGLE_TASKS.length - 1) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => current + 1);
      setAnswer("");
      setFeedback("");
      setSolved(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved]);

  const edit = (key: string) => {
    if (readOnly || solved || key !== "backspace" && !/^\d$/u.test(key)) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : current.length < 3 ? `${current}${key}` : current);
    setFeedback("");
    onResultChange?.(null);
  };

  const confirm = () => {
    if (!answer) {
      setFeedback("Wpisz miarę brakującego kąta.");
      onResultChange?.(false, "brak odpowiedzi");
      return;
    }
    if (Number(answer) !== task.expected) {
      setFeedback(task.hint);
      onResultChange?.(false, answer);
      return;
    }
    setFeedback("Dobrze. Wszystkie potrzebne zależności zostały zastosowane poprawnie.");
    setSolved(true);
    if (index === QUADRILATERAL_ANGLE_TASKS.length - 1) {
      onResultChange?.(true, "ukończono pięć zadań z kątami w czworokątach");
    } else {
      onResultChange?.(null);
    }
  };

  return <section className={styles.lab} data-quadrilateral-angle-series>
    <QuadrilateralAngleTaskVisual task={task} />
    <header className={styles.header}>
      <p>Kąty w czworokątach</p>
      <h2>Obliczanie kątów w czworokątach</h2>
      <span>Połącz własności równoległoboku lub trapezu równoramiennego z kątami przyległymi i wierzchołkowymi.</span>
    </header>
    <div className={styles.taskCard}>
      <b>Zadanie {index + 1}/{QUADRILATERAL_ANGLE_TASKS.length}</b>
      <p>{task.prompt}</p>
      <div className={styles.singleAnswer}>
        <strong>∠{task.answerVertex} =</strong>
        <button type="button" aria-label={`Miara kąta ${task.answerVertex}`} data-active="true" disabled={readOnly || solved}>
          {answer || "\u00a0"}<span>°</span>
        </button>
      </div>
    </div>
    <LessonNumericKeypad
      label="Kalkulator do kątów czworokątów"
      helperText="Wpisz miarę brakującego kąta i zatwierdź raz na końcu zadania."
      onKey={edit}
      onConfirm={confirm}
      disabled={readOnly || solved}
    />
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

function PerimeterVisual({ task }: { task: PerimeterTask }) {
  const points = task.kind === "right" ? "110,245 110,70 555,70 670,245" : task.kind === "isosceles" ? "70,245 180,70 560,70 670,245" : "70,245 165,70 545,70 690,245";
  return <svg viewBox="0 0 760 320" className={styles.perimeterVisual} role="img" aria-label="Trapez z podanymi długościami">
    <rect width="760" height="320" rx="28" className={styles.background} /><polygon points={points} className={task.kind === "isosceles" ? styles.isosceles : task.kind === "right" ? styles.rightTrapezoid : styles.trapezoid} /><foreignObject x="145" y="125" width="470" height="80"><div className={styles.givenBadge}>{task.given}</div></foreignObject>
  </svg>;
}

function PerimeterSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Record<AnswerPart, string>>({ whole: "", numerator: "", denominator: "" });
  const [activePart, setActivePart] = useState<AnswerPart>("whole");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = PERIMETER_TASKS[index]!;
  const expectsFraction = task.expected.numerator !== undefined && task.expected.denominator !== undefined;

  useEffect(() => {
    if (!solved || index === PERIMETER_TASKS.length - 1) return;
    const timer = window.setTimeout(() => { setIndex((current) => current + 1); setAnswer({ whole: "", numerator: "", denominator: "" }); setActivePart("whole"); setFeedback(""); setSolved(false); }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved]);

  const edit = (key: string) => {
    if (readOnly || solved || key !== "backspace" && !/^\d$/u.test(key)) return;
    setAnswer((current) => ({ ...current, [activePart]: key === "backspace" ? current[activePart].slice(0, -1) : current[activePart].length < 3 ? `${current[activePart]}${key}` : current[activePart] }));
    setFeedback(""); onResultChange?.(null);
  };

  const confirm = () => {
    const complete = Boolean(answer.whole) && (!expectsFraction || Boolean(answer.numerator && answer.denominator));
    if (!complete) { setFeedback("Uzupełnij wszystkie kratki wyniku."); onResultChange?.(false, "brak odpowiedzi"); return; }
    const correct = Number(answer.whole) === task.expected.whole && (!expectsFraction || Number(answer.numerator) === task.expected.numerator && Number(answer.denominator) === task.expected.denominator);
    const answerText = expectsFraction ? `${answer.whole} ${answer.numerator}/${answer.denominator}` : answer.whole;
    if (!correct) { setFeedback(task.hint); onResultChange?.(false, answerText); return; }
    setFeedback("Dobrze. Wszystkie długości potrzebne do obliczenia zostały wykorzystane."); setSolved(true);
    if (index === PERIMETER_TASKS.length - 1) onResultChange?.(true, "ukończono pięć zadań o obwodzie trapezu"); else onResultChange?.(null);
  };

  return <section className={styles.lab} data-trapezoid-series="perimeters">
    <PerimeterVisual task={task} />
    <header className={styles.header}><p>Trapezy</p><h2>Obwód trapezu i brakujący bok</h2><span>Obwód trapezu to suma długości jego czterech boków.</span></header>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{PERIMETER_TASKS.length}</b><p>{task.prompt}</p><div className={styles.numericAnswer}><span>{task.answerLabel}</span><div className={styles.answerRow}><button type="button" className={styles.answerCell} data-active={activePart === "whole"} aria-label="Część całkowita odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("whole")}>{answer.whole || "\u00a0"}</button>{expectsFraction ? <span className={styles.answerFraction}><button type="button" className={styles.answerCell} data-active={activePart === "numerator"} aria-label="Licznik odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("numerator")}>{answer.numerator || "\u00a0"}</button><span className={styles.answerLine} /><button type="button" className={styles.answerCell} data-active={activePart === "denominator"} aria-label="Mianownik odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("denominator")}>{answer.denominator || "\u00a0"}</button></span> : null}<strong>{task.unit}</strong></div></div></div>
    <LessonNumericKeypad label="Kalkulator do obwodów trapezów" helperText="Kliknij kratkę, wpisz wynik i zatwierdź raz na końcu zadania." onKey={edit} onConfirm={confirm} disabled={readOnly || solved} />
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

const BASE_FACTS = ["Trapez ma parę boków równoległych — są to podstawy.", "Dwa pozostałe boki trapezu nazywamy ramionami."] as const;
const TYPE_FACTS = ["Trapez równoramienny ma ramiona tej samej długości.", "Trapez prostokątny ma dwa kąty proste."] as const;
const ANGLE_FACTS = ["Kąty przy tym samym ramieniu trapezu mają razem 180°.", "W trapezie równoramiennym kąty przy każdej podstawie są równe."] as const;

export function TrapezoidGeometryLab({ seed, readOnly = false, assessmentSubmitted = false, mode = "practice", onResultChange }: Props) {
  const activity = Math.abs(Math.trunc(seed)) % 100;
  const locked = readOnly || mode === "assessment" && assessmentSubmitted;
  if (activity === 1) return <ChoiceSeries title="Podstawy i ramiona trapezu" description="Najpierw odczytaj nazwy boków z dużego rysunku." visual={<BasesVisual />} facts={BASE_FACTS} tasks={BASE_TASKS} readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 2) return <ChoiceSeries title="Rodzaje trapezów" description="Porównaj trapez równoramienny i prostokątny." visual={<TypesVisual />} facts={TYPE_FACTS} tasks={TYPE_TASKS} readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 3) return <ChoiceSeries title="Kąty w trapezie" description="Odczytaj zależności między kątami, bez przywiązywania ich do jednej stałej miary." visual={<AngleTheoryVisual />} facts={ANGLE_FACTS} tasks={ANGLE_THEORY_TASKS} readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 4) return <AnglePracticeSeries readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 6) return <QuadrilateralAnglePracticeSeries readOnly={locked} onResultChange={onResultChange} />;
  return <PerimeterSeries readOnly={locked} onResultChange={onResultChange} />;
}
