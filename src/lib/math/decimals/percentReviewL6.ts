export type PercentReviewL6Activity =
  | "percent-review-connections"
  | "percent-review-diagrams"
  | "percent-review-stories";

export interface PercentReviewField {
  label: string;
  unit: string;
  answer: number;
  relationLabel?: string;
}

export interface PercentReviewChart {
  kind: "pie" | "bars";
  title: string;
  totalLabel: string;
  categories: readonly { label: string; value: number; color: string; secondValue?: number; hideValue?: boolean }[];
  seriesLabels?: readonly [string, string];
}

export interface PercentReviewL6Task {
  title: string;
  prompt: string;
  icon: string;
  fields: readonly PercentReviewField[];
  chart?: PercentReviewChart;
}

export function isPercentReviewL6Activity(value: string): value is PercentReviewL6Activity {
  return value === "percent-review-connections"
    || value === "percent-review-diagrams"
    || value === "percent-review-stories";
}

const CONNECTION_TASKS: readonly PercentReviewL6Task[] = [
  {
    title: "Dwa etapy sprzedaży",
    prompt: "W księgarni było 160 notesów. Rano sprzedano 35% wszystkich notesów, a po południu 25% z tych, które zostały. Ile notesów sprzedano łącznie?",
    icon: "📚",
    fields: [
      { label: "Wszystkie notesy", unit: "notesów", answer: 160, relationLabel: "100%" },
      { label: "Dziesięć procent", unit: "notesów", answer: 16, relationLabel: "10%" },
      { label: "Pięć procent", unit: "notesów", answer: 8, relationLabel: "5%" },
      { label: "Sprzedano rano", unit: "notesów", answer: 56, relationLabel: "35%" },
      { label: "Zostało po poranku", unit: "notesów", answer: 104, relationLabel: "100% nowej całości" },
      { label: "Sprzedano po południu", unit: "notesów", answer: 26, relationLabel: "25%" },
      { label: "Sprzedano łącznie", unit: "notesów", answer: 82 },
    ],
  },
  {
    title: "Uczestnicy i nieobecni",
    prompt: "45 uczniów stanowi 30% wszystkich zapisanych do szkolnych kół. W dniu spotkania nieobecnych było 20% wszystkich zapisanych. Ilu uczniów było obecnych?",
    icon: "🎓",
    fields: [
      { label: "Dane z zadania", unit: "uczniów", answer: 45, relationLabel: "30%" },
      { label: "Po podzieleniu przez 3", unit: "uczniów", answer: 15, relationLabel: "10%" },
      { label: "Wszystkich zapisanych", unit: "uczniów", answer: 150, relationLabel: "100%" },
      { label: "Nieobecni", unit: "uczniów", answer: 30, relationLabel: "20%" },
      { label: "Obecni", unit: "uczniów", answer: 120, relationLabel: "80%" },
    ],
  },
  {
    title: "Dwie zmiany ceny",
    prompt: "Kurtka kosztowała 320 zł. Najpierw cenę obniżono o 15%, a potem nową cenę podwyższono o 10%. Ile kosztowała kurtka po obu zmianach?",
    icon: "🧥",
    fields: [
      { label: "Cena początkowa", unit: "zł", answer: 320, relationLabel: "100%" },
      { label: "Dziesięć procent ceny", unit: "zł", answer: 32, relationLabel: "10%" },
      { label: "Pięć procent ceny", unit: "zł", answer: 16, relationLabel: "5%" },
      { label: "Kwota obniżki", unit: "zł", answer: 48, relationLabel: "15%" },
      { label: "Cena po obniżce", unit: "zł", answer: 272, relationLabel: "100% nowej ceny" },
      { label: "Kwota podwyżki", unit: "zł", answer: 27.2, relationLabel: "10%" },
      { label: "Cena końcowa", unit: "zł", answer: 299.2, relationLabel: "110%" },
    ],
  },
  {
    title: "Zmiana składu mieszanki",
    prompt: "Mieszanka ważyła 1,5 kg, a owoce stanowiły 40% jej masy. Dodano 0,5 kg samych owoców. Jaki procent nowej mieszanki stanowią owoce?",
    icon: "🍓",
    fields: [
      { label: "Masa mieszanki na początku", unit: "kg", answer: 1.5, relationLabel: "100%" },
      { label: "Dziesięć procent mieszanki", unit: "kg", answer: 0.15, relationLabel: "10%" },
      { label: "Owoce na początku", unit: "kg", answer: 0.6, relationLabel: "40%" },
      { label: "Owoce po dodaniu", unit: "kg", answer: 1.1 },
      { label: "Nowa masa mieszanki", unit: "kg", answer: 2, relationLabel: "100% nowej mieszanki" },
      { label: "Jeden procent nowej mieszanki", unit: "kg", answer: 0.02, relationLabel: "1%" },
      { label: "Owoce w nowej mieszance", unit: "kg", answer: 1.1, relationLabel: "55%" },
      { label: "Wynik końcowy", unit: "%", answer: 55 },
    ],
  },
  {
    title: "Dwa kolejne procenty",
    prompt: "W konkursie wzięło udział 60% z 250 zaproszonych uczniów. Do finału przeszło 40% uczestników. Ilu uczniów przeszło do finału?",
    icon: "🏆",
    fields: [
      { label: "Zaproszeni uczniowie", unit: "uczniów", answer: 250, relationLabel: "100%" },
      { label: "Dziesięć procent zaproszonych", unit: "uczniów", answer: 25, relationLabel: "10%" },
      { label: "Uczestnicy konkursu", unit: "uczniów", answer: 150, relationLabel: "60%" },
      { label: "Dziesięć procent uczestników", unit: "uczniów", answer: 15, relationLabel: "10% nowej całości" },
      { label: "Finaliści", unit: "uczniów", answer: 60, relationLabel: "40%" },
    ],
  },
];

const DIAGRAM_TASKS: readonly PercentReviewL6Task[] = [
  {
    title: "Dojazd rowerem w dwóch klasach",
    prompt: "Klasa 6A liczy 20 uczniów, a klasa 6B — 25 uczniów. Diagram pokazuje procent uczniów dojeżdżających rowerem. Ilu rowerzystów jest w każdej klasie i jaka jest różnica?",
    icon: "🚲",
    chart: { kind: "bars", title: "Dojazd rowerem", totalLabel: "6A: 20 uczniów · 6B: 25 uczniów", seriesLabels: ["6A", "6B"], categories: [{ label: "rower", value: 40, secondValue: 32, color: "#2563eb" }] },
    fields: [
      { label: "Rowerzyści w 6A", unit: "osób", answer: 8 },
      { label: "Rowerzyści w 6B", unit: "osób", answer: 8 },
      { label: "Różnica", unit: "osób", answer: 0 },
    ],
  },
  {
    title: "Głosy w szkolnym plebiscycie",
    prompt: "W plebiscycie oddano 200 głosów. Oblicz brakujący procent kategorii „inne”, a następnie liczbę głosów oddanych na tę kategorię.",
    icon: "🗳️",
    chart: { kind: "pie", title: "Temat szkolnego festynu", totalLabel: "Razem: 200 głosów", categories: [
      { label: "nauka", value: 35, color: "#2563eb" }, { label: "sport", value: 25, color: "#f97316" }, { label: "sztuka", value: 15, color: "#a855f7" }, { label: "inne", value: 25, color: "#10b981", hideValue: true },
    ] },
    fields: [
      { label: "Suma podanych kategorii", unit: "%", answer: 75, relationLabel: "35% + 25% + 15%" },
      { label: "Kategoria „inne”", unit: "%", answer: 25, relationLabel: "100% − 75%" },
      { label: "Wszystkie głosy", unit: "głosów", answer: 200, relationLabel: "100%" },
      { label: "Jeden procent", unit: "głosy", answer: 2, relationLabel: "1%" },
      { label: "Głosy na „inne”", unit: "głosów", answer: 50, relationLabel: "25%" },
    ],
  },
  {
    title: "Dwie grupy pasażerów",
    prompt: "W grupie A jest 30 osób, a w grupie B — 20 osób. Diagram pokazuje procent osób jadących autobusem. Ile osób pojedzie autobusem łącznie?",
    icon: "🚌",
    chart: { kind: "bars", title: "Podróż autobusem", totalLabel: "A: 30 osób · B: 20 osób", seriesLabels: ["A", "B"], categories: [{ label: "autobus", value: 30, secondValue: 40, color: "#0ea5e9" }] },
    fields: [
      { label: "Grupa A", unit: "osób", answer: 9 },
      { label: "Grupa B", unit: "osób", answer: 8 },
      { label: "Razem", unit: "osób", answer: 17 },
    ],
  },
  {
    title: "Książki z dwóch działów",
    prompt: "Biblioteka kupiła 160 książek. Jaki procent i ile książek łącznie stanowią książki naukowe oraz poezja?",
    icon: "📖",
    chart: { kind: "pie", title: "Nowe książki", totalLabel: "Razem: 160 książek", categories: [
      { label: "powieści", value: 45, color: "#f97316" }, { label: "naukowe", value: 15, color: "#2563eb" }, { label: "komiksy", value: 30, color: "#a855f7" }, { label: "poezja", value: 10, color: "#10b981" },
    ] },
    fields: [
      { label: "Naukowe i poezja", unit: "%", answer: 25 },
      { label: "Naukowe i poezja", unit: "książek", answer: 40 },
    ],
  },
  {
    title: "Wyniki dwóch drużyn",
    prompt: "Drużyna Fioletowa zdobyła 80 punktów, a Turkusowa 120 punktów. Diagram pokazuje, jaki procent punktów zdobyły w rundzie finałowej. Która drużyna zdobyła w finale więcej punktów i o ile? Wpisz tylko różnicę.",
    icon: "🎯",
    chart: { kind: "bars", title: "Punkty w finale", totalLabel: "Fioletowa: 80 pkt · Turkusowa: 120 pkt", seriesLabels: ["Fioletowa", "Turkusowa"], categories: [{ label: "finał", value: 50, secondValue: 40, color: "#7c3aed" }] },
    fields: [{ label: "Różnica w finale", unit: "punktów", answer: 8 }],
  },
];

const STORY_TASKS: readonly PercentReviewL6Task[] = [
  {
    title: "Bilety na festyn",
    prompt: "Przygotowano 480 biletów. Przez internet sprzedano 65% wszystkich biletów, a w kasie połowę pozostałych. Ile biletów zostało?",
    icon: "🎟️",
    fields: [
      { label: "Wszystkie bilety", unit: "biletów", answer: 480, relationLabel: "100%" },
      { label: "Dziesięć procent", unit: "biletów", answer: 48, relationLabel: "10%" },
      { label: "Pięć procent", unit: "biletów", answer: 24, relationLabel: "5%" },
      { label: "Sprzedano online", unit: "biletów", answer: 312, relationLabel: "65%" },
      { label: "Zostało po sprzedaży online", unit: "biletów", answer: 168, relationLabel: "100% nowej całości" },
      { label: "Sprzedano w kasie", unit: "biletów", answer: 84, relationLabel: "50%" },
      { label: "Bilety niesprzedane", unit: "biletów", answer: 84, relationLabel: "50%" },
    ],
  },
  {
    title: "Zbiornik z wodą",
    prompt: "Zbiornik mieści 800 l i był pełny. Zużyto 35% jego pojemności, a potem dolano wodę równą 20% pojemności zbiornika. Ile litrów wody jest teraz w zbiorniku?",
    icon: "💧",
    fields: [
      { label: "Pełny zbiornik", unit: "l", answer: 800, relationLabel: "100%" },
      { label: "Dziesięć procent pojemności", unit: "l", answer: 80, relationLabel: "10%" },
      { label: "Pięć procent pojemności", unit: "l", answer: 40, relationLabel: "5%" },
      { label: "Zużyto", unit: "l", answer: 280, relationLabel: "35%" },
      { label: "Zostało po zużyciu", unit: "l", answer: 520, relationLabel: "65%" },
      { label: "Dolano", unit: "l", answer: 160, relationLabel: "20%" },
      { label: "W zbiorniku jest", unit: "l", answer: 680, relationLabel: "85%" },
    ],
  },
  {
    title: "Zbiórka charytatywna",
    prompt: "Celem zbiórki było 2400 zł. Pierwszego dnia zebrano 45% celu, a drugiego dnia 30% celu. Ile złotych brakuje do osiągnięcia celu?",
    icon: "🤝",
    fields: [
      { label: "Cel zbiórki", unit: "zł", answer: 2400, relationLabel: "100%" },
      { label: "Dziesięć procent celu", unit: "zł", answer: 240, relationLabel: "10%" },
      { label: "Pięć procent celu", unit: "zł", answer: 120, relationLabel: "5%" },
      { label: "Pierwszy dzień", unit: "zł", answer: 1080, relationLabel: "45%" },
      { label: "Drugi dzień", unit: "zł", answer: 720, relationLabel: "30%" },
      { label: "Zebrano łącznie", unit: "zł", answer: 1800, relationLabel: "75%" },
      { label: "Brakuje", unit: "zł", answer: 600, relationLabel: "25%" },
    ],
  },
  {
    title: "Sadzonki do ogrodu",
    prompt: "Przygotowano 300 sadzonek. Zioła stanowią 20%, a kwiaty 35% wszystkich sadzonek. Pozostałe to warzywa. Ile jest sadzonek warzyw?",
    icon: "🌱",
    fields: [
      { label: "Wszystkie sadzonki", unit: "sadzonek", answer: 300, relationLabel: "100%" },
      { label: "Dziesięć procent", unit: "sadzonek", answer: 30, relationLabel: "10%" },
      { label: "Pięć procent", unit: "sadzonek", answer: 15, relationLabel: "5%" },
      { label: "Zioła", unit: "sadzonek", answer: 60, relationLabel: "20%" },
      { label: "Kwiaty", unit: "sadzonek", answer: 105, relationLabel: "35%" },
      { label: "Zioła i kwiaty razem", unit: "sadzonek", answer: 165, relationLabel: "55%" },
      { label: "Warzywa", unit: "sadzonek", answer: 135, relationLabel: "45%" },
    ],
  },
  {
    title: "Oszczędności i zakup",
    prompt: "Oszczędności w wysokości 500 zł zwiększyły się o 12%. Następnie wydano 20% nowej kwoty. Ile pieniędzy zostało?",
    icon: "🐷",
    fields: [
      { label: "Oszczędności początkowe", unit: "zł", answer: 500, relationLabel: "100%" },
      { label: "Dziesięć procent", unit: "zł", answer: 50, relationLabel: "10%" },
      { label: "Dwa procent", unit: "zł", answer: 10, relationLabel: "2%" },
      { label: "Kwota zwiększenia", unit: "zł", answer: 60, relationLabel: "12%" },
      { label: "Po zwiększeniu", unit: "zł", answer: 560, relationLabel: "100% nowej kwoty" },
      { label: "Wydano", unit: "zł", answer: 112, relationLabel: "20%" },
      { label: "Zostało", unit: "zł", answer: 448, relationLabel: "80%" },
    ],
  },
];

export function percentReviewL6Task(activity: PercentReviewL6Activity, seed: number): PercentReviewL6Task {
  const tasks = activity === "percent-review-connections" ? CONNECTION_TASKS : activity === "percent-review-diagrams" ? DIAGRAM_TASKS : STORY_TASKS;
  return tasks[Math.abs(seed) % tasks.length]!;
}

export function parsePercentReviewNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized || !/^-?\d+(?:\.\d+)?$/u.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isPercentReviewFinalAnswerCorrect(task: PercentReviewL6Task, answers: readonly string[]): boolean {
  const finalAnswer = parsePercentReviewNumber(answers[task.fields.length - 1] ?? "");
  return finalAnswer !== null && Math.abs(finalAnswer - task.fields[task.fields.length - 1]!.answer) < 0.000001;
}
