import type { WordProblemTemplate } from "@/lib/wordProblems/types";

/** Podstawia wyłącznie liczby z values — bez losowych imion w treści. */
export function renderWordProblemStory(
  template: WordProblemTemplate,
  values: Record<string, number>,
): string {
  return template.template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}

export function renderStoryFromParams(
  bankItem: WordProblemTemplate | undefined,
  story: string,
  values: Record<string, number>,
): string {
  if (bankItem) {
    return renderWordProblemStory(bankItem, values);
  }
  return story;
}
