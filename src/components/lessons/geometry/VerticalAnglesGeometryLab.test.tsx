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
  it("upraszcza pierwsze zadanie do dwóch obliczeń", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.crossing.support} />);
    expect(container.querySelector("[data-simple-angle-pairs]")).toBeInTheDocument();
    expect(screen.getByText("Kąt α ma 50°. Oblicz dwie brakujące miary.")).toBeInTheDocument();
    const rules = screen.getByLabelText("Własności kątów przyległych i wierzchołkowych");
    expect(within(rules).getByRole("heading", { name: "Kąty przyległe" })).toBeInTheDocument();
    expect(screen.getByText("α + β = 180°")).toBeInTheDocument();
    expect(within(rules).getByRole("heading", { name: "Kąty wierzchołkowe" })).toBeInTheDocument();
    expect(screen.getByText("α = γ oraz β = δ")).toBeInTheDocument();
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(within(labRegion(container)).queryByText(/naprzeciwko|obok/u)).not.toBeInTheDocument();
    expect(container.querySelectorAll("[data-simple-angle-arc]")).toHaveLength(4);
    const endpointLiesOnArm = (x: number, y: number) => (
      Math.abs(y - 260) < 0.01
      || Math.abs((x - 380) * -215 - (y - 260) * 180) < 0.01
    );
    for (const arc of container.querySelectorAll("[data-simple-angle-arc]")) {
      const values = (arc.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/gu) ?? []).map(Number);
      expect(endpointLiesOnArm(values[0]!, values[1]!)).toBe(true);
      expect(endpointLiesOnArm(values[7]!, values[8]!)).toBe(true);
    }
    expect(container.querySelectorAll("[data-simple-angle-label]")).toHaveLength(4);
    for (const label of container.querySelectorAll("[data-simple-angle-label]")) {
      expect(label).toHaveAttribute("text-anchor", "middle");
      expect(label).toHaveAttribute("dominant-baseline", "middle");
    }
    const work = container.querySelector("[data-simple-pairs-work]")!;
    expect(work.children[0]).toHaveAttribute("data-simple-pairs-answers");
    expect(work.children[1]).toHaveAttribute("data-simple-pairs-keypad");

    const keypad = screen.getByLabelText("Kalkulator do miar kątów");
    for (const digit of ["5", "0", "1", "3", "0"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Kąty wierzchołkowe są równe, a przyległe mają razem 180°");
  });

  it("trasuje seedy 440xxx do adaptera i aktualizuje cztery miary przez dotyk, klawiaturę i liczby", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.crossing.core} />);
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

  it("pozwala wskazać czytelną parę kątów i diagnozuje niewłaściwe położenie", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.pairs.support} />);
    fireEvent.click(screen.getByRole("button", { name: "kąt α" }));
    fireEvent.click(screen.getByRole("button", { name: "kąt β" }));
    fireEvent.click(screen.getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź parę" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_VERTICAL_PAIR_INCORRECT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "kąt β" }));
    fireEvent.click(screen.getByRole("button", { name: "kąt γ" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź parę" }));
    expect(within(labRegion(container)).getByRole("status")).toHaveTextContent("Para wierzchołkowa");
    expect(container.querySelector('[data-angle-label="α"][data-selected="true"]')).toBeInTheDocument();
    expect(container.querySelector('[data-angle-label="γ"][data-selected="true"]')).toBeInTheDocument();
    expect(container.querySelector("pattern")).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-intersection-line]')[0]).toHaveAttribute("stroke-width", "4");
  });

  it("w zadaniu z jedną daną wymaga wpisania trzech miar wspólnym kalkulatorem", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS["one-angle"].support} />);
    const sectorTexts = () => Array.from(container.querySelectorAll("[data-angle-sector]")).map((sector) => sector.textContent ?? "");
    expect(sectorTexts().filter((text) => text.includes("=")).length).toBe(1);
    const inputs = [screen.getByLabelText("Miara kąta γ"), screen.getByLabelText("Miara kąta β"), screen.getByLabelText("Miara kąta δ")];
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    const keypad = screen.getByLabelText("Kalkulator do miar kątów");
    for (const [input, value] of [[inputs[0], "35"], [inputs[1], "145"], [inputs[2], "145"]] as const) {
      fireEvent.focus(input);
      for (const digit of value) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(sectorTexts().filter((text) => text.includes("=")).length).toBe(4);
    expect(within(labRegion(container)).getByRole("status")).toHaveTextContent("Wszystkie trzy miary są poprawne");
  });

  it("dla trzech prostych pokazuje wyłącznie trzy pary równych kątów", () => {
    const { container } = render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS["three-lines"].support} />);
    expect(container.querySelectorAll("[data-atomic-sector]")).toHaveLength(6);
    expect(container.querySelectorAll('[data-intersection-line][data-line-active="true"]')).toHaveLength(3);
    expect(screen.queryByRole("button", { name: /proste [abc] \+ [abc]/ })).not.toBeInTheDocument();
    const equalities = screen.getByRole("region", { name: "Równe kąty utworzone przez trzy proste" });
    expect(within(equalities).getByText("α = δ")).toBeInTheDocument();
    expect(within(equalities).getByText("β = ε")).toBeInTheDocument();
    expect(within(equalities).getByText("γ = ζ")).toBeInTheDocument();
    expect(screen.queryByText(/sieczna|odpowiadające|naprzemianległe/i)).not.toBeInTheDocument();
  });

  it("odróżnia błąd rachunkowy od poprawnej liczby z błędną własnością", () => {
    render(<GeometryLab seed={VERTICAL_ANGLES_LESSON_SEEDS.roundabout.support} />);
    const verticalInput = screen.getByLabelText("Miara kąta wierzchołkowego");
    const adjacentInput = screen.getByLabelText("Miara kąta przyległego");
    const verticalRow = verticalInput.closest("div")!;
    const adjacentRow = adjacentInput.closest("div")!;

    const keypad = screen.getByLabelText("Kalkulator do miar kątów");
    const enter = (input: HTMLElement, value: string) => {
      fireEvent.focus(input);
      for (const digit of value) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    const clear = (input: HTMLElement, count: number) => {
      fireEvent.focus(input);
      for (let index = 0; index < count; index += 1) fireEvent.click(within(keypad).getByRole("button", { name: "← Usuń" }));
    };
    enter(verticalInput, "51");
    enter(adjacentInput, "129");
    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_CALCULATION_INCORRECT")).toBeInTheDocument();

    clear(verticalInput, 2);
    clear(adjacentInput, 3);
    enter(verticalInput, "52");
    enter(adjacentInput, "128");
    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Kody diagnostyczne: ANGLE_PROPERTY_MISMATCH")).toBeInTheDocument();
    expect(screen.getByText("Wynik: 2/3 pkt")).toBeInTheDocument();

    fireEvent.click(within(verticalRow).getByRole("button", { name: "kąty wierzchołkowe" }));
    fireEvent.click(within(adjacentRow).getByRole("button", { name: "kąty przyległe" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("3/3");
  });

  it("renderuje ten sam adapter na tablicy, tablecie, Live i osobny dowód na wydruku", () => {
    const lesson = m544SkrzyzowanieProstychV1;
    expect(lesson.stages).toHaveLength(7);
    expect(JSON.stringify(lesson.stages)).not.toMatch(/Sieczna|odpowiadające|naprzemianległe/iu);
    const stage = lesson.stages.find((item) => item.title === "Obliczenia z rysunku")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="board" revealIndex={0} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="practice"]')).toBeInTheDocument();

    const snapshot = buildLessonSessionSnapshot(lesson).stageSnapshot.stages.find((item) => item.id === stage.id)!;
    rerender(<BoardStageDisplay stage={snapshot} stageIndex={lesson.stages.indexOf(stage)} stageCount={lesson.stages.length} solutionRevealed={false} />);
    expect(container.querySelector('[data-vertical-angles-lab][data-mode="demo"]')).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
    expect(container.querySelector('[data-skill-ids~="M5-4.4-angle-calculations"]')).toBeInTheDocument();
  });
});
