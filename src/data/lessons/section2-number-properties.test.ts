import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  m521WielokrotnosciV2,
  m522DzielnikiV2,
  m523CechyPodzielnosciV2,
} from "@/data/lessons/section2-number-properties";
import { listLessonPackages } from "@/data/lessons/registry";

describe("Dział II — własności liczb naturalnych", () => {
  it("publikuje nowe wersje tematów w głównym rejestrze", () => {
    const byTopic = new Map(listLessonPackages().map((lesson) => [lesson.topicId, lesson]));
    expect(byTopic.get("M5-2.1")?.id).toBe(m521WielokrotnosciV2.id);
    expect(byTopic.get("M5-2.2")?.id).toBe(m522DzielnikiV2.id);
    expect(byTopic.get("M5-2.3")?.id).toBe(m523CechyPodzielnosciV2.id);
    expect([m521WielokrotnosciV2, m522DzielnikiV2, m523CechyPodzielnosciV2].every((lesson) => lesson.status === "published")).toBe(true);
  });

  it("zachowuje obowiązkowy slajd otwierający i zamykający", () => {
    for (const lesson of [m521WielokrotnosciV2, m522DzielnikiV2, m523CechyPodzielnosciV2]) {
      expect(lesson.stages[0]?.board.modelId).toBe("exercise-board");
      expect(lesson.stages.at(-1)?.id).toBe(`${lesson.topicId.toLowerCase().replace(/\./g, "-")}-understanding`);
    }
  });

  it("ma pełny układ zadań dla wielokrotności, dzielników i cech podzielności", () => {
    const multiples = m521WielokrotnosciV2.stages.filter((stage) => stage.board.modelId === "multiples-lesson");
    const divisors = m522DzielnikiV2.stages.filter((stage) => stage.board.modelId === "divisors-lesson");
    const animals = m523CechyPodzielnosciV2.stages.find((stage) => stage.board.modelId === "divisibility-animals-lesson");

    expect(multiples.map((stage) => stage.questions.length)).toEqual([1, 3, 4, 1]);
    expect(divisors.map((stage) => stage.questions.length)).toEqual([1, 3, 4, 1]);
    expect(animals?.questions).toHaveLength(7);
    expect(animals?.questions.every((question) => question.generatorId === "divisibility-animals-v1")).toBe(true);
  });

  it("zapisuje wszystkie dziewięć ilustracji wewnątrz projektu", () => {
    const files = [
      "chrupek-multiples-crayons-v1.webp",
      "chrupek-divisors-badges-v1.webp",
      "divisibility-ladybug-v1.webp",
      "divisibility-chameleon-v1.webp",
      "divisibility-butterfly-v1.webp",
      "divisibility-bee-v1.webp",
      "divisibility-dragonfly-v1.webp",
      "divisibility-owl-v1.webp",
      "divisibility-peacock-v1.webp",
    ];
    for (const file of files) expect(existsSync(resolve("public/lessons/illustrations/number-properties", file)), file).toBe(true);
  });
});
