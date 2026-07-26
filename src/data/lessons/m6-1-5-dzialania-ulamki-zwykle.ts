import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, skillId: string, baseSeed: number) =>
  Array.from({ length: count }, (_, index): QuestionReference => ({
    id: `m6-1-5-${stage}-${index + 1}`,
    // Klasa 6 korzysta z tego samego sprawdzonego generatora i dokładnie
    // tych samych modeli interaktywnych co dział 3 klasy 5. Trudność
    // podnosimy doborem ziaren i wariantu challenge, a nie drugim UI.
    generatorId: "fraction-lesson-l1-v1",
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
    { suffix: "topic2-improper-to-mixed", kind: "worked-example", title: "Wyłączanie całości", minutes: 8, headline: "Z ułamka niewłaściwego wyłączamy całości", body: "Podziel licznik przez mianownik. Iloraz zapisujesz jako liczbę całkowitą, a reszta zostaje licznikiem części ułamkowej.", modelId: "fraction-lesson", modelSeed: 615010, questions: questions("convert", 5, "M6-1.5-convert", 615010), preserveTaskTitle: true, studentInstruction: "Wyłącz pełne całości i wpisz liczbę mieszaną w pustych kratkach. Ułamek zapisuj licznikiem nad kreską i mianownikiem pod kreską.", teacherInstruction: "Poproś ucznia o zapis dzielenia licznika przez mianownik: iloraz daje całości, a reszta licznik części ułamkowej." },
    // Id aktywności jest celowo identyczny z klasą 5. Dzięki temu klasa 6
    // korzysta z tego samego układu liczby mieszanej, pionowego ułamka,
    // klawiatury ekranowej, walidacji i informacji zwrotnej.
    { suffix: "topic1-mixed-to-improper", kind: "worked-example", title: "Zamiana liczby mieszanej na ułamek niewłaściwy", minutes: 8, headline: "Całość mnożymy przez mianownik i dodajemy licznik", body: "Pomnóż liczbę całkowitą przez mianownik, a do otrzymanego wyniku dodaj licznik. Mianownik pozostaje bez zmiany.", modelId: "fraction-lesson", modelSeed: 31204, questions: questions("mixed-to-improper", 5, "M6-1.5-mixed-convert", 31204), preserveTaskTitle: true, studentInstruction: "Zapisz ułamek niewłaściwy w pustych kratkach. Zachowaj mianownik liczby mieszanej.", teacherInstruction: "Poproś ucznia o osobne obliczenie: całość razy mianownik, a następnie dodanie licznika." },
    { suffix: "equiv-expansion-grid", kind: "worked-example", title: "Rozszerzanie do podanego mianownika", minutes: 9, headline: "Ten sam mnożnik działa na licznik i mianownik", body: "Znajdź liczbę, przez którą trzeba rozszerzyć ułamek, aby otrzymać podany mianownik.", modelId: "fraction-lesson", modelSeed: 61502, questions: questions("expand", 5, "M6-1.5-expand", 615020), preserveTaskTitle: true, studentInstruction: "Uzupełnij mnożnik i oba brakujące pola. Każdy etap musi zachować tę samą wartość ułamka.", teacherInstruction: "Przed zatwierdzeniem sprawdź, czy licznik i mianownik zostały pomnożone przez tę samą liczbę." },
    { suffix: "equiv-cross-out-rewrite", kind: "practice", title: "Skracanie do postaci nieskracalnej", minutes: 9, headline: "Skracaj licznik i mianownik przez tę samą liczbę", body: "Wybierz wspólny dzielnik, zapisz skrócony ułamek i sprawdź, czy nie można go już dalej skrócić.", modelId: "fraction-lesson", modelSeed: 61503, questions: questions("simplify", 5, "M6-1.5-simplify", 615030), preserveTaskTitle: true, studentInstruction: "Wpisz liczby po skróceniu. Nie zatwierdzaj, dopóki ułamek nie jest nieskracalny.", teacherInstruction: "Zwróć uwagę, czy uczeń nie skreśla tylko jednej liczby." },
    { suffix: "topic1-axis-labels", kind: "practice", title: "Ułamki na osi liczbowej", minutes: 8, headline: "Pozycja na osi mówi, jaką część całości wskazuje punkt", body: "Odczytaj ułamki z dwóch różnych osi i przypisz je do odpowiednich punktów.", modelId: "fraction-lesson", modelSeed: 61504, questions: questions("axis", 2, "M6-1.5-axis", 615040), preserveTaskTitle: true, studentInstruction: "Policz równe odcinki od zera. Dopasuj każdy ułamek do właściwej litery.", teacherInstruction: "Na pierwszej osi każda całość jest podzielona na ósme części, a na drugiej na szóste." },
    { suffix: "mixed-same-denom-independent", kind: "practice", title: "Dodawanie i odejmowanie ułamków o tym samym mianowniku", minutes: 9, headline: "Ułamki i liczby mieszane o jednakowych mianownikach", body: "Wykonaj serię działań na ułamkach i liczbach mieszanych. Jeżeli w odejmowaniu brakuje części ułamkowych, zamień jedną całość.", modelId: "fraction-lesson", modelSeed: 35520, questions: questions("mixed-same-denom-independent", 5, "M6-1.5-add-sub-same", 35520), preserveTaskTitle: true, studentInstruction: "Wypełnij wszystkie aktywne kratki. Jeżeli trzeba, zamień jedną całość, a następnie zapisz wynik w najprostszej postaci i zatwierdź.", teacherInstruction: "Uczeń pracuje w znanym układzie kratek i zachowuje pełny ślad ewentualnej zamiany całości." },
    { suffix: "different-denom-l2-independent", kind: "practice", title: "Dodawanie i odejmowanie ułamków o różnych mianownikach", minutes: 20, headline: "15 przykładów: wspólny mianownik, pełne obliczenie i najprostsza postać", body: "Seria zawiera dodawanie, odejmowanie oraz liczby mieszane. Liczba kratek dopasowuje się do każdego etapu obliczenia.", modelId: "fraction-lesson", modelSeed: 536201, questions: questions("different-denom-l2-independent", 15, "M6-1.5-add-sub-different", 536201), preserveTaskTitle: true, studentInstruction: "Najpierw wpisz oba ułamki po sprowadzeniu do wspólnego mianownika, potem wynik działania, a na końcu skrócenie albo liczbę mieszaną, jeśli są potrzebne. Zatwierdź całe rozwiązanie.", teacherInstruction: "Kolejne zadanie uruchamia się w tym samym slajdzie dopiero po poprawnym zatwierdzeniu poprzedniego." },
    { suffix: "m5-3-8-reasoning", kind: "practice", title: "Oblicz ułamek liczby", minutes: 8, headline: "Jedna szósta z 20 — samodzielny wybór działania i skracania", body: "Na początku uczeń widzi wyłącznie jedną szóstą z 20. Przycisk odsłania skreślenie mianownika z liczbą naturalną, a dalsze kratki pozostają puste.", modelId: "fraction-lesson", modelSeed: 61507, questions: questions("fraction-of-number", 1, "M6-1.5-fraction-of-number", 615070), preserveTaskTitle: true, studentInstruction: "Rozpoznaj potrzebne działanie. Naciśnij „Skróć”, wpisz liczby po skróceniu, wynik oraz liczbę mieszaną.", teacherInstruction: "Uczeń sam rozpoznaje mnożenie. Skreślenia pojawiają się dopiero po naciśnięciu przycisku, a wszystkie wartości po skróceniu pozostają do wpisania." },
    { suffix: "m5-3-9-l2-independent", kind: "practice", title: "Mnożenie ułamków", minutes: 9, headline: "Skracaj przed mnożeniem, gdy to ułatwia obliczenia", body: "Zamień liczby mieszane na ułamki niewłaściwe, skróć po skosie i pomnóż liczniki oraz mianowniki.", modelId: "fraction-lesson", modelSeed: 61508, questions: questions("multiply", 5, "M6-1.5-multiply", 615080), preserveTaskTitle: true, studentInstruction: "Wpisz etapy skracania i wynik. Mnożenie zapisuj kropką.", teacherInstruction: "Sprawdź, czy uczeń skraca po skosie przed mnożeniem, a nie po obliczeniu tylko jeden element." },
    { suffix: "m5-3-11-l3-independent", kind: "practice", title: "Dzielenie ułamków", minutes: 9, headline: "Dzielimy przez mnożenie przez odwrotność", body: "Zamień liczby mieszane na ułamki niewłaściwe, zapisz mnożenie przez odwrotność dzielnika, skróć i oblicz wynik.", modelId: "fraction-lesson", modelSeed: 61509, questions: questions("divide", 5, "M6-1.5-divide", 615090), preserveTaskTitle: true, studentInstruction: "Wpisz liczby po zamianie, skróć je po skosie i uzupełnij wynik.", teacherInstruction: "Przypomnij: odwrotność dotyczy wyłącznie dzielnika; liczby mieszane najpierw zamieniamy na ułamki niewłaściwe." },
    { suffix: "m5-3-r-order-fractions", kind: "challenge", title: "Kolejność działań na ułamkach", minutes: 10, headline: "Wykonuj działania w dobrej kolejności", body: "Rozwiąż dłuższe przykłady z ułamkami: najpierw nawiasy i mnożenie lub dzielenie, a na końcu dodawanie albo odejmowanie.", modelId: "fraction-lesson", modelSeed: 61510, questions: questions("order", 5, "M6-1.5-order", 615100), preserveTaskTitle: true, studentInstruction: "Zapisz pośrednie kroki w pustych kratkach. Wybierz kolejność działań, nie wykonuj wszystkiego naraz.", teacherInstruction: "Poproś ucznia o wskazanie pierwszego działania przed rozpoczęciem obliczeń." },
    { suffix: "m5-3-r-mixed-stories", kind: "exit-ticket", title: "Zadania tekstowe", minutes: 10, headline: "Wybierz działanie i uzasadnij wynik", body: "Przeczytaj dane, samodzielnie zapisz działanie na ułamkach, wykonaj obliczenia krok po kroku i podaj odpowiedź.", modelId: "fraction-lesson", modelSeed: 61511, questions: questions("story", 5, "M6-1.5-story", 615110), preserveTaskTitle: true, studentInstruction: "Najpierw wpisz działanie, potem kolejne obliczenia i odpowiedź. Nie ma gotowych liczb w kratkach — wybierz je z treści.", teacherInstruction: "Oceń wybór działania, tok rozumowania i odpowiedź pełnym zdaniem." },
  ],
  status: "published",
});
