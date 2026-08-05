import { describe, expect, it } from "vitest";
import { m693SiatkiGraniastoslupowProstychV1 } from "@/data/lessons/m6-9-3-siatki-graniastoslupow-prostych";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-9.3 — Siatki graniastosłupów prostych", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.3")?.id).toBe(m693SiatkiGraniastoslupowProstychV1.id);
    expect(m693SiatkiGraniastoslupowProstychV1.status).toBe("published");
  });

  it("ma trzy etapy: rozkładanie, rozpoznawanie i rysowanie", () => {
    expect(m693SiatkiGraniastoslupowProstychV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Rozłóż graniastosłup do siatki",
      "Rozpoznaj i sprawdź siatkę",
      "Narysuj siatkę",
      "Ocena umiejętności",
    ]);
    expect(m693SiatkiGraniastoslupowProstychV1.stages.filter((stage) => stage.board.modelId === "prism-nets-lab")).toHaveLength(3);
  });

  it("ma trzy cele i po jednym kryterium sukcesu", () => {
    expect(m693SiatkiGraniastoslupowProstychV1.learningGoals).toHaveLength(3);
    expect(m693SiatkiGraniastoslupowProstychV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m693SiatkiGraniastoslupowProstychV1.successCriteria).toHaveLength(3);
  });
});
