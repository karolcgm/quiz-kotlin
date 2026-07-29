import { describe, expect, it } from "vitest";
import { m643CzasV1 } from "@/data/lessons/m6-4-3-czas";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { TIME_PRACTICE_TASKS } from "@/lib/math/everyday/distance";

describe("M6-4.3 Czas", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-4.3")?.id).toBe(m643CzasV1.id);
    expect(m643CzasV1.status).toBe("published");
  });

  it("wykorzystuje godziny, minuty i sekundy", () => {
    expect(new Set(TIME_PRACTICE_TASKS.map((task) => task.answerUnit))).toEqual(new Set(["h", "min", "s"]));
  });

  it("nie powtarza zadań ani ilustracji", () => {
    expect(new Set(TIME_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(TIME_PRACTICE_TASKS.length);
    expect(new Set(TIME_PRACTICE_TASKS.map((task) => task.imageSrc)).size).toBe(TIME_PRACTICE_TASKS.length);
  });

  it("nie podaje w kolejnych poleceniach gotowego działania", () => {
    expect(TIME_PRACTICE_TASKS.slice(1).every((task) => !task.hint.includes("podziel"))).toBe(true);
  });
});
