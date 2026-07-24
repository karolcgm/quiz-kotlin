import { describe, expect, it } from "vitest";
import { m611RachunkiPamiecioweV1 } from "@/data/lessons/m6-1-1-rachunki-pamieciowe";
import { m612RachunkiDziesietneV1 } from "@/data/lessons/m6-1-2-rachunki-dziesietne";
import { m613DzialaniaPisemneDziesietneV1 } from "@/data/lessons/m6-1-3-dzialania-pisemne-dziesietne";
import { m615DzialaniaUlamkiZwykleV1 } from "@/data/lessons/m6-1-5-dzialania-ulamki-zwykle";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";
import { fractionLessonL1ActivityFromStageId } from "@/lib/math/fractions/fractionLessonL1";

describe("klasa 6 korzysta ze sprawdzonych modeli klasy 5", () => {
  it("prowadzi działania pisemne do tych samych aktywności dziesiętnych", () => {
    const modelStages = m613DzialaniaPisemneDziesietneV1.stages.filter((stage) =>
      stage.questions.some((question) => question.generatorId === "decimal-notation-l1-v1"),
    );
    const activities = modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id));

    expect(activities).toEqual([
      "written-add-sub",
      "decimal-decimal-written",
      "decimal-divide-by-decimal-shift",
      "decimal-natural-divide-written",
      "decimal-written-story",
    ]);
    expect(modelStages.every((stage) =>
      stage.questions.every((question) => question.generatorId === "decimal-notation-l1-v1"),
    )).toBe(true);
  });

  it("używa pełnych modeli ćwiczeniowych ułamków zamiast pojedynczych pokazów", () => {
    const sameDenominator = m615DzialaniaUlamkiZwykleV1.stages.find((stage) =>
      stage.id.endsWith("mixed-same-denom-independent"),
    );
    const differentDenominator = m615DzialaniaUlamkiZwykleV1.stages.find((stage) =>
      stage.id.endsWith("different-denom-l2-independent"),
    );

    expect(sameDenominator).toBeDefined();
    expect(differentDenominator).toBeDefined();
    expect(fractionLessonL1ActivityFromStageId(sameDenominator!.id)).toBe("mixed-same-denom-independent");
    expect(fractionLessonL1ActivityFromStageId(differentDenominator!.id)).toBe("different-denom-l2-independent");
    expect(sameDenominator!.questions).toHaveLength(5);
    expect(differentDenominator!.questions).toHaveLength(15);
  });

  it("w każdej serii ułamkowej zachowuje generator obsługiwany przez klasę 5 i Live", () => {
    const exerciseStages = m615DzialaniaUlamkiZwykleV1.stages.filter((stage) => stage.questions.length > 0);

    expect(exerciseStages.length).toBeGreaterThan(0);
    expect(exerciseStages.every((stage) =>
      stage.questions.every((question) => question.generatorId === "fraction-lesson-l1-v1"),
    )).toBe(true);
  });

  it("nie podmienia modeli osi i rachunków dziesiętnych na generator kolejności działań", () => {
    const naturalSnapshot = buildLessonSessionSnapshot(m611RachunkiPamiecioweV1).stageSnapshot;
    const decimalSnapshot = buildLessonSessionSnapshot(m612RachunkiDziesietneV1).stageSnapshot;
    const axisStage = naturalSnapshot.stages.find((stage) => stage.studentModelId === "number-line-jumps");
    const decimalStage = decimalSnapshot.stages.find((stage) => stage.studentModelId === "decimal-mental-arithmetic-l6");

    expect(axisStage?.questions.every((question) => question.generatorId === "number-line-jumps-v1")).toBe(true);
    expect(decimalStage?.questions.every((question) => question.generatorId === "decimal-mental-l6-v1")).toBe(true);
  });
});
