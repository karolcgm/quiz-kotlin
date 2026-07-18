import { describe, expect, it } from "vitest";
import { m551DecimalNotationL1V1, section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";

describe("WP-S5-01 — rejestr lekcji", () => {
  it("udostępnia jeden temat M5-5.1 zawierający oba kierunki zamiany", () => {
    const lessons = section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.1");
    expect(lessons).toEqual([m551DecimalNotationL1V1]);
    expect(lessons[0]?.lessonNumber).toBe(1);
    expect(lessons[0]?.stages.some((stage) => stage.id.endsWith("-fraction-to-decimal-practice"))).toBe(true);
  });
});
