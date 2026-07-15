import "server-only";

import { createPublicFractionLessonL2Task } from "@/lib/math/fractions/fractionLessonL2";
import type { FractionLessonL2Activity } from "@/lib/math/fractions/fractionLessonL2";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatny klucz L2 pozostaje za granicą server-only. */
export function createFractionLessonL2QuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL2Activity;
}) {
  const publicQuestion = createPublicFractionLessonL2Task(input);
  return {
    publicQuestion,
    answerSpec: {
      expectedImproper: { ...publicQuestion.target },
      expectedMixed: { ...publicQuestion.mixed },
      expectedClassification: publicQuestion.sourceKind,
      axisNumerator: publicQuestion.target.numerator,
      axisDenominator: publicQuestion.target.denominator,
      allowEquivalent: true,
      maxScore: 3,
    },
  };
}
