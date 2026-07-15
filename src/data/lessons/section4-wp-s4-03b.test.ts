import { describe, expect, it } from "vitest";
import { m543RysowanieKatowL2V1, section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isAngleDrawingLessonSeed } from "@/lib/math/geometry/angleDrawing";

describe("WP-S4-03B — pakiet L2 rysowania", () => {
  it("ma osobny trace-0, oficjalną nazwę oraz podstawę VIII.2/VIII.3", () => {
    expect(m543RysowanieKatowL2V1).toMatchObject({ title: "Mierzenie i rysowanie kątów", lessonNumber: 2, skillIds: ["M5-4.3-draw-angles"], prerequisiteSkillIds: ["M5-4.3-measure-angles"] });
    expect(m543RysowanieKatowL2V1.stages[0]).toMatchObject({ id: "m5-4-3-trace-0", title: "Cele lekcji (slajd 0)" });
    const refs = m543RysowanieKatowL2V1.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(refs.some((reference) => reference.startsWith("VIII.2 —"))).toBe(true);
    expect(refs.some((reference) => reference.startsWith("VIII.3 —"))).toBe(true);
    expect(m543RysowanieKatowL2V1.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
    expect(section4LessonsWpC4).toContain(m543RysowanieKatowL2V1);
  });

  it("prowadzi przez 65°, warianty, anonimową kontrolę i samodzielny dowód do jednej oceny", () => {
    const titles = m543RysowanieKatowL2V1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining(["Plan konstrukcji", "Narysuj 65°", "Promień → znacznik → ramię", "Inne miary i orientacje", "Kontrola koleżeńska", "Samodzielna konstrukcja"]));
    expect(titles).not.toContain("Samodzielny pomiar");
    expect(titles.at(-2)).toBe("Samodzielna konstrukcja");
    expect(titles.at(-1)).toBe("Ocena umiejętności");
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(m543RysowanieKatowL2V1.estimatedMinutes).toBe(45);
    expect(m543RysowanieKatowL2V1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });

  it("używa wyłącznie lokalnych seedów L2 i nie serializuje pytań klientowych", () => {
    const modelStages = m543RysowanieKatowL2V1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(modelStages).toHaveLength(5);
    modelStages.forEach((stage) => {
      expect(isAngleDrawingLessonSeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({ modelId: "geometry-lab", modelSeed: stage.board.modelSeed });
      expect(stage.questions).toEqual([]);
      expect(stage.print?.items?.every((item) => item.skillIds?.includes("M5-4.3-draw-angles"))).toBe(true);
    });
    const snapshotText = JSON.stringify(buildLessonSessionSnapshot(m543RysowanieKatowL2V1).stageSnapshot);
    expect(snapshotText).not.toContain("answerSpec");
    expect(snapshotText).not.toContain("expectedSecondRayDirectionDegrees");
  });

  it("wiąże poziomy support/core/challenge z końcową Oceną umiejętności", () => {
    const independent = m543RysowanieKatowL2V1.stages.at(-2)!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual(["independent-draw-support", "independent-draw-core", "independent-draw-challenge"]);
    expect(independent.print?.items?.map((item) => item.maxScore)).toEqual([1, 2, 2]);
    const assessment = m543RysowanieKatowL2V1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(independent.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(independent.print?.items?.map((item) => item.id));
    expect(assessment.understanding?.evidenceItems.every((item) => item.skillIds.includes("M5-4.3-draw-angles"))).toBe(true);
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual(["live", "self_paced", "paper_manual"]);
  });

  it("utrzymuje model, seed i skillIds w board/tablet/live/self-paced/print", () => {
    expect(lessonChannelContractIssues(m543RysowanieKatowL2V1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m543RysowanieKatowL2V1).stageSnapshot;
    m543RysowanieKatowL2V1.stages.forEach((source) => {
      const stage = snapshot.stages.find((candidate) => candidate.id === source.id)!;
      expect(stage.runtime).toEqual(source.runtime);
      if (source.board.modelId === "geometry-lab") {
        expect(stage).toMatchObject({ modelId: "geometry-lab", studentModelId: "geometry-lab", modelSeed: source.board.modelSeed, studentModelSeed: source.board.modelSeed });
        expect(Object.values(source.runtime!.channels).every((channel) => channel.enabled)).toBe(true);
        expect(source.runtime?.channels.self_paced.mode).toBe("practice");
        expect(source.runtime?.channels.print.mode).toBe("paper");
      }
    });
  });
});
