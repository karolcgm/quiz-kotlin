/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalWrittenAddSub } from "@/components/lessons/decimals/DecimalWrittenAddSub";
import { DecimalWrittenDivide } from "@/components/lessons/decimals/DecimalWrittenDivide";
import { DecimalWrittenMultiply } from "@/components/lessons/decimals/DecimalWrittenMultiply";
import { buildDecimalWrittenMultiplyModel } from "@/lib/math/decimals";

afterEach(cleanup);

describe("DecimalWrittenAddSub", () => {
  it("renderuje pionową linię przecinków, jedną cyfrę w kratce oraz wymianę", () => {
    const { container } = render(<DecimalWrittenAddSub left="2,45" right="1,7" operation="add" activePower={-1} />);
    expect(container.querySelectorAll("[data-comma-guide]")).toHaveLength(3);
    expect(container.querySelector('[data-exchange="carry"]')).toBeInTheDocument();
    expect(screen.getByLabelText("Wynik, części dziesiąte")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-column-power="-1"]')[0].className).toContain("activeColumn");
  });

  it("zachowuje osobny ślad pożyczania i diagnozuje niewyrównany przecinek", () => {
    const { container } = render(<DecimalWrittenAddSub left="5,2" right="1,875" operation="subtract" commaAligned={false} />);
    expect(container.querySelector('[data-exchange="borrow"]')).toBeInTheDocument();
    expect(screen.getByText("Kody diagnostyczne: DEC_COMMA_MISALIGNED")).toBeInTheDocument();
  });
});

describe("DecimalWrittenMultiply", () => {
  it("dla każdej aktywnej pary pokazuje właściwe cyfry, symbol, łącznik po skosie i docelową kolumnę", () => {
    const model = buildDecimalWrittenMultiplyModel("1,20", "0,35");
    const view = render(<DecimalWrittenMultiply top="1,20" bottom="0,35" phase="pairs" activePairIndex={0} />);
    for (const [index, pair] of model.pairs.entries()) {
      view.rerender(<DecimalWrittenMultiply top="1,20" bottom="0,35" phase="pairs" activePairIndex={index} />);
      expect(view.container.querySelector(`[data-pair-connector="${pair.id}"]`)).toBeInTheDocument();
      expect(view.container.querySelector(`[data-target-column="${pair.targetColumn}"]`)).toBeInTheDocument();
      expect(view.container.querySelector(`[data-factor="top"][data-digit-index="${pair.topIndex}"]`)).toHaveTextContent(`${pair.topDigit}${pair.symbol}`);
      expect(view.container.querySelector(`[data-factor="bottom"][data-digit-index="${pair.bottomIndex}"]`)).toHaveTextContent(`${pair.bottomDigit}${pair.symbol}`);
      expect(screen.getByRole("img", { name: new RegExp(`Łącznik pary ${pair.symbol}.*Cyfra ${pair.topDigit}.*cyfra ${pair.bottomDigit}.*kolumny ${pair.targetColumn}`, "u") })).toBeInTheDocument();
    }
  });

  it("przechodzi przez każdą kolumnę dodawania i osobny wyliczany etap przecinka", () => {
    const model = buildDecimalWrittenMultiplyModel("1,20", "0,35");
    const { rerender } = render(<DecimalWrittenMultiply top="1,20" bottom="0,35" phase="addition" activeAdditionColumn={0} />);
    for (const column of model.additionColumns) {
      rerender(<DecimalWrittenMultiply top="1,20" bottom="0,35" phase="addition" activeAdditionColumn={column.column} />);
      expect(screen.getByLabelText(`Aktywna kolumna dodawania ${column.column}`)).toHaveAttribute("data-addition-column", String(column.column));
    }
    rerender(<DecimalWrittenMultiply top="1,20" bottom="0,35" phase="decimal" placedProductPlaces={4} />);
    expect(screen.getByText("Miejsca po przecinku: 2 + 2 = 4.")).toBeInTheDocument();
    expect(screen.queryByText("Kody diagnostyczne: DEC_PRODUCT_PLACES")).not.toBeInTheDocument();
  });

  it("diagnozuje przesunięcie iloczynu częściowego i złą liczbę miejsc", () => {
    const { rerender } = render(<DecimalWrittenMultiply top="1,2" bottom="0,3" partialProductShifts={[1]} />);
    expect(screen.getByText("Kody diagnostyczne: DEC_PARTIAL_PRODUCT_SHIFT")).toBeInTheDocument();
    rerender(<DecimalWrittenMultiply top="1,2" bottom="0,3" phase="decimal" placedProductPlaces={1} />);
    expect(screen.getByText("Kody diagnostyczne: DEC_PRODUCT_PLACES")).toBeInTheDocument();
  });
});

describe("DecimalWrittenDivide", () => {
  it("pokazuje dzielną, dzielnik, iloraz, wspólną skalę i aktywną parę D", () => {
    const onApplyScale = vi.fn();
    render(<DecimalWrittenDivide dividend="4,5" divisor="0,15" quotient="30" activeDividendIndex={0} activeQuotientIndex={0} onApplyScale={onApplyScale} />);
    expect(screen.getByLabelText("Skalowanie obu liczb")).toHaveTextContent("×100 obie liczby");
    expect(screen.getByLabelText(/Iloraz, aktywna cyfra 1, wspólny symbol D/u)).toHaveValue("30");
    fireEvent.click(screen.getByRole("button", { name: "Zastosuj ×100 do obu liczb" }));
    expect(onApplyScale).toHaveBeenCalledWith(2, "450", "15");
  });

  it("dopisuje zero pomocnicze bez utożsamienia pustki z zerem i diagnozuje jednostronne skalowanie", () => {
    const onZeros = vi.fn();
    const { container } = render(<DecimalWrittenDivide dividend="4,2" divisor="8" appendedZeros={1} onAppendedZerosChange={onZeros} appliedScalePower={1} />);
    expect(container.querySelectorAll('[data-auxiliary-zero="true"]')).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Dopisz zero pomocnicze" }));
    expect(onZeros).toHaveBeenCalledWith(2);
    expect(screen.getByText("Kody diagnostyczne: DEC_DIVISOR_SCALE")).toBeInTheDocument();
  });
});
