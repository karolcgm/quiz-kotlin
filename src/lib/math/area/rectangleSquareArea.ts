export type RectangleSquareAreaActivity =
  | "area-definition"
  | "area-grid"
  | "area-formulas"
  | "area-calculations"
  | "area-stories"
  | "grade6-review"
  | "grade6-units"
  | "grade6-calculations"
  | "grade6-composite"
  | "grade6-stories";

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
  storyImage?: {
    src: string;
    alt: string;
  };
  labels: {
    top?: string;
    side?: string;
    inside?: string;
  };
  answerFields: AreaAnswerField[];
  success: string;
}

export interface CompositeRectangleTask {
  id: string;
  prompt: string;
  detail: string;
  polygon: string;
  labels: Array<{ x: number; y: number; text: string }>;
  parts: Array<{ x: number; y: number; width: number; height: number }>;
  answerFields: AreaAnswerField[];
  success: string;
}

export const GRADE6_AREA_CALCULATION_TASKS: AreaTask[] = [
  {
    id: "g6-mixed-24m-75cm",
    prompt: "Prostokąt ma boki długości 2,4 m i 75 cm. Oblicz jego pole w centymetrach kwadratowych.",
    detail: "Najpierw zapisz oba wymiary w centymetrach.",
    shape: "rectangle",
    labels: { top: "2,4 m", side: "75 cm" },
    answerFields: [
      { id: "converted", label: "2,4 m =", unit: "cm", answer: 240 },
      { id: "area", label: "Pole", unit: "cm²", answer: 18000 },
    ],
    success: "2,4 m = 240 cm, a 240 · 75 = 18 000 cm².",
  },
  {
    id: "g6-missing-side",
    prompt: "Pole prostokąta wynosi 3,6 dm², a jeden bok ma 24 cm. Oblicz długość drugiego boku w centymetrach.",
    detail: "Najpierw zamień decymetry kwadratowe na centymetry kwadratowe.",
    shape: "rectangle",
    labels: { inside: "P = 3,6 dm²", side: "24 cm", top: "?" },
    answerFields: [
      { id: "converted", label: "Pole po zamianie", unit: "cm²", answer: 360 },
      { id: "side", label: "Drugi bok", unit: "cm", answer: 15 },
    ],
    success: "3,6 dm² = 360 cm², a 360 : 24 = 15 cm.",
  },
  {
    id: "g6-perimeter-to-area",
    prompt: "Obwód prostokąta wynosi 5,6 m. Jeden bok ma 1,8 m. Oblicz długość drugiego boku i pole prostokąta.",
    shape: "rectangle",
    labels: { inside: "Obw = 5,6 m", top: "1,8 m", side: "?" },
    answerFields: [
      { id: "side", label: "Drugi bok", unit: "m", answer: 1 },
      { id: "area", label: "Pole", unit: "m²", answer: 1.8 },
    ],
    success: "Połowa obwodu to 2,8 m. Drugi bok ma 1 m, więc pole wynosi 1,8 m².",
  },
  {
    id: "g6-square-area",
    prompt: "Pole kwadratu wynosi 2,25 m². Oblicz długość boku i obwód kwadratu.",
    shape: "square",
    labels: { inside: "P = 2,25 m²", top: "?", side: "?" },
    answerFields: [
      { id: "side", label: "Bok", unit: "m", answer: 1.5 },
      { id: "perimeter", label: "Obwód", unit: "m", answer: 6 },
    ],
    success: "1,5 · 1,5 = 2,25, a 4 · 1,5 = 6.",
  },
  {
    id: "g6-area-to-mm",
    prompt: "Prostokąt ma wymiary 0,8 dm i 45 mm. Oblicz jego pole w milimetrach kwadratowych.",
    shape: "rectangle",
    labels: { top: "0,8 dm", side: "45 mm" },
    answerFields: [
      { id: "converted", label: "0,8 dm =", unit: "mm", answer: 80 },
      { id: "area", label: "Pole", unit: "mm²", answer: 3600 },
    ],
    success: "0,8 dm = 80 mm, a 80 · 45 = 3600 mm².",
  },
  {
    id: "g6-equal-area",
    prompt: "Prostokąt o bokach 18 cm i 8 cm ma takie samo pole jak kwadrat. Oblicz długość boku kwadratu.",
    shape: "rectangle",
    labels: { top: "18 cm", side: "8 cm", inside: "pole równe polu kwadratu" },
    answerFields: [
      { id: "area", label: "Pole prostokąta", unit: "cm²", answer: 144 },
      { id: "side", label: "Bok kwadratu", unit: "cm", answer: 12 },
    ],
    success: "18 · 8 = 144 cm², a 12 · 12 = 144 cm².",
  },
];

export const GRADE6_COMPOSITE_RECTANGLE_TASKS: CompositeRectangleTask[] = [
  {
    id: "g6-l-shape-1",
    prompt: "Podziel figurę na dwa prostokąty i oblicz jej pole.",
    detail: "Wszystkie podane długości są w centymetrach.",
    polygon: "70,40 390,40 390,150 250,150 250,230 70,230",
    parts: [{ x: 70, y: 40, width: 320, height: 110 }, { x: 70, y: 150, width: 180, height: 80 }],
    labels: [{ x: 230, y: 25, text: "16 cm" }, { x: 410, y: 100, text: "5,5 cm" }, { x: 160, y: 250, text: "9 cm" }, { x: 265, y: 198, text: "4 cm" }],
    answerFields: [
      { id: "part1", label: "Pole pierwszego prostokąta", unit: "cm²", answer: 88 },
      { id: "part2", label: "Pole drugiego prostokąta", unit: "cm²", answer: 36 },
      { id: "area", label: "Pole figury", unit: "cm²", answer: 124 },
    ],
    success: "88 cm² + 36 cm² = 124 cm².",
  },
  {
    id: "g6-frame",
    prompt: "Z dużego prostokąta wycięto prostokątny fragment. Oblicz pole pozostałej figury.",
    detail: "Odejmij pole wycięcia od pola całego prostokąta.",
    polygon: "60,35 420,35 420,225 60,225",
    parts: [{ x: 60, y: 35, width: 360, height: 190 }, { x: 240, y: 110, width: 180, height: 115 }],
    labels: [{ x: 240, y: 22, text: "18 cm" }, { x: 38, y: 135, text: "9,5 cm" }, { x: 330, y: 100, text: "9 cm" }, { x: 225, y: 172, text: "5 cm" }],
    answerFields: [
      { id: "whole", label: "Pole całego prostokąta", unit: "cm²", answer: 171 },
      { id: "cut", label: "Pole wycięcia", unit: "cm²", answer: 45 },
      { id: "area", label: "Pole pozostałej figury", unit: "cm²", answer: 126 },
    ],
    success: "171 cm² − 45 cm² = 126 cm².",
  },
  {
    id: "g6-step-shape",
    prompt: "Oblicz pole schodkowej figury. Wybierz wygodny podział na prostokąty.",
    detail: "Jedna kratka pomocnicza odpowiada 1 cm.",
    polygon: "70,35 370,35 370,95 310,95 310,155 250,155 250,215 70,215",
    parts: [{ x: 70, y: 35, width: 180, height: 180 }, { x: 250, y: 35, width: 60, height: 120 }, { x: 310, y: 35, width: 60, height: 60 }],
    labels: [{ x: 220, y: 22, text: "15 cm" }, { x: 48, y: 125, text: "9 cm" }, { x: 280, y: 175, text: "3 cm" }, { x: 340, y: 115, text: "3 cm" }],
    answerFields: [
      { id: "part1", label: "Pole części 1", unit: "cm²", answer: 81 },
      { id: "part2", label: "Pole części 2", unit: "cm²", answer: 18 },
      { id: "part3", label: "Pole części 3", unit: "cm²", answer: 9 },
      { id: "area", label: "Pole figury", unit: "cm²", answer: 108 },
    ],
    success: "81 cm² + 18 cm² + 9 cm² = 108 cm².",
  },
];

export const GRADE6_AREA_STORY_TASKS: AreaTask[] = [
  {
    id: "g6-wall",
    prompt: "Ściana ma 4,8 m długości i 2,5 m wysokości. Okno zajmuje 18 000 cm². Ile metrów kwadratowych ściany trzeba pomalować?",
    detail: "Oblicz pole ściany i zamień pole okna na metry kwadratowe.",
    shape: "rectangle",
    illustration: "classroom",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-classroom.png", alt: "Ściana sali z prostokątnym oknem" },
    labels: { top: "4,8 m", side: "2,5 m", inside: "okno: 18 000 cm²" },
    answerFields: [
      { id: "wall", label: "Pole całej ściany", unit: "m²", answer: 12 },
      { id: "window", label: "Pole okna", unit: "m²", answer: 1.8 },
      { id: "paint", label: "Pole do pomalowania", unit: "m²", answer: 10.2 },
    ],
    success: "12 m² − 1,8 m² = 10,2 m².",
  },
  {
    id: "g6-path",
    prompt: "Kwadratowy dziedziniec ma bok 14 m. Wzdłuż dwóch sąsiednich boków ułożono pas płyt o szerokości 2 m. Oblicz pole pasa.",
    shape: "square",
    illustration: "plot",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-courtyard.png", alt: "Kwadratowy dziedziniec z pasem płyt przy dwóch bokach" },
    labels: { top: "14 m", side: "14 m", inside: "pas: 2 m" },
    answerFields: [
      { id: "outer", label: "Pole dziedzińca", unit: "m²", answer: 196 },
      { id: "inner", label: "Pole bez pasa", unit: "m²", answer: 144 },
      { id: "area", label: "Pole pasa", unit: "m²", answer: 52 },
    ],
    success: "14 · 14 − 12 · 12 = 52 m².",
  },
  {
    id: "g6-banner",
    prompt: "Baner ma wymiary 2,5 m na 80 cm. Jeden metr kwadratowy materiału kosztuje 24 zł. Ile kosztuje materiał na baner?",
    shape: "rectangle",
    illustration: "poster",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-stage.png", alt: "Prostokątny baner przygotowany na szkolną scenę" },
    labels: { top: "2,5 m", side: "80 cm" },
    answerFields: [
      { id: "converted", label: "80 cm =", unit: "m", answer: 0.8 },
      { id: "area", label: "Pole baneru", unit: "m²", answer: 2 },
      { id: "cost", label: "Koszt materiału", unit: "zł", answer: 48 },
    ],
    success: "2,5 · 0,8 = 2 m², a 2 · 24 zł = 48 zł.",
  },
  {
    id: "g6-room-strip",
    prompt: "Podłoga ma wymiary 6 m na 4,5 m. Pod szafami pozostanie pas o wymiarach 4,5 m na 60 cm. Ile metrów kwadratowych paneli trzeba kupić?",
    shape: "rectangle",
    illustration: "carpet",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-carpet.png", alt: "Prostokątna podłoga sali i pas zajęty przez szafy" },
    labels: { top: "6 m", side: "4,5 m", inside: "pas: 4,5 m × 60 cm" },
    answerFields: [
      { id: "floor", label: "Pole podłogi", unit: "m²", answer: 27 },
      { id: "strip", label: "Pole pasa", unit: "m²", answer: 2.7 },
      { id: "panels", label: "Pole paneli", unit: "m²", answer: 24.3 },
    ],
    success: "27 m² − 2,7 m² = 24,3 m².",
  },
];

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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-garden.png", alt: "Prostokątny szkolny ogródek z warzywami" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-carpet.png", alt: "Prostokątny kolorowy dywan w sali lekcyjnej" },
    labels: { top: "2 m", side: "150 cm" },
    answerFields: [{ id: "area", label: "Pole dywanu", unit: "dm²", answer: 300 }],
    success: "2 m = 20 dm i 150 cm = 15 dm. Dywan przykryje 20 · 15 = 300 dm² podłogi.",
  },
  {
    id: "tiles",
    prompt: "Kwadratowa płytka ma bok długości 7 cm. Jakie jest pole jej powierzchni?",
    shape: "square",
    illustration: "tiles",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-tile.png", alt: "Kwadratowa płytka na stole plastycznym" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-album.png", alt: "Prostokątna okładka albumu na stole plastycznym" },
    labels: { top: "3 dm", side: "24 cm" },
    answerFields: [{ id: "area", label: "Pole okładki", unit: "cm²", answer: 720 }],
    success: "3 dm = 30 cm, a 30 · 24 = 720, więc pole okładki wynosi 720 cm².",
  },
  {
    id: "sandbox",
    prompt: "Kwadratowa piaskownica ma pole 9 m². Jaką długość ma jeden bok piaskownicy?",
    shape: "square",
    illustration: "sandbox",
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-sandbox.png", alt: "Kwadratowa piaskownica na szkolnym placu zabaw" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-table.png", alt: "Kwadratowy drewniany stolik w sali" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-plot.png", alt: "Prostokątna działka wyznaczona palikami" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-classroom.png", alt: "Prostokątna podłoga pustej sali lekcyjnej" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-stage.png", alt: "Prostokątna scena na szkolny festyn" },
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
    storyImage: { src: "/lessons/illustrations/area/rectangle-square/story-courtyard.png", alt: "Kwadratowy szkolny dziedziniec otoczony ogrodzeniem" },
    labels: { inside: "P = 64 m²", top: "?", side: "?" },
    answerFields: [
      { id: "side", label: "Długość boku", unit: "m", answer: 8 },
      { id: "perimeter", label: "Długość ogrodzenia", unit: "m", answer: 32 },
    ],
    success: "Bok ma 8 m, a ogrodzenie wokół dziedzińca ma długość 32 m.",
  },
];

export function rectangleSquareAreaActivityFromStageId(stageId: string): RectangleSquareAreaActivity {
  if (stageId.includes("m6-5-1")) {
    if (stageId.endsWith("-review")) return "grade6-review";
    if (stageId.endsWith("-units")) return "grade6-units";
    if (stageId.endsWith("-calculations")) return "grade6-calculations";
    if (stageId.endsWith("-composite")) return "grade6-composite";
    return "grade6-stories";
  }
  if (stageId.endsWith("-s1")) return "area-definition";
  if (stageId.endsWith("-s2")) return "area-grid";
  if (stageId.endsWith("-s3")) return "area-formulas";
  if (stageId.endsWith("-s4")) return "area-calculations";
  return "area-stories";
}
