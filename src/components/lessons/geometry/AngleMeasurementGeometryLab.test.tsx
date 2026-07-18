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

function alignSetupCore() {
  const panel = alternativePanel();
  fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "380" } });
  fireEvent.change(within(panel).getByLabelText("Y środka kątomierza"), { target: { value: "255" } });
  fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: "148" } });
}

describe("WP-S4-03A — geometry-lab pomiaru kątów", () => {
  it("na slajdzie pomiaru pokazuje 10 zadań bez strzałek, czytelny kątomierz i jedną klawiaturę", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support} />);
    expect(container.querySelector('[data-angle-measurement-lab][data-activity="setup"]')).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Pomiar kąta ABC/u })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Cyfra \d z 2/u })).toHaveLength(2);
    expect(screen.getByLabelText("Klawiatura do wpisania miary kąta")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Ustaw bez przeciągania" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /skala zewnętrzna/u })).not.toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Poprzednie zadanie/u })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Następne zadanie/u })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Przykład/u })).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-angle-arm]")).toHaveLength(2);
    expect(Array.from(container.querySelectorAll("[data-angle-arm]")).every((arm) => !arm.hasAttribute("marker-end"))).toBe(true);
    expect(container.querySelector('[id^="measurement-arrow-"]')).not.toBeInTheDocument();
    expect(container.querySelector("[data-protractor]")).toHaveAttribute("transform", expect.stringContaining("translate"));

    fireEvent.click(screen.getByRole("button", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(screen.getByRole("button", { name: "Cyfra 1 z 2" })).toHaveTextContent("4");
    expect(screen.getByRole("button", { name: "Cyfra 2 z 2" })).toHaveTextContent("0");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Ustaw środek kątomierza na punkcie B");
  });

  it("po upuszczeniu snapuje znaczniki środka i bazę do 8°, ale pozwala je ponownie oderwać", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.support} />);
    const svg = screen.getByRole("img", { name: /Pomiar kąta ABC/u }) as unknown as SVGSVGElement;
    Object.defineProperty(svg, "getBoundingClientRect", {
      value: () => ({ left: 0, top: 0, right: 760, bottom: 500, width: 760, height: 500, x: 0, y: 0, toJSON: () => ({}) }),
    });
    const pointer = (element: Element, type: "pointerdown" | "pointermove" | "pointerup", pointerId: number, clientX: number, clientY: number) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperties(event, {
        pointerId: { value: pointerId },
        clientX: { value: clientX },
        clientY: { value: clientY },
      });
      fireEvent(element, event);
    };

    const centerHandle = screen.getByRole("slider", { name: /Przenieś środek kątomierza/u });
    pointer(centerHandle, "pointerdown", 1, 288, 337);
    pointer(centerHandle, "pointermove", 1, 410, 255);
    pointer(centerHandle, "pointerup", 1, 410, 255);
    expect(container.querySelector("[data-center-guide]")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Przyciągnięto środek kątomierza do punktu B");

    const snappedCenterHandle = screen.getByRole("slider", { name: /Przenieś środek kątomierza/u });
    pointer(snappedCenterHandle, "pointerdown", 2, 380, 255);
    pointer(snappedCenterHandle, "pointermove", 2, 450, 255);
    pointer(snappedCenterHandle, "pointerup", 2, 450, 255);
    expect(container.querySelector("[data-center-guide]")).toBeInTheDocument();

    const rotationHandle = screen.getByRole("slider", { name: /Obróć kątomierz/u });
    pointer(rotationHandle, "pointerdown", 3, 641, 420);
    pointer(rotationHandle, "pointermove", 3, 652, 309);
    pointer(rotationHandle, "pointerup", 3, 652, 309);
    expect(container.querySelector("[data-baseline-guide]")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Wyrównano bazę kątomierza do ramienia BA");
  });

  it("obsługuje klawiaturę 1/5 px i 1/5° oraz dotykowe uchwyty 52 px", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.core} />);
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
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.setup.core} />);
    expect(container.querySelector("[data-outer-zero]")).toHaveTextContent("0 zewn.");
    expect(container.querySelector("[data-inner-zero]")).toHaveTextContent("0 wewn.");

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_CENTER_MISALIGNED")).toBeInTheDocument();

    alignSetupCore();
    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "67" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_WRONG_SCALE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /skala wewnętrzna/u }));
    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "55" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_READING_INCORRECT")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Odczyt kąta w stopniach"), { target: { value: "67" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pomiar" }));
    expect(screen.getByRole("status")).toHaveTextContent("Pomiar poprawny: 67°");
  });

  it("rozważa dwa położenia ramienia BD i sprawdza oba kąty wklęsłe jednym kalkulatorem", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.scale.support} />);
    expect(container.querySelector('[data-angle-application="reflex"]')).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ramiona BA i BD po tej samej stronie ramienia BC" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ramiona BA i BD po przeciwnych stronach ramienia BC" })).toBeInTheDocument();
    expect(screen.getAllByLabelText("Mniejszy kąt DBA")).toHaveLength(2);
    expect(screen.getAllByLabelText("Kąt wklęsły DBA")).toHaveLength(2);
    expect(screen.getAllByLabelText(/Kalkulator do obu przypadków/u)).toHaveLength(1);

    ["3", "5", "3", "2", "5", "8", "5", "2", "7", "5"].forEach((digit) => fireEvent.click(screen.getByRole("button", { name: digit })));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie");
  });

  it("wyznacza obrót wskazówki w minutę, kwadrans i pół godziny", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.scale.core} />);
    expect(container.querySelector('[data-angle-application="clock"]')).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Wskazówka minutowa obraca się od godziny 12 do 3" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Wskazówka minutowa obraca się od godziny 12 do 6" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Kalkulator do zadania z zegarem/u)).toHaveLength(1);

    ["6", "9", "0", "1", "8", "0"].forEach((digit) => fireEvent.click(screen.getByRole("button", { name: digit })));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wskazówka minutowa pokonuje 6°");
  });

  it("w serii zachowuje położenie narzędzia i nie ustawia następnego kąta automatycznie", () => {
    const { container } = render(<GeometryLab seed={ANGLE_MEASUREMENT_LESSON_SEEDS.series.support} />);
    const panel = alternativePanel();
    fireEvent.change(within(panel).getByLabelText("X środka kątomierza"), { target: { value: "111" } });
    fireEvent.change(within(panel).getByLabelText("Obrót kątomierza"), { target: { value: "17" } });
    fireEvent.click(screen.getByRole("button", { name: /Następne zadanie/u }));

    expect(within(alternativePanel()).getByLabelText("X środka kątomierza")).toHaveValue(111);
    expect(within(alternativePanel()).getByLabelText("Obrót kątomierza")).toHaveValue(17);
    expect(container.querySelector('[data-measurement-ready="false"]')).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("nie zostało ustawione automatycznie");
  });

  it("renderuje rzeczywisty model na tablicy, tablecie, live i kontrakt druku", () => {
    const lesson = m543KatomierzEkranowyV1;
    expect(lesson.stages.some((item) => item.title === "Zanim odczytasz")).toBe(false);
    const stage = lesson.stages.find((item) => item.title === "Pomiar kąta kątomierzem")!;
    expect(stage.print?.items).toHaveLength(10);
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
