"use client";

import { useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import {
  buildRandomWidgetParams,
  getAssessmentWidget,
} from "@/lib/simulations/registry";
import { getSimulationBySlug } from "@/lib/routes";
import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import type {
  ArithmeticQuestionParams,
  ComparisonQuestionParams,
  FractionPartQuestionParams,
  RectangleQuestionParams,
  TestWidgetParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";

interface AssessmentWidgetSimulatorProps {
  slug: string;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-xl border border-slate-200 px-4 py-3"
    />
  );
}

function ManualParamControls({
  params,
  onChange,
}: {
  params: TestWidgetParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  if ("start" in params) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Liczba startowa">
          <NumberInput
            value={params.start}
            min={-100}
            max={100}
            onChange={(value) => onChange({ ...params, start: value })}
          />
        </Field>
        <Field label="Zmiana / skok">
          <NumberInput
            value={params.change}
            min={-100}
            max={100}
            onChange={(value) => onChange({ ...params, change: value })}
          />
        </Field>
      </div>
    );
  }

  if ("operation" in params) {
    const arithmeticParams = params as ArithmeticQuestionParams;

    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Pierwsza liczba">
          <NumberInput
            value={arithmeticParams.left}
            min={-1000}
            max={1000}
            onChange={(value) => onChange({ ...arithmeticParams, left: value })}
          />
        </Field>
        <Field label="Działanie">
          <select
            value={arithmeticParams.operation}
            onChange={(event) =>
              onChange({
                ...arithmeticParams,
                operation: event.target.value as ArithmeticQuestionParams["operation"],
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="add">Dodawanie</option>
            <option value="subtract">Odejmowanie</option>
            <option value="multiply">Mnożenie</option>
            <option value="divide">Dzielenie</option>
          </select>
        </Field>
        <Field label="Druga liczba">
          <NumberInput
            value={arithmeticParams.right}
            min={arithmeticParams.operation === "divide" ? 1 : -1000}
            max={1000}
            onChange={(value) => onChange({ ...arithmeticParams, right: value })}
          />
        </Field>
      </div>
    );
  }

  if ("numerator" in params) {
    const fractionParams = params as FractionPartQuestionParams;

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Licznik">
          <NumberInput
            value={fractionParams.numerator}
            min={0}
            max={100}
            onChange={(value) => onChange({ ...fractionParams, numerator: value })}
          />
        </Field>
        <Field label="Mianownik">
          <NumberInput
            value={fractionParams.denominator}
            min={1}
            max={100}
            onChange={(value) => onChange({ ...fractionParams, denominator: Math.max(1, value) })}
          />
        </Field>
      </div>
    );
  }

  if ("width" in params) {
    const rectangleParams = params as RectangleQuestionParams;

    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Szerokość">
          <NumberInput
            value={rectangleParams.width}
            min={1}
            max={100}
            onChange={(value) => onChange({ ...rectangleParams, width: value })}
          />
        </Field>
        <Field label="Wysokość">
          <NumberInput
            value={rectangleParams.height}
            min={1}
            max={100}
            onChange={(value) => onChange({ ...rectangleParams, height: value })}
          />
        </Field>
        <Field label="Co liczymy">
          <select
            value={rectangleParams.ask}
            onChange={(event) =>
              onChange({ ...rectangleParams, ask: event.target.value as RectangleQuestionParams["ask"] })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="area">Pole</option>
            <option value="perimeter">Obwód</option>
          </select>
        </Field>
      </div>
    );
  }

  if ("fromUnit" in params) {
    const unitParams = params as UnitConversionQuestionParams;
    const units: UnitConversionQuestionParams["fromUnit"][] = ["mm", "cm", "m", "km"];

    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Wartość">
          <NumberInput
            value={unitParams.value}
            min={0}
            max={100000}
            step={0.001}
            onChange={(value) => onChange({ ...unitParams, value })}
          />
        </Field>
        <Field label="Z jednostki">
          <select
            value={unitParams.fromUnit}
            onChange={(event) =>
              onChange({
                ...unitParams,
                fromUnit: event.target.value as UnitConversionQuestionParams["fromUnit"],
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Na jednostkę">
          <select
            value={unitParams.toUnit}
            onChange={(event) =>
              onChange({
                ...unitParams,
                toUnit: event.target.value as UnitConversionQuestionParams["toUnit"],
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </Field>
      </div>
    );
  }

  if ("left" in params && "right" in params) {
    const comparisonParams = params as ComparisonQuestionParams;

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Lewa liczba">
          <NumberInput
            value={comparisonParams.left}
            min={-1000}
            max={1000}
            onChange={(value) => onChange({ ...comparisonParams, left: value })}
          />
        </Field>
        <Field label="Prawa liczba">
          <NumberInput
            value={comparisonParams.right}
            min={-1000}
            max={1000}
            onChange={(value) => onChange({ ...comparisonParams, right: value })}
          />
        </Field>
      </div>
    );
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNumericPair(params: TestWidgetParams) {
  if ("operation" in params) return { left: params.left, right: params.right };
  if ("left" in params && "right" in params) return { left: params.left, right: params.right };
  if ("start" in params) return { left: params.start, right: params.change };
  if ("width" in params) return { left: params.width, right: params.height };
  if ("numerator" in params) return { left: params.numerator, right: params.denominator };
  if ("value" in params) return { left: params.value, right: 10 };
  return { left: 6, right: 3 };
}

function LessonNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

function DivisionRemainderVisual({ params }: { params: TestWidgetParams }) {
  const { left, right } = getNumericPair(params);
  const total = clamp(Math.abs(Math.round(left)), 1, 36);
  const groups = clamp(Math.abs(Math.round(right)), 1, 9);
  const perGroup = Math.floor(total / groups);
  const remainder = total % groups;

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Schemat graficzny</p>
        <h3 className="text-2xl font-bold text-slate-900">Dzielenie z resztą</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: groups }).map((_, groupIndex) => (
          <div key={groupIndex} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
            <p className="mb-2 text-center text-sm font-bold text-indigo-800">Grupa {groupIndex + 1}</p>
            <div className="flex flex-wrap justify-center gap-1">
              {Array.from({ length: perGroup }).map((__, dotIndex) => (
                <span key={dotIndex} className="h-4 w-4 rounded-full bg-indigo-600" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-bold text-amber-900">Reszta: {remainder}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {Array.from({ length: remainder }).map((_, index) => (
            <span key={index} className="h-4 w-4 rounded-full bg-amber-500" />
          ))}
        </div>
      </div>
      <LessonNote>
        Zmień dzielną lub liczbę grup w panelu nauczyciela. Dzieci od razu zobaczą, czy elementy
        rozdzielają się po równo i co zostaje jako reszta.
      </LessonNote>
    </Card>
  );
}

function OrderTreeVisual({ params }: { params: TestWidgetParams }) {
  const { left, right } = getNumericPair(params);
  const a = clamp(Math.abs(Math.round(left)), 1, 20);
  const b = clamp(Math.abs(Math.round(right)), 1, 20);
  const c = 2;
  const sum = a + b;
  const result = sum * c;

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Drzewko działań</p>
        <h3 className="text-2xl font-bold text-slate-900">({a} + {b}) · {c} = {result}</h3>
      </div>
      <svg viewBox="0 0 560 280" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="Drzewko kolejności działań">
        <line x1="280" y1="70" x2="170" y2="145" stroke="#818cf8" strokeWidth="4" />
        <line x1="280" y1="70" x2="390" y2="145" stroke="#818cf8" strokeWidth="4" />
        <line x1="170" y1="145" x2="115" y2="220" stroke="#38bdf8" strokeWidth="4" />
        <line x1="170" y1="145" x2="225" y2="220" stroke="#38bdf8" strokeWidth="4" />
        <g>
          <circle cx="280" cy="60" r="44" fill="#4f46e5" />
          <text x="280" y="67" textAnchor="middle" className="fill-white text-xl font-black">·</text>
        </g>
        <g>
          <circle cx="170" cy="145" r="40" fill="#0ea5e9" />
          <text x="170" y="152" textAnchor="middle" className="fill-white text-xl font-black">+</text>
        </g>
        <g>
          <circle cx="390" cy="145" r="36" fill="#10b981" />
          <text x="390" y="152" textAnchor="middle" className="fill-white text-xl font-black">{c}</text>
        </g>
        <g>
          <circle cx="115" cy="220" r="34" fill="#f59e0b" />
          <text x="115" y="227" textAnchor="middle" className="fill-white text-xl font-black">{a}</text>
        </g>
        <g>
          <circle cx="225" cy="220" r="34" fill="#f59e0b" />
          <text x="225" y="227" textAnchor="middle" className="fill-white text-xl font-black">{b}</text>
        </g>
        <text x="420" y="75" className="fill-slate-700 text-base font-bold">1. Najpierw nawias: {a} + {b} = {sum}</text>
        <text x="420" y="105" className="fill-slate-700 text-base font-bold">2. Potem mnożenie: {sum} · {c} = {result}</text>
      </svg>
      <LessonNote>
        Gdy dziecko pyta „co będzie, jeśli zmienimy 2 na 10?”, zmień liczbę w panelu. Drzewko
        pokazuje, który fragment wyniku zmienia się pierwszy.
      </LessonNote>
    </Card>
  );
}

function ChartVisual({ params }: { params: TestWidgetParams }) {
  const { left, right } = getNumericPair(params);
  const values = [
    clamp(Math.abs(Math.round(left)), 1, 100),
    clamp(Math.abs(Math.round(right)), 1, 100),
    clamp(Math.abs(Math.round(left + right)), 1, 160),
  ];
  const max = Math.max(...values);

  return (
    <Card className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">Wykres porównawczy</h3>
      <svg viewBox="0 0 560 260" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="Wykres słupkowy">
        {values.map((value, index) => {
          const height = (value / max) * 160;
          const x = 90 + index * 140;
          return (
            <g key={index}>
              <rect x={x} y={210 - height} width="80" height={height} rx="12" fill={["#6366f1", "#10b981", "#f59e0b"][index]} />
              <text x={x + 40} y={235} textAnchor="middle" className="fill-slate-700 text-sm font-bold">
                {index === 0 ? "A" : index === 1 ? "B" : "Razem"}
              </text>
              <text x={x + 40} y={200 - height} textAnchor="middle" className="fill-slate-900 text-sm font-black">
                {value}
              </text>
            </g>
          );
        })}
        <line x1="50" y1="210" x2="510" y2="210" stroke="#334155" strokeWidth="3" />
      </svg>
      <LessonNote>Wykres pomaga porównać wartości i zobaczyć zmianę po ręcznej edycji danych.</LessonNote>
    </Card>
  );
}

function FractionVisual({ params }: { params: TestWidgetParams }) {
  const numerator = "numerator" in params ? clamp(params.numerator, 0, 24) : 2;
  const denominator = "denominator" in params ? clamp(params.denominator, 1, 24) : 5;

  return (
    <Card className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">Model ułamka</h3>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(denominator, 12)}, minmax(0, 1fr))` }}>
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={`h-16 rounded-xl border border-indigo-100 ${index < numerator ? "bg-indigo-500" : "bg-white"}`}
          />
        ))}
      </div>
      <p className="text-center text-3xl font-black text-indigo-700">{numerator}/{denominator}</p>
      <LessonNote>Zmiana licznika lub mianownika od razu pokazuje, jak zmienia się część całości.</LessonNote>
    </Card>
  );
}

function GeometryVisual({
  params,
  onChange,
}: {
  params: TestWidgetParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  const { left, right } = getNumericPair(params);
  const width = clamp(Math.abs(Math.round(left)), 1, 20);
  const height = clamp(Math.abs(Math.round(right)), 1, 20);
  const canDrag = "width" in params;
  const rectX = 120;
  const rectY = 70;
  const unitWidth = 18;
  const unitHeight = 14;

  const updateSizeFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!canDrag) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - bounds.left) / bounds.width) * 560;
    const viewBoxY = ((event.clientY - bounds.top) / bounds.height) * 300;
    const nextWidth = clamp(Math.round((viewBoxX - rectX) / unitWidth), 1, 20);
    const nextHeight = clamp(Math.round((viewBoxY - rectY) / unitHeight), 1, 20);

    onChange({
      ...params,
      width: nextWidth,
      height: nextHeight,
    });
  };

  return (
    <Card className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">Rysunek geometryczny</h3>
      <svg
        viewBox="0 0 560 300"
        className="w-full touch-none rounded-2xl bg-slate-50"
        role="img"
        aria-label="Figura geometryczna"
        onPointerDown={(event) => {
          if (!canDrag) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          updateSizeFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateSizeFromPointer(event);
          }
        }}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dbeafe" strokeWidth="2" />
          </pattern>
        </defs>
        <rect x="40" y="30" width="480" height="220" fill="url(#grid)" />
        <rect
          x={rectX}
          y={rectY}
          width={width * unitWidth}
          height={height * unitHeight}
          rx="12"
          fill="#bfdbfe"
          stroke="#4f46e5"
          strokeWidth="5"
        />
        <circle
          cx={rectX + width * unitWidth}
          cy={rectY + height * unitHeight}
          r="13"
          fill="#f59e0b"
          stroke="#ffffff"
          strokeWidth="4"
          className="cursor-grab"
        />
        <text x="120" y="55" className="fill-slate-800 text-base font-black">bok: {width}</text>
        <text x={135 + width * unitWidth} y={90 + height * unitHeight} className="fill-slate-800 text-base font-black">bok: {height}</text>
      </svg>
      <LessonNote>
        Złap pomarańczowy narożnik i przeciągnij go po kratkach. Wymiary, pole/obwód i odpowiedź
        zmienią się od razu.
      </LessonNote>
    </Card>
  );
}

function MeasurementVisual({
  params,
  onChange,
}: {
  params: TestWidgetParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  const value = "value" in params ? params.value : getNumericPair(params).left;
  const displayValue = clamp(Math.abs(Math.round(value)), 0, 100);
  const canDrag = "value" in params;

  const updateValueFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!canDrag) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const viewBoxX = ((event.clientX - rect.left) / rect.width) * 560;
    const relativeOnRuler = clamp((viewBoxX - 60) / 440, 0, 1);
    const nextValue = Math.round(relativeOnRuler * 100);

    onChange({
      ...params,
      value: nextValue,
    });
  };

  return (
    <Card className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">Miarka i jednostki</h3>
      <svg
        viewBox="0 0 560 180"
        className="w-full touch-none rounded-2xl bg-slate-50"
        role="img"
        aria-label="Miarka"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          updateValueFromPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateValueFromPointer(event);
          }
        }}
      >
        <rect x="40" y="70" width="480" height="44" rx="12" fill="#fef3c7" stroke="#f59e0b" strokeWidth="4" />
        {Array.from({ length: 11 }).map((_, index) => (
          <g key={index}>
            <line x1={60 + index * 44} y1="70" x2={60 + index * 44} y2={index % 2 === 0 ? 120 : 105} stroke="#92400e" strokeWidth="3" />
            <text x={60 + index * 44} y="145" textAnchor="middle" className="fill-slate-700 text-xs font-bold">{index * 10}</text>
          </g>
        ))}
        <circle cx={60 + (displayValue / 100) * 440} cy="92" r="14" fill="#4f46e5" className="cursor-grab" />
        <text x={60 + (displayValue / 100) * 440} y="55" textAnchor="middle" className="fill-indigo-700 text-sm font-black">
          {displayValue}
        </text>
      </svg>
      <LessonNote>
        Przeciągnij fioletowy punkt po miarce albo wpisz wartość ręcznie w panelu. Dzieci od razu
        widzą, jak zmiana położenia zmienia liczbę w zadaniu.
      </LessonNote>
    </Card>
  );
}

function GenericMathVisual({ params }: { params: TestWidgetParams }) {
  const { left, right } = getNumericPair(params);
  const leftCount = clamp(Math.abs(Math.round(left)), 1, 24);
  const rightCount = clamp(Math.abs(Math.round(right)), 1, 24);

  return (
    <Card className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-900">Obrazowanie liczb</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {[leftCount, rightCount].map((count, groupIndex) => (
          <div key={groupIndex} className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-center font-bold text-slate-700">Zbiór {groupIndex + 1}: {count}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <span key={index} className={`h-5 w-5 rounded-full ${groupIndex === 0 ? "bg-indigo-500" : "bg-emerald-500"}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <LessonNote>Kolorowe zbiory pomagają dzieciom przejść od obrazka do działania.</LessonNote>
    </Card>
  );
}

function EducationalVisual({
  slug,
  visualKind,
  params,
  onChange,
}: {
  slug: string;
  visualKind: string;
  params: TestWidgetParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  if (slug === "dzielenie-z-reszta") return <DivisionRemainderVisual params={params} />;
  if (slug === "kolejnosc-dzialan-drzewko" || slug === "kolejnosc-dzialan-egzamin") {
    return <OrderTreeVisual params={params} />;
  }
  if (visualKind === "chart") return <ChartVisual params={params} />;
  if (visualKind === "fraction") return <FractionVisual params={params} />;
  if (visualKind === "geometry") return <GeometryVisual params={params} onChange={onChange} />;
  if (visualKind === "measurement") return <MeasurementVisual params={params} onChange={onChange} />;
  return <GenericMathVisual params={params} />;
}

export function AssessmentWidgetSimulator({ slug }: AssessmentWidgetSimulatorProps) {
  const widget = getAssessmentWidget(slug);
  const simulation = getSimulationBySlug(slug);
  const [params, setParams] = useState<TestWidgetParams>(
    widget?.defaultParams ?? { start: 4, change: -7 },
  );

  if (!widget) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <h2 className="text-2xl font-bold text-slate-900">{widget.title}</h2>
        <p className="mt-3 text-slate-600">{widget.lessonUse}</p>
        <div className="mt-6 space-y-3 rounded-2xl bg-indigo-50 p-4 text-slate-700">
          <p className="font-semibold">Jak użyć na lekcji?</p>
          <p>
            Pokaż model na tablicy, poproś klasę o przewidzenie odpowiedzi, a dopiero potem odsłoń
            wynik. Ten sam układ może później stać się pytaniem w teście nauczyciela albo szybkim
            ćwiczeniem ucznia.
          </p>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-bold text-slate-900">Panel sterowania nauczyciela</h3>
          <p className="mt-2 text-sm text-slate-600">
            Zmieniaj dane ręcznie podczas tłumaczenia. Wizualizacja i odpowiedź aktualizują się od razu.
          </p>
          <div className="mt-4">
            <ManualParamControls params={params} onChange={setParams} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setParams(buildRandomWidgetParams(slug))}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Wylosuj nowy przykład
        </button>
      </Card>
      <div className="space-y-6">
        <EducationalVisual
          slug={slug}
          visualKind={simulation?.visualKind ?? "game"}
          params={params}
          onChange={setParams}
        />
        <MathWidgetQuestion slug={slug} params={params} inputName={`demo-${slug}`} readOnly revealAnswer />
      </div>
    </div>
  );
}
