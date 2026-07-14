// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildNumberFactoryRounds,
  NumberFactoryGame,
} from "@/components/materials/games/number-factory/NumberFactoryGame";
import {
  buildExpeditionRounds,
  ExpeditionNwdNwwGame,
} from "@/components/materials/games/expedition-nwd-nww/ExpeditionNwdNwwGame";

afterEach(cleanup);

describe("gry Działu II", () => {
  it("Fabryka Liczb tworzy pięć losowanych rund na każdym poziomie", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const rounds = buildNumberFactoryRounds(difficulty, () => 0.37);
      expect(rounds).toHaveLength(5);
      expect(new Set(rounds.map((round) => round.id))).toHaveLength(5);
      expect(rounds.some((round) => round.shouldCatch)).toBe(true);
      expect(rounds.some((round) => !round.shouldCatch)).toBe(true);
    }
  });

  it("Fabryka Liczb wyjaśnia mechanikę i pozwala wybrać trudny poziom", () => {
    render(<NumberFactoryGame />);

    expect(
      screen.getByText(/uruchom łapkę dopiero w podświetlonej strefie/i),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Trudny/i }));
    fireEvent.click(screen.getByRole("button", { name: "Uruchom taśmę →" }));

    expect(screen.getByText(/Łapka sortuje:/)).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Postęp zmiany w fabryce" }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Czas")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "🦾 Uruchom łapkę" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Przepuść liczbę" }),
    ).toBeInTheDocument();
  });

  it("Baza Wyprawy obejmuje NWD i NWW na każdym poziomie", () => {
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const rounds = buildExpeditionRounds(difficulty, () => 0.51);
      expect(rounds).toHaveLength(5);
      expect(rounds.some((round) => round.method === "NWD")).toBe(true);
      expect(rounds.some((round) => round.method === "NWW")).toBe(true);
    }
  });

  it("Baza Wyprawy po wyborze metody pokazuje rozkłady i klawiaturę", () => {
    render(<ExpeditionNwdNwwGame />);
    fireEvent.click(
      screen.getByRole("button", { name: "Rozpocznij wyprawę →" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "NWD" }));

    expect(
      screen.getByText("Rozkłady pomagające w obliczeniu"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Postęp wyprawy" }),
    ).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByLabelText("Kroki planowania")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Klawiatura wyniku wyprawy"),
    ).toBeInTheDocument();
  });
});
