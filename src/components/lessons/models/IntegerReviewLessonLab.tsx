"use client";

import { useEffect, useRef, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { Grade6SignedNumbersLessonLab, type Grade6SignedNumbersActivity } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";

export type IntegerReviewActivity = "comparison" | "opposites" | "operations" | "stories" | "challenge" | "g6-review-sets" | "g6-review-absolute" | "g6-review-operations" | "g6-review-stories" | "g6-review-challenge" | "g6-review-map" | "g6-review-order-natural" | "g6-review-order-integers" | "g6-review-order-fractions" | "g6-review-escape" | "g6-review-recap" | "g6-review-connect" | "g6-review-cipher" | "g6-review-order-complex";

interface IntegerReviewLessonLabProps {
  activity: IntegerReviewActivity;
  readOnly?: boolean;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface ComparisonTask {
  id: string;
  left: number;
  right: number;
  answer: "<" | ">" | "=";
}

interface ResultTask {
  id: string;
  prompt: string;
  expression?: string;
  number?: number;
  answer: number;
  hint: string;
}

interface StoryTask {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  first: number;
  operator: "+" | "−" | "·" | ":";
  second: number;
  result: number;
}

interface ChallengeTask extends ResultTask {
  letter: string;
  slot: number;
}

const formatInteger = (value: number) => value < 0 ? `−${Math.abs(value)}` : String(value);

const comparisonTasks: ComparisonTask[] = [
  { id: "compare-1", left: -8, right: -3, answer: "<" },
  { id: "compare-2", left: -4, right: -9, answer: ">" },
  { id: "compare-3", left: 0, right: -7, answer: ">" },
  { id: "compare-4", left: 6, right: 6, answer: "=" },
  { id: "compare-5", left: -5, right: 2, answer: "<" },
  { id: "compare-6", left: 4, right: -4, answer: ">" },
];

const oppositeTasks: ResultTask[] = [
  { id: "opposite-1", prompt: "Podaj liczbę przeciwną do −8.", number: -8, answer: 8, hint: "Szukaj liczby po drugiej stronie zera, w tej samej odległości." },
  { id: "opposite-2", prompt: "Podaj liczbę przeciwną do 5.", number: 5, answer: -5, hint: "Zmień tylko znak liczby." },
  { id: "opposite-3", prompt: "Podaj liczbę przeciwną do 0.", number: 0, answer: 0, hint: "Zero leży w środku osi; liczba przeciwna do zera to zero." },
  { id: "opposite-4", prompt: "Podaj liczbę przeciwną do −9.", number: -9, answer: 9, hint: "Szukaj liczby po drugiej stronie zera, w tej samej odległości." },
  { id: "opposite-5", prompt: "Podaj liczbę przeciwną do 7.", number: 7, answer: -7, hint: "Zmień tylko znak liczby." },
  { id: "opposite-6", prompt: "Podaj liczbę przeciwną do −2.", number: -2, answer: 2, hint: "Zmień tylko znak liczby." },
];

const operationTasks: ResultTask[] = [
  { id: "operation-1", expression: "−7 + 12", prompt: "Oblicz działanie.", answer: 5, hint: "Liczby mają przeciwne znaki: odejmij wartości bezwzględne i zachowaj znak większej." },
  { id: "operation-2", expression: "9 − 14", prompt: "Oblicz działanie.", answer: -5, hint: "Wynik jest ujemny, ponieważ odejmujesz większą liczbę od mniejszej." },
  { id: "operation-3", expression: "−8 − (−3)", prompt: "Oblicz działanie.", answer: -5, hint: "Dwa minusy obok siebie zamieniają się na plus." },
  { id: "operation-4", expression: "−6 + (−5)", prompt: "Oblicz działanie.", answer: -11, hint: "Dodaj wartości bezwzględne i zachowaj znak minus." },
  { id: "operation-5", expression: "−4 · 7", prompt: "Oblicz działanie.", answer: -28, hint: "Przy różnych znakach iloczyn jest ujemny." },
  { id: "operation-6", expression: "−36 : (−6)", prompt: "Oblicz działanie.", answer: 6, hint: "Dwa minusy przy dzieleniu dają plus." },
  { id: "operation-7", expression: "8 · (−5)", prompt: "Oblicz działanie.", answer: -40, hint: "Przy różnych znakach iloczyn jest ujemny." },
  { id: "operation-8", expression: "−45 : 9", prompt: "Oblicz działanie.", answer: -5, hint: "Przy różnych znakach iloraz jest ujemny." },
  { id: "operation-9", expression: "3² + (−2) · 4", prompt: "Oblicz, zachowując kolejność działań.", answer: 1, hint: "Najpierw oblicz potęgę i mnożenie, a dopiero na końcu dodaj wyniki." },
  { id: "operation-10", expression: "(−3)² − 4 · 2", prompt: "Oblicz, zachowując kolejność działań.", answer: 1, hint: "Najpierw potęga i mnożenie. Zauważ, że kwadrat liczby ujemnej jest dodatni." },
  { id: "operation-11", expression: "−2 · (4 − 7) + 5", prompt: "Oblicz, zachowując kolejność działań.", answer: 11, hint: "Zacznij od nawiasu, potem wykonaj mnożenie, a na końcu dodawanie." },
  { id: "operation-12", expression: "24 : (−3) + 2²", prompt: "Oblicz, zachowując kolejność działań.", answer: -4, hint: "Najpierw dzielenie i potęga, a na końcu dodawanie liczb o przeciwnych znakach." },
];

const storyTasks: StoryTask[] = [
  { id: "story-1", icon: "🌡️", title: "Temperatura", prompt: "Rano było −7°C. W południe temperatura wzrosła o 12°C. Zapisz działanie i temperaturę w południe.", first: -7, operator: "+", second: 12, result: 5 },
  { id: "story-2", icon: "🎮", title: "Punkty w grze", prompt: "W czterech rundach uczeń tracił po 3 punkty. Zapisz łączną zmianę liczby punktów.", first: 4, operator: "·", second: -3, result: -12 },
  { id: "story-3", icon: "🧾", title: "Raty długu", prompt: "Dług 48 zł podzielono na 6 równych rat. Jaka zmiana salda przypada na jedną ratę?", first: -48, operator: ":", second: 6, result: -8 },
  { id: "story-4", icon: "🛗", title: "Winda", prompt: "Winda była na poziomie −2 i zjechała jeszcze o 6 pięter. Zapisz działanie i nowy poziom.", first: -2, operator: "+", second: -6, result: -8 },
];

const challengeTasks: ChallengeTask[] = [
  { id: "challenge-1", expression: "(−2)² · 3", prompt: "Rozwiąż działanie i odczytaj pierwszą wskazówkę do hasła.", answer: 12, letter: "R", slot: 3, hint: "Najpierw oblicz potęgę, a potem wykonaj mnożenie." },
  { id: "challenge-2", expression: "3² + (−2) · 3", prompt: "Rozwiąż działanie i odczytaj kolejną wskazówkę do hasła.", answer: 3, letter: "O", slot: 0, hint: "Najpierw oblicz potęgę i mnożenie, a dopiero potem dodaj." },
  { id: "challenge-3", expression: "24 : (−3) + 2²", prompt: "Rozwiąż działanie i odczytaj kolejną wskazówkę do hasła.", answer: -4, letter: "D", slot: 1, hint: "Najpierw wykonaj dzielenie i potęgowanie." },
  { id: "challenge-4", expression: "−3 · (5 − 7)", prompt: "Rozwiąż działanie i odczytaj kolejną wskazówkę do hasła.", answer: 6, letter: "K", slot: 2, hint: "Zacznij od działania w nawiasie." },
  { id: "challenge-5", expression: "−4 · (3 − 5)", prompt: "Rozwiąż działanie i odczytaj kolejną wskazówkę do hasła.", answer: 8, letter: "J", slot: 5, hint: "Najpierw oblicz nawias, a potem sprawdź znaki przy mnożeniu." },
  { id: "challenge-6", expression: "(−3)² − 5", prompt: "Rozwiąż ostatnie działanie i dokończ hasło.", answer: 4, letter: "Y", slot: 4, hint: "Kwadrat liczby ujemnej jest dodatni." },
];

const challengeKey = [challengeTasks[3]!, challengeTasks[0]!, challengeTasks[5]!, challengeTasks[2]!, challengeTasks[4]!, challengeTasks[1]!];

function Feedback({ text, solved }: { text: string | null; solved: boolean }) {
  return text ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p> : null;
}

function IntegerKeypad({ onPress, onConfirm, disabled, helperText }: { onPress: (key: string) => void; onConfirm: () => void; disabled: boolean; helperText: string }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "minus", "0", "backspace"];
  return <section aria-label="Kalkulator do liczb całkowitych" className="mx-auto max-w-sm rounded-3xl bg-slate-100 p-3"><p className="mb-3 text-center text-xs font-bold text-slate-700">{helperText}</p><div className="grid grid-cols-4 gap-2">{keys.map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onPress(key)} className={`min-h-12 rounded-xl font-black disabled:opacity-40 ${key === "minus" ? "bg-rose-200 text-rose-950" : key === "backspace" ? "bg-amber-200 text-amber-950" : "bg-white text-slate-950"}`}>{key === "minus" ? "−" : key === "backspace" ? "← Usuń" : key}</button>)}</div><button type="button" disabled={disabled} onClick={onConfirm} className="mt-3 min-h-12 w-full rounded-xl bg-indigo-700 px-5 font-black text-white disabled:opacity-40">Zatwierdź</button></section>;
}

function IntegerNumberLine({ values }: { values: number[] }) {
  const min = -10;
  const max = 10;
  const x = (value: number) => 42 + ((Math.max(min, Math.min(max, value)) - min) / (max - min)) * 536;
  return <svg role="img" aria-label="Oś liczbowa z zaznaczonymi liczbami" viewBox="0 0 620 150" className="mx-auto block w-full max-w-4xl rounded-3xl border-2 border-sky-200 bg-white"><line x1="35" y1="70" x2="585" y2="70" stroke="#172554" strokeWidth="4" strokeLinecap="round" /><path d="M 585 70 l -13 -8 M 585 70 l -13 8" stroke="#172554" strokeWidth="4" strokeLinecap="round" />{Array.from({ length: 21 }, (_, index) => index - 10).map((value) => <g key={value}><line x1={x(value)} y1="60" x2={x(value)} y2="80" stroke="#334155" strokeWidth={value === 0 ? 4 : 2} />{value % 5 === 0 ? <text x={x(value)} y="108" textAnchor="middle" className="fill-slate-800 text-[20px] font-black">{formatInteger(value)}</text> : null}</g>)}{values.map((value, index) => <g key={`${value}-${index}`}><circle cx={x(value)} cy="70" r="10" fill={value < 0 ? "#e11d48" : value > 0 ? "#2563eb" : "#475569"} /><text x={x(value)} y="43" textAnchor="middle" className="fill-slate-950 text-[21px] font-black">{formatInteger(value)}</text></g>)}</svg>;
}

function ComparisonSeries({ readOnly, onResultChange }: Pick<IntegerReviewLessonLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<ComparisonTask["answer"] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = comparisonTasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const choose = (symbol: ComparisonTask["answer"]) => {
    if (readOnly || solved) return;
    setSelected(symbol);
    if (symbol !== task.answer) { setFeedback("Jeszcze nie. Spójrz, która liczba leży bardziej na prawo na osi."); onResultChange?.(false, symbol); return; }
    setSolved(true);
    setFeedback(index === comparisonTasks.length - 1 ? "Brawo! Cała seria porównań jest ukończona." : "Dobrze. Za chwilę kolejne porównanie.");
    if (index === comparisonTasks.length - 1) { onResultChange?.(true, symbol); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setSelected(null); setFeedback(null); setSolved(false); onResultChange?.(null); }, 750);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Powtórzenie" heading="Porównywanie na osi liczbowej" description="Wstaw znak <, > albo =. Liczba położona bardziej na prawo na osi jest większa." questionNumber={index + 1} questionCount={comparisonTasks.length}><div className="space-y-5"><IntegerNumberLine values={[task.left, task.right]} /><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{formatInteger(task.left)} <span className="mx-3 text-violet-700">□</span> {formatInteger(task.right)}</p></section><div className="grid grid-cols-3 gap-3"><LessonTaskChoice selected={selected === "<"} disabled={readOnly || solved} onClick={() => choose("<")} className="min-h-16 text-3xl">&lt;</LessonTaskChoice><LessonTaskChoice selected={selected === ">"} disabled={readOnly || solved} onClick={() => choose(">")} className="min-h-16 text-3xl">&gt;</LessonTaskChoice><LessonTaskChoice selected={selected === "="} disabled={readOnly || solved} onClick={() => choose("=")} className="min-h-16 text-3xl">=</LessonTaskChoice></div><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function ResultSeries({ mode, readOnly, onResultChange }: { mode: "opposites" | "operations"; readOnly: boolean; onResultChange?: IntegerReviewLessonLabProps["onResultChange"] }) {
  const tasks = mode === "opposites" ? oppositeTasks : operationTasks;
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "minus" ? current ? current : "-" : `${current}${key}`.slice(0, 4));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answer === "" || answer === "-") { setFeedback("Wpisz odpowiedź z klawiatury."); return; }
    if (Number(answer) !== task.answer) { setFeedback(`Jeszcze nie. ${task.hint}`); onResultChange?.(false, answer); return; }
    setSolved(true);
    setFeedback(index === tasks.length - 1 ? "Brawo! Cała seria jest ukończona." : "Dobrze. Za chwilę kolejne zadanie.");
    if (index === tasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setSolved(false); onResultChange?.(null); }, 750);
  };

  const heading = mode === "opposites" ? "Liczby przeciwne" : "Działania na liczbach całkowitych";
  const description = mode === "opposites" ? "Podaj liczbę leżącą po przeciwnej stronie zera, w tej samej odległości." : "Oblicz działania na liczbach całkowitych. W trudniejszych przykładach zachowaj kolejność: nawiasy, potęgi, mnożenie i dzielenie, dodawanie i odejmowanie.";
  return <LessonTaskFrame eyebrow="Dział 7 · Powtórzenie" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-5">{mode === "opposites" && task.number !== undefined ? <IntegerNumberLine values={[task.number]} /> : null}<section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="text-xl font-black text-amber-950">{task.prompt}</p>{task.expression ? <p className="mt-3 font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} =</p> : null}<input aria-label={mode === "opposites" ? "Liczba przeciwna" : `Wynik działania ${task.expression}`} inputMode="none" readOnly value={answer} onClick={() => undefined} className="mt-4 h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none focus:border-violet-700" /></section><IntegerKeypad onPress={press} onConfirm={check} disabled={readOnly || solved} helperText="Kliknij kratkę i wpisz liczbę z klawiatury." /><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function ChallengeSeries({ readOnly, onResultChange }: Pick<IntegerReviewLessonLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = challengeTasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "minus" ? current ? current : "-" : `${current}${key}`.slice(0, 4));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answer === "" || answer === "-") { setFeedback("Wpisz wynik z klawiatury."); return; }
    if (Number(answer) !== task.answer) { setFeedback(`Jeszcze nie. ${task.hint}`); onResultChange?.(false, answer); return; }
    const code = { ...revealed, [task.slot]: task.letter };
    setRevealed(code);
    setSolved(true);
    setFeedback(index === challengeTasks.length - 1 ? `Brawo! Odszyfrowane hasło: ${Array.from({ length: challengeTasks.length }, (_, slot) => code[slot]).join("")}.` : `Dobrze. Wynik ${formatInteger(task.answer)} odsłania kolejną literę hasła.`);
    if (index === challengeTasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setSolved(false); onResultChange?.(null); }, 750);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Powtórzenie" heading="Kod ekspedycji" description="Rozwiąż trudniejsze działania. Wynik odszukaj w kluczu, aby odsłonić literę hasła." questionNumber={index + 1} questionCount={challengeTasks.length}><div className="space-y-5"><section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4"><p className="text-center text-sm font-black uppercase tracking-[.16em] text-sky-800">Klucz: wynik → litera</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{challengeKey.map((item) => <p key={item.id} className="rounded-xl bg-white px-2 py-3 text-center font-mono text-lg font-black text-indigo-950 shadow-sm">{formatInteger(item.answer)} → {item.letter}</p>)}</div></section><section aria-label="Odszyfrowane hasło" className="rounded-3xl bg-indigo-950 p-4 text-center text-white"><p className="text-sm font-black uppercase tracking-[.16em] text-indigo-200">Hasło ekspedycji</p><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: challengeTasks.length }, (_, slot) => <span key={slot} className="grid h-11 w-10 place-items-center rounded-lg bg-white text-xl font-black text-indigo-950">{revealed[slot] ?? "?"}</span>)}</div></section><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="text-lg font-black text-amber-950">{task.prompt}</p><p className="mt-3 font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} =</p><input aria-label={`Wynik zadania szyfrującego ${task.expression}`} inputMode="none" readOnly value={answer} onClick={() => undefined} className="mt-4 h-14 w-28 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none focus:border-violet-700" /></section><IntegerKeypad onPress={press} onConfirm={check} disabled={readOnly || solved} helperText="Wpisz wynik. Poprawna odpowiedź odsłoni literę w haśle." /><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function StorySeries({ readOnly, onResultChange }: Pick<IntegerReviewLessonLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [active, setActive] = useState(0);
  const [operator, setOperator] = useState<StoryTask["operator"] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = storyTasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => current.map((value, fieldIndex) => fieldIndex !== active ? value : key === "backspace" ? value.slice(0, -1) : key === "minus" ? value ? value : "-" : `${value}${key}`.slice(0, 4)));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (!operator || answers.some((value) => value === "" || value === "-")) { setFeedback("Wpisz obie liczby, wybierz znak działania i podaj wynik."); return; }
    const correct = Number(answers[0]) === task.first && Number(answers[1]) === task.second && Number(answers[2]) === task.result && operator === task.operator;
    if (!correct) { setFeedback("Jeszcze nie. Wróć do treści i sprawdź znaki liczb oraz działanie."); onResultChange?.(false, answers.join(" ")); return; }
    setSolved(true);
    setFeedback(index === storyTasks.length - 1 ? "Brawo! Zakończono całe powtórzenie." : "Dobrze. Za chwilę kolejne zadanie z treścią.");
    if (index === storyTasks.length - 1) { onResultChange?.(true, answers.join(" ")); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswers(["", "", ""]); setActive(0); setOperator(null); setFeedback(null); setSolved(false); onResultChange?.(null); }, 750);
  };
  const field = (fieldIndex: number, label: string) => <input aria-label={label} inputMode="none" readOnly value={answers[fieldIndex]} onFocus={() => setActive(fieldIndex)} onClick={() => setActive(fieldIndex)} className={`h-14 w-24 rounded-xl border-2 bg-white text-center text-3xl font-black text-slate-950 outline-none ${active === fieldIndex ? "border-violet-700 ring-4 ring-violet-100" : "border-violet-300"}`} />;

  return <LessonTaskFrame eyebrow="Dział 7 · Powtórzenie" heading="Zadania z treścią" description="Samodzielnie zapisz liczby ze znakami, wybierz działanie i oblicz wynik." questionNumber={index + 1} questionCount={storyTasks.length}><div className="space-y-5"><section className="rounded-3xl bg-gradient-to-r from-sky-50 via-white to-violet-50 p-5"><div className="flex items-start gap-4"><span className="text-5xl" aria-hidden>{task.icon}</span><div><p className="font-black uppercase tracking-wide text-indigo-700">{task.title}</p><p className="mt-1 text-xl font-black leading-relaxed text-slate-950">{task.prompt}</p></div></div></section><section className="rounded-3xl bg-slate-50 p-5"><div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-black text-indigo-950">{field(0, "Pierwsza liczba w działaniu")}<span aria-label="Wybrany znak działania" className="grid h-14 w-14 place-items-center rounded-xl border-2 border-violet-300 bg-white text-violet-800">{operator ?? "□"}</span>{field(1, "Druga liczba w działaniu")}<span>=</span>{field(2, "Wynik działania")}</div><div className="mx-auto mt-4 grid max-w-md grid-cols-4 gap-2">{(["+", "−", "·", ":"] as StoryTask["operator"][]).map((symbol) => <LessonTaskChoice key={symbol} selected={operator === symbol} disabled={readOnly || solved} onClick={() => { setOperator(symbol); setFeedback(null); onResultChange?.(null); }} className="min-h-12 text-2xl">{symbol}</LessonTaskChoice>)}</div></section><IntegerKeypad onPress={press} onConfirm={check} disabled={readOnly || solved} helperText="Kliknij wybraną kratkę i wpisz liczbę. Potem wybierz znak działania." /><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

export function integerReviewActivityFromStageId(stageId: string): IntegerReviewActivity {
  if (stageId.includes("m6-7-4")) {
    const activitiesBySuffix: Record<string, IntegerReviewActivity> = {
      recap: "g6-review-recap",
      connect: "g6-review-connect",
      cipher: "g6-review-cipher",
      "order-complex": "g6-review-order-complex",
      map: "g6-review-map",
      "order-natural": "g6-review-order-natural",
      "order-integers": "g6-review-order-integers",
      "order-fractions": "g6-review-order-fractions",
      escape: "g6-review-escape",
      sets: "g6-review-sets",
      absolute: "g6-review-absolute",
      operations: "g6-review-operations",
      stories: "g6-review-stories",
      challenge: "g6-review-challenge",
    };
    const activity = Object.entries(activitiesBySuffix).find(([suffix]) =>
      stageId.endsWith(`-${suffix}`),
    )?.[1];
    if (activity) return activity;

    const stageNumber = stageId.match(/-s(\d+)$/)?.[1];
    const activities: Record<string, IntegerReviewActivity> = {
      "1": "g6-review-sets",
      "2": "g6-review-absolute",
      "3": "g6-review-operations",
      "4": "g6-review-stories",
      "5": "g6-review-challenge",
    };
    return activities[stageNumber ?? ""] ?? "g6-review-sets";
  }
  if (stageId.endsWith("-s1")) return "comparison";
  if (stageId.endsWith("-s2")) return "opposites";
  if (stageId.endsWith("-s3")) return "operations";
  if (stageId.endsWith("-s4")) return "stories";
  return "challenge";
}

export function IntegerReviewLessonLab({ activity, readOnly = false, taskSeed, questionNumber, questionCount, onResultChange }: IntegerReviewLessonLabProps) {
  if (activity.startsWith("g6-")) return <Grade6SignedNumbersLessonLab activity={activity as Grade6SignedNumbersActivity} taskSeed={taskSeed} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "comparison") return <ComparisonSeries key="integer-review-comparison" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "opposites") return <ResultSeries key="integer-review-opposites" mode="opposites" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "operations") return <ResultSeries key="integer-review-operations" mode="operations" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "stories") return <StorySeries key="integer-review-stories" readOnly={readOnly} onResultChange={onResultChange} />;
  return <ChallengeSeries key="integer-review-challenge" readOnly={readOnly} onResultChange={onResultChange} />;
}
