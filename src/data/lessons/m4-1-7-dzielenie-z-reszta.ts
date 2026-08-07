import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-7-${suffix}-${index + 1}`,
    generatorId: "grade4-remainder-division-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m417DzielenieZResztaV1 = buildLessonPackage({
  id: "m4-1-7-dzielenie-z-reszta-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.7",
  lessonNumber: 7,
  title: "Dzielenie z resztą",
  studentGoal: "Nauczę się dzielić z resztą, sprawdzać wynik i wskazywać wszystkie możliwe reszty.",
  successCriteria: [
    "Wyjaśniam, co oznaczają iloraz i reszta w sytuacji z życia.",
    "Dzielę z resztą i sprawdzam wynik za pomocą mnożenia oraz dodawania.",
    "Wskazuję wszystkie możliwe reszty i pamiętam, że reszta jest mniejsza od dzielnika.",
  ],
  learningGoals: [
    { id: "m4-1-7-goal-1", studentGoal: "Nauczę się rozumieć dzielenie z resztą w sytuacji z życia.", successCriteria: ["Wyjaśniam, ile otrzymuje każda osoba i ile elementów zostaje."], curriculumReferences: [] },
    { id: "m4-1-7-goal-2", studentGoal: "Nauczę się wykonywać i sprawdzać dzielenie z resztą.", successCriteria: ["Stosuję sprawdzenie: dzielnik · iloraz + reszta = dzielna."], curriculumReferences: [] },
    { id: "m4-1-7-goal-3", studentGoal: "Nauczę się określać możliwe reszty.", successCriteria: ["Wypisuję wszystkie reszty mniejsze od dzielnika, także 0."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.7-context", "M4-1.7-calculation", "M4-1.7-remainders"],
  prerequisiteSkillIds: ["M4-1.3-division", "M4-1.5-strategy"],
  estimatedMinutes: 55,
  coreLesson: "Znaczenie dzielenia z resztą, zapis ilorazu i reszty, obowiązkowe sprawdzenie oraz możliwe reszty.",
  paperEvidence: "Karta pracy: podział cukierków, osiem przykładów ze sprawdzeniem, zadania z treścią i pięć zadań o możliwych resztach.",
  overview: "Najpierw uczeń dzieli 20 cukierków między troje dzieci. Następnie rozwiązuje serię dzieleń z resztą, zadania z treścią i każdorazowo sprawdza wynik. Na końcu wybiera wszystkie możliwe reszty.",
  openingScript: "Rozdaj 20 liczmanów między trzy osoby. Zatrzymaj dwa, których nie można już rozdać po równo, i nazwij je resztą.",
  closingScript: "Poproś ucznia o wyjaśnienie, dlaczego przy dzieleniu przez 6 reszta może wynosić 0, 1, 2, 3, 4 albo 5, ale nie 6.",
  commonMisconceptions: [
    "Uczeń zapisuje resztę równą dzielnikowi lub większą od niego.",
    "Uczeń sprawdza tylko mnożeniem i zapomina dodać resztę.",
    "Uczeń nie uznaje 0 za możliwą resztę.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "20 cukierków dla trojga dzieci", minutes: 10,
      headline: "Dzielimy po równo, a resztę zostawiamy", body: "Każde dziecko dostaje 6 cukierków, a 2 cukierki zostają.",
      modelId: "grade4-remainder-division-lab", modelSeed: 471,
      studentInstruction: "Obserwuj podział cukierków, zapis dzielenia i jego sprawdzenie.",
      teacherInstruction: "Pracuj na konkretach. Podkreśl, że reszta musi być mniejsza od dzielnika.",
    },
    {
      suffix: "practice", kind: "practice", title: "Podziel z resztą i sprawdź", minutes: 20,
      headline: "Iloraz, reszta i sprawdzenie", body: "W każdym zadaniu wpisz iloraz, resztę oraz wynik działania sprawdzającego.",
      modelId: "grade4-remainder-division-lab", modelSeed: 472, questions: questions("practice", 8, "M4-1.7-calculation", 47100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż osiem przykładów. Każdy wynik sprawdź według wzoru: dzielnik · iloraz + reszta = dzielna.",
      teacherInstruction: "Nie zaliczaj zadania, dopóki uczeń nie uzupełni także wyniku sprawdzenia.",
    },
    {
      suffix: "stories", kind: "challenge", title: "Zadania z treścią", minutes: 12,
      headline: "Zapisz działanie, oblicz i odpowiedz", body: "Odczytaj dzielną i dzielnik z treści, uzupełnij całe działanie oraz wykonaj sprawdzenie.",
      modelId: "grade4-remainder-division-lab", modelSeed: 473, questions: questions("stories", 4, "M4-1.7-context", 47200), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż cztery zadania z treścią. Wpisz dzielną, dzielnik, iloraz, resztę i wynik sprawdzenia.",
      teacherInstruction: "Zwróć uwagę, czy uczeń potrafi samodzielnie odczytać działanie z treści i poprawnie zinterpretować resztę w odpowiedzi.",
    },
    {
      suffix: "remainders", kind: "exit-ticket", title: "Wszystkie możliwe reszty", minutes: 10,
      headline: "Reszta jest mniejsza od dzielnika", body: "Wybierz wszystkie liczby, które mogą być resztą z dzielenia przez podaną liczbę.",
      modelId: "grade4-remainder-division-lab", modelSeed: 474, questions: questions("remainders", 5, "M4-1.7-remainders", 47300), preserveTaskTitle: true,
      studentInstruction: "W pięciu zadaniach zaznacz wszystkie możliwe reszty. Pamiętaj również o 0.",
      teacherInstruction: "Zapytaj, dlaczego dzielnik nigdy nie może być resztą.",
    },
  ],
  status: "published",
});
