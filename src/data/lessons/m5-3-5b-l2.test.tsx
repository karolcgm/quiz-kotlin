/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m535LiczbyMieszaneL2V1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-05B — M5-3.5 L2", () => {
  it("jest osobnym L2 z dokładnym trace-0, pełną podstawą V.1 i czasem 45 minut", () => {
    const lesson = m535LiczbyMieszaneL2V1;
    expect(lesson.id).toBe("m5-3-5-liczby-mieszane-l2-v1");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków o jednakowych mianownikach");
    expect(lesson.estimatedMinutes).toBe(45);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-5-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])))).toEqual(new Set(["V.1"]));
    expect(lesson.learningGoals.map((goal) => goal.id)).toEqual([
      "m5-3-5-goal-1",
      "m5-3-5-goal-2",
      "m5-3-5-goal-3",
      "m5-3-5-goal-4",
    ]);
  });

  it("ma pięć etapów L2, dokładną zamianę 4 3/8 i końcową Ocenę umiejętności", () => {
    expect(m535LiczbyMieszaneL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Działania na liczbach mieszanych",
      "Zamień jedną całość",
      "Inteligentny zapis pionowy",
      "Piekarnia na festyn",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m535LiczbyMieszaneL2V1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
    expect(JSON.stringify(m535LiczbyMieszaneL2V1.stages)).toContain("4 3/8 − 1 5/8");
    expect(JSON.stringify(m535LiczbyMieszaneL2V1.stages)).toContain("3 11/8");
    expect(m535LiczbyMieszaneL2V1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
  });

  it("spina tablicę, tablet, Live i druk bez błędów kanałów", () => {
    expect(lessonChannelContractIssues(m535LiczbyMieszaneL2V1)).toEqual([]);
    for (const stage of m535LiczbyMieszaneL2V1.stages.slice(1, 6)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.answerLayout === "fraction-stack")).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma warianty support/core/challenge, feedback zamiany i snapshot bez answerSpec", () => {
    const independent = m535LiczbyMieszaneL2V1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([35520, 35523, 35525]);
    for (const question of independent.questions) {
      expect(question.generatorId).toBe("fraction-lesson-l1-v1");
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining(["FRA_BORROW_WHOLE", "FRA_UNSIMPLIFIED_RESULT"]));
      expect(question.feedbackPolicy).toMatchObject({ allowsPartialCredit: true, manualReview: "possible" });
    }
    const snapshot = buildLessonSessionSnapshot(m535LiczbyMieszaneL2V1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(5);
  });

  it("renderuje lokalny adapter na tablicy, tablecie i Live oraz pionowe kratki w druku", () => {
    const stage = m535LiczbyMieszaneL2V1.stages.find((item) => item.title === "Zamień jedną całość")!;
    const board = render(<LessonStageView lessonId={m535LiczbyMieszaneL2V1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-same-denominator-mixed-l2][data-fraction-activity='mixed-same-denom-borrow-pizza']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m535LiczbyMieszaneL2V1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-same-denominator-mixed-l2]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m535LiczbyMieszaneL2V1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Zamień jedną całość")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={2} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-same-denominator-mixed-l2]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m535LiczbyMieszaneL2V1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
