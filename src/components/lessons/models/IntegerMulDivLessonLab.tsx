"use client";

import { useEffect, useRef, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { Grade6SignedNumbersLessonLab, type Grade6SignedNumbersActivity } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";

export type IntegerMulDivActivity = "sign-table" | "multiplication" | "division" | "mixed" | "stories" | "g6-sign-table" | "g6-multiply" | "g6-divide" | "g6-cipher" | "g6-mul-stories";

interface IntegerMulDivLessonLabProps {
  activity: IntegerMulDivActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface SignTask {
  id: string;
  expression: string;
  first: number;
  second: number;
  answer: "+" | "−";
  success: string;
}

interface CalculationTask {
  id: string;
  expression: string;
  result: number;
}

interface CipherTask extends CalculationTask {
  letter: string;
  slot: number;
}

interface StoryTask {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  operator: "·" | ":";
  first: number;
  second: number;
  result: number;
}

const signOf = (value: number) => value < 0 ? "−" : "+";
const formatInteger = (value: number) => value < 0 ? `−${Math.abs(value)}` : String(value);

function Feedback({ text, solved }: { text: string | null; solved?: boolean }) {
  if (!text) return null;
  return <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p>;
}

function SignTable({ first, second }: { first?: number; second?: number }) {
  const firstSign = first === undefined ? undefined : signOf(first);
  const secondSign = second === undefined ? undefined : signOf(second);
  const resultSign = first === undefined || second === undefined ? undefined : signOf(first * second);
  const cellClass = (row: "+" | "−", column: "+" | "−") => `rounded-xl border-2 px-4 py-3 text-center text-2xl font-black ${firstSign === row && secondSign === column ? "border-violet-700 bg-violet-700 text-white" : "border-slate-200 bg-white text-slate-950"}`;

  return (
    <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 shadow-sm sm:p-5">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[.16em] text-violet-800">Tabela znaków</p>
        <h3 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Dla mnożenia · i dzielenia :</h3>
      </div>
      <div className="mx-auto mt-4 max-w-md overflow-hidden rounded-2xl border-2 border-violet-200 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex items-center justify-center rounded-xl bg-violet-100 px-3 py-3 text-xl font-black text-violet-950">znak</div>
          <div className={`rounded-xl px-3 py-3 text-2xl font-black ${secondSign === "+" ? "bg-violet-200 text-violet-950" : "bg-slate-100 text-slate-700"}`}>+</div>
          <div className={`rounded-xl px-3 py-3 text-2xl font-black ${secondSign === "−" ? "bg-violet-200 text-violet-950" : "bg-slate-100 text-slate-700"}`}>−</div>
          <div className={`rounded-xl px-3 py-3 text-2xl font-black ${firstSign === "+" ? "bg-violet-200 text-violet-950" : "bg-slate-100 text-slate-700"}`}>+</div>
          <div className={cellClass("+", "+")}>+</div>
          <div className={cellClass("+", "−")}>−</div>
          <div className={`rounded-xl px-3 py-3 text-2xl font-black ${firstSign === "−" ? "bg-violet-200 text-violet-950" : "bg-slate-100 text-slate-700"}`}>−</div>
          <div className={cellClass("−", "+")}>−</div>
          <div className={cellClass("−", "−")}>+</div>
        </div>
      </div>
      {resultSign ? <p className="mt-3 text-center font-black text-violet-950">Dla zaznaczonych znaków wynik ma znak: <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-violet-700 px-2 text-xl text-white">{resultSign}</span></p> : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <p className="rounded-2xl bg-white/90 p-3 text-center text-sm font-bold text-slate-800"><span className="block text-lg text-violet-800">1</span>Sprawdź znaki.</p>
        <p className="rounded-2xl bg-white/90 p-3 text-center text-sm font-bold text-slate-800"><span className="block text-lg text-violet-800">2</span>Oblicz liczby bez znaków.</p>
        <p className="rounded-2xl bg-white/90 p-3 text-center text-sm font-bold text-slate-800"><span className="block text-lg text-violet-800">3</span>Nadaj znak z tabeli.</p>
      </div>
    </section>
  );
}

function IntegerKeypad({ onPress, disabled }: { onPress: (key: string) => void; disabled: boolean }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "minus", "0", "backspace"];
  return <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 rounded-3xl bg-slate-100 p-3">{keys.map((key) => <button key={key} type="button" onClick={() => onPress(key)} disabled={disabled} className={`min-h-12 rounded-xl font-black disabled:opacity-40 ${key === "minus" ? "bg-rose-200 text-rose-950" : key === "backspace" ? "bg-amber-200 text-amber-950" : "bg-white text-slate-950"}`}>{key === "minus" ? "−" : key === "backspace" ? "← Usuń" : key}</button>)}</div>;
}

function SignSeries({ readOnly = false, onResultChange }: Pick<IntegerMulDivLessonLabProps, "readOnly" | "onResultChange">) {
  const tasks: SignTask[] = [
    { id: "sign-1", expression: "6 · 4", first: 6, second: 4, answer: "+", success: "Dobrze. Dwa takie same znaki dają znak dodatni." },
    { id: "sign-2", expression: "(−7) · 3", first: -7, second: 3, answer: "−", success: "Dobrze. Różne znaki dają wynik ujemny." },
    { id: "sign-3", expression: "(−5) · (−8)", first: -5, second: -8, answer: "+", success: "Dobrze. Dwa minusy dają wynik dodatni." },
    { id: "sign-4", expression: "24 : (−6)", first: 24, second: -6, answer: "−", success: "Dobrze. Taka sama tabela działa też przy dzieleniu." },
    { id: "sign-5", expression: "(−36) : (−9)", first: -36, second: -9, answer: "+", success: "Dobrze. Dwa minusy przy dzieleniu dają plus." },
    { id: "sign-6", expression: "(−42) : 7", first: -42, second: 7, answer: "−", success: "Dobrze. Różne znaki dają minus." },
  ];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const choose = (answer: string) => {
    if (readOnly || solved) return;
    setSelected(answer);
    onResultChange?.(null);
    if (answer !== task.answer) { setFeedback("Spójrz jeszcze raz na wiersz i kolumnę w tabeli znaków."); return; }
    setSolved(true);
    setFeedback(task.success);
    if (index === tasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setSelected(null); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 3" heading="Tabela znaków" description="Najpierw odczytaj znaki liczb w tabeli. Tę samą regułę stosujesz przy mnożeniu i przy dzieleniu." questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-5"><SignTable first={task.first} second={task.second} /><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="font-mono text-3xl font-black text-indigo-950 sm:text-5xl">{task.expression}</p><p className="mt-3 text-lg font-black text-amber-950">Jaki znak ma wynik?</p></section><div className="grid grid-cols-2 gap-3"><LessonTaskChoice selected={selected === "+"} disabled={readOnly || solved} onClick={() => choose("+")} className="min-h-16 text-3xl">+</LessonTaskChoice><LessonTaskChoice selected={selected === "−"} disabled={readOnly || solved} onClick={() => choose("−")} className="min-h-16 text-3xl">−</LessonTaskChoice></div><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function CalculationScheme({ operation }: { operation: "multiplication" | "division" | "mixed" }) {
  const sample = operation === "division" ? { expression: "−24 : 6", magnitude: "24 : 6 = 4", result: "−4" } : operation === "multiplication" ? { expression: "−5 · 3", magnitude: "5 · 3 = 15", result: "−15" } : { expression: "−18 : −3", magnitude: "18 : 3 = 6", result: "6" };
  return <section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 shadow-sm"><p className="text-center text-xs font-black uppercase tracking-[.16em] text-sky-800">Schemat obliczenia</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-500">1. Znaki</p><p className="mt-2 font-mono text-2xl font-black text-indigo-950">{sample.expression}</p><p className="mt-2 text-sm font-bold text-slate-700">Odczytaj znak z tabeli.</p></div><div className="rounded-2xl bg-white p-4 text-center shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-500">2. Liczby</p><p className="mt-2 font-mono text-2xl font-black text-indigo-950">{sample.magnitude}</p><p className="mt-2 text-sm font-bold text-slate-700">Oblicz bez znaków.</p></div><div className="rounded-2xl bg-violet-700 p-4 text-center text-white shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-violet-200">3. Wynik</p><p className="mt-2 font-mono text-3xl font-black">{sample.result}</p><p className="mt-2 text-sm font-bold text-violet-100">Połącz liczbę i znak.</p></div></div>{operation === "multiplication" ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-center text-sm font-bold text-emerald-950">Przy trzech czynnikach mnożymy po kolei. Potęga to skrócony zapis mnożenia tej samej liczby, np. 2³ = 2 · 2 · 2.</p> : null}</section>;
}

function CalculationSeries({ heading, description, operation, tasks, readOnly = false, onResultChange }: { heading: string; description: string; operation: "multiplication" | "division" | "mixed"; tasks: CalculationTask[]; readOnly?: boolean; onResultChange?: IntegerMulDivLessonLabProps["onResultChange"] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => {
      if (key === "backspace") return current.slice(0, -1);
      if (key === "minus") return current ? current : "-";
      return `${current}${key}`.slice(0, 4);
    });
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answer === "" || answer === "-") { setFeedback("Wpisz wynik za pomocą klawiatury."); return; }
    if (Number(answer) !== task.result) { setFeedback("Sprawdź najpierw znak w tabeli, a potem obliczenie bez znaków."); return; }
    setSolved(true);
    setFeedback(`Dobrze. ${task.expression} = ${formatInteger(task.result)}.`);
    if (index === tasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 3" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-5"><CalculationScheme operation={operation} /><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-[.16em] text-amber-800">Oblicz</p><p className="mt-2 font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} = <input aria-label={`Wynik działania ${task.expression}`} inputMode="none" readOnly value={answer} onFocus={() => undefined} onClick={() => undefined} className="ml-2 h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none ring-violet-100 focus:border-violet-700 focus:ring-4 sm:h-18 sm:w-28 sm:text-5xl" /></p></section><IntegerKeypad onPress={press} disabled={readOnly || solved} /><button type="button" onClick={check} disabled={readOnly || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Zatwierdź</button><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function CipherSeries({ readOnly = false, onResultChange }: Pick<IntegerMulDivLessonLabProps, "readOnly" | "onResultChange">) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = cipherTasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => {
      if (key === "backspace") return current.slice(0, -1);
      if (key === "minus") return current ? current : "-";
      return `${current}${key}`.slice(0, 4);
    });
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answer === "" || answer === "-") { setFeedback("Wpisz wynik za pomocą klawiatury."); return; }
    if (Number(answer) !== task.result) { setFeedback("Jeszcze nie. Sprawdź znak wyniku i obliczenie wartości bez znaków."); return; }
    const code = { ...revealed, [task.slot]: task.letter };
    setRevealed(code);
    setSolved(true);
    setFeedback(index === cipherTasks.length - 1 ? `Brawo! Odczytane hasło: ${Array.from({ length: cipherTasks.length }, (_, slot) => code[slot]).join("")}.` : `Dobrze. Wynik ${formatInteger(task.result)} odsłania literę ${task.letter}.`);
    if (index === cipherTasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 3" heading="Szyfr liczb całkowitych" description="Oblicz wynik działania. Odszukaj go w kluczu szyfru — każda poprawna odpowiedź odsłania literę w innym miejscu hasła." questionNumber={index + 1} questionCount={cipherTasks.length}><div className="space-y-5"><section className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-4"><p className="text-center text-sm font-black uppercase tracking-[.16em] text-sky-800">Klucz szyfru: wynik → litera</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">{cipherKeyTasks.map((item) => <div key={item.id} className="rounded-xl bg-white px-2 py-2 text-center font-mono text-lg font-black text-indigo-950 shadow-sm">{formatInteger(item.result)} → {item.letter}</div>)}</div></section><section aria-label="Odsłaniane hasło" className="rounded-3xl bg-indigo-950 p-4 text-center text-white"><p className="text-sm font-black uppercase tracking-[.16em] text-indigo-200">Hasło</p><div className="mt-3 flex flex-wrap justify-center gap-2">{Array.from({ length: cipherTasks.length }, (_, slot) => <span key={slot} className="grid h-11 w-10 place-items-center rounded-lg bg-white text-xl font-black text-indigo-950">{revealed[slot] ?? "?"}</span>)}</div></section><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="text-sm font-black uppercase tracking-[.16em] text-amber-800">Oblicz i odczytaj literę</p><p className="mt-2 font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} = <input aria-label={`Wynik działania ${task.expression}`} inputMode="none" readOnly value={answer} onFocus={() => undefined} onClick={() => undefined} className="ml-2 h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none ring-violet-100 focus:border-violet-700 focus:ring-4 sm:h-18 sm:w-28 sm:text-5xl" /></p></section><IntegerKeypad onPress={press} disabled={readOnly || solved} /><button type="button" onClick={check} disabled={readOnly || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Zatwierdź</button><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function StorySeries({ readOnly = false, onResultChange }: Pick<IntegerMulDivLessonLabProps, "readOnly" | "onResultChange">) {
  const tasks: StoryTask[] = [
    { id: "story-temp", icon: "🌡️", title: "Zmiana temperatury", prompt: "Przez 4 godziny temperatura spadała co godzinę o 3°C. Zapisz działanie i łączną zmianę temperatury.", operator: "·", first: 4, second: -3, result: -12 },
    { id: "story-debt", icon: "🧾", title: "Równe raty długu", prompt: "Dług 24 zł podzielono na 6 równych rat. Jaka zmiana stanu konta przypada na jedną ratę?", operator: ":", first: -24, second: 6, result: -4 },
    { id: "story-elevator", icon: "🛗", title: "Zjazdy windą", prompt: "Winda wykonała 3 zjazdy, za każdym razem o 5 pięter. Zjazd oznaczamy liczbą ujemną. Jaka jest łączna zmiana poziomu?", operator: "·", first: 3, second: -5, result: -15 },
    { id: "story-points", icon: "🎯", title: "Punkty karne", prompt: "Brak 30 punktów podzielono równo na 5 części. Jaką wartość ma jedna część?", operator: ":", first: -30, second: 5, result: -6 },
  ];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const press = (key: string) => {
    if (readOnly || solved) return;
    setAnswers((current) => current.map((value, fieldIndex) => {
      if (fieldIndex !== active) return value;
      if (key === "backspace") return value.slice(0, -1);
      if (key === "minus") return value ? value : "-";
      return `${value}${key}`.slice(0, 4);
    }));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    const expected = [task.first, task.second, task.result];
    if (answers.some((value) => value === "" || value === "-")) { setFeedback("Uzupełnij wszystkie trzy pola działania."); return; }
    if (answers.some((value, fieldIndex) => Number(value) !== expected[fieldIndex])) { setFeedback("Sprawdź znaki i oblicz wartość bez znaków."); return; }
    setSolved(true);
    setFeedback(`Dobrze. ${formatInteger(task.first)} ${task.operator} ${formatInteger(task.second)} = ${formatInteger(task.result)}.`);
    if (index === tasks.length - 1) { onResultChange?.(true, answers.join(", ")); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswers(["", "", ""]); setActive(0); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };
  const field = (fieldIndex: number, label: string) => <input aria-label={label} inputMode="none" readOnly value={answers[fieldIndex]} onFocus={() => setActive(fieldIndex)} onClick={() => setActive(fieldIndex)} className={`h-14 w-24 rounded-xl border-2 bg-white text-center text-3xl font-black text-slate-950 outline-none ${active === fieldIndex ? "border-violet-700 ring-4 ring-violet-100" : "border-violet-300"}`} />;

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 3" heading="Zadania z treścią" description="Samodzielnie wpisz liczby ze znakami, wybierz ich wartości i podaj wynik działania." questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-5"><section className="rounded-3xl bg-gradient-to-r from-sky-50 via-white to-violet-50 p-5"><div className="flex items-start gap-4"><span className="text-5xl" aria-hidden>{task.icon}</span><div><p className="font-black uppercase tracking-wide text-indigo-700">{task.title}</p><p className="mt-1 text-xl font-black leading-relaxed text-slate-950">{task.prompt}</p></div></div></section><SignTable first={task.first} second={task.second} /><section className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-slate-50 p-5 text-3xl font-black text-indigo-950">{field(0, "Pierwsza liczba w działaniu")}<span>{task.operator}</span>{field(1, "Druga liczba w działaniu")}<span>=</span>{field(2, "Wynik działania")}</section><IntegerKeypad onPress={press} disabled={readOnly || solved} /><button type="button" onClick={check} disabled={readOnly || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Zatwierdź</button><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

const multiplicationTasks: CalculationTask[] = [
  { id: "mul-1", expression: "−4 · 6", result: -24 },
  { id: "mul-2", expression: "−7 · (−3)", result: 21 },
  { id: "mul-3", expression: "5 · (−8)", result: -40 },
  { id: "mul-4", expression: "−9 · (−5)", result: 45 },
  { id: "mul-5", expression: "−12 · 2", result: -24 },
  { id: "mul-6", expression: "−6 · 7", result: -42 },
  { id: "mul-7", expression: "8 · (−4)", result: -32 },
  { id: "mul-8", expression: "−11 · (−3)", result: 33 },
  { id: "mul-9", expression: "3 · 9", result: 27 },
  { id: "mul-10", expression: "−10 · (−6)", result: 60 },
  { id: "mul-11", expression: "−2 · 3 · 4", result: -24 },
  { id: "mul-12", expression: "(−3) · (−2) · 5", result: 30 },
  { id: "mul-13", expression: "2³", result: 8 },
  { id: "mul-14", expression: "(−2)²", result: 4 },
];

const divisionTasks: CalculationTask[] = [
  { id: "div-1", expression: "−24 : 6", result: -4 },
  { id: "div-2", expression: "−36 : (−4)", result: 9 },
  { id: "div-3", expression: "45 : (−5)", result: -9 },
  { id: "div-4", expression: "−56 : 7", result: -8 },
  { id: "div-5", expression: "−72 : (−8)", result: 9 },
  { id: "div-6", expression: "63 : (−9)", result: -7 },
  { id: "div-7", expression: "−48 : (−6)", result: 8 },
  { id: "div-8", expression: "−54 : 9", result: -6 },
  { id: "div-9", expression: "−81 : (−9)", result: 9 },
  { id: "div-10", expression: "64 : (−8)", result: -8 },
];

const cipherTasks: CipherTask[] = [
  { id: "cipher-1", expression: "−3 · 8", result: -24, letter: "C", slot: 4 },
  { id: "cipher-2", expression: "−42 : (−6)", result: 7, letter: "A", slot: 7 },
  { id: "cipher-3", expression: "7 · (−7)", result: -49, letter: "Ł", slot: 2 },
  { id: "cipher-4", expression: "−45 : 5", result: -9, letter: "K", slot: 5 },
  { id: "cipher-5", expression: "−8 · (−9)", result: 72, letter: "O", slot: 0 },
  { id: "cipher-6", expression: "56 : (−7)", result: -8, letter: "W", slot: 8 },
  { id: "cipher-7", expression: "−5 · 11", result: -55, letter: "I", slot: 3 },
  { id: "cipher-8", expression: "−64 : (−8)", result: 8, letter: "T", slot: 6 },
  { id: "cipher-9", expression: "12 · (−6)", result: -72, letter: "E", slot: 1 },
];

const cipherKeyTasks = [cipherTasks[4]!, cipherTasks[7]!, cipherTasks[1]!, cipherTasks[8]!, cipherTasks[0]!, cipherTasks[6]!, cipherTasks[3]!, cipherTasks[5]!, cipherTasks[2]!];

export function integerMulDivActivityFromStageId(stageId: string): IntegerMulDivActivity {
  if (stageId.includes("m6-7-3")) {
    const activitiesBySuffix: Record<string, IntegerMulDivActivity> = {
      "sign-table": "g6-sign-table",
      multiply: "g6-multiply",
      divide: "g6-divide",
      cipher: "g6-cipher",
      stories: "g6-mul-stories",
    };
    const activity = Object.entries(activitiesBySuffix).find(([suffix]) =>
      stageId.endsWith(`-${suffix}`),
    )?.[1];
    if (activity) return activity;

    const stageNumber = stageId.match(/-s(\d+)$/)?.[1];
    const activities: Record<string, IntegerMulDivActivity> = {
      "1": "g6-sign-table",
      "2": "g6-multiply",
      "3": "g6-divide",
      "4": "g6-cipher",
      "5": "g6-mul-stories",
    };
    return activities[stageNumber ?? ""] ?? "g6-sign-table";
  }
  if (stageId.endsWith("-s1")) return "sign-table";
  if (stageId.endsWith("-s2")) return "multiplication";
  if (stageId.endsWith("-s3")) return "division";
  if (stageId.endsWith("-s4")) return "mixed";
  return "stories";
}

export function IntegerMulDivLessonLab({ activity, readOnly = false, onResultChange }: IntegerMulDivLessonLabProps) {
  if (activity.startsWith("g6-")) return <Grade6SignedNumbersLessonLab activity={activity as Grade6SignedNumbersActivity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "sign-table") return <SignSeries key="integer-mul-div-sign-table" readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "multiplication") return <CalculationSeries key="integer-mul-div-multiplication" heading="Mnożenie liczb całkowitych" description="Sprawdź znaki, pomnóż liczby bez znaków i dopisz właściwy znak wyniku." operation="multiplication" tasks={multiplicationTasks} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "division") return <CalculationSeries key="integer-mul-div-division" heading="Dzielenie liczb całkowitych" description="Tabela znaków działa tak samo jak przy mnożeniu. Potem wykonaj zwykłe dzielenie wartości bez znaków." operation="division" tasks={divisionTasks} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "mixed") return <CipherSeries key="integer-mul-div-mixed" readOnly={readOnly} onResultChange={onResultChange} />;
  return <StorySeries key="integer-mul-div-stories" readOnly={readOnly} onResultChange={onResultChange} />;
}
