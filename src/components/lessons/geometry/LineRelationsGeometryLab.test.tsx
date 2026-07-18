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

describe("WP-S4-01A — proste równoległe i prostopadłe", () => {
  it("pokazuje tylko dwa wymagane rodzaje prostych", () => {
    const { container } = render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.support} />);
    expect(container.querySelector("[data-simple-line-relations]")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proste równoległe" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Proste prostopadłe" })).toBeInTheDocument();
    expect(screen.getByText("a ∥ b")).toBeInTheDocument();
    expect(screen.getByText("a ⟂ b")).toBeInTheDocument();
    expect(screen.queryByText(/przecinające/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/współliniowe/u)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Deterministyczne konfiguracje Miasta linii")).not.toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-arc]")).toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-dot]")).toHaveAttribute("cx", "195");
    expect(container.querySelector("[data-right-angle-dot]")).toHaveAttribute("cy", "125");
  });

  it("obraca drogę polem liczbowym i klawiaturą oraz publikuje stan", () => {
    const onStateChange = vi.fn();
    render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.core} onStateChange={onStateChange} />);
    const panel = screen.getByRole("region", { name: "Ustaw drogę bez przeciągania" });
    fireEvent.change(within(panel).getByLabelText("Kąt prostej b"), { target: { value: "125" } });
    fireEvent.click(within(panel).getByRole("button", { name: "Zastosuj położenie" }));
    expect(screen.getByText(/a ⟂ b · prostopadłe/u)).toBeInTheDocument();
    expect(onStateChange).toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole("slider", { name: "Obrót drogi b" }), { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent(/Obrócono drogę b do 126°/u);
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
    const answers = screen.getByLabelText("Odcinki równoległe i prostopadłe w łamanej");
    fireEvent.click(within(answers).getByRole("button", { name: "∥ równoległe" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PARALLEL")).toBeInTheDocument();
    fireEvent.click(within(answers).getByRole("button", { name: "⟂ prostopadłe" }));
    expect(screen.getByText("Kody diagnostyczne: GEO_NOT_PERPENDICULAR")).toBeInTheDocument();
  });

  it("nie polega na prototypowym położeniu", () => {
    render(<GeometryLab seed={LINE_RELATION_LESSON_SEEDS.core} />);
    const configurations = screen.getByLabelText("Deterministyczne konfiguracje Miasta linii");
    fireEvent.click(within(configurations).getByRole("button", { name: "∥ równoległe" }));
    fireEvent.click(screen.getByRole("button", { name: "Ukośne" }));
    expect(screen.getByText(/a ∥ b · równoległe/u)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pionowe" }));
    expect(screen.getByText(/a ∥ b · równoległe/u)).toBeInTheDocument();
  });

  it("pozwala wpisać odcinki łamanej ABCDEFGH w puste kratki", () => {
    const { container } = render(<GeometryLab seed={410_302} />);
    expect(container.querySelector("[data-polyline-relations-exercise]")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-polyline-side]")).toHaveLength(7);
    expect(screen.getByText("Znajdź pary boków równoległych i prostopadłych.")).toBeInTheDocument();

    const keypad = screen.getByLabelText("Klawiatura literowa do nazw odcinków");
    for (const letter of ["A", "B", "C", "D", "A", "B", "B", "C", "B", "C", "C", "D"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: letter }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie. Znalazłeś wszystkie pary odcinków.");
  });

  it("wyjaśnia, dlaczego EF i FG nie są parą odcinków prostopadłych", () => {
    render(<GeometryLab seed={410_302} />);
    const keypad = screen.getByLabelText("Klawiatura literowa do nazw odcinków");

    for (const letter of ["A", "B", "C", "D", "E", "F", "F", "G", "A", "B", "B", "C"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: letter }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Odcinki EF i FG nie tworzą kąta prostego");
    expect(screen.getByRole("status")).toHaveTextContent("Drugiej pary poszukaj przy punkcie C");
  });

  it("zawiera drugą łamaną z innymi parami odcinków", () => {
    const { container } = render(<GeometryLab seed={410_303} />);
    expect(screen.getByRole("heading", { name: "Druga łamana ABCDEFGH" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-polyline-side]")).toHaveLength(7);
    const keypad = screen.getByLabelText("Klawiatura literowa do nazw odcinków");

    for (const letter of ["C", "D", "E", "F", "C", "D", "D", "E", "D", "E", "E", "F"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: letter }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie. Znalazłeś wszystkie pary odcinków.");
  });

  it("przechowuje odpowiedzi obu łamanych osobno podczas przechodzenia między slajdami", () => {
    const { rerender } = render(<GeometryLab seed={410_302} />);
    let keypad = screen.getByLabelText("Klawiatura literowa do nazw odcinków");
    fireEvent.click(within(keypad).getByRole("button", { name: "A" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "B" }));
    expect(screen.getByRole("button", { name: "Pierwszy odcinek równoległy" })).toHaveTextContent("AB");

    rerender(<GeometryLab seed={410_303} />);
    expect(screen.getByRole("heading", { name: "Druga łamana ABCDEFGH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pierwszy odcinek równoległy" })).toHaveTextContent(/^$/);
    keypad = screen.getByLabelText("Klawiatura literowa do nazw odcinków");
    fireEvent.click(within(keypad).getByRole("button", { name: "C" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "D" }));
    expect(screen.getByRole("button", { name: "Pierwszy odcinek równoległy" })).toHaveTextContent("CD");

    rerender(<GeometryLab seed={410_302} />);
    expect(screen.getByRole("heading", { name: "Łamana ABCDEFGH" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pierwszy odcinek równoległy" })).toHaveTextContent("AB");
  });

  it("renderuje ten sam model lekcji na tablicy, tablecie, live i w druku", () => {
    const stage = m541ProsteRelacjeL1V1.stages.find((item) => item.title === "Proste równoległe i prostopadłe")!;
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
