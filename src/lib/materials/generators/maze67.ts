import { shuffleItems, type GameDifficulty } from "@/lib/materials/gameDifficulty";

export const MAZE_67_TARGET = 67;

export type Maze67Gate = {
  id: string;
  options: number[];
};

export type Maze67Puzzle = {
  target: number;
  gates: Maze67Gate[];
};

const GATES: Record<GameDifficulty, readonly (readonly number[])[]> = {
  easy: [
    [8, 3, 14],
    [11, 7, 15],
    [13, 9, 16],
    [17, 12, 20],
    [18, 14, 22],
  ],
  medium: [
    [7, 12, 15],
    [9, 14, 18],
    [11, 16, 20],
    [13, 17, 21],
    [10, 15, 19],
    [17, 22, 24],
  ],
  hard: [
    [4, 7, 10],
    [6, 9, 12],
    [8, 11, 14],
    [10, 13, 16],
    [12, 15, 18],
    [14, 17, 20],
    [13, 16, 19],
  ],
};

export function buildMaze67Puzzle(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
): Maze67Puzzle {
  const gates = shuffleItems(GATES[difficulty], random).map((options, index) => ({
    id: `${difficulty}-gate-${index + 1}`,
    options: shuffleItems(options, random),
  }));
  return { target: MAZE_67_TARGET, gates };
}

function hasCompletion(gates: readonly Maze67Gate[], gateIndex: number, sum: number): boolean {
  if (gateIndex === gates.length) return sum === MAZE_67_TARGET;
  if (sum >= MAZE_67_TARGET) return false;
  return gates[gateIndex].options.some((value) =>
    hasCompletion(gates, gateIndex + 1, sum + value),
  );
}

export function getWinningMazeOptions(
  gates: readonly Maze67Gate[],
  selectedValues: readonly number[],
): number[] {
  const gate = gates[selectedValues.length];
  if (!gate) return [];
  const currentSum = selectedValues.reduce((sum, value) => sum + value, 0);
  return gate.options.filter((value) =>
    hasCompletion(gates, selectedValues.length + 1, currentSum + value),
  );
}

export function countMaze67Solutions(gates: readonly Maze67Gate[]): number {
  function count(gateIndex: number, sum: number): number {
    if (gateIndex === gates.length) return sum === MAZE_67_TARGET ? 1 : 0;
    if (sum >= MAZE_67_TARGET) return 0;
    return gates[gateIndex].options.reduce(
      (total, value) => total + count(gateIndex + 1, sum + value),
      0,
    );
  }
  return count(0, 0);
}
