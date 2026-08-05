/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PrismSurfaceAreaLessonLab, prismSurfaceAreaActivityFromStageId } from "@/components/lessons/solids/PrismSurfaceAreaLessonLab";

afterEach(cleanup);

describe("PrismSurfaceAreaLessonLab", () => {
  it("pokazuje sposób obliczania Pp, Pb i Pc oraz różne podstawy", () => {
    render(<PrismSurfaceAreaLessonLab activity="formula" />);

    expect(screen.getByText("Pb = Op · H")).toBeInTheDocument();
    expect(screen.getByText("Pc = 2 · Pp + Pb")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "trapez równoramienny" }));
    expect(screen.getByRole("img", { name: /podstawie: trapez równoramienny/u })).toBeInTheDocument();
  });

  it("w jednej karcie prowadzi serię i wymaga Pp, Pb oraz Pc", () => {
    render(<PrismSurfaceAreaLessonLab activity="calculate" />);

    expect(screen.getByText("Zadanie 1/4")).toBeInTheDocument();
    const pp = screen.getByLabelText("Pp — pole podstawy");
    expect(pp).toHaveAttribute("inputmode", "none");
    expect(pp).toHaveAttribute("readonly");
    const keypad = screen.getByLabelText("Kalkulator do pola graniastosłupa");
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Uzupełnij Pp, Pb i Pc.")).toBeInTheDocument();

    fireEvent.click(pp);
    fireEvent.click(within(keypad).getByRole("button", { name: "6" }));
    fireEvent.click(screen.getByLabelText("Pb — pole boczne"));
    for (const digit of ["1", "2", "0"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(screen.getByLabelText("Pc — pole całkowite"));
    for (const digit of ["1", "3", "2"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Brawo! Wszystkie trzy pola są obliczone poprawnie.")).toBeInTheDocument();
  });

  it("pokazuje zadania tekstowe z osobnym rysunkiem podstawy", () => {
    render(<PrismSurfaceAreaLessonLab activity="stories" />);

    expect(screen.getByText(/Pudełko ma kształt graniastosłupa trójkątnego/u)).toBeInTheDocument();
    expect(screen.getByText("PODSTAWA")).toBeInTheDocument();
  });

  it("mapuje trzy etapy tematu", () => {
    expect(prismSurfaceAreaActivityFromStageId("m6-9-4-formula-s1")).toBe("formula");
    expect(prismSurfaceAreaActivityFromStageId("m6-9-4-calculate-s2")).toBe("calculate");
    expect(prismSurfaceAreaActivityFromStageId("m6-9-4-stories-s3")).toBe("stories");
  });
});
