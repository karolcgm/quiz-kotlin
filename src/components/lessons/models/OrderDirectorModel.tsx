"use client";

import { useMemo, useState } from "react";
import {
  generateOrderExpression,
  tokensToDisplay,
  validateNextStep,
  type OrderExpressionProblem,
} from "@/lib/math/orderOfOperations";
import type { LessonDifficulty } from "@/types/lessonPackage";

export interface OrderDirectorModelState {
  round: number;
  feedback: string | null;
  feedbackOk: boolean | null;
  selectedIndex: number | null;
}

interface OrderDirectorModelProps {
  seed: number;
  seedPool?: number[];
  difficulty?: LessonDifficulty;
  readOnly?: boolean;
  /** Tryb tablicy: nauczyciel zaznacza krok, ale aplikacja nie zdradza odpowiedzi. */
  presentationMode?: boolean;
  showHints?: boolean;
  showDebug?: boolean;
  state?: OrderDirectorModelState;
  onStateChange?: (state: OrderDirectorModelState) => void;
}

const DEFAULT_STATE: OrderDirectorModelState = {
  round: 0,
  feedback: null,
  feedbackOk: null,
  selectedIndex: null,
};

export function OrderDirectorModel({
  seed,
  seedPool,
  difficulty = "core",
  readOnly = false,
  presentationMode = false,
  showHints = false,
  showDebug = false,
  state,
  onStateChange,
}: OrderDirectorModelProps) {
  const [internal, setInternal] = useState<OrderDirectorModelState>(state ?? DEFAULT_STATE);
  const active = state ?? internal;

  const setActive = (next: OrderDirectorModelState) => {
    if (onStateChange) onStateChange(next);
    else setInternal(next);
  };

  const activeSeed = useMemo(() => {
    if (seedPool && seedPool.length > 0) {
      return seedPool[active.round % seedPool.length]!;
    }
    return seed + active.round * 17;
  }, [seed, seedPool, active.round]);

  const problem = useMemo(
    () => generateOrderExpression(activeSeed, difficulty),
    [activeSeed, difficulty],
  );

  const poolExhausted =
    seedPool !== undefined && seedPool.length > 0 && active.round >= seedPool.length;

  return (
    <OrderDirectorProblemView
      problem={problem}
      readOnly={readOnly}
      presentationMode={presentationMode}
      showHints={showHints}
      showDebug={showDebug}
      selectedIndex={active.selectedIndex}
      feedback={active.feedback}
      feedbackOk={active.feedbackOk}
      roundLabel={
        seedPool && seedPool.length > 1
          ? `Zadanie ${Math.min(active.round + 1, seedPool.length)} z ${seedPool.length}`
          : undefined
      }
      onSelectOperator={(index) => {
        if (readOnly) return;
        if (presentationMode) {
          setActive({ ...active, selectedIndex: index, feedback: null, feedbackOk: null });
          return;
        }
        const result = validateNextStep(problem, index);
        setActive({
          ...active,
          selectedIndex: index,
          feedback: result.message,
          feedbackOk: result.ok,
        });
      }}
      onNextRound={() => {
        if (poolExhausted) return;
        setActive({
          round: active.round + 1,
          feedback: null,
          feedbackOk: null,
          selectedIndex: null,
        });
      }}
      showNext={active.feedbackOk === true && !poolExhausted}
      poolComplete={poolExhausted && active.feedbackOk === true}
    />
  );
}

function OrderDirectorProblemView({
  problem,
  readOnly,
  presentationMode,
  showHints,
  showDebug,
  selectedIndex,
  feedback,
  feedbackOk,
  roundLabel,
  onSelectOperator,
  onNextRound,
  showNext,
  poolComplete,
}: {
  problem: OrderExpressionProblem;
  readOnly: boolean;
  presentationMode: boolean;
  showHints: boolean;
  showDebug: boolean;
  selectedIndex: number | null;
  feedback: string | null;
  feedbackOk: boolean | null;
  roundLabel?: string;
  onSelectOperator: (index: number) => void;
  onNextRound: () => void;
  showNext: boolean;
  poolComplete: boolean;
}) {
  const display = tokensToDisplay(problem.tokens);

  return (
    <div className="space-y-4">
      {roundLabel ? (
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-indigo-600">{roundLabel}</p>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wyrażenie</p>
        <p className="mt-2 font-mono text-3xl font-black tabular-nums text-slate-900 sm:text-4xl">{display}</p>
        <p className="mt-2 text-sm text-slate-600">Wskaż działanie, które wykonasz jako pierwsze.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {problem.tokens.map((token, index) => {
          if (token.type !== "operator") return null;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={`op-${index}`}
              type="button"
              disabled={readOnly || (!presentationMode && feedbackOk === true)}
              onClick={() => onSelectOperator(index)}
              className={`min-h-12 min-w-12 rounded-xl px-4 text-xl font-black transition ${
                isSelected
                  ? presentationMode || feedbackOk === null
                    ? "bg-indigo-600 text-white"
                    : feedbackOk
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                  : showHints && problem.validNextOperatorIndices.includes(index)
                    ? "border-2 border-indigo-300 bg-white text-indigo-800 hover:bg-indigo-50"
                    : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              } disabled:opacity-60`}
              aria-label={`Wybierz działanie ${token.value}`}
            >
              {token.value}
            </button>
          );
        })}
      </div>

      {feedback ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            feedbackOk ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"
          }`}
        >
          {feedback}
        </p>
      ) : null}

      {presentationMode && selectedIndex !== null && !readOnly ? (
        <p className="rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-semibold text-indigo-900">
          Zaznaczenie nauczyciela — klasa uzasadnia wybór. Odpowiedź pozostaje ukryta.
        </p>
      ) : null}

      {showNext && !readOnly ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onNextRound}
            className="min-h-12 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Kolejne zadanie
          </button>
        </div>
      ) : null}

      {poolComplete ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-900">
          Ukończono zestaw zadań na tym etapie. Możesz przejść dalej.
        </p>
      ) : null}

      {showDebug ? (
        <p className="text-center text-xs text-slate-400">
          Klucz (prep): {problem.validNextOperatorIndices.map((i) => problem.tokens[i]).join(", ")} · wynik:{" "}
          {problem.finalValue} · seed: {problem.seed}
        </p>
      ) : null}
    </div>
  );
}
