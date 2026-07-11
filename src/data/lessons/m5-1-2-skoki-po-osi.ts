import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const questions = (stage: number, count: number) => Array.from({ length: count }, (_, index) => ({
  id: `m5-1-2-${stage}-task-${index + 1}`,
  generatorId: "mental-add-sub-v1",
  seed: stage * 1000 + index + 1,
  difficulty: "core" as const,
}));

export const m512SkokiPoOsiV1: LessonPackage = {
  id: "m5-1-2-skoki-po-osi-v1",
  version: 2,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S1",
  topicId: "M5-1.2",
  lessonNumber: 2,
  title: "Dodawanie i odejmowanie w pamięci",
  estimatedMinutes: 45,
  studentGoal: "Rozpoznaję elementy dodawania i odejmowania oraz obliczam w pamięci sumy i różnice liczb zakończonych zerem.",
  successCriteria: ["Nazywam składniki, sumę, odjemną, odjemnik i różnicę.", "Obliczam pamięciowo 10 przykładów i zapisuję wynik według wartości pozycyjnej cyfr."],
  prerequisiteSkillIds: ["M5-1.1-place-value"],
  skillIds: ["M5-1.2-operation-language", "M5-1.2-mental-add-sub"],
  printableResourceIds: [],
  status: "published",
  teacherGuide: {
    overview: "Lekcja łączy pracę z podręcznikiem, język działań i dziesięć przykładów pamięciowych.",
    timingNotes: "45 minut: podręcznik 10, nazwy działań 10, seria obliczeń 25.",
    materials: ["Tablica lub projektor", "Urządzenia uczniów", "Podręcznik"],
    stageNotes: {
      "m5-1-2-book": "Ustaw stronę i numer zadania dla całej klasy.",
      "m5-1-2-names": "Jedno zadanie: sześć nazw pod dwoma działaniami.",
      "m5-1-2-calc": "Dziesięć przykładów. Jedności są stale zablokowane na zero.",
    },
    commonMisconceptions: ["Mylenie odjemnej z odjemnikiem.", "Wpisywanie wyniku cyfra po cyfrze bez uwzględnienia wartości pozycyjnej.", "Zmiana cyfry jedności mimo liczb zakończonych zerem."],
    differentiation: { support: "Pozwól najpierw ułożyć wynik z kartoników setek i dziesiątek.", core: "Wykonaj wszystkie 10 przykładów.", challenge: "Poproś o ustne wyjaśnienie strategii pamięciowej." },
    openingScript: "Najpierw ustalimy zadanie w podręczniku, potem nazwiemy elementy działań i policzymy serię przykładów.",
    closingScript: "Sprawdź, czy szybciej dodajesz, czy odejmujesz liczby zakończone zerem.",
    exitTicketRubric: "11 odpowiedzi: jedna terminologia i dziesięć obliczeń.",
    paperWithoutDevices: "Wykorzystaj analogiczne przykłady z podręcznika i tabelę wartości pozycyjnej.",
    languageReview: "Składnik + składnik = suma; odjemna − odjemnik = różnica.",
  },
  stages: [
    createLessonStage({
      id: "m5-1-2-book", kind: "warmup", title: "Podręcznik — strona i zadanie",
      studentInstruction: "Otwórz podręcznik na stronie i zadaniu wskazanym na tablicy.", teacherInstruction: "Ustaw stronę i zadanie przyciskami +/−.", estimatedMinutes: 10,
      live: { enabled: true, kind: "presentation", minutes: 10 },
      board: { layout: "model", headline: "Praca z podręcznikiem", modelId: "exercise-board", modelSeed: 1 },
      student: { activityMode: "view", instruction: "Wykonuj zadanie z podręcznika wskazane przez nauczyciela." },
    }),
    createLessonStage({
      id: "m5-1-2-names", kind: "explore", title: "Jak nazywamy elementy działań?",
      studentInstruction: "Przenieś nazwy do właściwych kratek.", teacherInstruction: "Nie podawaj układu przed wysłaniem odpowiedzi.", estimatedMinutes: 10,
      live: { enabled: true, kind: "exercise", minutes: 10 },
      board: { layout: "model", headline: "Suma i różnica", modelId: "mental-add-sub-lesson", modelSeed: 1 },
      student: { activityMode: "respond", instruction: "Uzupełnij wszystkie sześć kratek i wyślij odpowiedź.", modelId: "mental-add-sub-lesson", modelSeed: 1 },
    }, questions(1, 1)),
    createLessonStage({
      id: "m5-1-2-calc", kind: "practice", title: "Dodawanie i odejmowanie w pamięci",
      studentInstruction: "Oblicz wynik i ustaw cyfry przyciskami +/−.", teacherInstruction: "Uczniowie rozwiązują 10 losowych przykładów po kolei.", estimatedMinutes: 25,
      live: { enabled: true, kind: "exercise", minutes: 25 },
      board: { layout: "model", headline: "Obliczenia pamięciowe", modelId: "mental-add-sub-lesson", modelSeed: 2 },
      student: { activityMode: "respond", instruction: "Wykonaj 10 przykładów. Cyfra jedności pozostaje zablokowana na zero.", modelId: "mental-add-sub-lesson", modelSeed: 2 },
    }, questions(2, 10)),
  ],
};
