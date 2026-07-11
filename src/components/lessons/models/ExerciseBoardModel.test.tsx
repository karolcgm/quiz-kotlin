// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExerciseBoardModel } from "@/components/lessons/models/ExerciseBoardModel";

afterEach(cleanup);

describe("ExerciseBoardModel", () => {
  it("pozwala osobno ustawić stronę i zadanie", () => {
    render(<ExerciseBoardModel seed={1} />);
    const plusButtons = screen.getAllByRole("button", { name: "+" });
    fireEvent.click(plusButtons[0]!);
    fireEvent.click(plusButtons[1]!);
    fireEvent.click(plusButtons[1]!);
    expect(screen.getByText("Strona 2 · zadanie 3")).toBeInTheDocument();
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
