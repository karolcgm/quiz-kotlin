"use client";

import { Card } from "@/components/ui/Card";
import { TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import { numericExpected, isTopicExtendedParams } from "@/lib/simulations/extendedWidgets";
import { isShapeSortParams } from "@/lib/simulations/simulatorTaskMode";
import { SHAPE_LABELS } from "@/lib/math/basicShapes";
import type { ExtendedQuestionParams, TestWidgetParams } from "@/types/testWidget";
import type { SimulatorMode } from "@/lib/simulations/simulatorTaskMode";

interface Props {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: SimulatorMode;
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}

function displayParams(params: TestWidgetParams, target: TestWidgetParams | null, mode: SimulatorMode) {
  if (mode === "task" && target) return target;
  return params;
}

function ShapeSortPanel({
  params,
  mode,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: {
  params: TestWidgetParams;
  mode: SimulatorMode;
  selectedLabel: string | null;
  onSelectedLabelChange: (value: string) => void;
  onChange: (params: TestWidgetParams) => void;
}) {
  if (!isShapeSortParams(params)) return null;
  const shapes = ["circle", "triangle", "square", "rectangle"] as const;
  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="rounded-2xl bg-indigo-100 px-6 py-4 text-center">
          <p className="text-xs font-bold uppercase text-indigo-600">Figura do klasyfikacji</p>
          <p className="mt-1 text-2xl font-black text-indigo-900">{SHAPE_LABELS[params.shape]}</p>
        </div>
      </div>
      {mode === "demo" && (
        <div className="flex flex-wrap justify-center gap-2">
          {shapes.map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => onChange({ shape })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              {SHAPE_LABELS[shape]}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => (
          <button
            key={shape}
            type="button"
            onClick={() => onSelectedLabelChange(shape)}
            className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${
              selectedLabel === shape ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white"
            }`}
          >
            Koszyk: {SHAPE_LABELS[shape]}
          </button>
        ))}
      </div>
    </div>
  );
}

function PercentVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "percent" }> }) {
  const part = Math.round((p.base * p.percent) / 100);
  return (
    <svg viewBox="0 0 400 120" className="w-full rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50">
      <rect x="20" y="30" width="360" height="40" rx="8" fill="#e2e8f0" />
      <rect x="20" y="30" width={(360 * p.percent) / 100} height="40" rx="8" fill="#6366f1" />
      <text x="200" y="55" textAnchor="middle" className="fill-slate-800 text-sm font-bold">
        {p.base} → {p.percent}%
      </text>
      <text x="200" y="100" textAnchor="middle" className="fill-indigo-700 text-base font-black">
        część ≈ {part}
      </text>
    </svg>
  );
}

function SdtVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "sdt" }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Droga (km)", value: p.distance, highlight: p.ask === "distance" },
        { label: "Czas (h)", value: p.time, highlight: p.ask === "time" },
        { label: "Prędkość (km/h)", value: p.speed, highlight: p.ask === "speed" },
      ].map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl p-4 text-center ${item.highlight ? "bg-amber-100 ring-2 ring-amber-400" : "bg-white ring-1 ring-slate-200"}`}
        >
          <p className="text-xs font-bold uppercase text-slate-500">{item.label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{item.highlight ? "?" : item.value}</p>
        </div>
      ))}
    </div>
  );
}

function BarChartVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "bar-chart" }> }) {
  const max = Math.max(...p.values, 1);
  return (
    <svg viewBox="0 0 400 200" className="w-full rounded-2xl bg-white">
      {p.values.map((value, index) => {
        const h = (value / max) * 120;
        const x = 40 + index * 85;
        const highlight = p.ask === "value" && index === p.targetIndex;
        return (
          <g key={index}>
            <rect
              x={x}
              y={160 - h}
              width="50"
              height={h}
              rx="6"
              fill={highlight ? "#f59e0b" : "#6366f1"}
            />
            <text x={x + 25} y={175} textAnchor="middle" className="fill-slate-600 text-xs font-bold">
              {String.fromCharCode(65 + index)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ExpressionVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "expression" }> }) {
  return (
    <div className="rounded-2xl bg-violet-50 p-6 text-center">
      <p className="text-3xl font-black tracking-wide text-violet-950">
        {p.a} + {p.b} × {p.c} − {p.d}
      </p>
      <p className="mt-2 text-sm font-semibold text-violet-700">Najpierw mnożenie, potem dodawanie i odejmowanie</p>
    </div>
  );
}

function PythagorasVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "pythagoras" }> }) {
  const scale = 18;
  return (
    <svg viewBox="0 0 320 220" className="w-full rounded-2xl bg-emerald-50">
      <polygon points={`40,180 40,${180 - p.legB * scale} ${40 + p.legA * scale},180`} fill="#bbf7d0" stroke="#15803d" strokeWidth="3" />
      <rect x="40" y={180 - p.legB * scale} width={p.legA * scale} height={p.legB * scale} fill="none" stroke="#15803d" strokeWidth="2" strokeDasharray="6 4" />
      <text x="20" y={180 - (p.legB * scale) / 2} className="fill-emerald-900 text-sm font-bold">{p.legB}</text>
      <text x={40 + (p.legA * scale) / 2} y="195" textAnchor="middle" className="fill-emerald-900 text-sm font-bold">{p.legA}</text>
    </svg>
  );
}

function AngleMeasureVisual({
  p,
  mode,
  onChange,
}: {
  p: Extract<ExtendedQuestionParams, { variant: "angle-measure" }>;
  mode: SimulatorMode;
  onChange: (params: TestWidgetParams) => void;
}) {
  const origin = { x: 60, y: 180 };
  const len = 160;
  const rad = (-p.degrees * Math.PI) / 180;
  const endX = origin.x + len * Math.cos(rad);
  const endY = origin.y + len * Math.sin(rad);
  return (
    <svg viewBox="0 0 360 200" className="w-full rounded-2xl bg-rose-50">
      <line x1={origin.x} y1={origin.y} x2="300" y2={origin.y} stroke="#475569" strokeWidth="5" />
      <line x1={origin.x} y1={origin.y} x2={endX} y2={endY} stroke="#e11d48" strokeWidth="5" />
      <text x="200" y="40" textAnchor="middle" className="fill-rose-900 text-xl font-black">
        {mode === "task" ? "?°" : `${p.degrees}°`}
      </text>
      {mode === "demo" && (
        <foreignObject x="20" y="10" width="320" height="40">
          <input
            type="range"
            min={10}
            max={170}
            value={p.degrees}
            onChange={(e) => onChange({ ...p, degrees: Number(e.target.value) })}
            className="w-full"
          />
        </foreignObject>
      )}
    </svg>
  );
}

function VolumeVisual({ p }: { p: Extract<ExtendedQuestionParams, { variant: "volume-cubes" }> }) {
  return (
    <div className="rounded-2xl bg-cyan-50 p-4 text-center">
      <p className="text-lg font-bold text-cyan-950">
        Bryła: {p.cellsWidth} × {p.cellsHeight} × {p.cellsDepth} kostek
      </p>
      <div className="mt-3 inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(p.cellsWidth, 8)}, 1fr)` }}>
        {Array.from({ length: Math.min(p.cellsWidth * p.cellsHeight, 48) }).map((_, i) => (
          <div key={i} className="h-5 w-5 rounded-sm bg-cyan-400" />
        ))}
      </div>
    </div>
  );
}

function TopicSvg({ params, mode, onChange }: { params: ExtendedQuestionParams; mode: SimulatorMode; onChange: (p: TestWidgetParams) => void }) {
  switch (params.variant) {
    case "percent":
      return <PercentVisual p={params} />;
    case "sdt":
      return <SdtVisual p={params} />;
    case "bar-chart":
    case "statistics":
      return params.variant === "bar-chart" ? (
        <BarChartVisual p={params} />
      ) : (
        <BarChartVisual p={{ variant: "bar-chart", values: params.values.slice(0, 4), ask: "max", targetIndex: 0 }} />
      );
    case "expression":
    case "substitute":
    case "power":
    case "linear-function":
    case "like-terms":
      return params.variant === "expression" ? (
        <ExpressionVisual p={params} />
      ) : (
        <div className="rounded-2xl bg-violet-50 p-6 text-center text-2xl font-black text-violet-950">
          {params.variant === "substitute" && `${params.a}x + ${params.b}, x = ${params.x}`}
          {params.variant === "power" && `${params.base}^${params.exponent}`}
          {params.variant === "linear-function" && `y = ${params.a}x + ${params.b}`}
          {params.variant === "like-terms" && params.terms.map((t) => `${t}x`).join(" + ")}
        </div>
      );
    case "pythagoras":
      return <PythagorasVisual p={params} />;
    case "angle-measure":
      return <AngleMeasureVisual p={params} mode={mode} onChange={onChange} />;
    case "volume-cubes":
      return <VolumeVisual p={params} />;
    case "circle":
      return (
        <svg viewBox="0 0 200 200" className="mx-auto w-48 rounded-full bg-sky-50">
          <circle cx="100" cy="100" r={params.radius * 8} fill="#bae6fd" stroke="#0284c7" strokeWidth="4" />
          <line x1="100" y1="100" x2={100 + params.radius * 8} y2="100" stroke="#0284c7" strokeWidth="3" />
          <text x="120" y="95" className="fill-sky-900 text-sm font-bold">r={params.radius}</text>
        </svg>
      );
    case "equation-balance":
      return (
        <div className="flex items-end justify-center gap-4">
          <div className="rounded-2xl bg-amber-100 px-6 py-4 text-2xl font-black">{params.leftPan} + x</div>
          <div className="text-3xl font-black">=</div>
          <div className="rounded-2xl bg-emerald-100 px-6 py-4 text-2xl font-black">{params.rightPan}</div>
        </div>
      );
    case "shape-properties":
      return (
        <div className="rounded-2xl bg-indigo-50 p-6 text-center">
          <p className="text-2xl font-black capitalize text-indigo-950">{params.shape}</p>
          <p className="mt-2 text-sm font-semibold text-indigo-700">Figura foremna</p>
        </div>
      );
    case "multiples-grid":
      return (
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: params.max }, (_, i) => i + 1).slice(0, 40).map((n) => (
            <div
              key={n}
              className={`rounded-lg p-1 text-center text-xs font-bold ${n % params.base === 0 ? "bg-emerald-200 text-emerald-900" : "bg-slate-100"}`}
            >
              {n}
            </div>
          ))}
        </div>
      );
    case "divisibility":
    case "prime-sieve":
    case "solid-net":
    case "line-geometry":
    case "cylinder-volume":
    case "triangle-area":
    case "trapezoid-area":
    case "parallelogram-area":
    case "probability":
    case "multiplication-grid":
    case "sqrt-area":
    case "coordinate-distance":
    case "divisor-count":
    case "thermometer":
    case "pie-chart":
      return (
        <div className="rounded-2xl bg-slate-50 p-6 text-center text-lg font-semibold text-slate-800">
          {params.variant === "divisibility" && `Liczba ${params.number}, dzielnik ${params.divisor}`}
          {params.variant === "prime-sieve" && `Sito do ${params.max}`}
          {params.variant === "solid-net" && `Bryła: ${params.solid}`}
          {params.variant === "line-geometry" && `${params.points} punktów na prostej`}
          {params.variant === "cylinder-volume" && `Walec r=${params.radius}, h=${params.height}`}
          {params.variant === "triangle-area" && (
            <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-md">
              <polygon
                points={`40,150 280,150 ${160 - params.height * 8},${150 - params.height * 8}`}
                fill="#bbf7d0"
                stroke="#15803d"
                strokeWidth="3"
              />
              <line x1="160" y1={150 - params.height * 8} x2="160" y2="150" stroke="#15803d" strokeWidth="2" strokeDasharray="5 4" />
              <text x="165" y="120" className="fill-emerald-900 text-sm font-bold">h={params.height}</text>
              <text x="150" y="170" textAnchor="middle" className="fill-emerald-900 text-sm font-bold">a={params.base}</text>
            </svg>
          )}
          {params.variant === "trapezoid-area" && (
            <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-md">
              <polygon
                points={`60,150 260,150 220,${150 - params.height * 10} 100,${150 - params.height * 10}`}
                fill="#fde68a"
                stroke="#b45309"
                strokeWidth="3"
              />
              <text x="160" y="170" textAnchor="middle" className="fill-amber-900 text-sm font-bold">
                a={params.baseA}, b={params.baseB}, h={params.height}
              </text>
            </svg>
          )}
          {params.variant === "parallelogram-area" && (
            <svg viewBox="0 0 320 180" className="mx-auto w-full max-w-md">
              <polygon points="60,150 260,150 220,50 20,50" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="3" />
              <text x="160" y="170" textAnchor="middle" className="fill-violet-900 text-sm font-bold">
                a={params.base}, h={params.height}
              </text>
            </svg>
          )}
          {params.variant === "probability" && (
            <div className="space-y-2">
              <p>Korzystne: {params.favorable} / {params.total}</p>
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: params.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-lg ${i < params.favorable ? "bg-emerald-400" : "bg-slate-200"}`}
                  />
                ))}
              </div>
            </div>
          )}
          {params.variant === "multiplication-grid" && (
            <div
              className="inline-grid gap-1"
              style={{ gridTemplateColumns: `repeat(${params.cols}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: params.rows * params.cols }).map((_, i) => (
                <div key={i} className="h-6 w-6 rounded bg-indigo-300" />
              ))}
            </div>
          )}
          {params.variant === "sqrt-area" && (
            <svg viewBox="0 0 200 200" className="mx-auto w-48">
              <rect x="30" y="30" width="140" height="140" fill="#bae6fd" stroke="#0284c7" strokeWidth="3" />
              <text x="100" y="110" textAnchor="middle" className="fill-sky-900 text-lg font-bold">
                S={params.squareArea}
              </text>
            </svg>
          )}
          {params.variant === "coordinate-distance" && (
            <svg viewBox="0 0 240 200" className="mx-auto w-full max-w-xs">
              <line x1="20" y1="180" x2="220" y2="180" stroke="#64748b" strokeWidth="2" />
              <line x1="20" y1="180" x2="20" y2="20" stroke="#64748b" strokeWidth="2" />
              <circle cx={20 + params.dx * 15} cy={180 - params.dy * 15} r="6" fill="#6366f1" />
              <circle cx="20" cy="180" r="6" fill="#6366f1" />
              <text x="120" y="30" textAnchor="middle" className="fill-slate-700 text-sm font-bold">
                Δx={params.dx}, Δy={params.dy}
              </text>
            </svg>
          )}
          {params.variant === "divisor-count" && (
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: Math.min(params.number, 24) }).map((_, i) => {
                const n = i + 1;
                const divides = params.number % n === 0;
                return (
                  <span
                    key={n}
                    className={`rounded-lg px-2 py-1 text-sm font-bold ${divides ? "bg-emerald-200 text-emerald-900" : "bg-slate-100 text-slate-500"}`}
                  >
                    {n}
                  </span>
                );
              })}
            </div>
          )}
          {params.variant === "thermometer" && (
            <svg viewBox="0 0 80 220" className="mx-auto h-48 w-16">
              <rect x="30" y="20" width="20" height="160" rx="10" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
              <rect
                x="34"
                y={180 - Math.min(Math.max(params.temperature + 20, 0), 160) * 0.8}
                width="12"
                height={Math.min(Math.max(params.temperature + 20, 0), 160) * 0.8}
                fill="#ef4444"
              />
              <circle cx="40" cy="190" r="14" fill="#ef4444" />
              <text x="40" y="215" textAnchor="middle" className="fill-slate-800 text-sm font-bold">
                {params.temperature}°C
              </text>
            </svg>
          )}
          {params.variant === "pie-chart" && (
            <svg viewBox="0 0 200 200" className="mx-auto h-40 w-40">
              <circle cx="100" cy="100" r="80" fill="#e2e8f0" />
              <path
                d={`M 100 100 L 100 20 A 80 80 0 ${params.percent > 50 ? 1 : 0} 1 ${100 + 80 * Math.sin((2 * Math.PI * params.percent) / 100)} ${100 - 80 * Math.cos((2 * Math.PI * params.percent) / 100)} Z`}
                fill="#6366f1"
              />
              <text x="100" y="105" textAnchor="middle" className="fill-slate-900 text-sm font-bold">
                {params.percent}%
              </text>
            </svg>
          )}
        </div>
      );
    default:
      return null;
  }
}

export function InteractiveTopicVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  selectedLabel,
  onSelectedLabelChange,
  onChange,
}: Props) {
  if (isShapeSortParams(params)) {
    return (
      <Card className="space-y-4">
        {!compactChrome && <h3 className="text-2xl font-bold text-slate-900">Sortowanie figur</h3>}
        <ShapeSortPanel
          params={displayParams(params, targetParams, mode)}
          mode={mode}
          selectedLabel={selectedLabel}
          onSelectedLabelChange={onSelectedLabelChange}
          onChange={onChange}
        />
      </Card>
    );
  }

  if (!isTopicExtendedParams(params)) return null;

  const active = displayParams(params, targetParams, mode);
  if (!isTopicExtendedParams(active)) return null;

  const expected = numericExpected(active);
  const needsLabel = false;

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">Model interaktywny</h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? "Przeanalizuj schemat i wpisz wynik przyciskami + / −."
              : "Zmieniaj dane w panelu lub na rysunku, potem przełącz tryb zadania."}
          </p>
        </>
      )}

      {mode === "task" && (
        <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50 p-4 text-center">
          <p className="text-xs font-bold uppercase text-indigo-600">Zadanie</p>
          <p className="mt-1 text-lg font-black text-indigo-900">Rozwiąż na podstawie modelu poniżej</p>
        </div>
      )}

      <TopicSvg params={active} mode={mode} onChange={onChange} />

      {!needsLabel && (
        <TaskAnswerPanel
          mode={mode}
          label="Twój wynik"
          value={numericResult ?? 0}
          onChange={onNumericResultChange}
          showSolution={showSolution}
          expected={expected}
          step={1}
          placeValue
          compactChrome={compactChrome}
        />
      )}
    </Card>
  );
}
