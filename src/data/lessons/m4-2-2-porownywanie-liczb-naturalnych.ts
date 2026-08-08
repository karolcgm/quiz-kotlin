import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-2-${suffix}-${index + 1}`,
    generatorId: "grade4-natural-number-comparison-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m422PorownywanieLiczbNaturalnychV1 = buildLessonPackage({
  id: "m4-2-2-porownywanie-liczb-naturalnych-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.2",
  lessonNumber: 1,
  title: "Porównywanie liczb naturalnych",
  studentGoal: "Nauczę się porównywać i porządkować liczby naturalne.",
  successCriteria: [
    "Poprawnie wybieram znak >, < lub =.",
    "Układam liczby rosnąco i malejąco.",
    "Dobieram brakującą cyfrę tak, aby nierówność była prawdziwa.",
  ],
  learningGoals: [
    { id: "m4-2-2-goal-1", studentGoal: "Nauczę się porównywać dwie liczby naturalne.", successCriteria: ["Wybieram znak >, < lub = i uzasadniam wybór pierwszą różną cyfrą."], curriculumReferences: [] },
    { id: "m4-2-2-goal-2", studentGoal: "Nauczę się porządkować kilka liczb.", successCriteria: ["Układam liczby od najmniejszej do największej i od największej do najmniejszej."], curriculumReferences: [] },
    { id: "m4-2-2-goal-3", studentGoal: "Nauczę się uzupełniać zapis porównania.", successCriteria: ["Znajduję cyfrę spełniającą podany warunek."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.2-compare", "M4-2.2-order", "M4-2.2-missing-digit"],
  prerequisiteSkillIds: ["M4-2.1-place-value"],
  estimatedMinutes: 45,
  coreLesson: "Znaki >, < i =, porównywanie liczb od najwyższego rzędu, porządkowanie rosnące i malejące oraz dobieranie brakującej cyfry.",
  paperEvidence: "Karta ucznia: porównania liczb, dwa uporządkowane ciągi i uzupełnione nierówności.",
  overview: "Uczeń poznaje znaczenie znaków porównania, ćwiczy porównywanie dużych liczb, układa karty liczb w odpowiedniej kolejności i otwiera sejf cyfr.",
  openingScript: "Pokaż 54 321 i 54 219. Zapytaj, od której strony trzeba rozpocząć porównywanie i która pierwsza różna cyfra rozstrzyga.",
  closingScript: "Poproś ucznia o dokończenie zdań: otwarta strona znaku jest przy…, a porównywanie liczb o tej samej liczbie cyfr zaczynam od…",
  commonMisconceptions: [
    "Uczeń rozpoczyna porównywanie od cyfry jedności.",
    "Uczeń myli kierunek znaków > i <.",
    "Uczeń uważa, że liczba z większą ostatnią cyfrą zawsze jest większa.",
    "Uczeń układa liczby malejąco, gdy polecenie wymaga kolejności rosnącej.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Znaki i sposób porównywania", minutes: 9,
      headline: "Większe, mniejsze czy równe?", body: "Poznaj znaki >, < i = oraz sposób porównywania dużych liczb od lewej strony.",
      modelId: "grade4-natural-number-comparison-lab", modelSeed: 4221,
      studentInstruction: "Sprawdź, gdzie jest otwarta strona znaku, i znajdź pierwszą różną cyfrę w przykładzie.",
      teacherInstruction: "Nie utrwalaj samego skojarzenia obrazkowego. Za każdym razem poproś ucznia o przeczytanie całego zapisu.",
    },
    {
      suffix: "compare", kind: "practice", title: "Wstaw znak", minutes: 11,
      headline: "Wybierz >, < albo =", body: "Zacznij od rozgrzewki, a potem porównaj podchwytliwe liczby z zerami i wieloma wspólnymi cyframi.",
      modelId: "grade4-natural-number-comparison-lab", modelSeed: 4222, questions: questions("compare", 10, "M4-2.2-compare", 422100), preserveTaskTitle: true,
      studentInstruction: "Porównuj cyfry od lewej strony. Nie kieruj się liczbą zer lub dziewiątek ani ostatnią cyfrą.",
      teacherInstruction: "W podchwytliwych przykładach poproś o głośne wskazanie pierwszej pary różnych cyfr — to ona rozstrzyga porównanie.",
    },
    {
      suffix: "order", kind: "practice", title: "Ułóż liczby", minutes: 13,
      headline: "Rosnąco lub malejąco", body: "Dotykaj kart i buduj poprawny ciąg liczb.",
      modelId: "grade4-natural-number-comparison-lab", modelSeed: 4223, questions: questions("order", 6, "M4-2.2-order", 422200), preserveTaskTitle: true,
      studentInstruction: "Sprawdź kierunek porządkowania, a następnie dotykaj kart w odpowiedniej kolejności.",
      teacherInstruction: "Uczeń powinien najpierw wskazać najmniejszą lub największą liczbę, zgodnie z poleceniem.",
    },
    {
      suffix: "digit", kind: "challenge", title: "Sejf cyfr", minutes: 12,
      headline: "Uzupełnij nierówność", body: "Znajdź największą lub najmniejszą cyfrę spełniającą warunek.",
      modelId: "grade4-natural-number-comparison-lab", modelSeed: 4224, questions: questions("digit", 6, "M4-2.2-missing-digit", 422300), preserveTaskTitle: true,
      studentInstruction: "Porównaj liczby do miejsca kratki i wpisz jedną cyfrę za pomocą klawiatury lekcyjnej.",
      teacherInstruction: "Poproś ucznia, aby po wskazaniu pasującej cyfry sprawdził, czy istnieje większa lub mniejsza zgodna z poleceniem.",
    },
  ],
  status: "published",
});
