import { shuffleItems, type GameDifficulty } from "@/lib/materials/gameDifficulty";

export type FactorVaultRing = {
  id: string;
  options: number[];
};

export type FactorVaultRound = {
  id: string;
  target: number;
  factorization: string;
  rings: FactorVaultRing[];
};

type RoundTemplate = {
  id: string;
  target: number;
  factors: number[];
};

const ROUND_POOLS: Record<GameDifficulty, readonly RoundTemplate[]> = {
  easy: [
    { id: "easy-12", target: 12, factors: [2, 2, 3] },
    { id: "easy-18", target: 18, factors: [2, 3, 3] },
    { id: "easy-20", target: 20, factors: [2, 2, 5] },
    { id: "easy-30", target: 30, factors: [2, 3, 5] },
  ],
  medium: [
    { id: "medium-36", target: 36, factors: [2, 2, 3, 3] },
    { id: "medium-42", target: 42, factors: [2, 3, 7] },
    { id: "medium-60", target: 60, factors: [2, 2, 3, 5] },
    { id: "medium-70", target: 70, factors: [2, 5, 7] },
  ],
  hard: [
    { id: "hard-84", target: 84, factors: [2, 2, 3, 7] },
    { id: "hard-90", target: 90, factors: [2, 3, 3, 5] },
    { id: "hard-126", target: 126, factors: [2, 3, 3, 7] },
    { id: "hard-210", target: 210, factors: [2, 3, 5, 7] },
  ],
};

const PRIME_OPTIONS = [2, 3, 5, 7, 11, 13] as const;

function buildRingOptions(factor: number, ringIndex: number, random: () => number) {
  const decoys = PRIME_OPTIONS.filter((value) => value !== factor);
  const rotated = [...decoys.slice(ringIndex % decoys.length), ...decoys.slice(0, ringIndex % decoys.length)];
  return shuffleItems([factor, ...rotated.slice(0, 3)], random);
}

export function buildFactorVaultRounds(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
): FactorVaultRound[] {
  return shuffleItems(ROUND_POOLS[difficulty], random).map((round) => ({
    id: round.id,
    target: round.target,
    factorization: round.factors.join(" × "),
    rings: shuffleItems(round.factors, random).map((factor, index) => ({
      id: `${round.id}-ring-${index + 1}`,
      options: buildRingOptions(factor, index, random),
    })),
  }));
}
