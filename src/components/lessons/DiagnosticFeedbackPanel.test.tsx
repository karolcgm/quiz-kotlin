// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  DiagnosticFeedbackPanel,
  DiagnosticHighlightLayer,
} from "@/components/lessons/DiagnosticFeedbackPanel";
import type { DiagnosticHighlightTarget } from "@/types/diagnosticFeedback";

afterEach(cleanup);

const copy = {
  area: "Sprawdź zaznaczone pola wyniku.",
  guidingQuestion: "Która wartość powinna znaleźć się w tej pozycji?",
  visualHint: "Połącz symbol A z kolumną o tym samym nagłówku.",
  analogousExample: "Dla 1,2 + 0,3 ustaw oba przecinki w jednej kolumnie.",
};

const highlights: DiagnosticHighlightTarget[] = [
  { id: "field-result", kind: "field", memberIds: ["result-2"], label: "setne wyniku", state: "attention", pattern: "dashed", symbol: "A", accent: "amber" },
  { id: "pair-digits", kind: "pair", memberIds: ["digit-a", "digit-b"], label: "aktywna para cyfr", state: "active", pattern: "dotted", symbol: "B", accent: "cyan" },
  { id: "edge-ab", kind: "edge", memberIds: ["A", "B"], label: "bok AB", state: "correct", pattern: "double", symbol: "C", accent: "indigo" },
  { id: "vertex-c", kind: "vertex", memberIds: ["C"], label: "wierzchołek C", state: "crossed-out", pattern: "solid", symbol: "D", accent: "violet" },
];

describe("DiagnosticHighlightLayer", () => {
  it("nazywa pola, pary, krawędzie i wierzchołki bez polegania na kolorze", () => {
    render(<DiagnosticHighlightLayer targets={highlights} />);

    expect(screen.getByLabelText(/Pole: setne wyniku/)).toHaveAttribute("data-diagnostic-kind", "field");
    expect(screen.getByLabelText(/Para: aktywna para cyfr/)).toHaveAttribute("data-diagnostic-kind", "pair");
    expect(screen.getByLabelText(/Krawędź: bok AB/)).toHaveTextContent("✓");
    expect(screen.getByLabelText(/Wierzchołek: wierzchołek C/)).toHaveAttribute("data-diagnostic-state", "crossed-out");
  });

  it("zatrzymuje pulsowanie w reduced motion", () => {
    render(<DiagnosticHighlightLayer targets={[highlights[0]!]} />);
    expect(screen.getByLabelText(/Pole: setne wyniku/)).toHaveClass("motion-reduce:animate-none");
  });
});

describe("DiagnosticFeedbackPanel", () => {
  it("pokazuje status częściowy i sekwencję pomocy we właściwej kolejności", () => {
    render(
      <DiagnosticFeedbackPanel
        result={{ status: "partially-correct", score: 1, maxScore: 2, errorCodes: ["DEC_UNIT_MISMATCH"], feedbackKey: "decimal.unit" }}
        copy={copy}
        highlights={highlights}
        mode="practice"
        submitted
        solution={{ steps: ["Najpierw oblicz wartość.", "Potem dobierz jednostkę."] }}
      />,
    );

    expect(screen.getByText("Częściowo poprawna odpowiedź")).toBeInTheDocument();
    expect(screen.getByText(copy.area)).toBeInTheDocument();
    expect(screen.queryByText(copy.guidingQuestion)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));
    expect(screen.getByText(copy.guidingQuestion)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));
    expect(screen.getByText(copy.visualHint)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));
    expect(screen.getByText(copy.analogousExample)).toBeInTheDocument();
    expect(screen.queryByText("Najpierw oblicz wartość.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż rozwiązanie krok po kroku" }));
    expect(screen.getByText("Najpierw oblicz wartość.")).toBeInTheDocument();
  });

  it("nie renderuje rozwiązania przed oddaniem w trybie oceniania", () => {
    render(
      <DiagnosticFeedbackPanel
        result={{ status: "incorrect", score: 0, maxScore: 1, errorCodes: ["GEO_WRONG_VERTEX"], feedbackKey: "geometry.vertex" }}
        copy={copy}
        mode="assessment"
        submitted={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));
    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));
    fireEvent.click(screen.getByRole("button", { name: "Potrzebuję następnej wskazówki" }));

    expect(screen.queryByRole("button", { name: "Pokaż rozwiązanie krok po kroku" })).not.toBeInTheDocument();
    expect(screen.getByText(/Rozwiązanie będzie dostępne po oddaniu odpowiedzi/)).toBeInTheDocument();
  });

  it("oznacza ręczną recenzję tekstem i ikoną", () => {
    render(
      <DiagnosticFeedbackPanel
        result={{ status: "manual-review", score: 0, maxScore: 2, errorCodes: ["OPEN_REASONING"], feedbackKey: "reasoning.review" }}
        copy={copy}
        mode="assessment"
        submitted
      />,
    );

    expect(screen.getByText("Odpowiedź czeka na ręczną recenzję")).toBeInTheDocument();
    expect(screen.getByText("✎")).toHaveAttribute("aria-hidden");
  });
});
