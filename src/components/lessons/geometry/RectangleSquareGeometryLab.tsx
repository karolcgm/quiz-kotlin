"use client";

import { useEffect, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { GeometryLabMode } from "@/types/geometry";
import styles from "@/components/lessons/geometry/rectangleSquare.module.css";

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

const RECOGNITION_TASKS: readonly ChoiceTask[] = [
  { prompt: "Figura ma cztery kąty proste. Przeciwległe boki są równe, ale sąsiednie mają różne długości. Co to za figura?", options: ["Prostokąt", "Kwadrat", "Trójkąt"], correct: "Prostokąt", hint: "Cztery kąty proste wystarczają do rozpoznania prostokąta. Różne sąsiednie boki wykluczają kwadrat." },
  { prompt: "Figura ma cztery kąty proste i wszystkie cztery boki tej samej długości. Co to za figura?", options: ["Kwadrat", "Tylko prostokąt", "Trapez"], correct: "Kwadrat", hint: "Kwadrat ma cztery równe boki oraz cztery kąty proste." },
  { prompt: "Które zdanie jest prawdziwe o figurze mającej cztery równe boki i cztery kąty proste?", options: ["Jest kwadratem i prostokątem", "Nie jest prostokątem", "Ma tylko jedną parę boków równoległych"], correct: "Jest kwadratem i prostokątem", hint: "Kwadrat zachowuje wszystkie własności prostokąta." },
];

const DIAGONAL_TASKS: readonly ChoiceTask[] = [
  { prompt: "Która własność przekątnych jest wspólna dla prostokąta i kwadratu?", options: ["Są równe i przecinają się w połowie", "Zawsze mają różne długości", "Nie przecinają się"], correct: "Są równe i przecinają się w połowie", hint: "W obu figurach punkt przecięcia dzieli każdą przekątną na dwie równe części." },
  { prompt: "W której figurze przekątne są dodatkowo prostopadłe?", options: ["W kwadracie", "W każdym prostokącie", "W żadnej"], correct: "W kwadracie", hint: "Prostopadłość przekątnych jest dodatkową własnością kwadratu." },
  { prompt: "Przekątne są równe, dzielą się na połowy i przecinają pod kątem prostym. Która nazwa opisuje figurę najdokładniej?", options: ["Kwadrat", "Prostokąt niebędący kwadratem", "Dowolny czworokąt"], correct: "Kwadrat", hint: "Połącz trzy informacje: równość, podział na połowy i prostopadłość przekątnych." },
];

const PERIMETER_TASKS = [
  { figure: "square" as const, prompt: "Bok kwadratu ma 4 1/2 cm. Oblicz obwód.", given: "a = 4 1/2 cm", answerLabel: "Obwód kwadratu", expected: 18, unit: "cm", hint: "Pomnóż długość boku przez 4." },
  { figure: "rectangle" as const, prompt: "Boki prostokąta mają 3 1/2 cm oraz 2 1/2 cm. Oblicz obwód.", given: "a = 3 1/2 cm, b = 2 1/2 cm", answerLabel: "Obwód prostokąta", expected: 12, unit: "cm", hint: "Dodaj oba boki i otrzymany wynik pomnóż przez 2." },
  { figure: "square" as const, prompt: "Obwód kwadratu wynosi 26 cm. Oblicz długość boku.", given: "P = 26 cm", answerLabel: "Długość boku kwadratu", expected: 6.5, unit: "cm", hint: "Podziel obwód przez 4. Wynik możesz wpisać z przecinkiem." },
  { figure: "rectangle" as const, prompt: "Obwód prostokąta wynosi 19 cm, a jeden bok ma 3 1/2 cm. Oblicz drugi bok.", given: "P = 19 cm, a = 3 1/2 cm", answerLabel: "Drugi bok prostokąta", expected: 6, unit: "cm", hint: "Najpierw oblicz połowę obwodu, a potem odejmij znany bok." },
  { figure: "rectangle" as const, prompt: "Boki prostokąta mają 5 1/4 cm i 3 3/4 cm. Oblicz obwód.", given: "a = 5 1/4 cm, b = 3 3/4 cm", answerLabel: "Obwód prostokąta", expected: 18, unit: "cm", hint: "Suma długości sąsiednich boków wynosi 9 cm." },
] as const;

function RightAngleMarks({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  return <g className={styles.rightMarks}>
    <path d={`M ${x + 25} ${y} A 25 25 0 0 1 ${x} ${y + 25}`} /><circle cx={x + 15} cy={y + 15} r="3.8" />
    <path d={`M ${x + width - 25} ${y} A 25 25 0 0 0 ${x + width} ${y + 25}`} /><circle cx={x + width - 15} cy={y + 15} r="3.8" />
    <path d={`M ${x + 25} ${y + height} A 25 25 0 0 0 ${x} ${y + height - 25}`} /><circle cx={x + 15} cy={y + height - 15} r="3.8" />
    <path d={`M ${x + width - 25} ${y + height} A 25 25 0 0 1 ${x + width} ${y + height - 25}`} /><circle cx={x + width - 15} cy={y + height - 15} r="3.8" />
  </g>;
}

function FiguresVisual({ diagonals = false }: { diagonals?: boolean }) {
  return <svg viewBox="0 0 820 300" className={styles.figuresVisual} role="img" data-rectangle-square-visual aria-label={diagonals ? "Przekątne prostokąta i kwadratu" : "Prostokąt i kwadrat z oznaczonymi własnościami"}>
    <rect width="820" height="300" rx="24" className={styles.visualBackground} />
    <g data-rectangle-figure>
      <rect x="45" y="70" width="330" height="160" className={styles.rectangleShape} />
      <RightAngleMarks x={45} y={70} width={330} height={160} />
      {diagonals ? <><path d="M45 70L375 230M375 70L45 230" className={styles.diagonal} data-diagonal /><circle cx="210" cy="150" r="7" className={styles.midpoint} /></> : null}
      <text x="210" y="270" className={styles.figureLabel}>PROSTOKĄT</text>
    </g>
    <g data-square-figure>
      <rect x="555" y="55" width="190" height="190" className={styles.squareShape} />
      <RightAngleMarks x={555} y={55} width={190} height={190} />
      {diagonals ? <><path d="M555 55L745 245M745 55L555 245" className={styles.diagonal} data-diagonal /><circle cx="650" cy="150" r="7" className={styles.midpoint} /><path d="M650 125 A25 25 0 0 1 675 150" className={styles.perpendicularArc} data-square-perpendicular /><circle cx="665" cy="135" r="4" className={styles.perpendicularDot} /></> : null}
      <text x="650" y="280" className={styles.figureLabel}>KWADRAT</text>
    </g>
  </svg>;
}

function ChoiceSeries({ title, description, facts, tasks, diagonals = false, readOnly = false, onResultChange }: { title: string; description: string; facts: readonly string[]; tasks: readonly ChoiceTask[]; diagonals?: boolean } & Pick<Props, "readOnly" | "onResultChange">) {
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
    setFeedback("Dobrze. Wskazana własność pasuje do figury.");
    setSolved(true);
    if (index === tasks.length - 1) onResultChange?.(true, `ukończono ${tasks.length} zadania: ${title}`);
    else onResultChange?.(null);
  };

  return <section className={styles.lab} data-rectangle-square-series={diagonals ? "diagonals" : "properties"}>
    <FiguresVisual diagonals={diagonals} />
    <header className={styles.header}><p className={styles.eyebrow}>Prostokąty i kwadraty</p><h2>{title}</h2><p>{description}</p></header>
    <div className={styles.facts}>{facts.map((fact) => <p key={fact}>{fact}</p>)}</div>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{tasks.length}</b><p>{task.prompt}</p><div className={styles.options}>{task.options.map((option) => <button key={option} type="button" disabled={readOnly || solved} aria-pressed={selected === option} onClick={() => { setSelected(option); setFeedback(""); onResultChange?.(null); }}>{option}</button>)}</div><button type="button" className={styles.confirm} disabled={readOnly || solved} onClick={confirm}>Zatwierdź</button><p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p></div>
  </section>;
}

function PerimeterSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = PERIMETER_TASKS[index]!;

  useEffect(() => {
    if (!solved || index === PERIMETER_TASKS.length - 1) return;
    const timer = window.setTimeout(() => { setIndex((current) => current + 1); setAnswer(""); setFeedback(""); setSolved(false); }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved]);

  const edit = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "," ? current && !current.includes(",") ? `${current},` : current : current.length < 6 ? `${current}${key}` : current);
    setFeedback("");
    onResultChange?.(null);
  };

  const confirm = () => {
    const value = Number(answer.replace(",", "."));
    if (!answer) { setFeedback("Wpisz wynik obliczenia."); onResultChange?.(false, "brak odpowiedzi"); return; }
    if (Math.abs(value - task.expected) > .001) { setFeedback(task.hint); onResultChange?.(false, answer); return; }
    setFeedback("Dobrze. Obwód i długości boków zostały wykorzystane poprawnie.");
    setSolved(true);
    if (index === PERIMETER_TASKS.length - 1) onResultChange?.(true, "ukończono pięć zadań o obwodach prostokątów i kwadratów");
    else onResultChange?.(null);
  };

  return <section className={styles.lab} data-rectangle-square-perimeters>
    <div className={styles.perimeterVisual} role="img" aria-label={task.figure === "square" ? "Kwadrat" : "Prostokąt"}><div className={task.figure === "square" ? styles.miniSquare : styles.miniRectangle}><span>{task.given}</span></div></div>
    <header className={styles.header}><p className={styles.eyebrow}>Prostokąty i kwadraty</p><h2>Obwody — oblicz brakującą wartość</h2></header>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{PERIMETER_TASKS.length}</b><p>{task.prompt}</p><label className={styles.numericAnswer}>{task.answerLabel}<span><input aria-label={task.answerLabel} inputMode="none" readOnly value={answer} /><strong>{task.unit}</strong></span></label></div>
    <LessonNumericKeypad label="Kalkulator do obwodów prostokątów i kwadratów" helperText="Wpisz wynik. Ułamki dziesiętne zapisuj przecinkiem. Zatwierdź raz na końcu zadania." allowSeparator onKey={edit} onConfirm={confirm} disabled={readOnly || solved} />
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

const PROPERTY_FACTS = [
  "Prostokąt ma cztery kąty proste, przeciwległe boki równe i równoległe.",
  "Kwadrat ma cztery kąty proste oraz wszystkie cztery boki równe.",
  "Przeciwległe boki kwadratu także są równoległe.",
  "Każdy kwadrat jest prostokątem, ale nie każdy prostokąt jest kwadratem.",
] as const;

const DIAGONAL_FACTS = [
  "Przekątne prostokąta są równej długości i przecinają się w połowie.",
  "Przekątne kwadratu są równej długości i przecinają się w połowie.",
  "W kwadracie przekątne są dodatkowo prostopadłe.",
] as const;

export function RectangleSquareGeometryLab({ seed, readOnly = false, onResultChange }: Props) {
  const activity = Math.abs(Math.trunc(seed)) % 100;
  if (activity === 1) return <ChoiceSeries title="Własności prostokąta i kwadratu" description="Najpierw obejrzyj duży prostokąt i kwadrat, a następnie odczytaj wszystkie własności." facts={PROPERTY_FACTS} tasks={RECOGNITION_TASKS} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === 2) return <ChoiceSeries title="Przekątne prostokąta i kwadratu" description="Przekątna łączy dwa przeciwległe wierzchołki figury." facts={DIAGONAL_FACTS} tasks={DIAGONAL_TASKS} diagonals readOnly={readOnly} onResultChange={onResultChange} />;
  return <PerimeterSeries readOnly={readOnly} onResultChange={onResultChange} />;
}
