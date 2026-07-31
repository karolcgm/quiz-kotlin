import type { LessonDifficulty } from "@/types/lessonPackage";

export type PercentChangeActivity =
  | "percent-change-discount-example"
  | "percent-change-discount-practice"
  | "percent-change-products"
  | "percent-change-raise-example"
  | "percent-change-raise-practice"
  | "percent-change-salaries";

export interface PercentChangeTask {
  id: string;
  kind: "discount" | "increase";
  original: number;
  percent: number;
  change: number;
  final: number;
  unit: string;
  prompt: string;
  label: string;
  imageSrc?: string;
  imageAlt?: string;
}

const discountTasks: readonly PercentChangeTask[] = [
  { id: "discount-40", kind: "discount", original: 40, percent: 10, change: 4, final: 36, unit: "zł", label: "O 10% mniej", prompt: "Oblicz wartość o 10% mniejszą od 40 zł." },
  { id: "discount-150", kind: "discount", original: 150, percent: 20, change: 30, final: 120, unit: "zł", label: "O 20% mniej", prompt: "Oblicz wartość o 20% mniejszą od 150 zł." },
  { id: "discount-280", kind: "discount", original: 280, percent: 25, change: 70, final: 210, unit: "zł", label: "Obniżka o 25%", prompt: "Cena 280 zł została obniżona o 25%. Oblicz nową cenę." },
  { id: "discount-360", kind: "discount", original: 360, percent: 15, change: 54, final: 306, unit: "zł", label: "Obniżka o 15%", prompt: "Cena 360 zł została obniżona o 15%. Oblicz nową cenę." },
  { id: "discount-640", kind: "discount", original: 640, percent: 30, change: 192, final: 448, unit: "zł", label: "Obniżka o 30%", prompt: "Cena 640 zł została obniżona o 30%. Oblicz nową cenę." },
];

const increaseTasks: readonly PercentChangeTask[] = [
  { id: "increase-40", kind: "increase", original: 40, percent: 10, change: 4, final: 44, unit: "zł", label: "O 10% więcej", prompt: "Oblicz wartość o 10% większą od 40 zł." },
  { id: "increase-240", kind: "increase", original: 240, percent: 25, change: 60, final: 300, unit: "zł", label: "O 25% więcej", prompt: "Oblicz wartość o 25% większą od 240 zł." },
  { id: "increase-1500", kind: "increase", original: 1500, percent: 12, change: 180, final: 1680, unit: "zł", label: "Podwyżka o 12%", prompt: "Kwotę 1500 zł podwyższono o 12%. Oblicz nową wartość." },
  { id: "increase-3200", kind: "increase", original: 3200, percent: 8, change: 256, final: 3456, unit: "zł", label: "Podwyżka o 8%", prompt: "Kwotę 3200 zł podwyższono o 8%. Oblicz nową wartość." },
  { id: "increase-4500", kind: "increase", original: 4500, percent: 15, change: 675, final: 5175, unit: "zł", label: "Podwyżka o 15%", prompt: "Kwotę 4500 zł podwyższono o 15%. Oblicz nową wartość." },
];

const productTasks: readonly PercentChangeTask[] = [
  { id: "backpack", kind: "discount", original: 180, percent: 20, change: 36, final: 144, unit: "zł", label: "Plecak", prompt: "Plecak kosztował 180 zł. Cenę obniżono o 20%. Ile kosztuje teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
  { id: "shoes", kind: "discount", original: 240, percent: 25, change: 60, final: 180, unit: "zł", label: "Buty sportowe", prompt: "Buty sportowe kosztowały 240 zł. Cenę obniżono o 25%. Ile kosztują teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
  { id: "headphones", kind: "discount", original: 320, percent: 15, change: 48, final: 272, unit: "zł", label: "Słuchawki", prompt: "Słuchawki kosztowały 320 zł. Cenę obniżono o 15%. Ile kosztują teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
  { id: "lamp", kind: "discount", original: 120, percent: 30, change: 36, final: 84, unit: "zł", label: "Lampka", prompt: "Lampka kosztowała 120 zł. Cenę obniżono o 30%. Ile kosztuje teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
  { id: "game", kind: "discount", original: 160, percent: 10, change: 16, final: 144, unit: "zł", label: "Gra planszowa", prompt: "Gra planszowa kosztowała 160 zł. Cenę obniżono o 10%. Ile kosztuje teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
  { id: "bottle", kind: "discount", original: 80, percent: 35, change: 28, final: 52, unit: "zł", label: "Butelka", prompt: "Butelka kosztowała 80 zł. Cenę obniżono o 35%. Ile kosztuje teraz?", imageSrc: "/images/lessons/class6/percent-change/store-discounts.png", imageAlt: "Kolorowa wystawa sklepu z sześcioma produktami." },
];

const salaryTasks: readonly PercentChangeTask[] = [
  { id: "nurse", kind: "increase", original: 5200, percent: 10, change: 520, final: 5720, unit: "zł", label: "Pielęgniarka", prompt: "Wynagrodzenie pielęgniarki wynosiło 5200 zł. Otrzymała podwyżkę o 10%. Oblicz nowe wynagrodzenie.", imageSrc: "/images/lessons/class6/percent-change/salary-increases.png", imageAlt: "Czworo pracowników różnych zawodów." },
  { id: "laboratory", kind: "increase", original: 4800, percent: 15, change: 720, final: 5520, unit: "zł", label: "Laborant", prompt: "Wynagrodzenie laboranta wynosiło 4800 zł. Otrzymał podwyżkę o 15%. Oblicz nowe wynagrodzenie.", imageSrc: "/images/lessons/class6/percent-change/salary-increases.png", imageAlt: "Czworo pracowników różnych zawodów." },
  { id: "office", kind: "increase", original: 4500, percent: 8, change: 360, final: 4860, unit: "zł", label: "Pracowniczka biura", prompt: "Wynagrodzenie pracowniczki biura wynosiło 4500 zł. Otrzymała podwyżkę o 8%. Oblicz nowe wynagrodzenie.", imageSrc: "/images/lessons/class6/percent-change/salary-increases.png", imageAlt: "Czworo pracowników różnych zawodów." },
  { id: "mechanic", kind: "increase", original: 5000, percent: 12, change: 600, final: 5600, unit: "zł", label: "Mechanik", prompt: "Wynagrodzenie mechanika wynosiło 5000 zł. Otrzymał podwyżkę o 12%. Oblicz nowe wynagrodzenie.", imageSrc: "/images/lessons/class6/percent-change/salary-increases.png", imageAlt: "Czworo pracowników różnych zawodów." },
];

export function isPercentChangeActivity(activity: string): activity is PercentChangeActivity {
  return activity.startsWith("percent-change-");
}

export function createPercentChangeTask({ seed, activity }: { seed: number; activity: PercentChangeActivity; difficulty?: LessonDifficulty }): PercentChangeTask {
  if (activity === "percent-change-discount-example") return { id: "discount-example", kind: "discount", original: 80, percent: 25, change: 20, final: 60, unit: "zł", label: "Przykład obniżki", prompt: "Cena 80 zł została obniżona o 25%." };
  if (activity === "percent-change-raise-example") return { id: "raise-example", kind: "increase", original: 3200, percent: 10, change: 320, final: 3520, unit: "zł", label: "Przykład podwyżki", prompt: "Wynagrodzenie 3200 zł podwyższono o 10%." };
  const source = activity === "percent-change-products" ? productTasks : activity === "percent-change-salaries" ? salaryTasks : activity === "percent-change-raise-practice" ? increaseTasks : discountTasks;
  return source[Math.abs(seed) % source.length]!;
}
