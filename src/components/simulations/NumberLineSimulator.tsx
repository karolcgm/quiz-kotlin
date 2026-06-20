"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { buildEquation, describeMovement } from "@/lib/math/numberLine";

const MIN = -20;
const MAX = 20;

const QUICK_EXAMPLES = [
  { label: "4 + 3", start: 4, change: 3 },
  { label: "4 − 7", start: 4, change: -7 },
  { label: "−3 + 8", start: -3, change: 8 },
  { label: "−5 − 4", start: -5, change: -4 },
];

function valueToX(value: number, width: number, padding: number): number {
  const range = MAX - MIN;
  const ratio = (value - MIN) / range;
  return padding + ratio * (width - padding * 2);
}

export function NumberLineSimulator() {
  const [start, setStart] = useState(4);
  const [change, setChange] = useState(-7);

  const result = start + change;
  const equation = buildEquation(start, change, result);
  const movementComment = describeMovement(change);

  const svg = useMemo(() => {
    const width = 900;
    const height = 220;
    const padding = 40;
    const axisY = 120;
    const startX = valueToX(start, width, padding);
    const endX = valueToX(result, width, padding);
    const arrowY = 70;

    const ticks = [];
    for (let value = MIN; value <= MAX; value += 1) {
      const x = valueToX(value, width, padding);
      const isMajor = value % 5 === 0;
      ticks.push(
        <g key={value}>
          <line
            x1={x}
            y1={axisY - (isMajor ? 12 : 7)}
            x2={x}
            y2={axisY + (isMajor ? 12 : 7)}
            stroke="#94a3b8"
            strokeWidth={isMajor ? 2 : 1}
          />
          {isMajor && (
            <text x={x} y={axisY + 32} textAnchor="middle" className="fill-slate-600 text-sm">
              {value}
            </text>
          )}
        </g>,
      );
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Oś liczbowa od ${MIN} do ${MAX}`}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#6366f1" />
          </marker>
        </defs>
        <line x1={padding} y1={axisY} x2={width - padding} y2={axisY} stroke="#334155" strokeWidth={3} />
        {ticks}
        {change !== 0 && (
          <line
            x1={startX}
            y1={arrowY}
            x2={endX}
            y2={arrowY}
            stroke="#6366f1"
            strokeWidth={4}
            markerEnd="url(#arrowhead)"
          />
        )}
        <circle cx={startX} cy={axisY} r={10} fill="#0ea5e9" />
        <circle cx={endX} cy={axisY} r={10} fill="#6366f1" />
        <text x={startX} y={axisY - 24} textAnchor="middle" className="fill-sky-700 text-base font-bold">
          start: {start}
        </text>
        <text x={endX} y={axisY - 24} textAnchor="middle" className="fill-indigo-700 text-base font-bold">
          wynik: {result}
        </text>
      </svg>
    );
  }, [start, change, result]);

  return (
    <div className="space-y-6">
      <Card className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Slider
            id="start-value"
            label="Wartość startowa"
            value={start}
            min={MIN}
            max={MAX}
            onChange={setStart}
          />
          <Slider
            id="change-value"
            label="Zmiana (dodaj / odejmij)"
            value={change}
            min={MIN}
            max={MAX}
            onChange={setChange}
          />
        </div>

        <div className="rounded-2xl bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Działanie</p>
          <p className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">{equation}</p>
          <p className="mt-3 text-lg text-indigo-700">{movementComment}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
          {svg}
        </div>

        <div className="flex flex-wrap gap-3">
          {QUICK_EXAMPLES.map((example) => (
            <Button
              key={example.label}
              variant="secondary"
              onClick={() => {
                setStart(example.start);
                setChange(example.change);
              }}
            >
              {example.label}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-xl font-bold text-slate-900">Co pokazuje ta symulacja?</h3>
          <p className="mt-3 leading-relaxed text-slate-700">
            Dodawanie liczby dodatniej przesuwa punkt w prawo. Odejmowanie liczby dodatniej przesuwa
            punkt w lewo. Liczby ujemne działają odwrotnie: dodanie ujemnej liczby to ruch w lewo, a
            odjęcie ujemnej — ruch w prawo.
          </p>
        </Card>
        <Card>
          <h3 className="text-xl font-bold text-slate-900">Jak użyć na lekcji?</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed text-slate-700">
            <li>Ustaw wartość startową 4.</li>
            <li>Ustaw zmianę −7.</li>
            <li>Zapytaj uczniów, w którą stronę przesunie się punkt.</li>
            <li>Pokaż wynik −3.</li>
            <li>Powtórz dla kilku przykładów z przycisków szybkich.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
