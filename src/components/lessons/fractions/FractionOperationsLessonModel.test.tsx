// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionOperationsLessonModel } from "@/components/lessons/fractions/FractionOperationsLessonModel";
import { m538PodzielPotemWybierzV1, m538ZastosowaniaUlamkaLiczbyL2V1, m539AlgorytmISkracanieL2V1, m539CzescCzesciV1 } from "@/data/lessons/section3-wp-c3";

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
      "Zadania tekstowe — część części",
      "Samodzielne ćwiczenia",
    ]);
    expect(m539AlgorytmISkracanieL2V1.stages.map((stage) => stage.title).slice(1, -1)).toEqual([
      "Dwie pary do skracania",
      "Liczba mieszana · ułamek",
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

  it("używa osobnych modeli podziału i pomiaru zamiast zastępczej pizzy", () => {
    const { rerender } = render(<FractionOperationsLessonModel activity="operations-3.10-visual" seed={0} />);
    expect(screen.getByLabelText(/podzielone na 3 równe grupy/u)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
    rerender(<FractionOperationsLessonModel activity="operations-3.11-visual" seed={0} />);
    expect(screen.getByLabelText(/Miara 1\/2 w 3\/4/u)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Interaktywna pizza/u)).not.toBeInTheDocument();
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

  it("w zadaniu tekstowym zachowuje zapis z literą z przed mnożeniem", () => {
    const { container } = render(<FractionOperationsLessonModel activity="operations-3.9-context" seed={0} />);
    expect(screen.getByRole("heading", { name: "Zadania tekstowe — część części" })).toBeInTheDocument();
    expect(screen.getByText(/Artysta pomalował siedem dziewiątych muralu/u)).toBeInTheDocument();
    expect(within(screen.getByLabelText("Pełny zapis mnożenia ułamków")).getByText("z")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-multiplication-field]")).toHaveLength(4);
    expect(screen.getAllByLabelText("Kalkulator do mnożenia ułamków")).toHaveLength(1);
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
    const expectedIndependentTasks = ["1021·1425", "1627·940", "2235·1544", "156·922", "238·2057"];
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
