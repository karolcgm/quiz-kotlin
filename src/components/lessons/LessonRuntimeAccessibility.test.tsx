// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { InteractionAlternativePanel } from "@/components/lessons/InteractionAlternativePanel";
import {
  LessonAccessibilityControls,
  LessonRuntimeAccessibilityProvider,
  LessonStageFocusRegion,
} from "@/components/lessons/LessonRuntimeAccessibility";

afterEach(cleanup);

describe("WP-CONTEXT-04 — wspólna dostępność runtime", () => {
  it("przenosi widoczny focus i ogłasza tylko nowy krok", () => {
    const { rerender } = render(
      <LessonStageFocusRegion stageKey="step-1" announcement="Etap 1: Wejście">
        <p>Pierwszy krok</p>
      </LessonStageFocusRegion>,
    );
    expect(document.activeElement).toBe(document.body);

    rerender(
      <LessonStageFocusRegion stageKey="step-2" announcement="Etap 2: Odkryj">
        <p>Drugi krok</p>
      </LessonStageFocusRegion>,
    );

    const region = document.querySelector<HTMLElement>("[data-stage-key='step-2']");
    expect(document.activeElement).toBe(region);
    expect(screen.getByText("Etap 2: Odkryj")).toHaveAttribute("aria-live", "polite");
  });

  it("pozwala zatrzymać ruch i włączyć high contrast bez polegania na kolorze", () => {
    render(
      <LessonRuntimeAccessibilityProvider>
        <LessonAccessibilityControls />
      </LessonRuntimeAccessibilityProvider>,
    );
    const runtime = document.querySelector<HTMLElement>(".lesson-runtime");
    fireEvent.click(screen.getByRole("button", { name: "Zatrzymaj ruch" }));
    fireEvent.click(screen.getByRole("button", { name: "Wysoki kontrast" }));
    expect(runtime).toHaveAttribute("data-motion-paused", "true");
    expect(runtime).toHaveAttribute("data-high-contrast", "true");
    expect(screen.getByRole("button", { name: "Wznów ruch" })).toHaveAttribute("aria-pressed", "true");
  });

  it("zapewnia SVG z title/desc oraz tekstową tabelę bieżących danych", () => {
    render(
      <AccessibleMathSvg
        title="Model dwóch odcinków"
        description="Odcinek AB ma długość 5, a CD długość 7."
        viewBox="0 0 100 40"
        columns={[{ key: "name", label: "Odcinek" }, { key: "length", label: "Długość" }]}
        rows={[{ name: "AB", length: 5 }, { name: "CD", length: 7 }]}
      >
        <line x1="5" y1="20" x2="95" y2="20" />
      </AccessibleMathSvg>,
    );
    expect(screen.getByRole("img", { name: "Model dwóch odcinków Odcinek AB ma długość 5, a CD długość 7." })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Odcinek" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "7" })).toBeInTheDocument();
  });

  it("udostępnia klawiaturowy panel alternatywny dla gestu", () => {
    const place = vi.fn();
    render(
      <InteractionAlternativePanel instruction="Wybierz element, a potem naciśnij Umieść.">
        <button type="button" onClick={place}>Umieść</button>
      </InteractionAlternativePanel>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Umieść" }));
    expect(place).toHaveBeenCalledOnce();
    expect(screen.getByRole("region", { name: "Alternatywa bez przeciągania" })).toBeInTheDocument();
  });
});
