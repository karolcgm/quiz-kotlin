import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

describe("kontrakt wspólnej karty zadań dla działów 3–8", () => {
  it("jest zapisany w głównych instrukcjach repozytorium", () => {
    const instructions = read("AGENTS.md");
    expect(instructions).toContain("Obowiązkowy szablon kart lekcyjnych");
    expect(instructions).toContain("Instrukcja nadrzędna: slajd z zadaniami");
    expect(instructions).toContain("jeden slajd zawierający całą serię zadań");
    expect(instructions).toContain("Nie wolno rozdzielać tej serii na osobne slajdy");
    expect(instructions).toContain("LessonTaskFrame");
    expect(instructions).toContain("Dział II · Temat 1 — Wielokrotności");
  });

  it("obejmuje wszystkie modele zadań działu 3", () => {
    const files = [
      "FractionTopicIntroModel.tsx",
      "FractionLessonL1Model.tsx",
      "FractionLessonL2Model.tsx",
      "FractionQuotientLessonModel.tsx",
      "FractionEquivalenceLessonModel.tsx",
      "FractionComparisonLessonModel.tsx",
      "FractionSameDenominatorLessonModel.tsx",
      "FractionSameDenominatorMixedLessonModel.tsx",
      "FractionDifferentDenominatorMeasureLessonModel.tsx",
      "FractionDifferentDenominatorAdvancedLessonModel.tsx",
      "FractionOperationsLessonModel.tsx",
    ];
    for (const file of files) expect(read(`src/components/lessons/fractions/${file}`), file).toContain("LessonTaskFrame");
  });

  it("obejmuje wszystkie laboratoria działu 5 oraz wspólny dispatcher geometrii", () => {
    const decimalFiles = [
      "DecimalNotationL1Lab.tsx",
      "DecimalNotationL2Lab.tsx",
      "DecimalComparisonLab.tsx",
      "DecimalMeasurementL1Lab.tsx",
      "DecimalMeasurementL2Lab.tsx",
      "DecimalAddSubL1Lab.tsx",
      "DecimalAddSubL2Lab.tsx",
      "DecimalPowerTenL1Lab.tsx",
    ];
    for (const file of decimalFiles) expect(read(`src/components/lessons/decimals/${file}`), file).toContain("LessonTaskFrame");
    expect(read("src/components/lessons/geometry/GeometryLab.tsx")).toContain("data-geometry-task-frame");
  });

  it("ma wspólny fallback renderowania kart w działach 3–8", () => {
    expect(read("src/components/lessons/LessonStageView.tsx")).toContain("^m5-([3-8])-");
    expect(read("src/components/student/SelfPacedLessonPlayer.tsx")).toContain("^M5-S([3-8])$");
    expect(read("src/components/live/BoardStageDisplay.tsx")).toContain("^m5-([3-8])-");
  });
});
