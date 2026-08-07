/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grade4ReadingInformationTwoLessonLab } from "@/components/lessons/models/Grade4ReadingInformationTwoLessonLab";

describe("Grade4ReadingInformationTwoLessonLab", () => {
  afterEach(cleanup);
  it("pokazuje na pudełkach, co się zmienia, a co pozostaje bez zmian", () => {
    render(<Grade4ReadingInformationTwoLessonLab activity="information" />);
    expect(screen.getByText(/W każdym było po tyle samo kredek/)).toBeInTheDocument();
    expect(screen.getByText("Razem jest tyle kredek, ile było na początku.")).toBeInTheDocument();
    expect(screen.getByText("Najmniej kredek jest w czerwonym pudełku.")).toBeInTheDocument();
  });
  it("wnioskuje, jakie ptaki zostały", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationTwoLessonLab activity="practice" questionNumber={1} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "6 wróbli" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "6 wróbli");
    expect(screen.getByRole("status")).toHaveTextContent("wszystkie gołębie odleciały");
  });
  it("cofa zdarzenia w zadaniu o autobusie", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationTwoLessonLab activity="practice" questionNumber={3} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "24 osoby" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "24 osoby");
  });
  it("nie przyjmuje pustej odpowiedzi", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationTwoLessonLab activity="practice" questionNumber={4} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Wybierz jedną odpowiedź.");
    expect(onResultChange).not.toHaveBeenCalledWith(expect.any(Boolean), expect.any(String));
  });
  it("po błędnym wniosku pokazuje neutralną informację zwrotną", () => {
    const onResultChange = vi.fn();
    render(<Grade4ReadingInformationTwoLessonLab activity="practice" questionNumber={6} questionCount={6} onResultChange={onResultChange} />);
    fireEvent.click(screen.getByRole("button", { name: "38 książek" }));
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(false, "38 książek");
    expect(screen.getByRole("status")).toHaveTextContent("Spróbuj innym razem. Poprawna odpowiedź to: 46 książek. Dziś bez punktu.");
  });
});
