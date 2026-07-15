import "server-only";

import { createPublicFractionQuotientTask } from "@/lib/math/fractions/fractionQuotientLesson";
import type { FractionQuotientActivity } from "@/lib/math/fractions/fractionQuotientLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.2 pozostaje poza grafem modułów klienta. */
export function createFractionQuotientQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionQuotientActivity;
}) {
  const publicQuestion = createPublicFractionQuotientTask(input);
  return {
    publicQuestion,
    answerSpec: {
      expectedDividend: publicQuestion.dividend,
      expectedDivisor: publicQuestion.divisor,
      expectedQuotient: publicQuestion.quotient ? { ...publicQuestion.quotient } : null,
      expectedMixed: publicQuestion.mixed ? { ...publicQuestion.mixed } : null,
      validDivision: publicQuestion.divisor > 0,
      divisorCondition: "greater-than-zero" as const,
      expectedPiecesPerRecipient: publicQuestion.divisor > 0 ? publicQuestion.dividend : null,
      requireAllPartsUsed: true,
      requireEqualShare: true,
      requireContextInterpretation: publicQuestion.activity === "independent-context",
      maxScore: publicQuestion.activity === "independent-context" || publicQuestion.activity === "zoo-banquet" ? 3 : 2,
    },
  };
}
