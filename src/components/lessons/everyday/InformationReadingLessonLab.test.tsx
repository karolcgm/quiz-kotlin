// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InformationReadingLessonLab } from "@/components/lessons/everyday/InformationReadingLessonLab";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("InformationReadingLessonLab", () => {
  it("pokazuje te same dane w tabeli i na diagramie słupkowym", () => {
    render(<InformationReadingLessonLab activity="information-guide" />);
    expect(screen.getAllByText("Uczniowie na zajęciach")).toHaveLength(2);
    expect(screen.getByRole("figure", { name: /Diagram słupkowy/u })).toBeInTheDocument();
    expect(screen.getByText(/Tabela porządkuje dane/u)).toBeInTheDocument();
  });

  it("blokuje pustą odpowiedź i wyłącza klawiaturę urządzenia", () => {
    render(<InformationReadingLessonLab activity="table-reading" />);
    const input = screen.getByLabelText("Odpowiedź liczbowa");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij wynik przed zatwierdzeniem.")).toBeInTheDocument();
  });

  it("po poprawnym odczycie przechodzi do kolejnego zadania w tym samym slajdzie", () => {
    vi.useFakeTimers();
    render(<InformationReadingLessonLab activity="table-reading" />);
    fireEvent.click(screen.getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Dobrze!/u)).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/9")).toBeInTheDocument();
  });

  it("pozwala zbudować diagram na podstawie tabeli", () => {
    render(<InformationReadingLessonLab activity="table-to-chart" />);
    const counts = [7, 4, 6, 3];
    const labels = ["Jabłko", "Banan", "Gruszka", "Śliwka"];
    labels.forEach((label, index) => {
      const button = screen.getByRole("button", { name: `Zwiększ słupek ${label}` });
      for (let click = 0; click < counts[index]!; click += 1) fireEvent.click(button);
    });
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź diagram" }));
    expect(screen.getByText("Dobrze! Diagram przedstawia wszystkie dane z tabeli.")).toBeInTheDocument();
  });

  it("w tabelach do diagramu używa naturalnych nazw kategorii", () => {
    const view = render(<InformationReadingLessonLab activity="table-to-chart" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    const rowLabel = () => view.container.querySelector("tbody th")?.textContent;

    expect(rowLabel()).toBe("głosy");
    fireEvent.click(next);
    expect(rowLabel()).toBe("książki");
    fireEvent.click(next);
    expect(rowLabel()).toBe("dni z opadami");
    fireEvent.click(next);
    expect(rowLabel()).toBe("punkty");
    fireEvent.click(next);
    expect(rowLabel()).toBe("pudełka");
  });

  it("w zadaniu tekstowym uczeń sam uzupełnia pustą tabelę", () => {
    const view = render(<InformationReadingLessonLab activity="table-to-chart" />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 3; step += 1) fireEvent.click(next);

    expect(screen.getByText(/W szkolnym turnieju Ada zdobyła 8 punktów/u)).toBeInTheDocument();
    const ada = screen.getByLabelText("Wartość w tabeli: Ada");
    expect(ada).toHaveAttribute("inputmode", "none");
    expect(ada).toHaveAttribute("readonly");
    expect(ada).toHaveValue("");
    fireEvent.click(ada);
    fireEvent.click(screen.getByRole("button", { name: "8" }));
    expect(ada).toHaveValue("8");
  });

  it("po zmianie slajdu rozpoczyna serię od pierwszego zadania", () => {
    const view = render(<InformationReadingLessonLab slideId="tables-slide" activity="table-reading" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 4; step += 1) fireEvent.click(next);
    expect(screen.getByText("Zadanie 5/9")).toBeInTheDocument();

    view.rerender(<InformationReadingLessonLab slideId="charts-slide" activity="bar-chart-reading" readOnly />);

    expect(screen.getByText("Zadanie 1/11")).toBeInTheDocument();
    const resetNavigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(resetNavigator?.querySelectorAll("button")[0]).toBeDisabled();
  });

  it("pozwala nauczycielowi przeglądać zadania w trybie interaktywnym", () => {
    const view = render(<InformationReadingLessonLab activity="table-reading" />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    expect(navigator).not.toBeNull();
    const [previous, next] = Array.from(navigator!.querySelectorAll("button"));
    expect(previous).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByText("Zadanie 2/9")).toBeInTheDocument();
    expect(previous).not.toBeDisabled();
  });

  it("używa naturalnych nazw kategorii zamiast jednostek miary", () => {
    const view = render(<InformationReadingLessonLab activity="table-reading" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    const rowLabel = () => view.container.querySelector("tbody th")?.textContent;

    fireEvent.click(next);
    expect(rowLabel()).toBe("temperatura");
    fireEvent.click(next);
    expect(rowLabel()).toBe("skrzynki");
    fireEvent.click(next);
    expect(rowLabel()).toBe("osoby");
    fireEvent.click(next);
    expect(rowLabel()).toBe("uczniowie");
    fireEvent.click(next);
    expect(rowLabel()).toBe("ilość wody");
  });

  it("prowadzi kolejno przez pytania a, b i c do jednej rozbudowanej tabeli", () => {
    const view = render(<InformationReadingLessonLab activity="table-reading" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 6; step += 1) fireEvent.click(next);

    expect(screen.getByText("Zadanie 7/9")).toBeInTheDocument();
    expect(screen.getByText("Klasy IV–V")).toBeInTheDocument();
    expect(screen.getByText("Klasy VI–VIII")).toBeInTheDocument();
    expect(screen.queryByText("Razem")).not.toBeInTheDocument();
    expect(screen.getByText(/^a\) Ile porcji/u)).toBeInTheDocument();

    fireEvent.click(next);
    expect(screen.getByText(/^b\) O ile więcej/u)).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByText(/^c\) Ile porcji/u)).toBeInTheDocument();
  });

  it("pokazuje podwójne słupki i dane umieszczone na mapie", () => {
    const view = render(<InformationReadingLessonLab activity="bar-chart-reading" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 6; step += 1) fireEvent.click(next);

    expect(screen.getByRole("figure", { name: /dwiema seriami/u })).toBeInTheDocument();
    expect(screen.getByText("Wrzesień")).toBeInTheDocument();
    expect(screen.getByText("Październik")).toBeInTheDocument();

    for (let step = 0; step < 3; step += 1) fireEvent.click(next);
    expect(screen.getByText("Zadanie 10/11")).toBeInTheDocument();
    expect(screen.getByRole("figure", { name: /Mapa danych/u })).toBeInTheDocument();
    expect(screen.getByText("Gdańsk")).toBeInTheDocument();
    expect(screen.getByText("Kraków")).toBeInTheDocument();
  });

  it("pokazuje tabelę i odpowiadający jej wykres liniowy", () => {
    render(<InformationReadingLessonLab activity="line-graph-guide" />);
    expect(screen.getAllByText("Temperatura powietrza")).toHaveLength(2);
    expect(screen.getByRole("figure", { name: /Wykres liniowy/u })).toBeInTheDocument();
    expect(screen.getByText(/Każda liczba z tabeli wyznacza wysokość/u)).toBeInTheDocument();
  });

  it("pozwala ustawiać punkty wykresu na podstawie tabeli", () => {
    render(<InformationReadingLessonLab activity="table-to-line-graph" />);
    const raiseFirstPoint = screen.getByRole("button", { name: "Podnieś punkt 8:00" });
    fireEvent.click(raiseFirstPoint);
    expect(screen.getByText("1", { selector: "output" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź wykres" }));
    expect(screen.getByText("Ustaw wszystkie punkty przed zatwierdzeniem.")).toBeInTheDocument();
  });

  it("odczytuje serię różnych wykresów i resetuje ją po zmianie slajdu", () => {
    const view = render(<InformationReadingLessonLab slideId="line-reading-a" activity="line-graph-reading" readOnly />);
    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    for (let step = 0; step < 4; step += 1) fireEvent.click(next);
    expect(screen.getByText("Zadanie 5/8")).toBeInTheDocument();
    expect(screen.getByText("Biblioteka A")).toBeInTheDocument();
    expect(screen.getByText("Biblioteka B")).toBeInTheDocument();

    view.rerender(<InformationReadingLessonLab slideId="line-reading-b" activity="line-graph-reading" readOnly />);
    expect(screen.getByText("Zadanie 1/8")).toBeInTheDocument();
  });

  it("powtórzenie praktyczne zaczyna od pierwszego zadania i blokuje pustą odpowiedź", () => {
    render(<InformationReadingLessonLab activity="section-review-practical" onResultChange={vi.fn()} />);
    expect(screen.getByText("Zadanie 1/7")).toBeInTheDocument();
    const input = screen.getByLabelText("Odpowiedź");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij wynik przed zatwierdzeniem.")).toBeInTheDocument();
  });

  it("powtórzenie danych pokazuje różne typy wizualizacji", () => {
    const view = render(<InformationReadingLessonLab activity="section-review-data" readOnly />);
    expect(screen.getByText("Obecni uczniowie")).toBeInTheDocument();
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    const next = navigator!.querySelectorAll("button")[1];
    fireEvent.click(next);
    expect(screen.getByText("Punkty w turnieju")).toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByRole("img", { name: "Wypożyczenia hulajnóg" })).toBeInTheDocument();
  });

  it("po zmianie slajdu powtórzenie resetuje licznik i odpowiedź", () => {
    const view = render(<InformationReadingLessonLab slideId="review-a" activity="section-review-practical" readOnly />);
    const navigator = view.container.querySelector("[data-lesson-task-navigator]");
    fireEvent.click(navigator!.querySelectorAll("button")[1]);
    expect(screen.getByText("Zadanie 2/7")).toBeInTheDocument();
    view.rerender(<InformationReadingLessonLab slideId="review-b" activity="section-review-challenge" readOnly />);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByText("Wycieczka na mapie")).toBeInTheDocument();
  });
});
