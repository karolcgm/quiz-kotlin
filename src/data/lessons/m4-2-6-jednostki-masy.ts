import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-6-${suffix}-${index + 1}`,
    generatorId: "grade4-mass-units-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m426JednostkiMasyV1 = buildLessonPackage({
  id: "m4-2-6-jednostki-masy-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.6",
  lessonNumber: 1,
  title: "Jednostki masy",
  studentGoal: "Nauczę się dobierać i zamieniać jednostki masy oraz rozumieć masę netto i brutto.",
  successCriteria: [
    "Dobieram odpowiednią jednostkę masy do rzeczywistego przedmiotu.",
    "Zamieniam g, dag, kg i t, także w zapisie łączonym.",
    "Rozwiązuję zadania z przepisem oraz masą netto, tarą i masą brutto.",
  ],
  learningGoals: [
    { id: "m4-2-6-goal-1", studentGoal: "Nauczę się dobierać jednostkę masy.", successCriteria: ["Wybieram g, dag, kg lub t odpowiednio do ważonego przedmiotu."], curriculumReferences: [] },
    { id: "m4-2-6-goal-2", studentGoal: "Nauczę się zamieniać jednostki masy.", successCriteria: ["Poprawnie zamieniam g, dag, kg i t, także w zapisie łączonym."], curriculumReferences: [] },
    { id: "m4-2-6-goal-3", studentGoal: "Wykorzystam jednostki masy w zadaniach z życia.", successCriteria: ["Obliczam masę składników oraz masę netto, tarę lub masę brutto."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.6-choose", "M4-2.6-convert", "M4-2.6-net-gross", "M4-2.6-recipe"],
  prerequisiteSkillIds: ["M4-2.1-place-value", "M4-1.1-add-sub", "M4-1.3-mul-div"],
  estimatedMinutes: 45,
  coreLesson: "Dobór jednostki masy, zależności między g, dag, kg i t, zamiany proste i zapis łączony, masa netto, tara, masa brutto oraz zadanie z przepisem.",
  paperEvidence: "Karta ucznia: tabela jednostek, zamiany masy, obliczenia netto–tara–brutto i zadanie z przepisem.",
  overview: "Uczeń poznaje jednostki od grama do tony, dobiera je do rzeczywistych przedmiotów, ćwiczy zamiany, rozróżnia masę netto, tarę i masę brutto, a na końcu wykorzystuje jednostki w przepisie.",
  openingScript: "Pokaż tabliczkę czekolady, torbę mąki i zdjęcie ciężarówki. Zapytaj, czy ich masy wygodnie byłoby podać w tej samej jednostce.",
  closingScript: "Poproś ucznia, aby podał przykład masy mierzonej w g, dag, kg i t oraz wyjaśnił różnicę między masą netto i brutto.",
  commonMisconceptions: [
    "Uczeń przyjmuje, że każda sąsiednia jednostka masy różni się dziesięć razy.",
    "Uczeń zamienia 1 kg na 10 dag zamiast 100 dag.",
    "Uczeń myli masę netto z masą brutto.",
    "Uczeń dodaje masy zapisane w różnych jednostkach bez wcześniejszej zamiany.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Jednostki masy", minutes: 6,
      headline: "Od grama do tony", body: "Poznaj symbole jednostek i najważniejsze zależności.",
      modelId: "grade4-mass-units-lab", modelSeed: 4261,
      studentInstruction: "Przeczytaj nazwy jednostek i porównaj ich wielkość.",
      teacherInstruction: "Połącz każdą jednostkę z konkretnym ważonym przedmiotem.",
    },
    {
      suffix: "choose-unit", kind: "practice", title: "Dobierz jednostkę", minutes: 6,
      headline: "Jaka jednostka pasuje?", body: "Dobierz g, dag, kg lub t do rzeczywistego przykładu.",
      modelId: "grade4-mass-units-lab", modelSeed: 4262, questions: questions("choose-unit", 6, "M4-2.6-choose", 426100), preserveTaskTitle: true,
      studentInstruction: "Wybierz jednostkę, w której najwygodniej podać daną masę.",
      teacherInstruction: "Po każdej odpowiedzi poproś o krótkie uzasadnienie wyboru.",
    },
    {
      suffix: "conversion-example", kind: "worked-example", title: "Jak zamieniamy jednostki?", minutes: 6,
      headline: "Najpierw sprawdź zależność", body: "Zobacz zamianę prostą oraz zapis łączony.",
      modelId: "grade4-mass-units-lab", modelSeed: 4263,
      studentInstruction: "Prześledź, ile mniejszych jednostek mieści się w większej.",
      teacherInstruction: "Odwołuj się do konkretnej zależności: 10, 100 albo 1000.",
    },
    {
      suffix: "convert", kind: "practice", title: "Zamiana jednostek", minutes: 13,
      headline: "Uzupełnij zapis", body: "Zamień masy, także na zapis złożony z dwóch jednostek.",
      modelId: "grade4-mass-units-lab", modelSeed: 4264, questions: questions("convert", 8, "M4-2.6-convert", 426200), preserveTaskTitle: true,
      studentInstruction: "Dotknij właściwej kratki i wpisz wynik klawiaturą lekcji.",
      teacherInstruction: "Przy zapisie łączonym sprawdź osobno pełne większe jednostki i pozostałą część.",
    },
    {
      suffix: "net-gross", kind: "practice", title: "Masa netto i brutto", minutes: 8,
      headline: "Produkt i opakowanie", body: "Rozróżnij masę produktu, opakowania i całości.",
      modelId: "grade4-mass-units-lab", modelSeed: 4265, questions: questions("net-gross", 4, "M4-2.6-net-gross", 426300), preserveTaskTitle: true,
      studentInstruction: "Przeczytaj, czego szukasz, i wykonaj odpowiednie dodawanie lub odejmowanie.",
      teacherInstruction: "Wskaż na ilustracji produkt, puste opakowanie oraz całość stojącą na wadze.",
    },
    {
      suffix: "recipe", kind: "challenge", title: "Przepis na owocowe muffinki", minutes: 6,
      headline: "Ile ważą składniki?", body: "Zamień dekagramy na gramy i oblicz łączną masę.",
      modelId: "grade4-mass-units-lab", modelSeed: 4266, questions: questions("recipe", 1, "M4-2.6-recipe", 426400), preserveTaskTitle: true,
      studentInstruction: "Zapisz wszystkie składniki w gramach, a następnie dodaj ich masy.",
      teacherInstruction: "Poproś ucznia o wskazanie, które dane trzeba najpierw zamienić.",
    },
  ],
  status: "published",
});
