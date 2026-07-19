import { describe, expect, it } from "vitest";
import {
  createPublicDecimalAddSubL1Task,
  decimalAddSubTraceDisplay,
  expectedDecimalAddSubDigits,
  expectedDecimalAddSubDisplay,
  validateDecimalAddSubWork,
  validateDecimalEstimate,
  validateShiftedCommaRepair,
} from "@/lib/math/decimals/decimalAddSubL1";
import { buildDecimalWrittenAddSubModel } from "@/lib/math/decimals/decimalMath";
import { DECIMAL_FEEDBACK_CODES } from "@/types/decimals";

describe("decimalAddSubL1", () => {
  it("tworzy publiczne, deterministyczne zadania bez answerSpec", () => {
    const task = createPublicDecimalAddSubL1Task({ seed: 554107, difficulty: "core", activity: "independent-add-sub" });
    expect(task).toMatchObject({
      generatorId: "decimal-notation-l1-v1",
      generatorVersion: 5,
      left: "2,45",
      right: "1,37",
      operation: "add",
      skillIds: ["M5-5.4-add-sub-decimals"],
    });
    expect(JSON.stringify(task)).not.toContain("answerSpec");
    expect(JSON.stringify(task)).not.toContain("expectedDisplay");
    expect(expectedDecimalAddSubDisplay(task)).toBe("3,82");
  });

  it("prowadzi dodawanie z dokładną wymianą 10 setnych na 1 dziesiątą", () => {
    const task = createPublicDecimalAddSubL1Task({ seed: 554102, difficulty: "core", activity: "column-addition" });
    const model = buildDecimalWrittenAddSubModel(task.left, task.right, task.operation);
    expect(model.exchanges).toEqual([
      expect.objectContaining({ columnPower: -2, kind: "carry", from: 10, to: 1 }),
    ]);
    expect(expectedDecimalAddSubDigits(task)).toEqual({ 0: "3", [-1]: "8", [-2]: "2" });
    expect(decimalAddSubTraceDisplay(task, { 0: "3", [-1]: "8", [-2]: "2" })).toBe("3,82");
  });

  it("utrzymuje wszystkie odejmowania L1 bez pożyczania", () => {
    for (const [activity, difficulty] of [
      ["basic-subtraction", "core"],
      ["independent-add-sub", "challenge"],
    ] as const) {
      const task = createPublicDecimalAddSubL1Task({ seed: 554105, difficulty, activity });
      const model = buildDecimalWrittenAddSubModel(task.left, task.right, task.operation);
      expect(task.operation).toBe("subtract");
      expect(model.exchanges.some((exchange) => exchange.kind === "borrow")).toBe(false);
    }
    expect(expectedDecimalAddSubDisplay(createPublicDecimalAddSubL1Task({ seed: 554105, difficulty: "challenge", activity: "independent-add-sub" }))).toBe("4,503");
  });

  it("rozróżnia pustą kratkę, błędną cyfrę i poprawny tok", () => {
    const task = createPublicDecimalAddSubL1Task({ seed: 554103, difficulty: "core", activity: "basic-subtraction" });
    expect(validateDecimalAddSubWork({ task, resultDigits: {} })).toMatchObject({ correct: false, code: DECIMAL_FEEDBACK_CODES.empty });
    expect(validateDecimalAddSubWork({ task, resultDigits: { 0: "3", [-1]: "4", [-2]: "2" } })).toMatchObject({ correct: false, code: DECIMAL_FEEDBACK_CODES.placeValue });
    expect(validateDecimalAddSubWork({ task, resultDigits: { 0: "3", [-1]: "5", [-2]: "2" } })).toMatchObject({ correct: true, code: null, digitsCorrect: true, commaCorrect: true });
  });

  it("przy błędzie przecinka zachowuje poprawne cyfry jako częściowy dowód", () => {
    const task = createPublicDecimalAddSubL1Task({ seed: 554104, difficulty: "core", activity: "repair-shifted-comma" });
    expect(validateShiftedCommaRepair(task, "38,2")).toEqual(expect.objectContaining({
      correct: false,
      code: DECIMAL_FEEDBACK_CODES.commaMisaligned,
      digitsCorrect: true,
      commaCorrect: false,
    }));
    expect(validateShiftedCommaRepair(task, "3,82")).toEqual(expect.objectContaining({ correct: true, digitsCorrect: true, commaCorrect: true }));
  });

  it("wymaga zgodnego szacunku w samodzielnych wariantach", () => {
    const task = createPublicDecimalAddSubL1Task({ seed: 554107, difficulty: "core", activity: "independent-add-sub" });
    const correctEstimate = task.estimateOptions.find((option) => option.label === "między 3 a 5")!;
    const wrongEstimate = task.estimateOptions.find((option) => option.label === "między 8 a 10")!;
    expect(validateDecimalEstimate(task, correctEstimate.id)).toBe(true);
    expect(validateDecimalEstimate(task, wrongEstimate.id)).toBe(false);
    expect(validateDecimalAddSubWork({
      task,
      resultDigits: { 0: "3", [-1]: "8", [-2]: "2" },
      estimateOptionId: wrongEstimate.id,
      requireEstimate: true,
    })).toMatchObject({ correct: false, code: DECIMAL_FEEDBACK_CODES.estimateRange, digitsCorrect: true });
  });

  it("przypisuje cztery różne ilustracje do czterech zadań tekstowych", () => {
    const pictures = Array.from({ length: 4 }, (_, index) => createPublicDecimalAddSubL1Task({
      seed: 554500 + index,
      difficulty: "core",
      activity: "story-add-sub",
    }).storyPicture);

    expect(pictures).toEqual(["juice", "ribbon", "snack", "change"]);
  });
});
