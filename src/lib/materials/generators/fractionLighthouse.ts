export interface FractionLightChoice {
  id: string;
  label: string;
  correct: boolean;
  fingerprint: string;
}

export interface FractionLightRound {
  id: string;
  target: string;
  prompt: string;
  hint: string;
  choices: FractionLightChoice[];
}

const ROUND_BANK: FractionLightRound[] = [
  {
    id: "light-1",
    target: "1/2",
    prompt: "Kliknij wszystkie ułamki równe 1/2.",
    hint: "Licznik i mianownik pomnóż albo podziel przez tę samą liczbę.",
    choices: [
      { id: "light-1-a", label: "2/4", correct: true, fingerprint: "fraction|2|4" },
      { id: "light-1-b", label: "3/6", correct: true, fingerprint: "fraction|3|6" },
      { id: "light-1-c", label: "4/6", correct: false, fingerprint: "fraction|4|6" },
      { id: "light-1-d", label: "5/8", correct: false, fingerprint: "fraction|5|8" },
    ],
  },
  {
    id: "light-2",
    target: "3/4",
    prompt: "Złap wszystkie ułamki równe 3/4.",
    hint: "Sprawdź, czy po skróceniu otrzymasz 3/4.",
    choices: [
      { id: "light-2-a", label: "6/8", correct: true, fingerprint: "fraction|6|8" },
      { id: "light-2-b", label: "9/12", correct: true, fingerprint: "fraction|9|12" },
      { id: "light-2-c", label: "4/5", correct: false, fingerprint: "fraction|4|5" },
      { id: "light-2-d", label: "8/12", correct: false, fingerprint: "fraction|8|12" },
    ],
  },
  {
    id: "light-3",
    target: "2/3",
    prompt: "Wybierz wszystkie ułamki równe 2/3.",
    hint: "Porównaj iloczyny na krzyż lub skróć ułamek.",
    choices: [
      { id: "light-3-a", label: "14/21", correct: true, fingerprint: "fraction|14|21" },
      { id: "light-3-b", label: "16/24", correct: true, fingerprint: "fraction|16|24" },
      { id: "light-3-c", label: "7/10", correct: false, fingerprint: "fraction|7|10" },
      { id: "light-3-d", label: "11/18", correct: false, fingerprint: "fraction|11|18" },
    ],
  },
  {
    id: "light-4",
    target: "3/5",
    prompt: "Ostatnia fala: znajdź ułamki równe 3/5.",
    hint: "Rozszerzenie 3/5 przez 2 daje 6/10.",
    choices: [
      { id: "light-4-a", label: "6/10", correct: true, fingerprint: "fraction|6|10|round4" },
      { id: "light-4-b", label: "12/20", correct: true, fingerprint: "fraction|12|20" },
      { id: "light-4-c", label: "9/20", correct: false, fingerprint: "fraction|9|20" },
      { id: "light-4-d", label: "15/30", correct: false, fingerprint: "fraction|15|30" },
    ],
  },
];

export function buildFractionLighthouseRounds(): FractionLightRound[] {
  return ROUND_BANK.map((round) => ({ ...round, choices: round.choices.map((choice) => ({ ...choice })) }));
}
