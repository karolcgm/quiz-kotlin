"use client";

import { useMemo } from "react";
import { generateOrderExpression, tokensToDisplay } from "@/lib/math/orderOfOperations";
import type { LessonSessionStageQuestion } from "@/types/lessonSession";
import type { LessonDifficulty } from "@/types/lessonPackage";

interface StudentOrderDirectorActivityProps {
  question: LessonSessionStageQuestion;
  selectedIndex: number | null;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

export function StudentOrderDirectorActivity({
  question,
  selectedIndex,
  disabled = false,
  onSelect,
}: StudentOrderDirectorActivityProps) {
  const problem = useMemo(
    () => generateOrderExpression(question.seed, question.difficulty as LessonDifficulty),
    [question.seed, question.difficulty],
  );

  const display = question.expression || tokensToDisplay(problem.tokens);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center sm:p-6">
        <p className="font-mono text-[clamp(1.5rem,5vw,2.25rem)] font-black tabular-nums leading-tight text-slate-900">
          {display}
        </p>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">{question.prompt}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {problem.tokens.map((token, index) => {
          if (token.type !== "operator") return null;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={`op-${index}`}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(index)}
              className={`min-h-12 min-w-12 rounded-xl px-5 text-2xl font-black transition sm:min-h-14 sm:min-w-14 ${
                isSelected
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                  : "border-2 border-slate-200 bg-white text-slate-800 hover:border-indigo-200 hover:bg-indigo-50"
              } disabled:opacity-60`}
              aria-pressed={isSelected}
              aria-label={`Wybierz działanie ${token.value}`}
            >
              {token.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
