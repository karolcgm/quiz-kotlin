import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const REVIEW_SLIDES = [
  "Fabryka cyfr", "Wyścig liczb", "Skok po osi", "Zaokrąglarka", "Most do dziesiątki",
  "Rzędy i kolumny", "Paczki z resztą", "Pizza ułamków", "Park figur", "Wykres odkrywcy",
].map((title, index) => createLessonStage({
  id: `m5-diag-r${index + 1}`,
  kind: index === 0 ? "warmup" : "explore",
  title,
  studentInstruction: "Dotykaj, wybieraj i obserwuj obraz — bez wpisywania odpowiedzi.",
  teacherInstruction: "Prowadź widget na ekranie lub włącz tablety. Możesz pominąć slajd, jeśli klasa ma tę umiejętność opanowaną.",
  estimatedMinutes: 2,
  live: { enabled: true, kind: "exercise", minutes: 2 },
  board: { layout: "model", headline: title, modelId: "class4-review", modelSeed: index + 1 },
  student: { activityMode: "practice", instruction: "Wykonaj zadanie dotykiem i wyślij wynik.", modelId: "class4-review", modelSeed: index + 1 },
}, [{ id: `m5-diag-review-${index + 1}`, generatorId: "class4-review-v1", seed: index + 1, difficulty: "core" }]));

export const m5DiagStacjeStartoweV1: LessonPackage = {
  id: "m5-diag-stacje-startowe-v1", version: 2, curriculumId: "pl-math-5-2026-classic", sectionId: "M5-S0", topicId: "M5-DIAG", lessonNumber: 1,
  title: "Diagnoza startowa — 10 stacji klasy IV", estimatedMinutes: 45,
  studentGoal: "Uczeń przypomina sobie najważniejsze obrazy i strategie z klasy IV podczas nieocenianych stacji.",
  successCriteria: ["Podejmuje próbę na wybranych stacjach.", "Rozpoznaje obszar wymagający przypomnienia."], prerequisiteSkillIds: [], skillIds: ["M5-DIAG-start"], printableResourceIds: [], status: "published",
  teacherGuide: {
    overview: "20-minutowa, wizualna powtórka dziesięciu bazowych umiejętności klasy IV. Nauczyciel wybiera tempo i może włączyć tablety.",
    timingNotes: "Live: 10 widgetów po 2 minuty. Pozostałe 25 minut nauczyciel przeznacza na ćwiczenia z podręcznika lub powrót do wybranej stacji.",
    materials: ["Ekran nauczyciela lub tablica", "Tablety opcjonalnie", "Podręcznik nauczyciela"],
    stageNotes: Object.fromEntries(REVIEW_SLIDES.map((stage) => [stage.id, "Obserwuj wybory dzieci; nie oceniaj publicznie i nie zatrzymuj klasy na jednym błędzie."])),
    commonMisconceptions: ["Traktowanie diagnozy jako sprawdzianu."], differentiation: { support: "Wybierz 4–5 najważniejszych stacji.", core: "Przejdź przez 10 stacji.", challenge: "Poproś dziecko o pokazanie drugiej drogi na ekranie." },
    openingScript: "Nie wpisujemy niczego. Patrzymy, przesuwamy i wybieramy.", closingScript: "Nauczyciel wybiera, do czego wrócić z podręcznika.", exitTicketRubric: "Brak punktów.", paperWithoutDevices: "Nauczyciel wybiera analogiczne ćwiczenia z książki.", languageReview: "Bez etykiet łatwe/trudne.",
  },
  stages: [
    ...REVIEW_SLIDES,
    createLessonStage({ id: "m5-diag-book", kind: "practice", title: "Ćwiczenia z podręcznika", studentInstruction: "Wykonuj zadania wskazane przez nauczyciela.", teacherInstruction: "Wybierz zadania z podręcznika i zaznacz je na widgetcie.", estimatedMinutes: 20, board: { layout: "model", headline: "Ćwiczenia", modelId: "exercise-board", modelSeed: 1 } }),
    createLessonStage({ id: "m5-diag-close", kind: "discuss", title: "Dalsza praca", studentInstruction: "Słuchaj ustaleń nauczyciela.", teacherInstruction: "Przejdź do dalszej pracy klasy.", estimatedMinutes: 5, board: { layout: "narrative", headline: "Dalsza praca" } }),
  ],
};
