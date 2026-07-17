// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";
import { m538PodzielPotemWybierzV1, m538ZastosowaniaUlamkaLiczbyL2V1, m539AlgorytmISkracanieL2V1, m539CzescCzesciV1, m5310AlgorytmIKontrolaL2V1, m5310PodzielPasekV1, m5311IleRazyMiaraV1, m5311LiczbyMieszaneL3V1, m5311OdwrotnoscL2V1, m53rKuchniaProporcjiV1 } from "@/data/lessons/section3-wp-c3";

describe("FractionOperationsLessonModel", () => {
  afterEach(cleanup);
  it("kończy oba poziomy tematu 3.8 na jednym slajdzie z zadaniami tekstowymi", () => {
    const lessonTitles = m538PodzielPotemWybierzV1.stages.map((stage) => stage.title);
    const advancedTitles = m538ZastosowaniaUlamkaLiczbyL2V1.stages.map((stage) => stage.title);
    expect(lessonTitles.slice(1, -1)).toEqual([
      "Jedna piąta z 15 koralików",
      "Oblicz ułamek liczby",
      "Zadania tekstowe",
    ]);
    expect(advancedTitles.slice(1, -1)).toEqual([
      "Zaznacz ułamek liczby",
      "Oblicz ułamek liczby",
      "Zadania tekstowe",
    ]);
    for (const lesson of [m538PodzielPotemWybierzV1, m538ZastosowaniaUlamkaLiczbyL2V1]) {
      expect(lesson.stages.some((stage) => stage.title.includes("5 przykładów"))).toBe(false);
      expect(lesson.stages.find((stage) => stage.title === "Zadania tekstowe")?.questions).toHaveLength(5);
    }
  });
  it("prowadzi przez trzy zadania liczba naturalna · ułamek bez dodatkowych kalkulatorów", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-visual" seed={5} />);
    expect(screen.getByRole("heading", { name: "Liczba naturalna · ułamek" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    expect(screen.queryByText("×")).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "3" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("wymaga zamiany liczby mieszanej przed mnożeniem", () => {
    render(<FractionOperationsLessonModel activity="operations-3.7-reasoning" seed={2} />);
    expect(screen.getByRole("heading", { name: "Liczba naturalna · liczba mieszana" })).toBeInTheDocument();
    expect(screen.getAllByText(/Najpierw zamień liczbę mieszaną na ułamek niewłaściwy/u).length).toBeGreaterThan(0);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    expect(screen.getByLabelText("Ułamek niewłaściwy: licznik, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.getByLabelText("Wynik: licznik, cyfra 1 z 1")).not.toBeDisabled();
    for (const digit of ["4", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(screen.getByLabelText("Wynik: licznik, cyfra 1 z 1"));
    for (const digit of ["8", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("w wariancie ze skracaniem pozostawia uczniowi wszystkie logiczne kroki", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.7-context" seed={3} />);
    expect(screen.getByRole("heading", { level: 2, name: "Skracanie przed mnożeniem" })).toBeInTheDocument();
    expect(container.querySelector("[data-cancellation-example]")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-cancelled-number]").length).toBeGreaterThanOrEqual(4);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const reducedNatural = screen.getByLabelText("Liczba naturalna po skróceniu: liczba, cyfra 1 z 1");
    const reducedDenominator = screen.getByLabelText("Mianownik po skróceniu: liczba, cyfra 1 z 1");
    const result = screen.getByLabelText("Wynik: liczba, cyfra 1 z 1");
    for (const input of [reducedNatural, reducedDenominator, result]) expect(input).not.toBeDisabled();
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(reducedDenominator);
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(result);
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
    expect(container.querySelector("[data-cancelled-entry-part='denominator']")).toBeInTheDocument();
    expect(screen.getByLabelText("Ułamek niewłaściwy: mianownik, cyfra 1 z 1")).not.toBeDisabled();
  });

  it("przebudowuje oba poziomy mnożenia ułamków na spójne slajdy z jednym kalkulatorem", () => {
    const expectedGoals = [
      "Nauczę się mnożyć ułamek przez ułamek i skracać przed mnożeniem.",
      "Nauczę się rozpoznawać i zapisywać liczby odwrotne.",
    ];
    expect(m539CzescCzesciV1.learningGoals.map((goal) => goal.studentGoal)).toEqual(expectedGoals);
    expect(m539AlgorytmISkracanieL2V1.learningGoals.map((goal) => goal.studentGoal)).toEqual(expectedGoals);
    expect(m539CzescCzesciV1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Ułamek · ułamek",
      "Skracanie przed mnożeniem",
      "Liczby odwrotne",
      "Zadania tekstowe — część części",
      "Samodzielne ćwiczenia",
    ]);
    expect(m539AlgorytmISkracanieL2V1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Dwie pary do skracania",
      "Liczba mieszana · ułamek",
      "Liczba mieszana · liczba mieszana",
      "Liczby odwrotne",
      "Trudniejsze zadania tekstowe",
      "Trudniejsze ćwiczenia",
    ]);
    for (const lesson of [m539CzescCzesciV1, m539AlgorytmISkracanieL2V1]) {
      expect(lesson.stages.at(-2)?.questions).toHaveLength(5);
    }

    render(<FractionOperationsLessonModel activity="operations-3.9-independent" seed={1} questionNumber={4} questionCount={5} />);
    expect(screen.getByText("Zadanie 4/5")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Samodzielne ćwiczenia" })).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
  });

  it("pozwala zaznaczyć jedną piątą z 15 koralików i zapisać obliczenie", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.8-visual" seed={0} onResultChange={report} />);
    expect(screen.getByRole("heading", { name: "Jedna piąta z 15 koralików" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Koralik/u })).toHaveLength(15);
    for (const bead of ["Koralik 1", "Koralik 2", "Koralik 3"]) fireEvent.click(screen.getByRole("button", { name: bead }));
    expect(screen.getByText("Zaznaczono: 3 z 15 koralików")).toBeInTheDocument();
    const result = screen.getByLabelText("Wynik obliczenia");
    expect(result).toHaveAttribute("inputmode", "none");
    expect(result).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Kalkulator do zaznaczania ułamka liczby");
    for (const digit of ["1", "3", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "3 koraliki");
  });

  it("pokazuje trzy ósme pionowo i daje miejsce na obliczenie na slajdzie z 24 koralikami", () => {
    const report = vi.fn();
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.8-L2-visual" seed={0} onResultChange={report} />);
    const displayedFraction = container.querySelector("[data-bead-task-fraction='3-8']");
    expect(displayedFraction).toHaveTextContent("3");
    expect(displayedFraction).toHaveTextContent("8");
    expect(screen.getAllByRole("button", { name: /Koralik/u })).toHaveLength(24);
    for (let bead = 1; bead <= 9; bead += 1) fireEvent.click(screen.getByRole("button", { name: `Koralik ${bead}` }));
    const keypad = screen.getByLabelText("Kalkulator do zaznaczania ułamka liczby");
    for (const digit of ["1", "3", "9"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "9 koralików");
  });

  it("prowadzi przez przykład jednej szóstej liczby 20 z aktywnymi kratkami", () => {
    render(<FractionOperationsLessonModel activity="operations-3.8-reasoning" seed={0} />);
    expect(screen.getByText("Oblicz jedną szóstą liczby 20. Zapisz również liczbę mieszaną.")).toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do ułamka liczby naturalnej");
    const enter = (label: string, digits: string[]) => {
      const input = screen.getByLabelText(label);
      expect(input).not.toBeDisabled();
      fireEvent.click(input);
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    enter("Mianownik po skróceniu: liczba, cyfra 1 z 1", ["3"]);
    enter("Liczba naturalna po skróceniu: liczba, cyfra 1 z 2", ["1", "0"]);
    enter("Wynik działania: licznik, cyfra 1 z 2", ["1", "0", "3"]);
    enter("Liczba mieszana: część całkowita, cyfra 1 z 1", ["3"]);
    enter("Liczba mieszana: licznik, cyfra 1 z 1", ["1", "3"]);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });

  it("kończy temat zadaniami tekstowymi i odrębnym zestawem L2", () => {
    const { container, rerender } = render(<FractionOperationsLessonModel activity="operations-3.8-L2-context" seed={0} />);
    expect(screen.getByRole("heading", { name: "Zadania tekstowe" })).toBeInTheDocument();
    expect(screen.getByText(/Budżet wycieczki wynosi 240 zł/u)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do ułamka liczby naturalnej")).toHaveLength(1);
    const setupLabels = [
      "Ułamek w zapisie z treści: licznik, cyfra 1 z 1",
      "Ułamek w zapisie z treści: mianownik, cyfra 1 z 1",
      "Liczba w zapisie z treści: liczba, cyfra 1 z 3",
      "Ułamek po zamianie na mnożenie: licznik, cyfra 1 z 1",
      "Ułamek po zamianie na mnożenie: mianownik, cyfra 1 z 1",
      "Liczba po zamianie na mnożenie: liczba, cyfra 1 z 3",
    ];
    for (const label of setupLabels) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveValue("");
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    }
    expect(container.querySelector("[data-fraction-of-number-cancelled]")).not.toBeInTheDocument();
    const answerRow = screen.getByLabelText("Odpowiedź do zadania tekstowego");
    expect(within(answerRow).getByText("Odpowiedź:")).toBeInTheDocument();
    expect(within(answerRow).getByText("Na bilety przeznaczono")).toBeInTheDocument();
    expect(within(answerRow).getByText("zł.")).toBeInTheDocument();
    const storyAnswer = screen.getByLabelText("Odpowiedź: liczba, cyfra 1 z 2");
    expect(storyAnswer).toHaveValue("");
    expect(storyAnswer).toHaveAttribute("inputmode", "none");
    expect(storyAnswer).toHaveAttribute("readonly");
    expect(storyAnswer).toBeDisabled();

    const keypad = screen.getByLabelText("Kalkulator do ułamka liczby naturalnej");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    enter(setupLabels[0]!, ["3"]);
    enter(setupLabels[1]!, ["8"]);
    enter(setupLabels[2]!, ["2", "4", "0"]);
    enter(setupLabels[3]!, ["3"]);
    enter(setupLabels[4]!, ["8"]);
    enter(setupLabels[5]!, ["2", "4", "0"]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    for (const label of setupLabels) expect(screen.getByLabelText(label)).toBeDisabled();
    expect(container.querySelectorAll("[data-fraction-of-number-cancelled]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-fraction-of-number-replacement]")).toHaveLength(2);
    for (const label of [
      "Mianownik po skróceniu: liczba, cyfra 1 z 1",
      "Liczba naturalna po skróceniu: liczba, cyfra 1 z 2",
      "Wynik działania: liczba, cyfra 1 z 2",
      "Odpowiedź: liczba, cyfra 1 z 2",
    ]) {
      const input = screen.getByLabelText(label);
      expect(input).toHaveValue("");
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    }
    enter("Mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]);
    enter("Liczba naturalna po skróceniu: liczba, cyfra 1 z 2", ["3", "0"]);
    enter("Wynik działania: liczba, cyfra 1 z 2", ["9", "0"]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Budżet wycieczki wynosi 240 zł/u)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("zdanie odpowiedzi");
    enter("Odpowiedź: liczba, cyfra 1 z 2", ["9", "0"]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Zespół zaplanował 162 okrążenia/u)).toBeInTheDocument();

    rerender(<FractionOperationsLessonModel activity="operations-3.8-reasoning" seed={0} />);
    expect(screen.getByText("Oblicz jedną szóstą liczby 20. Zapisz również liczbę mieszaną.")).toBeInTheDocument();
    expect(screen.queryByText("Oblicz siedem dwunastych liczby 84.")).not.toBeInTheDocument();
  });

  it("przebudowuje oba poziomy dzielenia przez liczbę naturalną na cztery spójne slajdy", () => {
    expect(m5310PodzielPasekV1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Dziel licznik, gdy możesz",
      "Pomnóż przez odwrotność",
      "Zadania tekstowe",
      "Samodzielne ćwiczenia",
    ]);
    expect(m5310AlgorytmIKontrolaL2V1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Skracaj przed mnożeniem",
      "Liczba mieszana : liczba naturalna",
      "Trudniejsze zadania tekstowe",
      "Trudniejsze ćwiczenia",
    ]);
    for (const lesson of [m5310PodzielPasekV1, m5310AlgorytmIKontrolaL2V1]) {
      expect(lesson.stages.at(-2)?.questions).toHaveLength(5);
    }
  });

  it("prowadzi pierwsze dzielenie przez dwa etapy z jednym kalkulatorem", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.10-visual" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Dziel licznik, gdy możesz" })).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do dzielenia ułamków");
    expect(screen.getAllByLabelText("Kalkulator do dzielenia ułamków")).toHaveLength(1);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Dzielony ułamek: licznik, cyfra 1 z 2", ["1", "0"]],
      ["Dzielony ułamek: mianownik, cyfra 1 z 2", ["1", "1"]],
      ["Dzielnik: liczba, cyfra 1 z 1", ["5"]],
      ["Przepisany ułamek: licznik, cyfra 1 z 2", ["1", "0"]],
      ["Przepisany ułamek: mianownik, cyfra 1 z 2", ["1", "1"]],
      ["Odwrotność dzielnika: licznik, cyfra 1 z 1", ["1"]],
      ["Odwrotność dzielnika: mianownik, cyfra 1 z 1", ["5"]],
    ] as const) enter(label, [...digits]);
    expect(screen.queryByLabelText("Wynik dzielenia: licznik, cyfra 1 z 1")).not.toBeInTheDocument();
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(container.querySelectorAll("[data-natural-division-cancelled]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-natural-division-replacement]")).toHaveLength(2);
    for (const [label, digits] of [
      ["Licznik po skróceniu: liczba, cyfra 1 z 1", ["2"]],
      ["Dzielnik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik dzielenia: licznik, cyfra 1 z 1", ["2"]],
      ["Wynik dzielenia: mianownik, cyfra 1 z 2", ["1", "1"]],
      ["Wynik sprawdzenia: licznik, cyfra 1 z 2", ["1", "0"]],
      ["Wynik sprawdzenia: mianownik, cyfra 1 z 2", ["1", "1"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("w poziomie drugim wymaga zamiany liczby mieszanej przed dalszym liczeniem", () => {
    render(<FractionOperationsLessonModel activity="operations-3.10-L2-reasoning" seed={0} />);
    expect(screen.getByRole("heading", { name: "Liczba mieszana : liczba naturalna" })).toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do dzielenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Liczba mieszana: część całkowita, cyfra 1 z 1", ["2"]],
      ["Liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Liczba mieszana: mianownik, cyfra 1 z 1", ["4"]],
      ["Dzielnik: liczba, cyfra 1 z 1", ["3"]],
      ["Ułamek niewłaściwy: licznik, cyfra 1 z 1", ["9"]],
      ["Ułamek niewłaściwy: mianownik, cyfra 1 z 1", ["4"]],
      ["Odwrotność dzielnika: licznik, cyfra 1 z 1", ["1"]],
      ["Odwrotność dzielnika: mianownik, cyfra 1 z 1", ["3"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByLabelText("Licznik po skróceniu: liczba, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.getByLabelText("Wynik dzielenia: licznik, cyfra 1 z 1")).not.toBeDisabled();
  });

  it("w zadaniu tekstowym wymaga również odpowiedzi z jednostką", () => {
    render(<FractionOperationsLessonModel activity="operations-3.10-context" seed={0} />);
    expect(screen.getByText(/Trzy czwarte pizzy podzielono równo między 3 osoby/u)).toBeInTheDocument();
    expect(screen.getByLabelText("Odpowiedź do zadania tekstowego")).toBeInTheDocument();
    expect(screen.getByLabelText("Odpowiedź: licznik, cyfra 1 z 1")).toBeDisabled();
    expect(screen.getAllByLabelText("Kalkulator do dzielenia ułamków")).toHaveLength(1);
  });

  it("przebudowuje trzy poziomy dzielenia ułamków na spójne slajdy", () => {
    expect(m5311IleRazyMiaraV1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Ile razy mieści się miara?",
      "Mnożenie przez odwrotność",
      "Zadania tekstowe",
      "Samodzielne ćwiczenia",
    ]);
    expect(m5311OdwrotnoscL2V1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Skracanie przed mnożeniem",
      "Wynik większy od jedności",
      "Trudniejsze zadania tekstowe",
      "Trudniejsze ćwiczenia",
    ]);
    expect(m5311LiczbyMieszaneL3V1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Liczba mieszana : ułamek",
      "Dwie liczby mieszane",
      "Zadania tekstowe z liczbami mieszanymi",
      "Samodzielne wyzwania",
    ]);
    for (const lesson of [m5311IleRazyMiaraV1, m5311OdwrotnoscL2V1, m5311LiczbyMieszaneL3V1]) {
      expect(lesson.stages.at(-2)?.questions).toHaveLength(5);
    }
  });

  it("łączy model pomiarowy z pełnym zapisem i jednym kalkulatorem", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.11-visual" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Ile razy mieści się miara?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Model pomiarowy dzielenia ułamków")).toHaveTextContent("3razy");
    expect(screen.getAllByLabelText("Kalkulator do dzielenia ułamków")).toHaveLength(1);
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    });
    const keypad = screen.getByLabelText("Kalkulator do dzielenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Dzielna: licznik, cyfra 1 z 1", ["3"]],
      ["Dzielna: mianownik, cyfra 1 z 1", ["4"]],
      ["Dzielnik: licznik, cyfra 1 z 1", ["1"]],
      ["Dzielnik: mianownik, cyfra 1 z 1", ["4"]],
      ["Przepisana dzielna: licznik, cyfra 1 z 1", ["3"]],
      ["Przepisana dzielna: mianownik, cyfra 1 z 1", ["4"]],
      ["Mnożenie przez odwrotność: licznik, cyfra 1 z 1", ["4"]],
      ["Mnożenie przez odwrotność: mianownik, cyfra 1 z 1", ["1"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(container.querySelectorAll("[data-fraction-division-cancelled]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-fraction-division-replacement]")).toHaveLength(2);
    for (const [label, digits] of [
      ["Pierwszy mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Drugi licznik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik dzielenia: liczba, cyfra 1 z 1", ["3"]],
      ["Wynik sprawdzenia: licznik, cyfra 1 z 1", ["3"]],
      ["Wynik sprawdzenia: mianownik, cyfra 1 z 1", ["4"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("na poziomie drugim pokazuje dwie pary skracania przed mnożeniem", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.11-L2-visual" seed={0} />);
    const keypad = screen.getByLabelText("Kalkulator do dzielenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Dzielna: licznik, cyfra 1 z 2", ["1", "0"]],
      ["Dzielna: mianownik, cyfra 1 z 2", ["2", "1"]],
      ["Dzielnik: licznik, cyfra 1 z 2", ["2", "5"]],
      ["Dzielnik: mianownik, cyfra 1 z 2", ["1", "4"]],
      ["Przepisana dzielna: licznik, cyfra 1 z 2", ["1", "0"]],
      ["Przepisana dzielna: mianownik, cyfra 1 z 2", ["2", "1"]],
      ["Mnożenie przez odwrotność: licznik, cyfra 1 z 2", ["1", "4"]],
      ["Mnożenie przez odwrotność: mianownik, cyfra 1 z 2", ["2", "5"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(container.querySelectorAll("[data-fraction-division-cancelled]")).toHaveLength(4);
    expect(container.querySelectorAll("[data-fraction-division-replacement]")).toHaveLength(4);
    expect(screen.getByLabelText("Pierwszy licznik po skróceniu: liczba, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.getByLabelText("Drugi licznik po skróceniu: liczba, cyfra 1 z 1")).not.toBeDisabled();
  });

  it("na poziomie trzecim wymaga zamiany obu liczb mieszanych", () => {
    render(<FractionOperationsLessonModel activity="operations-3.11-L3-reasoning" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Dwie liczby mieszane" })).toBeInTheDocument();
    expect(screen.getByLabelText("Ułamek niewłaściwy – dzielna: licznik, cyfra 1 z 2")).not.toBeDisabled();
    expect(screen.getByLabelText("Ułamek niewłaściwy – dzielnik: licznik, cyfra 1 z 2")).not.toBeDisabled();
    expect(screen.queryByLabelText("Wynik dzielenia: liczba, cyfra 1 z 1")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do dzielenia ułamków")).toHaveLength(1);
  });

  it("przyznaje zaliczenie dopiero po pełnym rozwiązaniu zadania końcowego", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.11-independent" seed={0} questionNumber={1} questionCount={5} onResultChange={report} />);
    const keypad = screen.getByLabelText("Kalkulator do dzielenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Dzielna: licznik, cyfra 1 z 1", ["4"]],
      ["Dzielna: mianownik, cyfra 1 z 1", ["5"]],
      ["Dzielnik: licznik, cyfra 1 z 1", ["2"]],
      ["Dzielnik: mianownik, cyfra 1 z 1", ["3"]],
      ["Przepisana dzielna: licznik, cyfra 1 z 1", ["4"]],
      ["Przepisana dzielna: mianownik, cyfra 1 z 1", ["5"]],
      ["Mnożenie przez odwrotność: licznik, cyfra 1 z 1", ["3"]],
      ["Mnożenie przez odwrotność: mianownik, cyfra 1 z 1", ["2"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).not.toHaveBeenCalledWith(true, expect.anything());
    for (const [label, digits] of [
      ["Pierwszy licznik po skróceniu: liczba, cyfra 1 z 1", ["2"]],
      ["Drugi mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik dzielenia: licznik, cyfra 1 z 1", ["6"]],
      ["Wynik dzielenia: mianownik, cyfra 1 z 1", ["5"]],
      ["Wynik jako liczba mieszana: część całkowita, cyfra 1 z 1", ["1"]],
      ["Wynik jako liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Wynik jako liczba mieszana: mianownik, cyfra 1 z 1", ["5"]],
      ["Wynik sprawdzenia: licznik, cyfra 1 z 1", ["4"]],
      ["Wynik sprawdzenia: mianownik, cyfra 1 z 1", ["5"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenCalledWith(true, "6/5");
  });

  it("przebudowuje powtórzenie na sześć konkretnych części całego działu", () => {
    expect(m53rKuchniaProporcjiV1.title).toBe("Powtórzenie wiadomości o ułamkach zwykłych");
    expect(m53rKuchniaProporcjiV1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Sprawność z ułamkami",
      "Który ułamek jest większy?",
      "Ułamki na osi liczbowej",
      "Dodawanie i odejmowanie",
      "Mnożenie i dzielenie",
      "Trudniejsze zadania",
    ]);
    expect(m53rKuchniaProporcjiV1.stages.at(-2)?.questions).toHaveLength(5);
  });

  it("w powtórzeniu zachowuje ukończone obliczenie i używa jednego kalkulatora", () => {
    render(<FractionOperationsLessonModel activity="operations-3.R-visual" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sprawność z ułamkami" })).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do powtórzenia ułamków")).toHaveLength(1);
    screen.getAllByRole("textbox").forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    });
    const keypad = screen.getByLabelText("Kalkulator do powtórzenia ułamków");
    for (const digit of ["2", "3", "4"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByLabelText("Ukończone obliczenia")).toBeInTheDocument();
    expect(screen.getByText("✓ Zadanie 1")).toBeInTheDocument();
    expect(screen.getByText(/Zamień liczbę mieszaną na ułamek niewłaściwy/u)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do powtórzenia ułamków")).toHaveLength(1);
  });

  it("w zadaniu końcowym wymaga wszystkich etapów dzielenia i przyznaje punkt", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.R-independent" seed={0} questionNumber={5} questionCount={5} onResultChange={report} />);
    expect(screen.getByText(/mnożenie przez odwrotność/u)).toBeInTheDocument();
    expect(screen.getByText(/Wstążkę długości/u)).toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do powtórzenia ułamków");
    for (const digit of ["1", "1", "6", "1", "1", "6", "1", "2", "1", "1", "1", "1", "2", "1", "2", "2"]) {
      fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenCalledWith(true, "2");
  });

  it("w dodawaniu liczb mieszanych pozostawia części całkowite i rozszerza tylko części ułamkowe", () => {
    render(<FractionOperationsLessonModel activity="operations-3.R-reasoning" seed={2} />);
    expect(screen.getByText(/Części całkowite pozostaw bez zamiany/u)).toBeInTheDocument();
    expect(screen.queryByText(/ułamek niewłaściwy/u)).not.toBeInTheDocument();
    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("ma osobne zadania na porównywanie oraz podpisywanie ułamków na osi", () => {
    const { rerender } = render(<FractionOperationsLessonModel activity="operations-3.R-compare" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Który ułamek jest większy?" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Wybierz znak porównania" })).toBeInTheDocument();
    rerender(<FractionOperationsLessonModel activity="operations-3.R-number-line" seed={0} />);
    expect(screen.getByRole("heading", { level: 2, name: "Ułamki na osi liczbowej" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Oś liczbowa/u })).toBeInTheDocument();
  });

  it("w mnożeniu i dzieleniu pokazuje liczby z działania przed pustymi kratkami", () => {
    render(<FractionOperationsLessonModel activity="operations-3.R-context" seed={0} />);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
  });

  it("blokuje wpisane ułamki, skreśla właściwe liczby i uruchamia małe kratki", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.9-reasoning" seed={1} />);
    expect(screen.getByRole("heading", { level: 2, name: "Skracanie przed mnożeniem" })).toBeInTheDocument();
    expect(container.querySelector("[data-fraction-multiplication-cancelled]")).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    const setup = [
      ["Pierwszy ułamek: licznik, cyfra 1 z 1", ["3"]],
      ["Pierwszy ułamek: mianownik, cyfra 1 z 1", ["8"]],
      ["Drugi ułamek: licznik, cyfra 1 z 1", ["4"]],
      ["Drugi ułamek: mianownik, cyfra 1 z 1", ["7"]],
    ] as const;
    for (const [label, digits] of setup) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    for (const [label] of setup) expect(screen.getByLabelText(label)).toBeDisabled();
    expect(container.querySelectorAll("[data-fraction-multiplication-cancelled]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-fraction-multiplication-replacement]")).toHaveLength(2);
    for (const [label, digits] of [
      ["Pierwszy mianownik po skróceniu: liczba, cyfra 1 z 1", ["2"]],
      ["Drugi licznik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik działania: licznik, cyfra 1 z 1", ["3"]],
      ["Wynik działania: mianownik, cyfra 1 z 2", ["1", "4"]],
    ] as const) {
      const input = screen.getByLabelText(label);
      expect(input).not.toBeDisabled();
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      enter(label, [...digits]);
    }
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("w zadaniu tekstowym zachowuje zapis z literą z i wymaga pełnej odpowiedzi", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.9-context" seed={0} />);
    expect(screen.getByRole("heading", { name: "Zadania tekstowe — część części" })).toBeInTheDocument();
    expect(screen.getByText(/Artysta pomalował siedem dziewiątych muralu/u)).toBeInTheDocument();
    expect(within(screen.getByLabelText("Pełny zapis mnożenia ułamków")).getByText("z")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-multiplication-field]")).toHaveLength(5);
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
    expect(screen.getByLabelText("Odpowiedź do zadania tekstowego")).toBeInTheDocument();
    expect(screen.getByLabelText("Odpowiedź: licznik, cyfra 1 z 1")).toBeDisabled();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Pierwszy ułamek w zapisie z treści: licznik, cyfra 1 z 1", ["4"]],
      ["Pierwszy ułamek w zapisie z treści: mianownik, cyfra 1 z 1", ["7"]],
      ["Drugi ułamek w zapisie z treści: licznik, cyfra 1 z 1", ["7"]],
      ["Drugi ułamek w zapisie z treści: mianownik, cyfra 1 z 1", ["9"]],
      ["Pierwszy ułamek w mnożeniu: licznik, cyfra 1 z 1", ["4"]],
      ["Pierwszy ułamek w mnożeniu: mianownik, cyfra 1 z 1", ["7"]],
      ["Drugi ułamek w mnożeniu: licznik, cyfra 1 z 1", ["7"]],
      ["Drugi ułamek w mnożeniu: mianownik, cyfra 1 z 1", ["9"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByLabelText("Odpowiedź: licznik, cyfra 1 z 1")).not.toBeDisabled();
    for (const [label, digits] of [
      ["Pierwszy mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Drugi licznik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik działania: licznik, cyfra 1 z 1", ["4"]],
      ["Wynik działania: mianownik, cyfra 1 z 1", ["9"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("zdanie odpowiedzi");
    expect(screen.getByText(/Artysta pomalował siedem dziewiątych muralu/u)).toBeInTheDocument();
    enter("Odpowiedź: licznik, cyfra 1 z 1", ["4"]);
    enter("Odpowiedź: mianownik, cyfra 1 z 1", ["9"]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Do dekoracji przeznaczono dziesięć jedenastych wstążki/u)).toBeInTheDocument();
  });

  it("na trudniejszym poziomie wymaga zamiany liczby mieszanej przed skreślaniem", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.9-L2-reasoning" seed={0} />);
    expect(screen.getByRole("heading", { name: "Liczba mieszana · ułamek" })).toBeInTheDocument();
    expect(screen.getByLabelText("Liczba mieszana: część całkowita, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.getByLabelText("Ułamek niewłaściwy: licznik, cyfra 1 z 1")).not.toBeDisabled();
    expect(screen.queryByLabelText("Wynik działania: licznik, cyfra 1 z 1")).not.toBeInTheDocument();
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const enter = (label: string, digits: string[]) => {
      fireEvent.click(screen.getByLabelText(label));
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Liczba mieszana: część całkowita, cyfra 1 z 1", ["2"]],
      ["Liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Liczba mieszana: mianownik, cyfra 1 z 1", ["3"]],
      ["Drugi ułamek: licznik, cyfra 1 z 1", ["9"]],
      ["Drugi ułamek: mianownik, cyfra 1 z 2", ["1", "4"]],
      ["Ułamek niewłaściwy: licznik, cyfra 1 z 1", ["7"]],
      ["Ułamek niewłaściwy: mianownik, cyfra 1 z 1", ["3"]],
      ["Przepisany drugi ułamek: licznik, cyfra 1 z 1", ["9"]],
      ["Przepisany drugi ułamek: mianownik, cyfra 1 z 2", ["1", "4"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(container.querySelectorAll("[data-fraction-multiplication-cancelled]")).toHaveLength(4);
    for (const [label, digits] of [
      ["Pierwszy licznik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Drugi mianownik po skróceniu: liczba, cyfra 1 z 1", ["2"]],
      ["Pierwszy mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Drugi licznik po skróceniu: liczba, cyfra 1 z 1", ["3"]],
      ["Wynik działania: licznik, cyfra 1 z 1", ["3"]],
      ["Wynik działania: mianownik, cyfra 1 z 1", ["2"]],
      ["Wynik jako liczba mieszana: część całkowita, cyfra 1 z 1", ["1"]],
      ["Wynik jako liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Wynik jako liczba mieszana: mianownik, cyfra 1 z 1", ["2"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("prowadzi krok po kroku przez mnożenie dwóch liczb mieszanych", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.9-L2-mixed-pairs" seed={0} />);
    expect(screen.getByRole("heading", { name: "Liczba mieszana · liczba mieszana" })).toBeInTheDocument();
    expect(screen.getByText("Zamień obie liczby mieszane")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    const enter = (label: string, digits: string[]) => {
      const input = screen.getByLabelText(label);
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
      fireEvent.click(input);
      for (const digit of digits) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    };
    for (const [label, digits] of [
      ["Pierwsza liczba mieszana: część całkowita, cyfra 1 z 1", ["1"]],
      ["Pierwsza liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Pierwsza liczba mieszana: mianownik, cyfra 1 z 1", ["2"]],
      ["Druga liczba mieszana: część całkowita, cyfra 1 z 1", ["2"]],
      ["Druga liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Druga liczba mieszana: mianownik, cyfra 1 z 1", ["3"]],
      ["Pierwszy ułamek niewłaściwy: licznik, cyfra 1 z 1", ["3"]],
      ["Pierwszy ułamek niewłaściwy: mianownik, cyfra 1 z 1", ["2"]],
      ["Drugi ułamek niewłaściwy: licznik, cyfra 1 z 1", ["7"]],
      ["Drugi ułamek niewłaściwy: mianownik, cyfra 1 z 1", ["3"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

    expect(container.querySelectorAll("[data-fraction-multiplication-cancelled]")).toHaveLength(2);
    for (const [label, digits] of [
      ["Pierwszy licznik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Drugi mianownik po skróceniu: liczba, cyfra 1 z 1", ["1"]],
      ["Wynik działania: licznik, cyfra 1 z 1", ["7"]],
      ["Wynik działania: mianownik, cyfra 1 z 1", ["2"]],
      ["Wynik jako liczba mieszana: część całkowita, cyfra 1 z 1", ["3"]],
      ["Wynik jako liczba mieszana: licznik, cyfra 1 z 1", ["1"]],
      ["Wynik jako liczba mieszana: mianownik, cyfra 1 z 1", ["2"]],
    ] as const) enter(label, [...digits]);
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Zadanie 2/3")).toBeInTheDocument();
  });

  it("wyjaśnia odwrotność iloczynem równym 1 i pozwala uzupełnić prostą tabelę", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.9-L2-reciprocals" seed={0} onResultChange={report} />);
    expect(screen.getByRole("heading", { name: "Liczby odwrotne" })).toBeInTheDocument();
    expect(screen.getByText("Jeżeli iloczyn dwóch liczb jest równy 1, to te liczby są do siebie odwrotne.")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Liczba")).toBeInTheDocument();
    expect(screen.getByText("Liczba odwrotna")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Kalkulator do liczb odwrotnych")).toHaveLength(1);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(10);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    });
    const keypad = screen.getByLabelText("Kalkulator do liczb odwrotnych");
    for (const digit of ["3", "2", "8", "5", "4", "7", "1", "4", "2", "3"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("iloczyn równy 1");
    expect(report).toHaveBeenLastCalledWith(true, "tabela liczb odwrotnych");
  });

  it("pokazuje nad pustymi kratkami działanie przeznaczone do samodzielnego rozwiązania", () => {
    const { rerender } = render(<FractionOperationsLessonModel activity="operations-3.9-L2-visual" seed={0} />);
    expect(screen.getByText("Przykład")).toBeInTheDocument();
    expect(screen.getByText("Twoje zadanie")).toBeInTheDocument();
    let given = screen.getByLabelText("Działanie do rozwiązania");
    expect(given.querySelector("[data-given-multiplication-left]")).toHaveTextContent("712");
    expect(given.querySelector("[data-given-multiplication-right]")).toHaveTextContent("1835");

    rerender(<FractionOperationsLessonModel activity="operations-3.9-L2-reasoning" seed={0} />);
    given = screen.getByLabelText("Działanie do rozwiązania");
    expect(given.querySelector("[data-given-multiplication-left]")).toHaveTextContent("213");
    expect(given.querySelector("[data-given-multiplication-right]")).toHaveTextContent("914");
    expect(screen.getByText("Etap 1: przepisz podane działanie, a potem zamień liczbę mieszaną na ułamek niewłaściwy.")).toBeInTheDocument();
  });

  it("nie powtarza w trudniejszych ćwiczeniach działań ze slajdu o dwóch parach", () => {
    const repeatedSlideTasks = new Set(["712·1835", "1415·2528", "916·827"]);
    const expectedIndependentTasks = ["1021·1425", "1627·940", "2235·1544", "225·178", "313·214"];
    const { container, rerender } = render(<FractionOperationsLessonModel activity="operations-3.9-L2-independent" seed={0} questionNumber={1} questionCount={5} />);
    const signatures: string[] = [];
    for (let questionNumber = 1; questionNumber <= 5; questionNumber += 1) {
      rerender(<FractionOperationsLessonModel activity="operations-3.9-L2-independent" seed={0} questionNumber={questionNumber} questionCount={5} />);
      const left = container.querySelector("[data-given-multiplication-left]")?.textContent ?? "";
      const right = container.querySelector("[data-given-multiplication-right]")?.textContent ?? "";
      signatures.push(`${left}·${right}`);
    }
    expect(signatures).toEqual(expectedIndependentTasks);
    expect(new Set(signatures).size).toBe(5);
    expect(signatures.some((signature) => repeatedSlideTasks.has(signature))).toBe(false);
    expect(signatures.slice(-2)).toEqual(["225·178", "313·214"]);
  });

  it("zgłasza poprawny wynik z końcowego zestawu tematu 3.7", () => {
    const report = vi.fn();
    render(<FractionOperationsLessonModel activity="operations-3.7-independent" seed={1} questionNumber={1} questionCount={5} onResultChange={report} />);
    const keypad = screen.getByLabelText("Kalkulator do mnożenia ułamków");
    fireEvent.click(within(keypad).getByRole("button", { name: "4" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "5" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(report).toHaveBeenLastCalledWith(true, "4/5");
  });
});
