import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const modelId = "pyramid-lab" as const;

export const m697OstroslupyV1 = buildLessonPackage({
  id: "m6-9-7-ostroslupy-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.7",
  lessonNumber: 7,
  title: "Ostrosłupy",
  studentGoal: "Rozpoznam i opiszę ostrosłup, jego elementy oraz siatkę, a także obliczę proste pole powierzchni.",
  successCriteria: [
    "Rozpoznaję i nazywam ostrosłupy według kształtu podstawy oraz wiem, czym jest czworościan.",
    "Wskazuję i liczę podstawę, ściany boczne, krawędzie oraz wierzchołki ostrosłupa.",
    "Rozpoznaję siatkę ostrosłupa i obliczam proste pole powierzchni.",
  ],
  learningGoals: [
    {
      id: "m6-9-7-goal-recognize",
      studentGoal: "Nauczę się rozpoznawać i nazywać ostrosłupy.",
      successCriteria: ["Rozpoznaję ostrosłup trójkątny, czworokątny i pięciokątny oraz wiem, że czworościan jest ostrosłupem trójkątnym."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-7-goal-elements",
      studentGoal: "Nauczę się opisywać elementy ostrosłupa.",
      successCriteria: ["Wskazuję podstawę, ściany boczne, krawędzie i wierzchołek ostrosłupa oraz podaję ich liczbę."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-7-goal-net-area",
      studentGoal: "Nauczę się rozpoznawać siatkę i obliczać proste pole powierzchni ostrosłupa.",
      successCriteria: ["Sprawdzam liczbę trójkątnych ścian w siatce i stosuję wzór Pc = Pp + Pb."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.7-recognize", "M6-9.7-elements", "M6-9.7-counts", "M6-9.7-nets", "M6-9.7-surface-area"],
  prerequisiteSkillIds: ["M6-9.2-prism-naming", "M6-9.3-recognize-net", "M6-5.3-triangle-area"],
  estimatedMinutes: 73,
  coreLesson: "Ostrosłup ma jedną wielokątną podstawę oraz trójkątne ściany boczne spotykające się w jednym wierzchołku.",
  paperEvidence: "Zeszyt ucznia: podpisany rysunek ostrosłupa, liczby jego elementów, rozpoznana siatka i jedno obliczenie pola powierzchni.",
  overview: "Uczeń obraca modele ostrosłupów, podświetla ich elementy, rozpoznaje bryły i siatki, liczy ściany, krawędzie i wierzchołki oraz oblicza proste pole powierzchni.",
  openingScript: "Pokaż ostrosłup czworokątny i zapytaj, co odróżnia go od graniastosłupa: jedna podstawa i ściany boczne spotykające się w jednym punkcie.",
  closingScript: "Poproś ucznia, aby dokończył zdania: nazwa ostrosłupa pochodzi od…, wszystkie ściany boczne są…, czworościan to…",
  commonMisconceptions: [
    "Uczeń uznaje stożek za ostrosłup, ponieważ ma jeden wierzchołek.",
    "Uczeń liczy tylko ściany boczne i pomija podstawę.",
    "Uczeń myli liczbę boków podstawy z łączną liczbą krawędzi.",
    "Uczeń uznaje siatkę z brakującą ścianą boczną za poprawną.",
    "Uczeń liczy pole całkowite bez pola podstawy.",
  ],
  stageBlueprints: [
    {
      suffix: "explore-s1", kind: "explore", title: "Jak wyglądają ostrosłupy?", minutes: 15,
      headline: "Podstawa, ściany boczne, krawędzie i wierzchołek", body: "Obracaj ostrosłupy trójkątny, czworokątny i pięciokątny. Podświetlaj ich elementy.",
      modelId, modelSeed: 69701, preserveTaskTitle: true,
      studentInstruction: "Zmieniaj model, obracaj go i wskaż każdy element ostrosłupa. Sprawdź, czym jest czworościan.",
    },
    {
      suffix: "identify-s2", kind: "practice", title: "Czy to jest ostrosłup?", minutes: 12,
      headline: "Rozpoznaj bryłę", body: "Rozwiąż serię pytań Tak lub Nie. Sprawdź liczbę podstaw i kształt ścian bocznych.",
      modelId, modelSeed: 69702, preserveTaskTitle: true,
      studentInstruction: "Dla każdej bryły wybierz Tak albo Nie. Kolejne zadanie pojawi się na tej samej karcie.",
    },
    {
      suffix: "counts-s3", kind: "practice", title: "Policz elementy ostrosłupa", minutes: 15,
      headline: "Ściany, krawędzie i wierzchołki", body: "Policz elementy ostrosłupów i rozpoznaj nazwę ostrosłupa na podstawie podanej liczby elementów.",
      modelId, modelSeed: 69703, preserveTaskTitle: true,
      studentInstruction: "Przyjrzyj się podstawie i wybierz pełną poprawną odpowiedź.",
    },
    {
      suffix: "nets-s4", kind: "practice", title: "Rozpoznaj siatkę ostrosłupa", minutes: 15,
      headline: "Jedna podstawa i trójkątne ściany boczne", body: "Rozpoznaj ostrosłup po siatce i oceń, czy siatka jest kompletna.",
      modelId, modelSeed: 69704, preserveTaskTitle: true,
      studentInstruction: "Znajdź podstawę i sprawdź, czy do każdego jej boku dołączono trójkątną ścianę boczną.",
    },
    {
      suffix: "area-s5", kind: "practice", title: "Proste pole powierzchni", minutes: 16,
      headline: "Pc = Pp + Pb", body: "Oblicz pole podstawy, sumę pól ścian bocznych i pole całkowite ostrosłupa.",
      modelId, modelSeed: 69705, preserveTaskTitle: true,
      studentInstruction: "Uzupełnij Pp, Pb i Pc za pomocą klawiatury ekranowej.",
    },
  ],
  status: "published",
});
