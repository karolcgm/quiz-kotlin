"use client";

import { Card } from "@/components/ui/Card";
import { BalanceScaleVisual } from "@/components/simulations/shared/BalanceScaleVisual";
import { CrocodileComparisonVisual } from "@/components/simulations/shared/CrocodileComparisonVisual";
import { NumericStepper, TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import {
  comparisonRelation,
  formatNumberWithMissing,
  isMissingDigitTask,
  missingDigitExpected,
} from "@/lib/math/comparisonDisplay";
import { isComparisonParams } from "@/lib/simulations/simulatorTaskMode";
import type { ComparisonQuestionParams, TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

function randomMissingSide(): "left" | "right" {
  return Math.random() > 0.5 ? "left" : "right";
}

interface InteractiveWeightComparisonVisualProps {
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  comparisonSign: "<" | "=" | ">" | null;
  onComparisonSignChange: (value: "<" | "=" | ">") => void;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveWeightComparisonVisual({
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  comparisonSign: selectedSign,
  onComparisonSignChange,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveWeightComparisonVisualProps) {
  if (!isComparisonParams(params)) {
    return null;
  }

  const display: ComparisonQuestionParams =
    mode === "task" && targetParams && isComparisonParams(targetParams) ? targetParams : params;
  const ask = display.ask ?? "sign";
  const missingTask = isMissingDigitTask(display);
  const relation = comparisonRelation(display.left, display.right);
  const currentSign = selectedSign ?? (mode === "demo" ? relation : "=");
  const hideSolution = mode === "task" && !showSolution;
  const expectedDigit = missingTask ? missingDigitExpected(display) : null;
  const userDigit = numericResult ?? 0;

  const missingSide = display.missingSide ?? "left";
  const missingIndex = display.missingIndex ?? 0;
  const leftDisplay = missingTask && missingSide === "left"
    ? formatNumberWithMissing(display.left, missingIndex, showSolution || mode === "demo")
    : String(display.left);
  const rightDisplay = missingTask && missingSide === "right"
    ? formatNumberWithMissing(display.right, missingIndex, showSolution || mode === "demo")
    : String(display.right);

  const switchToMissingDigit = () => {
    const side = randomMissingSide();
    const value = side === "left" ? params.left : params.right;
    const digits = String(Math.max(10, Math.round(value)));
    onChange({
      ...params,
      ask: "missingDigit",
      missingSide: side,
      missingIndex: Math.min(1, digits.length - 1),
      left: side === "left" ? Math.max(100, params.left) : params.left,
      right: side === "right" ? Math.max(100, params.right) : params.right,
    });
  };

  return (
    <Card className="space-y-5">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Porównywanie na wadze</h3>
          <p className="text-sm font-semibold text-slate-600">
            {missingTask
              ? "Krokodyl zjadł jedną cyfrę — odtwórz liczbę i zobacz, którą stronę „gryzie”."
              : "Krokodyl zawsze patrzy na większą liczbę. Waga pokazuje, która szalka cięższa."}
          </p>
        </>
      )}

      <BalanceScaleVisual
        left={display.left}
        right={display.right}
        leftLabel={missingTask && missingSide === "left" ? "brak cyfry" : undefined}
        rightLabel={missingTask && missingSide === "right" ? "brak cyfry" : undefined}
      />

      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl bg-indigo-50 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Lewa liczba</p>
          <p className="mt-2 font-mono text-5xl font-black tracking-widest text-indigo-800">{leftDisplay}</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          {!missingTask && (
            <>
              <CrocodileComparisonVisual
                direction={hideSolution ? "=" : currentSign}
                size="lg"
                label="Twój krokodyl"
              />
              <div className="flex flex-wrap justify-center gap-2">
                <CrocodileComparisonVisual
                  direction=">"
                  selected={currentSign === ">"}
                  onClick={() => onComparisonSignChange(">")}
                  label="Lewa większa"
                />
                <CrocodileComparisonVisual
                  direction="="
                  selected={currentSign === "="}
                  onClick={() => onComparisonSignChange("=")}
                  label="Równe"
                />
                <CrocodileComparisonVisual
                  direction="<"
                  selected={currentSign === "<"}
                  onClick={() => onComparisonSignChange("<")}
                  label="Prawa większa"
                />
              </div>
            </>
          )}
          {missingTask && (
            <CrocodileComparisonVisual direction={relation} size="lg" label="Krokodyl wie prawdę" />
          )}
        </div>

        <div className="rounded-2xl bg-emerald-50 p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">Prawa liczba</p>
          <p className="mt-2 font-mono text-5xl font-black tracking-widest text-emerald-800">{rightDisplay}</p>
        </div>
      </div>

      {!missingTask && (
        <p className="text-center text-2xl font-black text-slate-800">
          {display.left}{" "}
          <span className="mx-1 inline-block min-w-[2rem] text-3xl text-emerald-700">
            {hideSolution ? "?" : currentSign}
          </span>{" "}
          {display.right}
        </p>
      )}

      {missingTask && (
        <TaskAnswerPanel
          mode={mode}
          label="Którą cyfrę zjadł krokodyl?"
          value={userDigit}
          onChange={(value) => onNumericResultChange(Math.min(9, Math.max(0, value)))}
          showSolution={showSolution}
          expected={expectedDigit ?? 0}
          step={1}
          compactChrome={compactChrome}
        />
      )}

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Typ zadania
            <select
              value={ask}
              onChange={(event) => {
                const nextAsk = event.target.value as ComparisonQuestionParams["ask"];
                if (nextAsk === "missingDigit") {
                  switchToMissingDigit();
                  return;
                }
                onChange({ left: params.left, right: params.right, ask: "sign" });
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="sign">Krokodyl — większa / mniejsza / równa</option>
              <option value="missingDigit">Krokodyl zjadł cyfrę</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Lewa liczba
            <input
              type="number"
              value={params.left}
              onChange={(event) => onChange({ ...params, left: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm font-semibold text-slate-700">
            Prawa liczba
            <input
              type="number"
              value={params.right}
              onChange={(event) => onChange({ ...params, right: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          {missingTask && (
            <>
              <label className="space-y-1 text-sm font-semibold text-slate-700">
                Brakująca cyfra po
                <select
                  value={missingSide}
                  onChange={(event) =>
                    onChange({
                      ...params,
                      missingSide: event.target.value as "left" | "right",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                  <option value="left">Lewej stronie</option>
                  <option value="right">Prawej stronie</option>
                </select>
              </label>
              <NumericStepper
                label="Indeks ukrytej cyfry (0 = pierwsza)"
                value={missingIndex}
                onChange={(value) => onChange({ ...params, missingIndex: Math.min(3, Math.max(0, value)) })}
                step={1}
                min={0}
              />
            </>
          )}
        </div>
      )}

      {!compactChrome && (
        <LessonNote>
          Krokodyl zawsze „gryzie” większą liczbę — to zamiennik znaków &lt; i &gt;. Waga przechyla się na
          cięższą stronę. W zadaniu z zjedzoną cyfrą użyj + / −, aby wpisać brakującą cyfrę od 0 do 9.
        </LessonNote>
      )}
    </Card>
  );
}
