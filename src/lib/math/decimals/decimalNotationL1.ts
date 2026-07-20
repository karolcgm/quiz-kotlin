import type { LessonDifficulty } from "@/types/lessonPackage";
import type { DecimalComparisonActivity } from "@/lib/math/decimals/decimalComparisonL1";
import type { DecimalAddSubL1Activity } from "@/lib/math/decimals/decimalAddSubL1";
import type { DecimalAddSubL2Activity } from "@/lib/math/decimals/decimalAddSubL2";
import type { DecimalMeasurementL1Activity } from "@/lib/math/decimals/decimalMeasurementL1";
import type { DecimalMeasurementL2Activity } from "@/lib/math/decimals/decimalMeasurementL2";
import type { DecimalNotationL2Activity } from "@/lib/math/decimals/decimalNotationL2";
import type { DecimalPowerTenL1Activity } from "@/lib/math/decimals/decimalPowerTenL1";
import type { DecimalNaturalMultiplyL1Activity } from "@/lib/math/decimals/decimalNaturalMultiplyL1";
import type { DecimalDecimalMultiplyL1Activity } from "@/lib/math/decimals/decimalDecimalMultiplyL1";
import type { DecimalNaturalDivideL1Activity } from "@/lib/math/decimals/decimalNaturalDivideL1";
import type { DecimalDivideByDecimalL1Activity } from "@/lib/math/decimals/decimalDivideByDecimalL1";
import type { DecimalEstimateL1Activity } from "@/lib/math/decimals/decimalEstimateL1";
import type { DecimalFractionOperationsActivity } from "@/components/lessons/decimals/DecimalFractionOperationsLab";

export const DECIMAL_NOTATION_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_NOTATION_L1_SKILL_ID = "M5-5.1-decimal-notation" as const;

export type DecimalNotationL1Activity =
  | "place-names"
  | "decimal-to-fraction-example"
  | "decimal-to-fraction-practice"
  | "fraction-to-decimal-example"
  | "fraction-to-decimal-practice"
  | "decimal-number-line"
  | "tenths-hundredths"
  | "hundred-grid"
  | "place-table"
  | "word-digit"
  | "glass"
  | "independent";

export type DecimalNotationActivity = DecimalNotationL1Activity | DecimalNotationL2Activity | DecimalComparisonActivity | DecimalMeasurementL1Activity | DecimalMeasurementL2Activity | DecimalAddSubL1Activity | DecimalAddSubL2Activity | DecimalPowerTenL1Activity | DecimalNaturalMultiplyL1Activity | DecimalDecimalMultiplyL1Activity | DecimalNaturalDivideL1Activity | DecimalDivideByDecimalL1Activity | DecimalEstimateL1Activity | DecimalFractionOperationsActivity;

export interface DecimalNotationL1PublicTask {
  generatorId: typeof DECIMAL_NOTATION_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNotationL1Activity;
  prompt: string;
  targetHundredths: number;
  decimalDisplay: string;
  fractionDisplay: string;
  words: string;
  skillIds: readonly [typeof DECIMAL_NOTATION_L1_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "hundred-grid-and-notation-synchronized",
    "answer-spec-server-only",
  ];
}

const TARGETS: Record<LessonDifficulty, readonly number[]> = {
  support: [20, 30, 40, 50],
  core: [14, 27, 37, 63, 82],
  challenge: [4, 9, 19, 40, 54],
};

const ONES = [
  "zero",
  "jeden",
  "dwa",
  "trzy",
  "cztery",
  "pięć",
  "sześć",
  "siedem",
  "osiem",
  "dziewięć",
] as const;

const TEENS = [
  "dziesięć",
  "jedenaście",
  "dwanaście",
  "trzynaście",
  "czternaście",
  "piętnaście",
  "szesnaście",
  "siedemnaście",
  "osiemnaście",
  "dziewiętnaście",
] as const;

const TENS = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt", "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"] as const;

function assertHundredths(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100) {
    throw new Error("Liczba setnych musi być liczbą całkowitą od 0 do 100.");
  }
}

function wordsBelowHundred(value: number): string {
  if (value < 10) return ONES[value]!;
  if (value < 20) return TEENS[value - 10]!;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${TENS[tens]}${ones ? ` ${ONES[ones]}` : ""}`;
}

export function decimalHundredthsDisplay(value: number): string {
  assertHundredths(value);
  if (value === 100) return "1,00";
  if (value > 0 && value % 10 === 0) return `0,${value / 10}`;
  return `0,${String(value).padStart(2, "0")}`;
}

export function decimalHundredthsWords(value: number): string {
  assertHundredths(value);
  if (value === 100) return "jedna całość";
  if (value > 0 && value % 10 === 0) {
    const tenths = value / 10;
    if (tenths === 1) return "jedna dziesiąta";
    if (tenths >= 2 && tenths <= 4) return `${tenths === 2 ? "dwie" : ONES[tenths]} dziesiąte`;
    return `${ONES[tenths]} dziesiątych`;
  }
  if (value === 1) return "jedna setna";
  if (value === 2) return "dwie setne";
  if (value === 3 || value === 4) return `${ONES[value]} setne`;
  return `${wordsBelowHundred(value)} setnych`;
}

function promptFor(activity: DecimalNotationL1Activity, targetHundredths: number): string {
  const decimal = decimalHundredthsDisplay(targetHundredths);
  const fraction = `${targetHundredths}/100`;
  switch (activity) {
    case "place-names":
      return "Nazwij miejsce wskazanej cyfry w liczbie dziesiętnej.";
    case "decimal-to-fraction-example":
      return "Zobacz, jak liczba miejsc po przecinku wyznacza mianownik ułamka zwykłego.";
    case "decimal-to-fraction-practice":
      return "Zamień liczbę dziesiętną na ułamek zwykły i skróć go do postaci nieskracalnej.";
    case "fraction-to-decimal-example":
      return "Zobacz, jak rozszerzyć ułamek do mianownika 10, 100 lub 1000.";
    case "fraction-to-decimal-practice":
      return "Rozszerz ułamek, a następnie zapisz go w postaci dziesiętnej.";
    case "decimal-number-line":
      return "Zaznacz podaną liczbę dziesiętną na osi liczbowej.";
    case "tenths-hundredths":
      return "Dodawaj całe części dziesiąte i pojedyncze setne. Obserwuj, jak każda zmiana wpływa na zapis.";
    case "hundred-grid":
      return "Pomaluj dokładnie 37 ze 100 pól. Licznik, ułamek i zapis dziesiętny zmieniają się od razu.";
    case "place-table":
      return "Umieść 0 jedności, 3 części dziesiąte i 7 części setnych w odpowiednich kolumnach.";
    case "word-digit":
      return "Uzupełnij oba kierunki zapisu: ze słów na cyfry i z cyfr na słowa. Odpowiedź nie pojawi się przed próbą.";
    case "glass":
      return "Zabarw dwie szklanki: 0,4 pojemności oraz 0,04 pojemności. Porównaj 40 setnych z 4 setnymi.";
    case "independent":
      return `Samodzielnie przedstaw ${fraction}, czyli ${decimal}, na kratownicy, w tabeli i w obu zapisach.`;
  }
}

/** Publiczny, deterministyczny wariant L1. Nie zawiera answerSpec ani rubryki. */
export function createPublicDecimalNotationL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNotationL1Activity;
}): DecimalNotationL1PublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed zadania dziesiętnego musi być nieujemną liczbą całkowitą.");
  }
  const targets = TARGETS[input.difficulty];
  const generatedTarget = targets[input.seed % targets.length]!;
  const targetHundredths = input.activity === "hundred-grid"
    || input.activity === "place-table"
    || input.activity === "word-digit"
    ? 37
    : generatedTarget;

  return {
    generatorId: DECIMAL_NOTATION_L1_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity, targetHundredths),
    targetHundredths,
    decimalDisplay: decimalHundredthsDisplay(targetHundredths),
    fractionDisplay: `${targetHundredths}/100`,
    words: decimalHundredthsWords(targetHundredths),
    skillIds: [DECIMAL_NOTATION_L1_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "hundred-grid-and-notation-synchronized",
      "answer-spec-server-only",
    ],
  };
}

export function decimalNotationL1ActivityFromStageId(stageId: string): DecimalNotationActivity {
  if (stageId.includes("fraction-decimal-remember")) return "fraction-decimal-remember";
  if (stageId.includes("fraction-decimal-add")) return "fraction-decimal-add";
  if (stageId.includes("fraction-decimal-subtract")) return "fraction-decimal-subtract";
  if (stageId.includes("fraction-decimal-multiply")) return "fraction-decimal-multiply";
  if (stageId.includes("fraction-decimal-divide")) return "fraction-decimal-divide";
  if (stageId.includes("decimal-estimate-round")) return "decimal-estimate-round";
  if (stageId.includes("decimal-estimate-sense")) return "decimal-estimate-sense";
  if (stageId.includes("decimal-decimal-mental")) return "decimal-decimal-mental";
  if (stageId.includes("decimal-decimal-written")) return "decimal-decimal-written";
  if (stageId.includes("decimal-decimal-story")) return "decimal-decimal-story";
  if (stageId.includes("decimal-natural-divide-mental")) return "decimal-natural-divide-mental";
  if (stageId.includes("decimal-natural-divide-written")) return "decimal-natural-divide-written";
  if (stageId.includes("decimal-natural-divide-story")) return "decimal-natural-divide-story";
  if (stageId.includes("decimal-divide-by-decimal-shift")) return "decimal-divide-by-decimal-shift";
  if (stageId.includes("decimal-natural-mental")) return "decimal-natural-mental";
  if (stageId.includes("decimal-natural-written")) return "decimal-natural-written";
  if (stageId.includes("decimal-natural-story")) return "decimal-natural-story";
  if (stageId.includes("mental-add-sub")) return "mental-add-sub";
  if (stageId.includes("written-add-sub")) return "written-add-sub";
  if (stageId.includes("story-add-sub")) return "story-add-sub";
  if (stageId.includes("decimal-to-fraction-example")) return "decimal-to-fraction-example";
  if (stageId.includes("decimal-to-fraction-practice")) return "decimal-to-fraction-practice";
  if (stageId.includes("fraction-to-decimal-example")) return "fraction-to-decimal-example";
  if (stageId.includes("fraction-to-decimal-practice")) return "fraction-to-decimal-practice";
  if (stageId.includes("decimal-number-line")) return "decimal-number-line";
  if (stageId.includes("place-names")) return "place-names";
  if (stageId.includes("power10-position-shift")) return "power10-position-shift";
  if (stageId.includes("power10-predict")) return "power10-predict";
  if (stageId.includes("power10-missing-zero")) return "power10-missing-zero";
  if (stageId.includes("power10-microscope")) return "power10-microscope";
  if (stageId.includes("power10-practice")) return "power10-practice";
  if (stageId.includes("divide10-position-shift")) return "divide10-position-shift";
  if (stageId.includes("divide10-practice")) return "divide10-practice";
  if (stageId.includes("borrowing-subtraction")) return "borrowing-subtraction";
  if (stageId.includes("change-two-methods")) return "change-two-methods";
  if (stageId.includes("workshop-receipt")) return "workshop-receipt";
  if (stageId.includes("repair-context-comma")) return "repair-context-comma";
  if (stageId.includes("independent-add-sub-l2")) return "independent-add-sub-l2";
  if (stageId.includes("comma-columns")) return "comma-columns";
  if (stageId.includes("column-addition")) return "column-addition";
  if (stageId.includes("basic-subtraction")) return "basic-subtraction";
  if (stageId.includes("repair-shifted-comma")) return "repair-shifted-comma";
  if (stageId.includes("independent-add-sub")) return "independent-add-sub";
  if (stageId.includes("laboratory-scale-mass")) return "laboratory-scale-mass";
  if (stageId.includes("unit-scale-mass")) return "unit-scale-mass";
  if (stageId.includes("medicine-packing")) return "medicine-packing";
  if (stageId.includes("mixed-measurements")) return "mixed-measurements";
  if (stageId.includes("independent-mixed")) return "independent-mixed";
  if (stageId.includes("length-units-ruler")) return "length-units-ruler";
  if (stageId.includes("mass-units-theory")) return "mass-units-theory";
  if (stageId.includes("unit-conversion-practice")) return "unit-conversion-practice";
  if (stageId.includes("realtime-ruler")) return "realtime-ruler";
  if (stageId.includes("two-part-length")) return "two-part-length";
  if (stageId.includes("unit-scale-length")) return "unit-scale-length";
  if (stageId.includes("length-story")) return "length-story";
  if (stageId.includes("independent-length")) return "independent-length";
  if (stageId.includes("pair-comparison")) return "pair-comparison";
  if (stageId.includes("ascending-order")) return "ascending-order";
  if (stageId.includes("open-inequality")) return "open-inequality";
  if (stageId.includes("align-places")) return "align-places";
  if (stageId.includes("compare-left")) return "compare-left";
  if (stageId.includes("shared-axis")) return "shared-axis";
  if (stageId.includes("digit-traps")) return "digit-traps";
  if (stageId.includes("robot-ranking")) return "robot-ranking";
  if (stageId.includes("thousandths-table")) return "thousandths-table";
  if (stageId.includes("zoom-axis")) return "zoom-axis";
  if (stageId.includes("representation-bridge")) return "representation-bridge";
  if (stageId.includes("dye-lab-l2")) return "dye-lab-l2";
  if (stageId.includes("independent-l2")) return "independent-l2";
  if (stageId.includes("tenths-hundredths")) return "tenths-hundredths";
  if (stageId.includes("hundred-grid")) return "hundred-grid";
  if (stageId.includes("place-table")) return "place-table";
  if (stageId.includes("word-digit")) return "word-digit";
  if (stageId.includes("glass")) return "glass";
  if (stageId.includes("independent")) return "independent";
  return "hundred-grid";
}
