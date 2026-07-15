// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m543KatomierzEkranowyV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { ANGLE_MEASUREMENT_LESSON_SEEDS } from "@/lib/math/geometry/angleMeasurement";

afterEach(cleanup);

function alternativePanel() {
  return screen.getByRole("region", { name: "Ustaw bez przeciągania" });
}

function alignSetupSupport() {
  const panel = alternativePanel();
  fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "380" } });
  fireEvent.change(within(panel).getByLabelText("Y środka kątomierza"), { target: { value: "255" } });
  fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: "15" } });
}

describe("WP-S4-03A — geometry-lab pomiaru kątów", () => {
  it("wymaga jednocześnie środka na B i bazy na BA", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support} />);
    expect(container.querySelector('[data-angle-measurement-lab][data-activity="setup"]')).toBeInTheDocument();
    expect(container.querySelector('[data-measurement-ready="false"]')).toBeInTheDocument();

    const panel = alternativePanel();
    fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "380" } });
    fireEvent.change(within(panel).getByLabelText("Y środka kątomierza"), { target: { value: "255" } });
    expect(container.querySelector('[data-center-aligned="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-baseline-aligned="false"]')).toBeInTheDocument();
    expect(container.querySelector('[data-measurement-ready="false"]')).toBeInTheDocument();

    fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: "15" } });
    expect(container.querySelector('[data-center-aligned="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-baseline-aligned="true"]')).toBeInTheDocument();
    expect(screen.getByText("✓ gotowy do odczytu")).toBeInTheDocument();
  });

  it("obsługuje klawiaturę 1/5 px i 1/5° oraz dotykowe uchwyty 52 px", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support} />);
    const centerHandle = screen.getByRole("slider", { name: /Przenieś środek kątomierza/u });
    const rotationHandle = screen.getByRole("slider", { name: /Obróć kątomierz/u });
    expect(centerHandle).toHaveAttribute("r", "26");
    expect(rotationHandle).toHaveAttribute("r", "26");
    expect(centerHandle).toHaveAttribute("data-touch-target", "52");
    expect(rotationHandle).toHaveAttribute("data-touch-target", "52");

    fireEvent.keyDown(centerHandle, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("1 px");
    fireEvent.keyDown(screen.getByRole("slider", { name: /Przenieś środek kątomierza/u }), { key: "ArrowDown", shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("5 px");
    fireEvent.keyDown(screen.getByRole("slider", { name: /Obróć kątomierz/u }), { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("1°");
    fireEvent.keyDown(screen.getByRole("slider", { name: /Obróć kątomierz/u }), { key: "ArrowLeft", shiftKey: true });
    expect(screen.getByRole("status")).toHaveTextContent("5°");
    expect(container.querySelectorAll('[data-touch-target="52"]')).toHaveLength(2);
  });

  it("pokazuje obie skale, wybiera właściwe zero i diagnozuje ustawienie oraz odczyt", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support} />);
    expect(container.querySelector("[data-outer-zero]")).toHaveTextContent("0 zewn.");
    expect(container.querySelector("[data-inner-zero]")).toHaveTextContent("0 wewn.");

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_CENTER_MISALIGNED")).toBeInTheDocument();

    alignSetupSupport();
    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "40" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_WRONG_SCALE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /skala zewnętrzna/u }));
    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "55" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_READING_INCORRECT")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "40" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByRole("status")).toHaveTextContent("Pomiar poprawny: 40°");
  });

  it("w serii zachowuje położenie narzędzia i nie ustawia następnego kąta automatycznie", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.series.support} />);
    const panel = alternativePanel();
    fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "111" } });
    fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: "17" } });
    fireEvent.click(screen.getByRole("button", { name: "Kąt 2" }));

    expect(within(alternativePanel()).getByLabelText("X środka kątomierza")).toHaveValue(111);
    expect(within(alternativePanel()).getByLabelText("Obrót kątomierza")).toHaveValue(17);
    expect(container.querySelector('[data-measurement-ready="false"]')).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("nie zostało ustawione automatycznie");
  });

  it("renderuje rzeczywisty model na tablicy, tablecie, live i kontrakt druku", () => {
    const lesson = m543KatomierzEkranowyV1;
    const stage = lesson.stages.find((item) => item.title === "Kątomierz ekranowy")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-angle-measurement-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-angle-measurement-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={1} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-angle-measurement-lab][data-mode="demo"]')).toBeInTheDocument();

    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.3-measure-angles"]')).toBeInTheDocument();
  });
});
