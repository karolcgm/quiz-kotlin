import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import { createLessonStage } from "@/lib/lessons/createStage";
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

const lessonQuestions = (topic: "m5-1-5" | "m5-1-6", stage: number, count: number, generatorId: string) => Array.from({ length: count }, (_, index) => ({ id: `${topic}-${stage}-${index + 1}`, generatorId, seed: stage * 100 + index + 1, difficulty: "core" as const }));

export const m515NajpierwPrzewidzV1: LessonPackage = {
  id: "m5-1-5-najpierw-przewidz-v1",
  version: 2, curriculumId: "pl-math-5-2026-classic", sectionId: "M5-S1", topicId: "M5-1.5", lessonNumber: 5,
  title: "Szacowanie wyników działań",
  studentGoal: "Szacowanie wyników działań (zaokrąglanie liczb i ocenianie rzędu wielkości wyniku).",
  successCriteria: ["Zaokrąglam liczby przed oszacowaniem.", "Oceniając zadanie, wskazuję właściwy rząd wielkości wyniku."],
  learningGoals: [{ id: "m5-1-5-estimate", studentGoal: "Nauczę się szacować wyniki działań (zaokrąglać liczby i oceniać rząd wielkości wyniku).", successCriteria: ["Zaokrąglam liczby do wygodnych wartości.", "Wybieram sensowny rząd wielkości wyniku."], curriculumReferences: ["Klasy IV–VI, II.4"] }],
  prerequisiteSkillIds: ["M5-1.4-order-ops"],
  skillIds: ["M5-1.5-estimation"],
  estimatedMinutes: 45, printableResourceIds: [], status: "published",
  teacherGuide: { overview: "Podręcznik, 19 różnych zadań na trzech slajdach i końcowa ocena umiejętności.", timingNotes: "45 minut: 8 + 10 + 10 + 10 + 7.", materials: ["Tablica", "Tablety lub zeszyty"], stageNotes: { "m5-1-5-book": "Ustaw stronę i zadanie dla całej klasy.", "m5-1-5-actions": "Osiem różnych działań: dodawanie, odejmowanie, mnożenie i dzielenie.", "m5-1-5-shop": "Sześć różnych pytań TAK/NIE o zakupach i produktach.", "m5-1-5-story": "Pięć różnych zadań z wycieczki klasowej; przypomnij o zaokrąglaniu i porównywaniu.", "m5-1-5-understanding": "Uczniowie kończą lekcję oceną własnego rozumienia." }, commonMisconceptions: ["Dokładne liczenie zamiast szacowania."], differentiation: { support: "Pozwól zapisać zaokrąglenia obok liczb.", core: "Wykonaj wszystkie 19 zadań.", challenge: "Uzasadnij, dlaczego szacunek ma sens." }, openingScript: "Dziś nie liczymy dokładnie — najpierw sprawdzamy, jakiego wyniku się spodziewamy.", closingScript: "Dobry szacunek pozwala szybko sprawdzić, czy wynik ma sens.", exitTicketRubric: "19 odpowiedzi i ocena umiejętności.", paperWithoutDevices: "Uczniowie zaznaczają wynik na karcie ABC lub TAK/NIE.", languageReview: "szacunek, zaokrąglenie, pełne setki" },
  stages: [
    createLessonStage({ id: "m5-1-5-book", kind: "warmup", title: "Podręcznik — strona i zadanie", studentInstruction: "Otwórz podręcznik na stronie i zadaniu wskazanym na tablicy.", teacherInstruction: "Ustaw stronę i numer zadania przyciskami +/−.", estimatedMinutes: 8, live: { enabled: true, kind: "presentation", minutes: 8 }, board: { layout: "model", headline: "Praca z podręcznikiem", modelId: "exercise-board", modelSeed: 1 }, student: { activityMode: "view", instruction: "Wykonuj zadanie z podręcznika wskazane przez nauczyciela." } }),
    createLessonStage({ id: "m5-1-5-actions", kind: "practice", title: "Działania do pełnych setek", studentInstruction: "Oszacuj wynik — nie licz dokładnie.", teacherInstruction: "Osiem różnych działań.", estimatedMinutes: 10, live: { enabled: true, kind: "exercise", minutes: 10 }, board: { layout: "model", headline: "Najpierw oszacuj", modelId: "estimation-lesson", modelSeed: 1 }, student: { activityMode: "respond", instruction: "Wybierz najlepszy szacunek do setek.", modelId: "estimation-lesson", modelSeed: 1 } }, lessonQuestions("m5-1-5", 1, 8, "estimation-v1")),
    createLessonStage({ id: "m5-1-5-shop", kind: "practice", title: "Sklep spożywczy", studentInstruction: "Wybierz TAK lub NIE.", teacherInstruction: "Sześć różnych pytań o ceny produktów.", estimatedMinutes: 10, live: { enabled: true, kind: "exercise", minutes: 10 }, board: { layout: "model", headline: "Sklep na rogu", modelId: "estimation-lesson", modelSeed: 2 }, student: { activityMode: "respond", instruction: "Oceń, czy podana kwota wystarczy.", modelId: "estimation-lesson", modelSeed: 2 } }, lessonQuestions("m5-1-5", 2, 6, "estimation-v1")),
    createLessonStage({ id: "m5-1-5-story", kind: "practice", title: "Wycieczka klasowa", studentInstruction: "Zaokrąglij dane i wybierz odpowiedź.", teacherInstruction: "Pięć różnych zadań tekstowych osadzonych w wycieczce klasowej.", estimatedMinutes: 10, live: { enabled: true, kind: "exercise", minutes: 10 }, board: { layout: "model", headline: "Wycieczka klasowa", modelId: "estimation-lesson", modelSeed: 3 }, student: { activityMode: "respond", instruction: "Zaokrąglij dane i wybierz odpowiedź.", modelId: "estimation-lesson", modelSeed: 3 } }, lessonQuestions("m5-1-5", 3, 5, "estimation-v1")),
    createLessonStage({ id: "m5-1-5-understanding", kind: "exit-ticket", title: "Ocena umiejętności", studentInstruction: "Oceń, jak dobrze rozumiesz dzisiejszy temat.", teacherInstruction: "Poproś uczniów o szczerą ocenę zrozumienia.", estimatedMinutes: 7, live: { enabled: true, kind: "quick-check", minutes: 7 }, board: { layout: "narrative", headline: "Ocena umiejętności", body: "Zastanów się: czy umiesz oszacować wynik do pełnych setek?" }, student: { activityMode: "view", instruction: "Wybierz ocenę zrozumienia po wykonaniu wszystkich zadań." } }),
  ],
};

export const m516CyfrowyZeszytV1: LessonPackage = {
  id: "m5-1-6-cyfrowy-zeszyt-v1",
  version: 2, curriculumId: "pl-math-5-2026-classic", sectionId: "M5-S1", topicId: "M5-1.6", lessonNumber: 6,
  title: "Pisemne dodawanie i odejmowanie",
  studentGoal: "Uczeń ustawia liczby w kolumnach i wykonuje dodawanie lub odejmowanie pisemne z przeniesieniem.",
  successCriteria: ["Poprawnie ustawia liczby pod sobą.", "Wykonuje wymianę/pożyczkę krok po kroku."],
  learningGoals: [{ id: "m5-1-6-written", studentGoal: "Nauczę się dodawać i odejmować pisemnie oraz wpisać wynik cyframi.", successCriteria: ["Zapisuję liczby w odpowiednich kolumnach.", "Poprawnie stosuję przeniesienie lub pożyczkę."], curriculumReferences: ["Klasy IV–VI, II.2"] }],
  prerequisiteSkillIds: ["M5-1.2-mental-add-sub"],
  skillIds: ["M5-1.6-written-add-sub"],
  estimatedMinutes: 45, printableResourceIds: [], status: "published",
  teacherGuide: { overview: "Podręcznik, 20 różnych działań pisemnych i końcowa ocena umiejętności.", timingNotes: "45 minut: 8 + 15 + 15 + 7.", materials: ["Tablica", "Zeszyt w kratkę", "Tablety"], stageNotes: { "m5-1-6-book": "Ustaw stronę i zadanie dla całej klasy.", "m5-1-6-add": "Dziesięć różnych dodawań z przeniesieniem.", "m5-1-6-sub": "Dziesięć różnych odejmowań z pożyczką.", "m5-1-6-understanding": "Uczniowie kończą lekcję oceną własnego rozumienia." }, commonMisconceptions: ["Niewyrównanie cyfr do prawej.", "Pominięcie zmiany cyfry przy pożyczce."], differentiation: { support: "Daj uczniowi kratkę papierową.", core: "Wykonaj wszystkie 20 działań.", challenge: "Wyjaśnij, gdzie nastąpiło przeniesienie." }, openingScript: "Najpierw zapisujemy w kolumnach, potem liczymy od jedności.", closingScript: "Sprawdź wynik działaniem odwrotnym.", exitTicketRubric: "20 odpowiedzi wpisanych klawiaturą i ocena umiejętności.", paperWithoutDevices: "Uczniowie liczą w zeszycie i wpisują wynik na tablicy.", languageReview: "kolumna, przeniesienie, pożyczka, suma, różnica" },
  stages: [
    createLessonStage({ id: "m5-1-6-book", kind: "warmup", title: "Podręcznik — strona i zadanie", studentInstruction: "Otwórz podręcznik na stronie i zadaniu wskazanym na tablicy.", teacherInstruction: "Ustaw stronę i numer zadania przyciskami +/−.", estimatedMinutes: 8, live: { enabled: true, kind: "presentation", minutes: 8 }, board: { layout: "model", headline: "Praca z podręcznikiem", modelId: "exercise-board", modelSeed: 1 }, student: { activityMode: "view", instruction: "Wykonuj zadanie z podręcznika wskazane przez nauczyciela." } }),
    createLessonStage({ id: "m5-1-6-add", kind: "practice", title: "Dodawanie pisemne", studentInstruction: "Policz w kolumnach i wpisz wynik klawiaturą.", teacherInstruction: "Dziesięć różnych działań z przeniesieniem.", estimatedMinutes: 15, live: { enabled: true, kind: "exercise", minutes: 15 }, board: { layout: "model", headline: "Dodawanie pisemne", modelId: "written-add-sub-lesson", modelSeed: 1 }, student: { activityMode: "respond", instruction: "Wpisz wynik klawiaturą na dole.", modelId: "written-add-sub-lesson", modelSeed: 1 } }, lessonQuestions("m5-1-6", 1, 10, "written-add-sub-v1")),
    createLessonStage({ id: "m5-1-6-sub", kind: "practice", title: "Odejmowanie pisemne", studentInstruction: "Policz w kolumnach i wpisz wynik klawiaturą.", teacherInstruction: "Dziesięć różnych działań z pożyczką.", estimatedMinutes: 15, live: { enabled: true, kind: "exercise", minutes: 15 }, board: { layout: "model", headline: "Odejmowanie pisemne", modelId: "written-add-sub-lesson", modelSeed: 2 }, student: { activityMode: "respond", instruction: "Wpisz wynik klawiaturą na dole.", modelId: "written-add-sub-lesson", modelSeed: 2 } }, lessonQuestions("m5-1-6", 2, 10, "written-add-sub-v1")),
    createLessonStage({ id: "m5-1-6-story-add", kind: "practice", title: "Zadanie tekstowe — gra", studentInstruction: "Rozwiąż zadanie o punktach w grze i wpisz cyfry odpowiedzi.", teacherInstruction: "Poproś o wskazanie dodawania przed obliczeniem.", estimatedMinutes: 5, live: { enabled: true, kind: "exercise", minutes: 5 }, board: { layout: "model", headline: "Zadanie tekstowe — dodawanie", modelId: "written-story-problems-lesson", modelSeed: 1 }, student: { activityMode: "respond", instruction: "Wpisz odpowiedź klawiaturą cyfr.", modelId: "written-story-problems-lesson", modelSeed: 1 } }),
    createLessonStage({ id: "m5-1-6-story-sub", kind: "practice", title: "Zadanie tekstowe — krzesła", studentInstruction: "Rozwiąż zadanie o krzesłach i wpisz cyfry odpowiedzi.", teacherInstruction: "Poproś o wskazanie odejmowania przed obliczeniem.", estimatedMinutes: 5, live: { enabled: true, kind: "exercise", minutes: 5 }, board: { layout: "model", headline: "Zadanie tekstowe — odejmowanie", modelId: "written-story-problems-lesson", modelSeed: 2 }, student: { activityMode: "respond", instruction: "Wpisz odpowiedź klawiaturą cyfr.", modelId: "written-story-problems-lesson", modelSeed: 2 } }),
    createLessonStage({ id: "m5-1-6-understanding", kind: "exit-ticket", title: "Ocena umiejętności", studentInstruction: "Oceń, jak dobrze rozumiesz dodawanie i odejmowanie pisemne.", teacherInstruction: "Poproś uczniów o szczerą ocenę zrozumienia.", estimatedMinutes: 7, live: { enabled: true, kind: "quick-check", minutes: 7 }, board: { layout: "narrative", headline: "Ocena umiejętności", body: "Zastanów się: czy umiesz poprawnie wykonać działanie pisemne?" }, student: { activityMode: "view", instruction: "Wybierz ocenę zrozumienia po wykonaniu wszystkich zadań." } }),
  ],
};

export const m517MnozenieWarstwamiV1: LessonPackage = buildLessonPackage({
  id: "m5-1-7-mnozenie-warstwami-v1",
  topicId: "M5-1.7",
  title: "Działania pisemne — mnożenie",
  coreLesson: "Mnożenie warstwami",
  paperEvidence: "Karta iloczynów częściowych",
  studentGoal: "Nauczę się rozkładać mnożenie na iloczyny częściowe i zapisywać wynik pisemnie.",
  successCriteria: ["Buduje iloczyny częściowe.", "Sumuje je poprawnie."],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.7-written-multiply"],
  overview: "Model warstw i iloczynów częściowych.",
  openingScript: "„Mnożymy częściami — warstwa po warstwie.”",
  closingScript: "„Sprawdź ostatnią warstwę — czy przesunąłeś zapis?”",
  commonMisconceptions: ["Błędne przesunięcie iloczynu częściowego.", "Pominięcie zer w czynniku."],
  status: "published",
  stageBlueprints: [
    { suffix: "trace-0", kind: "warmup", title: "Ślad 0", minutes: 3, headline: "Ślad 0 — przygotuj zapis w zeszycie" },
    { suffix: "s1", kind: "warmup", title: "Mnożenie pisemne", minutes: 8, headline: "Cztery mnożenia pisemne piętrami", modelId: "written-multiplication-lesson", modelSeed: 1 },
    {
      suffix: "s2",
      kind: "explore",
      title: "Prostokąt",
      minutes: 10,
      headline: "23 × 14 na siatce",
      modelId: "written-multiplication-lesson",
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
    { suffix: "understanding", kind: "exit-ticket", title: "Ocena umiejętności", minutes: 4, headline: "Ocena umiejętności", body: "Oceń, czy potrafisz wykonać mnożenie pisemne piętrami." },
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
