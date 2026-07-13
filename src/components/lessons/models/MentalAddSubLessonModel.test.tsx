// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MentalAddSubLessonModel } from "@/components/lessons/models/MentalAddSubLessonModel";

afterEach(cleanup);

describe("MentalAddSubLessonModel", () => {
  it("pokazuje komplet nazw elementów dodawania i odejmowania", () => {
    render(<MentalAddSubLessonModel seed={1} />);
    expect(screen.getAllByText("składnik")).toHaveLength(2);
    expect(screen.getByText("suma")).toBeInTheDocument();
    expect(screen.getByText("odjemna")).toBeInTheDocument();
    expect(screen.getByText("odjemnik")).toBeInTheDocument();
    expect(screen.getByText("różnica")).toBeInTheDocument();
  });

  it("pokazuje wskazane przykłady bez powtórzeń", () => {
    const { rerender } = render(<MentalAddSubLessonModel seed={2} taskSeed={2200} questionNumber={1} questionCount={7} />);
    expect(screen.getByText(/120 \+ 450/)).toBeInTheDocument();
    rerender(<MentalAddSubLessonModel seed={2} taskSeed={2203} questionNumber={4} questionCount={7} />);
    expect(screen.getByText(/970 − 230/)).toBeInTheDocument();
    expect(screen.getByText("Zadanie 4/7")).toBeInTheDocument();
  });
});
