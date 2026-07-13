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

const ROUND_BANK: BeaverDamRound[] = [
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

export function buildBeaverDamRounds(): BeaverDamRound[] {
  return ROUND_BANK.map((round) => ({ ...round, choices: round.choices.map((item) => ({ ...item })) }));
}

export function isCorrectBeaverDamChoice(round: BeaverDamRound, choiceId: string): boolean {
  return round.correctChoiceId === choiceId;
}
