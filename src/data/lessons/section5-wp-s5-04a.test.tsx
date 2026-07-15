/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m554DecimalAddSubL1V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-04A — M5-5.4 modele i zapis pisemny L1", () => {
  it("ma nazwany pakiet, osobny trace-0, cztery cele i podstawę V.2 oraz V.6", () => {
    const lesson = m554DecimalAddSubL1V1;
    expect(lesson.id).toBe("m5-5-4-dodawanie-odejmowanie-pisemne-l1-v1");
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.learningGoals).toHaveLength(4);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-4-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Dodawanie i odejmowanie ułamków dziesiętnych" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(new Set(references.map((reference) => reference.split(" — ")[0]))).toEqual(new Set(["V.2", "V.6"]));
  });

  it("realizuje wyłącznie pion L1 i kończy Oceną umiejętności", () => {
    expect(m554DecimalAddSubL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Kolumny przecinków",
      "Dodawanie kolumna po kolumnie",
      "Odejmowanie bez pożyczania",
      "Napraw przesunięty przecinek",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m554DecimalAddSubL1V1.estimatedMinutes).toBe(45);
    expect(m554DecimalAddSubL1V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    const serialized = JSON.stringify(m554DecimalAddSubL1V1).toLocaleLowerCase("pl-PL");
    expect(serialized).not.toContain("paragon");
    expect(serialized).not.toContain("wydawania reszty");
    expect(section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.4").map((lesson) => lesson.lessonNumber)).toEqual([1, 2]);
    expect(section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.4")[0]).toBe(m554DecimalAddSubL1V1);
  });

  it("używa istniejącego decimal modelId i lokalnego adaptera we wszystkich kanałach", () => {
    expect(lessonChannelContractIssues(m554DecimalAddSubL1V1)).toEqual([]);
    const modelStages = m554DecimalAddSubL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "comma-columns",
      "column-addition",
      "basic-subtraction",
      "repair-shifted-comma",
      "independent-add-sub",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.4-add-sub-decimals"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina warianty support/core/challenge bez answerSpec w publicznym snapshocie", () => {
    const independent = m554DecimalAddSubL1V1.stages.find((stage) => stage.id.endsWith("-independent-add-sub"))!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([554102, 554107, 554105]);
    expect(independent.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    const built = buildLessonSessionSnapshot(m554DecimalAddSubL1V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent-add-sub"))!;
    expect(snapshotStage.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.curriculumCodes).toEqual(["V.2", "V.6"]);
  });

  it("drukuje trzy warianty z polskim przecinkiem bez kontrolek", () => {
    const independent = m554DecimalAddSubL1V1.stages.find((stage) => stage.id.endsWith("-independent-add-sub"))!;
    const { container } = render(<LessonPrintWorksheet title={independent.print!.worksheetTitle} instructions={independent.print!.instructions} items={independent.print!.items ?? []} />);
    expect(screen.getByText("3,4 + 2,5")).toBeInTheDocument();
    expect(screen.getByText("2,45 + 1,37")).toBeInTheDocument();
    expect(screen.getByText("7,905 − 3,402")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
