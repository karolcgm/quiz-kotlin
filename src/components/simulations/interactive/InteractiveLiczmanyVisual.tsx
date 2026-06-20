"use client";

import { Card } from "@/components/ui/Card";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { formatPlaceValueSummary } from "@/lib/math/placeValue";
import { isArithmeticParams } from "@/lib/simulations/simulatorTaskMode";
import type { ArithmeticQuestionParams, TestWidgetParams } from "@/types/testWidget";

function operationSymbol(operation: ArithmeticQuestionParams["operation"]) {
  if (operation === "add") return "+";
  if (operation === "subtract") return "−";
  if (operation === "multiply") return "·";
  return ":";
}

function arithmeticResult(params: ArithmeticQuestionParams) {
  if (params.operation === "add") return params.left + params.right;
  if (params.operation === "subtract") return params.left - params.right;
  if (params.operation === "multiply") return params.left * params.right;
  return params.left / params.right;
}

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveLiczmanyVisualProps {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveLiczmanyVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveLiczmanyVisualProps) {
  if (!isArithmeticParams(params)) {
    return null;
  }

  const taskParams =
    mode === "task" && targetParams && isArithmeticParams(targetParams) ? targetParams : params;
  const expected = arithmeticResult(taskParams);
  const userAnswer = numericResult ?? 0;
  const isSubtract = taskParams.operation === "subtract";
  const title =
    slug.includes("odejm") || isSubtract ? "Liczmany — odejmowanie" : "Liczmany — dodawanie";

  return (
    <Card className="space-y-4">
      {!compactChrome && <h3 className="text-2xl font-bold text-slate-900">{title}</h3>}
      <p className="text-center text-4xl font-black text-indigo-700">
        {taskParams.left} {operationSymbol(taskParams.operation)} {taskParams.right}
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <PlaceValueVisual value={taskParams.left} label="Pierwszy zbiór" accent="indigo" />
        <div className="text-center text-3xl font-black text-slate-400">
          {isSubtract ? "−" : "+"}
        </div>
        <PlaceValueVisual
          value={taskParams.right}
          label={isSubtract ? "Odejmujemy" : "Drugi zbiór"}
          accent={isSubtract ? "amber" : "emerald"}
        />
      </div>

      {!isSubtract && (
        <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 p-3 text-center text-sm font-semibold text-indigo-800">
          Łączymy zbiory — nie dodajemy setek klocków, tylko liczymy setki + dziesiątki + jedności.
        </div>
      )}

      {isSubtract && (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-3 text-center text-sm font-semibold text-amber-900">
          Z pierwszego zbioru „zabieramy” drugi — widać to na układzie wartości pozycyjnych.
        </div>
      )}

      {!compactChrome && (
        <>
          <PlaceValueVisual
            value={mode === "demo" || showSolution ? expected : userAnswer}
            label={mode === "task" && !showSolution ? "Twój wynik (model)" : "Wynik"}
            accent="sky"
          />
          <p className="text-center text-sm font-semibold text-slate-600">
            {formatPlaceValueSummary(expected)}
          </p>
        </>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Liczba 1
            <input
              type="number"
              value={params.left}
              onChange={(event) => onChange({ ...params, left: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Liczba 2
            <input
              type="number"
              value={params.right}
              onChange={(event) => onChange({ ...params, right: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      )}

      <TaskAnswerPanel
        mode={mode}
        label="Twój wynik (+ / −)"
        value={userAnswer}
        onChange={onNumericResultChange}
        showSolution={showSolution}
        expected={expected}
        step={1}
        placeValue
        compactChrome={compactChrome}
      />

      {!compactChrome && (
        <LessonNote>
          Przy dużych liczbach (np. 130) pokazujemy bloczki setek i dziesiątek zamiast 130 kropek.
          Wynik wpisujesz przyciskami + / −.
        </LessonNote>
      )}
    </Card>
  );
}
