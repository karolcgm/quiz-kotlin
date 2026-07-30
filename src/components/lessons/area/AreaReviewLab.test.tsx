/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AreaReviewLab } from "@/components/lessons/area/AreaReviewLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AreaReviewLab", () => {
  it("prowadzi serię pól figur w jednym układzie i przechodzi po poprawnej odpowiedzi", () => {
    vi.useFakeTimers();
    render(<AreaReviewLab activity="formula-sprint" />);

    expect(screen.getByText("Zadanie 1/7")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole prostokąta");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("7 · 6 = 42 cm²");

    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByText("Zadanie 2/7")).toBeInTheDocument();
  });

  it("ma osobną serię zamian jednostek pola", () => {
    render(<AreaReviewLab activity="unit-sprint" />);

    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    expect(screen.getByText("Uzupełnij: 3 m² = … cm².")).toBeInTheDocument();
    expect(screen.getByText("Zamiana jednostek pola")).toBeInTheDocument();
  });

  it("ma osobne serie z brakującymi wielkościami i zadaniami z treścią", () => {
    const { rerender } = render(<AreaReviewLab activity="figure-sprint" />);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText(/pole trójkąta wynosi 24 cm²/iu)).toBeInTheDocument();

    rerender(<AreaReviewLab activity="story-sprint" />);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText(/równoległoboczna rabata/iu)).toBeInTheDocument();
  });

  it("rysuje wysokość trójkąta rozwartokątnego poza figurą", () => {
    render(<AreaReviewLab activity="g6-triangle" />);

    for (let task = 0; task < 3; task += 1) {
      screen.getAllByRole("textbox").forEach((input) => {
        fireEvent.click(input);
        fireEvent.click(screen.getByRole("button", { name: "0" }));
      });
      fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
      fireEvent.click(screen.getByRole("button", { name: "Przejdź dalej bez punktu" }));
    }

    expect(screen.getByText("Zadanie 4/4")).toBeInTheDocument();
    expect(document.querySelector("[data-grade6-obtuse-triangle='true']")).toBeInTheDocument();
    expect(screen.getByText(/wysokość opuszczona na podstawę leży poza figurą/iu)).toBeInTheDocument();
  });

  it("dzieli trapez na rzeczywisty prostokąt i trójkąt", () => {
    render(<AreaReviewLab activity="g6-trapezoid" />);

    for (let task = 0; task < 3; task += 1) {
      screen.getAllByRole("textbox").forEach((input) => {
        fireEvent.click(input);
        fireEvent.click(screen.getByRole("button", { name: "0" }));
      });
      fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
      fireEvent.click(screen.getByRole("button", { name: "Przejdź dalej bez punktu" }));
    }

    expect(screen.getByText("Zadanie 4/4")).toBeInTheDocument();
    expect(document.querySelector("[data-grade6-composite-trapezoid='true']")).toBeInTheDocument();
    expect(screen.getByText(/podzielono wysokością na prostokąt i trójkąt/iu)).toBeInTheDocument();
  });

  it("daje w zadaniach klasy 6 miejsce na kolejne etapy obliczeń", () => {
    render(<AreaReviewLab activity="g6-trapezoid" />);

    const firstLine = screen.getByLabelText("Obliczenie 1");
    expect(firstLine).toHaveAttribute("inputmode", "none");
    expect(firstLine).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Obliczenie 2")).toBeInTheDocument();
    expect(screen.getByLabelText("Obliczenie 3")).toBeInTheDocument();

    fireEvent.click(firstLine);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Wpisz znak plus" }));
    fireEvent.click(screen.getByRole("button", { name: "9" }));

    expect(firstLine).toHaveValue("15+9");
  });
});
