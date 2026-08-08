import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-4-${suffix}-${index + 1}`,
    generatorId: "grade4-money-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m424ZloteIGroszeV1 = buildLessonPackage({
  id: "m4-2-4-zlote-i-grosze-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.4",
  lessonNumber: 1,
  title: "Złote i grosze",
  studentGoal: "Nauczę się przeliczać złote i grosze oraz rozwiązywać zadania o zakupach.",
  successCriteria: [
    "Wiem, że 1 zł to 100 gr.",
    "Zamieniam złote na grosze oraz grosze na złote i grosze.",
    "Obliczam kwoty, ceny i resztę w zadaniach tekstowych.",
  ],
  learningGoals: [
    { id: "m4-2-4-goal-1", studentGoal: "Poznam polskie jednostki monetarne.", successCriteria: ["Wyjaśniam, że 1 zł = 100 gr."], curriculumReferences: [] },
    { id: "m4-2-4-goal-2", studentGoal: "Nauczę się zamieniać złote i grosze.", successCriteria: ["Poprawnie wykonuję zamiany w obu kierunkach."], curriculumReferences: [] },
    { id: "m4-2-4-goal-3", studentGoal: "Wykorzystam pieniądze w obliczeniach.", successCriteria: ["Rozwiązuję zadania o cenach, zakupach i reszcie."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.4-units", "M4-2.4-convert", "M4-2.4-story"],
  prerequisiteSkillIds: ["M4-1.1-add-sub", "M4-1.3-mul-div"],
  estimatedMinutes: 45,
  coreLesson: "Jednostki monetarne, zależność 1 zł = 100 gr, zamiana jednostek oraz obliczenia pieniężne w sytuacjach zakupowych.",
  paperEvidence: "Karta ucznia: zamiany złotych i groszy oraz zapis obliczeń do zadań o zakupach.",
  overview: "Uczeń poznaje zapis kwot, obserwuje rozwiązany przykład sklepowy, ćwiczy zamiany w obu kierunkach, a następnie oblicza sumę cen, resztę i koszt kilku produktów.",
  openingScript: "Pokaż monetę 1 zł i zapytaj, ile monet jednogroszowych ma taką samą wartość. Zapisz 1 zł = 100 gr.",
  closingScript: "Poproś ucznia o podanie jednej kwoty w złotych i groszach oraz zapisanie jej wyłącznie w groszach.",
  commonMisconceptions: [
    "Uczeń przyjmuje, że 1 zł to 10 gr.",
    "Uczeń zamienia 7 zł na 70 gr zamiast 700 gr.",
    "Uczeń zapisuje więcej niż 99 gr obok pełnych złotych, zamiast zamienić 100 gr na 1 zł.",
    "Uczeń dodaje razem cyfry złotych i groszy bez zachowania jednostek.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Złote i grosze", minutes: 5,
      headline: "1 zł to 100 gr", body: "Poznaj jednostki monetarne i sposób zapisywania kwot.",
      modelId: "grade4-money-lab", modelSeed: 4241,
      studentInstruction: "Przyjrzyj się monetom i zapamiętaj najważniejszą zamianę.",
      teacherInstruction: "Podkreśl, że grosz jest mniejszą jednostką, a 100 gr tworzy 1 zł.",
    },
    {
      suffix: "example", kind: "worked-example", title: "Przykład zakupów", minutes: 5,
      headline: "Liczymy złote i grosze", body: "Zobacz rozwiązane zadanie ze sklepu papierniczego.",
      modelId: "grade4-money-lab", modelSeed: 4242,
      studentInstruction: "Śledź osobno rachunek na złotych i rachunek na groszach.",
      teacherInstruction: "Zwróć uwagę na pełną odpowiedź z obiema jednostkami.",
    },
    {
      suffix: "zl-to-gr", kind: "practice", title: "Złote na grosze", minutes: 7,
      headline: "Pomnóż liczbę złotych przez 100", body: "Zamień podaną kwotę na grosze.",
      modelId: "grade4-money-lab", modelSeed: 4243, questions: questions("zl-to-gr", 6, "M4-2.4-convert", 424100), preserveTaskTitle: true,
      studentInstruction: "Wpisz liczbę groszy za pomocą klawiatury lekcji.",
      teacherInstruction: "Sprawdzaj, czy uczeń mnoży liczbę złotych przez 100.",
    },
    {
      suffix: "gr-to-zl-gr", kind: "practice", title: "Grosze na złote i grosze", minutes: 7,
      headline: "Wydziel pełne setki groszy", body: "Wpisz osobno liczbę złotych i pozostałych groszy.",
      modelId: "grade4-money-lab", modelSeed: 4244, questions: questions("gr-to-zl-gr", 6, "M4-2.4-convert", 424200), preserveTaskTitle: true,
      studentInstruction: "Dotknij właściwej kratki i wpisz złote oraz grosze.",
      teacherInstruction: "Przypomnij, że obok pełnych złotych pozostaje od 0 do 99 gr.",
    },
    {
      suffix: "story", kind: "challenge", title: "Zadania z treścią", minutes: 10,
      headline: "Zakupy, ceny i reszta", body: "Rozwiąż zadania na dodawanie, odejmowanie i mnożenie kwot.",
      modelId: "grade4-money-lab", modelSeed: 4245, questions: questions("story", 4, "M4-2.4-story", 424300), preserveTaskTitle: true,
      studentInstruction: "Przeczytaj treść, wykonaj potrzebne działanie i wpisz pełną kwotę.",
      teacherInstruction: "W razie potrzeby pozwól uczniowi osobno zapisać rachunek dla złotych i groszy.",
    },
    {
      suffix: "market", kind: "challenge", title: "Zakupy na straganie", minutes: 11,
      headline: "Cennik i dwie rundy zakupów", body: "Oblicz sześć cen zakupów obejmujących pięć produktów oraz kilogramy, pół kilograma i półtora kilograma.",
      modelId: "grade4-money-lab", modelSeed: 4246, questions: questions("market", 2, "M4-2.4-story", 424400), preserveTaskTitle: true,
      studentInstruction: "W każdej rundzie uzupełnij osobno złote i grosze w podpunktach a, b i c.",
      teacherInstruction: "Przy połowie kilograma przypomnij o dzieleniu ceny przez 2, a przy półtora kilograma o dodaniu ceny za 1 kg i za pół kilograma.",
    },
  ],
  status: "published",
});
