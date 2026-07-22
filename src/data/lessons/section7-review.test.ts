import { describe, expect, it } from "vitest";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";

describe("powtórzenie wiadomości o liczbach całkowitych", () => {
  const lesson = section7LessonsWpC7.find((item) => item.topicId === "M5-7.R");
  const stages = lesson?.stages.filter((stage) => stage.board.modelId === "integer-review-lab") ?? [];

  it("obejmuje oś, liczby przeciwne, działania, zadania z treścią i szyfr", () => {
    expect(lesson?.title).toBe("Powtórzenie wiadomości — liczby całkowite");
    expect(stages.map((stage) => stage.title)).toEqual([
      "Porównywanie na osi liczbowej",
      "Liczby przeciwne",
      "Działania na liczbach całkowitych",
      "Zadania z treścią",
      "Kod ekspedycji",
    ]);
  });

  it("udostępnia ten sam model na tablicy i tablecie", () => {
    for (const stage of stages) {
      expect(stage.board.modelId).toBe("integer-review-lab");
      expect(stage.student?.modelId).toBe("integer-review-lab");
    }
  });
});
