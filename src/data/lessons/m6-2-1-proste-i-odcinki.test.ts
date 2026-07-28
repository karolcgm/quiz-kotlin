import { describe, expect, it } from "vitest";
import { m621ProsteIOdcinkiV1 } from "@/data/lessons/m6-2-1-proste-i-odcinki";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isLineConstructionLessonSeed } from "@/lib/math/geometry/lineConstructions";
import { isLineFoundationsLessonSeed } from "@/lib/math/geometry/lineFoundations";
import { isLineRelationLessonSeed } from "@/lib/math/geometry/lineRelations";

describe("M6-2.1 Proste i odcinki", () => {
  it("publikuje pełny temat zamiast szkicu klasy VI", () => {
    expect(getLessonPackageForTopic("M6-2.1")).toBe(m621ProsteIOdcinkiV1);
    expect(m621ProsteIOdcinkiV1.status).toBe("published");
    expect(m621ProsteIOdcinkiV1.stages[0]?.title).toBe("Cele lekcji (slajd 0)");
    expect(m621ProsteIOdcinkiV1.stages.at(-1)?.kind).toBe("understanding");
  });

  it("powtarza pełny zakres dojrzałego tematu z klasy V", () => {
    const titles = m621ProsteIOdcinkiV1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Punkt, prosta, półprosta i odcinek",
      "Odcinki równoległe i prostopadłe",
      "Proste równoległe i prostopadłe",
      "Rysowanie prostej prostopadłej",
      "Rysowanie prostej równoległej",
      "Odległość punktu od prostej",
      "Odległość między prostymi równoległymi",
      "Odcinki równoległe i prostopadłe w łamanej — zestaw 1",
      "Odcinki równoległe i prostopadłe w łamanej — zestaw 2",
    ]));
  });

  it("korzysta wyłącznie ze sprawdzonych modeli geometrii z klasy V", () => {
    const modelStages = m621ProsteIOdcinkiV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(modelStages).toHaveLength(9);
    for (const stage of modelStages) {
      const seed = stage.board.modelSeed ?? 0;
      expect(
        isLineFoundationsLessonSeed(seed)
          || isLineRelationLessonSeed(seed)
          || isLineConstructionLessonSeed(seed),
        stage.id,
      ).toBe(true);
      expect(stage.student?.modelId).toBe("geometry-lab");
      expect(stage.student?.modelSeed).toBe(seed);
    }
  });

  it("utrzymuje spójny kontrakt nauczyciela, ucznia, live i druku", () => {
    expect(lessonChannelContractIssues(m621ProsteIOdcinkiV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m621ProsteIOdcinkiV1).stageSnapshot;
    expect(snapshot.stages.filter((stage) => stage.modelId === "geometry-lab")).toHaveLength(9);
  });

  it("nie powtarza dwóch zadań z łamanymi", () => {
    const polylineStages = m621ProsteIOdcinkiV1.stages.filter((stage) => stage.board.modelSeed === 410302 || stage.board.modelSeed === 410303);
    expect(polylineStages.map((stage) => stage.board.modelSeed)).toEqual([410302, 410303]);
    expect(new Set(polylineStages.map((stage) => stage.print?.items?.[0]?.id)).size).toBe(2);
  });
});
