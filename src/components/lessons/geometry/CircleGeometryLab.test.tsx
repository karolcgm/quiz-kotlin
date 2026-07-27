/** @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CircleGeometryLab } from "@/components/lessons/geometry/CircleGeometryLab";
import { CIRCLE_LESSON_SEEDS } from "@/lib/math/geometry/circles";

describe("CircleGeometryLab", () => {
  it("wyjaśnia różnicę między okręgiem i kołem", () => {
    render(<CircleGeometryLab seed={CIRCLE_LESSON_SEEDS.circleAndDisk} />);
    expect(screen.getByText("Okrąg jest brzegiem. Koło to brzeg i wnętrze.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Okrąg o środku S i promieniu r" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Koło" }));
    expect(screen.getByRole("img", { name: "Koło o środku S i promieniu r" })).toBeInTheDocument();
  });

  it("blokuje puste obliczenie i używa ekranowej klawiatury", () => {
    const onResultChange = vi.fn();
    render(<CircleGeometryLab seed={CIRCLE_LESSON_SEEDS.tangencyTasks} onResultChange={onResultChange} />);
    const input = screen.getByLabelText("Wynik zadania");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wynik");
    expect(onResultChange).not.toHaveBeenCalledWith(true, expect.anything());
  });

  it("wyraźnie odróżnia średnicę od krótszej cięciwy", () => {
    render(<CircleGeometryLab seed={CIRCLE_LESSON_SEEDS.elements} />);
    fireEvent.click(screen.getByRole("button", { name: "Średnica" }));
    expect(screen.getByText(/Średnica to najdłuższa cięciwa/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cięciwa" }));
    expect(screen.getByText("cięciwa")).toBeInTheDocument();
  });
});
