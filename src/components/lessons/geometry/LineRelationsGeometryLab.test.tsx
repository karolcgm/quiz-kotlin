// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m541ProsteRelacjeL1V1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { LINE_RELATION_LESSON_SEEDS } from "@/lib/math/geometry/lineRelations";

afterEach(cleanup);

describe("WP-S4-01A — Miasto linii", () => {
  it("rozpoznaje cztery relacje z nazwą, symbolem i kwadratem kąta prostego", () => {
    const { container } = render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.support} />);
    const configurations = screen.getByLabelText("Deterministyczne konfiguracje Miasta linii");
    expect(container.querySelector("[data-line-relations-lab]")).toBeInTheDocument();
    expect(screen.getByText(/a ∥ b · równoległe/u)).toBeInTheDocument();
    fireEvent.click(within(configurations).getByRole("button", { name: "⟂ prostopadłe" }));
    expect(screen.getByText(/a ⟂ b · prostopadłe/u)).toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-marker]")).toBeInTheDocument();
    fireEvent.click(within(configurations).getByRole("button", { name: "× przecinające" }));
    expect(screen.getByText(/a × b · przecinające/u)).toBeInTheDocument();
    fireEvent.click(within(configurations).getByRole("button", { name: "≡ współliniowe" }));
    expect(screen.getByText(/a ≡ b · współliniowe/u)).toBeInTheDocument();
  });

  it("obraca drogę polem liczbowym i klawiaturą oraz publikuje stan", () => {
    const onStateChange = vi.fn();
    render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.support} onStateChange={onStateChange} />);
    const panel = screen.getByRole("region", { name: "Ustaw drogę bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText("Kąt prostej b"), { target: { value: "90" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj położenie" }));
    expect(screen.getByText(/a ⟂ b · prostopadłe/u)).toBeInTheDocument();
    expect(onStateChange).toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("slider", { name: "Obrót drogi b" }), { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent(/Obrócono drogę b do 91°/u);
    expect(screen.getByText(/a × b · przecinające/u)).toBeInTheDocument();
  });

  it("ma uchwyty 52 px i równoważną alternatywę bez przeciągania", () => {
    const { container } = render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.core} />);
    expect(container.querySelector("[data-line-drag-handle]")).toHaveAttribute("stroke-width", "52");
    expect(screen.getByRole("slider", { name: "Obrót drogi b" })).toHaveAttribute("r", "26");
    const panel = screen.getByRole("region", { name: "Ustaw drogę bez przeciągania" });
    expect(within(panel).getByLabelText("Środek x")).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Zastosuj położenie" })).toBeInTheDocument();
  });

  it("pokazuje oba wymagane kody diagnostyczne po nietrafnej klasyfikacji", () => {
    render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.challenge} />);
    const answers = screen.getByLabelText("Samodzielne rozpoznawanie relacji");
    fireEvent.click(within(answers).getByRole("button", { name: "∥ równoległe" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PARALLEL")).toBeInTheDocument();
    fireEvent.click(within(answers).getByRole("button", { name: "⟂ prostopadłe" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PERPENDICULAR")).toBeInTheDocument();
  });

  it("nie polega na prototypowym położeniu", () => {
    render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.support} />);
    fireEvent.click(screen.getByRole("button", { name: "Ukośne" }));
    expect(screen.getByText(/a ∥ b · równoległe/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pionowe" }));
    expect(screen.getByText(/a ∥ b · równoległe/u)).toBeInTheDocument();
  });

  it("renderuje ten sam model lekcji na tablicy, tablecie, live i w druku", () => {
    const stage = m541ProsteRelacjeL1V1.stages.find((item) => item.title === "Miasto linii")!;
    const { container, rerender } = render(
      <LessonStageView
        lessonId={m541ProsteRelacjeL1V1.id}
        stage={stage}
        channel="board"
        revealIndex={0}
      />,
    );
    expect(container.querySelector('[data-line-relations-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(
      <LessonStageView
        lessonId={m541ProsteRelacjeL1V1.id}
        stage={stage}
        channel="student"
        revealIndex={0}
      />,
    );
    expect(container.querySelector('[data-line-relations-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(m541ProsteRelacjeL1V1).stageSnapshot.stages.find(
      (item) => item.id === stage.id,
    )!;
    rerender(
      <BoardStageDisplay
        stage={snapshot}
        stageIndex={1}
        stageCount={m541ProsteRelacjeL1V1.stages.length}
        solutionRevealed={false}
      />,
    );
    expect(container.querySelector('[data-line-relations-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(
      <LessonStageView
        lessonId={m541ProsteRelacjeL1V1.id}
        stage={stage}
        channel="print"
        revealIndex={0}
      />,
    );
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.1-parallel-perpendicular"]')).toBeInTheDocument();
  });
});
