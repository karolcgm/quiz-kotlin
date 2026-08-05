import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const modelId = "prism-surface-area-lab" as const;

export const m694PolePowierzchniGraniastoslupaProstegoV1 = buildLessonPackage({
  id: "m6-9-4-pole-powierzchni-graniastoslupa-prostego-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.4",
  lessonNumber: 4,
  title: "Pole powierzchni graniastosłupa prostego",
  studentGoal: "Obliczę pole podstawy, pole boczne i pole całkowite graniastosłupa prostego o różnych podstawach.",
  successCriteria: [
    "Dobieram właściwy wzór do figury znajdującej się w podstawie.",
    "Obliczam pole boczne jako iloczyn obwodu podstawy i wysokości graniastosłupa.",
    "Obliczam pole całkowite i rozwiązuję zadania tekstowe.",
  ],
  learningGoals: [
    {
      id: "m6-9-4-goal-base",
      studentGoal: "Nauczę się obliczać pole podstawy graniastosłupa.",
      successCriteria: ["Rozpoznaję figurę w podstawie i stosuję odpowiedni wzór na jej pole."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-4-goal-lateral",
      studentGoal: "Nauczę się obliczać pole boczne graniastosłupa prostego.",
      successCriteria: ["Obliczam obwód podstawy i stosuję wzór Pb = Op · H."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-4-goal-total",
      studentGoal: "Nauczę się obliczać pole całkowite graniastosłupa prostego.",
      successCriteria: ["Stosuję wzór Pc = 2 · Pp + Pb i zapisuję jednostkę kwadratową."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.4-base-area", "M6-9.4-lateral-area", "M6-9.4-total-area"],
  prerequisiteSkillIds: ["M6-9.2-prism-naming", "M6-9.3-recognize-net"],
  estimatedMinutes: 50,
  coreLesson: "Pole podstawy, pole boczne i pole całkowite graniastosłupów prostych o podstawach będących trójkątem, trapezem, rombem i równoległobokiem.",
  paperEvidence: "Zeszyt ucznia: wzory Pb = Op · H i Pc = 2 · Pp + Pb oraz pełne rozwiązanie jednego zadania tekstowego.",
  overview: "Uczeń porównuje bryłę z osobnym rysunkiem podstawy, odczytuje podpisane krawędzie i uzupełnia Pp, Pb oraz Pc.",
  openingScript: "Przypomnij pole prostopadłościanu, a następnie pokaż graniastosłup z trójkątem w podstawie i zapytaj, które ściany trzeba teraz policzyć.",
  closingScript: "Poproś ucznia o podanie kolejności obliczeń: Pp, obwód podstawy, Pb i Pc.",
  commonMisconceptions: [
    "Uczeń uwzględnia tylko jedną podstawę w polu całkowitym.",
    "Uczeń myli wysokość figury w podstawie z wysokością graniastosłupa H.",
    "Uczeń mnoży pole podstawy przez wysokość zamiast obwodu podstawy przez wysokość przy obliczaniu Pb.",
    "Uczeń zapisuje jednostkę długości zamiast jednostki kwadratowej.",
  ],
  stageBlueprints: [
    {
      suffix: "formula-s1", kind: "explore", title: "Jak obliczamy pole powierzchni?", minutes: 12,
      headline: "Od podstawy do pola całkowitego", body: "Porównaj bryłę z osobnym rysunkiem jej podstawy. Zmieniaj kształt podstawy i prześledź trzy etapy obliczeń.",
      modelId, modelSeed: 69401, preserveTaskTitle: true,
      studentInstruction: "Odczytaj podpisane wymiary. Wyjaśnij, skąd biorą się Pp, Pb i Pc.",
    },
    {
      suffix: "calculate-s2", kind: "practice", title: "Oblicz pole powierzchni", minutes: 18,
      headline: "Uzupełnij Pp, Pb i Pc", body: "Rozwiąż jedną serię czterech zadań z różnymi figurami w podstawie.",
      modelId, modelSeed: 69402, preserveTaskTitle: true,
      studentInstruction: "Najpierw oblicz Pp, następnie Pb, a na końcu Pc. Wpisuj wyniki klawiaturą ekranową.",
    },
    {
      suffix: "stories-s3", kind: "practice", title: "Zadania tekstowe", minutes: 20,
      headline: "Pole powierzchni w sytuacjach praktycznych", body: "Rozwiąż serię zadań o zamkniętych pudełkach, opakowaniach, lampionach i pojemnikach.",
      modelId, modelSeed: 69403, preserveTaskTitle: true,
      studentInstruction: "Zapisz dane, oblicz Pp, Pb i Pc, a następnie odczytaj odpowiedź w kontekście zadania.",
    },
  ],
  status: "published",
});
