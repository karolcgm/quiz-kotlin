"use client";

import { useEffect, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";

interface StoryProblem {
  title: string;
  text: string;
  question: string;
  data: readonly { label: string; needed: boolean }[];
  answer: number;
  answerPrefix: string;
  answerSuffix: string;
  mode: "guided" | "choose-data" | "two-step" | "independent";
  modelPlan: string;
}

export const STORY_PROBLEMS: readonly StoryProblem[] = [
  {
    title: "Pisaki do pracowni",
    text: "Do pracowni przywieziono 6 pudełek po 18 pisaków. Na biurku leżało jeszcze 12 pojedynczych pisaków. Ile pisaków jest teraz w pracowni?",
    question: "Szukamy łącznej liczby pisaków w pudełkach i na biurku.",
    data: [
      { label: "6 pudełek", needed: true },
      { label: "18 pisaków w każdym pudełku", needed: true },
      { label: "12 pojedynczych pisaków", needed: true },
    ],
    answer: 120,
    answerPrefix: "W pracowni jest razem ",
    answerSuffix: " pisaków.",
    mode: "guided",
    modelPlan: "6 × 18 = 108, następnie 108 + 12 = 120.",
  },
  {
    title: "Wolne miejsca w autobusie",
    text: "Autobus jadący na warsztaty ma 48 miejsc. Uczniowie zajęli 29 miejsc. Przejazd do muzeum potrwa 35 minut. Ile miejsc pozostało wolnych?",
    question: "Szukamy liczby wolnych miejsc w autobusie.",
    data: [
      { label: "48 wszystkich miejsc", needed: true },
      { label: "29 zajętych miejsc", needed: true },
      { label: "35 minut przejazdu", needed: false },
    ],
    answer: 19,
    answerPrefix: "W autobusie pozostało ",
    answerSuffix: " wolnych miejsc.",
    mode: "choose-data",
    modelPlan: "48 − 29 = 19. Czas przejazdu nie jest potrzebny do obliczenia liczby miejsc.",
  },
  {
    title: "Karty do gry Chrupka",
    text: "Chrupek przygotował 3 paczki po 24 karty oraz 17 pojedynczych kart. Ile kart przygotował łącznie?",
    question: "Szukamy łącznej liczby kart w paczkach i poza nimi.",
    data: [
      { label: "3 paczki", needed: true },
      { label: "24 karty w każdej paczce", needed: true },
      { label: "17 pojedynczych kart", needed: true },
    ],
    answer: 89,
    answerPrefix: "Chrupek przygotował razem ",
    answerSuffix: " kart.",
    mode: "two-step",
    modelPlan: "Najpierw 3 × 24 = 72, potem 72 + 17 = 89.",
  },
  {
    title: "Zakup książek",
    text: "Klasa kupiła 5 jednakowych książek po 18 zł. Zapłacono banknotem 100 zł. Ile złotych reszty otrzymała klasa?",
    question: "Szukamy reszty z 100 zł po zakupie pięciu książek.",
    data: [
      { label: "5 książek", needed: true },
      { label: "18 zł za książkę", needed: true },
      { label: "100 zł zapłaty", needed: true },
    ],
    answer: 10,
    answerPrefix: "Klasa otrzymała ",
    answerSuffix: " zł reszty.",
    mode: "independent",
    modelPlan: "5 × 18 = 90, następnie 100 − 90 = 10.",
  },
] as const;

function sameSelection(selected: Set<number>, problem: StoryProblem) {
  const expected = problem.data.map((item, index) => item.needed ? index : -1).filter((index) => index >= 0);
  return selected.size === expected.length && expected.every((index) => selected.has(index));
}

export function WrittenStoryProblemsLessonModel({ readOnly = false, seed = 1, onResultChange }: { readOnly?: boolean; seed?: number; onResultChange?: (correct: boolean | null, answer?: string) => void }) {
  const problem = STORY_PROBLEMS[Math.abs(seed - 1) % STORY_PROBLEMS.length]!;
  const [selectedData, setSelectedData] = useState<Set<number>>(() => new Set());
  const [calculation, setCalculation] = useState("");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => { onResultChange?.(null); return () => onResultChange?.(null); }, [onResultChange]);
  const reset = () => { setChecked(null); onResultChange?.(null); };
  const toggleData = (index: number) => {
    if (readOnly) return;
    const next = new Set(selectedData);
    if (next.has(index)) next.delete(index); else next.add(index);
    setSelectedData(next);
    reset();
  };
  const applyKey = (key: string) => {
    if (readOnly) return;
    reset();
    setAnswer((value) => key === "backspace" ? value.slice(0, -1) : `${value}${key}`);
  };
  const check = () => {
    const dataCorrect = problem.mode !== "choose-data" || sameSelection(selectedData, problem);
    const correct = dataCorrect && calculation.trim().length > 0 && Number(answer) === problem.answer;
    setChecked(correct);
    onResultChange?.(correct, `${calculation.trim()} | ${answer}`);
  };

  const showScaffolding = problem.mode !== "independent";
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black tracking-[.2em] text-cyan-200">LICZBY I DZIAŁANIA · ZADANIA TEKSTOWE</p>
      <h3 className="mt-1 text-3xl font-black sm:text-5xl">{problem.title}</h3>
      {problem.mode === "guided" ? <p className="mt-3 rounded-2xl bg-cyan-200/15 p-4 font-bold text-cyan-50">Pracuj po kolei: przeczytaj pytanie → wybierz dane → zaplanuj działania → oblicz → odpowiedz pełnym zdaniem.</p> : null}

      <article className="mt-6 rounded-3xl bg-white p-5 text-slate-950 shadow-xl sm:p-7">
        <p className="text-lg font-bold leading-relaxed sm:text-xl">{problem.text}</p>

        {showScaffolding ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Czego szukamy?</p>
              <p className="mt-2 font-bold leading-relaxed">{problem.question}</p>
            </section>
            <section className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Jakie dane są potrzebne?</p>
              {problem.mode === "choose-data" ? (
                <div className="mt-3 grid gap-2">
                  {problem.data.map((item, index) => <button key={item.label} type="button" aria-pressed={selectedData.has(index)} disabled={readOnly} onClick={() => toggleData(index)} className={`min-h-12 rounded-xl border-2 px-3 text-left font-bold ${selectedData.has(index) ? "border-emerald-700 bg-emerald-600 text-white" : "border-emerald-200 bg-white"}`}>{item.label}</button>)}
                </div>
              ) : (
                <ul className="mt-2 space-y-2">{problem.data.map((item) => <li key={item.label} className="rounded-xl bg-white px-3 py-2 font-bold">• {item.label}</li>)}</ul>
              )}
            </section>
          </div>
        ) : null}

        {problem.mode === "two-step" ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-950">Zaplanuj dwa działania. Wynik pierwszego działania będzie potrzebny w drugim.</p> : null}

        <label className="mt-6 block font-black">Obliczenia
          <textarea aria-label="Obliczenia do zadania tekstowego" disabled={readOnly} value={calculation} onChange={(event) => { setCalculation(event.target.value.slice(0, 240)); reset(); }} placeholder={problem.mode === "independent" ? "Zapisz swoje działania…" : "Tu zapisz plan i działania…"} className="mt-2 min-h-28 w-full resize-y rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-lg font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100" />
        </label>

        <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-800">Odpowiedź</p>
          <label className="mt-2 flex flex-wrap items-center gap-2 text-lg font-black">{problem.answerPrefix}<input aria-label="Wynik zadania tekstowego" inputMode="none" disabled={readOnly} value={answer} onChange={(event) => { setAnswer(event.target.value.replace(/\D/g, "")); reset(); }} className="min-h-14 w-28 rounded-xl border-2 border-cyan-400 bg-white px-3 text-center text-2xl font-black" />{problem.answerSuffix}</label>
          <div className="mx-auto mt-3 max-w-xl"><NumericLessonKeypad onKey={applyKey} disabled={readOnly} label="Klawiatura do wpisania wyniku" /></div>
        </div>

        <button type="button" disabled={readOnly || !calculation.trim() || !answer || (problem.mode === "choose-data" && selectedData.size === 0)} onClick={check} className="mt-5 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35">Sprawdź rozwiązanie</button>
        {checked !== null ? <div role="status" className={`mt-4 rounded-2xl p-4 ${checked ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}><p className="font-black">{checked ? "Rozwiązanie jest poprawne." : "Sprawdź potrzebne dane, zapis obliczeń i wynik."}</p>{checked && problem.mode === "two-step" ? <p className="mt-2 font-bold">Przykładowy plan: {problem.modelPlan}</p> : null}</div> : null}
      </article>
    </section>
  );
}
