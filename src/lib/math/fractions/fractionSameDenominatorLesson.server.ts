import "server-only";

import {
  applySameDenominatorOperation,
  createPublicFractionSameDenominatorTask,
  simplifiedSameDenominatorResult,
  type FractionSameDenominatorActivity,
} from "@/lib/math/fractions/fractionSameDenominatorLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.5 L1 nie wchodzi do grafu modułów klienta. */
export function createFractionSameDenominatorQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionSameDenominatorActivity;
}) {
  const publicQuestion = createPublicFractionSameDenominatorTask(input);
  return {
    publicQuestion,
    answerSpec: {
      expectedBeforeSimplifying: applySameDenominatorOperation(publicQuestion),
      expectedFinal: simplifiedSameDenominatorResult(publicQuestion),
      expectedOperation: publicQuestion.operation,
      requireSameDenominator: true,
      requireSimplifiedFinal: publicQuestion.requireSimplifiedFinal,
      requireJustification: input.activity === "same-denom-independent",
      mixedNumbersAllowed: false,
      borrowingAllowed: false,
      maxScore: 2,
    },
  };
}
