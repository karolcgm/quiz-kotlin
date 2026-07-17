// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";

afterEach(cleanup);

describe("M5-4.2 — rozpoznawanie kątów", () => {
  it("pokazuje wierzchołek, ramiona i wnętrze kąta", () => {
    render(<GeometryLab seed={421101} />);
    expect(screen.getByText("Wierzchołek, ramiona i wnętrze kąta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "wierzchołek B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "wnętrze kąta" })).toBeInTheDocument();
    expect(screen.getAllByText("∠ABC").length).toBeGreaterThan(0);
  });

  it("zmienia wyłącznie rozwartość od 0° do 360° i podaje pełną klasyfikację", () => {
    render(<GeometryLab seed={421201} />);
    const slider = screen.getByRole("slider", { name: "Rozwartość kąta" });
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "360");
    fireEvent.change(slider, { target: { value: "225" } });
    expect(screen.getByText(/225° · kąt wklęsły/u)).toBeInTheDocument();
    expect(screen.getAllByText(/180° < α < 360°/u).length).toBeGreaterThan(0);
    fireEvent.change(slider, { target: { value: "125" } });
    expect(screen.getByText(/kąt jest wypukły/u)).toBeInTheDocument();
    expect(screen.queryByLabelText("Długość ramienia BA")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Obrót całej figury")).not.toBeInTheDocument();
  });

  it("uczy greckich oznaczeń i środkowej litery w zapisie kąta", () => {
    const { rerender } = render(<GeometryLab seed={421301} />);
    expect(screen.getByText(/α \(alfa\), β \(beta\), γ \(gamma\) i δ \(delta\)/u)).toBeInTheDocument();
    rerender(<GeometryLab seed={421401} />);
    fireEvent.click(screen.getByRole("button", { name: "∠ABC" }));
    expect(screen.getByRole("status")).toHaveTextContent("B jest środkową literą");
  });

  it("klasyfikuje kąty po mierze i koloruje poprawnie rozpoznane rysunki", () => {
    const { container, rerender } = render(<GeometryLab seed={421501} />);
    const measureCards = container.querySelectorAll("[data-angle-classification-board] > div:first-child > button");
    fireEvent.click(measureCards[1]!);
    fireEvent.click(within(screen.getByRole("group", { name: "Wybierz rodzaj kąta" })).getByRole("button", { name: "kąt ostry" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze: kąt ostry");
    rerender(<GeometryLab seed={421601} />);
    const cards = screen.getAllByRole("button", { name: /Przykład/u });
    fireEvent.click(cards[0]!);
    fireEvent.click(within(screen.getByRole("group", { name: "Wybierz rodzaj kąta" })).getByRole("button", { name: "kąt ostry" }));
    expect(screen.getAllByText("kąt ostry").length).toBeGreaterThan(0);
  });

  it("pozwala wskazać wszystkie kąty na figurze", () => {
    render(<GeometryLab seed={421701} />);
    for (const vertex of ["A", "B", "C", "D"]) fireEvent.click(screen.getByRole("button", { name: `kąt przy ${vertex}` }));
    expect(screen.getByRole("status")).toHaveTextContent("Czworokąt ma cztery kąty wewnętrzne");
  });
});
