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

export const DECIMAL_ADD_SUB_L2_GENERATOR_ID = "decimal-notation-l1-v1" as const;
export const DECIMAL_ADD_SUB_L2_SKILL_ID = "M5-5.4-add-sub-decimals" as const;

export type DecimalAddSubL2Activity =
  | "borrowing-subtraction"
  | "change-two-methods"
  | "workshop-receipt"
  | "repair-context-comma"
  | "independent-add-sub-l2";

export interface DecimalAddSubL2EstimateOption {
  id: string;
  label: string;
}

export interface DecimalAddSubL2PublicTask {
  generatorId: typeof DECIMAL_ADD_SUB_L2_GENERATOR_ID;
  generatorVersion: 6;
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalAddSubL2Activity;
  prompt: string;
  context: string;
  left: string;
  right: string;
  operation: "add" | "subtract";
  unit: "zł" | "m";
  estimateOptions: DecimalAddSubL2EstimateOption[];
  repairChoices: string[];
  receiptLines: Array<{ id: string; label: string; value?: string }>;
  complementOptions: Array<{ id: string; label: string }>;
  skillIds: readonly [typeof DECIMAL_ADD_SUB_L2_SKILL_ID];
  invariants: readonly [
    "comma-independent-of-locale",
    "borrow-cross-out-trace-preserved",
    "written-and-complement-methods-recorded-separately",
    "correct-digit-work-survives-comma-error",
    "answer-spec-server-only",
  ];
}

export interface DecimalBorrowMark {
  targetPower: number;
  sourcePower: number;
  sourceOld: number;
  sourceNew: number;
  targetOld: number;
  targetNew: number;
}

export interface DecimalAddSubL2Validation {
  correct: boolean;
  code: DecimalFeedbackCode | null;
  activePower?: number;
  method?: "written" | "complement" | "receipt" | "estimate" | "context";
  digitsCorrect: boolean;
  commaCorrect: boolean;
  normalizedDisplay?: string;
}

const ESTIMATE_OPTIONS: readonly DecimalAddSubL2EstimateOption[] = [
  { id: "low", label: "między 2 a 4" },
  { id: "near", label: "między 5 a 7" },
  { id: "receipt", label: "między 8 a 10" },
  { id: "high", label: "między 11 a 13" },
];

const INDEPENDENT: Record<LessonDifficulty, Pick<DecimalAddSubL2PublicTask, "left" | "right" | "context" | "unit">> = {
  support: { left: "8,4", right: "2,7", context: "Z paska długości 8,4 m odcięto 2,7 m.", unit: "m" },
  core: { left: "12,35", right: "6,78", context: "Z zaliczki 12,35 zł opłacono materiał za 6,78 zł.", unit: "zł" },
  challenge: { left: "15,240", right: "8,675", context: "Z rolki 15,240 m zużyto 8,675 m taśmy.", unit: "m" },
};

function parsed(input: string): DecimalValue {
  const result = parseDecimalInput(input);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

function rotate<T>(items: readonly T[], offset: number): T[] {
  const normalized = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function dataFor(activity: DecimalAddSubL2Activity, difficulty: LessonDifficulty) {
  if (activity === "borrowing-subtraction") {
    return { left: "6,42", right: "1,78", context: "Na rolce było 6,42 m taśmy, zużyto 1,78 m.", unit: "m" as const };
  }
  if (activity === "change-two-methods") {
    return { left: "10,00", right: "6,35", context: "Klient płaci 10,00 zł za zakupy warte 6,35 zł.", unit: "zł" as const };
  }
  if (activity === "workshop-receipt") {
    return { left: "4,35", right: "2,80", context: "Paragon pracowni zawiera trzy ceny i jedną informację, której nie używa się w rachunku.", unit: "zł" as const };
  }
  if (activity === "repair-context-comma") {
    return { left: "20,00", right: "13,75", context: "Z 20,00 zł po opłaceniu materiałów za 13,75 zł program wydrukował 62,5 zł reszty.", unit: "zł" as const };
  }
  return INDEPENDENT[difficulty];
}

function promptFor(activity: DecimalAddSubL2Activity): string {
  switch (activity) {
    case "borrowing-subtraction":
      return "Odejmuj od setnych. Przy każdym pożyczaniu przekreśl starą cyfrę, a nowe wartości zapisz w małych kratkach.";
    case "change-two-methods":
      return "Oblicz resztę dwoma osobno zapisanymi metodami: odejmowaniem pisemnym oraz dopełnianiem do pełnej kwoty.";
    case "workshop-receipt":
      return "Najpierw oszacuj sumę. Potem odrzuć zbędną informację i oblicz dokładną wartość paragonu pracowni.";
    case "repair-context-comma":
      return "Cyfry 6, 2 i 5 są poprawne. Napraw wyłącznie pozycję przecinka w kwocie reszty i zachowaj cyfry.";
    case "independent-add-sub-l2":
      return "Samodzielnie oszacuj wynik, wykonaj odejmowanie z pożyczaniem i sprawdź sens odpowiedzi w kontekście.";
  }
}

/** Publiczny wariant M5-5.4 L2. Nie zawiera answerSpec ani oczekiwanego wyniku. */
export function createPublicDecimalAddSubL2Task(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: DecimalAddSubL2Activity;
}): DecimalAddSubL2PublicTask {
  if (!Number.isSafeInteger(input.seed) || input.seed < 0) throw new Error("Seed L2 musi być nieujemną liczbą całkowitą.");
  const data = dataFor(input.activity, input.difficulty);
  const receiptLines = input.activity === "workshop-receipt" ? [
    { id: "paint", label: "Farba akrylowa", value: "4,35" },
    { id: "brush", label: "Pędzel płaski", value: "2,80" },
    { id: "tape", label: "Taśma malarska", value: "1,45" },
    { id: "shelf", label: "Numer półki: B7" },
  ] : [];
  const repairChoices = input.activity === "repair-context-comma"
    ? rotate(["625", "62,5", "6,25", "0,625"], input.seed % 4)
    : [];
  const estimateOptions = input.activity === "workshop-receipt"
    ? rotate(ESTIMATE_OPTIONS.filter((option) => option.id !== "low"), input.seed % 3).map((option) => ({ ...option }))
    : input.activity === "independent-add-sub-l2"
      ? rotate(ESTIMATE_OPTIONS.filter((option) => option.id !== "receipt"), input.seed % 3).map((option) => ({ ...option }))
      : [];

  return {
    generatorId: DECIMAL_ADD_SUB_L2_GENERATOR_ID,
    generatorVersion: 6,
    seed: input.seed,
    difficulty: input.difficulty,
    activity: input.activity,
    prompt: promptFor(input.activity),
    ...data,
    operation: "subtract",
    estimateOptions,
    repairChoices,
    receiptLines,
    complementOptions: input.activity === "change-two-methods" ? [
      { id: "0,65", label: "6,35 → 7,00: +0,65 zł" },
      { id: "3,65", label: "6,35 → 7,00: +3,65 zł" },
      { id: "3,00", label: "7,00 → 10,00: +3,00 zł" },
      { id: "4,00", label: "7,00 → 10,00: +4,00 zł" },
    ] : [],
    skillIds: [DECIMAL_ADD_SUB_L2_SKILL_ID],
    invariants: [
      "comma-independent-of-locale",
      "borrow-cross-out-trace-preserved",
      "written-and-complement-methods-recorded-separately",
      "correct-digit-work-survives-comma-error",
      "answer-spec-server-only",
    ],
  };
}

function receiptTotal(task: DecimalAddSubL2PublicTask): DecimalValue {
  return task.receiptLines.reduce((sum, line) => line.value ? addDecimalValues(sum, parsed(line.value)) : sum, parsed("0,00"));
}

export function expectedDecimalAddSubL2Display(task: DecimalAddSubL2PublicTask): string {
  if (task.activity === "workshop-receipt") return formatDecimal(receiptTotal(task), { minimumFractionDigits: 2 });
  return formatDecimal(subtractDecimalValues(parsed(task.left), parsed(task.right)), {
    minimumFractionDigits: task.unit === "zł" ? 2 : undefined,
  });
}

export function decimalAddSubL2ResultPowers(task: DecimalAddSubL2PublicTask): number[] {
  if (task.activity === "workshop-receipt") return [0, -1, -2];
  return buildDecimalWrittenAddSubModel(task.left, task.right, task.operation).columns;
}

export function expectedDecimalAddSubL2Digits(task: DecimalAddSubL2PublicTask): Record<number, DecimalDigit> {
  const display = expectedDecimalAddSubL2Display(task);
  const parsedDisplay = parseDecimalInput(display);
  if (!parsedDisplay.ok) throw new Error(parsedDisplay.error.message);
  return Object.fromEntries(decimalAddSubL2ResultPowers(task).map((power) => {
    const digit = power >= 0
      ? parsedDisplay.trace.integerDigits[parsedDisplay.trace.integerDigits.length - 1 - power] ?? ""
      : parsedDisplay.trace.fractionDigits[-power - 1] ?? "";
    return [power, digit as DecimalDigit];
  })) as Record<number, DecimalDigit>;
}

export function decimalAddSubL2TraceDisplay(task: DecimalAddSubL2PublicTask, digits: Readonly<Record<number, DecimalDigit>>): string {
  const powers = decimalAddSubL2ResultPowers(task);
  return powers.reduce((display, power) => `${display}${digits[power] || "▽"}${power === 0 && powers.some((candidate) => candidate < 0) ? "," : ""}`, "");
}

export function buildDecimalBorrowMarks(left: string, right: string): DecimalBorrowMark[] {
  const model = buildDecimalWrittenAddSubModel(left, right, "subtract");
  const marks: DecimalBorrowMark[] = [];
  let borrowedFromRight = 0;
  const topDigits = new Map(model.rows[0].map((cell) => [cell.placePower, Number(cell.digit || 0)]));
  const bottomDigits = new Map(model.rows[1].map((cell) => [cell.placePower, Number(cell.digit || 0)]));
  for (const power of [...model.columns].reverse()) {
    const targetOld = (topDigits.get(power) ?? 0) - borrowedFromRight;
    const bottom = bottomDigits.get(power) ?? 0;
    if (targetOld < bottom) {
      const sourcePower = power + 1;
      const sourceOld = (topDigits.get(sourcePower) ?? 0);
      marks.push({ targetPower: power, sourcePower, sourceOld, sourceNew: sourceOld - 1, targetOld, targetNew: targetOld + 10 });
      borrowedFromRight = 1;
    } else {
      borrowedFromRight = 0;
    }
  }
  return marks;
}

function firstDigitIssue(task: DecimalAddSubL2PublicTask, digits: Readonly<Record<number, DecimalDigit>>): DecimalAddSubL2Validation | null {
  const expected = expectedDecimalAddSubL2Digits(task);
  const powers = decimalAddSubL2ResultPowers(task);
  const emptyPower = [...powers].reverse().find((power) => expected[power] !== "" && !digits[power]);
  if (emptyPower !== undefined) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, activePower: emptyPower, digitsCorrect: false, commaCorrect: true };
  const wrongPower = [...powers].reverse().find((power) => (digits[power] ?? "") !== expected[power]);
  if (wrongPower !== undefined) return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, activePower: wrongPower, digitsCorrect: false, commaCorrect: true };
  return null;
}

export function validateDecimalAddSubL2Estimate(task: DecimalAddSubL2PublicTask, optionId: string): boolean {
  const value = Number(expectedDecimalAddSubL2Display(task).replace(",", "."));
  if (optionId === "low") return value >= 2 && value <= 4;
  if (optionId === "near") return value >= 5 && value <= 7;
  if (optionId === "receipt") return value >= 8 && value <= 10;
  if (optionId === "high") return value >= 11 && value <= 13;
  return false;
}

export function validateDecimalAddSubL2Work(input: {
  task: DecimalAddSubL2PublicTask;
  resultDigits: Readonly<Record<number, DecimalDigit>>;
  estimateOptionId?: string;
  requireEstimate?: boolean;
}): DecimalAddSubL2Validation {
  if (input.requireEstimate && !input.estimateOptionId) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, method: "estimate", digitsCorrect: false, commaCorrect: true };
  if (input.requireEstimate && !validateDecimalAddSubL2Estimate(input.task, input.estimateOptionId ?? "")) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, method: "estimate", digitsCorrect: false, commaCorrect: true };
  }
  const issue = firstDigitIssue(input.task, input.resultDigits);
  return issue ?? {
    correct: true,
    code: null,
    digitsCorrect: true,
    commaCorrect: true,
    normalizedDisplay: decimalAddSubL2TraceDisplay(input.task, input.resultDigits),
  };
}

export function validateDecimalChangeMethods(input: {
  task: DecimalAddSubL2PublicTask;
  writtenDigits: Readonly<Record<number, DecimalDigit>>;
  complementDigits: Readonly<Record<number, DecimalDigit>>;
  complementStepIds: readonly string[];
}): DecimalAddSubL2Validation {
  const writtenIssue = firstDigitIssue(input.task, input.writtenDigits);
  if (writtenIssue) return { ...writtenIssue, method: "written" };
  if (!input.complementStepIds.includes("0,65") || !input.complementStepIds.includes("3,00")) {
    return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, method: "complement", digitsCorrect: false, commaCorrect: true };
  }
  const complementIssue = firstDigitIssue(input.task, input.complementDigits);
  if (complementIssue) return { ...complementIssue, method: "complement" };
  return { correct: true, code: null, digitsCorrect: true, commaCorrect: true };
}

export function validateWorkshopReceipt(input: {
  task: DecimalAddSubL2PublicTask;
  estimateOptionId: string;
  irrelevantLineId: string;
  resultDigits: Readonly<Record<number, DecimalDigit>>;
}): DecimalAddSubL2Validation {
  if (!input.estimateOptionId) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, method: "estimate", digitsCorrect: false, commaCorrect: true };
  if (!validateDecimalAddSubL2Estimate(input.task, input.estimateOptionId)) return { correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, method: "estimate", digitsCorrect: false, commaCorrect: true };
  if (input.irrelevantLineId !== "shelf") return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, method: "context", digitsCorrect: false, commaCorrect: true };
  const issue = firstDigitIssue(input.task, input.resultDigits);
  return issue ? { ...issue, method: "receipt" } : { correct: true, code: null, method: "receipt", digitsCorrect: true, commaCorrect: true };
}

export function validateDecimalAddSubL2Repair(task: DecimalAddSubL2PublicTask, selectedDisplay: string): DecimalAddSubL2Validation {
  if (!selectedDisplay) return { correct: false, code: DECIMAL_FEEDBACK_CODES.empty, digitsCorrect: true, commaCorrect: false };
  const expected = expectedDecimalAddSubL2Display(task);
  const selectedDigits = selectedDisplay.replace(/[^0-9]/gu, "");
  const expectedDigits = expected.replace(/[^0-9]/gu, "");
  if (selectedDigits !== expectedDigits) return { correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue, digitsCorrect: false, commaCorrect: false };
  const selected = parseDecimalInput(selectedDisplay);
  const expectedParsed = parseDecimalInput(expected);
  const commaCorrect = selected.ok && expectedParsed.ok && areEquivalentDecimals(selected.value, expectedParsed.value);
  return commaCorrect
    ? { correct: true, code: null, digitsCorrect: true, commaCorrect: true, normalizedDisplay: selected.trace.display }
    : { correct: false, code: DECIMAL_FEEDBACK_CODES.commaMisaligned, digitsCorrect: true, commaCorrect: false };
}

const ACTIVITIES: readonly DecimalAddSubL2Activity[] = [
  "borrowing-subtraction",
  "change-two-methods",
  "workshop-receipt",
  "repair-context-comma",
  "independent-add-sub-l2",
];

export function isDecimalAddSubL2Activity(value: string): value is DecimalAddSubL2Activity {
  return ACTIVITIES.includes(value as DecimalAddSubL2Activity);
}
