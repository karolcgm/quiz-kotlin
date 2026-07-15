import { describe, expect, it } from "vitest";
import {
  buildDecimalBorrowMarks,
  createPublicDecimalAddSubL2Task,
  expectedDecimalAddSubL2Digits,
  expectedDecimalAddSubL2Display,
  validateDecimalAddSubL2Estimate,
  validateDecimalAddSubL2Repair,
  validateDecimalAddSubL2Work,
  validateDecimalChangeMethods,
  validateWorkshopReceipt,
} from "@/lib/math/decimals/decimalAddSubL2";
import { buildDecimalWrittenAddSubModel } from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";

describe("decimalAddSubL2", () => {
  it("buduje publiczne zadanie L2 bez answerSpec i oczekiwanego wyniku", () => {
    const task = createPublicDecimalAddSubL2Task({ seed: 554201, difficulty: "core", activity: "borrowing-subtraction" });
    expect(task).toMatchObject({
      generatorId: "decimal-notation-l1-v1",
      generatorVersion: 6,
      left: "6,42",
      right: "1,78",
      operation: "subtract",
      skillIds: ["M5-5.4-add-sub-decimals"],
    });
    expect(JSON.stringify(task)).not.toContain("answerSpec");
    expect(JSON.stringify(task)).not.toContain("expected");
    expect(expectedDecimalAddSubL2Display(task)).toBe("4,64");
  });

  it("zachowuje dwa pożyczania: starą cyfrę i nowe wartości małych kratek", () => {
    const task = createPublicDecimalAddSubL2Task({ seed: 554201, difficulty: "core", activity: "borrowing-subtraction" });
    expect(buildDecimalWrittenAddSubModel(task.left, task.right, "subtract").exchanges).toEqual([
      expect.objectContaining({ kind: "borrow", columnPower: -2 }),
      expect.objectContaining({ kind: "borrow", columnPower: -1 }),
    ]);
    expect(buildDecimalBorrowMarks(task.left, task.right)).toEqual([
      { targetPower: -2, sourcePower: -1, sourceOld: 4, sourceNew: 3, targetOld: 2, targetNew: 12 },
      { targetPower: -1, sourcePower: 0, sourceOld: 6, sourceNew: 5, targetOld: 3, targetNew: 13 },
    ]);
    expect(expectedDecimalAddSubL2Digits(task)).toEqual({ 0: "4", [-1]: "6", [-2]: "4" });
  });

  it("ocenia dwie metody wydawania reszty jako osobne ślady", () => {
    const task = createPublicDecimalAddSubL2Task({ seed: 554202, difficulty: "core", activity: "change-two-methods" });
    const digits = { 0: "3", [-1]: "6", [-2]: "5" } as const;
    expect(validateDecimalChangeMethods({ task, writtenDigits: digits, complementDigits: {}, complementStepIds: [] })).toMatchObject({
      correct: false,
      method: "complement",
    });
    expect(validateDecimalChangeMethods({ task, writtenDigits: digits, complementDigits: digits, complementStepIds: ["0,65", "3,00"] })).toMatchObject({
      correct: true,
      code: null,
    });
  });

  it("w paragonie wymaga szacunku przed rachunkiem i odrzucenia informacji B7", () => {
    const task = createPublicDecimalAddSubL2Task({ seed: 554203, difficulty: "core", activity: "workshop-receipt" });
    const digits = { 0: "8", [-1]: "6", [-2]: "0" } as const;
    expect(task.receiptLines).toHaveLength(4);
    expect(task.receiptLines.filter((line) => line.value)).toHaveLength(3);
    expect(expectedDecimalAddSubL2Display(task)).toBe("8,60");
    expect(validateDecimalAddSubL2Estimate(task, "receipt")).toBe(true);
    expect(validateWorkshopReceipt({ task, estimateOptionId: "", irrelevantLineId: "shelf", resultDigits: digits })).toMatchObject({ method: "estimate", code: DECIMAL_FEEDBACK_CODES.empty });
    expect(validateWorkshopReceipt({ task, estimateOptionId: "receipt", irrelevantLineId: "paint", resultDigits: digits })).toMatchObject({ method: "context", code: DECIMAL_FEEDBACK_CODES.placeValue });
    expect(validateWorkshopReceipt({ task, estimateOptionId: "receipt", irrelevantLineId: "shelf", resultDigits: digits })).toMatchObject({ correct: true });
  });

  it("naprawia wyłącznie przecinek, zachowując poprawne cyfry 6, 2 i 5", () => {
    const task = createPublicDecimalAddSubL2Task({ seed: 554204, difficulty: "core", activity: "repair-context-comma" });
    expect(validateDecimalAddSubL2Repair(task, "62,5")).toMatchObject({
      correct: false,
      code: DECIMAL_FEEDBACK_CODES.commaMisaligned,
      digitsCorrect: true,
      commaCorrect: false,
    });
    expect(validateDecimalAddSubL2Repair(task, "6,25")).toMatchObject({ correct: true, digitsCorrect: true, commaCorrect: true });
  });

  it("różnicuje samodzielne warianty i wskazuje pierwszą błędną kolumnę", () => {
    const support = createPublicDecimalAddSubL2Task({ seed: 554202, difficulty: "support", activity: "independent-add-sub-l2" });
    const core = createPublicDecimalAddSubL2Task({ seed: 554207, difficulty: "core", activity: "independent-add-sub-l2" });
    const challenge = createPublicDecimalAddSubL2Task({ seed: 554205, difficulty: "challenge", activity: "independent-add-sub-l2" });
    expect([support.left, core.left, challenge.left]).toEqual(["8,4", "12,35", "15,240"]);
    expect([expectedDecimalAddSubL2Display(support), expectedDecimalAddSubL2Display(core), expectedDecimalAddSubL2Display(challenge)]).toEqual(["5,7", "5,57", "6,565"]);
    expect(validateDecimalAddSubL2Work({ task: core, resultDigits: { 0: "5", [-1]: "5", [-2]: "8" }, estimateOptionId: "near", requireEstimate: true })).toMatchObject({
      correct: false,
      code: DECIMAL_FEEDBACK_CODES.placeValue,
      activePower: -2,
    });
    expect(validateDecimalAddSubL2Work({ task: core, resultDigits: { 0: "5", [-1]: "5", [-2]: "7" }, estimateOptionId: "near", requireEstimate: true })).toMatchObject({ correct: true });
    expect(validateDecimalAddSubL2Work({ task: core, resultDigits: { 1: "9", 0: "5", [-1]: "5", [-2]: "7" }, estimateOptionId: "near", requireEstimate: true })).toMatchObject({
      correct: false,
      code: DECIMAL_FEEDBACK_CODES.placeValue,
      activePower: 1,
    });
  });
});
