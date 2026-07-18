/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function answer(value: string, advance = true) {
  const group = screen.getByRole("group", { name: "Wybierz liczbę osi symetrii" });
  fireEvent.click(within(group).getByRole("button", { name: value }));
  fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
  if (advance) act(() => vi.advanceTimersByTime(650));
}

describe("M5-4.13 — oś symetrii", () => {
  it("wyjaśnia oś symetrii i pojęcie figury osiowosymetrycznej", () => {
    render(<GeometryLab seed={490501} />);
    expect(screen.getByRole("heading", { name: "Co to jest oś symetrii?" })).toBeInTheDocument();
    expect(screen.getByText(/Oś symetrii to prosta/u)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Figura osiowosymetryczna" })).toBeInTheDocument();
    expect(screen.getByText(/co najmniej jedną oś symetrii/u)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pokazuje figury od zera do nieskończenie wielu osi", () => {
    const { container } = render(<GeometryLab seed={490502} />);
    expect(screen.getByRole("heading", { name: "Ile osi symetrii mają figury?" })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-symmetry-example]")).toHaveLength(8);
    expect(within(container.querySelector("[data-symmetry-example='square']")!).getByText("4 osie symetrii")).toBeInTheDocument();
    expect(within(container.querySelector("[data-symmetry-example='parallelogram']")!).getByText("0 osi symetrii")).toBeInTheDocument();
    expect(within(container.querySelector("[data-symmetry-example='circle']")!).getByText("Nieskończenie wiele osi")).toBeInTheDocument();
  });

  it("prowadzi osiem figur kolejno i zalicza cały zestaw", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    render(<GeometryLab seed={490503} onResultChange={onResultChange} />);
    expect(screen.getByText("Figura 1 z 8")).toBeInTheDocument();
    answer("1", false);
    expect(screen.getByRole("status")).toHaveAttribute("data-feedback-tone", "error");
    answer("2", false);
    expect(screen.getByRole("status")).toHaveAttribute("data-feedback-tone", "correct");
    act(() => vi.advanceTimersByTime(650));
    answer("0");
    answer("4");
    answer("1");
    answer("0");
    answer("3");
    answer("2");
    answer("nieskończenie wiele", false);
    expect(screen.getByText("Figura 8 z 8")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Rozpoznano osie symetrii wszystkich figur");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono 8 figur: osie symetrii");
  });
});
