import { describe, expect, it } from "vitest";
import { m545BudowniczyWielokatowV1, section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isPolygonLessonSeed } from "@/lib/math/geometry/polygons";

describe("WP-S4-05 — pakiet L1 Wielokąty", () => {
  it("ma poprawny trace-0, oficjalny tytuł i podstawę IX.1–5 z XI.2 tylko przy obwodzie", () => {
    expect(m545BudowniczyWielokatowV1).toMatchObject({
      title: "Wielokąty",
      lessonNumber: 1,
      prerequisiteSkillIds: ["M5-4.4-angle-pairs-properties"],
    });
    expect(m545BudowniczyWielokatowV1.stages[0]).toMatchObject({ id: "m5-4-5-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(m545BudowniczyWielokatowV1.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się rozpoznawać wielokąty.",
      "Nauczę się wskazywać wierzchołki, boki i przekątne wielokąta.",
      "Nauczę się nazywać wielokąt według liczby boków.",
      "Nauczę się tworzyć przykład i kontrprzykład wielokąta.",
    ]);
    const references = m545BudowniczyWielokatowV1.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(references.some((reference) => reference.startsWith("IX.1–5 (przygotowanie pojęciowe) —"))).toBe(true);
    expect(references.filter((reference) => reference.startsWith("XI.2 (tylko gdy występuje obwód) —"))).toHaveLength(1);
    expect(m545BudowniczyWielokatowV1.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
    expect(m545BudowniczyWielokatowV1.successCriteria.join(" ").toLowerCase()).not.toContain("wypuk");
    expect(section4LessonsWpC4).toContain(m545BudowniczyWielokatowV1);
  });

  it("prowadzi przez wszystkie historie i samodzielne zadanie do dokładnie jednej Oceny umiejętności", () => {
    const titles = m545BudowniczyWielokatowV1.stages.map((stage) => stage.title);
    expect(titles).toEqual([
      "Cele lekcji (slajd 0)",
      "Budowniczy wielokątów",
      "Czy to wielokąt?",
      "Nazwij elementy",
      "Zmieniaj kształt",
      "Witraż bez prostokątów",
      "Samodzielne zadanie — support/core/challenge",
      "Ocena umiejętności",
    ]);
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(m545BudowniczyWielokatowV1.estimatedMinutes).toBe(45);
    expect(m545BudowniczyWielokatowV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });

  it("używa wyłącznie seedów 450xxx, pustych pytań i jawnych skillIds w druku", () => {
    const modelStages = m545BudowniczyWielokatowV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(modelStages).toHaveLength(6);
    expect(modelStages.map((stage) => stage.board.modelSeed)).toEqual([450102, 450202, 450302, 450402, 450502, 450602]);
    modelStages.forEach((stage) => {
      expect(isPolygonLessonSeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({ modelId: "geometry-lab", modelSeed: stage.board.modelSeed });
      expect(stage.questions).toEqual([]);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.skillIds?.every((skillId) => m545BudowniczyWielokatowV1.skillIds.includes(skillId)))).toBe(true);
    });
  });

  it("wiąże support/core/challenge z końcową oceną i osobnym zadaniem XI.2 na obwód", () => {
    const independent = m545BudowniczyWielokatowV1.stages.at(-2)!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual([
      "independent-polygon-support",
      "independent-polygon-core",
      "independent-polygon-challenge",
    ]);
    expect(independent.print?.items?.map((item) => item.maxScore)).toEqual([1, 2, 3]);
    expect(independent.print?.items?.at(-1)?.skillIds).toContain("M5-4.5-polygon-perimeter");
    expect(independent.print?.items?.slice(0, -1).flatMap((item) => item.skillIds ?? [])).not.toContain("M5-4.5-polygon-perimeter");
    const assessment = m545BudowniczyWielokatowV1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(independent.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(independent.print?.items?.map((item) => item.id));
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual(["live", "self_paced", "paper_manual"]);
    expect(assessment.understanding?.selfAssessmentAffectsScore).toBe(false);
  });

  it("utrzymuje board/tablet/live/self-paced/print i nie serializuje answerSpec", () => {
    expect(lessonChannelContractIssues(m545BudowniczyWielokatowV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m545BudowniczyWielokatowV1).stageSnapshot;
    m545BudowniczyWielokatowV1.stages.forEach((source) => {
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
    expect(serialized).not.toContain("expectedPolygonName");
    expect(serialized).not.toContain("allowedDiagonalEndpointIdsFromFirstVertex");
  });
});
