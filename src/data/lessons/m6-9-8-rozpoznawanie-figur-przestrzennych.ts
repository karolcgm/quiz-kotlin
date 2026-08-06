import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const modelId = "solid-recognition-lab" as const;

export const m698RozpoznawanieFigurPrzestrzennychV1 = buildLessonPackage({
  id: "m6-9-8-rozpoznawanie-figur-przestrzennych-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.8",
  lessonNumber: 8,
  title: "Rozpoznawanie figur przestrzennych",
  studentGoal: "Rozpoznam bryłę na rysunku i dopasuję do niej poprawną nazwę.",
  successCriteria: [
    "Rozpoznaję i nazywam sześcian, prostopadłościan, graniastosłupy oraz ostrosłupy.",
    "Odróżniam walec, stożek i kulę od wielościanów, także po obróceniu modelu.",
  ],
  learningGoals: [
    {
      id: "m6-9-8-goal-polyhedra",
      studentGoal: "Nauczę się rozpoznawać i nazywać wielościany.",
      successCriteria: ["Dopasowuję nazwę do sześcianu, prostopadłościanu, graniastosłupa i ostrosłupa."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-8-goal-rounded",
      studentGoal: "Nauczę się rozpoznawać pozostałe podstawowe bryły.",
      successCriteria: ["Dopasowuję nazwę do walca, stożka i kuli niezależnie od ustawienia modelu."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.8-solid-recognition", "M6-9.8-solid-naming"],
  prerequisiteSkillIds: ["M6-9.1-cuboid-cube", "M6-9.2-prism-naming", "M6-9.7-recognize"],
  estimatedMinutes: 25,
  coreLesson: "Rozpoznawanie figur przestrzennych na podstawie liczby i kształtu podstaw, ścian oraz wierzchołków.",
  paperEvidence: "Zeszyt ucznia: nazwy dziesięciu brył dopasowane do ich rysunków.",
  overview: "Uczeń ogląda dziesięć modeli przestrzennych, może je obracać i wybiera właściwą nazwę spośród czterech odpowiedzi.",
  openingScript: "Pokaż dowolną bryłę pod nietypowym kątem i zapytaj, które jej cechy nie zmieniają się podczas obracania.",
  closingScript: "Poproś ucznia o podanie jednej cechy, po której rozpoznaje graniastosłup, ostrosłup, walec, stożek i kulę.",
  commonMisconceptions: [
    "Uczeń uznaje obrócony sześcian za inną bryłę.",
    "Uczeń myli graniastosłup trójkątny z ostrosłupem trójkątnym.",
    "Uczeń myli ostrosłup z bryłą obrotową mającą wierzchołek, czyli stożkiem.",
    "Uczeń wybiera koło zamiast kuli.",
  ],
  stageBlueprints: [
    {
      suffix: "match-s1",
      kind: "practice",
      title: "Dopasuj obrazek do nazwy",
      minutes: 25,
      headline: "Rozpoznaj bryłę",
      body: "Obejrzyj model z każdej strony i wybierz właściwą nazwę. Wszystkie zadania pojawiają się kolejno na tej samej karcie.",
      modelId,
      modelSeed: 69801,
      preserveTaskTitle: true,
      studentInstruction: "Obróć model, jeśli potrzebujesz, wybierz nazwę bryły i sprawdź odpowiedź.",
    },
  ],
  status: "published",
});
