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

    fireEvent.change(screen.getByLabelText("Obliczenia do zadania tekstowego"), { target: { value: "6×18+12" } });
    "120".split("").forEach((digit) => fireEvent.click(screen.getByRole("button", { name: digit })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "6×18+12 | 120");
    expect(screen.getByRole("status")).toHaveTextContent("Rozwiązanie jest poprawne");
  });

  it("w drugim zadaniu wymaga wybrania tylko potrzebnych danych", () => {
    const reporter = vi.fn();
    render(<WrittenStoryProblemsLessonModel seed={2} onResultChange={reporter} />);
    reporter.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "48 wszystkich miejsc" }));
    fireEvent.click(screen.getByRole("button", { name: "29 zajętych miejsc" }));
    fireEvent.change(screen.getByLabelText("Obliczenia do zadania tekstowego"), { target: { value: "48-29" } });
    "19".split("").forEach((digit) => fireEvent.click(screen.getByRole("button", { name: digit })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź rozwiązanie" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "48-29 | 19");
  });
});
