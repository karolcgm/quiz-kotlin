import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildGeneratedFractionQuestion,
  toFractionPublicQuestion,
} from "@/lib/math/fractions/fractionGeneratorCore";
import { validateFractionAnswer } from "@/lib/math/fractions/fractionValidation";
import type { FractionGeneratorConfig, FractionGeneratorTask } from "@/types/fractions";

function config(task: FractionGeneratorTask): FractionGeneratorConfig {
  return {
    task,
    denominatorMin: 2,
    denominatorMax: 12,
    wholeMax: 4,
    equivalentMultiplierMax: 6,
    requireSimplified: task === "simplify",
    skillIds: ["M5-3.foundation"],
  };
}

describe("deterministyczny kontrakt generatora ułamków", () => {
  it.each(["represent", "simplify", "convert-to-mixed", "write-equivalent"] as const)(
    "tworzy identyczny wynik dla tego samego seedu: %s",
    (task) => {
      const first = buildGeneratedFractionQuestion({ seed: 20260715, difficulty: "core", config: config(task) });
      const second = buildGeneratedFractionQuestion({ seed: 20260715, difficulty: "core", config: config(task) });
      expect(second).toEqual(first);
    },
  );

  it("sprawdza 20 seedów i nie tworzy mianownika zero", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const generated = buildGeneratedFractionQuestion({ seed, difficulty: "core", config: config("represent") });
      expect(generated.publicQuestion.params.source.denominator).toBeGreaterThan(0);
      expect(generated.answerSpec.expected.denominator).toBeGreaterThan(0);
      expect(generated.publicQuestion.invariants).toContain("empty-is-not-zero");
    }
  });

  it("serializuje publicQuestion bez prywatnego answerSpec", () => {
    const generated = buildGeneratedFractionQuestion({ seed: 8, difficulty: "support", config: config("simplify") });
    const publicQuestion = toFractionPublicQuestion(generated);
    expect(publicQuestion).not.toHaveProperty("answerSpec");
    expect(JSON.stringify(publicQuestion)).not.toContain("expected");
    expect(generated).toHaveProperty("answerSpec.expected");
  });

  it("utrzymuje tworzenie pełnego kontraktu za granicą server-only", () => {
    const serverModule = readFileSync(new URL("./fractionGenerator.server.ts", import.meta.url), "utf8");
    expect(serverModule).toContain('import "server-only"');
    expect(serverModule).toContain("createFractionQuestionForServer");
  });
});

describe("walidacja prywatnego answerSpec", () => {
  const answerSpec = {
    expected: { numerator: 3, denominator: 4 },
    allowEquivalent: true,
    requireSimplified: true,
    expectedFormat: "fraction" as const,
    maxScore: 2,
  };

  it("akceptuje równoważną wartość, ale osobno punktuje nieskróconą postać", () => {
    expect(validateFractionAnswer("3/4", answerSpec)).toMatchObject({ status: "correct", score: 2, errorCodes: [] });
    expect(validateFractionAnswer("6/8", answerSpec)).toMatchObject({
      status: "partially-correct", score: 1, errorCodes: ["FRA_NOT_SIMPLIFIED"],
    });
  });

  it("diagnozuje zamianę licznika i mianownika, zmianę wartości, pustkę i zero", () => {
    expect(validateFractionAnswer("4/3", answerSpec)).toMatchObject({ errorCodes: ["FRA_NUM_DEN_SWAPPED"] });
    expect(validateFractionAnswer("2/3", answerSpec)).toMatchObject({ errorCodes: ["FRA_NOT_EQUIVALENT"] });
    expect(validateFractionAnswer("", answerSpec)).toMatchObject({ errorCodes: ["FRA_EMPTY_PART"] });
    expect(validateFractionAnswer("3/0", answerSpec)).toMatchObject({ errorCodes: ["FRA_ZERO_DENOMINATOR"] });
  });
});
