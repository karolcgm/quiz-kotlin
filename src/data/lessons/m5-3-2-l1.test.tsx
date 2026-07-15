/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m532PodzielSprawiedliwieV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-02 — pakiet Ułamek jako iloraz L1", () => {
  it("ma oficjalną nazwę, trace-0, trzy cele i wyłącznie podstawę IV.2", () => {
    const lesson = m532PodzielSprawiedliwieV1;
    expect(lesson.id).toBe("m5-3-2-podziel-sprawiedliwie-v1");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.title).toBe("Ułamek jako iloraz");
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-2-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals).toHaveLength(3);
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])));
    expect(codes).toEqual(new Set(["IV.2"]));
  });

  it("ma pełną sekwencję po trace-0, samodzielną próbę i końcową Ocenę umiejętności", () => {
    expect(m532PodzielSprawiedliwieV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Podziel koła na połówki",
      "Przedstaw iloraz w postaci ułamka",
      "Całości jako ułamki",
      "Ułamek niewłaściwy na liczbę mieszaną",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m532PodzielSprawiedliwieV1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m532PodzielSprawiedliwieV1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
  });

  it("używa fraction-lesson i tych samych umiejętności na tablicy, tablecie, Live i papierze", () => {
    expect(lessonChannelContractIssues(m532PodzielSprawiedliwieV1)).toEqual([]);
    for (const stage of m532PodzielSprawiedliwieV1.stages.slice(1, -1)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma trzy deterministyczne warianty, cztery wymagane diagnozy i snapshot bez answerSpec", () => {
    const independent = m532PodzielSprawiedliwieV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([32300, 32301, 32302]);
    for (const question of independent.questions) {
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining([
        "FRA_QUOTIENT_ORDER",
        "FRA_UNEQUAL_SHARING",
        "FRA_UNUSED_PARTS",
        "FRA_ZERO_DENOMINATOR",
      ]));
      expect(question.feedbackPolicy?.allowsPartialCredit).toBe(true);
      expect(question.feedbackPolicy?.manualReview).toBe("possible");
    }
    const snapshot = buildLessonSessionSnapshot(m532PodzielSprawiedliwieV1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(5);
  });

  it("renderuje lokalny model na tablicy, tablecie i Live oraz pionowy zapis w druku", () => {
    const stage = m532PodzielSprawiedliwieV1.stages.find((item) => item.title === "Podziel koła na połówki")!;
    const board = render(<LessonStageView lessonId={m532PodzielSprawiedliwieV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m532PodzielSprawiedliwieV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m532PodzielSprawiedliwieV1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Podziel koła na połówki")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={1} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m532PodzielSprawiedliwieV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
