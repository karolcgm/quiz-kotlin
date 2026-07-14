export type GameDifficulty = "easy" | "medium" | "hard";

export const GAME_DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
};

export function shuffleItems<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomValue = Math.min(Math.max(random(), 0), 0.9999999999999999);
    const swapIndex = Math.floor(randomValue * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
