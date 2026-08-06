import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const modelId = "prism-volume-lab" as const;

export const m696ObjetoscGraniastoslupaProstegoV1 = buildLessonPackage({
  id: "m6-9-6-objetosc-graniastoslupa-prostego-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S9",
  topicId: "M6-9.6",
  lessonNumber: 6,
  title: "Objętość graniastosłupa prostego",
  studentGoal: "Obliczę objętość graniastosłupa prostego, korzystając z pola jego podstawy i wysokości.",
  successCriteria: [
    "Obliczam pole figury znajdującej się w podstawie graniastosłupa.",
    "Stosuję wzór V = Pp · H i zapisuję wynik w jednostce sześciennej.",
    "Rozwiązuję zadania tekstowe dotyczące objętości graniastosłupów prostych.",
  ],
  learningGoals: [
    {
      id: "m6-9-6-goal-base",
      studentGoal: "Nauczę się obliczać pole podstawy graniastosłupa.",
      successCriteria: ["Rozpoznaję figurę w podstawie i stosuję odpowiedni wzór na jej pole."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-6-goal-volume",
      studentGoal: "Nauczę się obliczać objętość graniastosłupa prostego.",
      successCriteria: ["Stosuję wzór V = Pp · H i zapisuję wynik w jednostce sześciennej."],
      curriculumReferences: [],
    },
    {
      id: "m6-9-6-goal-problems",
      studentGoal: "Nauczę się rozwiązywać zadania praktyczne o objętości.",
      successCriteria: ["Odczytuję dane, obliczam Pp i V oraz zapisuję odpowiedź z właściwą jednostką."],
      curriculumReferences: [],
    },
  ],
  skillIds: ["M6-9.6-base-area", "M6-9.6-prism-volume", "M6-9.6-word-problems"],
  prerequisiteSkillIds: ["M6-9.4-base-area", "M6-9.5-cuboid-formula"],
  estimatedMinutes: 50,
  coreLesson: "Objętość graniastosłupa prostego obliczamy jako iloczyn pola podstawy i wysokości: V = Pp · H.",
  paperEvidence: "Zeszyt ucznia: wzór V = Pp · H oraz pełne rozwiązanie zadania z obliczeniem Pp i V.",
  overview: "Uczeń porównuje bryłę z osobnym rysunkiem podstawy, oblicza Pp, a następnie objętość graniastosłupa prostego.",
  openingScript: "Pokaż bryłę i jej podstawę osobno. Zapytaj, ile takich warstw o polu Pp mieści się na wysokości H.",
  closingScript: "Poproś ucznia o podanie dwóch kroków: najpierw obliczam Pp, następnie V = Pp · H.",
  commonMisconceptions: [
    "Uczeń oblicza tylko pole podstawy i nie mnoży go przez wysokość graniastosłupa.",
    "Uczeń myli wysokość figury w podstawie z wysokością graniastosłupa H.",
    "Uczeń dodaje Pp i H zamiast je mnożyć.",
    "Uczeń zapisuje jednostkę kwadratową zamiast sześciennej.",
  ],
  stageBlueprints: [
    {
      suffix: "formula-s1", kind: "explore", title: "Wzór na objętość", minutes: 12,
      headline: "V = Pp · H", body: "Porównaj graniastosłup z osobnym rysunkiem jego podstawy. Najpierw oblicz Pp, a potem pomnóż je przez wysokość H.",
      modelId, modelSeed: 69601, preserveTaskTitle: true,
      studentInstruction: "Zmieniaj kształt podstawy i wskaż na rysunku pole podstawy Pp oraz wysokość graniastosłupa H.",
    },
    {
      suffix: "calculate-s2", kind: "practice", title: "Oblicz objętość", minutes: 18,
      headline: "Najpierw Pp, potem V", body: "Rozwiąż jedną serię czterech zadań z różnymi figurami w podstawie.",
      modelId, modelSeed: 69602, preserveTaskTitle: true,
      studentInstruction: "Oblicz Pp i V. Wpisuj wyniki klawiaturą ekranową.",
    },
    {
      suffix: "stories-s3", kind: "practice", title: "Zadania tekstowe", minutes: 20,
      headline: "Objętość w sytuacjach praktycznych", body: "Rozwiąż serię zadań o tunelu, rowie, pudełku i pojemniku.",
      modelId, modelSeed: 69603, preserveTaskTitle: true,
      studentInstruction: "Odczytaj dane, oblicz Pp i V, a następnie zapisz odpowiedź w jednostce sześciennej.",
    },
  ],
  status: "published",
});
