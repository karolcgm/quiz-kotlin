/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m531JednaCaloscV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-01A — pakiet Ułamki i liczby mieszane L1", () => {
  it("ma na slajdzie 0 wyłącznie cele 1 i 4 oraz pełne odniesienia IV.1, IV.5, IV.7", () => {
    const lesson = m531JednaCaloscV1;
    expect(lesson.id).toBe("m5-3-1-ulamki-liczby-mieszane-l1-v1");
    expect(lesson.title).toBe("Ułamki i liczby mieszane");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-1-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals.map((goal) => goal.id)).toEqual(["m5-3-1-goal-1", "m5-3-1-goal-4"]);
    expect(lesson.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się opisywać część całości za pomocą ułamka.",
      "Nauczę się zaznaczać ułamki na osi liczbowej.",
    ]);
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])));
    expect(codes).toEqual(new Set(["IV.1", "IV.5", "IV.7"]));
  });

  it("ma zwięzłą sekwencję modeli, pięć ćwiczeń i jedną Ocenę umiejętności", () => {
    expect(m531JednaCaloscV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Co mówi ułamek?",
      "Podpisz ułamki na osi",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m531JednaCaloscV1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m531JednaCaloscV1.stages.slice(1, -1).every((stage) => stage.board.modelId === "fraction-lesson")).toBe(true);
  });

  it("ma deterministyczne pytania support/core/challenge oraz publiczny snapshot bez answerSpec", () => {
    const independent = m531JednaCaloscV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([31100, 31101, 31102]);
    expect(independent.questions.every((question) => question.generatorId === "fraction-lesson-l1-v1")).toBe(true);
    expect(independent.questions.every((question) => question.feedbackPolicy?.feedbackKeys.includes("FRA_UNEQUAL_PARTS"))).toBe(true);
    expect(independent.questions.every((question) => question.feedbackPolicy?.feedbackKeys.includes("FRA_WHOLE_MISMATCH"))).toBe(true);

    const built = buildLessonSessionSnapshot(m531JednaCaloscV1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions).toHaveLength(7);
    expect(built.answerKey.questions.every((question) => Boolean(question.answerSpec))).toBe(true);
    expect(built.stageSnapshot.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")?.questions.slice(0, 3).map((question) => question.seed)).toEqual([31100, 31101, 31102]);
  });

  it("utrzymuje jeden kontrakt skillIds w board/tablet/live/self-paced/print", () => {
    expect(lessonChannelContractIssues(m531JednaCaloscV1)).toEqual([]);
    for (const stage of m531JednaCaloscV1.stages.slice(1, -1)) {
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.live).toMatchObject({ enabled: true });
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.skillIds?.every((skillId) => m531JednaCaloscV1.skillIds.includes(skillId)))).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("renderuje wspólny model na tablicy, tablecie, Live i pionowy zapis w druku", () => {
    const modelStage = m531JednaCaloscV1.stages.find((stage) => stage.title === "Co mówi ułamek?")!;
    const board = render(<LessonStageView lessonId={m531JednaCaloscV1.id} stage={modelStage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();

    const tablet = render(<LessonStageView lessonId={m531JednaCaloscV1.id} stage={modelStage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();

    const snapshot = buildLessonSessionSnapshot(m531JednaCaloscV1).stageSnapshot;
    const liveStage = snapshot.stages.find((stage) => stage.title === "Co mówi ułamek?")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={2} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-topic-intro]")).toBeInTheDocument();
    cleanup();

    const print = render(<LessonStageView lessonId={m531JednaCaloscV1.id} stage={modelStage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
