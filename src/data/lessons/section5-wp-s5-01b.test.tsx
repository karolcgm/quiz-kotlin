/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m551DecimalNotationL2V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("WP-S5-01B — M5-5.1 L2", () => {
  it("ma osobny pakiet L2, trace-0 z nazwą matematyczną i podstawą IV.6–IV.9", () => {
    const lesson = m551DecimalNotationL2V1;
    expect(lesson.id).toBe("m5-5-1-tysieczne-os-zamiana-l2-v1");
    expect(lesson.title).toBe("Zapisywanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-1-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Zapisywanie ułamków dziesiętnych" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.6", "IV.7", "IV.8", "IV.9"]) {
      expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
    }
  });

  it("realizuje jeden pionowy wycinek L2 i kończy go oceną umiejętności", () => {
    expect(m551DecimalNotationL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Tysięczne w tabeli",
      "Powiększana oś liczbowa",
      "Zamiana reprezentacji w obie strony",
      "Laboratorium barwników",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m551DecimalNotationL2V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m551DecimalNotationL2V1.stages.at(-1)?.title).toBe("Ocena umiejętności");
    expect(m551DecimalNotationL2V1.teacherGuide.overview).toContain("L2 — tysięczne");
  });

  it("używa istniejącego modelId i lokalnego adaptera we wszystkich kanałach", () => {
    expect(lessonChannelContractIssues(m551DecimalNotationL2V1)).toEqual([]);
    const modelStages = m551DecimalNotationL2V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "thousandths-table", "zoom-axis", "representation-bridge", "dye-lab-l2", "independent-l2",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.1-decimal-notation"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina trzy warianty samodzielne i trzyma answerSpec wyłącznie po stronie serwera", () => {
    const independent = m551DecimalNotationL2V1.stages.find((stage) => stage.id.endsWith("-independent-l2"))!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([502102, 502107, 502105]);
    expect(independent.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);

    const built = buildLessonSessionSnapshot(m551DecimalNotationL2V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent-l2"))!;
    expect(snapshotStage.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L2");
  });

  it("drukuje równoważne warianty bez suwaków, przycisków i uchwytów", () => {
    const independent = m551DecimalNotationL2V1.stages.find((stage) => stage.id.endsWith("-independent-l2"))!;
    const { container } = render(<LessonPrintWorksheet title={independent.print!.worksheetTitle} instructions={independent.print!.instructions} items={independent.print!.items ?? []} />);
    expect(screen.getByText("400/1000")).toBeInTheDocument();
    expect(screen.getByText("375/1000")).toBeInTheDocument();
    expect(screen.getByText("4/1000")).toBeInTheDocument();
    expect(container.querySelector("button, input, [role='slider']")).toBeNull();
  });
});
