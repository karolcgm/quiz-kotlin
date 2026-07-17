import { describe, expect, it } from "vitest";
import { m541KonstrukcjeProstychL2V1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isLineConstructionLessonSeed } from "@/lib/math/geometry/lineConstructions";
import type { LessonRuntimeChannel } from "@/types/lessonRuntime";

const skillId = "M5-4.1-line-constructions";
const channels: LessonRuntimeChannel[] = ["board", "tablet", "live", "self_paced", "print"];

describe("WP-S4-01B — pakiet L2", () => {
  it("ma poprawny slajd 0, podstawę VII.2/VII.3 i cele konstrukcyjne", () => {
    const lesson = m541KonstrukcjeProstychL2V1;
    expect(lesson.id).toBe("m5-4-1-konstrukcje-prostych-l2-v1");
    expect(lesson.title).toBe("Proste prostopadłe i równoległe");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-4-1-trace-0",
      title: "Cele lekcji (slajd 0)",
    });

    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(references.some((reference) => reference.startsWith("VII.2 —"))).toBe(true);
    expect(references.some((reference) => reference.startsWith("VII.3 —"))).toBe(true);
    expect(lesson.learningGoals).toHaveLength(4);
    expect(lesson.learningGoals.map((goal) => goal.studentGoal).join(" ")).toMatch(
      /konstruować|przesuwanie|projektować|oznaczać/u,
    );
    expect(lesson.learningGoals.flatMap((goal) => goal.successCriteria))
      .toSatisfy((criteria: string[]) => criteria.every((criterion) => criterion.startsWith("Potrafię")));
  });

  it("prowadzi przez kluczowe aktywności L2 do jednej końcowej oceny", () => {
    const titles = m541KonstrukcjeProstychL2V1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Ekierka ekranowa",
      "Przesuń bez obracania",
      "Tory i alejki",
      "Samodzielne uporządkowanie kroków",
    ]));
    expect(titles.at(-2)).toBe("Samodzielne uporządkowanie kroków");
    expect(titles.at(-1)).toBe("Ocena umiejętności");
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(titles).not.toEqual(expect.arrayContaining(["Miasto linii", "Nie ufaj położeniu"]));
  });

  it("używa geometry-lab i zgodnych deterministycznych konfiguracji nauczyciela i ucznia", () => {
    const modelStages = m541KonstrukcjeProstychL2V1.stages.filter(
      (stage) => stage.board.modelId === "geometry-lab",
    );
    expect(modelStages.length).toBeGreaterThanOrEqual(5);

    modelStages.forEach((stage) => {
      expect(isLineConstructionLessonSeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({
        modelId: "geometry-lab",
        modelSeed: stage.board.modelSeed,
      });
      expect(stage.print?.items?.every((item) => item.skillIds?.includes(skillId))).toBe(true);
    });

    const seeds = new Set(modelStages.map((stage) => stage.board.modelSeed));
    expect([...seeds]).toEqual(expect.arrayContaining([411101, 411201, 411301]));
  });

  it("wiąże końcową ocenę z trzema poziomami samodzielnej konstrukcji", () => {
    const independent = m541KonstrukcjeProstychL2V1.stages.find(
      (stage) => stage.title === "Samodzielne uporządkowanie kroków",
    )!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual([
      "l2-independent-perpendicular",
      "l2-independent-parallel",
      "l2-independent-network",
    ]);
    expect(independent.print?.items?.map((item) => item.maxScore)).toEqual([1, 1, 2]);

    const assessment = m541KonstrukcjeProstychL2V1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(independent.id);
    expect(assessment.understanding?.criteria).toHaveLength(4);
    expect(assessment.understanding?.criteria.every((criterion) => criterion.skillId === skillId)).toBe(true);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(
      independent.print?.items?.map((item) => item.id),
    );
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual([
      "live",
      "self_paced",
      "paper_manual",
    ]);
    expect(assessment.understanding?.selfAssessmentAffectsScore).toBe(false);
  });

  it("utrzymuje wspólny skill i stan w board/tablet/live/self-paced/print", () => {
    expect(lessonChannelContractIssues(m541KonstrukcjeProstychL2V1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m541KonstrukcjeProstychL2V1).stageSnapshot;

    m541KonstrukcjeProstychL2V1.stages.forEach((source) => {
      const stage = snapshot.stages.find((item) => item.id === source.id)!;
      expect(stage.runtime).toEqual(source.runtime);
      channels.forEach((channel) => {
        expect(source.runtime?.channels[channel]).toMatchObject({
          enabled: channel === "print" ? Boolean(source.print) : true,
          skillIds: [skillId],
        });
      });

      if (source.board.modelId === "geometry-lab") {
        expect(channels.every((channel) => source.runtime?.channels[channel].enabled)).toBe(true);
        expect(stage).toMatchObject({
          modelId: "geometry-lab",
          studentModelId: "geometry-lab",
          modelSeed: source.board.modelSeed,
          studentModelSeed: source.board.modelSeed,
        });
      }
    });
  });
});
