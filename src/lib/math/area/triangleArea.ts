export type TriangleAreaActivity =
  | "base-height"
  | "area-formula"
  | "area-calculations"
  | "area-stories";

export type TriangleShape = "acute" | "obtuse" | "right";

export interface TriangleOrientationTask {
  id: string;
  shape: TriangleShape;
  rotation: number;
}

export interface TriangleAnswerField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface TriangleAreaTask {
  id: string;
  prompt: string;
  detail?: string;
  shape: TriangleShape;
  rotation: number;
  baseLabel: string;
  heightLabel: string;
  otherSideLabels?: string[];
  centerLabel?: string;
  answerFields: TriangleAnswerField[];
  hint: string;
  success: string;
}

export interface TriangleStoryTask {
  id: string;
  prompt: string;
  shape: TriangleShape;
  answer: number;
  answerLabel: string;
  answerUnit: string;
  baseStamp: string;
  heightStamp: string;
  explanation: string;
}

export const TRIANGLE_ORIENTATION_TASKS: TriangleOrientationTask[] = [
  { id: "acute-horizontal", shape: "acute", rotation: 0 },
  { id: "acute-right", shape: "acute", rotation: 28 },
  { id: "right-tilted", shape: "right", rotation: -20 },
  { id: "obtuse-horizontal", shape: "obtuse", rotation: 0 },
  { id: "acute-left", shape: "acute", rotation: -37 },
  { id: "right-turned", shape: "right", rotation: 42 },
];

export const TRIANGLE_CALCULATION_TASKS: TriangleAreaTask[] = [
  {
    id: "area-10-6",
    prompt: "Podstawa trójkąta ma 10 cm, a odpowiadająca jej wysokość 6 cm. Oblicz pole trójkąta.",
    shape: "acute",
    rotation: 0,
    baseLabel: "a = 10 cm",
    heightLabel: "hₐ = 6 cm",
    answerFields: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 30 }],
    hint: "Pomnóż podstawę przez wysokość, a wynik podziel przez 2.",
    success: "10 · 6 : 2 = 30, więc pole trójkąta wynosi 30 cm².",
  },
  {
    id: "choose-base-with-decoys",
    prompt: "Podano wszystkie trzy boki trójkąta. Wybierz bok, do którego poprowadzono wysokość, i oblicz pole.",
    detail: "Nie każda podana długość jest potrzebna.",
    shape: "obtuse",
    rotation: 0,
    baseLabel: "a = 12 cm",
    heightLabel: "hₐ = 5 cm",
    otherSideLabels: ["b = 9 cm", "c = 11 cm"],
    answerFields: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 30 }],
    hint: "Wysokość hₐ odpowiada podstawie a. Użyj 12 cm i 5 cm.",
    success: "12 · 5 : 2 = 30, więc pole trójkąta wynosi 30 cm².",
  },
  {
    id: "convert-height-mm",
    prompt: "Podstawa trójkąta ma 8 cm, a wysokość 40 mm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz wysokość w centymetrach.",
    shape: "right",
    rotation: -18,
    baseLabel: "a = 8 cm",
    heightLabel: "hₐ = 40 mm",
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "cm", answer: 4 },
      { id: "area", label: "Pole trójkąta", unit: "cm²", answer: 16 },
    ],
    hint: "40 mm = 4 cm. Potem wykonaj 8 · 4 : 2.",
    success: "40 mm = 4 cm, a 8 · 4 : 2 = 16 cm².",
  },
  {
    id: "convert-base-dm",
    prompt: "Podstawa trójkąta ma 3 dm, a wysokość 20 cm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Zapisz obie długości w centymetrach.",
    shape: "acute",
    rotation: 14,
    baseLabel: "a = 3 dm",
    heightLabel: "hₐ = 20 cm",
    answerFields: [
      { id: "converted-base", label: "Podstawa po zamianie", unit: "cm", answer: 30 },
      { id: "area", label: "Pole trójkąta", unit: "cm²", answer: 300 },
    ],
    hint: "3 dm = 30 cm. Potem wykonaj 30 · 20 : 2.",
    success: "3 dm = 30 cm, a 30 · 20 : 2 = 300 cm².",
  },
  {
    id: "missing-height",
    prompt: "Pole trójkąta wynosi 42 cm², a podstawa ma 12 cm. Oblicz wysokość opuszczoną na tę podstawę.",
    shape: "obtuse",
    rotation: 0,
    baseLabel: "a = 12 cm",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 42 cm²",
    answerFields: [{ id: "height", label: "Wysokość hₐ", unit: "cm", answer: 7 }],
    hint: "Pomnóż pole przez 2, a potem podziel przez długość podstawy.",
    success: "2 · 42 : 12 = 7, więc wysokość hₐ ma 7 cm.",
  },
  {
    id: "missing-base",
    prompt: "Pole trójkąta wynosi 60 dm², a wysokość hₐ ma 8 dm. Oblicz długość podstawy a.",
    shape: "acute",
    rotation: -22,
    baseLabel: "a = ?",
    heightLabel: "hₐ = 8 dm",
    otherSideLabels: ["b = 12 dm"],
    centerLabel: "P = 60 dm²",
    answerFields: [{ id: "base", label: "Długość podstawy a", unit: "dm", answer: 15 }],
    hint: "Pomnóż pole przez 2, a potem podziel przez wysokość hₐ.",
    success: "2 · 60 : 8 = 15, więc podstawa a ma 15 dm.",
  },
  {
    id: "mixed-height-m",
    prompt: "Podstawa trójkąta ma 2 m, a wysokość 150 cm. Oblicz pole w metrach kwadratowych.",
    detail: "Najpierw zapisz wysokość w metrach.",
    shape: "right",
    rotation: 16,
    baseLabel: "a = 2 m",
    heightLabel: "hₐ = 150 cm",
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "m", answer: 1.5 },
      { id: "area", label: "Pole trójkąta", unit: "m²", answer: 1.5 },
    ],
    hint: "150 cm = 1,5 m. Potem wykonaj 2 · 1,5 : 2.",
    success: "150 cm = 1,5 m, a 2 · 1,5 : 2 = 1,5 m².",
  },
  {
    id: "choose-height-with-two-sides",
    prompt: "Trójkąt ma boki a = 14 dm, b = 9 dm i c = 11 dm. Wysokość hₐ ma 5 dm. Oblicz pole.",
    shape: "acute",
    rotation: 31,
    baseLabel: "a = 14 dm",
    heightLabel: "hₐ = 5 dm",
    otherSideLabels: ["b = 9 dm", "c = 11 dm"],
    answerFields: [{ id: "area", label: "Pole trójkąta", unit: "dm²", answer: 35 }],
    hint: "Do wysokości hₐ wybierz bok a = 14 dm.",
    success: "14 · 5 : 2 = 35, więc pole wynosi 35 dm².",
  },
  {
    id: "area-mixed-mm",
    prompt: "Pole trójkąta wynosi 1800 mm², a podstawa ma 6 cm. Oblicz wysokość w milimetrach.",
    detail: "Najpierw zapisz podstawę w milimetrach.",
    shape: "obtuse",
    rotation: 0,
    baseLabel: "a = 6 cm",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 1800 mm²",
    answerFields: [
      { id: "converted-base", label: "Podstawa po zamianie", unit: "mm", answer: 60 },
      { id: "height", label: "Wysokość hₐ", unit: "mm", answer: 60 },
    ],
    hint: "6 cm = 60 mm. Wykonaj 2 · 1800 : 60.",
    success: "6 cm = 60 mm, a 2 · 1800 : 60 = 60 mm.",
  },
  {
    id: "area-18-9",
    prompt: "Podstawa trójkąta ma 18 cm, a wysokość 9 cm. Oblicz pole.",
    shape: "right",
    rotation: -36,
    baseLabel: "a = 18 cm",
    heightLabel: "hₐ = 9 cm",
    answerFields: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 81 }],
    hint: "Zastosuj P = a · h : 2.",
    success: "18 · 9 : 2 = 81, więc pole wynosi 81 cm².",
  },
  {
    id: "missing-height-decimal",
    prompt: "Pole trójkąta wynosi 48 m², a podstawa ma 1,2 m. Oblicz wysokość w metrach.",
    shape: "acute",
    rotation: 20,
    baseLabel: "a = 1,2 m",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 48 m²",
    answerFields: [{ id: "height", label: "Wysokość hₐ", unit: "m", answer: 80 }],
    hint: "Wykonaj 2 · 48 : 1,2.",
    success: "2 · 48 : 1,2 = 80, więc wysokość hₐ ma 80 m.",
  },
  {
    id: "base-25-height-12",
    prompt: "Podstawa trójkąta ma 25 cm, a odpowiadająca jej wysokość 12 cm. Oblicz pole.",
    shape: "obtuse",
    rotation: 0,
    baseLabel: "a = 25 cm",
    heightLabel: "hₐ = 12 cm",
    otherSideLabels: ["b = 17 cm"],
    answerFields: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 150 }],
    hint: "Bok b nie jest potrzebny. Użyj podstawy a i wysokości hₐ.",
    success: "25 · 12 : 2 = 150, więc pole wynosi 150 cm².",
  },
];

export const TRIANGLE_STORY_TASKS: TriangleStoryTask[] = [
  {
    id: "garden-bed",
    prompt: "Rabata ma kształt trójkąta. Jej podstawa ma 8 m, a wysokość opuszczona na tę podstawę ma 6 m. Jaką powierzchnię zajmuje rabata?",
    shape: "acute",
    answer: 24,
    answerLabel: "Pole rabaty",
    answerUnit: "m²",
    baseStamp: "a = 8 m",
    heightStamp: "h = 6 m",
    explanation: "8 · 6 : 2 = 24, więc rabata zajmuje 24 m².",
  },
  {
    id: "festival-flag",
    prompt: "Trójkątna flaga ma podstawę 12 dm i wysokość 5 dm. Ile decymetrów kwadratowych materiału potrzeba do jej uszycia?",
    shape: "right",
    answer: 30,
    answerLabel: "Pole flagi",
    answerUnit: "dm²",
    baseStamp: "a = 12 dm",
    heightStamp: "h = 5 dm",
    explanation: "12 · 5 : 2 = 30, więc potrzeba 30 dm² materiału.",
  },
  {
    id: "roof-panel",
    prompt: "Trójkątny panel dachu ma pole 45 m² i podstawę długości 10 m. Jaką wysokość ma panel?",
    shape: "obtuse",
    answer: 9,
    answerLabel: "Wysokość panelu",
    answerUnit: "m",
    baseStamp: "a = 10 m",
    heightStamp: "h = ?",
    explanation: "2 · 45 : 10 = 9, więc wysokość panelu ma 9 m.",
  },
  {
    id: "paper-kite",
    prompt: "Wycinanka w kształcie trójkąta ma podstawę 1,5 m i wysokość 80 cm. Oblicz jej pole w metrach kwadratowych.",
    shape: "acute",
    answer: 0.6,
    answerLabel: "Pole wycinanki",
    answerUnit: "m²",
    baseStamp: "a = 1,5 m",
    heightStamp: "h = 80 cm",
    explanation: "80 cm = 0,8 m. 1,5 · 0,8 : 2 = 0,6, więc pole wynosi 0,6 m².",
  },
  {
    id: "mosaic-tile",
    prompt: "Trójkątny element mozaiki ma pole 1200 cm² i wysokość 80 cm. Oblicz długość jego podstawy.",
    shape: "right",
    answer: 30,
    answerLabel: "Długość podstawy",
    answerUnit: "cm",
    baseStamp: "a = ?",
    heightStamp: "h = 80 cm",
    explanation: "2 · 1200 : 80 = 30, więc podstawa ma 30 cm.",
  },
  {
    id: "sand-pit",
    prompt: "Piaskownica ma kształt trójkąta. Jej podstawa ma 9 m, a wysokość 4 m. Ile metrów kwadratowych piasku zajmuje jej powierzchnia?",
    shape: "acute",
    answer: 18,
    answerLabel: "Pole piaskownicy",
    answerUnit: "m²",
    baseStamp: "a = 9 m",
    heightStamp: "h = 4 m",
    explanation: "9 · 4 : 2 = 18, więc piaskownica zajmuje 18 m².",
  },
  {
    id: "sail",
    prompt: "Żagiel ma kształt trójkąta o polu 36 m² i wysokości 6 m. Jaką długość ma jego podstawa?",
    shape: "obtuse",
    answer: 12,
    answerLabel: "Długość podstawy",
    answerUnit: "m",
    baseStamp: "a = ?",
    heightStamp: "h = 6 m",
    explanation: "2 · 36 : 6 = 12, więc podstawa żagla ma 12 m.",
  },
  {
    id: "signboard",
    prompt: "Trójkątna tablica ma podstawę 60 cm i wysokość 25 cm. Oblicz jej pole.",
    shape: "right",
    answer: 750,
    answerLabel: "Pole tablicy",
    answerUnit: "cm²",
    baseStamp: "a = 60 cm",
    heightStamp: "h = 25 cm",
    explanation: "60 · 25 : 2 = 750, więc pole tablicy wynosi 750 cm².",
  },
];

export function triangleAreaActivityFromStageId(stageId: string): TriangleAreaActivity {
  if (stageId.endsWith("-s1")) return "base-height";
  if (stageId.endsWith("-s2")) return "area-formula";
  if (stageId.endsWith("-s3")) return "area-calculations";
  return "area-stories";
}
