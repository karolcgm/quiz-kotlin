import { describe, expect, it } from "vitest";
import { buildFactorVaultRounds } from "@/lib/materials/generators/factorVault";
import {
  buildMaze67Puzzle,
  countMaze67Solutions,
  getWinningMazeOptions,
} from "@/lib/materials/generators/maze67";
import type { GameDifficulty } from "@/lib/materials/gameDifficulty";

const difficulties: GameDifficulty[] = ["easy", "medium", "hard"];

describe("Labirynt 67", () => {
  it.each(difficulties)("każdy poziom %s ma co najmniej jedną drogę do 67", (difficulty) => {
    const puzzle = buildMaze67Puzzle(difficulty, () => 0.42);
    expect(puzzle.target).toBe(67);
    expect(countMaze67Solutions(puzzle.gates)).toBeGreaterThan(0);
    expect(puzzle.gates.every((gate) => gate.options.length === 3)).toBe(true);
  });

  it("podpowiedź wskazuje wyłącznie wybór, po którym nadal można dojść do celu", () => {
    const puzzle = buildMaze67Puzzle("hard", () => 0.42);
    const selected: number[] = [];

    while (selected.length < puzzle.gates.length) {
      const winning = getWinningMazeOptions(puzzle.gates, selected);
      expect(winning.length).toBeGreaterThan(0);
      selected.push(winning[0]);
    }

    expect(selected.reduce((sum, value) => sum + value, 0)).toBe(67);
  });
});

describe("Skarbiec Czynników", () => {
  it.each(difficulties)("rundy poziomu %s dają się otworzyć liczbami pierwszymi", (difficulty) => {
    const rounds = buildFactorVaultRounds(difficulty, () => 0.42);
    expect(rounds).toHaveLength(4);

    for (const round of rounds) {
      const factors = round.factorization.split(" × ").map(Number);
      expect(factors.reduce((product, value) => product * value, 1)).toBe(round.target);
      expect(round.rings).toHaveLength(factors.length);
      expect(round.rings.every((ring) => ring.options.length === 4)).toBe(true);
      expect(round.rings.every((ring) => ring.options.every((value) => [2, 3, 5, 7, 11, 13].includes(value)))).toBe(true);
    }
  });
});
