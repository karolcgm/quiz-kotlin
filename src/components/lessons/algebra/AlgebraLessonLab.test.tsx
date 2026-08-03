/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlgebraLessonLab } from "@/components/lessons/algebra/AlgebraLessonLab";
import { machineTokenTargetX } from "@/components/lessons/algebra/AlgebraScenes3D";

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
  it("prowadzi kulkę dokładnie przez środki trzech otworów maszyny", () => {
    expect([0, 1, 2, 3].map(machineTokenTargetX)).toEqual([-4.8, -2.3, 0.8, 3.9]);
  });

  it("pokazuje dokładnie jeden licznik zadania i nie tworzy wewnętrznej nawigacji serii", () => {
    render(<AlgebraLessonLab activity="translate-words" taskSeed={0} topicNumber={1} questionNumber={2} questionCount={16} />);
    expect(screen.getAllByText("Zadanie 2/16")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: /Poprzednie/u })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Następne/u })).not.toBeInTheDocument();
  });

  it("najpierw wymaga zastąpienia x suwakiem, a potem pozwala samodzielnie obliczyć wynik", () => {
    const reporter = vi.fn();
    const view = render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={0} topicNumber={2} questionNumber={1} questionCount={10} onResultChange={reporter} />);
    const input = screen.getByRole("textbox", { name: "Wartość odpowiedzi" });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(input).toBeDisabled();
    expect(view.container.querySelector("[data-lesson-numeric-keypad='shared']")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Najpierw dotknij x i wstaw w jego miejsce liczbę 4");
    expect(reporter).toHaveBeenLastCalledWith(null);

    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Wybierz liczbę do podstawienia" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Wybierz x do zastąpienia" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw 3 w miejsce x" }));
    expect(screen.getByRole("status")).toHaveTextContent("Sprawdź jeszcze raz, jaką wartość x podano");
    expect(input).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Wstaw 4 w miejsce x" }));
    expect(input).not.toBeDisabled();
    expect(screen.getByRole("region", { name: "Samodzielne podstawianie liczby za x" })).toHaveTextContent("2 · 4 + 3");
    expect(view.container.querySelector("[data-machine-values]")).toHaveTextContent("2 · 4 + 3");

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(input).toHaveValue("11");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "11");
    expect(view.container.querySelector("[data-machine-progress]")).toHaveAttribute("data-machine-progress", "3");
    expect(view.container.querySelector("[data-machine-output]")).toHaveTextContent("wyjście11");
  });

  it("w samodzielnym podstawieniu wymaga wpisania całego działania z liczbą ujemną w nawiasie", () => {
    const reporter = vi.fn();
    const view = render(<AlgebraLessonLab activity="write-substitution" taskSeed={0} topicNumber={2} questionNumber={1} questionCount={4} onResultChange={reporter} />);
    expect(screen.getByText("Samodzielne podstawienie")).toBeInTheDocument();
    expect(view.container.querySelector("[data-algebra-task-prompt]")).toHaveTextContent("Oblicz wartość wyrażenia 2x + 1 dla x = −4.");

    const substitutionInput = screen.getByRole("textbox", { name: "Działanie po podstawieniu x" });
    const resultInput = screen.getByRole("textbox", { name: "Wartość odpowiedzi" });
    expect(substitutionInput).toHaveAttribute("inputmode", "none");
    expect(substitutionInput).toHaveAttribute("readonly");
    expect(resultInput).toHaveAttribute("inputmode", "none");
    expect(resultInput).toHaveAttribute("readonly");
    expect(resultInput).toBeDisabled();
    expect(view.container.querySelector("[data-machine-values]")).not.toHaveTextContent("2 · (−4) + 1");

    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Najpierw wpisz i sprawdź całe działanie po podstawieniu x");

    const keypad = screen.getByRole("region", { name: "Klawiatura do zapisu wyrażenia" });
    for (const key of ["2", "·", "(", "−", "4", ")", "+", "1"]) fireEvent.click(within(keypad).getByRole("button", { name: key }));
    expect(substitutionInput).toHaveValue("2·(−4)+1");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź podstawienie" }));
    expect(resultInput).not.toBeDisabled();
    expect(view.container.querySelector("[data-machine-progress]")).toHaveAttribute("data-machine-progress", "2");
    expect(view.container.querySelector("[data-machine-values]")).toHaveTextContent("2 · (−4) + 1");

    fireEvent.click(screen.getByRole("button", { name: "− minus" }));
    fireEvent.click(screen.getByRole("button", { name: "7" }));
    expect(resultInput).toHaveValue("-7");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "-7");
    expect(view.container.querySelector("[data-machine-progress]")).toHaveAttribute("data-machine-progress", "3");
  });

  it("nie rozbija działania po podstawieniu na dwa wiersze", () => {
    const view = render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={5} topicNumber={2} questionNumber={2} questionCount={8} />);
    fireEvent.click(screen.getByRole("button", { name: "Wybierz x do zastąpienia" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw −4 w miejsce x" }));
    const substitutedExpression = view.container.querySelector("[data-substituted-expression]");
    expect(substitutedExpression).toHaveClass("whitespace-nowrap");
    expect(substitutedExpression).toHaveClass("text-lg", "sm:text-xl");
    expect(substitutedExpression).toHaveTextContent("5 − 2 · (−4)");
    const machineCalculation = view.container.querySelector("[data-machine-value='2']");
    expect(machineCalculation).toHaveClass("overflow-hidden", "text-xs", "sm:text-sm");
    expect(machineCalculation).toHaveTextContent("5 − 2 · (−4)");
  });

  it("nie rozdziela zapisu x równego 6 między wiersze", () => {
    const view = render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={2} topicNumber={2} questionNumber={3} questionCount={8} />);
    const assignment = view.container.querySelector("[data-evaluation-assignment]");
    expect(assignment).toHaveClass("whitespace-nowrap");
    expect(assignment).toHaveTextContent("dla x = 6.");
  });

  it("pokazuje ułamkową wartość x piętrowo i bez widocznego ukośnika", () => {
    const view = render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={6} topicNumber={2} questionNumber={7} questionCount={8} />);
    const prompt = view.container.querySelector("[data-algebra-task-prompt]");
    expect(prompt).toHaveTextContent("Oblicz wartość 4x + 1 dla x = 12.");
    expect(prompt?.textContent).not.toContain("/");
    expect(prompt?.querySelector(".border-b-2")).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "Wybierz x do zastąpienia" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw 1 podzielone przez 2 w miejsce x" }));
    expect(screen.getByRole("region", { name: "Samodzielne podstawianie liczby za x" }).textContent).not.toContain("/");
    expect(view.container.querySelector("[data-machine-values]")?.textContent).not.toContain("/");
  });

  it("pozwala wpisać ujemny wynik klawiaturą lekcji", () => {
    const reporter = vi.fn();
    render(<AlgebraLessonLab activity="evaluate-expression" taskSeed={4} topicNumber={2} questionNumber={5} questionCount={8} onResultChange={reporter} />);
    fireEvent.click(screen.getByRole("button", { name: "Wybierz x do zastąpienia" }));
    fireEvent.click(screen.getByRole("button", { name: "Wstaw −2 w miejsce x" }));
    const input = screen.getByRole("textbox", { name: "Wartość odpowiedzi" });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "− minus" }));
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(input).toHaveValue("-2");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "-2");
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
    const prompt = screen.getByText("Który zapis oznacza liczbę 2 razy większą od x?");
    expect(prompt.closest("[data-algebra-task-prompt]")).toBeInTheDocument();
    expect(view.container.querySelector("[data-lesson-task-header]")).not.toHaveTextContent("Który zapis oznacza");
    expect(screen.getByRole("region", { name: "Informacja pomocnicza" })).toBeInTheDocument();
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

  it("pozwala samodzielnie zapisać całe wyrażenie do zadania o opakowaniach jaj", () => {
    const reporter = vi.fn();
    const view = render(<AlgebraLessonLab activity="write-story-expression" taskSeed={0} topicNumber={1} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    expect(screen.getByText(/W dużym opakowaniu jest 12 jaj/u).closest("[data-algebra-task-prompt]")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Dane z zadania" })).toHaveTextContent("liczba dużych opakowań: x");
    const input = screen.getByRole("textbox", { name: "Zapis wyrażenia algebraicznego" });
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(view.container.querySelector("[data-algebra-expression-keypad]")).toBeInTheDocument();

    for (const key of ["1", "2", "x", "+", "4", "2"]) fireEvent.click(screen.getByRole("button", { name: key }));
    expect(input).toHaveValue("12x+42");
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "12x+42");
  });

  it("prowadzi przez dodawanie, mnożenie i działania mieszane oraz wymaga całego uproszczonego wyrażenia", () => {
    const reporter = vi.fn();
    const addition = render(<AlgebraLessonLab activity="simplify-expression" taskSeed={0} topicNumber={3} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    expect(addition.container.querySelector("[data-simplification-expression]")).toHaveTextContent("3x + 2x");
    expect(screen.getByRole("region", { name: "Zasady upraszczania wyrażeń" })).toHaveTextContent("Łącz tylko wyrazy z taką samą literą");
    const additionInput = screen.getByRole("textbox", { name: "Zapis wyrażenia algebraicznego" });
    expect(additionInput).toHaveAttribute("inputmode", "none");
    expect(additionInput).toHaveAttribute("readonly");
    expect(addition.container.querySelector("[data-algebra-expression-keypad]")).toBeInTheDocument();
    for (const key of ["5", "x"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "5x");
    cleanup();

    const multiplication = render(<AlgebraLessonLab activity="simplify-multiply-divide" taskSeed={0} topicNumber={3} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    const multiplicationExpression = multiplication.container.querySelector("[data-simplification-expression]");
    expect(multiplicationExpression).toHaveClass("overflow-x-auto");
    expect(multiplicationExpression?.querySelector("p")).toHaveClass("whitespace-nowrap");
    expect(multiplicationExpression).toHaveTextContent("(−3) · 2x");
    expect(screen.getByRole("region", { name: "Zasady upraszczania wyrażeń" })).toHaveTextContent("Wykonaj działanie na liczbach stojących przy x");
    for (const key of ["−", "6", "x"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "−6x");
    expect(multiplication.container).toHaveTextContent("−6x");
    cleanup();

    const division = render(<AlgebraLessonLab activity="simplify-multiply-divide" taskSeed={2} topicNumber={3} questionNumber={3} questionCount={6} onResultChange={reporter} />);
    const divisionExpression = division.container.querySelector("[data-simplification-expression]");
    expect(divisionExpression?.textContent).not.toContain("/");
    expect(divisionExpression?.querySelector(".border-b-2")).toHaveTextContent("12x");
    expect(divisionExpression).toHaveTextContent("12x3");
    for (const key of ["4", "x"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "4x");
    cleanup();

    const fractionMultiplication = render(<AlgebraLessonLab activity="simplify-multiply-divide" taskSeed={5} topicNumber={3} questionNumber={6} questionCount={6} />);
    const fractionExpression = fractionMultiplication.container.querySelector("[data-simplification-expression]");
    expect(fractionExpression?.textContent).not.toContain("/");
    expect(fractionExpression?.querySelector(".border-b-2")).toHaveTextContent("3");
    expect(fractionExpression).toHaveTextContent("34 · 8x");
    cleanup();

    const mixed = render(<AlgebraLessonLab activity="simplify-mixed" taskSeed={0} topicNumber={3} questionNumber={1} questionCount={6} onResultChange={reporter} />);
    expect(mixed.container.querySelector("[data-simplification-expression]")).toHaveTextContent("2 · 3x + x");
    expect(screen.getByRole("region", { name: "Zasady upraszczania wyrażeń" })).toHaveTextContent("Najpierw mnożenie i dzielenie");
    for (const key of ["7", "x"]) fireEvent.click(screen.getByRole("button", { name: key }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Brawo!");
    expect(reporter).toHaveBeenLastCalledWith(true, "7x");
  });

  it("pokazuje podstawienie x równego 4 bezpośrednio na maszynie wartości", () => {
    const view = render(<AlgebraLessonLab activity="substitution-machine" topicNumber={2} />);
    expect(screen.getByRole("region", { name: "Informacja o wartości wyrażenia" })).toHaveTextContent("otrzymamy wartość wyrażenia algebraicznego");
    expect(screen.getByRole("region", { name: "Wyrażenie i podstawiana liczba" })).toHaveTextContent("2x + 3");
    expect(screen.getByRole("region", { name: "Wyrażenie i podstawiana liczba" })).toHaveTextContent("x = 4");
    const machineValues = view.container.querySelector("[data-machine-values]");
    expect(machineValues?.querySelector("[data-machine-value='2']")).toHaveClass("text-xs", "sm:text-sm");
    expect(machineValues).toHaveTextContent("x = 4");
    expect(machineValues).toHaveTextContent("2 · 4 + 3");
    expect(machineValues).toHaveTextContent("8 + 3");
    expect(machineValues).toHaveTextContent("11");
    fireEvent.click(screen.getByRole("button", { name: "Następny krok →" }));
    expect(screen.getAllByText("Pomnóż 2 · 4").length).toBeGreaterThan(0);
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
