/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m533TaSamaCzescV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-03 — pakiet Skracanie i rozszerzanie ułamków L1", () => {
  it("ma dokładną nazwę, pełny slajd 0, IV.3 i 45 minut", () => {
    const lesson = m533TaSamaCzescV1;
    expect(lesson.id).toBe("m5-3-3-ta-sama-czesc-v1");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.title).toBe("Skracanie i rozszerzanie ułamków");
    expect(lesson.estimatedMinutes).toBe(45);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-3-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się rozszerzać ułamki przez tę samą liczbę.",
      "Nauczę się skracać ułamki przez wspólny dzielnik.",
      "Nauczę się rozpoznawać ułamki o tej samej wartości.",
      "Nauczę się doprowadzać ułamek do postaci nieskracalnej.",
    ]);
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])));
    expect(codes).toEqual(new Set(["IV.3"]));
  });

  it("ma wszystkie historie, samodzielną próbę i końcową Ocenę umiejętności", () => {
    expect(m533TaSamaCzescV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Ta sama część, gęstszy podział",
      "Rozszerzanie w kratkach",
      "Zwiń podział",
      "Przekreśl i zapisz",
      "Łańcuch równoważnych ułamków",
      "Laboratorium mozaiki",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m533TaSamaCzescV1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
    expect(m533TaSamaCzescV1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
  });

  it("spina model, tablet, Live i pionowy druk bez błędów kontraktu kanałów", () => {
    expect(lessonChannelContractIssues(m533TaSamaCzescV1)).toEqual([]);
    for (const stage of m533TaSamaCzescV1.stages.slice(1, 8)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => item.answerLayout === "fraction-stack")).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma deterministyczne warianty, pełny feedback i publiczny snapshot bez answerSpec", () => {
    const independent = m533TaSamaCzescV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([33301, 33302, 33303]);
    for (const question of independent.questions) {
      expect(question.generatorId).toBe("fraction-lesson-l1-v1");
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining([
        "FRA_DIFFERENT_FACTORS",
        "FRA_ONE_SIDED_OPERATION",
        "FRA_NON_INTEGER_DIVISOR",
        "FRA_NOT_SIMPLIFIED",
      ]));
      expect(question.feedbackPolicy).toMatchObject({ allowsPartialCredit: true, manualReview: "possible" });
    }
    const snapshot = buildLessonSessionSnapshot(m533TaSamaCzescV1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(5);
  });

  it("renderuje lokalny adapter na tablicy, tablecie i Live oraz kratki pionowego zapisu w druku", () => {
    const stage = m533TaSamaCzescV1.stages.find((item) => item.title === "Rozszerzanie w kratkach")!;
    const board = render(<LessonStageView lessonId={m533TaSamaCzescV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-equivalence-lesson][data-fraction-activity='expansion-grid']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m533TaSamaCzescV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-equivalence-lesson]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m533TaSamaCzescV1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Rozszerzanie w kratkach")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={2} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-equivalence-lesson]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m533TaSamaCzescV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-stack-answer]")).toBeInTheDocument();
  });
});
