import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-3-${suffix}-${index + 1}`,
    generatorId: "grade4-mul-div-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m413RachunkiPamiecioweMnozenieDzielenieV1 = buildLessonPackage({
  id: "m4-1-3-rachunki-pamieciowe-mnozenie-dzielenie-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.3",
  lessonNumber: 3,
  title: "Rachunki pamięciowe – mnożenie i dzielenie",
  studentGoal: "Nauczę się sprawnie mnożyć i dzielić liczby naturalne w pamięci.",
  successCriteria: [
    "Rozpoznaję czynniki i iloczyn oraz dzielną, dzielnik i iloraz.",
    "Obliczam proste iloczyny i ilorazy w pamięci oraz sprawdzam dzielenie mnożeniem.",
    "W mnożeniu wybieram dogodną kolejność czynników i poprawnie obliczam wynik.",
  ],
  learningGoals: [
    { id: "m4-1-3-goal-1", studentGoal: "Nauczę się nazywać liczby i wyniki mnożenia oraz dzielenia.", successCriteria: ["Rozpoznaję czynniki i iloczyn oraz dzielną, dzielnik i iloraz."], curriculumReferences: [] },
    { id: "m4-1-3-goal-2", studentGoal: "Nauczę się mnożyć i dzielić w pamięci.", successCriteria: ["Obliczam proste iloczyny i ilorazy w pamięci oraz sprawdzam dzielenie mnożeniem."], curriculumReferences: [] },
    { id: "m4-1-3-goal-3", studentGoal: "Nauczę się wykorzystywać przemienność mnożenia w rachunkach pamięciowych.", successCriteria: ["W mnożeniu wybieram dogodną kolejność czynników i poprawnie obliczam wynik."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.3-language", "M4-1.3-calculation", "M4-1.3-smart-order"],
  prerequisiteSkillIds: ["M4-1.1-add-sub"],
  estimatedMinutes: 45,
  coreLesson: "Nazwy liczb w mnożeniu i dzieleniu, związek działań odwrotnych oraz rachunki pamięciowe wykonywane przez rozbijanie liczb i dogodną kolejność czynników.",
  paperEvidence: "Karta pracy: czynniki i iloczyn, dzielna i dzielnik, rachunki pamięciowe oraz wybór dogodnej kolejności mnożenia.",
  overview: "Pięć krótkich modeli informacyjnych i trzy interaktywne serie: obliczenia, rachunki sprytne oraz zadania językowe z iloczynem i ilorazem.",
  openingScript: "Przypomnij tabliczkę mnożenia na przykładzie 6 · 7 = 42 i pokaż dwa odpowiadające mu działania dzielenia.",
  closingScript: "Poproś ucznia, aby nazwał liczby w jednym mnożeniu i jednym dzieleniu oraz podał sposób sprawdzenia ilorazu.",
  commonMisconceptions: [
    "Uczeń zamienia dzielną z dzielnikiem, jakby dzielenie było przemienne.",
    "Uczeń przy rozbijaniu liczby pomija jedną część działania.",
    "Uczeń oblicza poprawny wynik, ale wybiera niedogodną parę w zadaniu o sprytnym mnożeniu.",
  ],
  stageBlueprints: [
    {
      suffix: "language", kind: "explore", title: "Nazwy w mnożeniu i dzieleniu", minutes: 5,
      headline: "Czynniki i iloczyn, dzielna, dzielnik i iloraz", body: "Poznaj nazwy liczb oraz wyników obu działań.",
      modelId: "grade4-mul-div-lab", modelSeed: 431,
      studentInstruction: "Przeczytaj nazwy umieszczone pod każdą liczbą i wynikiem.",
      teacherInstruction: "Wskaż kolejno oba czynniki i iloczyn, a potem dzielną, dzielnik i iloraz.",
    },
    {
      suffix: "commutative", kind: "explore", title: "Przemienność mnożenia", minutes: 4,
      headline: "3 · 5 = 5 · 3", body: "Czynniki można zamienić miejscami. Dzielenie nie jest przemienne.",
      modelId: "grade4-mul-div-lab", modelSeed: 432,
      studentInstruction: "Porównaj oba mnożenia i sprawdź ich wyniki.",
      teacherInstruction: "Podkreśl, że tej własności nie przenosimy na dzielenie.",
    },
    {
      suffix: "inverse", kind: "explore", title: "Mnożenie i dzielenie", minutes: 4,
      headline: "Działania odwrotne", body: "Dzielenie sprawdzamy mnożeniem.",
      modelId: "grade4-mul-div-lab", modelSeed: 433,
      studentInstruction: "Odczytaj trzy działania złożone z liczb 6, 7 i 42.",
      teacherInstruction: "Zbuduj z jednego mnożenia dwa działania dzielenia.",
    },
    {
      suffix: "split-multiply", kind: "explore", title: "Mnożymy po kawałku", minutes: 5,
      headline: "6 · 14", body: "Rozbij 14 na 10 i 4, pomnóż obie części, a potem dodaj.",
      modelId: "grade4-mul-div-lab", modelSeed: 434,
      studentInstruction: "Śledź trzy kroki prowadzące do wyniku 84.",
      teacherInstruction: "Zachowaj cały zapis w jednym wierszu na każdym kroku.",
    },
    {
      suffix: "split-divide", kind: "explore", title: "Dzielimy po kawałku", minutes: 5,
      headline: "84 : 4", body: "Rozbij dzielną na 80 i 4, podziel obie części, a potem dodaj.",
      modelId: "grade4-mul-div-lab", modelSeed: 435,
      studentInstruction: "Sprawdź, dlaczego obie części dzielą się przez 4.",
      teacherInstruction: "Po obliczeniu 21 sprawdź wynik mnożeniem 21 · 4.",
    },
    {
      suffix: "practice", kind: "practice", title: "Oblicz w pamięci", minutes: 8,
      headline: "Mnożenie i dzielenie", body: "W każdym zadaniu wpisz tylko wynik.",
      modelId: "grade4-mul-div-lab", modelSeed: 436, questions: questions("practice", 6, "M4-1.3-calculation", 43100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż sześć zadań. Każde kolejne pojawi się w tej samej karcie.",
      teacherInstruction: "Zachęcaj do sprawdzania dzielenia za pomocą mnożenia.",
    },
    {
      suffix: "smart-order", kind: "challenge", title: "Oblicz sprytnie", minutes: 5,
      headline: "Wybierz dogodną parę czynników", body: "Najpierw wybierz parę, a potem wpisz wynik całego działania.",
      modelId: "grade4-mul-div-lab", modelSeed: 437, questions: questions("smart-order", 4, "M4-1.3-smart-order", 43200), preserveTaskTitle: true,
      studentInstruction: "W każdym przykładzie wskaż dwa czynniki, które warto pomnożyć najpierw.",
      teacherInstruction: "Pierwszy przykład to 2 · 9 · 5; uczeń powinien najpierw wybrać 2 · 5.",
    },
    {
      suffix: "product-quotient", kind: "exit-ticket", title: "Iloczyn i iloraz", minutes: 4,
      headline: "Rozpoznaj działanie po nazwie", body: "Iloczyn oznacza wynik mnożenia, a iloraz wynik dzielenia.",
      modelId: "grade4-mul-div-lab", modelSeed: 438, questions: questions("product-quotient", 4, "M4-1.3-language", 43300), preserveTaskTitle: true,
      studentInstruction: "Odczytaj nazwy podane w poleceniu i wpisz wynik.",
      teacherInstruction: "Sprawdź, czy uczeń odróżnia dzielną od dzielnika.",
    },
  ],
  status: "published",
});
