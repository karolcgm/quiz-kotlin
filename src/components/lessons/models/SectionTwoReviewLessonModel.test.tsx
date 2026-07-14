// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SectionTwoReviewLessonModel } from "@/components/lessons/models/SectionTwoReviewLessonModel";

afterEach(cleanup);

describe("SectionTwoReviewLessonModel", () => {
  it("renderuje sześć różnych stacji całego Działu II", () => {
    for (let station = 1; station <= 6; station += 1) {
      const { container, unmount } = render(<SectionTwoReviewLessonModel seed={station} questionNumber={1} questionCount={4} />);
      expect(container.querySelector(`[data-section-two-review-station="${station}"]`)).not.toBeNull();
      expect(screen.getByText(`Zadanie 1/4`)).toBeInTheDocument();
      unmount();
    }
  });

  it("sprawdza pełny zestaw wielokrotności razem z zerem", () => {
    const reporter = vi.fn();
    render(<SectionTwoReviewLessonModel seed={1} questionNumber={1} questionCount={4} onResultChange={reporter} />);
    reporter.mockClear();

    [0, 4, 8, 12, 16, 20].forEach((value) => fireEvent.click(screen.getByRole("button", { name: String(value) })));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zaznaczenie" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "0, 4, 8, 12, 16, 20");
  });

  it("w ostatniej stacji rozpoznaje NWD w zadaniu o jednakowych paczkach", () => {
    const reporter = vi.fn();
    render(<SectionTwoReviewLessonModel seed={6} questionNumber={1} questionCount={4} onResultChange={reporter} />);
    reporter.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "NWD = 12" }));

    expect(reporter).toHaveBeenLastCalledWith(true, "NWD = 12");
    expect(screen.getByRole("status")).toHaveTextContent("NWD(48,60)=12");
  });
});
