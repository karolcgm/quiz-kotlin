import { describe, expect, it } from "vitest";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import {
  G6_AREA_REVIEW_STORIES,
  G6_AREA_REVIEW_TASKS,
  G6_PARALLELOGRAM_RHOMBUS_STORIES,
  G6_PARALLELOGRAM_RHOMBUS_TASKS,
  G6_TRAPEZOID_STORIES,
  G6_TRAPEZOID_TASKS,
  G6_TRIANGLE_STORIES,
  G6_TRIANGLE_TASKS,
} from "@/lib/math/area/grade6PolygonArea";
import { COMPOSITE_GRID_REVIEW_TASKS, compositeAreaActivityFromStageId } from "@/lib/math/area/compositeArea";

const allTaskGroups = [
  G6_PARALLELOGRAM_RHOMBUS_TASKS,
  G6_PARALLELOGRAM_RHOMBUS_STORIES,
  G6_TRIANGLE_TASKS,
  G6_TRIANGLE_STORIES,
  G6_TRAPEZOID_TASKS,
  G6_TRAPEZOID_STORIES,
  G6_AREA_REVIEW_TASKS,
  G6_AREA_REVIEW_STORIES,
];

describe("grade 6 polygon-area task sets", () => {
  it("provides a complete task series for every activity", () => {
    expect(allTaskGroups.map((tasks) => tasks.length)).toEqual([6, 2, 4, 2, 4, 2, 5, 2]);
  });

  it("does not repeat task identifiers or prompts", () => {
    const tasks = allTaskGroups.flat();
    expect(new Set(tasks.map((task) => task.id)).size).toBe(tasks.length);
    expect(new Set(tasks.map((task) => task.prompt)).size).toBe(tasks.length);
  });

  it("defines at least one checked answer for every task", () => {
    for (const task of allTaskGroups.flat()) {
      expect(task.answers.length > 0 || Boolean(task.matchBoard)).toBe(true);
      for (const answer of task.answers) {
        expect(Number.isFinite(answer.answer)).toBe(true);
      }
    }
  });

  it("contains the interactive figure-to-area matching task inspired by the review worksheet", () => {
    const task = G6_AREA_REVIEW_TASKS.find((item) => item.id === "g6-review-match-areas");
    expect(task?.matchBoard?.figures).toHaveLength(6);
    expect(task?.matchBoard?.options).toHaveLength(6);
    expect(new Set(task?.matchBoard?.figures.map((figure) => figure.answerOptionId)).size).toBe(6);
  });

  it("uses dedicated illustrations for every word problem", () => {
    const stories = [
      ...G6_PARALLELOGRAM_RHOMBUS_STORIES,
      ...G6_TRIANGLE_STORIES,
      ...G6_TRAPEZOID_STORIES,
      ...G6_AREA_REVIEW_STORIES,
    ];
    expect(stories.every((task) => task.image?.startsWith("/images/lessons/grade6/polygon-areas/"))).toBe(true);
    expect(new Set(stories.map((task) => task.image)).size).toBe(stories.length);
  });

  it("publishes the four completed grade 6 lessons instead of their skeletons", () => {
    for (const topicId of ["M6-5.2", "M6-5.3", "M6-5.4", "M6-5.5"]) {
      const lesson = getLessonPackageForTopic(topicId);
      expect(lesson?.status).toBe("published");
      expect(lesson?.stages.some((stage) => stage.student?.modelId === "area-review-lab")).toBe(true);
    }
  });

  it("adds an interactive composite-figure series to the grade 6 review", () => {
    const lesson = getLessonPackageForTopic("M6-5.5");
    const stage = lesson?.stages.find((item) => item.student?.modelId === "composite-area-lab");

    expect(stage?.title).toBe("Figury złożone na kratownicy");
    expect(stage?.questions).toHaveLength(4);
    expect(compositeAreaActivityFromStageId(stage?.id ?? "")).toBe("grid-review");
  });

  it("dzieli figurę na trapez i trójkąt o poprawnym łącznym polu", () => {
    const task = COMPOSITE_GRID_REVIEW_TASKS.find((item) => item.id === "trapezoid-triangle-review");

    expect(task?.cuts).toEqual([{ from: [3, 4], to: [7, 4] }]);
    expect(task?.parts.map((part) => part.shape)).toEqual(["trójkąt", "trapez"]);
    expect(task?.parts.map((part) => part.area)).toEqual([6, 18]);
    expect(task?.parts.reduce((sum, part) => sum + part.area, 0)).toBe(task?.total);
    expect(task?.total).toBe(24);
  });

  it("różnicuje figury składowe w całej serii powtórkowej", () => {
    const shapes = new Set(COMPOSITE_GRID_REVIEW_TASKS.flatMap((task) => task.parts.map((part) => part.shape)));

    expect(shapes).toEqual(new Set(["trójkąt", "trapez", "równoległobok"]));
    expect(COMPOSITE_GRID_REVIEW_TASKS.some((task) => task.parts.every((part) => part.shape === "prostokąt"))).toBe(false);
  });
});
