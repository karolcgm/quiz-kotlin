/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonStageView } from "@/components/lessons/LessonStageView";
import { PyramidLessonLab, pyramidActivityFromStageId } from "@/components/lessons/solids/PyramidLessonLab";
import { m697OstroslupyV1 } from "@/data/lessons/m6-9-7-ostroslupy";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="pyramid-canvas" />,
}));

afterEach(cleanup);

describe("PyramidLessonLab", () => {
  it("pokazuje różne ostrosłupy, ich elementy i informację o czworościanie", () => {
    render(<PyramidLessonLab activity="explore" />);

    expect(screen.getByRole("img", { name: /ostrosłup czworokątny/u })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Podstawa" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ściany boczne" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Krawędzie" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wierzchołek ostrosłupa" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Trójkątny" }));
    expect(screen.getByText(/Czworościan to ostrosłup trójkątny/u)).toBeInTheDocument();
  });

  it("prowadzi serię pytań Tak lub Nie", () => {
    render(<PyramidLessonLab activity="identify" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText("Czy ta bryła jest ostrosłupem?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tak" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nie" })).toBeInTheDocument();
  });

  it("sprawdza liczbę ścian, krawędzi i wierzchołków", () => {
    render(<PyramidLessonLab activity="counts" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByText(/Ile ścian, krawędzi i wierzchołków ma ostrosłup trójkątny/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "4 ściany, 6 krawędzi, 4 wierzchołki" })).toBeInTheDocument();
  });

  it("pokazuje kompletne i błędne siatki ostrosłupów", () => {
    render(<PyramidLessonLab activity="nets" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /liczbie boków: 3.+liczbą trójkątnych ścian bocznych: 3/u })).toBeInTheDocument();
  });

  it("wymaga Pp, Pb i Pc oraz używa klawiatury ekranowej", () => {
    render(<PyramidLessonLab activity="area" />);

    const pp = screen.getByLabelText("Pp — pole podstawy");
    const pb = screen.getByLabelText("Pb — pole boczne");
    const pc = screen.getByLabelText("Pc — pole całkowite");
    expect(pp).toHaveAttribute("inputmode", "none");
    expect(pp).toHaveAttribute("readonly");
    expect(pb).toHaveAttribute("readonly");
    expect(pc).toHaveAttribute("readonly");

    const keypad = screen.getByLabelText("Kalkulator do pola ostrosłupa");
    fireEvent.click(pp);
    for (const digit of ["1", "6"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(pb);
    for (const digit of ["2", "4"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(pc);
    for (const digit of ["4", "0"]) fireEvent.click(within(keypad).getByRole("button", { name: digit }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText("Brawo! Wszystkie pola są obliczone poprawnie.")).toBeInTheDocument();
  });

  it("w widoku prowadzącego od razu pokazuje ćwiczenie", () => {
    const stage = m697OstroslupyV1.stages.find((item) => item.id.includes("identify-s2"));
    expect(stage).toBeDefined();
    render(<LessonStageView lessonId={m697OstroslupyV1.id} stage={stage!} channel="board" revealIndex={0} />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.queryByText("Rozpoznaj bryłę")).not.toBeInTheDocument();
  });

  it("mapuje wszystkie etapy tematu", () => {
    expect(pyramidActivityFromStageId("m6-9-7-explore-s1")).toBe("explore");
    expect(pyramidActivityFromStageId("m6-9-7-identify-s2")).toBe("identify");
    expect(pyramidActivityFromStageId("m6-9-7-counts-s3")).toBe("counts");
    expect(pyramidActivityFromStageId("m6-9-7-nets-s4")).toBe("nets");
    expect(pyramidActivityFromStageId("m6-9-7-area-s5")).toBe("area");
  });
});
