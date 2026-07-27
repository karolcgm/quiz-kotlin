import { describe, expect, it } from "vitest";
import { m623TrojkatyV1 } from "@/data/lessons/m6-2-3-trojkaty";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isTriangleConstructionLessonSeed } from "@/lib/math/geometry/triangleConstruction";
import { isTriangleTypesLessonSeed } from "@/lib/math/geometry/triangleTypes";

describe("M6-2.3 Trójkąty", () => {
  it("publikuje pełny temat zamiast szkicu klasy VI", () => {
    expect(getLessonPackageForTopic("M6-2.3")).toBe(m623TrojkatyV1);
    expect(m623TrojkatyV1.status).toBe("published");
    expect(m623TrojkatyV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m623TrojkatyV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("łączy modele rodzajów i konstrukcji trójkątów bez powtórzonych nasion", () => {
    const modelStages = m623TrojkatyV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    const seeds = modelStages.map((stage) => stage.board.modelSeed ?? 0);

    expect(modelStages).toHaveLength(7);
    expect(new Set(seeds).size).toBe(seeds.length);
    expect(seeds.filter(isTriangleTypesLessonSeed)).toHaveLength(4);
    expect(seeds.filter(isTriangleConstructionLessonSeed)).toHaveLength(3);
  });

  it("utrzymuje kontrakt nauczyciela, ucznia, live i druku", () => {
    expect(lessonChannelContractIssues(m623TrojkatyV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m623TrojkatyV1).stageSnapshot;
    expect(snapshot.stages.filter((stage) => stage.modelId === "geometry-lab")).toHaveLength(7);
  });
});
