import { describe, expect, it } from "vitest";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m699PowtorzenieFigurPrzestrzennychV1 } from "@/data/lessons/m6-9-9-powtorzenie-figur-przestrzennych";

describe("M6-9.9 — Powtórzenie wiadomości", () => {
  it("jest opublikowane i dostępne w rejestrze", () => {
    expect(getLessonPackageForTopic("M6-9.9")?.id).toBe(m699PowtorzenieFigurPrzestrzennychV1.id);
    expect(m699PowtorzenieFigurPrzestrzennychV1.status).toBe("published");
  });

  it("ma pięć interaktywnych serii na jednej karcie każda", () => {
    const interactiveStages = m699PowtorzenieFigurPrzestrzennychV1.stages.filter((stage) => stage.board.modelId === "solid-review-lab");
    expect(interactiveStages.map((stage) => stage.title)).toEqual([
      "Bryły i ich elementy",
      "Siatki bez pułapek",
      "Pole powierzchni",
      "Objętość graniastosłupa",
      "Wyzwanie końcowe",
    ]);
    expect(interactiveStages).toHaveLength(5);
  });

  it("ma trzy cele i po jednym kryterium sukcesu", () => {
    expect(m699PowtorzenieFigurPrzestrzennychV1.learningGoals).toHaveLength(3);
    expect(m699PowtorzenieFigurPrzestrzennychV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
