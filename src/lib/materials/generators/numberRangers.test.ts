import { describe, expect, it } from "vitest";
import { buildNumberRangerRounds } from "@/lib/materials/generators/numberRangers";

describe("generator gry Łowcy Liczb", () => {
  it("tworzy cztery rundy i dokładnie trzy właściwe stworki w każdej", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const rounds = buildNumberRangerRounds(difficulty, () => 0.37);
      expect(rounds).toHaveLength(4);
      for (const round of rounds) {
        expect(round.creatures).toHaveLength(7);
        expect(round.targetCount).toBe(3);
        expect(round.creatures.filter((creature) => creature.correct)).toHaveLength(3);
      }
    }
  });

  it("nie powtarza pozycji stworków ani liczb w obrębie rundy", () => {
    const rounds = buildNumberRangerRounds("hard", () => 0.61);
    for (const round of rounds) {
      expect(new Set(round.creatures.map((creature) => creature.value)).size).toBe(7);
      expect(new Set(round.creatures.map((creature) => `${creature.left}:${creature.top}`)).size).toBe(7);
    }
  });
});
