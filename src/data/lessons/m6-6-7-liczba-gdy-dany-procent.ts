import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const questions = Array.from({ length: 6 }, (_, index) => ({
  id: `m6-6-7-whole-from-percent-${index + 1}`,
  seed: 667200 + index,
  difficulty: (index < 4 ? "core" : "challenge") as "core" | "challenge",
  skillIds: ["M6-6.7-whole-from-percent"],
  feedbackPolicy: {
    mode: "assessment" as const,
    allowsPartialCredit: false,
    manualReview: "never" as const,
    feedbackKeys: ["correct", "incorrect", "missing-answer"],
  },
}));

export const m667LiczbaGdyDanyProcentV1 = buildLessonPackage({
  id: "m6-6-7-liczba-gdy-dany-procent-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S6",
  topicId: "M6-6.7",
  lessonNumber: 7,
  title: "Obliczanie liczby, gdy dany jest jej procent",
  studentGoal: "Nauczę się obliczać liczbę, gdy znam wartość jej procentu.",
  successCriteria: [
    "Ustalam, która wartość odpowiada 100%.",
    "Wykonuję tę samą operację po obu stronach schematu procentowego.",
  ],
  skillIds: ["M6-6.7-whole-from-percent"],
  prerequisiteSkillIds: ["M6-6.5-percent-of-number"],
  estimatedMinutes: 25,
  coreLesson: "Obliczanie całości, gdy znana jest wartość wybranego procentu.",
  paperEvidence: "Zeszyt ucznia: jeden poprawnie uzupełniony schemat prowadzący do 100%.",
  overview: "Krótki temat dodatkowy. Uczeń od podanego procentu przechodzi do 100%, wykonując tę samą operację po obu stronach schematu.",
  openingScript: "Przypomnij, że szukana całość zawsze odpowiada 100%.",
  closingScript: "Poproś uczniów o wskazanie, która liczba w ostatnim schemacie oznaczała całość.",
  commonMisconceptions: [
    "Uczeń traktuje podaną wartość jako 100%.",
    "Uczeń wykonuje inną operację po stronie liczby i po stronie procentu.",
    "Uczeń zatrzymuje obliczenia na 10% albo 25%, zamiast dojść do 100%.",
  ],
  stageBlueprints: [
    {
      suffix: "whole-from-percent-example",
      kind: "worked-example",
      title: "Jak znaleźć 100%?",
      minutes: 7,
      headline: "Szukamy całej liczby",
      body: "Jeżeli 50% liczby to 30, pomnóż obie strony schematu przez 2, aby otrzymać 100%.",
      modelId: "decimal-notation-l1",
      preserveTaskTitle: true,
      studentInstruction: "Prześledź tę samą operację wykonaną po obu stronach schematu.",
      teacherInstruction: "Podkreśl, że wynik przy 100% jest szukaną liczbą.",
    },
    {
      suffix: "whole-from-percent-practice",
      kind: "practice",
      title: "Obliczanie liczby, gdy dany jest jej procent",
      minutes: 15,
      headline: "Dojdź do 100%",
      body: "Uzupełnij schemat. W prostych zadaniach przejdziesz do 100% jednym krokiem, a w trudniejszych — dwoma.",
      modelId: "decimal-notation-l1",
      preserveTaskTitle: true,
      questions,
      studentInstruction: "Uzupełnij wymagane kratki i zatwierdź wszystkie pola raz na końcu.",
      teacherInstruction: "Pierwsze zadania wykorzystują 50%, 25% i 10%. Dwa ostatnie wymagają etapu pośredniego.",
    },
  ],
  status: "published",
});
