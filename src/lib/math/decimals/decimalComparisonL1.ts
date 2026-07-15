import { compareDecimalValues, parseDecimalInput } from "@/lib/math/decimals/decimalMath";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** M5-5.2 korzysta z istniejącego adaptera sesji dla modeli dziesiętnych. */
export const DECIMAL_COMPARISON_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_COMPARISON_SKILL_ID = "M5-5.2-compare-decimals" as const;

export type DecimalComparisonActivity =
  | "align-places"
  | "compare-left"
  | "shared-axis"
  | "digit-traps"
  | "robot-ranking";

export type DecimalComparisonSign = "<" | "=" | ">";
export type DecimalComparisonPlace = "ones" | "tenths" | "hundredths" | "thousandths";

export interface DecimalComparisonRobot {
  id: string;
  name: string;
  distance: string;
}

export interface DecimalComparisonPublicTask {
  generatorId: typeof DECIMAL_COMPARISON_GENERATOR_ID;
  generatorVersion: 3;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalComparisonActivity;
  prompt: string;
  pair: { left: string; right: string };
  robots: DecimalComparisonRobot[];
  skillIds: readonly [typeof DECIMAL_COMPARISON_SKILL_ID];
  invariants: readonly [
    "trailing-zeros-preserve-value",
    "comparison-is-exact-no-float",
    "answer-spec-server-only",
  ];
}

export interface DecimalComparisonColumn {
  id: DecimalComparisonPlace;
  label: string;
  leftDigit: string;
  rightDigit: string;
  equal: boolean;
}

const PLACE_META: ReadonlyArray<{ id: DecimalComparisonPlace; label: string }> = [
  { id: "ones", label: "jedności" },
  { id: "tenths", label: "części dziesiąte" },
  { id: "hundredths", label: "części setne" },
  { id: "thousandths", label: "części tysięczne" },
];

const COMPARE_PAIRS: Record<LessonDifficulty, { left: string; right: string }> = {
  support: { left: "2,4", right: "2,3" },
  core: { left: "2,376", right: "2,369" },
  challenge: { left: "1,205", right: "1,204" },
};

const ROBOTS: Record<LessonDifficulty, DecimalComparisonRobot[]> = {
  support: [
    { id: "bolt", name: "Bolt", distance: "1,05" },
    { id: "atlas", name: "Atlas", distance: "1,2" },
    { id: "comet", name: "Kometa", distance: "1,18" },
  ],
  core: [
    { id: "pixel", name: "Piksel", distance: "1,18" },
    { id: "turbo", name: "Turbo", distance: "1,205" },
    { id: "neon", name: "Neon", distance: "1,2" },
  ],
  challenge: [
    { id: "nova", name: "Nova", distance: "0,899" },
    { id: "orbit", name: "Orbita", distance: "0,909" },
    { id: "spark", name: "Iskra", distance: "0,9" },
    { id: "zen", name: "Zen", distance: "0,89" },
  ],
};

function parsedOrThrow(input: string) {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed;
}

function paddedDigits(input: string, scale: number): { integer: string; fraction: string; display: string } {
  const parsed = parsedOrThrow(input);
  if (parsed.value.sign < 0) throw new Error("Porównania L1 obejmują nieujemne liczby dziesiętne.");
  const coefficient = parsed.value.coefficient.padStart(parsed.value.scale + 1, "0");
  const integer = parsed.value.scale === 0 ? coefficient : coefficient.slice(0, -parsed.value.scale);
  if (integer.length !== 1) throw new Error("Porównania L1 obejmują liczby mniejsze od 10.");
  const originalFraction = parsed.value.scale === 0 ? "" : coefficient.slice(-parsed.value.scale);
  const fraction = originalFraction.padEnd(scale, "0");
  return { integer, fraction, display: `${integer},${fraction}` };
}

export function compareDecimalStrings(left: string, right: string): -1 | 0 | 1 {
  return compareDecimalValues(parsedOrThrow(left).value, parsedOrThrow(right).value);
}

export function comparisonSign(left: string, right: string): DecimalComparisonSign {
  const comparison = compareDecimalStrings(left, right);
  return comparison < 0 ? "<" : comparison > 0 ? ">" : "=";
}

/** Ogólny walidator znaku akceptuje dowolną liczbę równoważnych zer końcowych. */
export function validateComparisonSign(left: string, right: string, sign: string): boolean {
  return (sign === "<" || sign === "=" || sign === ">") && comparisonSign(left, right) === sign;
}

export function alignedDecimalColumns(left: string, right: string, minimumScale = 3): {
  leftDisplay: string;
  rightDisplay: string;
  columns: DecimalComparisonColumn[];
} {
  const leftScale = parsedOrThrow(left).value.scale;
  const rightScale = parsedOrThrow(right).value.scale;
  const scale = Math.max(1, Math.min(3, Math.max(minimumScale, leftScale, rightScale)));
  const alignedLeft = paddedDigits(left, scale);
  const alignedRight = paddedDigits(right, scale);
  const leftDigits = [alignedLeft.integer, ...alignedLeft.fraction];
  const rightDigits = [alignedRight.integer, ...alignedRight.fraction];
  const columns = PLACE_META.slice(0, scale + 1).map((place, index) => ({
    ...place,
    leftDigit: leftDigits[index]!,
    rightDigit: rightDigits[index]!,
    equal: leftDigits[index] === rightDigits[index],
  }));
  return { leftDisplay: alignedLeft.display, rightDisplay: alignedRight.display, columns };
}

export function firstDifferentDecimalPlace(left: string, right: string): DecimalComparisonPlace | null {
  return alignedDecimalColumns(left, right, 3).columns.find((column) => !column.equal)?.id ?? null;
}

/** Waliduje dokładną kolejność, porównując wartości, a nie długość ich zapisów. */
export function validateDecimalOrder(
  items: ReadonlyArray<{ id: string; value: string }>,
  submittedIds: readonly string[],
  direction: "ascending" | "descending",
): boolean {
  if (submittedIds.length !== items.length || new Set(submittedIds).size !== items.length) return false;
  const byId = new Map(items.map((item) => [item.id, item] as const));
  if (submittedIds.some((id) => !byId.has(id))) return false;
  const values = submittedIds.map((id) => byId.get(id)!.value);
  return values.every((value, index) => {
    if (index === 0) return true;
    const result = compareDecimalStrings(values[index - 1]!, value);
    return direction === "ascending" ? result <= 0 : result >= 0;
  });
}

function rotated<T>(items: readonly T[], offset: number): T[] {
  const safeOffset = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(safeOffset), ...items.slice(0, safeOffset)];
}

function promptFor(activity: DecimalComparisonActivity): string {
  switch (activity) {
    case "align-places":
      return "Wyrównaj 0,5 i 0,50 w tabeli. Dodane zero ma być pomocnicze i nie może zmienić wartości liczby.";
    case "compare-left":
      return "Odsłaniaj kolumny od lewej. Zatrzymaj się przy pierwszej różnej parze cyfr i wybierz poprawny znak.";
    case "shared-axis":
      return "Powiększ wspólną oś dla 1,2, 1,18 i 1,205, a potem wybierz ich kolejność rosnącą.";
    case "digit-traps":
      return "Rozwiąż dwie pułapki liczby cyfr: 0,9 z 0,899 oraz 3,04 z 3,4.";
    case "robot-ranking":
      return "Ułóż ranking skoków robotów od najdłuższego do najkrótszego i uzasadnij pierwszą różną pozycją.";
  }
}

/** Publiczny wariant M5-5.2. Zawiera dane zadania, lecz nie zawiera answerSpec. */
export function createPublicDecimalComparisonTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalComparisonActivity;
}): DecimalComparisonPublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed porównania musi być nieujemną liczbą całkowitą.");
  }
  const robots = rotated(ROBOTS[input.difficulty], input.seed % ROBOTS[input.difficulty].length);
  const pair = input.activity === "align-places"
    ? { left: "0,5", right: "0,50" }
    : input.activity === "digit-traps"
      ? { left: "0,9", right: "0,899" }
      : input.activity === "shared-axis"
        ? { left: "1,18", right: "1,205" }
        : COMPARE_PAIRS[input.difficulty];

  return {
    generatorId: DECIMAL_COMPARISON_GENERATOR_ID,
    generatorVersion: 3,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    pair,
    robots,
    skillIds: [DECIMAL_COMPARISON_SKILL_ID],
    invariants: [
      "trailing-zeros-preserve-value",
      "comparison-is-exact-no-float",
      "answer-spec-server-only",
    ],
  };
}

const ACTIVITIES: readonly DecimalComparisonActivity[] = [
  "align-places", "compare-left", "shared-axis", "digit-traps", "robot-ranking",
];

export function isDecimalComparisonActivity(value: string): value is DecimalComparisonActivity {
  return ACTIVITIES.includes(value as DecimalComparisonActivity);
}
