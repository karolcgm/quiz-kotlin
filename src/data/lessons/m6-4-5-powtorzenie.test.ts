import { describe, expect, it } from "vitest";
import { m645PowtorzenieV1 } from "@/data/lessons/m6-4-5-powtorzenie";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { MOTION_REVIEW_STORY_TASKS, MOTION_REVIEW_TABLE_ROWS } from "@/lib/math/everyday/distance";

describe("M6-4.5 Powtórzenie wiadomości", () => {
  it("publikuje gotowe powtórzenie zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-4.5")?.id).toBe(m645PowtorzenieV1.id);
    expect(m645PowtorzenieV1.status).toBe("published");
  });

  it("zawiera różne zadania na drogę, prędkość i czas", () => {
    expect(new Set(MOTION_REVIEW_TABLE_ROWS.map((row) => row.missing))).toEqual(new Set(["speed", "time", "distance"]));
    expect(new Set(MOTION_REVIEW_STORY_TASKS.map((task) => task.missing))).toEqual(new Set(["speed", "time", "distance"]));
    expect(new Set(MOTION_REVIEW_STORY_TASKS.map((task) => task.prompt)).size).toBe(MOTION_REVIEW_STORY_TASKS.length);
  });
});
