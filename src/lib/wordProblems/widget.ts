import { renderWordProblemStory } from "@/lib/wordProblems/render";
import { getWordProblemById } from "@/lib/wordProblems/index";
import { gradeWordProblemParts, syncExpectedResults, defaultPartsFromLegacy } from "@/lib/wordProblems/grading";
import type {
  TestWidgetAnswer,
  TestWidgetDefinition,
  TestWidgetParams,
  WordProblemQuestionParams,
} from "@/types/testWidget";

export const WORD_PROBLEM_SLUG = "zadania-z-trescia";

export function isWordProblemParams(params: TestWidgetParams): params is WordProblemQuestionParams {
  return "variant" in params && params.variant === "word-problem";
}

export function normalizeWordProblemParams(params: WordProblemQuestionParams): WordProblemQuestionParams {
  const parts = params.parts?.length ? params.parts : defaultPartsFromLegacy(params);
  const withParts = { ...params, parts, partialCredit: params.partialCredit ?? true };
  const story =
    withParts.story ||
    (() => {
      const template = getWordProblemById(withParts.problemId);
      return template ? renderWordProblemStory(template, withParts.values) : "Oblicz wynik zadania.";
    })();
  return syncExpectedResults({ ...withParts, story, difficulty: withParts.difficulty ?? "easy" });
}

export function createWordProblemParams(problemId: string): WordProblemQuestionParams {
  const template = getWordProblemById(problemId);
  if (!template) {
    return normalizeWordProblemParams({
      variant: "word-problem",
      problemId,
      sectionId: "unknown",
      grade: 4,
      difficulty: "easy",
      values: { a: 5, b: 3 },
      formula: "add",
      skill: "addition",
      story: "Oblicz wynik zadania.",
      parts: [{ id: "main", label: "Oblicz wynik zadania.", formula: "add" }],
      partialCredit: true,
    });
  }

  return normalizeWordProblemParams({
    variant: "word-problem",
    problemId: template.id,
    sectionId: template.sectionId,
    grade: template.grade,
    difficulty: template.difficulty,
    values: { ...template.defaults },
    formula: template.formula,
    skill: template.skill,
    story: renderWordProblemStory(template, template.defaults),
    parts: template.parts,
    partialCredit: template.partialCredit,
  });
}

export function buildWordProblemPrompt(params: TestWidgetParams): string {
  if (!isWordProblemParams(params)) {
    return "Przeczytaj treść zadania i oblicz wynik.";
  }
  return params.story;
}

export function gradeWordProblem(params: TestWidgetParams, answer: TestWidgetAnswer, maxScore: number) {
  if (!isWordProblemParams(params)) {
    return {
      isCorrect: false,
      score: 0,
      maxScore,
      skill: "addition" as const,
      expectedAnswer: { parts: {} },
    };
  }

  const normalized = normalizeWordProblemParams(params);
  const result = gradeWordProblemParts(normalized, answer, maxScore);
  return {
    isCorrect: result.isCorrect,
    score: result.score,
    maxScore: result.maxScore,
    skill: result.skill,
    expectedAnswer: result.expectedAnswer,
  };
}

export const wordProblemWidgetDefinition: TestWidgetDefinition = {
  slug: WORD_PROBLEM_SLUG,
  title: "Zadanie z treścią",
  widgetKind: "word-problem",
  skill: "addition",
  defaultPoints: 2,
  defaultParams: createWordProblemParams("numbers-grade-1-01"),
  lessonUse:
    "Zadania tekstowe z poziomem trudności — łatwe, średnie i trudne. Trudniejsze mają kilka odpowiedzi; częściowa poprawność daje część punktów.",
  buildRandomParams() {
    return createWordProblemParams("numbers-grade-1-01");
  },
  buildPrompt: buildWordProblemPrompt,
  grade: gradeWordProblem,
};

export function refreshWordProblemStory(params: WordProblemQuestionParams): WordProblemQuestionParams {
  const template = getWordProblemById(params.problemId);
  if (!template) {
    return params;
  }
  return syncExpectedResults({
    ...params,
    story: renderWordProblemStory(template, params.values),
  });
}

export function getWordProblemVariableKeys(params: WordProblemQuestionParams): string[] {
  const template = getWordProblemById(params.problemId);
  const keys = new Set(template?.variableKeys ?? Object.keys(params.values));
  for (const part of params.parts) {
    if (part.literalKey) keys.add(part.literalKey);
  }
  return Array.from(keys);
}

export { gradeWordProblemParts, syncExpectedResults, resolveExpectedResults } from "@/lib/wordProblems/grading";
