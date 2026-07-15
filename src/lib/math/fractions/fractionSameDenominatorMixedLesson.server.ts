import "server-only";

import {
  createPublicFractionSameDenominatorMixedTask,
  exchangeOneWhole,
  mixedResultWithSameDenominator,
  requiresWholeExchange,
  simplifiedMixedResult,
  type FractionSameDenominatorMixedActivity,
} from "@/lib/math/fractions/fractionSameDenominatorMixedLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.5 L2 nie wchodzi do grafu modułów klienta. */
export function createFractionSameDenominatorMixedQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorMixedActivity;
}) {
  const publicQuestion = createPublicFractionSameDenominatorMixedTask(input);
  return {
    publicQuestion,
    answerSpec: {
      problems: publicQuestion.problems.map((problem) => ({
        problemId: problem.id,
        expectedBeforeSimplifying: mixedResultWithSameDenominator(problem),
        expectedFinal: simplifiedMixedResult(problem),
        requiresWholeExchange: requiresWholeExchange(problem),
        exchangeTrace: requiresWholeExchange(problem) ? {
          before: problem.left,
          after: exchangeOneWhole(problem.left),
        } : null,
        requireSimplifiedFinal: problem.requireSimplifiedFinal,
      })),
      requireJustification: publicQuestion.requireJustification,
      denominatorUnchangedBeforeSimplifying: true,
      maxScore: 2,
    },
  };
}
