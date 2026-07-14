// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FactorVaultGame } from "@/components/materials/games/factor-vault/FactorVaultGame";
import { Maze67Game } from "@/components/materials/games/maze-67/Maze67Game";
import { NumberRangersGame } from "@/components/materials/games/number-rangers/NumberRangersGame";

vi.mock("@/lib/actions/rewards", () => ({
  claimVisualGamePerfectRewardAction: vi.fn(async () => ({ awarded: true, totalPoints: 5 })),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("nowe gry przygodowe", () => {
  it("Labirynt 67 jasno tłumaczy cel i pokazuje HUD trasy", () => {
    render(<Maze67Game />);

    expect(screen.getByText(/suma wynosiła dokładnie/i)).toHaveTextContent("67");
    fireEvent.click(screen.getByRole("button", { name: /Trudny/i }));
    fireEvent.click(screen.getByRole("button", { name: "Wejdź do labiryntu →" }));

    expect(screen.getByRole("progressbar", { name: "Postęp przez labirynt" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Brakuje")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🧭 Kompas" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Brama 1, wybierz/ })).toHaveLength(3);
  });

  it("Skarbiec Czynników łączy obracane pierścienie z iloczynem", () => {
    render(<FactorVaultGame />);

    expect(screen.getByText(/jeden czynnik pierwszy/i)).toBeInTheDocument();
    expect(screen.getByText("12 = 2 × 2 × 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zanurkuj do skarbca →" }));

    expect(screen.getByRole("progressbar", { name: "Postęp otwierania skarbca" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Panel pierścieni")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Obróć pierścień 1 w lewo/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "🔐 Otwórz skarbiec" })).toBeInTheDocument();
  });

  it("Łowcy Liczb wprowadzają fabułę, życie i pokazują siedem celów", () => {
    render(<NumberRangersGame />);

    expect(screen.getByRole("heading", { name: "Łowcy Liczb" })).toBeInTheDocument();
    expect(screen.getByText("Kryształ Ładu")).toBeInTheDocument();
    expect(screen.getByText(/Kapsuła Mocy/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Poznaj historię →" }));

    expect(screen.getByRole("heading", { name: "Kryształ Ładu pękł." })).toBeInTheDocument();
    expect(screen.getByText(/Cztery fragmenty przeleciały przez portale/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wyrusz z Chrupkiem →" }));

    expect(screen.getByRole("progressbar", { name: "Postęp łowów" })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByLabelText("3 serca")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "📡 Skaner" })).toBeInTheDocument();
    const targets = screen.getAllByRole("button", { name: /Rzuć kapsułę w liczbę/ });
    expect(targets).toHaveLength(7);
    fireEvent.click(targets[0]);
    expect(screen.getByRole("status")).toHaveTextContent(/Rzut w liczbę/);
  });

  it("Łowcy Liczb po utracie trzech serc przenoszą gracza do obozu Chrupka", () => {
    vi.useFakeTimers();
    render(<NumberRangersGame />);

    fireEvent.click(screen.getByRole("button", { name: "Łatwy Małe liczby i podstawowe pojęcia" }));
    fireEvent.click(screen.getByRole("button", { name: "Poznaj historię →" }));
    fireEvent.click(screen.getByRole("button", { name: "Wyrusz z Chrupkiem →" }));

    const instruction = screen.getByRole("heading", { level: 2 }).textContent ?? "";
    const targets = screen.getAllByRole("button", { name: /Rzuć kapsułę w liczbę/ });
    const wrongTarget = targets.find((target) => {
      const value = Number(target.getAttribute("aria-label")?.match(/\d+/)?.[0]);
      if (instruction.includes("przez 2")) return value % 2 !== 0;
      if (instruction.includes("przez 5")) return value % 5 !== 0;
      if (instruction.includes("dzielniki liczby 24")) return 24 % value !== 0;
      return ![2, 7, 13].includes(value);
    });

    expect(wrongTarget).toBeDefined();
    fireEvent.click(wrongTarget!);
    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByLabelText("2 serca")).toBeInTheDocument();

    fireEvent.click(wrongTarget!);
    act(() => vi.advanceTimersByTime(650));
    expect(screen.getByLabelText("1 serca")).toBeInTheDocument();

    fireEvent.click(wrongTarget!);
    act(() => vi.advanceTimersByTime(1_500));
    expect(screen.getByRole("heading", { name: "Spokojnie, odnawiamy serca." })).toBeInTheDocument();
    expect(screen.getByText(/Wskazówka Chrupka/i)).toBeInTheDocument();
  });
});
