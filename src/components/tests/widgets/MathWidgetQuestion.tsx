"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type {
  ArithmeticQuestionParams,
  ComparisonQuestionParams,
  FractionPartQuestionParams,
  RectangleQuestionParams,
  TestWidgetParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";

interface MathWidgetQuestionProps {
  slug: string;
  params: TestWidgetParams;
  inputName?: string;
  readOnly?: boolean;
  revealAnswer?: boolean;
}

function hasNumberResult(params: TestWidgetParams) {
  return "start" in params || "operation" in params || "ask" in params || "fromUnit" in params;
}

function isArithmeticParams(params: TestWidgetParams): params is ArithmeticQuestionParams {
  return "operation" in params;
}

function isFractionParams(params: TestWidgetParams): params is FractionPartQuestionParams {
  return "numerator" in params && "denominator" in params;
}

function isRectangleParams(params: TestWidgetParams): params is RectangleQuestionParams {
  return "width" in params && "height" in params;
}

function isUnitParams(params: TestWidgetParams): params is UnitConversionQuestionParams {
  return "fromUnit" in params && "toUnit" in params;
}

function isComparisonParams(params: TestWidgetParams): params is ComparisonQuestionParams {
  return "left" in params && "right" in params && !("operation" in params);
}

function operationSymbol(operation: ArithmeticQuestionParams["operation"]) {
  if (operation === "add") return "+";
  if (operation === "subtract") return "-";
  if (operation === "multiply") return "·";
  return ":";
}

function expectedNumeric(slug: string, params: TestWidgetParams) {
  const widget = getAssessmentWidget(slug);
  const result = widget?.grade(params, { result: Number.NaN }, 1).expectedAnswer;
  return result && "result" in result ? result.result : null;
}

function VisualModel({ slug, params, revealAnswer }: { slug: string; params: TestWidgetParams; revealAnswer: boolean }) {
  if (isArithmeticParams(params)) {
    const groupCount = Math.max(0, Math.min(params.left, 12));
    const itemCount = Math.max(0, Math.min(params.right, 12));
    const groups = params.operation === "multiply" ? Array.from({ length: groupCount }) : [];
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="text-center text-4xl font-black text-indigo-700">
          {params.left} {operationSymbol(params.operation)} {params.right}
        </div>
        {groups.length > 0 && (
          <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${groupCount}, minmax(0, 1fr))` }}>
            {groups.map((_, groupIndex) => (
              <div key={groupIndex} className="rounded-xl bg-white p-2 shadow-sm">
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: itemCount }).map((__, dotIndex) => (
                    <span key={dotIndex} className="h-3 w-3 rounded-full bg-indigo-500" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isFractionParams(params)) {
    const pieces = Array.from({ length: params.denominator });
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <div className="mx-auto grid max-w-sm grid-cols-4 gap-2">
          {pieces.map((_, index) => (
            <div
              key={index}
              className={`aspect-square rounded-xl border border-indigo-100 ${
                index < params.numerator ? "bg-indigo-500" : "bg-white"
              }`}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-slate-600">
          Zaznaczono {params.numerator} z {params.denominator} równych części.
        </p>
      </div>
    );
  }

  if (isRectangleParams(params)) {
    const expected = expectedNumeric(slug, params);
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <svg viewBox="0 0 260 180" className="mx-auto max-h-56 w-full" role="img" aria-label="Prostokąt na kratkach">
          <rect x="40" y="30" width="180" height="110" rx="12" fill="#dbeafe" stroke="#4f46e5" strokeWidth="4" />
          <text x="130" y="22" textAnchor="middle" className="fill-slate-700 text-sm font-bold">
            {params.width}
          </text>
          <text x="232" y="90" textAnchor="middle" className="fill-slate-700 text-sm font-bold">
            {params.height}
          </text>
        </svg>
        {revealAnswer && expected !== null && (
          <p className="text-center font-bold text-indigo-700">Odpowiedź: {expected}</p>
        )}
      </div>
    );
  }

  if (isUnitParams(params)) {
    return (
      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-4">
        {(["mm", "cm", "m", "km"] as const).map((unit) => (
          <div
            key={unit}
            className={`rounded-xl p-3 text-center font-bold ${
              unit === params.fromUnit || unit === params.toUnit ? "bg-indigo-600 text-white" : "bg-white text-slate-700"
            }`}
          >
            {unit}
          </div>
        ))}
      </div>
    );
  }

  if (isComparisonParams(params)) {
    return (
      <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-5 text-center text-4xl font-black text-indigo-700">{params.left}</div>
        <div className="rounded-xl bg-white p-5 text-center text-4xl font-black text-emerald-700">{params.right}</div>
      </div>
    );
  }

  return <div className="rounded-2xl bg-slate-50 p-4 text-slate-600">Model wizualny zadania.</div>;
}

export function MathWidgetQuestion({
  slug,
  params,
  inputName = "answer",
  readOnly = false,
  revealAnswer = false,
}: MathWidgetQuestionProps) {
  const widget = getAssessmentWidget(slug);
  const expected = widget?.grade(params, isFractionParams(params) ? { numerator: 0, denominator: 1 } : { result: 0 }, 1)
    .expectedAnswer;
  const [numericAnswer, setNumericAnswer] = useState(0);
  const [fractionNumerator, setFractionNumerator] = useState(1);
  const [fractionDenominator, setFractionDenominator] = useState(2);
  const [comparison, setComparison] = useState<"<" | "=" | ">">("=");
  const prompt = useMemo(() => buildWidgetPrompt(slug, params), [params, slug]);
  const displayedNumericAnswer = readOnly && expected && "result" in expected ? expected.result : numericAnswer;
  const displayedFractionNumerator =
    readOnly && expected && "numerator" in expected ? expected.numerator : fractionNumerator;
  const displayedFractionDenominator =
    readOnly && expected && "denominator" in expected ? expected.denominator : fractionDenominator;
  const displayedComparison = readOnly && expected && "comparison" in expected ? expected.comparison : comparison;

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          {widget?.title ?? "Widget matematyczny"}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">{prompt}</h3>
        <p className="mt-2 text-sm text-slate-600">{widget?.lessonUse}</p>
      </div>

      <VisualModel slug={slug} params={params} revealAnswer={revealAnswer} />

      {hasNumberResult(params) && (
        <div className="space-y-2">
          <label htmlFor={inputName} className="font-semibold text-slate-800">
            Wpisz wynik
          </label>
          <input type="hidden" name={`${inputName}.kind`} value="numeric" />
          <input
            id={inputName}
            name={`${inputName}.result`}
            type="number"
            step="0.001"
            value={displayedNumericAnswer}
            onChange={(event) => setNumericAnswer(Number(event.target.value))}
            readOnly={readOnly}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold"
          />
        </div>
      )}

      {isFractionParams(params) && (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <input type="hidden" name={`${inputName}.kind`} value="fraction" />
          <input
            name={`${inputName}.numerator`}
            type="number"
            value={displayedFractionNumerator}
            min={0}
            onChange={(event) => setFractionNumerator(Number(event.target.value))}
            readOnly={readOnly}
            className="rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold"
            aria-label="Licznik"
          />
          <span className="self-center text-center text-2xl font-black text-slate-500">/</span>
          <input
            name={`${inputName}.denominator`}
            type="number"
            value={displayedFractionDenominator}
            min={1}
            onChange={(event) => setFractionDenominator(Number(event.target.value))}
            readOnly={readOnly}
            className="rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold"
            aria-label="Mianownik"
          />
        </div>
      )}

      {isComparisonParams(params) && (
        <div className="space-y-2">
          <input type="hidden" name={`${inputName}.kind`} value="comparison" />
          <label htmlFor={`${inputName}.comparison`} className="font-semibold text-slate-800">
            Wybierz znak
          </label>
          <select
            id={`${inputName}.comparison`}
            name={`${inputName}.comparison`}
            value={displayedComparison}
            onChange={(event) => setComparison(event.target.value as "<" | "=" | ">")}
            disabled={readOnly}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold"
          >
            <option value="<">&lt;</option>
            <option value="=">=</option>
            <option value=">">&gt;</option>
          </select>
        </div>
      )}

      {revealAnswer && expected && (
        <div className="rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800">
          Odpowiedź: {"result" in expected
            ? expected.result
            : "comparison" in expected
              ? expected.comparison
              : `${expected.numerator}/${expected.denominator}`}
        </div>
      )}
    </Card>
  );
}
