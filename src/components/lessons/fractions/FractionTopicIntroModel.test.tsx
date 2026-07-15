/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FractionTopicIntroModel } from "@/components/lessons/fractions/FractionTopicIntroModel";
import type { FractionTopicIntroActivity } from "@/lib/math/fractions/fractionTopicIntro";

afterEach(cleanup);

function renderActivity(activity: FractionTopicIntroActivity, seed = 1) {
  return render(<FractionTopicIntroModel activity={activity} seed={seed} />);
}

describe("FractionTopicIntroModel — tematy 1 i 2 działu 3", () => {
  it("pokazuje cztery siódme pionowo, siedem wybieralnych części i cztery kolory", () => {
    const view = renderActivity("topic1-shade-colors");

    expect(view.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(1);
    const parts = screen.getAllByRole("button", { name: /część \d z 7/u });
    expect(parts).toHaveLength(7);
    parts.slice(0, 4).forEach((part) => fireEvent.click(part));
    expect(parts.slice(0, 4).every((part) => part.getAttribute("aria-pressed") === "true")).toBe(true);
    expect(screen.getAllByLabelText(/kółko$/u)).toHaveLength(12);
    expect(screen.getByRole("button", { name: "zielone" })).toHaveAttribute("aria-pressed", "true");
    expect(view.container.textContent).not.toMatch(/\d+\s*\/\s*\d+/u);
  });

  it("ma zgodną oś A–C, klasyfikację i model dwóch zapisów", () => {
    const axis = renderActivity("topic1-axis-labels");
    expect(screen.getByRole("button", { name: "Punkt A" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Punkt B" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Punkt C" })).toBeInTheDocument();
    expect(axis.container.querySelector("[data-fraction-part='numerator']")).toBeInTheDocument();
    cleanup();

    const classify = renderActivity("topic1-classify");
    expect(classify.container.querySelectorAll("[data-stacked-fraction]")).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "właściwy" })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: "niewłaściwy" })).toHaveLength(6);
    cleanup();

    const model = renderActivity("topic1-improper-model");
    expect(model.container.querySelectorAll("[data-fraction-circle]")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "liczba mieszana" }));
    expect(model.container.querySelector("[data-fraction-part='wholePart']")).toBeInTheDocument();
  });

  it("realizuje oba zadania z jednostkami i jednostronną zamianę z podpowiedzią", () => {
    renderActivity("topic1-unit-fractions");
    expect(screen.getByRole("button", { name: "7 mm z 1 cm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "300 g z 1 kg" })).toBeInTheDocument();
    cleanup();

    const conversion = renderActivity("topic1-mixed-to-improper", 31204);
    expect(screen.getByText("2 całości × 5 części")).toBeInTheDocument();
    expect(screen.getByText("dodaj 3 części")).toBeInTheDocument();
    expect(screen.getByText("mianownik 5 zostaje")).toBeInTheDocument();
    expect(conversion.container.querySelector("[data-fraction-part='wholePart']")).not.toBeInTheDocument();
  });

  it("dzieli te same koła na połówki i daje kolejne trzy interpretacje graficzne", () => {
    renderActivity("topic2-halves");
    expect(screen.queryByLabelText(/podzielonych na połówki/u)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Podziel koła na połówki" }));
    expect(screen.getByLabelText("3 kół podzielonych na połówki")).toBeInTheDocument();
    cleanup();

    renderActivity("topic2-quotient-fractions");
    expect(screen.getByRole("button", { name: "1 : 7" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "13 : 5" })).toBeInTheDocument();
    cleanup();

    renderActivity("topic2-wholes-as-fractions");
    fireEvent.click(screen.getByRole("button", { name: "Pokrój dwie całości na 6 części każdą" }));
    expect(screen.getByText("2 całe =")).toBeInTheDocument();
    cleanup();

    const mixed = renderActivity("topic2-improper-to-mixed", 32024);
    expect(mixed.container.querySelectorAll("[data-fraction-circle]")).toHaveLength(3);
    expect(mixed.container.querySelector("[data-fraction-part='wholePart']")).toBeInTheDocument();
  });
});
