import { normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionValue } from "@/types/fractions";

export type FractionOperationsTopic = "3.7" | "3.8" | "3.9" | "3.10" | "3.11" | "3.R" | "3.S";
export type FractionOperationsLevel = "L1" | "L2" | "L3";
export type FractionOperationsPhase = "visual" | "reasoning" | "context" | "independent";
export type FractionOperationsActivity =
  | `operations-${FractionOperationsTopic}-${FractionOperationsPhase}`
  | `operations-${FractionOperationsTopic}-${FractionOperationsLevel}-${FractionOperationsPhase}`;

export interface FractionOperationsTask {
  expression: string;
  prompt: string;
  expected: FractionValue;
  unit?: string;
  visual: "pizza" | "groups" | "area" | "split" | "measure";
  reasoning: string[];
}

const TASKS: Record<FractionOperationsTopic, readonly FractionOperationsTask[]> = {
  "3.7": [
    { expression: "3 · 2/5", prompt: "Trzy porcje po 2/5 pizzy.", expected: { numerator: 6, denominator: 5 }, visual: "pizza", reasoning: ["Powtórz porcję 3 razy", "Pomnóż licznik przez 3", "Mianownik 5 pozostaje rozmiarem części"] },
    { expression: "4 · 3/8", prompt: "Cztery porcje po 3/8 kg karmy.", expected: { numerator: 3, denominator: 2 }, unit: "kg", visual: "pizza", reasoning: ["Połącz 4 z licznikiem 3", "Skróć 12/8 przez 4", "Zapisz 3/2 lub 1 1/2"] },
    { expression: "5 · 1/6", prompt: "Pięć odcinków po 1/6 trasy.", expected: { numerator: 5, denominator: 6 }, visual: "pizza", reasoning: ["Pięć jednakowych szóstych", "5 · 1 trafia do licznika", "Wielkość części nadal wynosi 1/6"] },
    { expression: "6 · 5/8", prompt: "Sześć pojemników po 5/8 l.", expected: { numerator: 15, denominator: 4 }, unit: "l", visual: "pizza", reasoning: ["Skróć 6 i 8 przez 2", "Pomnóż 3 · 5", "Otrzymasz 15/4"] },
    { expression: "2 · 7/9", prompt: "Dwie taśmy po 7/9 m.", expected: { numerator: 14, denominator: 9 }, unit: "m", visual: "pizza", reasoning: ["Dwie porcje po 7 dziewiątych", "2 · 7 = 14", "Mianownik 9 nie zmienia się"] },
  ],
  "3.8": [
    { expression: "1/3 z 24", prompt: "Podziel 24 elementy na 3 grupy i wybierz jedną.", expected: { numerator: 8, denominator: 1 }, visual: "groups", reasoning: ["Podziel 24 przez mianownik 3", "Wybierz 1 grupę", "24 : 3 × 1 = 8"] },
    { expression: "3/5 z 40", prompt: "Podziel 40 biletów na 5 grup i wybierz 3.", expected: { numerator: 24, denominator: 1 }, visual: "groups", reasoning: ["40 : 5 = 8", "8 × 3 = 24", "Odpowiedź ma jednostkę z zadania"] },
    { expression: "2/3 z 45", prompt: "Oblicz dwie trzecie z 45 uczestników.", expected: { numerator: 30, denominator: 1 }, visual: "groups", reasoning: ["45 : 3 = 15", "15 × 2 = 30", "Sprawdź: wynik jest mniejszy od 45"] },
    { expression: "1/4 z 96", prompt: "Jedna czwarta budżetu 96 zł.", expected: { numerator: 24, denominator: 1 }, unit: "zł", visual: "groups", reasoning: ["96 : 4", "Wybierz jedną część", "Otrzymujesz 24 zł"] },
    { expression: "3/8 z 64", prompt: "Trzy ósme z 64 sadzonek.", expected: { numerator: 24, denominator: 1 }, visual: "groups", reasoning: ["64 : 8 = 8", "8 × 3 = 24", "Kontrola: 24/64 = 3/8"] },
  ],
  "3.9": [
    { expression: "1/2 × 1/3", prompt: "Zaznacz połowę jednej trzeciej pizzy.", expected: { numerator: 1, denominator: 6 }, visual: "area", reasoning: ["Weź część części", "Pomnóż liczniki", "Pomnóż mianowniki"] },
    { expression: "2/3 × 3/5", prompt: "Nałóż dwa podziały pola.", expected: { numerator: 2, denominator: 5 }, visual: "area", reasoning: ["Skróć 3 po skosie", "2 × 1 nad kreską", "1 × 5 pod kreską"] },
    { expression: "3/4 × 2/7", prompt: "Oblicz część zacienionego plakatu.", expected: { numerator: 3, denominator: 14 }, visual: "area", reasoning: ["Skróć 2 i 4 przez 2", "3 × 1", "2 × 7"] },
    { expression: "5/6 × 3/10", prompt: "Skróć po skosie przed mnożeniem.", expected: { numerator: 1, denominator: 4 }, visual: "area", reasoning: ["Skróć 5 z 10", "Skróć 3 z 6", "1 × 1 / 2 × 2"] },
    { expression: "4/9 × 3/8", prompt: "Znajdź dwie pary do skrócenia.", expected: { numerator: 1, denominator: 6 }, visual: "area", reasoning: ["4 z 8 przez 4", "3 z 9 przez 3", "1/6"] },
  ],
  "3.10": [
    { expression: "3/4 : 3", prompt: "Podziel trzy czwarte na 3 równe grupy.", expected: { numerator: 1, denominator: 4 }, visual: "split", reasoning: ["Podziel zaznaczone części na 3 grupy", "Każda grupa dostaje 1/4", "Sprawdź: 3 × 1/4 = 3/4"] },
    { expression: "5/6 : 2", prompt: "Podziel porcję między dwie osoby.", expected: { numerator: 5, denominator: 12 }, visual: "split", reasoning: ["Każdą szóstą podziel na pół", "Powstają dwunaste", "Pięć części pozostaje zaznaczonych"] },
    { expression: "4/5 : 4", prompt: "Cztery piąte podziel na 4 grupy.", expected: { numerator: 1, denominator: 5 }, visual: "split", reasoning: ["Cztery zaznaczone piąte", "Po jednej piątej do grupy", "Kontrola mnożeniem"] },
    { expression: "7/8 : 3", prompt: "Podziel siedem ósmych na trzy równe porcje.", expected: { numerator: 7, denominator: 24 }, visual: "split", reasoning: ["Mianownik pomnóż przez 3", "Licznik pozostaje 7", "Sprawdź mnożeniem przez 3"] },
    { expression: "5/9 : 5", prompt: "Podziel pięć dziewiątych na pięć grup.", expected: { numerator: 1, denominator: 9 }, visual: "split", reasoning: ["Pięć części rozdaj po jednej", "Każda grupa ma 1/9", "5 × 1/9 = 5/9"] },
  ],
  "3.11": [
    { expression: "3/4 : 1/2", prompt: "Ile połówek mieści się w trzech czwartych?", expected: { numerator: 3, denominator: 2 }, visual: "measure", reasoning: ["Odwróć wyłącznie dzielnik", "1/2 zmienia się w 2/1", "3/4 × 2/1 = 3/2"] },
    { expression: "2/3 : 4/5", prompt: "Zamień dzielenie na mnożenie przez odwrotność.", expected: { numerator: 5, denominator: 6 }, visual: "measure", reasoning: ["Dzielnik 4/5 → 5/4", "2/3 × 5/4", "Skróć 2 z 4"] },
    { expression: "5/6 : 10/9", prompt: "Skróć po zamianie działania.", expected: { numerator: 3, denominator: 4 }, visual: "measure", reasoning: ["10/9 → 9/10", "5/6 × 9/10", "Skróć po skosie"] },
    { expression: "7/8 : 7/12", prompt: "Ile porcji 7/12 mieści się w 7/8?", expected: { numerator: 3, denominator: 2 }, visual: "measure", reasoning: ["7/12 → 12/7", "Skróć siódemki", "12/8 = 3/2"] },
    { expression: "4/9 : 2/3", prompt: "Oblicz i skróć wynik.", expected: { numerator: 2, denominator: 3 }, visual: "measure", reasoning: ["2/3 → 3/2", "4/9 × 3/2", "Skróć 4 z 2 i 3 z 9"] },
  ],
  "3.R": [],
  "3.S": [],
};

TASKS["3.R"] = [
  { expression: "7/4", prompt: "Zbuduj ułamek większy od jedności, a potem nazwij liczbę mieszaną 1 3/4.", expected: { numerator: 7, denominator: 4 }, visual: "pizza", reasoning: ["Cztery czwarte tworzą całość", "Pozostają trzy czwarte", "1 3/4 = 7/4"] },
  { expression: "5 : 2", prompt: "Zapisz sprawiedliwy podział pięciu porcji między dwie osoby jako ułamek.", expected: { numerator: 5, denominator: 2 }, visual: "split", reasoning: ["Dzielna trafia do licznika", "Dzielnik trafia do mianownika", "5 : 2 = 5/2"] },
  { expression: "12/18", prompt: "Skróć do postaci nieskracalnej i sprawdź równoważność na modelu.", expected: { numerator: 2, denominator: 3 }, visual: "pizza", reasoning: ["NWD(12, 18) = 6", "Podziel licznik i mianownik przez 6", "Otrzymujesz 2/3"] },
  { expression: "3/4 + 5/6", prompt: "Porównaj mianowniki, wybierz wspólną miarę i dodaj.", expected: { numerator: 19, denominator: 12 }, visual: "area", reasoning: ["NWW(4, 6) = 12", "3/4 = 9/12 i 5/6 = 10/12", "9/12 + 10/12 = 19/12"] },
  { expression: "2/3 × 3/5 : 4/5", prompt: "Wykonaj mnożenie i dzielenie, skracając właściwe pary.", expected: { numerator: 1, denominator: 2 }, visual: "measure", reasoning: ["2/3 × 3/5 = 2/5", "4/5 odwróć na 5/4", "2/5 × 5/4 = 1/2"] },
];
TASKS["3.S"] = [
  { expression: "11/6", prompt: "Zapisz jako ułamek niewłaściwy i podaj odpowiadającą liczbę mieszaną.", expected: { numerator: 11, denominator: 6 }, visual: "pizza", reasoning: ["Jedna całość to 6/6", "Pozostaje 5/6", "11/6 = 1 5/6"] },
  { expression: "15 : 4", prompt: "Zapisz iloraz pionowym ułamkiem i zinterpretuj resztę.", expected: { numerator: 15, denominator: 4 }, visual: "split", reasoning: ["15 jest licznikiem", "4 jest mianownikiem", "15/4 = 3 3/4"] },
  { expression: "5/8 + 7/12", prompt: "Sprowadź do najmniejszego wspólnego mianownika i oblicz.", expected: { numerator: 29, denominator: 24 }, visual: "area", reasoning: ["NWW(8, 12) = 24", "5/8 = 15/24 i 7/12 = 14/24", "Razem 29/24"] },
  { expression: "3/5 z 70", prompt: "Oblicz ułamek liczby i uzasadnij kolejność działań.", expected: { numerator: 42, denominator: 1 }, visual: "groups", reasoning: ["70 : 5 = 14", "14 × 3 = 42", "42/70 = 3/5"] },
  { expression: "7/9 : 14/27", prompt: "Odwróć wyłącznie dzielnik, skróć po skosie i sprawdź mnożeniem.", expected: { numerator: 3, denominator: 2 }, visual: "measure", reasoning: ["14/27 → 27/14", "7/9 × 27/14", "Po skróceniu 3/2"] },
];

const LEVEL_TASKS: Partial<Record<`${FractionOperationsTopic}-${FractionOperationsLevel}`, readonly FractionOperationsTask[]>> = {
  "3.7-L2": [
    { expression: "8 · 3/4", prompt: "Skróć 8 z mianownikiem przed mnożeniem.", expected: { numerator: 6, denominator: 1 }, visual: "pizza", reasoning: ["Skróć 8 i 4 przez 4", "2 · 3 = 6", "Kontrola: osiem porcji po 3/4"] },
    { expression: "12 · 5/18", prompt: "Wybierz największe wygodne skrócenie.", expected: { numerator: 10, denominator: 3 }, visual: "pizza", reasoning: ["Skróć 12 i 18 przez 6", "2 · 5 / 3", "Otrzymujesz 10/3"] },
    { expression: "15 · 7/25", prompt: "Skróć przed mnożeniem i podaj najprostszą postać.", expected: { numerator: 21, denominator: 5 }, visual: "pizza", reasoning: ["Skróć 15 i 25 przez 5", "3 · 7 / 5", "Otrzymujesz 21/5"] },
    { expression: "14 · 9/21", prompt: "Oblicz długość czternastu odcinków taśmy.", expected: { numerator: 6, denominator: 1 }, unit: "m", visual: "pizza", reasoning: ["Skróć 14 i 21 przez 7", "2 · 9 / 3", "Skróć 18/3 do 6"] },
    { expression: "24 · 11/36", prompt: "Zaplanuj skracanie tak, aby mnożyć małe liczby.", expected: { numerator: 22, denominator: 3 }, visual: "pizza", reasoning: ["Skróć 24 i 36 przez 12", "2 · 11 / 3", "Otrzymujesz 22/3"] },
  ],
  "3.8-L2": [
    { expression: "7/12 z 84", prompt: "Najpierw podziel przez 12, potem pomnóż przez 7.", expected: { numerator: 49, denominator: 1 }, visual: "groups", reasoning: ["84 : 12 = 7", "7 × 7 = 49", "49 jest mniejsze od 84"] },
    { expression: "5/9 z 126", prompt: "Oblicz liczbę uczestników w pięciu grupach.", expected: { numerator: 70, denominator: 1 }, visual: "groups", reasoning: ["126 : 9 = 14", "14 × 5 = 70", "Kontrola ułamkiem 70/126"] },
    { expression: "11/15 z 90", prompt: "Wybierz krótszą kolejność działań.", expected: { numerator: 66, denominator: 1 }, visual: "groups", reasoning: ["90 : 15 = 6", "6 × 11 = 66", "Dopisz jednostkę z treści"] },
    { expression: "3/8 z 240", prompt: "Oblicz koszt trzech ósmych budżetu.", expected: { numerator: 90, denominator: 1 }, unit: "zł", visual: "groups", reasoning: ["240 : 8 = 30", "30 × 3 = 90", "Wynik to 90 zł"] },
    { expression: "13/20 z 360", prompt: "Oblicz część dużej liczby i wykonaj kontrolę.", expected: { numerator: 234, denominator: 1 }, visual: "groups", reasoning: ["360 : 20 = 18", "18 × 13 = 234", "234/360 skraca się do 13/20"] },
  ],
  "3.9-L2": [
    { expression: "7/12 × 18/35", prompt: "Znajdź dwie pary do skrócenia po skosie.", expected: { numerator: 3, denominator: 10 }, visual: "area", reasoning: ["7 z 35 skróć przez 7", "18 z 12 skróć przez 6", "1/2 × 3/5 = 3/10"] },
    { expression: "14/15 × 25/28", prompt: "Skróć 14 z 28 i 25 z 15.", expected: { numerator: 5, denominator: 6 }, visual: "area", reasoning: ["14/28 = 1/2", "25/15 = 5/3", "1/2 × 5/3 = 5/6"] },
    { expression: "9/16 × 8/27", prompt: "Podświetl obie przekątne przed mnożeniem.", expected: { numerator: 1, denominator: 6 }, visual: "area", reasoning: ["9 z 27 skróć przez 9", "8 z 16 skróć przez 8", "1/2 × 1/3 = 1/6"] },
    { expression: "21/22 × 33/49", prompt: "Skróć wspólne czynniki bez obliczania dużych iloczynów.", expected: { numerator: 9, denominator: 14 }, visual: "area", reasoning: ["21 z 49 skróć przez 7", "33 z 22 skróć przez 11", "3/2 × 3/7 = 9/14"] },
    { expression: "2 1/3 × 9/14", prompt: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy.", expected: { numerator: 3, denominator: 2 }, visual: "area", reasoning: ["2 1/3 = 7/3", "7/3 × 9/14", "Po skróceniu 3/2"] },
  ],
  "3.10-L2": [
    { expression: "7/9 : 14", prompt: "Zapisz dzielenie jako mnożenie przez 1/14 i skróć.", expected: { numerator: 1, denominator: 18 }, visual: "split", reasoning: ["7/9 × 1/14", "Skróć siódemki", "Otrzymujesz 1/18"] },
    { expression: "15/16 : 5", prompt: "Wybierz, czy wygodniej podzielić licznik, czy pomnożyć mianownik.", expected: { numerator: 3, denominator: 16 }, visual: "split", reasoning: ["15 jest podzielne przez 5", "15 : 5 = 3", "Mianownik zostaje 16"] },
    { expression: "8/21 : 4", prompt: "Podziel licznik przez 4 i sprawdź mnożeniem.", expected: { numerator: 2, denominator: 21 }, visual: "split", reasoning: ["8 : 4 = 2", "Mianownik 21 się nie zmienia", "4 × 2/21 = 8/21"] },
    { expression: "11/12 : 6", prompt: "Utwórz mniejsze części przez zmianę mianownika.", expected: { numerator: 11, denominator: 72 }, visual: "split", reasoning: ["11 nie dzieli się przez 6", "12 × 6 = 72", "Wynik 11/72 jest nieskracalny"] },
    { expression: "18/25 : 9", prompt: "Skróć przed wykonaniem mnożenia przez odwrotność.", expected: { numerator: 2, denominator: 25 }, visual: "split", reasoning: ["18/25 × 1/9", "18 z 9 skróć do 2 i 1", "Otrzymujesz 2/25"] },
  ],
  "3.11-L2": [
    { expression: "5/8 : 15/16", prompt: "Odwróć tylko dzielnik i skróć po skosie.", expected: { numerator: 2, denominator: 3 }, visual: "measure", reasoning: ["15/16 → 16/15", "5/8 × 16/15", "Po skróceniu 2/3"] },
    { expression: "7/12 : 14/9", prompt: "Zaznacz dzielnik, który trzeba odwrócić.", expected: { numerator: 3, denominator: 8 }, visual: "measure", reasoning: ["14/9 → 9/14", "7/12 × 9/14", "Po skróceniu 3/8"] },
    { expression: "21/25 : 14/15", prompt: "Wykonaj dwa skrócenia po zamianie działania.", expected: { numerator: 9, denominator: 10 }, visual: "measure", reasoning: ["14/15 → 15/14", "21/25 × 15/14", "Po skróceniu 9/10"] },
    { expression: "8/9 : 4/27", prompt: "Sprawdź, ile małych miar mieści się w dzielnej.", expected: { numerator: 6, denominator: 1 }, visual: "measure", reasoning: ["4/27 → 27/4", "8/9 × 27/4", "Po skróceniu 6"] },
    { expression: "13/18 : 26/45", prompt: "Skróć duże liczby przed mnożeniem.", expected: { numerator: 5, denominator: 4 }, visual: "measure", reasoning: ["26/45 → 45/26", "13/18 × 45/26", "Po skróceniu 5/4"] },
  ],
  "3.11-L3": [
    { expression: "2 1/4 : 3/5", prompt: "Zamień liczbę mieszaną i oblicz liczbę porcji.", expected: { numerator: 15, denominator: 4 }, visual: "measure", reasoning: ["2 1/4 = 9/4", "3/5 → 5/3", "9/4 × 5/3 = 15/4"] },
    { expression: "3 1/3 : 1 1/9", prompt: "Zamień obie liczby mieszane na ułamki niewłaściwe.", expected: { numerator: 3, denominator: 1 }, visual: "measure", reasoning: ["3 1/3 = 10/3", "1 1/9 = 10/9", "10/3 × 9/10 = 3"] },
    { expression: "1 7/8 : 2 1/2", prompt: "Oblicz i oceń, czy wynik powinien być mniejszy od jedności.", expected: { numerator: 3, denominator: 4 }, visual: "measure", reasoning: ["1 7/8 = 15/8", "2 1/2 = 5/2", "15/8 × 2/5 = 3/4"] },
    { expression: "4 2/5 : 1 1/10", prompt: "Oblicz liczbę równych odcinków.", expected: { numerator: 4, denominator: 1 }, unit: "odcinki", visual: "measure", reasoning: ["4 2/5 = 22/5", "1 1/10 = 11/10", "22/5 × 10/11 = 4"] },
    { expression: "2 5/6 : 1 8/9", prompt: "Rozwiąż zadanie wieloetapowe i podaj postać mieszaną.", expected: { numerator: 3, denominator: 2 }, visual: "measure", reasoning: ["2 5/6 = 17/6", "1 8/9 = 17/9", "17/6 × 9/17 = 3/2"] },
  ],
};

export function fractionOperationsTasks(topic: FractionOperationsTopic, level: FractionOperationsLevel = "L1"): readonly FractionOperationsTask[] {
  return LEVEL_TASKS[`${topic}-${level}`] ?? TASKS[topic];
}

export function expectedFractionOperationsResult(task: FractionOperationsTask): FractionValue {
  const normalized = normalizeFraction(task.expected);
  return { numerator: normalized.numerator, denominator: normalized.denominator };
}

export function fractionOperationsActivityFromStageId(stageId: string): FractionOperationsActivity | null {
  const match = stageId.match(/m5-3-(7|8|9|10|11|r|s)-/iu);
  if (!match) return null;
  const raw = match[1]!.toUpperCase();
  const topic = (raw === "R" || raw === "S" ? `3.${raw}` : `3.${raw}`) as FractionOperationsTopic;
  const phase: FractionOperationsPhase = stageId.includes("independent")
    ? "independent"
    : stageId.includes("context")
      ? "context"
      : stageId.includes("reasoning")
        ? "reasoning"
        : "visual";
  const level: FractionOperationsLevel = stageId.includes("-l3-")
    ? "L3"
    : stageId.includes("-l2-")
      ? "L2"
      : "L1";
  return level === "L1" ? `operations-${topic}-${phase}` : `operations-${topic}-${level}-${phase}`;
}

export function isFractionOperationsActivity(value: string): value is FractionOperationsActivity {
  return /^operations-3\.(?:7|8|9|10|11|R|S)-(?:L[123]-)?(?:visual|reasoning|context|independent)$/u.test(value);
}

export function parseFractionOperationsActivity(activity: FractionOperationsActivity): {
  topic: FractionOperationsTopic;
  level: FractionOperationsLevel;
  phase: FractionOperationsPhase;
} {
  const match = activity.match(/^operations-(3\.(?:7|8|9|10|11|R|S))-(?:(L[123])-)?(visual|reasoning|context|independent)$/u);
  if (!match) throw new Error(`Nieznana aktywność ułamkowa: ${activity}`);
  return {
    topic: match[1] as FractionOperationsTopic,
    level: (match[2] ?? "L1") as FractionOperationsLevel,
    phase: match[3] as FractionOperationsPhase,
  };
}
