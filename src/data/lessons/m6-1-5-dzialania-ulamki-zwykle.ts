import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, skillId: string, baseSeed: number) =>
  Array.from({ length: count }, (_, index): QuestionReference => ({
    id: `m6-1-5-${stage}-${index + 1}`,
    generatorId: "fraction-lesson-l6-review-v1",
    seed: baseSeed + index,
    difficulty: index < count - 2 ? "core" : "challenge",
    skillIds: [skillId],
  }));

export const m615DzialaniaUlamkiZwykleV1 = buildLessonPackage({
  id: "m6-1-5-dzialania-na-ulamkach-zwyklych-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S1",
  topicId: "M6-1.5",
  lessonNumber: 5,
  title: "Działania na ułamkach zwykłych",
  studentGoal: "Nauczę się sprawnie wykonywać działania na ułamkach zwykłych i liczbach mieszanych.",
  successCriteria: [
    "Rozszerzam i skracam ułamki oraz zamieniam ułamek niewłaściwy i liczbę mieszaną.",
    "Odczytuję i zaznaczam ułamki na osi liczbowej.",
    "Dodaję, odejmuję, mnożę i dzielę ułamki zwykłe.",
    "Rozwiązuję zadania z ułamkiem liczby, kolejnością działań i zadania tekstowe.",
  ],
  skillIds: ["M6-1.5-fraction-operations"],
  prerequisiteSkillIds: ["M5-3.1-mixed-conversion", "M5-3.4-equivalence"],
  estimatedMinutes: 100,
  coreLesson: "Kompleksowe powtórzenie działań na ułamkach zwykłych i liczbach mieszanych.",
  paperEvidence: "Zeszyt ucznia: zapis wszystkich etapów działań na ułamkach i odpowiedzi do zadań tekstowych.",
  overview: "Temat łączy kluczowe umiejętności z działu 3 klasy 5: przekształcanie ułamków, oś liczbową oraz cztery działania.",
  openingScript: "Najpierw przypomnimy sobie zapis i przekształcanie ułamków. Potem użyjemy tych umiejętności w coraz dłuższych działaniach.",
  closingScript: "Sprawdź, czy w każdym działaniu zapisałeś potrzebne przekształcenia i czy wynik jest w najprostszej postaci.",
  commonMisconceptions: [
    "Uczeń rozszerza albo skraca tylko licznik lub tylko mianownik.",
    "Uczeń dodaje mianowniki zamiast sprowadzić ułamki do wspólnego mianownika.",
    "Uczeń zapomina zamienić liczbę mieszaną przed mnożeniem lub dzieleniem.",
    "Uczeń przy dzieleniu odwraca dzielną zamiast dzielnika.",
  ],
  stageBlueprints: [
    { suffix: "topic2-improper-to-mixed", kind: "worked-example", title: "Liczby mieszane i ułamki niewłaściwe", minutes: 8, headline: "Zamieniaj zapis bez zmiany wartości", body: "Przypomnienie: z ułamka niewłaściwego wyciągamy pełne całości, a liczbę mieszaną zapisujemy jako ułamek niewłaściwy.", modelId: "fraction-lesson", modelSeed: 61501, questions: questions("convert", 5, "M6-1.5-convert", 615010), preserveTaskTitle: true, studentInstruction: "Wpisz wszystkie części zapisu w pustych kratkach. Ułamek zapisuj licznikiem nad kreską i mianownikiem pod kreską.", teacherInstruction: "Dopytaj, ile pełnych mianowników mieści się w liczniku." },
    { suffix: "equiv-expansion-grid", kind: "worked-example", title: "Rozszerzanie do podanego mianownika", minutes: 9, headline: "Ten sam mnożnik działa na licznik i mianownik", body: "Znajdź liczbę, przez którą trzeba rozszerzyć ułamek, aby otrzymać podany mianownik.", modelId: "fraction-lesson", modelSeed: 61502, questions: questions("expand", 5, "M6-1.5-expand", 615020), preserveTaskTitle: true, studentInstruction: "Uzupełnij mnożnik i oba brakujące pola. Każdy etap musi zachować tę samą wartość ułamka.", teacherInstruction: "Przed zatwierdzeniem sprawdź, czy licznik i mianownik zostały pomnożone przez tę samą liczbę." },
    { suffix: "equiv-cross-out-rewrite", kind: "practice", title: "Skracanie do postaci nieskracalnej", minutes: 9, headline: "Skracaj licznik i mianownik przez tę samą liczbę", body: "Wybierz wspólny dzielnik, zapisz skrócony ułamek i sprawdź, czy nie można go już dalej skrócić.", modelId: "fraction-lesson", modelSeed: 61503, questions: questions("simplify", 5, "M6-1.5-simplify", 615030), preserveTaskTitle: true, studentInstruction: "Wpisz liczby po skróceniu. Nie zatwierdzaj, dopóki ułamek nie jest nieskracalny.", teacherInstruction: "Zwróć uwagę, czy uczeń nie skreśla tylko jednej liczby." },
    { suffix: "topic1-axis-labels", kind: "practice", title: "Ułamki na osi liczbowej", minutes: 8, headline: "Pozycja na osi mówi, jaką część całości wskazuje punkt", body: "Odczytaj ułamki z osi i zaznaczaj je na odpowiedniej kresce podziałki.", modelId: "fraction-lesson", modelSeed: 61504, questions: questions("axis", 5, "M6-1.5-axis", 615040), preserveTaskTitle: true, studentInstruction: "Policz równe odcinki od zera. Wpisz licznik i mianownik albo ustaw punkt na właściwej kresce.", teacherInstruction: "Poproś ucznia, aby nazwał mianownik jako liczbę równych części osi." },
    { suffix: "same-denom-independent", kind: "practice", title: "Dodawanie i odejmowanie o jednakowych mianownikach", minutes: 9, headline: "Łączymy lub odejmujemy części tej samej wielkości", body: "Dodaj albo odejmij liczniki. Mianownik pozostaje bez zmiany, a wynik skróć, gdy jest to możliwe.", modelId: "fraction-lesson", modelSeed: 61505, questions: questions("same-denom", 5, "M6-1.5-add-sub-same", 615050), preserveTaskTitle: true, studentInstruction: "Wypełnij działanie poziomo i zatwierdź dopiero po wpisaniu wyniku w najprostszej postaci.", teacherInstruction: "Zapytaj, dlaczego mianownik nie zmienia się podczas działania." },
    { suffix: "different-denom-independent", kind: "practice", title: "Dodawanie i odejmowanie o różnych mianownikach", minutes: 12, headline: "Najpierw wspólny mianownik, potem działanie", body: "Rozszerz oba ułamki do wspólnego mianownika, wykonaj działanie i skróć wynik, jeśli trzeba.", modelId: "fraction-lesson", modelSeed: 61506, questions: questions("different-denom", 5, "M6-1.5-add-sub-different", 615060), preserveTaskTitle: true, studentInstruction: "Zapisz ułamki po rozszerzeniu, następnie wynik. W liczbach mieszanych pozostaw części całkowite, dopóki nie są potrzebne do obliczenia.", teacherInstruction: "Sprawdź, czy uczeń nie dodaje mianowników." },
    { suffix: "m5-3-8-independent", kind: "practice", title: "Ułamek liczby", minutes: 8, headline: "Podziel liczbę przez mianownik, a wynik pomnóż przez licznik", body: "Obliczaj część liczby naturalnej, np. trzy siódme z 25, zapisując wszystkie potrzebne kroki.", modelId: "fraction-lesson", modelSeed: 61507, questions: questions("fraction-of-number", 5, "M6-1.5-fraction-of-number", 615070), preserveTaskTitle: true, studentInstruction: "Wybierz działanie, wpisz obliczenia i wynik. Gdy nie wychodzi liczba całkowita, zapisz wynik jako ułamek.", teacherInstruction: "Zwróć uwagę na kolejność: najpierw dzielenie przez mianownik, potem mnożenie przez licznik." },
    { suffix: "m5-3-9-l2-independent", kind: "practice", title: "Mnożenie ułamków", minutes: 9, headline: "Skracaj przed mnożeniem, gdy to ułatwia obliczenia", body: "Zamień liczby mieszane na ułamki niewłaściwe, skróć po skosie i pomnóż liczniki oraz mianowniki.", modelId: "fraction-lesson", modelSeed: 61508, questions: questions("multiply", 5, "M6-1.5-multiply", 615080), preserveTaskTitle: true, studentInstruction: "Wpisz etapy skracania i wynik. Mnożenie zapisuj kropką.", teacherInstruction: "Sprawdź, czy uczeń skraca po skosie przed mnożeniem, a nie po obliczeniu tylko jeden element." },
    { suffix: "m5-3-11-l2-independent", kind: "practice", title: "Dzielenie ułamków", minutes: 9, headline: "Dzielimy przez mnożenie przez odwrotność", body: "Zapisz mnożenie przez odwrotność dzielnika, skróć i oblicz wynik.", modelId: "fraction-lesson", modelSeed: 61509, questions: questions("divide", 5, "M6-1.5-divide", 615090), preserveTaskTitle: true, studentInstruction: "Najpierw zamień dzielenie na mnożenie przez odwrotność, potem uzupełnij dalsze kratki.", teacherInstruction: "Przypomnij: odwrotność dotyczy wyłącznie dzielnika." },
    { suffix: "m5-3-r-reasoning", kind: "challenge", title: "Kolejność działań na ułamkach", minutes: 10, headline: "Wykonuj działania w dobrej kolejności", body: "Rozwiąż dłuższe przykłady z ułamkami: najpierw nawiasy i mnożenie lub dzielenie, a na końcu dodawanie albo odejmowanie.", modelId: "fraction-lesson", modelSeed: 61510, questions: questions("order", 5, "M6-1.5-order", 615100), preserveTaskTitle: true, studentInstruction: "Zapisz pośrednie kroki w pustych kratkach. Wybierz kolejność działań, nie wykonuj wszystkiego naraz.", teacherInstruction: "Poproś ucznia o wskazanie pierwszego działania przed rozpoczęciem obliczeń." },
    { suffix: "m5-3-11-context", kind: "exit-ticket", title: "Zadania tekstowe", minutes: 10, headline: "Wybierz działanie i uzasadnij wynik", body: "Przeczytaj dane, samodzielnie zapisz działanie na ułamkach, wykonaj obliczenia krok po kroku i podaj odpowiedź.", modelId: "fraction-lesson", modelSeed: 61511, questions: questions("story", 5, "M6-1.5-story", 615110), preserveTaskTitle: true, studentInstruction: "Najpierw wpisz działanie, potem kolejne obliczenia i odpowiedź. Nie ma gotowych liczb w kratkach — wybierz je z treści.", teacherInstruction: "Oceń wybór działania, tok rozumowania i odpowiedź pełnym zdaniem." },
  ],
  status: "published",
});
