/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrapezoidAreaLab } from "@/components/lessons/area/TrapezoidAreaLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("TrapezoidAreaLab", () => {
  it("wyjaśnia podstawy, ramiona i wysokość trapezu", () => {
    render(<TrapezoidAreaLab activity="trapezoid-parts" />);

    expect(screen.getByRole("heading", { name: "Podstawy, ramiona i wysokość trapezu" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Trapez z dwiema podstawami i wysokością" })).toBeInTheDocument();
    expect(screen.getByText(/podstawy a i b/iu)).toBeInTheDocument();
    expect(screen.getByText(/wysokość h/iu)).toBeInTheDocument();
  });

  it("pokazuje wzór jako licznik nad kreską ułamkową", () => {
    render(<TrapezoidAreaLab activity="trapezoid-formula" />);

    const formula = screen.getByTestId("trapezoid-area-formula");
    expect(formula).toHaveTextContent("P =");
    expect(formula).toHaveTextContent("(a + b) · h");
    expect(formula).toHaveTextContent("2");
    const numerator = [...formula.querySelectorAll("span")].find((element) => element.textContent === "(a + b) · h");
    expect(numerator).toHaveClass("border-b-[3px]");
  });

  it("prowadzi całą serię obliczeń na jednym slajdzie i blokuje klawiaturę systemową", () => {
    vi.useFakeTimers();
    render(<TrapezoidAreaLab activity="trapezoid-calculations" />);

    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    const answer = screen.getByLabelText("Pole trapezu");
    expect(answer).toHaveAttribute("inputmode", "none");
    expect(answer).toHaveAttribute("readonly");

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("(12 + 8) · 5 : 2 = 50");

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
  });

  it("rozpoczyna zadania tekstowe od pierwszego zadania", () => {
    render(<TrapezoidAreaLab activity="trapezoid-stories" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText(/rabata ma kształt trapezu/iu)).toBeInTheDocument();
  });
});
