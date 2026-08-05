/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RightPrismLessonLab, rightPrismActivityFromStageId } from "@/components/lessons/solids";

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ "aria-label": ariaLabel }: { "aria-label"?: string }) => <div data-testid="prism-canvas" aria-label={ariaLabel} />,
}));

afterEach(cleanup);

describe("RightPrismLessonLab", () => {
  it("pokazuje obrazowy schemat graniastosłupów prostych, pochyłych i ostrosłupów", () => {
    render(<RightPrismLessonLab activity="classification" />);

    expect(screen.getByText("Bryły przestrzenne")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Graniastosłupy" })).toBeInTheDocument();
    expect(screen.getByText("Proste")).toBeInTheDocument();
    expect(screen.getByText("Pochyłe")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Ostrosłupy" })).toBeInTheDocument();
    expect(screen.getAllByTestId("prism-canvas")).toHaveLength(3);
  });

  it("wiąże nazwę graniastosłupa z wielokątem w podstawie", () => {
    render(<RightPrismLessonLab activity="bases" />);

    fireEvent.click(screen.getByRole("button", { name: "Pięciokątny" }));
    expect(screen.getByText("graniastosłup pięciokątny")).toBeInTheDocument();
    expect(screen.getByText(/Każda podstawa to pięciokąt/u)).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
  });

  it("w jednej karcie uruchamia serię sześciu zadań i wymaga wszystkich odpowiedzi", () => {
    render(<RightPrismLessonLab activity="counts" />);

    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Uzupełnij wszystkie wymagane pola.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Ściany" }), { target: { value: "5" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Wierzchołki" }), { target: { value: "6" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Krawędzie" }), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź odpowiedź" }));
    expect(screen.getByText("Brawo! Poprawna odpowiedź.")).toBeInTheDocument();
  });

  it("mapuje trzy etapy tematu", () => {
    expect(rightPrismActivityFromStageId("m6-9-2-classification-s1")).toBe("classification");
    expect(rightPrismActivityFromStageId("m6-9-2-bases-s2")).toBe("bases");
    expect(rightPrismActivityFromStageId("m6-9-2-counts-s3")).toBe("counts");
  });
});
