import { describe, expect, it } from "vitest";
import { section3LessonsWpC3 } from "@/data/lessons/section3-wp-c3";
import { section4LessonsWpC4 } from "@/data/lessons/section4-wp-c4";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import type { LessonRuntimeChannel } from "@/types/lessonRuntime";

const packages = [...section3LessonsWpC3, ...section4LessonsWpC4, ...section5LessonsWpC5]
  .filter((lesson) => lesson.status === "published");
const channels: LessonRuntimeChannel[] = ["board", "tablet", "live", "self_paced", "print"];

describe("WP-CONTEXT-04 — kontrakt kanałów działów 3–5", () => {
  it.each(packages.map((lesson) => [lesson.id, lesson] as const))(
    "%s używa jednego stateKey i tych samych skillIds we wszystkich kanałach",
    (_id, lesson) => {
      expect(lessonChannelContractIssues(lesson)).toEqual([]);
      lesson.stages.forEach((stage) => {
        const runtime = stage.runtime;
        expect(runtime).toBeDefined();
        expect(runtime?.stateKey).toBe(`${lesson.id}@${lesson.version}:${stage.id}`);
        channels.forEach((channel) => {
          expect(runtime?.channels[channel].skillIds).toEqual(runtime?.skillIds);
        });
        expect(runtime?.state).toEqual({
          sourceOfTruth: "stage-snapshot",
          persistDraftLocally: true,
          retrySubmission: "idempotent-client-attempt",
        });
      });
    },
  );

  it.each(packages.map((lesson) => [lesson.id, lesson] as const))(
    "%s zachowuje runtime w publicznym snapshotcie live/self-paced",
    (_id, lesson) => {
      const { stageSnapshot } = buildLessonSessionSnapshot(lesson);
      stageSnapshot.stages.forEach((snapshotStage) => {
        const sourceStage = lesson.stages.find((stage) => stage.id === snapshotStage.id);
        expect(snapshotStage.runtime).toEqual(sourceStage?.runtime);
      });
    },
  );
});
