import { describe, expect, it } from "vitest";
import { m671PorownywanieLiczbV1 } from "@/data/lessons/m6-7-1-porownywanie-liczb";
import { m672DodawanieIOdejmowanieV1 } from "@/data/lessons/m6-7-2-dodawanie-i-odejmowanie";
import { m673MnozenieIDzielenieV1 } from "@/data/lessons/m6-7-3-mnozenie-i-dzielenie";
import { m674PowtorzenieLiczbZeZnakiemV1 } from "@/data/lessons/m6-7-4-powtorzenie";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { GRADE6_SIGNED_NUMBERS_TASK_COUNTS } from "@/components/lessons/models/Grade6SignedNumbersV2Lab";
import { integerNumbersActivityFromStageId } from "@/components/lessons/models/IntegerNumbersLessonLab";
import { integerAddSubtractActivityFromStageId } from "@/components/lessons/models/IntegerAddSubtractLessonLab";
import { integerMulDivActivityFromStageId } from "@/components/lessons/models/IntegerMulDivLessonLab";
import { integerReviewActivityFromStageId } from "@/components/lessons/models/IntegerReviewLessonLab";
import type { Grade6SignedNumbersActivity } from "@/components/lessons/models/Grade6SignedNumbersLessonLab";

const lessons = [m671PorownywanieLiczbV1, m672DodawanieIOdejmowanieV1, m673MnozenieIDzielenieV1, m674PowtorzenieLiczbZeZnakiemV1];

describe("Dział 7 klasy VI — przebudowany kontrakt", () => {
  it("publikuje cztery tematy ze wspólnym slajdem otwierającym i kończącym", () => {
    expect(lessons.map((lesson) => lesson.topicId)).toEqual(["M6-7.1", "M6-7.2", "M6-7.3", "M6-7.4"]);
    for (const lesson of lessons) {
      expect(lesson.status).toBe("published");
      expect(lesson.sectionId).toBe("M6-S7");
      expect(lesson.stages[0]?.id).toMatch(/-trace-0$/u);
      expect(lesson.stages[0]?.board.modelId).toBe("exercise-board");
      expect(lesson.stages.at(-1)?.kind).toBe("understanding");
      expect(lesson.stages.at(-1)?.understanding?.selfAssessmentAffectsScore).toBe(false);
    }
  });

  it("prowadzi od liczb całkowitych do ułamków i zapewnia co najmniej sześć przykładów w temacie dodawania", () => {
    expect(m671PorownywanieLiczbV1.stages.findIndex((stage) => stage.id.endsWith("-integer-compare"))).toBeLessThan(m671PorownywanieLiczbV1.stages.findIndex((stage) => stage.id.endsWith("-rational-compare")));
    expect(m672DodawanieIOdejmowanieV1.stages.findIndex((stage) => stage.id.endsWith("-add-model"))).toBeLessThan(m672DodawanieIOdejmowanieV1.stages.findIndex((stage) => stage.id.endsWith("-add-fractions")));
    expect(m673MnozenieIDzielenieV1.stages.findIndex((stage) => stage.id.endsWith("-integer-operations"))).toBeLessThan(m673MnozenieIDzielenieV1.stages.findIndex((stage) => stage.id.endsWith("-fraction-operations")));
    expect(m673MnozenieIDzielenieV1.stages.findIndex((stage) => stage.id.endsWith("-fraction-operations"))).toBeLessThan(m673MnozenieIDzielenieV1.stages.findIndex((stage) => stage.id.endsWith("-decimal-operations")));
    for (const stage of m672DodawanieIOdejmowanieV1.stages.filter((item) => item.questions.length > 0)) expect(stage.questions.length).toBeGreaterThanOrEqual(6);
  });

  it("w temacie dodawania zaczyna od sąsiadujących znaków, a potem przechodzi do żetonów", () => {
    const signRulesIndex = m672DodawanieIOdejmowanieV1.stages.findIndex((stage) => stage.id.endsWith("-sign-rules"));
    const tokenModelIndex = m672DodawanieIOdejmowanieV1.stages.findIndex((stage) => stage.id.endsWith("-add-model"));
    expect(signRulesIndex).toBeGreaterThan(0);
    expect(signRulesIndex).toBeLessThan(tokenModelIndex);
    expect(m672DodawanieIOdejmowanieV1.stages[signRulesIndex]?.board.body).toContain("sąsiadujące znaki");
  });

  it("temat mnożenia i dzielenia mieści materiał w pięciu slajdach ćwiczeniowych", () => {
    const activities = m673MnozenieIDzielenieV1.stages
      .filter((stage) => stage.board.modelId === "integer-mul-div-lab")
      .map((stage) => integerMulDivActivityFromStageId(stage.id));
    expect(activities).toEqual(["g6-sign-discovery", "g6-integer-mul-div", "g6-fraction-mul-div", "g6-decimal-mul-div", "g6-mul-stories"]);
  });

  it("opisuje cele działu jako konkretne umiejętności ucznia", () => {
    expect(m672DodawanieIOdejmowanieV1.studentGoal).toContain("dodawać i odejmować");
    expect(m673MnozenieIDzielenieV1.studentGoal).toContain("mnożyć i dzielić");
    expect(m673MnozenieIDzielenieV1.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Nauczę się mnożyć i dzielić liczby dodatnie i ujemne — całkowite oraz ułamki zwykłe i dziesiętne.",
      "Nauczę się poprawnie ustalać znak wyniku mnożenia i dzielenia.",
    ]);
    expect(m674PowtorzenieLiczbZeZnakiemV1.studentGoal).toContain("we właściwej kolejności");
  });

  it("używa jednego generatora na model, zachowuje unikalne seedy i buduje pytania samodzielnych widgetów", () => {
    const generatorByModel: Record<string, string> = { "integer-numbers-lab": "integer-numbers-l1-v1", "integer-add-subtract-lab": "integer-add-subtract-l1-v1", "integer-mul-div-lab": "integer-mul-div-l1-v1", "integer-review-lab": "integer-review-l1-v1" };
    for (const lesson of lessons) {
      for (const stage of lesson.stages.filter((item) => item.questions.length > 0)) {
        expect(stage.student?.modelId).toBe(stage.board.modelId);
        expect(stage.questions.every((question) => question.generatorId === generatorByModel[stage.board.modelId ?? ""])).toBe(true);
        expect(new Set(stage.questions.map((question) => question.seed)).size).toBe(stage.questions.length);
        const activity = stage.board.modelId === "integer-numbers-lab" ? integerNumbersActivityFromStageId(stage.id)
          : stage.board.modelId === "integer-add-subtract-lab" ? integerAddSubtractActivityFromStageId(stage.id)
            : stage.board.modelId === "integer-mul-div-lab" ? integerMulDivActivityFromStageId(stage.id)
              : integerReviewActivityFromStageId(stage.id);
        expect(GRADE6_SIGNED_NUMBERS_TASK_COUNTS[activity as Grade6SignedNumbersActivity]).toBe(stage.questions.length);
      }
      const { stageSnapshot } = buildLessonSessionSnapshot(lesson);
      const questions = stageSnapshot.stages.flatMap((stage) => stage.questions);
      expect(questions.every((question) => question.expression === "")).toBe(true);
      expect(stageSnapshot.stages[0]?.lessonMetric).toBe("Matematyka · klasa 6 · dział 7");
    }
  });
});
