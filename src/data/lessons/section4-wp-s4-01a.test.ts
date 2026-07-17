import { describe, expect, it } from "vitest";
import { m541ProsteRelacjeL1V1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { isLineRelationLessonSeed } from "@/lib/math/geometry/lineRelations";
import { isLineConstructionLessonSeed } from "@/lib/math/geometry/lineConstructions";
import { isLineFoundationsLessonSeed } from "@/lib/math/geometry/lineFoundations";

describe("WP-S4-01A — pakiet L1", () => {
  it("jest wersją otwieraną z katalogu dla tematu M5-4.1", () => {
    expect(getLessonPackageForTopic("M5-4.1")).toBe(m541ProsteRelacjeL1V1);
  });

  it("ma poprawny slajd 0 oraz pełne cele pojęć, relacji, konstrukcji i odległości", () => {
    const lesson = m541ProsteRelacjeL1V1;
    expect(lesson.id).toBe("m5-4-1-proste-relacje-l1-v1");
    expect(lesson.title).toBe("Proste prostopadłe i równoległe");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-4-1-trace-0", title: "Cele lekcji (slajd 0)" });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(references.some((reference) => reference.startsWith("VII.2 —"))).toBe(true);
    expect(references.some((reference) => reference.startsWith("VII.3 —"))).toBe(true);
    const goals = lesson.learningGoals.map((goal) => goal.studentGoal).join(" ");
    expect(goals).toMatch(/punkt, prostą, półprostą i odcinek/u);
    expect(goals).toMatch(/symbolami ∥ oraz ⟂/u);
    expect(goals).toMatch(/odległość punktu od prostej/u);
    expect(goals).toMatch(/odległość między prostymi/u);
  });

  it("prowadzi od podstawowych obiektów przez konstrukcje do obu rodzajów odległości", () => {
    const titles = m541ProsteRelacjeL1V1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Punkt, prosta, półprosta i odcinek",
      "Odcinki równoległe i prostopadłe",
      "Proste równoległe i prostopadłe",
      "Jak rysujemy prostą prostopadłą?",
      "Jak rysujemy prostą równoległą?",
      "Odległość punktu od prostej",
      "Odległość między prostymi równoległymi",
      "Samodzielne rozpoznawanie",
    ]));
    expect(titles.at(-1)).toBe("Ocena umiejętności");
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(m541ProsteRelacjeL1V1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(m541ProsteRelacjeL1V1.estimatedMinutes);
  });

  it("używa właściwego modelu dla pojęć, relacji, konstrukcji i odległości", () => {
    const modelStages = m541ProsteRelacjeL1V1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(modelStages.length).toBeGreaterThanOrEqual(8);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("geometry-lab");
      const seed = stage.board.modelSeed ?? 0;
      expect(
        isLineRelationLessonSeed(seed) || isLineConstructionLessonSeed(seed) || isLineFoundationsLessonSeed(seed),
        stage.id,
      ).toBe(true);
      expect(stage.student?.modelSeed).toBe(stage.board.modelSeed);
    });
    const independent = m541ProsteRelacjeL1V1.stages.find((stage) => stage.title === "Samodzielne rozpoznawanie")!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual([
      "independent-names",
      "independent-relations",
      "independent-point-distance",
      "independent-lines-distance",
    ]);
  });

  it("utrzymuje ten sam skillId i konfigurację w board/tablet/live/print", () => {
    expect(lessonChannelContractIssues(m541ProsteRelacjeL1V1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m541ProsteRelacjeL1V1).stageSnapshot;
    const sourceModels = m541ProsteRelacjeL1V1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    for (const source of sourceModels) {
      const stage = snapshot.stages.find((item) => item.id === source.id)!;
      expect(stage.modelId).toBe("geometry-lab");
      expect(stage.studentModelId).toBe("geometry-lab");
      expect(stage.modelSeed).toBe(source.board.modelSeed);
      expect(stage.liveKind).toBeDefined();
      expect(source.print?.items?.every((item) => item.skillIds?.includes("M5-4.1-parallel-perpendicular"))).toBe(true);
      expect(source.runtime?.channels.board.skillIds).toEqual(["M5-4.1-parallel-perpendicular"]);
      expect(source.runtime?.channels.tablet.skillIds).toEqual(source.runtime?.channels.print.skillIds);
    }
  });
});
