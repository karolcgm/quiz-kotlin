// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { NaturalNumbersLessonModel, numberToPolishWords } from "@/components/lessons/models/NaturalNumbersLessonModel";

afterEach(cleanup);

describe("NaturalNumbersLessonModel", () => {
  it("poprawnie zapisuje duże liczby słownie", () => {
    expect(numberToPolishWords(1_000)).toBe("tysiąc");
    expect(numberToPolishWords(12_034)).toBe("dwanaście tysięcy trzydzieści cztery");
    expect(numberToPolishWords(100_000)).toBe("sto tysięcy");
  });

  it("renderuje pięć różnych stacji zadaniowych", () => {
    for (let station = 1; station <= 5; station += 1) {
      const { container, unmount } = render(<NaturalNumbersLessonModel seed={station} taskSeed={station * 31} questionNumber={1} questionCount={3} onResultChange={() => undefined} />);
      expect(container.textContent).toContain("Zadanie 1/3");
      expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("zadanie zapisu słownego ma dokładnie cztery odpowiedzi ABCD", () => {
    const { container } = render(<NaturalNumbersLessonModel seed={2} taskSeed={2026} />);
    expect(container.querySelectorAll("button")).toHaveLength(4);
    expect(container.textContent).toContain("A.");
    expect(container.textContent).toContain("D.");
  });
});
