import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";

const seriesQuestion = (id: string, skillId: string) => [{
  id,
  seed: 1,
  difficulty: "challenge" as const,
  skillIds: [skillId],
  feedbackPolicy: { mode: "assessment" as const, allowsPartialCredit: false, manualReview: "never" as const, feedbackKeys: ["correct", "incorrect", "missing-answer"] },
}];

export const m638PowtorzenieV1 = buildLessonPackage({
  id: "m6-3-8-powtorzenie-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S3",
  topicId: "M6-3.8",
  lessonNumber: 8,
  title: "Powtórzenie wiadomości",
  studentGoal: "Utrwalę wiadomości i umiejętności z działu „Liczby na co dzień”.",
  successCriteria: [
    "Obliczam czas i zamieniam jednostki długości oraz masy.",
    "Rozwiązuję zadania ze skalą i poprawnie zaokrąglam liczby.",
    "Odczytuję i porównuję informacje z tabel, diagramów oraz wykresów.",
    "Dobieram działania do trudniejszych zadań praktycznych i sprawdzam sens wyniku.",
  ],
  skillIds: ["M6-3.8-practical", "M6-3.8-data", "M6-3.8-challenge"],
  prerequisiteSkillIds: ["M6-3.1-time", "M6-3.2-units", "M6-3.3-scale", "M6-3.4-rounding", "M6-3.5-calculator", "M6-3.6-data-reading", "M6-3.7-line-graphs"],
  estimatedMinutes: 45,
  coreLesson: "Praktyczne zadania z kalendarza, czasu, jednostek, skali, zaokrąglania, kalkulatora oraz odczytywania danych.",
  paperEvidence: "Zeszyt ucznia: obliczenia do zadań ze skalą, czasem, jednostkami i analizą danych.",
  overview: "Powtórzenie składa się z trzech różnych serii: rachunków praktycznych, analizy danych oraz zadań łączących kilka umiejętności.",
  openingScript: "Przypomnij, że w tym dziale matematyka pomagała planować czas, korzystać z map, przeliczać jednostki i rozumieć dane.",
  closingScript: "Poproś uczniów o wskazanie zadania, w którym trzeba było połączyć najwięcej wiadomości.",
  commonMisconceptions: [
    "Uczeń nie sprowadza jednostek do wspólnej postaci przed obliczeniem.",
    "Uczeń myli odległość na mapie z odległością w terenie.",
    "Uczeń odczytuje niewłaściwy słupek, punkt, wiersz albo kolumnę.",
    "Uczeń zaokrągla według cyfry stojącej na zaokrąglanym miejscu zamiast cyfry następnej.",
  ],
  stageBlueprints: [
    { suffix: "section-review-practical", kind: "practice", title: "Kalendarz, jednostki, skala i zaokrąglanie", minutes: 15, headline: "Wykorzystaj matematykę w praktyce", body: "Oblicz czas, zamień jednostki, zastosuj skalę i zaokrąglij wynik.", modelId: "information-reading-lab", preserveTaskTitle: true, questions: seriesQuestion("m6-3-8-practical-series", "M6-3.8-practical"), studentInstruction: "Rozwiąż wszystkie zadania po kolei i zatwierdzaj odpowiedzi klawiaturą lekcji.", teacherInstruction: "Zwracaj uwagę na zapis jednostek i sposób przeliczania skali." },
    { suffix: "section-review-data", kind: "practice", title: "Tabele, diagramy i wykresy", minutes: 13, headline: "Odczytaj, porównaj i oblicz", body: "Wybierz potrzebne dane z tabeli, diagramu albo wykresu.", modelId: "information-reading-lab", preserveTaskTitle: true, questions: seriesQuestion("m6-3-8-data-series", "M6-3.8-data"), studentInstruction: "Najpierw wskaż potrzebne dane, a dopiero potem wykonaj obliczenie.", teacherInstruction: "Sprawdzaj, czy uczeń korzysta z właściwej kategorii, serii i jednostki." },
    { suffix: "section-review-challenge", kind: "challenge", title: "Zadania łączące wiadomości", minutes: 12, headline: "Zaplanuj rozwiązanie", body: "W jednym zadaniu wykorzystaj kilka umiejętności z całego działu.", modelId: "information-reading-lab", preserveTaskTitle: true, questions: seriesQuestion("m6-3-8-challenge-series", "M6-3.8-challenge"), studentInstruction: "Zapisz potrzebne obliczenia w zeszycie i zatwierdź końcowy wynik.", teacherInstruction: "Poproś ucznia o krótkie uzasadnienie wyboru działania." },
  ],
  status: "published",
});
