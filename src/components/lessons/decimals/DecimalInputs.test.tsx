/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalDigitInput } from "@/components/lessons/decimals/DecimalDigitInput";
import { DecimalPlaceValueGrid } from "@/components/lessons/decimals/DecimalPlaceValueGrid";
import type { DecimalPlaceValueState } from "@/types/decimals";

afterEach(cleanup);

function DigitHarness({ initial = "", onSubmit }: { initial?: string; onSubmit?: ReturnType<typeof vi.fn> }) {
  const [value, setValue] = useState(initial);
  return <><DecimalDigitInput value={value} onChange={setValue} onSubmit={onSubmit} /><output data-testid="digit-state">{value}</output></>;
}

function PlaceHarness({ initial = {} }: { initial?: DecimalPlaceValueState }) {
  const [value, setValue] = useState(initial);
  return <><DecimalPlaceValueGrid value={value} onChange={setValue} minimumPower={-4} maximumPower={1} /><output data-testid="place-state">{JSON.stringify(value)}</output></>;
}

describe("DecimalDigitInput", () => {
  it("jest polem tekstowym, zamienia kropkę fizycznej klawiatury na przecinek i zachowuje zera", () => {
    render(<DigitHarness />);
    const input = screen.getByRole("textbox", { name: "Liczba dziesiętna" });
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("type", "text");
    fireEvent.change(input, { target: { value: "2.50" } });
    expect(input).toHaveValue("2,50");
    expect(screen.getByTestId("digit-state")).toHaveTextContent("2,50");
  });

  it("obsługuje klawiaturę ekranową dotykiem/rysikiem, kursor, usuwanie i Enter", () => {
    const onSubmit = vi.fn();
    render(<DigitHarness onSubmit={onSubmit} />);
    const two = screen.getByRole("button", { name: "2" });
    fireEvent.pointerDown(two, { pointerType: "touch", pointerId: 3 });
    fireEvent.click(two);
    fireEvent.click(screen.getByRole("button", { name: "Przecinek" }));
    const five = screen.getByRole("button", { name: "5" });
    fireEvent.pointerDown(five, { pointerType: "pen", pointerId: 4 });
    fireEvent.click(five);
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("textbox", { name: "Liczba dziesiętna" })).toHaveValue("2,50");
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Liczba dziesiętna" }), { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ok: true, trace: expect.objectContaining({ display: "2,50", trailingZeroCount: 1 }) }));
  });

  it("nie zmienia pustego pola na zero i zachowuje focus dla czytnika klawiatury", () => {
    render(<DigitHarness />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("textbox", { name: "Liczba dziesiętna" })).toHaveFocus();
    expect(screen.getByText("Kody diagnostyczne: DEC_EMPTY")).toBeInTheDocument();
    expect(screen.getByTestId("digit-state")).toBeEmptyDOMElement();
  });
});

describe("DecimalPlaceValueGrid", () => {
  it("ma pozycje po obu stronach stałego przecinka, pola cyfr i odczyt tekstowy", () => {
    render(<PlaceHarness initial={{ ones: "2", tenths: "5", hundredths: "0" }} />);
    expect(screen.getByRole("columnheader", { name: "jedności" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /części dziesiąte/u })).toBeInTheDocument();
    expect(screen.getByLabelText("Stała kolumna przecinka")).toHaveTextContent(",");
    expect(screen.getByText(/Aktualny zapis:/u)).toHaveTextContent("2,50");
  });

  it("udostępnia przeciąganie oraz równoważne wybierz → umieść dla touch i klawiatury", () => {
    render(<PlaceHarness />);
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    const panel = screen.getByRole("region", { name: "Wybierz i umieść cyfrę" });
    fireEvent.click(within(panel).getByRole("button", { name: /Umieść w:.*setne/u }));
    expect(screen.getByLabelText("części setne, cyfra")).toHaveValue("7");
    const dataTransfer = { getData: vi.fn(() => "4"), setData: vi.fn() };
    fireEvent.dragStart(screen.getByRole("button", { name: "4" }), { dataTransfer });
    fireEvent.drop(document.querySelector('[data-drop-place="ones"]')!, { dataTransfer });
    expect(screen.getByLabelText("jedności, cyfra")).toHaveValue("4");
  });

  it("przenosi focus strzałkami bez wymagania gestu", () => {
    render(<PlaceHarness />);
    const ones = screen.getByLabelText("jedności, cyfra");
    ones.focus();
    fireEvent.keyDown(ones, { key: "ArrowRight" });
    expect(document.querySelector('[data-decimal-place="tenths"]')).toHaveFocus();
  });
});
