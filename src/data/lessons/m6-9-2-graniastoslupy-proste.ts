import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const prismModel = "right-prism-lab" as const;

export const m692GraniastoslupyProsteV1 = buildLessonPackage({
  id: "m6-9-2-graniastoslupy-proste-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.2",
  lessonNumber: 2,
  title: "Graniastosłupy proste",
  studentGoal: "Rozpoznam graniastosłup prosty, nazwę go na podstawie kształtu podstawy oraz policzę jego ściany, krawędzie i wierzchołki.",
  successCriteria: [
    "Rozpoznaję graniastosłup prosty.",
    "Nazywam graniastosłup na podstawie wielokąta znajdującego się w jego podstawie.",
    "Wyznaczam liczbę ścian, krawędzi i wierzchołków różnych graniastosłupów.",
  ],
  learningGoals: [
    {
      id: "m6-9-2-goal-classification",
      studentGoal: "Nauczę się rozpoznawać graniastosłupy proste.",
      successCriteria: ["Wskazuję graniastosłupy proste wśród pokazanych brył."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-2-goal-base",
      studentGoal: "Nauczę się nazywać graniastosłup na podstawie kształtu jego podstawy.",
      successCriteria: ["Rozpoznaję graniastosłup trójkątny, czworokątny, pięciokątny i sześciokątny."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-2-goal-elements",
      studentGoal: "Nauczę się określać liczbę ścian, krawędzi i wierzchołków graniastosłupa.",
      successCriteria: ["Podaję poprawne liczby ścian, krawędzi i wierzchołków wskazanego graniastosłupa."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.2-solid-classification", "M6-9.2-prism-naming", "M6-9.2-prism-elements"],
  prerequisiteSkillIds: ["M6-9.1-solid-elements"],
  estimatedMinutes: 40,
  coreLesson: "Podział brył przestrzennych, nazywanie graniastosłupów według podstawy oraz liczenie ich ścian, krawędzi i wierzchołków.",
  paperEvidence: "Zeszyt ucznia: schemat podziału brył oraz tabela z liczbą ścian, krawędzi i wierzchołków czterech graniastosłupów.",
  overview: "Lekcja prowadzi od obrazowego schematu rodzajów brył do samodzielnego rozpoznawania graniastosłupów i liczenia ich elementów.",
  openingScript: "Pokaż trzy modele. Zapytaj uczniów, co odróżnia graniastosłup prosty i pochyły od ostrosłupa.",
  closingScript: "Poproś ucznia, aby nazwał graniastosłup na podstawie jego podstawy i podał liczbę jego wierzchołków.",
  commonMisconceptions: [
    "Uczeń nazywa graniastosłup na podstawie kształtu ściany bocznej zamiast podstawy.",
    "Uczeń sądzi, że graniastosłup czworokątny musi mieć kwadrat w podstawie, choć podstawą może być dowolny czworokąt, na przykład trapez.",
    "Uczeń liczy tylko widoczne na rysunku krawędzie lub wierzchołki.",
    "Uczeń myli liczbę ścian bocznych z liczbą wszystkich ścian.",
    "Uczeń zakłada, że każda podana liczba krawędzi musi odpowiadać jakiemuś graniastosłupowi.",
  ],
  stageBlueprints: [
    {
      suffix: "classification-s1", kind: "explore", title: "Jak dzielimy bryły przestrzenne?", minutes: 10,
      headline: "Graniastosłupy proste, pochyłe i ostrosłupy", body: "Porównaj modele na schemacie i zobacz, czym różnią się te grupy brył.",
      modelId: prismModel, modelSeed: 69201, preserveTaskTitle: true,
      studentInstruction: "Obejrzyj i obróć modele. Wskaż graniastosłupy proste, graniastosłup pochyły oraz ostrosłup.",
    },
    {
      suffix: "bases-s2", kind: "explore", title: "Nazwa graniastosłupa i jego podstawa", minutes: 10,
      headline: "Sprawdź, jaki wielokąt znajduje się w podstawie", body: "Zmieniaj liczbę boków podstawy i obserwuj nazwę graniastosłupa. Porównaj też różne czworokąty: kwadrat, prostokąt, trapez i romb.",
      modelId: prismModel, modelSeed: 69202, preserveTaskTitle: true,
      studentInstruction: "Wybierz kolejno graniastosłup trójkątny, czworokątny, pięciokątny i sześciokątny. Odszukaj obie podstawy.",
    },
    {
      suffix: "counts-s3", kind: "practice", title: "Ściany, krawędzie i wierzchołki", minutes: 20,
      headline: "Policz elementy różnych graniastosłupów", body: "Rozwiąż całą serię w jednym układzie. Zmienią się tylko bryła i pytanie.",
      modelId: prismModel, modelSeed: 69203, preserveTaskTitle: true,
      studentInstruction: "Policz wszystkie elementy bryły, także te niewidoczne na pierwszy rzut oka.",
    },
  ],
  status: "published",
});
