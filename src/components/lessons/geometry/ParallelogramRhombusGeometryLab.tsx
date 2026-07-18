"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import type { GeometryLabMode } from "@/types/geometry";
import styles from "@/components/lessons/geometry/parallelogramRhombus.module.css";

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

interface MixedNumberValue {
  whole: number;
  numerator?: number;
  denominator?: number;
}

interface PerimeterTask {
  figure: "parallelogram" | "rhombus";
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

const FIGURE_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Figura ma wszystkie cztery boki tej samej długości. Co to za figura?",
    options: ["Równoległobok", "Romb", "Każdy czworokąt"],
    correct: "Romb",
    hint: "Romb ma cztery boki tej samej długości.",
  },
  {
    prompt: "Figura ma dwie pary boków równoległych, a sąsiednie boki mają różne długości. Która nazwa pasuje najdokładniej?",
    options: ["Równoległobok", "Romb", "Trójkąt"],
    correct: "Równoległobok",
    hint: "Romb miałby wszystkie cztery boki równe. Tutaj najdokładniejszą nazwą jest równoległobok.",
  },
  {
    prompt: "Jeden kąt równoległoboku ma 72°. Ile ma kąt sąsiedni?",
    options: ["72°", "108°", "118°"],
    correct: "108°",
    hint: "Kąty sąsiednie w równoległoboku mają razem 180°.",
  },
];

const DIAGONAL_TASKS: readonly ChoiceTask[] = [
  {
    prompt: "Co dzieje się z przekątnymi w równoległoboku?",
    options: ["Nie przecinają się", "Przecinają się i dzielą wzajemnie na połowy", "Zawsze są prostopadłe"],
    correct: "Przecinają się i dzielą wzajemnie na połowy",
    hint: "Punkt przecięcia jest środkiem każdej przekątnej.",
  },
  {
    prompt: "Która własność przekątnych odróżnia romb od ogólnego równoległoboku?",
    options: ["Są prostopadłe", "Nie mają punktu wspólnego", "Każda ma inną połowę"],
    correct: "Są prostopadłe",
    hint: "Przekątne rombu przecinają się pod kątem prostym.",
  },
  {
    prompt: "Przekątne figury przecinają się w połowie i są prostopadłe. Która z poznanych figur na pewno ma obie te własności?",
    options: ["Dowolny równoległobok", "Trapez", "Romb"],
    correct: "Romb",
    hint: "W rombie przekątne dzielą się na połowy i są prostopadłe.",
  },
];

const PERIMETER_TASKS: readonly PerimeterTask[] = [
  { figure: "rhombus", prompt: <>Bok rombu ma 6 cm. Oblicz obwód.</>, given: <>a = <FormattedNumber whole={6} /> cm</>, answerLabel: "Obwód rombu", expected: { whole: 24 }, unit: "cm", hint: "Romb ma cztery boki tej samej długości. Pomnóż długość boku przez 4." },
  { figure: "parallelogram", prompt: <>Boki równoległoboku mają 8 cm i 5 cm. Oblicz obwód.</>, given: <>a = <FormattedNumber whole={8} /> cm, b = <FormattedNumber whole={5} /> cm</>, answerLabel: "Obwód równoległoboku", expected: { whole: 26 }, unit: "cm", hint: "Dodaj długości dwóch sąsiednich boków i wynik pomnóż przez 2." },
  { figure: "rhombus", prompt: <>Obwód rombu wynosi 34 cm. Oblicz długość boku i zapisz ją jako liczbę mieszaną.</>, given: <>P = <FormattedNumber whole={34} /> cm</>, answerLabel: "Długość boku rombu", expected: { whole: 8, numerator: 1, denominator: 2 }, unit: "cm", hint: "Podziel obwód rombu przez 4." },
  { figure: "parallelogram", prompt: <>Obwód równoległoboku wynosi 28 cm, a jeden bok ma <FormattedNumber whole={4} numerator={1} denominator={2} /> cm. Oblicz drugi bok.</>, given: <>P = <FormattedNumber whole={28} /> cm, a = <FormattedNumber whole={4} numerator={1} denominator={2} /> cm</>, answerLabel: "Drugi bok równoległoboku", expected: { whole: 9, numerator: 1, denominator: 2 }, unit: "cm", hint: "Najpierw oblicz połowę obwodu, a potem odejmij znany bok." },
  { figure: "parallelogram", prompt: <>Boki równoległoboku mają <FormattedNumber whole={3} numerator={3} denominator={4} /> cm i <FormattedNumber whole={2} numerator={1} denominator={4} /> cm. Oblicz obwód.</>, given: <>a = <FormattedNumber whole={3} numerator={3} denominator={4} /> cm, b = <FormattedNumber whole={2} numerator={1} denominator={4} /> cm</>, answerLabel: "Obwód równoległoboku", expected: { whole: 12 }, unit: "cm", hint: "Suma długości sąsiednich boków wynosi 6 cm." },
];

const FIGURE_FACTS = [
  "Równoległobok ma dwie pary boków równoległych. Przeciwległe boki mają tę samą długość.",
  "Romb jest równoległobokiem, w którym wszystkie cztery boki mają tę samą długość.",
  "Kąty leżące naprzeciwko są równe, a dwa kąty sąsiednie mają razem 180°.",
] as const;

const DIAGONAL_FACTS = [
  "Przekątne równoległoboku przecinają się w swoich środkach — dzielą się wzajemnie na połowy.",
  "Przekątne rombu także dzielą się wzajemnie na połowy.",
  "W rombie przekątne są dodatkowo prostopadłe do siebie.",
] as const;

function FiguresVisual({ diagonals = false }: { diagonals?: boolean }) {
  return <svg viewBox="0 0 900 350" className={styles.visual} role="img" aria-label={diagonals ? "Przekątne równoległoboku i rombu" : "Równoległobok i romb"}>
    <rect width="900" height="350" rx="28" className={styles.background} />
    {!diagonals ? <text x="450" y="35" className={styles.angleRule}>kąty sąsiednie: α + β = 180°</text> : null}
    <g data-parallelogram-figure>
      <polygon points="55,245 125,80 410,80 340,245" className={styles.parallelogram} />
      {!diagonals ? <>
        <path d="M100 245 A45 45 0 0 1 73 203M106 126 A48 48 0 0 1 165 80M365 80 A45 45 0 0 1 392 122M359 199 A48 48 0 0 1 300 245" className={styles.angleArcs} />
        <text x="88" y="225" className={styles.angleName}>α</text><text x="130" y="123" className={styles.angleName}>β</text><text x="371" y="119" className={styles.angleName}>α</text><text x="320" y="222" className={styles.angleName}>β</text>
      </> : <><path d="M55 245L410 80M125 80L340 245" className={styles.diagonal} data-diagonal /><circle cx="232.5" cy="162.5" r="7" className={styles.midpoint} /></>}
      <text x="232" y="310" className={styles.label}>RÓWNOLEGŁOBOK</text>
    </g>
    <g data-rhombus-figure>
      <polygon points="660,52 830,162 660,272 490,162" className={styles.rhombus} />
      {diagonals ? <><path d="M660 52L660 272M490 162L830 162" className={styles.diagonal} data-diagonal /><circle cx="660" cy="162" r="7" className={styles.midpoint} /><path d="M660 131 A31 31 0 0 1 691 162" className={styles.rightAngleArc} data-rhombus-perpendicular /><circle cx="678" cy="144" r="4.5" className={styles.rightAngleDot} /></> : null}
      <text x="660" y="325" className={styles.label}>ROMB</text>
    </g>
  </svg>;
}

function ChoiceSeries({ title, description, facts, tasks, diagonals = false, readOnly = false, onResultChange }: {
  title: string;
  description: string;
  facts: readonly string[];
  tasks: readonly ChoiceTask[];
  diagonals?: boolean;
} & Pick<Props, "readOnly" | "onResultChange">) {
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

  return <section className={styles.lab} data-parallelogram-rhombus-series={diagonals ? "diagonals" : "properties"}>
    <FiguresVisual diagonals={diagonals} />
    <header className={styles.header}><p>Równoległoboki i romby</p><h2>{title}</h2><span>{description}</span></header>
    <div className={styles.facts}>{facts.map((fact) => <p key={fact}>{fact}</p>)}</div>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{tasks.length}</b><p>{task.prompt}</p><div className={styles.options}>{task.options.map((option) => <button key={option} type="button" disabled={readOnly || solved} aria-pressed={selected === option} onClick={() => { setSelected(option); setFeedback(""); onResultChange?.(null); }}>{option}</button>)}</div><button type="button" className={styles.confirm} disabled={readOnly || solved} onClick={confirm}>Zatwierdź</button><p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p></div>
  </section>;
}

function PerimeterVisual({ figure, given }: { figure: PerimeterTask["figure"]; given: ReactNode }) {
  return <div className={styles.perimeterVisual} aria-label={figure === "rhombus" ? "Romb" : "Równoległobok"}>
    <div className={figure === "rhombus" ? styles.miniRhombus : styles.miniParallelogram}><span className={styles.givenBadge}>{given}</span></div>
  </div>;
}

function PerimeterSeries({ readOnly = false, onResultChange }: Pick<Props, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Record<AnswerPart, string>>({ whole: "", numerator: "", denominator: "" });
  const [activePart, setActivePart] = useState<AnswerPart>("whole");
  const [feedback, setFeedback] = useState("");
  const [solved, setSolved] = useState(false);
  const task = PERIMETER_TASKS[index]!;

  useEffect(() => {
    if (!solved || index === PERIMETER_TASKS.length - 1) return;
    const timer = window.setTimeout(() => { setIndex((current) => current + 1); setAnswer({ whole: "", numerator: "", denominator: "" }); setActivePart("whole"); setFeedback(""); setSolved(false); }, 650);
    return () => window.clearTimeout(timer);
  }, [index, solved]);

  const edit = (key: string) => {
    if (readOnly || solved || key !== "backspace" && !/^\d$/u.test(key)) return;
    setAnswer((current) => ({ ...current, [activePart]: key === "backspace" ? current[activePart].slice(0, -1) : current[activePart].length < 3 ? `${current[activePart]}${key}` : current[activePart] }));
    setFeedback("");
    onResultChange?.(null);
  };

  const confirm = () => {
    const expectsFraction = task.expected.numerator !== undefined && task.expected.denominator !== undefined;
    const complete = Boolean(answer.whole) && (!expectsFraction || Boolean(answer.numerator && answer.denominator));
    const answerText = expectsFraction ? `${answer.whole} ${answer.numerator}/${answer.denominator}` : answer.whole;
    if (!complete) { setFeedback("Uzupełnij wszystkie kratki wyniku."); onResultChange?.(false, "brak odpowiedzi"); return; }
    const correct = Number(answer.whole) === task.expected.whole && (!expectsFraction || Number(answer.numerator) === task.expected.numerator && Number(answer.denominator) === task.expected.denominator);
    if (!correct) { setFeedback(task.hint); onResultChange?.(false, answerText); return; }
    setFeedback("Dobrze. Obwód i długości boków zostały wykorzystane poprawnie.");
    setSolved(true);
    if (index === PERIMETER_TASKS.length - 1) onResultChange?.(true, "ukończono pięć zadań o obwodach równoległoboków i rombów");
    else onResultChange?.(null);
  };

  const expectsFraction = task.expected.denominator !== undefined;
  return <section className={styles.lab} data-parallelogram-rhombus-perimeters>
    <PerimeterVisual figure={task.figure} given={task.given} />
    <header className={styles.header}><p>Równoległoboki i romby</p><h2>Obwody — oblicz brakującą wartość</h2><span>Romb ma cztery równe boki. W równoległoboku przeciwległe boki są równe.</span></header>
    <div className={styles.taskCard}><b>Zadanie {index + 1}/{PERIMETER_TASKS.length}</b><p>{task.prompt}</p><div className={styles.numericAnswer}><span>{task.answerLabel}</span><div className={styles.answerRow}>
      <button type="button" className={styles.answerCell} data-active={activePart === "whole"} aria-label="Część całkowita odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("whole")}>{answer.whole || "\u00a0"}</button>
      {expectsFraction ? <span className={styles.answerFraction}><button type="button" className={styles.answerCell} data-active={activePart === "numerator"} aria-label="Licznik odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("numerator")}>{answer.numerator || "\u00a0"}</button><span className={styles.answerLine} /><button type="button" className={styles.answerCell} data-active={activePart === "denominator"} aria-label="Mianownik odpowiedzi" disabled={readOnly || solved} onClick={() => setActivePart("denominator")}>{answer.denominator || "\u00a0"}</button></span> : null}
      <strong>{task.unit}</strong>
    </div></div></div>
    <LessonNumericKeypad label="Kalkulator do obwodów równoległoboków i rombów" helperText="Kliknij kratkę i wpisz liczbę. Ułamek zapisz licznikiem nad mianownikiem. Zatwierdź raz na końcu zadania." onKey={edit} onConfirm={confirm} disabled={readOnly || solved} />
    <p role="status" className={solved ? styles.correct : styles.feedback}>{feedback}</p>
  </section>;
}

export function ParallelogramRhombusGeometryLab({ seed, readOnly = false, assessmentSubmitted = false, mode = "practice", onResultChange }: Props) {
  const activity = Math.abs(Math.trunc(seed)) % 100;
  const locked = readOnly || mode === "assessment" && assessmentSubmitted;
  if (activity === 1) return <ChoiceSeries title="Własności równoległoboku i rombu" description="Najpierw obejrzyj duże figury, a następnie rozpoznaj je i wykorzystaj własności boków oraz kątów." facts={FIGURE_FACTS} tasks={FIGURE_TASKS} readOnly={locked} onResultChange={onResultChange} />;
  if (activity === 2) return <ChoiceSeries title="Przekątne równoległoboku i rombu" description="Przekątna łączy dwa przeciwległe wierzchołki. Odczytaj punkt przecięcia obu przekątnych." facts={DIAGONAL_FACTS} tasks={DIAGONAL_TASKS} diagonals readOnly={locked} onResultChange={onResultChange} />;
  return <PerimeterSeries readOnly={locked} onResultChange={onResultChange} />;
}
