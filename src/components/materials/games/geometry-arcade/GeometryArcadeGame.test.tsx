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

vi.mock("./LaserLabScene", () => ({
  LaserLabScene: () => <div aria-label="Laboratorium laserów 3D" />,
}));

afterEach(() => {
  cleanup();
  claimGeometryGameScoreActionMock.mockClear();
});

describe("gry interaktywne — Figury na płaszczyźnie", () => {
  it("udostępnia sześć gier z odrębnymi mechanikami", () => {
    expect(Object.keys(GEOMETRY_GAMES)).toHaveLength(6);
    expect(GEOMETRY_GAMES["laser-lab"].action).toBe("Uruchom laser");
    expect(GEOMETRY_GAMES["polygon-forge"].action).toBe("Sprawdź konstrukcję");
    expect(GEOMETRY_GAMES["triangle-shipyard"].action).toBe("Zbuduj kadłub");
    expect(GEOMETRY_GAMES["quadrilateral-arena"].action).toBe("Oceń arenę");
    expect(GEOMETRY_GAMES["symmetry-temple"].action).toBe("Aktywuj zwierciadło");
    expect(GEOMETRY_GAMES["geometry-inspector"].action).toBe("Uruchom skaner");
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

  it("nie używa odpowiedzi A–D i wymaga działania bezpośrednio na planszy", () => {
    render(<GeometryArcadeGame gameKey="geometry-inspector" />);
    expect(screen.queryByRole("button", { name: /^A$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^B$/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Uruchom skaner" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Konstrukcja 3/ }));
    expect(screen.getByRole("button", { name: "Uruchom skaner" })).toBeEnabled();
  });

  it("pozwala naprawić błędny wybór na tej samej planszy", () => {
    render(<GeometryArcadeGame gameKey="geometry-inspector" />);
    fireEvent.click(screen.getByRole("button", { name: /Konstrukcja 1/ }));
    fireEvent.click(screen.getByRole("button", { name: "Uruchom skaner" }));
    expect(screen.getByText(/układ jeszcze nie działa/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Popraw układ" }));
    fireEvent.click(screen.getByRole("button", { name: /Konstrukcja 3/ }));
    fireEvent.click(screen.getByRole("button", { name: "Uruchom skaner" }));
    expect(screen.getByText(/usterka znaleziona/i)).toBeInTheDocument();
  });

  it("prowadzi nauczyciela przez pięć misji bez zapisywania punktów", () => {
    const correctModules = [3, 3, 2, 4, 1];
    render(<GeometryArcadeGame gameKey="geometry-inspector" rewardEnabled={false} />);

    correctModules.forEach((moduleNumber, index) => {
      fireEvent.click(screen.getByRole("button", { name: `Konstrukcja ${moduleNumber}` }));
      fireEvent.click(screen.getByRole("button", { name: "Uruchom skaner" }));
      fireEvent.click(screen.getByRole("button", {
        name: index === correctModules.length - 1 ? "Zakończ misję" : /Następna misja/,
      }));
    });

    expect(screen.getByText(/gra ukończona w trybie nauczyciela/i)).toBeInTheDocument();
    expect(claimGeometryGameScoreActionMock).not.toHaveBeenCalled();
  });
});
