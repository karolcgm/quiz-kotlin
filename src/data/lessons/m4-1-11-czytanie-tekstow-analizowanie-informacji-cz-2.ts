import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (count: number): QuestionReference[] => Array.from({ length: count }, (_, index) => ({ id: `m4-1-11-reading-${index + 1}`, generatorId: "grade4-reading-information-two-l1-v1", seed: 411100 + index, difficulty: index === count - 1 ? "challenge" : "core", skillIds: [index < 2 ? "M4-1.11-changes" : "M4-1.11-inference"] }));

export const m4111CzytanieTekstowAnalizowanieInformacjiCz2V1 = buildLessonPackage({
  id: "m4-1-11-czytanie-tekstow-analizowanie-informacji-cz-2-v1", curriculumId: "pl-math-4-2026-classic", sectionId: "M4-S1", topicId: "M4-1.11", lessonNumber: 11, title: "Czytanie tekstów. Analizowanie informacji, cz. 2",
  studentGoal: "Nauczę się łączyć kilka informacji, śledzić zmiany i wyciągać wnioski.",
  successCriteria: ["Porządkuję zdarzenia w kolejności.", "Rozpoznaję, co się zmieniło, a co pozostało bez zmian.", "Wyciągam wniosek zgodny ze wszystkimi informacjami."],
  learningGoals: [
    { id: "m4-1-11-goal-1", studentGoal: "Nauczę się porządkować zdarzenia z treści.", successCriteria: ["Odtwarzam kolejne zmiany we właściwej kolejności."], curriculumReferences: [] },
    { id: "m4-1-11-goal-2", studentGoal: "Nauczę się rozpoznawać wielkości, które nie zmieniają się podczas przekładania.", successCriteria: ["Wskazuję, kiedy łączna liczba elementów pozostaje taka sama."], curriculumReferences: [] },
    { id: "m4-1-11-goal-3", studentGoal: "Nauczę się łączyć informacje z tekstu i prostego diagramu.", successCriteria: ["Wybieram wniosek wynikający ze wszystkich podanych informacji."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.11-changes", "M4-1.11-inference"], prerequisiteSkillIds: ["M4-1.10-analysis"], estimatedMinutes: 45,
  coreLesson: "Porządkowanie kolejnych zmian, rozpoznawanie niezmiennej sumy i wyciąganie wniosków z tekstu oraz prostych diagramów.", paperEvidence: "Karta ucznia: sześć zadań wymagających połączenia kilku informacji.",
  overview: "Uczeń analizuje przekładanie kredek między pudełkami, a następnie rozwiązuje serię zadań o zmianach, kolejności zdarzeń, tabeli czasu i niezmiennej sumie.",
  openingScript: "Pokaż trzy pudełka z równą liczbą kredek. Po każdym przełożeniu nazwij zmianę w każdym pudełku oraz zapytaj, czy zmieniła się liczba wszystkich kredek.", closingScript: "Poproś ucznia o podanie przykładu sytuacji, w której rzeczy zmieniają miejsce, ale ich łączna liczba się nie zmienia.",
  commonMisconceptions: ["Uczeń śledzi tylko ostatnią zmianę i pomija wcześniejsze zdarzenie.", "Uczeń uważa, że przekładanie przedmiotów zmienia ich łączną liczbę.", "Uczeń wybiera największą liczbę z treści bez sprawdzenia jej znaczenia."],
  stageBlueprints: [
    { suffix: "information", kind: "worked-example", title: "Co się zmienia, a co pozostaje bez zmian?", minutes: 12, headline: "Trzy pudełka z kredkami", body: "Prześledź dwa przełożenia i wyciągnij dwa różne wnioski.", modelId: "grade4-reading-information-two-lab", modelSeed: 4111, studentInstruction: "Obserwuj każde przełożenie i porównaj końcową zawartość pudełek.", teacherInstruction: "Najpierw ustal stan początkowy. Potem omawiaj po jednej zmianie i zaznacz, że suma kredek pozostaje stała." },
    { suffix: "practice", kind: "practice", title: "Łączenie informacji i wnioskowanie", minutes: 25, headline: "Śledź zdarzenia krok po kroku", body: "Rozwiąż sześć zadań wykorzystujących tekst, prosty diagram i tabelę.", modelId: "grade4-reading-information-two-lab", modelSeed: 4112, questions: questions(6), preserveTaskTitle: true, studentInstruction: "Przeczytaj całą treść, uporządkuj zmiany i wybierz wniosek.", teacherInstruction: "Po odpowiedzi poproś ucznia o wskazanie informacji, która przesądza o rozwiązaniu." },
  ], status: "published",
});
