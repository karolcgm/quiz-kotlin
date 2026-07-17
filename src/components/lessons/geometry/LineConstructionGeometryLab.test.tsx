// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m541KonstrukcjeProstychL2V1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { LINE_CONSTRUCTION_LESSON_SEEDS, LINE_CONSTRUCTION_TUTORIAL_SEEDS } from "@/lib/math/geometry/lineConstructions";

afterEach(cleanup);

describe("WP-S4-01B — geometry-lab L2", () => {
  it("pokazuje prawidłową konstrukcję prostopadłej krok po kroku", () => {
    const { container } = render(<GeometryLab seed={LINE_CONSTRUCTION_TUTORIAL_SEEDS.perpendicular} />);
    expect(container.querySelector('[data-construction-tutorial][data-activity="perpendicular"]')).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /bez przeciągania/u })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ustaw przez punkt P/u }));
    expect(container.querySelector('[data-highlighted-edge="P"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Narysuj prostą b/u }));
    expect(container.querySelector("[data-finished-construction]")).toHaveTextContent("a ⟂ b");
  });

  it("pokazuje nieruchomą linijkę i przesunięcie ekierki bez obrotu", () => {
    const { container } = render(<GeometryLab seed={LINE_CONSTRUCTION_TUTORIAL_SEEDS.parallel} />);
    expect(container.querySelector('[data-construction-tutorial][data-activity="parallel"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Przyłóż linijkę/u }));
    expect(container.querySelector("[data-tutorial-ruler]")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Przesuń ekierkę/u }));
    expect(container.querySelector("[data-slide-arrow]")).toBeInTheDocument();
    expect(container.querySelector('[data-tutorial-try-square][data-moved="true"]')).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Narysuj prostą b/u }));
    expect(container.querySelector("[data-finished-construction]")).toHaveTextContent("a ∥ b");
  });

  it("ustawia ekranową ekierkę i konstruuje prostopadłą przez P", () => {
    const { container } = render(<GeometryLab seed={LINE_CONSTRUCTION_LESSON_SEEDS.support} />);
    expect(container.querySelector('[data-line-construction-lab][data-activity="perpendicular"]')).toBeInTheDocument();
    expect(container.querySelector("[data-screen-try-square]")).toBeInTheDocument();
    const panel = screen.getByRole("region", { name: "Ustaw ekierkę bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText("Środek x"), { target: { value: "500" } });
    fireEvent.change(within(panel).getByLabelText("Środek y"), { target: { value: "300" } });
    fireEvent.change(within(panel).getByLabelText("Kąt °"), { target: { value: "0" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj ustawienie" }));
    fireEvent.click(screen.getByRole("button", { name: "Narysuj b wzdłuż ekierki" }));
    expect(screen.getByText("✓ konstrukcja gotowa")).toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-marker]")).toHaveTextContent("□");
    expect(container.querySelectorAll('[data-condition-met="true"]')).toHaveLength(4);
  });

  it("pokazuje ślad przesunięcia i blokuje obrót w konstrukcji równoległej", () => {
    const { container } = render(<GeometryLab seed={LINE_CONSTRUCTION_LESSON_SEEDS.core} />);
    expect(container.querySelector('[data-line-construction-lab][data-activity="parallel"]')).toBeInTheDocument();
    expect(container.querySelector("[data-parallel-translation-trace]")).toBeInTheDocument();
    expect(container.querySelector('[data-line-translation-handle="line-b"]')).toHaveAttribute("stroke-width", "52");
    expect(container.querySelector('[data-line-rotation-handle="line-b"]')).toBeNull();
    const panel = screen.getByRole("region", { name: "Ustaw prostą bez przeciągania" });
    expect(within(panel).getByLabelText("Kąt °")).toBeDisabled();
    fireEvent.change(within(panel).getByLabelText("Środek x"), { target: { value: "485" } });
    fireEvent.change(within(panel).getByLabelText("Środek y"), { target: { value: "175" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj ustawienie" }));
    expect(screen.getByText("✓ konstrukcja gotowa")).toBeInTheDocument();
    expect(container.querySelector("[data-parallel-markers]")).toBeInTheDocument();
  });

  it("obsługuje klawiaturę 1/5 oraz dotykowe uchwyty 52 px", () => {
    const { container } = render(<GeometryLab seed={LINE_CONSTRUCTION_LESSON_SEEDS.support} />);
    const moveHandle = screen.getByRole("button", { name: /Przesuń ekierkę/u });
    const rotationHandle = screen.getByRole("slider", { name: "Obrót ekierki" });
    expect(moveHandle).toHaveAttribute("r", "26");
    expect(rotationHandle).toHaveAttribute("r", "26");
    fireEvent.keyDown(moveHandle, { key: "ArrowRight", shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("Przesunięto ekierkę");
    fireEvent.keyDown(rotationHandle, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Obrócono ekierkę do 15°");
    expect(container.querySelector("[data-tool-move-handle]")).toBeInTheDocument();
  });

  it("diagnozuje GEO_NOT_PARALLEL i GEO_NOT_PERPENDICULAR w projekcie a, b, c", () => {
    render(<GeometryLab seed={LINE_CONSTRUCTION_LESSON_SEEDS.challenge} />);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź konstrukcję" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PARALLEL")).toBeInTheDocument();

    const panel = screen.getByRole("region", { name: "Ustaw prostą bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText("Kąt °"), { target: { value: "32" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj ustawienie" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PERPENDICULAR")).toBeInTheDocument();

    fireEvent.change(within(panel).getByLabelText("Prosta"), { target: { value: "line-c" } });
    fireEvent.change(within(panel).getByLabelText("Środek x"), { target: { value: "505" } });
    fireEvent.change(within(panel).getByLabelText("Środek y"), { target: { value: "125" } });
    fireEvent.change(within(panel).getByLabelText("Kąt °"), { target: { value: "122" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj ustawienie" }));
    expect(screen.getByText("✓ konstrukcja gotowa")).toBeInTheDocument();
  });

  it("renderuje rzeczywisty etap L2 na tablicy, tablecie, live i w druku", () => {
    const lesson = m541KonstrukcjeProstychL2V1;
    const stage = lesson.stages.find((item) => item.title === "Ekierka ekranowa")!;
    const { container, rerender } = render(
      <LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />,
    );
    expect(container.querySelector('[data-line-construction-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-line-construction-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={1} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-line-construction-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.1-line-constructions"]')).toBeInTheDocument();
  });
});
