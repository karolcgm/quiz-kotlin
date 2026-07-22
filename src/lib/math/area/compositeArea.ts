export type CompositeAreaActivity =
  | "formula-recap"
  | "guided-split"
  | "grid-practice"
  | "grid-challenge";

export type GridPoint = readonly [number, number];

export interface CompositePart {
  id: string;
  label: string;
  shape: "prostokąt" | "trójkąt" | "trapez" | "równoległobok";
  area: number;
  marker: GridPoint;
}

export interface CompositeCut {
  from: GridPoint;
  to: GridPoint;
}

export interface CompositeAreaTask {
  id: string;
  prompt: string;
  detail?: string;
  polygon: GridPoint[];
  cuts: CompositeCut[];
  parts: CompositePart[];
  total: number;
  hint: string;
  success: string;
}

const cm2 = "cm²";

export const COMPOSITE_GRID_PRACTICE_TASKS: CompositeAreaTask[] = [
  {
    id: "l-shape-two-rectangles",
    prompt: "Podziel figurę na dwa prostokąty. Odczytaj potrzebne długości z kratownicy i oblicz pole całej figury.",
    polygon: [[1, 1], [8, 1], [8, 4], [5, 4], [5, 7], [1, 7]],
    cuts: [{ from: [5, 1], to: [5, 4] }],
    parts: [
      { id: "a", label: "Pole A — prostokąt", shape: "prostokąt", area: 24, marker: [3, 4] },
      { id: "b", label: "Pole B — prostokąt", shape: "prostokąt", area: 9, marker: [6.5, 2.5] },
    ],
    total: 33,
    hint: "Najpierw podziel figurę pionowym odcinkiem. Potem oblicz pola obu prostokątów z liczby kratek.",
    success: `24 ${cm2} + 9 ${cm2} = 33 ${cm2}.`,
  },
  {
    id: "house-rectangle-triangle",
    prompt: "Podziel figurę na prostokąt i trójkąt. Każda kratka ma bok 1 cm.",
    polygon: [[1, 7], [1, 4], [4, 1], [7, 4], [7, 7]],
    cuts: [{ from: [1, 4], to: [7, 4] }],
    parts: [
      { id: "a", label: "Pole A — trójkąt", shape: "trójkąt", area: 9, marker: [4, 3] },
      { id: "b", label: "Pole B — prostokąt", shape: "prostokąt", area: 18, marker: [4, 5.5] },
    ],
    total: 27,
    hint: "Poprowadź odcinek pomiędzy dwoma narożnikami, w których zaczyna się dach.",
    success: `9 ${cm2} + 18 ${cm2} = 27 ${cm2}.`,
  },
  {
    id: "t-shape-two-rectangles",
    prompt: "Podziel figurę w kształcie litery T na dwa prostokąty i oblicz jej pole.",
    polygon: [[3, 1], [7, 1], [7, 4], [9, 4], [9, 7], [1, 7], [1, 4], [3, 4]],
    cuts: [{ from: [3, 4], to: [7, 4] }],
    parts: [
      { id: "a", label: "Pole A — górny prostokąt", shape: "prostokąt", area: 12, marker: [5, 2.5] },
      { id: "b", label: "Pole B — dolny prostokąt", shape: "prostokąt", area: 24, marker: [5, 5.5] },
    ],
    total: 36,
    hint: "Odcinek podziału łączy dwa wewnętrzne narożniki litery T.",
    success: `12 ${cm2} + 24 ${cm2} = 36 ${cm2}.`,
  },
  {
    id: "arrow-rectangle-triangle",
    prompt: "Podziel strzałkę na prostokąt i trójkąt. Oblicz pole całej figury.",
    polygon: [[1, 3], [6, 3], [6, 1], [9, 4], [6, 7], [6, 5], [1, 5]],
    cuts: [{ from: [6, 3], to: [6, 5] }],
    parts: [
      { id: "a", label: "Pole A — prostokąt", shape: "prostokąt", area: 10, marker: [3.5, 4] },
      { id: "b", label: "Pole B — trójkąt", shape: "trójkąt", area: 9, marker: [7, 4] },
    ],
    total: 19,
    hint: "Odcinek podziału jest pionowy i łączy dwa narożniki przy grocie strzałki.",
    success: `10 ${cm2} + 9 ${cm2} = 19 ${cm2}.`,
  },
  {
    id: "step-two-rectangles",
    prompt: "Podziel schodkową figurę na dwa prostokąty. Policz kratki zamiast zgadywać długości.",
    polygon: [[1, 1], [6, 1], [6, 3], [9, 3], [9, 6], [1, 6]],
    cuts: [{ from: [6, 1], to: [6, 3] }],
    parts: [
      { id: "a", label: "Pole A — większy prostokąt", shape: "prostokąt", area: 25, marker: [3.5, 3.5] },
      { id: "b", label: "Pole B — mniejszy prostokąt", shape: "prostokąt", area: 9, marker: [7.5, 4.5] },
    ],
    total: 34,
    hint: "Wystarczy jeden pionowy odcinek między dwoma narożnikami schodka.",
    success: `25 ${cm2} + 9 ${cm2} = 34 ${cm2}.`,
  },
  {
    id: "roof-triangle-trapezoid",
    prompt: "Podziel figurę na trójkąt i trapez. Oblicz jej pole, korzystając z poznanych wzorów.",
    polygon: [[1, 7], [2, 3], [5, 1], [8, 3], [9, 7]],
    cuts: [{ from: [2, 3], to: [8, 3] }],
    parts: [
      { id: "a", label: "Pole A — trójkąt", shape: "trójkąt", area: 6, marker: [5, 2.2] },
      { id: "b", label: "Pole B — trapez", shape: "trapez", area: 28, marker: [5, 5] },
    ],
    total: 34,
    hint: "Podział przebiega poziomo przez dwa narożniki figury. Górna część jest trójkątem, dolna — trapezem.",
    success: `6 ${cm2} + 28 ${cm2} = 34 ${cm2}.`,
  },
];

export const COMPOSITE_GRID_CHALLENGE_TASKS: CompositeAreaTask[] = [
  {
    id: "three-step-rectangles",
    prompt: "Podziel schodki na trzy prostokąty. Wybierz kolejno dwa odcinki podziału, a potem oblicz pola wszystkich części.",
    polygon: [[1, 1], [4, 1], [4, 3], [7, 3], [7, 5], [9, 5], [9, 7], [1, 7]],
    cuts: [
      { from: [1, 3], to: [4, 3] },
      { from: [1, 5], to: [7, 5] },
    ],
    parts: [
      { id: "a", label: "Pole A — górny prostokąt", shape: "prostokąt", area: 6, marker: [2.5, 2] },
      { id: "b", label: "Pole B — środkowy prostokąt", shape: "prostokąt", area: 12, marker: [4, 4] },
      { id: "c", label: "Pole C — dolny prostokąt", shape: "prostokąt", area: 16, marker: [5, 6] },
    ],
    total: 34,
    hint: "Potrzebujesz dwóch poziomych odcinków. Zacznij od krótszego przy górnym schodku.",
    success: `6 ${cm2} + 12 ${cm2} + 16 ${cm2} = 34 ${cm2}.`,
  },
  {
    id: "trapezoid-rectangle",
    prompt: "Podziel figurę na trapez i prostokąt. Odczytaj z kratownicy długości podstaw oraz wysokość trapezu.",
    polygon: [[1, 7], [1, 5], [3, 1], [7, 1], [9, 5], [9, 7]],
    cuts: [{ from: [1, 5], to: [9, 5] }],
    parts: [
      { id: "a", label: "Pole A — trapez", shape: "trapez", area: 24, marker: [5, 3] },
      { id: "b", label: "Pole B — prostokąt", shape: "prostokąt", area: 16, marker: [5, 6] },
    ],
    total: 40,
    hint: "Poziomy odcinek oddziela górny trapez od dolnego prostokąta.",
    success: `24 ${cm2} + 16 ${cm2} = 40 ${cm2}.`,
  },
  {
    id: "rectangle-trapezoid-half",
    prompt: "Podziel figurę na prostokąt i trapez. Jedno z pól będzie miało część dziesiętną — wpisz ją z przecinkiem.",
    polygon: [[1, 7], [1, 2], [5, 2], [8, 5], [8, 7]],
    cuts: [{ from: [5, 2], to: [5, 7] }],
    parts: [
      { id: "a", label: "Pole A — prostokąt", shape: "prostokąt", area: 20, marker: [3, 4.5] },
      { id: "b", label: "Pole B — trapez", shape: "trapez", area: 10.5, marker: [6.5, 5] },
    ],
    total: 30.5,
    hint: "Pionowy odcinek przez narożnik przy górnej krawędzi rozdziela prostokąt i trapez.",
    success: `20 ${cm2} + 10,5 ${cm2} = 30,5 ${cm2}.`,
  },
  {
    id: "rectangle-parallelogram",
    prompt: "Podziel figurę na prostokąt i równoległobok. Odczytaj długości z kratownicy i zsumuj ich pola.",
    polygon: [[1, 3], [5, 3], [8, 1], [8, 5], [5, 7], [1, 7]],
    cuts: [{ from: [5, 3], to: [5, 7] }],
    parts: [
      { id: "a", label: "Pole A — prostokąt", shape: "prostokąt", area: 16, marker: [3, 5] },
      { id: "b", label: "Pole B — równoległobok", shape: "równoległobok", area: 12, marker: [6.5, 4] },
    ],
    total: 28,
    hint: "Pionowy odcinek od wewnętrznego narożnika rozdziela prostokąt i równoległobok.",
    success: `16 ${cm2} + 12 ${cm2} = 28 ${cm2}.`,
  },
];

export function compositeAreaActivityFromStageId(stageId: string): CompositeAreaActivity {
  if (stageId.endsWith("-s1")) return "formula-recap";
  if (stageId.endsWith("-s2")) return "guided-split";
  if (stageId.endsWith("-s3")) return "grid-practice";
  return "grid-challenge";
}
