"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PremiumSimulationFrame,
  type PremiumSimulationMode,
} from "@/components/simulations/premium/PremiumSimulationFrame";
import {
  AVAILABLE_WEIGHTS,
  BalanceScale3DVisual,
} from "@/components/simulations/premium/BalanceScale3DVisual";

function randomTask() {
  const left = [1, 2, 5][Math.floor(Math.random() * 3)];
  const right = [1, 2, 5, 10][Math.floor(Math.random() * 4)];
  const targetSide = Math.random() > 0.5 ? "left" : "right";
  const missing = Math.abs(left - right) + [1, 2, 5][Math.floor(Math.random() * 3)];
  return { leftWeights: targetSide === "left" ? [] : [left], rightWeights: targetSide === "right" ? [] : [right], targetSide, missing };
}

export function BalanceScalePremiumSimulator() {
  const [mode, setMode] = useState<PremiumSimulationMode>("demo");
  const [leftWeights, setLeftWeights] = useState<number[]>([2]);
  const [rightWeights, setRightWeights] = useState<number[]>([5]);
  const [task, setTask] = useState(() => randomTask());
  const [taskLeft, setTaskLeft] = useState<number[]>([]);
  const [taskRight, setTaskRight] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [exerciseScore, setExerciseScore] = useState({ correct: 0, total: 0 });

  const addWeight = useCallback((side: "left" | "right", kg: number) => {
    if (mode === "demo") {
      if (side === "left") setLeftWeights((w) => [...w, kg]);
      else setRightWeights((w) => [...w, kg]);
    } else {
      if (side === "left") setTaskLeft((w) => [...w, kg]);
      else setTaskRight((w) => [...w, kg]);
    }
    setFeedback(null);
  }, [mode]);

  const clearSide = useCallback((side: "left" | "right") => {
    if (mode === "demo") {
      if (side === "left") setLeftWeights([]);
      else setRightWeights([]);
    } else {
      if (side === "left") setTaskLeft([]);
      else setTaskRight([]);
    }
  }, [mode]);

  const newTask = useCallback(() => {
    const next = randomTask();
    setTask(next);
    setTaskLeft(next.targetSide === "left" ? [] : next.leftWeights);
    setTaskRight(next.targetSide === "right" ? [] : next.rightWeights);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (mode === "task" || mode === "exercise") newTask();
    if (mode === "demo") {
      setLeftWeights([2]);
      setRightWeights([5]);
    }
  }, [mode, newTask]);

  const left = mode === "demo" ? leftWeights : [...task.leftWeights, ...taskLeft];
  const right = mode === "demo" ? rightWeights : [...task.rightWeights, ...taskRight];
  const leftSum = left.reduce((a, b) => a + b, 0);
  const rightSum = right.reduce((a, b) => a + b, 0);

  const checkBalance = useCallback(() => {
    if (mode === "demo") {
      setFeedback(
        leftSum === rightSum
          ? "Waga jest w równowadze — obie szalki ważą tyle samo!"
          : `Różnica: ${Math.abs(leftSum - rightSum)} kg na korzyść ${leftSum > rightSum ? "lewej" : "prawej"} strony.`,
      );
      setFeedbackSuccess(leftSum === rightSum);
      return;
    }

    const ok = leftSum === rightSum;
    setFeedback(
      ok
        ? "Brawo! Oba ramiona mają teraz tę samą masę."
        : `Jeszcze nie równo — różnica to ${Math.abs(leftSum - rightSum)} kg.`,
    );
    setFeedbackSuccess(ok);
    if (ok && mode === "exercise") {
      setExerciseScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      window.setTimeout(newTask, 1400);
    } else if (!ok && mode === "exercise") {
      setExerciseScore((s) => ({ ...s, total: s.total + 1 }));
    }
  }, [mode, leftSum, rightSum, newTask]);

  return (
    <PremiumSimulationFrame
      slug="waga"
      title="Waga szkolna"
      subtitle="Dodawaj odważniki i obserwuj, która szalka opada — masa widać na wagażce i na bloczkach."
      mode={mode}
      onModeChange={setMode}
      feedback={feedback}
      feedbackSuccess={feedbackSuccess}
      score={exerciseScore}
      controls={
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-slate-600">
            {mode === "demo"
              ? "Dodaj ciężarki przyciskami — obserwuj pochylenie wagi."
              : "Dodaj odważniki tak, aby waga była w równowadze."}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {(["left", "right"] as const).map((side) => (
              <div key={side} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="mb-3 text-sm font-bold text-slate-800">
                  {side === "left" ? "Lewa szalka" : "Prawa szalka"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_WEIGHTS.map((kg) => (
                    <button
                      key={`${side}-${kg}`}
                      type="button"
                      onClick={() => addWeight(side, kg)}
                      className="min-w-[4.5rem] rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 active:scale-95"
                    >
                      +{kg} kg
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => clearSide(side)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    Wyczyść
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            {(mode === "task" || mode === "exercise") && (
              <button type="button" onClick={newTask} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white">
                Losuj
              </button>
            )}
            <button type="button" onClick={checkBalance} className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">
              Sprawdź równowagę
            </button>
          </div>
        </div>
      }
    >
      <BalanceScale3DVisual leftWeights={left} rightWeights={right} />
    </PremiumSimulationFrame>
  );
}
