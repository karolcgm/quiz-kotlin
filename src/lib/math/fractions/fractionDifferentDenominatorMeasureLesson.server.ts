import "server-only";

import {
  createPublicFractionDifferentDenominatorMeasureTask,
  leastCommonDenominator,
  simplifiedDifferentDenominatorResult,
  type FractionDifferentDenominatorMeasureActivity,
} from "@/lib/math/fractions/fractionDifferentDenominatorMeasureLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.6 L1 pozostaje poza grafem modułów klienta. */
export function createFractionDifferentDenominatorMeasureQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionDifferentDenominatorMeasureActivity;
}) {
  const publicQuestion = createPublicFractionDifferentDenominatorMeasureTask(input);
  const commonDenominator = leastCommonDenominator(
    publicQuestion.left.denominator,
    publicQuestion.right.denominator,
  );
  return {
    publicQuestion,
    answerSpec: {
      expectedCommonDenominator: commonDenominator,
      expectedLeftMultiplier: commonDenominator / publicQuestion.left.denominator,
      expectedRightMultiplier: commonDenominator / publicQuestion.right.denominator,
      expectedFinal: simplifiedDifferentDenominatorResult(publicQuestion),
      expectedOperation: publicQuestion.operation,
      requireSameFactorWithinFraction: true,
      requireBothFractionsExtended: true,
      requireSimplifiedFinal: true,
      mixedNumbersAllowed: false,
      multiStepProblemsAllowed: false,
      maxScore: 3,
    },
  };
}
