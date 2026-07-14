import type { GameDifficulty } from "@/lib/materials/gameDifficulty";

export interface SpaceRouteStep {
  id: string;
  label: string;
  order: number | null;
  fingerprint: string;
}

export interface SpaceCourierRound {
  id: string;
  expression: string;
  result: number;
  hint: string;
  steps: SpaceRouteStep[];
}

const MEDIUM_ROUND_BANK: SpaceCourierRound[] = [
  {
    id: "route-1",
    expression: "(12 + 8) · 3 − 10",
    result: 50,
    hint: "Najpierw nawias, potem mnożenie, na końcu odejmowanie.",
    steps: [
      { id: "route-1-b", label: "20 · 3 = 60", order: 2, fingerprint: "step|20|mul|3|60" },
      { id: "route-1-x", label: "3 − 10 = −7", order: null, fingerprint: "decoy|3|sub|10" },
      { id: "route-1-a", label: "12 + 8 = 20", order: 1, fingerprint: "step|12|add|8|20" },
      { id: "route-1-c", label: "60 − 10 = 50", order: 3, fingerprint: "step|60|sub|10|50" },
    ],
  },
  {
    id: "route-2",
    expression: "72 : (5 + 3) + 11",
    result: 20,
    hint: "Oblicz nawias, wykonaj dzielenie i dopiero dodawanie.",
    steps: [
      { id: "route-2-c", label: "9 + 11 = 20", order: 3, fingerprint: "step|9|add|11|20" },
      { id: "route-2-a", label: "5 + 3 = 8", order: 1, fingerprint: "step|5|add|3|8" },
      { id: "route-2-x", label: "72 : 5 = 14,4", order: null, fingerprint: "decoy|72|div|5" },
      { id: "route-2-b", label: "72 : 8 = 9", order: 2, fingerprint: "step|72|div|8|9" },
    ],
  },
  {
    id: "route-3",
    expression: "4 · (15 − 7) + 6",
    result: 38,
    hint: "Nawias otwiera trasę, potem mnożenie i dodawanie.",
    steps: [
      { id: "route-3-x", label: "4 · 15 = 60", order: null, fingerprint: "decoy|4|mul|15" },
      { id: "route-3-b", label: "4 · 8 = 32", order: 2, fingerprint: "step|4|mul|8|32" },
      { id: "route-3-c", label: "32 + 6 = 38", order: 3, fingerprint: "step|32|add|6|38" },
      { id: "route-3-a", label: "15 − 7 = 8", order: 1, fingerprint: "step|15|sub|7|8" },
    ],
  },
  {
    id: "route-4",
    expression: "100 − (6 · 9) + 14",
    result: 60,
    hint: "W nawiasie jest mnożenie. Potem działaj od lewej strony.",
    steps: [
      { id: "route-4-a", label: "6 · 9 = 54", order: 1, fingerprint: "step|6|mul|9|54" },
      { id: "route-4-c", label: "46 + 14 = 60", order: 3, fingerprint: "step|46|add|14|60" },
      { id: "route-4-x", label: "100 − 6 = 94", order: null, fingerprint: "decoy|100|sub|6" },
      { id: "route-4-b", label: "100 − 54 = 46", order: 2, fingerprint: "step|100|sub|54|46" },
    ],
  },
];

const EASY_ROUND_BANK: SpaceCourierRound[] = [
  {
    id: "easy-route-1",
    expression: "(6 + 4) · 2 − 5",
    result: 15,
    hint: "Najpierw nawias, potem mnożenie, na końcu odejmowanie.",
    steps: [
      { id: "easy-route-1-b", label: "10 · 2 = 20", order: 2, fingerprint: "easy|step|10|mul|2|20" },
      { id: "easy-route-1-x", label: "2 − 5 = −3", order: null, fingerprint: "easy|decoy|2|sub|5" },
      { id: "easy-route-1-a", label: "6 + 4 = 10", order: 1, fingerprint: "easy|step|6|add|4|10" },
      { id: "easy-route-1-c", label: "20 − 5 = 15", order: 3, fingerprint: "easy|step|20|sub|5|15" },
    ],
  },
  {
    id: "easy-route-2",
    expression: "36 : (4 + 2) + 7",
    result: 13,
    hint: "Oblicz nawias, wykonaj dzielenie i dopiero dodawanie.",
    steps: [
      { id: "easy-route-2-c", label: "6 + 7 = 13", order: 3, fingerprint: "easy|step|6|add|7|13" },
      { id: "easy-route-2-a", label: "4 + 2 = 6", order: 1, fingerprint: "easy|step|4|add|2|6" },
      { id: "easy-route-2-x", label: "36 : 4 = 9", order: null, fingerprint: "easy|decoy|36|div|4" },
      { id: "easy-route-2-b", label: "36 : 6 = 6", order: 2, fingerprint: "easy|step|36|div|6|6" },
    ],
  },
  {
    id: "easy-route-3",
    expression: "3 · (9 − 5) + 4",
    result: 16,
    hint: "Zacznij od odejmowania w nawiasie.",
    steps: [
      { id: "easy-route-3-x", label: "3 · 9 = 27", order: null, fingerprint: "easy|decoy|3|mul|9" },
      { id: "easy-route-3-b", label: "3 · 4 = 12", order: 2, fingerprint: "easy|step|3|mul|4|12" },
      { id: "easy-route-3-c", label: "12 + 4 = 16", order: 3, fingerprint: "easy|step|12|add|4|16" },
      { id: "easy-route-3-a", label: "9 − 5 = 4", order: 1, fingerprint: "easy|step|9|sub|5|4" },
    ],
  },
  {
    id: "easy-route-4",
    expression: "50 − (4 · 6) + 9",
    result: 35,
    hint: "Najpierw wykonaj mnożenie w nawiasie, potem działania od lewej.",
    steps: [
      { id: "easy-route-4-a", label: "4 · 6 = 24", order: 1, fingerprint: "easy|step|4|mul|6|24" },
      { id: "easy-route-4-c", label: "26 + 9 = 35", order: 3, fingerprint: "easy|step|26|add|9|35" },
      { id: "easy-route-4-x", label: "50 − 4 = 46", order: null, fingerprint: "easy|decoy|50|sub|4" },
      { id: "easy-route-4-b", label: "50 − 24 = 26", order: 2, fingerprint: "easy|step|50|sub|24|26" },
    ],
  },
];

const HARD_ROUND_BANK: SpaceCourierRound[] = [
  {
    id: "hard-route-1",
    expression: "(125 + 87) · 36 − 432",
    result: 7200,
    hint: "Oblicz nawias, pomnóż otrzymaną sumę i na końcu odejmij.",
    steps: [
      { id: "hard-route-1-b", label: "212 · 36 = 7 632", order: 2, fingerprint: "hard|step|212|mul|36|7632" },
      { id: "hard-route-1-x", label: "36 − 432 = −396", order: null, fingerprint: "hard|decoy|36|sub|432" },
      { id: "hard-route-1-a", label: "125 + 87 = 212", order: 1, fingerprint: "hard|step|125|add|87|212" },
      { id: "hard-route-1-c", label: "7 632 − 432 = 7 200", order: 3, fingerprint: "hard|step|7632|sub|432|7200" },
    ],
  },
  {
    id: "hard-route-2",
    expression: "8 640 : (48 + 24) + 375",
    result: 495,
    hint: "Najpierw dodaj w nawiasie, potem dziel i dopiero dodaj 375.",
    steps: [
      { id: "hard-route-2-c", label: "120 + 375 = 495", order: 3, fingerprint: "hard|step|120|add|375|495" },
      { id: "hard-route-2-a", label: "48 + 24 = 72", order: 1, fingerprint: "hard|step|48|add|24|72" },
      { id: "hard-route-2-x", label: "8 640 : 48 = 180", order: null, fingerprint: "hard|decoy|8640|div|48" },
      { id: "hard-route-2-b", label: "8 640 : 72 = 120", order: 2, fingerprint: "hard|step|8640|div|72|120" },
    ],
  },
  {
    id: "hard-route-3",
    expression: "125 · (96 − 58) + 1 750",
    result: 6500,
    hint: "Różnica w nawiasie jest pierwszym punktem trasy.",
    steps: [
      { id: "hard-route-3-x", label: "125 · 96 = 12 000", order: null, fingerprint: "hard|decoy|125|mul|96" },
      { id: "hard-route-3-b", label: "125 · 38 = 4 750", order: 2, fingerprint: "hard|step|125|mul|38|4750" },
      { id: "hard-route-3-c", label: "4 750 + 1 750 = 6 500", order: 3, fingerprint: "hard|step|4750|add|1750|6500" },
      { id: "hard-route-3-a", label: "96 − 58 = 38", order: 1, fingerprint: "hard|step|96|sub|58|38" },
    ],
  },
  {
    id: "hard-route-4",
    expression: "25 000 − (384 · 52) + 7 480",
    result: 12512,
    hint: "Wykonaj mnożenie w nawiasie, a potem działaj od lewej strony.",
    steps: [
      { id: "hard-route-4-a", label: "384 · 52 = 19 968", order: 1, fingerprint: "hard|step|384|mul|52|19968" },
      { id: "hard-route-4-c", label: "5 032 + 7 480 = 12 512", order: 3, fingerprint: "hard|step|5032|add|7480|12512" },
      { id: "hard-route-4-x", label: "25 000 − 384 = 24 616", order: null, fingerprint: "hard|decoy|25000|sub|384" },
      { id: "hard-route-4-b", label: "25 000 − 19 968 = 5 032", order: 2, fingerprint: "hard|step|25000|sub|19968|5032" },
    ],
  },
];

const ROUND_BANKS: Record<GameDifficulty, SpaceCourierRound[]> = {
  easy: EASY_ROUND_BANK,
  medium: MEDIUM_ROUND_BANK,
  hard: HARD_ROUND_BANK,
};

export function buildSpaceCourierRounds(difficulty: GameDifficulty = "medium"): SpaceCourierRound[] {
  return ROUND_BANKS[difficulty].map((round) => ({
    ...round,
    steps: round.steps.map((step) => ({ ...step })),
  }));
}
