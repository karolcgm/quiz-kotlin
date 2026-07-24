"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type DecimalMentalActivity = "intro" | "add-sub" | "multiply-power" | "divide-shift" | "powers" | "power-order" | "powers-cipher" | "story";
interface Props { activity: DecimalMentalActivity; seed: number; taskSeed?: number; readOnly?: boolean; questionNumber?: number; questionCount?: number; onResultChange?: (correct: boolean | null, answer?: string) => void; }
type Task = { expression: string; answer: string; hint: string; story?: string; fraction?: boolean };

const TASKS: Record<Exclude<DecimalMentalActivity, "intro">, Task[]> = {
  "add-sub": [
    { expression: "3,75 + 0,25", answer: "4", hint: "Dopełnij 0,75 do pełnej liczby." },
    { expression: "12,4 − 0,4", answer: "12", hint: "Odejmujesz cztery dziesiąte." },
    { expression: "5,6 + 2,4", answer: "8", hint: "Połącz części dziesiąte, aby otrzymać całość." },
    { expression: "10 − 3,75", answer: "6,25", hint: "Od pełnej liczby odejmij najpierw 3, a potem 0,75." },
    { expression: "18,05 − 0,05", answer: "18", hint: "Setne części się znoszą." },
    { expression: "7,25 + 1,75", answer: "9", hint: "Części setne tworzą jedną całość." },
  ],
  "multiply-power": [
    { expression: "0,6²", answer: "0,36", hint: "Potęga druga oznacza 0,6 · 0,6." },
    { expression: "0,07²", answer: "0,0049", hint: "Pomnóż 7 · 7 i ustaw cztery miejsca po przecinku." },
    { expression: "2,5 · 0,4", answer: "1", hint: "Cztery dziesiąte z 2,5 to jedna całość." },
    { expression: "1,2 · 0,5", answer: "0,6", hint: "Mnożenie przez 0,5 oznacza połowę." },
    { expression: "0,25 · 4", answer: "1", hint: "Cztery ćwiartki tworzą całość." },
    { expression: "0,8²", answer: "0,64", hint: "Osiem dziesiątych razy osiem dziesiątych." },
  ],
  powers: [
    { expression: "4³", answer: "64", hint: "4³ to 4 · 4 · 4 — liczba 4 występuje trzy razy." },
    { expression: "2⁴", answer: "16", hint: "2⁴ to 2 · 2 · 2 · 2." },
    { expression: "5³", answer: "125", hint: "Najpierw 5 · 5 = 25, potem 25 · 5." },
    { expression: "10⁶", answer: "1000000", hint: "Jedynka i sześć zer." },
    { expression: "0,5²", answer: "0,25", hint: "0,5 · 0,5 to jedna czwarta." },
    { expression: "0,2³", answer: "0,008", hint: "Dwie dziesiąte pomnóż trzy razy przez siebie." },
    { expression: "7²", answer: "49", hint: "Kwadrat liczby 7 to 7 · 7." },
    { expression: "9⁰", answer: "1", hint: "Każda liczba różna od zera podniesiona do potęgi zerowej daje 1." },
  ],
  "power-order": [
    { expression: "3² + 4²", answer: "25", hint: "Najpierw oblicz obie potęgi, a dopiero potem dodaj wyniki." },
    { expression: "2 · (5² − 21)", answer: "8", hint: "Najpierw nawias: potęga, potem odejmowanie. Na końcu pomnóż przez 2." },
    { expression: "(18 : 3)²", answer: "36", hint: "Najpierw wykonaj działanie w nawiasie, a otrzymany wynik podnieś do potęgi drugiej." },
    { expression: "2³ + 3 · 4", answer: "20", hint: "Potęga i mnożenie są przed dodawaniem." },
    { expression: "(12 − 2³) · 3", answer: "12", hint: "W nawiasie najpierw potęga, później odejmowanie; na końcu mnożenie." },
    { expression: "2⁴ : 4 + 7", answer: "11", hint: "Najpierw potęga, potem dzielenie, na końcu dodawanie." },
  ],
  "divide-shift": [
    { expression: "0,6 : 0,04", answer: "15", hint: "Pomnóż obie liczby przez 100: 60 : 4." , fraction: true },
    { expression: "4,8 : 0,6", answer: "8", hint: "Pomnóż obie liczby przez 10: 48 : 6.", fraction: true },
    { expression: "3,6 · 100", answer: "360", hint: "Przesuń przecinek o dwa miejsca w prawo." },
    { expression: "560 : 1000", answer: "0,56", hint: "Przesuń przecinek o trzy miejsca w lewo." },
    { expression: "7,2 : 10", answer: "0,72", hint: "Przesuń przecinek o jedno miejsce w lewo." },
    { expression: "0,45 · 1000", answer: "450", hint: "Przesuń przecinek o trzy miejsca w prawo." },
  ],
  "powers-cipher": [],
  story: [
    { expression: "", answer: "7,5", hint: "Najpierw oblicz cenę sześciu jednakowych soków.", story: "🥤 Sześć soków po 1,25 zł. Ile złotych trzeba zapłacić?" },
    { expression: "", answer: "0,75", hint: "Podziel długość wstążki przez cztery równe części.", story: "🎀 Wstążkę długości 3 m podzielono na 4 równe części. Ile metrów ma jedna część?" },
    { expression: "", answer: "2,4", hint: "Wykonaj odejmowanie: całość minus wykorzystana część.", story: "🧃 W dzbanku było 5 l lemoniady. Wypito 2,6 l. Ile litrów zostało?" },
    { expression: "", answer: "15", hint: "Podziel 4,5 l na porcje po 0,3 l.", story: "🍓 Z 4,5 l koktajlu nalewamy porcje po 0,3 l. Ile porcji otrzymamy?" },
  ],
};

const normalized = (value: string) => value.replace(".", ",").replace(/,0+$/u, "").replace(/(,\d*?)0+$/u, "$1");
function FractionDivision({ expression }: { expression: string }) { const [top, bottom] = expression.split(" : "); return <span className="inline-flex flex-col align-middle leading-none"><span className="border-b-2 border-current px-2 pb-1">{top}</span><span className="px-2 pt-1">{bottom}</span></span>; }

function DecimalLessonKeypad({ onKey, disabled }: { onKey: (key: string) => void; disabled: boolean }) {
  return <section aria-label="Kalkulator do rachunków pamięciowych" className="rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-3"><p className="mb-3 text-center text-xs font-black uppercase tracking-[.14em] text-indigo-800">Kalkulator do rachunków pamięciowych</p><div className="mx-auto grid max-w-md grid-cols-4 gap-2">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "separator", "0", "backspace"].map((key) => <button key={key} type="button" disabled={disabled} onClick={() => onKey(key)} className={`min-h-12 rounded-xl border-2 font-black disabled:opacity-35 ${key === "backspace" ? "border-rose-200 bg-rose-100 text-rose-950" : key === "separator" ? "border-cyan-200 bg-cyan-100 text-cyan-950" : "border-indigo-200 bg-white text-indigo-950"}`}>{key === "backspace" ? "← Usuń" : key === "separator" ? "," : key}</button>)}</div></section>;
}

function DecimalMentalIntro() {
  return <LessonTaskFrame eyebrow="Dział 1 · Ułamki dziesiętne" heading="Jak liczyć w pamięci?" description="Najpierw wybierz wygodny sposób: dopełnianie do całości, połówkę lub przesunięcie przecinka." contentClassName="space-y-4">
    <section className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-emerald-950"><h3 className="font-black">Dodawanie i odejmowanie</h3><p className="mt-2 text-lg font-black">3,75 + 0,25 = 4</p><p className="mt-2 text-sm font-semibold">Łącz części, które tworzą pełną całość.</p></div>
      <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-amber-950"><h3 className="font-black">Mnożenie przez 0,5 i 0,25</h3><p className="mt-2 text-lg font-black">1,2 · 0,5 = 0,6</p><p className="mt-2 text-sm font-semibold">Mnożenie przez 0,5 oznacza znalezienie połowy liczby.</p></div>
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-sky-950"><h3 className="font-black">Mnożenie i dzielenie przez 10, 100, 1000</h3><p className="mt-2 text-lg font-black">3,6 · 100 = 360</p><p className="mt-2 text-sm font-semibold">Przy mnożeniu przecinek przesuwa się w prawo, przy dzieleniu — w lewo.</p></div>
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-violet-950"><h3 className="font-black">Dzielenie przez ułamek dziesiętny</h3><p className="mt-2 text-lg font-black">0,6 : 0,04 = 60 : 4 = 15</p><p className="mt-2 text-sm font-semibold">Przesuń przecinek w obu liczbach o tyle samo miejsc, aż dzielnik będzie liczbą naturalną.</p></div>
    </section>
    <p className="rounded-2xl bg-indigo-50 p-4 text-center font-black text-indigo-950">W kolejnych kartach wybierasz strategię samodzielnie, a pod działaniem dostaniesz krótką podpowiedź.</p>
  </LessonTaskFrame>;
}

const POWER_CIPHER = [
  { expression: "2²", value: 4, letter: "P" },
  { expression: "2³", value: 8, letter: "O" },
  { expression: "3²", value: 9, letter: "T" },
  { expression: "4²", value: 16, letter: "Ę" },
  { expression: "5²", value: 25, letter: "G" },
  { expression: "6²", value: 36, letter: "A" },
] as const;

const POWER_CIPHER_KEY = [
  { value: 25, letter: "G" }, { value: 4, letter: "P" }, { value: 36, letter: "A" },
  { value: 9, letter: "T" }, { value: 16, letter: "Ę" }, { value: 8, letter: "O" },
] as const;

function PowerCipher({ readOnly = false, onResultChange, questionNumber, questionCount }: Pick<Props, "readOnly" | "onResultChange" | "questionNumber" | "questionCount">) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const expected = POWER_CIPHER.map((item) => item.letter).join("");
  const correct = answer === expected;
  useEffect(() => { setAnswer(""); setChecked(false); onResultChange?.(null); }, [questionNumber]);
  useEffect(() => { onResultChange?.(checked && answer ? correct : null, answer); }, [answer, checked, correct, onResultChange]);
  const addLetter = (letter: string) => { setChecked(false); setAnswer((current) => current.length < POWER_CIPHER.length ? `${current}${letter}` : current); };
  const letterKeys = ["G", "P", "A", "T", "Ę", "O"];
  return <LessonTaskFrame eyebrow="Dział 1 · Liczby i działania" heading="Szyfr potęg" description="Oblicz każdą potęgę, odczytaj literę z klucza i dopiero wtedy wpisz ukryte hasło." questionNumber={questionNumber} questionCount={questionCount} className="space-y-5" contentClassName="space-y-5">
    <div className="mx-auto max-w-md overflow-hidden rounded-3xl border-2 border-violet-200 bg-amber-50"><Image src="/lessons/illustrations/powers/cipher-chest.png" alt="Zamknięta skrzynia szyfru" width={1536} height={1024} sizes="(min-width: 640px) 448px, 100vw" className="h-auto w-full" priority /></div>
    <section className="rounded-3xl border-2 border-indigo-100 bg-indigo-50 p-4"><p className="text-center text-sm font-black uppercase tracking-[.14em] text-indigo-800">Klucz szyfru: wynik → litera</p><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{POWER_CIPHER_KEY.map((item) => <div key={item.value} className="rounded-xl bg-white p-2 text-center font-black text-indigo-950 shadow-sm"><span>{item.value}</span><span className="mx-1 text-indigo-400">→</span><span>{item.letter}</span></div>)}</div></section>
    <section className="rounded-3xl bg-amber-50 p-5 text-slate-950"><p className="text-center font-bold text-amber-900">Oblicz i odczytaj kolejne litery:</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{POWER_CIPHER.map((item, index) => <div key={item.expression} className="rounded-2xl border-2 border-amber-200 bg-white p-3 text-center"><p className="text-2xl font-black">{index + 1}. {item.expression} = ?</p></div>)}</div></section>
    <section className="rounded-3xl border-2 border-indigo-100 bg-white p-4"><p className="text-sm font-bold text-slate-700">Hasło</p><input value={answer} readOnly inputMode="none" aria-label="Hasło z potęg" className="mt-2 h-14 w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 text-center text-2xl font-black tracking-[.3em] text-indigo-950" />
      {!readOnly ? <><div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{letterKeys.map((letter) => <button key={letter} type="button" onClick={() => addLetter(letter)} className="min-h-12 rounded-xl border-2 border-indigo-200 bg-white text-xl font-black text-indigo-950">{letter}</button>)}</div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setAnswer(""); setChecked(false); }} className="min-h-12 rounded-xl border-2 border-rose-200 bg-rose-50 font-black text-rose-950">← Usuń hasło</button><button type="button" disabled={!answer} onClick={() => setChecked(true)} className="min-h-12 rounded-xl bg-indigo-700 font-black text-white disabled:opacity-35">Zatwierdź</button></div></> : null}
      {checked ? <p role="status" className={`mt-3 rounded-xl p-3 text-center font-bold ${correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{correct ? "Dobrze! Szyfr został odszyfrowany." : "Sprawdź obliczenia i kolejność liter w haśle."}</p> : null}
    </section>
  </LessonTaskFrame>;
}

export function DecimalMentalArithmeticModel({ activity, seed, taskSeed, readOnly = false, questionNumber, questionCount, onResultChange }: Props) {
  if (activity === "intro") return <DecimalMentalIntro />;
  if (activity === "powers-cipher") return <PowerCipher readOnly={readOnly} onResultChange={onResultChange} questionNumber={questionNumber} questionCount={questionCount} />;
  const task = useMemo(() => {
    const index = questionNumber ? questionNumber - 1 : (taskSeed ?? seed);
    return TASKS[activity][index % TASKS[activity].length]!;
  }, [activity, questionNumber, seed, taskSeed]);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = normalized(answer) === task.answer;
  useEffect(() => { setAnswer(""); setChecked(false); }, [task]);
  useEffect(() => { onResultChange?.(checked && answer ? correct : null, answer); }, [answer, checked, correct, onResultChange]);
  const onKey = (key: string) => { setChecked(false); setAnswer((current) => key === "backspace" ? current.slice(0, -1) : key === "separator" ? (current.includes(",") ? current : `${current},`) : `${current}${key}`.slice(0, 8)); };
  return <LessonTaskFrame eyebrow="Dział 1 · Ułamki dziesiętne" heading={activity === "add-sub" ? "Dodawanie i odejmowanie w pamięci" : activity === "multiply-power" ? "Mnożenie i potęgowanie w pamięci" : activity === "divide-shift" ? "Dzielenie i przesuwanie przecinka" : activity === "powers" ? "Potęgowanie liczb" : activity === "power-order" ? "Kolejność działań z potęgami" : "Zadania tekstowe"} description={task.hint} questionNumber={questionNumber} questionCount={questionCount} className="space-y-5" contentClassName="space-y-5">
    {task.story ? <div className="rounded-3xl bg-amber-50 p-6 text-center text-xl font-black text-amber-950 sm:text-2xl">{task.story}</div> : <div className="rounded-3xl bg-indigo-50 p-7 text-center text-4xl font-black text-indigo-950 sm:text-6xl">{task.fraction ? <FractionDivision expression={task.expression} /> : task.expression} = □</div>}
    <div className="rounded-2xl border-2 border-indigo-100 bg-white p-4"><p className="text-sm font-bold text-slate-700">Wynik</p><input value={answer} readOnly inputMode="none" aria-label="Wynik działania" className="mt-2 h-14 w-full rounded-xl border-2 border-indigo-200 bg-slate-50 px-4 text-center text-2xl font-black text-indigo-950" />{!readOnly ? <div className="mt-3"><DecimalLessonKeypad onKey={onKey} disabled={readOnly} /><button type="button" disabled={!answer} onClick={() => setChecked(true)} className="mt-3 min-h-12 w-full rounded-xl bg-indigo-700 px-4 font-black text-white disabled:opacity-35">Zatwierdź</button></div> : null}{checked ? <p role="status" className={`mt-3 rounded-xl p-3 text-center font-bold ${correct ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}>{correct ? "Dobrze." : "Sprawdź wynik i przejdź dalej bez punktu albo popraw odpowiedź."}</p> : null}</div>
  </LessonTaskFrame>;
}

export function decimalMentalActivityFromStageId(stageId: string): DecimalMentalActivity { if (stageId.includes("decimal-rules")) return "intro"; if (stageId.includes("power-cipher")) return "powers-cipher"; if (stageId.includes("power-order")) return "power-order"; if (stageId.includes("multiply-power")) return "multiply-power"; if (stageId.includes("divide-shift")) return "divide-shift"; if (stageId.includes("power-")) return "powers"; if (stageId.includes("story")) return "story"; return "add-sub"; }
