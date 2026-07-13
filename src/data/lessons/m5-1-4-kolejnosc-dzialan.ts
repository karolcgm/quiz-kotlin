import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const questions = (stage: number, count: number) => Array.from({ length: count }, (_, index) => ({
  id: `m5-1-4-${stage}-task-${index + 1}`,
  generatorId: "order-of-operations-v1",
  seed: stage * 1000 + index + 1,
  difficulty: "core" as const,
}));

export const m514KolejnoscDzialanV1: LessonPackage = {
  id: "m5-1-4-rezyser-dzialan-v1",
  version: 3,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S1",
  topicId: "M5-1.4",
  lessonNumber: 4,
  title: "Kolejność działań",
  estimatedMinutes: 45,
  studentGoal: "Ustalam kolejność działań i poprawnie obliczam wartość wyrażeń.",
  successCriteria: [
    "Układam pełną regułę kolejności działań.",
    "Wskazuję wszystkie znaki w kolejności ich wykonania.",
    "Obliczam wartość wyrażenia zgodnie z kolejnością działań.",
  ],
  learningGoals: [
    {
      id: "m5-1-4-goal-plan",
      studentGoal: "Nauczę się ustalać prawidłową kolejność wykonywania działań.",
      successCriteria: [
        "Potrafię uporządkować: nawiasy, potęgowanie, mnożenie i dzielenie oraz dodawanie i odejmowanie.",
        "Potrafię wskazać kolejność znaków w konkretnym wyrażeniu, pamiętając o kierunku od lewej do prawej.",
      ],
      curriculumReferences: ["Klasy IV–VI, II.9"],
    },
    {
      id: "m5-1-4-goal-result",
      studentGoal: "Nauczę się obliczać wartość wyrażenia zgodnie z ustaloną kolejnością.",
      successCriteria: ["Potrafię zapisać kolejne kroki i podać poprawny wynik wyrażenia."],
      curriculumReferences: ["Klasy IV–VI, II.9"],
    },
  ],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.4-order", "M5-1.4-evaluate"],
  printableResourceIds: ["m5-1-4-karta-krokow", "m5-1-4-bilet", "m5-1-4-karta-bez-urzadzen"],
  status: "published",
  teacherGuide: {
    overview: "Cztery slajdy: podręcznik, pełna reguła kolejności, trzy zadania z układaniem operatorów i dwa obliczenia.",
    timingNotes: "45 minut: 8 + 8 + 16 + 13 minut.",
    materials: ["Tablica", "Urządzenia uczniów", "Podręcznik"],
    stageNotes: {
      "m5-1-4-book": "Ustaw stronę i numer zadania.",
      "m5-1-4-rule": "Uczeń układa cztery poziomy reguły. Nie pokazuj poprawnej kolejności przed wysłaniem.",
      "m5-1-4-signs": "Trzy losowe działania. Uczeń porządkuje wszystkie znaki, nie tylko pierwszy.",
      "m5-1-4-result": "Dwa losowe działania z samodzielnie wpisywanym wynikiem.",
    },
    commonMisconceptions: ["Wykonywanie dodawania przed mnożeniem.", "Pomijanie kolejności od lewej do prawej dla działań o tym samym priorytecie."],
    differentiation: { support: "Pozwól zapisać numery kroków nad znakami.", core: "Wykonaj wszystkie sześć odpowiedzi.", challenge: "Poproś o uzasadnienie kolejności bez podawania wyniku." },
    openingScript: "Najpierw ustawiamy regułę, potem ćwiczymy plan działania, a na końcu obliczamy.",
    closingScript: "Sprawdź, czy najpierw rozpoznajesz priorytet, a dopiero potem liczysz.",
    exitTicketRubric: "Sześć zapisanych odpowiedzi: 1 + 3 + 2.",
    paperWithoutDevices: "Zapisz cyfry 1, 2, 3 nad znakami działań, a następnie oblicz.",
    languageReview: "Nawiasy, potęgowanie, mnożenie i dzielenie, dodawanie i odejmowanie.",
  },
  stages: [
    createLessonStage({ id: "m5-1-4-book", kind: "warmup", title: "Podręcznik — strona i zadanie", studentInstruction: "Otwórz wskazaną stronę i zadanie.", teacherInstruction: "Ustaw stronę i zadanie przyciskami +/−.", estimatedMinutes: 8, live: { enabled: true, kind: "presentation", minutes: 8 }, board: { layout: "model", headline: "Praca z podręcznikiem", modelId: "exercise-board", modelSeed: 1 }, student: { activityMode: "view", instruction: "Pracuj z podręcznikiem." } }),
    createLessonStage({ id: "m5-1-4-rule", kind: "explore", title: "Wyścig reguł", studentInstruction: "Ułóż zasady od wykonywanej jako pierwsza do wykonywanej jako ostatnia.", teacherInstruction: "Nie podawaj kolejności przed wysłaniem odpowiedzi.", estimatedMinutes: 8, live: { enabled: true, kind: "exercise", minutes: 8 }, board: { layout: "model", headline: "Pełna kolejność działań", modelId: "order-of-operations-lesson", modelSeed: 1 }, student: { activityMode: "respond", instruction: "Ustaw cztery etapy reguły.", modelId: "order-of-operations-lesson", modelSeed: 1 } }, questions(1, 1)),
    createLessonStage({ id: "m5-1-4-signs", kind: "practice", title: "Kolejność znaków w działaniu", studentInstruction: "Ustaw istniejące znaki w kolejności ich wykonania.", teacherInstruction: "Trzy zadania po kolei; operatory w każdym przykładzie są różne.", estimatedMinutes: 16, live: { enabled: true, kind: "exercise", minutes: 16 }, board: { layout: "model", headline: "Plan rozwiązania", modelId: "order-of-operations-lesson", modelSeed: 2 }, student: { activityMode: "respond", instruction: "Wykonaj trzy zadania. Po wysłaniu dostaniesz kolejny przykład.", modelId: "order-of-operations-lesson", modelSeed: 2 } }, questions(2, 3)),
    createLessonStage({ id: "m5-1-4-result", kind: "exit-ticket", title: "Oblicz wynik", studentInstruction: "Zastosuj kolejność działań i wpisz wynik.", teacherInstruction: "Pięć krótkich zadań po kolei.", estimatedMinutes: 13, live: { enabled: true, kind: "exercise", minutes: 13 }, board: { layout: "model", headline: "Wartość wyrażenia", modelId: "order-of-operations-lesson", modelSeed: 3 }, student: { activityMode: "respond", instruction: "Oblicz i wyślij pięć wyników.", modelId: "order-of-operations-lesson", modelSeed: 3 } }, questions(3, 5)),
  ],
};
