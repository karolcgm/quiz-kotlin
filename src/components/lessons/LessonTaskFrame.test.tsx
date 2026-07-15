/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

afterEach(cleanup);

describe("LessonTaskFrame — obowiązkowy szablon działów 3–8", () => {
  it("pokazuje jeden nagłówek, jeden licznik i jeden jasny obszar zadania", () => {
    const view = render(
      <LessonTaskFrame eyebrow="Dział 3 · Temat 1" heading="Ułamki właściwe i niewłaściwe" questionNumber={1} questionCount={3}>
        <p>Treść zadania</p>
      </LessonTaskFrame>,
    );

    expect(view.container.querySelectorAll("[data-lesson-task-frame]")).toHaveLength(1);
    expect(view.container.querySelectorAll("[data-lesson-task-header]")).toHaveLength(1);
    expect(view.container.querySelectorAll("[data-lesson-task-progress]")).toHaveLength(1);
    expect(view.container.querySelectorAll("[data-lesson-task-content]")).toHaveLength(1);
    expect(screen.getByText("Zadanie 1/3")).toBeInTheDocument();
  });

  it("używa kompaktowego przycisku odpowiedzi", () => {
    render(<LessonTaskChoice>właściwy</LessonTaskChoice>);
    const button = screen.getByRole("button", { name: "właściwy" });
    expect(button).toHaveClass("min-h-10", "px-3", "py-1.5", "text-sm");
    expect(button).not.toHaveClass("min-h-14", "px-6", "text-lg");
  });
});
