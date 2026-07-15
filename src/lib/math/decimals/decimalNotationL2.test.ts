import { describe, expect, it } from "vitest";
import {
  createPublicDecimalNotationL2Task,
  decimalThousandthsDisplay,
  decimalThousandthsWords,
} from "@/lib/math/decimals/decimalNotationL2";

describe("generator WP-S5-01B", () => {
  it("tworzy deterministyczne warianty support/core/challenge bez answerSpec", () => {
    const inputs = [
      { seed: 502102, difficulty: "support" as const },
      { seed: 502107, difficulty: "core" as const },
      { seed: 502105, difficulty: "challenge" as const },
    ];
    const tasks = inputs.map((input) => createPublicDecimalNotationL2Task({ ...input, activity: "independent-l2" }));

    expect(tasks.map((task) => task.targetThousandths)).toEqual([400, 375, 4]);
    expect(tasks.map((task) => task.decimalDisplay)).toEqual(["0,4", "0,375", "0,004"]);
    expect(tasks.map((task) => task.generatorVersion)).toEqual([2, 2, 2]);
    expect(createPublicDecimalNotationL2Task({ ...inputs[1], activity: "independent-l2" })).toEqual(tasks[1]);
    expect(JSON.stringify(tasks)).not.toContain("answerSpec");
    expect(tasks.every((task) => task.invariants.includes("answer-spec-server-only"))).toBe(true);
  });

  it("formatuje dziesiąte, setne i tysięczne wyłącznie z całkowitej liczby tysięcznych", () => {
    expect(decimalThousandthsDisplay(400)).toBe("0,4");
    expect(decimalThousandthsDisplay(40)).toBe("0,04");
    expect(decimalThousandthsDisplay(4)).toBe("0,004");
    expect(decimalThousandthsDisplay(375)).toBe("0,375");
    expect(decimalThousandthsWords(400)).toBe("cztery dziesiąte");
    expect(decimalThousandthsWords(40)).toBe("cztery setne");
    expect(decimalThousandthsWords(4)).toBe("cztery tysięczne");
    expect(decimalThousandthsWords(375)).toBe("trzysta siedemdziesiąt pięć tysięcznych");
  });
});
