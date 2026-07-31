export type PercentDiagramActivity =
  | "percent-diagrams-guide"
  | "percent-diagrams-pie"
  | "percent-diagrams-bars";

export interface PercentDiagramSeries {
  name: string;
  color: string;
}

export interface PercentDiagramCategory {
  label: string;
  values: number[];
}

export interface PercentDiagramQuestion {
  prompt: string;
  answer: number;
}

export interface PercentDiagramTask {
  title: string;
  kind: "pie" | "bars";
  series: PercentDiagramSeries[];
  categories: PercentDiagramCategory[];
  questions: PercentDiagramQuestion[];
}

const PIE_TASKS: readonly PercentDiagramTask[] = [
  {
    title: "Jak uczniowie docierają do szkoły?",
    kind: "pie",
    series: [{ name: "Uczniowie", color: "#4f46e5" }],
    categories: [
      { label: "pieszo", values: [35] },
      { label: "rowerem", values: [25] },
      { label: "autobusem", values: [30] },
      { label: "samochodem", values: [10] },
    ],
    questions: [
      { prompt: "Ile procent uczniów dojeżdża rowerem?", answer: 25 },
      { prompt: "Ile procent uczniów dociera pieszo lub rowerem?", answer: 60 },
      { prompt: "Jaki procent uczniów nie jeździ samochodem?", answer: 90 },
    ],
  },
  {
    title: "Ulubione rodzaje książek",
    kind: "pie",
    series: [{ name: "Czytelnicy", color: "#4f46e5" }],
    categories: [
      { label: "fantasy", values: [40] },
      { label: "przygodowe", values: [30] },
      { label: "popularnonaukowe", values: [20] },
      { label: "poezja", values: [10] },
    ],
    questions: [
      { prompt: "Ile procent uczniów wybrało fantasy?", answer: 40 },
      { prompt: "Ile procent uczniów wybrało książki przygodowe lub popularnonaukowe?", answer: 50 },
      { prompt: "Jaki procent uczniów nie wybrał fantasy?", answer: 60 },
    ],
  },
  {
    title: "Zajęcia wybrane na dzień szkoły",
    kind: "pie",
    series: [{ name: "Uczniowie", color: "#4f46e5" }],
    categories: [
      { label: "plastyczne", values: [32] },
      { label: "sportowe", values: [28] },
      { label: "muzyczne", values: [22] },
      { label: "techniczne", values: [18] },
    ],
    questions: [
      { prompt: "Ile procent uczniów wybrało najpopularniejsze zajęcia?", answer: 32 },
      { prompt: "Ile procent uczniów wybrało zajęcia sportowe lub muzyczne?", answer: 50 },
      { prompt: "Ile procent uczniów wybrało zajęcia plastyczne lub techniczne?", answer: 50 },
    ],
  },
  {
    title: "Sposoby spędzania wolnego popołudnia",
    kind: "pie",
    series: [{ name: "Odpowiedzi", color: "#4f46e5" }],
    categories: [
      { label: "na świeżym powietrzu", values: [45] },
      { label: "z książką", values: [20] },
      { label: "przy grach", values: [25] },
      { label: "inne", values: [10] },
    ],
    questions: [
      { prompt: "Ile procent odpowiedzi dotyczyło książek lub gier?", answer: 45 },
      { prompt: "Jaki procent odpowiedzi nie dotyczył czasu na świeżym powietrzu?", answer: 55 },
      { prompt: "Ile procent odpowiedzi dotyczyło świeżego powietrza lub książki?", answer: 65 },
    ],
  },
] as const;

const BAR_TASKS: readonly PercentDiagramTask[] = [
  {
    title: "Sposób spędzania przerwy",
    kind: "bars",
    series: [{ name: "Uczniowie", color: "#4f46e5" }],
    categories: [
      { label: "rozmowa", values: [35] },
      { label: "ruch", values: [30] },
      { label: "czytanie", values: [15] },
      { label: "gry", values: [20] },
    ],
    questions: [
      { prompt: "Ile procent uczniów wybiera ruch?", answer: 30 },
      { prompt: "Ile procent uczniów wybiera czytanie lub gry?", answer: 35 },
      { prompt: "Ile procent uczniów wybiera rozmowę lub czytanie?", answer: 50 },
    ],
  },
  {
    title: "Ulubione aktywności w klasach 6A i 6B",
    kind: "bars",
    series: [
      { name: "klasa 6A", color: "#4f46e5" },
      { name: "klasa 6B", color: "#f97316" },
    ],
    categories: [
      { label: "sport", values: [40, 30] },
      { label: "muzyka", values: [25, 35] },
      { label: "sztuka", values: [20, 15] },
      { label: "nauka", values: [15, 20] },
    ],
    questions: [
      { prompt: "Ile procent klasy 6B wybrało muzykę?", answer: 35 },
      { prompt: "Ile procent klasy 6A wybrało sport lub muzykę?", answer: 65 },
      { prompt: "Ile procent klasy 6A wybrało sztukę lub naukę?", answer: 35 },
    ],
  },
  {
    title: "Dojazd do szkoły w klasach 6A i 6B",
    kind: "bars",
    series: [
      { name: "klasa 6A", color: "#0891b2" },
      { name: "klasa 6B", color: "#db2777" },
    ],
    categories: [
      { label: "pieszo", values: [30, 25] },
      { label: "rower", values: [20, 30] },
      { label: "autobus", values: [35, 25] },
      { label: "samochód", values: [15, 20] },
    ],
    questions: [
      { prompt: "Ile procent klasy 6A jeździ autobusem?", answer: 35 },
      { prompt: "Ile procent klasy 6B jeździ rowerem lub autobusem?", answer: 55 },
      { prompt: "Ile procent klasy 6B dociera pieszo lub samochodem?", answer: 45 },
    ],
  },
  {
    title: "Wybór owoców w dwóch grupach",
    kind: "bars",
    series: [
      { name: "grupa I", color: "#16a34a" },
      { name: "grupa II", color: "#7c3aed" },
    ],
    categories: [
      { label: "jabłka", values: [45, 30] },
      { label: "gruszki", values: [20, 25] },
      { label: "śliwki", values: [15, 25] },
      { label: "banany", values: [20, 20] },
    ],
    questions: [
      { prompt: "Ile procent grupy I wybrało jabłka?", answer: 45 },
      { prompt: "Ile procent grupy II wybrało gruszki lub śliwki?", answer: 50 },
      { prompt: "Ile procent grupy I wybrało jabłka lub banany?", answer: 65 },
    ],
  },
] as const;

export function isPercentDiagramActivity(activity: string): activity is PercentDiagramActivity {
  return activity === "percent-diagrams-guide" || activity === "percent-diagrams-pie" || activity === "percent-diagrams-bars";
}

export function percentDiagramTask(activity: PercentDiagramActivity, seed: number): PercentDiagramTask {
  if (activity === "percent-diagrams-bars") return BAR_TASKS[Math.abs(seed) % BAR_TASKS.length]!;
  return PIE_TASKS[Math.abs(seed) % PIE_TASKS.length]!;
}
