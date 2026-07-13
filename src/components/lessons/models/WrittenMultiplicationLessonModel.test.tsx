// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  FIRST_SLIDE_EXAMPLES,
  WrittenMultiplicationLessonModel,
  getWrittenMultiplicationLayout,
} from "@/components/lessons/models/WrittenMultiplicationLessonModel";

afterEach(cleanup);

describe("WrittenMultiplicationLessonModel", () => {
  it("tworzy tyle pięter, ile cyfr ma mnożnik, oraz wyłącza kratki przesunięcia", () => {
    expect(getWrittenMultiplicationLayout(218, 4).rows.map((row) => row.disabledRight)).toEqual([0]);
    expect(getWrittenMultiplicationLayout(782, 36).rows.map((row) => row.disabledRight)).toEqual([0, 1]);
    expect(getWrittenMultiplicationLayout(47, 183).rows.map((row) => row.disabledRight)).toEqual([0, 1, 2]);
    expect(getWrittenMultiplicationLayout(7, 4209).rows.map((row) => row.disabledRight)).toEqual([0, 1, 2, 3]);
    expect(getWrittenMultiplicationLayout(724, 509).rows.map((row) => row.disabledRight)).toEqual([0, 1, 2]);
  });

  it("dopasowuje liczbę kratek do cyfr każdego iloczynu częściowego", () => {
    const layout = getWrittenMultiplicationLayout(782, 36);

    expect(layout.rows.map((row) => row.digitCount)).toEqual([4, 4]);
    expect(layout.columns).toBe(String(layout.result).length);
  });

  it("renderuje jeden slajd z czterema wymaganymi zadaniami", () => {
    render(<WrittenMultiplicationLessonModel seed={1} />);

    expect(FIRST_SLIDE_EXAMPLES).toHaveLength(4);
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByRole("heading", { name: "Mnożenie pisemne piętrami" })).toBeInTheDocument();
    expect(screen.getAllByText(/Sprawdzany jest wyłącznie wynik końcowy/)).toHaveLength(4);
  });

  it("udostępnia osobne pola dla pięter i wyniku końcowego", () => {
    render(<WrittenMultiplicationLessonModel seed={1} />);

    expect(screen.getAllByRole("button", { name: /Iloczyn częściowy/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Wynik końcowy/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: /Przeniesienie/ }).length).toBeGreaterThan(0);
  });
});
