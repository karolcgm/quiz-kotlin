import "server-only";

import {
  createPolygonGeometryState,
  createPublicPolygonTask,
  diagonalEndpointIds,
  polygonNameForSideCount,
} from "@/lib/math/geometry/polygons";

/** Prywatna rubryka M5-4.5 L1. Do klienta trafia wyłącznie publiczne zadanie i stan modelu. */
export function createPolygonQuestionForServer(seed: number) {
  const publicQuestion = createPublicPolygonTask(seed);
  const state = createPolygonGeometryState(seed, publicQuestion.activity === "independent" ? "assessment" : "practice");
  const firstVertexId = state.polygon.vertexIds[0]!;
  const scoring = publicQuestion.activity === "independent"
    ? publicQuestion.difficulty === "support"
      ? { recognition: 1, elements: 0, construction: 1, perimeter: 0 }
      : publicQuestion.difficulty === "core"
        ? { recognition: 1, elements: 1, construction: 1, perimeter: 0 }
        : { recognition: 1, elements: 1, construction: 1, perimeter: 1 }
    : { recognition: 1, elements: 1, construction: 1, perimeter: 0 };
  return {
    publicQuestion,
    answerSpec: {
      expectedPolygonName: polygonNameForSideCount(publicQuestion.targetVertexCount),
      expectedVertexCount: publicQuestion.targetVertexCount,
      expectedSideCount: publicQuestion.targetVertexCount,
      allowedDiagonalEndpointIdsFromFirstVertex: diagonalEndpointIds(state, firstVertexId),
      validityConditions: {
        closed: true,
        straightEdgesOnly: true,
        noSelfIntersections: true,
        distinctVertices: true,
      },
      perimeterTolerance: 0.1,
      convexityIsAssessed: false,
      scoring,
      maxScore: scoring.recognition + scoring.elements + scoring.construction + scoring.perimeter,
    },
  };
}
