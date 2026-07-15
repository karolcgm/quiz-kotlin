import "server-only";

import {
  createPublicAngleDrawingTask,
  desiredDrawingProtractorRotation,
  expectedSecondRayDirection,
} from "@/lib/math/geometry/angleDrawing";

/** Prywatna rubryka M5-4.3 L2. Publiczny snapshot nie zawiera answerSpec. */
export function createAngleDrawingQuestionForServer(seed: number) {
  const publicQuestion = createPublicAngleDrawingTask(seed);
  return {
    publicQuestion,
    answerSpec: {
      orderedSteps: ["base-ray", "measure-mark", "second-ray"] as const,
      expectedBaseDirectionDegrees: publicQuestion.baseDirectionDegrees,
      expectedMarkerDegrees: publicQuestion.targetDegrees,
      expectedSecondRayDirectionDegrees: expectedSecondRayDirection(publicQuestion),
      expectedProtractorRotationDegrees: desiredDrawingProtractorRotation(publicQuestion),
      expectedScale: publicQuestion.correctScale,
      positionTolerancePx: 4,
      angleToleranceDegrees: 1,
      anonymousPeerToleranceDegrees: 1,
      maxScore: publicQuestion.activity === "independent" ? 2 : 1,
    },
  };
}
