import "server-only";

import {
  createPublicTriangleTypesTask,
  createTriangleTypesGeometryState,
  triangleClassificationEvidence,
  triangleClassifications,
} from "@/lib/math/geometry/triangleTypes";

/** Prywatna rubryka M5-4.6. Do klienta trafia wyłącznie publiczne polecenie bez oczekiwanych nazw. */
export function createTriangleTypesQuestionForServer(seed: number) {
  const publicQuestion = createPublicTriangleTypesTask(seed);
  const state = createTriangleTypesGeometryState(seed, "assessment");
  const expected = triangleClassifications(state);
  const evidence = triangleClassificationEvidence(state);
  if (!expected || !evidence) throw new Error(`Seed ${seed} nie utworzył poprawnego trójkąta.`);
  return {
    publicQuestion,
    answerSpec: {
      expectedSideKind: expected.side,
      expectedAngleKind: expected.angle,
      requiredEvidence: {
        equalSides: evidence.equalSides,
        greatestAngle: evidence.greatestAngle,
        greatestAngleDegrees: evidence.greatestAngleDegrees,
      },
      allowsEquivalentRotationOrReflection: true,
      manualReviewForDrawing: true,
      maxScore: publicQuestion.activity === "independent" ? 2 : 1,
    },
  };
}
