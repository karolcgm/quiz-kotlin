// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { GeometryPrintModel } from "@/components/lessons/geometry/GeometryPrintModel";
import { createDefaultGeometryState, createGeometryPrintSnapshot } from "@/lib/math/geometry";
import { GEOMETRY_FEEDBACK_CODES } from "@/types/geometry";
import type { GeometryLabState } from "@/types/geometry";

afterEach(cleanup);

function rectangleState(): GeometryLabState {
  const state = createDefaultGeometryState({ vertexCount: 4, mode: "practice" });
  const coordinates = [
    { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 300, y: 260 }, { x: 100, y: 260 },
  ];
  return {
    ...state,
    points: state.points.map((point, index) => ({ ...point, ...coordinates[index] })),
    grid: { visible: true, step: 20, snap: true },
    selectedPointId: state.polygon.vertexIds[0],
  };
}

describe("GeometryLab", () => {
  it("udostępnia opisane SVG, tekstową tabelę i uchwyty o polu trafienia 52 px", () => {
    render(<GeometryLab initialState={rectangleState()} />);
    expect(screen.getByRole("img", { name: /Laboratorium geometrii/u })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Wierzchołek A/u })).toHaveAttribute("r", "26");
    expect(screen.getByRole("columnheader", { name: "Element" })).toBeInTheDocument();
    expect(screen.getByText("Klasyfikacja", { selector: "td" })).toBeInTheDocument();
    expect(screen.getByText("prostokąt", { selector: "td" })).toBeInTheDocument();
  });

  it("renderuje punkty, odcinki, półproste, proste, łuki, etykiety i kątomierz", () => {
    const state = rectangleState();
    const [a, b, c, d] = state.polygon.vertexIds;
    const configured: GeometryLabState = {
      ...state,
      objects: [
        { id: "segment-ab", kind: "segment", startPointId: a, endPointId: b, label: "s" },
        { id: "ray-bc", kind: "ray", startPointId: b, endPointId: c, label: "p" },
        { id: "line-cd", kind: "line", startPointId: c, endPointId: d, label: "k" },
      ],
      protractor: { ...state.protractor, visible: true, center: { x: 300, y: 100 } },
    };
    const { container } = render(<GeometryLab initialState={configured} />);
    expect(container.querySelector('[data-geometry-object="segment"]')).toBeInTheDocument();
    expect(container.querySelector('[data-geometry-object="ray"]')).toBeInTheDocument();
    expect(container.querySelector('[data-geometry-object="line"]')).toBeInTheDocument();
    expect(container.querySelector("[data-angle-arc]")).toBeInTheDocument();
    expect(container.querySelector("[data-geometry-protractor]")).toBeInTheDocument();
  });

  it("przesuwa wybrany punkt klawiaturą oraz obsługuje undo, redo i reset", () => {
    const onStateChange = vi.fn();
    render(<GeometryLab initialState={rectangleState()} onStateChange={onStateChange} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Wierzchołek A/u }), { key: "ArrowRight" });
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 120, y: 100 })]),
    }));
    fireEvent.click(screen.getByRole("button", { name: /Cofnij/u }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 100, y: 100 })]),
    }));
    fireEvent.click(screen.getByRole("button", { name: /Ponów/u }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 120, y: 100 })]),
    }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status")).toHaveTextContent(/stan początkowy/u);
  });

  it("zapewnia równoważną alternatywę wybierz → współrzędne → Umieść", () => {
    const onStateChange = vi.fn();
    render(<GeometryLab initialState={rectangleState()} onStateChange={onStateChange} />);
    const panel = screen.getByRole("region", { name: "Umieść wierzchołek bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText(/^x$/u), { target: { value: "180" } });
    fireEvent.change(within(panel).getByLabelText(/^y$/u), { target: { value: "140" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Umieść" }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 180, y: 140 })]),
    }));
    fireEvent.click(within(panel).getByRole("button", { name: "Przesuń w prawo" }));
    expect(onStateChange).toHaveBeenLastCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 200, y: 140 })]),
    }));
  });

  it("obsługuje wspólny strumień pointer dla myszy i dotyku w czasie rzeczywistym", () => {
    Object.defineProperty(window, "PointerEvent", { configurable: true, value: MouseEvent });
    const onStateChange = vi.fn();
    const { container } = render(<GeometryLab initialState={rectangleState()} onStateChange={onStateChange} />);
    const svg = container.querySelector("svg")!;
    Object.defineProperty(svg, "getBoundingClientRect", {
      configurable: true,
      value: () => ({ left: 0, top: 0, width: 640, height: 420, right: 640, bottom: 420, x: 0, y: 0, toJSON: () => ({}) }),
    });
    const handle = screen.getByRole("button", { name: /Wierzchołek A/u });
    fireEvent.pointerDown(handle, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 100 });
    fireEvent.pointerMove(handle, { pointerId: 7, pointerType: "touch", clientX: 160, clientY: 180 });
    fireEvent.pointerUp(handle, { pointerId: 7, pointerType: "touch", clientX: 160, clientY: 180 });
    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
      points: expect.arrayContaining([expect.objectContaining({ label: "A", x: 160, y: 180 })]),
    }));
  });

  it("zachowuje stan po próbie poruszenia złego wierzchołka i pokazuje GEO_WRONG_VERTEX", () => {
    const state = rectangleState();
    const expectedPointId = state.polygon.vertexIds[2];
    const onStateChange = vi.fn();
    render(<GeometryLab initialState={state} expectedPointId={expectedPointId} onStateChange={onStateChange} />);
    fireEvent.keyDown(screen.getByRole("button", { name: /Wierzchołek A/u }), { key: "ArrowRight" });
    expect(onStateChange).not.toHaveBeenCalled();
    expect(screen.getByText("Kody diagnostyczne: GEO_WRONG_VERTEX")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/Stan zachowany/u);
  });

  it("pokazuje diagnostykę degeneracji i samoprzecięcia z kodami planu", () => {
    const degenerate = rectangleState();
    degenerate.points[1] = { ...degenerate.points[1], x: degenerate.points[0].x, y: degenerate.points[0].y };
    const { rerender } = render(<GeometryLab initialState={degenerate} />);
    expect(screen.getByText("Kody diagnostyczne: GEO_DEGENERATE")).toBeInTheDocument();

    const crossing = rectangleState();
    const coordinates = [{ x: 100, y: 100 }, { x: 300, y: 260 }, { x: 100, y: 260 }, { x: 300, y: 100 }];
    crossing.points = crossing.points.map((point, index) => ({ ...point, ...coordinates[index] }));
    rerender(<GeometryLab key="crossing" initialState={crossing} />);
    expect(screen.getByText("Kody diagnostyczne: GEO_SELF_INTERSECTION")).toBeInTheDocument();
  });

  it("w ocenianiu nie przekazuje rozwiązania przed oddaniem", () => {
    render(<GeometryLab initialState={rectangleState()} mode="assessment" diagnosticCode={GEOMETRY_FEEDBACK_CODES.notPerpendicular} assessmentSubmitted={false} />);
    expect(screen.getByText(/Rozwiązanie będzie dostępne po oddaniu/u)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pokaż rozwiązanie/u })).not.toBeInTheDocument();
  });

  it("łączy automatycznie diagnostykę kątomierza, nierówności trójkąta, skali i dowodu klasyfikacji", () => {
    const state = rectangleState();
    state.protractor = { ...state.protractor, visible: true, center: { x: 0, y: 0 }, scale: "outer" };
    const { rerender } = render(<GeometryLab initialState={state} expectedProtractorScale="inner" />);
    expect(screen.getByText("Kody diagnostyczne: ANGLE_CENTER_MISALIGNED")).toBeInTheDocument();
    rerender(<GeometryLab key="triangle" initialState={rectangleState()} triangleSideLengths={[3, 4, 8]} />);
    expect(screen.getByText("Kody diagnostyczne: TRIANGLE_INEQUALITY")).toBeInTheDocument();
    rerender(<GeometryLab key="evidence" initialState={rectangleState()} classificationEvidence="missing" />);
    expect(screen.getByText("Kody diagnostyczne: GEO_CLASSIFICATION_EVIDENCE")).toBeInTheDocument();
    rerender(<GeometryLab key="scale" initialState={{ ...state, protractor: { ...state.protractor, center: { x: 300, y: 100 } } }} expectedProtractorScale="inner" />);
    expect(screen.getByText("Kody diagnostyczne: ANGLE_WRONG_SCALE")).toBeInTheDocument();
  });

  it("eksportuje zgodny wydruk bez interaktywnych uchwytów", () => {
    const onPrintExport = vi.fn();
    const { container } = render(<GeometryLab initialState={rectangleState()} onPrintExport={onPrintExport} />);
    fireEvent.click(screen.getByRole("button", { name: "Przygotuj wydruk" }));
    expect(onPrintExport).toHaveBeenCalledWith(expect.objectContaining({ includeHandles: false }));
    const print = container.querySelector("[data-geometry-print]")!;
    expect(print).toBeInTheDocument();
    expect(print.querySelector("[data-geometry-handle]")).toBeNull();
  });
});

describe("GeometryPrintModel i kontrakty CSS", () => {
  it("renderuje samodzielną migawkę wydruku bez przycisków", () => {
    const state = rectangleState();
    state.protractor = { ...state.protractor, visible: true };
    const snapshot = createGeometryPrintSnapshot(state);
    const { container } = render(<GeometryPrintModel snapshot={snapshot} />);
    expect(container.querySelector("[data-geometry-print]")).toBeInTheDocument();
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[data-geometry-handle]")).toBeNull();
    expect(container.querySelector("[data-geometry-protractor]")).toBeInTheDocument();
  });

  it("ma jawne reguły reduced motion, druku i ukrycia interakcji", () => {
    const css = readFileSync("src/components/lessons/geometry/geometry.module.css", "utf8");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("animation-duration: .001ms");
    expect(css).toContain("@media print");
    expect(css).toContain(".interactiveOnly");
  });
});
