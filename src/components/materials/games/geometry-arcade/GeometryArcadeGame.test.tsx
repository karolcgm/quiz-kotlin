// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GEOMETRY_GAMES, GeometryArcadeGame } from "./GeometryArcadeGame";

vi.mock("@/lib/actions/rewards", () => ({
  claimGeometryGameScoreAction: vi.fn(async () => ({ awardedPoints: 1, totalPoints: 10 })),
}));

afterEach(cleanup);

describe("gry 3D — Figury na płaszczyźnie", () => {
  it("udostępnia sześć gier po pięć punktowanych rund", () => {
    expect(Object.keys(GEOMETRY_GAMES)).toHaveLength(6);
    for (const game of Object.values(GEOMETRY_GAMES)) {
      expect(game.rounds).toHaveLength(5);
      expect(game.rounds.every((round) => round.options.length >= 2 && round.correct < round.options.length)).toBe(true);
    }
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
});
