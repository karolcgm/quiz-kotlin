import type { LessonDifficulty } from "@/types/lessonPackage";

export type PercentFractionL1Activity =
  | "percent-remember"
  | "percent-grid"
  | "percent-story"
  | "percent-six-remember"
  | "percent-six-convert"
  | "percent-six-grid"
  | "percent-six-story";

export interface PercentFractionL1Task {
  activity: PercentFractionL1Activity;
  percent: number;
  numerator: number;
  denominator: number;
  decimal: string;
  prompt: string;
  story?: string;
  question?: string;
}

const BASICS = [
  { percent: 10, numerator: 1, denominator: 10, decimal: "0,1" },
  { percent: 20, numerator: 1, denominator: 5, decimal: "0,2" },
  { percent: 25, numerator: 1, denominator: 4, decimal: "0,25" },
  { percent: 50, numerator: 1, denominator: 2, decimal: "0,5" },
  { percent: 100, numerator: 1, denominator: 1, decimal: "1,0" },
] as const;

const GRADE_SIX_CONVERSIONS = [
  { percent: 1, numerator: 1, denominator: 100, decimal: "0,01" },
  { percent: 5, numerator: 1, denominator: 20, decimal: "0,05" },
  { percent: 10, numerator: 1, denominator: 10, decimal: "0,1" },
  { percent: 12, numerator: 3, denominator: 25, decimal: "0,12" },
  { percent: 20, numerator: 1, denominator: 5, decimal: "0,2" },
  { percent: 25, numerator: 1, denominator: 4, decimal: "0,25" },
  { percent: 40, numerator: 2, denominator: 5, decimal: "0,4" },
  { percent: 50, numerator: 1, denominator: 2, decimal: "0,5" },
  { percent: 75, numerator: 3, denominator: 4, decimal: "0,75" },
  { percent: 80, numerator: 4, denominator: 5, decimal: "0,8" },
] as const;

const GRADE_SIX_GRID_PERCENTAGES = [
  { percent: 38, numerator: 19, denominator: 50, decimal: "0,38" },
  { percent: 67, numerator: 67, denominator: 100, decimal: "0,67" },
  { percent: 14, numerator: 7, denominator: 50, decimal: "0,14" },
  { percent: 53, numerator: 53, denominator: 100, decimal: "0,53" },
  { percent: 82, numerator: 41, denominator: 50, decimal: "0,82" },
] as const;

const STORY_TASKS = [
  { percent: 20, numerator: 1, denominator: 5, story: "Co piąty uczeń w klasie ma w domu zwierzę.", question: "Ile procent uczniów ma zwierzę?" },
  { percent: 10, numerator: 1, denominator: 10, story: "Co dziesiąty uczestnik szkolnego biegu otrzymał zieloną opaskę.", question: "Jaki procent uczestników otrzymał zieloną opaskę?" },
  { percent: 25, numerator: 1, denominator: 4, story: "Jedno dziecko na czworo chodzi na zajęcia szachowe.", question: "Ile procent dzieci chodzi na zajęcia szachowe?" },
  { percent: 50, numerator: 1, denominator: 2, story: "Połowa uczniów z koła plastycznego przyniosła własne farby.", question: "Ile procent uczniów przyniosło własne farby?" },
  { percent: 100, numerator: 1, denominator: 1, story: "Wszyscy uczniowie obecni na wycieczce założyli kamizelki odblaskowe.", question: "Ile procent obecnych uczniów założyło kamizelki?" },
  { percent: 20, numerator: 1, denominator: 5, story: "W bibliotece co piąta wypożyczona książka była książką przygodową.", question: "Jaki procent wypożyczonych książek był przygodowy?" },
  { percent: 10, numerator: 1, denominator: 10, story: "Jedno z dziesięciorga dzieci w świetlicy wybrało grę planszową.", question: "Ile procent dzieci wybrało grę planszową?" },
  { percent: 25, numerator: 1, denominator: 4, story: "Czwarta część uczniów dojeżdża do szkoły rowerem.", question: "Ile procent uczniów dojeżdża rowerem?" },
  { percent: 50, numerator: 1, denominator: 2, story: "Połowa sadzonek w klasowym ogródku to zioła.", question: "Jaki procent sadzonek stanowią zioła?" },
  { percent: 100, numerator: 1, denominator: 1, story: "Każdy uczestnik konkursu oddał swoją kartę odpowiedzi.", question: "Ile procent uczestników oddało kartę odpowiedzi?" },
] as const;

export function isPercentFractionL1Activity(value: string): value is PercentFractionL1Activity {
  return value === "percent-remember"
    || value === "percent-grid"
    || value === "percent-story"
    || value === "percent-six-remember"
    || value === "percent-six-convert"
    || value === "percent-six-grid"
    || value === "percent-six-story";
}

export function createPercentFractionL1Task({ seed, activity }: { seed: number; activity: PercentFractionL1Activity; difficulty?: LessonDifficulty }): PercentFractionL1Task {
  if (activity === "percent-six-remember" || activity === "percent-six-convert") {
    const conversion = GRADE_SIX_CONVERSIONS[seed % GRADE_SIX_CONVERSIONS.length]!;
    return {
      activity,
      ...conversion,
      prompt: activity === "percent-six-remember"
        ? "Poznaj najważniejsze połączenia procentu, ułamka zwykłego i ułamka dziesiętnego."
        : "Zamień procent na nieskracalny ułamek zwykły i ułamek dziesiętny.",
    };
  }
  if (activity === "percent-six-grid") {
    const gridPercentage = GRADE_SIX_GRID_PERCENTAGES[seed % GRADE_SIX_GRID_PERCENTAGES.length]!;
    return {
      activity,
      ...gridPercentage,
      prompt: `Zaznacz ${gridPercentage.percent}% na kratownicy 10 × 10.`,
    };
  }
  const basic = BASICS[seed % BASICS.length]!;
  if (activity === "percent-story" || activity === "percent-six-story") {
    const story = STORY_TASKS[seed % STORY_TASKS.length]!;
    return { activity, ...story, decimal: BASICS.find((item) => item.percent === story.percent)!.decimal, prompt: "Zapisz procent odpowiadający podanej części całości." };
  }
  return {
    activity,
    ...basic,
    prompt: activity === "percent-grid" ? `Zaznacz ${basic.percent}% na kratownicy 10 × 10.` : "Zapamiętaj pięć podstawowych procentów.",
  };
}
