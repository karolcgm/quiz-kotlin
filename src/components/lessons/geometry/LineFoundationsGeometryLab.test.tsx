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
    const figure = container.querySelector<HTMLElement>("[data-line-objects-figure]");
    const drawing = screen.getByRole("img", { name: /Punkt, prosta, półprosta i odcinek/u });
    const choices = container.querySelector<HTMLElement>("[data-line-objects-choices]");
    expect(drawing).toHaveClass("min-h-[480px]");
    expect(figure).toContainElement(drawing);
    expect(figure!.compareDocumentPosition(choices!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(choices).not.toContainElement(figure);
    expect(container.querySelector("#foundations-arrow")).not.toBeInTheDocument();
    expect(container.querySelector('[data-line-object="line"]')).not.toHaveAttribute("marker-start");
    expect(container.querySelector('[data-line-object="line"]')).not.toHaveAttribute("marker-end");
    expect(container.querySelector('[data-line-object="ray"]')).not.toHaveAttribute("marker-end");
    expect(drawing).toHaveTextContent("PROSTA a");
    expect(drawing).toHaveTextContent("PÓŁPROSTA AB");
    expect(drawing).toHaveTextContent("ODCINEK CD");
    expect(drawing).not.toHaveTextContent("PROSTA — mała litera");
    expect(drawing).not.toHaveTextContent("PÓŁPROSTA AB — wielkie litery");
    expect(screen.getByRole("button", { name: "punkt P" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "prosta a" }));
    expect(screen.getByRole("status")).toHaveTextContent(/małą literą: a/u);
    fireEvent.click(screen.getByRole("button", { name: "odcinek CD" }));
    expect(screen.getByRole("status")).toHaveTextContent(/wielkimi literami jego końców/u);
  });

  it("pokazuje zapis odcinków równoległych i prostopadłych", () => {
    const { container } = render(<GeometryLab seed={LINE_FOUNDATIONS_LESSON_SEEDS.segmentRelations} />);
    expect(screen.getAllByText("AB ∥ CD").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("EF ⟂ GH").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText(/dwie kreski biegną/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/odwróconą literę T/u)).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-segment-line]")).toHaveLength(4);
    expect(container.querySelectorAll('[data-segment-line][stroke-width="5"]')).toHaveLength(4);
    expect(container.querySelectorAll("[data-end-mark]")).toHaveLength(8);
    expect(container.querySelector("[data-right-angle-arc]")).toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-dot]")).toBeInTheDocument();
    expect(container.querySelector("[data-parallel-example] path")).not.toBeInTheDocument();
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
