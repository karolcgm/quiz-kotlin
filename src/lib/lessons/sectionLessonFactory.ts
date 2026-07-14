import { buildLessonPackage, type BuildLessonInput, type LessonStageBlueprint } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

export function createSectionLessonBuilder(sectionId: string) {
  const practice = (title: string, items: { expression: string; prompt: string }[]): LessonStageBlueprint => ({
    suffix: "s5",
    kind: "practice",
    title: "Ćwicz",
    minutes: 12,
    headline: title,
    print: {
      worksheetTitle: title,
      instructions: "Oblicz / uzasadnij. Zapisuj z polskim przecinkiem.",
      items: items.map((item, i) => ({ id: `p${i + 1}`, ...item })),
    },
  });

  const exit = (items: { expression: string; prompt: string }[]): LessonStageBlueprint => ({
    suffix: "s6",
    kind: "exit-ticket",
    title: "Bilet wyjścia",
    minutes: 5,
    headline: "Bilet wyjścia",
    print: {
      worksheetTitle: "Bilet wyjścia",
      instructions: "Oddaj po sprawdzeniu.",
      items: items.map((item, i) => ({ id: `e${i + 1}`, ...item })),
    },
  });

  const stdStages = (
    explore: string,
    discuss: string,
    example: string,
    practiceTitle: string,
    practiceItems: { expression: string; prompt: string }[],
    exitItems: { expression: string; prompt: string }[],
    warmup = "Wejście — przypomnienie z poprzedniej lekcji",
    illustration?: { src: string; alt: string },
  ): LessonStageBlueprint[] => [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: warmup },
    { suffix: "s2", kind: "explore", title: "Odkryj", minutes: 10, headline: explore, illustrationSrc: illustration?.src, illustrationAlt: illustration?.alt },
    { suffix: "s3", kind: "discuss", title: "Nazwij", minutes: 6, headline: discuss },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: example },
    practice(practiceTitle, practiceItems),
    exit(exitItems),
  ];

  type SectionInput = Omit<
    BuildLessonInput,
    "sectionId" | "stageBlueprints" | "overview" | "openingScript" | "closingScript" | "commonMisconceptions"
  > & {
    stages: LessonStageBlueprint[];
    overview?: string;
    openingScript?: string;
    closingScript?: string;
    commonMisconceptions?: string[];
  };

  function build(input: SectionInput): LessonPackage {
    const core = input.coreLesson;
    return buildLessonPackage({
      ...input,
      sectionId,
      stageBlueprints: input.stages,
      overview: input.overview ?? `Lekcja ${input.topicId} — ${core}.`,
      openingScript: input.openingScript ?? `„${core} — zaczynamy.”`,
      closingScript: input.closingScript ?? `„${core} — utrwal w zeszytach.”`,
      commonMisconceptions: input.commonMisconceptions ?? ["Mechaniczne przesuwanie przecinka bez zrozumienia wartości pozycji."],
    });
  }

  return { build, stdStages, practice, exit };
}

export function reviewStages(stations: { suffix: string; title: string; minutes: number; headline: string }[]): LessonStageBlueprint[] {
  return [
    { suffix: "s1", kind: "warmup", title: "Mapa", minutes: 5, headline: "Umiem / wrócę do" },
    ...stations.map((s) => ({
      suffix: s.suffix,
      kind: "practice" as const,
      title: s.title,
      minutes: s.minutes,
      headline: s.headline,
      body: "Rozwiąż jedno zadanie podstawowe, jedno problemowe i jedno zadanie z błędem do naprawienia. Po stacji zaznacz: umiem samodzielnie / potrzebuję jeszcze przykładu.",
    })),
    { suffix: "s6", kind: "exit-ticket", title: "Plan domowy", minutes: 5, headline: "Jedno zadanie do domu" },
  ];
}

export function examStages(
  sectionLabel: string,
  partA: { expression: string; prompt: string }[],
  partB: { expression: string; prompt: string }[],
  discussHeadline: string,
): LessonStageBlueprint[] {
  return [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, kalkulator, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: `Sprawdzian ${sectionLabel} — część A`,
        instructions: "Czas: 25 min.",
        items: partA.map((item, i) => ({ id: `a${i + 1}`, ...item })),
      },
    },
    {
      suffix: "s3",
      kind: "exit-ticket",
      title: "Arkusz B",
      minutes: 15,
      headline: "Sprawdzian — część 2",
      print: {
        worksheetTitle: `Sprawdzian ${sectionLabel} — część B`,
        instructions: "Zadania otwarte.",
        items: partB.map((item, i) => ({ id: `b${i + 1}`, ...item })),
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: discussHeadline,
      discussionPrompts: ["Gdzie powstał błąd?", "Jak sprawdzić sens wyniku?"],
    },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Wpisywanie wyników" },
  ];
}
