/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrismNetsLessonLab, prismFoldedSidePose, prismNetBasePoints, prismNetsActivityFromStageId } from "@/components/lessons/solids/PrismNetsLessonLab";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="unfolding-canvas" />,
}));

afterEach(cleanup);

describe("PrismNetsLessonLab", () => {
  it("dołącza obie podstawy siatki pełnym bokiem do ścian bocznych", () => {
    [3, 4, 5, 6].forEach((sides) => {
      const above = prismNetBasePoints(sides, 20, 72, 80, "above");
      const below = prismNetBasePoints(sides, 200, 252, 150, "below");

      expect(above[0]).toEqual({ x: 20, y: 80 });
      expect(above[1]).toEqual({ x: 72, y: 80 });
      expect(below[0]).toEqual({ x: 252, y: 150 });
      expect(below[1]).toEqual({ x: 200, y: 150 });
      above.slice(2).forEach((point) => expect(point.y).toBeLessThan(80));
      below.slice(2).forEach((point) => expect(point.y).toBeGreaterThan(150));
    });
  });

  it("ustawia każdą ścianę boczną dokładnie na boku podstawy", () => {
    [3, 4, 5, 6].forEach((sides) => {
      Array.from({ length: sides }, (_, index) => prismFoldedSidePose(sides, index)).forEach((pose) => {
        const half = pose.width / 2;
        const first = {
          x: pose.position[0] - half * Math.cos(pose.rotationY),
          z: pose.position[2] + half * Math.sin(pose.rotationY),
        };
        const second = {
          x: pose.position[0] + half * Math.cos(pose.rotationY),
          z: pose.position[2] - half * Math.sin(pose.rotationY),
        };
        expect(first.x).toBeCloseTo(pose.start.x, 8);
        expect(first.z).toBeCloseTo(pose.start.z, 8);
        expect(second.x).toBeCloseTo(pose.end.x, 8);
        expect(second.z).toBeCloseTo(pose.end.z, 8);
      });
    });
  });

  it("pozwala zmienić graniastosłup i rozłożyć go suwakiem do siatki", () => {
    render(<PrismNetsLessonLab activity="unfold" />);

    expect(screen.getByTestId("unfolding-canvas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pięciokątny" }));
    const slider = screen.getByRole("slider", { name: "Rozłóż graniastosłup do siatki" });
    fireEvent.change(slider, { target: { value: "100" } });
    expect(slider).toHaveValue("100");
    expect(screen.getByText("To jest siatka: graniastosłup pięciokątny.")).toBeInTheDocument();
  });

  it("prowadzi jedną serię sześciu zadań o rozpoznawaniu i poprawności siatki", () => {
    render(<PrismNetsLessonLab activity="recognize" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /3 ścian bocznych i 2 podstawy/u })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Wybierz odpowiedź.")).toBeInTheDocument();
  });

  it("udostępnia dotykową planszę do samodzielnego rysowania", () => {
    render(<PrismNetsLessonLab activity="draw" />);

    expect(screen.getByLabelText("Plansza do rysowania siatki palcem lub myszą")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pokaż wzór" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Moja siatka jest gotowa" })).toBeDisabled();
  });

  it("mapuje trzy etapy tematu", () => {
    expect(prismNetsActivityFromStageId("m6-9-3-unfold-s1")).toBe("unfold");
    expect(prismNetsActivityFromStageId("m6-9-3-recognize-s2")).toBe("recognize");
    expect(prismNetsActivityFromStageId("m6-9-3-draw-s3")).toBe("draw");
  });
});
