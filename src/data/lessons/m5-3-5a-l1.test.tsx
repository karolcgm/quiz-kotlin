/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m535LaczCzesciV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-05A — M5-3.5 L1", () => {
  it("ma dokładny trace-0, wyłącznie podstawę V.1, 45 minut i nie zawiera celu liczb mieszanych", () => {
    const lesson = m535LaczCzesciV1;
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków o jednakowych mianownikach");
    expect(lesson.estimatedMinutes).toBe(45);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-5-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się dodawać ułamki o jednakowych mianownikach.",
      "Nauczę się odejmować ułamki o jednakowych mianownikach.",
      "Nauczę się sprawdzać i upraszczać wynik.",
    ]);
    expect(new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])))).toEqual(new Set(["V.1"]));
    expect(JSON.stringify(lesson.stages)).not.toMatch(/liczb(?:y|ami) mieszany|pożyczani|4 3\/8/u);
  });

  it("ma pięć etapów L1 i końcową Ocenę umiejętności", () => {
    expect(m535LaczCzesciV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Pizza — łączymy takie same kawałki",
      "Dlaczego mianownik się nie zmienia?",
      "Odejmij, odkładając kawałki",
      "Piekarnia na festyn",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m535LaczCzesciV1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
    expect(m535LaczCzesciV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
  });

  it("spina tablicę, tablet, Live i druk pionowego zapisu bez błędów kanałów", () => {
    expect(lessonChannelContractIssues(m535LaczCzesciV1)).toEqual([]);
    for (const stage of m535LaczCzesciV1.stages.slice(1, 6)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.answerLayout === "fraction-stack")).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma trzy warianty, wymagany feedback i snapshot bez answerSpec", () => {
    const independent = m535LaczCzesciV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([35501, 35502, 35503]);
    for (const question of independent.questions) {
      expect(question.generatorId).toBe("fraction-lesson-l1-v1");
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining(["FRA_DENOM_ADDED", "FRA_UNSIMPLIFIED_RESULT"]));
      expect(question.feedbackPolicy).toMatchObject({ allowsPartialCredit: true, manualReview: "possible" });
    }
    const snapshot = buildLessonSessionSnapshot(m535LaczCzesciV1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(5);
  });

  it("renderuje lokalny adapter na tablicy, tablecie i Live oraz pionowe kratki w druku", () => {
    const stage = m535LaczCzesciV1.stages.find((item) => item.title === "Dlaczego mianownik się nie zmienia?")!;
    const board = render(<LessonStageView lessonId={m535LaczCzesciV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-same-denominator-l1][data-fraction-activity='same-denom-rule']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m535LaczCzesciV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-same-denominator-l1]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m535LaczCzesciV1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Dlaczego mianownik się nie zmienia?")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={2} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-same-denominator-l1]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m535LaczCzesciV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
