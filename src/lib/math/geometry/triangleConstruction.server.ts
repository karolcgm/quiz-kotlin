import "server-only";

import { analyzeTriangleSideLengths, createPublicTriangleConstructionTask } from "@/lib/math/geometry/triangleConstruction";

/** Prywatna rubryka M5-4.7. Klient otrzymuje długości, ale nie oczekiwaną decyzję ani warunek zaliczenia. */
export function createTriangleConstructionQuestionForServer(seed: number) {
  const publicQuestion = createPublicTriangleConstructionTask(seed);
  const analysis = analyzeTriangleSideLengths(publicQuestion.sideLengths);
  return {
    publicQuestion,
    answerSpec: {
      trianglePossible: analysis.possible,
      expectedRelation: analysis.relation,
      expectedShortSum: analysis.shortSum,
      expectedLongest: analysis.longest,
      expectedIntersectionCount: analysis.intersectionCount,
      requiresOrderedConstruction: publicQuestion.activity === "construction-steps" || publicQuestion.activity === "independent",
      manualReviewForCompassDrawing: true,
      maxScore: publicQuestion.activity === "independent" ? 3 : 2,
    },
  };
}
