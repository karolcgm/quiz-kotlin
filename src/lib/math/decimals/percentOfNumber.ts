import type { LessonDifficulty } from "@/types/lessonPackage";

export type PercentOfNumberActivity =
  | "percent-six-of-example"
  | "percent-six-of-practice"
  | "percent-six-of-story-example"
  | "percent-six-of-table"
  | "percent-six-of-story";

export interface PercentOfNumberTask {
  activity: PercentOfNumberActivity;
  percent: number;
  whole: number;
  unit: string;
  basePercent: number;
  divisor: number;
  multiplier: number;
  answer: number;
  prompt: string;
  story?: string;
  tableRows?: readonly { percent: number; answer: number }[];
}

const PRACTICE = [
  { percent: 30, whole: 40, unit: "", basePercent: 10, divisor: 10, multiplier: 3 },
  { percent: 20, whole: 250, unit: "zł", basePercent: 10, divisor: 10, multiplier: 2 },
  { percent: 60, whole: 70, unit: "kg", basePercent: 10, divisor: 10, multiplier: 6 },
  { percent: 40, whole: 45, unit: "km", basePercent: 10, divisor: 10, multiplier: 4 },
  { percent: 150, whole: 18, unit: "zł", basePercent: 50, divisor: 2, multiplier: 3 },
  { percent: 70, whole: 90, unit: "g", basePercent: 10, divisor: 10, multiplier: 7 },
  { percent: 120, whole: 50, unit: "zł", basePercent: 10, divisor: 10, multiplier: 12 },
  { percent: 5, whole: 240, unit: "kg", basePercent: 1, divisor: 100, multiplier: 5 },
  { percent: 90, whole: 130, unit: "m", basePercent: 10, divisor: 10, multiplier: 9 },
  { percent: 35, whole: 80, unit: "zł", basePercent: 5, divisor: 20, multiplier: 7 },
] as const;

const TABLE_AMOUNTS = [
  { whole: 200, unit: "zł" },
  { whole: 50, unit: "zł" },
  { whole: 300, unit: "kg" },
  { whole: 80, unit: "km" },
] as const;

const STORIES = [
  { percent: 40, whole: 250, unit: "l", basePercent: 10, divisor: 10, multiplier: 4, story: "Zbiornik mieści 250 litrów wody. Napełniono 40% jego pojemności. Ile litrów wody wlano?" },
  { percent: 75, whole: 24, unit: "kg", basePercent: 25, divisor: 4, multiplier: 3, story: "Do szkolnej kuchni dostarczono 24 kg jabłek. Na kompot przeznaczono 75% jabłek. Ile kilogramów wykorzystano?" },
  { percent: 150, whole: 1200, unit: "zł", basePercent: 50, divisor: 2, multiplier: 3, story: "Cena roweru wynosi 1200 zł. Wartość zestawu z dodatkowym wyposażeniem stanowi 150% ceny roweru. Ile kosztuje zestaw?" },
  { percent: 20, whole: 35, unit: "km", basePercent: 10, divisor: 10, multiplier: 2, story: "Trasa wycieczki ma 35 km. Grupa przeszła 20% całej trasy. Ile kilometrów pokonała?" },
  { percent: 60, whole: 90, unit: "biletów", basePercent: 10, divisor: 10, multiplier: 6, story: "Na koncert przygotowano 90 biletów. Sprzedano 60% z nich. Ile biletów sprzedano?" },
  { percent: 5, whole: 360, unit: "g", basePercent: 1, divisor: 100, multiplier: 5, story: "Mieszanka waży 360 g. Suszone owoce stanowią 5% jej masy. Ile gramów owoców zawiera mieszanka?" },
] as const;

export function isPercentOfNumberActivity(value: string): value is PercentOfNumberActivity {
  return value === "percent-six-of-example"
    || value === "percent-six-of-practice"
    || value === "percent-six-of-story-example"
    || value === "percent-six-of-table"
    || value === "percent-six-of-story";
}

export function createPercentOfNumberTask({ seed, activity }: { seed: number; activity: PercentOfNumberActivity; difficulty?: LessonDifficulty }): PercentOfNumberTask {
  if (activity === "percent-six-of-table") {
    const item = TABLE_AMOUNTS[seed % TABLE_AMOUNTS.length]!;
    return {
      activity,
      percent: 10,
      whole: item.whole,
      unit: item.unit,
      basePercent: 10,
      divisor: 10,
      multiplier: 1,
      answer: item.whole / 10,
      prompt: "Oblicz w pamięci kolejne procenty tej samej wartości.",
      tableRows: [1, 10, 30, 70, 90].map((percent) => ({ percent, answer: item.whole * percent / 100 })),
    };
  }

  const source = activity === "percent-six-of-story" || activity === "percent-six-of-story-example" ? STORIES : PRACTICE;
  const item = activity === "percent-six-of-example" || activity === "percent-six-of-story-example"
    ? source[0]!
    : source[seed % source.length]!;
  return {
    activity,
    ...item,
    answer: item.whole * item.percent / 100,
    prompt: activity.includes("story") ? "Odczytaj całość i oblicz wskazany procent." : `Oblicz ${item.percent}% z ${item.whole}${item.unit ? ` ${item.unit}` : ""}.`,
  };
}
