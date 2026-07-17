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
    const { container, rerender } = render(<GeometryLab seed={421301} />);
    expect(screen.getByText(/α \(alfa\), β \(beta\), γ \(gamma\) i δ \(delta\)/u)).toBeInTheDocument();
    rerender(<GeometryLab seed={421401} />);
    expect(container.querySelector('svg[viewBox="0 0 560 400"]')).toHaveClass("min-h-[400px]");
    fireEvent.click(screen.getByRole("button", { name: "∠ABC" }));
    expect(screen.getByRole("status")).toHaveTextContent("B jest środkową literą");
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 2" }));
    fireEvent.click(screen.getByRole("button", { name: "∠DEF" }));
    expect(screen.getByRole("status")).toHaveTextContent("E jest środkową literą");
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 3" }));
    expect(screen.getByRole("button", { name: "∠KLM" })).toBeInTheDocument();
  });

  it("pokazuje rozsypankę 25 miar bez numerów przykładów i sprawdza pełny wybór", () => {
    const { container, rerender } = render(<GeometryLab seed={421501} />);
    expect(screen.queryByText(/Przykład 1/u)).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Rozsypane miary kątów")).getAllByRole("button")).toHaveLength(25);
    for (const measure of [72, 35, 16, 88, 43, 58, 1, 64]) fireEvent.click(screen.getByRole("button", { name: `${measure}°` }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź zaznaczenie" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie miary dla kategorii „kąt ostry”");
    rerender(<GeometryLab seed={421601} />);
    expect(screen.queryByText(/Przykład/u)).not.toBeInTheDocument();
    expect(within(screen.getByLabelText("Rozsypane rysunki kątów")).getAllByRole("button")).toHaveLength(20);
    for (const measure of [45, 30, 65, 15, 80]) fireEvent.click(container.querySelector(`[data-angle-measure="${measure}"]`)!);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź i pokoloruj" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie rysunki kategorii „kąt ostry” zostały pokolorowane");
  });

  it("odczytuje i klasyfikuje trzy nazwane kąty na figurze", () => {
    render(<GeometryLab seed={421701} />);
    fireEvent.click(within(screen.getByRole("group", { name: "kąt ABC jest" })).getByRole("button", { name: "rozwarty" }));
    fireEvent.click(within(screen.getByRole("group", { name: "kąt BCD jest" })).getByRole("button", { name: "rozwarty" }));
    fireEvent.click(within(screen.getByRole("group", { name: "kąt BAD jest" })).getByRole("button", { name: "ostry" }));
    expect(screen.getByRole("status")).toHaveTextContent("kąt ABC jest rozwarty, kąt BCD jest rozwarty, a kąt BAD jest ostry");
  });
});
