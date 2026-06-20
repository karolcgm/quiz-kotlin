"use client";

import { Card } from "@/components/ui/Card";
import { buildWidgetPrompt } from "@/lib/simulations/registry";
import { getStudentSteps, formatExpectedAnswer, getExpectedAnswer } from "@/lib/simulations/taskHints";
import type { TestWidgetParams } from "@/types/testWidget";

interface SimulatorTaskHintsProps {
  slug: string;
  params: TestWidgetParams;
  revealAnswer: boolean;
  taskMode?: boolean;
}

export function SimulatorTaskHints({ slug, params, revealAnswer, taskMode = false }: SimulatorTaskHintsProps) {
  const steps = getStudentSteps(params, slug);
  const expected = getExpectedAnswer(slug, params);
  const prompt = buildWidgetPrompt(slug, params);

  return (
    <Card className="space-y-4">
      {(taskMode || revealAnswer) && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">
            {taskMode ? "Treść zadania" : "Przykład"}
          </p>
          <p className="mt-1 text-lg font-bold leading-snug text-indigo-950">{prompt}</p>
        </div>
      )}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-bold text-amber-950">Co mam zrobić?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-amber-900">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      {revealAnswer && expected && (
        <div className="rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800">
          Odpowiedź: {formatExpectedAnswer(expected)}
        </div>
      )}
    </Card>
  );
}
