import { describe, expect, it } from "vitest";
import { m625KatyV1 } from "@/data/lessons/m6-2-5-katy";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { ANGLE_RECOGNITION_SEEDS } from "@/lib/math/geometry/angleRecognition";
import { PLANE_FIGURES_THEORY_SEEDS } from "@/lib/math/geometry/planeFiguresTheory";
import { VERTICAL_ANGLES_LESSON_SEEDS } from "@/lib/math/geometry/verticalAngles";

describe("M6-2.5 Kąty", () => {
  it("zastępuje szkic pełnym tematem klasy VI", () => {
    expect(getLessonPackageForTopic("M6-2.5")).toBe(m625KatyV1);
    expect(m625KatyV1.title).toBe("Kąty");
    expect(m625KatyV1.status).toBe("published");
  });

  it("łączy modele klasy V z nowymi nazwami par przy prostych równoległych", () => {
    const seeds = m625KatyV1.stages
      .filter((stage) => stage.board.modelId === "geometry-lab")
      .map((stage) => stage.board.modelSeed);

    expect(seeds).toEqual([
      ANGLE_RECOGNITION_SEEDS.openness,
      ANGLE_RECOGNITION_SEEDS.measures,
      ANGLE_RECOGNITION_SEEDS.notation,
      VERTICAL_ANGLES_LESSON_SEEDS.crossing.support,
      VERTICAL_ANGLES_LESSON_SEEDS.roundabout.challenge,
      VERTICAL_ANGLES_LESSON_SEEDS["three-lines"].support,
      PLANE_FIGURES_THEORY_SEEDS["parallel-angle-pairs"].theory,
      PLANE_FIGURES_THEORY_SEEDS["parallel-angle-pairs"].challenge,
      PLANE_FIGURES_THEORY_SEEDS["parallel-angle-pairs"].practice,
    ]);

    const visibleCopy = [
      m625KatyV1.studentGoal,
      ...m625KatyV1.successCriteria,
      ...m625KatyV1.stages.flatMap((stage) => [
        stage.title,
        stage.board.headline,
        stage.board.body,
        stage.student?.instruction ?? "",
      ]),
    ].join(" ");

    expect(visibleCopy).toContain("odpowiadające");
    expect(visibleCopy).toContain("naprzemianległe");
    expect(visibleCopy).toContain("przeciętych trzecią prostą");
    expect(JSON.stringify(m625KatyV1)).not.toMatch(/sieczn/iu);
  });

  it("utrzymuje kontrakt kanałów i sesji klasy VI", () => {
    expect(lessonChannelContractIssues(m625KatyV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m625KatyV1).stageSnapshot;
    expect(snapshot.stages.filter((stage) => stage.modelId === "geometry-lab")).toHaveLength(9);
  });
});
