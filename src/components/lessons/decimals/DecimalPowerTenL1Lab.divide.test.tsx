/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DecimalPowerTenL1Lab } from "@/components/lessons/decimals/DecimalPowerTenL1Lab";

afterEach(cleanup);

describe("DecimalPowerTenL1Lab — dzielenie przez potęgi 10", () => {
  it("pokazuje trzy przykłady przesunięcia przecinka w lewo ze znakiem dzielenia :", () => {
    render(<DecimalPowerTenL1Lab activity="divide10-position-shift" seed={556510} />);

    expect(screen.getByText(/Przesuwamy przecinek w lewo/u)).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 10 = 5,67")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 100 = 0,567")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "56,7 : 1000 = 0,0567")).toBeInTheDocument();
  });

  it("przesuwa przecinek w lewo dokładnie o jedno miejsce przy jednym kliknięciu", () => {
    const { container } = render(<DecimalPowerTenL1Lab activity="divide10-position-shift" seed={556510} />);

    const button = screen.getAllByRole("button", { name: "Przesuń przecinek o jedno miejsce w lewo" })[1];
    fireEvent.click(button);

    expect(screen.getByText("Przecinek przesunął się w lewo o 1 miejsce. Kliknij ponownie.")).toBeInTheDocument();
    expect(container.querySelector("[data-comma-animation='left'][data-comma-position='2']")).toBeInTheDocument();

    fireEvent.click(button);

    expect(screen.getByText("Przecinek przesunął się w lewo o 2 miejsca.")).toBeInTheDocument();
    expect(container.querySelector("[data-comma-animation='left'][data-comma-position='1']")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-comma-animation='left']")).toHaveLength(3);
  });

  it("ustawia przecinek w osobnym miejscu między cyframi i przesuwa go w prawo krokami", () => {
    const { container } = render(<DecimalPowerTenL1Lab activity="power10-position-shift" seed={555500} />);
    const secondExample = container.querySelectorAll<HTMLElement>("[data-comma-animation='right']")[1];
    const button = screen.getAllByRole("button", { name: "Przesuń przecinek o jedno miejsce w prawo" })[1];

    expect(secondExample).toHaveAttribute("data-comma-position", "1");
    expect(secondExample.querySelector("[data-active-comma-slot='true'][data-comma-slot='1']")).toBeInTheDocument();
    fireEvent.click(button);
    expect(secondExample).toHaveAttribute("data-comma-position", "2");
    expect(secondExample.querySelector("[data-active-comma-slot='true'][data-comma-slot='2']")).toBeInTheDocument();
    fireEvent.click(button);
    expect(secondExample).toHaveAttribute("data-comma-position", "3");
    expect(secondExample.querySelector("[data-active-comma-slot='true'][data-comma-slot='3']")).toBeInTheDocument();
  });
});
