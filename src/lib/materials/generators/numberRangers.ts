import { shuffleItems, type GameDifficulty } from "@/lib/materials/gameDifficulty";

export type NumberRangerCreature = {
  id: string;
  value: number;
  correct: boolean;
  left: number;
  top: number;
  delay: number;
};

export type NumberRangerRound = {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  creatures: NumberRangerCreature[];
  targetCount: number;
};

type RoundTemplate = {
  id: string;
  title: string;
  instruction: string;
  explanation: string;
  values: readonly number[];
  accepts: (value: number) => boolean;
};

const POSITIONS = [
  { left: 12, top: 55 },
  { left: 13, top: 34 },
  { left: 31, top: 42 },
  { left: 68, top: 44 },
  { left: 84, top: 45 },
  { left: 91, top: 63 },
  { left: 23, top: 38 },
] as const;

const ROUND_POOLS: Record<GameDifficulty, readonly RoundTemplate[]> = {
  easy: [
    {
      id: "easy-even",
      title: "Stworki parzyste",
      instruction: "Złap wszystkie liczby podzielne przez 2.",
      explanation: "Liczba podzielna przez 2 kończy się cyfrą 0, 2, 4, 6 lub 8.",
      values: [12, 18, 24, 15, 21, 27, 31],
      accepts: (value) => value % 2 === 0,
    },
    {
      id: "easy-five",
      title: "Ślad piątki",
      instruction: "Złap wszystkie liczby podzielne przez 5.",
      explanation: "Liczba podzielna przez 5 kończy się cyfrą 0 lub 5.",
      values: [10, 25, 40, 12, 18, 33, 47],
      accepts: (value) => value % 5 === 0,
    },
    {
      id: "easy-divisors",
      title: "Strażnicy liczby 24",
      instruction: "Złap wszystkie dzielniki liczby 24.",
      explanation: "Dzielnik dzieli 24 bez reszty.",
      values: [2, 4, 6, 5, 7, 9, 10],
      accepts: (value) => 24 % value === 0,
    },
    {
      id: "easy-primes",
      title: "Pierwsze okazy",
      instruction: "Złap wszystkie liczby pierwsze.",
      explanation: "Liczba pierwsza ma dokładnie dwa dzielniki: 1 i samą siebie.",
      values: [2, 7, 13, 1, 9, 15, 21],
      accepts: (value) => [2, 7, 13].includes(value),
    },
  ],
  medium: [
    {
      id: "medium-three",
      title: "Sygnał trójki",
      instruction: "Złap wszystkie liczby podzielne przez 3.",
      explanation: "Suma cyfr każdej złapanej liczby jest podzielna przez 3.",
      values: [132, 225, 417, 124, 215, 418, 701],
      accepts: (value) => value % 3 === 0,
    },
    {
      id: "medium-four",
      title: "Trop czwórki",
      instruction: "Złap wszystkie liczby podzielne przez 4.",
      explanation: "Dwie ostatnie cyfry każdej złapanej liczby tworzą liczbę podzielną przez 4.",
      values: [116, 248, 332, 114, 242, 326, 338],
      accepts: (value) => value % 4 === 0,
    },
    {
      id: "medium-nine",
      title: "Iskra dziewiątki",
      instruction: "Złap wszystkie liczby podzielne przez 9.",
      explanation: "Suma cyfr każdej złapanej liczby jest podzielna przez 9.",
      values: [117, 243, 405, 118, 245, 401, 509],
      accepts: (value) => value % 9 === 0,
    },
    {
      id: "medium-multiples",
      title: "Stado dwunastki",
      instruction: "Złap wszystkie wielokrotności liczby 12.",
      explanation: "Każdą złapaną liczbę można zapisać jako 12 razy liczba naturalna.",
      values: [36, 84, 132, 40, 78, 118, 150],
      accepts: (value) => value % 12 === 0,
    },
  ],
  hard: [
    {
      id: "hard-hundred",
      title: "Olbrzymy setki",
      instruction: "Złap wszystkie liczby podzielne przez 100.",
      explanation: "Liczba podzielna przez 100 kończy się dwiema cyframi 0.",
      values: [1_200, 4_500, 17_800, 1_020, 4_050, 17_080, 32_010],
      accepts: (value) => value % 100 === 0,
    },
    {
      id: "hard-primes",
      title: "Rzadkie liczby pierwsze",
      instruction: "Złap wszystkie liczby pierwsze.",
      explanation: "Złapane liczby mają tylko dwa dzielniki: 1 i samą siebie.",
      values: [101, 107, 113, 91, 111, 121, 143],
      accepts: (value) => [101, 107, 113].includes(value),
    },
    {
      id: "hard-divisors",
      title: "Klucz liczby 180",
      instruction: "Złap wszystkie dzielniki liczby 180.",
      explanation: "Dzielenie 180 przez każdą złapaną liczbę nie daje reszty.",
      values: [9, 12, 15, 7, 11, 14, 16],
      accepts: (value) => 180 % value === 0,
    },
    {
      id: "hard-double-rule",
      title: "Podwójny trop",
      instruction: "Złap liczby podzielne jednocześnie przez 4 i przez 9.",
      explanation: "Każda złapana liczba jest wielokrotnością 36.",
      values: [144, 252, 396, 148, 234, 392, 405],
      accepts: (value) => value % 4 === 0 && value % 9 === 0,
    },
  ],
};

export function buildNumberRangerRounds(
  difficulty: GameDifficulty,
  random: () => number = Math.random,
): NumberRangerRound[] {
  return shuffleItems(ROUND_POOLS[difficulty], random).map((template) => {
    const values = shuffleItems(template.values, random);
    const positions = shuffleItems(POSITIONS, random);
    const creatures = values.map((value, index) => ({
      id: `${template.id}-${value}`,
      value,
      correct: template.accepts(value),
      left: positions[index].left,
      top: positions[index].top,
      delay: index * 0.17,
    }));

    return {
      id: template.id,
      title: template.title,
      instruction: template.instruction,
      explanation: template.explanation,
      creatures,
      targetCount: creatures.filter((creature) => creature.correct).length,
    };
  });
}
