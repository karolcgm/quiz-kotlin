import { describe, expect, it } from "vitest";
import { m692GraniastoslupyProsteV1 } from "@/data/lessons/m6-9-2-graniastoslupy-proste";
import { getLessonPackageForTopic } from "@/data/lessons/registry";

describe("M6-9.2 — Graniastosłupy proste", () => {
  it("publikuje gotową lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.2")?.id).toBe(m692GraniastoslupyProsteV1.id);
    expect(m692GraniastoslupyProsteV1.status).toBe("published");
  });

  it("prowadzi przez podział brył, podstawy i jedną serię zadań o elementach", () => {
    expect(m692GraniastoslupyProsteV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Jak dzielimy bryły przestrzenne?",
      "Nazwa graniastosłupa i jego podstawa",
      "Ściany, krawędzie i wierzchołki",
      "Ocena umiejętności",
    ]);
    expect(m692GraniastoslupyProsteV1.stages.filter((stage) => stage.board.modelId === "right-prism-lab")).toHaveLength(3);
  });

  it("ma trzy cele i po jednym kryterium do każdego celu", () => {
    expect(m692GraniastoslupyProsteV1.learningGoals).toHaveLength(3);
    expect(m692GraniastoslupyProsteV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
    expect(m692GraniastoslupyProsteV1.successCriteria).toHaveLength(3);
    expect(m692GraniastoslupyProsteV1.successCriteria).toContain("Rozpoznaję graniastosłup prosty.");
    expect(m692GraniastoslupyProsteV1.successCriteria.join(" ")).not.toMatch(/pochył|ostrosłup/u);
  });
});
