export type CalculatorActivity = "calculator-guide" | "decimal-expansions" | "division-remainders" | "calculator-stories";

export interface CalculatorTask {
  id: string;
  kind: "decimal" | "remainder" | "story";
  title: string;
  prompt: string;
  answer: number;
  unit?: string;
  numerator?: number;
  denominator?: number;
  hint?: string;
  icon?: string;
}

export const DECIMAL_EXPANSION_TASKS: CalculatorTask[] = [
  { id: "decimal-7-8", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 7, denominator: 8, answer: 0.875 },
  { id: "decimal-13-20", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 13, denominator: 20, answer: 0.65 },
  { id: "decimal-5-16", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 5, denominator: 16, answer: 0.3125 },
  { id: "decimal-9-40", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 9, denominator: 40, answer: 0.225 },
  { id: "decimal-37-25", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 37, denominator: 25, answer: 1.48 },
  { id: "decimal-29-50", kind: "decimal", title: "Rozwinięcie dziesiętne", prompt: "Oblicz rozwinięcie dziesiętne ułamka.", numerator: 29, denominator: 50, answer: 0.58 },
];

export const REMAINDER_TASKS: CalculatorTask[] = [
  { id: "remainder-1000037", kind: "remainder", title: "Reszta z dzielenia", prompt: "Oblicz resztę z dzielenia liczby 1 000 037 przez 24.", answer: 5, hint: "Najpierw znajdź całkowity iloraz. Potem oblicz: dzielna − dzielnik · iloraz." },
  { id: "remainder-987654", kind: "remainder", title: "Reszta z dzielenia", prompt: "Oblicz resztę z dzielenia liczby 987 654 przez 37.", answer: 13 },
  { id: "remainder-725031", kind: "remainder", title: "Reszta z dzielenia", prompt: "Oblicz resztę z dzielenia liczby 725 031 przez 48.", answer: 39 },
  { id: "remainder-840125", kind: "remainder", title: "Reszta z dzielenia", prompt: "Oblicz resztę z dzielenia liczby 840 125 przez 64.", answer: 61 },
  { id: "remainder-456789", kind: "remainder", title: "Reszta z dzielenia", prompt: "Oblicz resztę z dzielenia liczby 456 789 przez 125.", answer: 39 },
];

export const CALCULATOR_STORY_TASKS: CalculatorTask[] = [
  {
    id: "story-nuts",
    kind: "story",
    title: "Orzechy na wagę",
    prompt: "Kilogram orzechów kosztuje 48 zł. Ile trzeba zapłacić za 27 dag orzechów?",
    answer: 12.96,
    unit: "zł",
    icon: "🥜",
    hint: "Najpierw zamień 27 dag na 0,27 kg.",
  },
  {
    id: "story-paint",
    kind: "story",
    title: "Farba do ściany",
    prompt: "Ściana ma 4,8 m szerokości i 2,5 m wysokości. Drzwi zajmują 2 m². Jeden litr farby wystarcza na 5 m². Ile litrów farby potrzeba na jednokrotne pomalowanie ściany?",
    answer: 2,
    unit: "l",
    icon: "🎨",
    hint: "Oblicz pole ściany, odejmij pole drzwi, a wynik podziel przez wydajność farby.",
  },
  {
    id: "story-tickets",
    kind: "story",
    title: "Bilety do kina",
    prompt: "Klasa kupuje 18 biletów po 27,50 zł. Ile kosztują wszystkie bilety?",
    answer: 495,
    unit: "zł",
    icon: "🎟️",
  },
  {
    id: "story-fuel",
    kind: "story",
    title: "Tankowanie autokaru",
    prompt: "Do autokaru zatankowano 42,6 l paliwa po 6,75 zł za litr. Ile zapłacono?",
    answer: 287.55,
    unit: "zł",
    icon: "🚌",
  },
  {
    id: "story-fabric",
    kind: "story",
    title: "Materiał na dekorację",
    prompt: "Jeden metr materiału kosztuje 24,80 zł. Kupiono 3,75 m. Ile zapłacono?",
    answer: 93,
    unit: "zł",
    icon: "🧵",
  },
  {
    id: "story-copies",
    kind: "story",
    title: "Kopie na konkurs",
    prompt: "Wydruk jednej strony kosztuje 0,18 zł. Ile kosztuje wydrukowanie 240 stron?",
    answer: 43.2,
    unit: "zł",
    icon: "🖨️",
  },
];

export function calculatorActivityFromStageId(stageId: string): CalculatorActivity {
  if (stageId.includes("calculator-guide")) return "calculator-guide";
  if (stageId.includes("decimal-expansions")) return "decimal-expansions";
  if (stageId.includes("division-remainders")) return "division-remainders";
  return "calculator-stories";
}
