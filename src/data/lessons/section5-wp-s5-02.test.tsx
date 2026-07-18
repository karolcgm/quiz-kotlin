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
  it("ma nowy zadaniowy układ lekcji", () => {
    const lesson = m552DecimalComparisonL1V1;
    expect(lesson.id).toBe("m5-5-2-porownaj-i-uporzadkuj-l1-v2");
    expect(lesson.title).toBe("Porównywanie ułamków dziesiętnych");
    expect(lesson.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Porównaj ułamki dziesiętne",
      "Od najmniejszego do największego",
      "Wpisz liczbę spełniającą nierówność",
      "Ocena umiejętności",
    ]);
    expect(lesson.estimatedMinutes).toBe(45);
  });

  it("podłącza trzy aktywności do modelu i wszystkich kanałów", () => {
    expect(lessonChannelContractIssues(m552DecimalComparisonL1V1)).toEqual([]);
    const modelStages = m552DecimalComparisonL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "pair-comparison", "ascending-order", "open-inequality",
    ]);
    expect(modelStages.map((stage) => stage.questions.length)).toEqual([10, 5, 6]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.2-compare-decimals"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("nie ujawnia klucza odpowiedzi w publicznym obrazie sesji", () => {
    const built = buildLessonSessionSnapshot(m552DecimalComparisonL1V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L1");
  });

  it("drukuje podchwytliwe porównanie bez kontrolek interaktywnych", () => {
    const stage = m552DecimalComparisonL1V1.stages.find((item) => item.id.endsWith("-pair-comparison"))!;
    const { container } = render(<LessonPrintWorksheet title={stage.print!.worksheetTitle} instructions={stage.print!.instructions} items={stage.print!.items ?? []} />);
    expect(screen.getByText(/10,05 ○ 10,5/u)).toBeInTheDocument();
    expect(screen.getByText(/0,7 ○ 0,70/u)).toBeInTheDocument();
    expect(container.querySelector("button, input, textarea, [role='slider']")).toBeNull();
  });
});
