import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, skillId: string, baseSeed: number) =>
  Array.from({ length: count }, (_, index): QuestionReference => ({
    id: `m6-1-6-${stage}-${index + 1}`,
    generatorId: "decimal-notation-l1-v1",
    seed: baseSeed + index,
    difficulty: index < count - 2 ? "core" : "challenge",
    skillIds: [skillId],
  }));

export const m616UlamkiZwykleDziesietneV1 = buildLessonPackage({
  id: "m6-1-6-ulamki-zwykle-i-dziesietne-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S1",
  topicId: "M6-1.6",
  lessonNumber: 6,
  title: "Ułamki zwykłe i dziesiętne",
  studentGoal: "Nauczę się wykonywać działania na ułamkach zwykłych i dziesiętnych, wybierając dogodny zapis.",
  successCriteria: [
    "Wybieram zapis zwykły albo dziesiętny, który ułatwia obliczenia.",
    "Dodaję, odejmuję, mnożę i dzielę ułamki zwykłe oraz dziesiętne.",
    "Wykonuję działania mieszane zgodnie z kolejnością działań.",
  ],
  skillIds: ["M6-1.6-fraction-decimal-operations"],
  prerequisiteSkillIds: ["M6-1.2-decimal-mental", "M6-1.5-fraction-operations"],
  estimatedMinutes: 70,
  coreLesson: "Wybór wygodnego zapisu liczby i działania mieszane.",
  paperEvidence: "Zeszyt ucznia: zamiany zapisów oraz kolejne kroki działań mieszanych.",
  overview: "Temat utrwala działania mieszane z klasy 5. Uczeń sam wybiera, czy wygodniej skorzystać z ułamka zwykłego, czy z zapisu dziesiętnego.",
  openingScript: "Przypomnij sobie ułamki, które łatwo zamieniają się na zapis dziesiętny. Potem wybierzesz zapis, który skraca obliczenia.",
  closingScript: "Sprawdź, czy w każdym działaniu wybrałeś wygodny zapis oraz zachowałeś właściwą kolejność działań.",
  commonMisconceptions: [
    "Uczeń zmienia zapis liczby, ale nie zachowuje jej wartości.",
    "Uczeń wykonuje dodawanie przed mnożeniem albo dzieleniem.",
    "Uczeń pomija zero przed przecinkiem w liczbie mniejszej od jedności.",
  ],
  stageBlueprints: [
    { suffix: "fraction-decimal-remember", kind: "worked-example", title: "Zapamiętaj", minutes: 6, headline: "Najważniejsze zamiany ułamków zwykłych na dziesiętne", body: "Przypomnij sobie ułamki, które często przyspieszają obliczenia. W dalszych zadaniach sam zdecydujesz, który zapis jest wygodniejszy.", modelId: "decimal-notation-l1", modelSeed: 616100, questions: questions("remember", 1, "M6-1.6-bridge", 616100), preserveTaskTitle: true, studentInstruction: "Odczytaj każdą parę równych liczb i wykorzystaj ją w następnych zadaniach.", teacherInstruction: "Podkreśl, że zapis zmieniamy tylko wtedy, gdy upraszcza obliczenie." },
    { suffix: "fraction-decimal-add", kind: "practice", title: "Dodawanie", minutes: 11, headline: "Dodawanie ułamków zwykłych i dziesiętnych", body: "Wybierz dogodny zapis obu liczb i wykonaj działanie.", modelId: "decimal-notation-l1", modelSeed: 616200, questions: questions("add", 8, "M6-1.6-add", 616200), preserveTaskTitle: true, studentInstruction: "Wykonuj działania kolejno. Po poprawnym wyniku przejdź do następnej rundy.", teacherInstruction: "Pytaj ucznia, dlaczego wybrał właśnie ten zapis liczby." },
    { suffix: "fraction-decimal-subtract", kind: "practice", title: "Odejmowanie", minutes: 11, headline: "Odejmowanie ułamków zwykłych i dziesiętnych", body: "Najpierw wybierz zapis, w którym łatwo odejmiesz obie liczby.", modelId: "decimal-notation-l1", modelSeed: 616300, questions: questions("subtract", 8, "M6-1.6-subtract", 616300), preserveTaskTitle: true, studentInstruction: "Wykonuj działania kolejno. Zapisz wynik w wybranym przez siebie zapisie.", teacherInstruction: "Przypomnij o zachowaniu zera przed przecinkiem w liczbach mniejszych od jedności." },
    { suffix: "fraction-decimal-multiply", kind: "practice", title: "Mnożenie", minutes: 11, headline: "Mnożenie ułamków zwykłych i dziesiętnych", body: "Zdecyduj, czy korzystniej będzie mnożyć liczby w zapisie zwykłym czy dziesiętnym.", modelId: "decimal-notation-l1", modelSeed: 616400, questions: questions("multiply", 8, "M6-1.6-multiply", 616400), preserveTaskTitle: true, studentInstruction: "Wykonuj działania kolejno i wpisuj wynik w pustych polach.", teacherInstruction: "Zwracaj uwagę na możliwość skracania w zapisie zwykłym." },
    { suffix: "fraction-decimal-divide", kind: "practice", title: "Dzielenie", minutes: 11, headline: "Dzielenie ułamków zwykłych i dziesiętnych", body: "Wybierz zapis, który pozwoli Ci najczytelniej wykonać dzielenie.", modelId: "decimal-notation-l1", modelSeed: 616500, questions: questions("divide", 8, "M6-1.6-divide", 616500), preserveTaskTitle: true, studentInstruction: "Wykonuj działania kolejno. Po poprawnym wyniku przejdź do następnej rundy.", teacherInstruction: "Dopytaj ucznia, jak sprawdza wynik mnożeniem odwrotnym." },
    { suffix: "fraction-decimal-order", kind: "challenge", title: "Kolejność działań", minutes: 20, headline: "Wykonuj działania mieszane krok po kroku", body: "Najpierw wykonaj nawiasy, następnie mnożenie lub dzielenie, a na końcu dodawanie albo odejmowanie.", modelId: "decimal-notation-l1", modelSeed: 616600, questions: questions("order", 1, "M6-1.6-order", 616600), preserveTaskTitle: true, studentInstruction: "Uzupełnij oba kolejne kroki obliczenia. Po zatwierdzeniu poprawnego zadania pojawi się następne w tym samym slajdzie.", teacherInstruction: "Poproś ucznia o wskazanie pierwszego działania, zanim zacznie wpisywać wyniki." },
  ],
  status: "published",
});
