import { computePartExpected } from "@/lib/wordProblems/formulas";
import type {
  WordProblemAnswerPartConfig,
  WordProblemPartsAnswer,
  WordProblemQuestionParams,
} from "@/types/testWidget";
import type { TestWidgetAnswer } from "@/types/testWidget";

export function isWordProblemPartsAnswer(answer: TestWidgetAnswer): answer is WordProblemPartsAnswer {
  return "parts" in answer && typeof (answer as WordProblemPartsAnswer).parts === "object";
}

export function resolveExpectedResults(
  params: WordProblemQuestionParams,
): Record<string, number> {
  if (params.expectedResults && Object.keys(params.expectedResults).length > 0) {
    return params.expectedResults;
  }

  const out: Record<string, number> = {};
  for (const part of params.parts) {
    out[part.id] = computePartExpected(part, params.values, part.expectedOverride);
  }

  if (params.expectedOverride !== undefined && params.parts.length === 1 && params.parts[0]) {
    out[params.parts[0].id] = params.expectedOverride;
  }

  return out;
}

export function normalizeWordProblemAnswer(
  answer: TestWidgetAnswer,
  params: WordProblemQuestionParams,
): Record<string, number> {
  if (isWordProblemPartsAnswer(answer)) {
    return answer.parts;
  }
  if ("result" in answer && typeof answer.result === "number") {
    const mainId = params.parts[0]?.id ?? "main";
    return { [mainId]: answer.result };
  }
  return {};
}

export function gradeWordProblemParts(
  params: WordProblemQuestionParams,
  answer: TestWidgetAnswer,
  maxScore: number,
) {
  const expected = resolveExpectedResults(params);
  const submitted = normalizeWordProblemAnswer(answer, params);
  const totalParts = params.parts.length;
  let correctCount = 0;

  for (const part of params.parts) {
    if (submitted[part.id] === expected[part.id]) {
      correctCount += 1;
    }
  }

  const ratio = totalParts > 0 ? correctCount / totalParts : 0;
  const isCorrect = correctCount === totalParts;
  const score = params.partialCredit
    ? Math.round(maxScore * ratio * 100) / 100
    : isCorrect
      ? maxScore
      : 0;

  return {
    isCorrect,
    score,
    maxScore,
    skill: params.skill,
    expectedAnswer: { parts: expected } satisfies WordProblemPartsAnswer,
    correctCount,
    totalParts,
  };
}

export function syncExpectedResults(params: WordProblemQuestionParams): WordProblemQuestionParams {
  const expectedResults: Record<string, number> = {};
  for (const part of params.parts) {
    expectedResults[part.id] = computePartExpected(part, params.values, part.expectedOverride);
  }
  return { ...params, expectedResults };
}

export function defaultPartsFromLegacy(params: {
  formula: WordProblemQuestionParams["formula"];
}): WordProblemAnswerPartConfig[] {
  return [{ id: "main", label: "Oblicz wynik zadania.", formula: params.formula }];
}
