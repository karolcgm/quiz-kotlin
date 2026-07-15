/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleConstructionGeometryLab } from "@/components/lessons/geometry/TriangleConstructionGeometryLab";
import { TRIANGLE_CONSTRUCTION_LESSON_SEEDS } from "@/lib/math/geometry/triangleConstruction";

afterEach(cleanup);

describe("TriangleConstructionGeometryLab", () => {
  it("zmienia rysunek i licznik w czasie rzeczywistym po zmianie długości", () => {
    const onStateChange = vi.fn();
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS.inequality.support} onStateChange={onStateChange} />);
    expect(screen.getByText("3 + 3 = 6 cm")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Długość boku 1"), { target: { value: "1" } });
    expect(onStateChange).toHaveBeenCalled();
    expect(container.querySelector("[data-segment-comparison]")).toBeInTheDocument();
    expect(screen.getByText(/Brakuje|Odcinki tylko|Zapas/)).toBeInTheDocument();
  });

  it("prowadzi konstrukcję w kolejności i pokazuje oba punkty przecięcia", () => {
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS["construction-steps"].core} />);
    fireEvent.click(screen.getByRole("button", { name: "Zakreśl łuk z A" }));
    fireEvent.click(screen.getByRole("button", { name: "Zakreśl łuk z B" }));
    expect(container.querySelector("[data-arc-a]")).toBeInTheDocument();
    expect(container.querySelector("[data-arc-b]")).toBeInTheDocument();
    expect(container.querySelector("[data-second-intersection]")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Połącz A–C i B–C" }));
    expect(screen.getByText("Połączono C z A i B. Konstrukcja jest gotowa.")).toBeInTheDocument();
  });

  it("nie ujawnia prywatnego answerSpec w DOM", () => {
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.challenge} mode="assessment" />);
    expect(container.textContent).not.toContain("answerSpec");
    expect(container.querySelector("[data-no-intersection]")).toBeNull();
  });
});
