import "server-only";

import {
  classifyAngleDegrees,
  createPublicAngleTypesTask,
} from "@/lib/math/geometry/angleTypes";
import type { AngleTypeKind } from "@/lib/math/geometry/angleTypes";

function acceptedRange(kind: AngleTypeKind): { minimumExclusive?: number; exact?: number; maximumExclusive?: number } {
  switch (kind) {
    case "acute":
      return { minimumExclusive: 0, maximumExclusive: 90 };
    case "right":
      return { exact: 90 };
    case "obtuse":
      return { minimumExclusive: 90, maximumExclusive: 180 };
    case "straight":
      return { exact: 180 };
  }
}

/** Prywatna rubryka M5-4.2. Komponent klientowy importuje wyłącznie generator publiczny. */
export function createAngleTypesQuestionForServer(seed: number) {
  const publicQuestion = createPublicAngleTypesTask(seed);
  const expectedKind = publicQuestion.targetKind ?? classifyAngleDegrees(publicQuestion.angleDegrees);
  return {
    publicQuestion,
    answerSpec: {
      expectedKind,
      acceptedRange: acceptedRange(expectedKind),
      requiredPlacements: publicQuestion.activity === "elements"
        ? { vertex: "vertex-b", arm: ["ray-ba", "ray-bc"], arc: "angle-abc" }
        : undefined,
      preserveAngleDuringWholeRotation: true,
      preserveAngleDuringArmLengthChange: true,
      exactBoundaryDegrees: [90, 180] as const,
      maxScore: publicQuestion.activity === "independent" ? 2 : 1,
    },
  };
}
