import type { LessonDifficulty } from "@/types/lessonPackage";

export type PercentFractionL1Activity =
  | "percent-remember"
  | "percent-grid"
  | "percent-story"
  | "percent-six-remember"
  | "percent-six-convert"
  | "percent-six-grid"
  | "percent-six-story"
  | "percent-six-what-example"
  | "percent-six-what-practice";

export interface PercentFractionL1Task {
  activity: PercentFractionL1Activity;
  percent: number;
  numerator: number;
  denominator: number;
  decimal: string;
  prompt: string;
  story?: string;
  question?: string;
  imageSrc?: string;
  imageAlt?: string;
  whole?: number;
  part?: number;
  divisor?: number;
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

const GRADE_SIX_WHAT_PERCENT_TASKS = [
  { whole: 250, part: 50, divisor: 5, percent: 20, story: "W grupie jest 250 dziewcząt. 50 z nich ma na sobie spódniczki. Jaki procent dziewcząt ma na sobie spódniczki?" },
  { whole: 240, part: 60, divisor: 4, percent: 25, story: "W szkolnym turnieju bierze udział 240 uczniów. 60 z nich reprezentuje klasy szóste. Jaki procent uczestników stanowią szóstoklasiści?" },
  { whole: 180, part: 90, divisor: 2, percent: 50, story: "Biblioteka ma 180 nowych książek. 90 z nich to powieści. Jaki procent nowych książek stanowią powieści?" },
  { whole: 450, part: 45, divisor: 10, percent: 10, story: "Na widowni przygotowano 450 miejsc. 45 miejsc znajduje się w pierwszym rzędzie. Jaki procent miejsc jest w pierwszym rzędzie?" },
  { whole: 300, part: 15, divisor: 20, percent: 5, story: "W magazynie jest 300 piłek. 15 z nich jest czerwonych. Jaki procent piłek jest czerwonych?" },
  { whole: 500, part: 20, divisor: 25, percent: 4, story: "W sadzie rośnie 500 drzew. 20 z nich to grusze. Jaki procent drzew stanowią grusze?" },
  { whole: 700, part: 14, divisor: 50, percent: 2, story: "W parku posadzono 700 roślin. 14 z nich to róże. Jaki procent roślin stanowią róże?" },
  { whole: 1000, part: 10, divisor: 100, percent: 1, story: "W drukarni przygotowano 1000 plakatów. 10 z nich przeznaczono na wystawę. Jaki procent plakatów przeznaczono na wystawę?" },
  { whole: 350, part: 70, divisor: 5, percent: 20, story: "W szkole uczy się 350 osób. 70 z nich należy do koła sportowego. Jaki procent uczniów należy do koła sportowego?" },
  { whole: 800, part: 200, divisor: 4, percent: 25, story: "Fabryka wyprodukowała 800 kubków. 200 kubków jest niebieskich. Jaki procent kubków jest niebieskich?" },
] as const;

const STORY_TASKS = [
  { percent: 20, numerator: 1, denominator: 5, story: "Co piąty uczeń w klasie ma w domu zwierzę.", question: "Ile procent uczniów ma zwierzę?", imageSrc: "/images/lessons/class6/percent-stories/pets.webp", imageAlt: "Uczniowie opowiadający o swoich domowych zwierzętach" },
  { percent: 10, numerator: 1, denominator: 10, story: "Co dziesiąty uczestnik szkolnego biegu otrzymał zieloną opaskę.", question: "Jaki procent uczestników otrzymał zieloną opaskę?", imageSrc: "/images/lessons/class6/percent-stories/school-race.webp", imageAlt: "Uczestnicy szkolnego biegu i zielona opaska" },
  { percent: 25, numerator: 1, denominator: 4, story: "Jedno dziecko na czworo chodzi na zajęcia szachowe.", question: "Ile procent dzieci chodzi na zajęcia szachowe?", imageSrc: "/images/lessons/class6/percent-stories/chess-club.webp", imageAlt: "Dzieci podczas zajęć szachowych" },
  { percent: 50, numerator: 1, denominator: 2, story: "Połowa uczniów z koła plastycznego przyniosła własne farby.", question: "Ile procent uczniów przyniosło własne farby?", imageSrc: "/images/lessons/class6/percent-stories/art-club.webp", imageAlt: "Uczniowie koła plastycznego z farbami" },
  { percent: 100, numerator: 1, denominator: 1, story: "Wszyscy uczniowie obecni na wycieczce założyli kamizelki odblaskowe.", question: "Ile procent obecnych uczniów założyło kamizelki?", imageSrc: "/images/lessons/class6/percent-stories/school-trip.webp", imageAlt: "Uczniowie na wycieczce w kamizelkach odblaskowych" },
  { percent: 20, numerator: 1, denominator: 5, story: "W bibliotece co piąta wypożyczona książka była książką przygodową.", question: "Jaki procent wypożyczonych książek był przygodowy?", imageSrc: "/images/lessons/class6/percent-stories/library.webp", imageAlt: "Uczniowie wybierający książki przygodowe w bibliotece" },
  { percent: 10, numerator: 1, denominator: 10, story: "Jedno z dziesięciorga dzieci w świetlicy wybrało grę planszową.", question: "Ile procent dzieci wybrało grę planszową?", imageSrc: "/images/lessons/class6/percent-stories/board-game.webp", imageAlt: "Dzieci wybierające grę planszową w świetlicy" },
  { percent: 25, numerator: 1, denominator: 4, story: "Czwarta część uczniów dojeżdża do szkoły rowerem.", question: "Ile procent uczniów dojeżdża rowerem?", imageSrc: "/images/lessons/class6/percent-stories/cycling.webp", imageAlt: "Uczniowie przyjeżdżający rowerami do szkoły" },
  { percent: 50, numerator: 1, denominator: 2, story: "Połowa sadzonek w klasowym ogródku to zioła.", question: "Jaki procent sadzonek stanowią zioła?", imageSrc: "/images/lessons/class6/percent-stories/class-garden.webp", imageAlt: "Uczniowie pielęgnujący zioła w klasowym ogródku" },
  { percent: 100, numerator: 1, denominator: 1, story: "Każdy uczestnik konkursu oddał swoją kartę odpowiedzi.", question: "Ile procent uczestników oddało kartę odpowiedzi?", imageSrc: "/images/lessons/class6/percent-stories/school-contest.webp", imageAlt: "Uczniowie oddający karty odpowiedzi w szkolnym konkursie" },
] as const;

export function isPercentFractionL1Activity(value: string): value is PercentFractionL1Activity {
  return value === "percent-remember"
    || value === "percent-grid"
    || value === "percent-story"
    || value === "percent-six-remember"
    || value === "percent-six-convert"
    || value === "percent-six-grid"
    || value === "percent-six-story"
    || value === "percent-six-what-example"
    || value === "percent-six-what-practice";
}

export function createPercentFractionL1Task({ seed, activity }: { seed: number; activity: PercentFractionL1Activity; difficulty?: LessonDifficulty }): PercentFractionL1Task {
  if (activity === "percent-six-what-example" || activity === "percent-six-what-practice") {
    const item = activity === "percent-six-what-example"
      ? GRADE_SIX_WHAT_PERCENT_TASKS[0]
      : GRADE_SIX_WHAT_PERCENT_TASKS[seed % GRADE_SIX_WHAT_PERCENT_TASKS.length]!;
    return {
      activity,
      percent: item.percent,
      numerator: item.part,
      denominator: item.whole,
      decimal: String(item.percent / 100).replace(".", ","),
      whole: item.whole,
      part: item.part,
      divisor: item.divisor,
      story: item.story,
      prompt: activity === "percent-six-what-example"
        ? "Zobacz, jak tę samą operację wykonujemy po obu stronach proporcji."
        : "Uzupełnij brakujący procent, wykonując tę samą operację po obu stronach proporcji.",
    };
  }
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
