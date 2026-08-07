import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (count: number): QuestionReference[] => Array.from({ length: count }, (_, index) => ({
  id: `m4-1-14-axis-${index + 1}`,
  generatorId: "grade4-number-line-l1-v1",
  seed: 414100 + index,
  difficulty: index >= count - 2 ? "challenge" : "core",
  skillIds: ["M4-1.14-unit", "M4-1.14-read"],
}));

export const m4114OsLiczbowaV1 = buildLessonPackage({
  id: "m4-1-14-os-liczbowa-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S1",
  topicId: "M4-1.14",
  lessonNumber: 14,
  title: "Oś liczbowa",
  studentGoal: "Nauczę się rozpoznawać elementy osi liczbowej i odczytywać zaznaczone na niej liczby.",
  successCriteria: ["Wskazuję odcinek jednostkowy i kierunek wzrostu liczb.", "Wyznaczam odcinek jednostkowy między sąsiednimi liczbami.", "Odczytuję liczby zaznaczone punktami na osi."],
  learningGoals: [
    { id: "m4-1-14-goal-1", studentGoal: "Nauczę się rozpoznawać oś liczbową.", successCriteria: ["Wskazuję kreski, odcinek jednostkowy i strzałkę pokazującą wzrost liczb."], curriculumReferences: [] },
    { id: "m4-1-14-goal-2", studentGoal: "Nauczę się wyznaczać odcinek jednostkowy na osi.", successCriteria: ["Wskazuję odległość między sąsiednimi liczbami."], curriculumReferences: [] },
    { id: "m4-1-14-goal-3", studentGoal: "Nauczę się odczytywać punkty z osi liczbowej.", successCriteria: ["Wpisuję poprawne liczby w kratkach nad zaznaczonymi punktami."], curriculumReferences: [] },
  ],
  skillIds: ["M4-1.14-unit", "M4-1.14-read"],
  prerequisiteSkillIds: ["M4-1.1-natural-numbers"],
  estimatedMinutes: 45,
  coreLesson: "Oś liczbowa, równe odstępy, odcinek jednostkowy, kierunek wzrostu liczb i odczytywanie współrzędnych punktów.",
  paperEvidence: "Karta ucznia: sześć osi z pustymi kratkami nad punktami A, B i C.",
  overview: "Pierwsze spotkanie z osią liczbową rozpoczyna porównanie z podziałką termometru do mierzenia temperatury ciała.",
  openingScript: "Pokaż termometr i zapytaj, dlaczego kreski muszą być rozmieszczone równo. Następnie obróć sposób myślenia z pionu w poziom i wskaż strzałkę osi.",
  closingScript: "Poproś ucznia, aby wskazał dwie sąsiednie opisane kreski i wyjaśnił, jak dzięki nim odczytuje pozostałe punkty.",
  commonMisconceptions: ["Uczeń nie zachowuje równych odstępów między kolejnymi liczbami.", "Uczeń odczytuje liczbę bez sprawdzenia wartości jednej działki.", "Uczeń nie zwraca uwagi na kierunek strzałki."],
  stageBlueprints: [
    { suffix: "information", kind: "worked-example", title: "Termometr i oś liczbowa", minutes: 14, headline: "Równa podziałka i kierunek wzrostu", body: "Porównaj podziałkę termometru z osią, znajdź odcinek jednostkowy między 0 i 1 oraz odczytaj kierunek strzałki.", modelId: "grade4-number-line-lab", modelSeed: 4141, studentInstruction: "Wskaż dwie sąsiednie opisane kreski, odcinek między nimi i strzałkę.", teacherInstruction: "To pierwsze spotkanie uczniów z osią. Nie pomijaj porównania do termometru ani pojęcia odcinka jednostkowego." },
    { suffix: "practice", kind: "practice", title: "Odczytaj punkty z osi", minutes: 24, headline: "Wpisz liczby w kratkach nad osią", body: "Rozwiąż sześć zadań. W każdym najpierw ustal wartość jednej działki, a potem odczytaj punkty A, B i C.", modelId: "grade4-number-line-lab", modelSeed: 4142, questions: questions(6), preserveTaskTitle: true, studentInstruction: "Dotknij kratki nad punktem i wpisz odczytaną liczbę.", teacherInstruction: "Uczeń powinien głośno podać wartość jednej działki przed wpisaniem współrzędnych punktów." },
  ],
  status: "published",
});
