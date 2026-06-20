import { getExpectedAnswer } from "@/lib/wordProblems/formulas";
import { renderWordProblemStory } from "@/lib/wordProblems/render";
import { getWordProblemById } from "@/lib/wordProblems/index";
import type {
  NumberLineAnswer,
  TestWidgetAnswer,
  TestWidgetDefinition,
  TestWidgetParams,
  WordProblemQuestionParams,
} from "@/types/testWidget";

export const WORD_PROBLEM_SLUG = "zadania-z-trescia";

export function isWordProblemParams(params: TestWidgetParams): params is WordProblemQuestionParams {
  return "variant" in params && params.variant === "word-problem";
}

function isNumberLineAnswer(answer: TestWidgetAnswer): answer is NumberLineAnswer {
  return "result" in answer && typeof (answer as NumberLineAnswer).result === "number";
}

export function createWordProblemParams(problemId: string): WordProblemQuestionParams {
  const template = getWordProblemById(problemId);
  if (!template) {
    return {
      variant: "word-problem",
      problemId,
      sectionId: "unknown",
      grade: 4,
      values: { a: 5, b: 3 },
      formula: "add",
      skill: "addition",
      story: "Oblicz wynik zadania.",
    };
  }

  const story = renderWordProblemStory(template, template.defaults);

  return {
    variant: "word-problem",
    problemId: template.id,
    sectionId: template.sectionId,
    grade: template.grade,
    values: { ...template.defaults },
    formula: template.formula,
    skill: template.skill,
    story,
  };
}

export function buildWordProblemPrompt(params: TestWidgetParams): string {
  if (!isWordProblemParams(params)) {
    return "Przeczytaj treść zadania i oblicz wynik.";
  }
  return params.story;
}

export function gradeWordProblem(
  params: TestWidgetParams,
  answer: TestWidgetAnswer,
  maxScore: number,
) {
  if (!isWordProblemParams(params)) {
    return {
      isCorrect: false,
      score: 0,
      maxScore,
      skill: "addition" as const,
      expectedAnswer: { result: 0 },
    };
  }

  const expected = getExpectedAnswer(params.formula, params.values, params.expectedOverride);
  const isCorrect = isNumberLineAnswer(answer) && answer.result === expected;

  return {
    isCorrect,
    score: isCorrect ? maxScore : 0,
    maxScore,
    skill: params.skill,
    expectedAnswer: { result: expected },
  };
}

export const wordProblemWidgetDefinition: TestWidgetDefinition = {
  slug: WORD_PROBLEM_SLUG,
  title: "Zadanie z treścią",
  widgetKind: "word-problem",
  skill: "addition",
  defaultPoints: 2,
  defaultParams: createWordProblemParams("numbers-grade-1-1"),
  lessonUse: "Zadania tekstowe z programu nauczania — nauczyciel wybiera z banku i może zmienić liczby oraz wynik.",
  buildRandomParams() {
    return createWordProblemParams("numbers-grade-1-1");
  },
  buildPrompt: buildWordProblemPrompt,
  grade: gradeWordProblem,
};

export function refreshWordProblemStory(params: WordProblemQuestionParams): WordProblemQuestionParams {
  const template = getWordProblemById(params.problemId);
  if (!template) {
    return params;
  }
  return {
    ...params,
    story: renderWordProblemStory(template, params.values),
  };
}

export function getWordProblemVariableKeys(params: WordProblemQuestionParams): string[] {
  const template = getWordProblemById(params.problemId);
  return template?.variableKeys ?? Object.keys(params.values);
}
