"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { generateOrderExpression, tokensToDisplay } from "@/lib/math/orderOfOperations";
import type { LessonDifficulty } from "@/types/lessonPackage";

export interface OrderDirectorAssessmentParams {
  expression: string;
  seed: number;
  difficulty: LessonDifficulty;
  slotId: string;
  generatorId?: string;
}

interface OrderDirectorAssessmentQuestionProps {
  title: string;
  prompt: string;
  points: number;
  params: OrderDirectorAssessmentParams;
  inputName: string;
}

export function OrderDirectorAssessmentQuestion({
  title,
  prompt,
  points,
  params,
  inputName,
}: OrderDirectorAssessmentQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const problem = useMemo(
    () => generateOrderExpression(params.seed, params.difficulty),
    [params.seed, params.difficulty],
  );

  const display = params.expression || tokensToDisplay(problem.tokens);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-900">
          {points} pkt
        </span>
      </div>
      <p className="text-sm text-slate-700">{prompt}</p>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="font-mono text-3xl font-black tabular-nums text-slate-900">{display}</p>
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
              onClick={() => setSelectedIndex(index)}
              className={`min-h-12 min-w-12 rounded-xl px-4 text-xl font-black transition ${
                isSelected
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
              aria-pressed={isSelected}
              aria-label={`Wybierz działanie ${token.value}`}
            >
              {token.value}
            </button>
          );
        })}
      </div>

      <input type="hidden" name={`${inputName}.kind`} value="order-director" />
      <input
        type="hidden"
        name={`${inputName}.selectedOperatorIndex`}
        value={selectedIndex ?? ""}
      />
    </Card>
  );
}

export function isOrderDirectorAssessmentParams(
  params: unknown,
): params is OrderDirectorAssessmentParams {
  if (!params || typeof params !== "object") return false;
  const record = params as Record<string, unknown>;
  return (
    typeof record.seed === "number" &&
    typeof record.difficulty === "string" &&
    typeof record.slotId === "string"
  );
}
