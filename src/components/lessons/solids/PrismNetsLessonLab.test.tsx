/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrismNetsLessonLab, prismNetsActivityFromStageId } from "@/components/lessons/solids";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="unfolding-canvas" />,
}));

afterEach(cleanup);

describe("PrismNetsLessonLab", () => {
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
