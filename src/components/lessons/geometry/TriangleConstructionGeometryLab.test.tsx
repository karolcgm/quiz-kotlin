/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleConstructionGeometryLab } from "@/components/lessons/geometry/TriangleConstructionGeometryLab";
import { TRIANGLE_CONSTRUCTION_LESSON_SEEDS } from "@/lib/math/geometry/triangleConstruction";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it("na slajdzie Most linowy umieszcza trójkąt nad panelami zadania", () => {
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS.bridge.core} />);
    const workspace = container.querySelector('[data-layout="triangle-above-controls"]');
    const triangle = container.querySelector('[data-bridge-triangle="true"]');
    const controls = container.querySelector('[data-bridge-controls="true"]');
    expect(workspace).toBeInTheDocument();
    expect(triangle).toBeInTheDocument();
    expect(controls).toBeInTheDocument();
    if (!triangle || !controls) throw new Error("Brakuje rysunku lub panelu sterowania.");
    expect(triangle.compareDocumentPosition(controls) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("nie ujawnia prywatnego answerSpec w DOM", () => {
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS.independent.challenge} mode="assessment" />);
    expect(container.textContent).not.toContain("answerSpec");
    expect(container.querySelector("[data-no-intersection]")).toBeNull();
  });

  it("najpierw podaje warunek trójkąta i prowadzi przez sześć decyzji Tak lub Nie", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS["feasibility-series"].support} onResultChange={onResultChange} />);
    expect(screen.getByText(/suma długości dwóch krótszych boków jest większa/u)).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();

    [true, false, false, true, true, false].forEach((answer, index) => {
      const choices = screen.getByRole("group", { name: "Czy można zbudować trójkąt?" });
      fireEvent.click(within(choices).getByRole("button", { name: answer ? "Tak" : "Nie" }));
      if (index < 5) {
        expect(onResultChange).not.toHaveBeenLastCalledWith(true, expect.anything());
        act(() => vi.advanceTimersByTime(700));
        expect(screen.getByText(`Zadanie ${index + 2}/6`)).toBeInTheDocument();
      }
    });
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono sześć decyzji o możliwości konstrukcji");
  });

  it("pokazuje trzy dane odcinki, cyrkiel i pełną konstrukcję krok po kroku", () => {
    const onResultChange = vi.fn();
    const { container } = render(<TriangleConstructionGeometryLab seed={TRIANGLE_CONSTRUCTION_LESSON_SEEDS["visual-construction"].support} onResultChange={onResultChange} />);
    expect(container.querySelectorAll("[data-three-source-segments] line")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: /Narysuj podstawę AB/u }));
    fireEvent.click(screen.getByRole("button", { name: /Zakreśl łuk z A/u }));
    expect(container.querySelector("[data-construction-compass]")).toBeInTheDocument();
    expect(container.querySelector("[data-arc-a]")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Zakreśl łuk z B/u }));
    expect(container.querySelectorAll("[data-arc-a], [data-arc-b]")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /Zaznacz punkt C/u }));
    expect(container.querySelector("[data-point-c]")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Połącz A–C i B–C/u }));
    expect(container.querySelector("[data-completed-triangle]")).toBeInTheDocument();
    expect(onResultChange).toHaveBeenLastCalledWith(true, "obejrzano pełną konstrukcję");
  });
});
