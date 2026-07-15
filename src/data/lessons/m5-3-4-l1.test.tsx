/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m534NalozPaskiV1 } from "@/data/lessons/section3-wp-c3";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

afterEach(cleanup);

describe("WP-S3-04 — pakiet Porównywanie ułamków L1", () => {
  it("ma dokładną nazwę, pełny slajd 0, właściwą podstawę i 45 minut", () => {
    const lesson = m534NalozPaskiV1;
    expect(lesson.id).toBe("m5-3-4-naloz-paski-v1");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.title).toBe("Porównywanie ułamków");
    expect(lesson.estimatedMinutes).toBe(45);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-3-4-trace-0", title: "Cele lekcji (slajd 0)" });
    expect(lesson.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się porównywać ułamki na modelu i osi liczbowej.",
      "Nauczę się porównywać ułamki przez wspólny mianownik lub licznik.",
      "Nauczę się korzystać z odniesienia do jednej drugiej i jedności.",
      "Nauczę się uzasadniać wybraną strategię.",
    ]);
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences.map((reference) => reference.split(" — ")[0])));
    expect(codes).toEqual(new Set(["IV.4", "IV.12", "V.3 (strategia rozszerzająca)"]));
  });

  it("ma wszystkie historie, samodzielną próbę i końcową Ocenę umiejętności", () => {
    expect(m534NalozPaskiV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Nałóż paski",
      "Wspólna oś",
      "Która strategia jest najkrótsza?",
      "Pułapka większego mianownika",
      "Wyścig dronów",
      "Ćwiczenia — 5 przykładów",
      "Ocena umiejętności",
    ]);
    expect(m534NalozPaskiV1.stages.at(-1)).toMatchObject({ title: "Ocena umiejętności", live: { kind: "quick-check" } });
    expect(m534NalozPaskiV1.teacherGuide.commonMisconceptions).toEqual(expect.arrayContaining([
      expect.stringMatching(/całości różnej wielkości/u),
      expect.stringMatching(/większym mianownikiem/u),
      expect.stringMatching(/znaku porównania/u),
    ]));
  });

  it("spina model, tablet, Live i druk osi lub pionowego zapisu bez błędów kontraktu kanałów", () => {
    expect(lessonChannelContractIssues(m534NalozPaskiV1)).toEqual([]);
    for (const stage of m534NalozPaskiV1.stages.slice(1, 7)) {
      expect(stage.board.modelId).toBe("fraction-lesson");
      expect(stage.student?.modelId).toBe("fraction-lesson");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.print?.items?.every((item) => ["fraction-stack", "fraction-axis"].includes(item.answerLayout!))).toBe(true);
      expect(stage.runtime?.channels.board.skillIds).toEqual(stage.runtime?.channels.tablet.skillIds);
      expect(stage.runtime?.channels.live.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    }
  });

  it("ma trzy deterministyczne warianty, pełny feedback i publiczny snapshot bez answerSpec", () => {
    const independent = m534NalozPaskiV1.stages.find((stage) => stage.title === "Ćwiczenia — 5 przykładów")!;
    expect(independent.questions).toHaveLength(5);
    expect(independent.questions.slice(0, 3).map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.slice(0, 3).map((question) => question.seed)).toEqual([34401, 34402, 34403]);
    for (const question of independent.questions) {
      expect(question.generatorId).toBe("fraction-lesson-l1-v1");
      expect(question.feedbackPolicy?.feedbackKeys).toEqual(expect.arrayContaining([
        "FRA_WHOLE_MISMATCH",
        "FRA_COMPARISON_WRONG_SIGN",
        "FRA_COMPARISON_JUSTIFICATION",
        "FRA_COMPARISON_ORDER",
      ]));
      expect(question.feedbackPolicy).toMatchObject({ allowsPartialCredit: true, manualReview: "possible" });
    }
    const snapshot = buildLessonSessionSnapshot(m534NalozPaskiV1);
    expect(JSON.stringify(snapshot.stageSnapshot)).not.toContain("answerSpec");
    expect(snapshot.answerKey.questions).toHaveLength(5);
  });

  it("renderuje lokalny adapter na tablicy, tablecie i Live oraz właściwy arkusz w druku", () => {
    const stage = m534NalozPaskiV1.stages.find((item) => item.title === "Wspólna oś")!;
    const board = render(<LessonStageView lessonId={m534NalozPaskiV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(board.container.querySelector("[data-fraction-comparison-l1][data-fraction-activity='common-axis']")).toBeInTheDocument();
    cleanup();
    const tablet = render(<LessonStageView lessonId={m534NalozPaskiV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(tablet.container.querySelector("[data-fraction-comparison-l1]")).toBeInTheDocument();
    cleanup();
    const snapshot = buildLessonSessionSnapshot(m534NalozPaskiV1).stageSnapshot;
    const liveStage = snapshot.stages.find((item) => item.title === "Wspólna oś")!;
    const live = render(<BoardStageDisplay stage={liveStage} stageIndex={2} stageCount={snapshot.stages.length} solutionRevealed={false} />);
    expect(live.container.querySelector("[data-fraction-comparison-l1]")).toBeInTheDocument();
    cleanup();
    const print = render(<LessonStageView lessonId={m534NalozPaskiV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(print.container.querySelector("[data-fraction-axis-answer]")).toBeInTheDocument();
  });
});
