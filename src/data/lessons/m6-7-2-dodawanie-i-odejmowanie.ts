import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillId: string): QuestionReference[] => Array.from({ length: count }, (_, index) => ({ id: `m6-7-2-${stage}-${index + 1}`, generatorId: "integer-add-subtract-l1-v1", seed: seed + index, difficulty: index + 1 === count ? "challenge" : index === 0 ? "support" : "core", skillIds: [skillId], feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] } }));

export const m672DodawanieIOdejmowanieV1 = buildLessonPackage({
  id: "m6-7-2-dodawanie-i-odejmowanie-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S7", topicId: "M6-7.2", lessonNumber: 2,
  title: "Dodawanie i odejmowanie liczb dodatnich i ujemnych",
  studentGoal: "Uproszczę sąsiadujące znaki, zdecyduję, czy liczby dodać, czy odjąć, i zapiszę pełne rozwiązanie.",
  successCriteria: ["Upraszczam znaki stojące obok siebie.", "Liczby o tych samych znakach dodaję i zachowuję ich znak.", "Liczby o różnych znakach odejmuję i wstawiam znak większej liczby.", "Rozpisuję ułamki zwykłe po znakach równości.", "W zadaniu tekstowym zapisuję dane, całe działanie i odpowiedź."],
  skillIds: ["M6-7.2-model", "M6-7.2-add-integers", "M6-7.2-subtract-integers", "M6-7.2-fractions", "M6-7.2-stories"], prerequisiteSkillIds: ["M6-7.1-compare"], estimatedMinutes: 45,
  coreLesson: "Najpierw upraszczanie sąsiadujących znaków, potem jedna wspólna reguła wyboru: dodaj albo odejmij.",
  paperEvidence: "Pełny zapis obliczeń: uproszczone znaki, kolejne równości przy ułamkach oraz Dane – Działanie – Odpowiedź w zadaniach tekstowych.",
  overview: "Lekcja prowadzi jedną spójną metodą. Najpierw uczeń upraszcza znaki stojące obok siebie. Potem rozpoznaje znaki liczb: przy tych samych dodaje i zachowuje znak, a przy różnych odejmuje i wstawia znak większej liczby. Żetony pozwalają sprawdzić przykłady o różnych znakach.",
  openingScript: "Pokaż zapisy + (−4) oraz − (−4). Ustal z uczniami, dlaczego pierwszy upraszczamy do minusa, a drugi do plusa.",
  closingScript: "Uczeń wyjaśnia własnymi słowami, kiedy liczby dodaje, a kiedy odejmuje, oraz skąd bierze znak wyniku.",
  commonMisconceptions: ["Uczeń wykonuje rachunek przed uproszczeniem sąsiadujących znaków.", "Uczeń dodaje liczby o różnych znakach zamiast je odjąć.", "Uczeń wybiera znak mniejszej liczby.", "Uczeń dodaje mianowniki.", "Uczeń wpisuje sam wynik bez całego działania i odpowiedzi."],
  stageBlueprints: [
    { suffix: "sign-rules", kind: "worked-example", title: "Znaki stojące obok siebie", minutes: 6, headline: "Plus z minusem daje minus, a dwa minusy dają plus", body: "Najpierw usuń nawias i uprość sąsiadujące znaki. Przećwicz tę zmianę na przykładach z dodawaniem i odejmowaniem.", modelId: "integer-add-subtract-lab", modelSeed: 672001, questions: questions("sign-rules", 6, 672001, "M6-7.2-add-integers"), preserveTaskTitle: true },
    { suffix: "add-model", kind: "practice", title: "Dodaj czy odejmij?", minutes: 10, headline: "Te same znaki — dodaj, różne znaki — odejmij", body: "Po uproszczeniu znaków wybierz właściwą regułę. Przy różnych znakach odejmij i wstaw znak większej liczby. Wybrane działania sprawdź na żetonach.", modelId: "integer-add-subtract-lab", modelSeed: 672096, questions: questions("add-model", 8, 672096, "M6-7.2-model"), preserveTaskTitle: true },
    { suffix: "add-fractions", kind: "practice", title: "Ułamki zwykłe — pełny zapis", minutes: 10, headline: "Po znaku równości pokaż każdy etap", body: "Uprość znaki, sprowadź ułamki do wspólnego mianownika i wpisz cały łańcuch równości w zwykłym zapisie ułamkowym.", modelId: "integer-add-subtract-lab", modelSeed: 672501, questions: questions("add-fractions", 6, 672501, "M6-7.2-fractions"), preserveTaskTitle: true },
    { suffix: "add-decimals", kind: "practice", title: "Liczby dziesiętne ze znakiem", minutes: 7, headline: "Ta sama decyzja: dodaj albo odejmij", body: "Uprość znaki, a następnie zastosuj tę samą regułę co przy liczbach całkowitych.", modelId: "integer-add-subtract-lab", modelSeed: 672601, questions: questions("add-decimals", 6, 672601, "M6-7.2-add-integers"), preserveTaskTitle: true },
    { suffix: "stories", kind: "exit-ticket", title: "Zadania tekstowe — pełne rozwiązanie", minutes: 12, headline: "Dane – Działanie – Odpowiedź", body: "Odczytaj dane z ilustrowanej sytuacji. Samodzielnie wpisz wszystkie liczby i znaki działania, wynik po znaku równości oraz odpowiedź.", modelId: "integer-add-subtract-lab", modelSeed: 672701, questions: questions("stories", 6, 672701, "M6-7.2-stories"), preserveTaskTitle: true },
  ], status: "published",
});
