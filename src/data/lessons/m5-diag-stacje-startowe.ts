import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const REVIEW_STATIONS = [
  { title: "Fabryka wartości", count: 5, minutes: 4 },
  { title: "Wyścig liczb", count: 5, minutes: 4 },
  { title: "Oś liczbowa", count: 5, minutes: 4 },
  { title: "Zaokrąglarka", count: 5, minutes: 4 },
  { title: "Kasa matematyczna", count: 5, minutes: 4 },
  { title: "Rzędy i kolumny", count: 3, minutes: 3 },
  { title: "Paczki z resztą", count: 3, minutes: 3 },
  { title: "Pizza ułamków", count: 3, minutes: 3 },
  { title: "Park figur", count: 4, minutes: 3 },
  { title: "Wykres odkrywcy", count: 3, minutes: 3 },
] as const;

const REVIEW_SLIDES = REVIEW_STATIONS.map((station, index) => {
  const stationNumber = index + 1;
  return createLessonStage({
    id: `m5-diag-r${stationNumber}`,
    kind: index === 0 ? "warmup" : "practice",
    title: station.title,
    studentInstruction: `Rozwiąż ${station.count} kolejnych, losowych zadań. Każdą odpowiedź wyślij osobno.`,
    teacherInstruction: `Uczniowie rozwiązują ${station.count} zadań. W prywatnym panelu widać postęp i wyniki; tablica nie pokazuje odpowiedzi.`,
    estimatedMinutes: station.minutes,
    live: { enabled: true, kind: "exercise", minutes: station.minutes },
    board: {
      layout: "model",
      headline: station.title,
      modelId: "class4-review",
      modelSeed: stationNumber,
    },
    student: {
      activityMode: "respond",
      instruction: `Wykonaj zadania po kolei (${station.count}). Nie spiesz się — odpowiedź zatwierdzasz przed przejściem dalej.`,
      modelId: "class4-review",
      modelSeed: stationNumber,
    },
  }, Array.from({ length: station.count }, (_, taskIndex) => ({
    id: `m5-diag-review-${stationNumber}-${taskIndex + 1}`,
    generatorId: "class4-review-v1",
    seed: stationNumber * 1000 + taskIndex + 1,
    difficulty: "core" as const,
  })));
});

export const m5DiagStacjeStartoweV1: LessonPackage = {
  id: "m5-diag-stacje-startowe-v1",
  version: 3,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S0",
  topicId: "M5-DIAG",
  lessonNumber: 1,
  title: "Diagnoza startowa — 10 stacji klasy IV",
  estimatedMinutes: 35,
  studentGoal: "Krótka, multimedialna powtórka najważniejszych umiejętności z klasy IV w formie konkretnych zadań.",
  successCriteria: ["Rozwiązuję zadania na każdej stacji.", "Wysyłam każdą odpowiedź nauczycielowi."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-DIAG-start"],
  printableResourceIds: [],
  status: "published",
  teacherGuide: {
    overview: "Dziesięć stacji zadaniowych. Każda zawiera serię losowanych przykładów, a odpowiedzi są zapisywane na żywo.",
    timingNotes: "Przejdź przez stacje w tempie klasy. Postęp każdego ucznia jest widoczny w panelu prowadzącego.",
    materials: ["Ekran nauczyciela", "Urządzenia uczniów"],
    stageNotes: Object.fromEntries(REVIEW_SLIDES.map((stage) => [stage.id, "Nie rozwiązuj zadania na tablicy przed wysłaniem odpowiedzi przez uczniów."])),
    commonMisconceptions: ["Publiczne pokazywanie poprawnej odpowiedzi przed zakończeniem zadania."],
    differentiation: { support: "Daj więcej czasu.", core: "Wykonaj wszystkie stacje.", challenge: "Poproś o ustne uzasadnienie wybranej odpowiedzi." },
    openingScript: "Każde zadanie rozwiązujesz samodzielnie i wysyłasz jedną odpowiedź.",
    closingScript: "Sprawdźmy, do których umiejętności warto wrócić.",
    exitTicketRubric: "Wynik diagnostyczny, bez oceny.",
    paperWithoutDevices: "Ta lekcja wymaga trybu live na urządzeniach uczniów.",
    languageReview: "Informacja zwrotna jest prywatna i nie etykietuje ucznia.",
  },
  stages: REVIEW_SLIDES,
};
