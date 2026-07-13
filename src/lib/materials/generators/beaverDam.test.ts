import { describe, expect, it } from "vitest";
import { buildBeaverDamRounds, isCorrectBeaverDamChoice } from "@/lib/materials/generators/beaverDam";

describe("generator gry Tama Liczb", () => {
  it("nie powtarza żadnego przykładu w całej rozgrywce", () => {
    const rounds = buildBeaverDamRounds();
    const fingerprints = rounds.flatMap((round) => round.choices.map((choice) => choice.fingerprint));
    expect(new Set(fingerprints).size).toBe(fingerprints.length);
  });

  it("ma dokładnie jedną poprawną odpowiedź w każdej rundzie", () => {
    for (const round of buildBeaverDamRounds()) {
      expect(round.choices.filter((choice) => isCorrectBeaverDamChoice(round, choice.id))).toHaveLength(1);
    }
  });

  it("wyniki spełniają warunek opisany przez tryb rundy", () => {
    for (const round of buildBeaverDamRounds()) {
      const correct = round.choices.find((choice) => choice.id === round.correctChoiceId)!;
      if (round.mode === "exact") expect(correct.result).toBe(round.target);
      if (round.mode === "less") expect(correct.result).toBeLessThan(round.target);
      if (round.mode === "greater") expect(correct.result).toBeGreaterThan(round.target);
      if (round.mode === "closest") {
        const distance = Math.abs(correct.result - round.target);
        expect(round.choices.every((choice) => Math.abs(choice.result - round.target) >= distance)).toBe(true);
      }
    }
  });
});
