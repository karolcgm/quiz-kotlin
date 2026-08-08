import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-8-${suffix}-${index + 1}`,
    generatorId: "grade4-calendar-l1-v1",
    seed: seed + index,
    difficulty: index >= count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m428ZKalendarzemZaPanBratV1 = buildLessonPackage({
  id: "m4-2-8-z-kalendarzem-za-pan-brat-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.8",
  lessonNumber: 1,
  title: "Z kalendarzem za pan brat",
  studentGoal: "Nauczę się korzystać z kalendarza, zapisywać daty oraz obliczać wiek i terminy wydarzeń.",
  successCriteria: [
    "Podaję liczbę dni w miesiącach, wskazuję kwartały i rozpoznaję rok przestępny.",
    "Zapisuję daty cyframi i określam wiek na podany dzień.",
    "Wyznaczam dzień tygodnia i datę wydarzenia po podanej liczbie dni.",
  ],
  learningGoals: [
    { id: "m4-2-8-goal-1", studentGoal: "Poznam budowę kalendarza.", successCriteria: ["Podaję liczbę dni w miesiącach, wskazuję kwartały i odróżniam rok zwykły od przestępnego."], curriculumReferences: [] },
    { id: "m4-2-8-goal-2", studentGoal: "Nauczę się odczytywać i zapisywać daty.", successCriteria: ["Zapisuję datę cyframi i obliczam pełne lata na wskazany dzień."], curriculumReferences: [] },
    { id: "m4-2-8-goal-3", studentGoal: "Nauczę się rozwiązywać zadania kalendarzowe.", successCriteria: ["Wyznaczam dzień tygodnia lub datę po upływie podanej liczby dni."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.8-calendar", "M4-2.8-date", "M4-2.8-age", "M4-2.8-weekday", "M4-2.8-story"],
  prerequisiteSkillIds: ["M4-1.1-add-sub", "M4-1.4-multiply-divide-by-powers-of-ten"],
  estimatedMinutes: 45,
  coreLesson: "Miesiące i liczba ich dni, kwartały, rok zwykły i przestępny, zapis daty, określanie wieku, wyznaczanie dnia tygodnia i daty po upływie czasu.",
  paperEvidence: "Karta ucznia: kalendarz miesięcy, cztery kwartały, zapis dat, obliczanie wieku oraz zadania z przekraczaniem granicy miesiąca.",
  overview: "Lekcja rozpoczyna się uporządkowaniem miesięcy, kwartałów i lat przestępnych, a następnie prowadzi ucznia przez zapis daty, określanie wieku, cykl tygodnia i zadania tekstowe z ilustracjami.",
  openingScript: "Pokaż uczniom dwa kalendarze: lutego w roku zwykłym i lutego w roku przestępnym. Zapytaj, co się w nich zmieniło i co pozostało takie samo.",
  closingScript: "Poproś ucznia, aby podał dzisiejszą datę, numer bieżącego kwartału i dzień tygodnia, który będzie za 14 dni.",
  commonMisconceptions: [
    "Uczeń przyjmuje, że każdy miesiąc ma 30 dni.",
    "Uczeń utożsamia kwartał z czterema miesiącami zamiast z czwartą częścią roku, czyli trzema miesiącami.",
    "Uczeń oblicza wiek wyłącznie przez odjęcie lat i nie sprawdza, czy urodziny już były.",
    "Uczeń liczy dzień początkowy jako pierwszy dzień po podanej dacie.",
    "Uczeń nie przechodzi do następnego miesiąca po ostatnim dniu miesiąca.",
  ],
  stageBlueprints: [
    { suffix: "information", kind: "explore", title: "Miesiące i dni", minutes: 7, headline: "Kalendarz — miesiące i dni", body: "Uporządkuj 12 miesięcy i sprawdź, ile mają dni.", modelId: "grade4-calendar-lab", modelSeed: 4281, studentInstruction: "Porównaj miesiące i znajdź te, które mają 30 oraz 31 dni.", teacherInstruction: "Zwróć uwagę na luty. Poproś uczniów o wskazanie bieżącego miesiąca." },
    { suffix: "quarter-leap", kind: "worked-example", title: "Kwartał i rok przestępny", minutes: 6, headline: "Cztery kwartały i dwa rodzaje lat", body: "Poznaj podział roku na kwartały oraz różnicę między rokiem zwykłym i przestępnym.", modelId: "grade4-calendar-lab", modelSeed: 4282, studentInstruction: "Przyporządkuj miesiące do kwartałów i porównaj długość dwóch rodzajów lat.", teacherInstruction: "Podkreśl, że kwartał ma trzy miesiące, a dodatkowy dzień roku przestępnego przypada 29 lutego." },
    { suffix: "write-date", kind: "practice", title: "Zapisz datę cyframi", minutes: 7, headline: "Dzień, miesiąc i rok", body: "Wpisz każdą część daty w osobnej kratce.", modelId: "grade4-calendar-lab", modelSeed: 4283, questions: questions("write-date", 5, "M4-2.8-date", 428100), preserveTaskTitle: true, studentInstruction: "Odczytaj datę zapisaną słownie i uzupełnij dzień, miesiąc oraz rok.", teacherInstruction: "Akceptuj miesiąc zapisany jedną cyfrą; po odpowiedzi pokaż także zapis z zerem, np. 03." },
    { suffix: "age", kind: "practice", title: "Określ wiek", minutes: 8, headline: "Ile pełnych lat?", body: "Porównaj datę urodzenia z dzisiejszą datą.", modelId: "grade4-calendar-lab", modelSeed: 4284, questions: questions("age", 5, "M4-2.8-age", 428200), preserveTaskTitle: true, studentInstruction: "Najpierw odejmij lata, a potem sprawdź, czy urodziny już były.", teacherInstruction: "Zestaw zadania, w których urodziny już były, jeszcze nie były i przypadają dokładnie dziś." },
    { suffix: "weekday", kind: "practice", title: "Jaki dzień tygodnia?", minutes: 8, headline: "Tydzień powtarza się co 7 dni", body: "Wybierz nazwę dnia po upływie podanej liczby dni.", modelId: "grade4-calendar-lab", modelSeed: 4285, questions: questions("weekday", 5, "M4-2.8-weekday", 428300), preserveTaskTitle: true, studentInstruction: "Odejmuj pełne tygodnie po 7 dni i policz pozostałe przesunięcie.", teacherInstruction: "Pozwól uczniom wskazywać kolejne dni na pasku tygodnia, ale nie podawaj wyniku przed zatwierdzeniem." },
    { suffix: "story", kind: "challenge", title: "Zadania tekstowe z kalendarzem", minutes: 9, headline: "Wyznacz datę wydarzenia", body: "Oblicz termin i pamiętaj o przejściu do następnego miesiąca.", modelId: "grade4-calendar-lab", modelSeed: 4286, questions: questions("story", 4, "M4-2.8-story", 428400), preserveTaskTitle: true, studentInstruction: "Sprawdź liczbę dni w miesiącu początkowym, a potem wpisz dzień i miesiąc wydarzenia.", teacherInstruction: "Po każdym zadaniu poproś ucznia o zaznaczenie daty początkowej i końcowej na prostym kalendarzu." },
  ],
  status: "published",
});
