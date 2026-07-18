import {
  addDecimalValues,
  areEquivalentDecimals,
  convertDecimalUnit,
  formatDecimal,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode, DecimalValue } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_MEASUREMENT_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_MEASUREMENT_SKILL_ID = "M5-5.3-units-length-mass" as const;

export type DecimalMeasurementL1Activity =
  | "length-units-ruler"
  | "mass-units-theory"
  | "unit-conversion-practice"
  | "realtime-ruler"
  | "two-part-length"
  | "unit-scale-length"
  | "length-story"
  | "independent-length";

export type DecimalLengthUnit = "mm" | "cm" | "m" | "km";
export type DecimalLengthScaleOperation = "×10" | "×100" | "×1000" | "÷10" | "÷100" | "÷1000";

export interface DecimalLengthPart {
  value: string;
  unit: DecimalLengthUnit;
}

export interface DecimalMeasurementPublicTask {
  generatorId: typeof DECIMAL_MEASUREMENT_GENERATOR_ID;
  generatorVersion: 4;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalMeasurementL1Activity;
  prompt: string;
  story: string;
  parts: DecimalLengthPart[];
  targetUnit: DecimalLengthUnit;
  skillIds: readonly [typeof DECIMAL_MEASUREMENT_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "unit-is-always-explicit",
    "realistic-length-range",
    "answer-spec-server-only",
  ];
}

export interface DecimalLengthValidationResult {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  normalizedDisplay?: string;
}

const UNIT_EXPONENT: Record<DecimalLengthUnit, number> = {
  mm: -3,
  cm: -2,
  m: 0,
  km: 3,
};

const RULER_TARGETS: Record<LessonDifficulty, string> = {
  support: "1250",
  core: "2350",
  challenge: "2875",
};

const SCALE_TASKS: Record<LessonDifficulty, Pick<DecimalMeasurementPublicTask, "story" | "parts" | "targetUnit">> = {
  support: {
    story: "Taśma ma długość 3,4 m. Ile to centymetrów?",
    parts: [{ value: "3,4", unit: "m" }],
    targetUnit: "cm",
  },
  core: {
    story: "Listwa ma długość 4,05 m. Ile to centymetrów?",
    parts: [{ value: "4,05", unit: "m" }],
    targetUnit: "cm",
  },
  challenge: {
    story: "Odcinek szlaku ma 1,275 km. Ile to metrów?",
    parts: [{ value: "1,275", unit: "km" }],
    targetUnit: "m",
  },
};

const STORY_TASKS: Record<LessonDifficulty, Pick<DecimalMeasurementPublicTask, "story" | "parts" | "targetUnit">> = {
  support: {
    story: "Pracownia potrzebuje odcinka taśmy długości 3 m 40 cm. Zapisz długość w metrach.",
    parts: [{ value: "3", unit: "m" }, { value: "40", unit: "cm" }],
    targetUnit: "m",
  },
  core: {
    story: "Trasa robota pomiarowego ma 1 km 250 m. Zapisz długość w kilometrach.",
    parts: [{ value: "1", unit: "km" }, { value: "250", unit: "m" }],
    targetUnit: "km",
  },
  challenge: {
    story: "Leśna ścieżka ma 2 km 75 m. Zapisz długość w kilometrach i zachowaj potrzebne zero.",
    parts: [{ value: "2", unit: "km" }, { value: "75", unit: "m" }],
    targetUnit: "km",
  },
};

const INDEPENDENT_TASKS: Record<LessonDifficulty, Pick<DecimalMeasurementPublicTask, "story" | "parts" | "targetUnit">> = {
  support: {
    story: "Wstążka ma 850 cm. Zapisz jej długość w metrach.",
    parts: [{ value: "850", unit: "cm" }],
    targetUnit: "m",
  },
  core: {
    story: "Deska ma 4,05 m. Zapisz jej długość w centymetrach.",
    parts: [{ value: "4,05", unit: "m" }],
    targetUnit: "cm",
  },
  challenge: {
    story: "Odcinek trasy ma 1,275 km. Zapisz jego długość w metrach.",
    parts: [{ value: "1,275", unit: "km" }],
    targetUnit: "m",
  },
};

function parsedValue(input: string): DecimalValue {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
}

export function lengthScaleOperation(from: DecimalLengthUnit, to: DecimalLengthUnit): DecimalLengthScaleOperation {
  const power = UNIT_EXPONENT[from] - UNIT_EXPONENT[to];
  const magnitude = 10 ** Math.abs(power);
  if (power === 0 || ![10, 100, 1000].includes(magnitude)) {
    throw new Error("Ten etap L1 obsługuje zmianę skali przez 10, 100 albo 1000.");
  }
  return `${power > 0 ? "×" : "÷"}${magnitude}` as DecimalLengthScaleOperation;
}

export function taskScaleOperation(task: DecimalMeasurementPublicTask): DecimalLengthScaleOperation {
  const convertedPart = task.parts.at(-1);
  if (!convertedPart) throw new Error("Zadanie długości musi zawierać co najmniej jedną część.");
  return lengthScaleOperation(convertedPart.unit, task.targetUnit);
}

export function convertLengthParts(parts: readonly DecimalLengthPart[], targetUnit: DecimalLengthUnit): DecimalValue {
  if (parts.length === 0) throw new Error("Do przeliczenia potrzebna jest co najmniej jedna długość.");
  return parts
    .map((part) => convertDecimalUnit(parsedValue(part.value), part.unit, targetUnit))
    .reduce((sum, value) => addDecimalValues(sum, value));
}

export function expectedLengthDisplay(task: DecimalMeasurementPublicTask): string {
  return formatDecimal(convertLengthParts(task.parts, task.targetUnit), { trimTrailingZeros: true });
}

export function lengthDisplaysFromMillimeters(millimeters: number): { mm: string; cm: string; m: string } {
  if (!Number.isSafeInteger(millimeters) || millimeters < 0 || millimeters > 3000) {
    throw new Error("Miarka L1 obejmuje od 0 mm do 3000 mm.");
  }
  const value = parsedValue(String(millimeters));
  return {
    mm: `${millimeters}`,
    cm: formatDecimal(convertDecimalUnit(value, "mm", "cm"), { trimTrailingZeros: true }),
    m: formatDecimal(convertDecimalUnit(value, "mm", "m"), { trimTrailingZeros: true }),
  };
}

export function validateLengthConversion(input: {
  task: DecimalMeasurementPublicTask;
  value: string;
  unit: string;
  scaleOperation?: string;
}): DecimalLengthValidationResult {
  const parsed = parseDecimalInput(input.value);
  if (!parsed.ok) {
    return {
      correct: false,
      code: parsed.error.code === "DEC_EMPTY" ? DECIMAL_FEEDBACK_CODES.empty : DECIMAL_FEEDBACK_CODES.placeValue,
    };
  }
  if (input.scaleOperation !== undefined && input.scaleOperation !== taskScaleOperation(input.task)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, normalizedDisplay: parsed.trace.display };
  }
  const expected = convertLengthParts(input.task.parts, input.task.targetUnit);
  if (!areEquivalentDecimals(parsed.value, expected)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, normalizedDisplay: parsed.trace.display };
  }
  if (input.unit !== input.task.targetUnit) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.unitMismatch, normalizedDisplay: parsed.trace.display };
  }
  return { correct: true, code: null, normalizedDisplay: parsed.trace.display };
}

function promptFor(activity: DecimalMeasurementL1Activity): string {
  switch (activity) {
    case "length-units-ruler":
      return "Przesuwaj znacznik po jednej linijce i odczytuj tę samą długość w km, m, dm, cm oraz mm.";
    case "mass-units-theory":
      return "Poznaj zależności między toną, kilogramem, dekagramem i gramem.";
    case "unit-conversion-practice":
      return "Uzupełnij kolejne zamiany jednostek długości i masy.";
    case "realtime-ruler":
      return "Ustaw długość na miarce. Odczyty w milimetrach, centymetrach i metrach zmieniają się równocześnie.";
    case "two-part-length":
      return "Połącz 2 m i 35 cm, a potem zapisz całą długość w metrach z polskim przecinkiem i jednostką.";
    case "unit-scale-length":
      return "Wybierz mnożnik wynikający ze zmiany jednostki. Cyfry zmieniają wartość pozycyjną; przecinek nie wędruje bez wyjaśnienia.";
    case "length-story":
      return "Rozwiąż realistyczne zadanie pomiarowe. Oddziel liczbę od jawnie wybranej jednostki.";
    case "independent-length":
      return "Samodzielnie wybierz zmianę skali, oblicz wartość i dołącz wymaganą jednostkę.";
  }
}

export function createPublicDecimalMeasurementTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalMeasurementL1Activity;
}): DecimalMeasurementPublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed pomiaru musi być nieujemną liczbą całkowitą.");
  }
  const activityData = input.activity === "realtime-ruler"
    ? {
        story: `Ustaw miarkę dokładnie na ${RULER_TARGETS[input.difficulty]} mm.`,
        parts: [{ value: RULER_TARGETS[input.difficulty], unit: "mm" as const }],
        targetUnit: "m" as const,
      }
    : input.activity === "two-part-length"
      ? {
          story: "Dwa oznaczone odcinki mają 2 m oraz 35 cm. Zapisz ich łączną długość w metrach.",
          parts: [{ value: "2", unit: "m" as const }, { value: "35", unit: "cm" as const }],
          targetUnit: "m" as const,
        }
      : input.activity === "unit-scale-length"
        ? SCALE_TASKS[input.difficulty]
        : input.activity === "length-story"
          ? STORY_TASKS[input.difficulty]
          : INDEPENDENT_TASKS[input.difficulty];

  return {
    generatorId: DECIMAL_MEASUREMENT_GENERATOR_ID,
    generatorVersion: 4,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    story: activityData.story,
    parts: activityData.parts.map((part) => ({ ...part })),
    targetUnit: activityData.targetUnit,
    skillIds: [DECIMAL_MEASUREMENT_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "unit-is-always-explicit",
      "realistic-length-range",
      "answer-spec-server-only",
    ],
  };
}

const ACTIVITIES: readonly DecimalMeasurementL1Activity[] = [
  "length-units-ruler", "mass-units-theory", "unit-conversion-practice",
  "realtime-ruler", "two-part-length", "unit-scale-length", "length-story", "independent-length",
];

export function isDecimalMeasurementL1Activity(value: string): value is DecimalMeasurementL1Activity {
  return ACTIVITIES.includes(value as DecimalMeasurementL1Activity);
}
