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
    const { container } = render(<GeometryLab seed={421201} />);
    const largeAngle = screen.getByRole("img", { name: /Kąt alfa ma 45 stopni/u });
    const angleStage = container.querySelector<HTMLElement>("[data-openness-angle-stage]");
    const controls = container.querySelector<HTMLElement>("[data-openness-controls]");
    expect(largeAngle).toHaveAttribute("viewBox", "0 0 720 550");
    expect(largeAngle).toHaveClass("min-h-[560px]");
    expect(angleStage).toContainElement(largeAngle);
    expect(controls).not.toContainElement(largeAngle);
    expect(angleStage!.compareDocumentPosition(controls!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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
    const { container } = render(<GeometryLab seed={421701} />);
    const trapezoid = screen.getByRole("img", { name: /Duży trapez ABCD/u });
    const section = container.querySelector<HTMLElement>('[data-angle-recognition][data-activity="figure"]');
    const stage = container.querySelector<HTMLElement>("[data-angle-figure-stage]");
    const copy = container.querySelector<HTMLElement>("[data-angle-figure-copy]");
    const tasks = container.querySelector<HTMLElement>("[data-angle-figure-tasks]");
    expect(trapezoid).toHaveAttribute("viewBox", "0 0 920 480");
    expect(trapezoid).toHaveClass("min-h-[540px]");
    expect(section).toHaveClass("flex", "flex-col");
    expect(section?.firstElementChild).toBe(stage);
    expect(stage).toContainElement(trapezoid);
    expect(copy).not.toContainElement(trapezoid);
    expect(tasks).not.toContainElement(trapezoid);
    expect(stage!.compareDocumentPosition(copy!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(stage!.compareDocumentPosition(tasks!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(within(screen.getByRole("group", { name: "kąt ABC jest" })).getByRole("button", { name: "rozwarty" }));
    fireEvent.click(within(screen.getByRole("group", { name: "kąt BCD jest" })).getByRole("button", { name: "rozwarty" }));
    fireEvent.click(within(screen.getByRole("group", { name: "kąt BAD jest" })).getByRole("button", { name: "ostry" }));
    expect(screen.getByRole("status")).toHaveTextContent("kąt ABC jest rozwarty, kąt BCD jest rozwarty, a kąt BAD jest ostry");
  });

  it("rysuje kąt ABC z rozsypanych punktów i zachowuje oba ramiona", () => {
    const { container } = render(<GeometryLab seed={421801} />);
    expect(screen.getByText("Narysuj ∠ABC")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-point-dot][r="7"]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-point-hit-target][r="30"]')).toHaveLength(6);
    expect(container.querySelector('circle[r="28"]')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Punkt D" }));
    expect(screen.getByRole("status")).toHaveTextContent("środkowa litera B oznacza wierzchołek");
    fireEvent.click(screen.getByRole("button", { name: "Punkt B" }));
    fireEvent.click(screen.getByRole("button", { name: "Punkt A" }));
    expect(container.querySelectorAll("[data-angle-ray]")).toHaveLength(1);
    expect(container.querySelector("#angle-ray-arrow")).not.toBeInTheDocument();
    expect(container.querySelector("[data-angle-ray]")).not.toHaveAttribute("marker-end");
    fireEvent.click(screen.getByRole("button", { name: "Punkt C" }));
    expect(container.querySelectorAll("[data-angle-ray]")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll("[data-angle-ray]")).every((ray) => !ray.hasAttribute("marker-end"))).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("Narysowano ∠ABC: ramiona BA i BC");
    fireEvent.click(screen.getByRole("tab", { name: "Zadanie 2" }));
    expect(screen.getByText("Narysuj ∠DEF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Punkt E" })).toBeInTheDocument();
  });

  it("wyszukuje w układzie prostych po dwa kąty ostre, proste i rozwarte", () => {
    const { container } = render(<GeometryLab seed={421901} />);
    const section = container.querySelector<HTMLElement>("[data-angle-line-network]");
    const figure = container.querySelector<HTMLElement>("[data-line-network-figure]");
    const copy = container.querySelector<HTMLElement>("[data-line-network-copy]");
    const tasks = container.querySelector<HTMLElement>("[data-line-network-tasks]");
    const drawing = screen.getByRole("img", { name: /Układ przecinających się prostych/u });
    expect(section).toHaveClass("flex", "flex-col");
    expect(section?.firstElementChild).toBe(figure);
    expect(drawing).toHaveClass("min-h-[560px]");
    expect(figure).toContainElement(drawing);
    expect(copy).not.toContainElement(drawing);
    expect(tasks).not.toContainElement(drawing);
    expect(figure!.compareDocumentPosition(copy!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(figure!.compareDocumentPosition(tasks!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(figure?.querySelector("[data-right-angle-arc]")).toBeInTheDocument();
    expect(figure?.querySelector("[data-right-angle-dot]")).toBeInTheDocument();
    expect(figure?.querySelector('path[d="M385 260v-25h25"]')).not.toBeInTheDocument();
    expect(screen.getByText("Znajdź po dwa kąty ostre, proste i rozwarte")).toBeInTheDocument();
    const choices = [
      ["kąt BGF jest", "rozwarty"], ["kąt DFE jest", "prosty"], ["kąt CAG jest", "ostry"],
      ["kąt BCD jest", "rozwarty"], ["kąt GFD jest", "prosty"], ["kąt AGB jest", "ostry"],
    ] as const;
    for (const [group, answer] of choices) {
      fireEvent.click(within(screen.getByRole("group", { name: group })).getByRole("button", { name: answer }));
    }
    expect(screen.getByRole("status")).toHaveTextContent("po dwa kąty ostre, proste i rozwarte");
  });
});
