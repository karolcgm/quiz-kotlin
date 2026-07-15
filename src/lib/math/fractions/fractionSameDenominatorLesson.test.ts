import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS,
  FRA_DENOM_ADDED,
  FRA_UNSIMPLIFIED_RESULT,
  applySameDenominatorOperation,
  createFractionSameDenominatorDiagnosticResult,
  createPublicFractionSameDenominatorTask,
  evaluateSameDenominatorAttempt,
  fractionSameDenominatorActivityFromStageId,
  simplifiedSameDenominatorResult,
} from "@/lib/math/fractions/fractionSameDenominatorLesson";

describe("WP-S3-05A — generator i walidator ułamków o jednakowych mianownikach", () => {
  it("utrwala pizzę 2/8 + 3/8 = 5/8 oraz odejmowanie bez liczb mieszanych", () => {
    const pizza = createPublicFractionSameDenominatorTask({ seed: 1, difficulty: "core", activity: "same-denom-pizza-add" });
    expect(pizza).toMatchObject({
      left: { numerator: 2, denominator: 8 },
      right: { numerator: 3, denominator: 8 },
      operation: "+",
      resultHiddenUntilAttempt: false,
    });
    expect(applySameDenominatorOperation(pizza)).toEqual({ numerator: 5, denominator: 8 });

    const takeAway = createPublicFractionSameDenominatorTask({ seed: 1, difficulty: "core", activity: "same-denom-take-away" });
    expect(takeAway).toMatchObject({
      left: { numerator: 7, denominator: 8 },
      right: { numerator: 3, denominator: 8 },
      operation: "−",
      resultHiddenUntilAttempt: true,
    });
    expect(takeAway.invariants).toContain("no-mixed-numbers-or-borrowing");
    expect(takeAway).not.toHaveProperty("answerSpec");
  });

  it("generuje deterministyczne warianty support/core/challenge wyłącznie jako ułamki właściwe", () => {
    for (const difficulty of ["support", "core", "challenge"] as const) {
      for (let seed = 0; seed < 300; seed += 1) {
        const first = createPublicFractionSameDenominatorTask({ seed, difficulty, activity: "same-denom-independent" });
        const second = createPublicFractionSameDenominatorTask({ seed, difficulty, activity: "same-denom-independent" });
        expect(second).toEqual(first);
        expect(first.left.denominator).toBe(first.right.denominator);
        expect(first.left.numerator).toBeLessThan(first.left.denominator);
        expect(first.right.numerator).toBeLessThan(first.right.denominator);
        const raw = applySameDenominatorOperation(first);
        expect(raw.numerator).toBeGreaterThanOrEqual(0);
        expect(raw.numerator).toBeLessThan(raw.denominator);
        expect(first).not.toHaveProperty("answerSpec");
      }
    }
  });

  it("rozróżnia dodanie mianowników od poprawnej, lecz nieskróconej wartości", () => {
    const task = createPublicFractionSameDenominatorTask({ seed: 0, difficulty: "support", activity: "same-denom-independent" });
    const raw = applySameDenominatorOperation(task);
    expect(evaluateSameDenominatorAttempt({
      task,
      submitted: { numerator: raw.numerator, denominator: task.left.denominator + task.right.denominator },
    })).toBe(FRA_DENOM_ADDED);
    expect(evaluateSameDenominatorAttempt({ task, submitted: raw })).toBe(FRA_UNSIMPLIFIED_RESULT);
    expect(evaluateSameDenominatorAttempt({
      task,
      submitted: simplifiedSameDenominatorResult(task),
      justification: "Mianownik zostaje taki sam, bo nadal liczymy części tej samej wielkości.",
      requireJustification: true,
    })).toBeNull();
    expect(createFractionSameDenominatorDiagnosticResult(FRA_UNSIMPLIFIED_RESULT).result)
      .toMatchObject({ status: "partially-correct", score: 1, maxScore: 2 });
  });

  it("mapuje pięć aktywności przed generycznym independent i publikuje wymagane kody feedbacku", () => {
    expect([
      "same-denom-pizza-add",
      "same-denom-rule",
      "same-denom-take-away",
      "same-denom-bakery",
      "same-denom-independent",
    ].map((suffix) => fractionSameDenominatorActivityFromStageId(`m5-3-5-${suffix}`))).toEqual([
      "same-denom-pizza-add",
      "same-denom-rule",
      "same-denom-take-away",
      "same-denom-bakery",
      "same-denom-independent",
    ]);
    expect(FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS).toEqual(expect.arrayContaining([
      FRA_DENOM_ADDED,
      FRA_UNSIMPLIFIED_RESULT,
      "FRA_WRONG_OPERATION_PAIR",
    ]));
  });

  it("trzyma prywatną rubrykę wyłącznie w module server-only", () => {
    const publicModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionSameDenominatorLesson.ts"), "utf8");
    const serverModule = readFileSync(resolve(process.cwd(), "src/lib/math/fractions/fractionSameDenominatorLesson.server.ts"), "utf8");
    expect(publicModule).not.toContain("expectedBeforeSimplifying:");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("expectedBeforeSimplifying");
    expect(serverModule).toContain("mixedNumbersAllowed: false");
    expect(serverModule).toContain("borrowingAllowed: false");
  });
});
