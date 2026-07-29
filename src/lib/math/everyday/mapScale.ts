export type MapScaleActivity =
  | "scale-guide"
  | "read-scale"
  | "find-scale"
  | "real-distance"
  | "map-distance";

export interface MapScaleTask {
  id: string;
  prompt: string;
  mapCentimeters?: string;
  scaleDenominator?: number;
  realDistance?: string;
  answer: number;
  answerUnit?: "m" | "km" | "cm";
  answerKind: "distance" | "scale";
  hint: string;
}

export const READ_SCALE_TASKS: MapScaleTask[] = [
  {
    id: "read-30000",
    prompt: "Skala mapy wynosi 1 : 30 000. Ilu kilometrom w terenie odpowiada 1 cm na mapie?",
    mapCentimeters: "1",
    scaleDenominator: 30000,
    answer: 0.3,
    answerUnit: "km",
    answerKind: "distance",
    hint: "30 000 cm = 300 m = 0,3 km.",
  },
  {
    id: "read-5000",
    prompt: "Skala planu wynosi 1 : 5000. Ilu metrom odpowiada 1 cm na planie?",
    mapCentimeters: "1",
    scaleDenominator: 5000,
    answer: 50,
    answerUnit: "m",
    answerKind: "distance",
    hint: "Podziel 5000 cm przez 100, aby otrzymać metry.",
  },
  {
    id: "read-50000",
    prompt: "Skala mapy wynosi 1 : 50 000. Ilu kilometrom odpowiada 1 cm?",
    mapCentimeters: "1",
    scaleDenominator: 50000,
    answer: 0.5,
    answerUnit: "km",
    answerKind: "distance",
    hint: "50 000 cm = 500 m = 0,5 km.",
  },
  {
    id: "read-100000",
    prompt: "Skala mapy wynosi 1 : 100 000. Ilu kilometrom odpowiada 1 cm?",
    mapCentimeters: "1",
    scaleDenominator: 100000,
    answer: 1,
    answerUnit: "km",
    answerKind: "distance",
    hint: "100 000 cm to dokładnie 1 km.",
  },
  {
    id: "read-250000",
    prompt: "Skala mapy wynosi 1 : 250 000. Ilu kilometrom odpowiada 1 cm?",
    mapCentimeters: "1",
    scaleDenominator: 250000,
    answer: 2.5,
    answerUnit: "km",
    answerKind: "distance",
    hint: "250 000 cm = 2500 m = 2,5 km.",
  },
  {
    id: "read-2000",
    prompt: "Skala planu wynosi 1 : 2000. Ilu metrom odpowiada 1 cm?",
    mapCentimeters: "1",
    scaleDenominator: 2000,
    answer: 20,
    answerUnit: "m",
    answerKind: "distance",
    hint: "2000 cm = 20 m.",
  },
];

export const FIND_SCALE_TASKS: MapScaleTask[] = [
  {
    id: "find-2km",
    prompt: "Na mapie 1 cm odpowiada 2 km w terenie. Jaka jest skala mapy?",
    mapCentimeters: "1",
    realDistance: "2 km",
    answer: 200000,
    answerKind: "scale",
    hint: "Najpierw zamień 2 km na centymetry: 2 km = 200 000 cm.",
  },
  {
    id: "find-500m",
    prompt: "Na mapie 1 cm odpowiada 500 m w terenie. Jaka jest skala mapy?",
    mapCentimeters: "1",
    realDistance: "500 m",
    answer: 50000,
    answerKind: "scale",
    hint: "500 m = 50 000 cm.",
  },
  {
    id: "find-80m",
    prompt: "Na planie 1 cm odpowiada 80 m. Jaka jest skala planu?",
    mapCentimeters: "1",
    realDistance: "80 m",
    answer: 8000,
    answerKind: "scale",
    hint: "80 m = 8000 cm.",
  },
  {
    id: "find-15km",
    prompt: "Na mapie 1 cm odpowiada 1,5 km. Jaka jest skala mapy?",
    mapCentimeters: "1",
    realDistance: "1,5 km",
    answer: 150000,
    answerKind: "scale",
    hint: "1,5 km = 150 000 cm.",
  },
  {
    id: "find-250m",
    prompt: "Na planie 1 cm odpowiada 250 m. Jaka jest skala planu?",
    mapCentimeters: "1",
    realDistance: "250 m",
    answer: 25000,
    answerKind: "scale",
    hint: "250 m = 25 000 cm.",
  },
];

export const REAL_DISTANCE_TASKS: MapScaleTask[] = [
  {
    id: "real-3cm-50000",
    prompt: "Odległość na mapie wynosi 3 cm. Skala to 1 : 50 000. Oblicz odległość w terenie.",
    mapCentimeters: "3",
    scaleDenominator: 50000,
    answer: 1.5,
    answerUnit: "km",
    answerKind: "distance",
    hint: "Jeden centymetr to 0,5 km, więc trzy centymetry to trzy razy więcej.",
  },
  {
    id: "real-45cm-20000",
    prompt: "Droga na planie ma 4,5 cm. Skala to 1 : 20 000. Ile kilometrów ma w rzeczywistości?",
    mapCentimeters: "4,5",
    scaleDenominator: 20000,
    answer: 0.9,
    answerUnit: "km",
    answerKind: "distance",
    hint: "4,5 · 20 000 cm = 90 000 cm = 0,9 km.",
  },
  {
    id: "real-7cm-5000",
    prompt: "Ścieżka na planie ma 7 cm. Skala to 1 : 5000. Ile metrów ma ścieżka?",
    mapCentimeters: "7",
    scaleDenominator: 5000,
    answer: 350,
    answerUnit: "m",
    answerKind: "distance",
    hint: "Jeden centymetr odpowiada 50 m.",
  },
  {
    id: "real-24cm-25000",
    prompt: "Trasa na mapie ma 2,4 cm. Skala to 1 : 25 000. Ile metrów ma trasa?",
    mapCentimeters: "2,4",
    scaleDenominator: 25000,
    answer: 600,
    answerUnit: "m",
    answerKind: "distance",
    hint: "2,4 · 25 000 cm = 60 000 cm = 600 m.",
  },
  {
    id: "real-8cm-100000",
    prompt: "Rzeka na mapie ma 8 cm. Skala to 1 : 100 000. Ile kilometrów ma zaznaczony odcinek?",
    mapCentimeters: "8",
    scaleDenominator: 100000,
    answer: 8,
    answerUnit: "km",
    answerKind: "distance",
    hint: "W tej skali 1 cm odpowiada 1 km.",
  },
];

export const MAP_DISTANCE_TASKS: MapScaleTask[] = [
  {
    id: "map-6km-200000",
    prompt: "W terenie miejscowości dzieli 6 km. Skala mapy to 1 : 200 000. Ile centymetrów dzieli je na mapie?",
    realDistance: "6 km",
    scaleDenominator: 200000,
    answer: 3,
    answerUnit: "cm",
    answerKind: "distance",
    hint: "W tej skali 1 cm odpowiada 2 km.",
  },
  {
    id: "map-750m-25000",
    prompt: "Aleja ma 750 m. Plan wykonano w skali 1 : 25 000. Jaką długość ma aleja na planie?",
    realDistance: "750 m",
    scaleDenominator: 25000,
    answer: 3,
    answerUnit: "cm",
    answerKind: "distance",
    hint: "W tej skali 1 cm odpowiada 250 m.",
  },
  {
    id: "map-12km-40000",
    prompt: "Trasa ma 1,2 km. Mapa jest w skali 1 : 40 000. Ile centymetrów ma trasa na mapie?",
    realDistance: "1,2 km",
    scaleDenominator: 40000,
    answer: 3,
    answerUnit: "cm",
    answerKind: "distance",
    hint: "1,2 km = 120 000 cm. Podziel przez 40 000.",
  },
  {
    id: "map-24km-80000",
    prompt: "Odległość w terenie wynosi 2,4 km. Skala mapy to 1 : 80 000. Oblicz odległość na mapie.",
    realDistance: "2,4 km",
    scaleDenominator: 80000,
    answer: 3,
    answerUnit: "cm",
    answerKind: "distance",
    hint: "W tej skali 1 cm odpowiada 0,8 km.",
  },
];

export function mapScaleActivityFromStageId(stageId: string): MapScaleActivity {
  if (stageId.includes("scale-guide")) return "scale-guide";
  if (stageId.includes("read-scale")) return "read-scale";
  if (stageId.includes("find-scale")) return "find-scale";
  if (stageId.includes("real-distance")) return "real-distance";
  return "map-distance";
}
