import { describe, expect, it } from "vitest";
import { selectRoundSeed } from "@/components/lessons/models/OrderDirectorModel";

describe("selectRoundSeed", () => {
  it("nie zawija puli zadań do pierwszego przykładu", () => {
    const pool = [41, 73, 109];

    expect(pool.map((_, round) => selectRoundSeed(7, pool, round))).toEqual(pool);
    expect(selectRoundSeed(7, pool, 3)).toBe(58);
  });

  it("generuje stabilne, różne seedy bez puli", () => {
    const seeds = [0, 1, 2, 3].map((round) => selectRoundSeed(100, undefined, round));

    expect(seeds).toEqual([100, 117, 134, 151]);
    expect(new Set(seeds).size).toBe(seeds.length);
  });
});
