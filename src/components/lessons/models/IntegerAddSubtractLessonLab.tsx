"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type IntegerAddSubtractActivity =
  | "signs"
  | "different-signs"
  | "same-signs"
  | "subtraction"
  | "practice"
  | "stories";

interface IntegerAddSubtractLessonLabProps {
  activity: IntegerAddSubtractActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

interface ChoiceTask {
  id: string;
  prompt: string;
  expression?: string;
  options: string[];
  answer: string;
  success: string;
}

interface OperationTask {
  id: string;
  expression: string;
  result: number;
  start: number;
  movement: number;
  hint: string;
}

interface StoryTask {
  id: string;
  icon: string;
  title: string;
  prompt: string;
  first: number;
  second: number;
  result: number;
  operator: "+" | "−";
  start: number;
  movement: number;
}

const formatInteger = (value: number, positiveSign = false) => value > 0 && positiveSign ? `+${value}` : String(value);

function Feedback({ text, solved }: { text: string | null; solved?: boolean }) {
  if (!text) return null;
  return <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{text}</p>;
}

function ChoiceSeries({
  heading,
  description,
  tasks,
  readOnly,
  onResultChange,
  visual,
}: {
  heading: string;
  description: string;
  tasks: ChoiceTask[];
  readOnly: boolean;
  onResultChange?: IntegerAddSubtractLessonLabProps["onResultChange"];
  visual?: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const timer = useRef<number | null>(null);
  const task = tasks[index]!;

  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  const choose = (option: string) => {
    if (readOnly || solved) return;
    setSelected(option);
    onResultChange?.(null);
    if (option !== task.answer) {
      setFeedback("Jeszcze nie. Sprawdź znaki i pomyśl o bilansie: zysk jest dodatni, dług ujemny.");
      return;
    }
    setSolved(true);
    setFeedback(task.success);
    if (index === tasks.length - 1) {
      onResultChange?.(true, task.answer);
      return;
    }
    timer.current = window.setTimeout(() => {
      setIndex((value) => value + 1);
      setSelected(null);
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 850);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 7 · Temat 2" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length}>
      <div className="space-y-5">
        {visual}
        <section className="rounded-3xl bg-amber-50 p-5 text-center">
          {task.expression ? <p className="font-mono text-3xl font-black text-indigo-950 sm:text-5xl">{task.expression}</p> : null}
          <p className={`${task.expression ? "mt-3" : ""} text-xl font-black leading-relaxed text-amber-950 sm:text-2xl`}>{task.prompt}</p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          {task.options.map((option) => <LessonTaskChoice key={option} selected={selected === option} disabled={readOnly || solved} onClick={() => choose(option)} className="min-h-16 text-base sm:text-lg">{option}</LessonTaskChoice>)}
        </div>
        <Feedback text={feedback} solved={solved} />
      </div>
    </LessonTaskFrame>
  );
}

function DebtBalance({ variant }: { variant: "different" | "same" | "subtraction" | "signs" }) {
  if (variant === "signs") {
    return (
      <section className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 shadow-sm">
        <h3 className="text-center text-lg font-black text-slate-950 sm:text-xl">Usuwamy nawias</h3>
        <div className="mt-3 grid gap-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-center text-emerald-950">
            <div><p className="text-sm font-black uppercase tracking-wide">Zapis z nawiasem</p><p className="mt-1 text-4xl font-black">+ (−4)</p></div>
            <span className="text-3xl font-black text-slate-500">→</span>
            <div><p className="text-sm font-black uppercase tracking-wide">Po usunięciu nawiasu</p><p className="mt-1 text-4xl font-black">−4</p></div>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-rose-50 p-4 text-center text-rose-950">
            <div><p className="text-sm font-black uppercase tracking-wide">Zapis z nawiasem</p><p className="mt-1 text-4xl font-black">− (−4)</p></div>
            <span className="text-3xl font-black text-slate-500">→</span>
            <div><p className="text-sm font-black uppercase tracking-wide">Po usunięciu nawiasu</p><p className="mt-1 text-4xl font-black">+4</p></div>
          </div>
        </div>
        <p className="mt-3 text-center font-bold leading-relaxed text-slate-700">Plus obok minusa daje minus, a dwa minusy obok siebie dają plus.</p>
      </section>
    );
  }

  const content = variant === "different"
    ? { left: "Masz", leftValue: "+8", right: "Dług", rightValue: "−5", result: "+3", note: "Różne znaki: odejmij 5 od 8. Znak ma liczba o większej wartości bezwzględnej." }
    : variant === "same"
      ? { left: "Dług", leftValue: "−4", right: "Nowy dług", rightValue: "−3", result: "−7", note: "Takie same znaki: dodaj 4 i 3. Znak pozostaje ujemny." }
      : { left: "Dług", leftValue: "−8", right: "Spłata długu", rightValue: "−5", result: "−3", note: "Odjęcie długu zmniejsza dług: −8 − (−5) = −8 + 5." };

  return (
    <section className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <div className="rounded-2xl bg-emerald-100 p-4 text-center text-emerald-950"><p className="text-sm font-black uppercase tracking-wide">{content.left}</p><p className="mt-1 text-4xl font-black">{content.leftValue}</p></div>
        <p className="self-center text-center text-3xl font-black text-slate-500">łączymy</p>
        <div className="rounded-2xl bg-rose-100 p-4 text-center text-rose-950"><p className="text-sm font-black uppercase tracking-wide">{content.right}</p><p className="mt-1 text-4xl font-black">{content.rightValue}</p></div>
      </div>
      <div className="mt-3 rounded-2xl bg-indigo-950 px-5 py-3 text-center text-white"><span className="text-sm font-black uppercase tracking-wide text-indigo-200">Wynik</span><p className="text-3xl font-black">{content.result}</p></div>
      <p className="mt-3 text-center font-bold leading-relaxed text-slate-700">{content.note}</p>
    </section>
  );
}

function OperationAxis({ start, movement, readOnly }: { start: number; movement: number; readOnly: boolean }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const target = start + movement;
  const totalSteps = Math.abs(movement);
  const direction = Math.sign(movement);
  const current = start + direction * step;
  const min = Math.min(-10, start, target) - 2;
  const max = Math.max(10, start, target) + 2;
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  const xFor = (value: number) => 34 + (value - min) * (692 / (max - min));

  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  const clearTimer = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
    setPlaying(false);
  };
  const play = () => {
    if (readOnly) return;
    clearTimer();
    if (step >= totalSteps) setStep(0);
    setPlaying(true);
    timer.current = window.setInterval(() => {
      setStep((value) => {
        if (value >= totalSteps - 1) {
          clearTimer();
          return totalSteps;
        }
        return value + 1;
      });
    }, 410);
  };
  const oneStep = () => {
    if (readOnly || step >= totalSteps) return;
    setStep((value) => value + 1);
  };

  return (
    <section className="rounded-3xl border-2 border-sky-200 bg-sky-50 p-3 shadow-sm" aria-label="Ruch po osi liczbowej">
      <div className="overflow-x-auto"><svg role="img" aria-label={`Ruch od ${formatInteger(start)} do ${formatInteger(target)} po osi`} viewBox="0 0 760 166" className="block min-w-[620px] w-full">
        <line x1="28" y1="97" x2="728" y2="97" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        <path d="M 728 97 l -15 -10 M 728 97 l -15 10 M 28 97 l 15 -10 M 28 97 l 15 10" fill="none" stroke="#172554" strokeWidth="5" strokeLinecap="round" />
        <line x1={xFor(start)} y1="52" x2={xFor(current)} y2="52" stroke={movement >= 0 ? "#16a34a" : "#dc2626"} strokeWidth="9" strokeLinecap="round" />
        {values.map((value) => <g key={value}>
          <line x1={xFor(value)} y1="82" x2={xFor(value)} y2="111" stroke={value === 0 ? "#7e22ce" : "#1e3a8a"} strokeWidth={value === 0 ? "4" : "2"} />
          {(value === min || value === max || value === 0 || value === start || value === target || value % 2 === 0) ? <text x={xFor(value)} y="140" textAnchor="middle" fill="#172554" fontSize="17" fontWeight="800">{formatInteger(value, value > 0)}</text> : null}
        </g>)}
        <circle cx={xFor(start)} cy="97" r="11" fill="#facc15" stroke="#a16207" strokeWidth="4" />
        <circle cx={xFor(target)} cy="97" r="11" fill="#bbf7d0" stroke="#15803d" strokeWidth="4" />
        <circle cx={xFor(current)} cy="52" r="14" fill={movement >= 0 ? "#16a34a" : "#dc2626"} stroke="white" strokeWidth="5" className="transition-all duration-500" />
        <text x={xFor(start)} y="34" textAnchor="middle" fill="#854d0e" fontSize="16" fontWeight="900">start</text>
      </svg></div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2"><button type="button" onClick={oneStep} disabled={readOnly || step >= totalSteps} className="min-h-11 rounded-xl bg-sky-700 px-4 font-black text-white disabled:opacity-40">Jeden krok</button><button type="button" onClick={play} disabled={readOnly || playing} className="min-h-11 rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">{step >= totalSteps ? "Odtwórz ponownie" : "Pokaż ruch"}</button><span className="rounded-xl bg-white px-3 py-2 text-sm font-black text-slate-800">Krok {step}/{totalSteps} · {formatInteger(current)}</span></div>
    </section>
  );
}

function IntegerKeypad({ onPress, disabled }: { onPress: (key: string) => void; disabled: boolean }) {
  return <div className="mx-auto grid max-w-sm grid-cols-4 gap-2 rounded-3xl bg-slate-100 p-3">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "minus", "0", "backspace"].map((key) => <button key={key} type="button" onClick={() => onPress(key)} disabled={disabled} className={`min-h-12 rounded-xl font-black disabled:opacity-40 ${key === "minus" ? "bg-rose-200 text-rose-950" : key === "backspace" ? "bg-amber-200 text-amber-950" : "bg-white text-slate-950"}`}>{key === "minus" ? "−" : key === "backspace" ? "← Usuń" : key}</button>)}</div>;
}

function OperationSeries({ readOnly = false, onResultChange }: Pick<IntegerAddSubtractLessonLabProps, "readOnly" | "onResultChange">) {
  const tasks: OperationTask[] = [
    { id: "op-1", expression: "−6 + 8", result: 2, start: -6, movement: 8, hint: "Różne znaki: 8 − 6, znak dodatni." },
    { id: "op-2", expression: "7 + (−10)", result: -3, start: 7, movement: -10, hint: "Różne znaki: 10 − 7, znak ujemny." },
    { id: "op-3", expression: "−4 + (−5)", result: -9, start: -4, movement: -5, hint: "Takie same znaki: 4 + 5, znak ujemny." },
    { id: "op-4", expression: "11 − (−7)", result: 18, start: 11, movement: 7, hint: "Dwa minusy: zamień na plus i idź w prawo." },
    { id: "op-5", expression: "−9 − 6", result: -15, start: -9, movement: -6, hint: "Odejmujesz liczbę dodatnią, więc idziesz w lewo." },
    { id: "op-6", expression: "12 − 15", result: -3, start: 12, movement: -15, hint: "Odejmujesz liczbę dodatnią: 15 − 12 i znak ujemny." },
    { id: "op-7", expression: "−7 − (−4)", result: -3, start: -7, movement: 4, hint: "Dwa minusy: zamień na plus i idź w prawo." },
    { id: "op-8", expression: "8 + (−8)", result: 0, start: 8, movement: -8, hint: "Przeciwne liczby znoszą się do zera." },
    { id: "op-9", expression: "−3 + 9", result: 6, start: -3, movement: 9, hint: "Różne znaki: 9 − 3, znak dodatni." },
    { id: "op-10", expression: "−10 − (−6)", result: -4, start: -10, movement: 6, hint: "Dwa minusy: zamień na plus i idź w prawo." },
  ];
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
      return `${current}${key}`.slice(0, 3);
    });
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    if (answer === "" || answer === "-") { setFeedback("Wpisz wynik za pomocą klawiatury."); return; }
    if (Number(answer) !== task.result) { setFeedback(`Jeszcze nie. ${task.hint}`); return; }
    setSolved(true);
    setFeedback(`Dobrze. ${task.expression} = ${formatInteger(task.result)}.`);
    if (index === tasks.length - 1) { onResultChange?.(true, answer); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswer(""); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 2" heading="Ćwiczenia: dodawanie i odejmowanie" description="Oblicz wynik. Jeśli potrzebujesz, odtwórz ruch po osi. Wszystkie działania są na liczbach całkowitych." questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-4"><OperationAxis start={task.start} movement={task.movement} readOnly={readOnly} /><section className="rounded-3xl bg-amber-50 p-5 text-center"><p className="font-mono text-4xl font-black text-indigo-950 sm:text-6xl">{task.expression} = <input aria-label={`Wynik działania ${task.expression}`} inputMode="none" readOnly value={answer} onFocus={() => undefined} className="ml-3 h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-3xl font-black text-slate-950 outline-none ring-violet-100 focus:border-violet-700 focus:ring-4 sm:h-18 sm:w-28 sm:text-5xl" /></p></section><IntegerKeypad onPress={press} disabled={readOnly || solved} /><button type="button" onClick={check} disabled={readOnly || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Zatwierdź</button><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

function StorySeries({ readOnly = false, onResultChange }: Pick<IntegerAddSubtractLessonLabProps, "readOnly" | "onResultChange">) {
  const tasks: StoryTask[] = [
    { id: "story-money", icon: "💰", title: "Pieniądze i dług", prompt: "Kuba ma 9 zł, ale ma też dług 14 zł. Jaki jest jego bilans?", first: 9, second: -14, result: -5, operator: "+", start: 9, movement: -14 },
    { id: "story-repayment", icon: "🧾", title: "Spłata długu", prompt: "Ola ma dług 8 zł. Spłaciła 5 zł długu. Jaki dług jej został?", first: -8, second: -5, result: -3, operator: "−", start: -8, movement: 5 },
    { id: "story-temperature", icon: "🌡️", title: "Temperatura", prompt: "Rano było −4°C. W południe temperatura wzrosła o 9°C. Ile było w południe?", first: -4, second: 9, result: 5, operator: "+", start: -4, movement: 9 },
    { id: "story-new-debt", icon: "🎒", title: "Nowy dług", prompt: "Stan skarbonki Oli to −3 zł. Pożyczyła jeszcze 6 zł. Jaki jest nowy stan?", first: -3, second: -6, result: -9, operator: "+", start: -3, movement: -6 },
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
    setAnswers((current) => current.map((value, itemIndex) => {
      if (itemIndex !== active) return value;
      if (key === "backspace") return value.slice(0, -1);
      if (key === "minus") return value ? value : "-";
      return `${value}${key}`.slice(0, 3);
    }));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (readOnly || solved) return;
    const [first, second, result] = answers.map(Number);
    if (answers.some((answer) => answer === "" || answer === "-")) { setFeedback("Uzupełnij cały zapis działania i wynik."); return; }
    if (first !== task.first || second !== task.second || result !== task.result) { setFeedback("Sprawdź znaki w zapisie. Dług zapisujemy jako liczbę ujemną."); return; }
    setSolved(true);
    setFeedback(`Dobrze. ${formatInteger(task.first, task.first > 0)} ${task.operator} (${formatInteger(task.second, task.second > 0)}) = ${formatInteger(task.result)}.`);
    if (index === tasks.length - 1) { onResultChange?.(true, answers.join(", ")); return; }
    timer.current = window.setTimeout(() => { setIndex((value) => value + 1); setAnswers(["", "", ""]); setFeedback(null); setSolved(false); onResultChange?.(null); }, 850);
  };
  const field = (fieldIndex: number, label: string) => <input aria-label={label} inputMode="none" readOnly value={answers[fieldIndex]} onFocus={() => setActive(fieldIndex)} onClick={() => setActive(fieldIndex)} className={`h-14 w-24 rounded-xl border-2 bg-white text-center text-3xl font-black text-slate-950 outline-none ${active === fieldIndex ? "border-violet-700 ring-4 ring-violet-100" : "border-violet-300"}`} />;

  return <LessonTaskFrame eyebrow="Dział 7 · Temat 2" heading="Zadania z treścią: bilans" description="Najpierw zapisz liczby ze znakami, a potem podaj wynik. Dług i temperatura poniżej zera są liczbami ujemnymi." questionNumber={index + 1} questionCount={tasks.length}><div className="space-y-4"><section className="rounded-3xl bg-gradient-to-r from-amber-50 to-sky-50 p-5"><div className="flex gap-4"><span className="text-5xl" aria-hidden>{task.icon}</span><div><p className="font-black uppercase tracking-wide text-indigo-700">{task.title}</p><p className="mt-1 text-xl font-black leading-relaxed text-slate-950">{task.prompt}</p></div></div></section><OperationAxis start={task.start} movement={task.movement} readOnly={readOnly} /><section className="flex flex-wrap items-center justify-center gap-3 rounded-3xl bg-slate-50 p-5 text-3xl font-black text-indigo-950">{field(0, "Pierwsza liczba w działaniu")}<span>{task.operator}</span>{field(1, "Druga liczba w działaniu")}<span>=</span>{field(2, "Wynik działania")}</section><IntegerKeypad onPress={press} disabled={readOnly || solved} /><button type="button" onClick={check} disabled={readOnly || solved} className="mx-auto block min-h-12 rounded-xl bg-indigo-700 px-6 font-black text-white disabled:opacity-40">Zatwierdź</button><Feedback text={feedback} solved={solved} /></div></LessonTaskFrame>;
}

const signTasks: ChoiceTask[] = [
  { id: "sign-1", expression: "5 + (−2)", prompt: "Jak zapiszesz to działanie bez nawiasu?", options: ["5 − 2", "5 + 2", "−5 − 2", "−5 + 2"], answer: "5 − 2", success: "Dobrze. Plus obok minusa zostaje minusem." },
  { id: "sign-2", expression: "−8 − (−4)", prompt: "Jak zapiszesz to działanie bez nawiasu?", options: ["−8 − 4", "−8 + 4", "8 + 4", "8 − 4"], answer: "−8 + 4", success: "Dobrze. Dwa minusy obok siebie zmieniamy na plus." },
  { id: "sign-3", expression: "3 − (−7)", prompt: "Jaki znak zostanie między liczbami?", options: ["+", "−", "=", "×"], answer: "+", success: "Dobrze. Odejmowanie liczby ujemnej zmienia się w dodawanie." },
  { id: "sign-4", expression: "−6 + (−5)", prompt: "Jaki znak zostanie między liczbami po usunięciu nawiasu?", options: ["+", "−", "=", ":"], answer: "−", success: "Dobrze. Plus obok minusa daje minus: −6 − 5." },
];

const differentSignTasks: ChoiceTask[] = [
  { id: "diff-1", expression: "−8 + 5", prompt: "Który opis jest poprawny?", options: ["8 − 5 i znak ujemny", "8 + 5 i znak dodatni", "8 − 5 i znak dodatni", "8 + 5 i znak ujemny"], answer: "8 − 5 i znak ujemny", success: "Dobrze. Odejmujemy wartości bezwzględne, a większa wartość 8 ma znak ujemny." },
  { id: "diff-2", expression: "7 + (−4)", prompt: "Jak obliczysz wynik?", options: ["7 − 4 i znak dodatni", "7 + 4 i znak dodatni", "7 − 4 i znak ujemny", "7 + 4 i znak ujemny"], answer: "7 − 4 i znak dodatni", success: "Dobrze. Większa wartość 7 ma znak dodatni." },
  { id: "diff-3", expression: "−3 + 9", prompt: "Jaki znak będzie miał wynik?", options: ["dodatni", "ujemny", "zero", "nie da się ustalić"], answer: "dodatni", success: "Dobrze. Większa wartość bezwzględna to 9 i ma znak dodatni." },
  { id: "diff-4", expression: "12 − 15", prompt: "Po uproszczeniu znaków wynik będzie…", options: ["ujemny", "dodatni", "zerowy", "zawsze dodatni"], answer: "ujemny", success: "Dobrze. 12 − 15 to 12 + (−15), więc większa wartość ma znak ujemny." },
];

const sameSignTasks: ChoiceTask[] = [
  { id: "same-1", expression: "−4 + (−3)", prompt: "Jak obliczysz wynik?", options: ["4 + 3 i znak ujemny", "4 − 3 i znak ujemny", "4 + 3 i znak dodatni", "4 − 3 i znak dodatni"], answer: "4 + 3 i znak ujemny", success: "Dobrze. Takie same znaki: dodajemy wartości bezwzględne i zostawiamy znak." },
  { id: "same-2", expression: "6 + 5", prompt: "Jaki znak ma wynik?", options: ["dodatni", "ujemny", "zero", "nie da się ustalić"], answer: "dodatni", success: "Dobrze. Dwie liczby dodatnie dają dodatni wynik." },
  { id: "same-3", expression: "−7 + (−2)", prompt: "Jaki znak ma wynik?", options: ["ujemny", "dodatni", "zero", "zależy od osi"], answer: "ujemny", success: "Dobrze. Dwie liczby ujemne dają wynik ujemny." },
  { id: "same-4", expression: "−10 + (−1)", prompt: "Który zapis obliczenia jest poprawny?", options: ["−(10 + 1)", "10 − 1", "+(10 + 1)", "−(10 − 1)"], answer: "−(10 + 1)", success: "Dobrze. Dodajemy 10 i 1, a znak pozostaje ujemny." },
];

const subtractionTasks: ChoiceTask[] = [
  { id: "sub-1", expression: "4 − (−6)", prompt: "Najpierw zmieniamy zapis na…", options: ["4 + 6", "4 − 6", "−4 + 6", "−4 − 6"], answer: "4 + 6", success: "Dobrze. Dwa minusy obok siebie dają plus." },
  { id: "sub-2", expression: "−5 − 3", prompt: "Najpierw zmieniamy zapis na…", options: ["−5 + (−3)", "−5 + 3", "5 − 3", "5 + 3"], answer: "−5 + (−3)", success: "Dobrze. Odejmowanie dodatniej liczby to dodawanie liczby przeciwnej." },
  { id: "sub-3", expression: "−9 − (−2)", prompt: "Najpierw zmieniamy zapis na…", options: ["−9 + 2", "−9 − 2", "9 + 2", "9 − 2"], answer: "−9 + 2", success: "Dobrze. Odejmowanie liczby ujemnej zmienia się w dodawanie." },
  { id: "sub-4", expression: "7 − 10", prompt: "Na osi wykonasz ruch…", options: ["w lewo o 10", "w prawo o 10", "w lewo o 7", "w prawo o 7"], answer: "w lewo o 10", success: "Dobrze. Odejmowanie dodatniej liczby to ruch w lewo." },
];

export function integerAddSubtractActivityFromStageId(stageId: string): IntegerAddSubtractActivity {
  if (stageId.endsWith("-s1")) return "signs";
  if (stageId.endsWith("-s2")) return "different-signs";
  if (stageId.endsWith("-s3")) return "same-signs";
  if (stageId.endsWith("-s4")) return "subtraction";
  if (stageId.endsWith("-s5")) return "practice";
  return "stories";
}

export function IntegerAddSubtractLessonLab({ activity, readOnly = false, onResultChange }: IntegerAddSubtractLessonLabProps) {
  if (activity === "signs") return <ChoiceSeries heading="Znaki przy nawiasach" description="Najpierw usuń nawias. Znak plus obok minusa daje minus, a dwa minusy obok siebie dają plus." tasks={signTasks} readOnly={readOnly} onResultChange={onResultChange} visual={<DebtBalance variant="signs" />} />;
  if (activity === "different-signs") return <ChoiceSeries heading="Liczby przeciwnych znaków" description="Odejmij mniejszą wartość bezwzględną od większej. Wynik ma znak liczby o większej wartości bezwzględnej." tasks={differentSignTasks} readOnly={readOnly} onResultChange={onResultChange} visual={<DebtBalance variant="different" />} />;
  if (activity === "same-signs") return <ChoiceSeries heading="Liczby takich samych znaków" description="Dodaj wartości bezwzględne. Wynik ma wspólny znak obu liczb." tasks={sameSignTasks} readOnly={readOnly} onResultChange={onResultChange} visual={<DebtBalance variant="same" />} />;
  if (activity === "subtraction") return <ChoiceSeries heading="Odejmowanie liczb całkowitych" description="Odejmowanie zamieniamy na dodawanie liczby przeciwnej. Dopiero potem używamy poznanych reguł." tasks={subtractionTasks} readOnly={readOnly} onResultChange={onResultChange} visual={<DebtBalance variant="subtraction" />} />;
  if (activity === "practice") return <OperationSeries readOnly={readOnly} onResultChange={onResultChange} />;
  return <StorySeries readOnly={readOnly} onResultChange={onResultChange} />;
}
