import { describe, expect, it } from "vitest";
import { section8LessonsWpC8 } from "@/data/lessons/section8-wp-c8";

describe("jednostki objętości", () => {
  const lesson = section8LessonsWpC8.find((item) => item.topicId === "M5-8.1");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "volume-units-lab") ?? [];

  it("prowadzi ucznia od definicji przez bryłę z klocków do doboru jednostek", () => {
    expect(lesson?.title).toBe("Jednostki objętości");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Co to jest objętość?",
      "Bryła z sześcianów",
      "Ile sześcianów?",
      "Dopasuj jednostkę",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.student?.modelId).toBe("volume-units-lab");
      expect(stage.board.modelId).toBe("volume-units-lab");
    }
  });
});
