import { describe, expect, it } from "vitest";

import {
  isPercentReviewFinalAnswerCorrect,
  parsePercentReviewNumber,
  percentReviewL6Task,
  type PercentReviewL6Activity,
} from "./percentReviewL6";

const activities: readonly PercentReviewL6Activity[] = [
  "percent-review-connections",
  "percent-review-diagrams",
  "percent-review-stories",
];

describe("percentReviewL6", () => {
  it.each(activities)("provides five different tasks for %s", (activity) => {
    const tasks = Array.from({ length: 5 }, (_, seed) => percentReviewL6Task(activity, seed));

    expect(new Set(tasks.map((task) => task.title)).size).toBe(5);
    expect(new Set(tasks.map((task) => task.prompt)).size).toBe(5);
  });

  it("accepts a correct final result regardless of the chosen intermediate method", () => {
    const task = percentReviewL6Task("percent-review-connections", 2);
    const answers = task.fields.map((field, index) => (
      index === task.fields.length - 1 ? String(field.answer).replace(".", ",") : "999"
    ));

    expect(isPercentReviewFinalAnswerCorrect(task, answers)).toBe(true);
  });

  it("shows every proportional step before calculating absences and attendance", () => {
    const task = percentReviewL6Task("percent-review-connections", 1);

    expect(task.fields.map((field) => [field.answer, field.relationLabel])).toEqual([
      [45, "30%"],
      [15, "10%"],
      [150, "100%"],
      [30, "20%"],
      [120, "80%"],
    ]);
  });

  it("rejects an incorrect final result", () => {
    const task = percentReviewL6Task("percent-review-stories", 0);
    const answers = task.fields.map(() => "1");

    expect(isPercentReviewFinalAnswerCorrect(task, answers)).toBe(false);
  });

  it("parses decimal commas used in Polish notation", () => {
    expect(parsePercentReviewNumber("299,2")).toBe(299.2);
    expect(parsePercentReviewNumber("")).toBeNull();
  });
});
