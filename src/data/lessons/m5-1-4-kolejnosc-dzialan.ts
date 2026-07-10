import {
  getInstanceSeedPool,
  getInstancesForStage,
  M514_QUESTION_INSTANCES,
} from "@/data/lessons/m5-1-4-instances";
import {
  M514_EXIT_TICKET,
  M514_OFFLINE_CARD,
  M514_PRACTICE_WORKSHEET,
} from "@/data/lessons/m5-1-4-printables";
import type { LessonPackage, LessonStage, QuestionReference } from "@/types/lessonPackage";

type StageInput = Omit<
  LessonStage,
  "questions" | "discussionPrompts" | "accessibilityNotes" | "revealSteps"
> &
  Partial<Pick<LessonStage, "questions" | "discussionPrompts" | "accessibilityNotes" | "revealSteps">>;

function questionsForStage(stageId: string): QuestionReference[] {
  return getInstancesForStage(stageId).map((q) => ({
    id: q.id,
    generatorId: "order-director-v1",
    seed: q.seed,
    difficulty: q.difficulty,
  }));
}

function stage(partial: StageInput): LessonStage {
  return {
    questions: questionsForStage(partial.id),
    discussionPrompts: [],
    accessibilityNotes: [
      "Duży kontrast i czytelna czcionka na tablicy.",
      "Przyciski działań mają min. 48×48 px — alternatywa: wybór z listy (dla czytników ekranu).",
    ],
    revealSteps: [{ id: "start", label: "Start" }],
    ...partial,
  };
}

export const m514KolejnoscDzialanV1: LessonPackage = {
  id: "m5-1-4-rezyser-dzialan-v1",
  version: 1,
  curriculumId: "pl-math-5-2026-classic",
  sectionId: "M5-S1",
  topicId: "M5-1.4",
  lessonNumber: 1,
  title: "Kolejność działań — Reżyser działań",
  estimatedMinutes: 45,
  studentGoal:
    "Uczeń rozpoznaje pierwsze działanie w wyrażeniu liczbowym i uzasadnia wybór regułami: nawias, mnożenie i dzielenie, dodawanie i odejmowanie.",
  successCriteria: [
    "W co najmniej 80% zadań wskazuje poprawne pierwsze działanie.",
    "Uzasadnia wybór jednym słowem kluczowym (nawias / mnożenie / dzielenie).",
    "Zapisuje krok po kroku bez liczenia „od lewej do prawej” w całym wyrażeniu.",
  ],
  prerequisiteSkillIds: ["M5-1.3"],
  skillIds: ["M5-1.4-order-ops"],
  printableResourceIds: [
    M514_PRACTICE_WORKSHEET.id,
    M514_EXIT_TICKET.id,
    M514_OFFLINE_CARD.id,
  ],
  status: "published",
  teacherGuide: {
    overview:
      "Lekcja wprowadza regułę kolejności działań przez model „Reżyser działań”. Uczeń nie podaje od razu wyniku końcowego — wskazuje pierwszy krok i uzasadnia go. Cyfrowo i na papierze badamy tę samą umiejętność: rozpoznanie priorytetu działań.",
    timingNotes:
      "45 min: 5 + 4 + 8 + 6 + 8 + 10 + 8 + 4. Przy słabszej klasie skróć wyzwanie do 5 min i dodaj 3 min do ćwiczeń.",
    materials: [
      "Tablica / projektor z widokiem lekcji",
      "Tablety z widokiem ucznia (opcjonalnie)",
      "Wydruk: karta kroków (6 zadań) + bilet wyjścia",
      "Wydruk: karta bez urządzeń (12 zadań) — gdy brak tabletów",
    ],
    openingScript:
      "„Dziś nie uczymy się na pamięć jednej liczby — uczymy się decydować, od czego zacząć. Wyrażenie to scena, a wy jesteście reżyserami.”",
    closingScript:
      "„Zapiszcie regułę własnymi słowami. Domowe: jedno wyrażenie dziennie — tylko pierwsze działanie i uzasadnienie.”",
    exitTicketRubric:
      "1 pkt — poprawne pierwsze działanie. 1 pkt — sensowne uzasadnienie (nawias / mnożenie / dzielenie). Bez punktu za sam wynik końcowy bez wskazania kroku.",
    paperWithoutDevices:
      "Karta 12 zadań pokrywa ten sam zakres co tablet: 2 Start, 6 Rdzeń, 4 Mistrzowskie. Uczniowie pracują w zeszytach równolegle z tablicą — nie wymaga logowania.",
    languageReview:
      "Manifest: „Reżyser działań”, „pierwsze działanie”, „priorytet” — spójne w tablicy, tablecie i druku. Unikamy etykiet „łatwe/trudne”; używamy Start / Rdzeń / Mistrzowskie.",
    commonMisconceptions: [
      "Liczenie ściśle od lewej do prawej (np. 12 − 6 ÷ 2 → najpierw 12 − 6).",
      "Pomijanie nawiasu — wykonanie mnożenia przed obliczeniem zawartości nawiasu.",
      "Mylenie „pierwszego działania” z wynikiem końcowym całego wyrażenia.",
    ],
    differentiation: {
      support:
        "Wyrażenia trzyelementowe bez nawiasów. Nauczyciel wskazuje palcem dwa działania do wyboru. Karta Start — 2 zadania.",
      core:
        "Wyrażenia czteroelementowe, jeden moment decyzji priorytetu. Para: A mówi, B wskazuje na tablicy.",
      challenge:
        "Nawiasy i dwa priorytety. Wymagane jedno zdanie uzasadnienia. Zadania Mistrzowskie na karcie bez urządzeń.",
    },
    stageNotes: {
      "m5-1-4-s1":
        "Mini-diagnoza bez oceny. Zbierz dwie odpowiedzi na tablicy: 14 vs 20 przy 2+3×4. Nie podawaj reguły — daj klasie zauważyć różnicę.",
      "m5-1-4-s2":
        "Zatrzymaj się na przewidywaniu. Typowy błąd: najpierw 12−6. Po zebraniu odpowiedzi odsłoń podpowiedź o priorytecie.",
      "m5-1-4-s3":
        "3 zadania Start na tablecie (seedy q01–q03). Tablica w trybie podglądu — uczniowie pracują aktywnie.",
      "m5-1-4-s4":
        "Wspólnie zapisz regułę: nawias → ×÷ → +−. Uczniowie przepisują na kartę „Reguła — do zeszytu”.",
      "m5-1-4-s5":
        "Odsłaniaj krok po kroku. Po każdym kroku pytaj: „Co się zmieniło w zapisie?” Nie przyspieszaj do wyniku 22.",
      "m5-1-4-s6":
        "Minimum 4 z 6 zadań rdzeniowych. Krąż i pytaj: „Dlaczego to działanie pierwsze?” Druk: karta kroków dla uczniów bez tabletu.",
      "m5-1-4-s7":
        "Praca w parach. Mistrzowskie: nawias decyduje o pierwszym kroku. 4 zadania w puli — wystarczą 2 na parę.",
      "m5-1-4-s8":
        "Bilet: 2 min pracy, 2 min zebrania. Cel: 80% poprawnych pierwszych kroków. Oddanie = koniec poprawiania.",
    },
  },
  stages: [
    stage({
      id: "m5-1-4-s1",
      kind: "warmup",
      title: "Co wiemy?",
      estimatedMinutes: 5,
      studentInstruction:
        "Oblicz oba wyrażenia w zeszytach. Zapisz, które działanie wykonałeś jako pierwsze w każdym przypadku.",
      teacherInstruction:
        "Zapisz na tablicy dwie odpowiedzi klasowe. Zapytaj: skąd różnica wyników? Nie wprowadzaj jeszcze nazwy reguły.",
      board: {
        layout: "narrative",
        headline: "Dwa wyrażenia — dwa wyniki?",
        body: "Porównaj wyniki i opisz, od czego zacząłeś w każdym przypadku.",
        bullets: [
          "A: 2 + 3 × 4 = ?",
          "B: (2 + 3) × 4 = ?",
          "Pytanie: Czy zawsze liczymy od lewej do prawej?",
        ],
      },
      student: {
        activityMode: "respond",
        instruction: "Zapisz wyniki A i B oraz pierwsze działanie w każdym wyrażeniu.",
      },
      print: {
        worksheetTitle: M514_PRACTICE_WORKSHEET.title,
        instructions: "Oblicz oba wyrażenia. Opisz słowami pierwsze działanie w każdym.",
        items: [
          { id: "wu-1", expression: "2 + 3 × 4", prompt: "Wynik i pierwsze działanie:" },
          { id: "wu-2", expression: "(2 + 3) × 4", prompt: "Wynik i pierwsze działanie:" },
        ],
      },
    }),
    stage({
      id: "m5-1-4-s2",
      kind: "predict",
      title: "Przewiduj pierwszy krok",
      estimatedMinutes: 4,
      studentInstruction: "Zanim policzysz całość — wskaż działanie, które wykonasz jako pierwsze.",
      teacherInstruction: "Zbierz 3–4 odpowiedzi. Dopiero potem odsłoń podpowiedź o priorytecie działań.",
      board: {
        layout: "model",
        headline: "12 − 6 ÷ 2 + 1",
        body: "Które działanie wykonamy najpierw? Uzasadnij jednym zdaniem.",
        modelId: "order-director",
        modelSeed: 1042,
        modelDifficulty: "core",
      },
      student: {
        activityMode: "practice",
        instruction: "Wskaż pierwsze działanie. Jeśli się mylisz — popraw i uzasadnij ponownie.",
        modelId: "order-director",
        modelSeed: 1042,
        modelDifficulty: "core",
      },
      revealSteps: [
        { id: "r0", label: "Pytanie", boardHeadline: "12 − 6 ÷ 2 + 1" },
        {
          id: "r1",
          label: "Podpowiedź",
          boardBody: "Czy któreś działanie ma wyższy priorytet niż dodawanie i odejmowanie?",
        },
        {
          id: "r2",
          label: "Odpowiedź",
          boardBody: "Najpierw 6 ÷ 2, bo dzielenie wykonujemy przed odejmowaniem.",
        },
      ],
    }),
    stage({
      id: "m5-1-4-s3",
      kind: "explore",
      title: "Reżyser działań",
      estimatedMinutes: 8,
      studentInstruction: "Wykonaj 3 zadania. Po każdym poprawnym wyborze przejdź do następnego.",
      teacherInstruction:
        "Uczniowie na tabletach — ta sama pula zadań Start. Ty komentujesz na tablicy bez podawania odpowiedzi.",
      board: {
        layout: "model",
        headline: "Scena wyrażenia",
        body: "Reżyser wskazuje następny krok — nie cały wynik naraz.",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s3"),
        modelDifficulty: "support",
      },
      student: {
        activityMode: "practice",
        instruction: "3 zadania Start — wskaż pierwsze działanie w każdym.",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s3"),
        modelDifficulty: "support",
      },
      discussionPrompts: [
        "Co by się stało, gdybyśmy liczyli tylko od lewej strony?",
        "Kiedy nawias zmienia pierwsze działanie?",
      ],
    }),
    stage({
      id: "m5-1-4-s4",
      kind: "discuss",
      title: "Reguła kolejności",
      estimatedMinutes: 6,
      studentInstruction: "Uzupełnij w zeszytach: Najpierw …, potem …, na końcu …",
      teacherInstruction:
        "Zapis wspólny na tablicy. Porównaj z podręcznikiem — ta sama treść, słowa klasy.",
      board: {
        layout: "narrative",
        headline: "Nasza reguła",
        body: "1) Nawias  2) Mnożenie i dzielenie (od lewej)  3) Dodawanie i odejmowanie (od lewej)",
        bullets: [
          "Przykład z życia: przepis — najpierw przygotowanie składników, potem pieczenie.",
          "Zapisz regułę w zeszytach — pełnymi zdaniami.",
        ],
      },
      print: {
        worksheetTitle: "Reguła — do zeszytu",
        instructions: "Przepisz regułę i wymyśl własne wyrażenie z co najmniej dwoma rodzajami działań.",
        items: [
          {
            id: "rule-1",
            expression: "Reguła kolejności",
            prompt: "1) …  2) …  3) …  · Moje wyrażenie:",
          },
        ],
      },
    }),
    stage({
      id: "m5-1-4-s5",
      kind: "worked-example",
      title: "Przykład krok po kroku",
      estimatedMinutes: 8,
      studentInstruction: "Obserwuj odsłanianie. Po każdym kroku powiedz, jak wygląda nowy zapis.",
      teacherInstruction: "Odsłaniaj ręcznie. Po każdym kroku pytaj o wynik pośredni — nie tylko o końcowy.",
      board: {
        layout: "model",
        headline: "24 − 6 ÷ 2 + 1",
        body: "Pełne rozwiązanie etapami na tablicy.",
        modelId: "order-director",
        modelSeed: 1042,
        modelDifficulty: "core",
      },
      revealSteps: [
        { id: "e0", label: "Wyrażenie", boardHeadline: "24 − 6 ÷ 2 + 1" },
        { id: "e1", label: "Krok 1", boardBody: "6 ÷ 2 = 3  →  zapis: 24 − 3 + 1" },
        { id: "e2", label: "Krok 2", boardBody: "24 − 3 = 21  →  zapis: 21 + 1" },
        { id: "e3", label: "Wynik", boardBody: "21 + 1 = 22" },
      ],
    }),
    stage({
      id: "m5-1-4-s6",
      kind: "practice",
      title: "Ćwicz sam",
      estimatedMinutes: 10,
      studentInstruction: "Wykonaj co najmniej 4 z 6 zadań. Po każdym poprawnym wyborze — następne.",
      teacherInstruction:
        "Wspieraj wskazywaniem nawiasów. Nie podawaj wyniku końcowego. Uczniowie bez tabletu — karta kroków.",
      board: {
        layout: "model",
        headline: "Poziom rdzeniowy — 6 zadań",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s6"),
        modelDifficulty: "core",
      },
      student: {
        activityMode: "practice",
        instruction: "Minimum 4 poprawne zadania. Uzasadnij jednym słowem.",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s6"),
        modelDifficulty: "core",
      },
      print: {
        worksheetTitle: M514_PRACTICE_WORKSHEET.title,
        instructions: M514_PRACTICE_WORKSHEET.instructions,
        items: M514_PRACTICE_WORKSHEET.items,
        printableResourceId: M514_PRACTICE_WORKSHEET.id,
      },
    }),
    stage({
      id: "m5-1-4-s7",
      kind: "challenge",
      title: "Wyzwanie z nawiasem",
      estimatedMinutes: 8,
      studentInstruction: "Zadania Mistrzowskie — uzasadnij wybór jednym zdaniem.",
      teacherInstruction: "Para: uczeń A mówi, uczeń B wskazuje. 2 zadania na parę wystarczą.",
      board: {
        layout: "model",
        headline: "Mistrzowskie — nawiasy",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s7"),
        modelDifficulty: "challenge",
      },
      student: {
        activityMode: "practice",
        instruction: "2 zadania challenge z puli 4 — z nawiasami.",
        modelId: "order-director",
        modelSeedPool: getInstanceSeedPool("m5-1-4-s7"),
        modelDifficulty: "challenge",
      },
      discussionPrompts: ["Kiedy nawias „przykrywa” priorytet mnożenia?"],
    }),
    stage({
      id: "m5-1-4-s8",
      kind: "exit-ticket",
      title: "Bilet wyjścia",
      estimatedMinutes: 4,
      studentInstruction:
        "Jedno wyrażenie — wskaż pierwsze działanie i napisz jedno słowo uzasadnienia. Oddajesz bez poprawiania.",
      teacherInstruction:
        "2 min praca, 2 min zbieranie. Liczysz % poprawnych pierwszych kroków — cel: 80%.",
      board: {
        layout: "model",
        headline: "Bilet wyjścia",
        body: "Jedno zadanie rdzeniowe — oceniamy pierwszy krok i uzasadnienie.",
        modelId: "order-director",
        modelSeed: 1372,
        modelDifficulty: "core",
      },
      student: {
        activityMode: "respond",
        instruction: "Odpowiedz i oddaj. Bez poprawiania po oddaniu.",
        modelId: "order-director",
        modelSeed: 1372,
        modelDifficulty: "core",
      },
      print: {
        worksheetTitle: M514_EXIT_TICKET.title,
        instructions: M514_EXIT_TICKET.instructions,
        items: M514_EXIT_TICKET.items,
        printableResourceId: M514_EXIT_TICKET.id,
      },
    }),
  ],
};

/** Eksport manifestu instancji do klucza nauczyciela */
export const M514_MANIFEST_INSTANCE_COUNT = M514_QUESTION_INSTANCES.length;
