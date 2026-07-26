/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m536RozneMianownikiL2V1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-06B — M5-3.6 L2", () => {
  it("jest osobnym L2 z oficjalną nazwą i podstawą IV.4 oraz V.1", () => {
    const lesson = m536RozneMianownikiL2V1;
    expect(lesson.id).toBe("m5-3-6-rozne-mianowniki-l2-v1");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków o różnych mianownikach");
    expect(lesson.estimatedMinutes).toBe(61);
    expect(new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])))).toEqual(new Set(["IV.4", "V.1"]));
  });

  it("ma etapy L2 i końcową Ocenę umiejętności", () => {
    expect(m536RozneMianownikiL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Dodawanie o różnych mianownikach",
      "Odejmowanie o różnych mianownikach",
      "Mikstura dla szklarni",
      "Napraw rozwiązanie",
      "Kosz z jabłkami",
      "Dodawanie i odejmowanie ułamków o różnych mianownikach",
      "Ocena umiejętności",
    ]);
    expect(m536RozneMianownikiL2V1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(66);
    expect(m536RozneMianownikiL2V1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
    expect(JSON.stringify(m536RozneMianownikiL2V1.stages)).toContain("2/3 + 1/4 = 3/7");
  });

  it("spina tablicę, tablet, Live i druk oraz zachowuje skillIds", () => {
    expect(lessonChannelContractIssues(m536RozneMianownikiL2V1)).toEqual([]);
    for (const stage of m536RozneMianownikiL2V1.stages.slice(1, 6)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.every((item) => item.answerLayout === "fraction-stack")).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma piętnaście przykładów, pełną diagnostykę i publiczny snapshot bez answerSpec", () => {
    const independent = m536RozneMianownikiL2V1.stages.find((stage) => stage.title === "Dodawanie i odejmowanie ułamków o różnych mianownikach")!;
    expect(independent.questions).toHaveLength(15);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([536201, 536202, 536203]);
    expect(independent.questions.map((question) => question.difficulty)).toEqual(Array.from({ length: 15 }, () => "challenge"));
    for (const question of independent.questions) {
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining(["FRA_MIXED_NUMBER_ERROR", "FRA_WHOLE_ASSESSMENT", "FRA_REPAIR_STEP", "FRA_DENOM_ADDED"]));
    }
    const snapshot = buildLessonSessionSnapshot(m536RozneMianownikiL2V1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(20);
  });

  it("renderuje adapter L2 na tablicy, tablecie, Live i pionowe kratki w druku", () => {
    const stage = m536RozneMianownikiL2V1.stages.find((item) => item.title === "Mikstura dla szklarni")!;
    const board = render(<LessonStageView lessonId={m536RozneMianownikiL2V1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-different-denominator-advanced][data-fraction-activity='different-denom-l2-greenhouse']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m536RozneMianownikiL2V1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-different-denominator-advanced]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m536RozneMianownikiL2V1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Dodawanie i odejmowanie ułamków o różnych mianownikach")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={0} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-different-denominator-advanced][data-fraction-activity='different-denom-l2-independent']")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m536RozneMianownikiL2V1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
