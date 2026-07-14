"use client";

import { useCallback, useEffect, useState } from "react";
import { NumericLessonKeypad } from "@/components/lessons/models/NumericLessonKeypad";
import { WrittenAddSubGrid } from "@/components/lessons/models/WrittenAddSubLessonModel";

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
  writtenOperation?: { a: number; b: number; subtract: boolean };
}

export const STORY_PROBLEMS: readonly StoryProblem[] = [
  {
    title: "Nowe książki w bibliotece",
    text: "W pierwszym semestrze biblioteka otrzymała 3486 nowych książek, a w drugim semestrze kolejne 2759 książek. Ile nowych książek otrzymała biblioteka w obu semestrach?",
    question: "Szukamy łącznej liczby książek otrzymanych w dwóch semestrach.",
    data: [
      { label: "3486 książek w pierwszym semestrze", needed: true },
      { label: "2759 książek w drugim semestrze", needed: true },
    ],
    answer: 6245,
    answerPrefix: "Biblioteka otrzymała razem ",
    answerSuffix: " nowych książek.",
    mode: "guided",
    modelPlan: "3486 + 2759 = 6245.",
    writtenOperation: { a: 3486, b: 2759, subtract: false },
  },
  {
    title: "Bilety na wystawę",
    text: "Na wystawę przygotowano 7250 biletów. Do piątku sprzedano 3687 biletów. Zwiedzanie jednej grupy trwa 45 minut. Ile biletów pozostało?",
    question: "Szukamy liczby biletów, które nie zostały jeszcze sprzedane.",
    data: [
      { label: "7250 przygotowanych biletów", needed: true },
      { label: "3687 sprzedanych biletów", needed: true },
      { label: "45 minut zwiedzania", needed: false },
    ],
    answer: 3563,
    answerPrefix: "Pozostały ",
    answerSuffix: " bilety.",
    mode: "choose-data",
    modelPlan: "7250 − 3687 = 3563. Czas zwiedzania nie jest potrzebny.",
    writtenOperation: { a: 7250, b: 3687, subtract: true },
  },
  {
    title: "Karty do gry Chrupka",
    text: "Chrupek przygotował 8 paczek po 125 kart oraz 75 pojedynczych kart. Ile kart przygotował łącznie?",
    question: "Szukamy łącznej liczby kart w paczkach i poza nimi.",
    data: [
      { label: "8 paczek", needed: true },
      { label: "125 kart w każdej paczce", needed: true },
      { label: "75 pojedynczych kart", needed: true },
    ],
    answer: 1075,
    answerPrefix: "Chrupek przygotował razem ",
    answerSuffix: " kart.",
    mode: "two-step",
    modelPlan: "Najpierw 8 × 125 = 1000, potem 1000 + 75 = 1075.",
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
  const expected = problem.data
    .map((item, index) => (item.needed ? index : -1))
    .filter((index) => index >= 0);
  return (
    selected.size === expected.length &&
    expected.every((index) => selected.has(index))
  );
}

export function WrittenStoryProblemsLessonModel({
  readOnly = false,
  seed = 1,
  onResultChange,
}: {
  readOnly?: boolean;
  seed?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}) {
  const problem = STORY_PROBLEMS[Math.abs(seed - 1) % STORY_PROBLEMS.length]!;
  const [selectedData, setSelectedData] = useState<Set<number>>(
    () => new Set(),
  );
  const [calculation, setCalculation] = useState("");
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState<boolean | null>(null);
  const [writtenCorrect, setWrittenCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);
  const reset = () => {
    setChecked(null);
    onResultChange?.(null);
  };
  const toggleData = (index: number) => {
    if (readOnly) return;
    const next = new Set(selectedData);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedData(next);
    reset();
  };
  const applyKey = (key: string) => {
    if (readOnly) return;
    reset();
    setAnswer((value) =>
      key === "backspace" ? value.slice(0, -1) : `${value}${key}`,
    );
  };
  const handleWrittenResult = useCallback(
    (correct: boolean | null, writtenAnswer?: string) => {
      setWrittenCorrect(correct);
      setCalculation(writtenAnswer ?? "");
      setChecked(null);
      onResultChange?.(null);
    },
    [onResultChange],
  );
  const check = () => {
    const dataCorrect =
      problem.mode !== "choose-data" || sameSelection(selectedData, problem);
    const calculationCorrect = problem.writtenOperation
      ? writtenCorrect === true
      : calculation.trim().length > 0;
    const correct =
      dataCorrect && calculationCorrect && Number(answer) === problem.answer;
    setChecked(correct);
    onResultChange?.(correct, `${calculation.trim()} | ${answer}`);
  };

  const showScaffolding = problem.mode !== "independent";
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black tracking-[.2em] text-cyan-200">
        LICZBY I DZIAŁANIA · ZADANIA TEKSTOWE
      </p>
      <h3 className="mt-1 text-3xl font-black sm:text-5xl">{problem.title}</h3>
      {problem.mode === "guided" ? (
        <p className="mt-3 rounded-2xl bg-cyan-200/15 p-4 font-bold text-cyan-50">
          Pracuj po kolei: przeczytaj pytanie → wybierz dane → zaplanuj
          działania → oblicz → odpowiedz pełnym zdaniem.
        </p>
      ) : null}

      <article className="mt-6 rounded-3xl bg-white p-5 text-slate-950 shadow-xl sm:p-7">
        <p className="text-lg font-bold leading-relaxed sm:text-xl">
          {problem.text}
        </p>

        {showScaffolding ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl bg-indigo-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">
                Czego szukamy?
              </p>
              <p className="mt-2 font-bold leading-relaxed">
                {problem.question}
              </p>
            </section>
            <section className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Jakie dane są potrzebne?
              </p>
              {problem.mode === "choose-data" ? (
                <div className="mt-3 grid gap-2">
                  {problem.data.map((item, index) => (
                    <button
                      key={item.label}
                      type="button"
                      aria-pressed={selectedData.has(index)}
                      disabled={readOnly}
                      onClick={() => toggleData(index)}
                      className={`min-h-12 rounded-xl border-2 px-3 text-left font-bold ${selectedData.has(index) ? "border-emerald-700 bg-emerald-600 text-white" : "border-emerald-200 bg-white"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="mt-2 space-y-2">
                  {problem.data.map((item) => (
                    <li
                      key={item.label}
                      className="rounded-xl bg-white px-3 py-2 font-bold"
                    >
                      • {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ) : null}

        {problem.mode === "two-step" ? (
          <p className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-950">
            Zaplanuj dwa działania. Wynik pierwszego działania będzie potrzebny
            w drugim.
          </p>
        ) : null}

        {problem.writtenOperation ? (
          <section className="mt-6 rounded-3xl bg-slate-950 p-4 text-white">
            <p className="text-sm font-black uppercase tracking-wide text-cyan-200">
              Obliczenia pisemne — uzupełnij kratki
            </p>
            <WrittenAddSubGrid
              {...problem.writtenOperation}
              readOnly={readOnly}
              onResultChange={handleWrittenResult}
            />
          </section>
        ) : (
          <label className="mt-6 block font-black">
            Obliczenia
            <textarea
              aria-label="Obliczenia do zadania tekstowego"
              disabled={readOnly}
              value={calculation}
              onChange={(event) => {
                setCalculation(event.target.value.slice(0, 240));
                reset();
              }}
              placeholder={
                problem.mode === "independent"
                  ? "Zapisz swoje działania…"
                  : "Tu zapisz plan i działania…"
              }
              className="mt-2 min-h-28 w-full resize-y rounded-2xl border-2 border-slate-300 bg-slate-50 p-4 text-lg font-bold outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
            />
          </label>
        )}

        <div className="mt-5 rounded-2xl bg-cyan-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-800">
            Odpowiedź
          </p>
          <label className="mt-2 flex flex-wrap items-center gap-2 text-lg font-black">
            {problem.answerPrefix}
            <input
              aria-label="Wynik zadania tekstowego"
              inputMode="none"
              disabled={readOnly}
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value.replace(/\D/g, ""));
                reset();
              }}
              className="min-h-14 w-28 rounded-xl border-2 border-cyan-400 bg-white px-3 text-center text-2xl font-black"
            />
            {problem.answerSuffix}
          </label>
          <div className="mx-auto mt-3 max-w-xl">
            <NumericLessonKeypad
              onKey={applyKey}
              disabled={readOnly}
              label="Klawiatura do wpisania wyniku"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={
            readOnly ||
            (problem.writtenOperation
              ? writtenCorrect === null
              : !calculation.trim()) ||
            !answer ||
            (problem.mode === "choose-data" && selectedData.size === 0)
          }
          onClick={check}
          className="mt-5 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35"
        >
          Sprawdź rozwiązanie
        </button>
        {checked !== null ? (
          <div
            role="status"
            className={`mt-4 rounded-2xl p-4 ${checked ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`}
          >
            <p className="font-black">
              {checked
                ? "Rozwiązanie jest poprawne."
                : "Sprawdź potrzebne dane, zapis obliczeń i wynik."}
            </p>
            {checked && problem.mode === "two-step" ? (
              <p className="mt-2 font-bold">
                Przykładowy plan: {problem.modelPlan}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>
    </section>
  );
}
