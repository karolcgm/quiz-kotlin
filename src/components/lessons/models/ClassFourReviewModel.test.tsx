// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ClassFourReviewModel } from "@/components/lessons/models/ClassFourReviewModel";

afterEach(cleanup);

describe("ClassFourReviewModel", () => {
  it("renderuje 10 niezależnych widgetów bez pól tekstowych", () => {
    for (let seed = 1; seed <= 10; seed += 1) {
      const { container, unmount } = render(<ClassFourReviewModel seed={seed} />);
      expect(container.querySelector(`[data-review-widget="${seed}"]`)).not.toBeNull();
      expect(container.querySelector('input[type="text"], textarea')).toBeNull();
      expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
      unmount();
    }
  });

  it("pizza reaguje dotykiem i pokazuje jedną czwartą", () => {
    render(<ClassFourReviewModel seed={8} />);
    fireEvent.click(screen.getByRole("button", { name: "Kawałek 1" }));
    expect(screen.getByText("1/4")).toBeInTheDocument();
    expect(screen.getByText("To dokładnie jedna z czterech równych części.")).toBeInTheDocument();
  });

  it("oś liczbowa sprawdza lądowanie na 70", () => {
    render(<ClassFourReviewModel seed={3} />);
    fireEvent.click(screen.getByRole("button", { name: "70" }));
    expect(screen.getByText("Skok zakończył się na 70.")).toBeInTheDocument();
  });
});
