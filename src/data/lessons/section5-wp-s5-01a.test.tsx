/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m551DecimalNotationL1V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";

describe("WP-S5-01A — M5-5.1 L1", () => {
  it("ma poprawny trace-0, nazwę matematyczną i podstawę IV.6–IV.9", () => {
    const lesson = m551DecimalNotationL1V1;
    expect(lesson.id).toBe("m5-5-1-zapisywanie-dziesiatych-setnych-l1-v1");
    expect(lesson.title).toBe("Zapisywanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
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

  it("zawiera cały pionowy wycinek L1 i dokładnie jedną końcową ocenę", () => {
    expect(m551DecimalNotationL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Dziesiąte i setne",
      "Kratownica 10×10",
      "Tabela wartości pozycyjnej",
      "Zapis słowny i cyfrowy",
      "Barwienie szklanki",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m551DecimalNotationL1V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m551DecimalNotationL1V1.stages.at(-1)?.title).toBe("Ocena umiejętności");
  });

  it("spina board/tablet/live/self-paced/print i trzy deterministyczne poziomy", () => {
    expect(lessonChannelContractIssues(m551DecimalNotationL1V1)).toEqual([]);
    const modelStages = m551DecimalNotationL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(6);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.1-decimal-notation"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
    const independent = modelStages.at(-1)!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([501102, 501107, 501105]);

    const built = buildLessonSessionSnapshot(m551DecimalNotationL1V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent"))!;
    expect(snapshotStage.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
  });

  it("drukuje równoważne zadania bez suwaków, przycisków i uchwytów", () => {
    const independent = m551DecimalNotationL1V1.stages.find((stage) => stage.id.endsWith("-independent"))!;
    const { container } = render(<LessonPrintWorksheet title={independent.print!.worksheetTitle} instructions={independent.print!.instructions} items={independent.print!.items ?? []} />);
    expect(screen.getByText("40/100")).toBeInTheDocument();
    expect(screen.getByText("37/100")).toBeInTheDocument();
    expect(screen.getByText("4/100")).toBeInTheDocument();
    expect(container.querySelector("button, input, [role='slider']")).toBeNull();
  });
});
