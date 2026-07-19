/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonPrintWorksheet } from "@/components/lessons/LessonPrintWorksheet";
import { m554DecimalAddSubL1V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { lessonChannelContractIssues } from "@/lib/lessons/lessonRuntime";
import { decimalNotationL1ActivityFromStageId } from "@/lib/math/decimals/decimalNotationL1";

afterEach(cleanup);

describe("WP-S5-04A — M5-5.4 działania w pamięci, pisemne i tekstowe", () => {
  it("ma spójny pakiet L1 i cele obejmujące rachunki oraz zadania praktyczne", () => {
    const lesson = m554DecimalAddSubL1V1;
    expect(lesson.id).toBe("m5-5-4-dodawanie-odejmowanie-pisemne-l1-v2");
    expect(lesson.title).toBe("Dodawanie i odejmowanie ułamków dziesiętnych");
    expect(lesson.lessonNumber).toBe(1);
    expect(lesson.learningGoals).toHaveLength(1);
    expect(lesson.learningGoals[0]).toMatchObject({
      studentGoal: "Nauczę się dodawać i odejmować ułamki dziesiętne w pamięci i pisemnie.",
      successCriteria: [
        "Potrafię dodawać i odejmować ułamki dziesiętne w pamięci.",
        "Potrafię dodawać i odejmować ułamki dziesiętne pisemnie.",
        "Potrafię sprawdzić, czy otrzymany wynik jest logiczny.",
        "Potrafię rozwiązać zadanie tekstowe z wykorzystaniem ułamków dziesiętnych.",
      ],
    });
    expect(lesson.stages[0]).toMatchObject({
      id: "m5-5-4-trace-0",
      title: "Cele lekcji (slajd 0)",
      board: { headline: "Dodawanie i odejmowanie ułamków dziesiętnych" },
    });
    const codes = new Set(lesson.learningGoals.flatMap((goal) => goal.curriculumReferences).map((reference) => reference.split(" — ")[0]));
    expect(codes).toEqual(new Set(["V.2", "V.6", "XIV.5–6 (zadania praktyczne)"]));
  });

  it("prowadzi przez trzy różne rodzaje aktywności i nie dubluje drugiej lekcji", () => {
    expect(m554DecimalAddSubL1V1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Dodawanie i odejmowanie w pamięci",
      "Dodawanie i odejmowanie pisemne",
      "Zadania tekstowe",
      "Ocena umiejętności",
    ]);
    expect(m554DecimalAddSubL1V1.estimatedMinutes).toBe(45);
    expect(m554DecimalAddSubL1V1.stages.filter((stage) => stage.kind === "understanding")).toHaveLength(1);
    expect(section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.4")).toEqual([m554DecimalAddSubL1V1]);
  });

  it("używa jednego modelu i lokalnego adaptera we wszystkich kanałach", () => {
    expect(lessonChannelContractIssues(m554DecimalAddSubL1V1)).toEqual([]);
    const modelStages = m554DecimalAddSubL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages).toHaveLength(3);
    expect(modelStages.map((stage) => decimalNotationL1ActivityFromStageId(stage.id))).toEqual([
      "mental-add-sub",
      "written-add-sub",
      "story-add-sub",
    ]);
    modelStages.forEach((stage) => {
      expect(stage.student?.modelId).toBe("decimal-notation-l1");
      expect(stage.live?.enabled).toBe(true);
      expect(stage.print?.items?.length).toBeGreaterThan(0);
      expect(stage.runtime?.channels.board.skillIds).toEqual(["M5-5.4-add-sub-decimals"]);
      expect(stage.runtime?.channels.tablet.skillIds).toEqual(stage.runtime?.channels.print.skillIds);
    });
  });

  it("umieszcza całą serię zadań w każdym slajdzie i nie ujawnia odpowiedzi", () => {
    const modelStages = m554DecimalAddSubL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    expect(modelStages.map((stage) => stage.questions.length)).toEqual([8, 8, 4]);
    expect(modelStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "decimal-notation-l1-v1")).toBe(true);
    const built = buildLessonSessionSnapshot(m554DecimalAddSubL1V1);
    expect(JSON.stringify(built.stageSnapshot)).not.toContain("answerSpec");
    expect(built.answerKey.questions.every((question) => question.answerSpec)).toBe(true);
  });

  it("drukuje materiał pamięciowy, pisemny i tekstowy bez kontrolek", () => {
    const modelStages = m554DecimalAddSubL1V1.stages.filter((stage) => stage.board.modelId === "decimal-notation-l1");
    const { container } = render(<>{modelStages.map((stage) => <LessonPrintWorksheet key={stage.id} title={stage.print!.worksheetTitle} instructions={stage.print!.instructions} items={stage.print!.items ?? []} />)}</>);
    expect(container).toHaveTextContent("3,4 + 1,2");
    expect(container).toHaveTextContent("2,45 + 1,37");
    expect(container).toHaveTextContent(/Zadania tekstowe/u);
    expect(container.querySelector("button, input, select, textarea, [role='slider']")).toBeNull();
  });
});
