"use client";

import { Card } from "@/components/ui/Card";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { formatPlaceValueSummary } from "@/lib/math/placeValue";
import { isArithmeticParams } from "@/lib/simulations/simulatorTaskMode";
import type { ArithmeticQuestionParams } from "@/types/testWidget";
import type { TestWidgetParams } from "@/types/testWidget";

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

interface InteractiveArithmeticVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveArithmeticVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveArithmeticVisualProps) {
  if (!isArithmeticParams(params)) {
    return null;
  }

  const taskParams =
    mode === "task" && targetParams && isArithmeticParams(targetParams) ? targetParams : params;
  const expected = arithmeticResult(taskParams);
  const userAnswer = numericResult ?? (mode === "demo" ? expected : 0);
  const hideSolution = mode === "task" && !showSolution;
  const isAddSubtract = taskParams.operation === "add" || taskParams.operation === "subtract";
  const groupCount = Math.min(Math.max(taskParams.left, 0), 12);
  const itemCount = Math.min(Math.max(taskParams.right, 0), 12);

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Działanie</h3>
          <p className="text-center text-4xl font-black text-indigo-700">
            {taskParams.left} {operationSymbol(taskParams.operation)} {taskParams.right}
          </p>
        </>
      )}

      {compactChrome && (
        <p className="text-center text-4xl font-black text-indigo-700">
          {taskParams.left} {operationSymbol(taskParams.operation)} {taskParams.right}
        </p>
      )}

      {taskParams.operation === "multiply" && (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(groupCount, 1)}, minmax(0, 1fr))` }}>
          {Array.from({ length: groupCount }).map((_, groupIndex) => (
            <div key={groupIndex} className="rounded-xl bg-white p-2 shadow-sm">
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: itemCount }).map((__, dotIndex) => (
                  <span key={dotIndex} className="h-4 w-4 rounded-full bg-indigo-500" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAddSubtract && (
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <PlaceValueVisual value={taskParams.left} label="Liczba 1" accent="indigo" />
          <div className="text-center text-3xl font-black text-slate-400">
            {taskParams.operation === "subtract" ? "−" : "+"}
          </div>
          <PlaceValueVisual value={taskParams.right} label="Liczba 2" accent="emerald" />
        </div>
      )}

      {taskParams.operation === "divide" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <PlaceValueVisual value={taskParams.left} label="Dzielna" accent="indigo" />
          <PlaceValueVisual value={taskParams.right} label="Dzielnik" accent="amber" />
        </div>
      )}

      {isAddSubtract && !compactChrome && (
        <>
          <PlaceValueVisual
            value={hideSolution ? userAnswer : expected}
            label={hideSolution ? "Twój wynik (model)" : "Wynik"}
            accent="sky"
          />
          <p className="text-center text-sm font-semibold text-slate-600">
            {formatPlaceValueSummary(expected)}
          </p>
        </>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-3">
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
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Wynik
            <input
              type="number"
              value={userAnswer}
              onChange={(event) => onNumericResultChange(Number(event.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>
      )}

      <TaskAnswerPanel
        mode={mode}
        label="Twój wynik"
        value={userAnswer}
        onChange={onNumericResultChange}
        showSolution={showSolution}
        expected={expected}
        step={1}
        placeValue
        compactChrome={compactChrome}
      />

      {!compactChrome && (
        <p className="text-center text-2xl font-black text-indigo-700">
          Wynik: {hideSolution ? "?" : userAnswer}
        </p>
      )}

      {!compactChrome && (
        <LessonNote>
          Przy dużych liczbach pokazujemy setki, dziesiątki i jedności zamiast setek klocków. Wynik
          wpisujesz przyciskami + / −.
        </LessonNote>
      )}
    </Card>
  );
}
