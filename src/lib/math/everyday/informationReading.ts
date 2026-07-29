export type InformationReadingActivity =
  | "information-guide"
  | "table-reading"
  | "bar-chart-reading"
  | "table-to-chart"
  | "line-graph-guide"
  | "table-to-line-graph"
  | "line-graph-reading"
  | "section-review-practical"
  | "section-review-data"
  | "section-review-challenge";

export interface InformationDataSet {
  title: string;
  labels: string[];
  values: number[];
  unit: string;
  rowLabel?: string;
  showTotals?: boolean;
  story?: string;
  requiresTableInput?: boolean;
  series?: {
    label: string;
    values: number[];
    color: "violet" | "cyan" | "amber";
  }[];
  mapPoints?: {
    label: string;
    value: number;
    x: number;
    y: number;
  }[];
}

export interface InformationQuestion {
  id: string;
  data: InformationDataSet;
  prompt: string;
  answer: number;
  answerUnit?: string;
  visual?: "table" | "bar" | "map" | "line";
}

export const TABLE_READING_TASKS: InformationQuestion[] = [
  {
    id: "table-library-total",
    data: { title: "Wypożyczone książki", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [24, 31, 28, 35, 42], unit: "książki" },
    prompt: "Ile książek wypożyczono w środę i czwartek łącznie?",
    answer: 63,
    answerUnit: "książki",
  },
  {
    id: "table-temperature-difference",
    data: { title: "Temperatura w południe", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [8, 11, 7, 13, 10], unit: "°C", rowLabel: "temperatura" },
    prompt: "O ile stopni temperatura w czwartek była wyższa niż w środę?",
    answer: 6,
    answerUnit: "°C",
  },
  {
    id: "table-fruit-most",
    data: { title: "Sprzedane skrzynki owoców", labels: ["Jabłka", "Gruszki", "Śliwki", "Brzoskwinie"], values: [48, 27, 35, 19], unit: "skrzynek", rowLabel: "skrzynki" },
    prompt: "Ile skrzynek sprzedano najwięcej?",
    answer: 48,
    answerUnit: "skrzynek",
  },
  {
    id: "table-bus-difference",
    data: { title: "Pasażerowie autobusu", labels: ["7:00", "8:00", "9:00", "10:00"], values: [36, 52, 41, 29], unit: "osób", rowLabel: "osoby" },
    prompt: "O ile więcej pasażerów jechało o 8:00 niż o 10:00?",
    answer: 23,
    answerUnit: "osoby",
  },
  {
    id: "table-sport-total",
    data: { title: "Uczniowie na zajęciach", labels: ["Piłka", "Pływanie", "Taniec", "Szachy"], values: [18, 14, 21, 12], unit: "uczniów", rowLabel: "uczniowie" },
    prompt: "Ilu uczniów uczestniczy łącznie w pływaniu i szachach?",
    answer: 26,
    answerUnit: "uczniów",
  },
  {
    id: "table-water-average",
    data: { title: "Zużycie wody", labels: ["Pon.", "Wt.", "Śr.", "Czw."], values: [120, 150, 130, 160], unit: "l", rowLabel: "ilość wody" },
    prompt: "Ile litrów wody zużyto łącznie przez cztery dni?",
    answer: 560,
    answerUnit: "l",
  },
  {
    id: "table-canteen-a",
    data: {
      title: "Posiłki wydane w stołówce",
      labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
      values: [84, 91, 88, 96, 79],
      unit: "porcji",
      showTotals: false,
      series: [
        { label: "Klasy IV–V", values: [36, 42, 39, 45, 34], color: "violet" },
        { label: "Klasy VI–VIII", values: [48, 49, 49, 51, 45], color: "cyan" },
      ],
    },
    prompt: "a) Ile porcji wydano we wtorek wszystkim uczniom?",
    answer: 91,
    answerUnit: "porcji",
  },
  {
    id: "table-canteen-b",
    data: {
      title: "Posiłki wydane w stołówce",
      labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
      values: [84, 91, 88, 96, 79],
      unit: "porcji",
      showTotals: false,
      series: [
        { label: "Klasy IV–V", values: [36, 42, 39, 45, 34], color: "violet" },
        { label: "Klasy VI–VIII", values: [48, 49, 49, 51, 45], color: "cyan" },
      ],
    },
    prompt: "b) O ile więcej porcji dla klas VI–VIII niż dla klas IV–V wydano w piątek?",
    answer: 11,
    answerUnit: "porcji",
  },
  {
    id: "table-canteen-c",
    data: {
      title: "Posiłki wydane w stołówce",
      labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
      values: [84, 91, 88, 96, 79],
      unit: "porcji",
      showTotals: false,
      series: [
        { label: "Klasy IV–V", values: [36, 42, 39, 45, 34], color: "violet" },
        { label: "Klasy VI–VIII", values: [48, 49, 49, 51, 45], color: "cyan" },
      ],
    },
    prompt: "c) Ile porcji wydano łącznie w poniedziałek i czwartek?",
    answer: 180,
    answerUnit: "porcji",
  },
];

export const BAR_CHART_READING_TASKS: InformationQuestion[] = [
  {
    id: "chart-bikes-total",
    data: { title: "Rowerzyści na trasie", labels: ["Pn", "Wt", "Śr", "Czw", "Pt"], values: [12, 18, 15, 24, 21], unit: "osób" },
    prompt: "Ilu rowerzystów było na trasie w czwartek i piątek łącznie?",
    answer: 45,
    answerUnit: "osób",
  },
  {
    id: "chart-points-difference",
    data: { title: "Punkty drużyn", labels: ["Sowy", "Lisy", "Żubry", "Rysie"], values: [32, 45, 38, 27], unit: "pkt" },
    prompt: "O ile więcej punktów zdobyły Lisy niż Rysie?",
    answer: 18,
    answerUnit: "pkt",
  },
  {
    id: "chart-seedlings-least",
    data: { title: "Sadzonki w klasach", labels: ["6A", "6B", "6C", "6D"], values: [28, 35, 22, 31], unit: "sadzonek" },
    prompt: "Ile sadzonek przyniosła klasa, która miała ich najmniej?",
    answer: 22,
    answerUnit: "sadzonki",
  },
  {
    id: "chart-rain-sum",
    data: { title: "Opady deszczu", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [4, 9, 2, 7, 8], unit: "mm" },
    prompt: "Ile milimetrów deszczu spadło łącznie we wtorek i piątek?",
    answer: 17,
    answerUnit: "mm",
  },
  {
    id: "chart-cans-threshold",
    data: { title: "Zebrane puszki", labels: ["6A", "6B", "6C", "6D"], values: [65, 48, 72, 55], unit: "szt." },
    prompt: "Ile puszek zebrały łącznie klasy 6A i 6D?",
    answer: 120,
    answerUnit: "szt.",
  },
  {
    id: "chart-visits-range",
    data: { title: "Odwiedziny wystawy", labels: ["Pon.", "Wt.", "Śr.", "Czw."], values: [86, 104, 95, 118], unit: "osób" },
    prompt: "O ile największy wynik jest wyższy od najmniejszego?",
    answer: 32,
    answerUnit: "osoby",
  },
  {
    id: "chart-books-two-series-a",
    visual: "bar",
    data: {
      title: "Przeczytane książki w dwóch miesiącach",
      labels: ["6A", "6B", "6C", "6D"],
      values: [18, 22, 17, 25],
      unit: "książek",
      series: [
        { label: "Wrzesień", values: [18, 22, 17, 25], color: "violet" },
        { label: "Październik", values: [24, 19, 26, 28], color: "cyan" },
      ],
    },
    prompt: "a) Ile książek przeczytała klasa 6C łącznie w obu miesiącach?",
    answer: 43,
    answerUnit: "książki",
  },
  {
    id: "chart-books-two-series-b",
    visual: "bar",
    data: {
      title: "Przeczytane książki w dwóch miesiącach",
      labels: ["6A", "6B", "6C", "6D"],
      values: [18, 22, 17, 25],
      unit: "książek",
      series: [
        { label: "Wrzesień", values: [18, 22, 17, 25], color: "violet" },
        { label: "Październik", values: [24, 19, 26, 28], color: "cyan" },
      ],
    },
    prompt: "b) O ile więcej książek przeczytała klasa 6A w październiku niż we wrześniu?",
    answer: 6,
    answerUnit: "książek",
  },
  {
    id: "chart-books-two-series-c",
    visual: "bar",
    data: {
      title: "Przeczytane książki w dwóch miesiącach",
      labels: ["6A", "6B", "6C", "6D"],
      values: [18, 22, 17, 25],
      unit: "książek",
      series: [
        { label: "Wrzesień", values: [18, 22, 17, 25], color: "violet" },
        { label: "Październik", values: [24, 19, 26, 28], color: "cyan" },
      ],
    },
    prompt: "c) Ile książek przeczytały klasy 6B i 6D w październiku?",
    answer: 47,
    answerUnit: "książek",
  },
  {
    id: "map-rainfall-a",
    visual: "map",
    data: {
      title: "Suma opadów w wybranych miastach",
      labels: ["Gdańsk", "Szczecin", "Warszawa", "Wrocław", "Kraków"],
      values: [18, 12, 15, 9, 21],
      unit: "mm",
      mapPoints: [
        { label: "Gdańsk", value: 18, x: 52, y: 15 },
        { label: "Szczecin", value: 12, x: 17, y: 31 },
        { label: "Warszawa", value: 15, x: 66, y: 48 },
        { label: "Wrocław", value: 9, x: 31, y: 69 },
        { label: "Kraków", value: 21, x: 58, y: 82 },
      ],
    },
    prompt: "a) O ile więcej milimetrów opadu zanotowano w Krakowie niż we Wrocławiu?",
    answer: 12,
    answerUnit: "mm",
  },
  {
    id: "map-rainfall-b",
    visual: "map",
    data: {
      title: "Suma opadów w wybranych miastach",
      labels: ["Gdańsk", "Szczecin", "Warszawa", "Wrocław", "Kraków"],
      values: [18, 12, 15, 9, 21],
      unit: "mm",
      mapPoints: [
        { label: "Gdańsk", value: 18, x: 52, y: 15 },
        { label: "Szczecin", value: 12, x: 17, y: 31 },
        { label: "Warszawa", value: 15, x: 66, y: 48 },
        { label: "Wrocław", value: 9, x: 31, y: 69 },
        { label: "Kraków", value: 21, x: 58, y: 82 },
      ],
    },
    prompt: "b) Ile milimetrów opadu zanotowano łącznie w Gdańsku, Warszawie i Krakowie?",
    answer: 54,
    answerUnit: "mm",
  },
];

export const TABLE_TO_CHART_TASKS: InformationDataSet[] = [
  { title: "Ulubione owoce", labels: ["Jabłko", "Banan", "Gruszka", "Śliwka"], values: [7, 4, 6, 3], unit: "głosów", rowLabel: "głosy" },
  { title: "Przeczytane książki", labels: ["6A", "6B", "6C", "6D"], values: [5, 8, 6, 9], unit: "książek", rowLabel: "książki" },
  { title: "Dni z opadami", labels: ["I", "II", "III", "IV"], values: [3, 6, 4, 7], unit: "dni", rowLabel: "dni z opadami" },
  {
    title: "Punkty w turnieju",
    labels: ["Ada", "Bartek", "Celina", "Daniel"],
    values: [8, 5, 9, 6],
    unit: "pkt",
    rowLabel: "punkty",
    story: "W szkolnym turnieju Ada zdobyła 8 punktów, Bartek 5 punktów, Celina 9 punktów, a Daniel 6 punktów. Uzupełnij tabelę, a następnie przedstaw wyniki na diagramie słupkowym.",
    requiresTableInput: true,
  },
  {
    title: "Zebrane baterie",
    labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
    values: [4, 7, 5, 8, 6],
    unit: "pudełek",
    rowLabel: "pudełka",
    story: "Podczas szkolnej zbiórki baterii w poniedziałek zebrano 4 pudełka, we wtorek 7, w środę 5, w czwartek 8, a w piątek 6 pudełek. Uzupełnij tabelę, a następnie wykonaj diagram słupkowy.",
    requiresTableInput: true,
  },
];

export const TABLE_TO_LINE_GRAPH_TASKS: InformationDataSet[] = [
  { title: "Temperatura w ciągu dnia", labels: ["8:00", "10:00", "12:00", "14:00", "16:00"], values: [8, 12, 17, 19, 15], unit: "°C" },
  { title: "Woda w zbiorniku", labels: ["Pn", "Wt", "Śr", "Czw", "Pt"], values: [12, 18, 15, 24, 21], unit: "l" },
  { title: "Długość trasy rowerowej", labels: ["1 h", "2 h", "3 h", "4 h", "5 h"], values: [6, 13, 18, 26, 31], unit: "km" },
  { title: "Liczba odwiedzających wystawę", labels: ["10:00", "11:00", "12:00", "13:00", "14:00"], values: [15, 25, 20, 35, 30], unit: "osób" },
];

export const LINE_GRAPH_READING_TASKS: InformationQuestion[] = [
  {
    id: "line-temperature-a",
    visual: "line",
    data: { title: "Temperatura w szklarni", labels: ["6:00", "9:00", "12:00", "15:00", "18:00"], values: [12, 17, 24, 21, 15], unit: "°C" },
    prompt: "a) O ile stopni wzrosła temperatura od 6:00 do 12:00?",
    answer: 12,
    answerUnit: "°C",
  },
  {
    id: "line-temperature-b",
    visual: "line",
    data: { title: "Temperatura w szklarni", labels: ["6:00", "9:00", "12:00", "15:00", "18:00"], values: [12, 17, 24, 21, 15], unit: "°C" },
    prompt: "b) O ile stopni spadła temperatura od 12:00 do 18:00?",
    answer: 9,
    answerUnit: "°C",
  },
  {
    id: "line-tank",
    visual: "line",
    data: { title: "Ilość wody w zbiorniku", labels: ["8:00", "9:00", "10:00", "11:00", "12:00"], values: [40, 55, 50, 70, 65], unit: "l" },
    prompt: "Między którymi kolejnymi godzinami ilość wody wzrosła najbardziej? Wpisz wielkość tego wzrostu.",
    answer: 20,
    answerUnit: "l",
  },
  {
    id: "line-cyclist",
    visual: "line",
    data: { title: "Droga przebyta przez rowerzystę", labels: ["0 h", "1 h", "2 h", "3 h", "4 h"], values: [0, 12, 25, 25, 43], unit: "km" },
    prompt: "Ile kilometrów rowerzysta przejechał po postoju między 2. a 3. godziną?",
    answer: 18,
    answerUnit: "km",
  },
  {
    id: "line-library-two-series-a",
    visual: "line",
    data: {
      title: "Odwiedziny w dwóch bibliotekach",
      labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
      values: [28, 35, 31, 42, 38],
      unit: "osób",
      series: [
        { label: "Biblioteka A", values: [28, 35, 31, 42, 38], color: "violet" },
        { label: "Biblioteka B", values: [22, 29, 36, 34, 41], color: "cyan" },
      ],
    },
    prompt: "a) W którym dniu różnica liczby odwiedzających obie biblioteki była największa? Wpisz tę różnicę.",
    answer: 8,
    answerUnit: "osób",
  },
  {
    id: "line-library-two-series-b",
    visual: "line",
    data: {
      title: "Odwiedziny w dwóch bibliotekach",
      labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."],
      values: [28, 35, 31, 42, 38],
      unit: "osób",
      series: [
        { label: "Biblioteka A", values: [28, 35, 31, 42, 38], color: "violet" },
        { label: "Biblioteka B", values: [22, 29, 36, 34, 41], color: "cyan" },
      ],
    },
    prompt: "b) Ile osób odwiedziło obie biblioteki łącznie w środę?",
    answer: 67,
    answerUnit: "osób",
  },
  {
    id: "line-plant",
    visual: "line",
    data: { title: "Wysokość rośliny", labels: ["1 tydz.", "2 tydz.", "3 tydz.", "4 tydz.", "5 tydz."], values: [4, 7, 11, 16, 22], unit: "cm" },
    prompt: "O ile centymetrów roślina urosła od końca 2. do końca 5. tygodnia?",
    answer: 15,
    answerUnit: "cm",
  },
  {
    id: "line-bus",
    visual: "line",
    data: { title: "Liczba pasażerów w autobusie", labels: ["Start", "A", "B", "C", "D", "Koniec"], values: [18, 25, 19, 31, 24, 12], unit: "osób" },
    prompt: "Ilu pasażerów łącznie ubyło między przystankiem C a końcem trasy?",
    answer: 19,
    answerUnit: "osób",
  },
];

export function informationReadingActivityFromStageId(stageId: string): InformationReadingActivity {
  if (stageId.includes("section-review-practical")) return "section-review-practical";
  if (stageId.includes("section-review-data")) return "section-review-data";
  if (stageId.includes("section-review-challenge")) return "section-review-challenge";
  if (stageId.includes("line-graph-guide")) return "line-graph-guide";
  if (stageId.includes("table-to-line-graph")) return "table-to-line-graph";
  if (stageId.includes("line-graph-reading")) return "line-graph-reading";
  if (stageId.includes("information-guide")) return "information-guide";
  if (stageId.includes("table-reading")) return "table-reading";
  if (stageId.includes("bar-chart-reading")) return "bar-chart-reading";
  return "table-to-chart";
}
