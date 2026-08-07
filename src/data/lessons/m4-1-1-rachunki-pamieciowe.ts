import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const series = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-1-${suffix}-${index + 1}`,
    generatorId: "grade4-add-sub-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m411RachunkiPamiecioweV1 = buildLessonPackage({
  id: "m4-1-1-rachunki-pamieciowe-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.1",
  lessonNumber: 1,
  title: "Rachunki pamięciowe – dodawanie i odejmowanie",
  studentGoal: "Nauczę się sprawnie dodawać i odejmować w pamięci.",
  successCriteria: [
    "Nazywam składniki i sumę oraz odjemną, odjemnik i różnicę.",
    "Dodaję i odejmuję w pamięci, rozbijając liczby na wygodne części.",
    "Korzystam z przemienności dodawania i obliczam sumę lub różnicę podanych liczb.",
  ],
  learningGoals: [
    { id: "m4-1-1-goal-1", studentGoal: "Nauczę się nazywać liczby i wyniki w dodawaniu oraz odejmowaniu.", successCriteria: ["Nazywam składniki i sumę oraz odjemną, odjemnik i różnicę."], curriculumReferences: [] },
    { id: "m4-1-1-goal-2", studentGoal: "Nauczę się dodawać i odejmować w pamięci wygodnym sposobem.", successCriteria: ["Dodaję i odejmuję w pamięci, rozbijając liczby na wygodne części."], curriculumReferences: [] },
    { id: "m4-1-1-goal-3", studentGoal: "Nauczę się wykorzystywać przemienność dodawania.", successCriteria: ["Korzystam z przemienności dodawania i obliczam sumę lub różnicę podanych liczb."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.1-language", "M4-1.1-add-sub", "M4-1.1-strategy"],
  prerequisiteSkillIds: [],
  estimatedMinutes: 45,
  coreLesson: "Nazwy w dodawaniu i odejmowaniu, przemienność dodawania oraz wygodne strategie rachunków pamięciowych.",
  paperEvidence: "Karta pracy: dodawanie, odejmowanie, suma, różnica i sprytna kolejność składników.",
  overview: "Lekcja zaczyna się od języka działań, pokazuje przemienność i dwa czytelne sposoby rachunku, a kończy trzema seriami interaktywnymi.",
  openingScript: "Najpierw nazwij elementy obu działań. Podkreśl, że zamieniać miejscami wolno składniki dodawania, ale nie liczby w odejmowaniu.",
  closingScript: "Poproś uczniów o wskazanie jednego przykładu, w którym zmiana kolejności składników skraca rachunek.",
  commonMisconceptions: [
    "Uczeń nazywa wynik odejmowania sumą.",
    "Uczeń zamienia miejscami odjemną i odjemnik.",
    "Uczeń rozbija liczby, ale pomija jedną z części.",
  ],
  stageBlueprints: [
    {
      suffix: "language", kind: "explore", title: "Suma, składniki i różnica", minutes: 5,
      headline: "Nazwy w dodawaniu i odejmowaniu", body: "Poznaj nazwy liczb oraz wyników obu działań.", modelId: "grade4-add-sub-lab", modelSeed: 411,
      studentInstruction: "Wskaż składniki i sumę, a następnie odjemną, odjemnik i różnicę.",
      teacherInstruction: "Czytaj zapis od lewej do prawej i wskazuj nazwę dokładnie pod właściwą liczbą.",
    },
    {
      suffix: "commutative", kind: "explore", title: "Dodawanie jest przemienne", minutes: 4,
      headline: "3 + 5 = 5 + 3", body: "Po zamianie składników miejscami suma pozostaje taka sama.", modelId: "grade4-add-sub-lab", modelSeed: 412,
      studentInstruction: "Porównaj oba działania i powiedz, co się zmieniło, a co pozostało takie samo.",
      teacherInstruction: "Zaznacz kolorem odpowiadające sobie składniki. Dopowiedz, że odejmowanie nie jest przemienne.",
    },
    {
      suffix: "split-add", kind: "worked-example", title: "Jak dodajemy 48 + 36?", minutes: 5,
      headline: "Najpierw dziesiątki, potem jedności", body: "40 + 30 = 70, 8 + 6 = 14, więc 70 + 14 = 84.", modelId: "grade4-add-sub-lab", modelSeed: 413,
      studentInstruction: "Przejdź przez trzy kroki i sprawdź, skąd wzięły się liczby 70 oraz 14.",
      teacherInstruction: "Nie rozdzielaj zapisu na osobne przypadki. Pokaż jeden ciąg prowadzący do wyniku 84.",
    },
    {
      suffix: "split-subtract", kind: "worked-example", title: "Jak odejmujemy 42 − 27?", minutes: 5,
      headline: "Najpierw odejmij 20, potem 7", body: "42 − 20 = 22, a następnie 22 − 7 = 15.", modelId: "grade4-add-sub-lab", modelSeed: 414,
      studentInstruction: "Odejmij odjemnik w dwóch wygodnych krokach.",
      teacherInstruction: "Pilnuj, aby w drugim kroku uczeń zaczynał od 22, a nie ponownie od 42.",
    },
    {
      suffix: "practice", kind: "practice", title: "Dodawanie i odejmowanie", minutes: 10,
      headline: "Oblicz w pamięci", body: "W każdym zadaniu wpisz tylko wynik.", modelId: "grade4-add-sub-lab", modelSeed: 415,
      questions: series("practice", 6, "M4-1.1-add-sub", 41100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż sześć działań. Kolejne zadanie pojawi się w tej samej karcie.",
      teacherInstruction: "Pozwól uczniowi dobrać własny wygodny sposób. Puste pole ma blokować sprawdzenie.",
    },
    {
      suffix: "smart-order", kind: "challenge", title: "Oblicz sprytnie", minutes: 8,
      headline: "Najpierw utwórz pełną dziesiątkę", body: "Zmień kolejność składników, gdy dzięki temu rachunek staje się łatwiejszy.", modelId: "grade4-add-sub-lab", modelSeed: 416,
      questions: series("smart", 4, "M4-1.1-strategy", 41200), preserveTaskTitle: true,
      studentInstruction: "Najpierw wybierz wygodną parę składników, a potem wpisz wynik.",
      teacherInstruction: "W pierwszym zadaniu oczekiwany wybór to 8 + 2, a dopiero potem dodanie 17.",
    },
    {
      suffix: "sum-difference", kind: "exit-ticket", title: "Suma i różnica liczb", minutes: 6,
      headline: "Rozpoznaj działanie po nazwie", body: "Suma oznacza wynik dodawania, a różnica wynik odejmowania.", modelId: "grade4-add-sub-lab", modelSeed: 417,
      questions: series("language", 4, "M4-1.1-language", 41300), preserveTaskTitle: true,
      studentInstruction: "Przeczytaj polecenie, wybierz właściwe działanie i wpisz wynik.",
      teacherInstruction: "Sprawdź, czy uczeń rozumie słowa suma i różnica, a nie tylko wykonuje podany symbol działania.",
    },
  ],
  status: "published",
});
