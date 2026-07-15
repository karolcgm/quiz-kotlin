// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";

afterEach(cleanup);

describe("BoardStageDisplay — Ocena umiejętności", () => {
  it("pokazuje wyłącznie anonimowy rozkład samooceny", () => {
    render(
      <BoardStageDisplay
        stage={{
          id: "m5-3-1-understanding",
          kind: "understanding",
          title: "Ocena umiejętności",
          estimatedMinutes: 5,
          boardHeadline: "Ocena ucznia — co już potrafię?",
          questions: [],
        }}
        stageIndex={6}
        stageCount={7}
        solutionRevealed={false}
        understandingSummary={{
          submittedCount: 6,
          understoodCount: 3,
          partialCount: 2,
          notUnderstoodCount: 1,
        }}
      />,
    );

    expect(screen.getByRole("region", { name: "Anonimowy rozkład samooceny klasy" })).toBeInTheDocument();
    expect(screen.getByText("Odpowiedziało 6 osób. Bez nazwisk i indywidualnych punktów.")).toBeInTheDocument();
    expect(screen.getByText("Umiem samodzielnie")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/nazwisko|ranking/i);
  });
});
