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

/**
 * Każda karta interaktywna w dziale 3 jest zadaniem, a nie bierną planszą.
 * Seria pięciu lub dziesięciu przykładów nadal pozostaje jednym slajdem i jedynym etapem
 * dowodowym, natomiast pozostałe modele dostają pojedyncze, oceniane zadanie.
 */
function withTaskStages(stages: LessonStageBlueprint[]): LessonStageBlueprint[] {
  const evidenceIndexes = stages.flatMap((stage, index) => stage.questions && [5, 10].includes(stage.questions.length) ? [index] : []);
  if (evidenceIndexes.length !== 1) {
    throw new Error(`Każdy pakiet działu 3 musi mieć jeden slajd ćwiczeniowy z serią przykładów; znaleziono ${evidenceIndexes.length}.`);
  }
  const targetIndex = evidenceIndexes[0]!;
  const target = stages[targetIndex]!;
  const sourceQuestions = target.questions ?? [];
  if (![5, 10].includes(sourceQuestions.length)) {
    throw new Error(`Slajd ${target.suffix} musi zawierać pięć albo dziesięć świadomie zaprojektowanych pytań; znaleziono ${sourceQuestions.length}.`);
  }
  const sourceItems = target.print?.items ?? [];
  if (sourceItems.length !== sourceQuestions.length) {
    throw new Error(`Slajd ${target.suffix} musi mieć tyle samo zadań do druku, co pytań; znaleziono ${sourceItems.length}.`);
  }
  return stages.map((stage, index) => {
    if (index === targetIndex) return {
      ...stage,
      title: target.preserveTaskTitle ? target.title : `Ćwiczenia — ${sourceQuestions.length} przykładów`,
      headline: target.preserveTaskTitle ? target.headline : `${sourceQuestions.length} osobnych przykładów`,
      body: target.preserveTaskTitle ? target.body : `Rozwiąż ${sourceQuestions.length} przykładów po kolei. Każdy przykład ma osobny model, odpowiedź i informację zwrotną.`,
      studentInstruction: `Rozwiąż kolejno ${sourceQuestions.length} przykładów. Po przesłaniu każdego zadania przejdziesz do następnego.`,
      teacherInstruction: `Ten jeden slajd ćwiczeniowy zawiera ${sourceQuestions.length} osobnych przykładów.`,
      questions: sourceQuestions,
      print: target.print ? { ...target.print, itemCount: sourceQuestions.length, items: sourceItems } : target.print,
    };
    if (stage.modelId !== "fraction-lesson" || stage.questions?.length) return stage;
    return {
      ...stage,
      live: stage.live ?? { enabled: true, kind: "exercise", minutes: stage.minutes },
      questions: [{
        id: `${stage.suffix}-q1`,
        generatorId: "fraction-lesson-l1-v1",
        seed: stage.modelSeed ?? 1,
        difficulty: "core",
      }],
    };
  });
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
    stageBlueprints: withTaskStages(input.stages),
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
  paperEvidence: "Karta L1: zaznaczanie części całości, kolorowanie zbiorów według dwóch ułamków, odczytywanie udziału kolorów i podpisywanie punktów na osi pionowym zapisem ułamka.",
  studentGoal: "Uczeń interpretuje licznik i mianownik, zapisuje część zbioru ułamkiem oraz odczytuje ułamki na osi.",
  successCriteria: [
    "Potrafię zaznaczyć tyle równych części, ile wskazuje licznik.",
    "Potrafię zapisać ułamkiem część zbioru.",
    "Potrafię podpisać punkty na osi pionowym zapisem ułamka.",
  ],
  learningGoals: [m531SlideZero.learningGoals[0]!, m531SlideZero.learningGoals[3]!],
  prerequisiteSkillIds: [],
  skillIds: m531L1SkillIds,
  estimatedMinutes: 45,
  overview: "Lekcja prowadzi od bezpośredniego zaznaczania części i badania kolorowego zbioru do odczytywania punktów na osi.",
  openingScript: "„Licznik mówi, ile części wybieramy, a mianownik — na ile równych części podzielono całość.”",
  closingScript: "„Ten sam ułamek możemy zobaczyć jako część figury, część zbioru i punkt na osi.”",
  commonMisconceptions: [
    "Zaznaczanie liczby części wskazanej przez mianownik zamiast licznik.",
    "Liczenie tylko kolorowych kółek zamiast wszystkich elementów zbioru.",
    "Mylenie numeru kreski osi z liczbą wszystkich odcinków.",
  ],
  stages: [
    {
      suffix: "topic1-shade-colors",
      kind: "explore",
      title: "Co mówi ułamek?",
      minutes: 14,
      headline: "Zaznacz część, odczytaj kolory i sam pomaluj zbiór",
      body: "Uczeń zaznacza części, zapisuje ułamki dla kolorowych kółek, a następnie maluje tulipany, gruszki, ołówki i jabłka według dwóch podanych ułamków.",
      modelId: "fraction-lesson",
      modelSeed: 31011,
      studentInstruction: "Najpierw zaznacz dokładnie cztery części i opisz kolorowe kółka. Potem wybierz pędzel i pomaluj każdy zbiór zgodnie z dwoma pionowymi ułamkami.",
      discussionPrompts: ["Co opisuje licznik?", "Dlaczego mianownik każdego ułamka koloru jest taki sam?"],
      print: {
        worksheetTitle: "Część całości i część zbioru",
        instructions: "Zaznacz wskazane części. W odpowiedziach wpisuj licznik nad kreską, a mianownik pod kreską.",
        items: [
          { id: "m531-l1-mark", skillIds: [m531L1SkillIds[0]!], expression: "4 zaznaczone części z 7 równych części", prompt: "Zapisz ułamek pionowo.", answerLayout: "fraction-stack" },
          { id: "m531-l1-colors", skillIds: [m531L1SkillIds[0]!], expression: "12 kółek w czterech kolorach", prompt: "Zapisz część kółek każdego koloru.", answerLayout: "fraction-stack" },
          { id: "m531-l1-tulips", skillIds: [m531L1SkillIds[0]!], expression: "8 tulipanów", prompt: "Pomaluj jedną czwartą na czerwono, a trzy czwarte na żółto.", answerLayout: "standard" },
          { id: "m531-l1-pears", skillIds: [m531L1SkillIds[0]!], expression: "12 gruszek", prompt: "Pomaluj pięć szóstych na zielono, a jedną szóstą na żółto.", answerLayout: "standard" },
          { id: "m531-l1-pencils", skillIds: [m531L1SkillIds[0]!], expression: "9 ołówków", prompt: "Pomaluj dwie trzecie na niebiesko, a jedną trzecią na żółto.", answerLayout: "standard" },
          { id: "m531-l1-apples", skillIds: [m531L1SkillIds[0]!], expression: "10 jabłek", prompt: "Pomaluj dwie piąte na czerwono, a trzy piąte na zielono.", answerLayout: "standard" },
        ],
      },
    },
    {
      suffix: "topic1-axis-labels",
      kind: "practice",
      title: "Podpisz ułamki na osi",
      minutes: 14,
      headline: "Każdy punkt leży na konkretnej kresce podziałki",
      body: "Oś od zera do jednej całości jest podzielona na osiem równych odcinków. Uczeń wybiera punkt A, B lub C i podpisuje go pionowym ułamkiem.",
      modelId: "fraction-lesson",
      modelSeed: 31012,
      studentInstruction: "Wybierz punkt, policz odcinki od zera i wpisz licznik nad kreską oraz mianownik pod kreską.",
      print: {
        worksheetTitle: "Ułamki na osi",
        instructions: "Podziel odcinek na osiem równych części i podpisz trzy zaznaczone punkty.",
        items: [
          { id: "m531-l1-axis-a", skillIds: [m531L1SkillIds[1]!], expression: "Punkt A: druga kreska po zerze", prompt: "Zapisz wartość punktu pionowo.", answerLayout: "fraction-axis" },
          { id: "m531-l1-axis-b", skillIds: [m531L1SkillIds[1]!], expression: "Punkt B: piąta kreska po zerze", prompt: "Zapisz wartość punktu pionowo.", answerLayout: "fraction-axis" },
          { id: "m531-l1-axis-c", skillIds: [m531L1SkillIds[1]!], expression: "Punkt C: siódma kreska po zerze", prompt: "Zapisz wartość punktu pionowo.", answerLayout: "fraction-axis" },
        ],
      },
    },
    {
      suffix: "topic1-independent-basic",
      kind: "exit-ticket",
      title: "Ćwiczenia",
      minutes: 12,
      headline: "Pięć osobnych przykładów",
      modelId: "fraction-lesson",
      modelSeed: 31100,
      studentInstruction: "Rozwiąż kolejno pięć przykładów. Każdy ma osobną odpowiedź i informację zwrotną.",
      live: { enabled: true, kind: "exercise", minutes: 12 },
      questions: [
        { id: "m531-l1-q1", generatorId: "fraction-lesson-l1-v1", seed: 31100, difficulty: "support", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-q2", generatorId: "fraction-lesson-l1-v1", seed: 31101, difficulty: "core", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-q3", generatorId: "fraction-lesson-l1-v1", seed: 31102, difficulty: "challenge", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-q4", generatorId: "fraction-lesson-l1-v1", seed: 31103, difficulty: "challenge", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
        { id: "m531-l1-q5", generatorId: "fraction-lesson-l1-v1", seed: 31104, difficulty: "challenge", skillIds: m531L1SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: false, manualReview: "possible", feedbackKeys: m531FeedbackKeys } },
      ],
      print: {
        worksheetTitle: "Ćwiczenia — część całości i oś",
        instructions: "Rozwiąż pięć osobnych przykładów. Ułamki zapisuj pionowo.",
        items: [
          { id: "m531-l1-p1", questionId: "m531-l1-q1", skillIds: m531L1SkillIds, maxScore: 1, expression: "3 zaznaczone części z 5", prompt: "Zapisz ułamek.", answerLayout: "fraction-stack" },
          { id: "m531-l1-p2", questionId: "m531-l1-q2", skillIds: m531L1SkillIds, maxScore: 1, expression: "Punkt na drugiej z 7 części osi", prompt: "Zapisz wartość.", answerLayout: "fraction-axis" },
          { id: "m531-l1-p3", questionId: "m531-l1-q3", skillIds: m531L1SkillIds, maxScore: 1, expression: "4 zielone kółka z 9", prompt: "Zapisz część zielonych kółek.", answerLayout: "fraction-stack" },
          { id: "m531-l1-p4", questionId: "m531-l1-q4", skillIds: m531L1SkillIds, maxScore: 1, expression: "5 zaznaczonych pól z 8", prompt: "Zapisz ułamek.", answerLayout: "fraction-stack" },
          { id: "m531-l1-p5", questionId: "m531-l1-q5", skillIds: m531L1SkillIds, maxScore: 1, expression: "Punkt na szóstej z 10 części osi", prompt: "Zapisz wartość.", answerLayout: "fraction-axis" },
        ],
      },
    },
  ],
});

const m531L2SkillIds = [
  "M5-3.1-proper-improper",
  "M5-3.1-mixed-conversion",
  "M5-3.1-unit-fraction",
];

export const m531UlamkiMieszaneL2V1 = s3({
  id: "m5-3-1-ulamki-liczby-mieszane-l2-v1",
  topicId: "M5-3.1",
  lessonNumber: 2,
  title: "Ułamki i liczby mieszane",
  coreLesson: "Ułamki i liczby mieszane — poziom 2",
  paperEvidence: "Karta L2: klasyfikacja ułamków, odczyt pokolorowanych kół, ułamki jednostek oraz zamiana liczby mieszanej na ułamek niewłaściwy.",
  studentGoal: "Uczeń rozpoznaje ułamki właściwe i niewłaściwe, odczytuje model większy od całości, zapisuje część jednostki i zamienia liczbę mieszaną na ułamek niewłaściwy.",
  successCriteria: [
    "Potrafię rozpoznać ułamek właściwy i niewłaściwy.",
    "Potrafię opisać pokolorowane koła ułamkiem niewłaściwym i liczbą mieszaną.",
    "Potrafię zapisać mniejszą jednostkę jako część większej jednostki.",
    "Potrafię zamienić liczbę mieszaną na ułamek niewłaściwy.",
  ],
  learningGoals: [m531SlideZero.learningGoals[1]!, m531SlideZero.learningGoals[2]!, m531SlideZero.learningGoals[3]!],
  prerequisiteSkillIds: ["M5-3.1-part-whole", "M5-3.1-number-line"],
  skillIds: m531L2SkillIds,
  estimatedMinutes: 45,
  overview: "Lekcja porządkuje rodzaje ułamków, łączy dwa zapisy pokolorowanych kół, wykorzystuje jednostki i kończy jedną, jasno pokazaną zamianą.",
  openingScript: "„Licznik może być mniejszy, równy lub większy od mianownika — każdy taki zapis ma konkretne znaczenie.”",
  closingScript: "„W zamianie liczby mieszanej mnożymy całości przez mianownik, dodajemy licznik, a mianownik pozostaje bez zmiany.”",
  commonMisconceptions: [
    "Uznawanie ułamka z równym licznikiem i mianownikiem za właściwy.",
    "Liczenie tylko części drugiego koła zamiast wszystkich pokolorowanych części.",
    "Porównywanie milimetrów bez przeliczenia pełnego centymetra.",
    "Dodawanie części całkowitej bez pomnożenia jej przez mianownik.",
  ],
  stages: [
    {
      suffix: "topic1-classify",
      kind: "practice",
      title: "Właściwy czy niewłaściwy?",
      minutes: 8,
      headline: "Porównaj licznik z mianownikiem",
      modelId: "fraction-lesson",
      modelSeed: 31201,
      studentInstruction: "Rozwiąż trzy zadania po dwa ułamki. Kolejna para pojawi się dopiero po poprawnym zatwierdzeniu poprzedniej.",
      print: {
        worksheetTitle: "Ułamki właściwe i niewłaściwe",
        instructions: "Przy każdym pionowym ułamku zaznacz jego rodzaj.",
        items: [
          { id: "m531-l2-classify-a", skillIds: [m531L2SkillIds[0]!], expression: "licznik 3, mianownik 5", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
          { id: "m531-l2-classify-b", skillIds: [m531L2SkillIds[0]!], expression: "licznik 7, mianownik 4", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
          { id: "m531-l2-classify-c", skillIds: [m531L2SkillIds[0]!], expression: "licznik 6, mianownik 6", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
          { id: "m531-l2-classify-d", skillIds: [m531L2SkillIds[0]!], expression: "licznik 2, mianownik 9", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
          { id: "m531-l2-classify-e", skillIds: [m531L2SkillIds[0]!], expression: "licznik 11, mianownik 8", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
          { id: "m531-l2-classify-f", skillIds: [m531L2SkillIds[0]!], expression: "licznik 5, mianownik 12", prompt: "Właściwy czy niewłaściwy?", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic1-improper-model",
      kind: "worked-example",
      title: "Dwa zapisy pokolorowanych kół",
      minutes: 9,
      headline: "Jedno pełne koło i część drugiego",
      body: "Trzy zadania z podzielonymi kołami. Uczeń kolejno zamalowuje wskazaną liczbę części, a potem wpisuje oba równoważne zapisy bez podpisu zdradzającego wynik pod kołami.",
      modelId: "fraction-lesson",
      modelSeed: 31202,
      studentInstruction: "Zamaluj kolejno tyle części kół, ile wskazuje licznik. Potem oddziel pełne koła od reszty i uzupełnij oba pionowe zapisy.",
      print: {
        worksheetTitle: "Koła i dwa równoważne zapisy",
        instructions: "Pokoloruj jedno pełne koło i trzy części drugiego koła podzielonego na ćwiartki. Uzupełnij oba zapisy.",
        items: [
          { id: "m531-l2-model", skillIds: [m531L2SkillIds[1]!], expression: "7 pokolorowanych ćwiartek", prompt: "Zapisz ułamek niewłaściwy i liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m531-l2-model-thirds", skillIds: [m531L2SkillIds[1]!], expression: "8 pokolorowanych trzecich", prompt: "Zapisz ułamek niewłaściwy i liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m531-l2-model-fifths", skillIds: [m531L2SkillIds[1]!], expression: "11 pokolorowanych piątych", prompt: "Zapisz ułamek niewłaściwy i liczbę mieszaną.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic1-unit-fractions",
      kind: "practice",
      title: "Ułamek jednostki",
      minutes: 8,
      headline: "Mniejsza jednostka jako część większej",
      body: "Cztery niezależne zadania dotyczą odległości i masy. Uczeń najpierw zapisuje ułamek z jednostek, a dopiero potem jego skróconą postać.",
      modelId: "fraction-lesson",
      modelSeed: 31203,
      studentInstruction: "Rozwiąż cztery zadania z długością i masą. Najpierw zapisz pełny ułamek wynikający z zamiany jednostek, potem skróć go w drugim polu.",
      print: {
        worksheetTitle: "Jednostki zapisane ułamkiem",
        instructions: "Najpierw przelicz całą większą jednostkę, potem zapisz ułamek.",
        items: [
          { id: "m531-l2-unit-mm", skillIds: [m531L2SkillIds[2]!], expression: "7 mm z 1 cm", prompt: "Jaką część centymetra stanowi 7 mm?", answerLayout: "fraction-stack" },
          { id: "m531-l2-unit-g", skillIds: [m531L2SkillIds[2]!], expression: "300 g z 1 kg", prompt: "Jaką część kilograma stanowi 300 g? Skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m531-l2-unit-cm", skillIds: [m531L2SkillIds[2]!], expression: "25 cm z 1 m", prompt: "Jaką część metra stanowi 25 cm? Skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m531-l2-unit-750g", skillIds: [m531L2SkillIds[2]!], expression: "750 g z 1 kg", prompt: "Jaką część kilograma stanowi 750 g? Skróć wynik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic1-mixed-to-improper",
      kind: "worked-example",
      title: "Liczba mieszana na ułamek niewłaściwy",
      minutes: 8,
      headline: "Pomnóż całości przez mianownik, potem dodaj licznik",
      body: "Cztery zadania mają małe modele pełnych grup i reszty. Uczeń liczy wszystkie części, a mianownik pozostawia bez zmiany.",
      modelId: "fraction-lesson",
      modelSeed: 31204,
      studentInstruction: "Rozwiąż cztery zamiany liczby mieszanej na ułamek niewłaściwy. Skorzystaj z graficznej podpowiedzi mnożenia i dodawania.",
      print: {
        worksheetTitle: "Z liczby mieszanej do ułamka niewłaściwego",
        instructions: "Pomnóż liczbę całości przez mianownik, dodaj licznik i pozostaw mianownik bez zmiany.",
        items: [
          { id: "m531-l2-mixed", skillIds: [m531L2SkillIds[1]!], expression: "2 i 3/5", prompt: "Zamień na ułamek niewłaściwy.", answerLayout: "fraction-stack" },
          { id: "m531-l2-mixed-quarters", skillIds: [m531L2SkillIds[1]!], expression: "1 i 3/4", prompt: "Zamień na ułamek niewłaściwy.", answerLayout: "fraction-stack" },
          { id: "m531-l2-mixed-thirds", skillIds: [m531L2SkillIds[1]!], expression: "3 i 2/3", prompt: "Zamień na ułamek niewłaściwy.", answerLayout: "fraction-stack" },
          { id: "m531-l2-mixed-halves", skillIds: [m531L2SkillIds[1]!], expression: "4 i 1/2", prompt: "Zamień na ułamek niewłaściwy.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic1-independent-advanced",
      kind: "exit-ticket",
      title: "Ćwiczenia",
      minutes: 10,
      headline: "Pięć osobnych przykładów",
      modelId: "fraction-lesson",
      modelSeed: 31200,
      studentInstruction: "W pierwszym zadaniu wpisz kilka wartości w puste pola jednej osi. W drugim przeciągnij ułamki niewłaściwe i liczby mieszane na właściwe miejsca.",
      live: { enabled: true, kind: "exercise", minutes: 10 },
      questions: [
        { id: "m531-l2-q1", generatorId: "fraction-lesson-l1-v1", seed: 31200, difficulty: "support", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-q2", generatorId: "fraction-lesson-l1-v1", seed: 31201, difficulty: "core", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-q3", generatorId: "fraction-lesson-l1-v1", seed: 31202, difficulty: "challenge", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-q4", generatorId: "fraction-lesson-l1-v1", seed: 31203, difficulty: "challenge", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
        { id: "m531-l2-q5", generatorId: "fraction-lesson-l1-v1", seed: 31204, difficulty: "challenge", skillIds: m531L2SkillIds, feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_L2_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Ćwiczenia — ułamki na osi liczbowej",
        instructions: "Uzupełnij podpisy kilku punktów na osi, a następnie dopasuj równoważne zapisy mieszane i niewłaściwe do właściwych miejsc.",
        items: [
          { id: "m531-l2-p1", questionId: "m531-l2-q1", skillIds: m531L2SkillIds, maxScore: 1, expression: "3/4", prompt: "Zaznacz 3/4 na osi od 0 do 6.", answerLayout: "fraction-axis" },
          { id: "m531-l2-p2", questionId: "m531-l2-q2", skillIds: m531L2SkillIds, maxScore: 1, expression: "7/4", prompt: "Zaznacz 7/4 na osi od 0 do 6.", answerLayout: "fraction-axis" },
          { id: "m531-l2-p3", questionId: "m531-l2-q3", skillIds: m531L2SkillIds, maxScore: 1, expression: "9/2", prompt: "Zaznacz 9/2 na osi od 0 do 6.", answerLayout: "fraction-axis" },
          { id: "m531-l2-p4", questionId: "m531-l2-q4", skillIds: m531L2SkillIds, maxScore: 1, expression: "11/3", prompt: "Zaznacz 11/3 na osi od 0 do 6.", answerLayout: "fraction-axis" },
          { id: "m531-l2-p5", questionId: "m531-l2-q5", skillIds: m531L2SkillIds, maxScore: 1, expression: "13/6", prompt: "Zaznacz 13/6 na osi od 0 do 6.", answerLayout: "fraction-axis" },
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
  paperEvidence: "Karta L1: dzielenie całych kół na połówki, iloraz zapisany pionowym ułamkiem, całe liczby zapisane ułamkiem i zamiana ułamka niewłaściwego na liczbę mieszaną.",
  studentGoal: "Uczeń interpretuje dzielenie na modelu, zapisuje iloraz ułamkiem, przedstawia całości jako ułamki i zamienia ułamek niewłaściwy na liczbę mieszaną.",
  successCriteria: [
    "Potrafię podzielić figury na równe połówki i opisać udział jednej osoby.",
    "Potrafię przedstawić iloraz w postaci pionowego ułamka.",
    "Potrafię zapisać liczbę całkowitą jako ułamek o podanym mianowniku.",
    "Potrafię zamienić ułamek niewłaściwy na liczbę mieszaną.",
  ],
  prerequisiteSkillIds: ["M5-3.1-part-whole", "M5-3.1-mixed-conversion"],
  skillIds: [
    "M5-3.2-fraction-as-quotient",
    "M5-3.2-fair-sharing",
    "M5-3.2-context-interpretation",
  ],
  estimatedMinutes: 45,
  overview: "Uczeń najpierw rzeczywiście przecina koła na połówki, następnie zapisuje ilorazy ułamkiem, kroi dwie całości na części i na końcu grupuje ułamek niewłaściwy w liczbę mieszaną.",
  openingScript: "„Dzielenie i ułamek opisują tę samą sytuację: to, co dzielimy, trafia nad kreskę, a liczba równych grup — pod kreskę.”",
  closingScript: "„Model pokazuje, dlaczego iloraz, ułamek i liczba mieszana mogą opisywać dokładnie tę samą wartość.”",
  commonMisconceptions: [
    "Rysowanie osobnych połówek zamiast dzielenia istniejących kół.",
    "Odwracanie dzielnej i dzielnika w pionowym ułamku.",
    "Liczenie części tylko jednej całości przy zapisie liczby 2 jako ułamka.",
    "Pozostawianie niewłaściwego licznika w części ułamkowej liczby mieszanej.",
  ],
  stages: [
    {
      suffix: "topic2-halves",
      kind: "explore",
      title: "Podziel koła na połówki",
      minutes: 10,
      headline: "Naciśnij przycisk i przetnij każde koło na dwie równe części",
      body: "Uczeń wybiera trzy, pięć albo siedem kół. Przycisk dzieli bezpośrednio te koła — nie tworzy osobnego magazynu połówek.",
      modelId: "fraction-lesson",
      modelSeed: 32021,
      studentInstruction: "Wybierz zestaw kół, naciśnij „Podziel koła na połówki”, a potem zapisz pionowo udział jednej z dwóch osób.",
      discussionPrompts: ["Dlaczego każde koło trzeba przeciąć tak samo?", "Ile połówek powstaje z wybranej liczby kół?"],
      print: {
        worksheetTitle: "Podział kół na połówki",
        instructions: "Przetnij każde narysowane koło na dwie równe części i opisz udział jednej osoby.",
        items: [
          { id: "m532-halves-three", skillIds: ["M5-3.2-fair-sharing"], expression: "3 koła dla 2 osób", prompt: "Narysuj podział i zapisz udział jednej osoby.", answerLayout: "fraction-stack" },
          { id: "m532-halves-five", skillIds: ["M5-3.2-fair-sharing"], expression: "5 kół dla 2 osób", prompt: "Narysuj podział i zapisz udział jednej osoby.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic2-quotient-fractions",
      kind: "worked-example",
      title: "Przedstaw iloraz w postaci ułamka",
      minutes: 9,
      headline: "Dzielna nad kreskę, dzielnik pod kreskę",
      body: "Uczeń przełącza przykłady 1 : 7, 13 : 5 i 8 : 3. Jabłka dzielone między osoby pokazują, dlaczego dzielna trafia nad kreskę, a dzielnik pod nią.",
      modelId: "fraction-lesson",
      modelSeed: 32022,
      studentInstruction: "Wybierz przykład, zobacz podział jabłek między osoby, a następnie wpisz pionowy ułamek.",
      print: {
        worksheetTitle: "Iloraz jako ułamek",
        instructions: "Wpisz dzielną nad kreską ułamkową, a dzielnik pod kreską.",
        items: [
          { id: "m532-quotient-one-seven", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "1 : 7", prompt: "Przedstaw iloraz w postaci ułamka.", answerLayout: "fraction-stack" },
          { id: "m532-quotient-thirteen-five", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "13 : 5", prompt: "Przedstaw iloraz w postaci ułamka.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic2-wholes-as-fractions",
      kind: "explore",
      title: "Całości jako ułamki",
      minutes: 9,
      headline: "Dwie figury potnij na wybraną liczbę części",
      body: "Uczeń wybiera mianownik 2, 4 albo 6 i naciska przycisk krojenia. Rysunek zmienia się natychmiast, a licznik wynika z liczby części w obu kołach.",
      modelId: "fraction-lesson",
      modelSeed: 32023,
      studentInstruction: "Wybierz mianownik, podziel obie figury i policz wszystkie części. Zapisz działanie w jednej linii, na przykład 2 = 8/4.",
      print: {
        worksheetTitle: "Liczby całkowite jako ułamki",
        instructions: "Podziel każdą z dwóch całości zgodnie z podanym mianownikiem i policz wszystkie części.",
        items: [
          { id: "m532-whole-sixths", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "2 całe, mianownik 6", prompt: "Zapisz liczbę 2 jako ułamek.", answerLayout: "fraction-stack" },
          { id: "m532-whole-fourths", skillIds: ["M5-3.2-fraction-as-quotient"], expression: "2 całe, mianownik 4", prompt: "Zapisz liczbę 2 jako ułamek.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic2-improper-to-mixed",
      kind: "worked-example",
      title: "Ułamek niewłaściwy na liczbę mieszaną",
      minutes: 8,
      headline: "Zgrupuj pełne koła i zapisz resztę",
      body: "Model dziewięciu pokolorowanych ćwiartek pokazuje dwie pełne całości oraz jedną pozostałą ćwiartkę. W tym temacie zamiana odbywa się wyłącznie w tę stronę.",
      modelId: "fraction-lesson",
      modelSeed: 32024,
      studentInstruction: "Policz pełne grupy po cztery części i pozostałą część. Uzupełnij pionowy zapis liczby mieszanej.",
      print: {
        worksheetTitle: "Z ułamka niewłaściwego do liczby mieszanej",
        instructions: "Otocz pełne grupy, zapisz ich liczbę i pozostałą część.",
        items: [
          { id: "m532-improper-nine-fourths", skillIds: ["M5-3.2-context-interpretation"], expression: "9/4", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-improper-eleven-thirds", skillIds: ["M5-3.2-context-interpretation"], expression: "11/3", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-improper-thirteen-fifths", skillIds: ["M5-3.2-context-interpretation"], expression: "13/5", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-improper-eight-thirds", skillIds: ["M5-3.2-context-interpretation"], expression: "8/3", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "topic2-independent",
      kind: "exit-ticket",
      title: "Ćwiczenia",
      minutes: 9,
      headline: "Pięć osobnych przykładów",
      modelId: "fraction-lesson",
      modelSeed: 32300,
      studentInstruction: "Rozwiąż pięć przykładów: dwa ilorazy, zapis całości oraz dwie zamiany na liczbę mieszaną.",
      live: { enabled: true, kind: "exercise", minutes: 9 },
      questions: [
        { id: "m532-q1", generatorId: "fraction-lesson-l1-v1", seed: 32300, difficulty: "support", skillIds: ["M5-3.2-fraction-as-quotient"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-q2", generatorId: "fraction-lesson-l1-v1", seed: 32301, difficulty: "core", skillIds: ["M5-3.2-fraction-as-quotient"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-q3", generatorId: "fraction-lesson-l1-v1", seed: 32302, difficulty: "challenge", skillIds: ["M5-3.2-fraction-as-quotient"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-q4", generatorId: "fraction-lesson-l1-v1", seed: 32303, difficulty: "challenge", skillIds: ["M5-3.2-context-interpretation"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
        { id: "m532-q5", generatorId: "fraction-lesson-l1-v1", seed: 32304, difficulty: "challenge", skillIds: ["M5-3.2-context-interpretation"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_QUOTIENT_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Ćwiczenia — iloraz i liczba mieszana",
        instructions: "Rozwiąż pięć osobnych przykładów. Ułamki zapisuj pionowo.",
        items: [
          { id: "m532-p1", questionId: "m532-q1", skillIds: ["M5-3.2-fraction-as-quotient"], maxScore: 1, expression: "14 : 3", prompt: "Zapisz pionowy ułamek.", answerLayout: "fraction-stack" },
          { id: "m532-p2", questionId: "m532-q2", skillIds: ["M5-3.2-fraction-as-quotient"], maxScore: 1, expression: "3, mianownik 7", prompt: "Zapisz ułamek równy 3.", answerLayout: "fraction-stack" },
          { id: "m532-p3", questionId: "m532-q3", skillIds: ["M5-3.2-context-interpretation"], maxScore: 1, expression: "17 piątych", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-p4", questionId: "m532-q4", skillIds: ["M5-3.2-context-interpretation"], maxScore: 1, expression: "19 szóstych", prompt: "Zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m532-p5", questionId: "m532-q5", skillIds: ["M5-3.2-fraction-as-quotient"], maxScore: 1, expression: "5 : 8", prompt: "Zapisz pionowy ułamek.", answerLayout: "fraction-stack" },
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
  paperEvidence: "Pionowy zapis skracania do postaci nieskracalnej oraz rozszerzania dwóch ułamków do wspólnego mianownika.",
  studentGoal: "Nauczę się skracać ułamek do postaci nieskracalnej oraz rozszerzać ułamki tak, aby miały wspólny mianownik.",
  successCriteria: [
    "Potrafię rozpoznać ułamek skracalny i nieskracalny.",
    "Potrafię skrócić licznik i mianownik przez ten sam wspólny dzielnik.",
    "Potrafię rozszerzyć ułamek do wskazanego licznika albo mianownika.",
    "Potrafię rozszerzyć dwa ułamki tak, aby miały wspólny mianownik.",
  ],
  prerequisiteSkillIds: ["M5-3.2-fraction-as-quotient"],
  skillIds: m533L1SkillIds,
  lessonNumber: 1,
  estimatedMinutes: 45,
  overview: "Uczeń najpierw porządkuje pojęcia, następnie skraca ułamki z czytelnym śladem, rozszerza je do wskazanej liczby i doprowadza parę ułamków do wspólnego mianownika.",
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
      suffix: "equiv-theory-check",
      kind: "explore",
      title: "Sprawdź, co już wiesz",
      minutes: 7,
      headline: "Ułamek skracalny, nieskracalny i znaczenie rozszerzania",
      body: "Trzy krótkie pytania wyboru sprawdzają pojęcia potrzebne do dalszej pracy. Następne pytanie odblokowuje się dopiero po poprawnym zatwierdzeniu poprzedniego.",
      modelId: "fraction-lesson",
      modelSeed: 33031,
      studentInstruction: "Wybierz odpowiedź i zatwierdź ją. Po poprawnej odpowiedzi przejdź do następnej zakładki w tym samym slajdzie.",
      discussionPrompts: ["Po czym poznajesz ułamek skracalny?", "Co musi stać się jednocześnie z licznikiem i mianownikiem podczas rozszerzania?"],
      print: {
        worksheetTitle: "Sprawdź, co już wiesz",
        instructions: "Zaznacz poprawne odpowiedzi i krótko uzasadnij wybór.",
        items: [
          { id: "m533-theory", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], expression: "5/8, 6/9", prompt: "Wskaż ułamek nieskracalny i wyjaśnij, co oznacza rozszerzanie ułamka.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-cross-out-rewrite",
      kind: "worked-example",
      title: "Przekreśl i zapisz",
      minutes: 10,
      headline: "Wybierz wspólny dzielnik i zapisz skrócony ułamek w jednej linii",
      body: "Każde zadanie pokazuje ułamek, wybór dzielnika i dokładnie tyle kratek, ile wymaga wynik. Dwa paski zachowują interpretację wartości bez dodatkowych osi i technicznych podpisów.",
      modelId: "fraction-lesson",
      modelSeed: 33034,
      studentInstruction: "Wybierz liczbę, która dzieli licznik i mianownik bez reszty. Wpisz wynik po znaku równości i zatwierdź zadanie.",
      discussionPrompts: ["Dlaczego ten sam dzielnik musi działać nad i pod kreską?", "Co pokazują dwa paski przed i po skróceniu?"],
      print: {
        worksheetTitle: "Przekreśl i zapisz",
        instructions: "Wybierz wspólny dzielnik, przekreśl stare liczby i wpisz skrócony ułamek po znaku równości.",
        items: [
          { id: "m533-cross-one", skillIds: ["M5-3.3-simplify-expand"], expression: "3/6", prompt: "Wybierz poprawny wspólny dzielnik i skróć ułamek.", answerLayout: "fraction-stack" },
          { id: "m533-cross-two", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], expression: "18/24", prompt: "Skróć ułamek przez wybrany wspólny dzielnik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-equivalent-chain",
      kind: "practice",
      title: "Łańcuch równoważnych ułamków",
      minutes: 7,
      headline: "Jeden ułamek — jeden wynik w postaci nieskracalnej",
      body: "Zamiast czterech gotowych ułamków uczeń otrzymuje jeden ułamek i samodzielnie zapisuje jego postać nieskracalną.",
      modelId: "fraction-lesson",
      modelSeed: 33035,
      studentInstruction: "Skróć podany ułamek do postaci nieskracalnej i wpisz licznik oraz mianownik w przygotowane kratki.",
      discussionPrompts: ["Po czym poznasz, że nie można już skracać?", "Jaki wspólny dzielnik pozwala wykonać skracanie w jednym kroku?"],
      print: {
        worksheetTitle: "Łańcuch równoważnych ułamków",
        instructions: "Skróć jeden ułamek do postaci nieskracalnej.",
        items: [
          { id: "m533-chain", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], expression: "18/24", prompt: "Skróć do postaci nieskracalnej.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-expansion-grid",
      kind: "practice",
      title: "Rozszerz do wskazanej liczby",
      minutes: 9,
      headline: "Raz brakuje licznika, a raz mianownika",
      body: "W każdym zadaniu część wyniku jest już podana. Uczeń rozszerza ułamek przez tę samą liczbę i uzupełnia wyłącznie brakujący licznik albo mianownik.",
      modelId: "fraction-lesson",
      modelSeed: 33032,
      studentInstruction: "Znajdź mnożnik na podstawie podanej liczby. Uzupełnij pustą część pionowego ułamka i zatwierdź zadanie.",
      discussionPrompts: ["Jak znaleźć mnożnik z podanego mianownika?", "Dlaczego ten sam mnożnik działa również na licznik?"],
      print: {
        worksheetTitle: "Rozszerz do wskazanej liczby",
        instructions: "Uzupełnij brakujący licznik albo mianownik.",
        items: [
          { id: "m533-expand-nine", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-same-factor"], expression: "1/3 = ?/9", prompt: "Uzupełnij licznik.", answerLayout: "fraction-stack" },
          { id: "m533-expand-numerator", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-same-factor"], expression: "2/5 = 6/?", prompt: "Uzupełnij mianownik.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-common-denominator-pair",
      kind: "practice",
      title: "Rozszerz do wspólnego mianownika",
      minutes: 10,
      headline: "Dwa ułamki, dwa wiersze i jeden wspólny mianownik",
      body: "Pierwszy ułamek znajduje się w górnym wierszu, drugi bezpośrednio pod nim. Uczeń rozszerza oba ułamki i wpisuje dwa pełne wyniki z jednakowymi mianownikami.",
      modelId: "fraction-lesson",
      modelSeed: 33038,
      studentInstruction: "Rozszerz pierwszy ułamek w górnym wierszu, a drugi w dolnym. Sprawdź, czy oba wyniki mają ten sam mianownik.",
      discussionPrompts: ["Jak wybrać wspólny mianownik?", "Czy oba ułamki zawsze rozszerzamy przez tę samą liczbę?"],
      print: {
        worksheetTitle: "Rozszerz do wspólnego mianownika",
        instructions: "Rozszerz oba ułamki i wpisz je w dwóch wierszach z jednakowymi mianownikami.",
        items: [
          { id: "m533-common-one", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-same-factor"], expression: "1/3, 1/4", prompt: "Rozszerz oba ułamki do mianownika 12.", answerLayout: "fraction-stack" },
          { id: "m533-common-two", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-same-factor"], expression: "2/5, 3/4", prompt: "Rozszerz oba ułamki do mianownika 20.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "equiv-review",
      kind: "exit-ticket",
      title: "Powtórzenie skracania i rozszerzania",
      minutes: 7,
      headline: "Pięć krótkich przykładów w jednym slajdzie",
      body: "Uczeń rozwiązuje kolejno pięć przykładów: skracanie, rozszerzanie do wskazanej liczby i doprowadzenie pary ułamków do wspólnego mianownika.",
      modelId: "fraction-lesson",
      modelSeed: 33039,
      studentInstruction: "Rozwiąż bieżący przykład i zatwierdź odpowiedź. Następny przykład pojawi się w tej samej karcie.",
      live: { enabled: true, kind: "exercise", minutes: 7 },
      questions: [
        { id: "m533-review-1", generatorId: "fraction-lesson-l1-v1", seed: 33301, difficulty: "support", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-review-2", generatorId: "fraction-lesson-l1-v1", seed: 33302, difficulty: "core", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-review-3", generatorId: "fraction-lesson-l1-v1", seed: 33303, difficulty: "challenge", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-review-4", generatorId: "fraction-lesson-l1-v1", seed: 33304, difficulty: "core", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533-review-5", generatorId: "fraction-lesson-l1-v1", seed: 33305, difficulty: "challenge", skillIds: [...m533L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Ćwiczenia — 5 przykładów",
        instructions: "Rozwiąż kolejno pięć przykładów. Ułamki zapisuj pionowo.",
        items: [
          { id: "m533-review-p1", questionId: "m533-review-1", skillIds: [...m533L1SkillIds], maxScore: 2, expression: "12/18", prompt: "Skróć do postaci nieskracalnej.", answerLayout: "fraction-stack" },
          { id: "m533-review-p2", questionId: "m533-review-2", skillIds: [...m533L1SkillIds], maxScore: 2, expression: "2/7 = ?/21", prompt: "Rozszerz do mianownika 21.", answerLayout: "fraction-stack" },
          { id: "m533-review-p3", questionId: "m533-review-3", skillIds: [...m533L1SkillIds], maxScore: 2, expression: "3/5 = 12/?", prompt: "Rozszerz do licznika 12.", answerLayout: "fraction-stack" },
          { id: "m533-review-p4", questionId: "m533-review-4", skillIds: [...m533L1SkillIds], maxScore: 2, expression: "21/28", prompt: "Skróć do postaci nieskracalnej.", answerLayout: "fraction-stack" },
          { id: "m533-review-p5", questionId: "m533-review-5", skillIds: [...m533L1SkillIds], maxScore: 2, expression: "1/3, 3/4", prompt: "Rozszerz oba ułamki do mianownika 12.", answerLayout: "fraction-stack" },
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
  paperEvidence: "Karta L1: porównywanie ułamków o jednakowych mianownikach, jednakowych licznikach oraz metodą mnożenia na krzyż.",
  studentGoal: "Uczeń porównuje ułamki o jednakowych mianownikach, jednakowych licznikach oraz o różnych licznikach i mianownikach.",
  successCriteria: [
    "Potrafię porównać ułamki o jednakowych mianownikach, patrząc na liczniki.",
    "Potrafię porównać ułamki o jednakowych licznikach, patrząc na mianowniki.",
    "Potrafię porównać dwa dowolne ułamki przez mnożenie na krzyż.",
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
  overview: "L1 prowadzi od reguły jednakowych mianowników przez regułę jednakowych liczników do czytelnego mnożenia na krzyż dla dwóch dowolnych ułamków.",
  openingScript: "„Najpierw sprawdzamy, czy wspólny jest mianownik albo licznik. Gdy oba są różne, pomagają nam dwa skosy.”",
  closingScript: "„Wspólny mianownik — patrzę na licznik. Wspólny licznik — patrzę na mianownik. Inne liczby — mnożę na krzyż.”",
  commonMisconceptions: [
    "Porównywanie ułamków opisujących całości różnej wielkości.",
    "Uznawanie ułamka z większym mianownikiem za większy bez sprawdzenia rozmiaru części.",
    "Ustawienie poprawnych wartości po obu stronach, ale skierowanie znaku porównania w złą stronę.",
    "Podanie poprawnego porządku bez uzasadnienia zgodnego z wybraną strategią.",
  ],
  stages: [
    {
      suffix: "compare-same-denominator",
      kind: "explore",
      title: "Jednakowe mianowniki",
      minutes: 6,
      headline: "Ten sam mianownik — większy licznik oznacza większy ułamek",
      body: "Regułę objaśniają dwa podzielone koła i pionowy zapis ułamków. Poniżej uczeń rozwiązuje pięć kolejnych porównań na różnych figurach; następna zakładka odblokowuje się po poprawnym zatwierdzeniu poprzedniej.",
      modelId: "fraction-lesson",
      modelSeed: 34041,
      studentInstruction: "Obejrzyj koła. Gdy mianowniki są jednakowe, porównaj liczniki i wstaw znak < albo >.",
      discussionPrompts: ["Co oznacza wspólny mianownik?", "Dlaczego przy takich samych częściach rozstrzyga ich liczba?"],
      print: {
        worksheetTitle: "Porównywanie ułamków o jednakowych mianownikach",
        instructions: "Porównaj liczniki i wstaw znak < albo >.",
        items: [
          { id: "m534-same-denominator", skillIds: ["M5-3.4-compare-fractions"], expression: "3/8 ○ 5/8", prompt: "Porównaj liczniki i wstaw znak.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "compare-same-numerator",
      kind: "explore",
      title: "Jednakowe liczniki",
      minutes: 6,
      headline: "Ten sam licznik — mniejszy mianownik oznacza większe części",
      body: "Dwa koła pokazują tę samą liczbę zaznaczonych części o różnych rozmiarach. Zadania w zakładkach obejmują ułamki właściwe, niewłaściwe i liczby mieszane.",
      modelId: "fraction-lesson",
      modelSeed: 34042,
      studentInstruction: "Obejrzyj koła. Gdy liczniki są jednakowe, większy jest ułamek z mniejszym mianownikiem. Wstaw znak < albo >.",
      discussionPrompts: ["Dlaczego jedna czwarta jest większa od jednej ósmej?", "Jak działa ta reguła przy ułamkach niewłaściwych i liczbach mieszanych?"],
      print: {
        worksheetTitle: "Porównywanie ułamków o jednakowych licznikach",
        instructions: "Porównaj rozmiar części i wstaw znak < albo >.",
        items: [
          { id: "m534-same-numerator", skillIds: ["M5-3.4-compare-fractions"], expression: "4/7 ○ 4/9", prompt: "Porównaj mianowniki i wstaw znak.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "compare-common-measure",
      kind: "practice",
      title: "Różne liczniki i mianowniki",
      preserveTaskTitle: true,
      minutes: 6,
      headline: "Najpierw sprowadzamy ułamki do wspólnej miary, potem wybieramy znak",
      body: "W każdym zadaniu wybierz tylko znak. Możesz w myślach rozszerzyć ułamki do wspólnego mianownika albo licznika; obliczenia pomocnicze są pokazane przy przykładzie.",
      modelId: "fraction-lesson",
      modelSeed: 34043,
      studentInstruction: "Porównaj parę ułamków. Sprowadź je do wspólnego licznika lub mianownika i wybierz znak < albo >.",
      discussionPrompts: ["Który wspólny mianownik będzie wygodny?", "Czy w tej parze łatwiej użyć wspólnego licznika?"],
      questions: [
        { id: "m534-measure-1", generatorId: "fraction-lesson-l1-v1", seed: 340431, difficulty: "support", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-measure-2", generatorId: "fraction-lesson-l1-v1", seed: 340432, difficulty: "core", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-measure-3", generatorId: "fraction-lesson-l1-v1", seed: 340433, difficulty: "challenge", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-measure-4", generatorId: "fraction-lesson-l1-v1", seed: 340434, difficulty: "core", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-measure-5", generatorId: "fraction-lesson-l1-v1", seed: 340435, difficulty: "challenge", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Różne liczniki i mianowniki",
        instructions: "Sprowadź ułamki do wspólnej miary i wstaw znak < albo >.",
        items: [
          { id: "m534-common-measure", skillIds: ["M5-3.4-common-measure"], expression: "2/3 ○ 3/4", prompt: "Wstaw znak po sprowadzeniu do wspólnego mianownika.", answerLayout: "fraction-stack" },
          { id: "m534-common-measure-2", skillIds: ["M5-3.4-common-measure"], expression: "3/5 ○ 5/8", prompt: "Wstaw znak.", answerLayout: "fraction-stack" },
          { id: "m534-common-measure-3", skillIds: ["M5-3.4-common-measure"], expression: "5/6 ○ 7/9", prompt: "Wstaw znak.", answerLayout: "fraction-stack" },
          { id: "m534-common-measure-4", skillIds: ["M5-3.4-common-measure"], expression: "3/10 ○ 2/7", prompt: "Wstaw znak.", answerLayout: "fraction-stack" },
          { id: "m534-common-measure-5", skillIds: ["M5-3.4-common-measure"], expression: "7/12 ○ 4/7", prompt: "Wstaw znak.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "compare-cross-multiplication",
      kind: "worked-example",
      title: "Mnożenie na krzyż",
      minutes: 6,
      headline: "1/2 i 2/3 — dwa skosy, dwa iloczyny i jeden znak",
      body: "Uczeń uruchamia dwa kroki mnożenia. Skosy są podświetlane osobnymi kolorami, a iloczyny 3 i 4 pojawiają się nad licznikami, od których rozpoczyna się mnożenie. Następnie uczeń ćwiczy metodę na czterech nowych parach.",
      modelId: "fraction-lesson",
      modelSeed: 34043,
      studentInstruction: "Kliknij kolejno 1 × 3 oraz 2 × 2. Porównaj wyniki 3 i 4, a potem zastosuj tę metodę w zadaniach.",
      discussionPrompts: ["Dlaczego wynik pierwszego skosu zapisujemy nad pierwszym licznikiem?", "Jak znak między iloczynami wyznacza znak między ułamkami?"],
      print: {
        worksheetTitle: "Porównywanie ułamków przez mnożenie na krzyż",
        instructions: "Pomnóż liczby po skosie, zapisz wyniki nad licznikami i wstaw znak < albo >.",
        items: [
          { id: "m534-cross", skillIds: ["M5-3.4-common-measure"], expression: "1/2 ○ 2/3", prompt: "Oblicz dwa iloczyny po skosie i wstaw znak.", answerLayout: "fraction-stack" },
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
        { id: "m534-core-numerator", generatorId: "fraction-lesson-l1-v1", seed: 34404, difficulty: "core", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534-challenge-reference", generatorId: "fraction-lesson-l1-v1", seed: 34405, difficulty: "challenge", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — porównywanie ułamków",
        instructions: "W każdym wariancie uporządkuj trzy ułamki, zakreśl jedną strategię bazową i obrysuj pierwszy rozstrzygający element. Uzasadnienie jest osobnym kryterium.",
        items: [
          { id: "m534-print-support", questionId: "m534-support", skillIds: ["M5-3.4-compare-fractions", "M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "1/4, 1/2, 3/4", prompt: "Uporządkuj rosnąco i użyj odniesienia do 1/2.", answerLayout: "fraction-axis" },
          { id: "m534-print-core", questionId: "m534-core", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], maxScore: 2, expression: "2/3, 3/4, 5/6", prompt: "Uporządkuj przez wspólny mianownik i wskaż pierwsze różne liczniki.", answerLayout: "fraction-stack" },
          { id: "m534-print-challenge", questionId: "m534-challenge", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "5/8, 7/10, 11/12", prompt: "Wybierz najkrótszą strategię bazową, uporządkuj i uzasadnij.", answerLayout: "fraction-stack" },
          { id: "m534-print-core-numerator", questionId: "m534-core-numerator", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], maxScore: 2, expression: "4/9, 4/7, 4/5", prompt: "Uporządkuj przez wspólny licznik i uzasadnij rolę mianownika.", answerLayout: "fraction-stack" },
          { id: "m534-print-challenge-reference", questionId: "m534-challenge-reference", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "7/15, 8/15, 9/16", prompt: "Dobierz odniesienie do 1/2 lub wspólny mianownik i uzasadnij.", answerLayout: "fraction-axis" },
        ],
      },
    },
  ].filter((stage) => !["compare-denominator-trap", "compare-drone-race", "compare-independent"].includes(stage.suffix)) as LessonStageBlueprint[],
});

const m533SlideZero = getSection3To5SlideZeroContext("M5-3.3");
if (!m533SlideZero) throw new Error("Brak kontraktu slajdu 0 dla M5-3.3.");
const m534SlideZero = getSection3To5SlideZeroContext("M5-3.4");
if (!m534SlideZero) throw new Error("Brak kontraktu slajdu 0 dla M5-3.4.");

export const m533PostacNieskracalnaL2V1 = s3({
  id: "m5-3-3-postac-nieskracalna-l2-v1",
  topicId: "M5-3.3",
  title: "Skracanie i rozszerzanie ułamków",
  coreLesson: "Skracanie do postaci nieskracalnej — poziom 2",
  paperEvidence: "Ślad skreśleń, wspólny dzielnik oraz pięć niezależnych przykładów kończących się postacią nieskracalną.",
  studentGoal: "Uczeń skraca ułamek wspólnym dzielnikiem i rozpoznaje postać nieskracalną.",
  successCriteria: ["Dzielę licznik i mianownik przez tę samą liczbę.", "Kończę dopiero wtedy, gdy licznik i mianownik nie mają wspólnego dzielnika większego od 1."],
  learningGoals: [m533SlideZero.learningGoals[1]!, m533SlideZero.learningGoals[2]!, m533SlideZero.learningGoals[3]!],
  prerequisiteSkillIds: ["M5-3.3-equivalent-fractions"],
  skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"],
  stages: [
    { suffix: "l2-equiv-collapse-partition", kind: "explore", title: "Zwiń podział", minutes: 8, headline: "Ten sam fragment można zapisać gęściej albo prościej", body: "Najpierw zobacz rozszerzenie 4/7 = 16/28, a następnie skrócenie 12/36 = 1/3. W obu przypadkach licznik i mianownik zmieniają się przez tę samą liczbę.", modelId: "fraction-lesson", modelSeed: 331 },
    { suffix: "l2-equiv-cross-out-rewrite", kind: "worked-example", title: "Przekreśl i zapisz", minutes: 8, headline: "Stary zapis zostaje widoczny, a nowe cyfry pojawiają się obok", body: "Wybierz wspólny dzielnik. System przekreśla obie stare liczby, łączy je identycznym symbolem i zachowuje pełny ślad operacji.", modelId: "fraction-lesson", modelSeed: 332 },
    { suffix: "l2-equiv-expansion-grid", kind: "practice", title: "Rozszerz do wskazanej liczby", minutes: 9, headline: "Mnożymy licznik i mianownik przez ten sam mnożnik", body: "Raz podany jest licznik, a raz mianownik. Najpierw znajdź mnożnik, potem uzupełnij brakującą część ułamka.", modelId: "fraction-lesson", modelSeed: 333 },
    { suffix: "l2-equiv-equivalent-chain", kind: "practice", title: "Do postaci nieskracalnej", preserveTaskTitle: true, minutes: 14, headline: "Pięć zadań: skróć ułamek do najprostszej postaci", body: "Każde kolejne zadanie otworzy się w tym samym slajdzie po poprawnym przesłaniu poprzedniego.", modelId: "fraction-lesson", modelSeed: 334,
      questions: [
        { id: "m533l2-q1", generatorId: "fraction-lesson-l1-v1", seed: 533211, difficulty: "support", skillIds: ["M5-3.3-simplify-expand"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533l2-q2", generatorId: "fraction-lesson-l1-v1", seed: 533212, difficulty: "support", skillIds: ["M5-3.3-simplify-expand"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533l2-q3", generatorId: "fraction-lesson-l1-v1", seed: 533213, difficulty: "core", skillIds: ["M5-3.3-irreducible-form"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533l2-q4", generatorId: "fraction-lesson-l1-v1", seed: 533214, difficulty: "core", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
        { id: "m533l2-q5", generatorId: "fraction-lesson-l1-v1", seed: 533215, difficulty: "challenge", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_EQUIVALENCE_FEEDBACK_KEYS] } },
      ],
      print: { worksheetTitle: "Skracanie do postaci nieskracalnej — 5 przykładów", instructions: "W każdym wierszu zapisz dzielnik nad i pod kreską, przekreśl stare liczby i wpisz wynik.", items: [
        { id: "m533l2-p1", questionId: "m533l2-q1", skillIds: ["M5-3.3-simplify-expand"], maxScore: 2, expression: "10/15", prompt: "Skróć do postaci nieskracalnej.", answerLayout: "fraction-stack" },
        { id: "m533l2-p2", questionId: "m533l2-q2", skillIds: ["M5-3.3-simplify-expand"], maxScore: 2, expression: "14/21", prompt: "Pokaż wspólny dzielnik i wynik.", answerLayout: "fraction-stack" },
        { id: "m533l2-p3", questionId: "m533l2-q3", skillIds: ["M5-3.3-irreducible-form"], maxScore: 2, expression: "32/48", prompt: "Wybierz największy wspólny dzielnik.", answerLayout: "fraction-stack" },
        { id: "m533l2-p4", questionId: "m533l2-q4", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], maxScore: 2, expression: "35/49", prompt: "Zapisz jedną lub kilka poprawnych ścieżek.", answerLayout: "fraction-stack" },
        { id: "m533l2-p5", questionId: "m533l2-q5", skillIds: ["M5-3.3-simplify-expand", "M5-3.3-irreducible-form"], maxScore: 2, expression: "105/165", prompt: "Skróć i uzasadnij, że wynik jest nieskracalny.", answerLayout: "fraction-stack" },
      ] },
    },
    { suffix: "l2-equiv-common-denominator-pair", kind: "practice", title: "Rozszerz do wspólnego mianownika", minutes: 10, headline: "Dwa ułamki, dwa mnożniki i jeden mianownik", body: "Rozszerz pierwszy ułamek w górnym wierszu, drugi w dolnym. Oba wyniki muszą mieć dokładnie ten sam mianownik.", modelId: "fraction-lesson", modelSeed: 335 },
  ],
});

export const m534DoborStrategiiL2V1 = s3({
  id: "m5-3-4-dobor-strategii-l2-v1",
  topicId: "M5-3.4",
  title: "Porównywanie ułamków",
  coreLesson: "Porównywanie ułamków — poziom 2",
  paperEvidence: "Karta L2: porównania o wspólnym mianowniku, wspólnym liczniku, przez wspólną miarę oraz metodą motylkową.",
  studentGoal: "Uczeń porównuje ułamki, wybierając znak < albo >.",
  successCriteria: ["Porównuję liczniki przy wspólnym mianowniku.", "Porównuję mianowniki przy wspólnym liczniku.", "Stosuję wspólną miarę lub mnożenie na krzyż."],
  learningGoals: [m534SlideZero.learningGoals[0]!, m534SlideZero.learningGoals[1]!, m534SlideZero.learningGoals[2]!],
  prerequisiteSkillIds: ["M5-3.4-compare-fractions"],
  skillIds: ["M5-3.4-common-measure", "M5-3.4-reference-strategy", "M5-3.4-justify-order"],
  stages: [
    { suffix: "l2-compare-same-denominator", kind: "explore", title: "Jednakowe mianowniki", minutes: 9, headline: "Większy licznik oznacza większy ułamek", body: "Przykład 3/8 < 7/8 pokazuje dwa koła podzielone na osiem równych części. Potem wybierasz znak w pustej kratce w kolejnych porównaniach, zaczynając od 4/9 □ 5/9.", modelId: "fraction-lesson", modelSeed: 341 },
    { suffix: "l2-compare-same-numerator", kind: "worked-example", title: "Jednakowe liczniki", minutes: 7, headline: "Mniejszy mianownik oznacza większe części", body: "Najpierw model pokazuje tę samą liczbę zaznaczonych części różnej wielkości. Potem wstawiasz znak < albo > w kolejnych parach.", modelId: "fraction-lesson", modelSeed: 342 },
    { suffix: "l2-compare-common-measure", kind: "practice", title: "Różne liczniki i mianowniki", minutes: 8, headline: "Sprowadź ułamki do wspólnego licznika lub mianownika", body: "Wybierz tylko znak < albo >. Pomocniczo możesz sprowadzić oba ułamki do tej samej miary.", modelId: "fraction-lesson", modelSeed: 343 },
    { suffix: "l2-compare-cross-multiplication", kind: "practice", title: "Metoda motylkowa", preserveTaskTitle: true, minutes: 14, headline: "Wpisz dwa iloczyny po skosie i wybierz znak", body: "Najpierw jest gotowy przykład 1/2 < 2/3 z kolorowymi skosami. Potem w każdym zadaniu wpisujesz oba iloczyny nad ułamkami oraz wybierasz znak w środkowej kratce.", modelId: "fraction-lesson", modelSeed: 344,
      questions: [
        { id: "m534l2-q1", generatorId: "fraction-lesson-l1-v1", seed: 534211, difficulty: "support", skillIds: ["M5-3.4-reference-strategy"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534l2-q2", generatorId: "fraction-lesson-l1-v1", seed: 534212, difficulty: "support", skillIds: ["M5-3.4-common-measure"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534l2-q3", generatorId: "fraction-lesson-l1-v1", seed: 534213, difficulty: "core", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534l2-q4", generatorId: "fraction-lesson-l1-v1", seed: 534214, difficulty: "core", skillIds: ["M5-3.4-common-measure", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
        { id: "m534l2-q5", generatorId: "fraction-lesson-l1-v1", seed: 534215, difficulty: "challenge", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_COMPARISON_FEEDBACK_KEYS] } },
      ],
      print: { worksheetTitle: "Dobór strategii — 5 porównań", instructions: "Wstaw znak, nazwij strategię i zapisz jednozdaniowe uzasadnienie.", items: [
        { id: "m534l2-p1", questionId: "m534l2-q1", skillIds: ["M5-3.4-reference-strategy"], maxScore: 2, expression: "5/9 ○ 1/2", prompt: "Użyj odniesienia do połowy.", answerLayout: "fraction-stack" },
        { id: "m534l2-p2", questionId: "m534l2-q2", skillIds: ["M5-3.4-common-measure"], maxScore: 2, expression: "7/12 ○ 5/8", prompt: "Użyj wspólnego mianownika.", answerLayout: "fraction-stack" },
        { id: "m534l2-p3", questionId: "m534l2-q3", skillIds: ["M5-3.4-reference-strategy"], maxScore: 2, expression: "11/12 ○ 9/10", prompt: "Odnieś oba ułamki do jedności.", answerLayout: "fraction-stack" },
        { id: "m534l2-p4", questionId: "m534l2-q4", skillIds: ["M5-3.4-common-measure"], maxScore: 2, expression: "4/7 ○ 4/9", prompt: "Użyj wspólnego licznika.", answerLayout: "fraction-stack" },
        { id: "m534l2-p5", questionId: "m534l2-q5", skillIds: ["M5-3.4-reference-strategy", "M5-3.4-justify-order"], maxScore: 2, expression: "13/24 ○ 8/15", prompt: "Wybierz najkrótszą poprawną strategię i uzasadnij.", answerLayout: "fraction-stack" },
      ] },
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
        { id: "m535-core-subtract", generatorId: "fraction-lesson-l1-v1", seed: 35504, difficulty: "core", skillIds: [...m535L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS] } },
        { id: "m535-challenge-context", generatorId: "fraction-lesson-l1-v1", seed: 35505, difficulty: "challenge", skillIds: [...m535L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — jednakowe mianowniki L1",
        instructions: "W każdym wariancie wykonaj działanie pionowo, skróć wynik i zapisz jedno zdanie wyjaśniające niezmienny mianownik.",
        items: [
          { id: "m535-print-support", questionId: "m535-support", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "1/6 + 2/6", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535-print-core", questionId: "m535-core", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "7/10 − 3/10", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535-print-challenge", questionId: "m535-challenge", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "5/12 + 3/12", prompt: "Oblicz, skróć i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535-print-core-subtract", questionId: "m535-core-subtract", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "11/15 − 4/15", prompt: "Usuń cztery części z modelu, oblicz i sprawdź zapis.", answerLayout: "fraction-stack" },
          { id: "m535-print-challenge-context", questionId: "m535-challenge-context", skillIds: [...m535L1SkillIds], maxScore: 2, expression: "7/18 + 8/18", prompt: "Oblicz część tacy zajętą przez dwa zamówienia i skróć, jeśli można.", answerLayout: "fraction-stack" },
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
      headline: "Dodawanie liczb mieszanych — osobno całości, osobno części ułamkowe",
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
      headline: "Zamiana jednej całości przed odejmowaniem",
      body: "Uczeń najpierw wyznacza wszystkie osiem równych części pełnej pizzy. Po pocięciu zamienia jedną całość na osiem ósmych i dopiero potem odejmuje wskazane części. Próba wcześniejszego odejmowania uruchamia podpowiedź.",
      modelId: "fraction-lesson",
      modelSeed: 350562,
      studentInstruction: "Wyznacz kolejno osiem równych części pełnej pizzy. Dopiero wtedy zamień całość na osiem ósmych i odłóż pięć ósmych części.",
      discussionPrompts: ["Dlaczego nie wolno odjąć pięciu ósmych od trzech ósmych?", "Jak wiemy, że zapis przed i po zamianie całości ma tę samą wartość?"],
      print: {
        worksheetTitle: "Zamień jedną całość — pizza",
        instructions: "Podziel pełną pizzę na osiem równych części. Skreśl jedną całość w odjemnej, dopisz 8/8 do części ułamkowej i dopiero potem odejmij.",
        items: [
          { id: "m535l2-borrow-pizza", skillIds: ["M5-3.5-borrow-whole", "M5-3.5-mixed-add-sub"], expression: "4 3/8 − 1 5/8", prompt: "Pokaż pocięcie całości, zamianę 4 3/8 = 3 11/8 i odejmowanie.", answerLayout: "fraction-stack" },
        ],
      },
    },
    {
      suffix: "mixed-same-denom-bakery",
      kind: "practice",
      title: "Piekarnia na festyn",
      minutes: 7,
      headline: "Najpierw dodaj przygotowane tace, potem odejmij wydane zamówienie",
      body: "Uczeń wykonuje kolejno dodawanie przygotowanych tac i odejmowanie wydanego zamówienia. W drugim działaniu pokazuje zamianę całości i kończy pełnym zdaniem z jednostką.",
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
      body: "Uczeń wykonuje jedno działanie na liczbach mieszanych, zaznacza zamianę całości, gdy jest potrzebna, skraca wynik i zapisuje jedno zdanie uzasadnienia. Prywatna rubryka odpowiedzi pozostaje wyłącznie na serwerze.",
      modelId: "fraction-lesson",
      modelSeed: 350565,
      studentInstruction: "Pracuj bez gotowego wyniku. Zdecyduj, czy potrzebna jest zamiana całości, zapisz wynik w osobnych kratkach, skróć go i uzasadnij kluczowy krok.",
      live: { enabled: true, kind: "exercise", minutes: 6 },
      questions: [
        // Id generatora zachowuje istniejącą bramkę Live; lokalny adapter wybiera osobny generator L2 po identyfikatorze etapu.
        { id: "m535l2-support", generatorId: "fraction-lesson-l1-v1", seed: 35520, difficulty: "support", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-core", generatorId: "fraction-lesson-l1-v1", seed: 35523, difficulty: "core", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-challenge", generatorId: "fraction-lesson-l1-v1", seed: 35525, difficulty: "challenge", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-core-add", generatorId: "fraction-lesson-l1-v1", seed: 35527, difficulty: "core", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
        { id: "m535l2-challenge-borrow", generatorId: "fraction-lesson-l1-v1", seed: 35529, difficulty: "challenge", skillIds: [...m535L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_SAME_DENOMINATOR_MIXED_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — liczby mieszane L2",
        instructions: "Wykonaj jedno działanie pionowo. Jeśli trzeba, przekreśl starą całość i wpisz nowe wartości w małych kratkach. Skróć wynik i uzasadnij kluczowy krok jednym zdaniem.",
        items: [
          { id: "m535l2-print-support", questionId: "m535l2-support", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "2 1/6 + 1 3/6", prompt: "Dodaj, skróć wynik i uzasadnij niezmienny mianownik.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-core", questionId: "m535l2-core", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "5 1/8 − 2 5/8", prompt: "Pokaż zamianę całości, odejmij i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-challenge", questionId: "m535l2-challenge", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "6 1/12 − 2 9/12", prompt: "Pokaż pełny ślad zamiany, odejmij, skróć i uzasadnij.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-core-add", questionId: "m535l2-core-add", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "3 5/9 + 2 7/9", prompt: "Dodaj, wyłącz całość z części ułamkowej i uprość wynik.", answerLayout: "fraction-stack" },
          { id: "m535l2-print-challenge-borrow", questionId: "m535l2-challenge-borrow", skillIds: [...m535L2SkillIds], maxScore: 2, expression: "8 2/15 − 3 11/15", prompt: "Zamień jedną całość, pozostaw ślad skreślenia i zapisz odpowiedź.", answerLayout: "fraction-stack" },
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
        { id: "m536l1-core-nww", generatorId: "fraction-lesson-l1-v1", seed: 536104, difficulty: "core", skillIds: [...m536L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS] } },
        { id: "m536l1-challenge-glass", generatorId: "fraction-lesson-l1-v1", seed: 536105, difficulty: "challenge", skillIds: [...m536L1SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_MEASURE_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielna próba — wspólna miara",
        instructions: "Wybierz jeden wariant. Pokaż wspólny mianownik, oba rozszerzenia, działanie na licznikach i kontrolę skracania.",
        items: [
          { id: "m536l1-print-support", questionId: "m536l1-support", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "1/2 + 1/3", prompt: "Zapisz pełne rozwiązanie i oszacuj wynik.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-core", questionId: "m536l1-core", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "3/4 − 1/6", prompt: "Zapisz pełne rozwiązanie i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-challenge", questionId: "m536l1-challenge", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "3/5 + 1/6", prompt: "Zapisz pełne rozwiązanie i wyjaśnij, dlaczego wynik jest mniejszy od 1.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-core-nww", questionId: "m536l1-core-nww", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "5/8 − 1/4", prompt: "Wybierz najmniejszą wspólną miarę i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m536l1-print-challenge-glass", questionId: "m536l1-challenge-glass", skillIds: [...m536L1SkillIds], maxScore: 3, expression: "7/9 + 5/12", prompt: "Oblicz poziom po przelaniu i oceń, czy przekracza jedną całość.", answerLayout: "fraction-stack" },
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
  estimatedMinutes: 61,
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
      title: "Dodawanie o różnych mianownikach",
      minutes: 7,
      headline: "Najpierw wspólny mianownik, potem dodawanie liczników",
      body: "Najpierw oba ułamki zapisujemy w tej samej podziałce. Dopiero wtedy dodajemy liczniki i odczytujemy wynik.",
      modelId: "fraction-lesson",
      modelSeed: 360621,
      studentInstruction: "Odczytaj cały zapis: najpierw oba ułamki, potem ich rozszerzenie do wspólnego mianownika, a na końcu wynik dodawania.",
      discussionPrompts: ["Dlaczego obie części trzeba zapisać w szóstych?", "Które liczby dodajemy po rozszerzeniu?"],
      print: {
        worksheetTitle: "Dodawanie na paskach",
        instructions: "Zapisz oba rozszerzenia do szóstych i podaj wynik dodawania.",
        items: [{ id: "m536l2-bars", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub"], expression: "1/2 + 1/3", prompt: "Pokaż rozszerzenia do szóstych i oblicz wynik.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-mixed-number",
      kind: "worked-example",
      title: "Odejmowanie o różnych mianownikach",
      minutes: 7,
      headline: "Najpierw wspólny mianownik, potem odejmowanie liczników",
      body: "Oba ułamki zapisujemy w tej samej podziałce. Następnie odejmujemy liczniki i zapisujemy wynik.",
      modelId: "fraction-lesson",
      modelSeed: 360622,
      studentInstruction: "Odczytaj zapis odejmowania: rozszerz oba ułamki do dwunastych, a następnie odejmij liczniki.",
      discussionPrompts: ["Dlaczego oba ułamki zapisujemy w dwunastych?", "Które liczby odejmujemy po rozszerzeniu?"],
      print: {
        worksheetTitle: "Odejmowanie na paskach",
        instructions: "Zapisz oba rozszerzenia do dwunastych i podaj wynik odejmowania.",
        items: [{ id: "m536l2-mixed", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub"], expression: "5/6 − 1/4", prompt: "Pokaż rozszerzenia do dwunastych i oblicz wynik.", answerLayout: "fraction-stack" }],
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
      suffix: "different-denom-l2-apples",
      kind: "practice",
      title: "Kosz z jabłkami",
      minutes: 8,
      headline: "Od masy pełnego kosza odejmij masę pustego kosza",
      body: "Uczeń sam zapisuje obie liczby mieszane w pionowych kratkach, wybiera znak odejmowania, sprowadza ułamki do wspólnego mianownika, wykonuje działanie, skraca wynik i podaje odpowiedź pełnym zdaniem.",
      modelId: "fraction-lesson",
      modelSeed: 360626,
      studentInstruction: "Zapisz działanie bez gotowego wzoru. Najpierw wpisz masy i wybierz znak, potem wykonaj pełne obliczenie w kratkach i napisz, ile ważą jabłka.",
      discussionPrompts: ["Dlaczego od masy pełnego kosza odejmujemy masę pustego?", "Jak sprawdzisz, czy wynik jest mniejszy od masy pełnego kosza?"],
      print: {
        worksheetTitle: "Kosz z jabłkami",
        instructions: "Narysuj kosz i jabłka. Samodzielnie zapisz działanie, sprowadź ułamki do wspólnego mianownika, wykonaj obliczenie, skróć wynik i odpowiedz pełnym zdaniem.",
        items: [{ id: "m536l2-apples", skillIds: ["M5-3.6-l2-common-measure", "M5-3.6-l2-mixed-add-sub"], expression: "Kosz z jabłkami: 4 1/2 kg; pusty kosz: 1 2/3 kg", prompt: "Ile ważą jabłka? Zapisz wszystkie etapy i odpowiedź.", answerLayout: "fraction-stack" }],
      },
    },
    {
      suffix: "different-denom-l2-independent",
      kind: "exit-ticket",
      title: "Samodzielne ćwiczenia",
      preserveTaskTitle: true,
      minutes: 15,
      headline: "10 trudniejszych przykładów: wspólny mianownik, działanie i najprostsza postać",
      body: "Seria zawiera dodawanie i odejmowanie ułamków oraz liczb mieszanych. Uczeń sam zapisuje oba ułamki ze wspólnym mianownikiem, wynik działania, a gdy to potrzebne także postać skróconą lub liczbę mieszaną.",
      modelId: "fraction-lesson",
      modelSeed: 360625,
      studentInstruction: "Rozwiązuj przykłady po kolei. Najpierw wybierz wspólny mianownik i wpisz oba rozszerzone ułamki, potem wykonaj działanie, a na końcu skróć wynik lub zapisz go jako liczbę mieszaną.",
      live: { enabled: true, kind: "exercise", minutes: 15 },
      questions: [
        { id: "m536l2-01", generatorId: "fraction-lesson-l1-v1", seed: 536201, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-02", generatorId: "fraction-lesson-l1-v1", seed: 536202, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-03", generatorId: "fraction-lesson-l1-v1", seed: 536203, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-04", generatorId: "fraction-lesson-l1-v1", seed: 536204, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-05", generatorId: "fraction-lesson-l1-v1", seed: 536205, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-06", generatorId: "fraction-lesson-l1-v1", seed: 536206, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-07", generatorId: "fraction-lesson-l1-v1", seed: 536207, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-08", generatorId: "fraction-lesson-l1-v1", seed: 536208, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-09", generatorId: "fraction-lesson-l1-v1", seed: 536209, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
        { id: "m536l2-10", generatorId: "fraction-lesson-l1-v1", seed: 536210, difficulty: "challenge", skillIds: [...m536L2SkillIds], feedbackPolicy: { mode: "assessment", allowsPartialCredit: true, manualReview: "possible", feedbackKeys: [...FRACTION_DIFFERENT_DENOMINATOR_ADVANCED_FEEDBACK_KEYS] } },
      ],
      print: {
        worksheetTitle: "Samodzielne ćwiczenia — różne mianowniki",
        instructions: "W każdym przykładzie pokaż wspólny mianownik, oba rozszerzenia, wynik działania i jego najprostszą postać.",
        items: [
          { id: "m536l2-print-01", questionId: "m536l2-01", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "2/3 + 3/4", prompt: "Oblicz i zapisz najprostszą postać.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-02", questionId: "m536l2-02", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "1 1/2 + 2/3", prompt: "Oblicz i zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-03", questionId: "m536l2-03", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "3 1/4 − 1 5/6", prompt: "Odejmij i zapisz wynik jako liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-04", questionId: "m536l2-04", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "2 5/6 + 1 3/4", prompt: "Dobierz NWW i oblicz.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-05", questionId: "m536l2-05", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "5 1/2 − 2 2/3", prompt: "Odejmij i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-06", questionId: "m536l2-06", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "1 3/7 + 2 2/9", prompt: "Oblicz i zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-07", questionId: "m536l2-07", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "4 3/5 − 1 7/10", prompt: "Odejmij i skróć wynik.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-08", questionId: "m536l2-08", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "3/4 + 5/6", prompt: "Oblicz i zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-09", questionId: "m536l2-09", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "5 2/7 − 2 1/9", prompt: "Odejmij i zapisz najprostszą postać.", answerLayout: "fraction-stack" },
          { id: "m536l2-print-10", questionId: "m536l2-10", skillIds: [...m536L2SkillIds], maxScore: 4, expression: "2 7/8 + 1 2/3", prompt: "Oblicz i zapisz liczbę mieszaną.", answerLayout: "fraction-stack" },
        ],
      },
    },
  ],
});

const operationStages = (input: {
  topicSlug: "7" | "8" | "9" | "10" | "11" | "r" | "s";
  level?: "l1" | "l2" | "l3";
  skillIds: string[];
  visualTitle: string;
  visualHeadline: string;
  reasoningHeadline: string;
  contextHeadline: string;
  examples: Array<{ expression: string; prompt: string }>;
}): LessonStageBlueprint[] => {
  if (input.examples.length !== 5) throw new Error(`Temat M5-3-${input.topicSlug} musi mieć dokładnie pięć przykładów na wspólnym slajdzie ćwiczeniowym.`);
  const level = input.level ?? "l1";
  const stagePrefix = level === "l1" ? "" : `${level}-`;
  const prefix = `m53${input.topicSlug}${level}`;
  const numericTopic = input.topicSlug === "r" ? 90 : input.topicSlug === "s" ? 91 : Number(input.topicSlug);
  const numericLevel = level === "l1" ? 1 : level === "l2" ? 2 : 3;
  const questions = input.examples.map((_, index) => ({
    id: `${prefix}-q${index + 1}`,
    generatorId: "fraction-lesson-l1-v1",
    seed: 530000 + numericTopic * 100 + numericLevel * 10 + index + 1,
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
      suffix: `${stagePrefix}visual`,
      kind: "explore",
      title: input.visualTitle,
      minutes: 8,
      headline: input.visualHeadline,
      body: "Kliknij elementy obrazu. Każda zmiana modelu natychmiast zmienia pionowy zapis ułamka.",
      modelId: "fraction-lesson",
      modelSeed: 1,
    },
    {
      suffix: `${stagePrefix}reasoning`,
      kind: "worked-example",
      title: "Tok rozumowania",
      minutes: 7,
      headline: input.reasoningHeadline,
      body: "Odkrywaj po jednym kroku. Kolor i linia wskazują wyłącznie liczby używane w aktualnym działaniu.",
      modelId: "fraction-lesson",
      modelSeed: 2,
    },
    {
      suffix: `${stagePrefix}context`,
      kind: "practice",
      title: "Zadanie obrazkowe",
      minutes: 8,
      headline: input.contextHeadline,
      body: "Najpierw odczytaj znaczenie liczb z ilustracji, potem wybierz działanie i jednostkę.",
      modelId: "fraction-lesson",
      modelSeed: 3,
    },
    {
      suffix: `${stagePrefix}independent-5`,
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

const naturalMultiplicationStages = (input: {
  level?: "l1" | "l2";
  skillIds: string[];
}): LessonStageBlueprint[] => operationStages({
  topicSlug: "7",
  level: input.level,
  skillIds: input.skillIds,
  visualTitle: "Liczba naturalna · ułamek",
  visualHeadline: "Instrukcja i 3 zadania bez skracania",
  reasoningHeadline: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy, potem mnóż",
  contextHeadline: "Skracaj liczbę naturalną z mianownikiem przed mnożeniem",
  examples: [
    { expression: "2 · 2/5", prompt: "Wykonaj mnożenie bez skracania." },
    { expression: "2 · 1 2/3", prompt: "Najpierw zamień liczbę mieszaną na ułamek niewłaściwy." },
    { expression: "12 · 5/18", prompt: "Skróć liczbę naturalną z mianownikiem przed mnożeniem." },
    { expression: "3 · 1/8", prompt: "Pomnóż licznik, a mianownik pozostaw bez zmiany." },
    { expression: "15 · 1 2/5", prompt: "Połącz zamianę liczby mieszanej ze skracaniem." },
  ],
}).map((stage, index) => {
  if (index === 0) return {
    ...stage,
    title: "Liczba naturalna · ułamek",
    headline: "Instrukcja i 3 zadania bez skracania",
    body: "Pomnóż liczbę naturalną przez licznik. Mianownik pozostaje bez zmiany. Wszystkie trzy zadania wykonaj kolejno na tym samym slajdzie.",
  };
  if (index === 1) return {
    ...stage,
    title: "Liczba naturalna · liczba mieszana",
    headline: "Najpierw zamiana na ułamek niewłaściwy, potem mnożenie",
    body: "Najpierw zapisz liczbę mieszaną jako ułamek niewłaściwy. Dopiero w kolejnym kroku pomnóż liczbę naturalną przez licznik. Seria zawiera 3 zadania bez skracania.",
  };
  if (index === 2) return {
    ...stage,
    title: "Skracanie przed mnożeniem",
    headline: "Ułamki i liczby mieszane — 3 zadania ze skracaniem",
    body: "Jeśli występuje liczba mieszana, najpierw ją zamień. Następnie skróć liczbę naturalną z mianownikiem i dopiero potem wykonaj mnożenie.",
  };
  return {
    ...stage,
    headline: "5 przykładów łączących wszystkie poznane przypadki",
    body: "Rozwiązuj przykłady po kolei na jednym slajdzie. W każdym widzisz tylko potrzebne etapy i korzystasz z jednego kalkulatora lekcji.",
  };
});

export const m537PowtorzPorcjeV1 = s3({
  id: "m5-3-7-powtorz-porcje-v1",
  topicId: "M5-3.7",
  title: "Mnożenie ułamka przez liczbę naturalną",
  coreLesson: "Trzy sposoby mnożenia",
  paperEvidence: "Mnożenie ułamka, liczby mieszanej oraz skracanie przed mnożeniem",
  studentGoal: "Uczeń mnoży liczbę naturalną przez ułamek i liczbę mieszaną oraz skraca przed mnożeniem, gdy jest to możliwe.",
  successCriteria: ["Zapisuje mnożenie kropką.", "Zamienia liczbę mieszaną na ułamek niewłaściwy przed mnożeniem.", "Skraca liczbę naturalną z mianownikiem przed mnożeniem."],
  prerequisiteSkillIds: ["M5-3.6-add-sub-diff-denom"],
  skillIds: ["M5-3.7-frac-times-natural"],
  stages: naturalMultiplicationStages({ skillIds: ["M5-3.7-frac-times-natural"] }),
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

export const m537SkracajPrzedMnozeniemL2V1 = s3({
  id: "m5-3-7-skracaj-przed-mnozeniem-l2-v1",
  topicId: "M5-3.7",
  title: "Mnożenie ułamka przez liczbę naturalną",
  coreLesson: "Skracaj przed mnożeniem — poziom 2",
  paperEvidence: "Pięć zastosowań z doborem skracania przed mnożeniem i kontrolą wyniku.",
  studentGoal: "Uczeń dobiera wygodne skracanie i stosuje mnożenie ułamka przez liczbę naturalną w zadaniach.",
  successCriteria: ["Skracam przed mnożeniem, gdy upraszcza to rachunki.", "Sprawdzam wynik modelem albo dodawaniem powtarzanym."],
  prerequisiteSkillIds: ["M5-3.7-frac-times-natural"],
  skillIds: ["M5-3.7-frac-times-natural", "M5-3.7-cancel-applications"],
  stages: naturalMultiplicationStages({ level: "l2", skillIds: ["M5-3.7-frac-times-natural", "M5-3.7-cancel-applications"] }),
});

export const m538ZastosowaniaUlamkaLiczbyL2V1 = s3({
  id: "m5-3-8-zastosowania-ulamka-liczby-l2-v1",
  topicId: "M5-3.8",
  title: "Obliczanie ułamka liczby naturalnej",
  coreLesson: "Dobierz kolejność działań — poziom 2",
  paperEvidence: "Pięć zadań kontekstowych z doborem kolejności dzielenia i mnożenia.",
  studentGoal: "Uczeń oblicza ułamek większych liczb i uzasadnia najwygodniejszą kolejność działań.",
  successCriteria: ["Dzielę przez mianownik i mnożę przez licznik.", "Kontroluję, czy wynik ma sens wobec całości."],
  prerequisiteSkillIds: ["M5-3.8-fraction-of-number"],
  skillIds: ["M5-3.8-fraction-of-number", "M5-3.8-order-applications"],
  stages: operationStages({ topicSlug: "8", level: "l2", skillIds: ["M5-3.8-fraction-of-number", "M5-3.8-order-applications"], visualTitle: "Równe grupy w czasie rzeczywistym", visualHeadline: "Zmieniaj liczbę wybranych grup i odczytuj dokładny ułamek", reasoningHeadline: "Mianownik ustala liczbę grup, licznik wybiera grupy", contextHeadline: "Budżet i uczestnicy wycieczki", examples: [
    { expression: "7/12 z 84", prompt: "Najpierw podziel przez 12, potem pomnóż przez 7." },
    { expression: "5/9 z 126", prompt: "Oblicz liczbę uczestników w pięciu grupach." },
    { expression: "11/15 z 90", prompt: "Wybierz krótszą kolejność działań." },
    { expression: "3/8 z 240 zł", prompt: "Oblicz część budżetu i dopisz jednostkę." },
    { expression: "13/20 z 360", prompt: "Oblicz i wykonaj kontrolę ułamkiem." },
  ] }),
});

export const m539AlgorytmISkracanieL2V1 = s3({
  id: "m5-3-9-algorytm-i-skracanie-l2-v1",
  topicId: "M5-3.9",
  title: "Mnożenie ułamków",
  coreLesson: "Algorytm i skracanie po skosie — poziom 2",
  paperEvidence: "Pięć działań z jawnymi parami skracania i śladem rachunku.",
  studentGoal: "Uczeń mnoży ułamki, podświetla właściwe pary i skraca przed mnożeniem.",
  successCriteria: ["Łączę licznik z mianownikiem po przekątnej tylko przy skracaniu.", "Po skróceniu mnożę górne i dolne kratki."],
  prerequisiteSkillIds: ["M5-3.9-multiply-fractions"],
  skillIds: ["M5-3.9-multiply-fractions", "M5-3.9-cross-cancel"],
  stages: operationStages({ topicSlug: "9", level: "l2", skillIds: ["M5-3.9-multiply-fractions", "M5-3.9-cross-cancel"], visualTitle: "Nakładające się pola", visualHeadline: "Klikaj komórki: fiolet pokazuje dokładne przecięcie dwóch ułamków", reasoningHeadline: "Kolorowe przekątne wskazują wyłącznie pary do skrócenia", contextHeadline: "Projekt muralu z częścią części", examples: [
    { expression: "7/12 × 18/35", prompt: "Znajdź dwie pary do skrócenia po skosie." },
    { expression: "14/15 × 25/28", prompt: "Skróć 14 z 28 i 25 z 15." },
    { expression: "9/16 × 8/27", prompt: "Podświetl obie przekątne przed mnożeniem." },
    { expression: "21/22 × 33/49", prompt: "Uniknij obliczania dużych iloczynów." },
    { expression: "2 1/3 × 9/14", prompt: "Najpierw zamień liczbę mieszaną." },
  ] }),
});

export const m5310AlgorytmIKontrolaL2V1 = s3({
  id: "m5-3-10-algorytm-i-kontrola-l2-v1",
  topicId: "M5-3.10",
  title: "Dzielenie ułamków przez liczby naturalne",
  coreLesson: "Algorytm i kontrola mnożeniem — poziom 2",
  paperEvidence: "Pięć działań z dwiema strategiami i kontrolą mnożeniem.",
  studentGoal: "Uczeń wybiera dzielenie licznika albo mnożenie mianownika i sprawdza wynik mnożeniem.",
  successCriteria: ["Wybieram strategię pasującą do liczb.", "Mnożę wynik przez dzielnik, aby wrócić do dzielnej."],
  prerequisiteSkillIds: ["M5-3.10-divide-by-natural"],
  skillIds: ["M5-3.10-divide-by-natural", "M5-3.10-control-multiplication"],
  stages: operationStages({ topicSlug: "10", level: "l2", skillIds: ["M5-3.10-divide-by-natural", "M5-3.10-control-multiplication"], visualTitle: "Podział na równe grupy", visualHeadline: "Zmieniaj liczbę odbiorców i obserwuj nowy rozmiar jednej porcji", reasoningHeadline: "Dziel licznik, gdy się da; w przeciwnym razie pomnóż mianownik", contextHeadline: "Równe porcje dla uczestników", examples: [
    { expression: "7/9 : 14", prompt: "Zapisz jako mnożenie przez 1/14 i skróć." },
    { expression: "15/16 : 5", prompt: "Wygodnie podziel licznik." },
    { expression: "8/21 : 4", prompt: "Podziel licznik i sprawdź mnożeniem." },
    { expression: "11/12 : 6", prompt: "Utwórz mniejsze części przez zmianę mianownika." },
    { expression: "18/25 : 9", prompt: "Skróć przed wykonaniem działania." },
  ] }),
});

export const m5311OdwrotnoscL2V1 = s3({
  id: "m5-3-11-odwrotnosc-l2-v1",
  topicId: "M5-3.11",
  title: "Dzielenie ułamków",
  coreLesson: "Odwrotność i skracanie — poziom 2",
  paperEvidence: "Pięć działań z oznaczeniem dzielnika, odwrotności i par skracania.",
  studentGoal: "Uczeń zamienia dzielenie na mnożenie przez odwrotność dzielnika i skraca po skosie.",
  successCriteria: ["Odwracam wyłącznie drugi ułamek.", "Sprawdzam iloraz mnożeniem przez dzielnik."],
  prerequisiteSkillIds: ["M5-3.11-divide-fractions"],
  skillIds: ["M5-3.11-divide-fractions", "M5-3.11-reciprocal"],
  stages: operationStages({ topicSlug: "11", level: "l2", skillIds: ["M5-3.11-divide-fractions", "M5-3.11-reciprocal"], visualTitle: "Miara w dzielnej", visualHeadline: "Zmieniaj licznik miary i obserwuj, ile razy mieści się w pasku", reasoningHeadline: "Ramka wskazuje dzielnik — tylko on zostaje odwrócony", contextHeadline: "Odmierzanie napojów w laboratorium", examples: [
    { expression: "5/8 : 15/16", prompt: "Odwróć tylko dzielnik i skróć." },
    { expression: "7/12 : 14/9", prompt: "Zaznacz ułamek, który trzeba odwrócić." },
    { expression: "21/25 : 14/15", prompt: "Wykonaj dwa skrócenia." },
    { expression: "8/9 : 4/27", prompt: "Sprawdź, ile miar mieści się w dzielnej." },
    { expression: "13/18 : 26/45", prompt: "Skróć duże liczby przed mnożeniem." },
  ] }),
});

export const m5311LiczbyMieszaneL3V1 = s3({
  id: "m5-3-11-liczby-mieszane-l3-v1",
  topicId: "M5-3.11",
  title: "Dzielenie ułamków",
  coreLesson: "Liczby mieszane i zastosowania — poziom 3",
  paperEvidence: "Pięć wieloetapowych zadań z liczbami mieszanymi, kontrolą i jednostką.",
  studentGoal: "Uczeń dzieli liczby mieszane po zamianie na ułamki niewłaściwe i interpretuje wynik w kontekście.",
  successCriteria: ["Zamieniam każdą liczbę mieszaną przed działaniem.", "Interpretuję ułamek niewłaściwy jako liczbę mieszaną w odpowiedzi."],
  prerequisiteSkillIds: ["M5-3.11-reciprocal"],
  skillIds: ["M5-3.11-divide-fractions", "M5-3.11-mixed-applications"],
  estimatedMinutes: 50,
  stages: operationStages({ topicSlug: "11", level: "l3", skillIds: ["M5-3.11-divide-fractions", "M5-3.11-mixed-applications"], visualTitle: "Miary większe od jedności", visualHeadline: "Porównuj dzielną i miarę na jednej podziałce", reasoningHeadline: "Najpierw zamień liczby mieszane, potem odwróć dzielnik", contextHeadline: "Cięcie taśm i odmierzanie porcji", examples: [
    { expression: "2 1/4 : 3/5", prompt: "Zamień liczbę mieszaną i oblicz liczbę porcji." },
    { expression: "3 1/3 : 1 1/9", prompt: "Zamień obie liczby mieszane." },
    { expression: "1 7/8 : 2 1/2", prompt: "Oceń, czy wynik powinien być mniejszy od jedności." },
    { expression: "4 2/5 : 1 1/10", prompt: "Oblicz liczbę równych odcinków." },
    { expression: "2 5/6 : 1 8/9", prompt: "Podaj wynik także jako liczbę mieszaną." },
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
    { expression: "7/4", prompt: "Zbuduj ułamek większy od jedności i nazwij liczbę mieszaną." },
    { expression: "5 : 2", prompt: "Zapisz sprawiedliwy podział jako pionowy ułamek." },
    { expression: "12/18", prompt: "Skróć i sprawdź równoważność na modelu." },
    { expression: "3/4 + 5/6", prompt: "Porównaj mianowniki, wybierz wspólną miarę i dodaj." },
    { expression: "2/3 × 3/5 : 4/5", prompt: "Wykonaj oba działania, skracając właściwe pary." },
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
    { expression: "11/6", prompt: "Zapisz odpowiadającą liczbę mieszaną." },
    { expression: "15 : 4", prompt: "Zapisz iloraz i zinterpretuj resztę." },
    { expression: "5/8 + 7/12", prompt: "Sprowadź do najmniejszego wspólnego mianownika." },
    { expression: "3/5 z 70", prompt: "Oblicz ułamek liczby i uzasadnij kolejność działań." },
    { expression: "7/9 : 14/27", prompt: "Odwróć wyłącznie dzielnik, skróć i sprawdź." },
  ] }),
});

export const section3LessonsWpC3: LessonPackage[] = [
  m531JednaCaloscV1,
  m531UlamkiMieszaneL2V1,
  m532PodzielSprawiedliwieV1,
  m533TaSamaCzescV1,
  m533PostacNieskracalnaL2V1,
  m534NalozPaskiV1,
  m534DoborStrategiiL2V1,
  m535LaczCzesciV1,
  m535LiczbyMieszaneL2V1,
  m536WspolnaMiaraV1,
  m536RozneMianownikiL2V1,
  m537PowtorzPorcjeV1,
  m537SkracajPrzedMnozeniemL2V1,
  m538PodzielPotemWybierzV1,
  m538ZastosowaniaUlamkaLiczbyL2V1,
  m539CzescCzesciV1,
  m539AlgorytmISkracanieL2V1,
  m5310PodzielPasekV1,
  m5310AlgorytmIKontrolaL2V1,
  m5311IleRazyMiaraV1,
  m5311OdwrotnoscL2V1,
  m5311LiczbyMieszaneL3V1,
  m53rKuchniaProporcjiV1,
  m53sStrategiePaskachV1,
];
