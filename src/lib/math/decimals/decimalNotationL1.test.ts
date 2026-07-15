import { describe, expect, it } from "vitest";
import {
  createPublicDecimalNotationL1Task,
  decimalHundredthsDisplay,
  decimalHundredthsWords,
} from "@/lib/math/decimals/decimalNotationL1";

describe("generator WP-S5-01A", () => {
  it("tworzy deterministyczne i poznawczo różne warianty bez answerSpec", () => {
    const inputs = [
      { seed: 501102, difficulty: "support" as const },
      { seed: 501107, difficulty: "core" as const },
      { seed: 501105, difficulty: "challenge" as const },
    ];
    const tasks = inputs.map((input) => createPublicDecimalNotationL1Task({ ...input, activity: "independent" }));

    expect(tasks.map((task) => task.targetHundredths)).toEqual([40, 37, 4]);
    expect(tasks.map((task) => task.decimalDisplay)).toEqual(["0,4", "0,37", "0,04"]);
    expect(tasks.map((task) => task.words)).toEqual(["cztery dziesiąte", "trzydzieści siedem setnych", "cztery setne"]);
    expect(createPublicDecimalNotationL1Task({ ...inputs[1], activity: "independent" })).toEqual(tasks[1]);
    expect(JSON.stringify(tasks)).not.toContain("answerSpec");
    expect(tasks.every((task) => task.invariants.includes("answer-spec-server-only"))).toBe(true);
  });

  it("formatuje polski przecinek oraz dziesiąte i setne bez floatów", () => {
    expect(decimalHundredthsDisplay(4)).toBe("0,04");
    expect(decimalHundredthsDisplay(40)).toBe("0,4");
    expect(decimalHundredthsDisplay(37)).toBe("0,37");
    expect(decimalHundredthsWords(4)).toBe("cztery setne");
    expect(decimalHundredthsWords(40)).toBe("cztery dziesiąte");
  });
});
