import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (count: number): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m4-1-13-order-${index + 1}`,
  generatorId: "grade4-order-of-operations-l1-v1",
  seed: 413100 + index,
  difficulty: index >= count - 2 ? "challenge" : "core",
  skillIds: ["M4-1.13-order", "M4-1.13-steps"],
}));

export const m4113KolejnoscWykonywaniaDzialanV1 = buildLessonPackage({
  id: "m4-1-13-kolejnosc-wykonywania-dzialan-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.13",
  lessonNumber: 13,
  title: "Kolejność wykonywania działań",
  studentGoal: "Nauczę się obliczać wartość działania w prawidłowej kolejności i zapisywać wyniki kolejnych kroków.",
  successCriteria: ["Wiem, kiedy obliczyć nawias, potęgę, mnożenie lub dzielenie oraz dodawanie lub odejmowanie.", "Działania o tej samej ważności wykonuję od lewej do prawej.", "Zapisuję wynik każdego wykonanego działania w osobnym kroku."],
  learningGoals: [
    { id: "m4-1-13-goal-1", studentGoal: "Nauczę się rozpoznawać kolejność wykonywania działań.", successCriteria: ["Wskazuję, które działanie należy wykonać jako następne."], curriculumReferences: ["Klasy IV–VI, II.9"] },
    { id: "m4-1-13-goal-2", studentGoal: "Nauczę się wykonywać działania o tej samej ważności od lewej do prawej.", successCriteria: ["Poprawnie obliczam przykłady zawierające mnożenie i dzielenie albo dodawanie i odejmowanie."], curriculumReferences: ["Klasy IV–VI, II.9"] },
    { id: "m4-1-13-goal-3", studentGoal: "Nauczę się zapisywać obliczenia krok po kroku.", successCriteria: ["Wpisuję wynik bezpośrednio pod obliczanym fragmentem działania."], curriculumReferences: ["Klasy IV–VI, II.9"] },
  ],
  skillIds: ["M4-1.13-order", "M4-1.13-steps"],
  prerequisiteSkillIds: ["M4-1.8-powers", "M4-1.5-mental-mul-div"],
  estimatedMinutes: 45,
  coreLesson: "Kolejność działań: nawiasy, potęgi, mnożenie i dzielenie, dodawanie i odejmowanie; działania tego samego poziomu od lewej do prawej.",
  paperEvidence: "Karta ucznia: osiem działań z kratkami na wyniki kolejnych kroków.",
  overview: "Uczeń poznaje zapis schodkami, w którym oblicza tylko jeden wskazany fragment, zapisuje wynik pod nim i przechodzi do krótszego działania.",
  openingScript: "Pokaż, że nie trzeba pamiętać całego obliczenia. Zasłoń kolejne wiersze i odsłaniaj po jednym wyniku zapisanym pod wykonywanym działaniem.",
  closingScript: "Poproś ucznia o wskazanie pierwszego działania oraz wyjaśnienie, kiedy liczymy od lewej do prawej.",
  commonMisconceptions: ["Uczeń wykonuje działania kolejno tak, jak zostały zapisane, bez uwzględnienia ich ważności.", "Uczeń wykonuje mnożenie przed wcześniejszym dzieleniem mimo ich tej samej ważności.", "Uczeń próbuje zapamiętać wszystkie wyniki pośrednie i gubi jeden z nich."],
  stageBlueprints: [
    { suffix: "information", kind: "worked-example", title: "Kolejność i zapis schodkami", minutes: 14, headline: "Obliczaj jeden fragment i zapisuj wynik", body: "Poznaj kolejność działań, kierunek od lewej do prawej oraz sposób zapisywania każdego wyniku pod obliczanym fragmentem.", modelId: "grade4-order-of-operations-lab", modelSeed: 4131, studentInstruction: "Prześledź przykłady i wskaż, które działanie wykonano w każdym kroku.", teacherInstruction: "Wyraźnie oddziel kolejność ważności od kierunku od lewej do prawej." },
    { suffix: "practice", kind: "practice", title: "Oblicz schodkami", minutes: 24, headline: "Wpisz wyniki kolejnych działań", body: "Rozwiąż osiem łatwych przykładów. Każdy wynik wpisz w kratce bezpośrednio pod działaniem.", modelId: "grade4-order-of-operations-lab", modelSeed: 4132, questions: questions(8), preserveTaskTitle: true, studentInstruction: "Dotykaj kratek po kolei i wpisuj wyniki wskazanych fragmentów.", teacherInstruction: "Uczeń ma pokazać wszystkie kroki; sam wynik końcowy nie wystarcza do zaliczenia." },
  ],
  status: "published",
});
