"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { IntegerAnswerInput } from "@/components/tests/widgets/IntegerAnswerInput";
import type { NumberLineQuestionParams } from "@/types/testWidget";
interface NumberLineQuestionProps {
  params: NumberLineQuestionParams;
  inputName?: string;
  initialAnswer?: number;
  readOnly?: boolean;
  revealAnswer?: boolean;
}

function valueToX(value: number) {
  const min = -20;
  const max = 20;
  const padding = 36;
  const width = 520;
  return padding + ((value - min) / (max - min)) * (width - padding * 2);
}

export function NumberLineQuestion({
  params,
  inputName = "answer",
  initialAnswer,
  readOnly = false,
  revealAnswer = false,
}: NumberLineQuestionProps) {
  const result = params.start + params.change;

  const svg = useMemo(() => {
    const width = 520;
    const height = 140;
    const axisY = 84;
    const startX = valueToX(params.start);
    const endX = valueToX(result);
    const directionX = params.change >= 0 ? Math.min(startX + 70, 484) : Math.max(startX - 70, 36);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-label="Pytanie z osią liczbową">
        <defs>
          <marker id="question-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>
        <line x1="36" y1={axisY} x2="484" y2={axisY} stroke="#334155" strokeWidth="3" />
        {[-20, -10, 0, 10, 20].map((tick) => {
          const x = valueToX(tick);
          return (
            <g key={tick}>
              <line x1={x} y1={axisY - 10} x2={x} y2={axisY + 10} stroke="#94a3b8" strokeWidth="2" />
              <text x={x} y={axisY + 30} textAnchor="middle" className="fill-slate-600 text-xs font-bold">
                {tick}
              </text>
            </g>
          );
        })}
        <line
          x1={startX}
          y1="44"
          x2={revealAnswer ? endX : directionX}
          y2="44"
          stroke="#6366f1"
          strokeWidth="4"
          markerEnd="url(#question-arrow)"
        />
        <circle cx={startX} cy={axisY} r="8" fill="#0ea5e9" />
        {revealAnswer && <circle cx={endX} cy={axisY} r="8" fill="#6366f1" />}
      </svg>
    );
  }, [params.change, params.start, result, revealAnswer]);

  const sign = params.change >= 0 ? "+" : "-";

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Oś liczbowa</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          {params.start} {sign} {Math.abs(params.change)} = ?
        </h3>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3">{svg}</div>
      <div className="space-y-2">
        <label htmlFor={inputName} className="font-semibold text-slate-800">
          Wpisz wynik
        </label>
        <input type="hidden" name={`${inputName}.kind`} value="number-line" />
        <input type="hidden" name={`${inputName}.start`} value={params.start} />
        <input type="hidden" name={`${inputName}.change`} value={params.change} />
        <IntegerAnswerInput
          id={inputName}
          name={`${inputName}.result`}
          readOnly={readOnly}
          defaultValue={readOnly ? (initialAnswer ?? result) : null}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-bold"
        />
      </div>
    </Card>
  );
}
