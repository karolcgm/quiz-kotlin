import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (suffix: string, count: number, skillId: string, seed: number): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m4-2-1-${suffix}-${index + 1}`,
    generatorId: "grade4-decimal-system-l1-v1",
    seed: seed + index,
    difficulty: index === count - 1 ? "challenge" : "core",
    skillIds: [skillId],
  }));

export const m421SystemDziesiatkowyV1 = buildLessonPackage({
  id: "m4-2-1-system-dziesiatkowy-v1",
  curriculumId: "pl-math-4-2026-classic",
  sectionId: "M4-S2",
  topicId: "M4-2.1",
  lessonNumber: 1,
  title: "System dziesiątkowy",
  studentGoal: "Nauczę się odczytywać i zapisywać liczby naturalne w systemie dziesiątkowym.",
  successCriteria: [
    "Rozpoznaję cyfry, grupy jedności, tysięcy, milionów i miliardów.",
    "Zapisuję liczby cyframi i słownie.",
    "Odczytuję skróty tys., mln i mld oraz wykorzystuję je w zadaniach.",
  ],
  learningGoals: [
    { id: "m4-2-1-goal-1", studentGoal: "Nauczę się rozumieć zapis liczby w systemie dziesiątkowym.", successCriteria: ["Wskazuję cyfry oraz grupy jedności, tysięcy, milionów i miliardów."], curriculumReferences: [] },
    { id: "m4-2-1-goal-2", studentGoal: "Nauczę się zapisywać liczby cyframi i słownie.", successCriteria: ["Poprawnie zamieniam zapis słowny na cyfrowy i cyfrowy na słowny."], curriculumReferences: [] },
    { id: "m4-2-1-goal-3", studentGoal: "Nauczę się korzystać ze skrótów dużych liczb.", successCriteria: ["Odczytuję i rozwijam zapisy z tys., mln i mld."], curriculumReferences: [] },
  ],
  skillIds: ["M4-2.1-place-value", "M4-2.1-digits", "M4-2.1-words", "M4-2.1-abbreviations"],
  prerequisiteSkillIds: ["M4-1.14-axis"],
  estimatedMinutes: 55,
  coreLesson: "Liczby naturalne i dziesięć cyfr, grupy jedności, tysięcy, milionów i miliardów, skróty tys., mln i mld oraz zapisywanie liczb cyframi i słownie.",
  paperEvidence: "Karta ucznia: grupy cyfr, zapis cyfrowy i słowny dużych liczb oraz rozwiązany szyfr.",
  overview: "Uczeń poznaje system dziesiątkowy, dzieli duże liczby na grupy, korzysta ze skrótów i ćwiczy dwa kierunki zapisu. Na końcu rozwiązuje szyfr z dużymi liczbami.",
  openingScript: "Pokaż dziesięć cyfr od 0 do 9. Zapytaj, ile różnych liczb można z nich utworzyć, a następnie wprowadź nazwę system dziesiątkowy.",
  closingScript: "Poproś ucznia, aby przeczytał jedną dużą liczbę, wskazał jej grupy i podał przykład zapisu ze skrótem.",
  commonMisconceptions: [
    "Uczeń pomija zera znajdujące się wewnątrz liczby.",
    "Uczeń dzieli liczbę na grupy od lewej strony zamiast od prawej.",
    "Uczeń traktuje skrót mln lub mld jak dodatkową cyfrę.",
  ],
  stageBlueprints: [
    {
      suffix: "information", kind: "explore", title: "Liczby naturalne i dziesięć cyfr", minutes: 9,
      headline: "System dziesiątkowy", body: "Liczby naturalne zapisujemy za pomocą dziesięciu cyfr: 0, 1, 2, 3, 4, 5, 6, 7, 8 i 9.",
      modelId: "grade4-decimal-system-lab", modelSeed: 4211,
      studentInstruction: "Obejrzyj cyfry i nazwij liczby naturalne, które znasz.",
      teacherInstruction: "Wyraźnie odróżnij cyfrę od liczby. Liczba może być zapisana za pomocą jednej lub wielu cyfr.",
    },
    {
      suffix: "groups", kind: "worked-example", title: "Grupy cyfr i skróty", minutes: 10,
      headline: "Jedności, tysiące, miliony i miliardy", body: "Dzielimy cyfry od prawej strony na grupy po trzy i poznajemy skróty tys., mln oraz mld.",
      modelId: "grade4-decimal-system-lab", modelSeed: 4212,
      studentInstruction: "Odczytaj osobno każdą grupę i połącz ją z nazwą.",
      teacherInstruction: "Zacznij od grupy jedności po prawej stronie. Dopiero potem przechodź do tysięcy, milionów i miliardów.",
    },
    {
      suffix: "digits", kind: "practice", title: "Zapisz liczbę cyframi", minutes: 12,
      headline: "Od słów do cyfr", body: "Przeczytaj liczbę i wpisz wszystkie cyfry, pamiętając o potrzebnych zerach.",
      modelId: "grade4-decimal-system-lab", modelSeed: 4213, questions: questions("digits", 6, "M4-2.1-digits", 421100), preserveTaskTitle: true,
      studentInstruction: "Wpisz liczbę za pomocą klawiatury lekcyjnej i zatwierdź.",
      teacherInstruction: "Przed wpisaniem poproś ucznia o nazwanie grup i wskazanie miejsc, w których potrzebne są zera.",
    },
    {
      suffix: "words", kind: "practice", title: "Zapisz liczbę słownie", minutes: 12,
      headline: "Ułóż pełny zapis słowny", body: "Wybieraj wyrazy z banku i ustawiaj je w poprawnej kolejności.",
      modelId: "grade4-decimal-system-lab", modelSeed: 4214, questions: questions("words", 5, "M4-2.1-words", 421200), preserveTaskTitle: true,
      studentInstruction: "Dotykaj kolejnych wyrazów. Jeśli się pomylisz, usuń ostatni wyraz.",
      teacherInstruction: "Uczeń ma sam zbudować cały zapis; nie sprowadzaj zadania do wyboru jednej gotowej odpowiedzi.",
    },
    {
      suffix: "cipher", kind: "challenge", title: "Szyfr badaczy", minutes: 12,
      headline: "Rozwiń skróty i odsłoń hasło", body: "Rozwiąż sześć krótkich zagadek. Każda odsłoni jedną literę końcowego hasła.",
      modelId: "grade4-decimal-system-lab", modelSeed: 4215, questions: questions("cipher", 6, "M4-2.1-abbreviations", 421300), preserveTaskTitle: true,
      studentInstruction: "Wpisz pełną liczbę. Litery pojawiają się w pomieszanej kolejności, ale pozostają widoczne w haśle.",
      teacherInstruction: "Nie podawaj uczniom kolejności liter. Po każdym zadaniu poproś o odczytanie rozwiniętego skrótu.",
    },
  ],
  status: "published",
});
