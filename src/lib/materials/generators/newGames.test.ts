import { describe, expect, it } from "vitest";
import { buildFractionLighthouseRounds } from "@/lib/materials/generators/fractionLighthouse";
import { buildSpaceCourierRounds } from "@/lib/materials/generators/spaceCourier";

describe("banki nowych gier Chrupka", () => {
  it("Latarnia ma unikatowe zadania i po dwie prawdziwe odpowiedzi w fali", () => {
    const rounds = buildFractionLighthouseRounds();
    const fingerprints = rounds.flatMap((round) => round.choices.map((choice) => choice.fingerprint));
    expect(rounds).toHaveLength(4);
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
    expect(new Set(rounds.flatMap((round) => round.choices.map((choice) => choice.label))).size).toBe(fingerprints.length);
    expect(rounds.every((round) => round.choices.filter((choice) => choice.correct).length === 2)).toBe(true);
  });

  it("Latarnia tasuje poprawne baloniki między różnymi pozycjami", () => {
    const originalOrder = buildFractionLighthouseRounds(() => 0.999999);
    const shuffledOrder = buildFractionLighthouseRounds(() => 0);

    expect(originalOrder[0].choices.map((choice) => choice.correct)).toEqual([true, true, false, false]);
    expect(shuffledOrder[0].choices.map((choice) => choice.correct)).toEqual([true, false, false, true]);
  });

  it("Kurier ma w każdej misji trzy kolejne etapy i jedną pułapkę", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const rounds = buildSpaceCourierRounds(difficulty);
      const fingerprints = rounds.flatMap((round) => round.steps.map((step) => step.fingerprint));
      expect(rounds).toHaveLength(4);
      expect(new Set(fingerprints).size).toBe(fingerprints.length);
      expect(rounds.every((round) => round.steps.map((step) => step.order).filter((order) => order !== null).sort().join(",") === "1,2,3")).toBe(true);
    }
  });

  it("Kurier zwiększa zakres liczb na trudnym poziomie", () => {
    const mediumMaximum = Math.max(...buildSpaceCourierRounds("medium").map((round) => round.result));
    const hardMaximum = Math.max(...buildSpaceCourierRounds("hard").map((round) => round.result));
    expect(hardMaximum).toBeGreaterThan(mediumMaximum * 100);
  });
});
