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
    expect(screen.getAllByRole("button", { name: /Przeniesienie/ })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /Wynik, kolumna/ })).toHaveLength(4);
  });

  it("pozwala wpisaÄ‡ 10 w kratce przeniesienia podczas odejmowania", () => {
    render(<WrittenAddSubLessonModel seed={2} taskSeed={4} />);

    fireEvent.click(screen.getByRole("button", { name: "Przeniesienie, kolumna 4" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));

    expect(screen.getByRole("button", { name: "Przeniesienie, kolumna 4" })).toHaveTextContent("10");
  });

  it("w zadaniu tekstowym pozostawia obie liczby do samodzielnego wpisania", () => {
    render(<WrittenAddSubLessonModel seed={3} questionNumber={1} questionCount={1} />);

    expect(screen.getByText("Książki do szkolnej biblioteki")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Pierwsza liczba/ })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /Druga liczba/ })).toHaveLength(4);
    expect(screen.getByText("Dane")).toBeInTheDocument();
    expect(screen.getByText("Odpowiedź")).toBeInTheDocument();
  });
});
