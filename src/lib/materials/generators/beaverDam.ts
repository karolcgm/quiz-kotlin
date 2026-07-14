import { shuffleItems, type GameDifficulty } from "@/lib/materials/gameDifficulty";

export type BeaverDamRoundMode = "exact" | "less" | "greater" | "closest";

export interface BeaverDamChoice {
  id: string;
  expression: string;
  result: number;
  fingerprint: string;
}

export interface BeaverDamRound {
  id: string;
  mode: BeaverDamRoundMode;
  target: number;
  prompt: string;
  hint: string;
  choices: BeaverDamChoice[];
  correctChoiceId: string;
}

function choice(id: string, expression: string, result: number, fingerprint: string): BeaverDamChoice {
  return { id, expression, result, fingerprint };
}

const MEDIUM_ROUND_BANK: BeaverDamRound[] = [
  {
    id: "dam-1",
    mode: "exact",
    target: 786,
    prompt: "Która kłoda daje wynik 786?",
    hint: "Najpierw policz setki, a potem dziesiątki i jedności.",
    correctChoiceId: "dam-1-a",
    choices: [
      choice("dam-1-a", "325 + 461", 786, "add|325|461"),
      choice("dam-1-b", "120 + 450", 570, "add|120|450"),
      choice("dam-1-c", "970 − 230", 740, "sub|970|230"),
      choice("dam-1-d", "4 · 218", 872, "mul|4|218"),
    ],
  },
  {
    id: "dam-2",
    mode: "less",
    target: 500,
    prompt: "Wybierz jedyny wynik mniejszy niż 500.",
    hint: "Wystarczy porównać liczbę setek w wyniku.",
    correctChoiceId: "dam-2-a",
    choices: [
      choice("dam-2-a", "67 + 48", 115, "add|48|67"),
      choice("dam-2-b", "782 − 236", 546, "sub|782|236"),
      choice("dam-2-c", "7 · 96", 672, "mul|7|96"),
      choice("dam-2-d", "2415 : 3", 805, "div|2415|3"),
    ],
  },
  {
    id: "dam-3",
    mode: "greater",
    target: 800,
    prompt: "Który wynik jest większy niż 800?",
    hint: "Oszacuj każdy wynik do pełnej setki.",
    correctChoiceId: "dam-3-a",
    choices: [
      choice("dam-3-a", "47 · 18", 846, "mul|47|18"),
      choice("dam-3-b", "350 + 420", 770, "add|350|420"),
      choice("dam-3-c", "960 − 220", 740, "sub|960|220"),
      choice("dam-3-d", "595 : 5", 119, "div|595|5"),
    ],
  },
  {
    id: "dam-4",
    mode: "closest",
    target: 500,
    prompt: "Który wynik jest najbliższy liczbie 500?",
    hint: "Porównaj odległość każdego wyniku od 500.",
    correctChoiceId: "dam-4-a",
    choices: [
      choice("dam-4-a", "2415 : 5", 483, "div|2415|5"),
      choice("dam-4-b", "5 · 119", 595, "mul|5|119"),
      choice("dam-4-c", "247 + 289", 536, "add|247|289"),
      choice("dam-4-d", "6737 − 6295", 442, "sub|6737|6295"),
    ],
  },
  {
    id: "dam-5",
    mode: "exact",
    target: 230,
    prompt: "Ostatnia kłoda musi dać dokładnie 230.",
    hint: "Sprawdź działanie odwrotne, jeśli nie masz pewności.",
    correctChoiceId: "dam-5-a",
    choices: [
      choice("dam-5-a", "860 − 630", 230, "sub|860|630"),
      choice("dam-5-b", "121 + 121", 242, "add|121|121"),
      choice("dam-5-c", "58 · 4", 232, "mul|58|4"),
      choice("dam-5-d", "540 : 5", 108, "div|540|5"),
    ],
  },
];

const EASY_ROUND_BANK: BeaverDamRound[] = [
  {
    id: "easy-dam-1",
    mode: "exact",
    target: 86,
    prompt: "Która kłoda daje wynik 86?",
    hint: "Dodaj najpierw dziesiątki, a potem jedności.",
    correctChoiceId: "easy-dam-1-a",
    choices: [
      choice("easy-dam-1-a", "35 + 51", 86, "easy|add|35|51"),
      choice("easy-dam-1-b", "120 − 42", 78, "easy|sub|120|42"),
      choice("easy-dam-1-c", "9 · 9", 81, "easy|mul|9|9"),
      choice("easy-dam-1-d", "180 : 2", 90, "easy|div|180|2"),
    ],
  },
  {
    id: "easy-dam-2",
    mode: "less",
    target: 100,
    prompt: "Wybierz jedyny wynik mniejszy niż 100.",
    hint: "Porównaj wyniki z pełną setką.",
    correctChoiceId: "easy-dam-2-a",
    choices: [
      choice("easy-dam-2-a", "67 + 28", 95, "easy|add|28|67"),
      choice("easy-dam-2-b", "126 − 18", 108, "easy|sub|126|18"),
      choice("easy-dam-2-c", "9 · 12", 108, "easy|mul|9|12"),
      choice("easy-dam-2-d", "420 : 4", 105, "easy|div|420|4"),
    ],
  },
  {
    id: "easy-dam-3",
    mode: "greater",
    target: 200,
    prompt: "Który wynik jest większy niż 200?",
    hint: "Najpierw oszacuj, czy wynik przekroczy dwie setki.",
    correctChoiceId: "easy-dam-3-a",
    choices: [
      choice("easy-dam-3-a", "24 · 9", 216, "easy|mul|24|9"),
      choice("easy-dam-3-b", "90 + 105", 195, "easy|add|90|105"),
      choice("easy-dam-3-c", "250 − 56", 194, "easy|sub|250|56"),
      choice("easy-dam-3-d", "760 : 4", 190, "easy|div|760|4"),
    ],
  },
  {
    id: "easy-dam-4",
    mode: "closest",
    target: 150,
    prompt: "Który wynik jest najbliższy liczbie 150?",
    hint: "Sprawdź odległość każdego wyniku od 150.",
    correctChoiceId: "easy-dam-4-a",
    choices: [
      choice("easy-dam-4-a", "48 · 3", 144, "easy|mul|48|3"),
      choice("easy-dam-4-b", "320 : 2", 160, "easy|div|320|2"),
      choice("easy-dam-4-c", "82 + 55", 137, "easy|add|82|55"),
      choice("easy-dam-4-d", "210 − 42", 168, "easy|sub|210|42"),
    ],
  },
  {
    id: "easy-dam-5",
    mode: "exact",
    target: 75,
    prompt: "Ostatnia kłoda musi dać dokładnie 75.",
    hint: "Sprawdź wynik każdego działania po kolei.",
    correctChoiceId: "easy-dam-5-a",
    choices: [
      choice("easy-dam-5-a", "120 − 45", 75, "easy|sub|120|45"),
      choice("easy-dam-5-b", "38 + 39", 77, "easy|add|38|39"),
      choice("easy-dam-5-c", "8 · 9", 72, "easy|mul|8|9"),
      choice("easy-dam-5-d", "320 : 4", 80, "easy|div|320|4"),
    ],
  },
];

const HARD_ROUND_BANK: BeaverDamRound[] = [
  {
    id: "hard-dam-1",
    mode: "exact",
    target: 24624,
    prompt: "Która kłoda daje wynik 24 624?",
    hint: "Przy mnożeniu rozbij drugi czynnik na dziesiątki i jedności.",
    correctChoiceId: "hard-dam-1-a",
    choices: [
      choice("hard-dam-1-a", "432 · 57", 24624, "hard|mul|432|57"),
      choice("hard-dam-1-b", "31 875 − 7 196", 24679, "hard|sub|31875|7196"),
      choice("hard-dam-1-c", "12 840 + 11 694", 24534, "hard|add|12840|11694"),
      choice("hard-dam-1-d", "98 560 : 4", 24640, "hard|div|98560|4"),
    ],
  },
  {
    id: "hard-dam-2",
    mode: "less",
    target: 30000,
    prompt: "Wybierz jedyny wynik mniejszy niż 30 000.",
    hint: "Oszacuj wyniki do pełnych tysięcy.",
    correctChoiceId: "hard-dam-2-a",
    choices: [
      choice("hard-dam-2-a", "287 · 96", 27552, "hard|mul|287|96"),
      choice("hard-dam-2-b", "45 850 − 15 321", 30529, "hard|sub|45850|15321"),
      choice("hard-dam-2-c", "18 764 + 12 690", 31454, "hard|add|18764|12690"),
      choice("hard-dam-2-d", "248 000 : 8", 31000, "hard|div|248000|8"),
    ],
  },
  {
    id: "hard-dam-3",
    mode: "greater",
    target: 50000,
    prompt: "Który wynik jest większy niż 50 000?",
    hint: "Porównaj oszacowania, zanim wykonasz dokładne obliczenie.",
    correctChoiceId: "hard-dam-3-a",
    choices: [
      choice("hard-dam-3-a", "768 · 72", 55296, "hard|mul|768|72"),
      choice("hard-dam-3-b", "27 895 + 21 904", 49799, "hard|add|27895|21904"),
      choice("hard-dam-3-c", "92 000 − 42 150", 49850, "hard|sub|92000|42150"),
      choice("hard-dam-3-d", "348 600 : 7", 49800, "hard|div|348600|7"),
    ],
  },
  {
    id: "hard-dam-4",
    mode: "closest",
    target: 40000,
    prompt: "Który wynik jest najbliższy liczbie 40 000?",
    hint: "Policz różnicę między każdym wynikiem a 40 000.",
    correctChoiceId: "hard-dam-4-a",
    choices: [
      choice("hard-dam-4-a", "556 · 72", 40032, "hard|mul|556|72"),
      choice("hard-dam-4-b", "161 000 : 4", 40250, "hard|div|161000|4"),
      choice("hard-dam-4-c", "28 765 + 10 990", 39755, "hard|add|28765|10990"),
      choice("hard-dam-4-d", "78 500 − 38 200", 40300, "hard|sub|78500|38200"),
    ],
  },
  {
    id: "hard-dam-5",
    mode: "exact",
    target: 65520,
    prompt: "Ostatnia kłoda musi dać dokładnie 65 520.",
    hint: "Wykorzystaj rozdzielność mnożenia względem dodawania.",
    correctChoiceId: "hard-dam-5-a",
    choices: [
      choice("hard-dam-5-a", "840 · 78", 65520, "hard|mul|840|78"),
      choice("hard-dam-5-b", "70 200 − 4 510", 65690, "hard|sub|70200|4510"),
      choice("hard-dam-5-c", "32 740 + 32 680", 65420, "hard|add|32740|32680"),
      choice("hard-dam-5-d", "523 200 : 8", 65400, "hard|div|523200|8"),
    ],
  },
];

const ROUND_BANKS: Record<GameDifficulty, BeaverDamRound[]> = {
  easy: EASY_ROUND_BANK,
  medium: MEDIUM_ROUND_BANK,
  hard: HARD_ROUND_BANK,
};

export function buildBeaverDamRounds(
  difficulty: GameDifficulty = "medium",
  random: () => number = Math.random,
): BeaverDamRound[] {
  return ROUND_BANKS[difficulty].map((round) => ({
    ...round,
    choices: shuffleItems(round.choices.map((item) => ({ ...item })), random),
  }));
}

export function isCorrectBeaverDamChoice(round: BeaverDamRound, choiceId: string): boolean {
  return round.correctChoiceId === choiceId;
}
