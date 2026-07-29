export type PlaneFiguresReviewActivity = "lengths" | "angles" | "challenge";

export interface PlaneFiguresReviewAnswer {
  id: string;
  label: string;
  unit: string;
  answer: number;
}

export interface PlaneFiguresReviewTask {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  story: string;
  answers: PlaneFiguresReviewAnswer[];
  hint: string;
  success: string;
}

export const PLANE_FIGURES_REVIEW_LENGTH_TASKS: PlaneFiguresReviewTask[] = [
  {
    id: "garden-fence",
    imageSrc: "/images/lessons/plane-figures-review/garden-fence.webp",
    imageAlt: "Prostokątny park otoczony ogrodzeniem z pozostawionym wejściem",
    title: "Ogrodzenie parku",
    story: "Prostokątny park ma długość 48 m i szerokość 27 m. W ogrodzeniu pozostawiono bramę szerokości 3 m. Ile metrów ogrodzenia trzeba ustawić?",
    answers: [{ id: "length", label: "Długość ogrodzenia", unit: "m", answer: 147 }],
    hint: "Najpierw oblicz obwód prostokąta, a potem odejmij szerokość bramy.",
    success: "Obwód parku to 150 m. Po odjęciu bramy potrzeba 147 m ogrodzenia.",
  },
  {
    id: "triangle-banner",
    imageSrc: "/images/lessons/plane-figures-review/triangle-banner.webp",
    imageAlt: "Trójkątny proporczyk przygotowany do obszycia lamówką",
    title: "Lamówka do proporczyka",
    story: "Trójkątny proporczyk ma boki długości 37 cm, 28 cm i 45 cm. Ile centymetrów lamówki potrzeba do obszycia całego brzegu?",
    answers: [{ id: "perimeter", label: "Długość lamówki", unit: "cm", answer: 110 }],
    hint: "Dodaj długości wszystkich trzech boków.",
    success: "37 + 28 + 45 = 110, więc potrzeba 110 cm lamówki.",
  },
  {
    id: "trapezoid-flowerbed",
    imageSrc: "/images/lessons/plane-figures-review/trapezoid-flowerbed.webp",
    imageAlt: "Rabata kwiatowa w kształcie trapezu równoramiennego",
    title: "Obrzeże rabaty",
    story: "Rabata ma kształt trapezu równoramiennego. Jej podstawy mają 26 m i 14 m, a każde ramię ma 9 m. Ile metrów obrzeża potrzeba?",
    answers: [{ id: "perimeter", label: "Długość obrzeża", unit: "m", answer: 58 }],
    hint: "Obwód to suma długości obu podstaw i obu ramion.",
    success: "26 + 14 + 9 + 9 = 58 m.",
  },
  {
    id: "wheel-diameter",
    imageSrc: "/images/lessons/plane-figures-review/wheel-diameter.webp",
    imageAlt: "Koło roweru z wyraźnie widocznym środkiem",
    title: "Koło roweru",
    story: "Promień koła roweru ma 34 cm. Jaką długość ma średnica tego koła?",
    answers: [{ id: "diameter", label: "Długość średnicy", unit: "cm", answer: 68 }],
    hint: "Średnica składa się z dwóch promieni.",
    success: "2 · 34 = 68 cm.",
  },
  {
    id: "circles-distance",
    imageSrc: "/images/lessons/plane-figures-review/circles-distance.webp",
    imageAlt: "Dwa okrągłe klomby mające jeden punkt wspólny",
    title: "Dwa okrągłe klomby",
    story: "Dwa okręgi mają jeden punkt wspólny i leżą obok siebie. Ich promienie mają 7 m i 11 m. Jaka jest odległość między środkami okręgów?",
    answers: [{ id: "distance", label: "Odległość między środkami", unit: "m", answer: 18 }],
    hint: "Odcinek łączący środki przechodzi przez punkt wspólny i składa się z dwóch promieni.",
    success: "7 + 11 = 18 m.",
  },
  {
    id: "square-side",
    imageSrc: "/images/lessons/plane-figures-review/square-side.webp",
    imageAlt: "Kwadratowy dziedziniec szkolny widziany z góry",
    title: "Kwadratowy dziedziniec",
    story: "Obwód kwadratowego dziedzińca wynosi 84 m. Jaką długość ma jeden bok dziedzińca?",
    answers: [{ id: "side", label: "Długość boku", unit: "m", answer: 21 }],
    hint: "Kwadrat ma cztery boki tej samej długości.",
    success: "84 : 4 = 21 m.",
  },
];

export const PLANE_FIGURES_REVIEW_ANGLE_TASKS: PlaneFiguresReviewTask[] = [
  {
    id: "roof-exterior",
    imageSrc: "/images/lessons/plane-figures-review/roof-exterior.webp",
    imageAlt: "Trójkątny dach altany z przedłużoną linią podstawy",
    title: "Dach altany",
    story: "Przy prawym końcu podstawy trójkątnego dachu zaznaczono kąt zewnętrzny 128°. Lewy kąt wewnętrzny ma 47°. Oblicz miarę kąta przy wierzchołku dachu.",
    answers: [{ id: "angle", label: "Kąt przy wierzchołku", unit: "°", answer: 81 }],
    hint: "Kąt wewnętrzny przy podstawie ma 180° − 128°. Potem użyj sumy kątów trójkąta.",
    success: "Kąt przy prawej podstawie ma 52°, więc trzeci kąt ma 81°.",
  },
  {
    id: "parallelogram-sign",
    imageSrc: "/images/lessons/plane-figures-review/parallelogram-sign.webp",
    imageAlt: "Szyld w kształcie równoległoboku z przedłużonym bokiem",
    title: "Szyld w kształcie równoległoboku",
    story: "Przy jednym boku szyldu zaznaczono kąt zewnętrzny 118°. Oblicz miarę kąta wewnętrznego przyległego do niego oraz kąta przeciwległego.",
    answers: [
      { id: "inside", label: "Kąt wewnętrzny", unit: "°", answer: 62 },
      { id: "opposite", label: "Kąt przeciwległy", unit: "°", answer: 62 },
    ],
    hint: "Kąt zewnętrzny i wewnętrzny są przyległe. Kąty przeciwległe równoległoboku są równe.",
    success: "180° − 118° = 62°. Kąt przeciwległy także ma 62°.",
  },
  {
    id: "isosceles-trapezoid-window",
    imageSrc: "/images/lessons/plane-figures-review/isosceles-trapezoid-window.webp",
    imageAlt: "Okno w kształcie trapezu równoramiennego",
    title: "Okno w kształcie trapezu",
    story: "Okno ma kształt trapezu równoramiennego. Jeden z kątów przy krótszej podstawie ma 104°. Oblicz miarę kąta przy dłuższej podstawie, leżącego przy tym samym ramieniu.",
    answers: [{ id: "angle", label: "Kąt przy dłuższej podstawie", unit: "°", answer: 76 }],
    hint: "Kąty przy tym samym ramieniu trapezu mają razem 180°.",
    success: "180° − 104° = 76°.",
  },
  {
    id: "crossed-streets",
    imageSrc: "/images/lessons/plane-figures-review/crossed-streets.webp",
    imageAlt: "Dwie alejki parkowe przecinające się pod kątem",
    title: "Skrzyżowanie alejek",
    story: "Dwie proste alejki przecinają się. Jeden z kątów ma 73°. Oblicz miarę kąta wierzchołkowego leżącego naprzeciwko.",
    answers: [{ id: "angle", label: "Kąt wierzchołkowy", unit: "°", answer: 73 }],
    hint: "Kąty wierzchołkowe mają równe miary.",
    success: "Kąt wierzchołkowy ma 73°.",
  },
  {
    id: "parallel-streets",
    imageSrc: "/images/lessons/plane-figures-review/parallel-streets.webp",
    imageAlt: "Dwie równoległe ulice przecięte ukośną drogą",
    title: "Dwie równoległe ulice",
    story: "Dwie równoległe ulice przecięto jedną drogą. Jeden z kątów odpowiadających ma 116°. Oblicz miarę kąta przyległego do niego.",
    answers: [{ id: "angle", label: "Kąt przyległy", unit: "°", answer: 64 }],
    hint: "Najpierw wykorzystaj równość kątów odpowiadających, potem sumę kątów przyległych.",
    success: "180° − 116° = 64°.",
  },
];

export const PLANE_FIGURES_REVIEW_CHALLENGE_TASKS: PlaneFiguresReviewTask[] = [
  {
    id: "bridge-triangle",
    imageSrc: "/images/lessons/plane-figures-review/bridge-triangle.webp",
    imageAlt: "Równoramienna trójkątna rama mostu",
    title: "Trójkątna rama mostu",
    story: "Równoramienna rama ma obwód 64 m, a jej podstawa ma 18 m. Jaką długość ma każde z dwóch ramion?",
    answers: [{ id: "leg", label: "Długość jednego ramienia", unit: "m", answer: 23 }],
    hint: "Odejmij podstawę od obwodu, a pozostałą długość podziel na dwa równe ramiona.",
    success: "(64 − 18) : 2 = 23 m.",
  },
  {
    id: "kite-diagonals",
    imageSrc: "/images/lessons/plane-figures-review/kite-diagonals.webp",
    imageAlt: "Rombowa ozdoba z dwiema przekątnymi przecinającymi się w środku",
    title: "Rombowa ozdoba",
    story: "Przekątne rombowej ozdoby przecinają się w połowie. Jedna przekątna ma 26 cm, a druga 18 cm. Jaką długość mają ich cztery części od punktu przecięcia do wierzchołków?",
    answers: [
      { id: "half-long", label: "Połowa dłuższej przekątnej", unit: "cm", answer: 13 },
      { id: "half-short", label: "Połowa krótszej przekątnej", unit: "cm", answer: 9 },
    ],
    hint: "Każdą przekątną podziel osobno przez 2.",
    success: "Połowy przekątnych mają 13 cm i 9 cm.",
  },
  {
    id: "triangle-possibility",
    imageSrc: "/images/lessons/plane-figures-review/triangle-possibility.webp",
    imageAlt: "Trzy drewniane listwy przygotowane do budowy trójkątnej ramy",
    title: "Listwy do trójkątnej ramy",
    story: "Do wykonania ramy przygotowano listwy długości 8 cm, 13 cm i 21 cm. O ile centymetrów trzeba wydłużyć najkrótszą listwę, aby można było zbudować trójkąt?",
    answers: [{ id: "extension", label: "Najmniejsze wydłużenie o całe centymetry", unit: "cm", answer: 1 }],
    hint: "Suma dwóch krótszych boków musi być większa od trzeciego, a nie tylko mu równa.",
    success: "Po wydłużeniu o 1 cm otrzymujemy 9 + 13 > 21.",
  },
  {
    id: "window-two-steps",
    imageSrc: "/images/lessons/plane-figures-review/window-two-steps.webp",
    imageAlt: "Witrażowe okno dachowe w kształcie trapezu równoramiennego",
    title: "Trapezowe okno — dwa kroki",
    story: "Okno ma kształt trapezu równoramiennego. Kąt zewnętrzny przy dolnej podstawie ma 68°. Oblicz kąt wewnętrzny przy tej podstawie oraz kąt przy górnej podstawie po tej samej stronie.",
    answers: [
      { id: "lower", label: "Kąt wewnętrzny przy dolnej podstawie", unit: "°", answer: 112 },
      { id: "upper", label: "Kąt przy górnej podstawie", unit: "°", answer: 68 },
    ],
    hint: "Najpierw użyj kątów przyległych, a potem kątów przy tym samym ramieniu trapezu.",
    success: "Kąt dolny ma 112°, a górny 68°.",
  },
];

export function planeFiguresReviewActivityFromStageId(stageId: string): PlaneFiguresReviewActivity {
  if (stageId.endsWith("-lengths")) return "lengths";
  if (stageId.endsWith("-angles")) return "angles";
  return "challenge";
}
