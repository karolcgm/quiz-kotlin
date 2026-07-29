import { describe, expect, it } from "vitest";
import { m642PredkoscV1 } from "@/data/lessons/m6-4-2-predkosc";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { SPEED_PRACTICE_TASKS } from "@/lib/math/everyday/distance";

describe("M6-4.2 Prędkość", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-4.2")?.id).toBe(m642PredkoscV1.id);
    expect(m642PredkoscV1.status).toBe("published");
  });

  it("wykorzystuje różne jednostki prędkości", () => {
    const units = new Set(SPEED_PRACTICE_TASKS.map((task) => task.answerUnit));
    expect(units).toEqual(new Set(["km/h", "m/min", "m/s"]));
  });

  it("nie powtarza poleceń", () => {
    expect(new Set(SPEED_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(SPEED_PRACTICE_TASKS.length);
  });
});
