// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m544SkrzyzowanieProstychV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { VERTICAL_ANGLES_LESSON_SEEDS } from "@/lib/math/geometry/verticalAngles";

afterEach(cleanup);

function labRegion(container: HTMLElement): HTMLElement {
  return container.querySelector("[data-vertical-angles-lab]") as HTMLElement;
}

function alternatives() {
  return screen.getByRole("region", { name: "Ustaw przecięcie bez przeciągania" });
}

describe("WP-S4-04 — lokalny geometry-lab przecięcia prostych", () => {
  it("trasuje seedy 440xxx do adaptera i aktualizuje cztery miary przez dotyk, klawiaturę i liczby", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.crossing.support} />);
    const lab = labRegion(container);
    expect(lab).toHaveAttribute("data-activity", "crossing");
    expect(container.querySelectorAll("[data-angle-sector]")).toHaveLength(4);

    const handle = within(lab).getByRole("slider", { name: /Uchwyt prostej b/ });
    expect(handle).toHaveAttribute("r", "26");
    expect(handle).toHaveAttribute("data-touch-target", "52");
    const before = container.querySelector("[data-vertical-invariant]")!.textContent;
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(within(lab).getByRole("status")).toHaveTextContent("1°");
    fireEvent.keyDown(within(lab).getByRole("slider", { name: /Uchwyt prostej b/ }), { key: "ArrowDown", shiftKey: true });
    expect(within(lab).getByRole("status")).toHaveTextContent("5 px");

    fireEvent.change(within(alternatives()).getByLabelText("Kierunek prostej b"), { target: { value: "101" } });
    expect(container.querySelector("[data-vertical-invariant]")!.textContent).not.toBe(before);
    fireEvent.click(within(alternatives()).getByRole("button", { name: "+5°" }));
    expect(within(lab).getByRole("status")).toHaveTextContent("Zmieniono kierunek prostej");
  });

  it("podświetla pary symbolem i wzorem oraz diagnozuje niewłaściwe położenie", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.pairs.support} />);
    fireEvent.click(screen.getByRole("button", { name: "α ●" }));
    fireEvent.click(screen.getByRole("button", { name: "β ▲" }));
    fireEvent.click(screen.getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź parę" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_VERTICAL_PAIR_INCORRECT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "β ▲" }));
    fireEvent.click(screen.getByRole("button", { name: "γ ●" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź parę" }));
    expect(within(labRegion(container)).getByRole("status")).toHaveTextContent("Para wierzchołkowa");
    expect(container.querySelector('[data-angle-label="α"][data-selected="true"]')).toHaveAttribute("data-pair-pattern", "stripes");
    expect(container.querySelector('[data-angle-label="γ"][data-selected="true"]')).toHaveAttribute("data-pair-pattern", "stripes");
    expect(container.querySelector('[data-angle-label="β"]')).toHaveAttribute("data-pair-pattern", "dots");
  });

  it("w historii Jeden kąt wystarcza odsłania miary dopiero po wyborze własności", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS["one-angle"].support} />);
    const sectorTexts = () => Array.from(container.querySelectorAll("[data-angle-sector]")).map((sector) => sector.textContent ?? "");
    expect(sectorTexts().filter((text) => !text.includes("?")).length).toBe(1);
    fireEvent.click(screen.getByRole("button", { name: /Naprzeciwko: kąty wierzchołkowe/ }));
    expect(sectorTexts().filter((text) => !text.includes("?")).length).toBe(2);
    fireEvent.click(screen.getByRole("button", { name: /Obok: kąty przyległe/ }));
    expect(sectorTexts().filter((text) => !text.includes("?")).length).toBe(4);
  });

  it("dla trzech prostych pokazuje sześć sektorów i wygasza prostą spoza aktywnej pary", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS["three-lines"].support} />);
    expect(container.querySelectorAll("[data-atomic-sector]")).toHaveLength(6);
    expect(container.querySelector('[data-intersection-line="c"]')).toHaveAttribute("data-line-active", "false");
    fireEvent.click(screen.getByRole("button", { name: "proste a + c" }));
    expect(container.querySelector('[data-intersection-line="b"]')).toHaveAttribute("data-line-active", "false");
    expect(container.querySelector('[data-intersection-line="c"]')).toHaveAttribute("data-line-active", "true");
  });

  it("odróżnia błąd rachunkowy od poprawnej liczby z błędną własnością", () => {
    render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.roundabout.support} />);
    const verticalInput = screen.getByLabelText("Miara kąta wierzchołkowego");
    const adjacentInput = screen.getByLabelText("Miara kąta przyległego");
    const verticalRow = verticalInput.closest("div")!;
    const adjacentRow = adjacentInput.closest("div")!;

    fireEvent.change(verticalInput, { target: { value: "51" } });
    fireEvent.change(adjacentInput, { target: { value: "129" } });
    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obliczenia i uzasadnienie" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_CALCULATION_INCORRECT")).toBeInTheDocument();

    fireEvent.change(verticalInput, { target: { value: "52" } });
    fireEvent.change(adjacentInput, { target: { value: "128" } });
    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obliczenia i uzasadnienie" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_PROPERTY_MISMATCH")).toBeInTheDocument();
    expect(screen.getByText("Wynik: 2/3 pkt")).toBeInTheDocument();

    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obliczenia i uzasadnienie" }));
    expect(screen.getByRole("status")).toHaveTextContent("3/3");
  });

  it("renderuje ten sam adapter na tablicy, tablecie, Live i osobny dowód na wydruku", () => {
    const lesson = m544SkrzyzowanieProstychV1;
    const stage = lesson.stages.find((item) => item.title === "Rondo tramwajowe")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={5} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.4-angle-calculations"]')).toBeInTheDocument();
  });
});
