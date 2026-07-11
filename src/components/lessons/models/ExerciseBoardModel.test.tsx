// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";

afterEach(cleanup);

describe("ExerciseBoardModel", () => {
  it("pozwala osobno ustawić stronę i zadanie", () => {
    render(<ExerciseBoardModel seed={1} />);
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    fireEvent.click(plusButtons[0]!);
    fireEvent.click(plusButtons[1]!);
    fireEvent.click(plusButtons[1]!);
    expect(screen.getByText("Strona 2 · zadanie 3")).toBeInTheDocument();
  });
});
