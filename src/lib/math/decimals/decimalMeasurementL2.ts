import {
  addDecimalValues,
  areEquivalentDecimals,
  compareDecimalValues,
  convertDecimalUnit,
  formatDecimal,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalValue } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_MEASUREMENT_L2_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_MEASUREMENT_L2_SKILL_ID = "M5-5.3-units-length-mass" as const;

export type DecimalMeasurementL2Activity =
  | "laboratory-scale-mass"
  | "unit-scale-mass"
  | "medicine-packing"
  | "mixed-measurements"
  | "independent-mixed";

export type DecimalMeasurementL2Unit = "mm" | "cm" | "m" | "km" | "g" | "dag" | "kg" | "t";
export type DecimalMassUnit = Extract<DecimalMeasurementL2Unit, "g" | "dag" | "kg" | "t">;
export type DecimalMeasurementDimension = "length" | "mass";
export type DecimalMeasurementScaleOperation = "×10" | "×100" | "×1000" | "÷10" | "÷100" | "÷1000";
export type DecimalRealismChoice = "realistic" | "absurd";
export type DecimalMassRangeId = "medicine-packet" | "veterinary-kit";

export interface DecimalMeasurementL2Part {
  value: string;
  unit: DecimalMeasurementL2Unit;
}

export interface DecimalMassRealismClaim {
  value: string;
  unit: DecimalMassUnit;
  rangeId: DecimalMassRangeId;
  objectLabel: string;
}

export interface DecimalMeasurementL2Item {
  id: string;
  dimension: DecimalMeasurementDimension;
  prompt: string;
  parts: DecimalMeasurementL2Part[];
  targetUnit: DecimalMeasurementL2Unit;
  realismClaim?: DecimalMassRealismClaim;
}

export interface DecimalScaleWeights {
  kg: number;
  dag: number;
  g: number;
}

export interface DecimalMeasurementL2PublicTask {
  generatorId: typeof DECIMAL_MEASUREMENT_L2_GENERATOR_ID;
  generatorVersion: 5;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalMeasurementL2Activity;
  prompt: string;
  story: string;
  items: DecimalMeasurementL2Item[];
  scaleTarget?: DecimalScaleWeights;
  skillIds: readonly [typeof DECIMAL_MEASUREMENT_L2_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "unit-is-always-explicit",
    "realistic-mass-range-is-checked",
    "length-and-mass-dimensions-stay-separate",
    "answer-spec-server-only",
  ];
}

export type DecimalMeasurementL2ValidationIssue = "empty" | "scale" | "value" | "unit" | "realism";

export interface DecimalMeasurementL2ValidationResult {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  issue: DecimalMeasurementL2ValidationIssue | null;
  normalizedDisplay?: string;
}

export const REALISTIC_MASS_RANGES_IN_GRAMS: Readonly<Record<DecimalMassRangeId, { minimum: string; maximum: string }>> = {
  "medicine-packet": { minimum: "5", maximum: "500" },
  "veterinary-kit": { minimum: "100", maximum: "3000" },
};

const UNIT_EXPONENT: Record<DecimalMeasurementL2Unit, number> = {
  mm: -3,
  cm: -2,
  m: 0,
  km: 3,
  g: 0,
  dag: 1,
  kg: 3,
  t: 6,
};

const UNIT_DIMENSION: Record<DecimalMeasurementL2Unit, DecimalMeasurementDimension> = {
  mm: "length",
  cm: "length",
  m: "length",
  km: "length",
  g: "mass",
  dag: "mass",
  kg: "mass",
  t: "mass",
};

const SCALE_TARGETS: Record<LessonDifficulty, DecimalScaleWeights> = {
  support: { kg: 0, dag: 12, g: 0 },
  core: { kg: 1, dag: 24, g: 5 },
  challenge: { kg: 0, dag: 7, g: 5 },
};

function item(
  id: string,
  dimension: DecimalMeasurementDimension,
  prompt: string,
  parts: DecimalMeasurementL2Part[],
  targetUnit: DecimalMeasurementL2Unit,
  realismClaim?: DecimalMassRealismClaim,
): DecimalMeasurementL2Item {
  return { id, dimension, prompt, parts, targetUnit, realismClaim };
}

const MASS_SCALE_ITEMS: Record<LessonDifficulty, DecimalMeasurementL2Item> = {
  support: item("mass-scale-support", "mass", "Przelicz 3,4 kg na gramy.", [{ value: "3,4", unit: "kg" }], "g"),
  core: item("mass-scale-core", "mass", "Przelicz 2,35 kg na dekagramy.", [{ value: "2,35", unit: "kg" }], "dag"),
  challenge: item("mass-scale-challenge", "mass", "Przelicz 0,085 kg na gramy.", [{ value: "0,085", unit: "kg" }], "g"),
};

const MEDICINE_ITEMS: Record<LessonDifficulty, DecimalMeasurementL2Item> = {
  support: item(
    "medicine-support",
    "mass",
    "Saszetka preparatu dla psa ma 25 g. Zapisz masę w kilogramach i oceń etykietę 0,025 kg.",
    [{ value: "25", unit: "g" }],
    "kg",
    { value: "0,025", unit: "kg", rangeId: "medicine-packet", objectLabel: "saszetka preparatu dla psa" },
  ),
  core: item(
    "medicine-core",
    "mass",
    "Pudełko tabletek dla schroniska ma 45 g. Zapisz masę w kilogramach i oceń wydrukowaną etykietę 45 kg.",
    [{ value: "45", unit: "g" }],
    "kg",
    { value: "45", unit: "kg", rangeId: "medicine-packet", objectLabel: "pudełko tabletek dla schroniska" },
  ),
  challenge: item(
    "medicine-challenge",
    "mass",
    "Zestaw preparatu dla konia ma 1 kg 25 dag. Zapisz masę w kilogramach i oceń etykietę 1,25 kg.",
    [{ value: "1", unit: "kg" }, { value: "25", unit: "dag" }],
    "kg",
    { value: "1,25", unit: "kg", rangeId: "veterinary-kit", objectLabel: "zestaw preparatu dla konia" },
  ),
};

const MIXED_ITEMS: Record<LessonDifficulty, DecimalMeasurementL2Item[]> = {
  support: [
    item("mixed-support-mass", "mass", "Zapisz 850 g w kilogramach.", [{ value: "850", unit: "g" }], "kg"),
    item("mixed-support-length", "length", "Zapisz 250 cm w metrach.", [{ value: "250", unit: "cm" }], "m"),
  ],
  core: [
    item("mixed-core-length", "length", "Zapisz 1 km 250 m w kilometrach.", [{ value: "1", unit: "km" }, { value: "250", unit: "m" }], "km"),
    item("mixed-core-mass", "mass", "Zapisz 2 kg 35 dag w kilogramach.", [{ value: "2", unit: "kg" }, { value: "35", unit: "dag" }], "kg"),
  ],
  challenge: [
    item("mixed-challenge-mass", "mass", "Zapisz 0,075 kg w gramach.", [{ value: "0,075", unit: "kg" }], "g"),
    item("mixed-challenge-length", "length", "Zapisz 2,075 km w metrach.", [{ value: "2,075", unit: "km" }], "m"),
  ],
};

const INDEPENDENT_ITEMS: Record<LessonDifficulty, DecimalMeasurementL2Item[]> = {
  support: [
    item("independent-support-mass", "mass", "Opakowanie ma 650 g. Zapisz masę w kilogramach.", [{ value: "650", unit: "g" }], "kg"),
  ],
  core: [
    item("independent-core-mass", "mass", "Zestaw ma 1 kg 25 dag. Zapisz masę w kilogramach.", [{ value: "1", unit: "kg" }, { value: "25", unit: "dag" }], "kg"),
  ],
  challenge: [
    item("independent-challenge-mass", "mass", "Próbka ma 75 g. Zapisz masę w kilogramach.", [{ value: "75", unit: "g" }], "kg"),
    item("independent-challenge-length", "length", "Trasa ma 2,075 km. Zapisz długość w metrach.", [{ value: "2,075", unit: "km" }], "m"),
  ],
};

function parsedValue(input: string): DecimalValue {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
}

function assertItemDimensions(conversion: DecimalMeasurementL2Item): void {
  if (UNIT_DIMENSION[conversion.targetUnit] !== conversion.dimension) {
    throw new Error("Jednostka docelowa ma inny wymiar niż zadanie.");
  }
  if (conversion.parts.some((part) => UNIT_DIMENSION[part.unit] !== conversion.dimension)) {
    throw new Error("Nie wolno mieszać długości i masy w jednym przeliczeniu.");
  }
}

export function measurementScaleOperation(from: DecimalMeasurementL2Unit, to: DecimalMeasurementL2Unit): DecimalMeasurementScaleOperation {
  if (UNIT_DIMENSION[from] !== UNIT_DIMENSION[to]) throw new Error("Jednostki mają różne wymiary.");
  const power = UNIT_EXPONENT[from] - UNIT_EXPONENT[to];
  const magnitude = 10 ** Math.abs(power);
  if (power === 0 || ![10, 100, 1000].includes(magnitude)) {
    throw new Error("Ten etap L2 obsługuje pojedynczą zmianę skali przez 10, 100 albo 1000.");
  }
  return `${power > 0 ? "×" : "÷"}${magnitude}` as DecimalMeasurementScaleOperation;
}

export function itemScaleOperation(conversion: DecimalMeasurementL2Item): DecimalMeasurementScaleOperation {
  const convertedPart = [...conversion.parts].reverse().find((part) => part.unit !== conversion.targetUnit);
  if (!convertedPart) throw new Error("Zadanie musi zawierać część wymagającą zmiany jednostki.");
  return measurementScaleOperation(convertedPart.unit, conversion.targetUnit);
}

export function convertMeasurementParts(
  parts: readonly DecimalMeasurementL2Part[],
  targetUnit: DecimalMeasurementL2Unit,
): DecimalValue {
  if (parts.length === 0) throw new Error("Do przeliczenia potrzebna jest co najmniej jedna wielkość.");
  const dimension = UNIT_DIMENSION[targetUnit];
  if (parts.some((part) => UNIT_DIMENSION[part.unit] !== dimension)) {
    throw new Error("Nie wolno dodawać długości i masy.");
  }
  return parts
    .map((part) => convertDecimalUnit(parsedValue(part.value), part.unit, targetUnit))
    .reduce((sum, value) => addDecimalValues(sum, value));
}

export function expectedMeasurementDisplay(conversion: DecimalMeasurementL2Item): string {
  assertItemDimensions(conversion);
  return formatDecimal(convertMeasurementParts(conversion.parts, conversion.targetUnit), { trimTrailingZeros: true });
}

export function totalGramsFromWeights(weights: DecimalScaleWeights): number {
  const values = [weights.kg, weights.dag, weights.g];
  if (values.some((value) => !Number.isSafeInteger(value) || value < 0)) {
    throw new Error("Liczba odważników musi być nieujemną liczbą całkowitą.");
  }
  return weights.kg * 1000 + weights.dag * 10 + weights.g;
}

export function massDisplaysFromWeights(weights: DecimalScaleWeights): { g: string; dag: string; kg: string } {
  const grams = totalGramsFromWeights(weights);
  const gramValue = parsedValue(String(grams));
  return {
    g: String(grams),
    dag: formatDecimal(convertDecimalUnit(gramValue, "g", "dag"), { trimTrailingZeros: true }),
    kg: formatDecimal(convertDecimalUnit(gramValue, "g", "kg"), { trimTrailingZeros: true }),
  };
}

export function isMassClaimRealistic(claim: DecimalMassRealismClaim): boolean {
  const range = REALISTIC_MASS_RANGES_IN_GRAMS[claim.rangeId];
  const grams = convertDecimalUnit(parsedValue(claim.value), claim.unit, "g");
  return compareDecimalValues(grams, parsedValue(range.minimum)) >= 0
    && compareDecimalValues(grams, parsedValue(range.maximum)) <= 0;
}

export function validateMeasurementL2Conversion(input: {
  item: DecimalMeasurementL2Item;
  value: string;
  unit: string;
  scaleOperation?: string;
  realismChoice?: string;
}): DecimalMeasurementL2ValidationResult {
  assertItemDimensions(input.item);
  const parsed = parseDecimalInput(input.value);
  if (!parsed.ok) {
    return {
      correct: false,
      code: parsed.error.code === "DEC_EMPTY" ? DECIMAL_FEEDBACK_CODES.empty : DECIMAL_FEEDBACK_CODES.placeValue,
      issue: parsed.error.code === "DEC_EMPTY" ? "empty" : "value",
    };
  }
  if (input.scaleOperation !== undefined && input.scaleOperation !== itemScaleOperation(input.item)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, issue: "scale", normalizedDisplay: parsed.trace.display };
  }
  const expected = convertMeasurementParts(input.item.parts, input.item.targetUnit);
  if (!areEquivalentDecimals(parsed.value, expected)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, issue: "value", normalizedDisplay: parsed.trace.display };
  }
  if (input.unit !== input.item.targetUnit) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.unitMismatch, issue: "unit", normalizedDisplay: parsed.trace.display };
  }
  if (input.item.realismClaim) {
    const expectedChoice: DecimalRealismChoice = isMassClaimRealistic(input.item.realismClaim) ? "realistic" : "absurd";
    if (input.realismChoice !== expectedChoice) {
      return {
        correct: false,
        code: input.realismChoice ? DECIMAL_FEEDBACK_CODES.estimateRange : DECIMAL_FEEDBACK_CODES.empty,
        issue: "realism",
        normalizedDisplay: parsed.trace.display,
      };
    }
  }
  return { correct: true, code: null, issue: null, normalizedDisplay: parsed.trace.display };
}

function promptFor(activity: DecimalMeasurementL2Activity): string {
  switch (activity) {
    case "laboratory-scale-mass":
      return "Dodawaj odważniki kg, dag i g. Masa w gramach, dekagramach i kilogramach aktualizuje się w czasie rzeczywistym.";
    case "unit-scale-mass":
      return "Najpierw nazwij jednostkę źródłową i docelową. Mnożnik opisuje zmianę wartości pozycji cyfr — przecinek nie przesuwa się bez powodu.";
    case "medicine-packing":
      return "Przelicz masę preparatu, zapisz jawną jednostkę i oceń, czy wydrukowana etykieta mieści się w realistycznym zakresie.";
    case "mixed-measurements":
      return "Rozwiąż obok siebie przeliczenie długości i masy. Jednostki obu wymiarów pozostają jawne i nie mogą się mieszać.";
    case "independent-mixed":
      return "Samodzielnie dobierz mnożnik, ustaw przecinek, wpisz jednostkę i sprawdź realizm wyniku.";
  }
}

export function createPublicDecimalMeasurementL2Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalMeasurementL2Activity;
}): DecimalMeasurementL2PublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed pomiaru L2 musi być nieujemną liczbą całkowitą.");
  }
  const scaleTarget = input.activity === "laboratory-scale-mass" ? { ...SCALE_TARGETS[input.difficulty] } : undefined;
  const scaleItem = scaleTarget
    ? item(
        "laboratory-scale-target",
        "mass",
        `Zbuduj masę ${scaleTarget.kg} kg ${scaleTarget.dag} dag ${scaleTarget.g} g i odczytaj ją w trzech jednostkach.`,
        [
          { value: String(scaleTarget.kg), unit: "kg" },
          { value: String(scaleTarget.dag), unit: "dag" },
          { value: String(scaleTarget.g), unit: "g" },
        ],
        "kg",
      )
    : null;
  const items = scaleItem
    ? [scaleItem]
    : input.activity === "unit-scale-mass"
      ? [MASS_SCALE_ITEMS[input.difficulty]]
      : input.activity === "medicine-packing"
        ? [MEDICINE_ITEMS[input.difficulty]]
        : input.activity === "mixed-measurements"
          ? MIXED_ITEMS[input.difficulty]
          : INDEPENDENT_ITEMS[input.difficulty];

  return {
    generatorId: DECIMAL_MEASUREMENT_L2_GENERATOR_ID,
    generatorVersion: 5,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    story: items.map((conversion) => conversion.prompt).join(" "),
    items: items.map((conversion) => ({
      ...conversion,
      parts: conversion.parts.map((part) => ({ ...part })),
      realismClaim: conversion.realismClaim ? { ...conversion.realismClaim } : undefined,
    })),
    scaleTarget,
    skillIds: [DECIMAL_MEASUREMENT_L2_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "unit-is-always-explicit",
      "realistic-mass-range-is-checked",
      "length-and-mass-dimensions-stay-separate",
      "answer-spec-server-only",
    ],
  };
}

const ACTIVITIES: readonly DecimalMeasurementL2Activity[] = [
  "laboratory-scale-mass",
  "unit-scale-mass",
  "medicine-packing",
  "mixed-measurements",
  "independent-mixed",
];

export function isDecimalMeasurementL2Activity(value: string): value is DecimalMeasurementL2Activity {
  return ACTIVITIES.includes(value as DecimalMeasurementL2Activity);
}
