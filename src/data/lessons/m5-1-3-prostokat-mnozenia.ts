import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const questions = (stage: number, count: number) => Array.from({ length: count }, (_, index) => ({ id: `m5-1-3-${stage}-task-${index + 1}`, generatorId: "mental-mul-div-v1", seed: stage * 1000 + index + 1, difficulty: "core" as const }));

export const m513ProstokatMnozeniaV1: LessonPackage = {
  id: "m5-1-3-prostokat-mnozenia-v1", version: 3, curriculumId: "pl-math-5-2026-classic", sectionId: "M5-S1", topicId: "M5-1.3", lessonNumber: 3,
  title: "Mnożenie i dzielenie w pamięci", estimatedMinutes: 45,
  studentGoal: "Rozpoznaję elementy mnożenia i dzielenia, wykonuję obliczenia pamięciowe, dzielę z resztą i zamieniam jednostki bez ułamków dziesiętnych.",
  successCriteria: ["Nazywam czynniki, iloczyn, dzielną, dzielnik i iloraz.", "Obliczam iloczyny, ilorazy i dzielenie z resztą.", "Zamieniam jednostki pieniędzy, długości i masy w obu kierunkach."],
  learningGoals: [
    {
      id: "m5-1-3-goal-language",
      studentGoal: "Nauczę się poprawnie nazywać liczby i wyniki w mnożeniu oraz dzieleniu.",
      successCriteria: ["Potrafię wskazać czynniki i iloczyn oraz dzielną, dzielnik i iloraz."],
      curriculumReferences: ["Cel ogólny II.3 — używanie języka matematycznego"],
    },
    {
      id: "m5-1-3-goal-calculate",
      studentGoal: "Mnożenie i dzielenie liczb naturalnych w pamięci w prostych przypadkach.",
      successCriteria: ["Potrafię obliczyć proste iloczyny i ilorazy oraz sprawdzić dzielenie mnożeniem."],
      curriculumReferences: ["Klasy IV–VI, II.3"],
    },
    {
      id: "m5-1-3-goal-remainder",
      studentGoal: "Nauczę się dzielić z resztą i sprawdzać, czy reszta jest poprawna.",
      successCriteria: ["Potrafię podać iloraz i resztę oraz sprawdzić, że reszta jest mniejsza od dzielnika."],
      curriculumReferences: ["Klasy IV–VI, II.15"],
    },
    {
      id: "m5-1-3-goal-units",
      studentGoal: "Nauczę się zamieniać jednostki pieniędzy, długości i masy.",
      successCriteria: ["Potrafię zamieniać złote i grosze, metry i centymetry oraz kilogramy i gramy w obu kierunkach."],
      curriculumReferences: ["Klasy IV–VI, XII.6", "Klasy IV–VI, XII.7"],
    },
  ],
  prerequisiteSkillIds: ["M5-1.2-mental-add-sub"], skillIds: ["M5-1.3-operation-language", "M5-1.3-mental-mul-div", "M5-1.3-remainder", "M5-1.3-units"], printableResourceIds: [], status: "published",
  teacherGuide: {
    overview: "Osiem slajdów: podręcznik, język działań, obliczenia, reszta oraz cztery stacje jednostek.", timingNotes: "45 minut: 7+5+10+7 oraz cztery stacje po 4 minuty.", materials: ["Tablica", "Urządzenia uczniów", "Podręcznik"],
    stageNotes: {
      "m5-1-3-book": "Ustaw stronę i zadanie.", "m5-1-3-names": "Jedno zadanie z sześcioma etykietami.", "m5-1-3-calc": "Pięć różnych typów obliczeń.", "m5-1-3-rem": "Uczeń osobno ustawia iloraz całkowity i resztę.",
      "m5-1-3-zl-gr": "Dwa przykłady zł → gr.", "m5-1-3-gr-zl": "Dwa przykłady gr → zł.", "m5-1-3-length": "Dwa kierunki długości.", "m5-1-3-mass": "Dwa kierunki masy.",
    },
    commonMisconceptions: ["Mylenie dzielnej z dzielnikiem.", "Reszta większa lub równa dzielnikowi.", "Zmiana jednostki bez użycia właściwego przelicznika."],
    differentiation: { support: "Pozwól korzystać z tabliczki mnożenia.", core: "Wykonaj wszystkie zadania.", challenge: "Poproś o kontrolę dzielenia za pomocą mnożenia." },
    openingScript: "Zaczynamy od podręcznika, potem przechodzimy od języka działań do jednostek.", closingScript: "Sprawdź w podsumowaniu, czy trudniejsze było liczenie, reszta czy zamiana jednostek.", exitTicketRubric: "17 zapisanych odpowiedzi.", paperWithoutDevices: "Analogiczne zadania wykonaj w tabeli pozycyjnej.", languageReview: "Czynnik × czynnik = iloczyn; dzielna : dzielnik = iloraz.",
  },
  stages: [
    createLessonStage({ id: "m5-1-3-book", kind: "warmup", title: "Podręcznik — strona i zadanie", studentInstruction: "Otwórz wskazaną stronę i zadanie.", teacherInstruction: "Ustaw stronę i zadanie przyciskami +/−.", estimatedMinutes: 7, live: { enabled: true, kind: "presentation", minutes: 7 }, board: { layout: "model", headline: "Praca z podręcznikiem", modelId: "exercise-board", modelSeed: 1 }, student: { activityMode: "view", instruction: "Pracuj z podręcznikiem." } }),
    createLessonStage({ id: "m5-1-3-names", kind: "explore", title: "Nazwy mnożenia i dzielenia", studentInstruction: "Przenieś nazwy do właściwych kratek.", teacherInstruction: "Nie podawaj odpowiedzi przed wysłaniem.", estimatedMinutes: 5, live: { enabled: true, kind: "exercise", minutes: 5 }, board: { layout: "model", headline: "Czynniki i iloraz", modelId: "mental-mul-div-lesson", modelSeed: 1 }, student: { activityMode: "respond", instruction: "Uzupełnij sześć etykiet.", modelId: "mental-mul-div-lesson", modelSeed: 1 } }, questions(1, 1)),
    createLessonStage({ id: "m5-1-3-calc", kind: "practice", title: "Mnożenie i dzielenie w pamięci", studentInstruction: "Oblicz i zbuduj wynik cyframi.", teacherInstruction: "Pięć przykładów po kolei.", estimatedMinutes: 10, live: { enabled: true, kind: "exercise", minutes: 10 }, board: { layout: "model", headline: "Obliczenia pamięciowe", modelId: "mental-mul-div-lesson", modelSeed: 2 }, student: { activityMode: "respond", instruction: "Wykonaj pięć przykładów.", modelId: "mental-mul-div-lesson", modelSeed: 2 } }, questions(2, 5)),
    createLessonStage({ id: "m5-1-3-rem", kind: "practice", title: "Dzielenie z resztą", studentInstruction: "Ustaw liczbę całych i resztę.", teacherInstruction: "Przypomnij, że reszta jest mniejsza od dzielnika.", estimatedMinutes: 7, live: { enabled: true, kind: "exercise", minutes: 7 }, board: { layout: "model", headline: "Iloraz i reszta", modelId: "mental-mul-div-lesson", modelSeed: 3 }, student: { activityMode: "respond", instruction: "Wykonaj trzy dzielenia z resztą.", modelId: "mental-mul-div-lesson", modelSeed: 3 } }, questions(3, 3)),
    createLessonStage({ id: "m5-1-3-zl-gr", kind: "practice", title: "Złotówki na grosze", studentInstruction: "Zamień złotówki na grosze.", teacherInstruction: "Bez zapisu dziesiętnego.", estimatedMinutes: 4, live: { enabled: true, kind: "exercise", minutes: 4 }, board: { layout: "model", headline: "1 zł = 100 gr", modelId: "mental-mul-div-lesson", modelSeed: 4 }, student: { activityMode: "respond", instruction: "Wykonaj dwa przykłady.", modelId: "mental-mul-div-lesson", modelSeed: 4 } }, questions(4, 2)),
    createLessonStage({ id: "m5-1-3-gr-zl", kind: "practice", title: "Grosze na złotówki", studentInstruction: "Zamień grosze na pełne złotówki.", teacherInstruction: "Wszystkie kwoty są podzielne przez 100.", estimatedMinutes: 4, live: { enabled: true, kind: "exercise", minutes: 4 }, board: { layout: "model", headline: "100 gr = 1 zł", modelId: "mental-mul-div-lesson", modelSeed: 5 }, student: { activityMode: "respond", instruction: "Wykonaj dwa przykłady.", modelId: "mental-mul-div-lesson", modelSeed: 5 } }, questions(5, 2)),
    createLessonStage({ id: "m5-1-3-length", kind: "practice", title: "Jednostki długości", studentInstruction: "Zamień metry i centymetry w obu kierunkach.", teacherInstruction: "Każdy wynik jest całkowity.", estimatedMinutes: 4, live: { enabled: true, kind: "exercise", minutes: 4 }, board: { layout: "model", headline: "1 m = 100 cm", modelId: "mental-mul-div-lesson", modelSeed: 6 }, student: { activityMode: "respond", instruction: "Dwa przykłady — po jednym w każdym kierunku.", modelId: "mental-mul-div-lesson", modelSeed: 6 } }, questions(6, 2)),
    createLessonStage({ id: "m5-1-3-mass", kind: "exit-ticket", title: "Jednostki masy", studentInstruction: "Zamień kilogramy i gramy w obu kierunkach.", teacherInstruction: "Każdy wynik jest całkowity.", estimatedMinutes: 4, live: { enabled: true, kind: "exercise", minutes: 4 }, board: { layout: "model", headline: "1 kg = 1000 g", modelId: "mental-mul-div-lesson", modelSeed: 7 }, student: { activityMode: "respond", instruction: "Dwa przykłady — po jednym w każdym kierunku.", modelId: "mental-mul-div-lesson", modelSeed: 7 } }, questions(7, 2)),
  ],
};
