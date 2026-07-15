/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m552DecimalComparisonL1V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-02 — M5-5.2 L1", () => {
  it("ma nazwany pakiet, trace-0 z nazwą matematyczną i podstawą IV.7, IV.12", () => {
    const lesson = m552DecimalComparisonL1V1;
    expect(lesson.id).toBe("m5-5-2-wyrownaj-miejsca-l1-v1");
    expect(lesson.title).toBe("Porównywanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-2-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Porównywanie ułamków dziesiętnych" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.7", "IV.12"]) {
      expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
    }
  });

  it("realizuje dokładnie pięć slajdów planu i końcową ocenę umiejętności", () => {
    expect(m552DecimalComparisonL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Wyrównaj miejsca",
      "Porównuj od lewej",
      "Ta sama oś",
      "Pułapka liczby cyfr",
      "Ranking skoków robotów",
      "Ocena umiejętności",
    ]);
    expect(m552DecimalComparisonL1V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m552DecimalComparisonL1V1.estimatedMinutes).toBe(45);
  });

  it("używa istniejącego modelId i lokalnego adaptera we wszystkich kanałach", () => {
    expect(lessonChannelContractIssues(m552DecimalComparisonL1V1)).toEqual([]);
    const modelStages = m552DecimalComparisonL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "align-places", "compare-left", "shared-axis", "digit-traps", "robot-ranking",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.2-compare-decimals"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina trzy warianty rankingu i trzyma klucz wyłącznie po stronie serwera", () => {
    const ranking = m552DecimalComparisonL1V1.stages.find((stage) => stage.id.endsWith("-robot-ranking"))!;
    expect(ranking.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(ranking.questions.map((question) => question.seed)).toEqual([552102, 552107, 552105]);
    expect(ranking.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);

    const built = buildLessonSessionSnapshot(m552DecimalComparisonL1V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-robot-ranking"))!;
    expect(snapshotStage.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L1");
  });

  it("drukuje ranking i uzasadnienie bez kontrolek interaktywnych", () => {
    const ranking = m552DecimalComparisonL1V1.stages.find((stage) => stage.id.endsWith("-robot-ranking"))!;
    const { container } = render(<LessonPrintWorksheet title={ranking.print!.worksheetTitle} instructions={ranking.print!.instructions} items={ranking.print!.items ?? []} />);
    expect(screen.getByText(/Bolt 1,05 m/u)).toBeInTheDocument();
    expect(screen.getByText(/Piksel 1,18 m/u)).toBeInTheDocument();
    expect(screen.getByText(/Nova 0,899 m/u)).toBeInTheDocument();
    expect(container.querySelector("button, input, textarea, [role='slider']")).toBeNull();
  });
});
