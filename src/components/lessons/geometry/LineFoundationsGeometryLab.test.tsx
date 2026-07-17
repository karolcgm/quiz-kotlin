// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LINE_FOUNDATIONS_LESSON_SEEDS } from "@/lib/math/geometry/lineFoundations";

afterEach(cleanup);

describe("podstawy prostych, odcinków i odległości", () => {
  it("pokazuje cztery obiekty oraz regułę małych i wielkich liter", () => {
    const { container } = render(<GeometryLab seed={LINE_FOUNDATIONS_LESSON_SEEDS.objects} />);
    expect(container.querySelector('[data-line-foundations-lab][data-activity="objects"]')).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "punkt P" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "prosta a" }));
    expect(screen.getByRole("status")).toHaveTextContent(/małą literą: a/u);
    fireEvent.click(screen.getByRole("button", { name: "odcinek CD" }));
    expect(screen.getByRole("status")).toHaveTextContent(/wielkimi literami jego końców/u);
  });

  it("pokazuje zapis odcinków równoległych i prostopadłych", () => {
    render(<GeometryLab seed={LINE_FOUNDATIONS_LESSON_SEEDS.segmentRelations} />);
    expect(screen.getAllByText("AB ∥ CD").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("EF ⟂ GH").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/odwróconą literę T/u)).toBeInTheDocument();
  });

  it("wymaga wskazania najkrótszego odcinka od punktu do prostej", () => {
    const { container } = render(<GeometryLab seed={LINE_FOUNDATIONS_LESSON_SEEDS.pointDistance} />);
    const choices = screen.getByRole("group", { name: "Wybierz najkrótszy odcinek" });
    fireEvent.click(within(choices).getByRole("button", { name: "PA" }));
    expect(screen.getByRole("status")).toHaveTextContent(/nie jest najkrótsze/u);
    expect(container.querySelector("[data-distance-right-angle]")).not.toBeInTheDocument();
    fireEvent.click(within(choices).getByRole("button", { name: "PB" }));
    expect(screen.getByRole("status")).toHaveTextContent(/PB jest najkrótszy/u);
    expect(container.querySelector("[data-distance-right-angle]")).toBeInTheDocument();
  });

  it("wyznacza odległość między prostymi odcinkiem prostopadłym do obu", () => {
    const { container } = render(<GeometryLab seed={LINE_FOUNDATIONS_LESSON_SEEDS.parallelDistance} />);
    const choices = screen.getByRole("group", { name: "Wybierz najkrótszy odcinek" });
    fireEvent.click(within(choices).getByRole("button", { name: "BE" }));
    expect(screen.getByRole("status")).toHaveTextContent(/prostopadły do obu prostych/u);
    expect(container.querySelector("[data-distance-right-angle]")).toBeInTheDocument();
  });
});
