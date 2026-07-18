/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";

afterEach(cleanup);

describe("M5-4.12 — czworokąty", () => {
  it("pokazuje mapę rodzin jako slajd informacyjny bez kalkulatora i zatwierdzania", () => {
    const { container } = render(<GeometryLab seed={490401} />);
    expect(screen.getByRole("heading", { name: "Mapa czworokątów" })).toBeInTheDocument();
    expect(container.querySelector("[data-quadrilateral-family-map]")).toBeInTheDocument();
    expect(screen.getByText("TRAPEZY")).toBeInTheDocument();
    expect(screen.getByText("RÓWNOLEGŁOBOKI")).toBeInTheDocument();
    expect(screen.getByText("PROSTOKĄTY")).toBeInTheDocument();
    expect(screen.getByText("ROMBY")).toBeInTheDocument();
    expect(screen.getByText("KWADRATY")).toBeInTheDocument();
    expect(screen.getByText(/Każdy kwadrat jest prostokątem i rombem/u)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pokazuje duże rysunki wszystkich potrzebnych rodzajów czworokątów", () => {
    const { container } = render(<GeometryLab seed={490402} />);
    expect(screen.getByRole("heading", { name: "Jak wyglądają czworokąty?" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-figure]")).toHaveLength(8);
    expect(container.querySelector("[data-figure='right-trapezoid']")).toBeInTheDocument();
    expect(container.querySelector("[data-figure='square']")).toBeInTheDocument();
    expect(screen.getByText("Trapez równoramienny")).toBeInTheDocument();
    expect(screen.getByText("Trapez prostokątny")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("łączy własności boków, kątów i przekątnych w responsywnych kartach", () => {
    const { container } = render(<GeometryLab seed={490403} />);
    expect(screen.getByRole("heading", { name: "Własności potrzebne do rozpoznawania" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-property-card]")).toHaveLength(5);
    expect(screen.getByText("Przekątne są równe, prostopadłe i przecinają się w połowie.")).toBeInTheDocument();
    expect(screen.getByText(/Czworokąt ma zawsze tyle samo boków, wierzchołków i kątów/u)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
