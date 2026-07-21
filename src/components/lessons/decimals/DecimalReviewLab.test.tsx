/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalReviewLab } from "@/components/lessons/decimals/DecimalReviewLab";

afterEach(cleanup);

describe("DecimalReviewLab", () => {
  it("pokazuje jedno zadanie we wspólnej karcie i pionowy ułamek", () => {
    const { container } = render(<DecimalReviewLab activity="decimal-review-notation" seed={0} questionNumber={1} questionCount={5} />);

    expect(container.querySelectorAll("[data-lesson-task-frame]")).toHaveLength(1);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Licznik ułamka" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mianownik ułamka" })).toBeInTheDocument();
    expect(container.textContent).not.toContain("3/8");
    expect(container.querySelectorAll("input")).toHaveLength(0);
    expect(container.querySelector("[data-lesson-numeric-keypad='shared']")).not.toBeNull();
  });

  it("zalicza zamianę 0,375 na trzy ósme", () => {
    const onResultChange = vi.fn();
    render(<DecimalReviewLab activity="decimal-review-notation" seed={0} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Mianownik ułamka" }));
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "3 przez 8");
  });

  it("w zadaniu tekstowym pozostawia liczby i działanie do wpisania przez ucznia", () => {
    const onResultChange = vi.fn();
    render(<DecimalReviewLab activity="decimal-review-problems" seed={0} onResultChange={onResultChange} />);

    expect(screen.getByRole("button", { name: "Pierwsza liczba działania" })).toHaveTextContent("□");
    expect(screen.getByRole("button", { name: "Druga liczba działania" })).toHaveTextContent("□");
    expect(screen.getByRole("button", { name: "Wynik działania" })).toHaveTextContent("□");

    for (const key of ["8", ", przecinek", "4"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: ":" }));
    fireEvent.click(screen.getByRole("button", { name: "Druga liczba działania" }));
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "Wynik działania" }));
    for (const key of ["1", ", przecinek", "4"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8,4 : 6 = 1,4 m");
  });
});
