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

  it("blokuje oba przyciski cyfry jedności", () => {
    render(<MentalAddSubLessonModel seed={2} taskSeed={2200} questionNumber={1} questionCount={10} onResultChange={() => undefined} />);
    const labels = screen.getAllByText("jedności");
    const card = labels[0]?.parentElement;
    expect(card?.querySelectorAll("button:disabled")).toHaveLength(2);
    expect(card?.textContent).toContain("0");
    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
  });
});
