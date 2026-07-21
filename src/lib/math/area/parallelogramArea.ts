export type ParallelogramAreaActivity =
  | "base-height"
  | "area-formula"
  | "area-calculations"
  | "area-stories";

export interface ParallelogramOrientationTask {
  id: string;
  rotation: number;
}

export interface ParallelogramCalculationTask {
  id: string;
  prompt: string;
  detail?: string;
  baseLabel: string;
  heightLabel: string;
  otherSideLabel?: string;
  centerLabel?: string;
  answerFields: {
    id: string;
    label: string;
    unit: string;
    answer: number;
  }[];
  hint: string;
  success: string;
  rotation: number;
}

export interface ParallelogramStoryTask {
  id: string;
  prompt: string;
  answer: number;
  answerLabel: string;
  answerUnit: string;
  baseStamp: string;
  heightStamp: string;
  explanation: string;
}

export const PARALLELOGRAM_ORIENTATION_TASKS: ParallelogramOrientationTask[] = [
  { id: "horizontal", rotation: 0 },
  { id: "tilted-right", rotation: 25 },
  { id: "tilted-left", rotation: -35 },
  { id: "almost-vertical", rotation: 80 },
  { id: "vertical-left", rotation: -75 },
  { id: "turned", rotation: 145 },
];

export const PARALLELOGRAM_CALCULATION_TASKS: ParallelogramCalculationTask[] = [
  {
    id: "area-7-4-cm",
    prompt: "Podstawa ma 7 cm, a odpowiadająca jej wysokość 4 cm. Oblicz pole równoległoboku.",
    baseLabel: "a = 7 cm",
    heightLabel: "hₐ = 4 cm",
    answerFields: [{ id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 28 }],
    hint: "Pomnóż długość podstawy a przez wysokość hₐ.",
    success: "7 · 4 = 28, więc pole wynosi 28 cm².",
    rotation: 0,
  },
  {
    id: "choose-base-with-decoy",
    prompt: "Podano oba boki równoległoboku. Wybierz bok, do którego poprowadzono wysokość, i oblicz pole.",
    detail: "Nie każda podana długość jest potrzebna.",
    baseLabel: "a = 8 cm",
    otherSideLabel: "b = 5 cm",
    heightLabel: "hₐ = 3 cm",
    answerFields: [{ id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 24 }],
    hint: "Wysokość hₐ odpowiada podstawie a. Boku b nie używaj w tym obliczeniu.",
    success: "Wybieramy a = 8 cm. 8 · 3 = 24, więc pole wynosi 24 cm².",
    rotation: 15,
  },
  {
    id: "convert-height-mm-to-cm",
    prompt: "Podstawa ma 6 cm, a odpowiadająca jej wysokość 40 mm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz wysokość w centymetrach.",
    baseLabel: "a = 6 cm",
    heightLabel: "hₐ = 40 mm",
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "cm", answer: 4 },
      { id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 24 },
    ],
    hint: "40 mm = 4 cm. Dopiero potem pomnóż podstawę przez wysokość.",
    success: "40 mm = 4 cm, a 6 · 4 = 24 cm².",
    rotation: -18,
  },
  {
    id: "convert-base-dm-to-cm",
    prompt: "Podstawa ma 3 dm, a wysokość 25 cm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Zapisz obie długości w centymetrach.",
    baseLabel: "a = 3 dm",
    heightLabel: "hₐ = 25 cm",
    answerFields: [
      { id: "converted-base", label: "Podstawa po zamianie", unit: "cm", answer: 30 },
      { id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 750 },
    ],
    hint: "3 dm = 30 cm. Pomnóż 30 cm przez 25 cm.",
    success: "3 dm = 30 cm, a 30 · 25 = 750 cm².",
    rotation: 0,
  },
  {
    id: "decoy-and-conversion",
    prompt: "Równoległobok ma boki 12 cm i 9 cm. Wysokość 70 mm jest opuszczona na bok a. Oblicz pole w centymetrach kwadratowych.",
    detail: "Rozpoznaj właściwą podstawę i zamień wysokość.",
    baseLabel: "a = 12 cm",
    otherSideLabel: "b = 9 cm",
    heightLabel: "hₐ = 70 mm",
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "cm", answer: 7 },
      { id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 84 },
    ],
    hint: "70 mm = 7 cm. Wysokość hₐ łączymy z podstawą a = 12 cm, nie z bokiem b.",
    success: "70 mm = 7 cm, a 12 · 7 = 84 cm².",
    rotation: 24,
  },
  {
    id: "missing-height",
    prompt: "Pole równoległoboku wynosi 54 cm², a podstawa ma 9 cm. Oblicz odpowiadającą jej wysokość.",
    baseLabel: "a = 9 cm",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 54 cm²",
    answerFields: [{ id: "height", label: "Wysokość hₐ", unit: "cm", answer: 6 }],
    hint: "Gdy znasz pole i podstawę, podziel pole przez długość podstawy.",
    success: "54 : 9 = 6, więc wysokość hₐ ma 6 cm.",
    rotation: -12,
  },
  {
    id: "missing-base-with-decoy",
    prompt: "Pole wynosi 72 dm². Wysokość hₐ ma 8 dm, a drugi bok b ma 12 dm. Oblicz długość podstawy a.",
    detail: "Bok b jest informacją dodatkową.",
    baseLabel: "a = ?",
    otherSideLabel: "b = 12 dm",
    heightLabel: "hₐ = 8 dm",
    centerLabel: "P = 72 dm²",
    answerFields: [{ id: "base", label: "Długość podstawy a", unit: "dm", answer: 9 }],
    hint: "Podziel pole przez wysokość hₐ. Nie dziel przez bok b.",
    success: "72 : 8 = 9, więc podstawa a ma 9 dm.",
    rotation: 12,
  },
  {
    id: "area-and-mixed-base",
    prompt: "Pole wynosi 2400 mm², a podstawa ma 6 cm. Oblicz wysokość w milimetrach.",
    detail: "Najpierw zamień podstawę na milimetry.",
    baseLabel: "a = 6 cm",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 2400 mm²",
    answerFields: [
      { id: "converted-base", label: "Podstawa po zamianie", unit: "mm", answer: 60 },
      { id: "height", label: "Wysokość hₐ", unit: "mm", answer: 40 },
    ],
    hint: "6 cm = 60 mm. Następnie wykonaj 2400 : 60.",
    success: "6 cm = 60 mm, a 2400 : 60 = 40 mm.",
    rotation: -25,
  },
  {
    id: "decimal-base-with-decoy",
    prompt: "Podstawa a ma 1,2 m, drugi bok 80 cm, a wysokość hₐ ma 50 cm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Zamień tylko długość wybranej podstawy.",
    baseLabel: "a = 1,2 m",
    otherSideLabel: "b = 80 cm",
    heightLabel: "hₐ = 50 cm",
    answerFields: [
      { id: "converted-base", label: "Podstawa po zamianie", unit: "cm", answer: 120 },
      { id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 6000 },
    ],
    hint: "1,2 m = 120 cm. Wysokość hₐ odpowiada podstawie a, a nie bokowi b.",
    success: "1,2 m = 120 cm, a 120 · 50 = 6000 cm².",
    rotation: 18,
  },
  {
    id: "choose-correct-side-dm",
    prompt: "Boki równoległoboku mają 14 dm i 9 dm. Wysokość hₐ ma 5 dm. Oblicz pole.",
    detail: "Wybierz bok oznaczony tą samą literą co wysokość.",
    baseLabel: "a = 14 dm",
    otherSideLabel: "b = 9 dm",
    heightLabel: "hₐ = 5 dm",
    answerFields: [{ id: "area", label: "Pole równoległoboku", unit: "dm²", answer: 70 }],
    hint: "Do wysokości hₐ wybierz bok a = 14 dm.",
    success: "14 · 5 = 70, więc pole wynosi 70 dm².",
    rotation: -20,
  },
  {
    id: "missing-height-with-two-sides",
    prompt: "Pole równoległoboku wynosi 96 m². Bok a ma 12 m, a bok b 10 m. Oblicz wysokość hₐ.",
    baseLabel: "a = 12 m",
    otherSideLabel: "b = 10 m",
    heightLabel: "hₐ = ?",
    centerLabel: "P = 96 m²",
    answerFields: [{ id: "height", label: "Wysokość hₐ", unit: "m", answer: 8 }],
    hint: "Wysokość hₐ odpowiada bokowi a. Wykonaj 96 : 12.",
    success: "96 : 12 = 8, więc wysokość hₐ ma 8 m.",
    rotation: 20,
  },
  {
    id: "mixed-height-with-decoy",
    prompt: "Podstawa a ma 4 m, bok b ma 350 cm, a wysokość hₐ ma 25 dm. Oblicz pole w metrach kwadratowych.",
    detail: "Zamień wysokość na metry. Bok b nie jest potrzebny.",
    baseLabel: "a = 4 m",
    otherSideLabel: "b = 350 cm",
    heightLabel: "hₐ = 25 dm",
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "m", answer: 2.5 },
      { id: "area", label: "Pole równoległoboku", unit: "m²", answer: 10 },
    ],
    hint: "25 dm = 2,5 m. Następnie pomnóż 4 m przez 2,5 m.",
    success: "25 dm = 2,5 m, a 4 · 2,5 = 10 m².",
    rotation: -15,
  },
];

export const PARALLELOGRAM_STORY_TASKS: ParallelogramStoryTask[] = [
  {
    id: "flower-bed",
    prompt: "Kwietnik ma kształt równoległoboku. Jego podstawa ma 8 m, a wysokość opuszczona na tę podstawę ma 3 m. Oblicz pole kwietnika.",
    answer: 24,
    answerLabel: "Pole kwietnika",
    answerUnit: "m²",
    baseStamp: "a = 8 m",
    heightStamp: "h = 3 m",
    explanation: "8 · 3 = 24, więc pole kwietnika wynosi 24 m².",
  },
  {
    id: "banner",
    prompt: "Dekoracyjny baner w kształcie równoległoboku ma podstawę 12 dm i wysokość 5 dm. Jakie jest jego pole?",
    answer: 60,
    answerLabel: "Pole baneru",
    answerUnit: "dm²",
    baseStamp: "a = 12 dm",
    heightStamp: "h = 5 dm",
    explanation: "12 · 5 = 60, więc pole baneru wynosi 60 dm².",
  },
  {
    id: "mosaic",
    prompt: "Element mozaiki ma kształt równoległoboku o podstawie 15 cm i wysokości 6 cm. Oblicz jego pole.",
    answer: 90,
    answerLabel: "Pole mozaiki",
    answerUnit: "cm²",
    baseStamp: "a = 15 cm",
    heightStamp: "h = 6 cm",
    explanation: "15 · 6 = 90, więc pole mozaiki wynosi 90 cm².",
  },
  {
    id: "missing-height-four",
    prompt: "Jeden bok równoległoboku ma długość 4 cm. Pole równoległoboku wynosi 28 cm². Jaka jest wysokość opuszczona na ten bok?",
    answer: 7,
    answerLabel: "Wysokość równoległoboku",
    answerUnit: "cm",
    baseStamp: "a = 4 cm",
    heightStamp: "h = ?",
    explanation: "28 : 4 = 7, więc wysokość wynosi 7 cm.",
  },
  {
    id: "missing-base",
    prompt: "Pole działki w kształcie równoległoboku wynosi 72 m², a wysokość 8 m. Oblicz długość podstawy.",
    answer: 9,
    answerLabel: "Długość podstawy",
    answerUnit: "m",
    baseStamp: "a = ?",
    heightStamp: "h = 8 m",
    explanation: "72 : 8 = 9, więc podstawa ma długość 9 m.",
  },
  {
    id: "decimal-base",
    prompt: "Mata ma kształt równoległoboku. Jej podstawa ma 3,5 m, a wysokość 4 m. Oblicz pole maty.",
    answer: 14,
    answerLabel: "Pole maty",
    answerUnit: "m²",
    baseStamp: "a = 3,5 m",
    heightStamp: "h = 4 m",
    explanation: "3,5 · 4 = 14, więc pole maty wynosi 14 m².",
  },
  {
    id: "missing-height-dm",
    prompt: "Równoległobok ma pole 96 dm² i podstawę długości 12 dm. Oblicz wysokość opuszczoną na tę podstawę.",
    answer: 8,
    answerLabel: "Wysokość równoległoboku",
    answerUnit: "dm",
    baseStamp: "a = 12 dm",
    heightStamp: "h = ?",
    explanation: "96 : 12 = 8, więc wysokość wynosi 8 dm.",
  },
  {
    id: "solar-panel",
    prompt: "Panel dekoracyjny ma kształt równoległoboku o podstawie 150 cm i wysokości 80 cm. Jakie jest jego pole?",
    answer: 12000,
    answerLabel: "Pole panelu",
    answerUnit: "cm²",
    baseStamp: "a = 150 cm",
    heightStamp: "h = 80 cm",
    explanation: "150 · 80 = 12 000, więc pole panelu wynosi 12 000 cm².",
  },
];

export function parallelogramAreaActivityFromStageId(stageId: string): ParallelogramAreaActivity {
  if (stageId.endsWith("-s1")) return "base-height";
  if (stageId.endsWith("-s2")) return "area-formula";
  if (stageId.endsWith("-s3")) return "area-calculations";
  return "area-stories";
}
