import "server-only";

import {
  createPublicFractionDifferentDenominatorAdvancedTask,
  leastCommonDenominatorAdvanced,
  simplifiedDifferentDenominatorAdvancedResult,
  type FractionDifferentDenominatorAdvancedActivity,
} from "@/lib/math/fractions/fractionDifferentDenominatorAdvancedLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

export function createFractionDifferentDenominatorAdvancedQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorAdvancedActivity;
}) {
  const publicQuestion = createPublicFractionDifferentDenominatorAdvancedTask(input);
  const commonDenominator = leastCommonDenominatorAdvanced(publicQuestion.left.denominator, publicQuestion.right.denominator);
  return {
    publicQuestion,
    answerSpec: {
      expectedCommonDenominator: commonDenominator,
      expectedLeftMultiplier: commonDenominator / publicQuestion.left.denominator,
      expectedRightMultiplier: commonDenominator / publicQuestion.right.denominator,
      expectedFinal: simplifiedDifferentDenominatorAdvancedResult(publicQuestion),
      expectedRepairStep: publicQuestion.requiresRepairStep ? "denominator-operation" : null,
      expectedWholeAssessment: publicQuestion.requiresWholeAssessment ? "above-one" : null,
      requireSimplifiedFinal: true,
      maxScore: 4,
    },
  };
}
