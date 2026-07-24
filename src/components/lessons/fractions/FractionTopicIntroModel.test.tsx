/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionTopicIntroModel } from "@/components/lessons/fractions/FractionTopicIntroModel";
import type { FractionTopicIntroActivity } from "@/lib/math/fractions/fractionTopicIntro";

afterEach(cleanup);

function renderActivity(activity: FractionTopicIntroActivity, seed = 1) {
  return render(<FractionTopicIntroModel activity={activity} seed={seed} />);
}

describe("FractionTopicIntroModel — tematy 1 i 2 działu 3", () => {
  it("pokazuje cztery siódme pionowo, siedem wybieralnych części i cztery kolory", () => {
    const view = renderActivity("topic1-shade-colors");

    expect(view.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(3);
    const parts = screen.getAllByRole("button", { name: /część \d z 7/u });
    expect(parts).toHaveLength(7);
    parts.slice(0, 4).forEach((part) => fireEvent.click(part));
    expect(parts.slice(0, 4).every((part) => part.getAttribute("aria-pressed") === "true")).toBe(true);
    expect(screen.getAllByLabelText(/kółko$/u)).toHaveLength(12);
    expect(screen.getByRole("button", { name: "zielone" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Tulipany" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Tulipany, element/u })).toHaveLength(8);
    fireEvent.click(screen.getAllByRole("button", { name: /Tulipany, element/u })[0]!);
    expect(screen.getAllByRole("button", { name: /Tulipany, element/u })[0]).toHaveStyle({ backgroundColor: "#ef4444" });
    expect(view.container.textContent).not.toMatch(/\d+\s*\/\s*\d+/u);
  });

  it("ma oś od 0 do 3 z dopasowywaniem różnych zapisów ułamków, klasyfikację i model dwóch zapisów", () => {
    const axis = renderActivity("topic1-axis-labels");
    expect(screen.getByRole("region", { name: "Oś liczbowa od zera do trzech" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Puste pole \d na osi/u })).toHaveLength(4);
    expect(axis.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(4);
    fireEvent.click(axis.container.querySelectorAll("[data-stacked-fraction]")[0]!.closest("button")!);
    fireEvent.click(screen.getByRole("button", { name: "Puste pole 1 na osi" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź odpowiedzi" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie cztery pola na osi.");
    cleanup();

    const classify = renderActivity("topic1-classify");
    expect(classify.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(2);
    expect(classify.container.textContent).not.toMatch(/licznik\s*[<≥]/u);
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    const classificationCards = classify.container.querySelectorAll("[data-classification-card]");
    fireEvent.click(within(classificationCards[0]! as HTMLElement).getByRole("button", { name: "właściwy" }));
    fireEvent.click(within(classificationCards[1]! as HTMLElement).getByRole("button", { name: "niewłaściwy" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź zadanie 1" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    expect(classify.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(2);
    cleanup();

    const model = renderActivity("topic1-improper-model");
    expect(model.container.querySelectorAll("[data-fraction-circle]")).toHaveLength(2);
    expect(Array.from(model.container.querySelectorAll("svg text")).map((node) => node.textContent)).not.toContain("całość 2");
    expect(model.container.querySelectorAll("[data-painted='true']")).toHaveLength(0);
    for (let index = 0; index < 7; index += 1) fireEvent.click(screen.getByRole("button", { name: "Zamaluj kolejną część" }));
    expect(model.container.querySelectorAll("[data-painted='true']")).toHaveLength(7);
    expect(screen.queryByRole("button", { name: "ułamek niewłaściwy" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "liczba mieszana" })).not.toBeInTheDocument();
    expect(screen.getByText("ułamek niewłaściwy")).toBeInTheDocument();
    expect(screen.getByText("liczba mieszana")).toBeInTheDocument();
    expect(model.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(2);
    fireEvent.click(screen.getAllByRole("button", { name: "7" })[0]!);
    expect(model.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(2);
    expect(model.container.querySelector("[data-fraction-part='wholePart']")).toBeInTheDocument();
  });

  it("przechodzi automatycznie do kolejnego koła dopiero po poprawnym sprawdzeniu obu zapisów", () => {
    const reporter = vi.fn();
    const model = render(<FractionTopicIntroModel activity="topic1-improper-model" seed={31203} onResultChange={reporter} />);
    for (let index = 0; index < 7; index += 1) fireEvent.click(screen.getByRole("button", { name: "Zamaluj kolejną część" }));

    const numerators = model.container.querySelectorAll("[data-fraction-part='numerator']");
    const denominators = model.container.querySelectorAll("[data-fraction-part='denominator']");
    fireEvent.change(numerators[0]!, { target: { value: "7" } });
    fireEvent.change(denominators[0]!, { target: { value: "4" } });
    fireEvent.change(model.container.querySelector("[data-fraction-part='wholePart']")!, { target: { value: "1" } });
    fireEvent.change(numerators[1]!, { target: { value: "3" } });
    fireEvent.change(denominators[1]!, { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Prześlij zadanie" }));

    expect(screen.getByText("Zadanie 2 z 3")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Otwieram kolejne zadanie");
    expect(reporter).toHaveBeenLastCalledWith(null);
  });

  it("prowadzi dwa zadania z wieloma wartościami na osi od 0 do 6", () => {
    const axis = render(<FractionTopicIntroModel activity="topic1-independent-advanced" seed={31200} questionNumber={2} questionCount={5} />);
    expect(screen.getByRole("heading", { name: "Ułamki na osi liczbowej" })).toBeInTheDocument();
    expect(screen.queryByText("Ćwiczenia — 5 przykładów")).not.toBeInTheDocument();
    expect(axis.container.querySelector("[data-fraction-number-line]")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 1: wpisz liczby" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 2: przeciągnij" })).toBeInTheDocument();
    expect(axis.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(1);
    expect(axis.container.querySelector("[data-axis-write-answer-panel] [data-lesson-numeric-keypad='shared']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Punkt C" }));
    expect(axis.container.querySelector("[data-axis-write-answer-panel] [data-fraction-part='wholePart']")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sprawdź wszystkie podpisy" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź wszystkie podpisy" }));
    expect(axis.container.querySelectorAll("[data-axis-write-status='incorrect']")).toHaveLength(4);
    fireEvent.click(screen.getByRole("tab", { name: "Punkt A" }));
    fireEvent.change(axis.container.querySelector("[data-axis-write-answer-panel] [data-fraction-part='numerator']")!, { target: { value: "3" } });
    fireEvent.change(axis.container.querySelector("[data-axis-write-answer-panel] [data-fraction-part='denominator']")!, { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("tab", { name: "Punkt A" })).toHaveAttribute("data-axis-write-status", "correct");
    fireEvent.click(screen.getByRole("button", { name: "Zadanie 2: przeciągnij" }));
    expect(screen.getAllByText("Upuść tutaj")).toHaveLength(4);
    const axisSources = Array.from(axis.container.querySelectorAll("[data-axis-drag-source]")).map((source) => source.getAttribute("data-axis-drag-source"));
    expect(axisSources).not.toEqual(["three-fourths", "seven-fourths", "nine-fourths", "seven-halves"]);
    expect(screen.getByRole("button", { name: "Sprawdź rozmieszczenie" })).toBeInTheDocument();
  });

  it("losuje pozycje źródeł drag and drop oraz odpowiedzi wyboru zależnie od seeda", () => {
    const firstAxis = renderActivity("topic1-independent-advanced", 31200);
    fireEvent.click(screen.getByRole("button", { name: "Zadanie 2: przeciągnij" }));
    const firstSourceOrder = Array.from(firstAxis.container.querySelectorAll("[data-axis-drag-source]")).map((source) => source.getAttribute("data-axis-drag-source"));
    cleanup();

    const secondAxis = renderActivity("topic1-independent-advanced", 31201);
    fireEvent.click(screen.getByRole("button", { name: "Zadanie 2: przeciągnij" }));
    const secondSourceOrder = Array.from(secondAxis.container.querySelectorAll("[data-axis-drag-source]")).map((source) => source.getAttribute("data-axis-drag-source"));
    expect(secondSourceOrder).not.toEqual(firstSourceOrder);
    expect(secondSourceOrder.slice().sort()).toEqual(firstSourceOrder.slice().sort());
    cleanup();

    const firstChoices = renderActivity("topic1-classify", 1);
    const firstChoiceOrder = Array.from(firstChoices.container.querySelectorAll("[data-classification-card]")[0]!.querySelectorAll("[data-answer-choice]")).map((choice) => choice.getAttribute("data-answer-choice"));
    cleanup();

    const secondChoices = renderActivity("topic1-classify", 5);
    const secondChoiceOrder = Array.from(secondChoices.container.querySelectorAll("[data-classification-card]")[0]!.querySelectorAll("[data-answer-choice]")).map((choice) => choice.getAttribute("data-answer-choice"));
    expect(secondChoiceOrder).not.toEqual(firstChoiceOrder);
    expect(secondChoiceOrder.slice().sort()).toEqual(["improper", "proper"]);
  });

  it("realizuje oba zadania z jednostkami i jednostronną zamianę z podpowiedzią", () => {
    const units = renderActivity("topic1-unit-fractions");
    expect(screen.getByRole("button", { name: "Zadanie 1: 7 mm → cm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 2: 300 g → kg" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 3: 25 cm → m" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 4: 750 g → kg" })).toBeInTheDocument();
    expect(units.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(2);
    expect(units.container.querySelectorAll("[data-fraction-part='denominator']")).toHaveLength(4);
    expect(units.container.querySelector("[data-unit-answer-block] [data-lesson-numeric-keypad='shared']")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zadanie 2: 300 g → kg" }));
    expect(units.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(4);
    expect(units.container.querySelectorAll("[data-fraction-part='denominator']")).toHaveLength(6);
    fireEvent.change(units.container.querySelector("[data-fraction-part='numerator']")!, { target: { value: "3" } });
    expect(units.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(4);
    cleanup();

    const conversion = renderActivity("topic1-mixed-to-improper", 31204);
    expect(screen.getByText("2 całości × 5 części")).toBeInTheDocument();
    expect(screen.getByText("dodaj 3 części")).toBeInTheDocument();
    expect(screen.getByText("mianownik 5 zostaje")).toBeInTheDocument();
    expect(conversion.container.querySelector("[data-fraction-part='wholePart']")).not.toBeInTheDocument();
    expect(conversion.container.querySelectorAll("[data-fraction-part='numerator']")).toHaveLength(2);
    expect(screen.getByText("Zadanie 1 z 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Poprzednie" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Następne →" })).toBeDisabled();
  });

  it("dzieli te same koła na połówki i daje kolejne trzy interpretacje graficzne", () => {
    renderActivity("topic2-halves");
    expect(screen.queryByLabelText(/podzielonych na połówki/u)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Podziel koła na połówki" }));
    expect(screen.getByLabelText("3 kół podzielonych na połówki")).toBeInTheDocument();
    cleanup();

    renderActivity("topic2-quotient-fractions");
    expect(screen.getByRole("button", { name: "Zadanie 1: 1 : 7" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 2: 13 : 5" })).toBeInTheDocument();
    expect(screen.getByLabelText("1 jabłko")).toBeInTheDocument();
    expect(screen.getByLabelText("7 osób")).toBeInTheDocument();
    cleanup();

    renderActivity("topic2-wholes-as-fractions");
    fireEvent.click(screen.getByRole("button", { name: "Podziel dwie figury na 6 części każdą" }));
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.queryByText(/2 całe/u)).not.toBeInTheDocument();
    cleanup();

    const mixed = renderActivity("topic2-improper-to-mixed", 32024);
    expect(mixed.container.querySelectorAll("[data-fraction-circle]")).toHaveLength(3);
    expect(mixed.container.querySelectorAll("svg text")).toHaveLength(0);
    expect(mixed.container.querySelector("[data-fraction-part='wholePart']")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zadanie 4" })).toBeInTheDocument();
  });

  it("nie dodaje automatycznie pustych kratek w poprawionych slajdach", () => {
    const halves = renderActivity("topic2-halves");
    fireEvent.click(screen.getByRole("button", { name: "Podziel koła na połówki" }));
    const halvesCells = halves.container.querySelectorAll("[data-fraction-part]").length;
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(halves.container.querySelectorAll("[data-fraction-part]")).toHaveLength(halvesCells);
    cleanup();

    const quotient = renderActivity("topic2-quotient-fractions");
    const quotientCells = quotient.container.querySelectorAll("[data-fraction-part]").length;
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(quotient.container.querySelectorAll("[data-fraction-part]")).toHaveLength(quotientCells);
    cleanup();

    const mixed = renderActivity("topic2-improper-to-mixed");
    const mixedCells = mixed.container.querySelectorAll("[data-fraction-part]").length;
    fireEvent.click(screen.getByRole("button", { name: "2" }));
    expect(mixed.container.querySelectorAll("[data-fraction-part]")).toHaveLength(mixedCells);
    cleanup();

    const practice = renderActivity("topic2-independent", 0);
    const practiceCells = practice.container.querySelectorAll("[data-fraction-part]").length;
    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(practice.container.querySelectorAll("[data-fraction-part]")).toHaveLength(practiceCells);
  });
});
