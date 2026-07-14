"use client";

import { useEffect, useState } from "react";

interface Props {
  seed?: number;
  taskSeed?: number;
  readOnly?: boolean;
  questionNumber?: number;
  questionCount?: number;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

export const PRIME_SCATTER_NUMBERS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 21, 23, 25, 29,
] as const;

export function isPrime(value: number) {
  if (!Number.isInteger(value) || value < 2) return false;
  for (let divisor = 2; divisor * divisor <= value; divisor += 1) {
    if (value % divisor === 0) return false;
  }
  return true;
}

export function isComposite(value: number) {
  return Number.isInteger(value) && value > 1 && !isPrime(value);
}

const DEFINITION_TASKS = [
  {
    prompt: "Liczba pierwsza to…",
    answers: [
      "liczba naturalna większa od 1, która ma dokładnie dwa dzielniki: 1 i samą siebie",
      "każda liczba nieparzysta",
      "liczba, która ma więcej niż dwa dzielniki",
      "liczba podzielna przez 2",
    ],
    explanation:
      "Liczby pierwsze mają dokładnie dwa dzielniki, na przykład 7 ma dzielniki 1 i 7.",
  },
  {
    prompt: "Liczba złożona to…",
    answers: [
      "liczba naturalna większa od 1, która ma więcej niż dwa dzielniki",
      "liczba mająca tylko dzielniki 1 i samą siebie",
      "każda liczba parzysta",
      "liczba, której nie można rozłożyć na czynniki",
    ],
    explanation:
      "Liczbę złożoną można przedstawić jako iloczyn mniejszych liczb naturalnych, na przykład 12 = 3 × 4.",
  },
  {
    prompt: "Które zdanie o liczbach 0 i 1 jest prawdziwe?",
    answers: [
      "0 i 1 nie są ani liczbami pierwszymi, ani złożonymi",
      "0 jest złożona, a 1 jest pierwsza",
      "0 i 1 są liczbami pierwszymi",
      "0 i 1 są liczbami złożonymi",
    ],
    explanation:
      "Liczba 1 ma tylko jeden dzielnik, a liczba 0 ma nieskończenie wiele dzielników niezerowych. Żadna nie spełnia definicji liczby pierwszej ani złożonej.",
  },
] as const;

export interface PrimeCipherTile {
  number: number;
  letter: string;
}

export interface PrimeCipherTask {
  selection: "prime" | "composite";
  instruction: string;
  revealMode: "selected" | "remaining";
  revealedText: string;
  tiles: readonly PrimeCipherTile[];
}

export const PRIME_CIPHER_TASKS: readonly PrimeCipherTask[] = [
  {
    selection: "composite",
    instruction: "Zaznacz wszystkie liczby złożone i wykreśl je z szyfru.",
    revealMode: "remaining",
    revealedText: "EUKLIDES",
    tiles: [
      { number: 2, letter: "E" },
      { number: 12, letter: "A" },
      { number: 15, letter: "R" },
      { number: 3, letter: "U" },
      { number: 21, letter: "O" },
      { number: 5, letter: "K" },
      { number: 25, letter: "M" },
      { number: 7, letter: "L" },
      { number: 27, letter: "N" },
      { number: 11, letter: "I" },
      { number: 35, letter: "T" },
      { number: 13, letter: "D" },
      { number: 39, letter: "Y" },
      { number: 17, letter: "E" },
      { number: 49, letter: "P" },
      { number: 19, letter: "S" },
    ],
  },
  {
    selection: "prime",
    instruction: "Zaznacz wszystkie liczby pierwsze. Odczytaj litery tylko z wybranych pól.",
    revealMode: "selected",
    revealedText: "Z ALEKSANDRII",
    tiles: [
      { number: 23, letter: "Z" },
      { number: 4, letter: "X" },
      { number: 29, letter: "A" },
      { number: 6, letter: "B" },
      { number: 31, letter: "L" },
      { number: 8, letter: "C" },
      { number: 37, letter: "E" },
      { number: 9, letter: "F" },
      { number: 41, letter: "K" },
      { number: 10, letter: "G" },
      { number: 43, letter: "S" },
      { number: 14, letter: "H" },
      { number: 47, letter: "A" },
      { number: 16, letter: "J" },
      { number: 53, letter: "N" },
      { number: 18, letter: "M" },
      { number: 59, letter: "D" },
      { number: 20, letter: "O" },
      { number: 61, letter: "R" },
      { number: 22, letter: "P" },
      { number: 67, letter: "I" },
      { number: 24, letter: "T" },
      { number: 71, letter: "I" },
      { number: 26, letter: "W" },
    ],
  },
] as const;

function DefinitionTask({
  taskIndex,
  readOnly,
  onResultChange,
}: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = DEFINITION_TASKS[taskIndex % DEFINITION_TASKS.length]!;
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-violet-200">Poznaj pojęcia</p>
      <h4 className="mt-2 text-2xl font-black sm:text-4xl">{task.prompt}</h4>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {task.answers.map((answer, index) => (
          <button
            key={answer}
            type="button"
            disabled={readOnly}
            onClick={() => {
              setSelected(index);
              onResultChange?.(index === 0, answer);
            }}
            className={`min-h-24 rounded-2xl border-2 p-4 text-left font-bold leading-relaxed ${
              selected === index
                ? index === 0
                  ? "border-emerald-200 bg-emerald-300 text-emerald-950"
                  : "border-rose-200 bg-rose-300 text-rose-950"
                : "border-white/20 bg-white/10"
            }`}
          >
            {answer}
          </button>
        ))}
      </div>
      {selected !== null ? (
        <p
          role="status"
          className={`mt-5 rounded-2xl p-4 font-bold ${
            selected === 0 ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"
          }`}
        >
          {selected === 0
            ? task.explanation
            : "To nie jest poprawna definicja. Przeczytaj wszystkie odpowiedzi i spróbuj ponownie."}
        </p>
      ) : null}
    </article>
  );
}

function ScatterTask({
  taskIndex,
  readOnly,
  onResultChange,
}: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const selectingPrimes = taskIndex % 2 === 0;
  const expected = PRIME_SCATTER_NUMBERS.filter((value) =>
    selectingPrimes ? isPrime(value) : isComposite(value),
  );
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const toggle = (value: number) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelected(next);
    setChecked(null);
    onResultChange?.(null);
  };

  const check = () => {
    const correct = selected.size === expected.length && expected.every((value) => selected.has(value));
    setChecked(correct);
    onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", "));
  };

  return (
    <article className="rounded-[2rem] bg-gradient-to-br from-cyan-950 via-indigo-950 to-violet-950 p-5 text-white shadow-2xl sm:p-8">
      <p className="text-sm font-bold text-cyan-200">Pamiętaj: 0 i 1 nie należą do żadnej z tych dwóch grup.</p>
      <h4 className="mt-2 text-3xl font-black">
        Zaznacz wszystkie liczby {selectingPrimes ? "pierwsze" : "złożone"}
      </h4>
      <div className="mt-7 grid grid-cols-4 gap-4 sm:grid-cols-5">
        {PRIME_SCATTER_NUMBERS.map((value, index) => (
          <button
            key={value}
            type="button"
            aria-pressed={selected.has(value)}
            disabled={readOnly}
            onClick={() => toggle(value)}
            style={{ transform: `rotate(${[-4, 3, -2, 5, 1][index % 5]}deg)` }}
            className={`min-h-16 rounded-2xl border-4 text-xl font-black shadow-lg transition hover:rotate-0 ${
              selected.has(value)
                ? "border-amber-200 bg-amber-300 text-slate-950"
                : "border-white/40 bg-white/10"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={readOnly}
        onClick={check}
        className="mt-7 min-h-14 w-full rounded-2xl bg-cyan-300 px-5 text-lg font-black text-slate-950 disabled:opacity-35"
      >
        Sprawdź rozsypankę
      </button>
      {checked !== null ? (
        <p
          role="status"
          className={`mt-4 rounded-2xl p-4 text-center font-black ${
            checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"
          }`}
        >
          {checked
            ? `Poprawnie znaleziono wszystkie liczby ${selectingPrimes ? "pierwsze" : "złożone"}.`
            : "W zestawie brakuje liczby albo zaznaczono liczbę z niewłaściwej grupy."}
        </p>
      ) : null}
    </article>
  );
}

function PrimeCipherTask({
  taskIndex,
  readOnly,
  onResultChange,
}: { taskIndex: number } & Pick<Props, "readOnly" | "onResultChange">) {
  const task = PRIME_CIPHER_TASKS[taskIndex % PRIME_CIPHER_TASKS.length]!;
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [checked, setChecked] = useState<boolean | null>(null);

  useEffect(() => {
    onResultChange?.(null);
    return () => onResultChange?.(null);
  }, [onResultChange]);

  const isExpected = (value: number) =>
    task.selection === "prime" ? isPrime(value) : isComposite(value);

  const toggle = (value: number) => {
    const next = new Set(selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setSelected(next);
    setChecked(null);
    onResultChange?.(null);
  };

  const check = () => {
    const expected = task.tiles.filter((tile) => isExpected(tile.number)).map((tile) => tile.number);
    const correct = selected.size === expected.length && expected.every((value) => selected.has(value));
    setChecked(correct);
    onResultChange?.(correct, [...selected].sort((a, b) => a - b).join(", "));
  };

  return (
    <article className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-amber-100 via-orange-50 to-cyan-100 p-5 text-slate-950 shadow-2xl sm:p-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-700">Szyfr liczb</p>
          <h4 className="mt-2 text-3xl font-black sm:text-4xl">Odkryj matematyka</h4>
          <p className="mt-3 max-w-4xl text-lg font-bold leading-relaxed">{task.instruction}</p>
        </div>
        <aside className="rounded-3xl border-2 border-indigo-200 bg-white/85 p-4 shadow-lg">
          <p className="text-sm font-black uppercase tracking-wide text-indigo-700">Jak to działa?</p>
          <p className="mt-2 leading-relaxed">
            Liczba jest u góry, a przypisana jej litera na dole. Wybierz cały właściwy zestaw, a potem
            naciśnij „Sprawdź szyfr”.
          </p>
        </aside>
      </div>

      <div className="mt-7 grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-8">
        {task.tiles.map((tile) => {
          const active = selected.has(tile.number);
          return (
            <button
              key={tile.number}
              type="button"
              aria-label={`Liczba ${tile.number}, litera ${tile.letter}`}
              aria-pressed={active}
              disabled={readOnly}
              onClick={() => toggle(tile.number)}
              className={`relative min-h-24 rounded-2xl border-4 p-2 shadow-md transition sm:min-h-28 ${
                active
                  ? "border-indigo-700 bg-indigo-600 text-white -translate-y-1"
                  : "border-white bg-white/90 text-slate-950 hover:border-cyan-400"
              }`}
            >
              <span className="block text-xl font-black sm:text-2xl">{tile.number}</span>
              <span className="mx-auto my-2 block h-px w-8 bg-current opacity-30" aria-hidden />
              <span
                className={`block text-lg font-black ${
                  task.revealMode === "remaining" && active ? "line-through opacity-50" : ""
                }`}
              >
                {tile.letter}
              </span>
              {task.revealMode === "remaining" && active ? (
                <span className="absolute inset-0 grid place-items-center text-5xl font-black text-rose-200/80" aria-hidden>
                  ×
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={readOnly}
        onClick={check}
        className="mt-7 min-h-14 w-full rounded-2xl bg-slate-950 px-5 text-lg font-black text-white disabled:opacity-35"
      >
        Sprawdź szyfr
      </button>

      {checked !== null ? (
        <div
          role="status"
          className={`mt-4 rounded-2xl p-5 text-center ${
            checked ? "bg-emerald-200 text-emerald-950" : "bg-rose-200 text-rose-950"
          }`}
        >
          {checked ? (
            <>
              <p className="text-sm font-black uppercase tracking-[.16em]">Odczytana część hasła</p>
              <p className="mt-1 text-3xl font-black">{task.revealedText}</p>
              {taskIndex % PRIME_CIPHER_TASKS.length === 1 ? (
                <p className="mt-2 font-bold">Pełne hasło z obu rund: EUKLIDES Z ALEKSANDRII.</p>
              ) : null}
            </>
          ) : (
            <p className="font-black">
              W szyfrze jest jeszcze źle sklasyfikowana liczba. Sprawdź jej dzielniki i popraw wybór.
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function PrimeCompositeLessonModel({
  seed = 1,
  readOnly = false,
  questionNumber = 1,
  questionCount = 1,
  onResultChange,
}: Props) {
  const station = Math.min(3, Math.max(1, seed));
  const taskIndex = Math.max(0, questionNumber - 1);

  return (
    <section
      data-seed={seed}
      className="rounded-[2.25rem] bg-gradient-to-br from-violet-700 via-indigo-700 to-cyan-600 p-3 shadow-2xl sm:p-5"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3 px-2 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-100">Dział II · Temat 4</p>
          <h3 className="mt-1 text-2xl font-black sm:text-4xl">Liczby pierwsze i złożone</h3>
        </div>
        <b className="rounded-2xl bg-white/20 px-4 py-2">
          Zadanie {questionNumber}/{questionCount}
        </b>
      </header>
      {station === 1 ? (
        <DefinitionTask
          key={taskIndex}
          taskIndex={taskIndex}
          readOnly={readOnly}
          onResultChange={onResultChange}
        />
      ) : null}
      {station === 2 ? (
        <ScatterTask
          key={taskIndex}
          taskIndex={taskIndex}
          readOnly={readOnly}
          onResultChange={onResultChange}
        />
      ) : null}
      {station === 3 ? (
        <PrimeCipherTask
          key={taskIndex}
          taskIndex={taskIndex}
          readOnly={readOnly}
          onResultChange={onResultChange}
        />
      ) : null}
    </section>
  );
}
