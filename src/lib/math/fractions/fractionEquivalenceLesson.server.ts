import "server-only";

import { createPublicFractionEquivalenceTask } from "@/lib/math/fractions/fractionEquivalenceLesson";
import type { FractionEquivalenceActivity } from "@/lib/math/fractions/fractionEquivalenceLesson";
import type { LessonDifficulty } from "@/types/lessonPackage";

/** Prywatna rubryka M5-3.3 pozostaje poza grafem modułów klienta. */
export function createFractionEquivalenceQuestionForServer(input: {
  seed: number;
  difficulty: LessonDifficulty;
  activity: FractionEquivalenceActivity;
}) {
  const publicQuestion = createPublicFractionEquivalenceTask(input);
  return {
    publicQuestion,
    answerSpec: {
      expectedExpanded: { ...publicQuestion.result },
      expectedSimplified: { ...publicQuestion.source },
      requireSameFactor: true,
      requireIntegerDivisors: true,
      requireValuePreserved: true,
      requireSimplifiedFinal: input.activity === "independent-equivalence",
      allowEquivalentIntermediatePaths: true,
      requireStepEvidence: input.activity === "equivalent-chain" || input.activity === "independent-equivalence",
      maxScore: 3,
    },
  };
}
