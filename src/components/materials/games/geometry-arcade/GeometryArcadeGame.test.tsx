// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MATERIAL_CATALOG } from "@/data/materials/catalog";
import { GEOMETRY_GAMES, GeometryArcadeGame } from "./GeometryArcadeGame";
import { GEOMETRY_GAME_KEYS, isGeometryGameKey } from "./geometryGameKeys";

const { claimGeometryGameScoreActionMock } = vi.hoisted(() => ({
  claimGeometryGameScoreActionMock: vi.fn(async () => ({ awardedPoints: 1, totalPoints: 10 })),
}));

vi.mock("@/lib/actions/rewards", () => ({
  claimGeometryGameScoreAction: claimGeometryGameScoreActionMock,
}));

afterEach(() => {
  cleanup();
  claimGeometryGameScoreActionMock.mockClear();
});

describe("gry 3D — Figury na płaszczyźnie", () => {
  it("udostępnia sześć gier po pięć punktowanych rund", () => {
    expect(Object.keys(GEOMETRY_GAMES)).toHaveLength(6);
    for (const game of Object.values(GEOMETRY_GAMES)) {
      expect(game.rounds).toHaveLength(5);
      expect(game.rounds.every((round) => round.options.length >= 2 && round.correct < round.options.length)).toBe(true);
    }
  });

  it("prowadzi każdy kafel geometrii do istniejącej gry", () => {
    const geometryMaterials = MATERIAL_CATALOG.filter((material) =>
      material.componentId.startsWith("geometry-"),
    );

    expect(geometryMaterials.map((material) => material.slug).sort()).toEqual(
      [...GEOMETRY_GAME_KEYS].sort(),
    );
    expect(Object.keys(GEOMETRY_GAMES).sort()).toEqual([...GEOMETRY_GAME_KEYS].sort());
    expect(GEOMETRY_GAME_KEYS.every(isGeometryGameKey)).toBe(true);
  });

  it("wymaga wyboru portalu i pokazuje informację zwrotną", () => {
    render(<GeometryArcadeGame gameKey="laser-lab" />);
    const check = screen.getByRole("button", { name: "Sprawdź portal" });
    expect(check).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Równoległe/i }));
    fireEvent.click(check);
    expect(screen.getByText(/dobra odpowiedź/i)).toBeInTheDocument();
  });

  it("prowadzi Inspektora geometrii jako bezpośrednią diagnostykę planszy", () => {
    render(<GeometryArcadeGame gameKey="geometry-inspector" />);
    expect(screen.getByText(/dotknij bezpośrednio wadliwej konstrukcji/i)).toBeInTheDocument();
    const scan = screen.getByRole("button", { name: "Uruchom skaner" });
    expect(scan).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Moduł bursztynowy/ }));
    fireEvent.click(scan);
    expect(screen.getByText(/moduł został naprawiony/i)).toBeInTheDocument();
  });

  it("pozwala nauczycielowi ukończyć pełną grę bez zapisywania punktów", () => {
    const game = GEOMETRY_GAMES["geometry-inspector"];
    render(<GeometryArcadeGame gameKey="geometry-inspector" rewardEnabled={false} />);

    game.rounds.forEach((round, index) => {
      const option = round.options[round.correct];
      const optionButton = screen.getAllByRole("button").find((button) =>
        button.textContent?.includes(option),
      );
      expect(optionButton).toBeDefined();
      fireEvent.click(optionButton!);
      fireEvent.click(screen.getByRole("button", { name: "Uruchom skaner" }));
      fireEvent.click(screen.getByRole("button", {
        name: index === game.rounds.length - 1 ? "Zakończ misję" : /Następna runda/,
      }));
    });

    expect(screen.getByText(/gra ukończona w trybie nauczyciela/i)).toBeInTheDocument();
    expect(claimGeometryGameScoreActionMock).not.toHaveBeenCalled();
  });
});
