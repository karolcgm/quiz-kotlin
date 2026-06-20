"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { buildWidgetPrompt, getAssessmentWidget } from "@/lib/simulations/registry";
import type {
  ArithmeticQuestionParams,
  ClockQuestionParams,
  ComparisonQuestionParams,
  FractionPartQuestionParams,
  RatioQuestionParams,
  RectangleQuestionParams,
  ShapeSortQuestionParams,
  TestWidgetAnswer,
  TestWidgetParams,
  UnitConversionQuestionParams,
} from "@/types/testWidget";
import { SHAPE_LABELS, type BasicShapeKind } from "@/lib/math/basicShapes";
import { BasicShapeIcon } from "@/components/simulations/shared/BasicShapeIcon";
import { ClockFaceVisual } from "@/components/simulations/shared/ClockFaceVisual";
import { RatioBarVisual } from "@/components/tests/widgets/RatioBarVisual";
import { PlaceValueVisual } from "@/components/simulations/shared/PlaceValueVisual";
import { NumberBondHouse } from "@/components/simulations/shared/NumberBondHouseVisual";
import { BalanceScaleVisual } from "@/components/simulations/shared/BalanceScaleVisual";
import { CrocodileComparisonVisual } from "@/components/simulations/shared/CrocodileComparisonVisual";
import {
  comparisonRelation,
  formatNumberWithMissing,
  isMissingDigitTask,
  missingDigitExpected,
} from "@/lib/math/comparisonDisplay";
import { isWordProblemParams } from "@/lib/wordProblems/widget";

interface MathWidgetQuestionProps {
  slug: string;
  params: TestWidgetParams;
  inputName?: string;
  readOnly?: boolean;
  revealAnswer?: boolean;
  /** W katalogu symulacji wizualizacja i wpisywanie odbywa się na interaktywnym schemacie u góry. */
  simulatorPreview?: boolean;
}

function hasNumberResult(params: TestWidgetParams) {
  return (
    isWordProblemParams(params) ||
    "start" in params ||
    "operation" in params ||
    "whole" in params ||
    ("ask" in params && "width" in params) ||
    ("ask" in params && "partA" in params && !("whole" in params)) ||
    ("left" in params && "right" in params && "ask" in params && (params as ComparisonQuestionParams).ask === "missingDigit") ||
    ("hour" in params && "minute" in params && !("whole" in params)) ||
    "fromUnit" in params
  );
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

function isRatioParams(params: TestWidgetParams): params is RatioQuestionParams {
  return "partA" in params && "partB" in params && "ask" in params && !("whole" in params);
}

function isShapeSortParams(params: TestWidgetParams): params is ShapeSortQuestionParams {
  return "shape" in params && !("sides" in params) && !("width" in params) && !("hour" in params);
}

function isClockParams(params: TestWidgetParams): params is ClockQuestionParams {
  return (
    "hour" in params &&
    "minute" in params &&
    "ask" in params &&
    !("whole" in params) &&
    !("sides" in params) &&
    !("width" in params) &&
    !("partA" in params)
  );
}

function isNumberBondParams(params: TestWidgetParams) {
  return "whole" in params && "partA" in params && "partB" in params && "ask" in params;
}

function operationSymbol(operation: ArithmeticQuestionParams["operation"]) {
  if (operation === "add") return "+";
  if (operation === "subtract") return "-";
  if (operation === "multiply") return "·";
  return ":";
}

function studentSteps(params: TestWidgetParams, slug: string): string[] {
  if (isWordProblemParams(params)) {
    return [
      "Przeczytaj uważnie treść zadania.",
      "Wypisz dane i zastanów się, jakie działanie trzeba wykonać.",
      "Oblicz wynik i wpisz go w pole odpowiedzi.",
    ];
  }

  if (isNumberBondParams(params)) {
    return [
      "Spójrz na domek — na dachu jest całość, u dołu dwa składniki.",
      "Setki, dziesiątki i jedności pomagają zobaczyć wielkość liczb bez liczenia klocków.",
      params.ask === "whole"
        ? "Dodaj oba składniki — to liczba na dachu."
        : "Uzupełnij brakujący składnik tak, aby suma była równa dachowi.",
    ];
  }

  if (isShapeSortParams(params)) {
    return [
      "Spójrz na figurę — koło, trójkąt, kwadrat czy prostokąt?",
      "W trybie prezentacji: kliknij figurę z mieszanki, potem właściwy koszyk.",
      "W zadaniu: wybierz koszyk, do którego należy wyróżniona figura.",
    ];
  }

  if (isClockParams(params)) {
    return [
      "Spójrz na tarczę zegara — krótka wskazówka to godzina, długa to minuty.",
      params.minute === 0
        ? "Przy pełnych godzinach długa wskazówka stoi na 12."
        : "Przy kwadransach i połówkach licz minuty: 15, 30 lub 45.",
      params.ask === "minute"
        ? "Użyj + / −, aby wpisać liczbę minut."
        : "Użyj + / −, aby wpisać godzinę (1–12).",
    ];
  }

  if (isComparisonParams(params)) {
    if (params.ask === "missingDigit") {
      return [
        "Spójrz na wagę — która szalka opada?",
        "Jedna liczba ma lukę: krokodyl zjadł cyfrę.",
        "Użyj + / −, aby wpisać brakującą cyfrę (0–9).",
      ];
    }
    if (slug === "porownywanie-liczb-waga") {
      return [
        "Połóż liczby na szalkach i obserwuj przechylenie wagi.",
        "Krokodyl zawsze patrzy na większą liczbę — to zamiennik znaków < i >.",
        "Wybierz krokodyla: lewo, równo albo prawo.",
      ];
    }
  }

  if ("partA" in params && "partB" in params && "ask" in params && !("width" in params) && !("sides" in params)) {
    if (params.ask === "simplify") {
      return [
        "Znajdź największy wspólny dzielnik obu liczb.",
        "Podziel lewą i prawą liczbę przez ten sam dzielnik.",
        "Wpisz uproszczony stosunek przyciskami + / −.",
      ];
    }
    return [
      "Spójrz na pasek podzielony na dwie kolorowe części.",
      "Policz części po lewej (niebieska) i po prawej (zielona).",
      params.ask === "total"
        ? "Dodaj obie liczby — to liczba wszystkich części całości."
        : params.ask === "left"
          ? "Wpisz, ile części ma lewa strona paska."
          : "Wpisz, ile części ma prawa strona paska.",
    ];
  }

  if ("start" in params) {
    return [
      "Znajdź liczbę startową na osi.",
      params.change >= 0 ? "Przesuń się w prawo o podaną liczbę kroków." : "Przesuń się w lewo o podaną liczbę kroków.",
      "Wpisz liczbę, na której kończy się ruch.",
    ];
  }

  if ("operation" in params) {
    if (params.operation === "multiply") {
      return ["Zobacz, ile jest grup.", "Policz, ile kropek jest w jednej grupie.", "Pomnóż grupy razy kropki w grupie."];
    }
    if (params.operation === "divide") {
      return ["Zobacz, ile elementów mamy razem.", "Podziel je na równe grupy.", "Wpisz, ile elementów trafia do jednej grupy."];
    }
    return ["Przeczytaj działanie od lewej do prawej.", "Policz spokojnie na liczbach lub obrazku.", "Wpisz wynik działania."];
  }

  if ("numerator" in params) {
    return ["Policz wszystkie równe części.", "Policz części pokolorowane.", "Zapisz ułamek: pokolorowane / wszystkie."];
  }

  if ("sides" in params && "sideLength" in params && "ask" in params) {
    if (params.ask === "name") {
      return [
        "Policz boki figury na rysunku.",
        "Policz wierzchołki (oznaczone W1, W2…).",
        "Wybierz poprawną nazwę wielokąta.",
      ];
    }
    if (params.ask === "perimeter") {
      return [
        "Sprawdź długość jednego boku.",
        "Policz, ile razy taki bok powtarza się dookoła figury.",
        "Użyj + / −, aby wpisać obwód.",
      ];
    }
    if (params.ask === "vertices") {
      return ["Policz rogi (wierzchołki) figury.", "Każdy róg to jeden wierzchołek.", "Użyj + / −, aby wpisać liczbę."];
    }
    return [
      "Zobacz kąt wewnętrzny przy wierzchołku.",
      "We wielokącie foremnym wszystkie kąty są równe.",
      "Użyj + / −, aby wpisać miarę w stopniach.",
    ];
  }

  if ("width" in params && "height" in params) {
    return params.ask === "area"
      ? ["Zobacz długość i wysokość prostokąta.", "Pole to liczba kratek w środku.", "Pomnóż bok razy bok."]
      : ["Zobacz długość i wysokość prostokąta.", "Obwód to droga dookoła figury.", "Dodaj wszystkie boki."];
  }

  if ("fromUnit" in params && "toUnit" in params && "value" in params) {
    return [
      "Sprawdź wartość startową i jednostkę (np. cm).",
      "Sprawdź, na jaką jednostkę przeliczasz (np. m).",
      "Użyj + / −, aby wpisać wynik — także +0.1 / −0.1 dla ułamków.",
    ];
  }

  return ["Porównaj lewą i prawą liczbę.", "Zdecyduj, która jest większa albo czy są równe.", "Wybierz znak <, = albo >."];
}

function formatExpectedAnswer(expected: TestWidgetAnswer): string {
  if ("result" in expected) return String(expected.result);
  if ("label" in expected) {
    const label = expected.label;
    if (label in SHAPE_LABELS) return SHAPE_LABELS[label as BasicShapeKind];
    return label;
  }
  if ("comparison" in expected) return expected.comparison;
  if ("partA" in expected && "partB" in expected && !("numerator" in expected)) {
    return `${expected.partA}:${expected.partB}`;
  }
  if ("numerator" in expected && "denominator" in expected) {
    return `${expected.numerator}/${expected.denominator}`;
  }
  return "?";
}

function expectedNumeric(slug: string, params: TestWidgetParams) {
  const widget = getAssessmentWidget(slug);
  const result = widget?.grade(params, { result: Number.NaN }, 1).expectedAnswer;
  return result && "result" in result ? result.result : null;
}

function VisualModel({ slug, params, revealAnswer }: { slug: string; params: TestWidgetParams; revealAnswer: boolean }) {
  if (isWordProblemParams(params)) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5">
        <p className="text-lg font-medium leading-relaxed text-slate-900">{params.story}</p>
      </div>
    );
  }

  if (isNumberBondParams(params)) {
    const hideMissing = !revealAnswer;
    return (
      <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
        <NumberBondHouse
          whole={params.ask === "whole" && hideMissing ? "?" : params.whole}
          partA={params.ask === "partA" && hideMissing ? "?" : params.partA}
          partB={params.ask === "partB" && hideMissing ? "?" : params.partB}
          highlight={params.ask}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <PlaceValueVisual value={params.partA} label="Składnik A" accent="indigo" />
          <PlaceValueVisual value={params.partB} label="Składnik B" accent="emerald" />
          <PlaceValueVisual value={params.whole} label="Całość" accent="amber" />
        </div>
      </div>
    );
  }

  if (isArithmeticParams(params)) {
    const groupCount = Math.max(0, Math.min(params.left, 12));
    const itemCount = Math.max(0, Math.min(params.right, 12));
    const groups = params.operation === "multiply" ? Array.from({ length: groupCount }) : [];
    const isAddSubtract = params.operation === "add" || params.operation === "subtract";
    const expected = expectedNumeric(slug, params);

    return (
      <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
        <div className="text-center text-4xl font-black text-indigo-700">
          {params.left} {operationSymbol(params.operation)} {params.right}
        </div>
        {isAddSubtract && (
          <div className="grid gap-3 sm:grid-cols-2">
            <PlaceValueVisual value={params.left} label="Liczba 1" accent="indigo" />
            <PlaceValueVisual value={params.right} label="Liczba 2" accent="emerald" />
          </div>
        )}
        {groups.length > 0 && (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${groupCount}, minmax(0, 1fr))` }}>
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
        {revealAnswer && expected !== null && isAddSubtract && (
          <PlaceValueVisual value={expected} label="Wynik" accent="sky" />
        )}
      </div>
    );
  }

  if (isRatioParams(params)) {
    const expected = expectedNumeric(slug, params);
    return (
      <RatioBarVisual params={params} revealAnswer={revealAnswer} expected={expected} />
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

  if (isShapeSortParams(params)) {
    return (
      <div className="rounded-2xl bg-slate-50 p-6 text-center">
        <BasicShapeIcon kind={params.shape} size={96} fill="#6366f1" />
        {revealAnswer && (
          <p className="mt-3 font-bold text-emerald-700">Grupa: {SHAPE_LABELS[params.shape]}</p>
        )}
      </div>
    );
  }

  if (isClockParams(params)) {
    return (
      <div className="rounded-2xl bg-slate-50 p-4">
        <ClockFaceVisual hour={params.hour} minute={params.minute} showDigital={revealAnswer} />
      </div>
    );
  }

  if (isComparisonParams(params) && slug === "porownywanie-liczb-waga") {
    const relation = comparisonRelation(params.left, params.right);
    const missingTask = isMissingDigitTask(params);
    const missingSide = params.missingSide ?? "left";
    const missingIndex = params.missingIndex ?? 0;
    const leftDisplay = missingTask && missingSide === "left"
      ? formatNumberWithMissing(params.left, missingIndex, revealAnswer)
      : String(params.left);
    const rightDisplay = missingTask && missingSide === "right"
      ? formatNumberWithMissing(params.right, missingIndex, revealAnswer)
      : String(params.right);

    return (
      <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
        <BalanceScaleVisual left={params.left} right={params.right} />
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <p className="text-center font-mono text-4xl font-black text-indigo-700">{leftDisplay}</p>
          <CrocodileComparisonVisual direction={relation} size="md" />
          <p className="text-center font-mono text-4xl font-black text-emerald-700">{rightDisplay}</p>
        </div>
        {revealAnswer && missingTask && (
          <p className="text-center font-bold text-emerald-700">
            Brakująca cyfra: {missingDigitExpected(params)}
          </p>
        )}
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
  simulatorPreview = false,
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
      {simulatorPreview ? (
        <>
          <h3 className="text-2xl font-bold text-slate-900">{prompt}</h3>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-bold text-amber-950">Co mam zrobić?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-amber-900">
              {studentSteps(params, slug).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          {revealAnswer && expected && (
            <div className="rounded-xl bg-emerald-50 p-3 font-semibold text-emerald-800">
              Odpowiedź: {formatExpectedAnswer(expected)}
            </div>
          )}
        </>
      ) : (
        <>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          {widget?.title ?? "Widget matematyczny"}
        </p>
        {!isWordProblemParams(params) && (
          <>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">{prompt}</h3>
            <p className="mt-2 text-sm text-slate-600">{widget?.lessonUse}</p>
          </>
        )}
        {isWordProblemParams(params) && (
          <p className="mt-1 text-sm text-slate-600">Przeczytaj zadanie i wpisz wynik.</p>
        )}
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-bold text-amber-950">Co mam zrobić?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-medium text-amber-900">
          {studentSteps(params, slug).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
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

      {isComparisonParams(params) && params.ask !== "missingDigit" && (
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
          Odpowiedź: {formatExpectedAnswer(expected)}
        </div>
      )}
        </>
      )}
    </Card>
  );
}
