"use client";

import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import type {
  ArithmeticQuestionParams,
  ComparisonQuestionParams,
  FractionPartQuestionParams,
  RectangleQuestionParams,
  TestSkill,
  TestWidgetParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";

export interface ComposerItem {
  localId: string;
  position: number;
  simulationSlug: string;
  widgetKind: string;
  skill: TestSkill;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
}

interface TestItemEditorProps {
  item: ComposerItem;
  onChange: (item: ComposerItem) => void;
  onRemove: () => void;
}

export function TestItemEditor({ item, onChange, onRemove }: TestItemEditorProps) {
  const update = (patch: Partial<ComposerItem>) => onChange({ ...item, ...patch });
  const updateParams = (params: TestWidgetParams) => onChange({ ...item, params });
  const params = item.params;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
            Pytanie {item.position}
          </p>
          <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
        </div>
        <button type="button" onClick={onRemove} className="font-semibold text-red-600">
          Usuń
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {"start" in params && (
          <>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Start</span>
              <input
                type="number"
                value={params.start}
                min={-20}
                max={20}
                onChange={(event) => updateParams({ ...params, start: Number(event.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Zmiana</span>
              <input
                type="number"
                value={params.change}
                min={-20}
                max={20}
                onChange={(event) => updateParams({ ...params, change: Number(event.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              />
            </label>
          </>
        )}

        {"operation" in params && (
          <ArithmeticParamsEditor params={params} onChange={updateParams} />
        )}

        {"numerator" in params && (
          <FractionParamsEditor params={params} onChange={updateParams} />
        )}

        {"width" in params && (
          <RectangleParamsEditor params={params} onChange={updateParams} />
        )}

        {"fromUnit" in params && (
          <UnitParamsEditor params={params} onChange={updateParams} />
        )}

        {"left" in params && "right" in params && !("operation" in params) && (
          <ComparisonParamsEditor params={params} onChange={updateParams} />
        )}

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Punkty</span>
          <input
            type="number"
            value={item.points}
            min={1}
            max={10}
            onChange={(event) => update({ points: Number(event.target.value) })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Umiejętność</span>
          <select
            value={item.skill}
            onChange={(event) => update({ skill: event.target.value as TestSkill })}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          >
            <option value="addition">Dodawanie</option>
            <option value="subtraction">Odejmowanie</option>
            <option value="multiplication">Mnożenie</option>
            <option value="division">Dzielenie</option>
            <option value="fractions">Ułamki</option>
            <option value="geometry">Geometria</option>
            <option value="measurement">Jednostki i miary</option>
            <option value="algebra">Algebra</option>
            <option value="statistics">Statystyka</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <MathWidgetQuestion
          slug={item.simulationSlug}
          params={params}
          readOnly
          revealAnswer
          inputName={`preview-${item.localId}`}
        />
      </div>
    </div>
  );
}

function ArithmeticParamsEditor({
  params,
  onChange,
}: {
  params: ArithmeticQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Liczba 1</span>
        <input
          type="number"
          value={params.left}
          onChange={(event) => onChange({ ...params, left: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Liczba 2</span>
        <input
          type="number"
          value={params.right}
          min={params.operation === "divide" ? 1 : undefined}
          onChange={(event) => onChange({ ...params, right: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
    </>
  );
}

function FractionParamsEditor({
  params,
  onChange,
}: {
  params: FractionPartQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Licznik</span>
        <input
          type="number"
          value={params.numerator}
          min={0}
          onChange={(event) => onChange({ ...params, numerator: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Mianownik</span>
        <input
          type="number"
          value={params.denominator}
          min={1}
          onChange={(event) => onChange({ ...params, denominator: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
    </>
  );
}

function RectangleParamsEditor({
  params,
  onChange,
}: {
  params: RectangleQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Szerokość</span>
        <input
          type="number"
          value={params.width}
          min={1}
          onChange={(event) => onChange({ ...params, width: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Wysokość</span>
        <input
          type="number"
          value={params.height}
          min={1}
          onChange={(event) => onChange({ ...params, height: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Pytanie</span>
        <select
          value={params.ask}
          onChange={(event) => onChange({ ...params, ask: event.target.value as "area" | "perimeter" })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="area">Pole</option>
          <option value="perimeter">Obwód</option>
        </select>
      </label>
    </>
  );
}

function UnitParamsEditor({
  params,
  onChange,
}: {
  params: UnitConversionQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  const units = ["mm", "cm", "m", "km"] as const;

  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Wartość</span>
        <input
          type="number"
          value={params.value}
          min={0}
          onChange={(event) => onChange({ ...params, value: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Z jednostki</span>
        <select
          value={params.fromUnit}
          onChange={(event) => onChange({ ...params, fromUnit: event.target.value as UnitConversionQuestionParams["fromUnit"] })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Na jednostkę</span>
        <select
          value={params.toUnit}
          onChange={(event) => onChange({ ...params, toUnit: event.target.value as UnitConversionQuestionParams["toUnit"] })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}

function ComparisonParamsEditor({
  params,
  onChange,
}: {
  params: ComparisonQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Lewa liczba</span>
        <input
          type="number"
          value={params.left}
          onChange={(event) => onChange({ ...params, left: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Prawa liczba</span>
        <input
          type="number"
          value={params.right}
          onChange={(event) => onChange({ ...params, right: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
    </>
  );
}
