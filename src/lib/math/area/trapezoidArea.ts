export type TrapezoidAreaActivity =
  | "trapezoid-parts"
  | "trapezoid-formula"
  | "trapezoid-calculations"
  | "trapezoid-stories";

export interface TrapezoidAnswerField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface TrapezoidAreaTask {
  id: string;
  prompt: string;
  detail?: string;
  labels: {
    lowerBase?: string;
    upperBase?: string;
    height?: string;
    leftLeg?: string;
    rightLeg?: string;
    center?: string;
  };
  answerFields: TrapezoidAnswerField[];
  hint: string;
  success: string;
}

export const TRAPEZOID_CALCULATION_TASKS: TrapezoidAreaTask[] = [
  {
    id: "bases-12-8-height-5",
    prompt: "Podstawy trapezu mają długości 12 cm i 8 cm, a wysokość 5 cm. Oblicz pole trapezu.",
    labels: { lowerBase: "a = 12 cm", upperBase: "b = 8 cm", height: "h = 5 cm" },
    answerFields: [{ id: "area", label: "Pole trapezu", unit: "cm²", answer: 50 }],
    hint: "Dodaj obie podstawy, pomnóż przez wysokość i podziel wynik przez 2.",
    success: "(12 + 8) · 5 : 2 = 50, więc pole trapezu wynosi 50 cm².",
  },
  {
    id: "bases-18-10-height-7",
    prompt: "Oblicz pole trapezu o podstawach 18 m i 10 m oraz wysokości 7 m.",
    labels: { lowerBase: "a = 18 m", upperBase: "b = 10 m", height: "h = 7 m" },
    answerFields: [{ id: "area", label: "Pole trapezu", unit: "m²", answer: 98 }],
    hint: "Najpierw oblicz sumę podstaw: 18 + 10.",
    success: "(18 + 10) · 7 : 2 = 98, więc pole wynosi 98 m².",
  },
  {
    id: "convert-base-dm",
    prompt: "Dolna podstawa ma 3 dm, górna 12 cm, a wysokość 10 cm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz obie podstawy w centymetrach.",
    labels: { lowerBase: "a = 3 dm", upperBase: "b = 12 cm", height: "h = 10 cm" },
    answerFields: [
      { id: "converted-base", label: "Dolna podstawa po zamianie", unit: "cm", answer: 30 },
      { id: "area", label: "Pole trapezu", unit: "cm²", answer: 210 },
    ],
    hint: "3 dm = 30 cm. Potem oblicz (30 + 12) · 10 i podziel przez 2.",
    success: "3 dm = 30 cm, a (30 + 12) · 10 : 2 = 210 cm².",
  },
  {
    id: "convert-height-mm",
    prompt: "Podstawy mają długości 8 cm i 4 cm. Wysokość ma 30 mm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Zamień wysokość na centymetry przed obliczeniem pola.",
    labels: { lowerBase: "a = 8 cm", upperBase: "b = 4 cm", height: "h = 30 mm" },
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "cm", answer: 3 },
      { id: "area", label: "Pole trapezu", unit: "cm²", answer: 18 },
    ],
    hint: "30 mm = 3 cm. Zastosuj potem długości 8 cm, 4 cm i 3 cm.",
    success: "30 mm = 3 cm, a (8 + 4) · 3 : 2 = 18 cm².",
  },
  {
    id: "missing-height",
    prompt: "Pole trapezu wynosi 72 cm². Jego podstawy mają 16 cm i 8 cm. Oblicz wysokość.",
    labels: { lowerBase: "a = 16 cm", upperBase: "b = 8 cm", height: "h = ?", center: "P = 72 cm²" },
    answerFields: [{ id: "height", label: "Wysokość trapezu", unit: "cm", answer: 6 }],
    hint: "Pomnóż pole przez 2, a potem podziel przez sumę podstaw 16 + 8.",
    success: "2 · 72 : (16 + 8) = 6, więc wysokość ma 6 cm.",
  },
  {
    id: "missing-upper-base",
    prompt: "Pole trapezu wynosi 96 cm². Dolna podstawa ma 10 cm, a wysokość 8 cm. Oblicz długość górnej podstawy.",
    labels: { lowerBase: "a = 10 cm", upperBase: "b = ?", height: "h = 8 cm", center: "P = 96 cm²" },
    answerFields: [{ id: "upper-base", label: "Górna podstawa", unit: "cm", answer: 14 }],
    hint: "Z podwojonego pola podzielonego przez wysokość otrzymasz sumę podstaw. Odejmij 10 cm.",
    success: "2 · 96 : 8 = 24, a 24 − 10 = 14. Górna podstawa ma 14 cm.",
  },
  {
    id: "extra-legs",
    prompt: "Trapez ma podstawy 14 cm i 8 cm, wysokość 6 cm oraz ramiona długości 7 cm i 9 cm. Oblicz pole.",
    detail: "Do wzoru na pole potrzebujesz podstaw i wysokości. Ramiona są dodatkowymi danymi.",
    labels: { lowerBase: "a = 14 cm", upperBase: "b = 8 cm", height: "h = 6 cm", leftLeg: "7 cm", rightLeg: "9 cm" },
    answerFields: [{ id: "area", label: "Pole trapezu", unit: "cm²", answer: 66 }],
    hint: "Nie używaj długości ramion — we wzorze są tylko a, b i h.",
    success: "(14 + 8) · 6 : 2 = 66, więc pole wynosi 66 cm².",
  },
  {
    id: "decimal-bases",
    prompt: "Podstawy trapezu mają długości 2,5 m i 1,5 m, a wysokość 3 m. Oblicz pole.",
    labels: { lowerBase: "a = 2,5 m", upperBase: "b = 1,5 m", height: "h = 3 m" },
    answerFields: [{ id: "area", label: "Pole trapezu", unit: "m²", answer: 6 }],
    hint: "Suma podstaw wynosi 4 m.",
    success: "(2,5 + 1,5) · 3 : 2 = 6, więc pole wynosi 6 m².",
  },
  {
    id: "bases-20-14-height-9",
    prompt: "Oblicz pole trapezu o podstawach 20 dm i 14 dm oraz wysokości 9 dm.",
    labels: { lowerBase: "a = 20 dm", upperBase: "b = 14 dm", height: "h = 9 dm" },
    answerFields: [{ id: "area", label: "Pole trapezu", unit: "dm²", answer: 153 }],
    hint: "Dodaj 20 dm i 14 dm, a otrzymaną sumę wykorzystaj we wzorze.",
    success: "(20 + 14) · 9 : 2 = 153, więc pole wynosi 153 dm².",
  },
  {
    id: "sum-of-bases",
    prompt: "Pole trapezu wynosi 100 cm², a wysokość 8 cm. Oblicz sumę długości jego podstaw.",
    labels: { lowerBase: "a = ?", upperBase: "b = ?", height: "h = 8 cm", center: "P = 100 cm²" },
    answerFields: [{ id: "sum-bases", label: "Suma podstaw a + b", unit: "cm", answer: 25 }],
    hint: "Podwój pole i podziel przez wysokość.",
    success: "2 · 100 : 8 = 25, więc suma długości podstaw wynosi 25 cm.",
  },
];

export const TRAPEZOID_STORY_TASKS: TrapezoidAreaTask[] = [
  {
    id: "garden-bed",
    prompt: "Rabata ma kształt trapezu. Jej podstawy mają długości 6 m i 10 m, a wysokość 4 m. Jaką powierzchnię zajmuje rabata?",
    labels: { lowerBase: "a = 10 m", upperBase: "b = 6 m", height: "h = 4 m" },
    answerFields: [{ id: "area", label: "Pole rabaty", unit: "m²", answer: 32 }],
    hint: "Narysuj szkic, podpisz obie podstawy i wysokość. Potem policz połowę iloczynu sumy podstaw i wysokości.",
    success: "(10 + 6) · 4 : 2 = 32, więc rabata zajmuje 32 m².",
  },
  {
    id: "roof-panel",
    prompt: "Szyba w dachu ma kształt trapezu o podstawach 120 cm i 80 cm oraz wysokości 50 cm. Ile centymetrów kwadratowych szkła potrzeba?",
    labels: { lowerBase: "a = 120 cm", upperBase: "b = 80 cm", height: "h = 50 cm" },
    answerFields: [{ id: "area", label: "Pole szyby", unit: "cm²", answer: 5000 }],
    hint: "Suma podstaw to 200 cm.",
    success: "(120 + 80) · 50 : 2 = 5000, więc potrzeba 5000 cm² szkła.",
  },
  {
    id: "poster-height",
    prompt: "Plakat w kształcie trapezu ma pole 2700 cm². Jego podstawy mają długości 80 cm i 100 cm. Jaka jest wysokość plakatu?",
    labels: { lowerBase: "a = 100 cm", upperBase: "b = 80 cm", height: "h = ?", center: "P = 2700 cm²" },
    answerFields: [{ id: "height", label: "Wysokość plakatu", unit: "cm", answer: 30 }],
    hint: "Pomnóż pole przez 2 i podziel przez sumę podstaw.",
    success: "2 · 2700 : (100 + 80) = 30, więc wysokość plakatu ma 30 cm.",
  },
  {
    id: "path-conversion",
    prompt: "Ścieżka ma kształt trapezu. Jej dłuższa podstawa ma 2 m, krótsza 80 cm, a wysokość 1,5 m. Oblicz jej pole w metrach kwadratowych.",
    detail: "Najpierw zapisz wszystkie długości w metrach.",
    labels: { lowerBase: "a = 2 m", upperBase: "b = 80 cm", height: "h = 1,5 m" },
    answerFields: [
      { id: "converted-base", label: "Krótsza podstawa po zamianie", unit: "m", answer: 0.8 },
      { id: "area", label: "Pole ścieżki", unit: "m²", answer: 2.1 },
    ],
    hint: "80 cm = 0,8 m. Potem wykonaj (2 + 0,8) · 1,5 i podziel przez 2.",
    success: "80 cm = 0,8 m, a (2 + 0,8) · 1,5 : 2 = 2,1 m².",
  },
  {
    id: "wall-tile",
    prompt: "Płytka dekoracyjna ma pole 180 cm² i wysokość 12 cm. Jedna podstawa ma 20 cm. Oblicz drugą podstawę.",
    labels: { lowerBase: "a = 20 cm", upperBase: "b = ?", height: "h = 12 cm", center: "P = 180 cm²" },
    answerFields: [{ id: "upper-base", label: "Druga podstawa", unit: "cm", answer: 10 }],
    hint: "Oblicz najpierw sumę podstaw, a potem odejmij 20 cm.",
    success: "2 · 180 : 12 = 30, a 30 − 20 = 10. Druga podstawa ma 10 cm.",
  },
  {
    id: "sandpit",
    prompt: "Piaskownica ma kształt trapezu o podstawach 3 m i 5 m oraz wysokości 2 m. Ile metrów kwadratowych piasku mieści jej dno?",
    labels: { lowerBase: "a = 5 m", upperBase: "b = 3 m", height: "h = 2 m" },
    answerFields: [{ id: "area", label: "Pole dna", unit: "m²", answer: 8 }],
    hint: "W zadaniu o piaskownicy również liczymy pole trapezu.",
    success: "(5 + 3) · 2 : 2 = 8, więc dno ma pole 8 m².",
  },
];

export function trapezoidAreaActivityFromStageId(stageId: string): TrapezoidAreaActivity {
  if (stageId.endsWith("-s1")) return "trapezoid-parts";
  if (stageId.endsWith("-s2")) return "trapezoid-formula";
  if (stageId.endsWith("-s3")) return "trapezoid-calculations";
  return "trapezoid-stories";
}
