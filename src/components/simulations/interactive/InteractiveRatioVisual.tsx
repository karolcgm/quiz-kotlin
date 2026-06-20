"use client";

import { Card } from "@/components/ui/Card";
import { NumericStepper, TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { RatioBarVisual } from "@/components/tests/widgets/RatioBarVisual";
import { formatRatio, simplifyRatio } from "@/lib/math/ratio";
import { isRatioParams } from "@/lib/simulations/simulatorTaskMode";
import type { RatioQuestionParams } from "@/types/testWidget";
import type { TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveRatioVisualProps {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  ratioPair: { partA: number; partB: number };
  onRatioPairChange: (value: { partA: number; partB: number }) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveRatioVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  ratioPair,
  onRatioPairChange,
  onChange,
}: InteractiveRatioVisualProps) {
  if (!isRatioParams(params)) {
    return null;
  }

  const displayParams =
    mode === "task" && targetParams && isRatioParams(targetParams) ? targetParams : params;
  const ratioParams = displayParams as RatioQuestionParams;
  const ask = ratioParams.ask;
  const simplified = simplifyRatio(ratioParams.partA, ratioParams.partB);
  const hideSimplified = mode === "task" && ask === "simplify" && !showSolution;

  const expected =
    ask === "simplify"
      ? null
      : ask === "left"
        ? ratioParams.partA
        : ask === "right"
          ? ratioParams.partB
          : ratioParams.partA + ratioParams.partB;

  const selectPart = (side: "left" | "right" | "total") => {
    if (mode === "task" || ask === "simplify") return;

    if (side === "left") {
      onChange({ ...params, ask: "left" });
      onNumericResultChange((params as RatioQuestionParams).partA);
      return;
    }
    if (side === "right") {
      onChange({ ...params, ask: "right" });
      onNumericResultChange((params as RatioQuestionParams).partB);
      return;
    }
    onChange({ ...params, ask: "total" });
    onNumericResultChange((params as RatioQuestionParams).partA + (params as RatioQuestionParams).partB);
  };

  const demoParams = params as RatioQuestionParams;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <h3 className="text-2xl font-bold text-slate-900">
          {slug === "proporcje" || ask === "simplify" ? "Proporcje i uproszczenie" : "Stosunek — model paska"}
        </h3>
      )}

      <RatioBarVisual
        params={ratioParams}
        revealAnswer={mode === "demo" || showSolution}
        expected={expected}
        simplified={hideSimplified ? null : simplified}
      />

      <div className="rounded-2xl bg-slate-50 p-4 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Stosunek początkowy</p>
        <p className="mt-1 text-4xl font-black text-indigo-700">
          {ratioParams.partA} : {ratioParams.partB}
        </p>
        {(mode === "demo" || showSolution) && !compactChrome && (
          <p className="mt-3 text-2xl font-black text-emerald-700">
            Uproszczony: {formatRatio(simplified.partA, simplified.partB)}
          </p>
        )}
      </div>

      {ask === "simplify" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mode === "demo" ? (
            <>
              <NumericStepper
                label="Lewa liczba stosunku"
                value={demoParams.partA}
                onChange={(value) => onChange({ ...params, partA: Math.max(1, value) })}
                step={1}
              />
              <NumericStepper
                label="Prawa liczba stosunku"
                value={demoParams.partB}
                onChange={(value) => onChange({ ...params, partB: Math.max(1, value) })}
                step={1}
              />
            </>
          ) : (
            <>
              <NumericStepper
                label="Uproszczona lewa"
                value={ratioPair.partA}
                onChange={(value) => onRatioPairChange({ ...ratioPair, partA: Math.max(1, value) })}
                step={1}
                highlight
              />
              <NumericStepper
                label="Uproszczona prawa"
                value={ratioPair.partB}
                onChange={(value) => onRatioPairChange({ ...ratioPair, partB: Math.max(1, value) })}
                step={1}
                highlight
              />
            </>
          )}
          {mode === "task" && showSolution && !compactChrome && (
            <div className="sm:col-span-2 rounded-xl bg-emerald-50 p-3 text-center font-bold text-emerald-800">
              Rozwiązanie: {formatRatio(simplified.partA, simplified.partB)}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectPart("left")}
              className="rounded-lg bg-indigo-100 px-3 py-2 text-sm font-semibold text-indigo-900"
            >
              Kliknij część A
            </button>
            <button
              type="button"
              onClick={() => selectPart("right")}
              className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900"
            >
              Kliknij część B
            </button>
            <button
              type="button"
              onClick={() => selectPart("total")}
              className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900"
            >
              Policz całość
            </button>
          </div>
          <TaskAnswerPanel
            mode={mode}
            label="Twój wynik (+ / −)"
            value={numericResult ?? 0}
            onChange={onNumericResultChange}
            showSolution={showSolution}
            expected={expected}
            step={1}
            compactChrome={compactChrome}
          />
        </>
      )}

      {mode === "demo" && !compactChrome && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["simplify", "Uprość stosunek"],
              ["total", "Policz całość"],
              ["left", "Część A"],
              ["right", "Część B"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ ...params, ask: value })}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                demoParams.ask === value ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {!compactChrome && (
        <LessonNote>
          Aby uprościć stosunek 2:6, znajdź największy wspólny dzielnik (tu: 2) i podziel obie liczby. Wynik
          to 1:3. W zadaniu wpisuj uproszczony stosunek przyciskami + / −.
        </LessonNote>
      )}
    </Card>
  );
}
