import { describe, expect, it } from "vitest";
import { section3LessonsWpC3 } from "@/data/lessons/section3-wp-c3";
import { section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import {
  buildUnderstandingAssessment,
  paperResultItemsToUnderstandingEvidence,
} from "@/lib/lessons/understandingAssessment";

const published = [
  ...section3LessonsWpC3,
  ...section4LessonsWpC4,
  ...section5LessonsWpC5,
].filter((lesson) => lesson.status === "published");

describe("WP-CONTEXT-02 — końcowa ocena umiejętności działów 3–5", () => {
  it("umieszcza dokładnie jeden etap understanding na końcu każdego pakietu", () => {
    expect(published.length).toBeGreaterThan(0);
    expect(new Set(published.map((lesson) => lesson.id)).size).toBe(published.length);
    expect(new Set(published.map((lesson) => lesson.sectionId))).toEqual(
      new Set(["M5-S3", "M5-S4", "M5-S5"]),
    );

    for (const lesson of published) {
      const understandingStages = lesson.stages.filter(
        (stage) => stage.kind === "understanding" || stage.id.endsWith("-understanding"),
      );
      const finalStage = lesson.stages.at(-1)!;

      expect(understandingStages, lesson.id).toHaveLength(1);
      expect(finalStage, lesson.id).toBe(understandingStages[0]);
      expect(finalStage.kind, lesson.id).toBe("understanding");
      expect(finalStage.id, lesson.id).toMatch(/-understanding$/);
      expect(finalStage.title, lesson.id).toBe("Ocena umiejętności");
      expect(finalStage.board.headline, lesson.id).toBe("Ocena ucznia — co już potrafię?");
      expect(finalStage.live, lesson.id).toMatchObject({ enabled: true, kind: "quick-check" });
      expect(finalStage.understanding, lesson.id).toMatchObject({
        acceptedEvidenceSources: ["live", "self_paced", "paper_manual"],
        selfAssessmentAffectsScore: false,
      });
      expect(finalStage.understanding!.criteria.length, lesson.id).toBeGreaterThan(0);
      expect(finalStage.understanding!.criteria.every((criterion) => lesson.skillIds.includes(criterion.skillId)), lesson.id).toBe(true);
      expect(finalStage.print?.worksheetTitle, lesson.id).toBe("Ocena umiejętności");

      const evidenceIndex = lesson.stages.findIndex(
        (stage) => stage.id === finalStage.understanding!.evidenceStageId,
      );
      expect(evidenceIndex, lesson.id).toBeGreaterThanOrEqual(0);
      expect(evidenceIndex, lesson.id).toBeLessThan(lesson.stages.length - 1);
    }
  });

  it("zachowuje ten sam ostatni kontrakt w snapshotach live/ucznia/tablicy", () => {
    for (const lesson of published) {
      const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot;
      const finalStage = snapshot.stages.at(-1)!;
      expect(snapshot.stages.filter((stage) => stage.kind === "understanding"), lesson.id).toHaveLength(1);
      expect(finalStage.title, lesson.id).toBe("Ocena umiejętności");
      expect(finalStage.liveKind, lesson.id).toBe("quick-check");
      expect(finalStage.understanding?.criteria, lesson.id).toEqual(lesson.stages.at(-1)!.understanding?.criteria);
    }
  });

  it("mapuje ręcznie wpisany wynik papierowy do skillId bez udziału samooceny w punktach", () => {
    const config = published[0]!.stages.at(-1)!.understanding!;
    const skillId = config.criteria[0]!.skillId;
    const evidence = paperResultItemsToUnderstandingEvidence([
      { slotId: "paper-1", skillId, score: 1, maxScore: 2 },
    ]);
    const assessment = buildUnderstandingAssessment(config, evidence);

    expect(assessment).toMatchObject({ source: "paper_manual", score: 1, maxScore: 2 });
    expect(assessment.criteria[0]?.status).toBe("needs_work");
    expect(config.selfAssessmentAffectsScore).toBe(false);
  });
});
