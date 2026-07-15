import { normalizeFraction } from "@/lib/math/fractions/fractionMath";
import type { FractionValue } from "@/types/fractions";

export type FractionOperationsTopic = "3.7" | "3.8" | "3.9" | "3.10" | "3.11" | "3.R" | "3.S";
export type FractionOperationsPhase = "visual" | "reasoning" | "context" | "independent";
export type FractionOperationsActivity = `operations-${FractionOperationsTopic}-${FractionOperationsPhase}`;

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
    { expression: "3 × 2/5", prompt: "Trzy porcje po 2/5 pizzy.", expected: { numerator: 6, denominator: 5 }, visual: "pizza", reasoning: ["Powtórz porcję 3 razy", "Pomnóż licznik przez 3", "Mianownik 5 pozostaje rozmiarem części"] },
    { expression: "4 × 3/8", prompt: "Cztery porcje po 3/8 kg karmy.", expected: { numerator: 3, denominator: 2 }, unit: "kg", visual: "pizza", reasoning: ["Połącz 4 z licznikiem 3", "Skróć 12/8 przez 4", "Zapisz 3/2 lub 1 1/2"] },
    { expression: "5 × 1/6", prompt: "Pięć odcinków po 1/6 trasy.", expected: { numerator: 5, denominator: 6 }, visual: "pizza", reasoning: ["Pięć jednakowych szóstych", "5 × 1 trafia do licznika", "Wielkość części nadal wynosi 1/6"] },
    { expression: "6 × 5/8", prompt: "Sześć pojemników po 5/8 l.", expected: { numerator: 15, denominator: 4 }, unit: "l", visual: "pizza", reasoning: ["Skróć 6 i 8 przez 2", "Pomnóż 3 × 5", "Otrzymasz 15/4"] },
    { expression: "2 × 7/9", prompt: "Dwie taśmy po 7/9 m.", expected: { numerator: 14, denominator: 9 }, unit: "m", visual: "pizza", reasoning: ["Dwie porcje po 7 dziewiątych", "2 × 7 = 14", "Mianownik 9 nie zmienia się"] },
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

TASKS["3.R"] = [TASKS["3.7"][0]!, TASKS["3.8"][1]!, TASKS["3.9"][2]!, TASKS["3.10"][1]!, TASKS["3.11"][4]!];
TASKS["3.S"] = [TASKS["3.7"][1]!, TASKS["3.8"][2]!, TASKS["3.9"][3]!, TASKS["3.10"][3]!, TASKS["3.11"][1]!];

export function fractionOperationsTasks(topic: FractionOperationsTopic): readonly FractionOperationsTask[] {
  return TASKS[topic];
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
  return `operations-${topic}-${phase}`;
}

export function isFractionOperationsActivity(value: string): value is FractionOperationsActivity {
  return /^operations-3\.(?:7|8|9|10|11|R|S)-(?:visual|reasoning|context|independent)$/u.test(value);
}
