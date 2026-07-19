/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m554DecimalAddSubL1V1, m554DecimalAddSubL2V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-04B — M5-5.4 zadania praktyczne i pożyczanie L2", () => {
  it("ma nazwany pakiet, osobny trace-0 oraz podstawę V.2, V.6 i XIV.5–6", () => {
    const lesson = m554DecimalAddSubL2V1;
    expect(lesson.id).toBe("m5-5-4-zadania-praktyczne-pozyczanie-l2-v1");
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.learningGoals).toHaveLength(1);
    expect(lesson.learningGoals[0]?.successCriteria).toHaveLength(4);
    expect(lesson.stages[0]).toMatchObject({ id: "m5-5-4-trace-0", title: "Cele lekcji (slajd 0)" });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    expect(references.some((reference) => reference.startsWith("V.2 —"))).toBe(true);
    expect(references.some((reference) => reference.startsWith("V.6 —"))).toBe(true);
    expect(references.some((reference) => reference.startsWith("XIV.5–6 (zadania praktyczne) —"))).toBe(true);
  });

  it("realizuje osobny pion L2 i kończy Oceną umiejętności", () => {
    expect(m554DecimalAddSubL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Odejmowanie z pożyczaniem",
      "Reszta dwiema metodami",
      "Paragon pracowni",
      "Napraw przesunięty przecinek",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m554DecimalAddSubL2V1.estimatedMinutes).toBe(45);
    expect(m554DecimalAddSubL2V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.4")).toEqual([m554DecimalAddSubL1V1]);
  });

  it("używa tylko istniejącego decimal modelId oraz ma Live, tablet i druk", () => {
    expect(lessonChannelContractIssues(m554DecimalAddSubL2V1)).toEqual([]);
    const modelStages = m554DecimalAddSubL2V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "borrowing-subtraction",
      "change-two-methods",
      "workshop-receipt",
      "repair-context-comma",
      "independent-add-sub-l2",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.4-add-sub-decimals"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina support/core/challenge, a answerSpec pozostawia tylko w kluczu serwera", () => {
    const independent = m554DecimalAddSubL2V1.stages.find((stage) => stage.id.endsWith("-independent-add-sub-l2"))!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([554202, 554207, 554205]);
    expect(independent.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    const built = buildLessonSessionSnapshot(m554DecimalAddSubL2V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent-add-sub-l2"))!;
    expect(snapshotStage.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.curriculumCodes).toEqual(["V.2", "V.6", "XIV.5–6 (zadania praktyczne)"]);
  });

  it("drukuje paragon z cenami, zbędną informacją i szacunkiem bez kontrolek", () => {
    const receipt = m554DecimalAddSubL2V1.stages.find((stage) => stage.id.endsWith("-workshop-receipt"))!;
    const { container } = render(<LessonPrintWorksheet title={receipt.print!.worksheetTitle} instructions={receipt.print!.instructions} items={receipt.print!.items ?? []} />);
    expect(screen.getByText(/Farba 4,35 zł; pędzel 2,80 zł; taśma 1,45 zł; półka B7/u)).toBeInTheDocument();
    expect(screen.getByText(/Oszacuj, wskaż informację zbędną/u)).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
