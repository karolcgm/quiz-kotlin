/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompositeAreaLab } from "@/components/lessons/area/CompositeAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function chooseGridPoint(grid: SVGSVGElement, x: number, y: number) {
  fireEvent(grid, new MouseEvent("pointerdown", {
    bubbles: true,
    clientX: 34 + x * 58,
    clientY: 34 + y * 58,
  }));
}

describe("CompositeAreaLab", () => {
  it("przypomina wzory na pola, także ze zwykłym zapisem dzielenia przez 2", () => {
    render(<CompositeAreaLab activity="formula-recap" />);

    expect(screen.getByRole("heading", { name: "Przypomnienie wzorów na pola" })).toBeInTheDocument();
    expect(screen.getByText("Kwadrat")).toBeInTheDocument();
    expect(screen.getByText("Trapez")).toBeInTheDocument();
    expect(screen.getAllByLabelText("ułamek przez 2").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText("a · h")[0]).toHaveClass("border-b-[3px]");
  });

  it("pozwala dotknąć dwóch węzłów, podzielić figurę i przejść do następnego zadania", () => {
    vi.useFakeTimers();
    render(<CompositeAreaLab activity="grid-practice" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    const grid = screen.getByRole("img", { name: /kratownica/iu }) as unknown as SVGSVGElement;
    vi.spyOn(grid, "getBoundingClientRect").mockReturnValue({
      bottom: 532, height: 532, left: 0, right: 648, top: 0, width: 648, x: 0, y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    chooseGridPoint(grid, 5, 1);
    chooseGridPoint(grid, 5, 4);
    fireEvent.click(screen.getByRole("button", { name: "Dodaj odcinek podziału" }));
    expect(screen.getByRole("status")).toHaveTextContent("Podział jest gotowy");

    const firstAnswer = screen.getByLabelText("Pole A — prostokąt");
    expect(firstAnswer).toHaveAttribute("inputmode", "none");
    expect(firstAnswer).toHaveAttribute("readonly");
    fireEvent.click(firstAnswer);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "4" }));

    fireEvent.click(screen.getByLabelText("Pole B — prostokąt"));
    fireEvent.click(screen.getByRole("button", { name: "9" }));
    fireEvent.click(screen.getByLabelText("Pole całego wielokąta"));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("24 cm² + 9 cm² = 33 cm²");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("ma trudniejsze zadanie wymagające dwóch odcinków podziału", () => {
    render(<CompositeAreaLab activity="grid-challenge" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByText(/dwa odcinki podziału/iu)).toBeInTheDocument();
  });

  it("w powtórzeniu pokazuje osobny zestaw figur na kratownicy", () => {
    render(<CompositeAreaLab activity="grid-review" />);

    expect(screen.getByRole("heading", { name: "Powtórzenie: wielokąty na kratownicy" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByText(/trapez i trójkąt/iu)).toBeInTheDocument();
    expect(document.querySelector("[data-composite-cut='true']")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dodaj odcinek podziału" })).toBeDisabled();
  });

  it("pozwala nauczycielowi swobodnie przeglądać zadania bez ich rozwiązywania", () => {
    render(<CompositeAreaLab activity="grid-review" allowFreeNavigation />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Następne zadanie/iu }));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Następne zadanie/iu }));
    expect(screen.getByText("Zadanie 3/4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Poprzednie zadanie/iu }));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();
  });
});
