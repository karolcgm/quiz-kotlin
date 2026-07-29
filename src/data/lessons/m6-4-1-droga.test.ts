import { describe, expect, it } from "vitest";
import { m641DrogaV1 } from "@/data/lessons/m6-4-1-droga";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-4.1 Droga", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-4.1")?.id).toBe(m641DrogaV1.id);
    expect(m641DrogaV1.status).toBe("published");
  });

  it("zawiera wyjaśnienie trójkąta i dwie serie zadań", () => {
    const stages = m641DrogaV1.stages.filter((stage) => stage.student?.modelId === "distance-motion-lab");
    expect(stages).toHaveLength(3);
    expect(stages[0].questions).toHaveLength(0);
    expect(stages.slice(1).every((stage) => stage.questions.length === 1)).toBe(true);
  });

  it("ma cele zgodne z obliczaniem drogi", () => {
    expect(m641DrogaV1.studentGoal).toMatch(/obliczać drogę/i);
    expect(m641DrogaV1.successCriteria.join(" ")).toContain("s = v · t");
  });
});
