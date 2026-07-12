// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NaturalNumbersLessonModel, numberToPolishWords } from "@/components/lessons/models/NaturalNumbersLessonModel";

afterEach(cleanup);

describe("NaturalNumbersLessonModel", () => {
  it("poprawnie zapisuje duże liczby słownie", () => {
    expect(numberToPolishWords(1_000)).toBe("tysiąc");
    expect(numberToPolishWords(12_034)).toBe("dwanaście tysięcy trzydzieści cztery");
    expect(numberToPolishWords(100_000)).toBe("sto tysięcy");
    expect(numberToPolishWords(1_000_000)).toBe("milion");
    expect(numberToPolishWords(22_304_019)).toBe("dwadzieścia dwa miliony trzysta cztery tysiące dziewiętnaście");
    expect(numberToPolishWords(115_000_000)).toBe("sto piętnaście milionów");
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

  it("zadanie miejsca cyfry ma jedno pole odpowiedzi", () => {
    render(<NaturalNumbersLessonModel seed={1} taskSeed={2026} questionNumber={1} questionCount={3} onResultChange={() => undefined} />);
    expect(screen.getByRole("button", { name: "upuść tutaj jedną nazwę" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("pierwsze z trzech zadań zawsze pyta o grupę milionów", () => {
    render(<NaturalNumbersLessonModel seed={1} taskSeed={2026} questionNumber={1} questionCount={3} onResultChange={() => undefined} />);
    expect(screen.getByText(/milion/)).toBeInTheDocument();
  });
});
