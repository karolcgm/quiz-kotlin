"use client";

import { useEffect, useRef, useState } from "react";
import { LessonTaskFrame, LessonTaskNavigator } from "@/components/lessons/LessonTaskFrame";
import {
  CALCULATOR_STORY_TASKS,
  DECIMAL_EXPANSION_TASKS,
  PERCENT_CALCULATOR_TASKS,
  REMAINDER_TASKS,
  type CalculatorActivity,
  type CalculatorTask,
} from "@/lib/math/everyday/calculator";

interface Props {
  activity: CalculatorActivity;
  slideId?: string;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Operator = "+" | "−" | "·" | ":";
type Feedback = "missing" | "correct" | "incorrect" | null;

function parseDisplay(value: string) {
  return Number(value.replace(",", "."));
}

function formatDisplay(value: number) {
  if (!Number.isFinite(value)) return "Błąd";
  const rounded = Number(value.toPrecision(12));
  return String(rounded).replace(".", ",");
}

function calculate(left: number, right: number, operator: Operator) {
  if (operator === "+") return left + right;
  if (operator === "−") return left - right;
  if (operator === "·") return left * right;
  return right === 0 ? Number.NaN : left / right;
}

function Calculator({
  resetKey,
  disabled = false,
  onUseResult,
  onClearResult,
}: {
  resetKey: string;
  disabled?: boolean;
  onUseResult?: (value: string) => void;
  onClearResult?: () => void;
}) {
  return <CalculatorBody key={resetKey} disabled={disabled} onUseResult={onUseResult} onClearResult={onClearResult} />;
}

function CalculatorBody({
  disabled = false,
  onUseResult,
  onClearResult,
}: {
  disabled?: boolean;
  onUseResult?: (value: string) => void;
  onClearResult?: () => void;
}) {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [hasResult, setHasResult] = useState(false);

  const pressDigit = (digit: string) => {
    if (disabled) return;
    setHasResult(false);
    setDisplay((current) => waiting || current === "0" || current === "Błąd" ? digit : current.length < 14 ? `${current}${digit}` : current);
    setWaiting(false);
  };

  const pressComma = () => {
    if (disabled) return;
    setHasResult(false);
    setDisplay((current) => waiting ? "0," : current.includes(",") ? current : `${current},`);
    setWaiting(false);
  };

  const pressOperator = (nextOperator: Operator) => {
    if (disabled || display === "Błąd") return;
    const current = parseDisplay(display);
    if (stored !== null && operator && !waiting) {
      const result = calculate(stored, current, operator);
      setStored(result);
      setDisplay(formatDisplay(result));
    } else {
      setStored(current);
    }
    setOperator(nextOperator);
    setWaiting(true);
    setHasResult(false);
  };

  const equals = () => {
    if (disabled || stored === null || !operator || waiting || display === "Błąd") return;
    const right = parseDisplay(display);
    const result = calculate(stored, right, operator);
    const resultText = formatDisplay(result);
    setHistory((current) => [`${formatDisplay(stored)} ${operator} ${formatDisplay(right)} = ${resultText}`, ...current].slice(0, 4));
    setDisplay(resultText);
    setStored(null);
    setOperator(null);
    setWaiting(true);
    setHasResult(Number.isFinite(result));
  };

  const clearAll = () => {
    if (disabled) return;
    setDisplay("0");
    setStored(null);
    setOperator(null);
    setWaiting(false);
    setHasResult(false);
    onClearResult?.();
  };

  const backspace = () => {
    if (disabled || waiting || display === "Błąd") return;
    setHasResult(false);
    setDisplay((current) => current.length <= 1 ? "0" : current.slice(0, -1));
  };

  const buttonClass = "min-h-14 rounded-2xl border-2 border-slate-200 bg-white text-2xl font-black text-slate-950 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-50 disabled:opacity-50";
  const opClass = "min-h-14 rounded-2xl bg-violet-700 text-2xl font-black text-white shadow-sm transition hover:bg-violet-800 disabled:opacity-50";

  return (
    <section aria-label="Kalkulator ekranowy" className="mx-auto grid w-full max-w-md gap-3 rounded-[2rem] bg-slate-950 p-4 shadow-2xl">
      <div className="rounded-2xl bg-emerald-100 p-4 text-right text-slate-950 shadow-inner">
        <p className="min-h-5 text-sm font-black text-emerald-800">{stored !== null && operator ? `${formatDisplay(stored)} ${operator}` : "KALKULATOR"}</p>
        <output aria-live="polite" className="block min-h-12 overflow-hidden font-mono text-4xl font-black">{display}</output>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button type="button" disabled={disabled} onClick={clearAll} className="min-h-14 rounded-2xl bg-rose-400 font-black text-rose-950">C</button>
        <button type="button" disabled={disabled} onClick={backspace} className={`${buttonClass} text-lg`}>⌫</button>
        <button type="button" disabled={disabled} onClick={() => pressOperator(":")} className={opClass}>:</button>
        <button type="button" disabled={disabled} onClick={() => pressOperator("·")} className={opClass}>·</button>
        {["7", "8", "9"].map((digit) => <button key={digit} type="button" disabled={disabled} onClick={() => pressDigit(digit)} className={buttonClass}>{digit}</button>)}
        <button type="button" disabled={disabled} onClick={() => pressOperator("−")} className={opClass}>−</button>
        {["4", "5", "6"].map((digit) => <button key={digit} type="button" disabled={disabled} onClick={() => pressDigit(digit)} className={buttonClass}>{digit}</button>)}
        <button type="button" disabled={disabled} onClick={() => pressOperator("+")} className={opClass}>+</button>
        {["1", "2", "3"].map((digit) => <button key={digit} type="button" disabled={disabled} onClick={() => pressDigit(digit)} className={buttonClass}>{digit}</button>)}
        <button type="button" disabled={disabled} onClick={equals} className="row-span-2 min-h-14 rounded-2xl bg-cyan-300 text-3xl font-black text-cyan-950">=</button>
        <button type="button" disabled={disabled} onClick={() => pressDigit("0")} className={`${buttonClass} col-span-2`}>0</button>
        <button type="button" disabled={disabled} onClick={pressComma} className={buttonClass}>,</button>
      </div>
      {onUseResult ? (
        <button
          type="button"
          disabled={disabled || !hasResult}
          onClick={() => onUseResult(display)}
          className="min-h-12 rounded-2xl bg-amber-300 px-4 font-black text-amber-950 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Użyj wyniku z wyświetlacza
        </button>
      ) : null}
      {history.length > 0 ? (
        <div className="rounded-2xl bg-slate-800 p-3 text-sm font-bold text-slate-100">
          <p className="mb-1 text-xs font-black uppercase tracking-widest text-cyan-300">Historia</p>
          {history.map((line, index) => <p key={`${line}-${index}`} className="font-mono">{line}</p>)}
        </div>
      ) : null}
    </section>
  );
}

function StackedFraction({ numerator, denominator }: { numerator: number; denominator: number }) {
  return (
    <span className="inline-grid min-w-16 grid-rows-2 text-center text-3xl font-black leading-none">
      <span className="border-b-2 border-slate-950 px-2 pb-1">{numerator}</span>
      <span className="px-2 pt-1">{denominator}</span>
    </span>
  );
}

function Guide({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 5"
      heading="Jak korzystać z kalkulatora?"
      description="Wpisuj liczby w tej samej kolejności, w jakiej występują w działaniu. Na końcu naciśnij znak równości."
      data-calculator="guide"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-3">
          <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5">
            <h3 className="text-xl font-black text-indigo-950">Sprawdź działanie: 24,6 : 3</h3>
            <ol className="mt-3 grid gap-2 font-bold text-slate-800">
              <li className="rounded-xl bg-white p-3"><b>1.</b> Wpisz 24,6.</li>
              <li className="rounded-xl bg-white p-3"><b>2.</b> Naciśnij : i wpisz 3.</li>
              <li className="rounded-xl bg-white p-3"><b>3.</b> Naciśnij =. Otrzymasz 8,2.</li>
            </ol>
          </section>
          <div className="grid grid-cols-2 gap-3 text-center font-bold">
            <p className="rounded-2xl bg-rose-100 p-3"><b className="block text-xl">C</b>usuwa całe działanie</p>
            <p className="rounded-2xl bg-amber-100 p-3"><b className="block text-xl">⌫</b>usuwa ostatnią cyfrę</p>
          </div>
          <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Po obliczeniu sprawdź, czy wynik ma sens i czy użyto właściwego działania.</p>
        </div>
        <Calculator resetKey="guide" disabled={readOnly} />
      </div>
    </LessonTaskFrame>
  );
}

function PercentCalculatorGuide({ readOnly = false }: { readOnly?: boolean }) {
  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 3"
      heading="Jaki to procent? — obliczenia kalkulatorem"
      description="Kalkulator wykona rachunki, ale najpierw trzeba poprawnie rozpoznać badaną część i całość."
      data-calculator="percent-calculator-guide"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="grid content-start gap-4">
          <section className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-cyan-50 p-5">
            <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Przykład</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">21 z 28 kapeluszy ma kwiaty. Jaki to procent?</h3>
            <div className="mt-5 grid gap-3 text-center font-black sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm"><span className="block text-sm text-slate-600">badana część</span><span className="text-3xl text-violet-800">21</span></div>
              <div className="rounded-2xl bg-white p-4 shadow-sm"><span className="block text-sm text-slate-600">całość</span><span className="text-3xl text-cyan-800">28</span></div>
            </div>
            <div className="mt-5 grid gap-2 rounded-2xl border-2 border-violet-200 bg-white p-4 text-center shadow-sm">
              <p className="text-lg font-black text-slate-950">część : całość · 100 = procent</p>
              <p className="font-mono text-2xl font-black text-cyan-800">21 : 28 = 0,75</p>
              <p className="font-mono text-2xl font-black text-violet-800">0,75 · 100 = 75%</p>
            </div>
          </section>
          <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Najpierw podziel badaną część przez całość. Otrzymany wynik pomnóż przez 100.</p>
        </div>
        <Calculator resetKey="percent-guide" disabled={readOnly} />
      </div>
    </LessonTaskFrame>
  );
}

function TaskSeries({ tasks, activity, readOnly = false, onResultChange }: { tasks: CalculatorTask[]; activity: CalculatorActivity; readOnly?: boolean; onResultChange?: Props["onResultChange"] }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const task = tasks[index];
  const showTaskNavigator = readOnly || !onResultChange;

  useEffect(() => () => {
    if (advanceTimer.current !== null) window.clearTimeout(advanceTimer.current);
  }, []);

  const resetFor = (nextIndex: number) => {
    if (advanceTimer.current !== null) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    setIndex(Math.max(0, Math.min(tasks.length - 1, nextIndex)));
    setAnswer("");
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };

  const clearTransferredAnswer = () => {
    setAnswer("");
    setFeedback(null);
    onResultChange?.(null);
  };

  const continueSeries = (correct: boolean) => {
    if (index === tasks.length - 1) {
      onResultChange?.(correct && !mistakeMade, answer);
      return;
    }
    setIndex((current) => current + 1);
    setAnswer("");
    setFeedback(null);
  };

  const confirm = () => {
    if (!answer.trim()) {
      setFeedback("missing");
      return;
    }
    const numeric = parseDisplay(answer);
    const correct = Number.isFinite(numeric) && Math.abs(numeric - task.answer) < 1e-9;
    if (correct) {
      setFeedback("correct");
      advanceTimer.current = window.setTimeout(() => {
        advanceTimer.current = null;
        continueSeries(true);
      }, 650);
    } else {
      setMistakeMade(true);
      setFeedback("incorrect");
    }
  };

  const heading = activity === "decimal-expansions"
    ? "Rozwinięcia dziesiętne"
    : activity === "division-remainders"
      ? "Reszta z dzielenia"
      : activity === "percent-calculator-practice"
        ? "Jaki to procent? — kalkulator"
        : "Zadania praktyczne z kalkulatorem";

  const description = activity === "decimal-expansions"
    ? "Wykonaj dzielenie na kalkulatorze, a następnie przenieś wynik do odpowiedzi."
    : activity === "division-remainders"
      ? "Wykonaj potrzebne działania na kalkulatorze. Do odpowiedzi przenieś tylko resztę."
      : activity === "percent-calculator-practice"
        ? "Rozpoznaj badaną część i całość. Wykonaj dwa działania, a kalkulator zachowa oba kroki w historii."
        : "Zdecyduj, jakie działania są potrzebne. Możesz wykonać kilka obliczeń — kalkulator zachowa ich historię.";

  const isPercentActivity = activity === "percent-calculator-practice";

  return (
    <LessonTaskFrame
      eyebrow={isPercentActivity ? "Dział 6 · Temat 3" : "Dział 3 · Temat 5"}
      heading={heading}
      description={description}
      questionNumber={showTaskNavigator ? undefined : index + 1}
      questionCount={showTaskNavigator ? undefined : tasks.length}
      data-calculator={activity}
    >
      <div className="grid gap-5">
        {showTaskNavigator ? <LessonTaskNavigator currentIndex={index} taskCount={tasks.length} onPrevious={() => resetFor(index - 1)} onNext={() => resetFor(index + 1)} /> : null}
        <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-5 text-center">
          {task.icon ? <span aria-hidden className="mb-2 block text-6xl">{task.icon}</span> : null}
          <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">{task.title}</p>
          <p className="mx-auto mt-2 max-w-2xl text-xl font-black leading-relaxed text-slate-950">{task.prompt}</p>
          {task.kind === "decimal" && task.numerator !== undefined && task.denominator !== undefined ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <StackedFraction numerator={task.numerator} denominator={task.denominator} />
              <span className="text-3xl font-black">=</span>
              <span className="grid min-h-16 min-w-32 place-items-center rounded-2xl border-2 border-dashed border-violet-400 bg-white px-4 text-3xl font-black">{answer || "?"}</span>
            </div>
          ) : null}
          {task.kind === "percent" && task.part !== undefined && task.whole !== undefined ? (
            <div className="mx-auto mt-5 grid max-w-lg gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-violet-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-600">badana część</span>
                <strong className="text-3xl text-violet-800">{task.part}</strong>
              </div>
              <div className="rounded-2xl border-2 border-cyan-200 bg-white p-4">
                <span className="block text-sm font-black text-slate-600">całość</span>
                <strong className="text-3xl text-cyan-800">{task.whole}</strong>
              </div>
            </div>
          ) : null}
          {task.hint ? <p className="mx-auto mt-4 max-w-xl rounded-2xl bg-amber-100 p-3 font-bold text-amber-950">{task.hint}</p> : null}
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Calculator
            resetKey={task.id}
            disabled={readOnly || feedback === "correct"}
            onUseResult={(value) => {
              setAnswer(value);
              setFeedback(null);
            }}
            onClearResult={clearTransferredAnswer}
          />
          <section className="grid content-start gap-4 rounded-3xl border-2 border-slate-200 bg-white p-5">
            <h3 className="text-center text-xl font-black text-slate-950">Odpowiedź</h3>
            <label className="grid gap-2 text-center font-bold">
              Wynik użyty z kalkulatora
              <div className="flex items-center justify-center gap-2">
                <input
                  aria-label="Wynik użyty z kalkulatora"
                  inputMode="none"
                  readOnly
                  value={answer}
                  className="min-h-16 w-40 rounded-2xl border-2 border-violet-400 bg-violet-50 px-3 text-center text-3xl font-black outline-none"
                />
                {task.unit ? <b className="text-xl">{task.unit}</b> : null}
              </div>
            </label>
            {!readOnly && answer ? (
              <button
                type="button"
                onClick={clearTransferredAnswer}
                className="min-h-11 rounded-xl border-2 border-violet-300 bg-violet-50 px-4 font-black text-violet-950"
              >
                Zmień wynik
              </button>
            ) : null}
            {!readOnly ? (
              <button type="button" disabled={feedback === "correct"} onClick={confirm} className="min-h-14 rounded-2xl bg-violet-700 px-5 text-lg font-black text-white disabled:opacity-50">
                Zatwierdź odpowiedź
              </button>
            ) : null}
            {feedback === "missing" ? <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">Najpierw wykonaj działanie i użyj wyniku z wyświetlacza.</p> : null}
            {feedback === "correct" ? <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">Dobrze! Wynik został poprawnie obliczony kalkulatorem.</p> : null}
            {feedback === "incorrect" ? (
              <div className="grid gap-3 rounded-2xl bg-rose-50 p-4 text-center font-bold text-rose-950">
                <p>Spróbuj innym razem. Poprawny wynik to {formatDisplay(task.answer)}{task.unit ? ` ${task.unit}` : ""}. Dziś bez punktu.</p>
                <button type="button" onClick={() => continueSeries(false)} className="min-h-12 rounded-xl bg-violet-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

export function CalculatorLessonLab({ activity, slideId, readOnly = false, onResultChange }: Props) {
  const seriesKey = `${slideId ?? activity}:${activity}`;
  if (activity === "calculator-guide") return <Guide readOnly={readOnly} />;
  if (activity === "percent-calculator-guide") return <PercentCalculatorGuide readOnly={readOnly} />;
  if (activity === "percent-calculator-practice") return <TaskSeries key={seriesKey} tasks={PERCENT_CALCULATOR_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "decimal-expansions") return <TaskSeries key={seriesKey} tasks={DECIMAL_EXPANSION_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  if (activity === "division-remainders") return <TaskSeries key={seriesKey} tasks={REMAINDER_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
  return <TaskSeries key={seriesKey} tasks={CALCULATOR_STORY_TASKS} activity={activity} readOnly={readOnly} onResultChange={onResultChange} />;
}
