/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m551DecimalNotationL1V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("WP-S5-01 — M5-5.1", () => {
  it("ma jeden pakiet z celami dla obu kierunków zamiany", () => {
    const lesson = m551DecimalNotationL1V1;
    expect(lesson.id).toBe("m5-5-1-zapis-i-zamiana-l1-v2");
    expect(lesson.title).toBe("Zapisywanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.6", "IV.7", "IV.8", "IV.9"]) expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
  });

  it("prowadzi przez obie zamiany i oś w jednym temacie", () => {
    expect(m551DecimalNotationL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Nazwy miejsc cyfr",
      "Przykład zamiany ułamka dziesiętnego na zwykły",
      "Z ułamka dziesiętnego na ułamek zwykły",
      "Przykład zamiany ułamka zwykłego na dziesiętny",
      "Z ułamka zwykłego na dziesiętny",
      "Ułamki dziesiętne na osi liczbowej",
      "Ocena umiejętności",
    ]);
    const modelStages = m551DecimalNotationL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "place-names",
      "decimal-to-fraction-example",
      "decimal-to-fraction-practice",
      "fraction-to-decimal-example",
      "fraction-to-decimal-practice",
      "decimal-number-line",
    ]);
    expect(modelStages[2]?.questions).toHaveLength(10);
    expect(modelStages[4]?.questions).toHaveLength(10);
    expect(modelStages[5]?.questions).toHaveLength(4);
  });

  it("spina kanały i trzyma answerSpec wyłącznie po stronie serwera", () => {
    expect(lessonChannelContractIssues(m551DecimalNotationL1V1)).toEqual([]);
    const built = buildLessonSessionSnapshot(m551DecimalNotationL1V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
  });

  it("drukuje po dziesięć przykładów w obu kierunkach", () => {
    const stages = m551DecimalNotationL1V1.stages.filter((stage) => stage.id.endsWith("-practice"));
    const decimalPractice = stages.find((stage) => stage.id.includes("decimal-to-fraction"))!;
    const fractionPractice = stages.find((stage) => stage.id.includes("fraction-to-decimal"))!;
    const first = render(<LessonPrintWorksheet title={decimalPractice.print!.worksheetTitle} instructions={decimalPractice.print!.instructions} items={decimalPractice.print!.items ?? []} />);
    expect(screen.getByText("0,6; 0,24; 0,125; 0,45; 0,72; 0,08; 0,375; 0,14; 0,005; 0,84")).toBeInTheDocument();
    expect(first.container.querySelector("button, input, [role='slider']")).toBeNull();
    first.unmount();
    const second = render(<LessonPrintWorksheet title={fractionPractice.print!.worksheetTitle} instructions={fractionPractice.print!.instructions} items={fractionPractice.print!.items ?? []} />);
    expect(screen.getByText("3/5; 7/20; 9/25; 3/8; 11/20; 13/25; 7/8; 17/20; 3/40; 9/50")).toBeInTheDocument();
    expect(second.container.querySelector("button, input, [role='slider']")).toBeNull();
  });
});
