/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TriangleAngleSumGeometryLab } from "@/components/lessons/geometry/TriangleAngleSumGeometryLab";
import { createPublicTriangleAngleSumTask, isTriangleAngleSumLessonSeed } from "@/lib/math/geometry/triangleAngleSum";

afterEach(cleanup);

describe("TriangleAngleSumGeometryLab — WP-S4-08", () => {
  it("generuje stabilne zadanie i rozpoznaje seedy pakietu", () => {
    expect(isTriangleAngleSumLessonSeed(480101)).toBe(true);
    expect(isTriangleAngleSumLessonSeed(490101)).toBe(false);
    expect(createPublicTriangleAngleSumTask(480101).angles.reduce((sum, value) => sum + value, 0)).toBe(180);
  });

  it("przelicza trzeci kąt podczas zmiany suwaka i daje feedback", () => {
    const onResultChange = vi.fn();
    const view = render(<TriangleAngleSumGeometryLab seed={480101} onResultChange={onResultChange} />);
    expect(view.container.querySelector("[data-triangle-angle-sum-lab]")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("180°");
    fireEvent.change(screen.getByLabelText(/kąt A:/u), { target: { value: "80" } });
    expect(screen.getByRole("status")).toHaveTextContent("180°");
    fireEvent.change(screen.getByLabelText("Brakujący kąt (°)"), { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź" }));
    expect(onResultChange).toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/Suma aktualnych kątów/u);
  });
});
