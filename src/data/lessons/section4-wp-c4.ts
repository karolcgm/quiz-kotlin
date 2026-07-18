import { buildLessonPackage, type BuildLessonInput, type LessonStageBlueprint } from "@/lib/lessons/buildLessonPackage";
import { getSection3To5SlideZeroContext } from "@/data/lessons/section3to5-slide-zero";
import { assertLessonSlideZero } from "@/lib/lessons/validateLessonSlideZero";
import { TRIANGLE_TYPES_GENERATOR_ID, TRIANGLE_TYPES_LESSON_SEEDS } from "@/lib/math/geometry/triangleTypes";
import { TRIANGLE_CONSTRUCTION_GENERATOR_ID, TRIANGLE_CONSTRUCTION_LESSON_SEEDS } from "@/lib/math/geometry/triangleConstruction";
import { TRIANGLE_ANGLE_SUM_GENERATOR_ID } from "@/lib/math/geometry/triangleAngleSum";
import { PLANE_FIGURES_REVIEW_SEEDS, PLANE_FIGURES_THEORY_GENERATOR_ID, PLANE_FIGURES_THEORY_SEEDS, type PlaneFiguresTheoryActivity } from "@/lib/math/geometry/planeFiguresTheory";
import type { LessonPackage } from "@/types/lessonPackage";

const S4 = "M5-S4";

const planeFigureTheoryStages = (input: {
  activity: Exclude<PlaneFiguresTheoryActivity, "review">;
  title: string;
  theoryHeadline: string;
  theoryBody: string;
  skillIds: string[];
  printItems: Array<{ expression: string; prompt: string }>;
}): LessonStageBlueprint[] => {
  const seeds = PLANE_FIGURES_THEORY_SEEDS[input.activity];
  const questions = (["theory", "practice", "challenge"] as const).map((difficulty, index) => ({
    id: `${input.activity}-q${index + 1}`,
    generatorId: PLANE_FIGURES_THEORY_GENERATOR_ID,
    seed: seeds[difficulty],
    difficulty: difficulty === "theory" ? "support" as const : difficulty === "challenge" ? "challenge" as const : "core" as const,
    skillIds: [...input.skillIds],
    feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["GEOMETRY_PROPERTY_WRONG"] },
  }));
  return [
    { suffix: "theory", kind: "explore", title: "Poznaj własności", minutes: 10, headline: input.theoryHeadline, body: input.theoryBody, modelId: "geometry-lab", modelSeed: seeds.theory, studentInstruction: "Najpierw przeczytaj własności przy rysunku. Następnie odpowiedz na krótkie pytanie." },
    { suffix: "marks", kind: "worked-example", title: "Czytaj oznaczenia", minutes: 8, headline: "Kreski, łuki i strzałki są częścią informacji", body: "Nie oceniaj figury po ustawieniu. Równość boków, kąty proste i równoległość są pokazane symbolami.", modelId: "geometry-lab", modelSeed: seeds.practice, studentInstruction: "Nazwij figurę dopiero po odczytaniu wszystkich oznaczeń." },
    { suffix: "independent-3", kind: "practice", title: "Ćwiczenia — 3 zadania", minutes: 17, headline: "Rozpoznawanie, obliczenie i uzasadnienie", body: "Trzy zadania uruchamiają się kolejno na jednym slajdzie. Ostatnie wymaga użycia obwodu lub własności kątów.", modelId: "geometry-lab", modelSeed: seeds.practice, questions, studentInstruction: "Rozwiąż trzy zadania po kolei. W każdym wskaż własność, z której korzystasz.", print: { worksheetTitle: `${input.title} — ćwiczenia`, instructions: "W każdym zadaniu zapisz nazwę własności oraz obliczenie lub uzasadnienie.", itemCount: 3, items: input.printItems.map((item, index) => ({ id: `${input.activity}-print-${index + 1}`, questionId: questions[index]?.id, skillIds: [...input.skillIds], maxScore: index === 2 ? 2 : 1, ...item })) } },
  ];
};

const triangleTypesStages = (input: {
  level: "l1" | "l2";
  skillIds: string[];
  examples: Array<{ expression: string; prompt: string }>;
}): LessonStageBlueprint[] => {
  if (input.examples.length !== 5) throw new Error("M5-4.6 wymaga dokładnie pięciu osobnych przykładów.");
  const isL2 = input.level === "l2";
  const prefix = `m546${input.level}`;
  const seeds = isL2
    ? [TRIANGLE_TYPES_LESSON_SEEDS.independent.challenge, TRIANGLE_TYPES_LESSON_SEEDS.predict.core, TRIANGLE_TYPES_LESSON_SEEDS.tent.challenge, TRIANGLE_TYPES_LESSON_SEEDS["possible-pair"].challenge, TRIANGLE_TYPES_LESSON_SEEDS["greatest-angle"].challenge]
    : [TRIANGLE_TYPES_LESSON_SEEDS.independent.support, TRIANGLE_TYPES_LESSON_SEEDS.predict.support, TRIANGLE_TYPES_LESSON_SEEDS.tent.support, TRIANGLE_TYPES_LESSON_SEEDS["equal-sides"].core, TRIANGLE_TYPES_LESSON_SEEDS.independent.core];
  const questions = input.examples.map((_, index) => ({
    id: `${prefix}-q${index + 1}`,
    generatorId: TRIANGLE_TYPES_GENERATOR_ID,
    seed: seeds[index],
    difficulty: index === 0 ? "support" as const : index === 4 ? "challenge" as const : "core" as const,
    skillIds: [...input.skillIds],
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: true,
      manualReview: "possible" as const,
      feedbackKeys: ["TRIANGLE_PREDICTION_EMPTY", "TRIANGLE_CLASSIFICATION_WRONG", "TRIANGLE_DEGENERATE", "TRIANGLE_EVIDENCE_MISSING"],
    },
  }));
  const stages: LessonStageBlueprint[] = [
    {
      suffix: `${input.level}-explore`,
      kind: "explore",
      title: isL2 ? "Najpierw przewiduj" : "Podział trójkątów ze względu na boki",
      minutes: isL2 ? 9 : 5,
      headline: isL2 ? "Ukryj etykiety, przewidź obie nazwy i dopiero sprawdź" : "Równoboczny, równoramienny i różnoboczny",
      body: isL2 ? "Rysunek powstaje z aktualnych współrzędnych A, B i C. Najpierw przewidź obie klasyfikacje, a dopiero potem sprawdź pomiary." : "Wybór nazwy zmienia model. Równe boki mają jednakowe kreski i proste długości liczbowe, dlatego nie trzeba wykonywać dodatkowych obliczeń.",
      modelId: "geometry-lab" as const,
      modelSeed: isL2 ? TRIANGLE_TYPES_LESSON_SEEDS.predict.core : TRIANGLE_TYPES_LESSON_SEEDS.playground.support,
    },
    ...(!isL2 ? [{
      suffix: `${input.level}-angle-playground`,
      kind: "explore" as const,
      title: "Podział trójkątów ze względu na kąty",
      minutes: 5,
      headline: "Ostrokątny, prostokątny i rozwartokątny",
      body: "W trójkącie ostrokątnym wszystkie kąty mają mniej niż 90°. Trójkąt prostokątny ma jeden kąt równy 90°, a rozwartokątny — jeden kąt większy niż 90°.",
      modelId: "geometry-lab" as const,
      modelSeed: TRIANGLE_TYPES_LESSON_SEEDS["angle-playground"].support,
      studentInstruction: "Wybieraj kolejne nazwy i obserwuj, jak zmieniają się kształt trójkąta oraz miary jego kątów.",
    }] : []),
    {
      suffix: `${input.level}-reasoning`,
      kind: "worked-example",
      title: isL2 ? "Największy kąt rozstrzyga" : "Podstawa i ramiona",
      minutes: isL2 ? 8 : 4,
      headline: isL2 ? "Najpierw największy kąt, potem porównanie z 90°" : "Każdy bok można wybrać jako podstawę",
      body: isL2
        ? "Łuki ∠A, ∠B i ∠C zmieniają się z rysunkiem. O klasyfikacji według kątów decyduje największy z nich."
        : "Dwa pozostałe boki są wtedy ramionami. W trójkącie równoramiennym dwa równe boki to ramiona, a trzeci bok jest podstawą.",
      modelId: "geometry-lab" as const,
      modelSeed: isL2 ? TRIANGLE_TYPES_LESSON_SEEDS["greatest-angle"].core : TRIANGLE_TYPES_LESSON_SEEDS["side-names"].support,
    },
    {
      suffix: `${input.level}-context`,
      kind: "practice",
      title: isL2 ? "Czy taki trójkąt może istnieć?" : "Boki trójkąta prostokątnego",
      minutes: isL2 ? 8 : 4,
      headline: isL2 ? "Zbuduj przykład albo uzasadnij niemożliwość" : "Przyprostokątne spotykają się przy kącie prostym",
      body: isL2
        ? "Para „równoboczny i rozwartokątny” jest niemożliwa, ale większość par dwóch niezależnych nazw można zbudować."
        : "Dwa boki tworzące kąt prosty to przyprostokątne. Bok leżący naprzeciw kąta prostego to przeciwprostokątna.",
      modelId: "geometry-lab",
      modelSeed: isL2 ? TRIANGLE_TYPES_LESSON_SEEDS["possible-pair"].challenge : TRIANGLE_TYPES_LESSON_SEEDS["right-side-names"].support,
    },
    ...(!isL2 ? [{
      suffix: `${input.level}-gallery`,
      kind: "practice" as const,
      title: "Rozpoznaj rodzaje trójkątów",
      minutes: 7,
      headline: "Zaznacz wszystkie trójkąty wskazanego rodzaju",
      body: "Na rysunkach nie ma długości boków ani miar kątów. Jedynie kąt prosty oznaczono łukiem z kropką. Trzy polecenia pojawiają się kolejno na jednym slajdzie.",
      modelId: "geometry-lab" as const,
      modelSeed: TRIANGLE_TYPES_LESSON_SEEDS["identify-gallery"].support,
      studentInstruction: "Kliknij wszystkie pasujące trójkąty i sprawdź zaznaczenie. Po poprawnej odpowiedzi pojawi się następny rodzaj.",
    }] : []),
    ...(!isL2 ? [{
      suffix: `${input.level}-perimeter`,
      kind: "practice" as const,
      title: "Obwód trójkąta",
      minutes: 9,
      headline: "Oblicz obwód albo wyznacz brakujący bok",
      body: "Sześć zadań pojawia się kolejno na jednym slajdzie. Są wśród nich trójkąty równoboczne, równoramienne, różnoboczne i prostokątne oraz zadania tekstowe w obu kierunkach: od boków do obwodu i od obwodu do boku.",
      modelId: "geometry-lab" as const,
      modelSeed: TRIANGLE_TYPES_LESSON_SEEDS.perimeter.support,
      studentInstruction: "Odczytaj dane z treści i rysunku. Samodzielnie wybierz działanie, wpisz tylko wynik i zatwierdź zadanie.",
    }] : []),
    {
      suffix: `${input.level}-independent-5`,
      kind: "practice",
      title: "Ćwiczenia — 5 przykładów",
      minutes: isL2 ? 14 : 10,
      headline: "Pięć osobnych przykładów",
      body: "Rozwiąż kolejno pięć przykładów. Każdy ma osobny model, odpowiedź, dowód cechą figury i informację zwrotną.",
      modelId: "geometry-lab" as const,
      modelSeed: isL2 ? TRIANGLE_TYPES_LESSON_SEEDS.independent.challenge : TRIANGLE_TYPES_LESSON_SEEDS.independent.support,
      questions,
      studentInstruction: "Rozwiąż pięć przykładów po kolei. W każdym wybierz klasyfikację i wskaż cechę, która ją uzasadnia.",
      teacherInstruction: "Jeden slajd zawiera pięć osobnych przykładów w tym samym przepływie co działy 1–2.",
      print: {
        worksheetTitle: isL2 ? "Rodzaje trójkątów — dwie klasyfikacje" : "Rodzaje trójkątów — klasyfikacja według boków",
        instructions: "Każdy przykład wykonaj w osobnym polu. Nazwij trójkąt i zapisz dowód na podstawie boków lub kątów.",
        itemCount: 5,
        items: input.examples.map((example, index) => ({
          id: `${prefix}-print-${index + 1}`,
          questionId: questions[index]!.id,
          skillIds: [...input.skillIds],
          maxScore: isL2 ? 2 : 1,
          expression: example.expression,
          prompt: example.prompt,
        })),
      },
    },
  ];
  return stages;
};

const triangleConstructionStages = (input: {
  level: "l1" | "l2";
  skillIds: string[];
  examples: Array<{ expression: string; prompt: string }>;
}): LessonStageBlueprint[] => {
  if (input.examples.length !== 5) throw new Error("M5-4.7 wymaga dokładnie pięciu osobnych przykładów.");
  const isL2 = input.level === "l2";
  const prefix = `m547${input.level}`;
  const seeds = isL2
    ? [
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.circles.support,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.circles.core,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS["construction-steps"].support,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS["construction-steps"].challenge,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.core,
      ]
    : [
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.inequality.support,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.inequality.core,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.inequality.challenge,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.bridge.challenge,
        TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.support,
      ];
  const questions = input.examples.map((_, index) => ({
    id: `${prefix}-q${index + 1}`,
    generatorId: TRIANGLE_CONSTRUCTION_GENERATOR_ID,
    seed: seeds[index]!,
    difficulty: index === 0 ? "support" as const : index === 4 ? "challenge" as const : "core" as const,
    skillIds: [...input.skillIds],
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: true,
      manualReview: "possible" as const,
      feedbackKeys: ["TRIANGLE_DECISION_MISSING", "TRIANGLE_DECISION_WRONG", "TRIANGLE_CONSTRUCTION_ORDER", "TRIANGLE_INEQUALITY_EVIDENCE_MISSING"],
    },
  }));

  return [
    {
      suffix: `${input.level}-segments`,
      kind: "explore",
      title: isL2 ? "Dwa okręgi możliwości" : "Czy można zbudować trójkąt?",
      minutes: 10,
      headline: isL2 ? "Punkty przecięcia okręgów wyznaczają dwa położenia wierzchołka C" : "Suma dwóch krótszych boków musi być większa od trzeciego",
      body: isL2
        ? "Podstawa AB jest pierwszym bokiem. Promień okręgu o środku A odpowiada długości AC, a promień okręgu o środku B — długości BC."
        : "Najpierw uczeń odczytuje warunek trójkąta. Następnie w sześciu kolejnych zestawach długości wybiera Tak albo Nie. Równość sumy dwóch krótszych boków i najdłuższego nie wystarcza do zbudowania trójkąta.",
      modelId: "geometry-lab",
      modelSeed: isL2 ? TRIANGLE_CONSTRUCTION_LESSON_SEEDS.circles.support : TRIANGLE_CONSTRUCTION_LESSON_SEEDS["feasibility-series"].support,
      studentInstruction: isL2 ? "Uruchamiaj kolejne kroki pokazu: podstawa, łuk z A i łuk z B. Wskaż dwa możliwe położenia punktu C." : "Dla każdego zestawu boków wybierz Tak albo Nie. Po poprawnej decyzji następne zadanie otworzy się automatycznie.",
      print: {
        worksheetTitle: isL2 ? "Dwa okręgi możliwości" : "Czy można zbudować trójkąt?",
        instructions: isL2 ? "Zachowaj promienie odpowiadające długościom boków. Nie wymazuj łuków konstrukcyjnych." : "Dla każdego zestawu porównaj sumę dwóch krótszych boków z najdłuższym i zapisz Tak albo Nie.",
        items: [{ id: `${prefix}-segments-print`, expression: isL2 ? "AB = 5 cm, AC = 4 cm, BC = 3 cm" : "3 cm, 4 cm, 5 cm", prompt: isL2 ? "Narysuj podstawę i dwa okręgi. Zaznacz oba punkty przecięcia." : "Czy z odcinków o podanych długościach można zbudować trójkąt?" }],
      },
    },
    {
      suffix: `${input.level}-rule`,
      kind: "worked-example",
      title: "Konstrukcja krok po kroku",
      minutes: 9,
      headline: "Trzy dane odcinki → podstawa → dwa łuki → punkt C → boki trójkąta",
      body: isL2
        ? "Każdy przycisk odpowiada matematycznemu krokowi. Następny krok jest dostępny dopiero po wykonaniu poprzedniego, a łuki pozostają widoczne jako ślad konstrukcji."
        : "Duży pokaz pozostawia na ekranie trzy dane odcinki, podstawę i oba łuki konstrukcyjne. Widoczny cyrkiel pokazuje, z którego końca podstawy przenoszona jest długość danego boku.",
      modelId: "geometry-lab",
      modelSeed: isL2 ? TRIANGLE_CONSTRUCTION_LESSON_SEEDS["construction-steps"].core : TRIANGLE_CONSTRUCTION_LESSON_SEEDS["visual-construction"].support,
      studentInstruction: "Uruchamiaj kroki po kolei. Obserwuj ustawienie ostrza cyrkla, promień łuku, punkt przecięcia C i końcowe połączenie boków.",
      print: {
        worksheetTitle: "Konstrukcja linijką i cyrklem",
        instructions: "Zostaw widoczny ślad rozumowania i podpisz użyte długości.",
        items: [{ id: `${prefix}-rule-print`, expression: isL2 ? "Boki 4 cm, 6 cm, 7 cm" : "Boki 6 cm, 5 cm, 4 cm", prompt: "Wykonaj konstrukcję, zachowaj oba łuki i ponumeruj kroki." }],
      },
    },
    {
      suffix: `${input.level}-context`,
      kind: "practice",
      title: isL2 ? "Ułóż kroki konstrukcji" : "Most linowy",
      minutes: 9,
      headline: isL2 ? "Uczeń wybiera kolejność, a model rysuje ślad konstrukcji" : "Czy trzy cięgna utworzą sztywną trójkątną ramę?",
      body: isL2
        ? "Uczeń wybiera najpierw podstawę, potem dwa promienie. Model rysuje łuki i sprawdza kolejność, punkty przecięcia oraz uzasadnienie."
        : "Tło mostu nadaje sens zadaniu, ale decyzja wynika wyłącznie z długości. Konflikt jest pokazany luką albo zapasem, a nie samym kolorem.",
      modelId: "geometry-lab",
      modelSeed: isL2 ? TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.core : TRIANGLE_CONSTRUCTION_LESSON_SEEDS.bridge.core,
      studentInstruction: isL2 ? "Wybierz pełną kolejność konstrukcji. Model wykona rysunek, a Ty na końcu zapisz kroki." : "Sprawdź ramę na modelu i zapisz porównanie długości, które uzasadnia decyzję.",
      print: {
        worksheetTitle: isL2 ? "Samodzielna konstrukcja" : "Most linowy",
        instructions: "Narysuj model, zapisz decyzję oraz matematyczny dowód.",
        items: [{ id: `${prefix}-context-print`, expression: isL2 ? "Boki 5 cm, 6 cm, 8 cm" : "Cięgna 5 m, 5 m, 8 m", prompt: isL2 ? "Skonstruuj trójkąt linijką i cyrklem; opisz każdy krok." : "Rozstrzygnij, czy rama się zamknie, i uzasadnij porównaniem długości." }],
      },
    },
    {
      suffix: `${input.level}-independent-5`,
      kind: "practice",
      title: "Ćwiczenia — 5 przykładów",
      minutes: 14,
      headline: "Pięć osobnych przykładów",
      body: isL2 ? "Każdy przykład ma osobny wizualny pokaz, decyzję i feedback. Uczeń wybiera kroki, obserwuje pozostawione łuki i opisuje kolejność." : "Każdy przykład uruchamia się osobno. Uczeń najpierw sprawdza domknięcie na modelu, potem zapisuje porównanie i wniosek.",
      modelId: "geometry-lab",
      modelSeed: isL2 ? TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.core : TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.support,
      questions,
      studentInstruction: isL2 ? "Rozwiąż pięć przykładów po kolei. Wybierz kroki konstrukcji, obejrzyj powstający rysunek i opisz kolejność." : "Rozwiąż pięć przykładów po kolei. W każdym wybierz decyzję i potwierdź ją nierównością.",
      teacherInstruction: "Jeden slajd zawiera pięć osobnych zadań uruchamianych pojedynczo, tak jak w działach 1–2.",
      print: {
        worksheetTitle: isL2 ? "Konstrukcja trójkąta o danych bokach — L2" : "Czy można zbudować trójkąt? — L1",
        instructions: isL2 ? "Każdy przykład wykonaj w osobnym polu. Zachowaj łuki konstrukcyjne i zapisz kolejność." : "Każdy zestaw sprawdź modelem odcinków. Zapisz porównanie i wniosek.",
        itemCount: 5,
        items: input.examples.map((example, index) => ({ id: `${prefix}-print-${index + 1}`, questionId: questions[index]!.id, skillIds: [...input.skillIds], maxScore: isL2 ? 3 : 2, expression: example.expression, prompt: example.prompt })),
      },
    },
  ];
};

type S4Input = Omit<
  BuildLessonInput,
  "sectionId" | "stageBlueprints" | "overview" | "openingScript" | "closingScript" | "commonMisconceptions"
> & {
  stages: LessonStageBlueprint[];
  lessonNumber?: number;
  overview?: string;
  openingScript?: string;
  closingScript?: string;
  commonMisconceptions?: string[];
};

function s4(input: S4Input): LessonPackage {
  const core = input.coreLesson;
  const { lessonNumber = 1, ...lessonInput } = input;
  const slideZero = getSection3To5SlideZeroContext(input.topicId);
  if (!slideZero) throw new Error(`Brak kontraktu slajdu 0 dla ${input.topicId}.`);
  const lesson = assertLessonSlideZero(buildLessonPackage({
    ...lessonInput,
    ...slideZero,
    learningGoals: lessonInput.learningGoals ?? slideZero.learningGoals,
    sectionId: S4,
    stageBlueprints: lessonInput.stages,
    overview: lessonInput.overview ?? `Lekcja ${lessonInput.topicId} — ${core}.`,
    openingScript: lessonInput.openingScript ?? `„${core} — zaczynamy od obserwacji.”`,
    closingScript: lessonInput.closingScript ?? `„${core} — utrwal rysunek i uzasadnienie.”`,
    commonMisconceptions: lessonInput.commonMisconceptions ?? ["Opieranie się tylko na wyglądzie prototypu figury."],
  }));
  return lessonNumber === lesson.lessonNumber ? lesson : { ...lesson, lessonNumber };
}

export const m541ProsteRelacjeL1V1 = s4({
  id: "m5-4-1-proste-relacje-l1-v1",
  topicId: "M5-4.1",
  title: "Proste prostopadłe i równoległe",
  coreLesson: "Od punktu i odcinka do odległości",
  paperEvidence: "Karta pojęć, oznaczeń, relacji, konstrukcji i odległości",
  studentGoal: "Uczeń rozpoznaje i oznacza punkt, prostą, półprostą oraz odcinek, wskazuje proste i odcinki równoległe lub prostopadłe, zna sposób ich rysowania i wyznacza odległość za pomocą najkrótszego odcinka prostopadłego.",
  successCriteria: [
    "Rozpoznaje punkt, prostą, półprostą i odcinek oraz stosuje małe litery dla prostych i wielkie litery dla punktów oraz końców odcinków.",
    "Rozpoznaje proste i odcinki równoległe lub prostopadłe oraz zapisuje ∥ i ⟂.",
    "Porządkuje kroki rysowania prostej równoległej i prostopadłej linijką oraz ekierką.",
    "Wskazuje odległość punktu od prostej jako najkrótszy odcinek prostopadły.",
    "Wskazuje odległość między prostymi równoległymi jako odcinek prostopadły do obu prostych.",
  ],
  prerequisiteSkillIds: [],
  skillIds: ["M5-4.1-parallel-perpendicular"],
  estimatedMinutes: 45,
  overview: "Spójne wprowadzenie pojęć i oznaczeń, rozpoznawanie relacji, wizualny pokaz konstrukcji oraz wyznaczanie odległości. Na tablecie uczeń obserwuje i wybiera; konstrukcję odręczną wykonuje na papierze.",
  openingScript: "„Najpierw nauczymy się języka geometrii, potem rozpoznamy relacje i zobaczymy, dlaczego odległość zawsze mierzymy prostopadle.”",
  closingScript: "„Nazwij obiekt, zastosuj poprawne litery, zapisz ∥ albo ⟂ i przy odległości wskaż najkrótszy odcinek pod kątem prostym.”",
  commonMisconceptions: [
    "Uznawanie każdej pary przecinających się prostych za prostopadłą.",
    "Uznawanie, że proste równoległe muszą być poziome lub pionowe.",
    "Oznaczanie prostej wielką literą albo odcinka jedną małą literą.",
    "Wybieranie ukośnego, dłuższego połączenia jako odległości punktu od prostej lub między prostymi.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "warmup",
      title: "Punkt, prosta, półprosta i odcinek",
      minutes: 4,
      headline: "Cztery podstawowe obiekty i ich oznaczenia",
      body: "Punkty oznaczamy wielkimi literami. Proste oznaczamy małymi literami. Półprostą i odcinek zapisujemy wielkimi literami punktów, które je wyznaczają.",
      modelId: "geometry-lab",
      modelSeed: 410401,
      studentInstruction: "Klikaj kolejno: punkt P, prosta a, półprosta AB i odcinek CD. Zwróć uwagę na strzałki oraz wielkość liter.",
      print: {
        worksheetTitle: "Punkt, prosta, półprosta i odcinek",
        instructions: "Podpisz każdy obiekt poprawną małą lub wielką literą.",
        items: [
          { id: "foundations-names", expression: "• P   ←────a────→   A•────→B   C•────•D", prompt: "Nazwij cztery obiekty i wyjaśnij, dlaczego prosta ma małą literę, a punkty wielkie." },
        ],
      },
    },
    {
      suffix: "s2",
      kind: "explore",
      title: "Odcinki równoległe i prostopadłe",
      minutes: 4,
      headline: "Rozpoznaj relację i zapisz ją symbolem",
      body: "Odcinki AB i CD są równoległe, gdy leżą na prostych o tym samym kierunku. Odcinki EF i GH są prostopadłe, gdy tworzą kąt prosty. Zapisujemy AB ∥ CD oraz EF ⟂ GH.",
      modelId: "geometry-lab",
      modelSeed: 410402,
      studentInstruction: "Wskaż końce odcinków, odczytaj zapis AB ∥ CD i EF ⟂ GH oraz znajdź kwadrat oznaczający 90°.",
      print: {
        worksheetTitle: "Odcinki równoległe i prostopadłe",
        instructions: "Przy każdej parze wpisz ∥ albo ⟂ i zaznacz końce odcinków wielkimi literami.",
        items: [
          { id: "segment-symbols", expression: "AB __ CD     EF __ GH", prompt: "Uzupełnij symbole i zaznacz kąt prosty tam, gdzie występuje." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "discuss",
      title: "Proste równoległe i prostopadłe",
      minutes: 5,
      headline: "Rozpoznaj dwa rodzaje prostych",
      body: "Proste równoległe nie przecinają się. Proste prostopadłe przecinają się pod kątem prostym.",
      modelId: "geometry-lab",
      modelSeed: 410101,
      studentInstruction: "Wskaż proste równoległe i prostopadłe. Odczytaj zapisy a ∥ b oraz a ⟂ b.",
      discussionPrompts: [
        "Które proste się nie przecinają?",
        "Które proste tworzą kąt prosty?",
      ],
      print: {
        worksheetTitle: "Proste równoległe i prostopadłe",
        instructions: "Rozpoznaj proste równoległe i prostopadłe. Użyj symbolu ∥ albo ⟂.",
        items: [
          { id: "parallel-lines", expression: "dwie proste, które się nie przecinają", prompt: "Wpisz symbol ∥ albo ⟂." },
          { id: "perpendicular-lines", expression: "dwie proste tworzące kąt prosty", prompt: "Wpisz symbol ∥ albo ⟂." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "worked-example",
      title: "Jak rysujemy prostą prostopadłą?",
      minutes: 4,
      headline: "Jedna przyprostokątna na prostej, druga przez punkt",
      body: "Przyłóż jedną przyprostokątną ekierki do prostej a. Przesuń ekierkę, aż druga przyprostokątna przejdzie przez punkt P. Wzdłuż niej narysuj prostą b.",
      modelId: "geometry-lab",
      modelSeed: 411401,
      studentInstruction: "Klikaj kolejne kroki i obserwuj ustawienie ekierki. Konstrukcję wykonuje się linijką i ekierką na kartce.",
      print: {
        worksheetTitle: "Rysowanie prostej prostopadłej",
        instructions: "Ponumeruj kroki, a następnie wykonaj konstrukcję linijką i ekierką.",
        items: [
          { id: "perpendicular-steps", expression: "przyłóż do a · wybierz drugą krawędź · narysuj b · zaznacz □", prompt: "Ułóż kroki i zapisz a ⟂ b." },
        ],
      },
    },
    {
      suffix: "s5",
      kind: "worked-example",
      title: "Jak rysujemy prostą równoległą?",
      minutes: 4,
      headline: "Linijka pozostaje nieruchoma, ekierka się przesuwa",
      body: "Przyłóż krawędź ekierki do prostej a, a do drugiej krawędzi przyłóż linijkę. Trzymając linijkę nieruchomo, przesuń ekierkę bez obracania do punktu P i narysuj prostą b.",
      modelId: "geometry-lab",
      modelSeed: 411402,
      studentInstruction: "Klikaj kolejne kroki i obserwuj, że linijka się nie porusza, a ekierka przesuwa się bez obracania.",
      print: {
        worksheetTitle: "Rysowanie prostej równoległej",
        instructions: "Ponumeruj kroki, a następnie wykonaj konstrukcję linijką i ekierką.",
        items: [
          { id: "parallel-steps", expression: "przyłóż ekierkę · podeprzyj linijką · przesuń bez obrotu · narysuj b", prompt: "Ułóż kroki i zapisz a ∥ b." },
        ],
      },
    },
    {
      suffix: "s6",
      kind: "explore",
      title: "Odległość punktu od prostej",
      minutes: 4,
      headline: "Najkrótsza droga prowadzi pod kątem prostym",
      body: "Z punktu P do prostej a można poprowadzić wiele odcinków. Odległością punktu P od prostej a jest długość najkrótszego z nich — odcinka prostopadłego do prostej.",
      modelId: "geometry-lab",
      modelSeed: 410403,
      studentInstruction: "Porównaj trzy odcinki łączące P z prostą a. Wybierz najkrótszy. Po poprawnym wyborze odczytaj oznaczenie kąta prostego.",
      print: {
        worksheetTitle: "Odległość punktu od prostej",
        instructions: "Zaznacz najkrótszy odcinek i dorysuj kwadrat kąta prostego.",
        items: [
          { id: "point-line-distance", expression: "P •     ╲  │  ╱     ───── a", prompt: "Który odcinek wyznacza odległość punktu P od prostej a? Uzasadnij słowami: najkrótszy i prostopadły." },
        ],
      },
    },
    {
      suffix: "s7",
      kind: "explore",
      title: "Odległość między prostymi równoległymi",
      minutes: 4,
      headline: "Najkrótsze połączenie jest prostopadłe do obu prostych",
      body: "Między dwiema prostymi równoległymi można poprowadzić wiele odcinków. Odległość wyznacza najkrótszy z nich — odcinek prostopadły zarówno do prostej a, jak i do prostej b.",
      modelId: "geometry-lab",
      modelSeed: 410404,
      studentInstruction: "Wybierz najkrótszy z trzech odcinków łączących proste a i b. Sprawdź, czy tworzy kąt prosty z obiema prostymi.",
      print: {
        worksheetTitle: "Odległość między prostymi równoległymi",
        instructions: "Zaznacz najkrótszy odcinek prostopadły do obu prostych.",
        items: [
          { id: "parallel-lines-distance", expression: "a ─────────     ╲  │  ╱     b ─────────", prompt: "Który odcinek wyznacza odległość między a i b? Zaznacz dwa kąty proste." },
        ],
      },
    },
    {
      suffix: "s8",
      kind: "exit-ticket",
      title: "Samodzielne rozpoznawanie",
      minutes: 3,
      headline: "Znajdź pary boków równoległych i prostopadłych",
      body: "Przyjrzyj się łamanej ABCDEFGH. W puste kratki wpisz oznaczenia odcinków, np. AB lub BC.",
      modelId: "geometry-lab",
      modelSeed: 410302,
      studentInstruction: "Znajdź wszystkie przygotowane pary odcinków równoległych i prostopadłych. Kliknij kratkę i wpisz dwie litery oznaczające odcinek.",
      print: {
        worksheetTitle: "Łamana ABCDEFGH — odcinki równoległe i prostopadłe",
        instructions: "Znajdź pary boków równoległych i prostopadłych. Wpisz oznaczenia odcinków.",
        items: [
          { id: "polyline-relations", maxScore: 3, expression: "A──B\n   │\n   C──D╲E╲F╱G──H", prompt: "Równoległe: ____ ∥ ____. Prostopadłe: ____ ⟂ ____ oraz ____ ⟂ ____." },
        ],
      },
    },
    {
      suffix: "s9",
      kind: "exit-ticket",
      title: "Samodzielne rozpoznawanie — druga łamana",
      minutes: 3,
      headline: "Znajdź pary boków w nowym układzie",
      body: "Przyjrzyj się drugiej łamanej ABCDEFGH. W puste kratki wpisz oznaczenia odcinków, np. CD lub DE.",
      modelId: "geometry-lab",
      modelSeed: 410303,
      studentInstruction: "Znajdź jedną parę odcinków równoległych i dwie pary odcinków prostopadłych. Kliknij kratkę i wpisz dwie litery oznaczające odcinek.",
      print: {
        worksheetTitle: "Druga łamana ABCDEFGH — odcinki równoległe i prostopadłe",
        instructions: "Znajdź pary boków równoległych i prostopadłych. Wpisz oznaczenia odcinków.",
        items: [
          { id: "polyline-relations-second", maxScore: 3, expression: "A╲B╱C\n    │\n    D─E\n      │\n      F╱G╱H", prompt: "Równoległe: ____ ∥ ____. Prostopadłe: ____ ⟂ ____ oraz ____ ⟂ ____." },
        ],
      },
    },
  ],
});

export const m541KonstrukcjeProstychL2V1 = s4({
  id: "m5-4-1-konstrukcje-prostych-l2-v1",
  topicId: "M5-4.1",
  lessonNumber: 2,
  title: "Proste prostopadłe i równoległe",
  coreLesson: "Konstrukcje prostych — pokaz krok po kroku",
  paperEvidence: "Karta L2 do konstrukcji linijką i ekierką z zachowaniem linii pomocniczych",
  studentGoal: "Uczeń rozumie kolejne etapy konstrukcji prostych prostopadłych i równoległych oraz potrafi sprawdzić jej warunki.",
  successCriteria: [
    "Układa etapy konstrukcji prostej prostopadłej do danej prostej przez punkt P.",
    "Wyjaśnia konstrukcję prostej równoległej przez przesunięcie bez obrotu.",
    "Buduje i oznacza układ prostych a, b, c spełniający trzy warunki.",
    "Sprawdza konstrukcję za pomocą symboli ∥, ⟂ i kwadratu kąta prostego.",
  ],
  learningGoals: [
    {
      id: "m5-4-1-l2-goal-1",
      studentGoal: "Nauczę się układać etapy konstrukcji prostej prostopadłej do danej prostej przez punkt.",
      successCriteria: ["Potrafię ustawić ekierkę i narysować prostą przechodzącą przez wskazany punkt pod kątem 90°."],
      curriculumReferences: [
        "VII.2 — rozpoznaje proste i odcinki prostopadłe oraz równoległe.",
        "VII.3 — rysuje pary odcinków prostopadłych i równoległych.",
      ],
    },
    {
      id: "m5-4-1-l2-goal-2",
      studentGoal: "Nauczę się wyjaśniać konstrukcję prostej równoległej przez przesuwanie bez obracania.",
      successCriteria: ["Potrafię zachować kierunek prostej podczas przesunięcia przez punkt P."],
      curriculumReferences: [
        "VII.2 — rozpoznaje proste i odcinki prostopadłe oraz równoległe.",
        "VII.3 — rysuje pary odcinków prostopadłych i równoległych.",
      ],
    },
    {
      id: "m5-4-1-l2-goal-3",
      studentGoal: "Nauczę się projektować układ prostych spełniający kilka warunków.",
      successCriteria: ["Potrafię zbudować i oznaczyć proste a, b, c, gdy podano trzy relacje."],
      curriculumReferences: [
        "VII.2 — rozpoznaje proste i odcinki prostopadłe oraz równoległe.",
        "VII.3 — rysuje pary odcinków prostopadłych i równoległych.",
      ],
    },
    {
      id: "m5-4-1-l2-goal-4",
      studentGoal: "Nauczę się sprawdzać i oznaczać poprawność konstrukcji.",
      successCriteria: ["Potrafię użyć symboli ∥, ⟂, jednakowych grotów i kwadratu kąta prostego."],
      curriculumReferences: [
        "VII.2 — rozpoznaje proste i odcinki prostopadłe oraz równoległe.",
        "VII.3 — rysuje pary odcinków prostopadłych i równoległych.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-4.1-parallel-perpendicular"],
  skillIds: ["M5-4.1-line-constructions"],
  estimatedMinutes: 45,
  overview: "L2 — wizualny pokaz konstrukcji prostych za pomocą ekierki, przesunięcia bez obrotu i kontroli warunków. Na tablecie uczeń porządkuje i sprawdza kroki; konstrukcję odręczną wykonuje tylko na papierze.",
  openingScript: "„Dziś relację nie tylko rozpoznamy — zbudujemy ją i zostawimy ślad pokazujący, dlaczego konstrukcja jest poprawna.”",
  closingScript: "„Pokaż linie pomocnicze, oznacz ∥ lub ⟂ i sprawdź każdy warunek osobno.”",
  commonMisconceptions: [
    "Ustawienie dowolnej krawędzi ekierki w pobliżu prostej bez jej dokładnego dopasowania.",
    "Obracanie narzędzia podczas konstrukcji prostej równoległej.",
    "Spełnienie dwóch z trzech warunków układu a, b, c i pominięcie przejścia przez punkt P.",
  ],
  stages: [
    {
      suffix: "l2-s1",
      kind: "warmup",
      title: "Plan konstrukcji",
      minutes: 3,
      headline: "Co musi pozostać stałe podczas konstrukcji?",
      body: "Dla prostopadłości pilnujemy kąta 90° i przejścia przez punkt. Dla równoległości zachowujemy kierunek podczas całego przesunięcia.",
      print: {
        worksheetTitle: "Proste prostopadłe i równoległe — L2",
        instructions: "Przy każdym opisie zaznacz niezmiennik: kierunek, kąt 90° albo przejście przez punkt.",
        items: [
          { id: "l2-plan", expression: "⟂ / ∥ / P ∈ b", prompt: "Dopisz, czego trzeba pilnować w każdej konstrukcji." },
        ],
      },
    },
    {
      suffix: "l2-s2",
      kind: "explore",
      title: "Ekierka ekranowa",
      minutes: 7,
      headline: "Zobacz, jak ekierka wyznacza prostą przez punkt P",
      body: "Pokaz prowadzi przez ustawienie ekierki, wybór właściwej krawędzi i sprawdzenie przejścia przez punkt P. Każdy warunek jest widoczny osobno.",
      modelId: "geometry-lab",
      modelSeed: 411101,
      studentInstruction: "Uruchom kroki pokazu w poprawnej kolejności: Q na prostej a, jedna krawędź wzdłuż a, druga przez P, a następnie sprawdzenie prostej b.",
      teacherInstruction: "Najpierw wymagaj poprawnego ustawienia narzędzia. GEO_NOT_PERPENDICULAR uruchamia pytanie o krawędź tworzącą 90°.",
      print: {
        worksheetTitle: "Ekierka ekranowa — odpowiednik papierowy",
        instructions: "Linijką i ekierką skonstruuj przez P prostą b prostopadłą do a. Zostaw cienkie linie pomocnicze.",
        items: [
          { id: "l2-try-square", expression: "a: ─────────────     • P", prompt: "Skonstruuj P ∈ b i a ⟂ b. Zaznacz □ oraz podpisz b." },
        ],
      },
    },
    {
      suffix: "l2-s3",
      kind: "worked-example",
      title: "Prostopadła przez punkt P",
      minutes: 6,
      headline: "Trzy kontrole: ekierka na a, krawędź przez P, wynik a ⟂ b",
      body: "Po każdym ruchu sprawdź osobny warunek. Narysowanie b nie kończy pracy, dopóki prosta nie przechodzi przez P i nie pojawi się kwadrat kąta prostego.",
      modelId: "geometry-lab",
      modelSeed: 411102,
      studentInstruction: "Ułóż etapy ukończonego przykładu i nazwij trzy kontrole poprawności.",
      print: {
        worksheetTitle: "Konstrukcja prostopadłej krok po kroku",
        instructions: "Ponumeruj kroki i wykonaj konstrukcję. Uzasadnij ją jednym zdaniem.",
        items: [
          { id: "l2-perpendicular-proof", expression: "1. ustaw · 2. przesuń · 3. narysuj · 4. oznacz", prompt: "Dlaczego otrzymana prosta jest prostopadła do a?" },
        ],
      },
    },
    {
      suffix: "l2-s4",
      kind: "explore",
      title: "Przesuń bez obracania",
      minutes: 7,
      headline: "Zobacz, jak przenieść kierunek prostej a przez punkt P",
      body: "Kąt prostej b jest zablokowany. Widoczny ślad łączy położenie początkowe i końcowe, a licznik potwierdza zmianę kierunku równą 0°.",
      modelId: "geometry-lab",
      modelSeed: 411201,
      studentInstruction: "Uruchom przesunięcie prostej b do punktu P bez zmiany jej kierunku. Obserwuj ślad ↕ bez ↻ i oznaczenia a ∥ b.",
      teacherInstruction: "Podkreśl, że równoległość wynika z zachowania kierunku. GEO_NOT_PARALLEL wskazuje parę i identyczne groty.",
      print: {
        worksheetTitle: "Przesuń bez obracania",
        instructions: "Za pomocą linijki i ekierki narysuj przez P prostą b równoległą do a. Zaznacz dwa położenia narzędzia.",
        items: [
          { id: "l2-parallel-slide", expression: "a: ╱────────     • P", prompt: "Skonstruuj P ∈ b i a ∥ b. Oznacz parę jednakowymi grotami." },
        ],
      },
    },
    {
      suffix: "l2-s5",
      kind: "challenge",
      title: "Tory i alejki",
      minutes: 7,
      headline: "Zaprojektuj a, b, c według trzech warunków",
      body: "Każdy warunek ma osobny symbol i stan. Model nie zalicza projektu po wyglądzie: oblicza kierunki oraz odległość punktu P od prostej c.",
      modelId: "geometry-lab",
      modelSeed: 411301,
      studentInstruction: "Wybierz kolejność budowania b i c dla warunków a ∥ b, b ⟂ c, P ∈ c. Sprawdzaj po jednym warunku.",
      teacherInstruction: "Przy niespełnionych relacjach pokazuj kolejno GEO_NOT_PARALLEL i GEO_NOT_PERPENDICULAR, bez ujawniania gotowych współrzędnych.",
      print: {
        worksheetTitle: "Tory i alejki — projekt",
        instructions: "Narysuj układ spełniający wszystkie trzy warunki. Zachowaj linie konstrukcyjne i oznaczenia.",
        items: [
          { id: "l2-network", expression: "a ∥ b · b ⟂ c · P ∈ c", prompt: "Skonstruuj i podpisz a, b, c. Przy każdym warunku postaw ✓ po sprawdzeniu." },
        ],
      },
    },
    {
      suffix: "l2-s6",
      kind: "exit-ticket",
      title: "Samodzielne uporządkowanie kroków",
      minutes: 5,
      headline: "Samodzielnie zaplanuj układ i wskaż dowód poprawności",
      body: "Bez podpowiedzi wybierz kolejność powstawania układu z nowej konfiguracji i sprawdź trzy warunki. Wynik tej próby zasila końcową Ocenę umiejętności.",
      modelId: "geometry-lab",
      modelSeed: 411302,
      studentInstruction: "Ułóż kroki dla a ∥ b, b ⟂ c, P ∈ c. Sprawdź trzy warunki i zapisz jednozdaniowe uzasadnienie.",
      teacherInstruction: "Oceniaj osobno: równoległość, prostopadłość, przejście przez P oraz oznaczenia. Nie poprawiaj konstrukcji przed oddaniem.",
      print: {
        worksheetTitle: "Samodzielna konstrukcja — L2",
        instructions: "Wykonaj trzy konstrukcje. Zostaw ślady narzędzi, podpisz proste i zastosuj symbole.",
        items: [
          { id: "l2-independent-perpendicular", maxScore: 1, expression: "Prosta a i punkt P poza nią", prompt: "Ułóż kroki pokazu prostej b: P ∈ b i a ⟂ b." },
          { id: "l2-independent-parallel", maxScore: 1, expression: "Ukośna prosta a i punkt P", prompt: "Ułóż kroki pokazu prostej b: P ∈ b i a ∥ b metodą przesunięcia bez obrotu." },
          { id: "l2-independent-network", maxScore: 2, expression: "a ∥ b · b ⟂ c · P ∈ c", prompt: "Wybierz kolejność budowania układu, oznacz trzy warunki i krótko uzasadnij poprawność." },
        ],
      },
    },
  ],
});

export const m542RozchylRamionaV1 = s4({
  id: "m5-4-2-rozchyl-ramiona-v1",
  topicId: "M5-4.2",
  title: "Kąty i ich rodzaje",
  coreLesson: "Rozpoznaj i nazwij kąt",
  paperEvidence: "Karta L1: budowa i zapis kąta, greckie oznaczenia, klasyfikacja po mierze i kąty na figurach",
  studentGoal: "Uczeń wskazuje wierzchołek, ramiona i wnętrze kąta, poprawnie zapisuje jego nazwę, rysuje wskazany kąt z rozsypanych punktów oraz rozpoznaje rodzaje kątów po rozwartości, mierze i położeniu na figurze.",
  successCriteria: [
    "Potrafię wskazać wierzchołek, oba ramiona i wnętrze kąta oraz narysować wskazany kąt z rozsypanych punktów.",
    "Potrafię oznaczyć kąt literą grecką i odczytać zapis ∠ABC, pamiętając, że środkowa litera oznacza wierzchołek.",
    "Potrafię rozpoznać kąt zerowy, ostry, prosty, rozwarty, półpełny, wklęsły i pełny oraz wskazać kąty wypukłe.",
    "Potrafię sklasyfikować kąt po jego mierze i wskazać kąty wewnętrzne na rysunku figury.",
  ],
  learningGoals: [
    {
      id: "m5-4-2-goal-1",
      studentGoal: "Nauczę się wskazywać wierzchołek, ramiona i wnętrze kąta oraz poprawnie zapisywać jego nazwę.",
      successCriteria: ["Potrafię wskazać wspólny wierzchołek, oba ramiona i część płaszczyzny między nimi oraz odczytać zapis ∠ABC."],
      curriculumReferences: ["VIII.1 — wskazuje w dowolnym kącie ramiona i wierzchołek."],
    },
    {
      id: "m5-4-2-goal-2",
      studentGoal: "Nauczę się rozpoznawać kąty: ostry, prosty, rozwarty, półpełny i pełny.",
      successCriteria: ["Potrafię poprawnie nazwać kąt na podstawie jego rozwartości lub miary."],
      curriculumReferences: ["VIII.4 — rozpoznaje kąt prosty, ostry i rozwarty."],
    },
    {
      id: "m5-4-2-goal-3",
      studentGoal: "Nauczę się oznaczać kąty literami greckimi i rozpoznawać kąty wypukłe oraz wklęsłe.",
      successCriteria: ["Potrafię zastosować oznaczenia α, β lub γ oraz rozpoznać kąt wypukły i wklęsły."],
      curriculumReferences: ["VIII.5 — porównuje kąty."],
    },
  ],
  prerequisiteSkillIds: ["M5-4.1-parallel-perpendicular"],
  skillIds: ["M5-4.2-angle-types"],
  estimatedMinutes: 45,
  overview: "L1 — budowa i zapis kąta, greckie oznaczenia, pełna klasyfikacja od 0° do 360°, rozpoznawanie po mierze, kolorowanie rodzajów, wskazywanie kątów na figurze i rysowanie kąta z rozsypanych punktów.",
  openingScript: "„Najpierw zobacz, z czego zbudowany jest kąt. Potem zmieniaj tylko jego rozwartość i obserwuj, jak zmienia się nazwa.”",
  closingScript: "„Rodzaj kąta rozpoznajemy po rozwartości lub mierze, a w zapisie trzyliterowym wierzchołek zawsze stoi w środku.”",
  commonMisconceptions: [
    "Mylenie wnętrza kąta z narysowanym łukiem albo długością ramion.",
    "Umieszczanie wierzchołka na pierwszym miejscu zamiast w środku zapisu ∠ABC.",
    "Mylenie kąta rozwartego z wklęsłym oraz półpełnego z pełnym.",
    "Traktowanie litery greckiej jako nazwy ramienia zamiast oznaczenia kąta.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "warmup",
      title: "Budowa kąta",
      minutes: 3,
      headline: "Kąt ma wierzchołek, dwa ramiona i wnętrze między ramionami",
      body: "Dwie półproste o wspólnym początku są ramionami kąta. Wspólny punkt jest wierzchołkiem, a kąt to część płaszczyzny zawarta między ramionami — nie sama kreska ani łuk.",
      modelId: "geometry-lab",
      modelSeed: 421101,
      studentInstruction: "Klikaj kolejno: wierzchołek B, ramię BA, ramię BC i wnętrze kąta. Wskaż każdy element na modelu.",
      teacherInstruction: "Wyraźnie oddziel wnętrze kąta od łuku, który jest tylko graficznym oznaczeniem.",
      print: {
        worksheetTitle: "Budowa kąta",
        instructions: "Podpisz wierzchołek, oba ramiona i zakreskuj wnętrze kąta.",
        items: [{ id: "angle-anatomy", expression: "∠ABC", prompt: "Zaznacz wierzchołek B, ramiona BA i BC oraz wnętrze kąta." }],
      },
    },
    {
      suffix: "s2",
      kind: "predict",
      title: "Zmieniaj rozwartość kąta",
      minutes: 5,
      headline: "Zmiana rozwartości zmienia rodzaj kąta",
      body: "Uczeń przesuwa tylko jedno ramię za pomocą suwaka od 0° do 360°. Model na bieżąco pokazuje kąt zerowy, ostry, prosty, rozwarty, półpełny, wklęsły i pełny oraz informuje, czy kąt jest wypukły.",
      modelId: "geometry-lab",
      modelSeed: 421201,
      studentInstruction: "Przesuwaj suwak rozwartości. Zatrzymaj się kolejno przy 35°, 90°, 125°, 180°, 225° i 360° i odczytaj nazwę kąta.",
      teacherInstruction: "Nie wprowadzaj zmiany długości ramion ani obrotu figury. Cała uwaga ma pozostać na rozwartości i przedziałach miar.",
      discussionPrompts: ["Które kąty należą do kątów wypukłych?", "Gdzie dokładnie zaczyna się kąt wklęsły?"],
      print: {
        worksheetTitle: "Rodzaje kątów i przedziały miar",
        instructions: "Uzupełnij nazwę i zaznacz, czy kąt jest wypukły czy wklęsły.",
        items: [
          { id: "range-acute", expression: "0° < α < 90°", prompt: "Nazwa: ______; wypukły/wklęsły: ______." },
          { id: "range-reflex", expression: "180° < β < 360°", prompt: "Nazwa: ______; wypukły/wklęsły: ______." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "discuss",
      title: "Kąty oznaczamy literami greckimi",
      minutes: 3,
      headline: "α, β, γ i δ nazywają kąty",
      body: "Litery greckie alfa, beta, gamma i delta umieszczamy przy odpowiednich kątach. Litera grecka oznacza kąt, a nie jego ramię ani wierzchołek.",
      modelId: "geometry-lab",
      modelSeed: 421301,
      studentInstruction: "Wybierz kolejno kąty α, β i γ. Przeczytaj na głos nazwy użytych liter greckich.",
      teacherInstruction: "Utrwal wymowę: alfa, beta, gamma, delta. Nie utożsamiaj tych oznaczeń z nazwami punktów.",
      print: {
        worksheetTitle: "Greckie oznaczenia kątów",
        instructions: "Podpisz cztery kąty kolejnymi literami greckimi.",
        items: [{ id: "greek-labels", expression: "α, β, γ, δ", prompt: "Połącz literę z jej nazwą: alfa, beta, gamma, delta." }],
      },
    },
    {
      suffix: "s4",
      kind: "worked-example",
      title: "Jak czytamy zapis kąta?",
      minutes: 4,
      headline: "W zapisie ∠ABC środkowa litera B oznacza wierzchołek",
      body: "Uczeń rozwiązuje trzy osobne zadania z różnymi literami. Punkty na ramionach zapisuje po bokach nazwy, a literę wspólnego wierzchołka zawsze umieszcza w środku.",
      modelId: "geometry-lab",
      modelSeed: 421401,
      studentInstruction: "Rozwiąż kolejno trzy zadania. W każdym najpierw znajdź wierzchołek, a następnie umieść jego literę w środku nazwy kąta.",
      teacherInstruction: "Przy błędzie poproś wyłącznie o wskazanie wspólnego początku obu ramion; nie podawaj od razu gotowego zapisu.",
      print: {
        worksheetTitle: "Odczytywanie nazw kątów",
        instructions: "W każdym z trzech zapisów umieść literę wierzchołka w środku.",
        items: [
          { id: "notation-abc", expression: "B — wierzchołek; A i C — punkty na ramionach", prompt: "Zapisz kąt: ______." },
          { id: "notation-def", expression: "E — wierzchołek; D i F — punkty na ramionach", prompt: "Zapisz kąt: ______." },
          { id: "notation-klm", expression: "L — wierzchołek; K i M — punkty na ramionach", prompt: "Zapisz kąt: ______." },
        ],
      },
    },
    {
      suffix: "s5",
      kind: "explore",
      title: "Rozpoznaj kąt po mierze",
      minutes: 4,
      headline: "Znajdź w rozsypance wszystkie miary wskazanego rodzaju kąta",
      body: "Na planszy znajduje się 25 miar w przypadkowej kolejności. W każdej rundzie uczeń zaznacza pełny zestaw miar kątów: ostrych, prostych, rozwartych, półpełnych, wklęsłych, pełnych lub zerowych.",
      modelId: "geometry-lab",
      modelSeed: 421501,
      studentInstruction: "Przeczytaj nazwę i przedział u góry. Zaznacz wszystkie pasujące miary w rozsypance, a następnie sprawdź cały wybór.",
      teacherInstruction: "Uczeń ma przejrzeć całą planszę, tak jak w rozsypance z cech podzielności. Nie podawaj liczby poprawnych pól przed sprawdzeniem.",
      discussionPrompts: ["Dlaczego 180° nie jest kątem rozwartym?", "Czym różni się 216° od 136°?"],
      print: {
        worksheetTitle: "Rozsypanka miar kątów",
        instructions: "Zaznacz odpowiednimi kolorami wszystkie miary należące do wskazanych rodzajów kątów.",
        items: [
          { id: "measure-scatter-a", expression: "136°, 0°, 225°, 72°, 360°, 91°, 180°, 35°, 283°, 90°, 16°, 157°", prompt: "Oznacz osobno kąty zerowy, prosty, półpełny i pełny." },
          { id: "measure-scatter-b", expression: "216°, 88°, 117°, 43°, 321°, 99°, 58°, 172°, 1°, 179°, 181°, 359°, 64°", prompt: "Zaznacz kąty ostre, rozwarte i wklęsłe zgodnie z legendą." },
        ],
      },
    },
    {
      suffix: "s5b",
      kind: "discuss",
      title: "Pokoloruj kąty według rodzaju",
      minutes: 4,
      headline: "Znajdź w rozsypance wszystkie rysunki wskazanego rodzaju",
      body: "Dwadzieścia rysunków kątów jest rozsypanych w przypadkowej kolejności. W każdej rundzie uczeń zaznacza wszystkie kąty jednego rodzaju, a ich wnętrza otrzymują kolor dopiero po poprawnym sprawdzeniu pełnego zestawu.",
      modelId: "geometry-lab",
      modelSeed: 421601,
      studentInstruction: "Przejrzyj całą rozsypankę, zaznacz wszystkie rysunki wskazanego rodzaju i kliknij „Sprawdź i pokoloruj”.",
      teacherInstruction: "Kolor jest skutkiem poprawnej klasyfikacji, nie jedyną informacją — pod każdym rozwiązaniem pozostaje również nazwa kąta.",
      print: {
        worksheetTitle: "Pokoloruj kąty według rodzaju",
        instructions: "Ustal legendę kolorów, nazwij każdy kąt i pokoloruj jego wnętrze.",
        items: [
          { id: "color-angles-a", skillIds: ["M5-4.2-angle-types"], expression: "Rozsypane rysunki: 235°, 45°, 180°, 112°, 360°, 30°, 90°, 275°, 140°, 65°", prompt: "Zaznacz i pokoloruj każdy rodzaj zgodnie z legendą." },
          { id: "color-angles-b", skillIds: ["M5-4.2-angle-types"], expression: "Rozsypane rysunki: 210°, 155°, 15°, 320°, 95°, 80°, 250°, 125°, 0°, 179°", prompt: "Zaznacz i pokoloruj każdy rodzaj zgodnie z legendą." },
        ],
      },
    },
    {
      suffix: "s6",
      kind: "exit-ticket",
      title: "Wskaż kąty na figurze",
      minutes: 4,
      headline: "Wypisz kąty i określ ich rodzaj",
      body: "Na dużym trapezie ABCD zaznaczono kąty ∠ABC, ∠BCD i ∠BAD. Uczeń odczytuje nazwę po środkowej literze, a następnie rozpoznaje, czy kąt jest ostry, prosty czy rozwarty.",
      modelId: "geometry-lab",
      modelSeed: 421701,
      studentInstruction: "Uzupełnij trzy zdania: kąt ABC jest…, kąt BCD jest…, kąt BAD jest…. W każdym zapisie najpierw znajdź środkową literę.",
      teacherInstruction: "Wymagaj jednocześnie poprawnego odczytania wierzchołka i klasyfikacji po rozwartości kąta.",
      print: {
        worksheetTitle: "Kąty na figurach",
        instructions: "Odczytaj zaznaczone kąty z trapezu i uzupełnij ich rodzaje.",
        items: [
          { id: "figure-angle-abc", skillIds: ["M5-4.2-angle-types"], maxScore: 1, expression: "∠ABC", prompt: "Kąt ABC jest ____________________." },
          { id: "figure-angle-bcd", skillIds: ["M5-4.2-angle-types"], maxScore: 2, expression: "∠BCD", prompt: "Kąt BCD jest ____________________." },
          { id: "figure-angle-bad", skillIds: ["M5-4.2-angle-types"], maxScore: 2, expression: "∠BAD", prompt: "Kąt BAD jest ____________________." },
        ],
      },
    },
    {
      suffix: "s7",
      kind: "practice",
      title: "Kąty w układzie przecinających się prostych",
      minutes: 4,
      headline: "Znajdź po dwa kąty ostre, proste i rozwarte",
      body: "Na autorskim układzie pięciu przecinających się prostych rozmieszczono punkty A–I. Uczeń odszukuje sześć kątów zapisanych trzema literami i klasyfikuje po dwa jako ostre, proste i rozwarte.",
      modelId: "geometry-lab",
      modelSeed: 421901,
      studentInstruction: "Dla każdego zapisu znajdź najpierw środkową literę na rysunku, odczytaj oba ramiona i wybierz: ostry, prosty albo rozwarty.",
      teacherInstruction: "Nie wskazuj gotowego kąta na planszy. Przy błędzie poproś o odnalezienie wierzchołka i prześledzenie obu ramion.",
      print: {
        worksheetTitle: "Kąty w układzie prostych",
        instructions: "Na autorskim rysunku zaznacz różnymi kolorami i wypisz po dwa kąty każdego rodzaju.",
        items: [
          { id: "network-acute", skillIds: ["M5-4.2-angle-types"], maxScore: 1, expression: "∠CAG, ∠AGB", prompt: "Zaznacz dwa kąty ostre i zapisz ich nazwy." },
          { id: "network-right", skillIds: ["M5-4.2-angle-types"], maxScore: 1, expression: "∠DFE, ∠GFD", prompt: "Zaznacz dwa kąty proste i zapisz ich nazwy." },
          { id: "network-obtuse", skillIds: ["M5-4.2-angle-types"], maxScore: 1, expression: "∠BGF, ∠BCD", prompt: "Zaznacz dwa kąty rozwarte i zapisz ich nazwy." },
        ],
      },
    },
    {
      suffix: "s8",
      kind: "exit-ticket",
      title: "Narysuj kąt z rozsypanych punktów",
      minutes: 4,
      headline: "Znajdź środkową literę i narysuj oba ramiona kąta",
      body: "Na planszy są rozsypane punkty. Uczeń najpierw wskazuje środkową literę nazwy jako wierzchołek, a następnie dwa pozostałe punkty. Model zachowuje pierwsze ramię i dorysowuje drugie.",
      modelId: "geometry-lab",
      modelSeed: 421801,
      studentInstruction: "Rozwiąż trzy zadania: ∠ABC, ∠DEF i ∠KLM. W każdym najpierw wskaż wierzchołek, potem oba punkty na ramionach.",
      teacherInstruction: "Nie wskazuj gotowych punktów. W razie błędu przypomnij jedynie, że wierzchołek jest środkową literą zapisu kąta.",
      print: {
        worksheetTitle: "Rysowanie kątów z rozsypanych punktów",
        instructions: "W każdym zadaniu zaznacz środkową literę jako wierzchołek, a następnie poprowadź z niej dwa ramiona przez właściwe punkty.",
        items: [
          { id: "point-cloud-abc", skillIds: ["M5-4.2-angle-types"], maxScore: 1, expression: "Rozsypane punkty A, B, C, D, E, F", prompt: "Narysuj ∠ABC i podpisz ramiona BA oraz BC." },
          { id: "point-cloud-def", skillIds: ["M5-4.2-angle-types"], maxScore: 2, expression: "Rozsypane punkty D, E, F, G, H, I", prompt: "Narysuj ∠DEF i zaznacz jego wierzchołek." },
          { id: "point-cloud-klm", skillIds: ["M5-4.2-angle-types"], maxScore: 2, expression: "Rozsypane punkty K, L, M, N, P, R", prompt: "Narysuj ∠KLM i zapisz nazwy obu ramion." },
        ],
      },
    },
  ],
});

export const m543KatomierzEkranowyV1 = s4({
  id: "m5-4-3-katomierz-ekranowy-v1",
  topicId: "M5-4.3",
  title: "Mierzenie i rysowanie kątów",
  coreLesson: "Pomiar kąta kątomierzem",
  paperEvidence: "Karta L1 z dziesięcioma kątami w różnych orientacjach i samodzielnym pomiarem",
  studentGoal: "Nauczę się prawidłowo ustawiać kątomierz, wybierać właściwe zero i mierzyć kąty z dokładnością do 1°.",
  successCriteria: [
    "Potrafię ustawić środek kątomierza na wierzchołku i linię 0°–180° na ramieniu bazowym.",
    "Potrafię wybrać skalę zaczynającą się od zera na ramieniu bazowym.",
    "Potrafię zmierzyć kąt mniejszy niż 180° z dokładnością do 1°.",
  ],
  learningGoals: [
    {
      id: "m5-4-3-l1-goal-1",
      studentGoal: "Nauczę się prawidłowo ustawiać kątomierz.",
      successCriteria: ["Potrafię niezależnie ustawić środek na wierzchołku i linię bazową na ramieniu kąta."],
      curriculumReferences: [
        "VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
      ],
    },
    {
      id: "m5-4-3-l1-goal-2",
      studentGoal: "Nauczę się mierzyć kąty z dokładnością do 1°.",
      successCriteria: ["Potrafię odczytać miarę kąta mniejszego niż 180° z dokładnością do 1°."],
      curriculumReferences: ["VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°."],
    },
    {
      id: "m5-4-3-l1-goal-3",
      studentGoal: "Nauczę się wybierać właściwe zero i skalę kątomierza.",
      successCriteria: ["Potrafię rozpocząć od zera na ramieniu bazowym i czytać tę samą skalę aż do drugiego ramienia."],
      curriculumReferences: [
        "VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-4.2-angle-types"],
  skillIds: ["M5-4.3-measure-angles"],
  estimatedMinutes: 45,
  overview: "L1 — dziesięć samodzielnych pomiarów kąta wirtualnym kątomierzem. Każde zadanie wymaga ustawienia środka, prostej krawędzi i odczytania właściwej skali.",
  openingScript: "„Najpierw ustawiamy narzędzie: środek na wierzchołku i linię 0°–180° na ramieniu bazowym. Dopiero oba warunki otwierają odczyt.”",
  closingScript: "„Zacznij od zera na ramieniu bazowym, czytaj jedną skalę i zapisz wynik z dokładnością do 1°.”",
  commonMisconceptions: [
    "Rozpoczynanie odczytu mimo przesunięcia środka kątomierza poza wierzchołek.",
    "Ustawienie środka poprawnie, ale pozostawienie linii 0°–180° poza ramieniem bazowym.",
    "Rozpoczynanie od zera po przeciwnej stronie i odczytywanie skali dopełniającej do 180°.",
    "Zmiana skali w połowie odczytu albo sugerowanie się orientacją kąta na ekranie.",
  ],
  stages: [
    {
      suffix: "s2",
      kind: "explore",
      title: "Mierzenie kąta",
      minutes: 35,
      headline: "Zmierz 10 kątów za pomocą wirtualnego kątomierza.",
      body: "Rozwiązuj kolejno 10 różnych zadań. Za każdym razem samodzielnie ustaw kątomierz, odczytaj miarę kąta i wpisz ją w puste kratki.",
      modelId: "geometry-lab",
      modelSeed: 430101,
      studentInstruction: "Rozwiąż 10 zadań po kolei. W każdym przesuń środek kątomierza na B, ustaw prostą krawędź na ramieniu BA, odczytaj miarę i wpisz ją za pomocą klawiatury liczbowej.",
      teacherInstruction: "Uczeń sam ustawia wirtualny kątomierz w każdym zadaniu i zatwierdza odpowiedź dopiero po uzupełnieniu wszystkich kratek.",
      discussionPrompts: ["Od którego zera należy rozpocząć odczyt?"],
      print: {
        worksheetTitle: "Mierzenie kąta",
        instructions: "Ustaw kątomierz kolejno na 10 kątach ABC, zmierz każdy kąt i wpisz jego miarę.",
        items: [
          { id: "setup-angle-measurement-1", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 1", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-2", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 2", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-3", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 3", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-4", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 4", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-5", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 5", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-6", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 6", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-7", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 7", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-8", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 8", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-9", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 9", prompt: "Miara kąta: ______ °." },
          { id: "setup-angle-measurement-10", skillIds: ["M5-4.3-measure-angles"], expression: "∠ABC — przykład 10", prompt: "Miara kąta: ______ °." },
        ],
      },
    },
  ],
});

export const m543RysowanieKatowL2V1 = s4({
  id: "m5-4-3-rysowanie-katow-l2-v1",
  topicId: "M5-4.3",
  lessonNumber: 2,
  title: "Mierzenie i rysowanie kątów",
  coreLesson: "Rysowanie kąta od promienia bazowego do kontroli miary",
  paperEvidence: "Karta L2 z trzema samodzielnymi konstrukcjami kątów i kontrolą do 1°",
  studentGoal: "Nauczę się rysować kąty o podanej mierze w kolejności: promień bazowy, znacznik miary, drugie ramię, a potem kontrolować konstrukcję z dokładnością do 1°.",
  successCriteria: [
    "Potrafię zachować kolejność: promień bazowy → znacznik miary → drugie ramię.",
    "Potrafię użyć właściwego zera i skali kątomierza do zaznaczenia podanej miary.",
    "Potrafię sprawdzić gotową konstrukcję pomiarem i zaakceptować różnicę do 1°.",
  ],
  learningGoals: [
    {
      id: "m5-4-3-l2-goal-1",
      studentGoal: "Nauczę się rysować kąt według uporządkowanej procedury konstrukcyjnej.",
      successCriteria: ["Potrafię narysować promień bazowy, zaznaczyć miarę i poprowadzić drugie ramię w tej kolejności."],
      curriculumReferences: [
        "VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
        "VIII.3 — rysuje kąty mniejsze od 180°.",
      ],
    },
    {
      id: "m5-4-3-l2-goal-2",
      studentGoal: "Nauczę się odkładać podaną miarę na właściwej skali kątomierza.",
      successCriteria: ["Potrafię zacząć od zera na promieniu bazowym i umieścić znacznik przy podanej liczbie stopni."],
      curriculumReferences: [
        "VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
        "VIII.3 — rysuje kąty mniejsze od 180°.",
      ],
    },
    {
      id: "m5-4-3-l2-goal-3",
      studentGoal: "Nauczę się sprawdzać konstrukcję niezależnym pomiarem.",
      successCriteria: ["Potrafię porównać anonimowy pomiar z miarą konstrukcji i uznać różnicę najwyżej 1°."],
      curriculumReferences: [
        "VIII.2 — mierzy z dokładnością do 1° kąty mniejsze niż 180°.",
        "VIII.3 — rysuje kąty mniejsze od 180°.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-4.3-measure-angles"],
  skillIds: ["M5-4.3-draw-angles"],
  estimatedMinutes: 45,
  overview: "L2 — wizualny pokaz rysowania kąta: uporządkowana konstrukcja 65°, inne miary i orientacje oraz kontrola wyniku. Na tablecie uczeń wybiera kroki; rysunek odręczny pozostaje w wersji papierowej.",
  openingScript: "„Dzisiaj nie odczytujemy gotowego kąta. Budujemy go: najpierw promień bazowy, potem znacznik miary, na końcu drugie ramię.”",
  closingScript: "„Gotowy kąt sprawdzamy niezależnym pomiarem. Różnica do 1° mieści się w dokładności naszej konstrukcji.”",
  commonMisconceptions: [
    "Rysowanie drugiego ramienia przed zaznaczeniem miary.",
    "Ustawienie środka kątomierza obok początku promienia bazowego.",
    "Odkładanie miary od zera po przeciwnej stronie i wybór skali dopełniającej do 180°.",
    "Prowadzenie drugiego ramienia obok znacznika zamiast od wierzchołka przez znacznik.",
    "Zapisywanie danych partnera przy kontroli, mimo że wystarcza anonimowa miara i różnica.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "warmup",
      title: "Plan konstrukcji",
      minutes: 3,
      headline: "Ułóż trzy kroki: promień bazowy → znacznik miary → drugie ramię.",
      body: "Każdy następny krok zależy od poprzedniego. Diagnostyka nie przepuszcza znacznika przed promieniem ani drugiego ramienia przed znacznikiem.",
      studentInstruction: "Ułóż kroki w poprawnej kolejności i wyjaśnij, dlaczego drugiego ramienia nie można narysować jako pierwszego.",
      teacherInstruction: "Ustal język B–A–M–C: B to wierzchołek, BA to promień bazowy, M to znacznik miary, BC to drugie ramię. Nie wykonuj konstrukcji za ucznia.",
      print: {
        worksheetTitle: "Mierzenie i rysowanie kątów — L2 rysowanie",
        instructions: "Ponumeruj kroki konstrukcji od 1 do 3.",
        items: [{ id: "drawing-order", skillIds: ["M5-4.3-draw-angles"], expression: "drugie ramię · znacznik miary · promień bazowy", prompt: "Wpisz kolejność i krótko uzasadnij." }],
      },
    },
    {
      suffix: "s2",
      kind: "explore",
      title: "Jak powstaje kąt 65°?",
      minutes: 8,
      headline: "Zbuduj 65°: BA, potem znacznik 65°, na końcu BC.",
      body: "Ekranowy kątomierz pokazuje kolejno położenie, miarę i skalę. Na tablecie wybierasz i zatwierdzasz kroki; nie rysujesz kąta palcem.",
      modelId: "geometry-lab",
      modelSeed: 431101,
      studentInstruction: "Uruchom kolejno: promień BA, ustawienie środka i bazy, wybór zera, znacznik 65° oraz ramię BC. Obserwuj każdy etap zamiast rysować palcem.",
      teacherInstruction: "Wymagaj dokładnie BA → M → BC. Kody kolejności odróżniaj od błędów miary i skali. Obsłuż dotyk lub klawiaturę 1/5 px i 1/5°.",
      print: {
        worksheetTitle: "Narysuj 65° — konstrukcja krok po kroku",
        instructions: "Użyj kątomierza i linijki. Podpisz B, A, M i C.",
        items: [{ id: "draw-65", skillIds: ["M5-4.3-draw-angles"], expression: "∠ABC = 65°", prompt: "Narysuj BA, zaznacz M przy 65°, poprowadź BC i zapisz kontrolny pomiar." }],
      },
    },
    {
      suffix: "s3",
      kind: "worked-example",
      title: "Promień → znacznik → ramię",
      minutes: 6,
      headline: "Nazwij, co sprawdzasz po każdym kroku konstrukcji.",
      body: "Po BA kontrolujesz orientację. Przy M kontrolujesz środek, bazę, zero, skalę i różnicę miary. Przy BC kontrolujesz, czy promień biegnie od B przez M.",
      modelId: "geometry-lab",
      modelSeed: 431102,
      studentInstruction: "Uruchom pokaz przykładu 65° w ukośnej orientacji. Po każdym zatwierdzeniu przeczytaj bieżącą różnicę i nazwij następny krok.",
      teacherInstruction: "Pokazuj zależność kroków, nie gotową odpowiedź. ANGLE_DRAW_BASE_REQUIRED i ANGLE_DRAW_MARK_REQUIRED mają cofać do pierwszego brakującego kroku.",
      print: {
        worksheetTitle: "Promień — znacznik — ramię",
        instructions: "Dopisz kontrolę właściwą dla każdego etapu.",
        items: [{ id: "drawing-checkpoints", skillIds: ["M5-4.3-draw-angles"], expression: "BA → M → BC", prompt: "Po BA sprawdzam ____. Przy M sprawdzam ____. Po BC sprawdzam ____." }],
      },
    },
    {
      suffix: "s4",
      kind: "practice",
      title: "Inne miary i orientacje",
      minutes: 7,
      headline: "Kąty 42°, 97° i 136° w trzech orientacjach",
      body: "Zmieniają się miara, strona zera i kierunek promienia bazowego. Procedura BA → M → BC oraz tolerancja 1° pozostają takie same.",
      modelId: "geometry-lab",
      modelSeed: 431201,
      studentInstruction: "Przejdź przez trzy przykłady. Za każdym razem wybierz skalę i poprawną kolejność etapów dla podanej orientacji.",
      teacherInstruction: "Nie obracaj modelu do prototypowego położenia. Użyj aktualnej diagnostyki orientacji, skali i miary.",
      print: {
        worksheetTitle: "Inne miary i orientacje",
        instructions: "Dla każdego zadania narysuj trzy kroki i wykonaj pomiar kontrolny.",
        items: [
          { id: "variant-support", skillIds: ["M5-4.3-draw-angles"], expression: "42° · BA ukośnie w prawo", prompt: "Ułóż kroki konstrukcji i zmierz kontrolnie: ____°." },
          { id: "variant-core", skillIds: ["M5-4.3-draw-angles"], expression: "97° · BA ukośnie w lewo", prompt: "Ułóż kroki i wskaż użyte zero: lewe / prawe." },
          { id: "variant-challenge", skillIds: ["M5-4.3-draw-angles"], expression: "136° · BA skierowane w dół", prompt: "Ułóż kroki, zapisz skalę i pomiar kontrolny." },
        ],
      },
    },
    {
      suffix: "s5",
      kind: "practice",
      title: "Kontrola koleżeńska",
      minutes: 7,
      headline: "Jedna osoba rysuje, druga anonimowo mierzy. System zapisuje tylko miarę i różnicę.",
      body: "Po zakończeniu konstrukcji partner wpisuje wyłącznie odczyt — bez imienia i nazwiska. Różnica do 1° przechodzi kontrolę.",
      modelId: "geometry-lab",
      modelSeed: 431301,
      studentInstruction: "Obejrzyj gotowy pokaz kąta i wykonaj niezależny pomiar kontrolny. Porównaj różnicę z granicą 1°.",
      teacherInstruction: "W Live pokazuj wyłącznie anonimową różnicę i liczbę kontroli w tolerancji. Nie wyświetlaj indywidualnych nazwisk ani punktów.",
      print: {
        worksheetTitle: "Anonimowa kontrola koleżeńska",
        instructions: "Autor rysuje, partner mierzy. Nie wpisuj nazwisk.",
        items: [
          { id: "peer-drawing", skillIds: ["M5-4.3-draw-angles"], expression: "Konstrukcja autora", prompt: "Miara zadana: ____°. Pomiar partnera: ____°. Różnica: ____°." },
          { id: "peer-decision", skillIds: ["M5-4.3-draw-angles"], expression: "Granica akceptacji ≤ 1°", prompt: "Kontrola: przyjęta / do poprawy. Pierwszy krok poprawy: ____." },
        ],
      },
    },
    {
      suffix: "s6",
      kind: "exit-ticket",
      title: "Samodzielne uporządkowanie konstrukcji",
      minutes: 4,
      headline: "Trzy samodzielne wybory kroków: 48°, 112° i 137°",
      body: "Każdy poziom wymaga kolejności BA → M → BC, właściwej skali i kontroli do 1°. Wynik tej próby zasila końcową Ocenę umiejętności.",
      modelId: "geometry-lab",
      modelSeed: 431401,
      studentInstruction: "Wybierz przykład i ułóż etapy bez podpowiedzi. Zapisz kontrolny pomiar i różnicę.",
      teacherInstruction: "To prywatny dowód M5-4.3-draw-angles. Oceniaj konstrukcję i kontrolę, nie samoocenę. Rozwiązanie diagnostyczne udostępniaj dopiero po oddaniu.",
      print: {
        worksheetTitle: "Samodzielna konstrukcja — dowód umiejętności",
        instructions: "Pracuj samodzielnie. Zachowaj ślady promienia bazowego, znacznika i drugiego ramienia.",
        items: [
          { id: "independent-draw-support", skillIds: ["M5-4.3-draw-angles"], maxScore: 1, expression: "48°", prompt: "Wybierz kolejność kroków i wpisz pomiar kontrolny: ____°." },
          { id: "independent-draw-core", skillIds: ["M5-4.3-draw-angles"], maxScore: 2, expression: "112° · BA ukośnie", prompt: "Wybierz kroki, zaznacz użyte zero i wpisz różnicę: ____°." },
          { id: "independent-draw-challenge", skillIds: ["M5-4.3-draw-angles"], maxScore: 2, expression: "137° · nietypowa orientacja", prompt: "Ułóż kroki i uzasadnij, czy kontrola mieści się w 1°." },
        ],
      },
    },
  ],
});

export const m544SkrzyzowanieProstychV1 = s4({
  id: "m5-4-4-skrzyzowanie-prostych-v1",
  topicId: "M5-4.4",
  lessonNumber: 1,
  title: "Kąty przyległe i wierzchołkowe",
  coreLesson: "Skrzyżowanie prostych",
  paperEvidence: "Karta L1: rozpoznanie par, obliczenie miar oraz osobne uzasadnienie równości i sumy 180°",
  studentGoal: "Nauczę się stosować własności kątów przyległych i wierzchołkowych oraz obliczać ich miary.",
  successCriteria: [
    "Potrafię rozpoznać kąty przyległe i wierzchołkowe.",
    "Potrafię obliczyć ich miary.",
  ],
  learningGoals: [
    {
      id: "m5-4-4-l1-goal-1",
      studentGoal: "Nauczę się rozpoznawać kąty przyległe i wierzchołkowe.",
      successCriteria: ["Potrafię wskazać kąty przyległe i wierzchołkowe na rysunku."],
      curriculumReferences: [
        "VIII.6 — rozpoznaje kąty wierzchołkowe i korzysta z równości ich miar.",
        "VIII.6 — rozpoznaje kąty przyległe i korzysta z sumy ich miar równej 180°.",
      ],
    },
    {
      id: "m5-4-4-l1-goal-2",
      studentGoal: "Nauczę się obliczać miary kątów przyległych i wierzchołkowych.",
      successCriteria: ["Potrafię wykorzystać równość kątów wierzchołkowych i sumę 180° kątów przyległych."],
      curriculumReferences: [
        "VIII.6 — stosuje własności kątów przyległych i wierzchołkowych.",
        "XI.1 — czyta ze zrozumieniem zadanie i wykonuje kolejne działania prowadzące do wyniku.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-4.3-measure-angles"],
  skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"],
  estimatedMinutes: 45,
  overview: "L1 — kąty przyległe i wierzchołkowe: rozpoznawanie par na czytelnych rysunkach oraz obliczanie ich miar.",
  openingScript: "„Przyjrzymy się kątom utworzonym przez przecinające się proste. Sprawdzimy, które są równe, a które mają razem 180°.”",
  closingScript: "„Kąty wierzchołkowe mają równe miary. Kąty przyległe mają wspólne ramię, a suma ich miar wynosi 180°.”",
  commonMisconceptions: [
    "Rozpoznawanie par po wyglądzie rysunku zamiast położeniu ramion.",
    "Nazywanie każdej sąsiedniej pary kątów przyległą bez sprawdzenia, czy pozostałe ramiona tworzą prostą.",
    "Uznawanie kątów wierzchołkowych za dopełniające się do 180° zamiast równych.",
    "Podawanie poprawnej liczby z niewłaściwą własnością albo poprawnej własności z błędem rachunkowym.",
    "Przy trzech prostych łączenie kątów, które nie leżą naprzeciwko siebie.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "explore",
      title: "Kąty przyległe i wierzchołkowe",
      minutes: 6,
      headline: "Kąt α ma 50°. Oblicz miary kątów γ i β.",
      body: "Kąty wierzchołkowe mają równe miary, ponieważ ramiona jednego są przedłużeniami ramion drugiego. Kąty przyległe mają wspólne ramię, a ich pozostałe ramiona tworzą prostą, dlatego suma ich miar wynosi 180°. Oblicz oba brakujące kąty.",
      modelId: "geometry-lab",
      modelSeed: 440101,
      studentInstruction: "Wpisz miarę kąta γ, a następnie miarę kąta β. Zatwierdź jeden raz na końcu.",
      teacherInstruction: "Najpierw wskaż położenie kąta γ i β. Uczeń sam wpisuje obie miary.",
      discussionPrompts: ["Który kąt jest wierzchołkowy do α?", "Który kąt jest przyległy do α?"],
      print: {
        worksheetTitle: "Kąty przyległe i wierzchołkowe — pierwsze zadanie",
        instructions: "Kąt α ma 50°. Oblicz miary kątów γ i β.",
        items: [
          { id: "crossing-simple", skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"], expression: "α = 50°", prompt: "γ = ____°. β = ____°." },
        ],
      },
    },
    {
      suffix: "s2",
      kind: "discuss",
      title: "Rozpoznaj pary kątów",
      minutes: 7,
      headline: "Wskaż dwa kąty wierzchołkowe albo dwa kąty przyległe.",
      body: "Na jednym czytelnym rysunku zaznacz dwa kąty, a następnie wybierz nazwę pary: kąty wierzchołkowe lub kąty przyległe.",
      modelId: "geometry-lab",
      modelSeed: 440201,
      studentInstruction: "Kliknij dwie litery greckie, wybierz nazwę pary i zatwierdź.",
      teacherInstruction: "Uczeń uzasadnia wybór położeniem ramion, nie kolorem ani wielkością pola.",
      discussionPrompts: ["Które kąty leżą naprzeciwko siebie?", "Które kąty mają wspólne ramię?"],
      print: {
        worksheetTitle: "Rozpoznaj pary kątów",
        instructions: "Wskaż jedną parę kątów wierzchołkowych i jedną parę kątów przyległych.",
        items: [
          { id: "pairs-vertical", skillIds: ["M5-4.4-angle-pairs-properties"], maxScore: 1, expression: "kąty α, β, γ, δ przy przecięciu prostych", prompt: "Wskaż i nazwij jedną parę wierzchołkową." },
          { id: "pairs-adjacent", skillIds: ["M5-4.4-angle-pairs-properties"], maxScore: 1, expression: "kąty α, β, γ, δ przy przecięciu prostych", prompt: "Wskaż i nazwij jedną parę przyległą." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "worked-example",
      title: "Obliczamy brakujące kąty",
      minutes: 7,
      headline: "Z jednej podanej miary oblicz trzy pozostałe kąty.",
      body: "Najpierw wykorzystaj równość kątów wierzchołkowych. Następnie oblicz miarę kąta przyległego: 180° minus podana miara.",
      modelId: "geometry-lab",
      modelSeed: 440301,
      studentInstruction: "Wpisz miary trzech brakujących kątów i zatwierdź dopiero po uzupełnieniu całości.",
      teacherInstruction: "Uczeń zapisuje równość kątów wierzchołkowych oraz działanie 180° − dana miara.",
      print: {
        worksheetTitle: "Obliczamy brakujące kąty",
        instructions: "Oblicz trzy brakujące miary. Zapisz jedno odejmowanie od 180°.",
        items: [
          { id: "one-angle-equality", skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"], expression: "α = 35°; γ = ____°", prompt: "Uzupełnij miarę i nazwij własność." },
          { id: "one-angle-sum", skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"], expression: "α = 35°; β = ____°", prompt: "Zapisz 180° − 35° i nazwij własność." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "explore",
      title: "Kąty utworzone przez trzy proste",
      minutes: 6,
      headline: "Wskaż kąty, które mają takie same miary.",
      body: "Trzy proste przecinające się w jednym punkcie tworzą sześć kątów. Kąty leżące dokładnie naprzeciwko siebie mają równe miary.",
      modelId: "geometry-lab",
      modelSeed: 440401,
      studentInstruction: "Połącz w pary kąty o równych miarach. Nie nazywaj dodatkowych rodzajów par.",
      teacherInstruction: "Na tym slajdzie używaj wyłącznie informacji: kąty leżące naprzeciwko siebie mają równe miary.",
      discussionPrompts: ["Który kąt leży dokładnie naprzeciwko kąta α?", "Ile par równych kątów widzisz?"],
      print: {
        worksheetTitle: "Kąty utworzone przez trzy proste",
        instructions: "Połącz w pary kąty, które mają takie same miary.",
        items: [{ id: "three-lines-pair", skillIds: ["M5-4.4-angle-pairs-properties"], maxScore: 3, expression: "sześć kątów α–ζ przy jednym punkcie", prompt: "Uzupełnij trzy równości: α = ____, β = ____, γ = ____." }],
      },
    },
    {
      suffix: "s5",
      kind: "practice",
      title: "Oblicz miary kątów",
      minutes: 9,
      headline: "Rozwiąż serię zadań z różnymi układami prostych.",
      body: "Każde zadanie pokazuje inny rysunek. Uczeń sam rozpoznaje kąty wierzchołkowe, kąty przyległe albo kąty tworzące razem 180° i wpisuje brakujące miary.",
      modelId: "geometry-lab",
      modelSeed: 440501,
      studentInstruction: "Wpisz wszystkie brakujące miary na aktualnym rysunku i zatwierdź. Po poprawnej odpowiedzi pojawi się następne zadanie.",
      teacherInstruction: "Nie podpowiadaj własności przed próbą ucznia. Wskazówka pojawia się dopiero po błędnej odpowiedzi.",
      print: {
        worksheetTitle: "Oblicz miary kątów",
        instructions: "Oblicz oznaczone kąty. Przy każdym rysunku zapisz potrzebne działanie.",
        items: [
          { id: "angle-task-1", skillIds: ["M5-4.4-angle-calculations"], maxScore: 1, expression: "kąty przyległe: 134° i α", prompt: "α = ____°." },
          { id: "angle-task-2", skillIds: ["M5-4.4-angle-calculations"], maxScore: 1, expression: "kąty wierzchołkowe: 127° i α", prompt: "α = ____°." },
          { id: "angle-task-3", skillIds: ["M5-4.4-angle-calculations"], maxScore: 2, expression: "przecięcie prostych; jeden kąt ma 143°", prompt: "α = ____°, β = ____°." },
          { id: "angle-task-4", skillIds: ["M5-4.4-angle-calculations"], maxScore: 1, expression: "kąt prosty podzielono na 40° i α", prompt: "α = ____°." },
          { id: "angle-task-5", skillIds: ["M5-4.4-angle-calculations"], maxScore: 1, expression: "na prostej leżą kąty 35°, 75° i α", prompt: "α = ____°." },
          { id: "angle-task-6", skillIds: ["M5-4.4-angle-calculations"], maxScore: 2, expression: "trzy proste; dane kąty 48° i 90°", prompt: "β = ____°, γ = ____°." },
          { id: "angle-task-7", skillIds: ["M5-4.4-angle-calculations"], maxScore: 2, expression: "przecięcie prostych; jeden kąt ma 65°", prompt: "α = ____°, β = ____°." },
          { id: "angle-task-8", skillIds: ["M5-4.4-angle-calculations"], maxScore: 2, expression: "trzy proste; dane kąty 45° i 75°", prompt: "α = ____°, δ = ____°." },
        ],
      },
    },
  ],
});

const m545BudowniczyWielokatowLegacy = s4({
  id: "m5-4-5-budowniczy-wielokatow-v1",
  topicId: "M5-4.5",
  lessonNumber: 1,
  title: "Wielokąty",
  coreLesson: "Budowniczy wielokątów",
  paperEvidence: "Karta L1: siatka 3–8 boków, przykłady i kontrprzykłady, oznaczenia A–H, przekątna oraz zadanie z obwodem",
  studentGoal: "Nauczę się rozpoznawać i budować wielokąty, nazywać ich elementy oraz tworzyć przykłady i kontrprzykłady niezależnie od nietypowego położenia figury.",
  successCriteria: [
    "Potrafię rozpoznać wielokąt po domknięciu, prostych bokach i braku samoprzecięcia.",
    "Potrafię wskazać wierzchołki, boki i przekątną wielokąta.",
    "Potrafię nazwać wielokąt według liczby boków od 3 do 8.",
    "Potrafię obliczyć obwód jako sumę aktualnych długości boków w zadaniu z obwodem.",
    "Potrafię zbudować przykład i kontrprzykład wielokąta na siatce.",
  ],
  learningGoals: [
    {
      id: "m5-4-5-goal-1",
      studentGoal: "Nauczę się rozpoznawać wielokąty.",
      successCriteria: ["Potrafię rozpoznać wielokąt po domknięciu, prostych bokach i braku samoprzecięcia."],
      curriculumReferences: ["IX.1–5 (przygotowanie pojęciowe) — przygotowuje pojęcia potrzebne do rozpoznawania i nazywania trójkątów oraz czworokątów i korzystania z ich własności."],
    },
    {
      id: "m5-4-5-goal-2",
      studentGoal: "Nauczę się wskazywać wierzchołki, boki i przekątne wielokąta.",
      successCriteria: ["Potrafię wskazać wierzchołki, boki i przekątną wielokąta."],
      curriculumReferences: ["IX.1–5 (przygotowanie pojęciowe) — przygotowuje pojęcia potrzebne do rozpoznawania i nazywania trójkątów oraz czworokątów i korzystania z ich własności."],
    },
    {
      id: "m5-4-5-goal-3",
      studentGoal: "Nauczę się nazywać wielokąt według liczby boków.",
      successCriteria: ["Potrafię nazwać wielokąt według liczby boków od 3 do 8."],
      curriculumReferences: [
        "IX.1–5 (przygotowanie pojęciowe) — przygotowuje pojęcia potrzebne do rozpoznawania i nazywania trójkątów oraz czworokątów i korzystania z ich własności.",
        "XI.2 (tylko gdy występuje obwód) — oblicza obwód wielokąta o danych długościach boków; wymaganie stosuje się tylko w zadaniu z obwodem.",
      ],
    },
    {
      id: "m5-4-5-goal-4",
      studentGoal: "Nauczę się tworzyć przykład i kontrprzykład wielokąta.",
      successCriteria: ["Potrafię zbudować przykład i kontrprzykład wielokąta na siatce."],
      curriculumReferences: ["IX.1–5 (przygotowanie pojęciowe) — przygotowuje pojęcia potrzebne do rozpoznawania i nazywania trójkątów oraz czworokątów i korzystania z ich własności."],
    },
  ],
  prerequisiteSkillIds: ["M5-4.4-angle-pairs-properties"],
  skillIds: [
    "M5-4.5-polygon-recognition",
    "M5-4.5-polygon-elements",
    "M5-4.5-polygon-construction",
    "M5-4.5-polygon-perimeter",
    "M5-4.5-polygons",
  ],
  estimatedMinutes: 45,
  overview: "L1 — pojęcie wielokąta budowane przez przykłady i kontrprzykłady. Uczeń ustawia 3–8 wierzchołków, jawnie domyka figurę przez A, obserwuje liczbę boków, wierzchołków i obwód oraz diagnozuje konkretną krawędź albo wierzchołek.",
  openingScript: "„Wielokąt nie musi wyglądać regularnie ani stać prosto. Sprawdzimy trzy warunki i zbudujemy własne przykłady.”",
  closingScript: "„Najpierw domknięcie i proste boki bez skrzyżowania, potem liczba boków, nazwa, elementy i — tylko w zadaniu z obwodem — suma długości.”",
  commonMisconceptions: [
    "Uznawanie każdej zamkniętej figury, także z łukiem, za wielokąt.",
    "Uznawanie samoprzecinającej się kokardy za wielokąt tylko dlatego, że wraca do punktu A.",
    "Liczenie ukośnego albo wklęsłego przykładu jako innego rodzaju figury mimo niezmiennej liczby boków.",
    "Mylenie boku z przekątną i prowadzenie przekątnej do sąsiedniego wierzchołka.",
    "Formalne ocenianie wypukłości, chociaż w tej lekcji wklęsły kształt jest wyłącznie nietypowym poprawnym przykładem, a nie osobnym wymaganiem.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "explore",
      title: "Budowniczy wielokątów",
      minutes: 7,
      headline: "Dodawaj od 3 do 8 wierzchołków na siatce; figura domyka się dopiero po wybraniu pierwszego punktu A.",
      body: "Każdy nowy punkt tworzy kolejny odcinek, lecz ostatni bok nie pojawia się automatycznie. Uczeń wybiera A, aby świadomie domknąć brzeg. Monitor natychmiast pokazuje liczbę wierzchołków, narysowanych odcinków albo boków i — dla poprawnej figury — obwód.",
      modelId: "geometry-lab",
      modelSeed: 450102,
      studentInstruction: "Zbuduj kolejno trójkąt, pięciokąt i ośmiokąt. Przeciągaj punkty, używaj strzałek albo wpisuj współrzędne. Za każdym razem domknij figurę przez wybranie A.",
      teacherInstruction: "Na tablicy i tablecie nazywaj osobno narysowane odcinki oraz boki poprawnego wielokąta. Nie domykaj automatycznie. W Live pokazuj anonimowy stan warunków, nie answerSpec.",
      discussionPrompts: ["Co dokładnie zmieniło się po wybraniu A?", "Kiedy licznik odcinków staje się licznikiem boków?", "Dlaczego ukośne boki nadal są bokami?"],
      print: {
        worksheetTitle: "Budowniczy wielokątów — siatka 3–8",
        instructions: "Rysuj od punktu A. Ostatni bok dorysuj dopiero po świadomym powrocie do A.",
        items: [
          { id: "builder-triangle", skillIds: ["M5-4.5-polygon-construction", "M5-4.5-polygon-recognition"], expression: "3 wierzchołki na siatce", prompt: "Zbuduj i domknij trójkąt; wpisz liczbę boków." },
          { id: "builder-pentagon", skillIds: ["M5-4.5-polygon-construction"], expression: "5 wierzchołków w nietypowym ukośnym położeniu", prompt: "Zbuduj pięciokąt i zaznacz punkt, którego wybranie domknęło figurę." },
          { id: "builder-octagon", skillIds: ["M5-4.5-polygon-construction"], expression: "8 wierzchołków", prompt: "Zbuduj ośmiokąt bez skrzyżowania boków." },
        ],
      },
    },
    {
      suffix: "s2",
      kind: "discuss",
      title: "Czy to wielokąt?",
      minutes: 6,
      headline: "Otwarta linia, łuk, samoprzecięcie i poprawna figura wklęsła — wskaż konkretny spełniony albo naruszony warunek.",
      body: "Model pokazuje cztery karty: linię otwartą, figurę z łukiem, samoprzecinającą się kokardę oraz poprawny wklęsły wielokąt. Podświetlana jest konkretna krawędź lub para krawędzi, a tekst i wzór obrysu są równoważne kolorowi.",
      modelId: "geometry-lab",
      modelSeed: 450202,
      studentInstruction: "Przejdź wszystkie cztery karty. Wybierz: wielokąt / nie jest wielokątem, a potem wskaż domknięcie, odcinki albo samoprzecięcie jako uzasadnienie.",
      teacherInstruction: "Akceptuj wklęsły i ukośny poprawny przykład. Nie wprowadzaj ani nie oceniaj formalnej definicji wypukłości; słowo „wklęsły” pełni tu rolę opisu nietypowego przykładu.",
      discussionPrompts: ["Czy samo domknięcie wystarcza?", "Która krawędź nie jest odcinkiem?", "Gdzie spotykają się niesąsiednie boki?", "Dlaczego wklęsły przykład nadal przechodzi trzy warunki?"],
      print: {
        worksheetTitle: "Czy to wielokąt? — przykłady i kontrprzykłady",
        instructions: "Przy każdym rysunku wpisz TAK lub NIE i zaznacz dokładnie jeden decydujący warunek.",
        items: [
          { id: "validity-open", skillIds: ["M5-4.5-polygon-recognition"], expression: "Łamana A–B–C–D bez odcinka DA", prompt: "Czy to wielokąt? Uzasadnij przez domknięcie." },
          { id: "validity-curve", skillIds: ["M5-4.5-polygon-recognition"], expression: "Figura domknięta, jeden fragment brzegu jest łukiem", prompt: "Czy to wielokąt? Wskaż łuk." },
          { id: "validity-crossing", skillIds: ["M5-4.5-polygon-recognition"], expression: "Domknięta kokarda z odcinków", prompt: "Czy to wielokąt? Zaznacz dwa przecinające się boki." },
          { id: "validity-concave", skillIds: ["M5-4.5-polygon-recognition"], expression: "Ukośny, wklęsły pięciokąt bez skrzyżowań", prompt: "Czy to wielokąt? Sprawdź wszystkie trzy warunki." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "worked-example",
      title: "Nazwij elementy",
      minutes: 6,
      headline: "Etykiety A–H: wskaż wierzchołek, bok i jedną przekątną z wybranego wierzchołka.",
      body: "Punkt jest wierzchołkiem, odcinek między sąsiednimi punktami jest bokiem, a odcinek łączący dwa niesąsiednie wierzchołki jest przekątną. Uczeń wybiera początek i niesąsiedni koniec; model nie uznaje boku za przekątną.",
      modelId: "geometry-lab",
      modelSeed: 450302,
      studentInstruction: "Przejdź poziomy 4, 6 i 8 wierzchołków. W każdym wybierz dowolny wierzchołek, dowolny bok i jedną poprawną przekątną z wybranego punktu.",
      teacherInstruction: "Wymagaj nazwy elementu i oznaczenia literowego. Przy błędzie podświetl oba końce odcinka; nie ujawniaj listy odpowiedzi przed próbą.",
      discussionPrompts: ["Dlaczego bok wychodzący z A nie jest przekątną?", "Do których punktów z A nie wolno prowadzić przekątnej?", "Co zmienia się, gdy rośnie liczba wierzchołków?"],
      print: {
        worksheetTitle: "Nazwij elementy — A–H",
        instructions: "Wierzchołki otocz kółkiem, bok podkreśl linią ciągłą, a przekątną narysuj linią przerywaną.",
        items: [
          { id: "elements-vertex-edge", skillIds: ["M5-4.5-polygon-elements"], expression: "Sześciokąt ABCDEF", prompt: "Wskaż wierzchołek C i nazwij dwa spotykające się w nim boki." },
          { id: "elements-diagonal", skillIds: ["M5-4.5-polygon-elements"], expression: "Ośmiokąt ABCDEFGH; start C", prompt: "Narysuj jedną przekątną z C i wyjaśnij, dlaczego wybrany koniec nie jest sąsiadem C." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "explore",
      title: "Zmieniaj kształt",
      minutes: 6,
      headline: "Przeciąganie wierzchołków nie zmienia liczby boków, dopóki figura pozostaje poprawna.",
      body: "Uczeń obraca, wydłuża i wciska fragment figury do środka. Liczba wierzchołków i nazwa pozostają stałe; zmieniają się długości boków i obwód. Samoprzecięcie lub złączenie wierzchołków zatrzymuje klasyfikację i wskazuje dokładne elementy błędu.",
      modelId: "geometry-lab",
      modelSeed: 450402,
      studentInstruction: "Utwórz trzy różne pięciokąty: szeroki, ukośny i wklęsły. Zapisz, co pozostało stałe, a co zmieniło się w monitorze.",
      teacherInstruction: "Eksperymentowanie ma prowadzić do niezmiennika liczby boków, nie do formalnego kryterium wypukłości. Zatrzymaj model na samoprzecięciu, aby omówić wskazane krawędzie.",
      discussionPrompts: ["Co pozostaje stałe podczas ruchu?", "Dlaczego zmiana obwodu nie zmienia nazwy?", "Jaka zmiana sprawia, że monitor wstrzymuje nazwę?"],
      print: {
        worksheetTitle: "Zmieniaj kształt — niezmienniki",
        instructions: "Narysuj figurę przed i po przesunięciu jednego wierzchołka. Nie dodawaj ani nie usuwaj punktów.",
        items: [
          { id: "reshape-invariant", skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-construction"], expression: "Pięciokąt przed i po przesunięciu", prompt: "Wpisz liczbę wierzchołków i boków w obu stanach; zaznacz, co się nie zmieniło." },
          { id: "reshape-counterexample", skillIds: ["M5-4.5-polygon-recognition"], expression: "Dwa niesąsiednie boki po ruchu przecinają się", prompt: "Zaznacz te boki i wyjaśnij, dlaczego klasyfikacja została wstrzymana." },
        ],
      },
    },
    {
      suffix: "s5",
      kind: "practice",
      title: "Witraż bez prostokątów",
      minutes: 5,
      headline: "Zbuduj pięciokąt i sześciokąt na ilustracyjnym tle bez korzystania z prostokątnego prototypu.",
      body: "Witraż zachęca do figur ukośnych i wklęsłych. Cel dotyczy liczby boków, poprawnego domknięcia i braku samoprzecięć; model nie przyznaje punktów za regularność ani wypukłość.",
      modelId: "geometry-lab",
      modelSeed: 450502,
      studentInstruction: "Zbuduj kolejno pięciokąt i sześciokąt. W trzecim przykładzie utwórz nietypowy wklęsły sześciokąt bez skrzyżowania.",
      teacherInstruction: "Na tablicy zbieraj różne poprawne rozwiązania bez nazwisk. Zachowaj różnorodność położeń; nie oceniaj regularności ani formalnej wypukłości.",
      print: {
        worksheetTitle: "Witraż bez prostokątów",
        instructions: "Wypełnij dwa pola witraża. Linie siatki są pomocą, ale figura nie musi mieć osi ani równych boków.",
        items: [
          { id: "glass-pentagon", skillIds: ["M5-4.5-polygon-construction"], maxScore: 1, expression: "Pole witraża 8 × 8 kratek", prompt: "Zbuduj ukośny pięciokąt i oznacz A–E." },
          { id: "glass-hexagon", skillIds: ["M5-4.5-polygon-construction", "M5-4.5-polygon-recognition"], maxScore: 2, expression: "Pole witraża 10 × 8 kratek", prompt: "Zbuduj sześciokąt bez samoprzecięcia; może być wklęsły." },
        ],
      },
    },
    {
      suffix: "s6",
      kind: "exit-ticket",
      title: "Samodzielne zadania",
      minutes: 5,
      headline: "Samodzielny dowód: rozpoznanie, elementy, konstrukcja i — w Wyzwaniu — obwód.",
      body: "Pierwszy przykład wymaga domkniętego czworokąta i nazwy. Drugi dodaje pięciokąt oraz przekątną. Trzeci wymaga nietypowego ośmiokąta, przekątnej i obwodu do 0,1 jednostki.",
      modelId: "geometry-lab",
      modelSeed: 450602,
      studentInstruction: "Wybierz poziom i pracuj bez podpowiedzi. Domknij przez A, nazwij figurę, a na wyższych poziomach wskaż przekątną i odczytaj obwód.",
      teacherInstruction: "To prywatny dowód umiejętności. Nie ujawniaj answerSpec ani rozwiązania przed oddaniem. Na tablicy pokazuj tylko anonimowy rozkład wyników i stanów samooceny.",
      print: {
        worksheetTitle: "Wielokąty — samodzielny dowód umiejętności",
        instructions: "Pracuj samodzielnie. Każdy poziom ma osobne kryteria; w Wyzwaniu XI.2 dotyczy wyłącznie zadania z obwodem.",
        items: [
          { id: "independent-polygon-support", skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-construction"], maxScore: 1, expression: "4 wierzchołki", prompt: "Zbuduj, domknij i nazwij czworokąt." },
          { id: "independent-polygon-core", skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-elements", "M5-4.5-polygon-construction"], maxScore: 2, expression: "5 wierzchołków", prompt: "Zbuduj i nazwij pięciokąt; narysuj jedną przekątną z A." },
          { id: "independent-polygon-challenge", skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-elements", "M5-4.5-polygon-construction", "M5-4.5-polygon-perimeter"], maxScore: 3, expression: "8 wierzchołków · nietypowy kształt", prompt: "Zbuduj ośmiokąt bez samoprzecięcia, zaznacz przekątną i oblicz obwód." },
        ],
      },
    },
  ],
});

export const m545BudowniczyWielokatowV1 = s4({
  id: "m5-4-5-budowniczy-wielokatow-v1",
  topicId: "M5-4.5",
  lessonNumber: 1,
  title: "Wielokąty",
  coreLesson: "Wielokąty — rozpoznawanie i elementy",
  paperEvidence: "Rysunki wielokątów, przekątna, rozpoznawanie figur, tabela elementów oraz dwa zadania z obwodu",
  studentGoal: "Nauczę się rozpoznawać wielokąty, wskazywać ich elementy i obliczać obwód.",
  successCriteria: [
    "Potrafię rozpoznać wielokąt wśród figur zamkniętych, otwartych i zawierających krzywe linie.",
    "Potrafię nazwać trójkąt, czworokąt, pięciokąt i sześciokąt według liczby boków.",
    "Potrafię wskazać boki, wierzchołki, kąty i przekątną wielokąta.",
    "Potrafię podać liczbę boków, wierzchołków i kątów narysowanego wielokąta.",
    "Potrafię obliczyć obwód wielokąta oraz wykorzystać równość boków leżących naprzeciwko w prostokącie.",
  ],
  learningGoals: [
    {
      id: "m5-4-5-goal-1",
      studentGoal: "Nauczę się rozpoznawać i nazywać wielokąty.",
      successCriteria: ["Potrafię rozpoznać wielokąt i nazwać go według liczby boków."],
      curriculumReferences: ["IX.1–5 (przygotowanie pojęciowe) — rozpoznaje i nazywa wielokąty oraz ich elementy."],
    },
    {
      id: "m5-4-5-goal-2",
      studentGoal: "Nauczę się wskazywać elementy wielokąta.",
      successCriteria: ["Potrafię wskazać boki, wierzchołki, kąty i przekątną wielokąta."],
      curriculumReferences: ["IX.1–5 (przygotowanie pojęciowe) — rozpoznaje i nazywa wielokąty oraz ich elementy."],
    },
    {
      id: "m5-4-5-goal-3",
      studentGoal: "Nauczę się obliczać obwód wielokąta.",
      successCriteria: ["Potrafię dodać długości wszystkich boków i uzupełnić brakujące boki prostokąta."],
      curriculumReferences: ["XI.2 — oblicza obwód wielokąta o danych długościach boków."],
    },
  ],
  prerequisiteSkillIds: ["M5-4.4-angle-pairs-properties"],
  skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-elements", "M5-4.5-polygons", "M5-4.5-polygon-perimeter"],
  estimatedMinutes: 45,
  overview: "Spójne wprowadzenie pojęcia wielokąta: elementy i nazwy figur, przekątna, rozpoznawanie oraz obliczanie obwodu.",
  openingScript: "„Policzymy boki, wierzchołki i kąty, a następnie rozpoznamy wielokąty wśród różnych figur.”",
  closingScript: "„W wielokącie liczba boków, wierzchołków i kątów jest taka sama. Obwód obliczamy, dodając długości wszystkich boków.”",
  commonMisconceptions: [
    "Uznawanie każdej zamkniętej figury z krzywym fragmentem za wielokąt.",
    "Mylenie przekątnej z bokiem łączącym sąsiednie wierzchołki.",
    "Oddzielne, niespójne liczenie boków, wierzchołków i kątów tej samej figury.",
    "Pomijanie niepodanych długości boków leżących naprzeciwko w prostokącie.",
  ],
  stages: [
    {
      suffix: "s1",
      kind: "explore",
      title: "Wielokąt — boki, wierzchołki i kąty",
      minutes: 7,
      headline: "W wielokącie liczba boków, wierzchołków i kątów jest taka sama",
      body: "Wielokąt z trzema wierzchołkami to trójkąt, z czterema — czworokąt, z pięcioma — pięciokąt, a z sześcioma — sześciokąt. Duże, podpisane rysunki pokazują każdy przykład osobno.",
      modelId: "geometry-lab",
      modelSeed: 450102,
      studentInstruction: "Obejrzyj figury i przy każdej porównaj liczbę boków, wierzchołków oraz kątów.",
      print: {
        worksheetTitle: "Nazwy wielokątów",
        instructions: "Połącz nazwę wielokąta z właściwym rysunkiem i liczbą jego elementów.",
        items: [
          { id: "polygon-names", skillIds: ["M5-4.5-polygon-recognition"], expression: "trójkąt, czworokąt, pięciokąt, sześciokąt", prompt: "Dopisz przy każdej figurze liczbę boków, wierzchołków i kątów." },
        ],
      },
    },
    {
      suffix: "s2",
      kind: "worked-example",
      title: "Przekątna wielokąta",
      minutes: 6,
      headline: "Przekątna łączy dwa niesąsiednie wierzchołki",
      body: "W pięciokącie ABCDE odcinek AC jest przekątną. Odcinki AB i AE są bokami, ponieważ ich końce są sąsiednimi wierzchołkami.",
      modelId: "geometry-lab",
      modelSeed: 450302,
      studentInstruction: "Odczytaj oznaczenia wierzchołków i wskaż końce czerwonej, przerywanej przekątnej.",
      print: {
        worksheetTitle: "Przekątna wielokąta",
        instructions: "Narysuj przekątną linią przerywaną i podpisz oba jej końce.",
        items: [
          { id: "polygon-diagonal", skillIds: ["M5-4.5-polygon-elements"], expression: "pięciokąt ABCDE", prompt: "Narysuj przekątną AC i wyjaśnij, dlaczego AB nie jest przekątną." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "practice",
      title: "Które figury są wielokątami?",
      minutes: 7,
      headline: "Rozpoznaj wielokąty wśród różnych figur",
      body: "Na jednym slajdzie pojawia się kolejno sześć figur: poprawne wielokąty, figura z łukiem, otwarta łamana i figura ze skrzyżowanymi odcinkami.",
      modelId: "geometry-lab",
      modelSeed: 450202,
      studentInstruction: "Przy każdej figurze wybierz TAK albo NIE. Po poprawnej odpowiedzi automatycznie pojawi się następna figura.",
      teacherInstruction: "Nie zmieniaj układu slajdu między zadaniami. Dopiero ostatnia poprawna odpowiedź kończy całą serię.",
      print: {
        worksheetTitle: "Które figury są wielokątami?",
        instructions: "Otocz pętlą wszystkie wielokąty. Przy pozostałych zaznacz krzywy fragment, brak domknięcia albo skrzyżowanie.",
        itemCount: 6,
        items: [
          { id: "recognition-series", skillIds: ["M5-4.5-polygon-recognition"], maxScore: 6, expression: "sześć różnych figur", prompt: "Zaznacz wyłącznie wielokąty." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "practice",
      title: "Policz elementy wielokąta",
      minutes: 7,
      headline: "Uzupełnij liczbę wierzchołków, boków i kątów",
      body: "Na jednym slajdzie pojawia się kolejno sześć różnych wielokątów. Uczeń przy każdym wpisuje do tabeli trzy liczby za pomocą wspólnego kalkulatora ekranowego.",
      modelId: "geometry-lab",
      modelSeed: 450402,
      studentInstruction: "Kliknij kratkę w tabeli, wpisz liczbę kalkulatorem i zatwierdź cały wiersz. Po poprawnej odpowiedzi pojawi się następna figura.",
      teacherInstruction: "Wszystkie trzy pola pozostają aktywne do jednego zatwierdzenia. Ostatnie zadanie stanowi dowód opanowania lekcji.",
      print: {
        worksheetTitle: "Elementy wielokątów",
        instructions: "Przy każdej figurze uzupełnij tabelę: wierzchołki, boki, kąty.",
        itemCount: 6,
        items: [
          { id: "count-polygon-elements", skillIds: ["M5-4.5-polygon-recognition", "M5-4.5-polygon-elements"], maxScore: 6, expression: "trójkąt, sześciokąt, czworokąt, siedmiokąt, pięciokąt, ośmiokąt", prompt: "Uzupełnij trzy liczby przy każdym wielokącie." },
        ],
      },
    },
    {
      suffix: "s5",
      kind: "exit-ticket",
      title: "Obwód wielokąta",
      minutes: 8,
      headline: "Dodaj długości wszystkich boków",
      body: "Najpierw uczeń oblicza obwód pięciokąta, którego wszystkie boki są opisane. W drugim zadaniu widzi prostokąt z dwiema długościami i sam uzupełnia równe boki leżące naprzeciwko przed obliczeniem obwodu.",
      modelId: "geometry-lab",
      modelSeed: 450602,
      studentInstruction: "Uzupełnij wszystkie puste kratki i zatwierdź całe rozwiązanie. Po pierwszym poprawnym wyniku automatycznie pojawi się drugie zadanie.",
      teacherInstruction: "W drugim zadaniu uczeń sam rozpoznaje równość przeciwległych boków prostokąta. Podpowiedź pojawia się dopiero po błędnej próbie.",
      print: {
        worksheetTitle: "Obwód wielokąta",
        instructions: "Oblicz obwody. W drugim zadaniu najpierw uzupełnij długości boków leżących naprzeciwko.",
        itemCount: 2,
        items: [
          { id: "perimeter-all-sides", skillIds: ["M5-4.5-polygon-perimeter"], maxScore: 1, expression: "pięciokąt: 7 cm, 5 cm, 6 cm, 4 cm, 8 cm", prompt: "Obwód = ____ cm." },
          { id: "perimeter-opposite-sides", skillIds: ["M5-4.5-polygon-perimeter"], maxScore: 3, expression: "prostokąt: górny bok 9 cm, lewy bok 5 cm", prompt: "Dolny bok = ____ cm, prawy bok = ____ cm, obwód = ____ cm." },
        ],
      },
    },
  ],
});

void m545BudowniczyWielokatowLegacy;

export const m546TrojkatnyPlacZabawV1 = s4({
  id: "m5-4-6-rodzaje-trojkatow-l1-v1",
  topicId: "M5-4.6",
  title: "Rodzaje trójkątów",
  coreLesson: "Trójkątny plac zabaw — poziom 1",
  paperEvidence: "Pięć rysunków trójkątów w różnych orientacjach z oznaczeniami równych boków.",
  studentGoal: "Uczeń klasyfikuje trójkąty według długości boków i uzasadnia nazwę oznaczeniami figury.",
  successCriteria: ["Potrafię rozpoznać trójkąt równoboczny, równoramienny i różnoboczny.", "Potrafię wskazać boki, które uzasadniają wybraną nazwę."],
  prerequisiteSkillIds: ["M5-4.5-polygon-recognition"],
  skillIds: ["M5-4.6-triangle-sides"],
  estimatedMinutes: 45,
  overview: "L1 — klasyfikacja według boków z dynamicznym rysunkiem, oznaczeniami i jawnym dowodem cechy.",
  commonMisconceptions: ["Rozpoznawanie tylko prototypowego położenia.", "Nazywanie każdego smukłego trójkąta równoramiennym bez porównania długości."],
  stages: triangleTypesStages({
    level: "l1",
    skillIds: ["M5-4.6-triangle-sides"],
    examples: [
      { expression: "|AB| = |AC| = 6 cm, |BC| = 6 cm", prompt: "Nazwij trójkąt według boków i zaznacz jednakowymi kreskami wszystkie równe boki." },
      { expression: "|AB| = 5 cm, |BC| = 5 cm, |CA| = 8 cm", prompt: "Nazwij trójkąt i wskaż ramiona równej długości." },
      { expression: "|AB| = 4 cm, |BC| = 6 cm, |CA| = 7 cm", prompt: "Nazwij trójkąt i zapisz, jaka cecha rozstrzyga klasyfikację." },
      { expression: "Trójkąt obrócony o 120° ma dwa boki oznaczone jedną kreską.", prompt: "Podaj nazwę bez obracania kartki i uzasadnij ją symbolami." },
      { expression: "Uczeń napisał: „To trójkąt równoramienny, bo wygląda symetrycznie”.", prompt: "Oceń uzasadnienie, popraw je i wskaż pomiar, którego brakuje." },
    ],
  }),
});

export const m546DwieKlasyfikacjeL2V1 = s4({
  id: "m5-4-6-rodzaje-trojkatow-l2-v1",
  topicId: "M5-4.6",
  lessonNumber: 2,
  title: "Rodzaje trójkątów",
  coreLesson: "Dwie klasyfikacje jednego trójkąta — poziom 2",
  paperEvidence: "Pięć figur z długościami i kątami, w tym para niemożliwa oraz zadanie z uzasadnieniem.",
  studentGoal: "Uczeń podaje niezależnie klasyfikację trójkąta według boków i według kątów oraz uzasadnia obie nazwy.",
  successCriteria: ["Potrafię podać dwie niezależne klasyfikacje tego samego trójkąta.", "Potrafię rozstrzygnąć, czy podana para nazw jest możliwa.", "Potrafię uzasadnić klasyfikację długościami i największym kątem."],
  prerequisiteSkillIds: ["M5-4.6-triangle-sides", "M5-4.2-angle-types"],
  skillIds: ["M5-4.6-triangle-sides", "M5-4.6-triangle-angles", "M5-4.6-classification-evidence"],
  estimatedMinutes: 45,
  overview: "L2 — dwie klasyfikacje naraz, największy kąt, pary możliwe i niemożliwe oraz dowód z aktualnych pomiarów.",
  commonMisconceptions: ["Łączenie nazw z dwóch różnych kryteriów w jedną kategorię.", "Uznawanie równobocznego trójkąta za prostokątny lub rozwartokątny."],
  stages: triangleTypesStages({
    level: "l2",
    skillIds: ["M5-4.6-triangle-sides", "M5-4.6-triangle-angles", "M5-4.6-classification-evidence"],
    examples: [
      { expression: "Boki 5 cm, 5 cm, 8 cm; największy kąt 106°", prompt: "Podaj dwie nazwy i połącz każdą z właściwą daną." },
      { expression: "Kąty 45°, 45°, 90°; |AB| = |BC|", prompt: "Sklasyfikuj trójkąt według boków i kątów." },
      { expression: "Wszystkie boki równe; uczeń wybrał „rozwartokątny”.", prompt: "Znajdź sprzeczność i zapisz jedyną możliwą klasyfikację według kątów." },
      { expression: "Różnoboczny i prostokątny", prompt: "Zbuduj przykład na siatce albo podaj powód niemożliwości." },
      { expression: "Dach namiotu ma ramiona po 3 m, podstawę 5 m i kąt przy wierzchołku 112°.", prompt: "Podaj obie klasyfikacje, uzasadnij je i wyjaśnij, która cecha nie zmieni się po obrocie rysunku." },
    ],
  }),
});

export const m547CzyOdcinkiSieZamknaL1V1 = s4({
  id: "m5-4-7-konstrukcja-trojkata-l1-v1",
  topicId: "M5-4.7",
  title: "Konstrukcja trójkąta o danych bokach",
  coreLesson: "Czy trzy odcinki się zamkną? — poziom 1",
  paperEvidence: "Decyzje Tak/Nie uzasadnione warunkiem trójkąta oraz opisana kolejność konstrukcji z zachowanymi łukami.",
  studentGoal: "Uczeń rozstrzyga, czy z trzech odcinków można zbudować trójkąt, i rozpoznaje kolejne etapy konstrukcji linijką i cyrklem.",
  successCriteria: ["Potrafię sprawdzić, czy suma dwóch krótszych boków jest większa od trzeciego.", "Potrafię zdecydować, czy trójkąt można skonstruować.", "Potrafię opisać kolejność: podstawa, dwa łuki, punkt przecięcia i połączenie boków."],
  prerequisiteSkillIds: ["M5-4.6-triangle-sides"],
  skillIds: ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"],
  estimatedMinutes: 45,
  overview: "L1 — warunek trójkąta sprawdzany w serii decyzji Tak/Nie oraz duży wizualny pokaz konstrukcji linijką i cyrklem.",
  commonMisconceptions: ["Uznawanie równości sumy dwóch boków z trzecim za poprawny trójkąt.", "Porównywanie dowolnych dwóch boków zamiast dwóch krótszych z najdłuższym."],
  stages: triangleConstructionStages({
    level: "l1",
    skillIds: ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"],
    examples: [
      { expression: "3 cm, 3 cm, 5 cm", prompt: "Ułóż odcinki, zapisz porównanie i rozstrzygnij możliwość konstrukcji." },
      { expression: "4 cm, 5 cm, 8 cm", prompt: "Pokaż zapas potrzebny do domknięcia i zapisz nierówność." },
      { expression: "4 cm, 5 cm, 9 cm", prompt: "Wyjaśnij, dlaczego sam styk końców nie tworzy trójkąta." },
      { expression: "Cięgna mostu: 3 m, 4 m, 8 m", prompt: "Pokaż lukę na modelu i uzasadnij, dlaczego rama nie będzie trójkątna." },
      { expression: "4 cm, 5 cm, 6 cm", prompt: "Samodzielnie sprawdź domknięcie, zapisz porównanie i wniosek." },
    ],
  }),
});

export const m547DwaOkregiMozliwosciL2V1 = s4({
  id: "m5-4-7-konstrukcja-trojkata-l2-v1",
  topicId: "M5-4.7",
  lessonNumber: 2,
  title: "Konstrukcja trójkąta o danych bokach",
  coreLesson: "Dwa okręgi możliwości — poziom 2",
  paperEvidence: "Pięć konstrukcji linijką i cyrklem z zachowanymi łukami, oznaczeniami boków i opisem kolejności.",
  studentGoal: "Uczeń konstruuje trójkąt o danych bokach linijką i cyrklem oraz opisuje kolejne kroki konstrukcji.",
  successCriteria: ["Potrafię narysować podstawę o podanej długości.", "Potrafię przenieść pozostałe długości łukami o środkach w końcach podstawy.", "Potrafię wskazać oba możliwe położenia trzeciego wierzchołka.", "Potrafię opisać kolejność konstrukcji."],
  prerequisiteSkillIds: ["M5-4.7-triangle-feasibility"],
  skillIds: ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"],
  estimatedMinutes: 45,
  overview: "L2 — konstrukcja linijką i cyrklem z dynamicznymi promieniami, dwoma punktami przecięcia i kontrolą kolejności kroków.",
  commonMisconceptions: ["Rysowanie łuków o przypadkowych promieniach.", "Rozpoczynanie od punktu C bez skonstruowania podstawy i przeniesienia długości.", "Wymazywanie łuków będących dowodem konstrukcji."],
  stages: triangleConstructionStages({
    level: "l2",
    skillIds: ["M5-4.7-triangle-feasibility", "M5-4.7-compass-construction", "M5-4.7-construction-explanation"],
    examples: [
      { expression: "AB = 3 cm, BC = 4 cm, CA = 5 cm", prompt: "Wykonaj konstrukcję i zaznacz oba możliwe położenia C." },
      { expression: "AB = 5 cm, BC = 5 cm, CA = 7 cm", prompt: "Zachowaj oba łuki i podpisz ich środki oraz promienie." },
      { expression: "Boki 4 cm, 4 cm, 6 cm", prompt: "Wykonaj kolejne kroki we właściwej kolejności i ponumeruj je." },
      { expression: "Boki 5 cm, 6 cm, 8 cm", prompt: "Skonstruuj trójkąt w nietypowej orientacji i opisz przeniesienie obu długości." },
      { expression: "Boki 5 cm, 6 cm, 8 cm", prompt: "Samodzielnie wykonaj konstrukcję, zachowaj łuki i napisz pełny opis." },
    ],
  }),
});

const triangleAngleSumStages = (level: "l1" | "l2"): LessonStageBlueprint[] => {
  const prefix = `m548${level}`;
  const seeds = level === "l1" ? [480101, 480102, 480103, 480104, 480105] : [480201, 480202, 480203, 480204, 480205];
  const examples = level === "l1"
    ? [
        { expression: "kąty 55°, 65° i ?", prompt: "Oblicz brakujący kąt i zapisz: suma kątów trójkąta = 180°." },
        { expression: "przeciągnij wierzchołek C", prompt: "Zmień kształt, odczytaj trzy kąty i sprawdź ich sumę." },
        { expression: "kąty 90°, 35° i ?", prompt: "Ułóż działanie z odejmowaniem od 180°." },
        { expression: "trójkąt równoramienny: podstawa 40°", prompt: "Wyznacz drugi kąt przy podstawie i uzasadnij równością boków." },
        { expression: "dach pawilonu: 72°, 48° i ?", prompt: "Rozwiąż wieloetapowe zadanie i sprawdź sumę." },
      ]
    : [
        { expression: "kąty 110°, 30° i ?", prompt: "Oblicz brakujący kąt oraz napraw niepełne uzasadnienie." },
        { expression: "równoramienny: kąt wierzchołkowy 40°", prompt: "Wyznacz oba kąty przy podstawie." },
        { expression: "kąty 72°, 48° i ?", prompt: "Zapisz pełny rachunek i nazwę użytej własności." },
        { expression: "nietypowo obrócony trójkąt", prompt: "Nie sugeruj się orientacją rysunku; oblicz kąt z sumy 180°." },
        { expression: "napraw uzasadnienie", prompt: "Wskaż błąd w rachunku i zapisz poprawne uzasadnienie." },
      ];
  const questions = examples.map((example, index) => ({
    id: `${prefix}-q${index + 1}`,
    generatorId: TRIANGLE_ANGLE_SUM_GENERATOR_ID,
    seed: seeds[index]!,
    difficulty: index === 0 ? "support" as const : index === 4 ? "challenge" as const : "core" as const,
    skillIds: ["M5-4.8-triangle-angle-sum"],
    feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: true, manualReview: "possible" as const, feedbackKeys: ["TRIANGLE_ANGLE_SUM", "TRIANGLE_MISSING_ANGLE", "TRIANGLE_JUSTIFICATION"] },
  }));
  return [
    { suffix: `${prefix}-explore`, kind: "explore", title: "Rozerwij i złóż 180°", minutes: 9, headline: "Trzy narożniki trójkąta układają się przy jednej prostej", body: "Każdy narożnik zachowuje etykietę A, B albo C. Przesuwanie wierzchołka zmienia miary, ale suma pozostaje 180°.", modelId: "geometry-lab", modelSeed: seeds[0], studentInstruction: "Obserwuj trzy kąty i wyjaśnij, dlaczego ich suma tworzy kąt półpełny." },
    { suffix: `${prefix}-drag`, kind: "practice", title: "Przeciągnij wierzchołek", minutes: 8, headline: "Zmień kształt i sprawdź sumę aktualnych miar", body: "Suwaki sterują dwoma kątami, a trzeci przelicza się w czasie rzeczywistym.", modelId: "geometry-lab", modelSeed: seeds[1], studentInstruction: "Wybierz różne ustawienia, odczytaj miary i potwierdź sumę 180°." },
    { suffix: `${prefix}-missing`, kind: "worked-example", title: "Brakujący kąt", minutes: 8, headline: "Najpierw zaznacz dane, potem ułóż odejmowanie od 180°", body: "Model nie podaje wyniku przed próbą. Feedback rozdziela błąd rachunkowy od braku uzasadnienia.", modelId: "geometry-lab", modelSeed: seeds[2], studentInstruction: "Wpisz brakujący kąt i nazwij własność, z której korzystasz." },
    { suffix: `${prefix}-isosceles`, kind: "worked-example", title: "Równe boki, równe kąty", minutes: 8, headline: "Znaki boków prowadzą do pary kątów przy podstawie", body: "W trójkącie równoramiennym najpierw rozpoznaj równe boki, a dopiero potem oblicz kąty.", modelId: "geometry-lab", modelSeed: seeds[3], studentInstruction: "Zaznacz równe kąty i zapisz krótkie uzasadnienie." },
    { suffix: `${prefix}-independent`, kind: "practice", title: "Ćwiczenia — 5 przykładów", minutes: 14, headline: "Pięć osobnych przykładów", body: "Każdy przykład ma osobny model, odpowiedź i feedback.", modelId: "geometry-lab", modelSeed: seeds[4], questions, studentInstruction: "Rozwiąż pięć przykładów po kolei. Zawsze podaj wynik i uzasadnienie.", print: { worksheetTitle: `Miary kątów w trójkątach — ${level.toUpperCase()}`, instructions: "W każdym polu zapisz rachunek, wynik i nazwę użytej własności.", itemCount: 5, items: examples.map((example, index) => ({ id: `${prefix}-print-${index + 1}`, questionId: questions[index]!.id, skillIds: ["M5-4.8-triangle-angle-sum"], maxScore: 2, expression: example.expression, prompt: example.prompt })) } },
  ];
};

export const m548Rozerwij180V1 = s4({
  id: "m5-4-8-rozerwij-180-l1-v1",
  topicId: "M5-4.8",
  title: "Miary kątów w trójkątach",
  coreLesson: "Rozerwij i złóż 180° — poziom 1",
  paperEvidence: "Pięć zadań z sumą kątów, modelem dynamicznym i uzasadnieniem.",
  studentGoal: "Uczeń korzysta z sumy kątów trójkąta i oblicza brakujący kąt.",
  successCriteria: ["Znam sumę kątów trójkąta.", "Obliczam brakujący kąt.", "Zapisuję uzasadnienie."],
  prerequisiteSkillIds: ["M5-4.7-triangle-construction"],
  skillIds: ["M5-4.8-triangle-angle-sum"],
  stages: triangleAngleSumStages("l1"),
});

export const m548RownoramienneL2V1 = s4({
  id: "m5-4-8-rozerwij-180-l2-v1",
  topicId: "M5-4.8",
  lessonNumber: 2,
  title: "Miary kątów w trójkątach",
  coreLesson: "Równe boki, równe kąty — poziom 2",
  paperEvidence: "Pięć zadań z sumą kątów, trójkątem równoramiennym i naprawą uzasadnienia.",
  studentGoal: "Uczeń łączy sumę 180° z własnością trójkąta równoramiennego.",
  successCriteria: ["Rozpoznaję kąty przy podstawie.", "Obliczam oba równe kąty.", "Potrafię naprawić błędne uzasadnienie."],
  prerequisiteSkillIds: ["M5-4.8-triangle-angle-sum"],
  skillIds: ["M5-4.8-triangle-angle-sum", "M5-4.8-isosceles-angles", "M5-4.8-justification"],
  stages: triangleAngleSumStages("l2"),
});

export const m549LaboratoriumWlasnosciV1 = s4({
  id: "m5-4-9-laboratorium-wlasnosci-v1",
  topicId: "M5-4.9",
  title: "Prostokąty i kwadraty",
  coreLesson: "Własności prostokąta i kwadratu",
  paperEvidence: "Tabela prawda/fałsz",
  studentGoal: "Uczeń rozpoznaje prostokąt i kwadrat po oznaczeniach oraz korzysta z ich własności w zadaniach o obwodzie.",
  successCriteria: ["Odczytuje równe i równoległe boki.", "Rozpoznaje cztery kąty proste.", "Wyjaśnia, dlaczego kwadrat jest prostokątem.", "Oblicza brakujący bok z obwodu."],
  prerequisiteSkillIds: ["M5-4.8-triangle-angle-sum"],
  skillIds: ["M5-4.9-rectangle-square"],
  stages: planeFigureTheoryStages({ activity: "rectangle-square", title: "Prostokąty i kwadraty", theoryHeadline: "Najpierw kąty proste, potem boki i przekątne", theoryBody: "Uczeń dopiero poznaje te figury. Rysunek pokazuje oznaczenia kątów prostych, pary równych boków oraz zależność: każdy kwadrat jest prostokątem.", skillIds: ["M5-4.9-rectangle-square"], printItems: [
    { expression: "Prostokąt i kwadrat z oznaczeniami boków", prompt: "Wypisz trzy cechy wspólne i jedną różnicę." },
    { expression: "Cztery równe boki i cztery kąty proste", prompt: "Podaj najdokładniejszą nazwę figury i uzasadnij." },
    { expression: "Bok 68 cm, obwód 304 cm", prompt: "Oblicz drugi bok prostokąta." },
  ] }),
});

export const m5410PrzesunWierzcholekV1 = s4({
  id: "m5-4-10-przesun-wierzcholek-v1",
  topicId: "M5-4.10",
  title: "Równoległoboki i romby",
  coreLesson: "Własności równoległoboku i rombu",
  paperEvidence: "Tabela własności",
  studentGoal: "Uczeń rozpoznaje równoległobok i romb oraz opisuje niezmienniki boków, kątów i przekątnych.",
  successCriteria: ["Rozpoznaje figurę w obrocie.", "Wypełnia tabelę własności."],
  prerequisiteSkillIds: ["M5-4.9-rectangle-square"],
  skillIds: ["M5-4.10-parallelogram-rhombus"],
  stages: planeFigureTheoryStages({ activity: "parallelogram-rhombus", title: "Równoległoboki i romby", theoryHeadline: "Przeciwległe boki i kąty tworzą pary", theoryBody: "Model pokazuje równoległość, równość przeciwległych boków i sumę 180° przy jednym boku. Romb jest szczególnym równoległobokiem: ma cztery równe boki.", skillIds: ["M5-4.10-parallelogram-rhombus"], printItems: [
    { expression: "Równoległobok z oznaczeniami", prompt: "Wskaż pary boków równoległych i pary równych kątów." },
    { expression: "Jeden kąt 35°", prompt: "Oblicz pozostałe trzy kąty równoległoboku." },
    { expression: "Boki 7 cm i 11 cm; romb o tym samym obwodzie", prompt: "Oblicz bok rombu." },
  ] }),
});

export const m5411TrapezyV1 = s4({
  id: "m5-4-11-trapezy-v1",
  topicId: "M5-4.11",
  title: "Trapezy",
  coreLesson: "Podstawy, ramiona i rodzaje trapezów",
  paperEvidence: "Klasyfikacja trapezów",
  studentGoal: "Uczeń rozpoznaje trapez i jego warianty oraz oblicza kąty przy ramionach.",
  successCriteria: ["Wskazuje podstawy.", "Klasyfikuje trapez równoramienny / prostokątny."],
  prerequisiteSkillIds: ["M5-4.10-parallelogram-rhombus"],
  skillIds: ["M5-4.11-trapezoid"],
  stages: planeFigureTheoryStages({ activity: "trapezoid", title: "Trapezy", theoryHeadline: "Podstawy są równoległe, pozostałe boki są ramionami", theoryBody: "Uczeń poznaje trapez ogólny, prostokątny i równoramienny. Oznaczenia na rysunku są ważniejsze niż prototypowe ustawienie figury.", skillIds: ["M5-4.11-trapezoid"], printItems: [
    { expression: "Trapez z oznaczonymi bokami", prompt: "Podpisz podstawy i ramiona; zaznacz wysokość." },
    { expression: "Kąt przy ramieniu 64°", prompt: "Oblicz drugi kąt przy tym samym ramieniu." },
    { expression: "Podstawy 42 cm i 18 cm, obwód 104 cm", prompt: "Oblicz ramię trapezu równoramiennego." },
  ] }),
});

export const m5412MapaRodzinFigurV1 = s4({
  id: "m5-4-12-mapa-rodzin-v1",
  topicId: "M5-4.12",
  title: "Czworokąty — podsumowanie",
  coreLesson: "Mapa rodzin czworokątów",
  paperEvidence: "Diagram klasyfikacji",
  studentGoal: "Uczeń układa diagram relacji między czworokątami z przykładami i kontrprzykładami.",
  successCriteria: ["Umieszcza figury w hierarchii.", "Podaje kontrprzykład."],
  prerequisiteSkillIds: ["M5-4.11-trapezoid"],
  skillIds: ["M5-4.12-quadrilateral-map"],
  estimatedMinutes: 45,
  stages: planeFigureTheoryStages({ activity: "quadrilateral-family", title: "Mapa rodzin czworokątów", theoryHeadline: "Jedna figura może mieć kilka poprawnych nazw", theoryBody: "Kwadrat zachowuje wszystkie cechy prostokąta i rombu. Mapa pokazuje zawieranie rodzin, a nie wyłącznie podobieństwo wyglądu.", skillIds: ["M5-4.12-quadrilateral-map"], printItems: [
    { expression: "Czworokąt → równoległobok → prostokąt / romb → kwadrat", prompt: "Uzupełnij mapę i dopisz po jednej własności każdej rodziny." },
    { expression: "Cztery kąty proste, sąsiednie boki różnej długości", prompt: "Podaj najdokładniejszą nazwę." },
    { expression: "Zdanie: każdy romb jest kwadratem", prompt: "Podaj kontrprzykład i zaznacz cechę, której brakuje." },
  ] }),
});

export const m5413LustroFigurV1 = s4({
  id: "m5-4-13-lustro-figur-v1",
  topicId: "M5-4.13",
  title: "Oś symetrii",
  coreLesson: "Odbicie względem osi",
  paperEvidence: "Dokończenie rysunku na kratce",
  studentGoal: "Uczeń rozpoznaje oś symetrii, rysuje figurę symetryczną i uzupełnia rysunek na kratce.",
  successCriteria: ["Rysuje oś symetrii.", "Dokańcza połowę figury."],
  prerequisiteSkillIds: ["M5-4.12-quadrilateral-map"],
  skillIds: ["M5-4.13-symmetry"],
  stages: planeFigureTheoryStages({ activity: "symmetry", title: "Oś symetrii", theoryHeadline: "Odpowiadające punkty leżą jednakowo daleko od osi", theoryBody: "Wizualne odbicie zastępuje składanie kartki na tablecie. Uczeń obserwuje pary punktów, prostopadłe odcinki i niezmienność odległości.", skillIds: ["M5-4.13-symmetry"], printItems: [
    { expression: "Figura i pionowa oś", prompt: "Połącz trzy pary odpowiadających punktów i porównaj ich odległości od osi." },
    { expression: "Prostokąt niebędący kwadratem", prompt: "Narysuj wszystkie osie symetrii." },
    { expression: "Punkt 3 kratki na lewo od osi", prompt: "Zaznacz odbicie i uzasadnij jego położenie." },
  ] }),
});

export const m54rBiuroProjektoweV1 = s4({
  id: "m5-4-r-biuro-projektowe-v1",
  topicId: "M5-4.R",
  title: "Powtórzenie wiadomości o figurach na płaszczyźnie",
  coreLesson: "Powtórzenie całego działu",
  paperEvidence: "Karta zadań łączonych",
  studentGoal: "Uczeń samodzielnie rozpoznaje relacje prostych i rodzaje figur, oblicza kąty oraz obwody i uzasadnia rozwiązania.",
  successCriteria: ["Klasyfikuje kąty od 0° do 360°.", "Korzysta z własności kątów przy prostych.", "Sprawdza możliwość zbudowania trójkąta.", "Oblicza kąty w trójkątach i czworokątach.", "Rozwiązuje zadania o obwodzie."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-4.R-review"],
  estimatedMinutes: 45,
  stages: (() => {
    const reviewQuestions = PLANE_FIGURES_REVIEW_SEEDS.map((seed, index) => ({ id: `m54r-q${index + 1}`, generatorId: PLANE_FIGURES_THEORY_GENERATOR_ID, seed, difficulty: index < 2 ? "support" as const : index > 6 ? "challenge" as const : "core" as const, skillIds: ["M5-4.R-review"], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["GEOMETRY_REVIEW_WRONG"] } }));
    const stage = (suffix: string, title: string, headline: string, start: number, count: number): LessonStageBlueprint => ({ suffix, kind: "practice", title, minutes: 10, headline, body: "Zadania są autorskie i obejmują ten sam zakres umiejętności co podsumowanie działu. Uczeń wybiera własność przed obliczeniem.", modelId: "geometry-lab", modelSeed: reviewQuestions[start]!.seed, questions: reviewQuestions.slice(start, start + count), studentInstruction: `Rozwiąż ${count} zadania po kolei na jednym slajdzie.`, print: { worksheetTitle: `Powtórzenie geometrii — ${title}`, instructions: "Przy każdym wyniku zapisz krótkie uzasadnienie.", itemCount: count, items: reviewQuestions.slice(start, start + count).map((question, index) => ({ id: `${suffix}-print-${index + 1}`, questionId: question.id, skillIds: ["M5-4.R-review"], maxScore: 2, expression: ["kąt 136°", "kąt 216°", "kąty przyległe", "proste bez punktów wspólnych", "boki 7 cm, 9 cm, 17 cm", "kąty 90° i 45°", "kąt zewnętrzny 140°", "równoległobok: 35°", "obwód sześciokąta", "kąty trapezu"][start + index]!, prompt: "Rozwiąż i uzasadnij właściwością figury." })) } });
    return [
      { suffix: "map", kind: "warmup", title: "Mapa działu", minutes: 5, headline: "Proste i kąty → trójkąty → czworokąty → symetria", body: "Powtórzenie nie tłumaczy tematów od początku. Porządkuje zakres i od razu uruchamia zadania.", modelId: "geometry-lab", modelSeed: PLANE_FIGURES_THEORY_SEEDS.review.theory },
      stage("angles-lines", "Kąty i proste", "Rodzaje kątów oraz zależności przy prostych", 0, 4),
      stage("triangles", "Trójkąty", "Istnienie trójkąta, klasyfikacja i kąty", 4, 3),
      stage("quadrilaterals", "Czworokąty i obwody", "Równoległobok, wielokąt i trapez", 7, 3),
    ];
  })(),
});

export const m54sTablicaPomiarowaV1 = s4({
  id: "m5-4-s-tablica-pomiarowa-v1",
  topicId: "M5-4.S",
  title: "Sprawdzian i omówienie — Tablica pomiarowa",
  coreLesson: "Tablica pomiarowa",
  paperEvidence: "A/B, rubryka konstrukcji",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 4 i omawia błędy na tablicy pomiarowej.",
  successCriteria: ["Mierzy kąty poprawnie.", "Naprawia błędny rysunek z uzasadnieniem."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-4.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian geometrii płaskiej + omówienie konstrukcji.",
  openingScript: "„Sprawdzian działu 4 — precyzja rysunku i uzasadnienie.”",
  closingScript: "„Omówienie: napraw błędny rysunek na tablicy.”",
  commonMisconceptions: ["Pomiar bez ustawienia środka kątomierza."],
  stages: [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, przybory, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: "Sprawdzian dział 4 — część A",
        instructions: "Czas: 25 min. Rysuj dokładnie.",
        items: [
          { id: "a1", expression: "Proste ∥ i ⊥", prompt: "Narysuj + oznacz." },
          { id: "a2", expression: "∠ 135°", prompt: "Narysuj i zmierz." },
          { id: "a3", expression: "Skrzyżowanie: ∠1=47°", prompt: "Pozostałe kąty." },
          { id: "a4", expression: "Trójkąt: 50°, 60°, ?", prompt: "Brakujący kąt." },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "exit-ticket",
      title: "Arkusz B",
      minutes: 15,
      headline: "Sprawdzian — część 2",
      print: {
        worksheetTitle: "Sprawdzian dział 4 — część B",
        instructions: "Zadania otwarte.",
        items: [
          { id: "b1", expression: "Boki 4, 5, 9", prompt: "Czy trójkąt istnieje?" },
          { id: "b2", expression: "Romb vs kwadrat", prompt: "Porównaj własności." },
          { id: "b3", expression: "Na lewo od pionowej osi na kratkach zaznaczono łamaną przez punkty odległe od osi kolejno o 1, 3 i 2 kratki.", prompt: "Dorysuj odbicie po prawej stronie, zachowując odległości każdego punktu od osi." },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: "Napraw błędny rysunek",
      discussionPrompts: ["Gdzie błąd pomiaru?", "Jak poprawić konstrukcję?"],
    },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Ocena konstrukcji" },
  ],
});

export const section4LessonsWpC4: LessonPackage[] = [
  m541ProsteRelacjeL1V1,
  m541KonstrukcjeProstychL2V1,
  m542RozchylRamionaV1,
  m543KatomierzEkranowyV1,
  m543RysowanieKatowL2V1,
  m544SkrzyzowanieProstychV1,
  m545BudowniczyWielokatowV1,
  m546TrojkatnyPlacZabawV1,
  m546DwieKlasyfikacjeL2V1,
  m547CzyOdcinkiSieZamknaL1V1,
  m547DwaOkregiMozliwosciL2V1,
  m548Rozerwij180V1,
  m548RownoramienneL2V1,
  m549LaboratoriumWlasnosciV1,
  m5410PrzesunWierzcholekV1,
  m5411TrapezyV1,
  m5412MapaRodzinFigurV1,
  m5413LustroFigurV1,
  m54rBiuroProjektoweV1,
  m54sTablicaPomiarowaV1,
];
