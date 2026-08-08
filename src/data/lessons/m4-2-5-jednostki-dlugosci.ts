import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-5-${suffix}-${index + 1}`,
    generatorId: "grade4-length-units-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m425JednostkiDlugosciV1 = buildLessonPackage({
  id: "m4-2-5-jednostki-dlugosci-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.5",
  lessonNumber: 1,
  title: "Jednostki długości",
  studentGoal: "Nauczę się dobierać i zamieniać jednostki długości.",
  successCriteria: [
    "Dobieram odpowiednią jednostkę do mierzonego obiektu lub odległości.",
    "Zamieniam mm, cm, dm, m i km.",
    "Rozwiązuję zadania z długościami zapisanymi w różnych jednostkach.",
  ],
  learningGoals: [
    { id: "m4-2-5-goal-1", studentGoal: "Nauczę się dobierać jednostkę długości.", successCriteria: ["Wybieram jednostkę pasującą do rzeczywistego obiektu lub trasy."], curriculumReferences: [] },
    { id: "m4-2-5-goal-2", studentGoal: "Nauczę się zamieniać jednostki długości.", successCriteria: ["Poprawnie zamieniam mm, cm, dm, m i km, także w zapisie łączonym."], curriculumReferences: [] },
    { id: "m4-2-5-goal-3", studentGoal: "Wykorzystam długości w zadaniu z trasą.", successCriteria: ["Sprowadzam odległości do zgodnych jednostek i obliczam długość drogi."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.5-choose", "M4-2.5-convert", "M4-2.5-route"],
  prerequisiteSkillIds: ["M4-2.1-place-value", "M4-1.1-add-sub"],
  estimatedMinutes: 45,
  coreLesson: "Dobór jednostki długości, zależności między mm, cm, dm, m i km, zamiany proste i zapis łączony oraz obliczanie długości trasy.",
  paperEvidence: "Karta ucznia: tabela jednostek, zamiany długości i obliczenie trasy z drogowskazu.",
  overview: "Uczeń poznaje jednostki od milimetra do kilometra, dobiera je do rzeczywistych obiektów, obserwuje zamiany, ćwiczy zapis pojedynczy i łączony, a na końcu rozwiązuje zadanie z trasą.",
  openingScript: "Pokaż śrubkę, linijkę i mapę. Zapytaj, czy każdą z tych długości wygodnie byłoby podać w tej samej jednostce.",
  closingScript: "Poproś ucznia, aby podał przykład długości mierzonej w mm, cm, m i km oraz wykonał jedną zamianę.",
  commonMisconceptions: [
    "Uczeń przyjmuje, że każda sąsiednia jednostka różni się zawsze sto razy.",
    "Uczeń zamienia 1 km na 100 m zamiast 1000 m.",
    "Uczeń w zapisie 3 cm 5 mm odczytuje 5 mm jako 50 mm.",
    "Uczeń dodaje odległości zapisane w różnych jednostkach bez wcześniejszej zamiany.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Jednostki długości", minutes: 7,
      headline: "Od milimetra do kilometra", body: "Poznaj symbole jednostek i najważniejsze zależności.",
      modelId: "grade4-length-units-lab", modelSeed: 4251,
      studentInstruction: "Przeczytaj nazwy jednostek i porównaj ich wielkość.",
      teacherInstruction: "Połącz każdą jednostkę z konkretnym przedmiotem lub odległością.",
    },
    {
      suffix: "choose-unit", kind: "practice", title: "Dobierz jednostkę", minutes: 7,
      headline: "Jaka jednostka pasuje?", body: "Dobierz mm, cm, m lub km do rzeczywistego przykładu.",
      modelId: "grade4-length-units-lab", modelSeed: 4252, questions: questions("choose-unit", 6, "M4-2.5-choose", 425100), preserveTaskTitle: true,
      studentInstruction: "Wybierz jednostkę, w której najwygodniej podać daną długość.",
      teacherInstruction: "Po każdej odpowiedzi poproś o krótkie uzasadnienie wyboru.",
    },
    {
      suffix: "conversion-example", kind: "worked-example", title: "Jak zamieniamy jednostki?", minutes: 7,
      headline: "Najpierw sprawdź zależność", body: "Zobacz zamianę prostą oraz zapis łączony.",
      modelId: "grade4-length-units-lab", modelSeed: 4253,
      studentInstruction: "Prześledź, ile mniejszych jednostek mieści się w większej.",
      teacherInstruction: "Nie podawaj jednej reguły dla wszystkich par jednostek; odwołuj się do konkretnej zależności.",
    },
    {
      suffix: "convert", kind: "practice", title: "Zamiana jednostek", minutes: 15,
      headline: "Uzupełnij zapis", body: "Zamień długości, także na zapis złożony z dwóch jednostek.",
      modelId: "grade4-length-units-lab", modelSeed: 4254, questions: questions("convert", 8, "M4-2.5-convert", 425200), preserveTaskTitle: true,
      studentInstruction: "Dotknij właściwej kratki i wpisz wynik klawiaturą lekcji.",
      teacherInstruction: "Przy zapisie łączonym sprawdź osobno pełne większe jednostki i pozostałą część.",
    },
    {
      suffix: "route", kind: "challenge", title: "Trasa z drogowskazu", minutes: 9,
      headline: "Oblicz długość drogi", body: "Połącz metry i kilometry w jednym zadaniu.",
      modelId: "grade4-length-units-lab", modelSeed: 4255, questions: questions("route", 1, "M4-2.5-route", 425300), preserveTaskTitle: true,
      studentInstruction: "Zamień odległości na zgodne jednostki, dodaj je i zapisz wynik w km i m.",
      teacherInstruction: "Pozwól uczniowi zaznaczyć na rysunku każdy pokonywany odcinek, w tym drogę powrotną.",
    },
  ],
  status: "published",
});
