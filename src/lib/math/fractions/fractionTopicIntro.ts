import type { FractionValue, MixedFractionValue } from "@/types/fractions";

export type FractionTopicIntroActivity =
  | "topic1-shade-colors"
  | "topic1-axis-labels"
  | "topic1-independent-basic"
  | "topic1-classify"
  | "topic1-improper-model"
  | "topic1-unit-fractions"
  | "topic1-mixed-to-improper"
  | "topic1-independent-advanced"
  | "topic2-halves"
  | "topic2-quotient-fractions"
  | "topic2-wholes-as-fractions"
  | "topic2-improper-to-mixed"
  | "topic2-independent";

export interface IntroPracticeTask {
  kind: "fraction" | "mixed" | "classification";
  prompt: string;
  source?: FractionValue | MixedFractionValue;
  expectedFraction?: FractionValue;
  expectedMixed?: MixedFractionValue;
  expectedClassification?: "proper" | "improper";
}

const TOPIC1_BASIC_TASKS: readonly IntroPracticeTask[] = [
  { kind: "fraction", prompt: "Zaznacz trzy z pięciu części i zapisz ułamek.", expectedFraction: { numerator: 3, denominator: 5 } },
  { kind: "fraction", prompt: "Punkt A leży na drugiej z siedmiu równych części osi. Zapisz jego wartość.", expectedFraction: { numerator: 2, denominator: 7 } },
  { kind: "fraction", prompt: "Cztery z dziewięciu kółek są zielone. Zapisz część zielonych kółek.", expectedFraction: { numerator: 4, denominator: 9 } },
  { kind: "fraction", prompt: "Zaznacz pięć z ośmiu równych pól i zapisz ułamek.", expectedFraction: { numerator: 5, denominator: 8 } },
  { kind: "fraction", prompt: "Punkt B leży na szóstej z dziesięciu części osi. Zapisz jego wartość.", expectedFraction: { numerator: 6, denominator: 10 } },
] as const;

const TOPIC1_ADVANCED_TASKS: readonly IntroPracticeTask[] = [
  { kind: "classification", prompt: "Rozpoznaj rodzaj ułamka.", source: { numerator: 5, denominator: 8 }, expectedClassification: "proper" },
  { kind: "classification", prompt: "Rozpoznaj rodzaj ułamka.", source: { numerator: 9, denominator: 4 }, expectedClassification: "improper" },
  { kind: "mixed", prompt: "Zapisz pokolorowane koła jako liczbę mieszaną.", source: { numerator: 7, denominator: 4 }, expectedMixed: { wholePart: 1, numerator: 3, denominator: 4 } },
  { kind: "fraction", prompt: "Siedem milimetrów to jaka część centymetra?", expectedFraction: { numerator: 7, denominator: 10 } },
  { kind: "fraction", prompt: "Zamień liczbę mieszaną na ułamek niewłaściwy.", source: { wholePart: 2, numerator: 3, denominator: 5 }, expectedFraction: { numerator: 13, denominator: 5 } },
] as const;

const TOPIC2_TASKS: readonly IntroPracticeTask[] = [
  { kind: "fraction", prompt: "Przedstaw iloraz 1 : 7 jako ułamek.", expectedFraction: { numerator: 1, denominator: 7 } },
  { kind: "fraction", prompt: "Przedstaw iloraz 13 : 5 jako ułamek.", expectedFraction: { numerator: 13, denominator: 5 } },
  { kind: "fraction", prompt: "Zapisz dwie całości jako ułamek o mianowniku 6.", expectedFraction: { numerator: 12, denominator: 6 } },
  { kind: "mixed", prompt: "Zamień ułamek niewłaściwy na liczbę mieszaną.", source: { numerator: 9, denominator: 4 }, expectedMixed: { wholePart: 2, numerator: 1, denominator: 4 } },
  { kind: "mixed", prompt: "Zamień ułamek niewłaściwy na liczbę mieszaną.", source: { numerator: 11, denominator: 3 }, expectedMixed: { wholePart: 3, numerator: 2, denominator: 3 } },
] as const;

export function introPracticeTask(activity: FractionTopicIntroActivity, seed: number): IntroPracticeTask {
  const tasks = activity === "topic1-independent-basic"
    ? TOPIC1_BASIC_TASKS
    : activity === "topic1-independent-advanced"
      ? TOPIC1_ADVANCED_TASKS
      : TOPIC2_TASKS;
  return tasks[Math.abs(seed) % tasks.length]!;
}

export function isFractionTopicIntroActivity(value: string): value is FractionTopicIntroActivity {
  return value.startsWith("topic1-") || value.startsWith("topic2-");
}

export function fractionTopicIntroActivityFromStageId(stageId: string): FractionTopicIntroActivity | null {
  const activities: FractionTopicIntroActivity[] = [
    "topic1-shade-colors",
    "topic1-axis-labels",
    "topic1-independent-basic",
    "topic1-classify",
    "topic1-improper-model",
    "topic1-unit-fractions",
    "topic1-mixed-to-improper",
    "topic1-independent-advanced",
    "topic2-halves",
    "topic2-quotient-fractions",
    "topic2-wholes-as-fractions",
    "topic2-improper-to-mixed",
    "topic2-independent",
  ];
  return activities.find((activity) => stageId.includes(activity)) ?? null;
}
