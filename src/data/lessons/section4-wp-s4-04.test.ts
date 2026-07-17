import { describe, expect, it } from "vitest";
import { m544SkrzyzowanieProstychV1, section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isVerticalAnglesLessonSeed } from "@/lib/math/geometry/verticalAngles";

describe("WP-S4-04 — pakiet L1 kątów przyległych i wierzchołkowych", () => {
  it("ma poprawny trace-0, oficjalny tytuł oraz podstawę VIII.6/XI.1", () => {
    expect(m544SkrzyzowanieProstychV1).toMatchObject({
      title: "Kąty przyległe i wierzchołkowe",
      lessonNumber: 1,
      prerequisiteSkillIds: ["M5-4.3-measure-angles"],
      skillIds: ["M5-4.4-angle-pairs-properties", "M5-4.4-angle-calculations"],
    });
    expect(m544SkrzyzowanieProstychV1.stages[0]).toMatchObject({ id: "m5-4-4-trace-0", title: "Cele lekcji (slajd 0)" });
    const references = m544SkrzyzowanieProstychV1.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(references.some((reference) => reference.startsWith("VIII.6 —"))).toBe(true);
    expect(references.some((reference) => reference.startsWith("XI.1 —"))).toBe(true);
    expect(m544SkrzyzowanieProstychV1.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
    expect(m544SkrzyzowanieProstychV1.learningGoals).toHaveLength(2);
    expect(JSON.stringify(m544SkrzyzowanieProstychV1.learningGoals)).not.toContain("bez opierania się na samym kolorze");
    expect(section4LessonsWpC4).toContain(m544SkrzyzowanieProstychV1);
  });

  it("prowadzi przez pięć różnych slajdów do dokładnie jednej Oceny umiejętności", () => {
    const titles = m544SkrzyzowanieProstychV1.stages.map((stage) => stage.title);
    expect(titles).toEqual([
      "Cele lekcji (slajd 0)",
      "Kąty przyległe i wierzchołkowe",
      "Rozpoznaj pary kątów",
      "Obliczamy brakujące kąty",
      "Kąty utworzone przez trzy proste",
      "Obliczenia z rysunku",
      "Ocena umiejętności",
    ]);
    expect(JSON.stringify(m544SkrzyzowanieProstychV1.stages)).not.toMatch(/sieczna|odpowiadające|naprzemianległe/iu);
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(m544SkrzyzowanieProstychV1.estimatedMinutes).toBe(45);
    expect(m544SkrzyzowanieProstychV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });

  it("używa lokalnych seedów 440xxx, pustych pytań i jawnych skillIds w druku", () => {
    const modelStages = m544SkrzyzowanieProstychV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(modelStages).toHaveLength(5);
    modelStages.forEach((stage) => {
      expect(isVerticalAnglesLessonSeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({ modelId: "geometry-lab", modelSeed: stage.board.modelSeed });
      expect(stage.questions).toEqual([]);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.skillIds?.every((skillId) => m544SkrzyzowanieProstychV1.skillIds.includes(skillId)))).toBe(true);
    });
    expect(modelStages.map((stage) => stage.board.modelSeed)).toEqual([440101, 440201, 440301, 440401, 440501]);
  });

  it("wiąże serię obliczeń z końcową oceną i osobną punktacją uzasadnienia", () => {
    const practice = m544SkrzyzowanieProstychV1.stages.at(-2)!;
    expect(practice.print?.items?.map((item) => item.id)).toEqual([
      "roundabout-vertical",
      "roundabout-adjacent",
    ]);
    expect(practice.print?.items?.map((item) => item.maxScore)).toEqual([1, 2]);
    expect(practice.print?.items?.at(-1)?.skillIds).toEqual(["M5-4.4-angle-calculations"]);
    const assessment = m544SkrzyzowanieProstychV1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(practice.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(practice.print?.items?.map((item) => item.id));
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual(["live", "self_paced", "paper_manual"]);
    expect(assessment.understanding?.selfAssessmentAffectsScore).toBe(false);
  });

  it("utrzymuje board/tablet/live/self-paced/print i nie serializuje answerSpec", () => {
    expect(lessonChannelContractIssues(m544SkrzyzowanieProstychV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m544SkrzyzowanieProstychV1).stageSnapshot;
    m544SkrzyzowanieProstychV1.stages.forEach((source) => {
      const stage = snapshot.stages.find((candidate) => candidate.id === source.id)!;
      expect(stage.runtime).toEqual(source.runtime);
      if (source.board.modelId === "geometry-lab") {
        expect(stage).toMatchObject({ modelId: "geometry-lab", studentModelId: "geometry-lab", modelSeed: source.board.modelSeed, studentModelSeed: source.board.modelSeed });
        expect(Object.values(source.runtime!.channels).every((channel) => channel.enabled)).toBe(true);
        expect(source.runtime?.channels.board.mode).toBe("practice");
        expect(source.runtime?.channels.tablet.mode).toBe("practice");
        expect(source.runtime?.channels.live.mode).toBe("practice");
        expect(source.runtime?.channels.self_paced.mode).toBe("practice");
        expect(source.runtime?.channels.print.mode).toBe("paper");
      }
    });
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toContain("answerSpec");
    expect(serialized).not.toContain("expectedMeasuresDegrees");
    expect(serialized).not.toContain("verticalPairs");
  });
});
