import { describe, expect, it } from "vitest";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";
import { buildBeaverDamRounds, isCorrectBeaverDamChoice } from "@/lib/materials/generators/beaverDam";

const DIFFICULTIES: GameDifficulty[] = ["easy", "medium", "hard"];

describe("generator gry Tama Liczb", () => {
  it("nie powtarza żadnego przykładu w całej rozgrywce", () => {
    for (const difficulty of DIFFICULTIES) {
      const rounds = buildBeaverDamRounds(difficulty);
      const fingerprints = rounds.flatMap((round) => round.choices.map((choice) => choice.fingerprint));
      expect(new Set(fingerprints).size).toBe(fingerprints.length);
    }
  });

  it("ma dokładnie jedną poprawną odpowiedź w każdej rundzie", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const round of buildBeaverDamRounds(difficulty)) {
        expect(round.choices.filter((choice) => isCorrectBeaverDamChoice(round, choice.id))).toHaveLength(1);
      }
    }
  });

  it("wyniki spełniają warunek opisany przez tryb rundy", () => {
    for (const difficulty of DIFFICULTIES) {
      for (const round of buildBeaverDamRounds(difficulty)) {
        const correct = round.choices.find((choice) => choice.id === round.correctChoiceId)!;
        if (round.mode === "exact") expect(correct.result).toBe(round.target);
        if (round.mode === "less") expect(correct.result).toBeLessThan(round.target);
        if (round.mode === "greater") expect(correct.result).toBeGreaterThan(round.target);
        if (round.mode === "closest") {
          const distance = Math.abs(correct.result - round.target);
          expect(round.choices.every((choice) => Math.abs(choice.result - round.target) >= distance)).toBe(true);
        }
      }
    }
  });

  it("tasuje pozycję poprawnej kłody zamiast trzymać ją w lewym górnym rogu", () => {
    const originalOrder = buildBeaverDamRounds("medium", () => 0.999999);
    const shuffledOrder = buildBeaverDamRounds("medium", () => 0);

    expect(originalOrder.map((round) => round.choices.findIndex((choice) => choice.id === round.correctChoiceId))).toEqual([0, 0, 0, 0, 0]);
    expect(shuffledOrder.map((round) => round.choices.findIndex((choice) => choice.id === round.correctChoiceId))).toEqual([3, 3, 3, 3, 3]);
  });

  it("na trudnym poziomie używa wyraźnie większych liczb", () => {
    const mediumMaximum = Math.max(...buildBeaverDamRounds("medium").flatMap((round) => round.choices.map((choice) => choice.result)));
    const hardMaximum = Math.max(...buildBeaverDamRounds("hard").flatMap((round) => round.choices.map((choice) => choice.result)));
    expect(hardMaximum).toBeGreaterThan(mediumMaximum * 10);
  });
});
