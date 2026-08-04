import { describe, expect, it } from "vitest";
import { grade6Section8Lessons } from "@/data/lessons/m6-8-wyrazenia-i-rownania";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { algebraActivityFromStageId, generateAlgebraTask } from "@/lib/math/algebra/grade6Algebra";

describe("Dział 8 klasy VI — kontrakt pakietów", () => {
  it("publikuje osiem pełnych tematów z niezmiennym slajdem otwierającym i kończącym", () => {
    expect(grade6Section8Lessons).toHaveLength(8);
    expect(grade6Section8Lessons.map((lesson) => lesson.topicId)).toEqual([
      "M6-8.1", "M6-8.2", "M6-8.3", "M6-8.4", "M6-8.5", "M6-8.6", "M6-8.7", "M6-8.8",
    ]);
    for (const lesson of grade6Section8Lessons) {
      expect(lesson.status).toBe("published");
      expect(lesson.sectionId).toBe("M6-S8");
      expect(lesson.stages[0]?.id).toMatch(/-trace-0$/u);
      expect(lesson.stages[0]?.board.modelId).toBe("exercise-board");
      expect(lesson.stages.at(-1)?.kind).toBe("understanding");
      expect(lesson.stages.at(-1)?.understanding?.selfAssessmentAffectsScore).toBe(false);
      expect(lesson.stages.slice(1, -1).every((stage) => stage.board.modelId === "algebra-expressions-lab")).toBe(true);
    }
  });

  it("pokazuje kilka celów tam, gdzie lekcja rozwija kilka odrębnych umiejętności", () => {
    expect(grade6Section8Lessons.map((lesson) => lesson.learningGoals.length)).toEqual([2, 2, 2, 2, 3, 2, 2, 3]);
    for (const lesson of grade6Section8Lessons) {
      expect(lesson.learningGoals.every((goal) => goal.successCriteria.length >= 2)).toBe(true);
      expect(lesson.learningGoals.flatMap((goal) => goal.successCriteria).every((criterion) => criterion.startsWith("Potrafię"))).toBe(true);
    }

    const equationLesson = grade6Section8Lessons[3]!;
    const visibleAssessmentText = equationLesson.learningGoals
      .flatMap((goal) => [goal.studentGoal, ...goal.successCriteria])
      .join(" ");
    expect(visibleAssessmentText).toContain("równanie jest równością dwóch wyrażeń");
    expect(visibleAssessmentText).toContain("zapisywać równania");
    expect(visibleAssessmentText).not.toMatch(/wag|szalk/u);
  });

  it("każdą serię zapisuje jako pytania jednego slajdu i używa wspólnego generatora", () => {
    for (const lesson of grade6Section8Lessons) {
      const taskStages = lesson.stages.filter((stage) => stage.questions.length > 0);
      expect(taskStages.length).toBeGreaterThan(0);
      for (const stage of taskStages) {
        expect(stage.board.modelId).toBe("algebra-expressions-lab");
        expect(stage.student?.modelId).toBe("algebra-expressions-lab");
        expect(stage.questions.length).toBeGreaterThan(1);
        expect(stage.questions.every((question) => question.generatorId === "algebra-expressions-l1-v1")).toBe(true);
        expect(new Set(stage.questions.map((question) => question.id)).size).toBe(stage.questions.length);
        const taskIds = stage.questions.map((question) => generateAlgebraTask(algebraActivityFromStageId(stage.id), question.seed ?? 1)?.id);
        expect(new Set(taskIds).size).toBe(taskIds.length);
      }
    }
  });

  it("w temacie 1 zachowuje dwa wprowadzenia oraz osobne serie wyboru i samodzielnego zapisu", () => {
    const topic = grade6Section8Lessons[0]!;
    const taskStages = topic.stages.filter((stage) => stage.questions.length > 0);
    expect(taskStages).toHaveLength(2);
    expect(taskStages[0]?.questions).toHaveLength(16);
    expect(algebraActivityFromStageId(taskStages[0]!.id)).toBe("translate-words");
    expect(taskStages[1]?.questions).toHaveLength(6);
    expect(algebraActivityFromStageId(taskStages[1]!.id)).toBe("write-story-expression");

    const tasks = taskStages[0]!.questions.map((question) => generateAlgebraTask("translate-words", question.seed ?? 1));
    expect(tasks[0]).toMatchObject({ prompt: "Który zapis oznacza liczbę o 2 większą od x?", answer: "x + 2" });
    expect(tasks[2]).toMatchObject({ prompt: "Który zapis oznacza liczbę 2 razy większą od x?", answer: "2x" });
    expect(tasks[3]).toMatchObject({ prompt: "Który zapis oznacza liczbę 2 razy mniejszą od x?", answer: "x/2" });
    expect(tasks.at(-1)).toMatchObject({ answer: "2y − 2" });

    const storyTasks = taskStages[1]!.questions.map((question) => generateAlgebraTask("write-story-expression", question.seed ?? 1));
    expect(storyTasks[0]).toMatchObject({ kind: "written", answer: "12x+42" });
    expect(storyTasks.at(-1)).toMatchObject({ kind: "written", answer: "15x+32" });
  });

  it("w temacie 2 zawiera podstawienia liczb dodatnich, ujemnych i ułamków", () => {
    const topic = grade6Section8Lessons[1]!;
    const taskStages = topic.stages.filter((stage) => stage.questions.length > 0);
    expect(taskStages.map((stage) => stage.questions.length)).toEqual([8, 4]);
    expect(taskStages.map((stage) => algebraActivityFromStageId(stage.id))).toEqual(["evaluate-expression", "write-substitution"]);

    const tasks = taskStages[0]!.questions.map((question) => generateAlgebraTask("evaluate-expression", question.seed ?? 1));
    expect(tasks).toHaveLength(8);
    expect(tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({ xValue: -2, xDisplay: "−2", answer: -2 }),
      expect.objectContaining({ xValue: -4, xDisplay: "−4", answer: 13 }),
      expect.objectContaining({ xValue: 0.5, xDisplay: "1/2", answer: 3 }),
      expect.objectContaining({ xValue: 0.75, xDisplay: "3/4", answer: 5 }),
    ]));

    const substitutionTasks = taskStages[1]!.questions.map((question) => generateAlgebraTask("write-substitution", question.seed ?? 1));
    expect(substitutionTasks).toHaveLength(4);
    expect(substitutionTasks[0]).toMatchObject({ sourceExpression: "2x + 1", xDisplay: "−4", substitutionAnswer: "2 · (−4) + 1", answer: -7 });
    expect(new Set(substitutionTasks.map((task) => task?.id)).size).toBe(4);
  });

  it("w temacie 3 ćwiczy osobno dodawanie i odejmowanie, mnożenie i dzielenie oraz działania mieszane", () => {
    const topic = grade6Section8Lessons[2]!;
    const taskStages = topic.stages.filter((stage) => stage.questions.length > 0);
    expect(taskStages.map((stage) => algebraActivityFromStageId(stage.id))).toEqual([
      "like-terms",
      "simplify-expression",
      "simplify-multiply-divide",
      "simplify-mixed",
    ]);
    expect(taskStages.map((stage) => stage.questions.length)).toEqual([4, 8, 6, 6]);

    const likeTermTasks = taskStages[0]!.questions.map((question) => generateAlgebraTask("like-terms", question.seed ?? 1));
    expect(likeTermTasks.every((task) => task?.visual === "like-terms")).toBe(true);
    expect(likeTermTasks[2]).toMatchObject({ answer: "2x + 3" });

    const additionTasks = taskStages[1]!.questions.map((question) => generateAlgebraTask("simplify-expression", question.seed ?? 1));
    expect(additionTasks[0]).toMatchObject({ kind: "written", sourceExpression: "3x + 2x", answer: "5x" });
    expect(additionTasks[6]).toMatchObject({ sourceExpression: "1/2 · x + 3/2 · x", answer: "2x" });
    expect(additionTasks[7]).toMatchObject({ sourceExpression: "5/4 · x − 1/4 · x", answer: "x" });

    const multiplicationTasks = taskStages[2]!.questions.map((question) => generateAlgebraTask("simplify-multiply-divide", question.seed ?? 1));
    expect(multiplicationTasks[0]).toMatchObject({ sourceExpression: "(−3) · 2x", answer: "−6x" });
    expect(multiplicationTasks[1]).toMatchObject({ sourceExpression: "4x · (−2)", answer: "−8x" });
    expect(multiplicationTasks[2]).toMatchObject({ sourceExpression: "12x/3", answer: "4x" });
    expect(multiplicationTasks.at(-1)).toMatchObject({ sourceExpression: "3/4 · 8x", answer: "6x" });

    const mixedTasks = taskStages[3]!.questions.map((question) => generateAlgebraTask("simplify-mixed", question.seed ?? 1));
    expect(mixedTasks[0]).toMatchObject({ sourceExpression: "2 · 3x + x", answer: "7x" });
    expect(mixedTasks.at(-1)).toMatchObject({ sourceExpression: "24x/6 + 2 · 3x − x", answer: "9x" });
  });

  it("w temacie 4 prowadzi od wagi do równania, od równania do wagi oraz do zadań tekstowych", () => {
    const topic = grade6Section8Lessons[3]!;
    const taskStages = topic.stages.filter((stage) => stage.questions.length > 0);
    expect(taskStages.map((stage) => algebraActivityFromStageId(stage.id))).toEqual([
      "scale-to-equation",
      "equation-to-scale",
      "write-basic-equation",
      "write-story-equation",
    ]);
    expect(taskStages.map((stage) => stage.questions.length)).toEqual([4, 4, 6, 4]);

    expect(generateAlgebraTask("scale-to-equation", taskStages[0]!.questions[0]!.seed ?? 1)).toMatchObject({ kind: "written", answer: "x+3=8", leftX: 1, leftUnits: 3, rightUnits: 8 });
    expect(generateAlgebraTask("equation-to-scale", taskStages[1]!.questions[0]!.seed ?? 1)).toMatchObject({ kind: "balance-builder", expression: "x + 4 = 11", targetLeftX: 1, targetLeftUnits: 4, targetRightUnits: 11 });
    expect(generateAlgebraTask("write-basic-equation", taskStages[2]!.questions[0]!.seed ?? 1)).toMatchObject({ prompt: "Liczba 18 jest 2 razy większa od x. Zapisz równanie.", answer: "18=2x" });
    expect(generateAlgebraTask("write-story-equation", taskStages[3]!.questions[0]!.seed ?? 1)).toMatchObject({ sought: "Liczba koralików Kasi na początku", xMeaningAnswer: "liczbę koralików Kasi na początku", answer: "x+7=19" });
  });

  it("w temacie 5 prowadzi od znaczenia pojęcia przez podstawienie do wyboru rozwiązania", () => {
    const topic = grade6Section8Lessons[4]!;
    const taskStages = topic.stages.filter((stage) => stage.questions.length > 0);
    expect(topic.learningGoals.map((goal) => goal.studentGoal)).toEqual([
      "Zrozumiem, co oznacza, że liczba spełnia równanie.",
      "Nauczę się poprawnie podstawiać sprawdzaną liczbę za x.",
      "Nauczę się wybierać liczbę spełniającą równanie.",
    ]);
    expect(taskStages.map((stage) => algebraActivityFromStageId(stage.id))).toEqual(["candidate-substitution", "select-solution"]);
    expect(taskStages.map((stage) => stage.questions.length)).toEqual([4, 6]);

    const substitutionTasks = taskStages[0]!.questions.map((question) => generateAlgebraTask("candidate-substitution", question.seed ?? 1));
    expect(substitutionTasks[0]).toMatchObject({ sourceExpression: "x + 3", substitutionAnswer: "5 + 3", answer: 8, xValue: 5 });
    expect(substitutionTasks[1]).toMatchObject({ sourceExpression: "3x", substitutionAnswer: "3 · 4", answer: 12, xValue: 4 });

    const selectionTasks = taskStages[1]!.questions.map((question) => generateAlgebraTask("select-solution", question.seed ?? 1));
    expect(selectionTasks[0]).toMatchObject({ prompt: "Która liczba spełnia równanie x + 4 = 11?", options: ["5", "7", "11", "15"], answer: "7" });
    expect(selectionTasks).toHaveLength(6);
    expect(new Set(selectionTasks.map((task) => task?.answer)).size).toBeGreaterThan(3);
  });

  it("buduje snapshot klasy VI, zachowuje ziarna i mapuje ostatni dowód na wszystkie kryteria", () => {
    for (const lesson of grade6Section8Lessons) {
      const { stageSnapshot } = buildLessonSessionSnapshot(lesson);
      expect(stageSnapshot.stages[0]?.lessonMetric).toBe("Matematyka · klasa 6 · dział 8");
      const questionStages = stageSnapshot.stages.filter((stage) => stage.questions.length > 0);
      expect(questionStages.flatMap((stage) => stage.questions).every((question) => question.expression === "")).toBe(true);
      expect(questionStages.flatMap((stage) => stage.questions).every((question) => question.generatorId === "algebra-expressions-l1-v1")).toBe(true);

      const understanding = stageSnapshot.stages.at(-1)?.understanding;
      expect(understanding?.evidenceStageId).toBe(questionStages.at(-1)?.id);
      const evidenceSkills = new Set(understanding?.evidenceItems.flatMap((item) => item.skillIds));
      for (const skillId of lesson.skillIds) expect(evidenceSkills.has(skillId)).toBe(true);
    }
  });
});
