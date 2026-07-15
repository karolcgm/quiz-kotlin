// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m543RysowanieKatowL2V1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { ANGLE_DRAWING_LESSON_SEEDS } from "@/lib/math/geometry/angleDrawing";

afterEach(cleanup);

function alternatives() {
  return screen.getByRole("region", { name: "Ustaw bez przeciągania" });
}

function completeSupportConstruction(baseDirection = 0, rotation = 0, marker = 65, secondDirection = 295) {
  const panel = alternatives();
  fireEvent.change(within(panel).getByLabelText("Kierunek promienia bazowego"), { target: { value: String(baseDirection) } });
  fireEvent.click(screen.getByRole("button", { name: "1. Zatwierdź promień bazowy" }));
  fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "380" } });
  fireEvent.change(within(panel).getByLabelText("Y środka kątomierza"), { target: { value: "270" } });
  fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: String(rotation) } });
  fireEvent.click(screen.getByRole("button", { name: "skala zewnętrzna" }));
  fireEvent.change(within(panel).getByLabelText("Miara znacznika"), { target: { value: String(marker) } });
  fireEvent.click(screen.getByRole("button", { name: "2. Zatwierdź znacznik miary" }));
  fireEvent.change(within(panel).getByLabelText("Kierunek drugiego ramienia"), { target: { value: String(secondDirection) } });
  fireEvent.click(screen.getByRole("button", { name: "3. Zatwierdź drugie ramię" }));
}

describe("WP-S4-03B — geometry-lab rysowania kątów", () => {
  it("wymusza kolejność promień bazowy → znacznik → drugie ramię", () => {
    const { container } = render(<GeometryLab seed={ANGLE_DRAWING_LESSON_SEEDS.workflow.support} />);
    expect(container.querySelector('[data-angle-drawing-lab][data-phase="base-ray"]')).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "2. Zatwierdź znacznik miary" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_DRAW_BASE_REQUIRED")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "3. Zatwierdź drugie ramię" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_DRAW_BASE_REQUIRED")).toBeInTheDocument();

    fireEvent.change(within(alternatives()).getByLabelText("Kierunek promienia bazowego"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "1. Zatwierdź promień bazowy" }));
    fireEvent.click(screen.getByRole("button", { name: "3. Zatwierdź drugie ramię" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_DRAW_MARK_REQUIRED")).toBeInTheDocument();
  });

  it("prowadzi Narysuj 65° przez trzy zatwierdzone kroki i diagnostykę skali", () => {
    const { container } = render(<GeometryLab seed={ANGLE_DRAWING_LESSON_SEEDS.workflow.support} />);
    fireEvent.change(within(alternatives()).getByLabelText("Kierunek promienia bazowego"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "1. Zatwierdź promień bazowy" }));
    fireEvent.change(within(alternatives()).getByLabelText("X środka kątomierza"), { target: { value: "380" } });
    fireEvent.change(within(alternatives()).getByLabelText("Y środka kątomierza"), { target: { value: "270" } });
    fireEvent.change(within(alternatives()).getByLabelText("Obrót kątomierza"), { target: { value: "0" } });
    fireEvent.change(within(alternatives()).getByLabelText("Miara znacznika"), { target: { value: "65" } });
    fireEvent.click(screen.getByRole("button", { name: "2. Zatwierdź znacznik miary" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_DRAW_WRONG_SCALE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "skala zewnętrzna" }));
    fireEvent.click(screen.getByRole("button", { name: "2. Zatwierdź znacznik miary" }));
    fireEvent.change(within(alternatives()).getByLabelText("Kierunek drugiego ramienia"), { target: { value: "295" } });
    fireEvent.click(screen.getByRole("button", { name: "3. Zatwierdź drugie ramię" }));

    expect(container.querySelector('[data-angle-drawing-lab][data-phase="complete"]')).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Konstrukcja poprawna: 65.0°");
  });

  it("ma dotykowe uchwyty 52 px i klawiaturowe kroki 1/5 px oraz 1/5°", () => {
    const { container } = render(<GeometryLab seed={ANGLE_DRAWING_LESSON_SEEDS.workflow.support} />);
    const baseHandle = screen.getByRole("slider", { name: "Ustaw koniec promienia bazowego A" });
    expect(baseHandle).toHaveAttribute("r", "26");
    fireEvent.keyDown(baseHandle, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("1 px");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Ustaw koniec promienia bazowego A" }), { key: "ArrowDown", shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("5 px");

    fireEvent.change(within(alternatives()).getByLabelText("Kierunek promienia bazowego"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "1. Zatwierdź promień bazowy" }));
    const rotationHandle = screen.getByRole("slider", { name: "Obróć kątomierz" });
    fireEvent.keyDown(rotationHandle, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("1°");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Obróć kątomierz" }), { key: "ArrowLeft", shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("5°");
    expect(container.querySelectorAll('[data-touch-target="52"]')).toHaveLength(3);
  });

  it("przeprowadza anonimową kontrolę i akceptuje różnicę do 1° bez pola nazwiska", () => {
    const { container } = render(<GeometryLab seed={ANGLE_DRAWING_LESSON_SEEDS["peer-check"].support} />);
    completeSupportConstruction(27, 27, 73, 314);
    expect(screen.getByRole("region", { name: "Anonimowa kontrola koleżeńska" })).toBeInTheDocument();
    expect(container.querySelector('input[name*="name"], input[aria-label*="nazwisk" i]')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Anonimowy odczyt partnera"), { target: { value: "72.5" } });
    expect(container.querySelector("[data-peer-difference]")).toHaveTextContent("0.5°");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź anonimowy pomiar" }));
    expect(screen.getByRole("status")).toHaveTextContent("mieści się w granicy 1°");
  });

  it("renderuje lokalny adapter na tablicy, tablecie, Live i w druku", () => {
    const lesson = m543RysowanieKatowL2V1;
    const stage = lesson.stages.find((item) => item.title === "Narysuj 65°")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-angle-drawing-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-angle-drawing-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={1} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-angle-drawing-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.3-draw-angles"]')).toBeInTheDocument();
  });
});
