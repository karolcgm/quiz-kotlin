import type { WordProblemTemplate } from "@/lib/wordProblems/types";

const NAMES = ["Ania", "Tomek", "Ola", "Kuba", "Maja", "Filip", "Zosia", "Bartek", "Lena", "Mikołaj"];
const ITEMS = [
  "jabłek",
  "kredek",
  "naklejek",
  "cukierków",
  "piłek",
  "klocków",
  "figurek",
  "biletów",
  "zdjęć",
  "kart",
];
const PLACES = ["szkole", "sklepie", "parku", "bibliotece", "na placu zabaw"];

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length]!;
}

export function renderWordProblemStory(
  template: WordProblemTemplate,
  values: Record<string, number>,
  seed = 0,
): string {
  const tokens: Record<string, string | number> = {
    ...values,
    name: pick(NAMES, seed + template.id.length),
    name2: pick(NAMES, seed + 3),
    item: pick(ITEMS, seed + 7),
    item2: pick(ITEMS, seed + 11),
    place: pick(PLACES, seed + 5),
  };

  return template.template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = tokens[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function renderStoryFromParams(
  bankItem: WordProblemTemplate | undefined,
  story: string,
  values: Record<string, number>,
): string {
  if (bankItem) {
    return renderWordProblemStory(bankItem, values, bankItem.id.charCodeAt(0));
  }
  return story;
}
