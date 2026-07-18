/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m551DecimalNotationL2V1 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

describe("WP-S5-01B — M5-5.1 L2", () => {
  it("ma osobny pakiet L2 z właściwym tytułem", () => {
    expect(m551DecimalNotationL2V1.id).toBe("m5-5-1-zapis-i-os-l2-v2");
    expect(m551DecimalNotationL2V1.title).toBe("Zapisywanie ułamków dziesiętnych");
    expect(m551DecimalNotationL2V1.lessonNumber).toBe(2);
  });

  it("prowadzi od przykładu przez pięć zamian do czterech osi", () => {
    expect(m551DecimalNotationL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Z ułamka zwykłego na dziesiętny — przykład",
      "Z ułamka zwykłego na dziesiętny",
      "Ułamki dziesiętne na osi liczbowej",
      "Ocena umiejętności",
    ]);
    const modelStages = m551DecimalNotationL2V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual(["fraction-to-decimal-example", "fraction-to-decimal-practice", "decimal-number-line"]);
    expect(modelStages[1]?.questions).toHaveLength(5);
    expect(modelStages[2]?.questions).toHaveLength(4);
  });

  it("spina kanały i snapshot L2", () => {
    expect(lessonChannelContractIssues(m551DecimalNotationL2V1)).toEqual([]);
    const built = buildLessonSessionSnapshot(m551DecimalNotationL2V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L2");
  });

  it("drukuje ćwiczenia z rozszerzaniem", () => {
    const practice = m551DecimalNotationL2V1.stages.find((stage) => stage.id.endsWith("-fraction-to-decimal-practice"))!;
    const { container } = render(<LessonPrintWorksheet title={practice.print!.worksheetTitle} instructions={practice.print!.instructions} items={practice.print!.items ?? []} />);
    expect(screen.getByText("3/5; 7/20; 9/25; 3/8; 11/20")).toBeInTheDocument();
    expect(container.querySelector("button, input, [role='slider']")).toBeNull();
  });
});
