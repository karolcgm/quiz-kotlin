/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m551DecimalNotationL1V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("WP-S5-01A — M5-5.1 L1", () => {
  it("ma aktualny pakiet, cele i podstawę IV.6–IV.9", () => {
    const lesson = m551DecimalNotationL1V1;
    expect(lesson.id).toBe("m5-5-1-zapis-i-zamiana-l1-v2");
    expect(lesson.title).toBe("Zapisywanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.6", "IV.7", "IV.8", "IV.9"]) expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
  });

  it("prowadzi od nazw miejsc przez przykład do pięciu pełnych zamian", () => {
    expect(m551DecimalNotationL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Nazwy miejsc cyfr",
      "Z liczby dziesiętnej na ułamek zwykły — przykład",
      "Z liczby dziesiętnej na ułamek zwykły",
      "Ocena umiejętności",
    ]);
    const modelStages = m551DecimalNotationL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual(["place-names", "decimal-to-fraction-example", "decimal-to-fraction-practice"]);
    expect(modelStages.at(-1)?.questions).toHaveLength(5);
  });

  it("spina kanały i trzyma answerSpec wyłącznie po stronie serwera", () => {
    expect(lessonChannelContractIssues(m551DecimalNotationL1V1)).toEqual([]);
    const built = buildLessonSessionSnapshot(m551DecimalNotationL1V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
  });

  it("drukuje pięć liczb do pełnej zamiany", () => {
    const practice = m551DecimalNotationL1V1.stages.find((stage) => stage.id.endsWith("-decimal-to-fraction-practice"))!;
    const { container } = render(<LessonPrintWorksheet title={practice.print!.worksheetTitle} instructions={practice.print!.instructions} items={practice.print!.items ?? []} />);
    expect(screen.getByText("0,6; 0,24; 0,125; 0,45; 0,72")).toBeInTheDocument();
    expect(container.querySelector("button, input, [role='slider']")).toBeNull();
  });
});
