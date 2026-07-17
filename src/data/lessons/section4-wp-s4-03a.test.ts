import { describe, expect, it } from "vitest";
import { m543KatomierzEkranowyV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { isAngleMeasurementLessonSeed } from "@/lib/math/geometry/angleMeasurement";

describe("WP-S4-03A — pakiet L1 pomiaru", () => {
  it("ma oficjalny trace-0, nazwę i wymagania VIII.2/VIII.3", () => {
    expect(m543KatomierzEkranowyV1.title).toBe("Mierzenie i rysowanie kątów");
    expect(m543KatomierzEkranowyV1.lessonNumber).toBe(1);
    expect(m543KatomierzEkranowyV1.stages[0]).toMatchObject({ id: "m5-4-3-trace-0", title: "Cele lekcji (slajd 0)" });
    const refs = m543KatomierzEkranowyV1.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(refs.some((reference) => reference.startsWith("VIII.2 —"))).toBe(true);
    expect(refs.some((reference) => reference.startsWith("VIII.3 —"))).toBe(true);
    expect(m543KatomierzEkranowyV1.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
  });

  it("prowadzi przez wymagany pomiar do jednej Oceny umiejętności bez etapów L2", () => {
    const titles = m543KatomierzEkranowyV1.stages.map((stage) => stage.title);
    expect(titles).toEqual(expect.arrayContaining([
      "Zanim odczytasz",
      "Mierzenie kąta",
      "Kąt wklęsły — dwa przypadki",
      "Obrót wskazówki minutowej",
      "Zmierz serię",
      "Samodzielny pomiar",
    ]));
    expect(titles).not.toEqual(expect.arrayContaining(["Narysuj 65°", "Kontrola koleżeńska"]));
    expect(titles.at(-2)).toBe("Samodzielny pomiar");
    expect(titles.at(-1)).toBe("Ocena umiejętności");
    expect(titles.filter((title) => title === "Ocena umiejętności")).toHaveLength(1);
    expect(m543KatomierzEkranowyV1.estimatedMinutes).toBe(45);
  });

  it("używa wyłącznie lokalnych deterministycznych seedów geometry-lab", () => {
    const stages = m543KatomierzEkranowyV1.stages.filter((stage) => stage.board.modelId === "geometry-lab");
    expect(stages).toHaveLength(5);
    stages.forEach((stage) => {
      expect(isAngleMeasurementLessonSeed(stage.board.modelSeed ?? 0), stage.id).toBe(true);
      expect(stage.student).toMatchObject({ modelId: "geometry-lab", modelSeed: stage.board.modelSeed });
      expect(stage.questions).toEqual([]);
      expect(stage.print?.items?.every((item) => item.skillIds?.includes("M5-4.3-measure-angles"))).toBe(true);
    });
  });

  it("wiąże trzy poziomy samodzielnego pomiaru z końcową oceną", () => {
    const independent = m543KatomierzEkranowyV1.stages.at(-2)!;
    expect(independent.print?.items?.map((item) => item.id)).toEqual(["independent-support", "independent-core", "independent-challenge"]);
    expect(independent.print?.items?.map((item) => item.maxScore)).toEqual([1, 2, 2]);
    const assessment = m543KatomierzEkranowyV1.stages.at(-1)!;
    expect(assessment.understanding?.evidenceStageId).toBe(independent.id);
    expect(assessment.understanding?.evidenceItems.map((item) => item.id)).toEqual(independent.print?.items?.map((item) => item.id));
    expect(assessment.understanding?.evidenceItems.every((item) => item.skillIds.includes("M5-4.3-measure-angles"))).toBe(true);
    expect(assessment.understanding?.acceptedEvidenceSources).toEqual(["live", "self_paced", "paper_manual"]);
  });

  it("utrzymuje wspólny seed i model w snapshotach board/tablet/live/self-paced/print", () => {
    expect(lessonChannelContractIssues(m543KatomierzEkranowyV1)).toEqual([]);
    const snapshot = buildLessonSessionSnapshot(m543KatomierzEkranowyV1).stageSnapshot;
    m543KatomierzEkranowyV1.stages.forEach((source) => {
      const stage = snapshot.stages.find((candidate) => candidate.id === source.id)!;
      expect(stage.runtime).toEqual(source.runtime);
      if (source.board.modelId === "geometry-lab") {
        expect(stage).toMatchObject({
          modelId: "geometry-lab",
          studentModelId: "geometry-lab",
          modelSeed: source.board.modelSeed,
          studentModelSeed: source.board.modelSeed,
        });
        expect(Object.values(source.runtime!.channels).every((channel) => channel.enabled)).toBe(true);
      }
    });
  });
});
