import { buildLessonPackage, type BuildLessonInput, type LessonStageBlueprint } from "@/lib/lessons/buildLessonPackage";
import { getSection3To5SlideZeroContext } from "@/data/lessons/section3to5-slide-zero";
import { assertLessonSlideZero } from "@/lib/lessons/validateLessonSlideZero";
import { FRACTION_L2_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionLessonL2";
import { FRACTION_QUOTIENT_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionQuotientLesson";
import { FRACTION_EQUIVALENCE_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionEquivalenceLesson";
import { FRACTION_COMPARISON_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionComparisonLesson";
import { FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionSameDenominatorLesson";
import { FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";
import { FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import { FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS } from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import type { LessonPackage } from "@/types/lessonPackage";

const S3 = "M5-S3";

type S3Input = Omit<
  BuildLessonInput,
  "sectionId" | "stageBlueprints" | "overview" | "openingScript" | "closingScript" | "commonMisconceptions"
> & {
  stages: LessonStageBlueprint[];
  overview?: string;
  openingScript?: string;
  closingScript?: string;
  commonMisconceptions?: string[];
  lessonNumber?: number;
};

function withFiveExampleStage(stages: LessonStageBlueprint[]): LessonStageBlueprint[] {
  const targetIndex = stages.findLastIndex((stage) => Boolean(stage.questions?.length));
  if (targetIndex < 0) return stages;
  const target = stages[targetIndex]!;
  const sourceQuestions = target.questions ?? [];
  if (sourceQuestions.length === 0) return stages;
  const questions = Array.from({ length: 5 }, (_, index) => {
    const source = sourceQuestions[index] ?? sourceQuestions[index % sourceQuestions.length]!;
    return index < sourceQuestions.length ? source : {
      ...source,
      id: `${source.id}-extra-${index + 1}`,
      seed: (source.seed ?? 1) + (index + 1) * 1009,
      difficulty: index === 4 ? "challenge" as const : "core" as const,
      skillIds: source.skillIds ? [...source.skillIds] : undefined,
    };
  });
  const sourceItems = target.print?.items ?? [];
  const items = sourceItems.length > 0 ? Array.from({ length: 5 }, (_, index) => {
    const source = sourceItems[index] ?? sourceItems[index % sourceItems.length]!;
    return index < sourceItems.length ? source : {
      ...source,
      id: `${source.id}-extra-${index + 1}`,
      questionId: questions[index]!.id,
      prompt: `${source.prompt} — przykład ${index + 1}.`,
      skillIds: source.skillIds ? [...source.skillIds] : undefined,
    };
  }) : undefined;
  return stages.map((stage, index) => index === targetIndex ? {
    ...stage,
    title: "Ćwiczenia — 5 przykładów",
    headline: "Pięć osobnych przykładów",
    body: "Rozwiąż pięć przykładów po kolei. Każdy przykład ma osobny model, odpowiedź i informację zwrotną.",
    studentInstruction: "Rozwiąż kolejno pięć przykładów. Po każdym sprawdzeniu przejdziesz do następnego.",
    teacherInstruction: "Ten jeden slajd ćwiczeniowy zawiera pięć osobnych przykładów, jak w działach 1–2.",
    questions,
    print: target.print ? { ...target.print, itemCount: 5, items } : target.print,
  } : stage);
}

function s3(input: S3Input): LessonPackage {
  const core = input.coreLesson;
  const slideZero = getSection3To5SlideZeroContext(input.topicId);
  if (!slideZero) throw new Error(`Brak kontraktu slajdu 0 dla ${input.topicId}.`);
  const learningGoals = input.learningGoals ?? slideZero.learningGoals;
  const lesson = assertLessonSlideZero(buildLessonPackage({
    ...input,
    ...slideZero,
    learningGoals,
    sectionId: S3,
    stageBlueprints: withFiveExampleStage(input.stages),
    overview: input.overview ?? `Lekcja ${input.topicId} — ${core}.`,
    openingScript: input.openingScript ?? `„${core} — zaczynamy od modelu.”`,
    closingScript: input.closingScript ?? `„${core} — utrwal zapis w zeszytach.”`,
    commonMisconceptions: input.commonMisconceptions ?? ["Mechaniczne stosowanie reguły bez modelu."],
  }));
  return input.lessonNumber ? { ...lesson, lessonNumber: input.lessonNumber } : lesson;
}

const m531SlideZero = getSection3To5SlideZeroContext("M5-3.1");
if (!m531SlideZero) throw new Error("Brak kontraktu slajdu 0 dla M5-3.1.");

const m531L1SkillIds = ["M5-3.1-part-whole", "M5-3.1-number-line"];
const m531FeedbackKeys = [
  "FRA_EMPTY_PART",
  "FRA_ZERO_DENOMINATOR",
  "FRA_NUM_DEN_SWAPPED",
  "FRA_NOT_EQUIVALENT",
  "FRA_NOT_SIMPLIFIED",
  "FRA_WRONG_OPERATION_PAIR",
  "FRA_UNEQUAL_PARTS",
  "FRA_WHOLE_MISMATCH",
];

export const m531JednaCaloscV1 = s3({
  id: "m5-3-1-ulamki-liczby-mieszane-l1-v1",
  topicId: "M5-3.1",
  title: "Ułamki i liczby mieszane",
  coreLesson: "Ułamki i liczby mieszane — poziom 1",
  paperEvidence: "Karta L1: równy podział tej samej całości, pionowy zapis ułamka i punkt na osi z przypisanymi skillIds.",
  studentGoal: "Uczeń opisuje część tej samej całości ułamkiem i zaznacza ułamki na osi liczbowej.",
  successCriteria: [
    "Potrafię opisywać część całości za pomocą ułamka.",
    "Potrafię zaznaczać ułamki na osi liczbowej.",
  ],
  learningGoals: [m531SlideZero.learningGoals[0]!, m531SlideZero.learningGoals[3]!],
  prerequisiteSkillIds: [],
  skillIds: m531L1SkillIds,
  estimatedMinutes: 45,
  overview: "Poziom L1 prowadzi od równego podziału tej samej całości przez dwukierunkowe przejście model–zapis do położenia ułamka na osi.",
  openingScript: "„Zanim zapiszemy ułamek, upewnijmy się, że dzielimy tę samą całość na równe części.”",
  closingScript: "„Model, pionowy zapis i punkt na osi pokazują tę samą wartość.”",
  commonMisconceptions: [
    "Dzielenie całości na nierówne części.",
    "Porównywanie części różnych całości.",
    "Mylenie licznika z mianownikiem.",
    "Umieszczanie punktu między kreskami zamiast na właściwej podziałce osi.",
  ],
  stages: [
    {
      suffix: "l1-same-whole",
      kind: "explore",
      title: "Ta sama całość",
      minutes: 8,
      headline: "Najpierw ta sama całość i równe części",
      body: "Porównaj pizzę i pasek. Zmieniaj liczbę części i sprawdzaj, czy wszystkie są równe.",
      modelId: "fraction-lesson",
      modelSeed: 31011,
      studentInstruction: "Podziel pizzę i pasek na 2, 3, 4, 6 lub 8 równych części. Sprawdź też, co nie jest poprawnym podziałem.",
      discussionPrompts: ["Po czym poznajesz, że części są równe?", "Dlaczego wielkość całej pizzy musi pozostać taka sama?"],
      print: {
        worksheetTitle: "Ta sama całość — równe części",
        instructions: "Dorysuj równe podziały i zapisz, na ile części podzielono tę samą całość.",
        items: [
          { id: "l1-whole-pizza", skillIds: [m531L1SkillIds[0]!], expression: "Pizza: 4 równe części", prompt: "Zaznacz jedną część i podpisz pionowym ułamkiem.", answerLayout: "fraction-stack" },
          { id: "l1-whole-bar", skillIds: [m531L1SkillIds[0]!], expression: "Pasek: 6 równych części", prompt: "Zaznacz dwie części i podpisz pionowym ułamkiem.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "l1-model-notation",
      kind: "worked-example",
      title: "Z modelu do zapisu",
      minutes: 9,
      headline: "Model ↔ pionowy zapis ułamka",
      body: "Zaznaczenie na pizzy lub pasku zmienia zapis, a zmiana zapisu od razu aktualizuje model.",
      modelId: "fraction-lesson",
      modelSeed: 31012,
      studentInstruction: "Przejdź w obie strony: od modelu do zapisu i od pionowego zapisu do modelu.",
      print: {
        worksheetTitle: "Z modelu do zapisu",
        instructions: "Odczytaj modele i wpisz licznik nad kreską, a mianownik pod kreską.",
        items: [
          { id: "l1-model-write-1", skillIds: [m531L1SkillIds[0]!], expression: "3 zaznaczone z 4 równych części", prompt: "Zapisz ułamek pionowo.", answerLayout: "fraction-stack" },
          { id: "l1-model-write-2", skillIds: [m531L1SkillIds[0]!], expression: "1 zaznaczona z 3 równych części", prompt: "Zapisz ułamek pionowo.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "l1-parts-meaning",
      kind: "discuss",
      title: "Licznik i mianownik",
      minutes: 7,
      headline: "Licznik mówi „ile zaznaczono”, mianownik — „na ile podzielono”",
      modelId: "fraction-lesson",
      modelSeed: 31013,
      studentInstruction: "Wskaż licznik i mianownik, a potem pokaż ich znaczenie na pizzy i pasku.",
      discussionPrompts: ["Która liczba opisuje zaznaczenie?", "Która liczba opisuje wszystkie równe części?"],
      print: {
        worksheetTitle: "Licznik i mianownik",
        instructions: "Podpisz znaczenie obu liczb i połącz je z właściwą cechą modelu.",
        items: [
          { id: "l1-parts-label", skillIds: [m531L1SkillIds[0]!], expression: "2 z 6 równych części", prompt: "Wpisz licznik i mianownik oraz opisz ich znaczenie.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "l1-fraction-axis",
      kind: "practice",
      title: "Oś ułamków",
      minutes: 9,
      headline: "Każda kreska osi oznacza jedną równą część",
      body: "Przesuwaj punkt przyciskami lewo/prawo, suwakiem lub wpisując wartość licznika. Zapis i oś pozostają zsynchronizowane.",
      modelId: "fraction-lesson",
      modelSeed: 31014,
      studentInstruction: "Ustaw punkt dokładnie na kresce osi. Użyj strzałek, pola wartości albo dotyku.",
      print: {
        worksheetTitle: "Oś ułamków",
        instructions: "Podziel odcinek od 0 do 1 na równe części i zaznacz wskazany ułamek.",
        items: [
          { id: "l1-axis-half", skillIds: [m531L1SkillIds[1]!], expression: "1 z 2 równych części", prompt: "Zaznacz punkt na osi.", answerLayout: "fraction-axis" },
          { id: "l1-axis-sixths", skillIds: [m531L1SkillIds[1]!], expression: "5 z 6 równych części", prompt: "Zaznacz punkt na osi.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "l1-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 7,
      headline: "Pokaż tę samą wartość modelem, zapisem i punktem na osi",
      modelId: "fraction-lesson",
      modelSeed: 31015,
      studentInstruction: "Pracuj samodzielnie. Ustaw model, pionowy zapis i punkt na osi, a potem sprawdź odpowiedź.",
      live: { enabled: true, kind: "exercise", minutes: 7 },
      questions: [
        { id: "m531-l1-support", generatorId: "fraction-lesson-l1-v1", seed: 31101, difficulty: "support", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-core", generatorId: "fraction-lesson-l1-v1", seed: 31102, difficulty: "core", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-challenge", generatorId: "fraction-lesson-l1-v1", seed: 31103, difficulty: "challenge", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — ułamki L1",
        instructions: "Dla każdego przykładu wykonaj model lub pionowy zapis oraz zaznacz punkt na osi.",
        items: [
          { id: "m531-l1-print-support", questionId: "m531-l1-support", skillIds: m531L1SkillIds, maxScore: 1, expression: "1 z 2 równych części", prompt: "Zapisz ułamek pionowo i zaznacz go na osi.", answerLayout: "fraction-stack" },
          { id: "m531-l1-print-core", questionId: "m531-l1-core", skillIds: m531L1SkillIds, maxScore: 1, expression: "3 z 4 równych części", prompt: "Zapisz ułamek pionowo i zaznacz go na osi.", answerLayout: "fraction-stack" },
          { id: "m531-l1-print-challenge", questionId: "m531-l1-challenge", skillIds: m531L1SkillIds, maxScore: 1, expression: "5 z 8 równych części", prompt: "Zapisz ułamek pionowo i zaznacz go na osi.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m531L2SkillIds = [
  "M5-3.1-proper-improper",
  "M5-3.1-mixed-conversion",
  "M5-3.1-mixed-number-line",
];

export const m531UlamkiMieszaneL2V1 = s3({
  id: "m5-3-1-ulamki-liczby-mieszane-l2-v1",
  topicId: "M5-3.1",
  lessonNumber: 2,
  title: "Ułamki i liczby mieszane",
  coreLesson: "Ułamki i liczby mieszane — poziom 2",
  paperEvidence: "Karta L2: ułamki właściwe i niewłaściwe, zamiana w obie strony, oś 0–3 oraz zadanie o 11 ćwiartkach.",
  studentGoal: "Uczeń rozpoznaje ułamki właściwe i niewłaściwe, zamienia je na liczby mieszane i zaznacza wartości na osi.",
  successCriteria: [
    "Potrafię rozpoznawać ułamki właściwe i niewłaściwe.",
    "Potrafię zamieniać ułamek niewłaściwy na liczbę mieszaną i odwrotnie.",
    "Potrafię zaznaczać ułamki i liczby mieszane na osi liczbowej.",
  ],
  learningGoals: [
    m531SlideZero.learningGoals[1]!,
    m531SlideZero.learningGoals[2]!,
    m531SlideZero.learningGoals[3]!,
  ],
  prerequisiteSkillIds: ["M5-3.1-part-whole", "M5-3.1-number-line"],
  skillIds: m531L2SkillIds,
  estimatedMinutes: 45,
  overview: "Poziom L2 prowadzi od poprawnej interpretacji ułamka niewłaściwego przez grupowanie pełnych całości i zamianę w obie strony do osi liczb mieszanych.",
  openingScript: "„Ułamek większy od jednej całości jest poprawnym zapisem. Sprawdźmy, ile pełnych całości w nim ukryto.”",
  closingScript: "„Ułamek niewłaściwy, liczba mieszana, model i punkt na osi mogą opisywać dokładnie tę samą wartość.”",
  commonMisconceptions: [
    "Traktowanie ułamka niewłaściwego jako błędu.",
    "Pomijanie pełnej całości albo reszty podczas zamiany.",
    "Dodawanie części całkowitej bez wcześniejszego mnożenia jej przez mianownik.",
    "Zaznaczanie liczby mieszanej po niewłaściwej stronie granicy 1 albo 2.",
  ],
  stages: [
    {
      suffix: "l2-more-than-one",
      kind: "explore",
      title: "Więcej niż jedna pizza",
      minutes: 6,
      headline: "7/4 zajmuje dwie pizze — i jest poprawnym ułamkiem",
      body: "Siedem równych ćwiartek wypełnia jedną pizzę i trzy ćwiartki drugiej. Ułamek niewłaściwy nie jest błędem.",
      modelId: "fraction-lesson",
      modelSeed: 31201,
      studentInstruction: "Odczytaj 7/4 na dwóch kołach i rozpoznaj rodzaj ułamka. Nie poprawiaj licznika tylko dlatego, że jest większy od mianownika.",
      discussionPrompts: ["Ile pełnych pizz widzisz?", "Dlaczego 7/4 jest poprawnym zapisem?"],
      print: {
        worksheetTitle: "Więcej niż jedna pizza",
        instructions: "Zacieniuj siedem ćwiartek na dwóch jednakowych kołach i nazwij rodzaj ułamka.",
        items: [{ id: "l2-seven-fourths", skillIds: [m531L2SkillIds[0]!], expression: "7/4", prompt: "Narysuj model na dwóch kołach i zaznacz: właściwy czy niewłaściwy.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "l2-group-wholes",
      kind: "discuss",
      title: "Zgrupuj pełne całości",
      minutes: 6,
      headline: "Każde cztery ćwiartki tworzą jedną pełną całość",
      body: "Pełne koło przechodzi do osobnej kratki części całkowitej. Niezgrupowane trzy ćwiartki pozostają nad mianownikiem 4.",
      modelId: "fraction-lesson",
      modelSeed: 31202,
      studentInstruction: "Zgrupuj cztery z siedmiu ćwiartek. Odczytaj osobno pełną całość i resztę 3/4.",
      print: {
        worksheetTitle: "Zgrupuj pełne całości",
        instructions: "Otocz pętlą każdą pełną grupę i wpisz część całkowitą po lewej stronie ułamka.",
        items: [
          { id: "l2-group-seven", skillIds: [m531L2SkillIds[1]!], expression: "7/4", prompt: "Zgrupuj pełną całość i zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "l2-group-nine", skillIds: [m531L2SkillIds[1]!], expression: "9/4", prompt: "Zgrupuj pełne całości i pozostaw resztę.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "l2-convert",
      kind: "worked-example",
      title: "Zamiana w obie strony",
      minutes: 8,
      headline: "Łącznik: całości × mianownik + licznik",
      body: "Każdy krok zachowuje wartość. W stronę ułamka licznik powstaje z działania całości × mianownik + licznik reszty.",
      modelId: "fraction-lesson",
      modelSeed: 31203,
      studentInstruction: "Wykonaj zamianę w obie strony. Użyj osobnej kratki części całkowitej i odsłaniaj łącznik krok po kroku.",
      discussionPrompts: ["Skąd bierze się iloczyn całości i mianownika?", "Co oznacza dodawany licznik?"],
      print: {
        worksheetTitle: "Zamiana w obie strony",
        instructions: "Pokaż działanie całości × mianownik + licznik i zachowaj pionowy zapis ułamka.",
        items: [
          { id: "l2-convert-to-mixed", skillIds: [m531L2SkillIds[1]!], expression: "7/4", prompt: "Zamień na liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "l2-convert-to-improper", skillIds: [m531L2SkillIds[1]!], expression: "2 3/5", prompt: "Zamień na ułamek niewłaściwy i pokaż 2 × 5 + 3.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "l2-mixed-axis",
      kind: "practice",
      title: "Oś liczb mieszanych",
      minutes: 7,
      headline: "Najpierw znajdź granice 1 i 2, potem policz równe części",
      body: "Punkt porusza się po kreskach osi od 0 do 3. Wartości występują po obu stronach 1 i 2, a granice całych liczb mają mocniejszy znacznik.",
      modelId: "fraction-lesson",
      modelSeed: 31204,
      studentInstruction: "Ustaw wskazaną liczbę mieszaną dotykiem, suwakiem, strzałkami albo numerem kreski.",
      print: {
        worksheetTitle: "Oś liczb mieszanych",
        instructions: "Zaznacz granice 1 i 2, podziel każdą całość na równe części i postaw punkty.",
        items: [
          { id: "l2-axis-before-one", skillIds: [m531L2SkillIds[2]!], expression: "3/4", prompt: "Zaznacz punkt przed 1.", answerLayout: "fraction-axis" },
          { id: "l2-axis-between", skillIds: [m531L2SkillIds[2]!], expression: "1 3/4", prompt: "Zaznacz punkt między 1 i 2.", answerLayout: "fraction-axis" },
          { id: "l2-axis-after-two", skillIds: [m531L2SkillIds[2]!], expression: "2 1/4", prompt: "Zaznacz punkt za 2.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "l2-class-picnic",
      kind: "challenge",
      title: "Piknik klasowy",
      minutes: 7,
      headline: "11 ćwiartek pizzy — ile to pełnych pizz?",
      body: "Rozdziel jedenaście jednakowych ćwiartek między stoły, zgrupuj pełne pizze i zapisz odpowiedź pełnym zdaniem.",
      modelId: "fraction-lesson",
      modelSeed: 31205,
      studentInstruction: "Zbuduj model 11 ćwiartek, zapisz liczbę mieszaną i odpowiedz pełnym zdaniem, ile pizzy przygotowano.",
      print: {
        worksheetTitle: "Piknik klasowy",
        instructions: "Narysuj lub otocz pełne grupy, wykonaj zamianę i napisz pełną odpowiedź.",
        items: [{ id: "l2-picnic-eleven", skillIds: [m531L2SkillIds[1]!], expression: "11 ćwiartek pizzy", prompt: "Ile to pełnych pizz i jaka część pozostaje?", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "l2-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 6,
      headline: "Rozpoznaj, zamień i zaznacz na osi",
      body: "Generator tworzy ułamki właściwe, niewłaściwe i liczby mieszane. Mianownik jest zawsze dodatni, a granice 1 i 2 pozostają widoczne.",
      modelId: "fraction-lesson",
      modelSeed: 31206,
      studentInstruction: "Pracuj bez podpowiedzi. Rozpoznaj zapis, wykonaj potrzebną zamianę i ustaw tę samą wartość na osi.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Identyfikator sesyjny pozostaje zgodny z istniejącą bramką Live dla modelu fraction-lesson.
        { id: "m531-l2-support", generatorId: "fraction-lesson-l1-v1", seed: 31200, difficulty: "support", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-core", generatorId: "fraction-lesson-l1-v1", seed: 31202, difficulty: "core", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-challenge", generatorId: "fraction-lesson-l1-v1", seed: 31214, difficulty: "challenge", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — ułamki L2",
        instructions: "Rozpoznaj zapis, zamień go w drugą postać i zaznacz wartość na osi. Zapisz wszystkie kroki.",
        items: [
          { id: "m531-l2-print-support", questionId: "m531-l2-support", skillIds: m531L2SkillIds, maxScore: 3, expression: "3/4", prompt: "Nazwij rodzaj i zaznacz na osi.", answerLayout: "fraction-axis" },
          { id: "m531-l2-print-core", questionId: "m531-l2-core", skillIds: m531L2SkillIds, maxScore: 3, expression: "7/4", prompt: "Zamień na liczbę mieszaną i zaznacz na osi.", answerLayout: "fraction-stack" },
          { id: "m531-l2-print-challenge", questionId: "m531-l2-challenge", skillIds: m531L2SkillIds, maxScore: 3, expression: "2 1/4", prompt: "Zamień na ułamek niewłaściwy i zaznacz na osi.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

export const m532PodzielSprawiedliwieV1 = s3({
  id: "m5-3-2-podziel-sprawiedliwie-v1",
  topicId: "M5-3.2",
  title: "Ułamek jako iloraz",
  coreLesson: "Podziel sprawiedliwie",
  paperEvidence: "Karta L1: wybierz–umieść dla sprawiedliwego podziału, zapis a : b = a/b z warunkiem b ≠ 0 oraz własny kontekst do 13 : 6.",
  studentGoal: "Uczeń przedstawia iloraz liczb naturalnych jako ułamek i wyjaśnia go w sytuacji sprawiedliwego podziału.",
  successCriteria: [
    "Potrafię przedstawiać iloraz liczb naturalnych jako ułamek.",
    "Potrafię przedstawiać ułamek jako iloraz liczb naturalnych.",
    "Potrafię wyjaśniać wynik dzielenia w sytuacji sprawiedliwego podziału.",
  ],
  prerequisiteSkillIds: ["M5-3.1-part-whole", "M5-3.1-mixed-conversion"],
  skillIds: [
    "M5-3.2-fraction-as-quotient",
    "M5-3.2-fair-sharing",
    "M5-3.2-context-interpretation",
  ],
  estimatedMinutes: 45,
  overview: "Jedna pionowa lekcja prowadzi od fizycznego podziału pięciu placków przez równoważność zapisów 5 : 2 i 5/2 do samodzielnego kontekstu 13 : 6.",
  openingScript: "„Pięć placków można rozdzielić między dwie osoby bez pomijania części. Sprawdźmy, jak zapisać udział jednej osoby.”",
  closingScript: "„W zapisie a : b = a/b dzielna staje się licznikiem, dzielnik mianownikiem, a b musi być większe od zera.”",
  commonMisconceptions: [
    "Odwracanie kolejności dzielnej i dzielnika w ułamku.",
    "Rozdanie wszystkich części, ale w nierównych liczbach.",
    "Pozostawienie części poza podziałem.",
    "Traktowanie dzielenia przez zero jako udziału równego zero.",
    "Podanie samej wartości bez interpretacji dla jednej osoby.",
  ],
  stages: [
    {
      suffix: "quotient-fair-share",
      kind: "explore",
      title: "Podziel sprawiedliwie",
      minutes: 7,
      headline: "5 identycznych placków dla 2 osób — wykorzystaj każdą część",
      body: "Uczeń kroi pięć placków na połówki, wybiera każdy kawałek i umieszcza go u jednej z dwóch osób. System osobno sprawdza kompletność i równość podziału.",
      modelId: "fraction-lesson",
      modelSeed: 32021,
      studentInstruction: "Pokrój pięć identycznych placków na połówki. Metodą wybierz–umieść rozdaj wszystkie części tak, aby obie osoby dostały dokładnie tyle samo.",
      discussionPrompts: ["Skąd wiesz, że podział jest sprawiedliwy?", "Dlaczego żadna połówka nie może pozostać na tacy?"],
      print: {
        worksheetTitle: "Podziel sprawiedliwie",
        instructions: "Narysuj pięć jednakowych placków, podziel każdy na pół i połącz wszystkie połówki z dwiema osobami.",
        items: [
          { id: "m532-fair-five-two", skillIds: ["M5-3.2-fair-sharing"], expression: "5 placków : 2 osoby", prompt: "Pokaż równy podział i zapisz udział jednej osoby jako pionowy ułamek.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "quotient-two-notations",
      kind: "worked-example",
      title: "Dwa zapisy tej samej sytuacji",
      minutes: 6,
      headline: "5 : 2 = 5/2 — dzielna staje się licznikiem",
      body: "Animowane łączniki nazywają role: dzielna 5 przechodzi nad kreskę jako licznik, a dzielnik 2 pod kreskę jako mianownik.",
      modelId: "fraction-lesson",
      modelSeed: 32022,
      studentInstruction: "Odsłaniaj przejście krok po kroku. Następnie zapisz 5 : 2 pionowym ułamkiem, zachowując kolejność liczb.",
      discussionPrompts: ["Co opisuje liczba 5 w tej sytuacji?", "Co opisuje liczba 2 i dlaczego trafia pod kreskę?"],
      print: {
        worksheetTitle: "Dwa zapisy tej samej sytuacji",
        instructions: "Połącz dzielną z licznikiem i dzielnik z mianownikiem. Uzupełnij pionowy zapis.",
        items: [
          { id: "m532-two-notations", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "5 : 2 =", prompt: "Wpisz dzielną nad kreską i dzielnik pod kreską, a potem podpisz ich role.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "quotient-realtime",
      kind: "practice",
      title: "Ile dostaje jedna osoba?",
      minutes: 6,
      headline: "Zmieniaj obiekty i osoby — model oraz zapis reagują od razu",
      body: "Suwaki zmieniają liczbę dzielonych obiektów i dodatnią liczbę osób. Koła, iloraz, ułamek i liczba mieszana pozostają zsynchronizowane.",
      modelId: "fraction-lesson",
      modelSeed: 32023,
      studentInstruction: "Zmieniaj obie liczby suwakiem, dotykiem lub strzałkami. Za każdym razem wyjaśnij, co otrzymuje jedna osoba.",
      print: {
        worksheetTitle: "Ile dostaje jedna osoba?",
        instructions: "Dla każdej sytuacji zapisz iloraz, pionowy ułamek i odpowiedź dla jednej osoby.",
        items: [
          { id: "m532-realtime-seven-three", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], expression: "7 obiektów : 3 osoby", prompt: "Zapisz ułamek i liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-realtime-nine-four", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], expression: "9 obiektów : 4 osoby", prompt: "Zapisz udział jednej osoby pełnym zdaniem.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "quotient-zero",
      kind: "discuss",
      title: "Czy zawsze można dzielić?",
      minutes: 4,
      headline: "5 : 0 nie tworzy ułamka — dzielnik musi być większy od zera",
      body: "Model nie tworzy niepoprawnego ułamka 5/0. Uczeń naprawia warunek, zmieniając liczbę osób na dodatnią.",
      modelId: "fraction-lesson",
      modelSeed: 32024,
      studentInstruction: "Sprawdź 5 : 0, przeczytaj warunek i wyjaśnij, dlaczego nie istnieje udział jednej osoby, gdy osób jest zero.",
      discussionPrompts: ["Co oznacza pytanie o udział jednej osoby przy 0 osobach?", "Jaki warunek musi spełniać dzielnik i mianownik?"],
      print: {
        worksheetTitle: "Czy zawsze można dzielić?",
        instructions: "Nie wykonuj nieokreślonego działania. Zapisz warunek i popraw dane tak, aby dzielenie było możliwe.",
        items: [
          { id: "m532-zero-condition", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "5 : 0", prompt: "Zapisz, dlaczego działanie nie ma wyniku i jaki warunek musi spełniać dzielnik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "quotient-zoo-banquet",
      kind: "challenge",
      title: "Bankiet w zoo",
      minutes: 7,
      headline: "11 porcji dla 4 opiekunów",
      body: "Jedenaście równych porcji jest dzielonych między czterech opiekunów. Uczeń zapisuje dokładny iloraz jako 11/4 i 2 3/4 oraz interpretuje udział jednej osoby.",
      modelId: "fraction-lesson",
      modelSeed: 32025,
      studentInstruction: "Zapisz 11 : 4 pionowym ułamkiem, zamień wynik na liczbę mieszaną i wyjaśnij pełnym zdaniem, ile porcji dostaje jeden opiekun.",
      print: {
        worksheetTitle: "Bankiet w zoo",
        instructions: "Rozdziel 11 równych porcji między 4 opiekunów. Pokaż oba zapisy i pełną odpowiedź.",
        items: [
          { id: "m532-zoo-eleven-four", skillIds: ["M5-3.2-fair-sharing", "M5-3.2-context-interpretation"], expression: "11 porcji : 4 opiekunów", prompt: "Zapisz ułamek, liczbę mieszaną i udział jednego opiekuna.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "quotient-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 5,
      headline: "Utwórz własny kontekst do 13 : 6",
      body: "Uczeń sam nazywa dzielone obiekty i odbiorców, zapisuje 13/6 oraz 2 1/6 i wyjaśnia wynik dla jednej grupy. Ocena obejmuje zapis i interpretację.",
      modelId: "fraction-lesson",
      modelSeed: 32026,
      studentInstruction: "Utwórz własną sytuację do 13 : 6. Wpisz ułamek i liczbę mieszaną oraz wyjaśnij, co wynik oznacza dla jednej osoby lub grupy.",
      live: { enabled: true, kind: "exercise", minutes: 5 },
      questions: [
        // Identyfikator zachowuje istniejącą bramkę Live; lokalny adapter wybiera generator M5-3.2 z taskSeed.
        { id: "m532-support", generatorId: "fraction-lesson-l1-v1", seed: 32301, difficulty: "support", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-core", generatorId: "fraction-lesson-l1-v1", seed: 32302, difficulty: "core", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-challenge", generatorId: "fraction-lesson-l1-v1", seed: 32303, difficulty: "challenge", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-fair-sharing", "M5-3.2-context-interpretation"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — ułamek jako iloraz",
        instructions: "Utwórz kontekst, zachowaj kolejność liczb i zapisz interpretację udziału jednej grupy.",
        items: [
          { id: "m532-print-support", questionId: "m532-support", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], maxScore: 3, expression: "13 : 6", prompt: "Wymyśl, co dzielisz i między kogo. Zapisz pionowy ułamek.", answerLayout: "fraction-stack" },
          { id: "m532-print-core", questionId: "m532-core", skillIds: ["M5-3.2-fraction-as-quotient", "M5-3.2-context-interpretation"], maxScore: 3, expression: "13 : 6", prompt: "Zapisz liczbę mieszaną i wyjaśnij udział jednej grupy.", answerLayout: "fraction-stack" },
          { id: "m532-print-challenge", questionId: "m532-challenge", skillIds: ["M5-3.2-fair-sharing", "M5-3.2-context-interpretation"], maxScore: 3, expression: "13 obiektów, 6 odbiorców", prompt: "Narysuj sprawiedliwy podział, wykorzystaj wszystkie części i napisz pełną odpowiedź.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m533L1SkillIds = [
  "M5-3.3-simplify-expand",
  "M5-3.3-equivalent-fractions",
  "M5-3.3-same-factor",
  "M5-3.3-irreducible-form",
];

export const m533TaSamaCzescV1 = s3({
  id: "m5-3-3-ta-sama-czesc-v1",
  topicId: "M5-3.3",
  title: "Skracanie i rozszerzanie ułamków",
  coreLesson: "Ta sama część",
  paperEvidence: "Pionowy zapis rozszerzenia, poprawna ścieżka skracania i końcowa postać nieskracalna z dowodem zachowania wartości.",
  studentGoal: "Nauczę się rozszerzać i skracać ułamki bez zmiany ich wartości oraz doprowadzać je do postaci nieskracalnej.",
  successCriteria: [
    "Potrafię rozszerzać licznik i mianownik przez tę samą liczbę.",
    "Potrafię skracać licznik i mianownik przez wspólny dzielnik.",
    "Potrafię rozpoznawać ułamki o tej samej wartości na modelu i osi.",
    "Potrafię doprowadzać ułamek do postaci nieskracalnej i pokazać ścieżkę.",
  ],
  prerequisiteSkillIds: ["M5-3.2-fraction-as-quotient"],
  skillIds: m533L1SkillIds,
  lessonNumber: 1,
  estimatedMinutes: 45,
  overview: "Równoważność, rozszerzanie i skracanie są pokazane jako zmiana podziału tej samej całości. Pionowy zapis, sparowane działania, modele i wspólna oś stale dowodzą niezmienności wartości.",
  openingScript: "„Zmieni się liczba części i zapis, ale sprawdzimy, czy nie zmieniła się wartość ułamka.”",
  closingScript: "„Wynik to nie tylko końcowy ułamek: zostaw także dowód, że licznik i mianownik zmieniały się przez tę samą liczbę.”",
  commonMisconceptions: [
    "Użycie innego mnożnika dla licznika i mianownika.",
    "Dzielenie tylko licznika albo tylko mianownika.",
    "Zatrzymanie skracania przed postacią nieskracalną.",
    "Użycie niecałkowitego lub niewspólnego dzielnika.",
  ],
  stages: [
    {
      suffix: "equiv-denser-partition",
      kind: "explore",
      title: "Ta sama część, gęstszy podział",
      minutes: 5,
      headline: "2/3 pozostaje tą samą częścią po podziale każdego segmentu na 2, 3 albo 4 części",
      body: "Suwak zagęszcza podział paska w czasie rzeczywistym. Liczba zaznaczonych pól i liczba wszystkich pól rosną przez ten sam mnożnik, natomiast długość zaznaczonego odcinka i punkt na osi nie zmieniają położenia.",
      modelId: "fraction-lesson",
      modelSeed: 33031,
      studentInstruction: "Zmień zagęszczenie suwakiem, dotykiem lub klawiszami. Porównaj pionowy zapis, pasek i punkt na osi; nazwij to, co się zmieniło, i to, co pozostało stałe.",
      discussionPrompts: ["Dlaczego więcej kratek nie oznacza większej części?", "Które dwie liczby zmieniły się przez ten sam mnożnik?"],
      print: {
        worksheetTitle: "Ta sama część, gęstszy podział",
        instructions: "Podziel każdą trzecią część paska na mniejsze równe części. Zachowaj ten sam zakres zaznaczenia i zapisz pionowe ułamki.",
        items: [
          { id: "m533-denser-two", skillIds: ["M5-3.3-equivalent-fractions", "M5-3.3-same-factor"], expression: "2/3 = 4/6", prompt: "Narysuj oba paski i zaznacz tę samą część. Podpisz mnożnik licznika i mianownika.", answerLayout: "fraction-stack" },
          { id: "m533-denser-four", skillIds: ["M5-3.3-equivalent-fractions", "M5-3.3-same-factor"], expression: "2/3 = 8/12", prompt: "Zagęść podział czterokrotnie i pokaż, że położenie na osi jest niezmienne.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-expansion-grid",
      kind: "worked-example",
      title: "Rozszerzanie w kratkach",
      minutes: 5,
      headline: "3/4 · 3/3 = 9/12 — identyczny symbol łączy parę mnożników",
      body: "Dwie osobne kratki sterują mnożnikiem licznika i mianownika. Łączniki oraz wspólny symbol podświetlają poprawną parę, a walidator rozróżnia dwa różne mnożniki od działania tylko po jednej stronie.",
      modelId: "fraction-lesson",
      modelSeed: 33032,
      studentInstruction: "Ustaw mnożnik nad i pod kreską. Użyj tej samej liczby, odsłoń kroki pionowego zapisu i sprawdź niezmienną wartość na pasku i osi.",
      discussionPrompts: ["Dlaczego mnożenie przez 3/3 nie zmienia wartości?", "Co stanie się z punktem osi po użyciu różnych mnożników?"],
      print: {
        worksheetTitle: "Rozszerzanie w kratkach",
        instructions: "Wpisz ten sam mnożnik w sparowane kratki nad i pod kreską. Zostaw pionowy ślad działania.",
        items: [
          { id: "m533-expand-three", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-same-factor"], expression: "3/4 = 9/12", prompt: "Uzupełnij dwa mnożniki i podpisz, dlaczego wartość się nie zmieniła.", answerLayout: "fraction-stack" },
          { id: "m533-expand-twenty", skillIds: ["M5-3.3-simplify-expand"], expression: "3/5 = ?/20", prompt: "Znajdź wspólny mnożnik i brakujący licznik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-collapse-partition",
      kind: "explore",
      title: "Zwiń podział",
      minutes: 5,
      headline: "8/12 zwija się do 2/3 przez grupowanie po 4 sąsiednie części",
      body: "Sterowanie grupuje sąsiednie pola paska i aktualizuje pionowy zapis. Licznik oraz mianownik muszą zostać podzielone przez ten sam całkowity wspólny dzielnik; pole zaznaczenia pozostaje identyczne.",
      modelId: "fraction-lesson",
      modelSeed: 33033,
      studentInstruction: "Wybierz osobno dzielnik licznika i mianownika. Zgrupuj pola, sprawdź wynik na modelu i osi, a potem wyjaśnij, dlaczego oba dzielniki muszą być takie same.",
      discussionPrompts: ["Co opisuje jedna nowa grupa?", "Dlaczego 8 : 4 i 12 : 3 zmieniają wartość?"],
      print: {
        worksheetTitle: "Zwiń podział",
        instructions: "Obejmij pętlą równe grupy sąsiednich części, a następnie podziel licznik i mianownik przez wspólny dzielnik.",
        items: [
          { id: "m533-collapse-eight", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-equivalent-fractions"], expression: "8/12 = 2/3", prompt: "Pokaż grupy po 4 i pionowy zapis skracania.", answerLayout: "fraction-stack" },
          { id: "m533-collapse-eighteen", skillIds: ["M5-3.3-simplify-expand"], expression: "18/24", prompt: "Zgrupuj części wspólnym dzielnikiem i skróć.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-cross-out-rewrite",
      kind: "worked-example",
      title: "Przekreśl i zapisz",
      minutes: 5,
      headline: "24/36 : 12/12 = 2/3 — stare liczby zostają jako czytelny ślad",
      body: "Inteligentny pionowy zapis podświetla sparowane dzielenia. Stary licznik i mianownik są przekreślane, a nowe wartości wpisywane obok bez zacierania dowodu operacji.",
      modelId: "fraction-lesson",
      modelSeed: 33034,
      studentInstruction: "Odsłaniaj krok po kroku parę dzielników, przekreślenia i nowe kratki. Przeczytaj zapis od starego ułamka do postaci nieskracalnej.",
      discussionPrompts: ["Po co zachowujemy przekreślony ślad?", "Jak model lub oś sprawdzają wynik 2/3?"],
      print: {
        worksheetTitle: "Przekreśl i zapisz",
        instructions: "Przekreśl stare wartości jedną kreską, wpisz wspólny dzielnik przy obu częściach ułamka, a nowe wartości zapisz obok.",
        items: [
          { id: "m533-cross-twenty-four", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], expression: "24/36", prompt: "Skróć przez 12 i pozostaw pełny ślad operacji.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-equivalent-chain",
      kind: "practice",
      title: "Łańcuch równoważnych ułamków",
      minutes: 5,
      headline: "2/3 = 4/6 = □/□ = 8/12",
      body: "Uczeń uzupełnia brakujący pionowy ułamek w łańcuchu oraz uzasadnia jeden krok. Każdy element jest sprawdzany przez iloczyn krzyżowy i wspólną pozycję na osi.",
      modelId: "fraction-lesson",
      modelSeed: 33035,
      studentInstruction: "Uzupełnij obie kratki brakującego ułamka. Następnie uzasadnij wybrany krok, wskazując ten sam mnożnik dla góry i dołu.",
      discussionPrompts: ["Czy istnieje tylko jeden ułamek równoważny 2/3?", "Jak bez modelu sprawdzisz dwa ułamki?"],
      print: {
        worksheetTitle: "Łańcuch równoważnych ułamków",
        instructions: "Uzupełnij pionowe ułamki i pod każdym znakiem równości zapisz użyty mnożnik albo dzielnik.",
        items: [
          { id: "m533-chain", skillIds: ["M5-3.3-equivalent-fractions", "M5-3.3-same-factor"], expression: "2/3 = 4/6 = ?/? = 8/12", prompt: "Uzupełnij 6/9 i uzasadnij jeden krok.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-paint-lab",
      kind: "challenge",
      title: "Laboratorium farb",
      minutes: 5,
      headline: "3/5, 6/10 i 9/15 opisują tę samą pomalowaną część ściany",
      body: "Ta sama ściana jest dzielona na 5, 10 i 15 równych pól. Zsynchronizowane paski oraz punkty osi pokazują, że zmienia się opis podziału, nie ilość farby.",
      modelId: "fraction-lesson",
      modelSeed: 33036,
      studentInstruction: "Porównaj trzy podziały ściany. Użyj modelu, pionowego zapisu i osi, aby dowieść, że pomalowana część ma tę samą wartość.",
      discussionPrompts: ["Który zapis najlepiej pasuje do podziału na 15 pól?", "Jak z 3/5 otrzymać oba pozostałe zapisy?"],
      print: {
        worksheetTitle: "Laboratorium farb",
        instructions: "Pokoloruj tę samą część trzech jednakowych prostokątów podzielonych na 5, 10 i 15 pól.",
        items: [
          { id: "m533-paint", skillIds: ["M5-3.3-equivalent-fractions", "M5-3.3-same-factor"], expression: "3/5 = 6/10 = 9/15", prompt: "Zamaluj pola, połącz równe punkty osi i podpisz mnożniki.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 5,
      headline: "Rozszerz, wróć poprawną ścieżką i zapisz osobno końcową postać nieskracalną",
      body: "Deterministyczne warianty Start, Dalej i Mistrzowskie wymagają sparowanego rozszerzenia, dowodu skracania oraz końcowego pionowego ułamka. Walidator akceptuje jeden wspólny dzielnik albo kilka poprawnych kroków, ale nie ujawnia klientowi prywatnej rubryki odpowiedzi.",
      modelId: "fraction-lesson",
      modelSeed: 33037,
      studentInstruction: "Wykonaj trzy części bez podpowiedzi: rozszerzenie, ścieżkę skracania i końcową postać nieskracalną. Wyjaśnij zachowanie wartości za pomocą modelu lub osi.",
      live: { enabled: true, kind: "exercise", minutes: 5 },
      questions: [
        // Identyfikator zachowuje istniejącą bramkę Live; lokalny adapter wybiera generator M5-3.3 z identyfikatora etapu i taskSeed.
        { id: "m533-support", generatorId: "fraction-lesson-l1-v1", seed: 33301, difficulty: "support", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-core", generatorId: "fraction-lesson-l1-v1", seed: 33302, difficulty: "core", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-challenge", generatorId: "fraction-lesson-l1-v1", seed: 33303, difficulty: "challenge", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — skracanie i rozszerzanie ułamków",
        instructions: "W każdym wariancie zapisz pionowo rozszerzenie, wszystkie kroki skracania i osobno końcową postać nieskracalną. Uzasadnij zachowanie wartości.",
        items: [
          { id: "m533-print-support", questionId: "m533-support", skillIds: [...m533L1SkillIds], maxScore: 3, expression: "2/3 → 4/6 → 2/3", prompt: "Wpisz parę mnożników, parę dzielników i wyjaśnij niezmienną wartość.", answerLayout: "fraction-stack" },
          { id: "m533-print-core", questionId: "m533-core", skillIds: [...m533L1SkillIds], maxScore: 3, expression: "3/4 → 12/16 → 3/4", prompt: "Pokaż rozszerzenie i dowolną poprawną ścieżkę do postaci nieskracalnej.", answerLayout: "fraction-stack" },
          { id: "m533-print-challenge", questionId: "m533-challenge", skillIds: [...m533L1SkillIds], maxScore: 3, expression: "5/8 → 20/32 → 5/8", prompt: "Zostaw ślad wszystkich operacji i sprawdź wartość na szkicu osi.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

export const m534NalozPaskiV1 = s3({
  id: "m5-3-4-naloz-paski-v1",
  topicId: "M5-3.4",
  title: "Porównywanie ułamków",
  coreLesson: "Porównywanie ułamków — poziom 1",
  paperEvidence: "Karta L1: ta sama całość, wspólna oś, znak porównania, pionowy zapis pierwszego rozstrzygającego elementu i uzasadniona strategia.",
  studentGoal: "Uczeń porównuje i porządkuje ułamki odnoszące się do tej samej całości na modelu, osi oraz za pomocą najkrótszej strategii bazowej.",
  successCriteria: [
    "Potrafię porównywać ułamki na modelu i wspólnej osi.",
    "Potrafię porównywać ułamki przez wspólny mianownik lub licznik.",
    "Potrafię korzystać z odniesienia do 1/2 i 1.",
    "Potrafię uporządkować ułamki i uzasadnić wybraną strategię.",
  ],
  prerequisiteSkillIds: ["M5-3.3-simplify-expand"],
  skillIds: [
    "M5-3.4-compare-fractions",
    "M5-3.4-common-measure",
    "M5-3.4-reference-strategy",
    "M5-3.4-justify-order",
  ],
  lessonNumber: 1,
  estimatedMinutes: 45,
  overview: "L1 prowadzi od warunku tej samej całości przez nakładanie pasków i wspólną oś do świadomego wyboru wspólnego mianownika, wspólnego licznika albo odniesienia do 1/2 lub 1. Metoda różnicowa pozostaje rozszerzeniem i nie jest wymagana w bazie.",
  openingScript: "„Najpierw sprawdzamy tę samą całość. Dopiero potem pytamy, który ułamek leży dalej na wspólnej osi.”",
  closingScript: "„Znak to wynik, a pierwszy rozstrzygający element i strategia są dowodem.”",
  commonMisconceptions: [
    "Porównywanie ułamków opisujących całości różnej wielkości.",
    "Uznawanie ułamka z większym mianownikiem za większy bez sprawdzenia rozmiaru części.",
    "Ustawienie poprawnych wartości po obu stronach, ale skierowanie znaku porównania w złą stronę.",
    "Podanie poprawnego porządku bez uzasadnienia zgodnego z wybraną strategią.",
  ],
  stages: [
    {
      suffix: "compare-overlay-bars",
      kind: "explore",
      title: "Nałóż paski",
      minutes: 6,
      headline: "3/4 i 5/8 — wyrównaj dwie takie same całości i nałóż paski",
      body: "Oba paski mają dokładnie tę samą długość. Uczeń może zmienić kolejność albo wyobrażeniowo obrócić model: wartość ułamka się nie zmienia. Celowa pułapka z krótszą drugą całością uruchamia osobną diagnostykę FRA_WHOLE_MISMATCH i zatrzymuje porównanie.",
      modelId: "fraction-lesson",
      modelSeed: 34041,
      studentInstruction: "Najpierw potwierdź tę samą całość. Nałóż paski 3/4 i 5/8, wstaw znak i wyjaśnij, dlaczego obrót lub zamiana kolejności nie zmienia wartości.",
      discussionPrompts: ["Co musimy sprawdzić przed porównaniem?", "Dlaczego zamiana pasków miejscami nie odwraca ich wartości?"],
      print: {
        worksheetTitle: "Nałóż paski — ta sama całość",
        instructions: "Narysuj dwa paski dokładnie tej samej długości, podziel je na równe części i zaznacz wartości. Dopiero potem wstaw znak.",
        items: [
          { id: "m534-overlay", skillIds: ["M5-3.4-compare-fractions"], expression: "3/4 ○ 5/8", prompt: "Nałóż paski, zaznacz tę samą całość i wstaw znak.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "compare-common-axis",
      kind: "explore",
      title: "Wspólna oś",
      minutes: 6,
      headline: "2/3 i 3/5 — dwa punkty na jednej osi od 0 do 1",
      body: "Dwa suwaki aktualizują punkty w czasie rzeczywistym. Uczeń przeciąga albo wybiera dotykiem lub klawiaturą znak <, = lub >; punkt położony bardziej na prawo pokazuje większą wartość.",
      modelId: "fraction-lesson",
      modelSeed: 34042,
      studentInstruction: "Ustaw dwa punkty na wspólnej osi, przeciągnij lub wybierz znak i odczytaj porównanie od lewej do prawej.",
      discussionPrompts: ["Który punkt leży bardziej na prawo?", "Czy znak zmieni się, jeśli zamienimy ułamki miejscami?"],
      print: {
        worksheetTitle: "Wspólna oś",
        instructions: "Zaznacz oba ułamki na tej samej osi od 0 do 1. Połącz pionowy zapis z punktem i wstaw znak.",
        items: [
          { id: "m534-axis", skillIds: ["M5-3.4-compare-fractions"], expression: "2/3 ○ 3/5", prompt: "Zaznacz dwa punkty i uzasadnij znak ich położeniem.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "compare-shortest-strategy",
      kind: "discuss",
      title: "Która strategia jest najkrótsza?",
      minutes: 6,
      headline: "Cztery karty: wspólny mianownik, wspólny licznik, odniesienie do 1/2, odniesienie do 1",
      body: "Uczeń wybiera kartę, która ujawnia wynik najmniejszą liczbą kroków. Inteligentny pionowy zapis podświetla pierwszy rozstrzygający licznik, mianownik albo punkt odniesienia symbolem i wzorem obrysu, nie samym kolorem.",
      modelId: "fraction-lesson",
      modelSeed: 34043,
      studentInstruction: "Porównaj cztery karty strategii dla 3/4 i 5/8. Wybierz najkrótszą i wskaż pierwszy element, który rozstrzyga wynik.",
      discussionPrompts: ["Kiedy wspólny licznik jest szybszy od wspólnego mianownika?", "Kiedy wystarczy odwołanie do 1/2 albo 1?"],
      print: {
        worksheetTitle: "Najkrótsza strategia",
        instructions: "Przy każdej parze zakreśl jedną z czterech strategii bazowych. Zapisz tylko konieczne kroki i obrysuj pierwszy rozstrzygający element.",
        items: [
          { id: "m534-strategy-den", skillIds: ["M5-3.4-common-measure"], expression: "3/4 ○ 5/8", prompt: "Wybierz wspólny mianownik lub krótsze odniesienie i uzasadnij.", answerLayout: "fraction-stack" },
          { id: "m534-strategy-num", skillIds: ["M5-3.4-common-measure"], expression: "3/7 ○ 3/5", prompt: "Użyj wspólnego licznika i zaznacz rozstrzygające mianowniki.", answerLayout: "fraction-stack" },
          { id: "m534-strategy-ref", skillIds: ["M5-3.4-reference-strategy"], expression: "4/9 ○ 5/8", prompt: "Odnieś oba ułamki do 1/2.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "compare-denominator-trap",
      kind: "worked-example",
      title: "Pułapka większego mianownika",
      minutes: 5,
      headline: "1/8 < 1/6 — większy mianownik oznacza tu mniejszą jedną część",
      body: "Kontrprzykład na dwóch równych paskach obala regułę „większy mianownik — większy ułamek”. Wspólny licznik 1 pozwala od razu podświetlić pierwsze rozstrzygające mianowniki.",
      modelId: "fraction-lesson",
      modelSeed: 34044,
      studentInstruction: "Porównaj rozmiar jednej z ośmiu i jednej z sześciu równych części tej samej całości. Wstaw znak i nazwij pułapkę.",
      discussionPrompts: ["Dlaczego ósma część jest mniejsza od szóstej?", "Czy sama większa cyfra zawsze oznacza większy ułamek?"],
      print: {
        worksheetTitle: "Pułapka większego mianownika",
        instructions: "Narysuj kontrprzykład na dwóch równych paskach. Obrysuj rozstrzygające mianowniki i dokończ zdanie o rozmiarze części.",
        items: [
          { id: "m534-trap", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], expression: "1/8 ○ 1/6", prompt: "Wstaw znak, narysuj model i obal błędną regułę.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "compare-drone-race",
      kind: "practice",
      title: "Wyścig dronów",
      minutes: 6,
      headline: "Drony przebyły 1/2, 4/7 i 5/8 tej samej trasy",
      body: "Każdy dron leci po trasie tej samej długości. Uczeń zmienia kolejność kart w czasie rzeczywistym, porządkuje ułamki rosnąco i uzasadnia pierwszy rozstrzygający krok odniesieniem do 1/2 oraz wspólną osią.",
      modelId: "fraction-lesson",
      modelSeed: 34045,
      studentInstruction: "Ustaw trzy drony od najmniejszej do największej przebytej części trasy. Dopisz uzasadnienie, które wskazuje pierwszy rozstrzygający element.",
      discussionPrompts: ["Który dron jest dokładnie w połowie?", "Jak rozstrzygniesz kolejność dwóch pozostałych?"],
      print: {
        worksheetTitle: "Wyścig dronów",
        instructions: "Trasy muszą mieć tę samą długość. Zaznacz trzy punkty, połącz je z pionowymi ułamkami i zapisz porządek rosnący.",
        items: [
          { id: "m534-drones", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], expression: "1/2, 4/7, 5/8", prompt: "Uporządkuj rosnąco i uzasadnij na wspólnej osi.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "compare-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 6,
      headline: "Trzy ułamki — wymagane: porządek, strategia bazowa i uzasadnienie",
      body: "Deterministyczne warianty Start, Dalej i Mistrzowskie wymagają uporządkowania trzech ułamków oraz wyboru wspólnego mianownika, wspólnego licznika albo odniesienia do 1/2 lub 1. Poprawny porządek bez spójnego uzasadnienia otrzymuje osobną częściową diagnozę; prywatna rubryka odpowiedzi pozostaje wyłącznie na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 34046,
      studentInstruction: "Bez podpowiedzi uporządkuj trzy ułamki. Wybierz jedną strategię bazową i uzasadnij pierwszy rozstrzygający krok. Metoda różnicowa nie jest wymagana.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Identyfikator zachowuje istniejącą bramkę Live; lokalny adapter wybiera generator M5-3.4 z identyfikatora etapu i taskSeed.
        { id: "m534-support", generatorId: "fraction-lesson-l1-v1", seed: 34401, difficulty: "support", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-core", generatorId: "fraction-lesson-l1-v1", seed: 34402, difficulty: "core", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-challenge", generatorId: "fraction-lesson-l1-v1", seed: 34403, difficulty: "challenge", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — porównywanie ułamków",
        instructions: "W każdym wariancie uporządkuj trzy ułamki, zakreśl jedną strategię bazową i obrysuj pierwszy rozstrzygający element. Uzasadnienie jest osobnym kryterium.",
        items: [
          { id: "m534-print-support", questionId: "m534-support", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "1/4, 1/2, 3/4", prompt: "Uporządkuj rosnąco i użyj odniesienia do 1/2.", answerLayout: "fraction-axis" },
          { id: "m534-print-core", questionId: "m534-core", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], maxScore: 2, expression: "2/3, 3/4, 5/6", prompt: "Uporządkuj przez wspólny mianownik i wskaż pierwsze różne liczniki.", answerLayout: "fraction-stack" },
          { id: "m534-print-challenge", questionId: "m534-challenge", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "5/8, 7/10, 11/12", prompt: "Wybierz najkrótszą strategię bazową, uporządkuj i uzasadnij.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m535SlideZero = getSection3To5SlideZeroContext("M5-3.5");
if (!m535SlideZero) throw new Error("Brak kontraktu slajdu 0 dla M5-3.5.");

const m535L1SkillIds = [
  "M5-3.5-add-sub-same-denom",
  "M5-3.5-denominator-invariant",
  "M5-3.5-simplify-result",
  "M5-3.5-context",
];

export const m535LaczCzesciV1 = s3({
  id: "m5-3-5-lacz-czesci-v1",
  topicId: "M5-3.5",
  title: "Dodawanie i odejmowanie ułamków o jednakowych mianownikach",
  coreLesson: "Łącz i odkładaj części tej samej wielkości — poziom 1",
  paperEvidence: "Karta L1: pizza i piekarnia, pionowy zapis z obrysem wspólnych mianowników, łączniki wyłącznie liczników oraz miejsce na skrócenie wyniku.",
  studentGoal: "Uczeń dodaje i odejmuje ułamki właściwe o jednakowych mianownikach, wyjaśnia niezmienny mianownik i skraca wynik.",
  successCriteria: [
    "Potrafię dodawać ułamki właściwe o jednakowych mianownikach.",
    "Potrafię odejmować ułamki właściwe o jednakowych mianownikach przez odkładanie części.",
    "Potrafię wyjaśnić, dlaczego mianownik działania się nie zmienia.",
    "Potrafię sprawdzić i skrócić wynik do postaci nieskracalnej.",
  ],
  learningGoals: [m535SlideZero.learningGoals[0]!, m535SlideZero.learningGoals[1]!, m535SlideZero.learningGoals[3]!],
  prerequisiteSkillIds: ["M5-3.4-compare-fractions"],
  skillIds: m535L1SkillIds,
  lessonNumber: 1,
  estimatedMinutes: 45,
  overview: "L1 prowadzi od fizycznego łączenia jednakowych kawałków pizzy przez regułę niezmiennego mianownika i odkładanie części do krótkiej historii oraz samodzielnej próby. Liczby mieszane i pożyczanie należą do osobnego poziomu L2.",
  openingScript: "„Mianownik nazywa wielkość kawałka. Jeżeli kawałki pozostają ósme, zmienia się tylko ich liczba.”",
  closingScript: "„Najpierw działanie na licznikach, potem kontrola niezmiennego mianownika i osobne skrócenie wyniku.”",
  commonMisconceptions: [
    "Dodawanie mianowników mimo łączenia części tej samej wielkości.",
    "Ujawnianie wyniku odejmowania przed fizycznym odłożeniem wskazanych kawałków.",
    "Pozostawienie poprawnej wartości w postaci skracalnej jako wyniku końcowego.",
    "Przedwczesne wprowadzanie liczb mieszanych albo pożyczania z całości.",
  ],
  stages: [
    {
      suffix: "same-denom-pizza-add",
      kind: "explore",
      title: "Pizza — łączymy takie same kawałki",
      minutes: 8,
      headline: "2/8 + 3/8 → 5/8 — przenieś trzy ósme części do wspólnej pizzy",
      body: "Uczeń przenosi trzy kawałki pojedynczo. Wspólna pizza i pionowy zapis aktualizują się w czasie rzeczywistym; po ostatnim ruchu pokazują 5/8, bez zmiany rozmiaru ósmej części.",
      modelId: "fraction-lesson",
      modelSeed: 35051,
      studentInstruction: "Przenieś dotykiem, myszą albo przyciskiem po jednym z trzech kawałków. Po każdym ruchu obserwuj wspólną pizzę; połącz wyłącznie liczniki.",
      discussionPrompts: ["Co liczy się od nowa po każdym ruchu?", "Czy wielkość jednego kawałka pizzy się zmieniła?"],
      print: {
        worksheetTitle: "Pizza — łączymy ósme części",
        instructions: "Wytnij lub dorysuj 2/8 i 3/8 pizzy, przenieś je do wspólnego koła, a potem uzupełnij pionowy zapis.",
        items: [
          { id: "m535-pizza", skillIds: ["M5-3.5-add-sub-same-denom", "M5-3.5-denominator-invariant"], expression: "2/8 + 3/8 = ?", prompt: "Połącz modele, obrysuj oba mianowniki i połącz tylko liczniki.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "same-denom-rule",
      kind: "discuss",
      title: "Dlaczego mianownik się nie zmienia?",
      minutes: 7,
      headline: "Wspólny obrys dolnych kratek: „części tej samej wielkości”; łączniki tylko między licznikami",
      body: "Inteligentny pionowy zapis odsłania trzy warstwy. Najpierw podwójny obrys obejmuje oba mianowniki, potem przerywany łącznik prowadzi wyłącznie między licznikami, a dopiero na końcu pojawia się wynik.",
      modelId: "fraction-lesson",
      modelSeed: 35052,
      studentInstruction: "Odsłaniaj zapis krok po kroku. Nazwij wspólną miarę dolnych kratek i napisz jednym zdaniem, dlaczego nie dodajemy mianowników.",
      discussionPrompts: ["Co oznacza wspólny obrys obu ósemek?", "Dlaczego nie ma łącznika między mianownikami?"],
      print: {
        worksheetTitle: "Dlaczego mianownik się nie zmienia?",
        instructions: "Obrysuj dolne kratki wspólną ramką „części tej samej wielkości”. Narysuj łącznik tylko między licznikami i uzasadnij regułę.",
        items: [
          { id: "m535-rule", skillIds: ["M5-3.5-denominator-invariant"], expression: "2/8 + 3/8 = 5/8", prompt: "Zaznacz niezmienny mianownik i dopisz uzasadnienie.", answerLayout: "fraction-stack" },
          { id: "m535-denom-trap", skillIds: ["M5-3.5-denominator-invariant"], expression: "2/8 + 3/8 ≠ 5/16", prompt: "Przekreśl błędny mianownik i wpisz obok niezmienioną wartość.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "same-denom-take-away",
      kind: "worked-example",
      title: "Odejmij, odkładając kawałki",
      minutes: 7,
      headline: "7/8 − 3/8 — najpierw fizycznie odłóż trzy kawałki, potem samodzielnie zapisz wynik",
      body: "Siedem kawałków jest widocznych jako osobne elementy. Każdy ruch przenosi jeden kawałek na tacę „odłożone”. Pole wyniku nie pojawia się przed wykonaniem trzech ruchów, a wartość nie jest ujawniana przed próbą ucznia.",
      modelId: "fraction-lesson",
      modelSeed: 35053,
      studentInstruction: "Odłóż po jednym dokładnie trzy kawałki. Nie zgaduj z gotowego wyniku — pionowe kratki pojawią się dopiero po wykonaniu ruchów.",
      discussionPrompts: ["Co w modelu odpowiada odejmowaniu licznika?", "Dlaczego każdy odłożony kawałek nadal jest ósmą częścią?"],
      print: {
        worksheetTitle: "Odejmij przez odkładanie",
        instructions: "Skreśl po kolei trzy z siedmiu ósmych części. Dopiero po skreśleniu uzupełnij pionowy wynik.",
        items: [
          { id: "m535-take-away", skillIds: ["M5-3.5-add-sub-same-denom"], expression: "7/8 − 3/8 = ?", prompt: "Odłóż trzy części i zapisz, ile ósmych zostało.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "same-denom-bakery",
      kind: "practice",
      title: "Piekarnia na festyn",
      minutes: 7,
      headline: "3/10 tacy rano i 4/10 tacy później — ile przygotowano razem?",
      body: "Krótka historia zachowuje jedną całość: tę samą tacę podzieloną na dziesięć równych części. Uczeń wykonuje działanie pionowo i odpowiada pełnym zdaniem z jednostką kontekstu.",
      modelId: "fraction-lesson",
      modelSeed: 35054,
      studentInstruction: "Zapisz działanie pionowo, oblicz wynik i odpowiedz pełnym zdaniem o części tacy drożdżówek.",
      discussionPrompts: ["Co jest całością w tej historii?", "Dlaczego obie porcje można od razu połączyć?"],
      print: {
        worksheetTitle: "Piekarnia na festyn",
        instructions: "Podkreśl wspólną całość i jednakowe części, wykonaj pionowe działanie, skróć wynik, jeśli trzeba, i odpowiedz pełnym zdaniem.",
        items: [
          { id: "m535-bakery-add", skillIds: ["M5-3.5-add-sub-same-denom", "M5-3.5-context"], expression: "3/10 tacy + 4/10 tacy", prompt: "Oblicz i napisz pełną odpowiedź.", answerLayout: "fraction-stack" },
          { id: "m535-bakery-sub", skillIds: ["M5-3.5-add-sub-same-denom", "M5-3.5-context", "M5-3.5-simplify-result"], expression: "6/10 tacy − 2/10 tacy", prompt: "Oblicz, skróć wynik i odpowiedz pełnym zdaniem.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "same-denom-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 6,
      headline: "Jedno działanie, postać nieskracalna i jedno zdanie o niezmiennym mianowniku",
      body: "Deterministyczne warianty Start, Dalej i Mistrzowskie obejmują wyłącznie ułamki właściwe. Uczeń podaje wynik w pionowych kratkach, skraca go i uzasadnia niezmienny mianownik. Prywatna rubryka odpowiedzi pozostaje wyłącznie na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 35055,
      studentInstruction: "Pracuj bez gotowego wyniku: wykonaj działanie, skróć końcowy ułamek i uzasadnij, dlaczego w samym dodawaniu lub odejmowaniu mianownik się nie zmienia.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Id zachowuje istniejącą bramkę Live; lokalny adapter wybiera generator M5-3.5 na podstawie identyfikatora etapu i taskSeed.
        { id: "m535-support", generatorId: "fraction-lesson-l1-v1", seed: 35501, difficulty: "support", skillIds: [...m535L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS] } },
        { id: "m535-core", generatorId: "fraction-lesson-l1-v1", seed: 35502, difficulty: "core", skillIds: [...m535L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS] } },
        { id: "m535-challenge", generatorId: "fraction-lesson-l1-v1", seed: 35503, difficulty: "challenge", skillIds: [...m535L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — jednakowe mianowniki L1",
        instructions: "W każdym wariancie wykonaj działanie pionowo, skróć wynik i zapisz jedno zdanie wyjaśniające niezmienny mianownik.",
        items: [
          { id: "m535-print-support", questionId: "m535-support", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "1/6 + 2/6", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535-print-core", questionId: "m535-core", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "7/10 − 3/10", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535-print-challenge", questionId: "m535-challenge", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "5/12 + 3/12", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m535L2SkillIds = [
  "M5-3.5-mixed-add-sub",
  "M5-3.5-borrow-whole",
  "M5-3.5-mixed-simplify",
  "M5-3.5-mixed-context",
];

export const m535LiczbyMieszaneL2V1 = s3({
  id: "m5-3-5-liczby-mieszane-l2-v1",
  topicId: "M5-3.5",
  title: "Dodawanie i odejmowanie ułamków o jednakowych mianownikach",
  coreLesson: "Działania na liczbach mieszanych i zamiana jednej całości — poziom 2",
  paperEvidence: "Karta L2: inteligentny pionowy zapis liczb mieszanych, fizyczne pocięcie całości na równe części, małe kratki nowych wartości i pełna odpowiedź do historii piekarni.",
  studentGoal: "Uczeń dodaje i odejmuje liczby mieszane o jednakowych mianownikach, a przed wymagającym odejmowaniem zamienia jedną całość na części ułamkowe.",
  successCriteria: [
    "Potrafię dodawać i odejmować liczby mieszane o jednakowych mianownikach.",
    "Potrafię rozpoznać, kiedy trzeba zamienić jedną całość na części ułamkowe.",
    "Potrafię pokazać zamianę w pionowym zapisie przez przekreślenie starej wartości i wpisanie nowych wartości w małych kratkach.",
    "Potrafię skrócić wynik i odpowiedzieć pełnym zdaniem w zadaniu z kontekstem.",
  ],
  learningGoals: [
    m535SlideZero.learningGoals[0]!,
    m535SlideZero.learningGoals[1]!,
    m535SlideZero.learningGoals[2]!,
    m535SlideZero.learningGoals[3]!,
  ],
  prerequisiteSkillIds: ["M5-3.5-add-sub-same-denom"],
  skillIds: m535L2SkillIds,
  lessonNumber: 2,
  estimatedMinutes: 45,
  overview: "L2 rozszerza działania o liczby mieszane. Uczeń najpierw działa bez zamiany, potem fizycznie tnie jedną pełną pizzę na osiem części i dopiero po zamianie wykonuje 4 3/8 − 1 5/8. Inteligentny zapis pionowy utrwala ślad zamiany, historia piekarni łączy dodawanie z odejmowaniem, a samodzielna próba dostarcza dowodu do końcowej Oceny umiejętności.",
  openingScript: "„Liczba mieszana ma osobne całości i osobną część ułamkową. Gdy części ułamkowej nie wystarcza, jedna całość może zmienić postać, ale nie wartość.”",
  closingScript: "„Najpierw sprawdzam części ułamkowe, w razie potrzeby zamieniam jedną całość, potem liczę i skracam wynik.”",
  commonMisconceptions: [
    "Odejmowanie 3 − 5 w licznikach bez wcześniejszej zamiany jednej całości.",
    "Zmniejszenie części całkowitej bez dodania całego mianownika do licznika.",
    "Dodawanie lub odejmowanie jednakowych mianowników.",
    "Pozostawienie poprawnego wyniku w postaci skracalnej.",
  ],
  stages: [
    {
      suffix: "mixed-same-denom-add",
      kind: "explore",
      title: "Działania na liczbach mieszanych",
      minutes: 6,
      headline: "2 2/7 + 1 3/7 — osobno całości, osobno części ułamkowe",
      body: "Pionowy zapis ustawia części całkowite w lewej kolumnie, a części ułamkowe w pionowych kratkach. Podświetlenia w czasie rzeczywistym prowadzą kolejno przez całości, liczniki, wspólny mianownik i kontrolę postaci końcowej.",
      modelId: "fraction-lesson",
      modelSeed: 350561,
      studentInstruction: "Odsłaniaj kroki po kolei. Najpierw dodaj części całkowite, następnie liczniki przy niezmiennym mianowniku i na końcu sprawdź skracanie.",
      discussionPrompts: ["Dlaczego części całkowite mają własną kolumnę?", "Która liczba nazywa wielkość części i nie zmienia się w samym dodawaniu?"],
      print: {
        worksheetTitle: "Działania na liczbach mieszanych",
        instructions: "Ustaw liczby mieszane pionowo. Obrysuj osobno kolumnę całości oraz wspólne mianowniki, wykonaj działanie i sprawdź skracanie.",
        items: [
          { id: "m535l2-add", skillIds: ["M5-3.5-mixed-add-sub", "M5-3.5-mixed-simplify"], expression: "2 2/7 + 1 3/7", prompt: "Dodaj całości i części ułamkowe w osobnych kolumnach.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "mixed-same-denom-borrow-pizza",
      kind: "worked-example",
      title: "Zamień jedną całość",
      minutes: 9,
      headline: "4 3/8 − 1 5/8 — potnij pełną pizzę na 8 części przed odejmowaniem",
      body: "Uczeń nie może uruchomić zamiany przed wyznaczeniem wszystkich ośmiu równych części pełnej pizzy. Po pocięciu zamienia 4 3/8 na 3 11/8, a dopiero potem odkłada pięć ósmych części. Próba wcześniejszego odejmowania uruchamia FRA_BORROW_WHOLE.",
      modelId: "fraction-lesson",
      modelSeed: 350562,
      studentInstruction: "Wyznacz kolejno osiem równych części pełnej pizzy. Dopiero wtedy zamień całość na 8/8 i odłóż pięć ósmych części.",
      discussionPrompts: ["Dlaczego nie wolno odjąć 5/8 od 3/8?", "Jak wiemy, że 4 3/8 i 3 11/8 mają tę samą wartość?"],
      print: {
        worksheetTitle: "Zamień jedną całość — pizza",
        instructions: "Podziel pełną pizzę na osiem równych części. Skreśl jedną całość w odjemnej, dopisz 8/8 do części ułamkowej i dopiero potem odejmij.",
        items: [
          { id: "m535l2-borrow-pizza", skillIds: ["M5-3.5-borrow-whole", "M5-3.5-mixed-add-sub"], expression: "4 3/8 − 1 5/8", prompt: "Pokaż pocięcie całości, zamianę 4 3/8 = 3 11/8 i odejmowanie.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "mixed-same-denom-borrow-notation",
      kind: "discuss",
      title: "Inteligentny zapis pionowy",
      minutes: 7,
      headline: "Stare 4 i 3/8 pozostają widoczne i przekreślone; nowe 3 i 11/8 trafiają do małych kratek",
      body: "Zapis nie nadpisuje starych wartości. Każdy krok podświetla aktywną parę w czasie rzeczywistym: całość do zamiany, równoważność 1 = 8/8, nowe małe kratki, a na końcu wynik i osobny krok skracania.",
      modelId: "fraction-lesson",
      modelSeed: 350563,
      studentInstruction: "Przejdź przez cztery kroki. Nazwij każdą zmianę i sprawdź, czy wartość odjemnej została zachowana.",
      discussionPrompts: ["Po co pozostawiamy starą wartość widoczną?", "Które dwie nowe liczby muszą pojawić się jednocześnie?"],
      print: {
        worksheetTitle: "Inteligentny zapis zamiany całości",
        instructions: "Nie zamazuj starego zapisu. Przekreśl stare 4 i 3, a w małych kratkach obok wpisz 3 i 11. Zaznacz łuk równoważności 1 = 8/8.",
        items: [
          { id: "m535l2-borrow-notation", skillIds: ["M5-3.5-borrow-whole", "M5-3.5-mixed-simplify"], expression: "4 3/8 = 3 11/8", prompt: "Uzupełnij małe kratki, wykonaj 3 11/8 − 1 5/8 i skróć 2 6/8.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "mixed-same-denom-bakery",
      kind: "practice",
      title: "Piekarnia na festyn",
      minutes: 7,
      headline: "Najpierw dodaj przygotowane tace, potem odejmij wydane zamówienie",
      body: "Rano przygotowano 2 3/10 tacy, później 1 5/10 tacy, a następnie wydano 1 9/10 tacy. Uczeń wykonuje dwa kolejne działania, w drugim pokazuje zamianę całości i kończy pełnym zdaniem z jednostką.",
      modelId: "fraction-lesson",
      modelSeed: 350564,
      studentInstruction: "Oblicz kolejno oba działania. W odejmowaniu pokaż zamianę całości, a na końcu napisz pełnym zdaniem, ile tac drożdżówek zostało.",
      discussionPrompts: ["Dlaczego wynik pierwszego działania staje się odjemną w drugim?", "Jak jednostka „tacy” wpływa na pełną odpowiedź?"],
      print: {
        worksheetTitle: "Piekarnia na festyn — dodawanie i odejmowanie",
        instructions: "Wykonaj dwa pionowe działania. Zachowaj ślad zamiany całości, skróć wynik pierwszego działania i odpowiedz pełnym zdaniem na oba pytania.",
        items: [
          { id: "m535l2-bakery-add", skillIds: ["M5-3.5-mixed-add-sub", "M5-3.5-mixed-context"], expression: "2 3/10 + 1 5/10", prompt: "Ile tac przygotowano razem?", answerLayout: "fraction-stack" },
          { id: "m535l2-bakery-sub", skillIds: ["M5-3.5-borrow-whole", "M5-3.5-mixed-context"], expression: "3 8/10 − 1 9/10", prompt: "Ile tac zostało po wydaniu zamówienia? Odpowiedz pełnym zdaniem.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "mixed-same-denom-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 6,
      headline: "Jedno działanie, decyzja o zamianie całości, wynik nieskracalny i krótkie uzasadnienie",
      body: "Warianty Start, Dalej i Mistrzowskie są deterministyczne. Uczeń wykonuje jedno działanie na liczbach mieszanych, zaznacza zamianę całości, gdy jest potrzebna, skraca wynik i zapisuje jedno zdanie uzasadnienia. Prywatna rubryka odpowiedzi pozostaje wyłącznie na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 350565,
      studentInstruction: "Pracuj bez gotowego wyniku. Zdecyduj, czy potrzebna jest zamiana całości, zapisz wynik w osobnych kratkach, skróć go i uzasadnij kluczowy krok.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Id generatora zachowuje istniejącą bramkę Live; lokalny adapter wybiera osobny generator L2 po identyfikatorze etapu.
        { id: "m535l2-support", generatorId: "fraction-lesson-l1-v1", seed: 35520, difficulty: "support", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-core", generatorId: "fraction-lesson-l1-v1", seed: 35523, difficulty: "core", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-challenge", generatorId: "fraction-lesson-l1-v1", seed: 35525, difficulty: "challenge", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — liczby mieszane L2",
        instructions: "Wykonaj jedno działanie pionowo. Jeśli trzeba, przekreśl starą całość i wpisz nowe wartości w małych kratkach. Skróć wynik i uzasadnij kluczowy krok jednym zdaniem.",
        items: [
          { id: "m535l2-print-support", questionId: "m535l2-support", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "2 1/6 + 1 3/6", prompt: "Dodaj, skróć wynik i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-core", questionId: "m535l2-core", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "5 1/8 − 2 5/8", prompt: "Pokaż zamianę całości, odejmij i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-challenge", questionId: "m535l2-challenge", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "6 1/12 − 2 9/12", prompt: "Pokaż pełny ślad zamiany, odejmij, skróć i uzasadnij.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m536L1SkillIds = [
  "M5-3.6-common-measure",
  "M5-3.6-equivalent-extension",
  "M5-3.6-add-sub-diff-denom",
  "M5-3.6-sense-check",
];

export const m536WspolnaMiaraV1 = s3({
  id: "m5-3-6-wspolna-miara-v1",
  topicId: "M5-3.6",
  lessonNumber: 1,
  title: "Dodawanie i odejmowanie ułamków o różnych mianownikach",
  coreLesson: "Zbuduj wspólną miarę",
  paperEvidence: "Modele szklanek, równoważne rozszerzenia i pionowy zapis w kratkach",
  studentGoal: "Uczeń sprowadza dwa ułamki właściwe do wspólnego mianownika, wykonuje działanie i sprawdza sens wyniku.",
  successCriteria: [
    "Potrafię znaleźć wspólny mianownik dla dwóch ułamków.",
    "Potrafię rozszerzyć każdy ułamek przez ten sam mnożnik nad i pod kreską.",
    "Potrafię dodać lub odjąć liczniki po zbudowaniu wspólnej miary.",
    "Potrafię skrócić wynik i sprawdzić, czy jego wartość ma sens.",
  ],
  prerequisiteSkillIds: ["M5-3.4-equivalent-fractions", "M5-3.5-add-sub-same-denom"],
  skillIds: [...m536L1SkillIds],
  estimatedMinutes: 45,
  overview: "Dwie identyczne szklanki prowadzą od 1/3 i 1/4 przez wspólną miarę dwunastych do działania 4/12 + 3/12 = 7/12.",
  openingScript: "„Poziom wody może pozostać taki sam, choć zmienimy nazwę części. Znajdźmy miarę, którą rozumieją obie szklanki.”",
  closingScript: "„Najpierw wspólna miara, potem działanie na licznikach, na końcu skrócenie i kontrola sensu.”",
  commonMisconceptions: [
    "Dodawanie mianowników zamiast zachowania wspólnej miary.",
    "Rozszerzenie tylko jednego ułamka.",
    "Mnożenie licznika i mianownika przez różne liczby.",
    "Pozostawienie wyniku w postaci skracalnej.",
  ],
  stages: [
    {
      suffix: "different-denom-glasses-discover",
      kind: "explore",
      title: "Czy można już połączyć porcje?",
      minutes: 6,
      headline: "Dwie identyczne szklanki: 1/3 i 1/4 pojemności",
      body: "Uczeń próbuje połączyć porcje. Interaktywny model zatrzymuje działanie i pokazuje, że trzecie i czwarte części nie są jeszcze tą samą miarą.",
      modelId: "fraction-lesson",
      modelSeed: 36061,
      studentInstruction: "Porównaj poziomy i podziałki obu szklanek. Spróbuj połączyć porcje, a potem wyjaśnij, czego jeszcze brakuje.",
      discussionPrompts: ["Czy mianownik opisuje liczbę porcji, czy wielkość jednej części?", "Jaka podziałka pasowałaby jednocześnie do trzecich i czwartych części?"],
      print: {
        worksheetTitle: "Dwie różne miary",
        instructions: "Zamaluj 1/3 i 1/4 dwóch jednakowych prostokątów. Pod każdym modelem zapisz, dlaczego nie wolno jeszcze dodać liczników.",
        items: [
          { id: "m536l1-discover", skillIds: ["M5-3.6-common-measure", "M5-3.6-sense-check"], expression: "1/3 + 1/4", prompt: "Narysuj obie porcje i nazwij problem z ich obecną podziałką.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "different-denom-glasses-twelfths",
      kind: "worked-example",
      title: "Zmień skalę, nie poziom wody",
      minutes: 8,
      headline: "1/3 = 4/12 i 1/4 = 3/12 — poziomy pozostają bez zmiany",
      body: "Suwak zagęszcza obie podziałki do dwunastych. Animacja zmienia kreski oraz zapis, ale zachowuje wysokość wody; obsługuje dotyk, mysz i klawiaturę.",
      modelId: "fraction-lesson",
      modelSeed: 36062,
      studentInstruction: "Przesuń suwak do dwunastych. Obserwuj poziom wody i uzasadnij oba równoważne rozszerzenia.",
      discussionPrompts: ["Dlaczego 1/3 i 4/12 mają ten sam poziom?", "Skąd biorą się mnożniki 4 i 3?"],
      print: {
        worksheetTitle: "Ta sama porcja w dwunastych",
        instructions: "Dorysuj podziałkę na dwunaste. Nad i pod kreską wpisz ten sam mnożnik, a stare wartości pozostaw widoczne.",
        items: [
          { id: "m536l1-twelfths-left", skillIds: ["M5-3.6-common-measure", "M5-3.6-equivalent-extension"], expression: "1/3 = □/12", prompt: "Uzupełnij licznik i zapisz mnożnik nad oraz pod kreską.", answerLayout: "fraction-stack" },
          { id: "m536l1-twelfths-right", skillIds: ["M5-3.6-common-measure", "M5-3.6-equivalent-extension"], expression: "1/4 = □/12", prompt: "Uzupełnij licznik i zapisz mnożnik nad oraz pod kreską.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "different-denom-glasses-pour",
      kind: "explore",
      title: "Przelej wspólne części",
      minutes: 6,
      headline: "Cztery dwunaste i trzy dwunaste dają siedem dwunastych",
      body: "Po zbudowaniu wspólnej miary uczeń przelewa obie porcje do trzeciej identycznej szklanki. Delikatna fala pokazuje 7/12; tryb ograniczonego ruchu wyłącza animację.",
      modelId: "fraction-lesson",
      modelSeed: 36063,
      studentInstruction: "Przelej obie porcje. Powiedz, która liczba się zmieniła, a która opisuje niezmienną wielkość części.",
      discussionPrompts: ["Dlaczego dodajemy 4 i 3?", "Dlaczego mianownik 12 pozostaje bez zmiany?"],
      print: {
        worksheetTitle: "Przelewanie wspólnych części",
        instructions: "Połącz oba modele strzałkami z naczyniem wynikowym. W pionowych kratkach zapisz działanie i wynik.",
        items: [
          { id: "m536l1-pour", skillIds: ["M5-3.6-add-sub-diff-denom", "M5-3.6-sense-check"], expression: "4/12 + 3/12", prompt: "Zapisz wynik i wyjaśnij jednym zdaniem, dlaczego mianownik się nie zmienia.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "different-denom-algorithm",
      kind: "practice",
      title: "Inteligentny zapis w czterech wierszach",
      minutes: 9,
      headline: "Wspólny mianownik → dwa rozszerzenia → działanie → skrócenie",
      body: "Każdy krok ma osobny wiersz i pionowe kratki. Aktywna para jest podświetlana, a diagnoza wskazuje: brak wspólnego mianownika, tylko jedno rozszerzenie, różne mnożniki, dodanie mianowników albo brak skrócenia.",
      modelId: "fraction-lesson",
      modelSeed: 36064,
      studentInstruction: "Wykonaj cztery wiersze po kolei. Nie nadpisuj wcześniejszych wartości; wykorzystuj podświetlenia do kontroli par nad i pod kreską.",
      discussionPrompts: ["Który krok chroni wartość każdego ułamka?", "Jak oszacowanie pomaga zauważyć wynik bez sensu?"],
      print: {
        worksheetTitle: "Algorytm wspólnej miary",
        instructions: "W czterech osobnych wierszach wybierz wspólny mianownik, rozszerz oba ułamki, wykonaj działanie i sprawdź skracanie.",
        items: [
          { id: "m536l1-algorithm", skillIds: [...m536L1SkillIds], expression: "1/3 + 1/4", prompt: "Pokaż pełny zapis 1/3 = 4/12, 1/4 = 3/12 i oblicz wynik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "different-denom-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba",
      minutes: 6,
      headline: "Wybierz wspólną miarę i obroń każdy krok",
      body: "Deterministyczne warianty Start, Dalej i Mistrzowskie obejmują dodawanie albo odejmowanie ułamków właściwych. Prywatna specyfikacja odpowiedzi pozostaje wyłącznie na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 36065,
      studentInstruction: "Rozwiąż zadanie bez gotowego wyniku. Wpisz mnożniki osobno nad i pod kreską, podaj wynik nieskracalny i sprawdź jego sens.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Wspólny identyfikator otwiera istniejącą bramkę Live; adapter etapu wybiera dedykowany generator M5-3.6 L1.
        { id: "m536l1-support", generatorId: "fraction-lesson-l1-v1", seed: 536101, difficulty: "support", skillIds: [...m536L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS] } },
        { id: "m536l1-core", generatorId: "fraction-lesson-l1-v1", seed: 536102, difficulty: "core", skillIds: [...m536L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS] } },
        { id: "m536l1-challenge", generatorId: "fraction-lesson-l1-v1", seed: 536103, difficulty: "challenge", skillIds: [...m536L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — wspólna miara",
        instructions: "Wybierz jeden wariant. Pokaż wspólny mianownik, oba rozszerzenia, działanie na licznikach i kontrolę skracania.",
        items: [
          { id: "m536l1-print-support", questionId: "m536l1-support", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "1/2 + 1/3", prompt: "Zapisz pełne rozwiązanie i oszacuj wynik.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-core", questionId: "m536l1-core", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "3/4 − 1/6", prompt: "Zapisz pełne rozwiązanie i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-challenge", questionId: "m536l1-challenge", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "3/5 + 1/6", prompt: "Zapisz pełne rozwiązanie i wyjaśnij, dlaczego wynik jest mniejszy od 1.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const m536L2SkillIds = [
  "M5-3.6-l2-common-measure",
  "M5-3.6-l2-mixed-add-sub",
  "M5-3.6-l2-sense-check",
  "M5-3.6-l2-repair",
];

export const m536RozneMianownikiL2V1 = s3({
  id: "m5-3-6-rozne-mianowniki-l2-v1",
  topicId: "M5-3.6",
  lessonNumber: 2,
  title: "Dodawanie i odejmowanie ułamków o różnych mianownikach",
  coreLesson: "Działania, liczby mieszane i kontrola sensu",
  paperEvidence: "Odejmowanie na paskach, liczby mieszane, objętość mikstury i naprawa rozwiązania",
  studentGoal: "Uczeń wykonuje działania o różnych mianownikach także w liczbach mieszanych, ocenia wynik względem całości i naprawia błędny tok rozumowania.",
  successCriteria: [
    "Potrafię wybrać najmniejszy wygodny wspólny mianownik, a nie zawsze iloczyn.",
    "Potrafię zapisać wynik większy od całości jako liczbę mieszaną.",
    "Potrafię przed obliczeniem ocenić, czy wynik będzie mniejszy czy większy od 1.",
    "Potrafię wskazać i naprawić dokładny krok, w którym wykonano działanie na mianownikach.",
  ],
  prerequisiteSkillIds: [...m536L1SkillIds],
  skillIds: [...m536L2SkillIds],
  estimatedMinutes: 45,
  overview: "Lekcja przenosi wspólną miarę do odejmowania, liczb mieszanych i zadań praktycznych. Uczeń zachowuje pełny ślad rozwiązania i otrzymuje diagnostykę dokładnego błędu.",
  openingScript: "„Wspólna miara jest narzędziem. Dziś wybierzemy ją świadomie, wykorzystamy w liczbach mieszanych i sprawdzimy, czy wynik pasuje do historii.”",
  closingScript: "„Dobry wynik ma poprawny rachunek, właściwą postać i sens w opisanej sytuacji.”",
  commonMisconceptions: [
    "Automatyczne używanie iloczynu mianowników mimo mniejszego NWW.",
    "Zapis wyniku niewłaściwego bez wydzielenia całości.",
    "Dodawanie lub odejmowanie mianowników.",
    "Brak oceny wyniku względem jednej całości.",
  ],
  stages: [
    {
      suffix: "different-denom-l2-subtraction-bars",
      kind: "explore",
      title: "Odejmowanie na paskach",
      minutes: 7,
      headline: "5/6 − 1/4: wspólna miara 12 jest krótsza niż automatyczny iloczyn 24",
      body: "Paski zachowują identyczną długość całej jednostki. Po wyborze dwunastych model pokazuje 10/12, odkładane 3/12 i pozostające 7/12. Błędne 10 lub przedwczesne 24 są widoczne jako decyzje do omówienia.",
      modelId: "fraction-lesson",
      modelSeed: 360621,
      studentInstruction: "Wybierz wspólny mianownik, obserwuj zmianę podziałki i odłóż odejmowaną część. Uzasadnij, dlaczego 12 jest wygodniejsze od 24.",
      discussionPrompts: ["Dlaczego iloczyn 6 · 4 nie jest najmniejszą wspólną miarą?", "Które części paska odejmujemy po rozszerzeniu?"],
      print: {
        worksheetTitle: "Odejmowanie na paskach",
        instructions: "Podziel oba paski na dwunaste. Zapisz oba rozszerzenia w pionowych kratkach, przekreśl odkładane części i podaj wynik nieskracalny.",
        items: [{ id: "m536l2-bars", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub"], expression: "5/6 − 1/4", prompt: "Pokaż 10/12 − 3/12 i uzasadnij wybór mianownika 12.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-mixed-number",
      kind: "worked-example",
      title: "Różne mianowniki w liczbach mieszanych",
      minutes: 7,
      headline: "2 1/3 + 1 1/4 = 3 7/12 — całości i części mają osobne kolumny",
      body: "Inteligentny zapis zachowuje części całkowite w osobnych kratkach. Tylko części ułamkowe przechodzą do wspólnej miary; wynik większy od całości musi wrócić do poprawnej liczby mieszanej.",
      modelId: "fraction-lesson",
      modelSeed: 360622,
      studentInstruction: "Dodaj całości, rozszerz osobno 1/3 i 1/4, a wynik wpisz do kratki całkowitej oraz kratek ułamka właściwego.",
      discussionPrompts: ["Która część zapisu nie wymaga wspólnego mianownika?", "Po czym poznajemy poprawną część ułamkową liczby mieszanej?"],
      print: {
        worksheetTitle: "Liczby mieszane — różne mianowniki",
        instructions: "Ustaw całości w lewej kolumnie, części ułamkowe w pionowych kratkach. Zbuduj wspólny mianownik 12 i zapisz wynik jako liczbę mieszaną.",
        items: [{ id: "m536l2-mixed", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub"], expression: "2 1/3 + 1 1/4", prompt: "Zapisz pełne rozwiązanie i wynik 3 7/12.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-greenhouse",
      kind: "practice",
      title: "Mikstura dla szklarni",
      minutes: 7,
      headline: "2/3 l pożywki + 3/4 l wody — czy zbiornik przekroczy poziom 1 litra?",
      body: "Uczeń najpierw wybiera ocenę mniej/równo/więcej niż 1 litr, następnie oblicza 17/12 l i zapisuje 1 5/12 l. Animowany poziom cieczy reaguje lekko, a reduced motion pokazuje stan bez ruchu.",
      modelId: "fraction-lesson",
      modelSeed: 360623,
      studentInstruction: "Najpierw oszacuj wynik względem 1 litra. Potem oblicz objętość, zapisz liczbę mieszaną i sprawdź ją z poziomem w zbiorniku.",
      discussionPrompts: ["Jak bez rachunku zauważyć, że wynik przekroczy 1?", "Dlaczego 17/12 l zapisujemy jako 1 5/12 l?"],
      print: {
        worksheetTitle: "Mikstura dla szklarni",
        instructions: "Przed obliczeniem zaznacz ocenę względem 1 litra. Następnie wykonaj rachunek, zamień wynik na liczbę mieszaną i odpowiedz z jednostką.",
        items: [{ id: "m536l2-greenhouse", skillIds: ["M5-3.6-l2-mixed-add-sub", "M5-3.6-l2-sense-check"], expression: "2/3 l + 3/4 l", prompt: "Oceń wynik, oblicz objętość i zapisz odpowiedź pełnym zdaniem.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-repair",
      kind: "discuss",
      title: "Napraw rozwiązanie",
      minutes: 7,
      headline: "2/3 + 1/4 ≠ 3/7 — wskaż pierwszy dokładny błąd i odbuduj wspólną miarę",
      body: "Uczeń wybiera jeden z czterech kroków. Poprawny wybór przekreśla mianownik 7, podświetla wspólny mianownik 12 i otwiera naprawę wyniku. Feedback nie zdradza odpowiedzi przed próbą.",
      modelId: "fraction-lesson",
      modelSeed: 360624,
      studentInstruction: "Wskaż pierwszy błędny krok w pokazanym śladzie. Potem zastąp mianownik 7 wspólną miarą, rozszerz oba ułamki i wpisz poprawny wynik.",
      discussionPrompts: ["Dlaczego dodanie mianowników zmienia wielkość części?", "Jaką kontrolę sensu można wykonać dla 2/3 + 1/4?"],
      print: {
        worksheetTitle: "Napraw błędne rozwiązanie",
        instructions: "Zakreśl pierwszy błędny krok, przekreśl niepoprawny mianownik i pod spodem zapisz poprawne rozwiązanie bez zamazywania starego śladu.",
        items: [{ id: "m536l2-repair", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-repair"], expression: "2/3 + 1/4 = 3/7", prompt: "Wskaż błąd, napraw rozszerzenia i zapisz 11/12.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-independent",
      kind: "exit-ticket",
      title: "Samodzielna próba L2",
      minutes: 7,
      headline: "Działanie, właściwa postać wyniku i kontrola względem całości",
      body: "Warianty Start, Dalej i Mistrzowskie obejmują odejmowanie, wynik przekraczający całość oraz liczby mieszane. Specyfikacja odpowiedzi i punktacja pozostają na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 360625,
      studentInstruction: "Rozwiąż bez gotowego wyniku. Wybierz wygodną wspólną miarę, użyj liczby mieszanej, gdy trzeba, skróć część ułamkową i sprawdź sens.",
      live: { enabled: true, kind: "exercise", minutes: 7 },
      questions: [
        { id: "m536l2-support", generatorId: "fraction-lesson-l1-v1", seed: 536201, difficulty: "support", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-core", generatorId: "fraction-lesson-l1-v1", seed: 536202, difficulty: "core", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-challenge", generatorId: "fraction-lesson-l1-v1", seed: 536203, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — różne mianowniki L2",
        instructions: "Wykonaj jeden wariant. Pokaż wspólną miarę, rozszerzenia, właściwą postać wyniku i krótką kontrolę sensu.",
        items: [
          { id: "m536l2-print-support", questionId: "m536l2-support", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "1/2 + 1/3", prompt: "Oblicz, skróć i oceń wynik względem 1.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-core", questionId: "m536l2-core", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "1 1/2 + 2/3", prompt: "Oblicz i zapisz wynik jako liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-challenge", questionId: "m536l2-challenge", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "3 1/4 − 1 5/6", prompt: "Wykonaj odejmowanie, zapisz wynik jako liczbę mieszaną i uzasadnij wybór NWW.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const operationStages = (input: {
  topicSlug: "7" | "8" | "9" | "10" | "11" | "r" | "s";
  skillIds: string[];
  visualTitle: string;
  visualHeadline: string;
  reasoningHeadline: string;
  contextHeadline: string;
  examples: Array<{ expression: string; prompt: string }>;
}): LessonStageBlueprint[] => {
  if (input.examples.length !== 5) throw new Error(`Temat M5-3-${input.topicSlug} musi mieć dokładnie pięć przykładów na wspólnym slajdzie ćwiczeniowym.`);
  const prefix = `m53${input.topicSlug}`;
  const questions = input.examples.map((_, index) => ({
    id: `${prefix}-q${index + 1}`,
    generatorId: "fraction-lesson-l1-v1",
    seed: Number(`53${input.topicSlug === "r" ? 90 : input.topicSlug === "s" ? 91 : input.topicSlug}${index + 1}`),
    difficulty: index === 0 ? "support" as const : index === 4 ? "challenge" as const : "core" as const,
    skillIds: [...input.skillIds],
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: true,
      manualReview: "possible" as const,
      feedbackKeys: ["FRA_EMPTY_PART", "FRA_ZERO_DENOMINATOR", "FRA_NOT_EQUIVALENT", "FRA_NOT_SIMPLIFIED", "FRA_WRONG_OPERATION_PAIR"],
    },
  }));
  return [
    {
      suffix: "visual",
      kind: "explore",
      title: input.visualTitle,
      minutes: 8,
      headline: input.visualHeadline,
      body: "Kliknij elementy obrazu. Każda zmiana modelu natychmiast zmienia pionowy zapis ułamka.",
      modelId: "fraction-lesson",
      modelSeed: 1,
    },
    {
      suffix: "reasoning",
      kind: "worked-example",
      title: "Tok rozumowania",
      minutes: 7,
      headline: input.reasoningHeadline,
      body: "Odkrywaj po jednym kroku. Kolor i linia wskazują wyłącznie liczby używane w aktualnym działaniu.",
      modelId: "fraction-lesson",
      modelSeed: 2,
    },
    {
      suffix: "context",
      kind: "practice",
      title: "Zadanie obrazkowe",
      minutes: 8,
      headline: input.contextHeadline,
      body: "Najpierw odczytaj znaczenie liczb z ilustracji, potem wybierz działanie i jednostkę.",
      modelId: "fraction-lesson",
      modelSeed: 3,
    },
    {
      suffix: "independent-5",
      kind: "practice",
      title: "Ćwiczenia — 5 przykładów",
      minutes: 12,
      headline: "Pięć osobnych przykładów",
      body: "Rozwiąż kolejno pięć przykładów. Każdy ma własny model, kratki odpowiedzi, klawiaturę i informację zwrotną.",
      modelId: "fraction-lesson",
      modelSeed: 4,
      questions,
      studentInstruction: "Rozwiąż pięć przykładów po kolei. W każdym pokaż rozumowanie, wpisz pionowy ułamek i sprawdź odpowiedź.",
      teacherInstruction: "Jeden slajd zawiera pięć osobnych przykładów w tym samym systemie co działy 1–2.",
      print: {
        worksheetTitle: "Pięć przykładów — ułamki zwykłe",
        instructions: "Rozwiąż każdy przykład w osobnym polu. Zapisz kroki, pionowy ułamek i kontrolę wyniku.",
        items: input.examples.map((example, index) => ({
          id: `${prefix}-print-${index + 1}`,
          questionId: questions[index]!.id,
          skillIds: [...input.skillIds],
          maxScore: 1,
          expression: example.expression,
          prompt: example.prompt,
          answerLayout: "fraction-stack" as const,
        })),
      },
    },
  ];
};

export const m537PowtorzPorcjeV1 = s3({
  id: "m5-3-7-powtorz-porcje-v1",
  topicId: "M5-3.7",
  title: "Mnożenie ułamka przez liczbę naturalną",
  coreLesson: "Powtórz porcję",
  paperEvidence: "Konteksty porcji, oś",
  studentGoal: "Uczeń mnoży ułamek przez liczbę naturalną z modelem powtórzonej porcji.",
  successCriteria: ["Interpretuje jako wielokrotność części.", "Skraca przed lub po mnożeniu."],
  prerequisiteSkillIds: ["M5-3.6-add-sub-diff-denom"],
  skillIds: ["M5-3.7-frac-times-natural"],
  stages: operationStages({ topicSlug: "7", skillIds: ["M5-3.7-frac-times-natural"], visualTitle: "Ta sama porcja kilka razy", visualHeadline: "Kliknij kawałki pizzy i zbuduj trzy porcje po 2/5", reasoningHeadline: "Liczba naturalna łączy się z licznikiem, a mianownik opisuje rozmiar części", contextHeadline: "Porcje karmy dla zwierząt", examples: [
    { expression: "3 × 2/5", prompt: "Zapisz wynik i pokaż trzy powtórzone porcje." },
    { expression: "4 × 3/8", prompt: "Skróć wynik i zapisz liczbę mieszaną." },
    { expression: "5 × 1/6", prompt: "Oblicz długość pięciu odcinków." },
    { expression: "6 × 5/8", prompt: "Skróć przed mnożeniem i dopisz jednostkę." },
    { expression: "2 × 7/9", prompt: "Oblicz i sprawdź dodawaniem powtarzanym." },
  ] }),
});

export const m538PodzielPotemWybierzV1 = s3({
  id: "m5-3-8-podziel-potrze-wybierz-v1",
  topicId: "M5-3.8",
  title: "Obliczanie ułamka liczby naturalnej",
  coreLesson: "Podziel, potem wybierz",
  paperEvidence: "Dwa sposoby rozwiązania",
  studentGoal: "Uczeń oblicza ułamek liczby naturalnej dwoma sposobami (najpierw dzielenie lub najpierw ułamek).",
  successCriteria: ["Stosuje 1/2 z n lub n × 1/2.", "Rozwiązuje dwoma kolejnościami działań."],
  prerequisiteSkillIds: ["M5-3.7-frac-times-natural"],
  skillIds: ["M5-3.8-fraction-of-number"],
  stages: operationStages({ topicSlug: "8", skillIds: ["M5-3.8-fraction-of-number"], visualTitle: "Podziel, potem wybierz", visualHeadline: "Podziel 24 obiekty na równe grupy i kliknij wybrane grupy", reasoningHeadline: "Najpierw dzielenie przez mianownik, potem mnożenie przez licznik", contextHeadline: "Budżet wycieczki", examples: [
    { expression: "1/3 z 24", prompt: "Podziel na trzy grupy i wybierz jedną." },
    { expression: "3/5 z 40", prompt: "Wskaż trzy z pięciu równych grup." },
    { expression: "2/3 z 45", prompt: "Oblicz dwoma kolejnymi działaniami." },
    { expression: "1/4 z 96 zł", prompt: "Oblicz część budżetu i dopisz jednostkę." },
    { expression: "3/8 z 64", prompt: "Oblicz i sprawdź wynikiem odwrotnym." },
  ] }),
});

export const m539CzescCzesciV1 = s3({
  id: "m5-3-9-czesc-czesci-v1",
  topicId: "M5-3.9",
  title: "Mnożenie ułamków",
  coreLesson: "Część części",
  paperEvidence: "Model pola, zadania praktyczne",
  studentGoal: "Uczeń mnoży ułamki przez model nakładających się prostokątów.",
  successCriteria: ["Interpretuje jako część części.", "Skraca wynik."],
  prerequisiteSkillIds: ["M5-3.8-fraction-of-number"],
  skillIds: ["M5-3.9-multiply-fractions"],
  stages: operationStages({ topicSlug: "9", skillIds: ["M5-3.9-multiply-fractions"], visualTitle: "Część części", visualHeadline: "Klikaj pola i obserwuj przecięcie dwóch zaznaczeń", reasoningHeadline: "Skracaj po skosie, potem łącz górne kratki i dolne kratki", contextHeadline: "Malowanie części muralu", examples: [
    { expression: "1/2 × 1/3", prompt: "Pokaż część części na modelu pola." },
    { expression: "2/3 × 3/5", prompt: "Skróć po skosie przed mnożeniem." },
    { expression: "3/4 × 2/7", prompt: "Zaznacz właściwe pary kratek." },
    { expression: "5/6 × 3/10", prompt: "Wykonaj dwa skrócenia po skosie." },
    { expression: "4/9 × 3/8", prompt: "Oblicz wynik w postaci nieskracalnej." },
  ] }),
});

export const m5310PodzielPasekV1 = s3({
  id: "m5-3-10-podziel-pasek-v1",
  topicId: "M5-3.10",
  title: "Dzielenie ułamków przez liczby naturalne",
  coreLesson: "Podziel pasek na grupy",
  paperEvidence: "Kontrola mnożeniem",
  studentGoal: "Uczeń dzieli ułamek przez liczbę naturalną jako podział paska na równe grupy.",
  successCriteria: ["Interpretuje wynik jako mniejsze części.", "Sprawdza mnożeniem wstecz."],
  prerequisiteSkillIds: ["M5-3.9-multiply-fractions"],
  skillIds: ["M5-3.10-divide-by-natural"],
  stages: operationStages({ topicSlug: "10", skillIds: ["M5-3.10-divide-by-natural"], visualTitle: "Podziel pasek na grupy", visualHeadline: "Kliknij kawałki pizzy i rozdaj je do równych grup", reasoningHeadline: "Dzielenie tworzy mniejsze równe części; wynik sprawdzamy mnożeniem", contextHeadline: "Sprawiedliwy podział pizzy", examples: [
    { expression: "3/4 : 3", prompt: "Podziel zaznaczone części między trzy osoby." },
    { expression: "5/6 : 2", prompt: "Pokaż podział każdej szóstej na pół." },
    { expression: "4/5 : 4", prompt: "Rozdaj po jednej piątej." },
    { expression: "7/8 : 3", prompt: "Zapisz wynik i kontrolę mnożeniem." },
    { expression: "5/9 : 5", prompt: "Podziel i skróć wynik." },
  ] }),
});

export const m5311IleRazyMiaraV1 = s3({
  id: "m5-3-11-ile-razy-miara-v1",
  topicId: "M5-3.11",
  title: "Dzielenie ułamków",
  coreLesson: "Ile razy mieści się miara?",
  paperEvidence: "Model pomiarowy, liczby mieszane",
  studentGoal: "Uczeń dzieli ułamki modelem pomiarowym i regułą odwrotności po zrozumieniu.",
  successCriteria: ["Używa modelu pomiarowego.", "Stosuje mnożenie przez odwrotność."],
  prerequisiteSkillIds: ["M5-3.10-divide-by-natural"],
  skillIds: ["M5-3.11-divide-fractions"],
  estimatedMinutes: 50,
  overview: "Ile razy 1/4 mieści się w 3/4 — zanim wprowadzimy regułę.",
  openingScript: "„Dzielenie to pytanie: ile razy miara mieści się w całości?”",
  closingScript: "„Sprawdź mnożeniem — czy wracasz do dzielnej?”",
  commonMisconceptions: ["Odwracanie niewłaściwego ułamka.", "Mylenie dzielenia z odejmowaniem."],
  stages: operationStages({ topicSlug: "11", skillIds: ["M5-3.11-divide-fractions"], visualTitle: "Ile razy mieści się miara?", visualHeadline: "Klikaj miarki i sprawdź, ile razy dzielnik mieści się w dzielnej", reasoningHeadline: "Odwracamy wyłącznie drugi ułamek — dzielnik", contextHeadline: "Laboratorium odmierzania napojów", examples: [
    { expression: "3/4 : 1/2", prompt: "Odpowiedz, ile połówek mieści się w trzech czwartych." },
    { expression: "2/3 : 4/5", prompt: "Zamień dzielenie na mnożenie przez odwrotność." },
    { expression: "5/6 : 10/9", prompt: "Skróć po zmianie działania." },
    { expression: "7/8 : 7/12", prompt: "Użyj modelu pomiarowego i zapisz wynik." },
    { expression: "4/9 : 2/3", prompt: "Oblicz i sprawdź mnożeniem." },
  ] }),
});

export const m53rKuchniaProporcjiV1 = s3({
  id: "m5-3-r-kuchnia-proporcji-v1",
  topicId: "M5-3.R",
  title: "Powtórzenie — Kuchnia proporcji",
  coreLesson: "Kuchnia proporcji",
  paperEvidence: "Karta wieloetapowa",
  studentGoal: "Uczeń utrwala reprezentacje i działania na ułamkach w zadaniach praktycznych.",
  successCriteria: ["Wybiera reprezentację.", "Diagnozuje typ błędu."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-3.R-review"],
  estimatedMinutes: 40,
  overview: "Stacje: porcje, receptury, porównywanie, działania.",
  openingScript: "„Kuchnia proporcji — ułamki w praktyce.”",
  closingScript: "„Mapa błędów — który typ wróci do domu?”",
  commonMisconceptions: ["Mechaniczne reguły bez modelu."],
  stages: operationStages({ topicSlug: "r", skillIds: ["M5-3.R-review"], visualTitle: "Kuchnia proporcji", visualHeadline: "Klikaj porcje i przypomnij sobie znaczenie modeli", reasoningHeadline: "Dobierz strategię do rodzaju działania", contextHeadline: "Receptura Chrupka", examples: [
    { expression: "3 × 2/5", prompt: "Mnożenie przez liczbę naturalną." },
    { expression: "3/5 z 40", prompt: "Ułamek liczby naturalnej." },
    { expression: "3/4 × 2/7", prompt: "Mnożenie ułamków." },
    { expression: "5/6 : 2", prompt: "Dzielenie przez liczbę naturalną." },
    { expression: "4/9 : 2/3", prompt: "Dzielenie ułamków." },
  ] }),
});

export const m53sStrategiePaskachV1 = s3({
  id: "m5-3-s-strategie-paskach-v1",
  topicId: "M5-3.S",
  title: "Sprawdzian i omówienie — Strategie na paskach",
  coreLesson: "Strategie na paskach",
  paperEvidence: "A/B, rubryka kroków",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 3 i omawia równoważne strategie.",
  successCriteria: ["Pokazuje kroki na modelu.", "Akceptuje równoważne odpowiedzi."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-3.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian ułamków + omówienie na paskach.",
  openingScript: "„Sprawdzian działu 3 — strategia ważniejsza niż skrót.”",
  closingScript: "„Omówienie: dwie równoważne drogi do tego samego wyniku.”",
  commonMisconceptions: ["Jedna „właściwa” metoda bez uzasadnienia."],
  stages: operationStages({ topicSlug: "s", skillIds: ["M5-3.S-exam"], visualTitle: "Przygotowanie modelu", visualHeadline: "Przypomnij sobie obsługę modeli bez ujawniania odpowiedzi", reasoningHeadline: "Przeczytaj polecenie, wybierz model, zapisz kroki i sprawdź sens", contextHeadline: "Zadanie praktyczne sprawdzianu", examples: [
    { expression: "4 × 3/8", prompt: "Oblicz i zapisz najprostszą postać." },
    { expression: "2/3 z 45", prompt: "Pokaż oba działania." },
    { expression: "5/6 × 3/10", prompt: "Skróć przed mnożeniem." },
    { expression: "7/8 : 3", prompt: "Oblicz i sprawdź mnożeniem." },
    { expression: "2/3 : 4/5", prompt: "Odwróć wyłącznie dzielnik i oblicz." },
  ] }),
});

export const section3LessonsWpC3: LessonPackage[] = [
  m531JednaCaloscV1,
  m531UlamkiMieszaneL2V1,
  m532PodzielSprawiedliwieV1,
  m533TaSamaCzescV1,
  m534NalozPaskiV1,
  m535LaczCzesciV1,
  m535LiczbyMieszaneL2V1,
  m536WspolnaMiaraV1,
  m536RozneMianownikiL2V1,
  m537PowtorzPorcjeV1,
  m538PodzielPotemWybierzV1,
  m539CzescCzesciV1,
  m5310PodzielPasekV1,
  m5311IleRazyMiaraV1,
  m53rKuchniaProporcjiV1,
  m53sStrategiePaskachV1,
];
