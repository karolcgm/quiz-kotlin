import { describe, expect, it } from "vitest";
import { m644DrogaPredkoscCzasV1 } from "@/data/lessons/m6-4-4-droga-predkosc-czas";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { MOTION_STORY_TASKS, MOTION_TABLE_ROWS } from "@/lib/math/everyday/distance";

describe("M6-4.4 Droga, prędkość, czas", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-4.4")?.id).toBe(m644DrogaPredkoscCzasV1.id);
    expect(m644DrogaPredkoscCzasV1.status).toBe("published");
  });

  it("miesza wszystkie trzy szukane wielkości", () => {
    expect(new Set(MOTION_TABLE_ROWS.map((row) => row.missing))).toEqual(new Set(["speed", "time", "distance"]));
    expect(new Set(MOTION_STORY_TASKS.map((task) => task.missing))).toEqual(new Set(["speed", "time", "distance"]));
  });

  it("każda seria jest jednym slajdem ćwiczeniowym", () => {
    const taskStages = m644DrogaPredkoscCzasV1.stages.filter((stage) => stage.questions.length > 0);
    expect(taskStages).toHaveLength(2);
    expect(taskStages.every((stage) => stage.board.modelId === "distance-motion-lab")).toBe(true);
  });
});
