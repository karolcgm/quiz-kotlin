// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";

afterEach(cleanup);

describe("ExerciseBoardModel", () => {
  it("pozwala ustawić stronę i wiele przerobionych zadań", () => {
    render(<ExerciseBoardModel seed={1} />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Zadanie 1" }), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "+ Dodaj kolejne zadanie" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Zadanie 2" }), { target: { value: "5a" } });
    expect(screen.getByText("Strona 2 · zadania 3, 5a")).toBeInTheDocument();
  });

  it("pokazuje temat oraz kryteria przypisane do każdego celu", () => {
    render(<ExerciseBoardModel seed={1} lessonTitle="Porównywanie liczb" learningGoals={[
      {
        id: "goal-1",
        studentGoal: "Nauczę się porównywać liczby naturalne.",
        successCriteria: ["Potrafię wybrać znak <, > lub =."],
        curriculumReferences: ["Klasy IV–VI, I.3"],
      },
    ]} />);
    expect(screen.getByText("Porównywanie liczb")).toBeInTheDocument();
    expect(screen.getByText("Nauczę się porównywać liczby naturalne.")).toBeInTheDocument();
    expect(screen.getByText("Potrafię wybrać znak <, > lub =.")).toBeInTheDocument();
    expect(screen.getByText(/Klasy IV–VI, I\.3/)).toBeInTheDocument();
  });
});
