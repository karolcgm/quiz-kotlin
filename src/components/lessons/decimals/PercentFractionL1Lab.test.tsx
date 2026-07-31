/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("Procenty a ułamki przez lokalny adapter decimal-notation-l1", () => {
  it("pokazuje klasie 6, że jeden procent to jedna setna i 0,01", () => {
    const { container } = render(<DecimalNotationL1Lab activity="percent-six-remember" seed={661200} />);

    expect(screen.getAllByText("1%").length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText("1 przez 100").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0,01").length).toBeGreaterThan(0);
    expect(screen.getByText(/Jeden procent oznacza jedną setną całości/i)).toBeInTheDocument();
    expect(container.querySelectorAll("[data-percent-six-remember-rows] > div")).toHaveLength(3);
    expect(container.textContent).not.toContain("1/100");
  });

  it("wymaga jednocześnie nieskracalnego ułamka zwykłego i dziesiętnego", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-six-convert" seed={661200} onResultChange={onResultChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Licznik ułamka zwykłego" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Mianownik ułamka zwykłego" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Ułamek dziesiętny" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: ", przecinek" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "1%");
  });

  it("pokazuje pięć podstawowych równoważności procentów", () => {
    const { container } = render(<DecimalNotationL1Lab activity="percent-remember" seed={563100} />);

    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getAllByLabelText("1 przez 5")).toHaveLength(1);
    expect(container.querySelectorAll("[data-percent-remember-row]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-percent-remember-row]:nth-child(1) > div")).toHaveLength(2);
    expect(container.querySelectorAll("[data-percent-remember-row]:nth-child(2) > div")).toHaveLength(2);
    expect(container.querySelectorAll("[data-percent-remember-row]:nth-child(3) > div")).toHaveLength(1);
    expect(container.querySelectorAll("[data-percent-circle]")).toHaveLength(5);
    expect(screen.getByRole("img", { name: "Koło z zaznaczonymi 25 procentami" })).toBeInTheDocument();
  });

  it("zalicza zaznaczenie 10 pól na kratownicy 10×10", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-grid" seed={563200} onResultChange={onResultChange} />);

    for (let index = 1; index <= 10; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Pole ${index}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "10%");
  });

  it("w klasie 6 wymaga policzenia nieregularnej liczby pól kratownicy", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-six-grid" seed={661300} onResultChange={onResultChange} />);

    expect(screen.getByText("Zaznacz 38% na kratownicy 10 × 10.")).toBeInTheDocument();
    for (let index = 1; index <= 38; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: `Pole ${index}` }));
    }
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "38%");
  });

  it("rozpoznaje, że co piąty to 20%", () => {
    const onResultChange = vi.fn();
    const { container } = render(<DecimalNotationL1Lab activity="percent-story" seed={563300} onResultChange={onResultChange} />);

    expect(screen.getByRole("img", { name: "Uczniowie opowiadający o swoich domowych zwierzętach" })).toBeInTheDocument();
    expect(screen.queryByLabelText("1 przez 5")).not.toBeInTheDocument();
    expect(container.querySelector("input")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Licznik części całości" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "Mianownik części całości" }));
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Odpowiedź w procentach" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "licznik 1, mianownik 5, 20%");
  });
});

describe("Jaki to procent? metodą proporcji", () => {
  it("pokazuje przykład 250 do 50 z dzieleniem obu stron przez 5", () => {
    const { container } = render(<DecimalNotationL1Lab activity="percent-six-what-example" seed={662100} />);
    expect(screen.getByText(/W grupie jest 250 dziewcząt/u)).toBeInTheDocument();
    expect(screen.getAllByText(": 5")).toHaveLength(2);
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(container.querySelector("[data-percent-proportion]")).toBeInTheDocument();
  });

  it("blokuje puste zadanie i przyjmuje poprawny procent z klawiatury", () => {
    const onResultChange = vi.fn();
    render(<DecimalNotationL1Lab activity="percent-six-what-practice" seed={662200} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij brakujący procent.")).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(null);
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Dobrze!/u)).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "20%");
  });
});
