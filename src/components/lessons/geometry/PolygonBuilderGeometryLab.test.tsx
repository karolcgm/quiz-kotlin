// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { m545BudowniczyWielokatowV1 } from "@/data/lessons/section4-wp-c4";
import { POLYGON_LESSON_SEEDS } from "@/lib/math/geometry/polygons";

afterEach(() => { cleanup(); vi.useRealTimers(); });

describe("WP-S4-05 — Wielokąty", () => {
  it("pokazuje zasadę równej liczby boków, wierzchołków i kątów oraz nazwy figur", () => {
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.builder.core} />);
    expect(screen.getByText("Liczba boków = liczba wierzchołków = liczba kątów.")).toBeInTheDocument();
    ["trójkąt", "czworokąt", "pięciokąt", "sześciokąt"].forEach((name) => expect(screen.getByRole("heading", { name })).toBeInTheDocument());
  });

  it("wyjaśnia przekątną na dużym, podpisanym pięciokącie", () => {
    const { container } = render(<GeometryLab seed={POLYGON_LESSON_SEEDS.elements.core} />);
    expect(screen.getByRole("heading", { name: "Co to jest przekątna?" })).toBeInTheDocument();
    expect(screen.getByText(/przekątna to AC/)).toBeInTheDocument();
    expect(container.querySelector("[data-polygon-diagonal]")).toBeInTheDocument();
  });

  it("prowadzi serię rozpoznawania na jednym slajdzie i automatycznie przechodzi dalej", () => {
    vi.useFakeTimers();
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.validity.core} />);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tak" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("uzupełnia tabelę jednym kalkulatorem, bez klawiatury urządzenia", () => {
    vi.useFakeTimers();
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.reshape.core} />);
    const fields = [
      screen.getByLabelText("Liczba: Wierzchołki"),
      screen.getByLabelText("Liczba: Boki"),
      screen.getByLabelText("Liczba: Kąty"),
    ];
    fields.forEach((field) => { expect(field).toHaveAttribute("inputmode", "none"); expect(field).toHaveAttribute("readonly"); });
    const keypad = screen.getByRole("region", { name: "Kalkulator do wielokątów" });
    fields.forEach((field) => { fireEvent.click(field); fireEvent.click(within(keypad).getByRole("button", { name: "3" })); });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("renderuje model na slajdzie ucznia i osobny arkusz do druku", () => {
    const lesson = m545BudowniczyWielokatowV1;
    const stage = lesson.stages.find((item) => item.title === "Policz elementy wielokąta")!;
    const { container, rerender } = render(<LessonStageView lessonId={lesson.id} stage={stage} channel="student" revealIndex={0} />);
    expect(container.querySelector("[data-polygon-counting-series]")).toBeInTheDocument();
    rerender(<LessonStageView lessonId={lesson.id} stage={stage} channel="print" revealIndex={0} />);
    expect(container.querySelector(".lesson-print-worksheet")).toBeInTheDocument();
  });
});
