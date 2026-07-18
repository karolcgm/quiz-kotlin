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
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.validity.core} mode="demo" />);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText("Czy ta figura jest wielokątem?")).toBeInTheDocument();
    const yesButton = screen.getByRole("button", { name: "Tak" });
    expect(yesButton).toBeEnabled();
    fireEvent.click(yesButton);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("uzupełnia tabelę jednym kalkulatorem, bez klawiatury urządzenia", () => {
    vi.useFakeTimers();
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.reshape.core} mode="demo" />);
    const fields = [
      screen.getByLabelText("Liczba: Wierzchołki"),
      screen.getByLabelText("Liczba: Boki"),
      screen.getByLabelText("Liczba: Kąty"),
    ];
    fields.forEach((field) => { expect(field).toHaveAttribute("inputmode", "none"); expect(field).toHaveAttribute("readonly"); });
    const keypad = screen.getByRole("region", { name: "Kalkulator do wielokątów" });
    expect(within(keypad).getByRole("button", { name: "3" })).toBeEnabled();
    fields.forEach((field) => { fireEvent.click(field); fireEvent.click(within(keypad).getByRole("button", { name: "3" })); });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
  });

  it("oblicza dwa obwody i w drugim zadaniu uzupełnia boki leżące naprzeciwko", () => {
    vi.useFakeTimers();
    render(<GeometryLab seed={POLYGON_LESSON_SEEDS.independent.core} />);
    expect(screen.getByText("Zadanie 1/2")).toBeInTheDocument();
    expect(screen.getByText("7 + 5 + 6 + 4 + 8 =", { exact: false })).toBeInTheDocument();
    const firstKeypad = screen.getByRole("region", { name: "Kalkulator do obwodu" });
    fireEvent.click(screen.getByLabelText("Obwód"));
    fireEvent.click(within(firstKeypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(firstKeypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(firstKeypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Poprawnie");
    act(() => vi.advanceTimersByTime(700));

    expect(screen.getByText("Zadanie 2/2")).toBeInTheDocument();
    const fields = [screen.getByLabelText("Dolny bok"), screen.getByLabelText("Prawy bok"), screen.getByLabelText("Obwód")];
    fields.forEach((field) => { expect(field).toHaveAttribute("inputmode", "none"); expect(field).toHaveAttribute("readonly"); });
    const secondKeypad = screen.getByRole("region", { name: "Kalkulator do obwodu" });
    for (const [field, value] of [[fields[0], "9"], [fields[1], "5"], [fields[2], "28"]] as const) {
      fireEvent.click(field);
      for (const digit of value) fireEvent.click(within(secondKeypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(secondKeypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("równość boków leżących naprzeciwko");
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
