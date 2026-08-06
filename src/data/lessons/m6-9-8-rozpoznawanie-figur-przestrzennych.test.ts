import { describe, expect, it } from "vitest";
import { getLessonPackageForTopic } from "@/data/lessons/registry";
import { m698RozpoznawanieFigurPrzestrzennychV1 } from "@/data/lessons/m6-9-8-rozpoznawanie-figur-przestrzennych";

describe("M6-9.8 — Rozpoznawanie figur przestrzennych", () => {
  it("publikuje pełną lekcję zamiast szkieletu", () => {
    expect(getLessonPackageForTopic("M6-9.8")?.id).toBe(m698RozpoznawanieFigurPrzestrzennychV1.id);
    expect(m698RozpoznawanieFigurPrzestrzennychV1.status).toBe("published");
  });

  it("zawiera jedną spójną serię dopasowań", () => {
    expect(m698RozpoznawanieFigurPrzestrzennychV1.stages.map((stage) => stage.title)).toEqual([
      "Cele lekcji (slajd 0)",
      "Dopasuj obrazek do nazwy",
      "Ocena umiejętności",
    ]);
    expect(m698RozpoznawanieFigurPrzestrzennychV1.stages.filter((stage) => stage.board.modelId === "solid-recognition-lab")).toHaveLength(1);
  });

  it("ma dwa cele i po jednym kryterium", () => {
    expect(m698RozpoznawanieFigurPrzestrzennychV1.learningGoals).toHaveLength(2);
    expect(m698RozpoznawanieFigurPrzestrzennychV1.learningGoals.every((goal) => goal.successCriteria.length === 1)).toBe(true);
  });
});
