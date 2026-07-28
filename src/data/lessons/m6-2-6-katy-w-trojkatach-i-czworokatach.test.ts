import { describe, expect, it } from "vitest";
import { m626KatyWTrojkatachICzworokatachV1 } from "@/data/lessons/m6-2-6-katy-w-trojkatach-i-czworokatach";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { PARALLELOGRAM_RHOMBUS_ANGLE_SEED, TRAPEZOID_LESSON_SEEDS } from "@/lib/math/geometry/planeFiguresTheory";
import { TRIANGLE_ANGLE_SUM_LESSON_SEEDS } from "@/lib/math/geometry/triangleAngleSum";

describe("M6-2.6 Kąty w trójkątach i czworokątach", () => {
  it("zastępuje szkic pełnym, poprawnie nazwanym tematem", () => {
    expect(getLessonPackageForTopic("M6-2.6")).toBe(m626KatyWTrojkatachICzworokatachV1);
    expect(m626KatyWTrojkatachICzworokatachV1.title).toBe("Kąty w trójkątach i czworokątach");
    expect(m626KatyWTrojkatachICzworokatachV1.status).toBe("published");
  });

  it("łączy wyłącznie modele kątów trójkątów, równoległoboków, rombów i trapezów", () => {
    const seeds = m626KatyWTrojkatachICzworokatachV1.stages
      .filter((stage) => stage.board.modelId === "geometry-lab")
      .map((stage) => stage.board.modelSeed);

    expect(seeds).toEqual([
      TRIANGLE_ANGLE_SUM_LESSON_SEEDS.explore,
      TRIANGLE_ANGLE_SUM_LESSON_SEEDS.independent,
      PARALLELOGRAM_RHOMBUS_ANGLE_SEED,
      TRAPEZOID_LESSON_SEEDS.angleTheory,
      TRAPEZOID_LESSON_SEEDS.anglePractice,
    ]);
  });

  it("utrzymuje kontrakt kanałów i sesji klasy VI", () => {
    expect(lessonChannelContractIssues(m626KatyWTrojkatachICzworokatachV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m626KatyWTrojkatachICzworokatachV1).stageSnapshot;
    expect(snapshot.stages.filter((stage) => stage.modelId === "geometry-lab")).toHaveLength(5);
  });
});
