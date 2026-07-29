export type InformationReadingActivity =
  | "information-guide"
  | "table-reading"
  | "bar-chart-reading"
  | "table-to-chart";

export interface InformationDataSet {
  title: string;
  labels: string[];
  values: number[];
  unit: string;
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
  visual?: "table" | "bar" | "map";
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
    data: { title: "Temperatura w południe", labels: ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."], values: [8, 11, 7, 13, 10], unit: "°C" },
    prompt: "O ile stopni temperatura w czwartek była wyższa niż w środę?",
    answer: 6,
    answerUnit: "°C",
  },
  {
    id: "table-fruit-most",
    data: { title: "Sprzedane skrzynki owoców", labels: ["Jabłka", "Gruszki", "Śliwki", "Brzoskwinie"], values: [48, 27, 35, 19], unit: "skrzynek" },
    prompt: "Ile skrzynek sprzedano najwięcej?",
    answer: 48,
    answerUnit: "skrzynek",
  },
  {
    id: "table-bus-difference",
    data: { title: "Pasażerowie autobusu", labels: ["7:00", "8:00", "9:00", "10:00"], values: [36, 52, 41, 29], unit: "osób" },
    prompt: "O ile więcej pasażerów jechało o 8:00 niż o 10:00?",
    answer: 23,
    answerUnit: "osoby",
  },
  {
    id: "table-sport-total",
    data: { title: "Uczniowie na zajęciach", labels: ["Piłka", "Pływanie", "Taniec", "Szachy"], values: [18, 14, 21, 12], unit: "uczniów" },
    prompt: "Ilu uczniów uczestniczy łącznie w pływaniu i szachach?",
    answer: 26,
    answerUnit: "uczniów",
  },
  {
    id: "table-water-average",
    data: { title: "Zużycie wody", labels: ["Pon.", "Wt.", "Śr.", "Czw."], values: [120, 150, 130, 160], unit: "l" },
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
  { title: "Ulubione owoce", labels: ["Jabłko", "Banan", "Gruszka", "Śliwka"], values: [7, 4, 6, 3], unit: "głosów" },
  { title: "Przeczytane książki", labels: ["6A", "6B", "6C", "6D"], values: [5, 8, 6, 9], unit: "książek" },
  { title: "Dni z opadami", labels: ["I", "II", "III", "IV"], values: [3, 6, 4, 7], unit: "dni" },
  { title: "Punkty w turnieju", labels: ["Ada", "Bartek", "Celina", "Daniel"], values: [8, 5, 9, 6], unit: "pkt" },
  { title: "Zebrane baterie", labels: ["Pn", "Wt", "Śr", "Czw", "Pt"], values: [4, 7, 5, 8, 6], unit: "pudełek" },
];

export function informationReadingActivityFromStageId(stageId: string): InformationReadingActivity {
  if (stageId.includes("information-guide")) return "information-guide";
  if (stageId.includes("table-reading")) return "table-reading";
  if (stageId.includes("bar-chart-reading")) return "bar-chart-reading";
  return "table-to-chart";
}
