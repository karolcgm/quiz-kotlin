// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoardStageDisplay } from "@/components/live/BoardStageDisplay";
import { m546TrojkatnyPlacZabawV1 } from "@/data/lessons/section4-wp-c4";
import { section7LessonsWpC7 } from "@/data/lessons/section7-wp-c7";
import { m642PredkoscV1 } from "@/data/lessons/m6-4-2-predkosc";
import { m694PolePowierzchniGraniastoslupaProstegoV1 } from "@/data/lessons/m6-9-4-pole-powierzchni-graniastoslupa-prostego";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("BoardStageDisplay - temat prędkość", () => {
  it("pokazuje interaktywny model zamiast zastępczej czarnej karty tekstowej", () => {
    const stages = buildLessonSessionSnapshot(m642PredkoscV1).stageSnapshot.stages;
    const guide = stages.find((stage) => stage.id.includes("speed-guide"));
    if (!guide) throw new Error("Brak slajdu wprowadzającego prędkość.");

    const { container } = render(
      <BoardStageDisplay
        stage={guide}
        stageIndex={1}
        stageCount={stages.length}
        solutionRevealed={false}
      />,
    );

    expect(container.querySelector("[data-distance-lab='speed-guide']")).toBeInTheDocument();
    expect(screen.getByText("prędkość = droga : czas")).toBeInTheDocument();
    expect(container.querySelector("[aria-label='Trójkąt: droga, prędkość i czas']")).toBeInTheDocument();
  });
});

describe("BoardStageDisplay — pole powierzchni graniastosłupa", () => {
  it("w trybie prowadzenia pokazuje właściwą serię zadań zamiast samej planszy etapu", () => {
    const stages = buildLessonSessionSnapshot(m694PolePowierzchniGraniastoslupaProstegoV1).stageSnapshot.stages;
    const calculate = stages.find((stage) => stage.id.includes("calculate-s2"));
    if (!calculate) throw new Error("Brak etapu obliczania pola powierzchni.");

    render(<BoardStageDisplay stage={calculate} stageIndex={2} stageCount={stages.length} solutionRevealed={false} />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByText("Oblicz pole powierzchni graniastosłupa trójkątnego.")).toBeInTheDocument();
    expect(screen.getByText("Uzupełnij Pp, Pb i Pc").closest("header")).toHaveClass("sr-only");
  });
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

  it("po przejściu do kolejnego slajdu liczb całkowitych zaczyna nową serię od zadania 1", () => {
    vi.useFakeTimers();
    const lesson = section7LessonsWpC7.find((item) => item.topicId === "M5-7.2");
    if (!lesson) throw new Error("Brak lekcji dodawania i odejmowania liczb całkowitych.");
    const stages = buildLessonSessionSnapshot(lesson).stageSnapshot.stages;
    const signs = stages.find((stage) => stage.id.endsWith("-s1"));
    const differentSigns = stages.find((stage) => stage.id.endsWith("-s2"));
    if (!signs || !differentSigns) throw new Error("Brak etapów z regułami znaków.");

    const { rerender } = render(<BoardStageDisplay stage={signs} stageIndex={0} stageCount={stages.length} solutionRevealed={false} />);
    fireEvent.click(screen.getByRole("button", { name: "5 − 2" }));
    act(() => vi.advanceTimersByTime(850));
    expect(screen.getByText("Zadanie 2/4")).toBeInTheDocument();

    rerender(<BoardStageDisplay stage={differentSigns} stageIndex={1} stageCount={stages.length} solutionRevealed={false} />);
    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "8 − 5 i znak ujemny" })).not.toBeDisabled();
  });
});
