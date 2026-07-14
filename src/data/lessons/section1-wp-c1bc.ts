import { buildLessonPackage } from "@/lib/lessons/buildLessonPackage";
import { createLessonStage } from "@/lib/lessons/createStage";
import type { LessonPackage } from "@/types/lessonPackage";

const lessonQuestions = (
  topic: "m5-1-5" | "m5-1-6" | "m5-1-7" | "m5-1-8" | "m5-1-9" | "m5-1-r",
  stage: number,
  count: number,
  generatorId: string,
) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${topic}-${stage}-${index + 1}`,
    generatorId,
    seed: stage * 100 + index + 1,
    difficulty: "core" as const,
  }));

export const m515NajpierwPrzewidzV1: LessonPackage = {
  id: "m5-1-5-najpierw-przewidz-v1",
  version: 2,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S1",
  topicId: "M5-1.5",
  lessonNumber: 5,
  title: "Szacowanie wyników działań",
  studentGoal:
    "Szacowanie wyników działań (zaokrąglanie liczb i ocenianie rzędu wielkości wyniku).",
  successCriteria: [
    "Zaokrąglam liczby przed oszacowaniem.",
    "Oceniając zadanie, wskazuję właściwy rząd wielkości wyniku.",
  ],
  learningGoals: [
    {
      id: "m5-1-5-estimate",
      studentGoal:
        "Nauczę się szacować wyniki działań (zaokrąglać liczby i oceniać rząd wielkości wyniku).",
      successCriteria: [
        "Zaokrąglam liczby do wygodnych wartości.",
        "Wybieram sensowny rząd wielkości wyniku.",
      ],
      curriculumReferences: ["Klasy IV–VI, II.4"],
    },
  ],
  prerequisiteSkillIds: ["M5-1.4-order-ops"],
  skillIds: ["M5-1.5-estimation"],
  estimatedMinutes: 45,
  printableResourceIds: [],
  status: "published",
  teacherGuide: {
    overview:
      "Podręcznik, 19 różnych zadań na trzech slajdach i końcowa ocena umiejętności.",
    timingNotes: "45 minut: 8 + 10 + 10 + 10 + 7.",
    materials: ["Tablica", "Tablety lub zeszyty"],
    stageNotes: {
      "m5-1-5-book": "Ustaw stronę i zadanie dla całej klasy.",
      "m5-1-5-actions":
        "Osiem różnych działań: dodawanie, odejmowanie, mnożenie i dzielenie.",
      "m5-1-5-shop": "Sześć różnych pytań TAK/NIE o zakupach i produktach.",
      "m5-1-5-story":
        "Pięć różnych zadań z wycieczki klasowej; przypomnij o zaokrąglaniu i porównywaniu.",
      "m5-1-5-understanding":
        "Uczniowie kończą lekcję oceną własnego rozumienia.",
    },
    commonMisconceptions: ["Dokładne liczenie zamiast szacowania."],
    differentiation: {
      support: "Pozwól zapisać zaokrąglenia obok liczb.",
      core: "Wykonaj wszystkie 19 zadań.",
      challenge: "Uzasadnij, dlaczego szacunek ma sens.",
    },
    openingScript:
      "Dziś nie liczymy dokładnie — najpierw sprawdzamy, jakiego wyniku się spodziewamy.",
    closingScript:
      "Dobry szacunek pozwala szybko sprawdzić, czy wynik ma sens.",
    exitTicketRubric: "19 odpowiedzi i ocena umiejętności.",
    paperWithoutDevices:
      "Uczniowie zaznaczają wynik na karcie ABC lub TAK/NIE.",
    languageReview: "szacunek, zaokrąglenie, pełne setki",
  },
  stages: [
    createLessonStage({
      id: "m5-1-5-book",
      kind: "warmup",
      title: "Podręcznik — strona i zadanie",
      studentInstruction:
        "Otwórz podręcznik na stronie i zadaniu wskazanym na tablicy.",
      teacherInstruction: "Ustaw stronę i numer zadania przyciskami +/−.",
      estimatedMinutes: 8,
      live: { enabled: true, kind: "presentation", minutes: 8 },
      board: {
        layout: "model",
        headline: "Praca z podręcznikiem",
        modelId: "exercise-board",
        modelSeed: 1,
      },
      student: {
        activityMode: "view",
        instruction:
          "Wykonuj zadanie z podręcznika wskazane przez nauczyciela.",
      },
    }),
    createLessonStage(
      {
        id: "m5-1-5-actions",
        kind: "practice",
        title: "Działania do pełnych setek",
        studentInstruction: "Oszacuj wynik — nie licz dokładnie.",
        teacherInstruction: "Osiem różnych działań.",
        estimatedMinutes: 10,
        live: { enabled: true, kind: "exercise", minutes: 10 },
        board: {
          layout: "model",
          headline: "Najpierw oszacuj",
          modelId: "estimation-lesson",
          modelSeed: 1,
        },
        student: {
          activityMode: "respond",
          instruction: "Wybierz najlepszy szacunek do setek.",
          modelId: "estimation-lesson",
          modelSeed: 1,
        },
      },
      lessonQuestions("m5-1-5", 1, 8, "estimation-v1"),
    ),
    createLessonStage(
      {
        id: "m5-1-5-shop",
        kind: "practice",
        title: "Sklep spożywczy",
        studentInstruction: "Wybierz TAK lub NIE.",
        teacherInstruction: "Sześć różnych pytań o ceny produktów.",
        estimatedMinutes: 10,
        live: { enabled: true, kind: "exercise", minutes: 10 },
        board: {
          layout: "model",
          headline: "Sklep na rogu",
          modelId: "estimation-lesson",
          modelSeed: 2,
        },
        student: {
          activityMode: "respond",
          instruction: "Oceń, czy podana kwota wystarczy.",
          modelId: "estimation-lesson",
          modelSeed: 2,
        },
      },
      lessonQuestions("m5-1-5", 2, 6, "estimation-v1"),
    ),
    createLessonStage(
      {
        id: "m5-1-5-story",
        kind: "practice",
        title: "Wycieczka klasowa",
        studentInstruction: "Zaokrąglij dane i wybierz odpowiedź.",
        teacherInstruction:
          "Pięć różnych zadań tekstowych osadzonych w wycieczce klasowej.",
        estimatedMinutes: 10,
        live: { enabled: true, kind: "exercise", minutes: 10 },
        board: {
          layout: "model",
          headline: "Wycieczka klasowa",
          modelId: "estimation-lesson",
          modelSeed: 3,
        },
        student: {
          activityMode: "respond",
          instruction: "Zaokrąglij dane i wybierz odpowiedź.",
          modelId: "estimation-lesson",
          modelSeed: 3,
        },
      },
      lessonQuestions("m5-1-5", 3, 5, "estimation-v1"),
    ),
    createLessonStage({
      id: "m5-1-5-understanding",
      kind: "exit-ticket",
      title: "Ocena umiejętności",
      studentInstruction: "Oceń, jak dobrze rozumiesz dzisiejszy temat.",
      teacherInstruction: "Poproś uczniów o szczerą ocenę zrozumienia.",
      estimatedMinutes: 7,
      live: { enabled: true, kind: "quick-check", minutes: 7 },
      board: {
        layout: "narrative",
        headline: "Ocena umiejętności",
        body: "Zastanów się: czy umiesz oszacować wynik do pełnych setek?",
      },
      student: {
        activityMode: "view",
        instruction: "Wybierz ocenę zrozumienia po wykonaniu wszystkich zadań.",
      },
    }),
  ],
};

export const m516CyfrowyZeszytV1: LessonPackage = {
  id: "m5-1-6-cyfrowy-zeszyt-v1",
  version: 2,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S1",
  topicId: "M5-1.6",
  lessonNumber: 6,
  title: "Działania pisemne – dodawanie i odejmowanie",
  studentGoal:
    "Uczeń ustawia liczby w kolumnach i wykonuje dodawanie lub odejmowanie pisemne z przeniesieniem.",
  successCriteria: [
    "Poprawnie ustawia liczby pod sobą.",
    "Wykonuje wymianę/pożyczkę krok po kroku.",
  ],
  learningGoals: [
    {
      id: "m5-1-6-written",
      studentGoal:
        "Nauczę się dodawać i odejmować pisemnie oraz wpisać wynik cyframi.",
      successCriteria: [
        "Zapisuję liczby w odpowiednich kolumnach.",
        "Poprawnie stosuję przeniesienie lub pożyczkę.",
      ],
      curriculumReferences: ["Klasy IV–VI, II.2"],
    },
  ],
  prerequisiteSkillIds: ["M5-1.2-mental-add-sub"],
  skillIds: ["M5-1.6-written-add-sub"],
  estimatedMinutes: 45,
  printableResourceIds: [],
  status: "published",
  teacherGuide: {
    overview:
      "Podręcznik, 20 różnych działań pisemnych i końcowa ocena umiejętności.",
    timingNotes: "45 minut: 8 + 15 + 15 + 7.",
    materials: ["Tablica", "Zeszyt w kratkę", "Tablety"],
    stageNotes: {
      "m5-1-6-book": "Ustaw stronę i zadanie dla całej klasy.",
      "m5-1-6-add": "Dziesięć różnych dodawań z przeniesieniem.",
      "m5-1-6-sub": "Dziesięć różnych odejmowań z pożyczką.",
      "m5-1-6-understanding":
        "Uczniowie kończą lekcję oceną własnego rozumienia.",
    },
    commonMisconceptions: [
      "Niewyrównanie cyfr do prawej.",
      "Pominięcie zmiany cyfry przy pożyczce.",
    ],
    differentiation: {
      support: "Daj uczniowi kratkę papierową.",
      core: "Wykonaj wszystkie 20 działań.",
      challenge: "Wyjaśnij, gdzie nastąpiło przeniesienie.",
    },
    openingScript:
      "Najpierw zapisujemy w kolumnach, potem liczymy od jedności.",
    closingScript: "Sprawdź wynik działaniem odwrotnym.",
    exitTicketRubric:
      "20 odpowiedzi wpisanych klawiaturą i ocena umiejętności.",
    paperWithoutDevices:
      "Uczniowie liczą w zeszycie i wpisują wynik na tablicy.",
    languageReview: "kolumna, przeniesienie, pożyczka, suma, różnica",
  },
  stages: [
    createLessonStage({
      id: "m5-1-6-book",
      kind: "warmup",
      title: "Podręcznik — strona i zadanie",
      studentInstruction:
        "Otwórz podręcznik na stronie i zadaniu wskazanym na tablicy.",
      teacherInstruction: "Ustaw stronę i numer zadania przyciskami +/−.",
      estimatedMinutes: 8,
      live: { enabled: true, kind: "presentation", minutes: 8 },
      board: {
        layout: "model",
        headline: "Praca z podręcznikiem",
        modelId: "exercise-board",
        modelSeed: 1,
      },
      student: {
        activityMode: "view",
        instruction:
          "Wykonuj zadanie z podręcznika wskazane przez nauczyciela.",
      },
    }),
    createLessonStage(
      {
        id: "m5-1-6-add",
        kind: "practice",
        title: "Dodawanie pisemne",
        studentInstruction: "Policz w kolumnach i wpisz wynik klawiaturą.",
        teacherInstruction: "Dziesięć różnych działań z przeniesieniem.",
        estimatedMinutes: 15,
        live: { enabled: true, kind: "exercise", minutes: 15 },
        board: {
          layout: "model",
          headline: "Dodawanie pisemne",
          modelId: "written-add-sub-lesson",
          modelSeed: 1,
        },
        student: {
          activityMode: "respond",
          instruction: "Wpisz wynik klawiaturą na dole.",
          modelId: "written-add-sub-lesson",
          modelSeed: 1,
        },
      },
      lessonQuestions("m5-1-6", 1, 10, "written-add-sub-v1"),
    ),
    createLessonStage(
      {
        id: "m5-1-6-sub",
        kind: "practice",
        title: "Odejmowanie pisemne",
        studentInstruction: "Policz w kolumnach i wpisz wynik klawiaturą.",
        teacherInstruction: "Dziesięć różnych działań z pożyczką.",
        estimatedMinutes: 15,
        live: { enabled: true, kind: "exercise", minutes: 15 },
        board: {
          layout: "model",
          headline: "Odejmowanie pisemne",
          modelId: "written-add-sub-lesson",
          modelSeed: 2,
        },
        student: {
          activityMode: "respond",
          instruction: "Wpisz wynik klawiaturą na dole.",
          modelId: "written-add-sub-lesson",
          modelSeed: 2,
        },
      },
      lessonQuestions("m5-1-6", 2, 10, "written-add-sub-v1"),
    ),
    createLessonStage(
      {
        id: "m5-1-6-story-add",
        kind: "practice",
        title: "Zadanie tekstowe — dodawanie pisemne",
        studentInstruction:
          "Odczytaj dane, wpisz obie liczby do pustych kratek i wykonaj dodawanie pisemne.",
        teacherInstruction:
          "Zwróć uwagę, że uczeń sam przepisuje składniki z treści zadania do odpowiednich kolumn.",
        estimatedMinutes: 8,
        live: { enabled: true, kind: "exercise", minutes: 8 },
        board: {
          layout: "model",
          headline: "Książki do szkolnej biblioteki",
          modelId: "written-add-sub-lesson",
          modelSeed: 3,
        },
        student: {
          activityMode: "respond",
          instruction: "Uzupełnij dane, obliczenie pisemne i odpowiedź.",
          modelId: "written-add-sub-lesson",
          modelSeed: 3,
        },
      },
      lessonQuestions("m5-1-6", 3, 1, "written-add-sub-v1"),
    ),
    createLessonStage(
      {
        id: "m5-1-6-story-sub",
        kind: "practice",
        title: "Zadanie tekstowe — odejmowanie pisemne",
        studentInstruction:
          "Odczytaj dane, wpisz odjemną i odjemnik do pustych kratek, a następnie wykonaj odejmowanie pisemne.",
        teacherInstruction:
          "Uczeń samodzielnie przepisuje obie liczby z treści i zapisuje je w odpowiednich kolumnach.",
        estimatedMinutes: 8,
        live: { enabled: true, kind: "exercise", minutes: 8 },
        board: {
          layout: "model",
          headline: "Materiały na warsztaty",
          modelId: "written-add-sub-lesson",
          modelSeed: 4,
        },
        student: {
          activityMode: "respond",
          instruction: "Uzupełnij dane, obliczenie pisemne i odpowiedź.",
          modelId: "written-add-sub-lesson",
          modelSeed: 4,
        },
      },
      lessonQuestions("m5-1-6", 4, 1, "written-add-sub-v1"),
    ),
    createLessonStage({
      id: "m5-1-6-understanding",
      kind: "exit-ticket",
      title: "Ocena umiejętności",
      studentInstruction:
        "Oceń, jak dobrze rozumiesz dodawanie i odejmowanie pisemne.",
      teacherInstruction: "Poproś uczniów o szczerą ocenę zrozumienia.",
      estimatedMinutes: 7,
      live: { enabled: true, kind: "quick-check", minutes: 7 },
      board: {
        layout: "narrative",
        headline: "Ocena umiejętności",
        body: "Zastanów się: czy umiesz poprawnie wykonać działanie pisemne?",
      },
      student: {
        activityMode: "view",
        instruction: "Wybierz ocenę zrozumienia po wykonaniu wszystkich zadań.",
      },
    }),
  ],
};

export const m517MnozenieWarstwamiV1: LessonPackage = buildLessonPackage({
  id: "m5-1-7-mnozenie-warstwami-v1",
  topicId: "M5-1.7",
  title: "Działania pisemne – mnożenie",
  coreLesson: "Mnożenie warstwami",
  paperEvidence: "Karta iloczynów częściowych",
  studentGoal:
    "Nauczę się mnożyć pisemnie liczby naturalne przez liczby jedno-, dwu- i trzycyfrowe.",
  successCriteria: [
    "Potrafię poprawnie zapisać liczby w mnożeniu pisemnym.",
    "Potrafię obliczyć iloczyny częściowe.",
    "Potrafię dodać iloczyny częściowe i podać wynik mnożenia.",
  ],
  learningGoals: [
    {
      id: "m5-1-7-written-multiply",
      studentGoal:
        "Nauczę się mnożyć pisemnie liczby naturalne przez liczby jedno-, dwu- i trzycyfrowe.",
      successCriteria: [
        "Potrafię poprawnie zapisać liczby w mnożeniu pisemnym.",
        "Potrafię obliczyć iloczyny częściowe.",
        "Potrafię dodać iloczyny częściowe i podać wynik mnożenia.",
      ],
      curriculumReferences: [
        "Dział I — działania pisemne: mnożenie liczb naturalnych przez liczby jedno-, dwu- i trzycyfrowe.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.7-written-multiply"],
  overview: "Model warstw i iloczynów częściowych.",
  openingScript: "„Mnożymy częściami — warstwa po warstwie.”",
  closingScript: "„Sprawdź ostatnią warstwę — czy przesunąłeś zapis?”",
  commonMisconceptions: [
    "Błędne przesunięcie iloczynu częściowego.",
    "Pominięcie zer w czynniku.",
  ],
  status: "published",
  stageBlueprints: [
    {
      suffix: "trace-0",
      kind: "warmup",
      title: "Cele lekcji (slajd 0)",
      minutes: 3,
      headline: "Slajd 0 — cele i kryteria sukcesu",
      modelId: "exercise-board",
      modelSeed: 1,
    },
    {
      suffix: "s1",
      kind: "warmup",
      title: "Mnożenie pisemne",
      minutes: 8,
      headline: "Cztery mnożenia pisemne piętrami",
      modelId: "written-multiplication-lesson",
      modelSeed: 1,
      questions: lessonQuestions("m5-1-7", 1, 4, "written-multiplication-v1"),
    },
    {
      suffix: "story",
      kind: "practice",
      title: "Zadanie tekstowe — mnożenie pisemne",
      minutes: 10,
      headline: "Bilety na festiwal nauki",
      body: "Odczytaj dane, wpisz obie liczby do pustych kratek, wykonaj mnożenie pisemne i uzupełnij odpowiedź.",
      modelId: "written-multiplication-lesson",
      modelSeed: 2,
      questions: lessonQuestions("m5-1-7", 2, 1, "written-multiplication-v1"),
      studentInstruction:
        "Wypisz dane, wpisz obie liczby z treści do kratek, wykonaj mnożenie pisemne i zapisz odpowiedź.",
    },
    {
      suffix: "understanding",
      kind: "exit-ticket",
      title: "Ocena umiejętności",
      minutes: 4,
      headline: "Ocena umiejętności",
      body: "Oceń, czy potrafisz wykonać mnożenie pisemne piętrami.",
      studentInstruction:
        "Oceń, jak dobrze rozumiesz mnożenie pisemne piętrami.",
      teacherInstruction: "Poproś uczniów o szczerą samoocenę.",
      live: { enabled: true, kind: "quick-check", minutes: 4 },
    },
  ],
});

export const m518RozdzielniaV1: LessonPackage = buildLessonPackage({
  id: "m5-1-8-rozdzielnia-v1",
  topicId: "M5-1.8",
  title: "Działania pisemne – dzielenie",
  coreLesson: "Rozdzielnia",
  paperEvidence: "Dzielenie z/bez reszty",
  studentGoal:
    "Nauczę się dzielić pisemnie liczby naturalne przez liczby jedno- i dwucyfrowe, także z resztą.",
  successCriteria: [
    "Potrafię poprawnie zapisać i wykonać dzielenie pisemne.",
    "Potrafię podać iloraz w dzieleniu bez reszty.",
    "Potrafię podać iloraz i resztę w dzieleniu z resztą.",
    "Potrafię sprawdzić, czy reszta jest mniejsza od dzielnika.",
    "Potrafię sprawdzić wynik za pomocą zależności: dzielnik × iloraz + reszta = dzielna.",
  ],
  learningGoals: [
    {
      id: "m5-1-8-one-digit",
      studentGoal:
        "Nauczę się dzielić liczby naturalne przez liczby jednocyfrowe.",
      successCriteria: [
        "Potrafię poprawnie zapisać i wykonać dzielenie pisemne przez liczbę jednocyfrową.",
      ],
      curriculumReferences: [
        "Dział I — dzielenie liczb naturalnych sposobem pisemnym.",
      ],
    },
    {
      id: "m5-1-8-two-digit",
      studentGoal:
        "Nauczę się dzielić liczby naturalne przez liczby dwucyfrowe.",
      successCriteria: [
        "Potrafię poprawnie zapisać i wykonać dzielenie pisemne przez liczbę dwucyfrową.",
      ],
      curriculumReferences: [
        "Dział I — dzielenie liczb naturalnych sposobem pisemnym.",
      ],
    },
    {
      id: "m5-1-8-remainder",
      studentGoal: "Nauczę się wykonywać dzielenie z resztą.",
      successCriteria: [
        "Potrafię podać iloraz i resztę mniejszą od dzielnika.",
      ],
      curriculumReferences: [
        "Dział I — dzielenie liczb naturalnych, w tym dzielenie z resztą.",
      ],
    },
    {
      id: "m5-1-8-check",
      studentGoal: "Nauczę się sprawdzać wynik dzielenia.",
      successCriteria: [
        "Potrafię sprawdzić wynik za pomocą zależności: dzielnik × iloraz + reszta = dzielna.",
      ],
      curriculumReferences: [
        "Dział I — sprawdzanie wyników działań na liczbach naturalnych.",
      ],
    },
  ],
  prerequisiteSkillIds: ["M5-1.3-mental-mul-div"],
  skillIds: ["M5-1.8-written-divide"],
  overview: "Pisemne dzielenie z kontrolą reszty.",
  openingScript:
    "Dziś wykonujemy dzielenie pisemne przez liczby jedno- i dwucyfrowe, także z resztą.",
  closingScript:
    "Sprawdź iloraz i upewnij się, że reszta jest mniejsza od dzielnika.",
  commonMisconceptions: [
    "Reszta większa lub równa dzielnikowi.",
    "Zero w ilorazie pominięte.",
  ],
  stageBlueprints: [
    {
      suffix: "s1",
      kind: "practice",
      title: "Dzielenie pisemne bez reszty",
      minutes: 18,
      headline: "Sześć przykładów zapisanych tak jak w zeszycie",
      body: "Dzielna, znak „:” i dzielnik są zapisane w jednym wierszu. Iloraz wpisuj nad odpowiednimi cyframi dzielnej, a kolejne iloczyny i liczby po sprowadzeniu — pod spodem. Wszystkie pola odpowiedzi są na początku puste. Program ocenia końcowy iloraz i ostatnią resztę.",
      modelId: "written-division-lesson",
      modelSeed: 1,
      questions: lessonQuestions("m5-1-8", 1, 6, "written-division-v1"),
      studentInstruction:
        "Rozwiąż sześć dzieleń bez reszty. Uzupełniaj kratki klawiaturą ekranową i pamiętaj, że ostatnia reszta w każdym przykładzie wynosi 0.",
    },
    {
      suffix: "s2",
      kind: "practice",
      title: "Dzielenie pisemne z resztą",
      minutes: 20,
      headline: "Sześć różnych historii — iloraz i reszta",
      body: "Każde z sześciu zadań ma osobną sytuację praktyczną. Najpierw ustal, co oznacza liczba pełnych grup, a co pozostaje jako reszta. Następnie wykonaj dzielenie pisemne w kratkach i sprawdź, czy reszta jest mniejsza od dzielnika.",
      modelId: "written-division-lesson",
      modelSeed: 2,
      questions: lessonQuestions("m5-1-8", 2, 6, "written-division-v1"),
      studentInstruction:
        "Przeczytaj treść każdego zadania, wykonaj dzielenie pisemne, wpisz iloraz nad dzielną i ostatnią resztę na dole. Rozwiąż wszystkie sześć historii.",
    },
    {
      suffix: "story",
      kind: "practice",
      title: "Zadanie tekstowe — dzielenie pisemne",
      minutes: 10,
      headline: "Identyfikatory dla uczestników",
      body: "Odczytaj dane, wpisz dzielną i dzielnik do pustych kratek, wykonaj dzielenie pisemne i uzupełnij odpowiedź.",
      modelId: "written-division-lesson",
      modelSeed: 3,
      questions: lessonQuestions("m5-1-8", 3, 1, "written-division-v1"),
      studentInstruction:
        "Wypisz dane, wpisz dzielną oraz dzielnik z treści do kratek, wykonaj dzielenie pisemne i zapisz odpowiedź.",
    },
  ],
});

export const m519DetektywDanychV1: LessonPackage = buildLessonPackage({
  id: "m5-1-9-detektyw-danych-v1",
  topicId: "M5-1.9",
  title: "Zadania tekstowe",
  coreLesson: "Detektyw danych",
  paperEvidence: "Zadania 1–3-etapowe",
  studentGoal:
    "Nauczę się analizować treść zadania, wybierać potrzebne dane i zapisywać pełne rozwiązanie.",
  successCriteria: [
    "Potrafię wskazać, czego szukam w zadaniu.",
    "Potrafię wybrać dane potrzebne do rozwiązania i odrzucić dane zbędne.",
    "Potrafię zaplanować i zapisać obliczenia.",
    "Potrafię odpowiedzieć pełnym zdaniem i sprawdzić sens wyniku.",
  ],
  learningGoals: [
    {
      id: "m5-1-9-question",
      studentGoal: "Nauczę się ustalać, czego szukam w zadaniu tekstowym.",
      successCriteria: ["Potrafię zapisać pytanie zadania własnymi słowami."],
      curriculumReferences: [
        "Dział X — rozwiązywanie zadań osadzonych w kontekście praktycznym.",
      ],
    },
    {
      id: "m5-1-9-data",
      studentGoal: "Nauczę się wybierać dane potrzebne do rozwiązania zadania.",
      successCriteria: [
        "Potrafię odróżnić dane potrzebne od informacji zbędnych.",
      ],
      curriculumReferences: ["Dział X — analiza danych i zadań tekstowych."],
    },
    {
      id: "m5-1-9-solution",
      studentGoal:
        "Nauczę się planować obliczenia i zapisywać odpowiedź pełnym zdaniem.",
      successCriteria: [
        "Potrafię wykonać potrzebne działania, podać odpowiedź i sprawdzić jej sens.",
      ],
      curriculumReferences: ["Dział X — zadania tekstowe wieloetapowe."],
    },
  ],
  prerequisiteSkillIds: ["M5-1.5-estimation", "M5-1.6-written-add-sub"],
  skillIds: ["M5-1.9-word-problems"],
  estimatedMinutes: 50,
  overview:
    "Cztery zadania tekstowe z pustymi planszami działań pisemnych: dodawanie, odejmowanie, mnożenie i dzielenie.",
  openingScript:
    "Najpierw ustal, czego szukasz. Potem wybierz dane, zaplanuj działania, oblicz i odpowiedz pełnym zdaniem.",
  closingScript:
    "Sprawdź, czy obliczenia wykorzystują potrzebne dane, a odpowiedź odpowiada na pytanie z treści.",
  commonMisconceptions: [
    "Obliczenie bez pytania.",
    "Użycie zbędnej liczby z treści.",
  ],
  stageBlueprints: [
    {
      suffix: "guided",
      kind: "explore",
      title: "Zadanie 1 — dodawanie pisemne",
      minutes: 11,
      headline: "Czego szukamy, jakie mamy dane i jak obliczymy wynik?",
      body: "Przejdź po kolei przez pytanie, potrzebne dane, obliczenia i odpowiedź. Wpisz do pustych kratek również obie liczby z treści zadania.",
      modelId: "written-story-problems-lesson",
      modelSeed: 1,
      questions: lessonQuestions("m5-1-9", 1, 1, "written-story-problems-v1"),
      studentInstruction:
        "Odczytaj dane, wpisz obie liczby do pustych kratek, wykonaj dodawanie pisemne i uzupełnij odpowiedź.",
    },
    {
      suffix: "choose-data",
      kind: "practice",
      title: "Zadanie 2 — odejmowanie pisemne",
      minutes: 11,
      headline: "Jedna informacja nie jest potrzebna",
      body: "Najpierw zaznacz dane potrzebne do rozwiązania. Następnie wpisz obie liczby do pustych kratek, wykonaj odejmowanie pisemne i odpowiedz na pytanie.",
      modelId: "written-story-problems-lesson",
      modelSeed: 2,
      questions: lessonQuestions("m5-1-9", 2, 1, "written-story-problems-v1"),
      studentInstruction:
        "Zaznacz potrzebne dane, wpisz obie liczby, wykonaj odejmowanie pisemne i odpowiedz pełnym zdaniem.",
    },
    {
      suffix: "multiplication",
      kind: "practice",
      title: "Zadanie 3 — mnożenie pisemne",
      minutes: 11,
      headline: "Wpisz liczby i wykonaj mnożenie pisemne",
      body: "Odczytaj liczbę planet i liczbę kryształów na jednej planecie. Wpisz obie liczby do pustych kratek i oblicz iloczyn pisemnie.",
      modelId: "written-story-problems-lesson",
      modelSeed: 3,
      questions: lessonQuestions("m5-1-9", 3, 1, "written-story-problems-v1"),
      studentInstruction:
        "Wpisz obie liczby do pustej planszy mnożenia pisemnego, uzupełnij wynik i odpowiedź.",
    },
    {
      suffix: "division",
      kind: "practice",
      title: "Zadanie 4 — dzielenie pisemne",
      minutes: 11,
      headline: "Wpisz dzielną i dzielnik, a następnie podziel pisemnie",
      body: "Odczytaj liczbę graczy i liczbę drużyn. Wpisz dzielną oraz dzielnik do pustych kratek, uzupełnij iloraz i ostatnią resztę.",
      modelId: "written-story-problems-lesson",
      modelSeed: 4,
      questions: lessonQuestions("m5-1-9", 4, 1, "written-story-problems-v1"),
      studentInstruction:
        "Wpisz dzielną i dzielnik do pustej planszy dzielenia pisemnego, uzupełnij wynik i odpowiedź.",
    },
  ],
});

export const m51rElektrowniaLiczbV1: LessonPackage = buildLessonPackage({
  id: "m5-1-r-elektrownia-v1",
  topicId: "M5-1.R",
  title: "Powtórzenie — liczby i działania",
  coreLesson: "Siedem misji w Elektrowni liczb",
  paperEvidence:
    "Karta powtórzeniowa „Liczby i działania” oraz mapa „umiem / wrócę do”",
  studentGoal:
    "Powtórzę działania pamięciowe, działania pisemne, kolejność działań oraz rozwiązywanie zadań tekstowych.",
  successCriteria: [
    "Potrafię dobrać właściwy sposób obliczenia i poprawnie rozwiązać zadania z Działu I.",
  ],
  learningGoals: [
    {
      id: "m5-1-r-review",
      studentGoal:
        "Powtórzę działania pamięciowe, działania pisemne, kolejność działań oraz rozwiązywanie zadań tekstowych.",
      successCriteria: [
        "Potrafię dobrać właściwy sposób obliczenia i poprawnie rozwiązać zadania z Działu I.",
      ],
      curriculumReferences: [
        "Dział I — system dziesiątkowy: zapisywanie i odczytywanie liczb naturalnych wielocyfrowych, porównywanie liczb, interpretacja na osi liczbowej.",
        "Dział I — działania pamięciowe: dodawanie, odejmowanie, mnożenie i dzielenie liczb naturalnych w pamięci w prostych przypadkach.",
        "Dział I — działania pisemne: dodawanie i odejmowanie wielocyfrowe, mnożenie przez liczby jedno-, dwu- i trzycyfrowe oraz dzielenie przez liczby jedno- i dwucyfrowe, w tym z resztą.",
        "Dział I — potęgowanie: obliczanie drugiej i trzeciej potęgi liczb naturalnych.",
        "Dział I — kolejność wykonywania działań: nawiasy, potęgi, mnożenie i dzielenie, dodawanie i odejmowanie.",
        "Dział I — szacowanie wyników działań przez zaokrąglanie i ocenianie rzędu wielkości wyniku.",
      ],
    },
  ],
  prerequisiteSkillIds: [],
  skillIds: ["M5-1.R-review"],
  estimatedMinutes: 70,
  overview:
    "Siedem interaktywnych slajdów powtórzeniowych. Każdy zawiera cztery mini-stacje: zapis liczb, oś, porządkowanie, rachunek pamięciowy, kolejność działań, dzielenie z resztą oraz działania pisemne.",
  openingScript:
    "„Elektrownia ma siedem sektorów. W każdym uruchomicie cztery krótkie stacje i sprawdzicie inną umiejętność.”",
  closingScript:
    "„Sprawdźcie mapę misji: które sektory świecą pewnie, a do którego warto jeszcze wrócić?”",
  commonMisconceptions: [
    "Dzielenie liczby na grupy cyfr od lewej zamiast od prawej strony.",
    "Założenie, że sąsiednie kreski osi różnią się o 1.",
    "Porównywanie liczb od cyfry jedności zamiast od najwyższego rzędu.",
    "Wykonywanie dodawania przed mnożeniem lub pomijanie nawiasu i potęgi.",
    "Podawanie reszty większej lub równej dzielnikowi.",
  ],
  stageBlueprints: [
    {
      suffix: "decoder",
      kind: "practice",
      title: "Misja 1 — Dekoder wielkich liczb",
      minutes: 8,
      headline: "Podziel zapis, przeczytaj liczbę i znajdź rząd cyfry",
      body: "Cztery mini-stacje sprawdzają grupowanie cyfr po trzy, zamianę zapisu cyfrowego na słowny, zapis słów cyframi oraz odczyt cyfry setek miliardów.",
      modelId: "section-one-review-lesson",
      modelSeed: 1,
      questions: lessonQuestions("m5-1-r", 1, 4, "section-one-review-v1"),
      studentInstruction:
        "Wykonaj cztery mini-stacje dekodera. Czytaj każdą grupę liczby osobno i zwracaj uwagę na miliony oraz miliardy.",
    },
    {
      suffix: "number-line",
      kind: "practice",
      title: "Misja 2 — Kosmiczna kolejka",
      minutes: 8,
      headline: "Odczytaj cztery brakujące liczby na osiach",
      body: "Na każdej osi najpierw ustal wartość jednego odstępu, a potem policz równe kroki do przystanku oznaczonego rakietą.",
      modelId: "section-one-review-lesson",
      modelSeed: 2,
      questions: lessonQuestions("m5-1-r", 2, 4, "section-one-review-v1"),
      studentInstruction:
        "Rozwiąż cztery osie. Nie zakładaj, że jeden krok oznacza 1 — oblicz go z podpisanych kresek.",
    },
    {
      suffix: "sorting",
      kind: "practice",
      title: "Misja 3 — Sortownia liczb",
      minutes: 9,
      headline: "Ustaw cztery zestawy od najmniejszej liczby do największej",
      body: "Klikaj kontenery w kolejności rosnącej. Porównuj najpierw liczbę cyfr, a przy równych długościach — cyfry od lewej strony.",
      modelId: "section-one-review-lesson",
      modelSeed: 3,
      questions: lessonQuestions("m5-1-r", 3, 4, "section-one-review-v1"),
      studentInstruction:
        "Ułóż cztery taśmy liczb. Jeśli się pomylisz, cofnij ostatni kontener i popraw kolejność przed sprawdzeniem.",
    },
    {
      suffix: "mental-reactor",
      kind: "practice",
      title: "Misja 4 — Reaktor pamięciowy",
      minutes: 8,
      headline: "Dodaj, odejmij, pomnóż i podziel w pamięci",
      body: "Cztery zadania obejmują po jednym działaniu każdego rodzaju, także działania na liczbach zakończonych zerami.",
      modelId: "section-one-review-lesson",
      modelSeed: 4,
      questions: lessonQuestions("m5-1-r", 4, 4, "section-one-review-v1"),
      studentInstruction:
        "Wykonaj cztery działania w pamięci i wpisz wynik stałą klawiaturą ekranową. Po błędzie skorzystaj ze wskazówki.",
    },
    {
      suffix: "order-circuit",
      kind: "practice",
      title: "Misja 5 — Sterownia działań",
      minutes: 9,
      headline: "Uruchom cztery obwody we właściwej kolejności",
      body: "W obwodach pojawiają się nawiasy, potęgi, mnożenie, dzielenie, dodawanie i odejmowanie. Wybierz końcowy wynik.",
      modelId: "section-one-review-lesson",
      modelSeed: 5,
      questions: lessonQuestions("m5-1-r", 5, 4, "section-one-review-v1"),
      studentInstruction:
        "Rozwiąż cztery obwody. Zawsze zacznij od nawiasów i potęg, potem wykonuj mnożenie oraz dzielenie od lewej strony.",
    },
    {
      suffix: "remainder-cargo",
      kind: "challenge",
      title: "Misja 6 — Pakowalnia reszt",
      minutes: 8,
      headline: "Wykonaj cztery dzielenia z resztą",
      body: "Pakuj 22 sztuki po 6, 71 po 8, 33 po 5 oraz 77 po 9. Wpisz liczbę pełnych pojemników i pozostałą resztę.",
      modelId: "section-one-review-lesson",
      modelSeed: 6,
      questions: lessonQuestions("m5-1-r", 6, 4, "section-one-review-v1"),
      studentInstruction:
        "W każdej mini-stacji wpisz iloraz i resztę. Sprawdź wzorem: dzielnik × iloraz + reszta = dzielna oraz reszta < dzielnik.",
    },
    {
      suffix: "written-hall",
      kind: "practice",
      title: "Misja 7 — Hala działań pisemnych",
      minutes: 12,
      headline: "Dodawanie, odejmowanie, mnożenie i dzielenie pisemne",
      body: "Cztery mini-stacje zawierają po jednym działaniu pisemnym każdego rodzaju. Uzupełniaj kratki dokładnie tak jak w odpowiednich tematach.",
      modelId: "section-one-review-lesson",
      modelSeed: 7,
      questions: lessonQuestions("m5-1-r", 7, 4, "section-one-review-v1"),
      studentInstruction:
        "Wykonaj kolejno dodawanie, odejmowanie, mnożenie i dzielenie pisemne. Uzupełnij kratki oraz końcowy wynik każdego działania.",
    },
  ],
});

export const m51sSprawdzianV1: LessonPackage = buildLessonPackage({
  id: "m5-1-s-sprawdzian-v1",
  topicId: "M5-1.S",
  title: "Sprawdzian i omówienie — Znajdź błąd",
  coreLesson: "Znajdź błąd",
  paperEvidence: "A/B, klucz, rubryka",
  studentGoal:
    "Uczeń rozwiązuje sprawdzian działu 1 i uczestniczy w omówieniu typowych błędów.",
  successCriteria: [
    "Wykonuje zadania z różnych stref działu.",
    "W omówieniu wskazuje błąd w rozwiązaniu.",
  ],
  prerequisiteSkillIds: [],
  skillIds: ["M5-1.S-exam"],
  estimatedMinutes: 50,
  overview: "Sprawdzian + omówienie «Znajdź błąd».",
  openingScript: "„To sprawdzenie umiejętności — nie ranking.”",
  closingScript: "„Omówienie: gdzie powstał błąd i jak go naprawić.”",
  commonMisconceptions: ["Poprawianie pracy po oddaniu bez zgody nauczyciela."],
  stageBlueprints: [
    {
      suffix: "s1",
      kind: "warmup",
      title: "Reguły",
      minutes: 5,
      headline: "Czas, kalkulator, oddanie",
    },
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
          {
            id: "b3",
            expression: "Zadanie tekstowe (bilety)",
            prompt: "Plan + odpowiedź.",
          },
        ],
      },
    },
    {
      suffix: "s4",
      kind: "discuss",
      title: "Omówienie",
      minutes: 15,
      headline: "Znajdź błąd na tablicy",
      discussionPrompts: ["Gdzie powstał błąd?", "Jaką regułę zastosować?"],
    },
    {
      suffix: "s5",
      kind: "warmup",
      title: "Rubryka",
      minutes: 5,
      headline: "Wpisywanie wyników",
    },
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
