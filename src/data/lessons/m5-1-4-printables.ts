import { M514_QUESTION_INSTANCES } from "@/data/lessons/m5-1-4-instances";
import type { PrintWorksheetItem } from "@/types/lessonPackage";

export interface M514PrintableResource {
  id: string;
  title: string;
  subtitle: string;
  instructions: string;
  items: PrintWorksheetItem[];
  version: string;
}

const WARMUP_ITEMS: PrintWorksheetItem[] = [
  {
    id: "wu-1",
    expression: "2 + 3 × 4",
    prompt: "Oblicz. Zapisz pierwsze działanie, które wykonujesz.",
  },
  {
    id: "wu-2",
    expression: "(2 + 3) × 4",
    prompt: "Oblicz. Zapisz pierwsze działanie, które wykonujesz.",
  },
];

function itemsFromInstances(ids: string[], prompt: string): PrintWorksheetItem[] {
  return ids.map((id) => {
    const inst = M514_QUESTION_INSTANCES.find((q) => q.id === id)!;
    return {
      id: inst.id,
      questionId: inst.id,
      expression: inst.expression,
      prompt,
    };
  });
}

/** Karta ćwiczeń — ten sam cel co tablet (WP-022) */
export const M514_PRACTICE_WORKSHEET: M514PrintableResource = {
  id: "m5-1-4-karta-krokow",
  title: "Kolejność działań — zapis kroków",
  subtitle: "M5-1.4 · LekcjaLab · wersja 1",
  instructions:
    "Dla każdego wyrażenia wskaż pierwsze działanie (zapisz znak i liczby), oblicz wynik po tym kroku. Nie musisz podawać wyniku końcowego całego wyrażenia.",
  version: "2026.1",
  items: itemsFromInstances(
    ["m514-q04", "m514-q06", "m514-q07", "m514-q08", "m514-q09", "m514-q03"],
    "Pierwsze działanie i wynik po tym kroku:",
  ),
};

export const M514_EXIT_TICKET: M514PrintableResource = {
  id: "m5-1-4-bilet",
  title: "Bilet wyjścia — kolejność działań",
  subtitle: "Imię i nazwisko · data",
  instructions: "Wskaż pierwsze działanie. Uzasadnij jednym słowem (np. nawias, mnożenie, dzielenie).",
  version: "2026.1",
  items: itemsFromInstances(["m514-q10"], "Pierwsze działanie · uzasadnienie:"),
};

/** Karta bez urządzeń — 12 zadań na poziomach (WP-022) */
export const M514_OFFLINE_CARD: M514PrintableResource = {
  id: "m5-1-4-karta-bez-urzadzen",
  title: "Karta pracy — bez urządzeń",
  subtitle: "M5-1.4 · 12 wyrażeń · Start / Rdzeń / Mistrzowskie",
  instructions:
    "W każdym wyrażeniu zapisz pierwsze działanie i krótko uzasadnij wybór. Przy zadaniach oznaczonych „Mistrzowskie” uwzględnij nawiasy.",
  version: "2026.1",
  items: [
    ...itemsFromInstances(
      ["m514-q01", "m514-q02"],
      "Start — pierwsze działanie:",
    ),
    ...itemsFromInstances(
      ["m514-q06", "m514-q07", "m514-q08", "m514-q09", "m514-q05", "m514-q04"],
      "Rdzeń — pierwsze działanie:",
    ),
    ...itemsFromInstances(
      ["m514-q11", "m514-q12", "m514-q13", "m514-q14"],
      "Mistrzowskie — pierwsze działanie:",
    ),
  ],
};

export const M514_PRINTABLES: Record<string, M514PrintableResource> = {
  [M514_PRACTICE_WORKSHEET.id]: M514_PRACTICE_WORKSHEET,
  [M514_EXIT_TICKET.id]: M514_EXIT_TICKET,
  [M514_OFFLINE_CARD.id]: M514_OFFLINE_CARD,
};

export function getPrintableResource(id: string): M514PrintableResource | undefined {
  return M514_PRINTABLES[id];
}
