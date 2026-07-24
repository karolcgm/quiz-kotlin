/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalFractionOperationsLab } from "@/components/lessons/decimals/DecimalFractionOperationsLab";

afterEach(cleanup);

function press(label: string) {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

describe("DecimalFractionOperationsLab", () => {
  it("pokazuje slajd Zapamiętaj z najważniejszymi zamianami", () => {
    const { container } = render(<DecimalFractionOperationsLab activity="fraction-decimal-remember" seed={562100} />);

    expect(screen.getByRole("heading", { name: "Zapamiętaj" })).toBeInTheDocument();
    expect(screen.getByLabelText("1 przez 2")).toBeInTheDocument();
    expect(screen.getByLabelText("1 przez 8")).toBeInTheDocument();
    expect(screen.getByText("0,125")).toBeInTheDocument();
    expect(screen.getByText("0,75")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-fraction-decimal-remember-row]")).toHaveLength(5);
  });

  it("przyjmuje wynik dziesiętny wyłącznie z klawiatury ekranowej", () => {
    const onResultChange = vi.fn();
    render(<DecimalFractionOperationsLab activity="fraction-decimal-add" seed={562200} questionNumber={1} questionCount={8} onResultChange={onResultChange} />);

    const conversion = screen.getByLabelText("Zapis dziesiętny po zamianie");
    expect(conversion).toHaveAttribute("readonly");
    expect(conversion).toHaveAttribute("inputmode", "none");
    fireEvent.click(conversion);
    press("0");
    press(", przecinek");
    press("5");

    const answer = screen.getByLabelText("Wynik dziesiętny");
    expect(answer).toHaveAttribute("readonly");
    expect(answer).toHaveAttribute("inputmode", "none");
    fireEvent.click(answer);
    press("0");
    press(", przecinek");
    press("7");
    press("5");
    press("Zatwierdź");

    expect(onResultChange).toHaveBeenLastCalledWith(true, "0,75");
    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie");
  });

  it("pozwala wpisać licznik i mianownik wyniku w rundzie z ułamkiem zwykłym", () => {
    const onResultChange = vi.fn();
    render(<DecimalFractionOperationsLab activity="fraction-decimal-add" seed={562204} questionNumber={5} questionCount={8} onResultChange={onResultChange} />);

    press("Licznik ułamka po zamianie");
    press("7");
    press("Mianownik ułamka po zamianie");
    press("2");
    press("0");
    press("Licznik wyniku");
    press("3");
    press("Mianownik wyniku");
    press("4");
    press("Zatwierdź");

    expect(onResultChange).toHaveBeenLastCalledWith(true, "3/4");
  });

  it("pozwala wybrać zapis dziesiętny albo zwykły z miejscem na obliczenia", () => {
    render(<DecimalFractionOperationsLab activity="fraction-decimal-add" seed={562205} questionNumber={5} questionCount={8} />);

    expect(screen.getByLabelText("Zapis obliczeń")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ułamki zwykłe" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Ułamki dziesiętne" }));

    expect(screen.getByRole("button", { name: "Ułamki dziesiętne" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Zapis dziesiętny po zamianie")).toBeInTheDocument();
    expect(screen.getByLabelText("Wynik dziesiętny")).toHaveAttribute("inputmode", "none");
  });

  it("zapisuje całość jako 1, a nie jako ułamek 1 przez 1", () => {
    render(<DecimalFractionOperationsLab activity="fraction-decimal-subtract" seed={562300} questionNumber={1} questionCount={8} />);

    expect(screen.queryByLabelText("1 przez 1")).not.toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("0,25")).toBeInTheDocument();
  });

  it("prowadzi jedną serię działań z zachowaniem kolejności", () => {
    render(<DecimalFractionOperationsLab activity="fraction-decimal-order" seed={616600} />);

    expect(screen.getByRole("heading", { name: "Kolejność działań" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByLabelText("Wynik pierwszego kroku")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Wynik pierwszego kroku")).toHaveAttribute("inputmode", "none");
    expect(screen.getByLabelText("Wynik działania")).toHaveAttribute("readonly");

    fireEvent.click(screen.getByLabelText("Wynik pierwszego kroku"));
    press("0");
    press(", przecinek");
    press("5");
    fireEvent.click(screen.getByLabelText("Wynik działania"));
    press("1");
    press("Zatwierdź");

    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });
});
