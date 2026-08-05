import { describe, expect, it } from "vitest";
import { m694PolePowierzchniGraniastoslupaProstegoV1 } from "@/data/lessons/m6-9-4-pole-powierzchni-graniastoslupa-prostego";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-9.4 — Pole powierzchni graniastosłupa prostego", () => {
  it("publikuje gotową lekcję", () => {
    expect(getLessonPackageForTopic("M6-9.4")?.id).toBe(m694PolePowierzchniGraniastoslupaProstegoV1.id);
    expect(m694PolePowierzchniGraniastoslupaProstegoV1.status).toBe("published");
  });

  it("prowadzi przez wzór, obliczenia i zadania tekstowe", () => {
    expect(m694PolePowierzchniGraniastoslupaProstegoV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Jak obliczamy pole powierzchni?",
      "Oblicz pole powierzchni",
      "Zadania tekstowe",
      "Ocena umiejętności",
    ]);
    expect(m694PolePowierzchniGraniastoslupaProstegoV1.stages.filter((stage) => stage.board.modelId === "prism-surface-area-lab")).toHaveLength(3);
  });

  it("ma trzy cele i po jednym kryterium", () => {
    expect(m694PolePowierzchniGraniastoslupaProstegoV1.learningGoals).toHaveLength(3);
    expect(m694PolePowierzchniGraniastoslupaProstegoV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
