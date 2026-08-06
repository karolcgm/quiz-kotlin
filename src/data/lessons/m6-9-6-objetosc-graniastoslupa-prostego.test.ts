import { describe, expect, it } from "vitest";
import { m696ObjetoscGraniastoslupaProstegoV1 } from "@/data/lessons/m6-9-6-objetosc-graniastoslupa-prostego";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-9.6 — Objętość graniastosłupa prostego", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.6")?.id).toBe(m696ObjetoscGraniastoslupaProstegoV1.id);
    expect(m696ObjetoscGraniastoslupaProstegoV1.status).toBe("published");
  });

  it("prowadzi przez wzór, obliczenia i zadania tekstowe", () => {
    expect(m696ObjetoscGraniastoslupaProstegoV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Wzór na objętość",
      "Oblicz objętość",
      "Zadania tekstowe",
      "Ocena umiejętności",
    ]);
    expect(m696ObjetoscGraniastoslupaProstegoV1.stages.filter((stage) => stage.board.modelId === "prism-volume-lab")).toHaveLength(3);
  });

  it("ma trzy cele i po jednym kryterium", () => {
    expect(m696ObjetoscGraniastoslupaProstegoV1.learningGoals).toHaveLength(3);
    expect(m696ObjetoscGraniastoslupaProstegoV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
