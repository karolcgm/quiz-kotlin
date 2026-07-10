import { describe, expect, it } from "vitest";
import {
  auditOrderGenerator,
  generateOrderExpression,
  validateNextStep,
} from "@/lib/math/orderOfOperations/generator";

describe("order-director model", () => {
  it("generuje deterministyczne wyrażenie dla seeda", () => {
    const first = generateOrderExpression(42, "core");
    const second = generateOrderExpression(42, "core");

    expect(first.seed).toBe(42);
    expect(second.tokens).toEqual(first.tokens);
    expect(first.finalValue).not.toBeNull();
    expect(first.validNextOperatorIndices.length).toBeGreaterThan(0);
  });

  it("akceptuje poprawny pierwszy krok operatora", () => {
    const problem = generateOrderExpression(7, "support");
    const index = problem.validNextOperatorIndices[0]!;

    expect(validateNextStep(problem, index)).toEqual({
      ok: true,
      message: "Dobry wybór — to właściwy następny krok.",
    });
  });

  it("odrzuca błędny priorytet operatora", () => {
    const problem = generateOrderExpression(11, "core");
    const wrongIndex = problem.tokens.findIndex((token) => token.type === "operator");
    const isValid = problem.validNextOperatorIndices.includes(wrongIndex);

    if (!isValid && wrongIndex >= 0) {
      expect(validateNextStep(problem, wrongIndex).ok).toBe(false);
    } else {
      expect(problem.validNextOperatorIndices.length).toBeGreaterThan(0);
    }
  });
});

describe("auditOrderGenerator", () => {
  it("przechodzi audyt 1000 seedów (test:generators)", () => {
    const result = auditOrderGenerator(1000);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);
  });
});
