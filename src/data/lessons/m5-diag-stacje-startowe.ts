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
    createLessonStage({ id: "m5-diag-s1", kind: "warmup", title: "Fabryka liczb", studentInstruction: "Obserwuj, jak zmienia się liczba po przesunięciu cyfry.", teacherInstruction: "Manipuluj cyframi w Fabryce liczb i pytaj klasę o wartość każdej pozycji.", estimatedMinutes: 5, live: { enabled: true, kind: "exercise", minutes: 4 }, board: { layout: "model", headline: "Zbuduj liczbę", modelId: "place-value-factory", modelSeed: 12 } }),
    createLessonStage({ id: "m5-diag-s2", kind: "explore", title: "Stacje", studentInstruction: "Wybierz stację na tablecie lub pracuj z tablicą.", teacherInstruction: "Prowadź maksymalnie cztery krótkie stacje. Na tabletach uczniowie wybierają pierwszy znak działania — bez wpisywania.", estimatedMinutes: 12, live: { enabled: true, kind: "exercise", minutes: 8 }, board: { layout: "model", headline: "Stacje startowe", modelId: "diagnostic-stations", modelSeed: 1 }, student: { activityMode: "practice", instruction: "Dotknij znaku, od którego zaczniesz działanie. Odpowiedź zapisze się po wysłaniu.", modelId: "diagnostic-stations", modelSeed: 1 } }, [{ id: "m5-diag-order-01", generatorId: "order-director-v1", seed: 1042, difficulty: "core" }]),
    createLessonStage({ id: "m5-diag-s3", kind: "practice", title: "Ćwiczenia z podręcznika", studentInstruction: "Wykonuj wskazane przez nauczyciela ćwiczenia.", teacherInstruction: "Tu przejmujesz pełną kontrolę: podręcznik, zeszyt ćwiczeń, własne pytania.", estimatedMinutes: 20, live: { enabled: true, kind: "exercise", minutes: 8 }, board: { layout: "model", headline: "Ćwiczenia z podręcznika", modelId: "exercise-board", modelSeed: 1 } }),
    createLessonStage({ id: "m5-diag-s4", kind: "discuss", title: "Rozmowa nauczyciela", studentInstruction: "Słuchaj ustaleń nauczyciela.", teacherInstruction: "Po zakończeniu Live przejdź do własnej rozmowy lub kolejnego tematu.", estimatedMinutes: 8, board: { layout: "narrative", headline: "Dalsza praca nauczyciela" } }),
  ],
};
