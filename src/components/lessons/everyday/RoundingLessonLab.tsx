"use client";

import { useState, type ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import { ROUNDING_TASKS, type RoundingActivity } from "@/lib/math/everyday/rounding";

interface Props {
  activity: RoundingActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

const PLACE_ROWS = [
  ["3", "setki", "bg-fuchsia-100 text-fuchsia-950"],
  ["4", "dziesiątki", "bg-violet-100 text-violet-950"],
  ["7", "jedności", "bg-indigo-100 text-indigo-950"],
  ["5", "części dziesiętne", "bg-cyan-100 text-cyan-950"],
  ["8", "części setne", "bg-emerald-100 text-emerald-950"],
  ["2", "części tysięczne", "bg-amber-100 text-amber-950"],
] as const;

function PlaceValues() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 4"
      heading="Nazwy miejsc w liczbie dziesiętnej"
      description="Przecinek oddziela część całkowitą od części ułamkowej liczby."
      data-rounding="place-values"
    >
      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-center gap-2 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5">
          {PLACE_ROWS.map(([digit, place, color], index) => (
            <div key={place} className="grid justify-items-center gap-2">
              <span className={`grid h-16 w-14 place-items-center rounded-2xl text-3xl font-black shadow-sm ${color}`}>{digit}</span>
              <span className="max-w-24 text-center text-xs font-black leading-tight text-slate-700">{place}</span>
              {index === 2 ? <span className="absolute sr-only">przecinek</span> : null}
            </div>
          )).reduce<ReactNode[]>((items, item, index) => {
            items.push(item);
            if (index === 2) items.push(<span key="comma" className="mb-9 text-5xl font-black text-rose-600">,</span>);
            return items;
          }, [])}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-indigo-100 p-4 font-bold text-indigo-950">
            <b className="block text-lg">Po lewej stronie przecinka</b>
            setki, dziesiątki i jedności
          </div>
          <div className="rounded-2xl bg-emerald-100 p-4 font-bold text-emerald-950">
            <b className="block text-lg">Po prawej stronie przecinka</b>
            części dziesiętne, setne i tysięczne
          </div>
        </div>
        <p className="rounded-2xl bg-amber-50 p-4 text-center font-black text-amber-950">
          W liczbie 347,582 cyfra 8 stoi na miejscu części setnych.
        </p>
      </div>
    </LessonTaskFrame>
  );
}

function MarkedNumber({
  value,
  targetIndex,
  checkIndex,
  selectedTarget,
  selectedCheck,
  onSelect,
  interactive = false,
}: {
  value: string;
  targetIndex?: number;
  checkIndex?: number;
  selectedTarget?: number | null;
  selectedCheck?: number | null;
  onSelect?: (index: number) => void;
  interactive?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5" aria-label={`Liczba ${value}`}>
      {[...value].map((character, index) => {
        if (character === ",") return <span key={`${index}-comma`} className="pb-1 text-5xl font-black text-slate-950">,</span>;
        const isTarget = targetIndex === index || selectedTarget === index;
        const isCheck = checkIndex === index || selectedCheck === index;
        const className = isCheck
          ? "border-rose-500 bg-rose-500 text-white ring-4 ring-rose-200"
          : isTarget
            ? "border-cyan-600 bg-cyan-600 text-white ring-4 ring-cyan-200"
            : "border-slate-300 bg-white text-slate-950";
        return interactive ? (
          <button
            key={`${index}-${character}`}
            type="button"
            onClick={() => onSelect?.(index)}
            className={`grid h-16 w-14 place-items-center rounded-2xl border-2 text-3xl font-black shadow-sm transition ${className}`}
            aria-label={`Cyfra ${character}`}
          >
            {character}
          </button>
        ) : (
          <span key={`${index}-${character}`} className={`grid h-16 w-14 place-items-center rounded-2xl border-2 text-3xl font-black shadow-sm ${className}`}>
            {character}
          </span>
        );
      })}
    </div>
  );
}

function RoundingGuide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 4"
      heading="Jak zaokrąglamy?"
      description="Zaznacz cyfrę miejsca, do którego zaokrąglasz. Potem spójrz na cyfrę bezpośrednio po jej prawej stronie."
      data-rounding="rounding-guide"
    >
      <div className="grid gap-5">
        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5">
          <h3 className="text-center text-xl font-black text-indigo-950">Przykład: zaokrąglij 12,67 do części dziesiętnych</h3>
          <div className="mt-5"><MarkedNumber value="12,67" targetIndex={3} checkIndex={4} /></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <p className="rounded-2xl bg-cyan-100 p-4 text-center font-bold text-cyan-950">
              <b className="block text-lg">Cyfra zaokrąglana: 6</b>
              stoi na miejscu części dziesiętnych
            </p>
            <p className="rounded-2xl bg-rose-100 p-4 text-center font-bold text-rose-950">
              <b className="block text-lg">Cyfra po prawej: 7</b>
              to na nią patrzymy
            </p>
          </div>
          <p className="mt-4 text-center text-2xl font-black text-slate-950">7 należy do grupy 5–9, więc 6 zwiększamy do 7.</p>
          <p className="mt-3 text-center text-4xl font-black text-violet-800">12,67 ≈ 12,7</p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border-2 border-sky-300 bg-sky-50 p-5 text-center">
            <b className="text-2xl text-sky-950">0, 1, 2, 3, 4</b>
            <p className="mt-2 font-black text-sky-900">Zaokrąglamy w dół — cyfra zaokrąglana nie zmienia się.</p>
          </div>
          <div className="rounded-3xl border-2 border-rose-300 bg-rose-50 p-5 text-center">
            <b className="text-2xl text-rose-950">5, 6, 7, 8, 9</b>
            <p className="mt-2 font-black text-rose-900">Zaokrąglamy w górę — cyfrę zaokrąglaną zwiększamy o 1.</p>
          </div>
        </div>
        <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Cyfry stojące dalej po prawej stronie zastępujemy zerami albo pomijamy po przecinku.</p>
      </div>
    </LessonTaskFrame>
  );
}

function RoundingSeries({ readOnly = false, onResultChange }: Omit<Props, "activity">) {
  const [index, setIndex] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedCheck, setSelectedCheck] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = ROUNDING_TASKS[index];

  const resetFor = (nextIndex: number) => {
    setIndex(Math.max(0, Math.min(ROUNDING_TASKS.length - 1, nextIndex)));
    setSelectedTarget(null);
    setSelectedCheck(null);
    setAnswer("");
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };

  const selectDigit = (digitIndex: number) => {
    if (readOnly || feedback === "correct") return;
    if (selectedTarget === null || selectedCheck !== null) {
      setSelectedTarget(digitIndex);
      setSelectedCheck(null);
    } else if (digitIndex !== selectedTarget) {
      setSelectedCheck(digitIndex);
    }
    setFeedback(null);
  };

  const onKey = (key: string) => {
    if (readOnly || feedback === "correct") return;
    setFeedback(null);
    if (key === "backspace") setAnswer((current) => current.slice(0, -1));
    else if (key === "," && answer.includes(",")) return;
    else if (answer.length < 8) setAnswer((current) => `${current}${key}`);
  };

  const goForward = (currentCorrect: boolean) => {
    if (index === ROUNDING_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, answer);
      return;
    }
    setIndex((current) => current + 1);
    setSelectedTarget(null);
    setSelectedCheck(null);
    setAnswer("");
    setFeedback(null);
  };

  const confirm = () => {
    if (selectedTarget === null || selectedCheck === null || answer.trim() === "") {
      setFeedback("missing");
      return;
    }
    const correct = selectedTarget === task.targetIndex
      && selectedCheck === task.checkIndex
      && answer.replace(".", ",") === task.answer;
    if (correct) {
      setFeedback("correct");
      window.setTimeout(() => goForward(true), 650);
    } else {
      setMistakeMade(true);
      setFeedback("incorrect");
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 4"
      heading="Zaokrąglanie liczb"
      description="Najpierw zaznacz cyfrę miejsca, do którego zaokrąglasz. Potem zaznacz na czerwono cyfrę bezpośrednio po jej prawej stronie i wpisz wynik."
      questionNumber={index + 1}
      questionCount={ROUNDING_TASKS.length}
      data-rounding="rounding-series"
    >
      <div className="grid gap-5">
        {readOnly ? (
          <LessonTaskNavigator
            currentIndex={index}
            taskCount={ROUNDING_TASKS.length}
            onPrevious={() => resetFor(index - 1)}
            onNext={() => resetFor(index + 1)}
          />
        ) : null}
        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center">
          <p className="text-lg font-black text-indigo-950">Zaokrąglij liczbę do {task.place}.</p>
          <div className="mt-5">
            <MarkedNumber
              value={task.value}
              selectedTarget={selectedTarget}
              selectedCheck={selectedCheck}
              onSelect={selectDigit}
              interactive
            />
          </div>
          <div className="mt-5 grid gap-2 text-sm font-black sm:grid-cols-2">
            <p className="rounded-xl bg-cyan-100 p-3 text-cyan-950">1. Niebieska: cyfra miejsca zaokrąglenia</p>
            <p className="rounded-xl bg-rose-100 p-3 text-rose-950">2. Czerwona: cyfra bezpośrednio po prawej</p>
          </div>
        </section>

        <label className="mx-auto grid w-full max-w-sm gap-2 text-center font-black text-slate-950">
          Wynik zaokrąglenia
          <input
            value={answer}
            inputMode="none"
            readOnly
            aria-label="Wynik zaokrąglenia"
            className="min-h-16 rounded-2xl border-2 border-violet-400 bg-white px-4 text-center text-3xl font-black outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-200"
          />
        </label>

        {!readOnly ? (
          <LessonNumericKeypad
            allowSeparator
            onKey={onKey}
            onConfirm={confirm}
            disabled={feedback === "correct"}
            label="Klawiatura do wyniku"
            helperText="Zaznacz obie cyfry, wpisz wynik i zatwierdź."
          />
        ) : null}

        {feedback === "missing" ? (
          <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Zaznacz obie wymagane cyfry i uzupełnij wynik.</p>
        ) : null}
        {feedback === "correct" ? (
          <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Dobrze! Wskazano właściwe cyfry i poprawnie zaokrąglono liczbę.</p>
        ) : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950">
            <p>Spróbuj innym razem. Poprawny wynik to {task.answer}. Dziś bez punktu.</p>
            <button type="button" onClick={() => goForward(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">
              Przejdź dalej bez punktu
            </button>
          </div>
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

export function RoundingLessonLab({ activity, readOnly = false, onResultChange }: Props) {
  if (activity === "place-values") return <PlaceValues />;
  if (activity === "rounding-guide") return <RoundingGuide />;
  return <RoundingSeries readOnly={readOnly} onResultChange={onResultChange} />;
}
