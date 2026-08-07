import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-1-8-${suffix}-${index + 1}`,
    generatorId: "grade4-powers-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m418KwadratyISzescianyLiczbV1 = buildLessonPackage({
  id: "m4-1-8-kwadraty-i-szesciany-liczb-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.8",
  lessonNumber: 8,
  title: "Kwadraty i sześciany liczb",
  studentGoal: "Nauczę się czytać, rozpisywać i obliczać proste potęgi liczb.",
  successCriteria: [
    "Wyjaśniam, co oznacza druga i trzecia potęga liczby.",
    "Obliczam kwadraty i sześciany prostych liczb także wtedy, gdy potęga jest zapisana słownie.",
    "Rozpisuję potęgę jako mnożenie odpowiedniej liczby jednakowych czynników.",
  ],
  learningGoals: [
    { id: "m4-1-8-goal-1", studentGoal: "Nauczę się rozumieć zapis kwadratu i sześcianu liczby.", successCriteria: ["Wyjaśniam rolę podstawy i wykładnika potęgi."], curriculumReferences: [] },
    { id: "m4-1-8-goal-2", studentGoal: "Nauczę się obliczać proste kwadraty i sześciany.", successCriteria: ["Poprawnie obliczam potęgi zapisane symbolami i słowami."], curriculumReferences: [] },
    { id: "m4-1-8-goal-3", studentGoal: "Nauczę się rozpisywać także inne potęgi.", successCriteria: ["Zapisuję tyle jednakowych czynników, ile wskazuje wykładnik."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.8-meaning", "M4-1.8-calculation", "M4-1.8-expansion"],
  prerequisiteSkillIds: ["M4-1.3-multiplication"],
  estimatedMinutes: 50,
  coreLesson: "Znaczenie podstawy i wykładnika, obliczanie kwadratów oraz sześcianów, słowne nazwy potęg i rozpisywanie potęg o większych wykładnikach.",
  paperEvidence: "Karta pracy: kwadraty i sześciany, potęgi zapisane słownie oraz rozpisywanie innych potęg na czynniki.",
  overview: "Uczeń poznaje potęgę drugą i trzecią na modelach, oblicza proste potęgi, rozpoznaje zapis słowny, a następnie poznaje i ćwiczy rozpisywanie innych potęg.",
  openingScript: "Pokaż kwadrat z 4 rzędami po 4 pola oraz trzy warstwy po 3 · 3 pola. Powiąż modele z zapisami 4² i 3³.",
  closingScript: "Poproś ucznia, aby wyjaśnił własnymi słowami, czym różni się podstawa potęgi od wykładnika.",
  commonMisconceptions: [
    "Uczeń mnoży podstawę przez wykładnik, np. uznaje 4² za 4 · 2.",
    "Uczeń zapisuje za mało lub za dużo jednakowych czynników.",
    "Uczeń myli potęgę drugą z potęgą trzecią w zapisie słownym.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Co oznaczają potęgi druga i trzecia?", minutes: 10,
      headline: "Kwadrat i sześcian liczby", body: "Wykładnik mówi, ile razy zapisujemy tę samą podstawę jako czynnik.",
      modelId: "grade4-powers-lab", modelSeed: 481,
      studentInstruction: "Porównaj modele i zapisy 4² = 4 · 4 oraz 3³ = 3 · 3 · 3.",
      teacherInstruction: "Nazwij podstawę oraz wykładnik. Wyraźnie zaznacz, że potęga nie oznacza mnożenia podstawy przez wykładnik.",
    },
    {
      suffix: "calculate", kind: "practice", title: "Oblicz kwadraty i sześciany", minutes: 12,
      headline: "Proste potęgi", body: "Rozpisz potęgę jako mnożenie i wpisz wynik.",
      modelId: "grade4-powers-lab", modelSeed: 482, questions: questions("calculate", 8, "M4-1.8-calculation", 48100), preserveTaskTitle: true,
      studentInstruction: "Rozwiąż osiem przykładów. W każdym najpierw pomyśl, jakie czynniki należy pomnożyć.",
      teacherInstruction: "Pytaj o pełne rozwinięcie potęgi przed zatwierdzeniem wyniku.",
    },
    {
      suffix: "words", kind: "practice", title: "Potęgi zapisane słownie", minutes: 8,
      headline: "Od nazwy do wyniku", body: "Przeczytaj polecenie, rozpoznaj podstawę i wykładnik, a potem oblicz.",
      modelId: "grade4-powers-lab", modelSeed: 483, questions: questions("words", 5, "M4-1.8-calculation", 48200), preserveTaskTitle: true,
      studentInstruction: "Oblicz pięć potęg podanych słowami, np. „osiem do potęgi drugiej”.",
      teacherInstruction: "Nie pokazuj zapisu symbolicznego przed odpowiedzią — uczeń ma sam rozpoznać potęgę z tekstu.",
    },
    {
      suffix: "curiosity", kind: "explore", title: "Ciekawostka: inne potęgi", minutes: 7,
      headline: "Potęgi czwarte, piąte i kolejne", body: "Każdą potęgę można rozpisać jako mnożenie jednakowych czynników.",
      modelId: "grade4-powers-lab", modelSeed: 484,
      studentInstruction: "Obejrzyj przykłady 2⁴ oraz 3⁵ i policz zapisane czynniki.",
      teacherInstruction: "To rozszerzenie intuicji, nie pamięciowe obliczanie dużych wartości.",
    },
    {
      suffix: "expand", kind: "exit-ticket", title: "Rozpisz potęgę", minutes: 8,
      headline: "Wybierz poprawne mnożenie", body: "Dopasuj potęgę do zapisu z właściwą liczbą jednakowych czynników.",
      modelId: "grade4-powers-lab", modelSeed: 485, questions: questions("expand", 5, "M4-1.8-expansion", 48300), preserveTaskTitle: true,
      studentInstruction: "W pięciu zadaniach wybierz pełne rozwinięcie podanej potęgi.",
      teacherInstruction: "Zwróć uwagę, czy uczeń nie wybiera iloczynu podstawy i wykładnika.",
    },
  ],
  status: "published",
});
