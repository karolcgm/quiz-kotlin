"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PremiumSimulationFrame,
  type PremiumSimulationMode,
} from "@/components/simulations/premium/PremiumSimulationFrame";
import { NumberLineVisual } from "@/components/simulations/premium/NumberLineVisual";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildTask() {
  const start = randomInt(-8, 8);
  const change = randomInt(-9, 9);
  if (change === 0) return buildTask();
  return { start, change, answer: start + change };
}

export function NumberLinePremiumSimulator() {
  const [mode, setMode] = useState<PremiumSimulationMode>("demo");
  const [start, setStart] = useState(0);
  const [change, setChange] = useState(0);
  const [position, setPosition] = useState(0);
  const [task, setTask] = useState(() => buildTask());
  const [studentPick, setStudentPick] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });

  const result = start + change;
  const min = -10;
  const max = 10;

  const applyChange = useCallback(
    (delta: number) => {
      setChange((current) => {
        const next = current + delta;
        setPosition(start + next);
        return next;
      });
      setFeedback(null);
    },
    [start],
  );

  const resetDemo = useCallback(() => {
    setStart(0);
    setChange(0);
    setPosition(0);
    setFeedback(null);
    setCelebrate(false);
  }, []);

  const newTask = useCallback(() => {
    const next = buildTask();
    setTask(next);
    setStudentPick(null);
    setFeedback(null);
    setCelebrate(false);
  }, []);

  useEffect(() => {
    if (mode === "task" || mode === "exercise") {
      newTask();
      setStudentPick(null);
    }
    if (mode === "demo") {
      resetDemo();
    }
  }, [mode, newTask, resetDemo]);

  const checkAnswer = useCallback(() => {
    const expected = mode === "demo" ? result : task.answer;
    const picked = mode === "demo" ? position : studentPick;
    if (picked === null) {
      setFeedback("Wskaż punkt na osi, zanim sprawdzisz odpowiedź.");
      setFeedbackSuccess(false);
      return;
    }
    const ok = picked === expected;
    setFeedback(
      ok
        ? "Świetnie! Trafiłeś dokładnie we właściwe miejsce na osi!"
        : `Prawie — poprawny wynik to ${expected}. Spróbuj jeszcze raz!`,
    );
    setFeedbackSuccess(ok);
    setCelebrate(ok);
    if (ok && mode === "exercise") {
      setExerciseScore((score) => ({ correct: score.correct + 1, total: score.total + 1 }));
      window.setTimeout(() => newTask(), 1400);
    } else if (!ok && mode === "exercise") {
      setExerciseScore((score) => ({ ...score, total: score.total + 1 }));
    }
  }, [mode, result, position, studentPick, task.answer, newTask]);

  const operationLabel = useMemo(() => {
    if (mode === "demo") {
      if (change === 0) return `Start: ${start}`;
      const sign = change > 0 ? "+" : "−";
      return `${start} ${sign} ${Math.abs(change)} = ?`;
    }
    const sign = task.change > 0 ? "+" : "−";
    return `${task.start} ${sign} ${Math.abs(task.change)} = ?`;
  }, [mode, start, change, task]);

  return (
    <PremiumSimulationFrame
      slug="os-liczbowa"
      title="Oś liczbowa"
      subtitle="Dodawanie i odejmowanie to ruch w prawo lub w lewo — dotknij przycisków albo wskaż wynik na osi."
      mode={mode}
      onModeChange={setMode}
      feedback={feedback}
      feedbackSuccess={feedbackSuccess}
      score={exerciseScore}
      controls={
        <div className="space-y-5">
          <p className="text-center text-xl font-black text-slate-900">{operationLabel}</p>

          {mode === "demo" ? (
            <>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStart(position);
                    setChange(0);
                  }}
                  className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-800"
                >
                  Ustaw start: {position}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "+1", delta: 1 },
                  { label: "+10", delta: 10 },
                  { label: "−1", delta: -1 },
                  { label: "−10", delta: -10 },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => applyChange(btn.delta)}
                    className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 py-4 text-lg font-black text-white shadow-lg shadow-indigo-300/40 transition hover:-translate-y-0.5 active:scale-95"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={resetDemo}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = buildTask();
                    setStart(sample.start);
                    setChange(sample.change);
                    setPosition(sample.answer);
                  }}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Wylosuj przykład
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={newTask}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
              >
                {mode === "exercise" ? "Następne ćwiczenie" : "Losuj zadanie"}
              </button>
              <button
                type="button"
                onClick={checkAnswer}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
              >
                Sprawdź
              </button>
            </div>
          )}
        </div>
      }
    >
      <NumberLineVisual
        min={min}
        max={max}
        position={mode === "demo" ? position : (studentPick ?? task.start)}
        targetPosition={mode === "demo" ? result : task.answer}
        showTarget={mode === "demo"}
        interactive={mode !== "demo"}
        celebrate={celebrate}
        onPick={(value) => {
          setStudentPick(value);
          setFeedback(null);
          setCelebrate(false);
        }}
      />
      {mode !== "demo" && (
        <p className="mt-4 text-center text-sm text-slate-600">
          Start: <strong>{task.start}</strong> · Zmiana:{" "}
          <strong>
            {task.change > 0 ? "+" : ""}
            {task.change}
          </strong>
        </p>
      )}
    </PremiumSimulationFrame>
  );
}
