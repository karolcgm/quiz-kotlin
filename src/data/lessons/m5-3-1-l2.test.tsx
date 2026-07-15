/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m531UlamkiMieszaneL2V1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-01B — pakiet Ułamki i liczby mieszane L2", () => {
  it("jest osobnym pakietem L2 z celami 2–4 i kodami IV.1, IV.5, IV.7", () => {
    const lesson = m531UlamkiMieszaneL2V1;
    expect(lesson.id).toBe("m5-3-1-ulamki-liczby-mieszane-l2-v1");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.title).toBe("Ułamki i liczby mieszane");
    expect(lesson.learningGoals.map((goal) => goal.id)).toEqual(["m5-3-1-goal-2", "m5-3-1-goal-3", "m5-3-1-goal-4"]);
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])));
    expect(codes).toEqual(new Set(["IV.1", "IV.5", "IV.7"]));
  });

  it("ma pełną sekwencję, samodzielną próbę i jedną końcową Ocenę umiejętności", () => {
    expect(m531UlamkiMieszaneL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Więcej niż jedna pizza",
      "Zgrupuj pełne całości",
      "Zamiana w obie strony",
      "Oś liczb mieszanych",
      "Piknik klasowy",
      "Samodzielna próba",
      "Ocena umiejętności",
    ]);
    expect(m531UlamkiMieszaneL2V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m531UlamkiMieszaneL2V1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
  });

  it("używa jednego modelu i tych samych skillIds na tablicy, tablecie, Live i papierze", () => {
    expect(lessonChannelContractIssues(m531UlamkiMieszaneL2V1)).toEqual([]);
    for (const stage of m531UlamkiMieszaneL2V1.stages.slice(1, 7)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma trzy deterministyczne warianty, FRA_MIXED_CONVERSION i publiczny snapshot bez answerSpec", () => {
    const independent = m531UlamkiMieszaneL2V1.stages.find((stage) => stage.title === "Samodzielna próba")!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([31200, 31202, 31214]);
    expect(independent.questions.every((question) => question.feedbackPolicy?.feedbackKeys.includes("FRA_MIXED_CONVERSION"))).toBe(true);
    expect(independent.questions.every((question) => question.feedbackPolicy?.allowsPartialCredit)).toBe(true);
    const built = buildLessonSessionSnapshot(m531UlamkiMieszaneL2V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions).toHaveLength(3);
  });

  it("renderuje sekcyjny model L2 na tablicy, tablecie i Live oraz układ ułamkowy w druku", () => {
    const stage = m531UlamkiMieszaneL2V1.stages.find((item) => item.title === "Więcej niż jedna pizza")!;
    const board = render(<LessonStageView lessonId={m531UlamkiMieszaneL2V1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-lesson-l2]")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m531UlamkiMieszaneL2V1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-lesson-l2]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m531UlamkiMieszaneL2V1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Więcej niż jedna pizza")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={1} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-lesson-l2]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m531UlamkiMieszaneL2V1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
