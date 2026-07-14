import { describe, expect, it } from "vitest";
import { m517MnozenieWarstwamiV1 } from "@/data/lessons/section1-wp-c1bc";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

describe("m5-1.7 — mnożenie warstwami", () => {
  it("ma slajd 0 z celami i kryteriami sukcesu", () => {
    const firstStage = m517MnozenieWarstwamiV1.stages[0];

    expect(firstStage?.title).toBe("Cele lekcji (slajd 0)");
    expect(firstStage?.board.modelId).toBe("exercise-board");
    expect(firstStage?.live).toEqual({ enabled: true, kind: "exercise", minutes: 3 });
    expect(m517MnozenieWarstwamiV1.learningGoals).toEqual([{
      id: "m5-1-7-written-multiply",
      studentGoal: "Nauczę się mnożyć pisemnie liczby naturalne przez liczby jedno-, dwu- i trzycyfrowe.",
      successCriteria: [
        "Potrafię poprawnie zapisać liczby w mnożeniu pisemnym.",
        "Potrafię obliczyć iloczyny częściowe.",
        "Potrafię dodać iloczyny częściowe i podać wynik mnożenia.",
      ],
      curriculumReferences: ["Dział I — działania pisemne: mnożenie liczb naturalnych przez liczby jedno-, dwu- i trzycyfrowe."],
    }]);

    const { stageSnapshot } = buildLessonSessionSnapshot(m517MnozenieWarstwamiV1);
    expect(stageSnapshot.stages[0]?.lessonTitle).toBe("Działania pisemne — mnożenie");
    expect(stageSnapshot.stages[0]?.learningGoals).toEqual(m517MnozenieWarstwamiV1.learningGoals);
  });

  it("ma końcową samoocenę ucznia jako etap quick-check", () => {
    const finalStage = m517MnozenieWarstwamiV1.stages.at(-1);

    expect(finalStage?.title).toBe("Ocena umiejętności");
    expect(finalStage?.live).toEqual({ enabled: true, kind: "quick-check", minutes: 4 });
    expect(finalStage?.student?.activityMode).toBe("view");
    expect(finalStage?.student?.instruction).toBe("Oceń, jak dobrze rozumiesz mnożenie pisemne piętrami.");

    const { stageSnapshot } = buildLessonSessionSnapshot(m517MnozenieWarstwamiV1);
    const finalLiveStage = stageSnapshot.stages.at(-1);
    expect(finalLiveStage?.id).toBe("m5-1-7-understanding");
    expect(finalLiveStage?.liveKind).toBe("quick-check");
    expect(finalLiveStage?.studentInstruction).toBe("Oceń, jak dobrze rozumiesz mnożenie pisemne piętrami.");
  });

  it("ma jeden slajd z czterema zadaniami wyświetlanymi kolejno", () => {
    const multiplicationStage = m517MnozenieWarstwamiV1.stages.find((stage) => stage.board.modelId === "written-multiplication-lesson");

    expect(multiplicationStage?.questions).toHaveLength(4);
    expect(multiplicationStage?.questions.every((question) => question.generatorId === "written-multiplication-v1")).toBe(true);

    const { stageSnapshot } = buildLessonSessionSnapshot(m517MnozenieWarstwamiV1);
    const liveStage = stageSnapshot.stages.find((stage) => stage.studentModelId === "written-multiplication-lesson");
    expect(liveStage?.questions).toHaveLength(4);
    expect(liveStage?.questions.every((question) => question.generatorId === "written-multiplication-v1")).toBe(true);
  });
});
