import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

export const m5DiagStacjeStartoweV1: LessonPackage = {
  id: "m5-diag-stacje-startowe-v1",
  version: 1,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S0",
  topicId: "M5-DIAG",
  lessonNumber: 1,
  title: "Diagnoza startowa — Stacje klasy V",
  estimatedMinutes: 45,
  studentGoal: "Uczeń przypomina sobie strategie z klasy IV podczas krótkich, nieocenianych stacji.",
  successCriteria: ["Podejmuje próbę na każdej stacji.", "Wspólnie z klasą nazywa obszar do przypomnienia."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-DIAG-start"],
  printableResourceIds: [],
  status: "published",
  teacherGuide: {
    overview: "Nieoceniana diagnoza wejściowa. Tablica zajmuje około 20 minut; nauczyciel wybiera później własne ćwiczenia z podręcznika.",
    timingNotes: "45 min: 3 min wejście, 7 min stacje, 7 min ćwiczenia z podręcznika, 3 min wspólne podsumowanie, 25 min swobodna praca nauczyciela z książką lub kartą.",
    materials: ["Tablica interaktywna", "Podręcznik i zeszyt ćwiczeń nauczyciela", "Tablety tylko jeśli nauczyciel je włączy"],
    stageNotes: { "m5-diag-s1": "Nie tłumacz reguł — obserwuj sposób podejmowania decyzji.", "m5-diag-s2": "Prowadź stacje na tablicy; możesz uruchomić je uczniom na tabletach.", "m5-diag-s3": "Ślepy slajd. Realizuj własne zadania z ćwiczeń; platforma niczego nie narzuca.", "m5-diag-s4": "Zamknij jednym pytaniem ustnym: co warto przypomnieć?" },
    commonMisconceptions: ["Traktowanie diagnozy jak ocenianego sprawdzianu."],
    differentiation: { support: "Prowadź tylko pierwsze dwie stacje wspólnie.", core: "Wykonaj cztery stacje.", challenge: "Poproś o uzasadnienie wyboru bez zapisywania." },
    openingScript: "Dzisiaj sprawdzamy mapę startową klasy, nie wystawiamy ocen.",
    closingScript: "Wybieramy, co warto przypomnieć przed następnym działem.",
    exitTicketRubric: "Brak punktów i brak oceny.",
    paperWithoutDevices: "Nauczyciel realizuje własne ćwiczenia z podręcznika na slajdzie Ćwiczenia.",
    languageReview: "Stacje, strategia, przypomnienie — bez etykiet łatwe/trudne.",
  },
  stages: [
    createLessonStage({ id: "m5-diag-s1", kind: "warmup", title: "Start", studentInstruction: "Spójrz na tablicę i wybierz sposób działania.", teacherInstruction: "Wprowadź bez oceny.", estimatedMinutes: 5, live: { enabled: true, kind: "presentation", minutes: 3 }, board: { layout: "narrative", headline: "Startujemy bez ocen", body: "Dziś odkrywamy, co klasa już pamięta. Wybieramy, przesuwamy i rozmawiamy — nic nie wpisujemy." } }),
    createLessonStage({ id: "m5-diag-s2", kind: "explore", title: "Stacje", studentInstruction: "Wybierz stację na tablecie lub pracuj z tablicą.", teacherInstruction: "Prowadź maksymalnie cztery krótkie stacje.", estimatedMinutes: 12, live: { enabled: true, kind: "exercise", minutes: 7 }, board: { layout: "model", headline: "Stacje startowe", modelId: "diagnostic-stations", modelSeed: 1 }, student: { activityMode: "practice", instruction: "Dotykaj, przeciągaj i wybieraj — bez wpisywania odpowiedzi.", modelId: "diagnostic-stations", modelSeed: 1 } }),
    createLessonStage({ id: "m5-diag-s3", kind: "practice", title: "Ćwiczenia z podręcznika", studentInstruction: "Wykonuj wskazane przez nauczyciela ćwiczenia.", teacherInstruction: "Tu przejmujesz pełną kontrolę: podręcznik, zeszyt ćwiczeń, własne pytania.", estimatedMinutes: 20, live: { enabled: true, kind: "exercise", minutes: 7 }, board: { layout: "narrative", headline: "Ćwiczenia z podręcznika", body: "Nauczyciel wybiera zadania i tempo. Ten slajd nie pokazuje odpowiedzi ani gotowej ścieżki." } }),
    createLessonStage({ id: "m5-diag-s4", kind: "discuss", title: "Mapa klasy", studentInstruction: "Pokaż gestem, do czego warto wrócić.", teacherInstruction: "Zbierz sygnały i wybierz pierwszy temat działu 1.", estimatedMinutes: 8, live: { enabled: true, kind: "quick-check", minutes: 3 }, board: { layout: "narrative", headline: "Co przypominamy przed działem 1?", body: "Nie oceniamy. Nauczyciel zapisuje własną decyzję w planie klasy." } }),
  ],
};
