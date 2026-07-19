import {
  areEquivalentDecimals,
  formatDecimal,
  multiplyDecimalValues,
  parseDecimalInput,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

export const DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID = "M5-5.7-decimal-times-natural" as const;

export type DecimalNaturalMultiplyL1Activity = "decimal-natural-mental" | "decimal-natural-written" | "decimal-natural-story";

export interface DecimalNaturalMultiplyL1Task {
  generatorId: typeof DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID;
  generatorVersion: 1;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalMultiplyL1Activity;
  decimalFactor: string;
  naturalFactor: number;
  prompt: string;
  story?: string;
  storyQuestion?: string;
  answerUnit?: string;
  pictureKind?: "bottles" | "ribbons" | "tickets" | "apples" | "notebooks" | "boxes";
  skillIds: readonly [typeof DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID];
}

export interface DecimalNaturalMultiplyValidation {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  answerLabel: string;
}

type TaskData = Pick<DecimalNaturalMultiplyL1Task, "decimalFactor" | "naturalFactor" | "prompt" | "story" | "storyQuestion" | "answerUnit" | "pictureKind">;

const MENTAL_TASKS: readonly TaskData[] = [
  { decimalFactor: "1,2", naturalFactor: 3, prompt: "Oblicz w pamięci." },
  { decimalFactor: "2,5", naturalFactor: 4, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,7", naturalFactor: 5, prompt: "Oblicz w pamięci." },
  { decimalFactor: "3,4", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "1,05", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,25", naturalFactor: 4, prompt: "Oblicz w pamięci." },
  { decimalFactor: "4,2", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "1,6", naturalFactor: 5, prompt: "Oblicz w pamięci." },
  { decimalFactor: "0,45", naturalFactor: 2, prompt: "Oblicz w pamięci." },
  { decimalFactor: "2,05", naturalFactor: 3, prompt: "Oblicz w pamięci." },
];

const WRITTEN_TASKS: readonly TaskData[] = [
  { decimalFactor: "2,35", naturalFactor: 3, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "4,08", naturalFactor: 5, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "1,27", naturalFactor: 6, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "3,45", naturalFactor: 4, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "2,09", naturalFactor: 7, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "5,16", naturalFactor: 3, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "0,84", naturalFactor: 9, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "6,25", naturalFactor: 8, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "7,04", naturalFactor: 6, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
  { decimalFactor: "1,58", naturalFactor: 7, prompt: "Zapisz mnożenie pisemne i podaj wynik." },
];

const STORY_TASKS: readonly TaskData[] = [
  { decimalFactor: "1,25", naturalFactor: 4, prompt: "Rozwiąż zadanie tekstowe.", story: "Do szkolnego bufetu dostarczono 4 jednakowe butelki soku. W każdej butelce jest 1,25 l soku.", storyQuestion: "Ile litrów soku dostarczono łącznie?", answerUnit: "l", pictureKind: "bottles" },
  { decimalFactor: "2,4", naturalFactor: 3, prompt: "Rozwiąż zadanie tekstowe.", story: "Do wykonania jednej dekoracji potrzeba 2,4 m wstążki. Klasa przygotowuje 3 takie dekoracje.", storyQuestion: "Ile metrów wstążki potrzeba łącznie?", answerUnit: "m", pictureKind: "ribbons" },
  { decimalFactor: "4,50", naturalFactor: 6, prompt: "Rozwiąż zadanie tekstowe.", story: "Jeden bilet na szkolne przedstawienie kosztuje 4,50 zł. Rodzina kupiła 6 biletów.", storyQuestion: "Ile zapłacono za wszystkie bilety?", answerUnit: "zł", pictureKind: "tickets" },
  { decimalFactor: "1,35", naturalFactor: 5, prompt: "Rozwiąż zadanie tekstowe.", story: "W jednym worku znajduje się 1,35 kg jabłek. Na kiermasz przygotowano 5 takich worków.", storyQuestion: "Ile kilogramów jabłek przygotowano?", answerUnit: "kg", pictureKind: "apples" },
  { decimalFactor: "2,75", naturalFactor: 7, prompt: "Rozwiąż zadanie tekstowe.", story: "Do szkolnego koła plastycznego kupiono 7 jednakowych zeszytów. Jeden zeszyt kosztował 2,75 zł.", storyQuestion: "Ile zapłacono za wszystkie zeszyty?", answerUnit: "zł", pictureKind: "notebooks" },
  { decimalFactor: "0,85", naturalFactor: 6, prompt: "Rozwiąż zadanie tekstowe.", story: "W jednym pudełku znajduje się 0,85 kg koralików. Do pracowni przyniesiono 6 takich pudełek.", storyQuestion: "Ile kilogramów koralików przyniesiono łącznie?", answerUnit: "kg", pictureKind: "boxes" },
];

export function createPublicDecimalNaturalMultiplyL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalNaturalMultiplyL1Activity;
}): DecimalNaturalMultiplyL1Task {
  const tasks = input.activity === "decimal-natural-mental"
    ? MENTAL_TASKS
    : input.activity === "decimal-natural-story"
      ? STORY_TASKS
      : WRITTEN_TASKS;
  const taskIndex = input.activity === "decimal-natural-story"
    ? ((input.seed - 557300) % tasks.length + tasks.length) % tasks.length
    : input.seed % tasks.length;
  const data = tasks[taskIndex]!;
  return {
    generatorId: DECIMAL_NATURAL_MULTIPLY_L1_GENERATOR_ID,
    generatorVersion: 1,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    ...data,
    skillIds: [DECIMAL_NATURAL_MULTIPLY_L1_SKILL_ID],
  };
}

export function decimalNaturalMultiplyExpectedAnswer(task: Pick<DecimalNaturalMultiplyL1Task, "decimalFactor" | "naturalFactor">): string {
  const left = parseDecimalInput(task.decimalFactor);
  const right = parseDecimalInput(String(task.naturalFactor));
  if (!left.ok || !right.ok) throw new Error("Nie można obliczyć iloczynu.");
  return formatDecimal(multiplyDecimalValues(left.value, right.value), { trimTrailingZeros: true });
}

export function validateDecimalNaturalMultiplyAnswer(input: {
  task: DecimalNaturalMultiplyL1Task;
  answer: string;
}): DecimalNaturalMultiplyValidation {
  const answerLabel = input.answer.trim() || "□";
  if (!input.answer.trim()) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, answerLabel };
  const actual = parseDecimalInput(input.answer);
  const expected = parseDecimalInput(decimalNaturalMultiplyExpectedAnswer(input.task));
  if (!actual.ok || !expected.ok || !areEquivalentDecimals(actual.value, expected.value)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, answerLabel };
  }
  return { correct: true, code: null, answerLabel };
}

export function isDecimalNaturalMultiplyL1Activity(activity: string): activity is DecimalNaturalMultiplyL1Activity {
  return activity === "decimal-natural-mental" || activity === "decimal-natural-written" || activity === "decimal-natural-story";
}
