// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m545BudowniczyWielokatowV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { POLYGON_LESSON_SEEDS } from "@/lib/math/geometry/polygons";

afterEach(cleanup);

function lab(container: HTMLElement) {
  return container.querySelector("[data-polygon-builder]") as HTMLElement;
}

describe("WP-S4-05 — lokalny geometry-lab wielokątów", () => {
  it("trasuje seed 450xxx, domyka dopiero przez A i aktualizuje monitor po klawiaturze", () => {
    const { container } = render(<GeometryLab seed={POLYGON_LESSON_SEEDS.builder.support} />);
    const region = lab(container);
    expect(region).toHaveAttribute("data-activity", "builder");
    expect(container.querySelector("[data-polygon-vertices]")).toHaveTextContent("3");
    expect(container.querySelector("[data-polygon-sides]")).toHaveTextContent("2");
    expect(container.querySelector("[data-polygon-perimeter]")).toHaveTextContent("—");
    const a = within(region).getByRole("button", { name: /Wierzchołek A/ });
    expect(a).toHaveAttribute("r", "26");
    expect(a).toHaveAttribute("data-touch-target", "52");
    fireEvent.click(a);
    expect(container.querySelector("[data-polygon-sides]")).toHaveTextContent("3");
    expect(container.querySelector("[data-polygon-perimeter]")).not.toHaveTextContent("—");
    const before = container.querySelector("[data-polygon-perimeter]")!.textContent;
    fireEvent.keyDown(within(region).getByRole("button", { name: /Wierzchołek A/ }), { key: "ArrowRight" });
    expect(container.querySelector("[data-polygon-perimeter]")!.textContent).not.toBe(before);
    fireEvent.click(within(region).getByRole("button", { name: "+ wierzchołek" }));
    expect(container.querySelector("[data-polygon-vertices]")).toHaveTextContent("4");
  });

  it("zapewnia równoważne wpisanie współrzędnych oraz undo, redo i reset", () => {
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.reshape.support} />);
    const panel = screen.getByRole("region", { name: "Umieść wierzchołek bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText("x"), { target: { value: "200" } });
    fireEvent.change(within(panel).getByLabelText("y"), { target: { value: "160" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Umieść" }));
    expect(screen.getByRole("status")).toHaveTextContent("(200, 160)");
    fireEvent.click(screen.getByRole("button", { name: "Cofnij" }));
    expect(screen.getByRole("status")).toHaveTextContent("Cofnięto");
    fireEvent.click(screen.getByRole("button", { name: "Ponów" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ponowiono");
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByRole("status")).toHaveTextContent("stan początkowy");
  });

  it("pokazuje cztery przykłady i diagnozuje samoprzecięcie na konkretnych krawędziach", () => {
    const { container } = render(<GeometryLab seed={POLYGON_LESSON_SEEDS.validity.support} />);
    fireEvent.click(screen.getByRole("button", { name: "Boki skrzyżowane" }));
    expect(container.querySelectorAll('[data-polygon-edge][data-diagnostic="attention"]').length).toBeGreaterThanOrEqual(2);
    fireEvent.click(screen.getByLabelText("Nie jest wielokątem"));
    fireEvent.change(screen.getByLabelText("Najważniejszy warunek"), { target: { value: "closed" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText(/Kody diagnostyczne: POLYGON_VALIDITY_JUSTIFICATION/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Najważniejszy warunek"), { target: { value: "no-crossing" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Wynik: 2/2 pkt")).toBeInTheDocument();
  });

  it("rozróżnia wierzchołek, bok i przekątną do niesąsiedniego punktu", () => {
    const { container } = render(<GeometryLab seed={POLYGON_LESSON_SEEDS.elements.core} />);
    const region = lab(container);
    fireEvent.click(within(region).getByRole("button", { name: /Wierzchołek A/ }));
    fireEvent.click(within(region).getByRole("button", { name: "Bok AB" }));
    fireEvent.click(within(region).getByRole("button", { name: /Wierzchołek C/ }));
    expect(container.querySelector("[data-polygon-diagonal]")).toBeInTheDocument();
    fireEvent.click(within(region).getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Wynik: 3/3 pkt")).toBeInTheDocument();
  });

  it("w ocenianiu nie przekazuje rozwiązania przed oddaniem", () => {
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.independent.support} mode="assessment" assessmentSubmitted={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText(/Rozwiązanie będzie dostępne po oddaniu/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Pokaż rozwiązanie/ })).not.toBeInTheDocument();
  });

  it("renderuje adapter na tablicy, tablecie i Live, a wydruk pozostaje osobnym arkuszem", () => {
    const lesson = m545BudowniczyWielokatowV1;
    const stage = lesson.stages.find((item) => item.title === "Witraż bez prostokątów")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-polygon-builder][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-polygon-builder][data-mode="practice"]')).toBeInTheDocument();
    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={5} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-polygon-builder][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.5-polygon-construction"]')).toBeInTheDocument();
  });
});
