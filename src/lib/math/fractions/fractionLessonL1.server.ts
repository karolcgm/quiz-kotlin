import "server-only";

import { createPublicFractionLessonL1Task } from "@/lib/math/fractions/fractionLessonL1";
import type { FractionLessonL1Activity } from "@/lib/math/fractions/fractionLessonL1";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna część oceniania; nie jest importowana przez komponent klientowy. */
export function createFractionLessonL1QuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionLessonL1Activity;
}) {
  const publicQuestion = createPublicFractionLessonL1Task(input);
  return {
    publicQuestion,
    answerSpec: {
      expected: { ...publicQuestion.target },
      allowEquivalent: true,
      requireEqualParts: true,
      requireSameWhole: true,
      maxScore: 1,
    },
  };
}
