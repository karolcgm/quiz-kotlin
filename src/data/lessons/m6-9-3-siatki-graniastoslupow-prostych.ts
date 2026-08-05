import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const netsModel = "prism-nets-lab" as const;

export const m693SiatkiGraniastoslupowProstychV1 = buildLessonPackage({
  id: "m6-9-3-siatki-graniastoslupow-prostych-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.3",
  lessonNumber: 3,
  title: "Siatki graniastosłupów prostych",
  studentGoal: "Rozpoznam, sprawdzę i ułożę siatkę graniastosłupa prostego.",
  successCriteria: [
    "Rozkładam model graniastosłupa prostego do siatki i wskazuję jego ściany.",
    "Rozpoznaję bryłę na podstawie siatki oraz oceniam, czy siatka jest poprawna.",
    "Układam poprawną siatkę wskazanego graniastosłupa prostego z gotowych elementów.",
  ],
  learningGoals: [
    {
      id: "m6-9-3-goal-unfold",
      studentGoal: "Nauczę się rozkładać graniastosłup prosty do siatki.",
      successCriteria: ["W gotowej siatce odnajduję dwie podstawy i wszystkie ściany boczne."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-3-goal-recognize",
      studentGoal: "Nauczę się rozpoznawać i sprawdzać siatki graniastosłupów prostych.",
      successCriteria: ["Na podstawie układu i liczby ścian wskazuję bryłę albo wyjaśniam, że siatka jest niepoprawna."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-3-goal-draw",
      studentGoal: "Nauczę się układać siatkę graniastosłupa prostego.",
      successCriteria: ["Do właściwej liczby ścian bocznych dołączam dwie jednakowe podstawy."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.3-unfold-net", "M6-9.3-recognize-net", "M6-9.3-draw-net"],
  prerequisiteSkillIds: ["M6-9.2-prism-naming", "M6-9.2-prism-elements"],
  estimatedMinutes: 50,
  coreLesson: "Rozkładanie graniastosłupów prostych, rozpoznawanie poprawnych i niepoprawnych siatek oraz układanie siatek z gotowych elementów.",
  paperEvidence: "Zeszyt ucznia: podpisana siatka wybranego graniastosłupa prostego z zaznaczonymi podstawami i ścianami bocznymi.",
  overview: "Lekcja łączy animowane rozkładanie brył, serię zadań rozpoznawania oraz układanie różnych siatek z gotowych elementów na tablecie.",
  openingScript: "Pokaż zamknięty model i zapytaj, jak można przedstawić wszystkie jego ściany na jednej kartce.",
  closingScript: "Poproś ucznia, aby podał dwie rzeczy, które zawsze musi zawierać poprawna siatka graniastosłupa prostego.",
  commonMisconceptions: [
    "Uczeń rysuje tylko jedną podstawę.",
    "Uczeń dobiera liczbę ścian bocznych niezależnie od liczby boków podstawy.",
    "Uczeń rozpoznaje bryłę po kształcie prostokątów zamiast po kształcie podstaw.",
    "Uczeń uznaje każdy zestaw właściwych ścian za poprawną siatkę, nie sprawdzając ich połączenia.",
  ],
  stageBlueprints: [
    {
      suffix: "unfold-s1", kind: "explore", title: "Rozłóż graniastosłup do siatki", minutes: 15,
      headline: "Od bryły do płaskiej siatki", body: "Zmieniaj graniastosłup i przesuwaj suwak, aby zobaczyć drogę każdej ściany.",
      modelId: netsModel, modelSeed: 69301, preserveTaskTitle: true,
      studentInstruction: "Rozłóż kolejno graniastosłup trójkątny, czworokątny, pięciokątny i sześciokątny.",
    },
    {
      suffix: "recognize-s2", kind: "practice", title: "Rozpoznaj i sprawdź siatkę", minutes: 20,
      headline: "Jaka bryła powstanie z tej siatki?", body: "Rozwiąż jedną serię zadań: nazwij bryłę albo zdecyduj, czy siatka jest poprawna.",
      modelId: netsModel, modelSeed: 69302, preserveTaskTitle: true,
      studentInstruction: "Najpierw odszukaj dwie podstawy, a następnie policz ściany boczne.",
    },
    {
      suffix: "draw-s3", kind: "practice", title: "Ułóż siatkę z gotowych elementów", minutes: 15,
      headline: "Zbuduj siatkę na tablecie", body: "Do paska gotowych ścian bocznych dołącz dwie jednakowe podstawy. Sprawdź kilka różnych poprawnych układów.",
      modelId: netsModel, modelSeed: 69303, preserveTaskTitle: true,
      studentInstruction: "Ułóż siatkę wskazanego graniastosłupa z gotowych elementów. Sprawdź liczbę podstaw i ścian bocznych.",
    },
  ],
  status: "published",
});
