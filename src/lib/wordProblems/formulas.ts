import type { WordProblemAnswerPartConfig, WordProblemFormula } from "@/types/testWidget";

export function computeWordProblemAnswer(
  formula: WordProblemFormula,
  values: Record<string, number>,
): number {
  const a = values.a ?? 0;
  const b = values.b ?? 0;
  const c = values.c ?? 0;

  switch (formula) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return b !== 0 ? a / b : 0;
    case "sum3":
      return a + b + c;
    case "missing_addend":
      return c - a;
    case "groups":
      return a * b;
    case "share":
      return b !== 0 ? a / b : 0;
    case "perimeter_rect":
      return 2 * (a + b);
    case "area_rect":
      return a * b;
    case "percent_of":
      return Math.round((a * b) / 100);
    case "average3":
      return Math.round((a + b + c) / 3);
    case "chain_add_sub":
      return a + b - c;
    default:
      return 0;
  }
}

export function computePartExpected(
  part: Pick<WordProblemAnswerPartConfig, "formula" | "literalKey" | "id">,
  values: Record<string, number>,
  override?: number,
): number {
  if (override !== undefined && !Number.isNaN(override)) {
    return override;
  }
  if (part.formula === "literal") {
    const key = part.literalKey ?? part.id;
    return values[key] ?? 0;
  }
  return computeWordProblemAnswer(part.formula, values);
}

export function getExpectedAnswer(
  formula: WordProblemFormula,
  values: Record<string, number>,
  override?: number,
): number {
  if (override !== undefined && !Number.isNaN(override)) {
    return override;
  }
  return computeWordProblemAnswer(formula, values);
}
