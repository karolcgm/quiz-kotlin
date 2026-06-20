"use client";

import { MathWidgetQuestion } from "@/components/tests/widgets/MathWidgetQuestion";
import { SHAPE_LABELS, BASIC_SHAPE_KINDS } from "@/lib/math/basicShapes";
import type {
  ArithmeticQuestionParams,
  ClockQuestionParams,
  ComparisonQuestionParams,
  FractionPartQuestionParams,
  RatioQuestionParams,
  NumberBondQuestionParams,
  RectangleQuestionParams,
  ShapeSortQuestionParams,
  TestSkill,
  TestWidgetParams,
  UnitConversionQuestionParams,
  WordProblemQuestionParams,
} from "@/types/testWidget";
import {
  getWordProblemVariableKeys,
  isWordProblemParams,
  refreshWordProblemStory,
  resolveExpectedResults,
} from "@/lib/wordProblems/widget";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/wordProblems/types";

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

        {"width" in params && "height" in params && "ask" in params && !("variant" in params) && (
          <RectangleParamsEditor params={params as import("@/types/testWidget").RectangleQuestionParams} onChange={updateParams} />
        )}

        {"fromUnit" in params && (
          <UnitParamsEditor params={params} onChange={updateParams} />
        )}

        {"shape" in params && !("sides" in params) && !("hour" in params) && !("variant" in params) && (
          <ShapeSortParamsEditor params={params as import("@/types/testWidget").ShapeSortQuestionParams} onChange={updateParams} />
        )}

        {"hour" in params && "minute" in params && !("whole" in params) && (
          <ClockParamsEditor params={params} onChange={updateParams} />
        )}

        {"left" in params && "right" in params && !("operation" in params) && !("variant" in params) && (
          <ComparisonParamsEditor params={params as import("@/types/testWidget").ComparisonQuestionParams} onChange={updateParams} />
        )}

        {"partA" in params && "partB" in params && !("whole" in params) && (
          <RatioParamsEditor params={params} onChange={updateParams} />
        )}

        {"whole" in params && "partA" in params && "partB" in params && (
          <NumberBondParamsEditor params={params} onChange={updateParams} />
        )}

        {isWordProblemParams(params) && (
          <WordProblemParamsEditor params={params} onChange={updateParams} />
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
  const ask = params.ask ?? "sign";

  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Typ zadania</span>
        <select
          value={ask}
          onChange={(event) => {
            const nextAsk = event.target.value as ComparisonQuestionParams["ask"];
            if (nextAsk === "missingDigit") {
              onChange({
                ...params,
                ask: "missingDigit",
                missingSide: params.missingSide ?? "left",
                missingIndex: params.missingIndex ?? 1,
              });
              return;
            }
            onChange({ left: params.left, right: params.right, ask: "sign" });
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="sign">Krokodyl — znak porównania</option>
          <option value="missingDigit">Zjadła cyfrę</option>
        </select>
      </label>
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
      {ask === "missingDigit" && (
        <>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Brak cyfry po</span>
            <select
              value={params.missingSide ?? "left"}
              onChange={(event) =>
                onChange({ ...params, missingSide: event.target.value as "left" | "right" })
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="left">Lewej stronie</option>
              <option value="right">Prawej stronie</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Indeks ukrytej cyfry</span>
            <input
              type="number"
              value={params.missingIndex ?? 0}
              min={0}
              max={3}
              onChange={(event) => onChange({ ...params, missingIndex: Number(event.target.value) })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </>
      )}
    </>
  );
}

function RatioParamsEditor({
  params,
  onChange,
}: {
  params: RatioQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Część A</span>
        <input
          type="number"
          value={params.partA}
          min={1}
          max={12}
          onChange={(event) => onChange({ ...params, partA: Math.max(1, Number(event.target.value)) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Część B</span>
        <input
          type="number"
          value={params.partB}
          min={1}
          max={12}
          onChange={(event) => onChange({ ...params, partB: Math.max(1, Number(event.target.value)) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Pytanie</span>
        <select
          value={params.ask}
          onChange={(event) =>
            onChange({ ...params, ask: event.target.value as RatioQuestionParams["ask"] })
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="total">Ile części ma całość?</option>
          <option value="left">Ile części ma lewa strona?</option>
          <option value="right">Ile części ma prawa strona?</option>
        </select>
      </label>
    </>
  );
}

function NumberBondParamsEditor({
  params,
  onChange,
}: {
  params: NumberBondQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Całość (dach)</span>
        <input
          type="number"
          value={params.whole}
          min={2}
          max={999}
          onChange={(event) => {
            const whole = Math.max(2, Number(event.target.value));
            const partA = Math.min(params.partA, whole - 1);
            onChange({ ...params, whole, partA, partB: whole - partA });
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Składnik A</span>
        <input
          type="number"
          value={params.partA}
          min={1}
          max={params.whole - 1}
          onChange={(event) => {
            const partA = Math.min(Math.max(1, Number(event.target.value)), params.whole - 1);
            onChange({ ...params, partA, partB: params.whole - partA });
          }}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Pytanie</span>
        <select
          value={params.ask}
          onChange={(event) =>
            onChange({ ...params, ask: event.target.value as NumberBondQuestionParams["ask"] })
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="partB">Brakujący składnik B</option>
          <option value="partA">Brakujący składnik A</option>
          <option value="whole">Brakująca całość</option>
        </select>
      </label>
    </>
  );
}

function ShapeSortParamsEditor({
  params,
  onChange,
}: {
  params: ShapeSortQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <label className="space-y-2 sm:col-span-2">
      <span className="text-sm font-semibold text-slate-700">Figura do posortowania</span>
      <select
        value={params.shape}
        onChange={(event) => onChange({ shape: event.target.value as ShapeSortQuestionParams["shape"] })}
        className="w-full rounded-xl border border-slate-200 px-3 py-2"
      >
        {BASIC_SHAPE_KINDS.map((kind) => (
          <option key={kind} value={kind}>
            {SHAPE_LABELS[kind]}
          </option>
        ))}
      </select>
    </label>
  );
}

function ClockParamsEditor({
  params,
  onChange,
}: {
  params: ClockQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  return (
    <>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Godzina</span>
        <input
          type="number"
          value={params.hour}
          min={1}
          max={12}
          onChange={(event) => onChange({ ...params, hour: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Minuty</span>
        <select
          value={params.minute}
          onChange={(event) => onChange({ ...params, minute: Number(event.target.value) })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value={0}>0 (pełna godzina)</option>
          <option value={15}>15 (kwadrans)</option>
          <option value={30}>30 (połówka)</option>
          <option value={45}>45 (trzy kwadranse)</option>
        </select>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Pytanie</span>
        <select
          value={params.ask}
          onChange={(event) =>
            onChange({ ...params, ask: event.target.value as ClockQuestionParams["ask"] })
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2"
        >
          <option value="hour">Odczyt godziny</option>
          <option value="minute">Odczyt minut</option>
        </select>
      </label>
    </>
  );
}

function WordProblemParamsEditor({
  params,
  onChange,
}: {
  params: WordProblemQuestionParams;
  onChange: (params: TestWidgetParams) => void;
}) {
  const variableKeys = getWordProblemVariableKeys(params);
  const expectedMap = resolveExpectedResults(params);

  const updateValues = (key: string, value: number) => {
    const nextValues = { ...params.values, [key]: value };
    onChange(refreshWordProblemStory({ ...params, values: nextValues }));
  };

  const updatePartExpected = (partId: string, value: number) => {
    onChange({
      ...params,
      parts: params.parts.map((part) =>
        part.id === partId ? { ...part, expectedOverride: value } : part,
      ),
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 md:col-span-4">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${DIFFICULTY_COLORS[params.difficulty]}`}
        >
          {DIFFICULTY_LABELS[params.difficulty]}
        </span>
        <span className="text-xs font-semibold text-slate-600">
          {params.parts.length} odpowiedzi · {params.partialCredit ? "częściowe punkty" : "all or nothing"}
        </span>
      </div>
      <label className="space-y-2 md:col-span-4">
        <span className="text-sm font-semibold text-slate-700">Treść zadania (możesz edytować)</span>
        <textarea
          rows={params.difficulty === "hard" ? 8 : params.difficulty === "medium" ? 6 : 4}
          value={params.story}
          onChange={(event) => onChange({ ...params, story: event.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed"
        />
      </label>
      {variableKeys.map((key) => (
        <label key={key} className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Liczba {key}</span>
          <input
            type="number"
            value={params.values[key] ?? 0}
            onChange={(event) => updateValues(key, Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      ))}
      {params.parts.map((part) => (
        <label key={part.id} className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">{part.label}</span>
          <input
            type="number"
            value={part.expectedOverride ?? expectedMap[part.id] ?? 0}
            onChange={(event) => updatePartExpected(part.id, Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      ))}
      <label className="flex items-center gap-2 md:col-span-4">
        <input
          type="checkbox"
          checked={params.partialCredit}
          onChange={(event) => onChange({ ...params, partialCredit: event.target.checked })}
        />
        <span className="text-sm font-semibold text-slate-700">
          Częściowe punkty (1 z 2 poprawnych = 50%)
        </span>
      </label>
    </>
  );
}
