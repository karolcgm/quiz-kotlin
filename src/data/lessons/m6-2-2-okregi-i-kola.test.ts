import { describe, expect, it } from "vitest";
import { m622OkregiIKolaV1 } from "@/data/lessons/m6-2-2-okregi-i-kola";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { CIRCLE_LESSON_SEEDS, isCircleLessonSeed } from "@/lib/math/geometry/circles";

describe("M6-2.2 Okręgi i koła", () => {
  it("publikuje pełny temat zamiast szkicu klasy VI", () => {
    expect(getLessonPackageForTopic("M6-2.2")).toBe(m622OkregiIKolaV1);
    expect(m622OkregiIKolaV1.status).toBe("published");
    expect(m622OkregiIKolaV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m622OkregiIKolaV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("zawiera wszystkie zaplanowane modele bez powtórzonych nasion", () => {
    const modelStages = m622OkregiIKolaV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    const seeds = modelStages.map((stage) => stage.board.modelSeed ?? 0);
    expect(seeds).toEqual(Object.values(CIRCLE_LESSON_SEEDS));
    expect(new Set(seeds).size).toBe(seeds.length);
    expect(seeds.every(isCircleLessonSeed)).toBe(true);
  });

  it("utrzymuje kontrakt nauczyciela, ucznia, live i druku", () => {
    expect(lessonChannelContractIssues(m622OkregiIKolaV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m622OkregiIKolaV1).stageSnapshot;
    expect(snapshot.stages.filter((stage) => stage.modelId === "geometry-lab")).toHaveLength(5);
  });
});
