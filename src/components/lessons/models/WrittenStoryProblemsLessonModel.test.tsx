// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WrittenStoryProblemsLessonModel } from "@/components/lessons/models/WrittenStoryProblemsLessonModel";

afterEach(cleanup);

describe("WrittenStoryProblemsLessonModel", () => {
  it("zgłasza wpisany wynik zadania tekstowego do planu ucznia", () => {
    const reporter = vi.fn();
    render(<WrittenStoryProblemsLessonModel seed={1} onResultChange={reporter} />);
    reporter.mockClear();

    const resultCells = screen.getAllByRole("button", { name: /Wynik, kolumna/ });
    "423".split("").forEach((digit, index) => {
      fireEvent.click(resultCells[index]!);
      fireEvent.click(screen.getByRole("button", { name: digit }));
    });

    expect(reporter).toHaveBeenLastCalledWith(true, "423");
    expect(resultCells.map((cell) => cell.textContent).join("")).toBe("423");
  });
});
