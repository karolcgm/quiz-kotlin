import "server-only";

import {
  createPublicVerticalAnglesTask,
  createVerticalAnglesGeometryState,
  intersectionSectorsForPair,
} from "@/lib/math/geometry/verticalAngles";

/** Prywatna rubryka M5-4.4 L1; klient otrzymuje wyłącznie publiczne parametry skrzyżowania. */
export function createVerticalAnglesQuestionForServer(seed: number) {
  const publicQuestion = createPublicVerticalAnglesTask(seed);
  const sectors = intersectionSectorsForPair(createVerticalAnglesGeometryState(seed));
  const scoring = publicQuestion.activity === "independent"
    ? publicQuestion.difficulty === "support"
      ? { pairRecognition: 1, calculation: 0, justification: 0 }
      : publicQuestion.difficulty === "core"
        ? { pairRecognition: 0, calculation: 2, justification: 0 }
        : { pairRecognition: 0, calculation: 1, justification: 2 }
    : publicQuestion.activity === "roundabout"
      ? { pairRecognition: 0, calculation: 2, justification: 1 }
      : publicQuestion.activity === "one-angle"
        ? { pairRecognition: 1, calculation: 1, justification: 0 }
        : { pairRecognition: 1, calculation: 0, justification: 0 };
  return {
    publicQuestion,
    answerSpec: {
      verticalPairs: [[0, 2], [1, 3]] as const,
      adjacentPairs: [[0, 1], [1, 2], [2, 3], [3, 0]] as const,
      expectedMeasuresDegrees: sectors.map((sector) => sector.measureDegrees),
      verticalProperty: "equal-measures",
      adjacentProperty: "sum-180-degrees",
      givenAngleIndex: publicQuestion.givenAngleIndex,
      calculationToleranceDegrees: 0.01,
      scoring,
      maxScore: scoring.pairRecognition + scoring.calculation + scoring.justification,
    },
  };
}
