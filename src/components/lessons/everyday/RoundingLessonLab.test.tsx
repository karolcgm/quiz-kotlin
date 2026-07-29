// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoundingLessonLab } from "@/components/lessons/everyday/RoundingLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("RoundingLessonLab", () => {
  it("pokazuje nazwy miejsc cyfr po obu stronach przecinka", () => {
    const { container } = render(<RoundingLessonLab activity="place-values" />);
    expect(screen.getByText("setki")).toBeInTheDocument();
    expect(screen.getByText("jedności")).toBeInTheDocument();
    expect(screen.getByText("części dziesiętne")).toBeInTheDocument();
    expect(screen.getByText("części tysięczne")).toBeInTheDocument();
    const row = container.querySelector("[data-place-value-row]");
    expect(row).toHaveStyle({ gridTemplateColumns: "repeat(3, minmax(0, 1fr)) 1rem repeat(3, minmax(0, 1fr))" });
    expect(row?.children).toHaveLength(7);
  });

  it("w przykładzie odróżnia cyfrę zaokrąglaną od cyfry po prawej stronie", () => {
    render(<RoundingLessonLab activity="rounding-guide" />);
    expect(screen.getByText("Cyfra zaokrąglana: 6")).toBeInTheDocument();
    expect(screen.getByText("Cyfra po prawej: 7")).toBeInTheDocument();
    expect(screen.getByText("12,67 ≈ 12,7")).toBeInTheDocument();
  });

  it("blokuje pustą odpowiedź i korzysta wyłącznie z klawiatury lekcji", () => {
    render(<RoundingLessonLab activity="rounding-series" />);
    const input = screen.getByLabelText("Wynik zaokrąglenia");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveClass("w-full", "min-w-0", "max-w-full");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zaznacz obie wymagane cyfry i uzupełnij wynik.")).toBeInTheDocument();
  });

  it("po poprawnym rozwiązaniu przechodzi do kolejnego zadania", () => {
    vi.useFakeTimers();
    render(<RoundingLessonLab activity="rounding-series" />);
    const digitButtons = screen.getAllByRole("button", { name: /^Cyfra/u });
    fireEvent.click(digitButtons[1]);
    fireEvent.click(digitButtons[2]);
    for (const key of ["6", ", przecinek", "5"]) {
      fireEvent.click(screen.getByRole("button", { name: key }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Dobrze!/u)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/10")).toBeInTheDocument();
  });

  it("po błędzie podaje wspierający komunikat i nie przyznaje punktu", () => {
    render(<RoundingLessonLab activity="rounding-series" />);
    const digitButtons = screen.getAllByRole("button", { name: /^Cyfra/u });
    fireEvent.click(digitButtons[0]);
    fireEvent.click(digitButtons[1]);
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Spróbuj innym razem. Poprawny wynik to 6,5. Dziś bez punktu.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Przejdź dalej bez punktu" })).toBeInTheDocument();
  });
});
