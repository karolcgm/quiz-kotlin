export type DecimalReviewActivity =
  | "decimal-review-notation"
  | "decimal-review-compare-units"
  | "decimal-review-add-sub"
  | "decimal-review-multiply-divide"
  | "decimal-review-fraction-percent"
  | "decimal-review-problems";

export type DecimalReviewTask =
  | {
      kind: "numeric";
      prompt: string;
      expression?: string;
      answer: string;
      unit?: string;
      fractionExpression?: {
        decimal: string;
        operator: "+" | "−" | "·" | ":";
        numerator: number;
        denominator: number;
        fractionFirst?: boolean;
      };
    }
  | {
      kind: "choice";
      prompt: string;
      expression?: string;
      choices: readonly string[];
      answer: string;
    }
  | {
      kind: "sign";
      prompt: string;
      left: string;
      right: string;
      answer: "<" | ">" | "=";
    }
  | {
      kind: "fraction";
      prompt: string;
      decimal: string;
      numerator: number;
      denominator: number;
    }
  | {
      kind: "number-line";
      prompt: string;
      target: string;
      points: readonly { label: string; position: number }[];
      answer: string;
    }
  | {
      kind: "story";
      prompt: string;
      story: string;
      illustration: "ribbon" | "apples" | "bottles" | "fabric" | "bags";
      left: string;
      operator: "+" | "−" | "·" | ":";
      right: string;
      answer: string;
      unit: string;
    };

const TASKS: Record<DecimalReviewActivity, readonly DecimalReviewTask[]> = {
  "decimal-review-notation": [
    { kind: "fraction", prompt: "Zamień liczbę dziesiętną na nieskracalny ułamek zwykły.", decimal: "0,375", numerator: 3, denominator: 8 },
    { kind: "choice", prompt: "Zamień ułamek zwykły na liczbę dziesiętną.", expression: "ułamek o liczniku 7 i mianowniku 20", choices: ["0,035", "0,35", "3,5", "0,7"], answer: "0,35" },
    { kind: "number-line", prompt: "Wskaż punkt, który oznacza podaną liczbę.", target: "0,65", points: [{ label: "A", position: 0.15 }, { label: "B", position: 0.4 }, { label: "C", position: 0.65 }, { label: "D", position: 0.9 }], answer: "C" },
    { kind: "choice", prompt: "Jaką wartość ma cyfra 7 w liczbie 42,073?", choices: ["7 jedności", "7 części dziesiątych", "7 części setnych", "7 części tysięcznych"], answer: "7 części setnych" },
    { kind: "choice", prompt: "Wybierz kolejność od najmniejszej do największej.", choices: ["0,508 < 0,58 < 0,805 < 0,85", "0,58 < 0,508 < 0,85 < 0,805", "0,805 < 0,85 < 0,508 < 0,58"], answer: "0,508 < 0,58 < 0,805 < 0,85" },
  ],
  "decimal-review-compare-units": [
    { kind: "sign", prompt: "Wstaw właściwy znak.", left: "10,05", right: "10,5", answer: "<" },
    { kind: "numeric", prompt: "Zamień jednostkę długości.", expression: "2,35 m = … cm", answer: "235", unit: "cm" },
    { kind: "numeric", prompt: "Zamień jednostkę masy.", expression: "0,048 kg = … g", answer: "48", unit: "g" },
    { kind: "numeric", prompt: "Zapisz całą długość w kilometrach.", expression: "3 km 45 m = … km", answer: "3,045", unit: "km" },
    { kind: "sign", prompt: "Porównaj masy. Najpierw zapisz je w tej samej jednostce.", left: "1,25 kg", right: "1240 g", answer: ">" },
  ],
  "decimal-review-add-sub": [
    { kind: "numeric", prompt: "Oblicz.", expression: "7,35 + 2,8", answer: "10,15" },
    { kind: "numeric", prompt: "Oblicz.", expression: "12 − 3,475", answer: "8,525" },
    { kind: "numeric", prompt: "Oblicz.", expression: "0,806 + 4,29", answer: "5,096" },
    { kind: "numeric", prompt: "Oblicz.", expression: "15,2 − 8,735", answer: "6,465" },
    { kind: "choice", prompt: "W obliczeniu 4,8 + 0,75 = 12,3 przecinek ustawiono błędnie. Wybierz poprawny wynik.", choices: ["4,155", "5,55", "12,3", "55,5"], answer: "5,55" },
  ],
  "decimal-review-multiply-divide": [
    { kind: "numeric", prompt: "Oblicz.", expression: "0,047 · 1000", answer: "47" },
    { kind: "numeric", prompt: "Oblicz.", expression: "63,5 : 100", answer: "0,635" },
    { kind: "numeric", prompt: "Oblicz.", expression: "2,35 · 6", answer: "14,1" },
    { kind: "numeric", prompt: "Oblicz. W razie potrzeby dopisz zero po przecinku.", expression: "8,64 : 8", answer: "1,08" },
    { kind: "numeric", prompt: "Oblicz i samodzielnie ustal miejsce przecinka w wyniku.", expression: "1,2 · 0,35", answer: "0,42" },
    { kind: "numeric", prompt: "Przesuń oba przecinki w myśli tak, aby dzielnik był liczbą naturalną. Następnie oblicz.", expression: "7,2 : 0,6", answer: "12" },
  ],
  "decimal-review-fraction-percent": [
    { kind: "numeric", prompt: "Wybierz wygodny zapis i oblicz.", answer: "1", fractionExpression: { numerator: 1, denominator: 4, operator: "+", decimal: "0,75", fractionFirst: true } },
    { kind: "numeric", prompt: "Wybierz wygodny zapis i oblicz.", answer: "1,5", fractionExpression: { numerator: 3, denominator: 5, operator: "·", decimal: "2,5" } },
    { kind: "numeric", prompt: "Wybierz wygodny zapis i oblicz.", answer: "1,6", fractionExpression: { numerator: 3, denominator: 4, operator: ":", decimal: "1,2" } },
    { kind: "choice", prompt: "Co piąty uczeń przyniósł na lekcję linijkę. Jaki procent uczniów to zrobił?", choices: ["5%", "10%", "20%", "25%"], answer: "20%" },
    { kind: "choice", prompt: "Oszacuj iloczyn 3,8 · 2,1 i wskaż poprawny wniosek.", choices: ["Wynik 79,8 ma sens.", "Wynik 7,98 ma sens.", "Wynik musi być mniejszy od 1."], answer: "Wynik 7,98 ma sens." },
  ],
  "decimal-review-problems": [
    { kind: "story", prompt: "Zapisz działanie i odpowiedź.", story: "Wstążkę długości 8,4 m podzielono na 6 równych części. Jaką długość ma jedna część?", illustration: "ribbon", left: "8,4", operator: ":", right: "6", answer: "1,4", unit: "m" },
    { kind: "story", prompt: "Zapisz działanie i odpowiedź.", story: "W jednej skrzynce jest 2,75 kg jabłek, a w drugiej 1,8 kg. Ile ważą jabłka razem?", illustration: "apples", left: "2,75", operator: "+", right: "1,8", answer: "4,55", unit: "kg" },
    { kind: "story", prompt: "Zapisz działanie i odpowiedź.", story: "Do 12 butelek wlano po 0,75 l soku. Ile litrów soku wlano łącznie?", illustration: "bottles", left: "12", operator: "·", right: "0,75", answer: "9", unit: "l" },
    { kind: "story", prompt: "Zapisz działanie i odpowiedź.", story: "Z rolki zawierającej 15 m materiału odcięto 3,85 m. Ile materiału zostało?", illustration: "fabric", left: "15", operator: "−", right: "3,85", answer: "11,15", unit: "m" },
    { kind: "story", prompt: "Zapisz działanie i odpowiedź.", story: "4,8 kg kaszy rozdzielono do opakowań po 0,6 kg. Ile pełnych opakowań przygotowano?", illustration: "bags", left: "4,8", operator: ":", right: "0,6", answer: "8", unit: "opakowań" },
  ],
};

export const DECIMAL_REVIEW_ACTIVITIES = Object.keys(TASKS) as DecimalReviewActivity[];

export function isDecimalReviewActivity(activity: string): activity is DecimalReviewActivity {
  return DECIMAL_REVIEW_ACTIVITIES.includes(activity as DecimalReviewActivity);
}

export function createDecimalReviewTask(activity: DecimalReviewActivity, seed: number): DecimalReviewTask {
  if (!Number.isSafeInteger(seed) || seed < 0) throw new Error("Seed powtórzenia musi być nieujemną liczbą całkowitą.");
  const tasks = TASKS[activity];
  return tasks[seed % tasks.length]!;
}

export function decimalReviewTaskCount(activity: DecimalReviewActivity): number {
  return TASKS[activity].length;
}
