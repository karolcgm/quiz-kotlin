/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CuboidCubeLessonLab, cuboidCubeActivityFromStageId } from "@/components/lessons/solids";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="solid-canvas" />,
}));

afterEach(cleanup);

describe("CuboidCubeLessonLab", () => {
  it("we wszystkich aktywnościach umieszcza bryłę nad treścią slajdu", () => {
    const activities = ["explore", "net", "elements", "relations", "edge-formulas", "edge-practice", "area-formulas", "area-practice", "mixed-practice"] as const;

    activities.forEach((activity) => {
      const { container, unmount } = render(<CuboidCubeLessonLab activity={activity} />);
      const layout = container.querySelector('[data-solid-layout="model-first"]');
      expect(layout).not.toBeNull();
      expect(layout?.firstElementChild).toHaveAttribute("data-solid-model-position", "top");
      unmount();
    });
  });

  it("pokazuje samą bryłę przed przyciskami i opisami modelu", () => {
    render(<CuboidCubeLessonLab activity="explore" />);

    const canvas = screen.getByTestId("solid-canvas");
    const kindButton = screen.getByRole("button", { name: "Prostopadłościan" });
    expect(canvas.compareDocumentPosition(kindButton) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("pozwala wybrać bryłę, obracać ją i przejść do siatki", () => {
    render(<CuboidCubeLessonLab activity="net" />);

    expect(screen.getByTestId("solid-canvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prostopadłościan" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Sześcian" }));
    expect(screen.getByRole("button", { name: "Sześcian" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.change(screen.getByRole("slider", { name: "Rozłóż bryłę do siatki" }), { target: { value: "100" } });
    expect(screen.getByRole("slider", { name: "Rozłóż bryłę do siatki" })).toHaveValue("100");
  });

  it("pokazuje ścianę, krawędź, wierzchołek i ich poprawne liczby", () => {
    render(<CuboidCubeLessonLab activity="elements" />);

    expect(screen.getByRole("button", { name: "Ściana" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Krawędzie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wierzchołki" })).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Krawędzie" }));
    expect(screen.getByText("wszystkie 12 krawędzi")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wierzchołki" }));
    expect(screen.getByText("wszystkie 8 wierzchołków")).toBeInTheDocument();
  });

  it("oznacza wierzchołki literami A–H i wyjaśnia położenie krawędzi AB", () => {
    const { container } = render(<CuboidCubeLessonLab activity="relations" />);

    expect(screen.getByText(/Czerwona krawędź łączy wierzchołki/u)).toHaveTextContent("A i B");
    expect(container.querySelector('[aria-label*="Wierzchołki są oznaczone literami od A do H"]')).not.toBeNull();
  });

  it("wyświetla oba wzory na sumę krawędzi i oba wzory na pole", () => {
    const { rerender } = render(<CuboidCubeLessonLab activity="edge-formulas" />);
    expect(screen.getByText("4a + 4b + 4c")).toBeInTheDocument();
    expect(screen.getByText("12a")).toBeInTheDocument();

    rerender(<CuboidCubeLessonLab activity="area-formulas" />);
    expect(screen.getByText("P = 2ab + 2ac + 2bc")).toBeInTheDocument();
    expect(screen.getByText("P = 6a²")).toBeInTheDocument();
  });

  it("w ćwiczeniu blokuje klawiaturę urządzenia i używa kalkulatora lekcyjnego", () => {
    render(<CuboidCubeLessonLab activity="edge-practice" />);

    const input = screen.getByRole("textbox", { name: "Wynik" });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Brawo! Poprawny wynik to 40 cm.")).toBeInTheDocument();
  });

  it("mapuje etapy lekcji od modelu do obliczeń", () => {
    expect(cuboidCubeActivityFromStageId("m6-9-1-net-s2")).toBe("net");
    expect(cuboidCubeActivityFromStageId("m6-9-1-elements-s3")).toBe("elements");
    expect(cuboidCubeActivityFromStageId("m6-9-1-relations-s4")).toBe("relations");
    expect(cuboidCubeActivityFromStageId("m6-9-1-edge-practice-s6")).toBe("edge-practice");
    expect(cuboidCubeActivityFromStageId("m6-9-1-area-practice-s8")).toBe("area-practice");
    expect(cuboidCubeActivityFromStageId("m6-9-1-mixed-practice-s9")).toBe("mixed-practice");
  });
});
