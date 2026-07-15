/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m553DecimalLengthL1V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-03A — M5-5.3 długość L1", () => {
  it("ma nazwany pakiet, trace-0 i podstawę IV.6, XII.6, XII.7", () => {
    const lesson = m553DecimalLengthL1V1;
    expect(lesson.id).toBe("m5-5-3-dlugosc-zapis-dziesietny-l1-v1");
    expect(lesson.title).toBe("Długość i masa w zapisie dziesiętnym");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-3-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Długość i masa w zapisie dziesiętnym" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.6", "XII.6", "XII.7"]) {
      expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
    }
  });

  it("realizuje pełny pion długości L1 i kończy oceną umiejętności", () => {
    expect(m553DecimalLengthL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Miarka w czasie rzeczywistym",
      "2 m 35 cm = 2,35 m",
      "Nie przesuwamy przecinka bez sensu",
      "Szlak pomiarowy",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m553DecimalLengthL1V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m553DecimalLengthL1V1.estimatedMinutes).toBe(45);
    expect(m553DecimalLengthL1V1.teacherGuide.overview).toContain("L1 — długość");
  });

  it("używa istniejącego modelId i lokalnego adaptera w każdym kanale", () => {
    expect(lessonChannelContractIssues(m553DecimalLengthL1V1)).toEqual([]);
    const modelStages = m553DecimalLengthL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "realtime-ruler", "two-part-length", "unit-scale-length", "length-story", "independent-length",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.3-units-length-mass"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina trzy warianty samodzielne i trzyma klucz wyłącznie na serwerze", () => {
    const independent = m553DecimalLengthL1V1.stages.find((stage) => stage.id.endsWith("-independent-length"))!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([553102, 553107, 553105]);
    expect(independent.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);

    const built = buildLessonSessionSnapshot(m553DecimalLengthL1V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent-length"))!;
    expect(snapshotStage.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L1");
  });

  it("drukuje realistyczne warianty z jawnymi jednostkami bez kontrolek", () => {
    const independent = m553DecimalLengthL1V1.stages.find((stage) => stage.id.endsWith("-independent-length"))!;
    const { container } = render(<LessonPrintWorksheet title={independent.print!.worksheetTitle} instructions={independent.print!.instructions} items={independent.print!.items ?? []} />);
    expect(screen.getByText("850 cm = … m")).toBeInTheDocument();
    expect(screen.getByText("4,05 m = … cm")).toBeInTheDocument();
    expect(screen.getByText("1,275 km = … m")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
