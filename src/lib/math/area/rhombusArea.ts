export type RhombusAreaActivity =
  | "rhombus-shapes"
  | "rhombus-formulas"
  | "rhombus-calculations"
  | "rhombus-stories";

export type RhombusAreaMethod = "base-height" | "diagonals";

export interface RhombusAnswerField {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface RhombusAreaTask {
  id: string;
  prompt: string;
  detail?: string;
  variant: "slanted" | "diamond";
  allowedMethods: RhombusAreaMethod[];
  labels: {
    side?: string;
    height?: string;
    diagonalE?: string;
    diagonalF?: string;
    center?: string;
  };
  answerFields: RhombusAnswerField[];
  hint: string;
  success: string;
}

export const RHOMBUS_CALCULATION_TASKS: RhombusAreaTask[] = [
  {
    id: "base-height-9-4",
    prompt: "Bok rombu ma 9 cm, a wysokość opuszczona na ten bok ma 4 cm. Oblicz pole rombu.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 9 cm", height: "h = 4 cm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 36 }],
    hint: "Podano bok i odpowiadającą mu wysokość. Zastosuj P = a · h.",
    success: "9 · 4 = 36, więc pole rombu wynosi 36 cm².",
  },
  {
    id: "diagonals-10-8",
    prompt: "Przekątne rombu mają długości 10 cm i 8 cm. Oblicz pole rombu.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 10 cm", diagonalF: "f = 8 cm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 40 }],
    hint: "Podano obie przekątne. Pomnóż je i podziel wynik przez 2.",
    success: "10 · 8 : 2 = 40, więc pole rombu wynosi 40 cm².",
  },
  {
    id: "base-height-12-5",
    prompt: "Bok rombu ma 12 dm, a odpowiadająca mu wysokość 5 dm. Oblicz pole.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 12 dm", height: "h = 5 dm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "dm²", answer: 60 }],
    hint: "W tym zadaniu potrzebujesz boku i wysokości.",
    success: "12 · 5 = 60, więc pole rombu wynosi 60 dm².",
  },
  {
    id: "diagonals-14-6",
    prompt: "Romb ma przekątne długości 14 m i 6 m. Jakie jest jego pole?",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 14 m", diagonalF: "f = 6 m" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "m²", answer: 42 }],
    hint: "Zastosuj wzór z przekątnymi.",
    success: "14 · 6 : 2 = 42, więc pole rombu wynosi 42 m².",
  },
  {
    id: "convert-height-mm",
    prompt: "Bok rombu ma 8 cm, a wysokość 30 mm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz wysokość w centymetrach.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 8 cm", height: "h = 30 mm" },
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "cm", answer: 3 },
      { id: "area", label: "Pole rombu", unit: "cm²", answer: 24 },
    ],
    hint: "30 mm = 3 cm. Dopiero potem pomnóż bok przez wysokość.",
    success: "30 mm = 3 cm, a 8 · 3 = 24 cm².",
  },
  {
    id: "convert-diagonal-dm",
    prompt: "Przekątne rombu mają długości 1,2 dm i 8 cm. Oblicz pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz obie przekątne w centymetrach.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 1,2 dm", diagonalF: "f = 8 cm" },
    answerFields: [
      { id: "converted-diagonal", label: "Przekątna e po zamianie", unit: "cm", answer: 12 },
      { id: "area", label: "Pole rombu", unit: "cm²", answer: 48 },
    ],
    hint: "1,2 dm = 12 cm. Następnie wykonaj 12 · 8 : 2.",
    success: "1,2 dm = 12 cm, a 12 · 8 : 2 = 48 cm².",
  },
  {
    id: "missing-height",
    prompt: "Pole rombu wynosi 63 cm², a bok ma 9 cm. Oblicz wysokość rombu.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 9 cm", height: "h = ?", center: "P = 63 cm²" },
    answerFields: [{ id: "height", label: "Wysokość rombu", unit: "cm", answer: 7 }],
    hint: "Podziel pole przez długość boku.",
    success: "63 : 9 = 7, więc wysokość ma 7 cm.",
  },
  {
    id: "missing-diagonal",
    prompt: "Pole rombu wynosi 54 cm², a przekątna e ma 12 cm. Oblicz długość przekątnej f.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 12 cm", diagonalF: "f = ?", center: "P = 54 cm²" },
    answerFields: [{ id: "diagonal", label: "Długość przekątnej f", unit: "cm", answer: 9 }],
    hint: "Najpierw podwój pole, a potem podziel przez znaną przekątną.",
    success: "2 · 54 : 12 = 9, więc przekątna f ma 9 cm.",
  },
  {
    id: "both-methods",
    prompt: "Dla rombu podano a = 10 cm, h = 6 cm, e = 12 cm i f = 10 cm. Oblicz pole wybranym sposobem.",
    detail: "W tym zadaniu oba wzory prowadzą do tego samego wyniku.",
    variant: "slanted",
    allowedMethods: ["base-height", "diagonals"],
    labels: { side: "a = 10 cm", height: "h = 6 cm", diagonalE: "e = 12 cm", diagonalF: "f = 10 cm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 60 }],
    hint: "Możesz wykonać 10 · 6 albo 12 · 10 : 2.",
    success: "10 · 6 = 60 oraz 12 · 10 : 2 = 60. Oba sposoby są poprawne.",
  },
  {
    id: "one-diagonal-decoy",
    prompt: "Bok rombu ma 11 cm, wysokość 7 cm, a jedna z przekątnych 14 cm. Oblicz pole.",
    detail: "Jedna przekątna nie wystarcza do zastosowania wzoru z przekątnymi.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 11 cm", height: "h = 7 cm", diagonalE: "e = 14 cm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 77 }],
    hint: "Masz komplet danych do wzoru P = a · h.",
    success: "11 · 7 = 77, więc pole rombu wynosi 77 cm².",
  },
  {
    id: "diagonals-16-9",
    prompt: "Przekątne rombu mają długości 16 cm i 9 cm. Oblicz pole rombu.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 16 cm", diagonalF: "f = 9 cm" },
    answerFields: [{ id: "area", label: "Pole rombu", unit: "cm²", answer: 72 }],
    hint: "Pomnóż długości przekątnych i podziel przez 2.",
    success: "16 · 9 : 2 = 72, więc pole rombu wynosi 72 cm².",
  },
  {
    id: "missing-diagonal-96",
    prompt: "Pole rombu wynosi 96 dm². Jedna przekątna ma 12 dm. Oblicz drugą przekątną.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 12 dm", diagonalF: "f = ?", center: "P = 96 dm²" },
    answerFields: [{ id: "diagonal", label: "Długość drugiej przekątnej", unit: "dm", answer: 16 }],
    hint: "Podwój pole i podziel przez 12 dm.",
    success: "2 · 96 : 12 = 16, więc druga przekątna ma 16 dm.",
  },
];

export const RHOMBUS_STORY_TASKS: RhombusAreaTask[] = [
  {
    id: "kite-decoration",
    prompt: "Dekoracja w kształcie rombu ma przekątne długości 80 cm i 50 cm. Ile centymetrów kwadratowych papieru potrzeba do jej wykonania?",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 80 cm", diagonalF: "f = 50 cm" },
    answerFields: [{ id: "area", label: "Pole papieru", unit: "cm²", answer: 2000 }],
    hint: "Dekoracja przypomina latawiec, ale jest rombem. Użyj obu przekątnych.",
    success: "80 · 50 : 2 = 2000, więc potrzeba 2000 cm² papieru.",
  },
  {
    id: "flower-bed",
    prompt: "Kwietnik ma kształt rombu. Jego bok ma 6 m, a wysokość opuszczona na ten bok ma 4 m. Jaką powierzchnię zajmuje kwietnik?",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 6 m", height: "h = 4 m" },
    answerFields: [{ id: "area", label: "Pole kwietnika", unit: "m²", answer: 24 }],
    hint: "Podano bok rombu i odpowiadającą mu wysokość.",
    success: "6 · 4 = 24, więc kwietnik zajmuje 24 m².",
  },
  {
    id: "glass-pane",
    prompt: "Szyba w kształcie rombu ma przekątne 1,4 m i 80 cm. Oblicz jej pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz obie przekątne w centymetrach.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 1,4 m", diagonalF: "f = 80 cm" },
    answerFields: [
      { id: "converted-diagonal", label: "Przekątna e po zamianie", unit: "cm", answer: 140 },
      { id: "area", label: "Pole szyby", unit: "cm²", answer: 5600 },
    ],
    hint: "1,4 m = 140 cm. Potem zastosuj wzór z przekątnymi.",
    success: "1,4 m = 140 cm, a 140 · 80 : 2 = 5600 cm².",
  },
  {
    id: "mosaic-height",
    prompt: "Mozaika w kształcie rombu ma pole 45 dm² i bok długości 9 dm. Jaką wysokość ma romb?",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 9 dm", height: "h = ?", center: "P = 45 dm²" },
    answerFields: [{ id: "height", label: "Wysokość rombu", unit: "dm", answer: 5 }],
    hint: "Gdy znasz pole i bok, podziel pole przez bok.",
    success: "45 : 9 = 5, więc wysokość rombu ma 5 dm.",
  },
  {
    id: "badge-diagonal",
    prompt: "Odznaka w kształcie rombu ma pole 30 cm². Jedna przekątna ma 10 cm. Oblicz długość drugiej przekątnej.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 10 cm", diagonalF: "f = ?", center: "P = 30 cm²" },
    answerFields: [{ id: "diagonal", label: "Druga przekątna", unit: "cm", answer: 6 }],
    hint: "Podwój pole, a następnie podziel przez znaną przekątną.",
    success: "2 · 30 : 10 = 6, więc druga przekątna ma 6 cm.",
  },
  {
    id: "fabric-piece",
    prompt: "Naszywka w kształcie rombu ma bok 15 cm i wysokość 8 cm. Ile centymetrów kwadratowych tkaniny zajmuje?",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 15 cm", height: "h = 8 cm" },
    answerFields: [{ id: "area", label: "Pole naszywki", unit: "cm²", answer: 120 }],
    hint: "Wykorzystaj długość boku i wysokość.",
    success: "15 · 8 = 120, więc naszywka zajmuje 120 cm².",
  },
  {
    id: "park-sign",
    prompt: "Tablica ma kształt rombu. Jej przekątne mają 12 dm i 5 dm. Oblicz pole tablicy.",
    variant: "diamond",
    allowedMethods: ["diagonals"],
    labels: { diagonalE: "e = 12 dm", diagonalF: "f = 5 dm" },
    answerFields: [{ id: "area", label: "Pole tablicy", unit: "dm²", answer: 30 }],
    hint: "Zastosuj wzór P = e · f : 2.",
    success: "12 · 5 : 2 = 30, więc pole tablicy wynosi 30 dm².",
  },
  {
    id: "garden-mixed-height",
    prompt: "Rabata w kształcie rombu ma bok 2 m i wysokość 150 cm. Oblicz jej pole w metrach kwadratowych.",
    detail: "Najpierw zapisz wysokość w metrach.",
    variant: "slanted",
    allowedMethods: ["base-height"],
    labels: { side: "a = 2 m", height: "h = 150 cm" },
    answerFields: [
      { id: "converted-height", label: "Wysokość po zamianie", unit: "m", answer: 1.5 },
      { id: "area", label: "Pole rabaty", unit: "m²", answer: 3 },
    ],
    hint: "150 cm = 1,5 m. Następnie pomnóż 2 · 1,5.",
    success: "150 cm = 1,5 m, a 2 · 1,5 = 3 m².",
  },
];

export function rhombusAreaActivityFromStageId(stageId: string): RhombusAreaActivity {
  if (stageId.endsWith("-s1")) return "rhombus-shapes";
  if (stageId.endsWith("-s2")) return "rhombus-formulas";
  if (stageId.endsWith("-s3")) return "rhombus-calculations";
  return "rhombus-stories";
}
