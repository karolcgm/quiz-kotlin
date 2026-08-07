"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4SectionOneReviewActivity = "map" | "calculations" | "stories" | "analysis" | "order" | "axis";

export function grade4SectionOneReviewActivityFromStageId(stageId: string): Grade4SectionOneReviewActivity {
  if (stageId.endsWith("-mapa")) return "map";
  if (stageId.endsWith("-rachunki")) return "calculations";
  if (stageId.endsWith("-zadania-tekstowe")) return "stories";
  if (stageId.endsWith("-analiza-informacji")) return "analysis";
  if (stageId.endsWith("-kolejnosc-dzialan")) return "order";
  return "axis";
}

interface Props {
  activity: Grade4SectionOneReviewActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;

const CALCULATION_TASKS = [
  { expression: "67 + 28", answer: 95, hint: "Dodaj dziesiątki, a potem jedności." },
  { expression: "93 − 47", answer: 46, hint: "Najpierw odejmij 40, potem jeszcze 7." },
  { expression: "19 + 36 + 1", answer: 56, hint: "Zmień kolejność: najpierw połącz 19 i 1." },
  { expression: "8 · 17", answer: 136, hint: "Rozbij 17 na 10 i 7." },
  { expression: "84 : 7", answer: 12, hint: "Rozbij 84 na 70 i 14." },
] as const;

const STORY_TASKS = [
  {
    kind: "comparison" as const,
    image: "/images/lessons/grade4/section-one-review/blocks-comparison.png",
    imageAlt: "Dwoje dzieci przy stolikach z różną liczbą kolorowych klocków",
    prompt: "Maja ma 56 klocków, a Kacper 8. Ile razy mniej klocków ma Kacper?",
    expected: [56, 8, 7] as const,
    operator: ":",
    answerText: "Kacper ma 7 razy mniej klocków.",
  },
  {
    kind: "remainder" as const,
    image: "/images/lessons/grade4/section-one-review/apple-bags.png",
    imageAlt: "Jabłka pakowane po siedem do papierowych toreb oraz cztery jabłka, które zostały",
    prompt: "46 jabłek pakujemy do toreb po 7. Ile pełnych toreb przygotujemy i ile jabłek zostanie?",
    expected: [46, 7, 6, 4] as const,
    operator: ":",
    answerText: "Przygotujemy 6 pełnych toreb, a zostaną 4 jabłka.",
  },
] as const;

const ANALYSIS_TASKS = [
  {
    image: "/images/lessons/grade4/section-one-review/board-game-groups.png",
    imageAlt: "Siedemnaścioro dzieci rozdzielających się przy trzech stolikach z grami planszowymi",
    prompt: "W jedną grę może grać od 3 do 6 osób. Czy 17 dzieci może jednocześnie zagrać na 3 planszach?",
    choices: [
      "Tak, w grupach 6, 6 i 5 osób.",
      "Nie, ponieważ 17 nie dzieli się przez 3.",
      "Nie, potrzeba co najmniej 4 plansz.",
    ],
    correctIndex: 0,
    explanation: "Każda z grup 6, 6 i 5 osób spełnia warunek od 3 do 6 graczy.",
  },
  {
    image: "/images/lessons/grade4/section-one-review/crayon-boxes.png",
    imageAlt: "Trzy pudełka z kredkami: czerwone, niebieskie i zielone",
    prompt: "W każdym pudełku było po 18 kredek. Przełożono 4 z czerwonego do zielonego, a potem 7 z zielonego do niebieskiego. Gdzie jest teraz najmniej kredek?",
    choices: ["W czerwonym pudełku.", "W niebieskim pudełku.", "W zielonym pudełku.", "W każdym jest tyle samo."],
    correctIndex: 0,
    explanation: "Po zmianach jest: czerwone 14, zielone 15, niebieskie 25.",
  },
] as const;

const ORDER_TASKS = [
  { expression: "4 · (12 − 7) + 3²", labels: ["Nawias", "Potęga", "Wynik"], expected: [5, 9, 29] },
  { expression: "64 : 8 + 6 · 5", labels: ["Dzielenie", "Mnożenie", "Wynik"], expected: [8, 30, 38] },
  { expression: "7² − 24 : 6", labels: ["Potęga", "Dzielenie", "Wynik"], expected: [49, 4, 45] },
] as const;

const AXIS_TASKS = [
  { start: 30, step: 3, markerIndex: 5, answer: 45 },
  { start: 120, step: 20, markerIndex: 4, answer: 200 },
  { start: 450, step: 50, markerIndex: 6, answer: 750 },
] as const;

function MapSlide() {
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Mapa wiadomości" description="Zobacz, co już potrafisz. Za chwilę każdą umiejętność sprawdzisz w nowym zadaniu.">
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-3xl bg-emerald-50 p-5 ring-2 ring-emerald-200">
        <h3 className="text-xl font-black text-emerald-950">Dodawanie i odejmowanie</h3>
        <p className="mt-2 font-bold text-slate-700">składnik + składnik = suma</p>
        <p className="font-bold text-slate-700">odjemna − odjemnik = różnica</p>
        <p className="mt-3 rounded-2xl bg-white p-3 font-black text-emerald-950">„O ile?” → odejmowanie</p>
      </section>
      <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
        <h3 className="text-xl font-black text-cyan-950">Mnożenie i dzielenie</h3>
        <p className="mt-2 font-bold text-slate-700">czynnik · czynnik = iloczyn</p>
        <p className="font-bold text-slate-700">dzielna : dzielnik = iloraz</p>
        <p className="mt-3 rounded-2xl bg-white p-3 font-black text-cyan-950">„Ile razy?” → dzielenie</p>
      </section>
      <section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
        <h3 className="text-xl font-black text-violet-950">Reszta, potęgi i kolejność</h3>
        <p className="mt-2 font-bold leading-relaxed text-slate-700">Reszta jest mniejsza od dzielnika. Potęga mówi, ile razy mnożymy liczbę przez siebie.</p>
        <p className="mt-3 rounded-2xl bg-white p-3 text-center font-black text-violet-950">potęgi → nawiasy → · i : → + i −</p>
      </section>
      <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
        <h3 className="text-xl font-black text-amber-950">Treść zadania i oś</h3>
        <p className="mt-2 font-bold leading-relaxed text-slate-700">Najpierw wybierz potrzebne informacje. Na osi ustal wartość jednej działki z dwóch sąsiednich opisanych kresek.</p>
        <p className="mt-3 rounded-2xl bg-white p-3 font-black text-amber-950">Strzałka pokazuje, gdzie liczby rosną.</p>
      </section>
    </div>
  </LessonTaskFrame>;
}

function FeedbackMessage({ feedback, correctText }: { feedback: Feedback; correctText: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! To zadanie jest rozwiązane poprawnie.</p>;
  if (feedback === "incorrect") return <p role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {correctText}. Dziś bez punktu.</p>;
  return null;
}

function CalculationsSlide({ taskIndex, questionCount, readOnly, onResultChange }: { taskIndex: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task = CALCULATION_TASKS[taskIndex % CALCULATION_TASKS.length]!;
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValue((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 6 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!value) { setFeedback("missing"); return; }
    const correct = Number(value) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `${task.expression} = ${value}`);
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Rachunki pamięciowe" description="Dobierz wygodny sposób i wpisz wynik." questionNumber={taskIndex + 1} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-indigo-50 p-6 text-center ring-2 ring-indigo-200">
        <div className="flex flex-wrap items-center justify-center gap-3 whitespace-nowrap text-4xl font-black text-slate-950 sm:text-5xl">
          <span>{task.expression}</span><span>=</span>
          <input aria-label="Wynik działania" value={value} inputMode="none" readOnly className="h-16 w-32 rounded-2xl border-2 border-violet-300 bg-white text-center text-3xl outline-none ring-violet-200 focus:ring-4" />
        </div>
        <p className="mt-5 rounded-2xl bg-white p-3 font-bold text-indigo-950">Podpowiedź: {task.hint}</p>
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do rachunków" helperText="Wpisz wynik i zatwierdź." /> : null}
      <FeedbackMessage feedback={feedback} correctText={`${task.expression} = ${task.answer}`} />
    </div>
  </LessonTaskFrame>;
}

function StorySlide({ taskIndex, questionCount, readOnly, onResultChange }: { taskIndex: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task = STORY_TASKS[taskIndex % STORY_TASKS.length]!;
  const fieldCount = task.expected.length;
  const [values, setValues] = useState(() => Array.from({ length: fieldCount }, () => ""));
  const [activeField, setActiveField] = useState(0);
  const [operator, setOperator] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    if (["+", "−", "·", ":"].includes(key)) setOperator(key);
    else setValues((current) => current.map((value, index) => index !== activeField ? value : key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!operator || values.some((value) => value === "")) { setFeedback("missing"); return; }
    const correct = operator === task.operator && values.every((value, index) => Number(value) === task.expected[index]);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join("; "));
  };
  const field = (index: number, label: string) => <input aria-label={label} value={values[index] ?? ""} inputMode="none" readOnly onClick={() => !locked && setActiveField(index)} className={`h-14 w-20 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${activeField === index && !locked ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} />;
  const correctText = task.kind === "comparison" ? `56 : 8 = 7. ${task.answerText}` : `46 : 7 = 6 reszty 4. Sprawdzenie: 6 · 7 + 4 = 46`;
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Zadania tekstowe" description="Wybierz znak działania i uzupełnij cały zapis." questionNumber={taskIndex + 1} questionCount={questionCount}>
    <div className="space-y-4">
      <div className="relative h-48 overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200 sm:h-56">
        <Image src={task.image} alt={task.imageAlt} fill sizes="(max-width: 768px) 92vw, 720px" className="object-cover" />
      </div>
      <p className="rounded-3xl bg-amber-50 p-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">{task.prompt}</p>
      <section className="rounded-3xl bg-indigo-50 p-5 ring-2 ring-indigo-200">
        <div className="flex flex-wrap items-center justify-center gap-2 text-3xl font-black">
          {field(0, "Pierwsza liczba działania")}
          <span className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 ${operator ? "border-violet-700 bg-violet-700 text-white" : "border-dashed border-violet-400 bg-white text-violet-500"}`}>{operator || "?"}</span>
          {field(1, "Druga liczba działania")}<span>=</span>{field(2, task.kind === "comparison" ? "Wynik działania" : "Liczba pełnych toreb")}
          {task.kind === "remainder" ? <><span className="text-lg">reszty</span>{field(3, "Reszta z dzielenia")}</> : null}
        </div>
        {task.kind === "remainder" ? <p className="mt-4 text-center font-black text-indigo-950">Po obliczeniu sprawdź: iloraz · dzielnik + reszta = dzielna.</p> : null}
      </section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} operationKeys={["+", "−", "·", ":"]} selectedOperation={operator} label="Klawiatura do zapisu działania" helperText="Dotknij kratki, wpisz liczbę i wybierz właściwy znak działania." /> : null}
      <FeedbackMessage feedback={feedback} correctText={correctText} />
    </div>
  </LessonTaskFrame>;
}

function AnalysisSlide({ taskIndex, questionCount, readOnly, onResultChange }: { taskIndex: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task = ANALYSIS_TASKS[taskIndex % ANALYSIS_TASKS.length]!;
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const check = () => {
    if (selected === null) { setFeedback("missing"); return; }
    const correct = selected === task.correctIndex;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, task.choices[selected]);
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Czytaj i wnioskuj" description="Nie zawsze trzeba wykonywać długie obliczenia. Wybierz odpowiedź wynikającą z treści." questionNumber={taskIndex + 1} questionCount={questionCount}>
    <div className="space-y-4">
      <div className="relative h-48 overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200 sm:h-56"><Image src={task.image} alt={task.imageAlt} fill sizes="(max-width: 768px) 92vw, 720px" className="object-cover" /></div>
      <p className="rounded-3xl bg-amber-50 p-5 text-center text-xl font-black leading-relaxed text-amber-950 ring-2 ring-amber-200">{task.prompt}</p>
      <div className="grid gap-3 sm:grid-cols-2">{task.choices.map((choice, index) => <LessonTaskChoice key={choice} selected={selected === index} disabled={locked} onClick={() => { setSelected(index); setFeedback(null); onResultChange?.(null); }} className="min-h-16 p-3 text-base">{choice}</LessonTaskChoice>)}</div>
      {!readOnly ? <button type="button" disabled={locked} onClick={check} className="min-h-12 w-full rounded-2xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Sprawdź odpowiedź</button> : null}
      {feedback === "missing" ? <FeedbackMessage feedback="missing" correctText="" /> : null}
      {feedback === "correct" ? <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! {task.explanation}</p> : null}
      {feedback === "incorrect" ? <p role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawna odpowiedź to: {task.choices[task.correctIndex]} {task.explanation} Dziś bez punktu.</p> : null}
    </div>
  </LessonTaskFrame>;
}

function OrderSlide({ taskIndex, questionCount, readOnly, onResultChange }: { taskIndex: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task = ORDER_TASKS[taskIndex % ORDER_TASKS.length]!;
  const [values, setValues] = useState(["", "", ""]);
  const [activeField, setActiveField] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index !== activeField ? value : key === "backspace" ? value.slice(0, -1) : value.length >= 3 ? value : `${value}${key}`));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) { setFeedback("missing"); return; }
    const correct = values.every((value, index) => Number(value) === task.expected[index]);
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join(", "));
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Kolejność wykonywania działań" description="Oblicz wskazane części, a potem całe wyrażenie." questionNumber={taskIndex + 1} questionCount={questionCount}>
    <div className="space-y-4">
      <p className="rounded-3xl bg-violet-50 p-6 text-center text-4xl font-black text-violet-950 ring-2 ring-violet-200">{task.expression}</p>
      <section className="grid gap-3 rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200 sm:grid-cols-3">{task.labels.map((label, index) => <label key={label} className="rounded-2xl bg-white p-3 text-center font-black text-cyan-950"><span className="block pb-2">{index + 1}. {label}</span><input aria-label={`${label} — wynik etapu`} value={values[index]} inputMode="none" readOnly onClick={() => !locked && setActiveField(index)} className={`h-14 w-full rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${activeField === index && !locked ? "border-violet-700 ring-4 ring-violet-200" : "border-cyan-300"}`} /></label>)}</section>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do kolejnych etapów" helperText="Dotknij kratki i wpisz wynik danego etapu." /> : null}
      <FeedbackMessage feedback={feedback} correctText={`${task.expected[0]}, następnie ${task.expected[1]}, a wynik całego wyrażenia: ${task.expected[2]}`} />
    </div>
  </LessonTaskFrame>;
}

function ReviewAxis({ start, step, markerIndex }: { start: number; step: number; markerIndex: number }) {
  const x = (index: number) => 70 + index * 75;
  return <svg viewBox="0 0 720 190" role="img" aria-label="Oś liczbowa ze strzałką po prawej stronie i punktem A" className="w-full">
    <line x1="55" y1="105" x2="660" y2="105" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
    <path d="M 660 105 L 635 90 L 635 120 Z" fill="#172554" />
    {Array.from({ length: 8 }, (_, index) => <g key={index}>
      <line x1={x(index)} y1="88" x2={x(index)} y2="122" stroke="#172554" strokeWidth="4" />
      {index < 2 ? <text x={x(index)} y="151" textAnchor="middle" fontSize="20" fontWeight="900" fill="#172554">{start + index * step}</text> : null}
      {index === markerIndex ? <><circle cx={x(index)} cy="105" r="10" fill="#f43f5e" stroke="white" strokeWidth="4" /><text x={x(index)} y="72" textAnchor="middle" fontSize="24" fontWeight="900" fill="#581c87">A</text></> : null}
    </g>)}
    <path d={`M ${x(0)} 163 V 177 H ${x(1)} V 163`} fill="none" stroke="#7c3aed" strokeWidth="3" />
    <text x={(x(0) + x(1)) / 2} y="187" textAnchor="middle" fontSize="15" fontWeight="900" fill="#5b21b6">jedna działka = {step}</text>
  </svg>;
}

function AxisSlide({ taskIndex, questionCount, readOnly, onResultChange }: { taskIndex: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const task = AXIS_TASKS[taskIndex % AXIS_TASKS.length]!;
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValue((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 4 ? current : `${current}${key}`);
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!value) { setFeedback("missing"); return; }
    const correct = Number(value) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, `A = ${value}`);
  };
  return <LessonTaskFrame eyebrow="Dział 1 · Powtórzenie" heading="Odczytaj punkt z osi" description="Dwie sąsiednie kreski są opisane. Ustal wartość działki i odczytaj punkt A." questionNumber={taskIndex + 1} questionCount={questionCount}>
    <div className="space-y-4">
      <section className="rounded-3xl bg-cyan-50 p-4 ring-2 ring-cyan-200"><ReviewAxis start={task.start} step={task.step} markerIndex={task.markerIndex} /></section>
      <label className="flex items-center justify-center gap-3 rounded-2xl bg-indigo-50 p-4 text-2xl font-black text-indigo-950 ring-2 ring-indigo-200">A = <input aria-label="Współrzędna punktu A" value={value} inputMode="none" readOnly className="h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl outline-none" /></label>
      {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do odczytywania osi" helperText="Wpisz liczbę odpowiadającą punktowi A." /> : null}
      <FeedbackMessage feedback={feedback} correctText={`A = ${task.answer}`} />
    </div>
  </LessonTaskFrame>;
}

export function Grade4SectionOneReviewLessonLab({ activity, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "map") return <MapSlide />;
  const taskIndex = Math.max(0, questionNumber - 1);
  if (activity === "calculations") return <CalculationsSlide key={`${activity}-${questionNumber}`} taskIndex={taskIndex} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "stories") return <StorySlide key={`${activity}-${questionNumber}`} taskIndex={taskIndex} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "analysis") return <AnalysisSlide key={`${activity}-${questionNumber}`} taskIndex={taskIndex} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "order") return <OrderSlide key={`${activity}-${questionNumber}`} taskIndex={taskIndex} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  return <AxisSlide key={`${activity}-${questionNumber}`} taskIndex={taskIndex} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
