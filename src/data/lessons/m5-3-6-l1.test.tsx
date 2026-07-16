/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m536WspolnaMiaraV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-06A — M5-3.6 L1", () => {
  it("ma oficjalną nazwę, numer L1, podstawę IV.4 i V.1 oraz cztery cele", () => {
    const lesson = m536WspolnaMiaraV1;
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków o różnych mianownikach");
    expect(lesson.estimatedMinutes).toBe(45);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-6-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals).toHaveLength(4);
    expect(new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])))).toEqual(new Set(["IV.4", "V.1"]));
    expect(lesson.successCriteria).toHaveLength(4);
  });

  it("realizuje pięć dedykowanych etapów i kończy slajdem oceny ucznia", () => {
    expect(m536WspolnaMiaraV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Czy można już połączyć porcje?",
      "Zmień skalę, nie poziom wody",
      "Przelej wspólne części",
      "Inteligentny zapis w czterech wierszach",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m536WspolnaMiaraV1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
    expect(m536WspolnaMiaraV1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
  });

  it("spina tablicę, tablet, Live i druk z tym samym zestawem umiejętności", () => {
    expect(lessonChannelContractIssues(m536WspolnaMiaraV1)).toEqual([]);
    for (const stage of m536WspolnaMiaraV1.stages.slice(1, 6)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.answerLayout === "fraction-stack")).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma trzy deterministyczne poziomy, diagnostykę i snapshot bez answerSpec", () => {
    const independent = m536WspolnaMiaraV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([536101, 536102, 536103]);
    for (const question of independent.questions) {
      expect(question.generatorId).toBe("fraction-lesson-l1-v1");
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining([
        "FRA_NO_COMMON_DENOMINATOR",
        "FRA_ONE_FRACTION_EXTENDED",
        "FRA_DIFFERENT_EXTENSION_FACTORS",
        "FRA_DENOM_ADDED",
        "FRA_NOT_SIMPLIFIED",
      ]));
    }
    const snapshot = buildLessonSessionSnapshot(m536WspolnaMiaraV1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(9);
  });

  it("renderuje dedykowany model na tablicy, tablecie i Live oraz kratki w druku", () => {
    const stage = m536WspolnaMiaraV1.stages.find((item) => item.title === "Zmień skalę, nie poziom wody")!;
    const board = render(<LessonStageView lessonId={m536WspolnaMiaraV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-different-denominator-measure][data-fraction-activity='different-denom-glasses-twelfths']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m536WspolnaMiaraV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-different-denominator-measure]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m536WspolnaMiaraV1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Ćwiczenia — 5 przykładów")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={0} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-different-denominator-measure][data-fraction-activity='different-denom-independent']")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m536WspolnaMiaraV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
