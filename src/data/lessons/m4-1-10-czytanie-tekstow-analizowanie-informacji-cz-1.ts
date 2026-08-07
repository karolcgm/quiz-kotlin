import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (count: number): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m4-1-10-reading-${index + 1}`,
  generatorId: "grade4-reading-information-one-l1-v1",
  seed: 410100 + index,
  difficulty: index === count - 1 ? "challenge" : "core",
  skillIds: [index === count - 1 ? "M4-1.10-sufficiency" : "M4-1.10-analysis"],
}));

export const m4110CzytanieTekstowAnalizowanieInformacjiCz1V1 = buildLessonPackage({
  id: "m4-1-10-czytanie-tekstow-analizowanie-informacji-cz-1-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.10",
  lessonNumber: 10,
  title: "Czytanie tekstów. Analizowanie informacji, cz. 1",
  studentGoal: "Nauczę się analizować treść i wyciągać wnioski bez wykonywania niepotrzebnych obliczeń.",
  successCriteria: [
    "Wyszukuję w treści warunki i dane potrzebne do odpowiedzi.",
    "Łączę podane informacje i wybieram wniosek, który z nich wynika.",
    "Rozpoznaję, kiedy danych jest za mało, aby udzielić odpowiedzi.",
  ],
  learningGoals: [
    { id: "m4-1-10-goal-1", studentGoal: "Nauczę się wyszukiwać warunki zapisane w zadaniu.", successCriteria: ["Wskazuję informacje, które trzeba sprawdzić przed udzieleniem odpowiedzi."], curriculumReferences: [] },
    { id: "m4-1-10-goal-2", studentGoal: "Nauczę się łączyć informacje i wyciągać z nich wnioski.", successCriteria: ["Wybieram odpowiedź zgodną ze wszystkimi informacjami w treści."], curriculumReferences: [] },
    { id: "m4-1-10-goal-3", studentGoal: "Nauczę się oceniać, czy danych jest wystarczająco dużo.", successCriteria: ["Wybieram „nie można ustalić”, gdy treść nie pozwala na pewną odpowiedź."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.10-analysis", "M4-1.10-sufficiency"],
  prerequisiteSkillIds: ["M4-1.9-answer"],
  estimatedMinutes: 45,
  coreLesson: "Wyszukiwanie warunków, porządkowanie zależności, wyciąganie wniosków i rozpoznawanie braku wystarczających danych.",
  paperEvidence: "Karta ucznia: sześć sytuacji wymagających analizy informacji bez zapisywania niepotrzebnych działań.",
  overview: "Uczeń poznaje strategię: znajdź warunki, sprawdź dane, wyciągnij wniosek. Następnie analizuje sześć różnych sytuacji, w tym jedną z niewystarczającymi danymi.",
  openingScript: "Przeczytaj zadanie o 8 dzieciach i 3 planszach. Nie pytaj o wynik działania — poproś o sprawdzenie warunku od 3 do 6 osób przy każdej planszy.",
  closingScript: "Poproś ucznia o podanie przykładu informacji, która może być ważniejsza od samej liczby w zadaniu.",
  commonMisconceptions: [
    "Uczeń próbuje wykonać działanie tylko dlatego, że w treści pojawiają się liczby.",
    "Uczeń wybiera odpowiedź po przeczytaniu jednego zdania i pomija pozostałe warunki.",
    "Uczeń zgaduje konkretną wartość, mimo że w treści nie podano wystarczających danych.",
  ],
  stageBlueprints: [
    {
      suffix: "information",
      kind: "worked-example",
      title: "Najpierw przeanalizuj treść",
      minutes: 12,
      headline: "Czy wszystkie warunki są spełnione?",
      body: "Przeanalizuj przykład z grą planszową bez zapisywania działania.",
      modelId: "grade4-reading-information-one-lab",
      modelSeed: 4101,
      studentInstruction: "Sprawdź kolejno liczbę plansz, liczbę dzieci i warunek dotyczący liczby graczy.",
      teacherInstruction: "Zaznacz, że liczby w zadaniu nie zawsze oznaczają konieczność wykonania rachunku.",
    },
    {
      suffix: "practice",
      kind: "practice",
      title: "Czytanie i analizowanie informacji",
      minutes: 25,
      headline: "Przeczytaj, połącz informacje i odpowiedz",
      body: "Rozwiąż sześć zadań bez szukania działania na siłę.",
      modelId: "grade4-reading-information-one-lab",
      modelSeed: 4102,
      questions: questions(6),
      preserveTaskTitle: true,
      studentInstruction: "Przeczytaj całą treść, znajdź warunki i wybierz wniosek, który na pewno jest prawdziwy.",
      teacherInstruction: "Po każdej odpowiedzi poproś ucznia o wskazanie zdania, które przesądza o rozwiązaniu.",
    },
  ],
  status: "published",
});
