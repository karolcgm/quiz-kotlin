import type { AreaReviewTask } from "@/lib/math/area/areaReview";

const img = (name: string) => `/images/lessons/grade6/polygon-areas/${name}.png`;

export const G6_PARALLELOGRAM_RHOMBUS_TASKS: AreaReviewTask[] = [
  {
    id: "g6-parallelogram-mixed-units",
    prompt: "Równoległobok ma podstawę 1,8 dm i wysokość 65 mm. Oblicz jego pole w centymetrach kwadratowych.",
    shape: "parallelogram",
    labels: { a: "1,8 dm", h: "65 mm" },
    answers: [
      { id: "base", label: "Podstawa po zamianie", unit: "cm", answer: 18 },
      { id: "height", label: "Wysokość po zamianie", unit: "cm", answer: 6.5 },
      { id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 117 },
    ],
    hint: "Najpierw zapisz oba wymiary w centymetrach, a potem pomnóż podstawę przez odpowiadającą jej wysokość.",
    success: "18 · 6,5 = 117 cm².",
  },
  {
    id: "g6-parallelogram-decoy-side",
    prompt: "Wybierz potrzebne dane. Bok skośny ma 9 cm, podstawa 14 cm, a wysokość opuszczona na tę podstawę 6 cm.",
    shape: "parallelogram",
    labels: { a: "14 cm", b: "9 cm", h: "6 cm" },
    answers: [{ id: "area", label: "Pole równoległoboku", unit: "cm²", answer: 84 }],
    hint: "Do obliczenia pola nie używamy długości boku skośnego.",
    success: "14 · 6 = 84 cm².",
  },
  {
    id: "g6-parallelogram-missing-height",
    prompt: "Pole równoległoboku wynosi 5,04 m², a podstawa ma 2,4 m. Oblicz wysokość.",
    shape: "parallelogram",
    labels: { a: "2,4 m", h: "?", inside: "P = 5,04 m²" },
    answers: [{ id: "height", label: "Wysokość", unit: "m", answer: 2.1 }],
    hint: "Znane pole podziel przez długość podstawy.",
    success: "5,04 : 2,4 = 2,1 m.",
  },
  {
    id: "g6-rhombus-diagonals",
    prompt: "Przekątne rombu mają długości 1,2 dm i 8 cm. Oblicz pole rombu w centymetrach kwadratowych.",
    shape: "rhombus-diagonals",
    labels: { e: "1,2 dm", f: "8 cm" },
    answers: [
      { id: "diagonal", label: "Pierwsza przekątna po zamianie", unit: "cm", answer: 12 },
      { id: "area", label: "Pole rombu", unit: "cm²", answer: 48 },
    ],
    hint: "1,2 dm to 12 cm. Iloczyn przekątnych podziel przez 2.",
    success: "12 · 8 : 2 = 48 cm².",
  },
  {
    id: "g6-rhombus-two-methods",
    prompt: "Dla rombu podano a = 15 cm, h = 8 cm, e = 20 cm i f = 12 cm. Oblicz pole na dwa sposoby i sprawdź, czy wyniki się pokrywają.",
    shape: "rhombus-diagonals",
    labels: { e: "20 cm", f: "12 cm", inside: "a = 15 cm, h = 8 cm" },
    answers: [
      { id: "heightMethod", label: "Pole z podstawy i wysokości", unit: "cm²", answer: 120 },
      { id: "diagonalMethod", label: "Pole z przekątnych", unit: "cm²", answer: 120 },
    ],
    hint: "Oblicz osobno a · h oraz e · f : 2.",
    success: "Oba sposoby dają 120 cm².",
  },
  {
    id: "g6-rhombus-missing-diagonal",
    prompt: "Pole rombu wynosi 96 cm², a jedna przekątna ma 12 cm. Oblicz drugą przekątną.",
    shape: "rhombus-diagonals",
    labels: { e: "12 cm", f: "?", inside: "P = 96 cm²" },
    answers: [{ id: "diagonal", label: "Druga przekątna", unit: "cm", answer: 16 }],
    hint: "Iloczyn przekątnych musi wynosić dwa razy tyle co pole.",
    success: "12 · 16 : 2 = 96 cm².",
  },
];

export const G6_PARALLELOGRAM_RHOMBUS_STORIES: AreaReviewTask[] = [
  {
    id: "g6-story-solar-panels",
    prompt: "Na dachu zamontowano 6 jednakowych paneli w kształcie równoległoboku. Podstawa jednego panelu ma 1,6 m, a wysokość 75 cm. Jaką powierzchnię zajmują wszystkie panele?",
    detail: "Wynik podaj w metrach kwadratowych.",
    image: img("solar-panels"),
    shape: "parallelogram",
    labels: { a: "1,6 m", h: "75 cm" },
    answers: [
      { id: "height", label: "Wysokość po zamianie", unit: "m", answer: 0.75 },
      { id: "one", label: "Pole jednego panelu", unit: "m²", answer: 1.2 },
      { id: "all", label: "Pole sześciu paneli", unit: "m²", answer: 7.2 },
    ],
    hint: "Najpierw zamień 75 cm na metry i oblicz pole jednego panelu.",
    success: "Panele zajmują łącznie 7,2 m².",
  },
  {
    id: "g6-story-rhombus-window",
    prompt: "Rombowy witraż ma przekątne długości 90 cm i 1,4 m. Szkło kosztuje 320 zł za 1 m². Ile kosztuje szkło potrzebne na witraż?",
    image: img("rhombus-window"),
    shape: "rhombus-diagonals",
    labels: { e: "90 cm", f: "1,4 m" },
    answers: [
      { id: "diagonal", label: "Krótsza przekątna po zamianie", unit: "m", answer: 0.9 },
      { id: "area", label: "Pole witraża", unit: "m²", answer: 0.63 },
      { id: "cost", label: "Koszt szkła", unit: "zł", answer: 201.6 },
    ],
    hint: "Ujednolić jednostki, oblicz pole rombu, a następnie koszt szkła.",
    success: "Szkło kosztuje 201,60 zł.",
  },
];

export const G6_TRIANGLE_TASKS: AreaReviewTask[] = [
  {
    id: "g6-triangle-mixed-units",
    prompt: "Trójkąt ma podstawę 1,4 dm i wysokość 85 mm. Oblicz pole w centymetrach kwadratowych.",
    shape: "triangle",
    labels: { a: "1,4 dm", h: "85 mm" },
    answers: [
      { id: "base", label: "Podstawa po zamianie", unit: "cm", answer: 14 },
      { id: "height", label: "Wysokość po zamianie", unit: "cm", answer: 8.5 },
      { id: "area", label: "Pole trójkąta", unit: "cm²", answer: 59.5 },
    ],
    hint: "Po zamianie jednostek pomnóż podstawę przez wysokość i podziel przez 2.",
    success: "14 · 8,5 : 2 = 59,5 cm².",
  },
  {
    id: "g6-triangle-missing-height",
    prompt: "Pole trójkąta wynosi 54 cm², a podstawa ma 12 cm. Oblicz wysokość.",
    shape: "triangle",
    labels: { a: "12 cm", h: "?", inside: "P = 54 cm²" },
    answers: [{ id: "height", label: "Wysokość", unit: "cm", answer: 9 }],
    hint: "Podwojone pole podziel przez długość podstawy.",
    success: "108 : 12 = 9 cm.",
  },
  {
    id: "g6-triangle-missing-base",
    prompt: "Pole trójkąta wynosi 3,6 dm², a wysokość 24 cm. Oblicz długość podstawy w centymetrach.",
    shape: "triangle",
    labels: { a: "?", h: "24 cm", inside: "P = 3,6 dm²" },
    answers: [
      { id: "area", label: "Pole po zamianie", unit: "cm²", answer: 360 },
      { id: "base", label: "Długość podstawy", unit: "cm", answer: 30 },
    ],
    hint: "Najpierw zamień decymetry kwadratowe na centymetry kwadratowe.",
    success: "2 · 360 : 24 = 30 cm.",
  },
  {
    id: "g6-triangle-obtuse",
    prompt: "W trójkącie rozwartokątnym wysokość opuszczona na podstawę leży poza figurą. Podstawa ma 18 cm, a odpowiadająca jej wysokość 7 cm. Oblicz pole.",
    shape: "triangle",
    labels: { a: "18 cm", h: "7 cm" },
    answers: [{ id: "area", label: "Pole trójkąta", unit: "cm²", answer: 63 }],
    hint: "Położenie wysokości poza trójkątem nie zmienia wzoru na pole.",
    success: "18 · 7 : 2 = 63 cm².",
  },
];

export const G6_TRIANGLE_STORIES: AreaReviewTask[] = [
  {
    id: "g6-story-climbing-wall",
    prompt: "Trójkątny panel ścianki wspinaczkowej ma podstawę 2,4 m i wysokość 175 cm. Trzeba pomalować 8 takich paneli. Jaką powierzchnię trzeba pomalować?",
    image: img("climbing-wall"),
    shape: "triangle",
    labels: { a: "2,4 m", h: "175 cm" },
    answers: [
      { id: "height", label: "Wysokość po zamianie", unit: "m", answer: 1.75 },
      { id: "one", label: "Pole jednego panelu", unit: "m²", answer: 2.1 },
      { id: "all", label: "Pole ośmiu paneli", unit: "m²", answer: 16.8 },
    ],
    hint: "Zamień wysokość na metry, oblicz pole jednego panelu i pomnóż przez 8.",
    success: "Do pomalowania jest 16,8 m².",
  },
  {
    id: "g6-story-sailboat",
    prompt: "Żagiel ma kształt trójkąta o polu 7,2 m². Jego wysokość wynosi 3,2 m. Ile metrów ma dolna krawędź żagla?",
    image: img("sailboat"),
    shape: "triangle",
    labels: { a: "?", h: "3,2 m", inside: "P = 7,2 m²" },
    answers: [{ id: "base", label: "Długość dolnej krawędzi", unit: "m", answer: 4.5 }],
    hint: "Podwojone pole podziel przez wysokość.",
    success: "Dolna krawędź ma 4,5 m.",
  },
];

export const G6_TRAPEZOID_TASKS: AreaReviewTask[] = [
  {
    id: "g6-trapezoid-mixed-units",
    prompt: "Podstawy trapezu mają 1,6 dm i 9 cm, a wysokość 70 mm. Oblicz pole w centymetrach kwadratowych.",
    shape: "trapezoid",
    labels: { a: "1,6 dm", b: "9 cm", h: "70 mm" },
    answers: [
      { id: "a", label: "Dłuższa podstawa po zamianie", unit: "cm", answer: 16 },
      { id: "height", label: "Wysokość po zamianie", unit: "cm", answer: 7 },
      { id: "area", label: "Pole trapezu", unit: "cm²", answer: 87.5 },
    ],
    hint: "Ujednolić jednostki, dodać podstawy, pomnożyć przez wysokość i podzielić przez 2.",
    success: "(16 + 9) · 7 : 2 = 87,5 cm².",
  },
  {
    id: "g6-trapezoid-missing-height",
    prompt: "Pole trapezu wynosi 84 cm², a podstawy mają 16 cm i 8 cm. Oblicz wysokość.",
    shape: "trapezoid",
    labels: { a: "16 cm", b: "8 cm", h: "?", inside: "P = 84 cm²" },
    answers: [{ id: "height", label: "Wysokość", unit: "cm", answer: 7 }],
    hint: "Suma podstaw wynosi 24 cm. Ustal, jaka wysokość daje pole 84 cm².",
    success: "24 · 7 : 2 = 84 cm².",
  },
  {
    id: "g6-trapezoid-missing-base",
    prompt: "Pole trapezu wynosi 72 dm², wysokość ma 6 dm, a krótsza podstawa 8 dm. Oblicz dłuższą podstawę.",
    shape: "trapezoid",
    labels: { a: "?", b: "8 dm", h: "6 dm", inside: "P = 72 dm²" },
    answers: [{ id: "base", label: "Dłuższa podstawa", unit: "dm", answer: 16 }],
    hint: "Najpierw ustal sumę podstaw: podwojone pole podziel przez wysokość.",
    success: "Suma podstaw to 24 dm, więc dłuższa podstawa ma 16 dm.",
  },
  {
    id: "g6-trapezoid-composite",
    prompt: "Trapez podzielono wysokością na prostokąt i trójkąt. Podstawy mają 15 cm i 9 cm, a wysokość 8 cm. Oblicz pola obu części i całej figury.",
    shape: "trapezoid",
    labels: { a: "15 cm", b: "9 cm", h: "8 cm" },
    answers: [
      { id: "rectangle", label: "Pole prostokątnej części", unit: "cm²", answer: 72 },
      { id: "triangle", label: "Pole trójkątnej części", unit: "cm²", answer: 24 },
      { id: "total", label: "Pole trapezu", unit: "cm²", answer: 96 },
    ],
    hint: "Prostokąt ma wymiary 9 cm na 8 cm, a trójkąt podstawę 6 cm i wysokość 8 cm.",
    success: "72 + 24 = 96 cm².",
  },
];

export const G6_TRAPEZOID_STORIES: AreaReviewTask[] = [
  {
    id: "g6-story-trapezoid-garden",
    prompt: "Rabata w kształcie trapezu ma podstawy 12 m i 7,5 m oraz wysokość 4 m. Jedno opakowanie nasion wystarcza na 6 m². Ile opakowań trzeba kupić?",
    image: img("trapezoid-garden"),
    shape: "trapezoid",
    labels: { a: "12 m", b: "7,5 m", h: "4 m" },
    answers: [
      { id: "area", label: "Pole rabaty", unit: "m²", answer: 39 },
      { id: "packs", label: "Liczba opakowań", unit: "opakowań", answer: 7 },
    ],
    hint: "Po obliczeniu pola podziel je przez 6. Niepełne opakowanie oznacza, że trzeba kupić kolejne całe.",
    success: "Pole wynosi 39 m², więc trzeba kupić 7 opakowań.",
  },
  {
    id: "g6-story-trapezoid-window",
    prompt: "Szyba muzealnego okna ma kształt trapezu o polu 1,44 m². Podstawy mają 1,8 m i 1,2 m. Oblicz wysokość okna.",
    image: img("trapezoid-window"),
    shape: "trapezoid",
    labels: { a: "1,8 m", b: "1,2 m", h: "?", inside: "P = 1,44 m²" },
    answers: [{ id: "height", label: "Wysokość okna", unit: "m", answer: 0.96 }],
    hint: "Podwojone pole podziel przez sumę podstaw.",
    success: "Wysokość okna wynosi 0,96 m.",
  },
];

export const G6_AREA_REVIEW_TASKS: AreaReviewTask[] = [
  {
    id: "g6-review-match-areas",
    prompt: "Oblicz pola sześciu figur i dopasuj do każdej właściwy wynik z chmurki.",
    detail: "Najpierw dotknij figury, a następnie wybierz jej pole. Każdego wyniku użyj tylko raz.",
    answers: [],
    matchBoard: {
      figures: [
        { id: "rectangle", name: "Prostokąt", shape: "rectangle", labels: { a: "8 cm", b: "4 cm" }, answerOptionId: "area-32" },
        { id: "triangle", name: "Trójkąt", shape: "triangle", labels: { a: "6 cm", h: "4 cm" }, answerOptionId: "area-12" },
        { id: "parallelogram", name: "Równoległobok", shape: "parallelogram", labels: { a: "7 cm", h: "4 cm" }, answerOptionId: "area-28" },
        { id: "trapezoid", name: "Trapez", shape: "trapezoid", labels: { a: "8 cm", b: "4 cm", h: "3 cm" }, answerOptionId: "area-18" },
        { id: "rhombus", name: "Romb", shape: "rhombus-diagonals", labels: { e: "8 cm", f: "6 cm" }, answerOptionId: "area-24" },
        { id: "square", name: "Kwadrat", shape: "square", labels: { a: "5 cm" }, answerOptionId: "area-25" },
      ],
      options: [
        { id: "area-24", label: "24 cm²" },
        { id: "area-12", label: "12 cm²" },
        { id: "area-32", label: "32 cm²" },
        { id: "area-18", label: "18 cm²" },
        { id: "area-25", label: "25 cm²" },
        { id: "area-28", label: "28 cm²" },
      ],
    },
    hint: "Rozpoznaj figurę, dobierz wzór i dopiero potem wybierz wynik. Zwróć uwagę na dzielenie przez 2.",
    success: "Wszystkie figury zostały połączone z właściwymi polami.",
  },
  {
    id: "g6-review-parallelogram",
    prompt: "Pole równoległoboku wynosi 2,52 dm², a wysokość 12 cm. Oblicz długość podstawy w centymetrach.",
    shape: "parallelogram",
    labels: { a: "?", h: "12 cm", inside: "P = 2,52 dm²" },
    answers: [
      { id: "area", label: "Pole po zamianie", unit: "cm²", answer: 252 },
      { id: "base", label: "Podstawa", unit: "cm", answer: 21 },
    ],
    hint: "Najpierw zamień decymetry kwadratowe na centymetry kwadratowe.",
    success: "252 : 12 = 21 cm.",
  },
  {
    id: "g6-review-rhombus",
    prompt: "Romb ma pole 135 cm² i przekątną długości 18 cm. Oblicz drugą przekątną.",
    shape: "rhombus-diagonals",
    labels: { e: "18 cm", f: "?", inside: "P = 135 cm²" },
    answers: [{ id: "diagonal", label: "Druga przekątna", unit: "cm", answer: 15 }],
    hint: "Podwojone pole podziel przez znaną przekątną.",
    success: "270 : 18 = 15 cm.",
  },
  {
    id: "g6-review-triangle",
    prompt: "Trójkąt ma pole 0,48 m² i podstawę 120 cm. Oblicz wysokość w centymetrach.",
    shape: "triangle",
    labels: { a: "120 cm", h: "?", inside: "P = 0,48 m²" },
    answers: [
      { id: "area", label: "Pole po zamianie", unit: "cm²", answer: 4800 },
      { id: "height", label: "Wysokość", unit: "cm", answer: 80 },
    ],
    hint: "0,48 m² to 4 800 cm². Następnie podwojone pole podziel przez podstawę.",
    success: "2 · 4 800 : 120 = 80 cm.",
  },
  {
    id: "g6-review-trapezoid",
    prompt: "Trapez ma pole 117 cm², wysokość 9 cm i krótszą podstawę 10 cm. Oblicz dłuższą podstawę.",
    shape: "trapezoid",
    labels: { a: "?", b: "10 cm", h: "9 cm", inside: "P = 117 cm²" },
    answers: [{ id: "base", label: "Dłuższa podstawa", unit: "cm", answer: 16 }],
    hint: "Najpierw oblicz sumę podstaw: 2 · 117 : 9.",
    success: "Suma podstaw wynosi 26 cm, więc dłuższa ma 16 cm.",
  },
];

export const G6_AREA_REVIEW_STORIES: AreaReviewTask[] = [
  {
    id: "g6-review-story-mosaic",
    prompt: "Dekoracja festynowa składa się z równoległoboku o podstawie 3 m i wysokości 1,6 m oraz dwóch trójkątów o podstawie 1,5 m i wysokości 1,2 m każdy. Oblicz całe pole dekoracji.",
    image: img("festival-mosaic"),
    shape: "parallelogram",
    labels: { a: "3 m", h: "1,6 m", inside: "oraz 2 trójkąty" },
    answers: [
      { id: "middle", label: "Pole równoległoboku", unit: "m²", answer: 4.8 },
      { id: "triangle", label: "Pole jednego trójkąta", unit: "m²", answer: 0.9 },
      { id: "total", label: "Pole całej dekoracji", unit: "m²", answer: 6.6 },
    ],
    hint: "Oblicz osobno pole środkowej części i jednego trójkąta. Pamiętaj, że trójkąty są dwa.",
    success: "4,8 + 2 · 0,9 = 6,6 m².",
  },
  {
    id: "g6-review-story-sail",
    prompt: "Pracownia ma 12 m² tkaniny. Wycięto z niej 4 trójkątne żagle o podstawie 1,5 m i wysokości 2 m. Ile metrów kwadratowych tkaniny zostało?",
    image: img("sail-workshop"),
    shape: "triangle",
    labels: { a: "1,5 m", h: "2 m" },
    answers: [
      { id: "one", label: "Pole jednego żagla", unit: "m²", answer: 1.5 },
      { id: "used", label: "Zużyta tkanina", unit: "m²", answer: 6 },
      { id: "left", label: "Pozostała tkanina", unit: "m²", answer: 6 },
    ],
    hint: "Najpierw oblicz pole jednego żagla, potem czterech i odejmij od 12 m².",
    success: "Pozostało 6 m² tkaniny.",
  },
];
