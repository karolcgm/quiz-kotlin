import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillIds: string[]): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m4-1-15-${suffix}-${index + 1}`,
  generatorId: "grade4-section-one-review-l1-v1",
  seed: 415000 + index,
  difficulty: index === count - 1 ? "challenge" : "core",
  skillIds,
}));

export const m4115PowtorzenieV1 = buildLessonPackage({
  id: "m4-1-15-powtorzenie-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.15",
  lessonNumber: 15,
  title: "Powtórzenie wiadomości",
  studentGoal: "Uporządkuję i wykorzystam najważniejsze wiadomości o liczbach i działaniach.",
  successCriteria: [
    "Obliczam działania pamięciowe i stosuję właściwą kolejność działań.",
    "Rozwiązuję zadania tekstowe oraz wyciągam wnioski z podanych informacji.",
    "Odczytuję liczby zaznaczone na osi liczbowej.",
  ],
  learningGoals: [
    { id: "m4-1-15-goal-1", studentGoal: "Powtórzę rachunki pamięciowe i kolejność działań.", successCriteria: ["Dobieram wygodny sposób i poprawnie obliczam wartość wyrażenia."], curriculumReferences: [] },
    { id: "m4-1-15-goal-2", studentGoal: "Powtórzę rozwiązywanie i analizowanie zadań tekstowych.", successCriteria: ["Wybieram potrzebne informacje, działanie i zapisuję odpowiedź."], curriculumReferences: [] },
    { id: "m4-1-15-goal-3", studentGoal: "Powtórzę odczytywanie osi liczbowej.", successCriteria: ["Ustalam wartość działki i odczytuję zaznaczony punkt."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.15-calculate", "M4-1.15-reason", "M4-1.15-axis"],
  prerequisiteSkillIds: ["M4-1.1-natural-numbers"],
  estimatedMinutes: 60,
  coreLesson: "Rachunki pamięciowe, dzielenie z resztą, potęgi, kolejność działań, zadania tekstowe, analizowanie informacji i oś liczbowa.",
  paperEvidence: "Karta ucznia: mapa działu, miejsce na działania oraz trzy osie liczbowe.",
  overview: "Powtórzenie całego działu w pięciu krótkich, interaktywnych seriach z nowymi przykładami.",
  openingScript: "Pokaż mapę działu i poproś uczniów, aby przy każdej grupie pojęć podali jeden własny przykład.",
  closingScript: "Poproś ucznia, aby wskazał zadanie, które rozwiązał najsprawniej, oraz jedną umiejętność wymagającą jeszcze ćwiczenia.",
  commonMisconceptions: [
    "Uczeń wybiera dodawanie zamiast odejmowania w pytaniu «o ile». ",
    "Uczeń myli pytanie «o ile» z pytaniem «ile razy».",
    "Uczeń pomija potęgę albo nawias w kolejności działań.",
    "Uczeń odczytuje punkt bez ustalenia wartości jednej działki osi.",
  ],
  stageBlueprints: [
    { suffix: "mapa", kind: "worked-example", title: "Mapa działu", minutes: 8, headline: "Co już potrafisz?", body: "Uporządkuj pojęcia i przypomnij reguły potrzebne w dalszych zadaniach.", modelId: "grade4-section-one-review-lab", modelSeed: 4151, studentInstruction: "Przeczytaj mapę i przypomnij sobie po jednym przykładzie do każdej grupy.", teacherInstruction: "Nie rozwiązuj jeszcze zadań. Zbierz od uczniów krótkie przykłady i przypomnij nazwy wyników działań." },
    { suffix: "rachunki", kind: "practice", title: "Rachunki pamięciowe", minutes: 12, headline: "Oblicz sprytnie", body: "Rozwiąż pięć nowych działań, korzystając z rozbijania liczb i zmiany kolejności składników.", modelId: "grade4-section-one-review-lab", modelSeed: 4152, questions: questions("rachunki", 5, ["M4-1.15-calculate"]), preserveTaskTitle: true, studentInstruction: "Wpisz wynik z klawiatury ekranowej i zatwierdź.", teacherInstruction: "Po każdym zadaniu poproś jednego ucznia o nazwanie zastosowanego sposobu." },
    { suffix: "zadania-tekstowe", kind: "practice", title: "Zadania tekstowe", minutes: 12, headline: "Wybierz działanie i zapisz rachunek", body: "Rozwiąż zadanie porównawcze oraz zadanie z dzieleniem z resztą.", modelId: "grade4-section-one-review-lab", modelSeed: 4153, questions: questions("tekst", 2, ["M4-1.15-reason"]), preserveTaskTitle: true, studentInstruction: "Uzupełnij wszystkie liczby, wybierz znak i wpisz wynik.", teacherInstruction: "Dopilnuj, aby uczeń przed liczeniem przeczytał pytanie i nazwał szukaną informację." },
    { suffix: "analiza-informacji", kind: "practice", title: "Czytaj i wnioskuj", minutes: 10, headline: "Wybierz wniosek wynikający z treści", body: "Rozwiąż dwa zadania, w których najważniejsze jest uważne uporządkowanie informacji.", modelId: "grade4-section-one-review-lab", modelSeed: 4154, questions: questions("analiza", 2, ["M4-1.15-reason"]), preserveTaskTitle: true, studentInstruction: "Wybierz odpowiedź i sprawdź, czy zgadza się ze wszystkimi informacjami.", teacherInstruction: "Poproś ucznia o uzasadnienie odpowiedzi pełnym zdaniem, zanim ją zatwierdzi." },
    { suffix: "kolejnosc-dzialan", kind: "practice", title: "Kolejność działań", minutes: 10, headline: "Oblicz etapami", body: "Wpisuj wyniki potęg, nawiasów, mnożenia lub dzielenia w osobnych kratkach.", modelId: "grade4-section-one-review-lab", modelSeed: 4155, questions: questions("kolejnosc", 3, ["M4-1.15-calculate"]), preserveTaskTitle: true, studentInstruction: "Dotykaj kratek kolejno i wpisuj wynik każdego etapu.", teacherInstruction: "Zwróć uwagę, że wyniki etapów zastępują odpowiednie części wyrażenia." },
    { suffix: "os-liczbowa", kind: "practice", title: "Oś liczbowa", minutes: 8, headline: "Ustal działkę i odczytaj punkt", body: "Odczytaj trzy punkty z osi o różnych wartościach jednej działki.", modelId: "grade4-section-one-review-lab", modelSeed: 4156, questions: questions("os", 3, ["M4-1.15-axis"]), preserveTaskTitle: true, studentInstruction: "Najpierw porównaj dwie opisane kreski, a potem wpisz liczbę punktu A.", teacherInstruction: "Uczeń powinien przed wpisaniem odpowiedzi głośno podać wartość jednej działki." },
  ],
  status: "published",
});
