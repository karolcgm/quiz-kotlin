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
  base: string;
  height: string;
  unit: string;
  answer: number;
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
  { id: "cm-7-4", base: "7", height: "4", unit: "cm", answer: 28, rotation: 0 },
  { id: "mm-9-5", base: "9", height: "5", unit: "mm", answer: 45, rotation: 18 },
  { id: "dm-8-6", base: "8", height: "6", unit: "dm", answer: 48, rotation: -18 },
  { id: "m-12-3", base: "12", height: "3", unit: "m", answer: 36, rotation: 0 },
  { id: "cm-15-7", base: "15", height: "7", unit: "cm", answer: 105, rotation: 28 },
  { id: "mm-11-8", base: "11", height: "8", unit: "mm", answer: 88, rotation: -25 },
  { id: "m-6-9", base: "6", height: "9", unit: "m", answer: 54, rotation: 12 },
  { id: "dm-14-5", base: "14", height: "5", unit: "dm", answer: 70, rotation: -12 },
  { id: "cm-25-4", base: "25", height: "4", unit: "cm", answer: 100, rotation: 22 },
  { id: "m-13-7", base: "13", height: "7", unit: "m", answer: 91, rotation: -22 },
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
