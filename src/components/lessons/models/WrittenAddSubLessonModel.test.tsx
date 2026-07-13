// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { writtenOperationColumnCount, WrittenAddSubLessonModel } from "@/components/lessons/models/WrittenAddSubLessonModel";

afterEach(cleanup);

describe("WrittenAddSubLessonModel", () => {
  it("przewiduje cztery kolumny dla 500 + 1200 = 1700", () => {
    expect(writtenOperationColumnCount(500, 1200, 1700)).toBe(4);
  });

  it("dodaje kratki dla tysiÄ™cy w przeniesieniach i wyniku", () => {
    const { container } = render(<WrittenAddSubLessonModel seed={2} taskSeed={4} />);

    expect(Array.from(container.querySelectorAll("div[style]")).some((element) => element.getAttribute("style")?.includes("repeat(4") ?? false)).toBe(true);
    expect(container.querySelectorAll("button")).toHaveLength(8);
  });

  it("pozwala wpisaÄ‡ 10 w kratce przeniesienia podczas odejmowania", () => {
    render(<WrittenAddSubLessonModel seed={2} taskSeed={4} />);

    fireEvent.click(screen.getByRole("button", { name: "Przeniesienie, kolumna 4" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    expect(screen.getByRole("button", { name: "Przeniesienie, kolumna 4" })).toHaveTextContent("10");
  });
});
