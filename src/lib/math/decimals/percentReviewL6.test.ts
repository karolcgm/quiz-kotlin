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

  it.each(activities)("accepts the correct final result for every %s task regardless of intermediate values", (activity) => {
    Array.from({ length: 5 }, (_, seed) => percentReviewL6Task(activity, seed)).forEach((task) => {
      const answers = task.fields.map((field, index) => (
        index === task.fields.length - 1 ? String(field.answer).replace(".", ",") : "999"
      ));

      expect(isPercentReviewFinalAnswerCorrect(task, answers)).toBe(true);
    });
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

  it("shows the percentage calculations for both price changes", () => {
    const task = percentReviewL6Task("percent-review-connections", 2);

    expect(task.fields.map((field) => [field.answer, field.relationLabel])).toEqual([
      [320, "100%"],
      [32, "10%"],
      [16, "5%"],
      [48, "15%"],
      [272, "100% nowej ceny"],
      [27.2, "10%"],
      [299.2, "110%"],
    ]);
  });

  it("keeps a complete calculation path in the remaining combined word problems", () => {
    const expectedAnswers = [
      [160, 16, 8, 56, 104, 26, 82],
      [1.5, 0.15, 0.6, 1.1, 2, 0.02, 1.1, 55],
      [250, 25, 150, 15, 60],
    ];

    [0, 3, 4].forEach((seed, index) => {
      const task = percentReviewL6Task("percent-review-connections", seed);
      expect(task.fields.map((field) => field.answer)).toEqual(expectedAnswers[index]);
    });
  });

  it("does not reveal the missing pie-chart percentage and provides space for every calculation", () => {
    const task = percentReviewL6Task("percent-review-diagrams", 1);
    const hiddenCategory = task.chart?.categories.find((category) => category.label === "inne");

    expect(hiddenCategory?.hideValue).toBe(true);
    expect(task.fields.map((field) => [field.answer, field.relationLabel])).toEqual([
      [75, "35% + 25% + 15%"],
      [25, "100% − 75%"],
      [200, "100%"],
      [2, "1%"],
      [50, "25%"],
    ]);
  });

  it("gives every diagram task enough fields to show the calculations", () => {
    const expectedAnswers = [
      [20, 2, 8, 25, 0.25, 8, 0],
      [75, 25, 200, 2, 50],
      [30, 3, 9, 20, 2, 8, 17],
      [15, 10, 25, 160, 1.6, 40],
      [80, 8, 40, 120, 12, 48, 8],
    ];

    expectedAnswers.forEach((answers, seed) => {
      const task = percentReviewL6Task("percent-review-diagrams", seed);
      expect(task.fields.map((field) => field.answer)).toEqual(answers);
      expect(task.fields.length).toBeGreaterThanOrEqual(5);
    });
  });

  it("gives every review word problem enough fields to show the percentage reasoning", () => {
    const expectedAnswers = [
      [480, 48, 24, 312, 168, 84, 84],
      [800, 80, 40, 280, 520, 160, 680],
      [2400, 240, 120, 1080, 720, 1800, 600],
      [300, 30, 15, 60, 105, 165, 135],
      [500, 50, 10, 60, 560, 112, 448],
    ];

    expectedAnswers.forEach((answers, seed) => {
      const task = percentReviewL6Task("percent-review-stories", seed);
      expect(task.fields.map((field) => field.answer)).toEqual(answers);
      expect(task.fields.length).toBeGreaterThanOrEqual(7);
    });
  });

  it("rejects an incorrect final result", () => {
    const task = percentReviewL6Task("percent-review-stories", 0);
    const answers = task.fields.map(() => "1");

    expect(isPercentReviewFinalAnswerCorrect(task, answers)).toBe(false);
  });

  it.each(activities)("rejects an incorrect final result for every %s task even when intermediate values are correct", (activity) => {
    Array.from({ length: 5 }, (_, seed) => percentReviewL6Task(activity, seed)).forEach((task) => {
      const answers = task.fields.map((field, index) => (
        index === task.fields.length - 1
          ? String(field.answer + 1)
          : String(field.answer).replace(".", ",")
      ));

      expect(isPercentReviewFinalAnswerCorrect(task, answers)).toBe(false);
    });
  });

  it("parses decimal commas used in Polish notation", () => {
    expect(parsePercentReviewNumber("299,2")).toBe(299.2);
    expect(parsePercentReviewNumber("")).toBeNull();
  });
});
