import "server-only";

import {
  comparisonSign,
  createPublicFractionComparisonTask,
  sortFractionsAscending,
  type FractionComparisonActivity,
} from "@/lib/math/fractions/fractionComparisonLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.4 pozostaje poza grafem modułów klienta. */
export function createFractionComparisonQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionComparisonActivity;
}) {
  const publicQuestion = createPublicFractionComparisonTask(input);
  const [left, right] = publicQuestion.fractions;
  return {
    publicQuestion,
    answerSpec: {
      expectedSign: left && right ? comparisonSign(left, right) : null,
      expectedAscendingOrder: sortFractionsAscending(publicQuestion.fractions),
      requiredStrategy: publicQuestion.recommendedStrategy,
      requireSameWhole: true,
      requireStrategyEvidence: input.activity === "independent-comparison",
      differenceMethodAcceptedAsExtensionOnly: true,
      maxScore: 2,
    },
  };
}
