import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import type { LessonPackage } from "@/types/lessonPackage";

const standardPractice = (title: string, items: { expression: string; prompt: string }[]) => ({
  suffix: "s5",
  kind: "practice" as const,
  title: "Ćwicz",
  minutes: 12,
  headline: title,
  print: {
    worksheetTitle: title,
    instructions: "Oblicz / uzasadnij. Bez kalkulatora, chyba że nauczyciel pozwoli.",
    items: items.map((item, index) => ({ id: `p${index + 1}`, ...item })),
  },
});

const standardExit = (items: { expression: string; prompt: string }[]) => ({
  suffix: "s6",
  kind: "exit-ticket" as const,
  title: "Bilet wyjścia",
  minutes: 5,
  headline: "Bilet wyjścia",
  print: {
    worksheetTitle: "Bilet wyjścia",
    instructions: "Oddaj po sprawdzeniu.",
    items: items.map((item, index) => ({ id: `e${index + 1}`, ...item })),
  },
});

export const m515NajpierwPrzewidzV1: LessonPackage = buildLessonPackage({
  id: "m5-1-5-najpierw-przewidz-v1",
  topicId: "M5-1.5",
  title: "Szacowanie wyników — Najpierw przewidź",
  coreLesson: "Najpierw przewidź",
  paperEvidence: "Karta oceny sensowności wyniku",
  studentGoal: "Uczeń szacuje wynik działania przez zaokrąglenie składników i ocenia, czy dokładny wynik ma sens.",
  successCriteria: ["Podaje przedział wyniku przed obliczeniem.", "Wykrywa oczywisty błąd w wyniku."],
  prerequisiteSkillIds: ["M5-1.4-order-ops"],
  skillIds: ["M5-1.5-estimation"],
  estimatedMinutes: 40,
  overview: "Szacowanie jako kontrola sensu — przed kalkulatorem i po obliczeniu.",
  openingScript: "„Najpierw przewidujemy — potem liczymy — na końcu sprawdzamy, czy wynik ma sens.”",
  closingScript: "„Jedno zadanie dziennie: szacunek + wynik + ocena sensu.”",
  commonMisconceptions: ["Szacunek traktowany jak dokładne obliczenie.", "Brak porównania z przedziałem po wyliczeniu."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "298 + 412 — ile mniej więcej?" },
    { suffix: "s2", kind: "explore", title: "Zaokrąglanie", minutes: 8, headline: "Zaokrąglij do setek i dodaj" },
    { suffix: "s3", kind: "discuss", title: "Przedział", minutes: 6, headline: "Czy wynik musi być między…?", discussionPrompts: ["Kiedy zaokrąglasz w górę?", "Kiedy w dół?"] },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "487 + 519 — szacunek i wynik" },
    standardPractice("Czy to możliwe?", [
      { expression: "61 × 58", prompt: "Szacunek + przedział wyniku." },
      { expression: "903 − 468", prompt: "Szacunek + wynik dokładny." },
    ]),
    standardExit([
      { expression: "39 × 21", prompt: "Szacunek i ocena sensu." },
      { expression: "712 − 289", prompt: "Szacunek i wynik." },
    ]),
  ],
});

export const m516CyfrowyZeszytV1: LessonPackage = buildLessonPackage({
  id: "m5-1-6-cyfrowy-zeszyt-v1",
  topicId: "M5-1.6",
  title: "Pisemne dodawanie i odejmowanie — Cyfrowy zeszyt",
  coreLesson: "Cyfrowy zeszyt w kratkę",
  paperEvidence: "Arkusz w kratkę",
  studentGoal: "Uczeń ustawia liczby w kolumnach i wykonuje dodawanie lub odejmowanie pisemne z przeniesieniem.",
  successCriteria: ["Poprawnie ustawia liczby pod sobą.", "Wykonuje wymianę/pożyczkę krok po kroku."],
  prerequisiteSkillIds: ["M5-1.2-mental-add-sub"],
  skillIds: ["M5-1.6-written-add-sub"],
  overview: "Pisemny zapis w kratkę — kolumny i przeniesienia.",
  openingScript: "„Kratka pomaga trzymać rzędy — setki pod setkami.”",
  closingScript: "„Sprawdź wymianę — czy kolumna się zgadza?”",
  commonMisconceptions: ["Złe wyrównanie cyfr.", "Pożyczka tylko w jednej kolumnie bez aktualizacji sąsiedniej."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Dlaczego kratka?" },
    { suffix: "s2", kind: "explore", title: "Kolumny", minutes: 10, headline: "Ustaw 347 + 285" },
    { suffix: "s3", kind: "discuss", title: "Pożyczka", minutes: 6, headline: "Skąd wzięła się jedynka?" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "502 − 267 krok po kroku" },
    standardPractice("Arkusz w kratkę", [
      { expression: "456 + 378", prompt: "Pisemnie." },
      { expression: "700 − 458", prompt: "Pisemnie z pożyczką." },
    ]),
    standardExit([
      { expression: "638 + 195", prompt: "Wynik." },
      { expression: "503 − 276", prompt: "Wynik." },
    ]),
  ],
});

export const m517MnozenieWarstwamiV1: LessonPackage = buildLessonPackage({
  id: "m5-1-7-mnozenie-warstwami-v1",
  topicId: "M5-1.7",
  title: "Pisemne mnożenie — Mnożenie warstwami",
  coreLesson: "Mnożenie warstwami",
  paperEvidence: "Karta iloczynów częściowych",
  studentGoal: "Uczeń rozkłada mnożenie na iloczyny częściowe i zapisuje wynik pisemnie.",
  successCriteria: ["Buduje iloczyny częściowe.", "Sumuje je poprawnie."],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.7-written-multiply"],
  overview: "Model warstw i iloczynów częściowych.",
  openingScript: "„Mnożymy częściami — warstwa po warstwie.”",
  closingScript: "„Sprawdź ostatnią warstwę — czy przesunąłeś zapis?”",
  commonMisconceptions: ["Błędne przesunięcie iloczynu częściowego.", "Pominięcie zer w czynniku."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "23 × 4 w głowie — a 23 × 14?" },
    {
      suffix: "s2",
      kind: "explore",
      title: "Prostokąt",
      minutes: 10,
      headline: "23 × 14 na siatce",
      modelId: "multiplication-grid",
      modelSeed: 14,
    },
    { suffix: "s3", kind: "discuss", title: "Warstwy", minutes: 6, headline: "23×4 i 23×10" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "36 × 24 pisemnie" },
    standardPractice("Iloczyny częściowe", [
      { expression: "45 × 16", prompt: "Zapis warstwami." },
      { expression: "128 × 7", prompt: "Pisemnie." },
    ]),
    standardExit([
      { expression: "52 × 13", prompt: "Wynik." },
      { expression: "305 × 6", prompt: "Wynik." },
    ]),
  ],
});

export const m518RozdzielniaV1: LessonPackage = buildLessonPackage({
  id: "m5-1-8-rozdzielnia-v1",
  topicId: "M5-1.8",
  title: "Pisemne dzielenie — Rozdzielnia",
  coreLesson: "Rozdzielnia",
  paperEvidence: "Dzielenie z/bez reszty",
  studentGoal: "Uczeń wykonuje dzielenie pisemne i sprawdza iloczyn dzielnika i ilorazu z resztą.",
  successCriteria: ["Poprawny iloraz i reszta.", "Sprawdzenie: dzielnik × iloraz + reszta."],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.8-written-divide"],
  overview: "Pisemne dzielenie z kontrolą reszty.",
  openingScript: "„Rozdzielnia — ile razy mieści się dzielnik w kolejnych fragmentach?”",
  closingScript: "„Zawsze sprawdź resztę mnożeniem wstecz.”",
  commonMisconceptions: ["Reszta większa lub równa dzielnikowi.", "Zero w ilorazie pominięte."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "84 ÷ 7 — ile grup?" },
    { suffix: "s2", kind: "explore", title: "Reszta", minutes: 10, headline: "53 ÷ 8 — pełne paczki i reszta" },
    { suffix: "s3", kind: "discuss", title: "Sprawdzenie", minutes: 6, headline: "dzielnik × iloraz + reszta" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 8, headline: "156 ÷ 12" },
    standardPractice("Rozdzielnia", [
      { expression: "975 ÷ 15", prompt: "Pisemnie." },
      { expression: "89 ÷ 6", prompt: "Iloraz i reszta." },
    ]),
    standardExit([
      { expression: "744 ÷ 24", prompt: "Wynik." },
      { expression: "97 ÷ 8", prompt: "Iloraz i reszta." },
    ]),
  ],
});

export const m519DetektywDanychV1: LessonPackage = buildLessonPackage({
  id: "m5-1-9-detektyw-danych-v1",
  topicId: "M5-1.9",
  title: "Zadania tekstowe — Detektyw danych",
  coreLesson: "Detektyw danych",
  paperEvidence: "Zadania 1–3-etapowe",
  studentGoal: "Uczeń wybiera potrzebne dane, planuje rozwiązanie i sprawdza sens wyniku w zadaniu tekstowym.",
  successCriteria: ["Oznacza dane potrzebne i zbędne.", "Zapisuje plan przed obliczeniem."],
  prerequisiteSkillIds: ["M5-1.5-estimation", "M5-1.6-written-add-sub"],
  skillIds: ["M5-1.9-word-problems"],
  estimatedMinutes: 50,
  overview: "Czytanie z rozumieniem zadań — plan przed działaniem.",
  openingScript: "„Najpierw pytanie — potem dane — na końcu plan.”",
  closingScript: "„Czy odpowiedź odpowiada na pytanie z treści?”",
  commonMisconceptions: ["Obliczenie bez pytania.", "Użycie zbędnej liczby z treści."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Wejście", minutes: 5, headline: "Co jest pytaniem?" },
    { suffix: "s2", kind: "explore", title: "Dane", minutes: 10, headline: "Potrzebne vs zbędne" },
    { suffix: "s3", kind: "discuss", title: "Plan", minutes: 8, headline: "Zapis planu przed liczeniem" },
    { suffix: "s4", kind: "worked-example", title: "Przykład", minutes: 10, headline: "Zadanie dwuetapowe — bilety i reszta" },
    standardPractice("Detektyw danych", [
      { expression: "Sklep: 3×12 zł + 8 zł reszty", prompt: "Ile zapłacił klient?" },
      { expression: "Bus: 48 miejsc, 29 zajętych", prompt: "Ile wolnych?" },
      { expression: "3 paczki po 24 + 17 oddzielnie", prompt: "Ile łącznie?" },
    ]),
    standardExit([
      { expression: "Książki: 5×18 zł, budżet 100 zł", prompt: "Czy starczy? Ile zostanie?" },
      { expression: "Trasa 120 km, po 35 km tankowanie", prompt: "Ile km do końca?" },
    ]),
  ],
});

export const m51rElektrowniaLiczbV1: LessonPackage = buildLessonPackage({
  id: "m5-1-r-elektrownia-v1",
  topicId: "M5-1.R",
  title: "Powtórzenie — Elektrownia liczb",
  coreLesson: "Elektrownia liczb",
  paperEvidence: "Mapa „umiem / wrócę do”",
  studentGoal: "Uczeń utrwala umiejętności działu 1 w stacjach bez rankingu publicznego.",
  successCriteria: ["Sam ocenia strefy do powtórki.", "Wybiera strategię w każdej stacji."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-1.R-review"],
  estimatedMinutes: 40,
  overview: "Pięć stacji powtórzeniowych działu 1.",
  openingScript: "„Dziś nie ścigamy się — mapujemy, co już świeci.”",
  closingScript: "„Zabierzcie mapę «umiem / wrócę do» do domu.”",
  commonMisconceptions: ["Traktowanie powtórki jak sprawdzianu rankingowego."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Mapa", minutes: 5, headline: "Umiem / wrócę do" },
    { suffix: "s2", kind: "practice", title: "Stacja: liczby", minutes: 8, headline: "Fabryka liczb — szybka stacja" },
    { suffix: "s3", kind: "practice", title: "Stacja: pamięć", minutes: 8, headline: "Skoki i prostokąty" },
    { suffix: "s4", kind: "practice", title: "Stacja: pisemnie", minutes: 10, headline: "Kratka i rozdzielnia" },
    { suffix: "s5", kind: "practice", title: "Stacja: tekst", minutes: 8, headline: "Detektyw danych — mini" },
    { suffix: "s6", kind: "exit-ticket", title: "Plan domowy", minutes: 5, headline: "Jedna strefa do domu" },
  ],
});

export const m51sSprawdzianV1: LessonPackage = buildLessonPackage({
  id: "m5-1-s-sprawdzian-v1",
  topicId: "M5-1.S",
  title: "Sprawdzian i omówienie — Znajdź błąd",
  coreLesson: "Znajdź błąd",
  paperEvidence: "A/B, klucz, rubryka",
  studentGoal: "Uczeń rozwiązuje sprawdzian działu 1 i uczestniczy w omówieniu typowych błędów.",
  successCriteria: ["Wykonuje zadania z różnych stref działu.", "W omówieniu wskazuje błąd w rozwiązaniu."],
  prerequisiteSkillIds: [],
  skillIds: ["M5-1.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian + omówienie «Znajdź błąd».",
  openingScript: "„To sprawdzenie umiejętności — nie ranking.”",
  closingScript: "„Omówienie: gdzie powstał błąd i jak go naprawić.”",
  commonMisconceptions: ["Poprawianie pracy po oddaniu bez zgody nauczyciela."],
  stageBlueprints: [
    { suffix: "s1", kind: "warmup", title: "Reguły", minutes: 5, headline: "Czas, kalkulator, oddanie" },
    {
      suffix: "s2",
      kind: "exit-ticket",
      title: "Arkusz A",
      minutes: 25,
      headline: "Sprawdzian — część 1",
      print: {
        worksheetTitle: "Sprawdzian dział 1 — część A",
        instructions: "Rozwiąż w zeszytach. Czas: 25 min.",
        items: [
          { id: "a1", expression: "562 ○ 526", prompt: "Porównaj." },
          { id: "a2", expression: "73 + 48", prompt: "Oblicz (strategia)." },
          { id: "a3", expression: "6 × 47", prompt: "Oblicz." },
          { id: "a4", expression: "15 + 3 × 4", prompt: "Pierwsze działanie?" },
        ],
      },
    },
    {
      suffix: "s3",
      kind: "exit-ticket",
      title: "Arkusz B",
      minutes: 15,
      headline: "Sprawdzian — część 2",
      print: {
        worksheetTitle: "Sprawdzian dział 1 — część B",
        instructions: "Zadania otwarte.",
        items: [
          { id: "b1", expression: "456 + 278", prompt: "Pisemnie." },
          { id: "b2", expression: "912 ÷ 24", prompt: "Pisemnie." },
          { id: "b3", expression: "Zadanie tekstowe (bilety)", prompt: "Plan + odpowiedź." },
        ],
      },
    },
    { suffix: "s4", kind: "discuss", title: "Omówienie", minutes: 15, headline: "Znajdź błąd na tablicy", discussionPrompts: ["Gdzie powstał błąd?", "Jaką regułę zastosować?"] },
    { suffix: "s5", kind: "warmup", title: "Rubryka", minutes: 5, headline: "Wpisywanie wyników" },
  ],
});

export const section1LessonsWpC1bc: LessonPackage[] = [
  m515NajpierwPrzewidzV1,
  m516CyfrowyZeszytV1,
  m517MnozenieWarstwamiV1,
  m518RozdzielniaV1,
  m519DetektywDanychV1,
  m51rElektrowniaLiczbV1,
  m51sSprawdzianV1,
];
