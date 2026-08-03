/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlgebraLessonLab } from "@/components/lessons/algebra/AlgebraLessonLab";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-r3f-canvas />,
  useFrame: vi.fn(),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(cleanup);

describe("AlgebraLessonLab", () => {
  it("pokazuje dokładnie jeden licznik zadania i nie tworzy wewnętrznej nawigacji serii", () => {
    render(<AlgebraLessonLab activity="translate-words" taskSeed={0} topicNumber={1} questionNumber={2} questionCount={16} />);
    expect(screen.getAllByText("Zadanie 2/16")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Poprzednie/u })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Następne/u })).not.toBeInTheDocument();
  });

  it("blokuje puste pole, używa readOnly i inputMode none oraz wpisuje odpowiedź klawiaturą lekcyjną", () => {
    const reporter = vi.fn();
    const view = render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={0} topicNumber={2} questionNumber={1} questionCount={10} onResultChange={reporter} />);
    const input = screen.getByRole("textbox", { name: "Wartość odpowiedzi" });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(view.container.querySelector("[data-lesson-numeric-keypad='shared']")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij odpowiedź");
    expect(reporter).toHaveBeenLastCalledWith(null);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(input).toHaveValue("11");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "11");
  });

  it("po odpowiedzi bez punktu pokazuje obowiązkowy neutralny feedback", () => {
    const reporter = vi.fn();
    render(<AlgebraLessonLab activity="translate-words" taskSeed={0} topicNumber={1} questionNumber={1} questionCount={16} onResultChange={reporter} />);
    fireEvent.click(screen.getByRole("button", { name: "x − 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Spróbuj innym razem. Poprawny wynik to x + 2. Dziś bez punktu.");
    expect(status.textContent).not.toMatch(/Źle|Błąd/u);
    expect(reporter).toHaveBeenLastCalledWith(false, "x − 2");
  });

  it("nie pokazuje niespójnego modelu paczek w zadaniach z podstawowych wyrażeń", () => {
    const view = render(<AlgebraLessonLab activity="translate-words" taskSeed={2} topicNumber={1} questionNumber={3} questionCount={16} />);
    expect(screen.getByText("Który zapis oznacza liczbę 2 razy większą od x?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2x" })).toBeInTheDocument();
    expect(view.container.querySelector("[data-algebra-scene-3d]")).not.toBeInTheDocument();
    expect(view.container).not.toHaveTextContent("3 jednakowych paczek");
  });

  it("pokazuje iloraz jako ułamek piętrowy bez ukośnika", () => {
    render(<AlgebraLessonLab activity="translate-words" taskSeed={3} topicNumber={1} questionNumber={4} questionCount={16} />);
    const halfOfX = screen.getByRole("button", { name: "x podzielone przez 2" });
    expect(halfOfX.querySelector(".border-b-2")).toHaveTextContent("x");
    expect(halfOfX).toHaveTextContent("2");
    expect(screen.getByRole("group", { name: "Wybierz odpowiedź" }).textContent).not.toContain("/");
  });

  it("renderuje dostępny odpowiednik sceny R3F i kontrolę animacji", () => {
    const view = render(<AlgebraLessonLab activity="equation-meaning" topicNumber={4} />);
    expect(view.container.querySelector("[data-r3f-canvas]")).toBeInTheDocument();
    expect(view.container.querySelector("[data-algebra-scene-3d]")).toHaveAccessibleName("Trójwymiarowy model wagi równania");
    expect(screen.getByRole("button", { name: "Zatrzymaj animację" })).toBeInTheDocument();
    expect(screen.getByText(/lewa strona ma wartość/u)).toBeInTheDocument();
  });

  it("nie zdradza wartości x przed rozwiązaniem równania ani zadania tekstowego", () => {
    const balance = render(<AlgebraLessonLab activity="balance-solve" taskSeed={0} topicNumber={6} questionNumber={1} questionCount={12} />);
    expect(balance.container).toHaveTextContent("Wartość ukryta w pudełku x pozostaje zakryta");
    expect(balance.container).not.toHaveTextContent("Dla x = 7");
    cleanup();

    const story = render(<AlgebraLessonLab activity="story-solve" taskSeed={0} topicNumber={7} questionNumber={1} questionCount={8} />);
    expect(story.container).toHaveTextContent("Wartość x pozostaje ukryta");
    expect(story.container).not.toHaveTextContent("x = 12");
  });
});
