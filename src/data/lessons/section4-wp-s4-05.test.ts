import { describe, expect, it } from "vitest";
import { m545BudowniczyWielokatowV1, section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isPolygonLessonSeed } from "@/lib/math/geometry/polygons";

describe("WP-S4-05 — pakiet Wielokąty", () => {
  it("ma prosty cel zgodny z rozpoznawaniem i elementami wielokąta", () => {
    expect(m545BudowniczyWielokatowV1).toMatchObject({ title: "Wielokąty", lessonNumber: 1 });
    expect(m545BudowniczyWielokatowV1.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się rozpoznawać i nazywać wielokąty.",
      "Nauczę się wskazywać elementy wielokąta.",
      "Nauczę się obliczać obwód wielokąta.",
    ]);
    expect(m545BudowniczyWielokatowV1.successCriteria.join(" ")).toContain("liczbę boków, wierzchołków i kątów");
    expect(section4LessonsWpC4).toContain(m545BudowniczyWielokatowV1);
  });

  it("ma pięć właściwych slajdów treści i jedną końcową ocenę", () => {
    expect(m545BudowniczyWielokatowV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Wielokąt — boki, wierzchołki i kąty",
      "Przekątna wielokąta",
      "Które rysunki są wielokątami?",
      "Policz elementy wielokąta",
      "Obwód wielokąta",
      "Ocena umiejętności",
    ]);
    expect(m545BudowniczyWielokatowV1.estimatedMinutes).toBe(45);
    expect(m545BudowniczyWielokatowV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });

  it("używa pięciu modeli 450xxx i jawnych umiejętności w druku", () => {
    const models = m545BudowniczyWielokatowV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(models.map((stage) => stage.board.modelSeed)).toEqual([450102, 450302, 450202, 450402, 450602]);
    models.forEach((stage) => {
      expect(isPolygonLessonSeed(stage.board.modelSeed ?? 0)).toBe(true);
      expect(stage.questions).toEqual([]);
      expect(stage.print?.items?.every((item) => item.skillIds?.every((skillId) => m545BudowniczyWielokatowV1.skillIds.includes(skillId)))).toBe(true);
    });
  });

  it("wiąże ostatnią serię z oceną umiejętności", () => {
    const evidence = m545BudowniczyWielokatowV1.stages.at(-2)!;
    const assessment = m545BudowniczyWielokatowV1.stages.at(-1)!;
    expect(evidence.print?.items?.map((item) => item.id)).toEqual(["perimeter-all-sides", "perimeter-opposite-sides"]);
    expect(assessment.understanding?.evidenceStageId).toBe(evidence.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(["perimeter-all-sides", "perimeter-opposite-sides"]);
  });

  it("utrzymuje wszystkie kanały i nie ujawnia odpowiedzi w snapshotcie", () => {
    expect(lessonChannelContractIssues(m545BudowniczyWielokatowV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m545BudowniczyWielokatowV1).stageSnapshot;
    expect(JSON.stringify(snapshot)).not.toContain("answerSpec");
  });
});
