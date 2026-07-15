import { describe, expect, it } from "vitest";
import {
  LINE_RELATION_LESSON_SEEDS,
  classifyLineRelation,
  configureLineRelationPreset,
  createLineRelationGeometryState,
  getLineRelationSeedConfig,
  lineDirectionDegrees,
  rotateMovableLine,
  translateMovableLine,
} from "@/lib/math/geometry/lineRelations";
import { serializeGeometryState } from "@/lib/math/geometry";

describe("WP-S4-01A — deterministyczne konfiguracje relacji prostych", () => {
  it("odtwarza identyczny stan dla tego samego seeda i rozdziela trzy poziomy", () => {
    for (const [difficulty, seed] of Object.entries(LINE_RELATION_LESSON_SEEDS)) {
      const first = createLineRelationGeometryState(seed);
      const second = createLineRelationGeometryState(seed);
      expect(serializeGeometryState(first), difficulty).toBe(serializeGeometryState(second));
      expect(getLineRelationSeedConfig(seed).difficulty).toBe(difficulty);
    }
    expect(classifyLineRelation(createLineRelationGeometryState(LINE_RELATION_LESSON_SEEDS.support)).kind).toBe("parallel");
    expect(classifyLineRelation(createLineRelationGeometryState(LINE_RELATION_LESSON_SEEDS.core)).kind).toBe("perpendicular");
    expect(classifyLineRelation(createLineRelationGeometryState(LINE_RELATION_LESSON_SEEDS.challenge)).kind).toBe("collinear");
  });

  it("klasyfikuje ∥, ⟂, przecięcie i współliniowość także po obrocie", () => {
    const base = createLineRelationGeometryState(LINE_RELATION_LESSON_SEEDS.support);
    const expected = ["parallel", "perpendicular", "intersecting", "collinear"] as const;
    for (const orientation of ["horizontal", "vertical", "diagonal"] as const) {
      for (const relation of expected) {
        const state = configureLineRelationPreset(base, orientation, relation);
        expect(classifyLineRelation(state).kind, `${orientation}/${relation}`).toBe(relation);
      }
    }
  });

  it("aktualizuje klasyfikację w czasie rzeczywistym po obrocie i zachowuje ją po przesunięciu", () => {
    const parallel = configureLineRelationPreset(
      createLineRelationGeometryState(LINE_RELATION_LESSON_SEEDS.support),
      "diagonal",
      "parallel",
    );
    const perpendicular = rotateMovableLine(parallel, lineDirectionDegrees(parallel, "line-a") + 90);
    expect(classifyLineRelation(perpendicular)).toMatchObject({ kind: "perpendicular", angleDegrees: 90 });

    const translated = translateMovableLine(perpendicular, 37, -19);
    expect(classifyLineRelation(translated).kind).toBe("perpendicular");
  });
});
