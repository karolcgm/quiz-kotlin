// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BeaverDamGame } from "@/components/materials/games/beaver-dam/BeaverDamGame";

afterEach(cleanup);

describe("Chrupek i Tama Liczb", () => {
  it("zaczyna od czytelnego intro i pokazuje cztery różne kłody", () => {
    render(<BeaverDamGame />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));

    expect(screen.getByText("Która kłoda daje wynik 786?")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((button) => /[+−·:]/.test(button.textContent ?? ""))).toHaveLength(4);
  });

  it("daje spokojną wskazówkę po błędzie i akceptuje poprawną kłodę", () => {
    render(<BeaverDamGame />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));
    fireEvent.click(screen.getByRole("button", { name: "120 + 450" }));
    expect(screen.getByText(/Jeszcze nie ta kłoda/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "325 + 461" }));
    expect(screen.getByText(/Kłoda pasuje/)).toBeInTheDocument();
  });
});
