import { describe, expect, it } from "vitest";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m697OstroslupyV1 } from "@/data/lessons/m6-9-7-ostroslupy";

describe("M6-9.7 — Ostrosłupy", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.7")?.id).toBe(m697OstroslupyV1.id);
    expect(m697OstroslupyV1.status).toBe("published");
  });

  it("prowadzi przez modele, rozpoznawanie, liczenie, siatki i pole", () => {
    expect(m697OstroslupyV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Jak wyglądają ostrosłupy?",
      "Czy to jest ostrosłup?",
      "Policz elementy ostrosłupa",
      "Rozpoznaj siatkę ostrosłupa",
      "Proste pole powierzchni",
      "Ocena umiejętności",
    ]);
    expect(m697OstroslupyV1.stages.filter((stage) => stage.board.modelId === "pyramid-lab")).toHaveLength(5);
  });

  it("ma trzy cele i po jednym kryterium", () => {
    expect(m697OstroslupyV1.learningGoals).toHaveLength(3);
    expect(m697OstroslupyV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
