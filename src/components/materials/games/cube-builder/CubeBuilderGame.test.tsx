// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CubeBuilderGame, isCubeBuildComplete } from "./CubeBuilderGame";

afterEach(cleanup);

describe("Budowniczy sześcianów", () => {
  it("sprawdza liczbę kostek potrzebnych do pełnej bryły", () => {
    const cubes = new Set(["0:0:0", "0:0:1", "0:1:0", "0:1:1", "1:0:0", "1:0:1", "1:1:0", "1:1:1"]);
    expect(isCubeBuildComplete(cubes, { id: "cube", title: "Sześcian", instruction: "", heights: [[2, 2], [2, 2]] })).toBe(true);
    cubes.delete("1:1:1");
    expect(isCubeBuildComplete(cubes, { id: "cube", title: "Sześcian", instruction: "", heights: [[2, 2], [2, 2]] })).toBe(false);
  });

  it("pokazuje instrukcję dotykowego budowania i uruchamia pracownię", () => {
    render(<CubeBuilderGame />);
    expect(screen.getByText(/dotykaj pól w modelu 3D/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /otwórz pracownię 3D/i }));
    expect(screen.getByRole("group", { name: "Tryb budowania" })).toBeInTheDocument();
    expect(screen.getByText("Ułożone kostki")).toBeInTheDocument();
  });
});
