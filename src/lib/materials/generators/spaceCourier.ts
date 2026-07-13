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

const ROUND_BANK: SpaceCourierRound[] = [
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

export function buildSpaceCourierRounds(): SpaceCourierRound[] {
  return ROUND_BANK.map((round) => ({ ...round, steps: round.steps.map((step) => ({ ...step })) }));
}

