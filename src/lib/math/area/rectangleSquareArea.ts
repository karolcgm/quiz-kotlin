export type RectangleSquareAreaActivity =
  | "area-definition"
  | "area-grid"
  | "area-formulas"
  | "area-calculations"
  | "area-stories";

export interface AreaAnswerField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface AreaTask {
  id: string;
  prompt: string;
  detail?: string;
  shape: "rectangle" | "square";
  illustration?: "garden" | "carpet" | "tiles" | "poster" | "sandbox" | "table" | "plot" | "classroom";
  labels: {
    top?: string;
    side?: string;
    inside?: string;
  };
  answerFields: AreaAnswerField[];
  success: string;
}

export const AREA_CALCULATION_TASKS: AreaTask[] = [
  {
    id: "rectangle-7-5",
    prompt: "Prostokąt ma boki długości 7 cm i 5 cm. Oblicz jego pole.",
    shape: "rectangle",
    labels: { top: "7 cm", side: "5 cm" },
    answerFields: [{ id: "area", label: "Pole prostokąta", unit: "cm²", answer: 35 }],
    success: "7 · 5 = 35, więc pole prostokąta wynosi 35 cm².",
  },
  {
    id: "square-9",
    prompt: "Kwadrat ma bok długości 9 mm. Oblicz jego pole.",
    shape: "square",
    labels: { top: "9 mm", side: "9 mm" },
    answerFields: [{ id: "area", label: "Pole kwadratu", unit: "mm²", answer: 81 }],
    success: "9 · 9 = 81, więc pole kwadratu wynosi 81 mm².",
  },
  {
    id: "rectangle-8-4",
    prompt: "Prostokąt ma długość 8 m i szerokość 4 m. Oblicz jego pole.",
    shape: "rectangle",
    labels: { top: "8 m", side: "4 m" },
    answerFields: [{ id: "area", label: "Pole prostokąta", unit: "m²", answer: 32 }],
    success: "8 · 4 = 32, więc pole prostokąta wynosi 32 m².",
  },
  {
    id: "square-6",
    prompt: "Kwadrat ma bok długości 6 dm. Oblicz jego pole.",
    shape: "square",
    labels: { top: "6 dm", side: "6 dm" },
    answerFields: [{ id: "area", label: "Pole kwadratu", unit: "dm²", answer: 36 }],
    success: "6 · 6 = 36, więc pole kwadratu wynosi 36 dm².",
  },
  {
    id: "rectangle-mixed-5cm-72mm",
    prompt: "Prostokąt ma boki długości 5 cm i 72 mm. Oblicz jego pole w milimetrach kwadratowych.",
    detail: "Najpierw zamień 5 cm na milimetry, aby oba boki były zapisane w tej samej jednostce.",
    shape: "rectangle",
    labels: { top: "5 cm", side: "72 mm" },
    answerFields: [{ id: "area", label: "Pole prostokąta", unit: "mm²", answer: 3600 }],
    success: "5 cm = 50 mm, a 50 · 72 = 3600, więc pole prostokąta wynosi 3600 mm².",
  },
  {
    id: "square-area-9",
    prompt: "Pole kwadratu wynosi 9 cm². Jaką długość ma jego bok?",
    detail: "Znajdź liczbę, która pomnożona przez siebie daje 9.",
    shape: "square",
    labels: { inside: "P = 9 cm²", top: "?", side: "?" },
    answerFields: [{ id: "side", label: "Długość boku", unit: "cm", answer: 3 }],
    success: "3 · 3 = 9, dlatego bok kwadratu ma długość 3 cm.",
  },
  {
    id: "square-area-49",
    prompt: "Pole kwadratu wynosi 49 mm². Jaką długość ma jego bok?",
    shape: "square",
    labels: { inside: "P = 49 mm²", top: "?", side: "?" },
    answerFields: [{ id: "side", label: "Długość boku", unit: "mm", answer: 7 }],
    success: "7 · 7 = 49, dlatego bok kwadratu ma długość 7 mm.",
  },
  {
    id: "rectangle-missing-side",
    prompt: "Pole prostokąta wynosi 48 cm², a jeden bok ma 6 cm. Oblicz długość drugiego boku.",
    shape: "rectangle",
    labels: { inside: "P = 48 cm²", top: "?", side: "6 cm" },
    answerFields: [{ id: "side", label: "Drugi bok", unit: "cm", answer: 8 }],
    success: "6 · 8 = 48, więc drugi bok ma długość 8 cm.",
  },
  {
    id: "rectangle-14-6",
    prompt: "Prostokąt ma boki długości 14 dm i 6 dm. Oblicz jego pole.",
    shape: "rectangle",
    labels: { top: "14 dm", side: "6 dm" },
    answerFields: [{ id: "area", label: "Pole prostokąta", unit: "dm²", answer: 84 }],
    success: "14 · 6 = 84, więc pole prostokąta wynosi 84 dm².",
  },
  {
    id: "square-12",
    prompt: "Kwadrat ma bok długości 12 cm. Oblicz jego pole.",
    shape: "square",
    labels: { top: "12 cm", side: "12 cm" },
    answerFields: [{ id: "area", label: "Pole kwadratu", unit: "cm²", answer: 144 }],
    success: "12 · 12 = 144, więc pole kwadratu wynosi 144 cm².",
  },
];

export const AREA_STORY_TASKS: AreaTask[] = [
  {
    id: "garden",
    prompt: "Szkolny ogródek ma kształt prostokąta o długości 8 m i szerokości 5 m. Jaką powierzchnię zajmuje ogródek?",
    shape: "rectangle",
    illustration: "garden",
    labels: { top: "8 m", side: "5 m" },
    answerFields: [{ id: "area", label: "Pole ogródka", unit: "m²", answer: 40 }],
    success: "Ogródek zajmuje 40 m².",
  },
  {
    id: "carpet",
    prompt: "Do sali kupiono prostokątny dywan długości 2 m i szerokości 150 cm. Jakie pole podłogi przykryje dywan? Wynik podaj w decymetrach kwadratowych.",
    detail: "Przed obliczeniem pola zamień oba wymiary na decymetry.",
    shape: "rectangle",
    illustration: "carpet",
    labels: { top: "2 m", side: "150 cm" },
    answerFields: [{ id: "area", label: "Pole dywanu", unit: "dm²", answer: 300 }],
    success: "2 m = 20 dm i 150 cm = 15 dm. Dywan przykryje 20 · 15 = 300 dm² podłogi.",
  },
  {
    id: "tiles",
    prompt: "Kwadratowa płytka ma bok długości 7 cm. Jakie jest pole jej powierzchni?",
    shape: "square",
    illustration: "tiles",
    labels: { top: "7 cm", side: "7 cm" },
    answerFields: [{ id: "area", label: "Pole płytki", unit: "cm²", answer: 49 }],
    success: "Pole płytki wynosi 49 cm².",
  },
  {
    id: "poster",
    prompt: "Okładka albumu ma kształt prostokąta o wymiarach 3 dm na 24 cm. Ile centymetrów kwadratowych kartonu zajmuje okładka?",
    detail: "Najpierw zapisz oba wymiary w centymetrach.",
    shape: "rectangle",
    illustration: "poster",
    labels: { top: "3 dm", side: "24 cm" },
    answerFields: [{ id: "area", label: "Pole okładki", unit: "cm²", answer: 720 }],
    success: "3 dm = 30 cm, a 30 · 24 = 720, więc pole okładki wynosi 720 cm².",
  },
  {
    id: "sandbox",
    prompt: "Kwadratowa piaskownica ma pole 9 m². Jaką długość ma jeden bok piaskownicy?",
    shape: "square",
    illustration: "sandbox",
    labels: { inside: "P = 9 m²", top: "?", side: "?" },
    answerFields: [{ id: "side", label: "Długość boku", unit: "m", answer: 3 }],
    success: "Bok piaskownicy ma 3 m, ponieważ 3 · 3 = 9.",
  },
  {
    id: "table",
    prompt: "Kwadratowy stolik ma obwód 20 dm. Oblicz długość boku, a następnie pole blatu.",
    detail: "Najpierw podziel obwód przez liczbę boków kwadratu.",
    shape: "square",
    illustration: "table",
    labels: { inside: "Obw = 20 dm", top: "?", side: "?" },
    answerFields: [
      { id: "side", label: "Długość boku", unit: "dm", answer: 5 },
      { id: "area", label: "Pole blatu", unit: "dm²", answer: 25 },
    ],
    success: "Bok ma 5 dm, a pole blatu wynosi 25 dm².",
  },
  {
    id: "plot",
    prompt: "Prostokątna działka ma pole 42 m² i szerokość 6 m. Oblicz jej długość.",
    shape: "rectangle",
    illustration: "plot",
    labels: { inside: "P = 42 m²", top: "?", side: "6 m" },
    answerFields: [{ id: "side", label: "Długość działki", unit: "m", answer: 7 }],
    success: "Długość działki wynosi 7 m, ponieważ 6 · 7 = 42.",
  },
  {
    id: "classroom",
    prompt: "Sala lekcyjna ma 9 m długości i 6 m szerokości. Oblicz pole podłogi oraz obwód sali.",
    detail: "Pole opisuje wnętrze sali, a obwód — długość wszystkich jej ścian.",
    shape: "rectangle",
    illustration: "classroom",
    labels: { top: "9 m", side: "6 m" },
    answerFields: [
      { id: "area", label: "Pole podłogi", unit: "m²", answer: 54 },
      { id: "perimeter", label: "Obwód sali", unit: "m", answer: 30 },
    ],
    success: "Pole podłogi wynosi 54 m², a obwód sali 30 m.",
  },
  {
    id: "stage-floor",
    prompt: "Na szkolny festyn przygotowano prostokątną scenę o długości 12 m i szerokości 7 m. Ile metrów kwadratowych wykładziny potrzeba, aby przykryć całą scenę?",
    shape: "rectangle",
    illustration: "carpet",
    labels: { top: "12 m", side: "7 m" },
    answerFields: [{ id: "area", label: "Pole sceny", unit: "m²", answer: 84 }],
    success: "Wykładzina musi mieć pole 84 m².",
  },
  {
    id: "square-courtyard",
    prompt: "Kwadratowy dziedziniec ma pole 64 m². Oblicz długość jego boku, a potem długość ogrodzenia potrzebnego wokół całego dziedzińca.",
    detail: "Najpierw znajdź liczbę, która pomnożona przez siebie daje 64.",
    shape: "square",
    illustration: "plot",
    labels: { inside: "P = 64 m²", top: "?", side: "?" },
    answerFields: [
      { id: "side", label: "Długość boku", unit: "m", answer: 8 },
      { id: "perimeter", label: "Długość ogrodzenia", unit: "m", answer: 32 },
    ],
    success: "Bok ma 8 m, a ogrodzenie wokół dziedzińca ma długość 32 m.",
  },
];

export function rectangleSquareAreaActivityFromStageId(stageId: string): RectangleSquareAreaActivity {
  if (stageId.endsWith("-s1")) return "area-definition";
  if (stageId.endsWith("-s2")) return "area-grid";
  if (stageId.endsWith("-s3")) return "area-formulas";
  if (stageId.endsWith("-s4")) return "area-calculations";
  return "area-stories";
}
