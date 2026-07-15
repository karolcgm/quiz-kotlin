// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { m542RozchylRamionaV1 } from "@/data/lessons/section4-wp-c4";

afterEach(cleanup);

describe("WP-S4-02A — Kąty i ich rodzaje", () => {
  it("ujawnia miarę i nazwę dopiero po przewidywaniu", () => {
    const { container } = render(<GeometryLab seed={420101} />);
    expect(container.querySelector("[data-angle-measure]")).not.toBeInTheDocument();
    expect(screen.getByText("? najpierw przewidź")).toBeInTheDocument();
    fireEvent.click(within(screen.getByLabelText("Przewidź rodzaj kąta")).getByRole("button", { name: "kąt ostry" }));
    expect(container.querySelector("[data-angle-measure]")).toHaveTextContent("45° · kąt ostry");
    expect(screen.getByRole("status")).toHaveTextContent("Trafne przewidywanie");
  });

  it("rozstrzyga dokładne bramki 89°–90°–91°–180°", () => {
    const { container } = render(<GeometryLab seed={420401} />);
    const gates = screen.getByLabelText("Bramki klasyfikacji");
    fireEvent.click(within(gates).getByRole("button", { name: "89°" }));
    expect(container.querySelector("[data-angle-measure]")).toHaveTextContent("89° · kąt ostry");
    fireEvent.click(within(gates).getByRole("button", { name: "90°" }));
    expect(container.querySelector("[data-right-angle-square]")).toBeInTheDocument();
    expect(container.querySelector("[data-angle-measure]")).toHaveTextContent("90° · kąt prosty");
    fireEvent.click(within(gates).getByRole("button", { name: "91°" }));
    expect(container.querySelector("[data-right-angle-square]")).not.toBeInTheDocument();
    expect(container.querySelector("[data-angle-measure]")).toHaveTextContent("91° · kąt rozwarty");
    fireEvent.click(within(gates).getByRole("button", { name: "180°" }));
    expect(container.querySelector("[data-angle-measure]")).toHaveTextContent("180° · kąt półpełny");
  });

  it("obraca całą figurę i zmienia długości ramion bez zmiany kąta", () => {
    const { container } = render(<GeometryLab seed={420301} />);
    const original = container.querySelector("[data-angle-measure]")?.textContent;
    fireEvent.change(screen.getByLabelText("Obrót całej figury"), { target: { value: "145" } });
    fireEvent.change(screen.getByLabelText("Długość ramienia BA"), { target: { value: "210" } });
    fireEvent.change(screen.getByLabelText("Długość ramienia BC"), { target: { value: "75" } });
    expect(container.querySelector("[data-angle-measure]")?.textContent).toBe(original);
    expect(container.querySelector("[data-short-angle-overlay]")).toBeInTheDocument();
    fireEvent.click(within(screen.getByLabelText("Porównanie kątów o różnych ramionach")).getByRole("button", { name: "są równe" }));
    expect(screen.getByRole("status")).toHaveTextContent("długość ramion nie zmienia rozchylenia");
  });

  it("obsługuje wybierz → umieść, klawiaturę i uchwyty dotykowe 52 px", () => {
    render(<GeometryLab seed={420201} />);
    const labels = screen.getByLabelText("Etykiety elementów kąta");
    fireEvent.click(within(labels).getByRole("button", { name: /wierzchołek/u }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Umieść etykietę na wierzchołku B" }), { key: "Enter" });
    fireEvent.click(within(labels).getByRole("button", { name: /ramię/u }));
    fireEvent.click(screen.getByRole("button", { name: "Umieść etykietę na ramieniu BA" }));
    fireEvent.click(within(labels).getByRole("button", { name: /łuk/u }));
    fireEvent.click(screen.getByRole("button", { name: "Umieść etykietę na łuku kąta" }));
    expect(within(labels).getByText("3/3 umieszczone")).toBeInTheDocument();

    cleanup();
    render(<GeometryLab seed={420401} />);
    expect(screen.getByRole("slider", { name: /Rozchyl ramię BC/u })).toHaveAttribute("r", "26");
    expect(screen.getByRole("slider", { name: /Obróć całą figurę/u })).toHaveAttribute("r", "26");
  });

  it("renderuje model na tablicy i tablecie, a równoważny arkusz w druku", () => {
    const stage = m542RozchylRamionaV1.stages.find((item) => item.title === "Rozchyl ramiona")!;
    const { container, rerender } = render(<LessonStageView lessonId={m542RozchylRamionaV1.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-angle-types-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={m542RozchylRamionaV1.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-angle-types-lab][data-mode="practice"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={m542RozchylRamionaV1.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.2-angle-types"]')).toBeInTheDocument();
  });
});
