export type AreaReviewActivity =
  | "formula-sprint"
  | "unit-sprint"
  | "figure-sprint"
  | "story-sprint"
  | "g6-parallelogram-rhombus"
  | "g6-parallelogram-rhombus-stories"
  | "g6-triangle"
  | "g6-triangle-stories"
  | "g6-trapezoid"
  | "g6-trapezoid-stories"
  | "g6-area-review"
  | "g6-area-review-stories";

export type AreaReviewShape =
  | "rectangle"
  | "square"
  | "parallelogram"
  | "triangle"
  | "rhombus-height"
  | "rhombus-diagonals"
  | "trapezoid";

export interface AreaReviewAnswer {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface AreaReviewTask {
  id: string;
  prompt: string;
  detail?: string;
  image?: string;
  shape?: AreaReviewShape;
  labels?: Partial<Record<"a" | "b" | "h" | "e" | "f" | "inside", string>>;
  answers: AreaReviewAnswer[];
  hint: string;
  success: string;
}

export const AREA_REVIEW_FORMULA_TASKS: AreaReviewTask[] = [
  {
    id: "review-rectangle",
    prompt: "Oblicz pole prostokąta.",
    shape: "rectangle",
    labels: { a: "7 cm", b: "6 cm" },
    answers: [{ id: "area", label: "Pole prostokąta", unit: "cm²", answer: 42 }],
    hint: "Pole prostokąta obliczamy, mnożąc długości obu boków.",
    success: "7 · 6 = 42 cm².",
  },
  {
    id: "review-square",
    prompt: "Oblicz pole kwadratu.",
    shape: "square",
    labels: { a: "9 cm" },
    answers: [{ id: "area", label: "Pole kwadratu", unit: "cm²", answer: 81 }],
    hint: "W kwadracie oba potrzebne boki mają tę samą długość.",
    success: "9 · 9 = 81 cm².",
  },
  {
    id: "review-parallelogram",
    prompt: "Oblicz pole równoległoboku. Wybierz podstawę i wysokość, nie długość skośnego boku.",
    shape: "parallelogram",
    labels: { a: "8 cm", b: "7 cm", h: "5 cm" },
    answers: [{ id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 40 }],
    hint: "Do pola równoległoboku potrzebujesz podstawy a i wysokości h.",
    success: "8 · 5 = 40 cm².",
  },
  {
    id: "review-triangle",
    prompt: "Oblicz pole trójkąta.",
    shape: "triangle",
    labels: { a: "14 cm", h: "6 cm" },
    answers: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 42 }],
    hint: "Pomnóż podstawę przez wysokość, a potem podziel wynik przez 2.",
    success: "14 · 6 : 2 = 42 cm².",
  },
  {
    id: "review-rhombus-height",
    prompt: "Oblicz pole rombu, korzystając z podstawy i wysokości.",
    shape: "rhombus-height",
    labels: { a: "9 cm", h: "4 cm" },
    answers: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 36 }],
    hint: "Romb można liczyć jak równoległobok: P = a · h.",
    success: "9 · 4 = 36 cm².",
  },
  {
    id: "review-rhombus-diagonals",
    prompt: "Oblicz pole rombu, korzystając z przekątnych.",
    shape: "rhombus-diagonals",
    labels: { e: "10 cm", f: "6 cm" },
    answers: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 30 }],
    hint: "Pomnóż długości przekątnych, a wynik podziel przez 2.",
    success: "10 · 6 : 2 = 30 cm².",
  },
  {
    id: "review-trapezoid",
    prompt: "Oblicz pole trapezu.",
    shape: "trapezoid",
    labels: { a: "12 cm", b: "6 cm", h: "5 cm" },
    answers: [{ id: "area", label: "Pole trapezu", unit: "cm²", answer: 45 }],
    hint: "Dodaj długości obu podstaw, pomnóż przez wysokość i podziel przez 2.",
    success: "(12 + 6) · 5 : 2 = 45 cm².",
  },
];

export const AREA_REVIEW_UNIT_TASKS: AreaReviewTask[] = [
  {
    id: "review-m2-cm2",
    prompt: "Uzupełnij: 3 m² = … cm².",
    answers: [{ id: "value", label: "Liczba centymetrów kwadratowych", unit: "cm²", answer: 30000 }],
    hint: "1 m = 100 cm, dlatego 1 m² = 10 000 cm².",
    success: "3 m² = 30 000 cm².",
  },
  {
    id: "review-dm2-cm2",
    prompt: "Uzupełnij: 5 dm² = … cm².",
    answers: [{ id: "value", label: "Liczba centymetrów kwadratowych", unit: "cm²", answer: 500 }],
    hint: "1 dm = 10 cm, więc 1 dm² = 100 cm².",
    success: "5 dm² = 500 cm².",
  },
  {
    id: "review-cm2-dm2",
    prompt: "Uzupełnij: 1 800 cm² = … dm².",
    answers: [{ id: "value", label: "Liczba decymetrów kwadratowych", unit: "dm²", answer: 18 }],
    hint: "100 cm² tworzy 1 dm².",
    success: "1 800 cm² = 18 dm².",
  },
  {
    id: "review-ar-m2",
    prompt: "Uzupełnij: 7 a = … m².",
    answers: [{ id: "value", label: "Liczba metrów kwadratowych", unit: "m²", answer: 700 }],
    hint: "1 ar ma pole 100 m².",
    success: "7 a = 700 m².",
  },
  {
    id: "review-ha-ar",
    prompt: "Uzupełnij: 2 ha = … a.",
    answers: [{ id: "value", label: "Liczba arów", unit: "a", answer: 200 }],
    hint: "1 hektar to 100 arów.",
    success: "2 ha = 200 a.",
  },
  {
    id: "review-ar-ha",
    prompt: "Uzupełnij: 350 a = … ha.",
    answers: [{ id: "value", label: "Liczba hektarów", unit: "ha", answer: 3.5 }],
    hint: "100 arów to 1 hektar. W wyniku użyj przecinka.",
    success: "350 a = 3,5 ha.",
  },
  {
    id: "review-km2-m2",
    prompt: "Uzupełnij: 2 km² = … m².",
    answers: [{ id: "value", label: "Liczba metrów kwadratowych", unit: "m²", answer: 2000000 }],
    hint: "1 km = 1 000 m, dlatego 1 km² = 1 000 000 m².",
    success: "2 km² = 2 000 000 m².",
  },
  {
    id: "review-decimal-m2-cm2",
    prompt: "Uzupełnij: 2,4 m² = … cm².",
    answers: [{ id: "value", label: "Liczba centymetrów kwadratowych", unit: "cm²", answer: 24000 }],
    hint: "Najpierw pamiętaj, że 1 m² = 10 000 cm².",
    success: "2,4 m² = 24 000 cm².",
  },
];

export const AREA_REVIEW_FIGURE_TASKS: AreaReviewTask[] = [
  {
    id: "review-triangle-height",
    prompt: "Pole trójkąta wynosi 24 cm², a podstawa ma 8 cm. Oblicz wysokość.",
    shape: "triangle",
    labels: { a: "8 cm", h: "?", inside: "P = 24 cm²" },
    answers: [{ id: "height", label: "Wysokość trójkąta", unit: "cm", answer: 6 }],
    hint: "24 = 8 · h : 2. Sprawdź, jaka wysokość daje pole 24 cm².",
    success: "8 · 6 : 2 = 24, więc h = 6 cm.",
  },
  {
    id: "review-parallelogram-height",
    prompt: "Pole równoległoboku wynosi 45 cm², a podstawa ma 9 cm. Oblicz wysokość.",
    shape: "parallelogram",
    labels: { a: "9 cm", h: "?", inside: "P = 45 cm²" },
    answers: [{ id: "height", label: "Wysokość równoległoboku", unit: "cm", answer: 5 }],
    hint: "W równoległoboku P = a · h.",
    success: "9 · 5 = 45, więc h = 5 cm.",
  },
  {
    id: "review-trapezoid-height",
    prompt: "Pole trapezu wynosi 48 cm². Podstawy mają 10 cm i 6 cm. Oblicz wysokość.",
    shape: "trapezoid",
    labels: { a: "10 cm", b: "6 cm", h: "?", inside: "P = 48 cm²" },
    answers: [{ id: "height", label: "Wysokość trapezu", unit: "cm", answer: 6 }],
    hint: "(10 + 6) · h : 2 = 48.",
    success: "16 · 6 : 2 = 48, więc h = 6 cm.",
  },
  {
    id: "review-rhombus-diagonal",
    prompt: "Pole rombu wynosi 36 cm². Jedna przekątna ma 9 cm. Oblicz długość drugiej przekątnej.",
    shape: "rhombus-diagonals",
    labels: { e: "9 cm", f: "?", inside: "P = 36 cm²" },
    answers: [{ id: "diagonal", label: "Druga przekątna", unit: "cm", answer: 8 }],
    hint: "P = e · f : 2.",
    success: "9 · 8 : 2 = 36, więc druga przekątna ma 8 cm.",
  },
  {
    id: "review-square-perimeter",
    prompt: "Kwadrat ma pole 81 cm². Oblicz długość boku, a potem obwód.",
    shape: "square",
    labels: { a: "?", inside: "P = 81 cm²" },
    answers: [
      { id: "side", label: "Długość boku", unit: "cm", answer: 9 },
      { id: "perimeter", label: "Obwód kwadratu", unit: "cm", answer: 36 },
    ],
    hint: "Najpierw znajdź bok kwadratu, a potem pomnóż go przez 4.",
    success: "Bok ma 9 cm, a obwód wynosi 36 cm.",
  },
  {
    id: "review-rectangle-perimeter-area",
    prompt: "Prostokąt ma obwód 30 cm, a jeden bok 9 cm. Oblicz drugi bok i pole prostokąta.",
    shape: "rectangle",
    labels: { a: "9 cm", b: "?", inside: "Obw = 30 cm" },
    answers: [
      { id: "side", label: "Drugi bok", unit: "cm", answer: 6 },
      { id: "area", label: "Pole prostokąta", unit: "cm²", answer: 54 },
    ],
    hint: "Połowa obwodu wynosi 15 cm, więc drugi bok ma 15 − 9 cm.",
    success: "Drugi bok ma 6 cm, a pole wynosi 9 · 6 = 54 cm².",
  },
];

export const AREA_REVIEW_STORY_TASKS: AreaReviewTask[] = [
  {
    id: "review-story-garden",
    prompt: "Równoległoboczna rabata ma podstawę długości 12 m i wysokość 7 m. Ile metrów kwadratowych ziemi trzeba przygotować?",
    shape: "parallelogram",
    labels: { a: "12 m", h: "7 m" },
    answers: [{ id: "area", label: "Pole rabaty", unit: "m²", answer: 84 }],
    hint: "Wybierz podstawę i wysokość, a nie skośny bok rabaty.",
    success: "Pole rabaty wynosi 84 m².",
  },
  {
    id: "review-story-flag",
    prompt: "Trójkątna flaga ma podstawę długości 14 dm i wysokość 10 dm. Jakie pole materiału zużyto na flagę?",
    shape: "triangle",
    labels: { a: "14 dm", h: "10 dm" },
    answers: [{ id: "area", label: "Pole flagi", unit: "dm²", answer: 70 }],
    hint: "Pole trójkąta to połowa iloczynu podstawy i wysokości.",
    success: "Pole flagi wynosi 70 dm².",
  },
  {
    id: "review-story-rhombus",
    prompt: "Ozdoba ma kształt rombu o przekątnych długości 10 cm i 8 cm. Oblicz pole ozdoby.",
    shape: "rhombus-diagonals",
    labels: { e: "10 cm", f: "8 cm" },
    answers: [{ id: "area", label: "Pole ozdoby", unit: "cm²", answer: 40 }],
    hint: "Wykorzystaj obie przekątne rombu.",
    success: "Pole ozdoby wynosi 40 cm².",
  },
  {
    id: "review-story-trapezoid",
    prompt: "Podłoga sceny ma kształt trapezu o podstawach 15 m i 9 m oraz wysokości 6 m. Ile metrów kwadratowych wykładziny potrzeba?",
    shape: "trapezoid",
    labels: { a: "15 m", b: "9 m", h: "6 m" },
    answers: [{ id: "area", label: "Pole sceny", unit: "m²", answer: 72 }],
    hint: "Zsumuj obie podstawy, pomnóż przez wysokość i podziel przez 2.",
    success: "Potrzeba 72 m² wykładziny.",
  },
  {
    id: "review-story-square",
    prompt: "Kwadratowy plac ma pole 144 m². Oblicz długość boku placu i długość ogrodzenia wokół niego.",
    shape: "square",
    labels: { a: "?", inside: "P = 144 m²" },
    answers: [
      { id: "side", label: "Długość boku", unit: "m", answer: 12 },
      { id: "perimeter", label: "Długość ogrodzenia", unit: "m", answer: 48 },
    ],
    hint: "Najpierw znajdź bok, który pomnożony przez siebie daje 144.",
    success: "Bok placu ma 12 m, a ogrodzenie ma długość 48 m.",
  },
  {
    id: "review-story-conversion",
    prompt: "Prostokątna plansza ma wymiary 2 m i 45 cm. Oblicz jej pole w centymetrach kwadratowych.",
    shape: "rectangle",
    labels: { a: "2 m", b: "45 cm" },
    answers: [{ id: "area", label: "Pole planszy", unit: "cm²", answer: 9000 }],
    hint: "Najpierw zamień 2 m na centymetry.",
    success: "2 m = 200 cm, więc pole planszy wynosi 9 000 cm².",
  },
];

export function areaReviewActivityFromStageId(stageId: string): AreaReviewActivity {
  if (stageId.startsWith("m6-5-2-") && stageId.endsWith("-stories")) return "g6-parallelogram-rhombus-stories";
  if (stageId.startsWith("m6-5-2-")) return "g6-parallelogram-rhombus";
  if (stageId.startsWith("m6-5-3-") && stageId.endsWith("-stories")) return "g6-triangle-stories";
  if (stageId.startsWith("m6-5-3-")) return "g6-triangle";
  if (stageId.startsWith("m6-5-4-") && stageId.endsWith("-stories")) return "g6-trapezoid-stories";
  if (stageId.startsWith("m6-5-4-")) return "g6-trapezoid";
  if (stageId.startsWith("m6-5-5-") && stageId.endsWith("-stories")) return "g6-area-review-stories";
  if (stageId.startsWith("m6-5-5-")) return "g6-area-review";
  if (stageId.endsWith("-s1")) return "formula-sprint";
  if (stageId.endsWith("-s2")) return "unit-sprint";
  if (stageId.endsWith("-s3")) return "figure-sprint";
  return "story-sprint";
}
