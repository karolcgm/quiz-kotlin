/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m553DecimalUnitsL1V2 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-03 — jednostki długości i masy", () => {
  it("ma trzy uzgodnione slajdy tematyczne", () => {
    expect(m553DecimalUnitsL1V2.id).toBe("m5-5-3-jednostki-dlugosci-i-masy-l1-v2");
    expect(m553DecimalUnitsL1V2.title).toBe("Różne sposoby zapisywania jednostek długości i masy");
    expect(m553DecimalUnitsL1V2.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Jednostki długości na jednej linijce",
      "Jednostki masy",
      "Zamiana jednostek",
      "Ocena umiejętności",
    ]);
    expect(m553DecimalUnitsL1V2.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się zamieniać i zapisywać jednostki długości oraz masy na różne sposoby.",
    ]);
    expect(m553DecimalUnitsL1V2.learningGoals[0]?.successCriteria).toHaveLength(4);
  });

  it("podłącza nowe aktywności do wszystkich kanałów", () => {
    expect(lessonChannelContractIssues(m553DecimalUnitsL1V2)).toEqual([]);
    const modelStages = m553DecimalUnitsL1V2.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "length-units-ruler", "mass-units-theory", "unit-conversion-practice",
    ]);
    expect(modelStages.at(-1)?.questions).toHaveLength(10);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.print?.items?.length).toBeGreaterThan(0);
    });
  });

  it("nie ujawnia odpowiedzi w publicznym obrazie sesji", () => {
    const built = buildLessonSessionSnapshot(m553DecimalUnitsL1V2);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
  });

  it("drukuje także decymetry i przykłady wskazane przez użytkownika", () => {
    const stage = m553DecimalUnitsL1V2.stages.find((item) => item.id.endsWith("-unit-conversion-practice"))!;
    const { container } = render(<LessonPrintWorksheet title={stage.print!.worksheetTitle} instructions={stage.print!.instructions} items={stage.print!.items ?? []} />);
    expect(screen.getByText("8 cm = … mm")).toBeInTheDocument();
    expect(screen.getByText("0,4 cm = … mm")).toBeInTheDocument();
    expect(screen.getByText("3,5 dm = … cm")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
