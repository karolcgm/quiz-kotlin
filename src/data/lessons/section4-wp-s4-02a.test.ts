import { describe, expect, it } from "vitest";
import { m542RozchylRamionaV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isAngleTypesLessonSeed } from "@/lib/math/geometry/angleTypes";
import { isPlaneFiguresTheorySeed } from "@/lib/math/geometry/planeFiguresTheory";

describe("WP-S4-02A — pakiet L1", () => {
  it("ma oficjalny slajd 0, tytuł i wymagania VIII.1/VIII.4/VIII.5", () => {
    expect(m542RozchylRamionaV1.title).toBe("Kąty i ich rodzaje");
    expect(m542RozchylRamionaV1.lessonNumber).toBe(1);
    expect(m542RozchylRamionaV1.stages[0]).toMatchObject({ id: "m5-4-2-trace-0", title: "Cele lekcji (slajd 0)" });
    const refs = m542RozchylRamionaV1.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(refs.some((ref) => ref.startsWith("VIII.1 —"))).toBe(true);
    expect(refs.some((ref) => ref.startsWith("VIII.4 —"))).toBe(true);
    expect(refs.some((ref) => ref.startsWith("VIII.5 —"))).toBe(true);
    expect(m542RozchylRamionaV1.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
  });

  it("prowadzi przez sześć wymaganych doświadczeń do jednej Oceny umiejętności", () => {
    const titles = m542RozchylRamionaV1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Rozchyl ramiona",
      "Co tworzy kąt?",
      "Długie ramię nie znaczy większy kąt",
      "Bramki 90° i 180°",
      "Kąty od 0° do 360°",
      "Reflektory sceniczne",
      "Samodzielna klasyfikacja",
    ]));
    expect(titles.at(-2)).toBe("Samodzielna klasyfikacja");
    expect(titles.at(-1)).toBe("Ocena umiejętności");
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
  });

  it("używa wyłącznie lokalnych deterministycznych seedów geometry-lab", () => {
    const stages = m542RozchylRamionaV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(stages).toHaveLength(7);
    stages.forEach((stage) => {
      expect(isAngleTypesLessonSeed(stage.board.modelSeed ?? 0) || isPlaneFiguresTheorySeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({ modelId: "geometry-lab", modelSeed: stage.board.modelSeed });
      expect(stage.print?.items?.every((item) => item.skillIds?.includes("M5-4.2-angle-types"))).toBe(true);
    });
  });

  it("wiąże trzy poziomy samodzielnej próby z końcową oceną", () => {
    const independent = m542RozchylRamionaV1.stages.at(-2)!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual(["independent-support", "independent-core", "independent-challenge"]);
    expect(independent.print?.items?.map((item) => item.maxScore)).toEqual([1, 2, 2]);
    const assessment = m542RozchylRamionaV1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(independent.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(independent.print?.items?.map((item) => item.id));
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual(["live", "self_paced", "paper_manual"]);
  });

  it("utrzymuje wspólny seed, skill i stan w snapshotach wszystkich kanałów", () => {
    expect(lessonChannelContractIssues(m542RozchylRamionaV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m542RozchylRamionaV1).stageSnapshot;
    m542RozchylRamionaV1.stages.forEach((source) => {
      const stage = snapshot.stages.find((candidate) => candidate.id === source.id)!;
      expect(stage.runtime).toEqual(source.runtime);
      if (source.board.modelId === "geometry-lab") {
        expect(stage).toMatchObject({ modelId: "geometry-lab", studentModelId: "geometry-lab", modelSeed: source.board.modelSeed, studentModelSeed: source.board.modelSeed });
        expect(Object.values(source.runtime!.channels).every((channel) => channel.enabled)).toBe(true);
      }
    });
  });
});
