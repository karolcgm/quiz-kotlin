"use client";

import { useEffect, useMemo, useState } from "react";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

interface MultiSelectTask {
  title: string;
  prompt: string;
  values: readonly number[];
  correct: readonly number[];
  explanation: string;
}

interface ChoiceTask {
  title: string;
  prompt: string;
  display: string;
  choices: readonly string[];
  correct: string;
  explanation: string;
}

export const SECTION_TWO_MULTIPLE_TASKS: readonly MultiSelectTask[] = [
  { title: "Paczki po 4", prompt: "Zaznacz wszystkie wielokrotności liczby 4.", values: [0, 4, 8, 10, 12, 15, 16, 20], correct: [0, 4, 8, 12, 16, 20], explanation: "Wielokrotności 4 powstają przez 0×4, 1×4, 2×4 i kolejne iloczyny." },
  { title: "Rytm co 6", prompt: "Zaznacz wszystkie wielokrotności liczby 6.", values: [0, 6, 12, 16, 18, 21, 24, 30], correct: [0, 6, 12, 18, 24, 30], explanation: "Każda zaznaczona liczba dzieli się przez 6 bez reszty." },
  { title: "Skoki co 7", prompt: "Zaznacz wszystkie wielokrotności liczby 7.", values: [0, 7, 12, 14, 21, 27, 28, 35], correct: [0, 7, 14, 21, 28, 35], explanation: "To kolejne wyniki mnożenia liczby 7 przez liczby naturalne." },
  { title: "Światła co 9", prompt: "Zaznacz wszystkie wielokrotności liczby 9.", values: [0, 9, 18, 24, 27, 36, 42, 45], correct: [0, 9, 18, 27, 36, 45], explanation: "Rytm 9 prowadzi przez 0, 9, 18, 27, 36 i 45." },
] as const;

export const SECTION_TWO_DIVISOR_TASKS: readonly MultiSelectTask[] = [
  { title: "Dzielniki 12", prompt: "Zaznacz wszystkie dzielniki liczby 12.", values: [1, 2, 3, 4, 5, 6, 8, 12], correct: [1, 2, 3, 4, 6, 12], explanation: "Dzielniki 12 tworzą pary 1×12, 2×6 i 3×4." },
  { title: "Dzielniki 18", prompt: "Zaznacz wszystkie dzielniki liczby 18.", values: [1, 2, 3, 4, 6, 9, 10, 18], correct: [1, 2, 3, 6, 9, 18], explanation: "Pary dzielników to 1×18, 2×9 i 3×6." },
  { title: "Dzielniki 20", prompt: "Zaznacz wszystkie dzielniki liczby 20.", values: [1, 2, 4, 5, 6, 8, 10, 20], correct: [1, 2, 4, 5, 10, 20], explanation: "Pary dzielników to 1×20, 2×10 i 4×5." },
  { title: "Dzielniki 24", prompt: "Zaznacz wszystkie dzielniki liczby 24.", values: [1, 2, 3, 4, 6, 8, 12, 24], correct: [1, 2, 3, 4, 6, 8, 12, 24], explanation: "Każda z tych liczb dzieli 24 bez reszty." },
] as const;

export const SECTION_TWO_DIVISIBILITY_TASKS: readonly ChoiceTask[] = [
  { title: "Bramka 4", prompt: "Czy liczba przejdzie przez bramkę podzielności przez 4?", display: "1 236", choices: ["Tak", "Nie"], correct: "Tak", explanation: "Dwie ostatnie cyfry tworzą 36, a 36 dzieli się przez 4." },
  { title: "Bramka 9", prompt: "Czy liczba jest podzielna przez 9?", display: "7 425", choices: ["Tak", "Nie"], correct: "Tak", explanation: "Suma cyfr wynosi 18, czyli jest podzielna przez 9." },
  { title: "Bramka 5", prompt: "Czy liczba jest podzielna przez 5?", display: "8 432", choices: ["Tak", "Nie"], correct: "Nie", explanation: "Liczba podzielna przez 5 kończy się cyfrą 0 albo 5." },
  { title: "Bramka 100", prompt: "Czy liczba jest podzielna przez 100?", display: "45 600", choices: ["Tak", "Nie"], correct: "Tak", explanation: "Dwa zera na końcu oznaczają podzielność przez 100." },
] as const;

export const SECTION_TWO_PRIME_TASKS: readonly ChoiceTask[] = [
  { title: "Liczba 29", prompt: "Do której grupy należy ta liczba?", display: "29", choices: ["pierwsza", "złożona", "ani pierwsza, ani złożona"], correct: "pierwsza", explanation: "29 ma dokładnie dwa dzielniki: 1 i 29." },
  { title: "Liczba 51", prompt: "Do której grupy należy ta liczba?", display: "51", choices: ["pierwsza", "złożona", "ani pierwsza, ani złożona"], correct: "złożona", explanation: "51 = 3×17, więc ma więcej niż dwa dzielniki." },
  { title: "Liczba 1", prompt: "Do której grupy należy ta liczba?", display: "1", choices: ["pierwsza", "złożona", "ani pierwsza, ani złożona"], correct: "ani pierwsza, ani złożona", explanation: "1 ma tylko jeden dzielnik, dlatego nie jest pierwsza ani złożona." },
  { title: "Liczba 91", prompt: "Do której grupy należy ta liczba?", display: "91", choices: ["pierwsza", "złożona", "ani pierwsza, ani złożona"], correct: "złożona", explanation: "91 = 7×13, więc jest liczbą złożoną." },
] as const;

export const SECTION_TWO_FACTOR_TASKS: readonly ChoiceTask[] = [
  { title: "Rozkład 36", prompt: "Wybierz rozkład wyłącznie na czynniki pierwsze.", display: "36", choices: ["2×2×3×3", "4×9", "6×6", "2×18"], correct: "2×2×3×3", explanation: "Każdy czynnik w zapisie 2×2×3×3 jest liczbą pierwszą." },
  { title: "Rozkład 60", prompt: "Wybierz rozkład wyłącznie na czynniki pierwsze.", display: "60", choices: ["2×2×3×5", "6×10", "3×20", "2×30"], correct: "2×2×3×5", explanation: "2×2×3×5 = 60 i wszystkie czynniki są pierwsze." },
  { title: "Rozkład 84", prompt: "Wybierz poprawny rozkład na czynniki pierwsze.", display: "84", choices: ["2×2×3×7", "4×3×7", "2×6×7", "3×28"], correct: "2×2×3×7", explanation: "Po pełnym rozkładzie pozostają liczby 2, 2, 3 i 7." },
  { title: "Odbuduj 210", prompt: "Który iloczyn daje 210?", display: "210", choices: ["2×3×5×7", "2×3×5×5", "3×5×7×7", "2×5×7"], correct: "2×3×5×7", explanation: "2×3×5×7 = 210." },
] as const;

export const SECTION_TWO_GCD_LCM_TASKS: readonly ChoiceTask[] = [
  { title: "Jednakowe paczki", prompt: "48 batonów i 60 soków dzielimy na jak najwięcej jednakowych paczek. Wybierz działanie i wynik.", display: "48 i 60", choices: ["NWD = 12", "NWW = 240", "NWD = 6", "NWW = 120"], correct: "NWD = 12", explanation: "Przy największej liczbie jednakowych paczek stosujemy NWD(48,60)=12." },
  { title: "Wspólny odjazd", prompt: "Autobusy odjeżdżają co 8 i 12 minut. Po ilu minutach znów odjadą razem?", display: "co 8 min · co 12 min", choices: ["NWW = 24", "NWD = 4", "NWW = 96", "NWD = 2"], correct: "NWW = 24", explanation: "Szukamy pierwszej wspólnej chwili, więc stosujemy NWW(8,12)=24." },
  { title: "Największe zestawy", prompt: "30 czerwonych i 45 niebieskich elementów rozdzielamy na jednakowe zestawy. Ile zestawów?", display: "30 i 45", choices: ["NWD = 15", "NWW = 90", "NWD = 5", "NWW = 75"], correct: "NWD = 15", explanation: "Największa liczba jednakowych zestawów to NWD(30,45)=15." },
  { title: "Dwa sygnały", prompt: "Sygnały pojawiają się co 6 i 10 sekund. Kiedy znów pojawią się razem?", display: "co 6 s · co 10 s", choices: ["NWW = 30", "NWD = 2", "NWW = 60", "NWD = 5"], correct: "NWW = 30", explanation: "Pierwsza wspólna chwila to NWW(6,10)=30 sekund." },
] as const;

function seededShuffle<T>(items: readonly T[], seed: number) {
  const result = [...items];
  let state = Math.abs(seed) + 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = state * 48271 % 2_147_483_647;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function useReset(onResultChange: Props["onResultChange"]) {
  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
}

function Status({ correct, explanation }: { correct: boolean | null; explanation: string }) {
  if (correct === null) return null;
  return <p role="status" className={`mt-4 rounded-2xl p-4 text-center font-black ${correct ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"}`}>{correct ? explanation : "Sprawdź definicję lub regułę i spróbuj ponownie."}</p>;
}

function MultiSelectMission({ task, taskSeed, readOnly, onResultChange, kind }: { task: MultiSelectTask; taskSeed: number; readOnly: boolean; onResultChange: Props["onResultChange"]; kind: "multiple" | "divisor" }) {
  const values = useMemo(() => seededShuffle(task.values, taskSeed), [task.values, taskSeed]);
  const [selected, setSelected] = useState<number[]>([]);
  const [checked, setChecked] = useState<boolean | null>(null);
  useReset(onResultChange);
  const toggle = (value: number) => {
    setSelected((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    setChecked(null);
    onResultChange?.(null);
  };
  const check = () => {
    const answer = [...selected].sort((a, b) => a - b);
    const expected = [...task.correct].sort((a, b) => a - b);
    const correct = answer.length === expected.length && answer.every((value, index) => value === expected[index]);
    setChecked(correct);
    onResultChange?.(correct, answer.join(", "));
  };
  return <article className={`rounded-[2rem] p-5 shadow-2xl sm:p-8 ${kind === "multiple" ? "bg-gradient-to-br from-cyan-950 via-indigo-950 to-slate-950 text-white" : "bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-100 text-slate-950"}`}>
    <p className={`text-xs font-black uppercase tracking-[.18em] ${kind === "multiple" ? "text-cyan-200" : "text-amber-700"}`}>{task.title}</p>
    <h4 className="mt-2 text-3xl font-black">{task.prompt}</h4>
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{values.map((value) => <button key={value} type="button" disabled={readOnly} aria-pressed={selected.includes(value)} onClick={() => toggle(value)} className={`min-h-16 rounded-2xl border-4 text-2xl font-black ${selected.includes(value) ? "border-emerald-500 bg-emerald-300 text-emerald-950" : kind === "multiple" ? "border-white/25 bg-white/10 text-white" : "border-white bg-white"}`}>{value}</button>)}</div>
    <button type="button" disabled={readOnly || selected.length === 0} onClick={check} className={`mt-5 min-h-14 w-full rounded-2xl text-lg font-black disabled:opacity-30 ${kind === "multiple" ? "bg-cyan-300 text-cyan-950" : "bg-amber-500 text-white"}`}>Sprawdź zaznaczenie</button>
    <Status correct={checked} explanation={task.explanation} />
  </article>;
}

function ChoiceMission({ task, taskSeed, readOnly, onResultChange, station }: { task: ChoiceTask; taskSeed: number; readOnly: boolean; onResultChange: Props["onResultChange"]; station: number }) {
  const choices = useMemo(() => seededShuffle(task.choices, taskSeed), [task.choices, taskSeed]);
  const [selected, setSelected] = useState<string | null>(null);
  useReset(onResultChange);
  const correct = selected === null ? null : selected === task.correct;
  const palettes = ["from-violet-950 via-indigo-950 to-cyan-950", "from-emerald-950 via-teal-950 to-slate-950", "from-fuchsia-950 via-violet-950 to-indigo-950", "from-amber-950 via-orange-950 to-slate-950"];
  return <article className={`rounded-[2rem] bg-gradient-to-br ${palettes[(station - 3) % palettes.length]} p-5 text-white shadow-2xl sm:p-8`}>
    <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">{task.title}</p>
    <h4 className="mt-2 text-2xl font-black sm:text-3xl">{task.prompt}</h4>
    <div className="mt-5 rounded-3xl border-4 border-white/15 bg-black/25 p-5 text-center font-mono text-4xl font-black text-amber-200 sm:text-5xl">{task.display}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{choices.map((choice) => <button key={choice} type="button" disabled={readOnly} aria-pressed={selected === choice} onClick={() => { setSelected(choice); onResultChange?.(choice === task.correct, choice); }} className={`min-h-16 rounded-2xl border-2 p-4 text-left font-black ${selected === choice ? choice === task.correct ? "border-emerald-300 bg-emerald-300 text-emerald-950" : "border-rose-300 bg-rose-300 text-rose-950" : "border-white/20 bg-white/10"}`}>{choice}</button>)}</div>
    <Status correct={correct} explanation={task.explanation} />
  </article>;
}

const TITLES = ["Wielokrotności", "Dzielniki", "Cechy podzielności", "Liczby pierwsze i złożone", "Rozkład na czynniki pierwsze", "NWD czy NWW?"] as const;

export function SectionTwoReviewLessonModel({ seed = 1, taskSeed = 1, readOnly = false, questionNumber = 1, questionCount = 4, onResultChange }: Props) {
  const station = Math.min(6, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1) % 4;
  const stableSeed = taskSeed + station * 1009 + taskIndex * 97;
  const choiceCollections = [SECTION_TWO_DIVISIBILITY_TASKS, SECTION_TWO_PRIME_TASKS, SECTION_TWO_FACTOR_TASKS, SECTION_TWO_GCD_LCM_TASKS] as const;
  return <section data-section-two-review-station={station} className="rounded-[2.25rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-indigo-800 p-3 shadow-2xl sm:p-5">
    <header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white"><div><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Powtórzenie Działu II · Stacja {station}/6</p><h3 className="mt-1 text-2xl font-black sm:text-4xl">{TITLES[station - 1]}</h3></div><b className="rounded-2xl bg-white/20 px-4 py-2">Zadanie {questionNumber}/{questionCount}</b></header>
    {station === 1 ? <MultiSelectMission key={taskIndex} task={SECTION_TWO_MULTIPLE_TASKS[taskIndex]!} taskSeed={stableSeed} readOnly={readOnly} onResultChange={onResultChange} kind="multiple" /> : null}
    {station === 2 ? <MultiSelectMission key={taskIndex} task={SECTION_TWO_DIVISOR_TASKS[taskIndex]!} taskSeed={stableSeed} readOnly={readOnly} onResultChange={onResultChange} kind="divisor" /> : null}
    {station >= 3 ? <ChoiceMission key={taskIndex} task={choiceCollections[station - 3]![taskIndex]!} taskSeed={stableSeed} readOnly={readOnly} onResultChange={onResultChange} station={station} /> : null}
  </section>;
}
