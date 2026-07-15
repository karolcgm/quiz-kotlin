/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m553DecimalMassMixedL2V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-03B — M5-5.3 masa i zadania mieszane L2", () => {
  it("ma osobny pakiet L2, poprawny trace-0 i podstawę IV.6, XII.6, XII.7", () => {
    const lesson = m553DecimalMassMixedL2V1;
    expect(lesson.id).toBe("m5-5-3-masa-zadania-mieszane-l2-v1");
    expect(lesson.title).toBe("Długość i masa w zapisie dziesiętnym");
    expect(lesson.lessonNumber).toBe(2);
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-3-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Długość i masa w zapisie dziesiętnym" },
    });
    const references = lesson.learningGoals.flatMap((goal) => goal.curriculumReferences);
    for (const code of ["IV.6", "XII.6", "XII.7"]) {
      expect(references.some((reference) => reference.startsWith(`${code} —`))).toBe(true);
    }
    expect(section5LessonsWpC5.filter((candidate) => candidate.topicId === "M5-5.3").map((candidate) => candidate.lessonNumber)).toEqual([1, 2]);
  });

  it("realizuje pion L2 i kończy dokładnie jedną Oceną umiejętności", () => {
    expect(m553DecimalMassMixedL2V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Waga laboratoryjna",
      "Nie przesuwamy przecinka bez sensu",
      "Pakowanie leków dla zwierząt",
      "Mieszane przeliczenia",
      "Praca samodzielna",
      "Ocena umiejętności",
    ]);
    expect(m553DecimalMassMixedL2V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(m553DecimalMassMixedL2V1.estimatedMinutes).toBe(45);
    expect(m553DecimalMassMixedL2V1.stages.reduce((sum, stage) => sum + stage.estimatedMinutes, 0)).toBe(45);
    expect(m553DecimalMassMixedL2V1.teacherGuide.overview).toContain("L2 — masa i zadania mieszane");
  });

  it("używa istniejącego modelId i lokalnego adaptera we wszystkich kanałach", () => {
    expect(lessonChannelContractIssues(m553DecimalMassMixedL2V1)).toEqual([]);
    const modelStages = m553DecimalMassMixedL2V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(5);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "laboratory-scale-mass",
      "unit-scale-mass",
      "medicine-packing",
      "mixed-measurements",
      "independent-mixed",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.3-units-length-mass"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("spina support/core/challenge i trzyma klucz wyłącznie po stronie serwera", () => {
    const independent = m553DecimalMassMixedL2V1.stages.find((stage) => stage.id.endsWith("-independent-mixed"))!;
    expect(independent.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(independent.questions.map((question) => question.seed)).toEqual([553202, 553207, 553205]);
    expect(independent.questions.every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);

    const built = buildLessonSessionSnapshot(m553DecimalMassMixedL2V1);
    const snapshotStage = built.stageSnapshot.stages.find((stage) => stage.id.endsWith("-independent-mixed"))!;
    expect(snapshotStage.questions.map((question) => question.difficulty)).toEqual(["support", "core", "challenge"]);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
    expect(built.stageSnapshot.stages[0]?.lessonTiming).toBe("45 min · L2");
  });

  it("drukuje realistyczne i absurdalne etykiety oraz mieszane jednostki bez kontrolek", () => {
    const medicine = m553DecimalMassMixedL2V1.stages.find((stage) => stage.id.endsWith("-medicine-packing"))!;
    const { container } = render(<LessonPrintWorksheet title={medicine.print!.worksheetTitle} instructions={medicine.print!.instructions} items={medicine.print!.items ?? []} />);
    expect(screen.getByText("Saszetka 25 g; etykieta 0,025 kg")).toBeInTheDocument();
    expect(screen.getByText("Pudełko tabletek 45 g; etykieta 45 kg")).toBeInTheDocument();
    expect(screen.getByText("Zestaw 1 kg 25 dag; etykieta 1,25 kg")).toBeInTheDocument();
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
