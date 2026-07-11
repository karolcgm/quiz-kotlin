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

  it("pizza przyjmuje odpowiedź bez podpowiadania poprawności", () => {
    render(<ClassFourReviewModel seed={8} taskSeed={81} />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("Odpowiedź jest gotowa. Wyślij ją nauczycielowi.")).toBeInTheDocument();
    expect(screen.queryByText(/dokładnie jedna z/i)).not.toBeInTheDocument();
  });

  it("oś liczbowa ma losowane zadanie i zgłasza gotową odpowiedź", () => {
    render(<ClassFourReviewModel seed={3} taskSeed={31} />);
    const choices = screen.getAllByRole("button");
    fireEvent.click(choices[choices.length - 1]!);
    expect(screen.getByText("Odpowiedź jest gotowa. Wyślij ją nauczycielowi.")).toBeInTheDocument();
  });
});
