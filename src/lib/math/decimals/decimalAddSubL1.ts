import {
  addDecimalValues,
  areEquivalentDecimals,
  buildDecimalWrittenAddSubModel,
  formatDecimal,
  parseDecimalInput,
  subtractDecimalValues,
} from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";
import type { DecimalDigit, DecimalFeedbackCode, DecimalValue } from "@/types/decimals";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** M5-5.4 zachowuje istniejący modelId i adapter sesji dla modeli dziesiętnych. */
export const DECIMAL_ADD_SUB_L1_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_ADD_SUB_L1_SKILL_ID = "M5-5.4-add-sub-decimals" as const;

export type DecimalAddSubL1Activity =
  | "mental-add-sub"
  | "written-add-sub"
  | "story-add-sub"
  | "comma-columns"
  | "column-addition"
  | "basic-subtraction"
  | "repair-shifted-comma"
  | "independent-add-sub";

export type DecimalAddSubOperation = "add" | "subtract";
export type DecimalAddSubStoryPicture = "juice" | "ribbon" | "snack" | "change";

export interface DecimalEstimateOption {
  id: string;
  label: string;
}

export interface DecimalAddSubL1PublicTask {
  generatorId: typeof DECIMAL_ADD_SUB_L1_GENERATOR_ID;
  generatorVersion: 5;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalAddSubL1Activity;
  prompt: string;
  left: string;
  right: string;
  operation: DecimalAddSubOperation;
  estimateOptions: DecimalEstimateOption[];
  repairChoices: string[];
  story?: string;
  storyQuestion?: string;
  answerUnit?: string;
  storyPicture?: DecimalAddSubStoryPicture;
  skillIds: readonly [typeof DECIMAL_ADD_SUB_L1_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "correct-digit-work-survives-comma-error",
    "place-value-work-preserved",
    "answer-spec-server-only",
  ];
}

export interface DecimalAddSubWorkValidation {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  digitsCorrect: boolean;
  commaCorrect: boolean;
  normalizedDisplay?: string;
}

const INDEPENDENT_TASKS: Record<LessonDifficulty, Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">> = {
  support: { left: "3,4", right: "2,5", operation: "add" },
  core: { left: "2,45", right: "1,37", operation: "add" },
  challenge: { left: "7,905", right: "3,402", operation: "subtract" },
};

const MENTAL_TASKS = [
  { left: "3,4", right: "1,2", operation: "add" },
  { left: "5,8", right: "2,3", operation: "subtract" },
  { left: "0,6", right: "0,3", operation: "add" },
  { left: "7,9", right: "4,5", operation: "subtract" },
  { left: "2,35", right: "0,4", operation: "add" },
  { left: "6,75", right: "0,5", operation: "subtract" },
  { left: "1,08", right: "0,7", operation: "add" },
  { left: "4,9", right: "2,05", operation: "subtract" },
] as const;

const WRITTEN_TASKS = [
  { left: "2,45", right: "1,37", operation: "add" },
  { left: "5,86", right: "2,34", operation: "subtract" },
  { left: "4,7", right: "2,65", operation: "add" },
  { left: "8,75", right: "3,42", operation: "subtract" },
  { left: "3,08", right: "1,71", operation: "add" },
  { left: "9,64", right: "2,31", operation: "subtract" },
  { left: "12,4", right: "3,56", operation: "add" },
  { left: "7,905", right: "3,402", operation: "subtract" },
] as const;

const STORY_TASKS = [
  { left: "1,25", right: "0,75", operation: "add", story: "W dzbanku było 1,25 l soku. Dolano jeszcze 0,75 l.", storyQuestion: "Ile litrów soku jest teraz w dzbanku?", answerUnit: "l", storyPicture: "juice" },
  { left: "5,6", right: "2,35", operation: "subtract", story: "Krawcowa miała 5,6 m wstążki i zużyła 2,35 m.", storyQuestion: "Ile metrów wstążki zostało?", answerUnit: "m", storyPicture: "ribbon" },
  { left: "4,80", right: "3,65", operation: "add", story: "Bułka kosztowała 4,80 zł, a sok 3,65 zł.", storyQuestion: "Ile trzeba zapłacić razem?", answerUnit: "zł", storyPicture: "snack" },
  { left: "10,00", right: "6,35", operation: "subtract", story: "Za zakupy kosztujące 6,35 zł zapłacono banknotem 10,00 zł.", storyQuestion: "Ile reszty należy wydać?", answerUnit: "zł", storyPicture: "change" },
] as const;

function taskBySeed<T>(tasks: readonly T[], seed: number): T {
  return tasks[Math.abs(seed) % tasks.length]!;
}

const ESTIMATE_OPTION_SETS: Record<LessonDifficulty, readonly DecimalEstimateOption[]> = {
  support: [
    { id: "low", label: "między 0 a 2" },
    { id: "near", label: "między 5 a 7" },
    { id: "high", label: "między 9 a 11" },
  ],
  core: [
    { id: "low", label: "między 0 a 2" },
    { id: "near", label: "między 3 a 5" },
    { id: "high", label: "między 8 a 10" },
  ],
  challenge: [
    { id: "low", label: "między 1 a 3" },
    { id: "near", label: "między 4 a 5" },
    { id: "high", label: "między 7 a 9" },
  ],
};

const ESTIMATE_RANGES: Record<string, readonly [number, number]> = {
  "między 0 a 2": [0, 2],
  "między 5 a 7": [5, 7],
  "między 9 a 11": [9, 11],
  "między 3 a 5": [3, 5],
  "między 8 a 10": [8, 10],
  "między 1 a 3": [1, 3],
  "między 4 a 5": [4, 5],
  "między 7 a 9": [7, 9],
};

function parsedValue(input: string): DecimalValue {
  const parsed = parseDecimalInput(input);
  if (!parsed.ok) throw new Error(parsed.error.message);
  return parsed.value;
}

function rotate<T>(items: readonly T[], offset: number): T[] {
  const normalized = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function activityData(
  activity: DecimalAddSubL1Activity,
  difficulty: LessonDifficulty,
  seed: number,
): Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation" | "story" | "storyQuestion" | "answerUnit" | "storyPicture"> {
  switch (activity) {
    case "mental-add-sub":
      return taskBySeed(MENTAL_TASKS, seed);
    case "written-add-sub":
      return taskBySeed(WRITTEN_TASKS, seed);
    case "story-add-sub":
      return taskBySeed(STORY_TASKS, seed);
    case "comma-columns":
      return { left: "2,45", right: "1,3", operation: "add" };
    case "column-addition":
    case "repair-shifted-comma":
      return { left: "2,45", right: "1,37", operation: "add" };
    case "basic-subtraction":
      return { left: "5,86", right: "2,34", operation: "subtract" };
    case "independent-add-sub":
      return INDEPENDENT_TASKS[difficulty];
  }
}

function promptFor(activity: DecimalAddSubL1Activity): string {
  switch (activity) {
    case "mental-add-sub":
      return "Dodawaj lub odejmuj osobno cyfry oznaczające te same miejsca: jedności z jednościami, części dziesiąte z dziesiątymi i setne z setnymi.";
    case "written-add-sub":
      return "Ustaw liczby w kolumnach. Pamiętaj: przecinek piszemy pod przecinkiem.";
    case "story-add-sub":
      return "Przeczytaj zadanie, wybierz znak działania, wykonaj obliczenie pisemne i zapisz odpowiedź.";
    case "comma-columns":
      return "Ustaw 2,45 i 1,3 tak, aby jedności, dziesiąte, setne i przecinki znalazły się w swoich kolumnach. Zero pomocnicze jest opcjonalne.";
    case "column-addition":
      return "Dodawaj od setnych do jedności. Aktywna kolumna ma symbol i obrys, a wymiana 10 setnych na 1 dziesiątą pozostaje w śladzie pracy.";
    case "basic-subtraction":
      return "Odejmij kolumna po kolumnie bez pożyczania. Puste pole nie oznacza zera, a przecinek pozostaje w pionowej prowadnicy.";
    case "repair-shifted-comma":
      return "Cyfry wyniku są poprawne. Przenieś wyłącznie przecinek we właściwe miejsce, nie kasując obliczonych cyfr.";
    case "independent-add-sub":
      return "Najpierw oszacuj wynik, potem wykonaj zapis pisemny i sprawdź zgodność cyfr z polskim przecinkiem.";
  }
}

export function expectedDecimalAddSubDisplay(task: Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">): string {
  const result = task.operation === "add"
    ? addDecimalValues(parsedValue(task.left), parsedValue(task.right))
    : subtractDecimalValues(parsedValue(task.left), parsedValue(task.right));
  if (result.sign < 0) throw new Error("Zadania L1 nie tworzą ujemnego wyniku.");
  return formatDecimal(result, { trimTrailingZeros: true });
}

export function expectedDecimalAddSubDigits(
  task: Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">,
): Record<number, DecimalDigit> {
  const model = buildDecimalWrittenAddSubModel(task.left, task.right, task.operation);
  return Object.fromEntries(model.result.map((cell) => [cell.placePower, cell.digit])) as Record<number, DecimalDigit>;
}

export function decimalAddSubTraceDisplay(
  task: Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">,
  digits: Readonly<Record<number, DecimalDigit>>,
): string {
  const model = buildDecimalWrittenAddSubModel(task.left, task.right, task.operation);
  return model.columns.reduce((display, power) => {
    const digit = digits[power] || "▽";
    return `${display}${digit}${power === 0 && model.columns.some((column) => column < 0) ? "," : ""}`;
  }, "");
}

function displayDigits(display: string): string {
  return display.replace(/[^0-9]/gu, "");
}

export function validateShiftedCommaRepair(
  task: Pick<DecimalAddSubL1PublicTask, "left" | "right" | "operation">,
  selectedDisplay: string,
): DecimalAddSubWorkValidation {
  if (!selectedDisplay) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, digitsCorrect: true, commaCorrect: false };
  }
  const expectedDisplay = expectedDecimalAddSubDisplay(task);
  if (displayDigits(selectedDisplay) !== displayDigits(expectedDisplay)) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, digitsCorrect: false, commaCorrect: false };
  }
  const selected = parseDecimalInput(selectedDisplay);
  const expected = parseDecimalInput(expectedDisplay);
  const commaCorrect = selected.ok && expected.ok && areEquivalentDecimals(selected.value, expected.value);
  return commaCorrect
    ? { correct: true, code: null, digitsCorrect: true, commaCorrect: true, normalizedDisplay: selected.trace.display }
    : { correct: false, code: DECIMAL_FEEDBACK_CODES.commaMisaligned, digitsCorrect: true, commaCorrect: false, normalizedDisplay: selected.ok ? selected.trace.display : selectedDisplay };
}

export function validateDecimalEstimate(task: DecimalAddSubL1PublicTask, optionId: string): boolean {
  const option = task.estimateOptions.find((candidate) => candidate.id === optionId);
  const range = option ? ESTIMATE_RANGES[option.label] : undefined;
  if (!range) return false;
  const result = Number(expectedDecimalAddSubDisplay(task).replace(",", "."));
  return result >= range[0] && result <= range[1];
}

export function validateDecimalAddSubWork(input: {
  task: DecimalAddSubL1PublicTask;
  resultDigits: Readonly<Record<number, DecimalDigit>>;
  commaAligned?: boolean;
  estimateOptionId?: string;
  requireEstimate?: boolean;
}): DecimalAddSubWorkValidation {
  const expected = expectedDecimalAddSubDigits(input.task);
  const powers = Object.keys(expected).map(Number);
  const normalizedDisplay = decimalAddSubTraceDisplay(input.task, input.resultDigits);
  if (powers.some((power) => !input.resultDigits[power])) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, digitsCorrect: false, commaCorrect: input.commaAligned !== false, normalizedDisplay };
  }
  if (powers.some((power) => input.resultDigits[power] !== expected[power])) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, digitsCorrect: false, commaCorrect: input.commaAligned !== false, normalizedDisplay };
  }
  if (input.commaAligned === false) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.commaMisaligned, digitsCorrect: true, commaCorrect: false, normalizedDisplay };
  }
  if (input.requireEstimate && !input.estimateOptionId) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, digitsCorrect: true, commaCorrect: true, normalizedDisplay };
  }
  if (input.requireEstimate && !validateDecimalEstimate(input.task, input.estimateOptionId ?? "")) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, digitsCorrect: true, commaCorrect: true, normalizedDisplay };
  }
  return { correct: true, code: null, digitsCorrect: true, commaCorrect: true, normalizedDisplay };
}

/** Publiczny wariant M5-5.4 L1. Nie zawiera oczekiwanego wyniku ani answerSpec. */
export function createPublicDecimalAddSubL1Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalAddSubL1Activity;
}): DecimalAddSubL1PublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) {
    throw new Error("Seed dodawania i odejmowania musi być nieujemną liczbą całkowitą.");
  }
  const data = activityData(input.activity, input.difficulty, input.seed);
  const expectedDisplay = expectedDecimalAddSubDisplay(data);
  const repairChoices = input.activity === "repair-shifted-comma"
    ? rotate(["38,2", expectedDisplay, "382"], input.seed % 3)
    : [];
  const estimateOptions = input.activity === "independent-add-sub"
    ? rotate(ESTIMATE_OPTION_SETS[input.difficulty], input.seed % 3).map((option) => ({ ...option }))
    : [];

  return {
    generatorId: DECIMAL_ADD_SUB_L1_GENERATOR_ID,
    generatorVersion: 5,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    ...data,
    estimateOptions,
    repairChoices,
    skillIds: [DECIMAL_ADD_SUB_L1_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "correct-digit-work-survives-comma-error",
      "place-value-work-preserved",
      "answer-spec-server-only",
    ],
  };
}

const ACTIVITIES: readonly DecimalAddSubL1Activity[] = [
  "mental-add-sub",
  "written-add-sub",
  "story-add-sub",
  "comma-columns",
  "column-addition",
  "basic-subtraction",
  "repair-shifted-comma",
  "independent-add-sub",
];

export function isDecimalAddSubL1Activity(value: string): value is DecimalAddSubL1Activity {
  return ACTIVITIES.includes(value as DecimalAddSubL1Activity);
}
