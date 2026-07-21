// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m546TrojkatnyPlacZabawV1 } from "@/data/lessons/section4-wp-c4";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it("na slajdzie pięciu obwodów przechodzi wewnętrznie do poprawionego drugiego zadania", () => {
    vi.useFakeTimers();
    const stage = buildLessonSessionSnapshot(m546TrojkatnyPlacZabawV1).stageSnapshot.stages.find((item) => item.title === "Obwód i brakujący bok — 5 zadań");
    if (!stage) throw new Error("Brak slajdu pięciu zadań o obwodzie.");

    render(<BoardStageDisplay stage={stage} stageIndex={6} stageCount={8} solutionRevealed={false} />);

    expect(screen.getByText("Bok trójkąta równobocznego ma 5 cm. Oblicz obwód tego trójkąta.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Następne →" })).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do pięciu ćwiczeń z obwodu");
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    act(() => vi.advanceTimersByTime(700));

    expect(screen.getByText("Obwód trójkąta równoramiennego wynosi 9 cm, a podstawa ma 1 cm. Oblicz długość jednego ramienia.")).toBeInTheDocument();
  });

  it("pokazuje na tablicy pełną interaktywną kratownicę pola", () => {
    const { container } = render(
      <BoardStageDisplay
        stage={{
          id: "m5-6-1-pokryj-bez-luk-v1-s2",
          kind: "explore",
          title: "Pole na kratownicy",
          estimatedMinutes: 8,
          boardHeadline: "Zmieniaj wymiary prostokąta",
          modelId: "rectangle-square-area-lab",
          questions: [],
        }}
        stageIndex={1}
        stageCount={5}
        solutionRevealed={false}
      />,
    );

    expect(screen.getByText("Pole na kratownicy")).toBeInTheDocument();
    expect(container.querySelectorAll("input[type='range']")).toHaveLength(2);
    expect(container.querySelectorAll("[data-area-cell='active']")).toHaveLength(24);
  });

  it("pokazuje na tablicy interaktywny schemat zamiany jednostek", () => {
    render(
      <BoardStageDisplay
        stage={{
          id: "m5-6-2-powiekszenie-kwadratu-v1-s1",
          kind: "worked-example",
          title: "Jednostki długości",
          estimatedMinutes: 8,
          boardHeadline: "Zależności między jednostkami długości",
          modelId: "area-unit-conversion-lab",
          questions: [],
        }}
        stageIndex={0}
        stageCount={4}
        solutionRevealed={false}
      />,
    );

    expect(screen.getAllByRole("heading", { name: "Zależności między jednostkami długości" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Do mniejszej jednostki →" })).toBeInTheDocument();
    expect(screen.getByText("1 km = 1000 m")).toBeInTheDocument();
  });
});
