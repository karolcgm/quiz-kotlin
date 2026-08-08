import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-7-${suffix}-${index + 1}`,
    generatorId: "grade4-roman-numerals-l1-v1",
    seed: seed + index,
    difficulty: index >= count - 2 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m427SystemRzymskiV1 = buildLessonPackage({
  id: "m4-2-7-system-rzymski-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.7",
  lessonNumber: 1,
  title: "System rzymski",
  studentGoal: "Poznam znaki rzymskie i nauczę się odczytywać, zapisywać oraz sprawdzać liczby zapisane w systemie rzymskim.",
  successCriteria: [
    "Znam wartości znaków I, V, X, L i C oraz zasady ich łączenia.",
    "Odczytuję i zapisuję liczby w systemie rzymskim.",
    "Oceniam, czy podana liczba naturalna i liczba rzymska oznaczają to samo.",
  ],
  learningGoals: [
    { id: "m4-2-7-goal-1", studentGoal: "Poznam znaki i zasady systemu rzymskiego.", successCriteria: ["Podaję wartości I, V, X, L i C oraz rozpoznaję IV, IX, XL i XC."], curriculumReferences: [] },
    { id: "m4-2-7-goal-2", studentGoal: "Nauczę się czytać i zapisywać liczby rzymskie.", successCriteria: ["Poprawnie zamieniam liczby naturalne na rzymskie i rzymskie na naturalne."], curriculumReferences: [] },
    { id: "m4-2-7-goal-3", studentGoal: "Nauczę się sprawdzać poprawność zapisu.", successCriteria: ["Uzasadniam, czy para liczba naturalna — liczba rzymska jest prawidłowa."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.7-rules", "M4-2.7-read", "M4-2.7-write", "M4-2.7-check"],
  prerequisiteSkillIds: ["M4-2.1-place-value", "M4-2.2-compare"],
  estimatedMinutes: 45,
  coreLesson: "Znaki I, V, X, L, C; zasady dodawania i odejmowania wartości; pary IV, IX, XL, XC; odczytywanie, zapisywanie i sprawdzanie liczb rzymskich.",
  paperEvidence: "Karta ucznia: tabela znaków, zamiana zapisów w obie strony i ocena poprawności par.",
  overview: "Pierwsze spotkanie z systemem rzymskim: od znaczenia pięciu znaków, przez dwa przykłady krok po kroku, do samodzielnego odczytywania, zapisywania i wykrywania niepoprawnych zapisów.",
  openingScript: "Pokaż zapis IV na tarczy zegara lub numer tomu książki. Zapytaj, czy uczniowie widzieli już liczby zapisane literami.",
  closingScript: "Poproś ucznia, aby zapisał swój wiek po rzymsku i wyjaśnił, dlaczego użył właśnie tych znaków.",
  commonMisconceptions: [
    "Uczeń zawsze dodaje wartości znaków i odczytuje IV jako 6.",
    "Uczeń zapisuje 8 jako IIX zamiast VIII.",
    "Uczeń zapisuje 40 jako XXXX zamiast XL.",
    "Uczeń powtarza V lub L albo zapisuje więcej niż trzy znaki I lub X obok siebie.",
  ],
  stageBlueprints: [
    { suffix: "information", kind: "explore", title: "Znaki i zasady", minutes: 8, headline: "Pierwsze spotkanie z systemem rzymskim", body: "Poznaj wartości znaków oraz zasady dodawania i odejmowania.", modelId: "grade4-roman-numerals-lab", modelSeed: 4271, studentInstruction: "Przeczytaj wartości znaków i porównaj dwa sposoby ich łączenia.", teacherInstruction: "Zacznij od I, V i X. Dopiero potem pokaż L i C oraz pary XL i XC." },
    { suffix: "worked-example", kind: "worked-example", title: "Jak to zrobić?", minutes: 7, headline: "Rozbij liczbę i połącz zapis", body: "Zobacz zamianę liczby 24 oraz odczytanie XXXIX.", modelId: "grade4-roman-numerals-lab", modelSeed: 4272, studentInstruction: "Prześledź każdy krok i nazwij część dziesiątek oraz jedności.", teacherInstruction: "Podkreśl, że 4 i 9 mają szczególny zapis IV oraz IX." },
    { suffix: "read", kind: "practice", title: "Odczytaj liczbę rzymską", minutes: 10, headline: "Od znaków do liczby", body: "Wpisz liczbę naturalną za pomocą klawiatury lekcji.", modelId: "grade4-roman-numerals-lab", modelSeed: 4273, questions: questions("read", 8, "M4-2.7-read", 427100), preserveTaskTitle: true, studentInstruction: "Najpierw znajdź parę odejmowaną, a potem dodaj pozostałe wartości.", teacherInstruction: "Przy błędzie poproś ucznia o zaznaczenie IV, IX, XL lub XC." },
    { suffix: "write", kind: "practice", title: "Zapisz liczbę po rzymsku", minutes: 10, headline: "Od liczby do znaków", body: "Ułóż zapis z I, V, X, L i C.", modelId: "grade4-roman-numerals-lab", modelSeed: 4274, questions: questions("write", 8, "M4-2.7-write", 427200), preserveTaskTitle: true, studentInstruction: "Rozbij liczbę na dziesiątki i jedności, a potem wybierz znaki.", teacherInstruction: "Pilnuj, aby uczeń nie tworzył zapisów IIX, VIIII ani XXXX." },
    { suffix: "treasure-code", kind: "challenge", title: "Kod do rzymskiej skrzyni", minutes: 8, headline: "Otwórz skrzynię", body: "Zapisz po rzymsku liczby 40, 9 i 24, zachowując podaną kolejność.", modelId: "grade4-roman-numerals-lab", modelSeed: 4275, questions: questions("treasure-code", 1, "M4-2.7-write", 427250), preserveTaskTitle: true, studentInstruction: "Dotknij kolejnych pól kodu i wpisz każdy zapis klawiaturą znaków rzymskich.", teacherInstruction: "Pozwól uczniom samodzielnie odnaleźć szczególne pary XL, IX oraz IV." },
    { suffix: "check-record", kind: "challenge", title: "Czy zapis jest prawidłowy?", minutes: 10, headline: "Zaznacz prawidłowe", body: "Zaznacz wszystkie pary, w których liczba naturalna i zapis rzymski mają tę samą wartość.", modelId: "grade4-roman-numerals-lab", modelSeed: 4276, questions: questions("check-record", 1, "M4-2.7-check", 427300), preserveTaskTitle: true, studentInstruction: "Odczytaj wszystkie zapisy rzymskie i zaznacz każdą prawidłową parę.", teacherInstruction: "Po odpowiedzi omów z uczniami poprawny zapis każdej nieprawidłowej pary." },
  ],
  status: "published",
});
