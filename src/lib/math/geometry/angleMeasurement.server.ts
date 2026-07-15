import "server-only";

import { createPublicAngleMeasurementTask } from "@/lib/math/geometry/angleMeasurement";

/** Prywatna rubryka M5-4.3 L1. Klient otrzymuje tylko publiczne dane zadania. */
export function createAngleMeasurementQuestionForServer(seed: number) {
  const publicQuestion = createPublicAngleMeasurementTask(seed);
  return {
    publicQuestion,
    answerSpec: {
      expectedDegrees: publicQuestion.angleDegrees,
      toleranceDegrees: 1,
      expectedScale: publicQuestion.correctScale,
      centerTolerancePx: 4,
      baselineToleranceDegrees: 1,
      readinessRequires: ["center-aligned", "baseline-aligned"] as const,
      maxScore: publicQuestion.activity === "independent" ? 2 : 1,
    },
  };
}
