import {
  areEquivalentDecimals,
  formatDecimal,
  parseDecimalInput,
  scaleDecimalByPower10,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalFeedbackCode } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** M5-5.5 korzysta ze wspólnego adaptera modeli dziesiętnych. */
export const DECIMAL_POWER_TEN_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_POWER_TEN_L1_SKILL_ID = "M5-5.5-multiply-power10" as const;

export type DecimalPowerTenL1Activity =
  | "power10-position-shift"
  | "power10-predict"
  | "power10-missing-zero"
  | "power10-microscope"
  | "power10-practice";

export type DecimalPowerTenQuestionKind = "result" | "missing-factor" | "unit-conversion";

export interface DecimalPowerTenPublicTask {
  generatorId: typeof DECIMAL_POWER_TEN_L1_GENERATOR_ID;
  generatorVersion: 6;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalPowerTenL1Activity;
  questionKind: DecimalPowerTenQuestionKind;
  operand: string;
  exponent: 1 | 2 | 3;
  multiplier: 10 | 100 | 1000;
  shownProduct?: string;
  sourceUnit?: "m";
  requiredUnit?: "mm";
  prompt: string;
  skillIds: readonly [typeof DECIMAL_POWER_TEN_L1_SKILL_ID];
  invariants: readonly [
    "digits-change-place-value-comma-stays-fixed",
    "required-zero-positions-are-explicit",
    "comma-independent-of-locale",
    "answer-spec-server-only",
  ];
}

export interface DecimalPowerTenValidation {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  answerLabel: string;
}

export interface DecimalDigitMovement {
  id: string;
  digit: string;
  sourcePower: number;
  targetPower: number;
}

type TaskData = Pick<
  DecimalPowerTenPublicTask,
  "questionKind" | "operand" | "exponent" | "shownProduct" | "sourceUnit" | "requiredUnit" | "prompt"
>;

const PRACTICE_TASKS: readonly TaskData[] = [
  {
    questionKind: "result",
    operand: "3,45",
    exponent: 1,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "0,08",
    exponent: 3,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "2,5",
    exponent: 2,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "0,34",
    exponent: 2,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "1,2",
    exponent: 3,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "4,07",
    exponent: 1,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "0,9",
    exponent: 3,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "12,05",
    exponent: 2,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "0,006",
    exponent: 2,
    prompt: "Oblicz iloczyn.",
  },
  {
    questionKind: "result",
    operand: "7,008",
    exponent: 3,
    prompt: "Oblicz iloczyn.",
  },
] as const;

function multiplierFor(exponent: 1 | 2 | 3): 10 | 100 | 1000 {
  return exponent === 1 ? 10 : exponent === 2 ? 100 : 1000;
}

function taskDataFor(
  activity: DecimalPowerTenL1Activity,
  seed: number,
): TaskData {
  switch (activity) {
    case "power10-position-shift":
      return {
        questionKind: "result",
        operand: "3,45",
        exponent: 1,
        prompt: "Porównaj pozycję każdej cyfry przed mnożeniem i po nim. Przecinek pozostaje w stałej prowadnicy.",
      };
    case "power10-predict":
      return {
        questionKind: "result",
        operand: "3,45",
        exponent: ((seed % 3) + 1) as 1 | 2 | 3,
        prompt: "Wybierz mnożnik, przewidź wynik, a potem sprawdź zmianę wartości każdej cyfry.",
      };
    case "power10-missing-zero":
      return {
        questionKind: "result",
        operand: "0,08",
        exponent: 3,
        prompt: "Zbuduj wynik 0,08 × 1000. Zera zajmują pozycje, przez które przechodzą cyfry 8 i 0.",
      };
    case "power10-microscope":
      return {
        questionKind: "result",
        operand: "0,012",
        exponent: 2,
        prompt: "Obiekt ma 0,012 mm. Obraz w mikroskopie jest 100 razy większy. Oblicz długość obrazu.",
      };
    case "power10-practice":
      return PRACTICE_TASKS[seed % PRACTICE_TASKS.length]!;
  }
}

/** Publiczny, deterministyczny wariant M5-5.5. Nie zawiera oczekiwanej odpowiedzi. */
export function createPublicDecimalPowerTenTask(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalPowerTenL1Activity;
}): DecimalPowerTenPublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed mnożenia przez potęgę 10 musi być nieujemną liczbą całkowitą.");
  }
  const data = taskDataFor(input.activity, input.seed);
  return {
    generatorId: DECIMAL_POWER_TEN_L1_GENERATOR_ID,
    generatorVersion: 6,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    ...data,
    multiplier: multiplierFor(data.exponent),
    skillIds: [DECIMAL_POWER_TEN_L1_SKILL_ID],
    invariants: [
      "digits-change-place-value-comma-stays-fixed",
      "required-zero-positions-are-explicit",
      "comma-independent-of-locale",
      "answer-spec-server-only",
    ],
  };
}

export function decimalPowerTenResult(operand: string, exponent: 1 | 2 | 3): string {
  const parsed = parseDecimalInput(operand);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return formatDecimal(scaleDecimalByPower10(parsed.value, exponent), { trimTrailingZeros: true });
}

export function decimalPowerTenExpectedAnswer(task: DecimalPowerTenPublicTask): string {
  return task.questionKind === "missing-factor"
    ? String(task.multiplier)
    : decimalPowerTenResult(task.operand, task.exponent);
}

export function decimalDigitMovements(task: DecimalPowerTenPublicTask): DecimalDigitMovement[] {
  const [integerPart, fractionPart = ""] = task.operand.split(",");
  const digits: DecimalDigitMovement[] = [];
  [...integerPart].forEach((digit, index) => {
    const sourcePower = integerPart.length - index - 1;
    digits.push({ id: `digit-${index}-${sourcePower}`, digit, sourcePower, targetPower: sourcePower + task.exponent });
  });
  [...fractionPart].forEach((digit, index) => {
    const sourcePower = -index - 1;
    digits.push({ id: `digit-f-${index}-${sourcePower}`, digit, sourcePower, targetPower: sourcePower + task.exponent });
  });
  return digits;
}

export function validateDecimalPowerTenAnswer(input: {
  task: DecimalPowerTenPublicTask;
  answer: string;
  unit?: string;
}): DecimalPowerTenValidation {
  const answerLabel = `${input.answer.trim() || "□"}${input.unit ? ` ${input.unit}` : ""}`;
  if (!input.answer.trim()) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, answerLabel };
  }
  const answer = parseDecimalInput(input.answer);
  const expected = parseDecimalInput(decimalPowerTenExpectedAnswer(input.task));
  if (!answer.ok || !expected.ok || !areEquivalentDecimals(answer.value, expected.value)) {
    const code = input.task.activity === "power10-missing-zero" || input.task.operand === "0,08"
      ? DECIMAL_FEEDBACK_CODES.missingZero
      : DECIMAL_FEEDBACK_CODES.placeValue;
    return { correct: false, code, answerLabel };
  }
  if (input.task.requiredUnit && input.unit !== input.task.requiredUnit) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.unitMismatch, answerLabel };
  }
  return { correct: true, code: null, answerLabel };
}

const ACTIVITIES: readonly DecimalPowerTenL1Activity[] = [
  "power10-position-shift",
  "power10-predict",
  "power10-missing-zero",
  "power10-microscope",
  "power10-practice",
];

export function isDecimalPowerTenL1Activity(value: string): value is DecimalPowerTenL1Activity {
  return ACTIVITIES.includes(value as DecimalPowerTenL1Activity);
}
