/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecimalNotationL1Lab } from "@/components/lessons/decimals/DecimalNotationL1Lab";

afterEach(cleanup);

describe("WholeFromPercentLab", () => {
  it("nie przepuszcza pustego zadania", () => {
    const onResultChange = vi.fn();
    render(
      <DecimalNotationL1Lab
        activity="whole-from-percent-practice"
        seed={667200}
        questionNumber={1}
        questionCount={6}
        onResultChange={onResultChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie wymagane pola");
    expect(onResultChange).toHaveBeenLastCalledWith(null);
  });

  it("zalicza poprawnie uzupełniony schemat prowadzący do 100%", () => {
    const onResultChange = vi.fn();
    render(
      <DecimalNotationL1Lab
        activity="whole-from-percent-practice"
        seed={667200}
        questionNumber={1}
        questionCount={6}
        onResultChange={onResultChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Liczba nad pierwszą strzałką" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    fireEvent.click(screen.getByRole("button", { name: "Szukana liczba" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Dobrze!");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "50% liczby 70 to 35");
  });
});
