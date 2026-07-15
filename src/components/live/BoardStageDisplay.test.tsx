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

  it("dla serii geometrycznej uruchamia seed aktualnego przykładu, nie stały seed slajdu", () => {
    const { container } = render(
      <BoardStageDisplay
        stage={{
          id: "m547-evidence",
          kind: "practice",
          title: "Ćwiczenia — 5 przykładów",
          estimatedMinutes: 14,
          boardHeadline: "Jedno aktywne zadanie geometryczne",
          modelId: "geometry-lab",
          modelSeed: 470601,
          questions: [{ questionInstanceId: "q1", generatorId: "geometry-triangle-construction-v1", seed: 470201, difficulty: "support", expression: "", prompt: "", maxScore: 1 }],
        }}
        stageIndex={4}
        stageCount={6}
        solutionRevealed={false}
      />,
    );
    expect(container.querySelector("[data-triangle-construction-lab][data-activity='inequality']")).toBeInTheDocument();
  });
});
