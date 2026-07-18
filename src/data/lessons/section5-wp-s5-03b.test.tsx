import { describe, expect, it } from "vitest";
import { section5LessonsWpC5 } from "@/data/lessons/section5-wp-c5";

describe("WP-S5-03 — rejestr tematu", () => {
  it("pokazuje jeden spójny temat zamiast osobnych, powtarzających się lekcji", () => {
    const lessons = section5LessonsWpC5.filter((lesson) => lesson.topicId === "M5-5.3");
    expect(lessons).toHaveLength(1);
    expect(lessons[0]?.id).toBe("m5-5-3-jednostki-dlugosci-i-masy-l1-v2");
  });
});
