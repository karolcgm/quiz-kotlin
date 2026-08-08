/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4MoneyLessonLab, MARKET_TASKS, MONEY_STORY_TASKS } from "@/components/lessons/models/Grade4MoneyLessonLab";

describe("Grade4MoneyLessonLab", () => {
  afterEach(cleanup);

  it("wyjaśnia jednostki monetarne i najważniejszą zamianę", () => {
    render(<Grade4MoneyLessonLab activity="information" />);
    expect(screen.getByRole("heading", { name: "Złote i grosze" })).toBeInTheDocument();
    expect(screen.getByText("1 zł = 100 gr")).toBeInTheDocument();
    expect(screen.getByText("50 gr")).toBeInTheDocument();
    expect(screen.getByText("5 zł")).toBeInTheDocument();
  });

  it("pokazuje przykład sklepowy z ilustracją nad treścią", () => {
    render(<Grade4MoneyLessonLab activity="example" />);
    const image = screen.getByRole("img", { name: /sklepie papierniczym/u });
    const task = screen.getByText(/Zeszyt kosztuje 4 zł 50 gr/u);
    expect(image).toHaveAttribute("src", expect.stringContaining("stationery-example.png"));
    expect(image.compareDocumentPosition(task) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Odpowiedź: 6 zł 80 gr")).toBeInTheDocument();
  });

  it("blokuje klawiaturę urządzenia i zalicza zamianę złotych na grosze", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoneyLessonLab activity="zl-to-gr" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Liczba groszy");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Klawiatura do zamiany pieniędzy");
    for (const digit of "300") fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "300");
  });

  it("pozwala wybrać kratkę zł i gr, a oba pola nie otwierają klawiatury urządzenia", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoneyLessonLab activity="gr-to-zl-gr" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    const zlInput = screen.getByLabelText("Wynik w zł");
    const grInput = screen.getByLabelText("Wynik w gr");
    for (const input of [zlInput, grInput]) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do pieniędzy");
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(grInput);
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "2|35");
  });

  it("ma osobną ilustrację dla każdego zadania tekstowego i zalicza pełną kwotę", () => {
    expect(new Set(MONEY_STORY_TASKS.map((task) => task.imageSrc)).size).toBe(MONEY_STORY_TASKS.length);
    const onResultChange = vi.fn();
    render(<Grade4MoneyLessonLab activity="story" questionNumber={1} questionCount={4} onResultChange={onResultChange} />);
    expect(screen.getByRole("img", { name: /piekarni/u })).toHaveAttribute("src", expect.stringContaining("bakery-shopping.png"));
    const keypad = screen.getByLabelText("Klawiatura do pieniędzy");
    fireEvent.click(within(keypad).getByRole("button", { name: "8" }));
    fireEvent.click(screen.getByLabelText("Wynik w gr"));
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "8|60");
  });

  it("ma dwie rundy zakupów, ceny z groszami i pełną ilustrację pięciu produktów", () => {
    expect(MARKET_TASKS).toHaveLength(2);
    expect(MARKET_TASKS.reduce((total, task) => total + task.parts.length, 0)).toBe(6);
    expect(MARKET_TASKS[0].parts.map((part) => part.prompt)).toEqual([
      "2 kg jabłek i 1 kg bananów",
      "półtora kilograma buraków",
      "pół kilograma jabłek",
    ]);
    const onResultChange = vi.fn();
    render(<Grade4MoneyLessonLab activity="market" questionNumber={1} questionCount={2} onResultChange={onResultChange} />);
    const marketImage = screen.getByRole("img", { name: /stragan z jabłkami, bananami, burakami, gruszkami i marchwią/i });
    expect(marketImage).toHaveAttribute("src", expect.stringContaining("greengrocer-market-v2.png"));
    expect(marketImage).toHaveClass("object-contain");
    expect(marketImage).not.toHaveClass("object-cover");
    expect(screen.getByRole("img", { name: "burak" })).toBeInTheDocument();
    const inputs = [
      screen.getByLabelText("Podpunkt a, wynik w zł"), screen.getByLabelText("Podpunkt a, wynik w gr"),
      screen.getByLabelText("Podpunkt b, wynik w zł"), screen.getByLabelText("Podpunkt b, wynik w gr"),
      screen.getByLabelText("Podpunkt c, wynik w zł"), screen.getByLabelText("Podpunkt c, wynik w gr"),
    ];
    for (const input of inputs) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
    const keypad = screen.getByLabelText("Klawiatura do zakupów na straganie");
    const values = ["14", "90", "5", "10", "2", "10"];
    values.forEach((value, index) => {
      fireEvent.click(inputs[index]!);
      for (const digit of value) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "14|90;5|10;2|10");
  });

  it("pokazuje drugą rundę zakupów w tym samym układzie i poprawnie ją zalicza", () => {
    const onResultChange = vi.fn();
    render(<Grade4MoneyLessonLab activity="market" questionNumber={2} questionCount={2} onResultChange={onResultChange} />);
    expect(screen.getByText("1 kg gruszek i 2 kg marchwi")).toBeInTheDocument();
    expect(screen.getByText("pół kilograma bananów i pół kilograma gruszek")).toBeInTheDocument();
    expect(screen.getByText("3 kg buraków i 1 kg jabłek")).toBeInTheDocument();
    const inputs = [
      screen.getByLabelText("Podpunkt a, wynik w zł"), screen.getByLabelText("Podpunkt a, wynik w gr"),
      screen.getByLabelText("Podpunkt b, wynik w zł"), screen.getByLabelText("Podpunkt b, wynik w gr"),
      screen.getByLabelText("Podpunkt c, wynik w zł"), screen.getByLabelText("Podpunkt c, wynik w gr"),
    ];
    const keypad = screen.getByLabelText("Klawiatura do zakupów na straganie");
    const values = ["11", "0", "6", "15", "14", "40"];
    values.forEach((value, index) => {
      fireEvent.click(inputs[index]!);
      for (const digit of value) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "11|0;6|15;14|40");
  });
});
