"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { distinctIndex } from "@/lib/lessons/exampleSelection";

interface Props {
  seed: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

interface GridProps {
  a: number;
  b: number;
  subtract: boolean;
  readOnly?: boolean;
  operandsEditable?: boolean;
  onResultChange?: Props["onResultChange"];
}

const additions = [
  [468, 357],
  [782, 149],
  [596, 278],
  [834, 167],
  [429, 386],
  [675, 248],
  [907, 186],
  [543, 279],
  [728, 164],
  [856, 237],
] as const;

const subtractions = [
  [802, 457],
  [900, 368],
  [741, 286],
  [650, 179],
  [1000, 546],
  [934, 287],
  [815, 396],
  [702, 184],
  [963, 478],
  [880, 265],
] as const;

const WRITTEN_ADD_SUB_STORIES = {
  3: {
    a: 3486,
    b: 2759,
    subtract: false,
    story: {
      title: "Książki do szkolnej biblioteki",
      text: "W pierwszym semestrze biblioteka otrzymała 3486 nowych książek, a w drugim semestrze kolejne 2759 książek. Ile nowych książek otrzymała biblioteka w obu semestrach?",
      data: [
        "3486 książek w pierwszym semestrze",
        "2759 książek w drugim semestrze",
      ],
      answerPrefix: "Biblioteka otrzymała razem ",
      answerSuffix: " nowych książek.",
    },
  },
  4: {
    a: 7250,
    b: 3687,
    subtract: true,
    story: {
      title: "Materiały na warsztaty",
      text: "W magazynie pracowni było 7250 arkuszy kolorowego papieru. Podczas warsztatów wykorzystano 3687 arkuszy. Ile arkuszy pozostało w magazynie?",
      data: ["7250 arkuszy na początku", "3687 wykorzystanych arkuszy"],
      answerPrefix: "W magazynie pozostały ",
      answerSuffix: " arkusze papieru.",
    },
  },
} as const;

type ActiveCell = {
  row: "operandA" | "operandB" | "carry" | "result";
  column: number;
} | null;

function digitAt(value: number, column: number, columns: number) {
  return String(value).padStart(columns, " ")[column]!.trim();
}

export function writtenOperationColumnCount(
  a: number,
  b: number,
  result: number,
) {
  return Math.max(String(a).length, String(b).length, String(result).length);
}

export function WrittenAddSubGrid({
  a,
  b,
  subtract,
  readOnly = false,
  operandsEditable = false,
  onResultChange,
}: GridProps) {
  const expected = subtract ? a - b : a + b;
  const columns = writtenOperationColumnCount(a, b, expected);
  const [operandAValues, setOperandAValues] = useState<string[]>(() =>
    Array(columns).fill(""),
  );
  const [operandBValues, setOperandBValues] = useState<string[]>(() =>
    Array(columns).fill(""),
  );
  const [resultDigits, setResultDigits] = useState<string[]>(() =>
    Array(columns).fill(""),
  );
  const [carries, setCarries] = useState<string[]>(() =>
    Array(columns).fill(""),
  );
  const [active, setActive] = useState<ActiveCell>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const report = (nextA: string[], nextB: string[], nextResult: string[]) => {
    const operandsComplete =
      !operandsEditable || (nextA.every(Boolean) && nextB.every(Boolean));
    const resultComplete = nextResult.every(Boolean);
    const operandsCorrect =
      !operandsEditable ||
      (Number(nextA.join("")) === a && Number(nextB.join("")) === b);
    const resultCorrect = Number(nextResult.join("")) === expected;
    const answer = nextResult.some(Boolean)
      ? `${operandsEditable ? nextA.join("") : a} ${subtract ? "−" : "+"} ${operandsEditable ? nextB.join("") : b} = ${nextResult.join("")}`
      : undefined;
    onResultChange?.(
      operandsComplete && resultComplete
        ? operandsCorrect && resultCorrect
        : null,
      answer,
    );
  };

  const change = (digit: string) => {
    if (readOnly || !active) return;
    const replace = (values: string[], allowTwoDigits = false) => {
      const next = [...values];
      const current = next[active.column] ?? "";
      next[active.column] =
        digit === "backspace"
          ? current.slice(0, -1)
          : allowTwoDigits
            ? `${current}${digit}`.slice(-2)
            : digit;
      return next;
    };

    if (active.row === "operandA") {
      const next = replace(operandAValues);
      setOperandAValues(next);
      report(next, operandBValues, resultDigits);
    } else if (active.row === "operandB") {
      const next = replace(operandBValues);
      setOperandBValues(next);
      report(operandAValues, next, resultDigits);
    } else if (active.row === "result") {
      const next = replace(resultDigits);
      setResultDigits(next);
      report(operandAValues, operandBValues, next);
    } else {
      setCarries(replace(carries, subtract));
    }

    if (digit === "backspace") return;
    if (
      (active.row === "operandA" || active.row === "operandB") &&
      active.column < columns - 1
    ) {
      setActive({ ...active, column: active.column + 1 });
    } else if (
      (active.row === "result" || (active.row === "carry" && !subtract)) &&
      active.column > 0
    ) {
      setActive({ ...active, column: active.column - 1 });
    }
  };

  const cellClass = (
    row: "operandA" | "operandB" | "carry" | "result",
    column: number,
    small = false,
  ) =>
    `grid place-items-center rounded-lg border-2 font-mono font-black transition ${small ? "h-9 w-9 text-lg sm:h-11 sm:w-11 sm:text-xl" : "h-14 w-14 text-3xl sm:h-16 sm:w-16 sm:text-4xl"} ${active?.row === row && active.column === column ? "border-cyan-500 bg-cyan-100 text-cyan-950 ring-4 ring-cyan-300/50" : "border-slate-300 bg-white text-slate-950"}`;

  const operandRow = (
    row: "operandA" | "operandB",
    value: number,
    values: string[],
  ) =>
    Array.from({ length: columns }, (_, column) =>
      operandsEditable ? (
        <button
          type="button"
          key={`${row}-${column}`}
          aria-label={`${row === "operandA" ? "Pierwsza liczba" : "Druga liczba"}, cyfra ${column + 1}`}
          disabled={readOnly}
          onClick={() => setActive({ row, column })}
          className={cellClass(row, column)}
        >
          {values[column]}
        </button>
      ) : (
        <span
          key={`${row}-${column}`}
          className="grid h-14 w-14 place-items-center font-mono text-3xl font-black text-slate-950 sm:h-16 sm:w-16 sm:text-4xl"
        >
          {digitAt(value, column, columns)}
        </span>
      ),
    );

  const answer = resultDigits.join("");
  const operandsComplete =
    !operandsEditable ||
    (operandAValues.every(Boolean) && operandBValues.every(Boolean));
  const complete = operandsComplete && resultDigits.every(Boolean);
  const correct =
    complete &&
    (!operandsEditable ||
      (Number(operandAValues.join("")) === a &&
        Number(operandBValues.join("")) === b)) &&
    Number(answer) === expected;

  return (
    <div>
      <div className="mx-auto mt-7 w-fit max-w-full overflow-x-auto rounded-3xl bg-slate-100 p-4 shadow-xl sm:p-6">
        <div
          className="grid items-center gap-2"
          style={{
            gridTemplateColumns: `2rem 2rem repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          <span />
          <span />
          {Array.from({ length: columns }, (_, column) => (
            <button
              type="button"
              key={`carry-${column}`}
              aria-label={`Przeniesienie, kolumna ${column + 1}`}
              disabled={readOnly}
              onClick={() => setActive({ row: "carry", column })}
              className={`${cellClass("carry", column, true)} justify-self-center`}
            >
              {carries[column]}
            </button>
          ))}
          <span />
          <span />
          {operandRow("operandA", a, operandAValues)}
          <span />
          <span className="text-center text-3xl font-black text-slate-950">
            {subtract ? "−" : "+"}
          </span>
          {operandRow("operandB", b, operandBValues)}
          <span />
          <span />
          <span className="col-span-full mt-1 border-b-4 border-slate-900" />
          <span />
          <span />
          {Array.from({ length: columns }, (_, column) => (
            <button
              type="button"
              key={`result-${column}`}
              aria-label={`Wynik, kolumna ${column + 1}`}
              disabled={readOnly}
              onClick={() => setActive({ row: "result", column })}
              className={cellClass("result", column)}
            >
              {resultDigits[column]}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-sm">
        <p className="mb-3 text-center text-sm font-bold text-cyan-100">
          {active
            ? "Wpisz cyfrę do zaznaczonej kratki."
            : "Kliknij pustą kratkę, a następnie użyj klawiatury."}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {"123456789".split("").map((digit) => (
            <button
              type="button"
              key={digit}
              aria-label={digit}
              disabled={readOnly || !active}
              onClick={() => change(digit)}
              className="min-h-14 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-35"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            aria-label="0"
            disabled={readOnly || !active}
            onClick={() => change("0")}
            className="min-h-14 rounded-2xl bg-white text-2xl font-black text-slate-950 shadow disabled:opacity-35"
          >
            0
          </button>
          <button
            type="button"
            aria-label="Usuń cyfrę"
            disabled={readOnly || !active}
            onClick={() => change("backspace")}
            className="col-span-2 min-h-14 rounded-2xl bg-rose-300 text-xl font-black text-rose-950 disabled:opacity-35"
          >
            ← Usuń cyfrę
          </button>
        </div>
      </div>

      {complete ? (
        <p
          role="status"
          className={`mt-4 rounded-xl px-3 py-3 text-center font-black ${correct ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}
        >
          {correct
            ? "Liczby i wynik są wpisane poprawnie."
            : "Sprawdź wpisane liczby oraz wynik działania."}
        </p>
      ) : null}
    </div>
  );
}

export function WrittenAddSubLessonModel({
  seed,
  taskSeed = seed,
  readOnly = false,
  questionNumber,
  questionCount,
  onResultChange,
}: Props) {
  const storyTask =
    WRITTEN_ADD_SUB_STORIES[seed as keyof typeof WRITTEN_ADD_SUB_STORIES];
  const subtract = storyTask?.subtract ?? (Math.abs(seed) - 1) % 2 === 1;
  const pool = subtract ? subtractions : additions;
  const selectionSeed = questionNumber === undefined ? taskSeed : seed;
  const selected = useMemo(
    () => pool[distinctIndex(selectionSeed, questionNumber, pool.length)]!,
    [pool, selectionSeed, questionNumber],
  );
  const a = storyTask?.a ?? selected[0];
  const b = storyTask?.b ?? selected[1];
  const [storyResult, setStoryResult] = useState("");
  const reportResult = useCallback(
    (correct: boolean | null, answer?: string) => {
      if (storyTask) setStoryResult(answer?.split(" = ")[1] ?? "");
      onResultChange?.(correct, answer);
    },
    [onResultChange, storyTask],
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-indigo-700/20 to-violet-700/35" />
      <div className="relative">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black tracking-[.2em] text-cyan-200">
              LICZBY I DZIAŁANIA · TEMAT 6
            </p>
            <h3 className="mt-1 text-3xl font-black sm:text-5xl">
              {storyTask?.story.title ??
                (subtract ? "Odejmowanie pisemne" : "Dodawanie pisemne")}
            </h3>
            <p className="mt-2 text-cyan-50">
              {storyTask
                ? "Odczytaj dane, wpisz obie liczby do pustych kratek, wykonaj działanie pisemne i uzupełnij odpowiedź."
                : "Uzupełnij przeniesienia w małych kratkach, a wynik wpisz cyfra po cyfrze w dolnych kratkach."}
            </p>
          </div>
          {questionNumber && questionCount ? (
            <b className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm text-slate-950">
              Zadanie {questionNumber}/{questionCount}
            </b>
          ) : null}
        </header>

        {storyTask ? (
          <article className="mt-5 rounded-3xl bg-white p-5 text-slate-950 shadow-xl">
            <p className="text-lg font-bold leading-relaxed">
              {storyTask.story.text}
            </p>
            <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Dane
              </p>
              <ul className="mt-2 space-y-1 font-bold">
                {storyTask.story.data.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </article>
        ) : null}

        <WrittenAddSubGrid
          a={a}
          b={b}
          subtract={subtract}
          readOnly={readOnly}
          operandsEditable={Boolean(storyTask)}
          onResultChange={reportResult}
        />

        {storyTask ? (
          <div className="mt-5 rounded-2xl bg-cyan-50 p-4 text-lg font-black text-cyan-950">
            <p className="text-xs uppercase tracking-wide text-cyan-800">
              Odpowiedź
            </p>
            <p className="mt-2">
              {storyTask.story.answerPrefix}
              <span className="inline-block min-w-24 border-b-4 border-cyan-600 px-2 text-center text-2xl">
                {storyResult || " "}
              </span>
              {storyTask.story.answerSuffix}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
