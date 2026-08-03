import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage, QuestionReference } from "@/types/lessonPackage";

const questions = (stage: string, count: number, seed: number, skillIds: string[]): QuestionReference[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `m6-8-${stage}-${index + 1}`,
    generatorId: "algebra-expressions-l1-v1",
    seed: seed + index,
    difficulty: index + 1 === count ? "challenge" : index < 2 ? "support" : "core",
    skillIds: [skillIds[index % skillIds.length]!],
    feedbackPolicy: {
      mode: "assessment" as const,
      allowsPartialCredit: false,
      manualReview: "never" as const,
      feedbackKeys: ["correct", "incorrect", "missing-answer"],
    },
  }));

const modelId = "algebra-expressions-lab" as const;

export const m681ZapisywanieWyrazenV1 = buildLessonPackage({
  id: "m6-8-1-zapisywanie-wyrazen-algebraicznych-v1",
  curriculumId: "pl-math-6-2026-classic",
  sectionId: "M6-S8",
  topicId: "M6-8.1",
  lessonNumber: 1,
  title: "Zapisywanie wyrażeń algebraicznych",
  studentGoal: "Zrozumiem, czym jest litera, i zapiszę podstawowe wyrażenia algebraiczne na podstawie ich opisu.",
  successCriteria: [
    "Wyjaśniam, co oznacza x w konkretnej sytuacji.",
    "Wiem, że każde x w jednym obliczeniu oznacza tę samą liczbę.",
    "Rozróżniam zwroty „o tyle większa lub mniejsza” oraz „tyle razy większa lub mniejsza”.",
    "Zapisuję sumę, różnicę, iloczyn i iloraz liczb opisanych słowami.",
  ],
  skillIds: ["M6-8.1-x-meaning", "M6-8.1-same-variable", "M6-8.1-coefficient", "M6-8.1-translate"],
  prerequisiteSkillIds: ["M5-1.1-arithmetic-language"],
  estimatedMinutes: 60,
  coreLesson: "Litera jako liczba oraz przekład podstawowych opisów słownych na zapis algebraiczny.",
  paperEvidence: "Zeszyt ucznia: cztery podstawowe pary opis–wyrażenie oraz przykłady sumy, różnicy, iloczynu i ilorazu.",
  overview: "Pierwsze spotkanie ucznia z algebrą. Po ustaleniu znaczenia litery uczeń rozróżnia zwroty „o ile” i „ile razy”, a następnie zapisuje podstawowe wyrażenia.",
  openingScript: "Pokaż zamknięte pudełko i powiedz: w środku jest konkretna liczba. Nie znamy jej jeszcze, więc nadajemy jej krótką etykietę x.",
  closingScript: "Poproś ucznia, aby dokończył zdanie: x nie jest przedmiotem — x oznacza…",
  commonMisconceptions: ["Uczeń traktuje x jak nazwę przedmiotu.", "Uczeń nadaje różne wartości kolejnym x w jednym zapisie.", "Uczeń myli 3x z x + 3.", "Uczeń odwraca kolejność w wyrażeniu 12 − x."],
  stageBlueprints: [
    { suffix: "meet-x", kind: "explore", title: "Kim jest x?", minutes: 8, headline: "Litera przechowuje liczbę", body: "Otwieraj pudełko i zmieniaj jego zawartość. Obserwuj, że x zawsze reprezentuje liczbę, choć kontekst może być różny.", modelId, teacherInstruction: "Najpierw używaj języka „liczba ukryta pod etykietą x”; termin niewiadoma wprowadź dopiero po doświadczeniu.", studentInstruction: "Zmieniaj i otwieraj pudełko. Powiedz własnymi słowami, co w tym doświadczeniu oznacza x." },
    { suffix: "same-x", kind: "worked-example", title: "Jedna litera, jedna wartość", minutes: 7, headline: "Dwa x są kopiami tej samej liczby", body: "Otwórz oba pudełka i sprawdź, że w jednym obliczeniu każde x ma tę samą wartość.", modelId, teacherInstruction: "Zestaw poprawny model x + x z kontrprzykładem, w którym pudełka miałyby różne wartości.", studentInstruction: "Sprawdź oba pudełka i wyjaśnij, dlaczego x + x zapisujemy jako 2x." },
    { suffix: "translate", kind: "practice", title: "Od słów do wyrażenia", minutes: 25, headline: "Dopasuj opis do zapisu algebraicznego", body: "Najpierw rozróżnij „o ile” i „ile razy”. Następnie rozpoznaj sumę, różnicę, iloczyn, iloraz, połowę i kwadrat liczby.", modelId, preserveTaskTitle: true, questions: questions("1-translate", 16, 681104, ["M6-8.1-x-meaning", "M6-8.1-same-variable", "M6-8.1-coefficient", "M6-8.1-translate"]), teacherInstruction: "Po każdym wyborze poproś o odczytanie całego wyrażenia i wskazanie zwrotu, który zdecydował o działaniu.", studentInstruction: "Wybierz zapis odpowiadający opisowi. Zwracaj uwagę na kolejność liczb oraz różnicę między zwrotami „o ile” i „ile razy”." },
    { suffix: "write-story-expression", kind: "practice", title: "Z treści do wyrażenia", minutes: 15, headline: "Samodzielnie zbuduj całe wyrażenie", body: "Odczytaj dane, ustal część zależną od x, oblicz część liczbową i wpisz całe wyrażenie klawiaturą algebraiczną.", modelId, preserveTaskTitle: true, questions: questions("1-story-expression", 6, 681600, ["M6-8.1-x-meaning", "M6-8.1-same-variable", "M6-8.1-coefficient", "M6-8.1-translate"]), teacherInstruction: "Nie pokazuj gotowych odpowiedzi. Poproś ucznia, aby najpierw nazwał znaczenie każdego składnika, a następnie sam wpisał pełne wyrażenie.", studentInstruction: "Zapisz całe wyrażenie. Wykonaj działania na samych liczbach, ale nie podstawiaj liczby za x." },
  ],
  status: "published",
});

export const m682WartoscWyrazenV1 = buildLessonPackage({
  id: "m6-8-2-obliczanie-wartosci-wyrazen-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.2", lessonNumber: 2,
  title: "Obliczanie wartości wyrażeń algebraicznych",
  studentGoal: "Podstawię liczbę za x i obliczę wartość wyrażenia we właściwej kolejności.",
  successCriteria: ["W każdym miejscu x podstawiam tę samą liczbę.", "Po podstawieniu zapisuję jawnie mnożenie.", "Stosuję kolejność działań.", "Sprawdzam, czy otrzymany wynik pasuje do danych."],
  skillIds: ["M6-8.2-substitute", "M6-8.2-multiplication", "M6-8.2-order", "M6-8.2-evaluate"], prerequisiteSkillIds: ["M6-8.1-x-meaning", "M5-1.4-order"], estimatedMinutes: 45,
  coreLesson: "Podstawianie wartości liczbowej za literę oraz obliczanie wartości wyrażenia z zachowaniem kolejności działań.", paperEvidence: "Zeszyt ucznia: pełny zapis podstawienia i obliczeń dla trzech wyrażeń.", overview: "Maszyna wejście–proces–wyjście oddziela podstawienie od wykonywania działań i zapobiega pomijaniu znaku mnożenia.", openingScript: "Przypomnij pudełko x. Dziś otworzymy je przed obliczeniem i wstawimy znalezioną liczbę w każde miejsce x.", closingScript: "Poproś o podanie trzech kroków: podstawiam, wykonuję działania w kolejności, sprawdzam.",
  commonMisconceptions: ["Uczeń podstawia liczbę tylko w jednym miejscu.", "Uczeń odczytuje 2x po podstawieniu jako liczbę dwucyfrową.", "Uczeń wykonuje dodawanie przed mnożeniem."],
  stageBlueprints: [
    { suffix: "machine-intro", kind: "worked-example", title: "Maszyna wartości", minutes: 12, headline: "Podstaw, oblicz, odczytaj", body: "Przeprowadź liczbę przez cztery etapy maszyny i obserwuj zmianę zapisu.", modelId, studentInstruction: "Przechodź krok po kroku i nazwij działanie wykonywane w każdej komorze.", teacherInstruction: "Zatrzymaj animację po podstawieniu i dopilnuj zapisu kropki mnożenia." },
    { suffix: "evaluate", kind: "practice", title: "Uruchom maszynę", minutes: 22, headline: "Oblicz wartość wyrażenia", body: "Podstaw podaną wartość x i wpisz wynik za pomocą klawiatury lekcyjnej.", modelId, preserveTaskTitle: true, questions: questions("2-evaluate", 5, 682100, ["M6-8.2-substitute", "M6-8.2-multiplication", "M6-8.2-order", "M6-8.2-evaluate"]), studentInstruction: "Najpierw zapisz w myślach podstawienie, potem wpisz ostateczny wynik.", teacherInstruction: "Przy odpowiedzi poproś o odczytanie zapisu po podstawieniu, nie tylko o wynik." },
    { suffix: "evaluate-exit", kind: "exit-ticket", title: "Samodzielne podstawienie", minutes: 6, headline: "Pokaż cały tok obliczenia", body: "Ostatnia seria sprawdza podstawienie, mnożenie i kolejność działań.", modelId, preserveTaskTitle: true, questions: questions("2-exit", 4, 682300, ["M6-8.2-substitute", "M6-8.2-multiplication", "M6-8.2-order", "M6-8.2-evaluate"]), studentInstruction: "Wykonaj zadania bez podpowiedzi maszyny krok po kroku.", teacherInstruction: "Ostatnia seria jest dowodem do kryteriów na slajdzie końcowym." },
  ], status: "published",
});

export const m683UpraszczanieWyrazenV1 = buildLessonPackage({
  id: "m6-8-3-upraszczanie-wyrazen-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.3", lessonNumber: 3,
  title: "Upraszczanie wyrażeń algebraicznych", studentGoal: "Rozpoznam wyrazy podobne i połączę je bez zmiany wartości wyrażenia.",
  successCriteria: ["Rozpoznaję wyrazy z taką samą częścią literową.", "Odczytuję współczynnik jako liczbę paczek x.", "Łączę osobno wyrazy z x i osobno liczby.", "Wyjaśniam, dlaczego 2x + 3 nie jest równe 5x."],
  skillIds: ["M6-8.3-like-terms", "M6-8.3-coefficient", "M6-8.3-simplify", "M6-8.3-explain"], prerequisiteSkillIds: ["M6-8.1-coefficient"], estimatedMinutes: 45,
  coreLesson: "Wyrazy podobne, współczynnik liczbowy oraz redukcja prostych sum i różnic wyrazów podobnych.", paperEvidence: "Zeszyt ucznia: kolorowe grupowanie wyrazów podobnych i uproszczenie czterech wyrażeń.", overview: "Klocki algebraiczne czynią widocznym podział na paczki x i jednostki, zanim uczeń przejdzie do operowania samymi symbolami.", openingScript: "Połóż obok siebie trzy identyczne pudełka x i dwa kolejne. Zapytaj, co można policzyć bez otwierania pudełek.", closingScript: "Poproś o uzasadnienie jednym zdaniem, dlaczego x i liczba 1 nie są wyrazami podobnymi.", commonMisconceptions: ["Uczeń dodaje wszystkie widoczne liczby i litery.", "Uczeń zmienia x w x² podczas dodawania.", "Uczeń gubi znak odejmowania."],
  stageBlueprints: [
    { suffix: "like-terms", kind: "explore", title: "Klocki tego samego rodzaju", minutes: 12, headline: "Sortuj paczki x i jednostki", body: "Łączymy tylko elementy tego samego rodzaju.", modelId, preserveTaskTitle: true, questions: questions("3-like", 4, 683100, ["M6-8.3-like-terms", "M6-8.3-explain"]), studentInstruction: "Wybierz wyrazy podobne i nazwij wspólną część literową.", teacherInstruction: "Wróć do konkretnego pudełka, gdy uczeń próbuje połączyć x z jednostką." },
    { suffix: "simplify", kind: "practice", title: "Połącz wyrazy podobne", minutes: 20, headline: "Uprość bez zmiany wartości", body: "Policz paczki x i wpisz współczynnik klawiaturą lekcyjną.", modelId, preserveTaskTitle: true, questions: questions("3-simplify", 4, 683300, ["M6-8.3-coefficient", "M6-8.3-simplify"]), studentInstruction: "Wpisz tylko współczynnik stojący przy x.", teacherInstruction: "Poproś o rozłożenie wyniku na sumę x przed zatwierdzeniem." },
    { suffix: "simplify-exit", kind: "exit-ticket", title: "Samodzielne upraszczanie", minutes: 8, headline: "Rozpoznaj, połącz i wyjaśnij", body: "Ostatnia seria łączy rozpoznanie wyrazów podobnych z obliczeniem współczynnika.", modelId, preserveTaskTitle: true, questions: questions("3-exit", 4, 683500, ["M6-8.3-like-terms", "M6-8.3-coefficient", "M6-8.3-simplify", "M6-8.3-explain"]), studentInstruction: "Rozwiąż bez podpowiedzi i sprawdź, czy nie połączyłeś różnych rodzajów elementów.", teacherInstruction: "Wyniki z tej serii zasilają profil kryteriów." },
  ], status: "published",
});

export const m684ZapisywanieRownanV1 = buildLessonPackage({
  id: "m6-8-4-zapisywanie-rownan-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.4", lessonNumber: 4,
  title: "Zapisywanie równań", studentGoal: "Zrozumiem znak równości jako równowagę i zapiszę równanie opisujące sytuację.",
  successCriteria: ["Wyjaśniam znak równości jako jednakową wartość stron.", "Rozróżniam wyrażenie i równanie.", "Wskazuję lewą i prawą stronę równania.", "Zapisuję równanie do sytuacji."],
  skillIds: ["M6-8.4-equality", "M6-8.4-expression-equation", "M6-8.4-sides", "M6-8.4-write"], prerequisiteSkillIds: ["M6-8.1-translate"], estimatedMinutes: 45,
  coreLesson: "Równanie jako zdanie o równości dwóch wartości oraz przekład sytuacji na zapis równania.", paperEvidence: "Zeszyt ucznia: modele dwóch wag i zapisane do nich równania.", overview: "Waga 3D zmienia znak równości z proceduralnego sygnału w relację dwóch jednakowych wartości.", openingScript: "Pokaż równą wagę i zapytaj, co możemy powiedzieć o masie obu szalek, choć nie znamy masy pudełka.", closingScript: "Poproś o dokończenie: wyrażenie opisuje wartość, a równanie mówi, że…", commonMisconceptions: ["Uczeń traktuje znak równości jak polecenie obliczenia.", "Uczeń zapisuje tylko jedną stronę równania.", "Uczeń odwraca relację z treści."],
  stageBlueprints: [
    { suffix: "equation-meaning", kind: "explore", title: "Równość to równowaga", minutes: 12, headline: "Dwie strony mają tę samą wartość", body: "Dołóż element tylko po jednej stronie i obserwuj, kiedy znak równości przestaje pasować.", modelId, studentInstruction: "Zmieniaj wagę i opisz, co musi się stać, aby znak równości był prawdziwy.", teacherInstruction: "Konsekwentnie mów „lewa strona ma taką samą wartość jak prawa”." },
    { suffix: "write-equation", kind: "practice", title: "Z historii na wagę", minutes: 22, headline: "Zapisz równanie sytuacji", body: "Wybierz równanie, które dokładnie opisuje zależność.", modelId, preserveTaskTitle: true, questions: questions("4-write", 4, 684100, ["M6-8.4-equality", "M6-8.4-expression-equation", "M6-8.4-sides", "M6-8.4-write"]), studentInstruction: "Najpierw nazwij x, potem wskaż obie strony i wybierz równanie.", teacherInstruction: "Przed wyborem poproś o zbudowanie obu stron na wadze." },
    { suffix: "write-equation-exit", kind: "exit-ticket", title: "Bilet równowagi", minutes: 6, headline: "Odczytaj i zapisz równanie", body: "Samodzielnie połącz historię, model i symbol.", modelId, preserveTaskTitle: true, questions: questions("4-exit", 4, 684300, ["M6-8.4-equality", "M6-8.4-expression-equation", "M6-8.4-sides", "M6-8.4-write"]), studentInstruction: "Wybierz zapis i sprawdź, czy obie strony odpowiadają historii.", teacherInstruction: "Ostatnia seria stanowi dowód umiejętności." },
  ], status: "published",
});

export const m685LiczbaSpelniajacaRownanieV1 = buildLessonPackage({
  id: "m6-8-5-liczba-spelniajaca-rownanie-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.5", lessonNumber: 5,
  title: "Liczba spełniająca równanie", studentGoal: "Sprawdzę przez podstawienie, czy liczba spełnia równanie.",
  successCriteria: ["Podstawiam kandydata w miejsce każdego x.", "Obliczam oddzielnie lewą i prawą stronę.", "Porównuję wartości stron.", "Uzasadniam, czy liczba spełnia równanie."],
  skillIds: ["M6-8.5-substitute", "M6-8.5-left-side", "M6-8.5-compare", "M6-8.5-justify"], prerequisiteSkillIds: ["M6-8.2-substitute", "M6-8.4-sides"], estimatedMinutes: 45,
  coreLesson: "Sprawdzanie rozwiązania równania przez podstawienie i porównanie wartości obu stron.", paperEvidence: "Zeszyt ucznia: tabela kandydat, lewa strona, prawa strona, wniosek.", overview: "Uczeń działa jak detektyw: kandydat trafia do pudełka x, a waga niezależnie oblicza obie strony.", openingScript: "Powiedz, że nie każda liczba pasuje do pudełka x. Dziś będziemy sprawdzać kandydatów bez zgadywania.", closingScript: "Poproś o podanie pełnego sprawdzenia, a nie samego słowa tak lub nie.", commonMisconceptions: ["Uczeń sprawdza tylko jedną stronę.", "Uczeń porównuje zapis zamiast wartości.", "Uczeń zmienia równanie podczas podstawiania."],
  stageBlueprints: [
    { suffix: "test-solution", kind: "worked-example", title: "Kandydat do pudełka x", minutes: 12, headline: "Podstaw i porównaj obie strony", body: "Włóż kandydata do pudełka i obserwuj wartości po obu stronach wagi.", modelId, modelSeed: 685100, studentInstruction: "Oblicz obie strony i zdecyduj, czy kandydat spełnia równanie.", teacherInstruction: "Zawsze zapisuj dwie linie: L = … oraz P = …" },
    { suffix: "test-solution-candidate", kind: "practice", title: "Detektyw rozwiązań", minutes: 20, headline: "Sprawdź kolejnych kandydatów", body: "Nie zgaduj — podstaw, oblicz i dopiero wtedy wydaj wniosek.", modelId, preserveTaskTitle: true, questions: questions("5-candidate", 4, 685300, ["M6-8.5-substitute", "M6-8.5-left-side", "M6-8.5-compare", "M6-8.5-justify"]), studentInstruction: "Wybierz odpowiedź dopiero po porównaniu wartości stron.", teacherInstruction: "Pytaj: jaka jest wartość lewej strony i jaka jest wartość prawej?" },
    { suffix: "test-solution-exit", kind: "exit-ticket", title: "Samodzielne sprawdzenie", minutes: 8, headline: "Podstaw, oblicz, porównaj, uzasadnij", body: "Ostatnia seria obejmuje wszystkie cztery kroki sprawdzania.", modelId, preserveTaskTitle: true, questions: questions("5-exit", 4, 685500, ["M6-8.5-substitute", "M6-8.5-left-side", "M6-8.5-compare", "M6-8.5-justify"]), studentInstruction: "Wykonaj sprawdzenie bez podpowiedzi.", teacherInstruction: "Wyniki stanowią dowód do końcowego profilu." },
  ], status: "published",
});

export const m686RozwiazywanieRownanV1 = buildLessonPackage({
  id: "m6-8-6-rozwiazywanie-rownan-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.6", lessonNumber: 6,
  title: "Rozwiązywanie równań", studentGoal: "Rozwiążę proste równanie, zachowując równowagę obu stron, i sprawdzę wynik.",
  successCriteria: ["Wykonuję tę samą operację po obu stronach.", "Dobieram operację odwrotną.", "Izoluję x bez utraty równowagi.", "Sprawdzam rozwiązanie przez podstawienie."],
  skillIds: ["M6-8.6-balance", "M6-8.6-inverse", "M6-8.6-isolate", "M6-8.6-check"], prerequisiteSkillIds: ["M6-8.4-equality", "M6-8.5-substitute"], estimatedMinutes: 45,
  coreLesson: "Rozwiązywanie równań przez wykonywanie równoważnych operacji po obu stronach i sprawdzanie wyniku.", paperEvidence: "Zeszyt ucznia: trzy równania rozwiązane metodą wagi wraz ze sprawdzeniem.", overview: "Najważniejsza lekcja działu. Uczeń manipuluje wagą i nazywa operacje równoważne; nie używa skrótu „przerzucamy na drugą stronę”.", openingScript: "Postaw na wadze x + 4 i 11. Zapytaj: co możemy zdjąć jednocześnie z obu szalek, aby pudełko zostało samo?", closingScript: "Poproś o wyjaśnienie, dlaczego każdą operację wykonujemy po obu stronach.", commonMisconceptions: ["Uczeń zmienia tylko jedną stronę.", "Uczeń mechanicznie zmienia znak bez rozumienia.", "Uczeń nie sprawdza rozwiązania."],
  stageBlueprints: [
    { suffix: "balance-solve-intro", kind: "worked-example", title: "Ta sama operacja po obu stronach", minutes: 10, headline: "Zachowaj równowagę", body: "Obserwuj model x + 4 = 11 i zdejmij tę samą masę z obu stron.", modelId, studentInstruction: "Nazwij operację, którą trzeba wykonać po obu stronach.", teacherInstruction: "Nie używaj zwrotu „przerzuć”. Każdy ruch pokaż równocześnie na obu szalkach." },
    { suffix: "balance-solve", kind: "practice", title: "Steruj wagą", minutes: 20, headline: "Rozwiąż równanie bez utraty równowagi", body: "Dobierz operację odwrotną, wpisz wartość x i sprawdź ją.", modelId, preserveTaskTitle: true, questions: questions("6-balance", 6, 686100, ["M6-8.6-balance", "M6-8.6-inverse", "M6-8.6-isolate", "M6-8.6-check"]), studentInstruction: "Wpisz wartość x dopiero po wykonaniu równoważnych operacji.", teacherInstruction: "Po każdym zadaniu poproś o werbalne sprawdzenie przez podstawienie." },
    { suffix: "inverse", kind: "practice", title: "Operacje odwrotne", minutes: 7, headline: "Cofnij działanie po obu stronach", body: "Rozpoznaj pary dodawanie–odejmowanie oraz mnożenie–dzielenie.", modelId, preserveTaskTitle: true, questions: questions("6-inverse", 6, 686400, ["M6-8.6-inverse", "M6-8.6-balance"]), studentInstruction: "Zastanów się, jaka operacja odwraca działanie przy x.", teacherInstruction: "Łącz zapis symboliczny z ruchem na wadze." },
    { suffix: "balance-solve-exit", kind: "exit-ticket", title: "Rozwiąż i sprawdź", minutes: 8, headline: "Pełne rozwiązanie równania", body: "Ostatnia seria sprawdza zachowanie równowagi, izolację x i kontrolę wyniku.", modelId, preserveTaskTitle: true, questions: questions("6-exit", 4, 686600, ["M6-8.6-balance", "M6-8.6-inverse", "M6-8.6-isolate", "M6-8.6-check"]), studentInstruction: "Rozwiąż bez podpowiedzi i sprawdź wynik.", teacherInstruction: "Wynik ostatniej serii zasila profil kryteriów." },
  ], status: "published",
});

export const m687ZadaniaTekstoweV1 = buildLessonPackage({
  id: "m6-8-7-zadania-tekstowe-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.7", lessonNumber: 7,
  title: "Zadania tekstowe", studentGoal: "Wybiorę niewiadomą, zbuduję równanie, rozwiążę je i odpowiem w kontekście zadania.",
  successCriteria: ["Zapisuję, co oznacza x.", "Tłumaczę zależności z historii na równanie.", "Rozwiązuję równanie metodą równowagi.", "Sprawdzam wynik i odpowiadam z jednostką."],
  skillIds: ["M6-8.7-define-x", "M6-8.7-model", "M6-8.7-solve", "M6-8.7-answer"], prerequisiteSkillIds: ["M6-8.4-write", "M6-8.6-check"], estimatedMinutes: 45,
  coreLesson: "Pięciostopniowe rozwiązywanie zadań tekstowych: niewiadoma, relacja, równanie, rozwiązanie, sprawdzenie i odpowiedź.", paperEvidence: "Zeszyt ucznia: jedno zadanie zapisane pełną mapą rozwiązania.", overview: "Stała mapa czterech kroków zmniejsza obciążenie pamięci i pozwala skupić się na znaczeniu x oraz relacji w historii.", openingScript: "Powiedz, że równanie nie zaczyna się od liter. Zaczyna się od pytania: czego nie wiem i co oznaczy moje x?", closingScript: "Poproś o przeczytanie odpowiedzi bez historii i ocenę, czy nadal wiadomo, czego dotyczy liczba.", commonMisconceptions: ["Uczeń nie definiuje x.", "Uczeń wybiera równanie na podstawie pojedynczego słowa.", "Uczeń podaje liczbę bez jednostki i odpowiedzi."],
  stageBlueprints: [
    { suffix: "story-equation-intro", kind: "worked-example", title: "Historia zamienia się w równanie", minutes: 10, headline: "Najpierw znaczenie, potem symbol", body: "Przejdź przez mapę: x, zależność, równanie, rozwiązanie i sprawdzenie.", modelId, studentInstruction: "Nazwij, co oznacza x, zanim wybierzesz równanie.", teacherInstruction: "Zakrywaj kolejne kroki i ujawniaj je dopiero po propozycjach uczniów." },
    { suffix: "story-equation", kind: "practice", title: "Ułóż równanie", minutes: 14, headline: "Zbuduj model historii", body: "Wybierz znaczenie x i równanie odpowiadające wszystkim danym.", modelId, preserveTaskTitle: true, questions: questions("7-model", 4, 687100, ["M6-8.7-define-x", "M6-8.7-model"]), studentInstruction: "Pracuj według mapy i wybierz równanie.", teacherInstruction: "Pytaj, co oznacza każda liczba i każda strona równania." },
    { suffix: "story-solve", kind: "practice", title: "Rozwiąż i odpowiedz", minutes: 14, headline: "Dokończ historię liczbą", body: "Rozwiąż równanie i wpisz odpowiedź wraz z widoczną jednostką.", modelId, preserveTaskTitle: true, questions: questions("7-solve", 5, 687300, ["M6-8.7-solve", "M6-8.7-answer"]), studentInstruction: "Wpisz wartość x, sprawdź ją i odczytaj w kontekście historii.", teacherInstruction: "Wymagaj zdania odpowiedzi po każdym przykładzie." },
    { suffix: "story-solve-exit", kind: "exit-ticket", title: "Pełna mapa rozwiązania", minutes: 7, headline: "Od pytania do odpowiedzi", body: "Ostatnia seria łączy wszystkie kroki zadania tekstowego.", modelId, preserveTaskTitle: true, questions: questions("7-exit", 4, 687500, ["M6-8.7-define-x", "M6-8.7-model", "M6-8.7-solve", "M6-8.7-answer"]), studentInstruction: "Wykonaj pełną mapę samodzielnie.", teacherInstruction: "Wyniki stanowią końcowy dowód umiejętności." },
  ], status: "published",
});

export const m688PowtorzenieAlgebryV1 = buildLessonPackage({
  id: "m6-8-8-powtorzenie-wyrazen-i-rownan-v1", curriculumId: "pl-math-6-2026-classic", sectionId: "M6-S8", topicId: "M6-8.8", lessonNumber: 8,
  title: "Powtórzenie wiadomości", studentGoal: "Samodzielnie zastosuję wyrażenia algebraiczne i równania oraz wyjaśnię tok rozumowania.",
  successCriteria: ["Rozumiem język wyrażeń algebraicznych.", "Obliczam i upraszczam wyrażenia.", "Zapisuję i rozwiązuję równania.", "Stosuję równania w zadaniach tekstowych."],
  skillIds: ["M6-8.8-language", "M6-8.8-expressions", "M6-8.8-equations", "M6-8.8-stories"], prerequisiteSkillIds: ["M6-8.1-x-meaning", "M6-8.3-simplify", "M6-8.6-check", "M6-8.7-answer"], estimatedMinutes: 45,
  coreLesson: "Powtórzenie znaczenia x, wartości i upraszczania wyrażeń, równań oraz zadań tekstowych.", paperEvidence: "Zeszyt ucznia: karta misji z zapisem strategii przy każdej stacji.", overview: "Pięć stacji wraca do przewodnich modeli działu i kończy się mieszaną serią przypisaną do czterech kryteriów.", openingScript: "Przedstaw powtórzenie jako misję powrotu do pięciu laboratoriów: pudełka, maszyny, klocków, wagi i historii.", closingScript: "Poproś ucznia o wskazanie modelu, który najbardziej pomógł mu zrozumieć x, i uzasadnienie wyboru.", commonMisconceptions: ["Uczeń wraca do mechanicznego operowania symbolami bez znaczenia.", "Uczeń pomija sprawdzenie równania.", "Uczeń nie łączy wyniku z kontekstem."],
  stageBlueprints: [
    { suffix: "review-language", kind: "practice", title: "Misja 1: język algebry", minutes: 6, headline: "Rozpoznaj znaczenie x i zapis", body: "Wróć do pudełka x i języka wyrażeń.", modelId, preserveTaskTitle: true, questions: questions("8-language", 4, 688100, ["M6-8.8-language"]), studentInstruction: "Wybierz zapis i nazwij znaczenie x.", teacherInstruction: "Wymagaj krótkiego uzasadnienia wyboru." },
    { suffix: "review-evaluate", kind: "practice", title: "Misja 2: maszyna wartości", minutes: 7, headline: "Podstaw i oblicz", body: "Przeprowadź liczbę przez maszynę we właściwej kolejności.", modelId, preserveTaskTitle: true, questions: questions("8-evaluate", 5, 688200, ["M6-8.8-expressions"]), studentInstruction: "Podstaw i wpisz wartość wyrażenia.", teacherInstruction: "Sprawdzaj jawny zapis mnożenia po podstawieniu." },
    { suffix: "review-simplify", kind: "practice", title: "Misja 3: klocki algebraiczne", minutes: 7, headline: "Połącz wyrazy podobne", body: "Grupuj tylko elementy tego samego rodzaju.", modelId, preserveTaskTitle: true, questions: questions("8-simplify", 4, 688300, ["M6-8.8-expressions"]), studentInstruction: "Wpisz współczynnik uproszczonego wyrażenia.", teacherInstruction: "Wracaj do modelu paczek x, gdy pojawia się wątpliwość." },
    { suffix: "review-balance-solve", kind: "practice", title: "Misja 4: laboratorium równowagi", minutes: 8, headline: "Rozwiąż i sprawdź równanie", body: "Wykonuj te same operacje po obu stronach.", modelId, preserveTaskTitle: true, questions: questions("8-equations", 6, 688400, ["M6-8.8-equations"]), studentInstruction: "Rozwiąż równanie i sprawdź wynik.", teacherInstruction: "Nie akceptuj samego wyniku bez wskazania operacji równoważnej." },
    { suffix: "review-story-solve", kind: "challenge", title: "Misja 5: algebraiczny detektyw", minutes: 7, headline: "Zbuduj równanie do historii", body: "Nazwij x, rozwiąż i odpowiedz w kontekście.", modelId, preserveTaskTitle: true, questions: questions("8-stories", 4, 688500, ["M6-8.8-stories"]), studentInstruction: "Pracuj według mapy zadania tekstowego.", teacherInstruction: "Dopilnuj jednostki i pełnego zdania odpowiedzi." },
    { suffix: "review-exit", kind: "exit-ticket", title: "Bilet końcowy Działu 8", minutes: 10, headline: "Mieszana misja finałowa", body: "Każde zadanie sprawdza inną część działu i buduje końcowy profil umiejętności.", modelId, preserveTaskTitle: true, questions: questions("8-exit", 4, 688700, ["M6-8.8-language", "M6-8.8-expressions", "M6-8.8-equations", "M6-8.8-stories"]), studentInstruction: "Rozwiąż samodzielnie i po każdym zadaniu nazwij użyty model.", teacherInstruction: "Ta seria jest głównym dowodem do końcowego profilu kryteriów." },
  ], status: "published",
});

export const grade6Section8Lessons: LessonPackage[] = [
  m681ZapisywanieWyrazenV1,
  m682WartoscWyrazenV1,
  m683UpraszczanieWyrazenV1,
  m684ZapisywanieRownanV1,
  m685LiczbaSpelniajacaRownanieV1,
  m686RozwiazywanieRownanV1,
  m687ZadaniaTekstoweV1,
  m688PowtorzenieAlgebryV1,
];
