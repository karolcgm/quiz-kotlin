// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistanceLessonLab } from "@/components/lessons/everyday/DistanceLessonLab";
import { DISTANCE_PRACTICE_TASKS, DISTANCE_VEHICLE_TASKS } from "@/lib/math/everyday/distance";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Droga — klasa VI", () => {
  it("pokazuje trójkąt zależności i wzór na drogę", () => {
    render(<DistanceLessonLab activity="distance-guide" />);
    expect(screen.getByLabelText("Trójkąt droga prędkość czas")).toBeInTheDocument();
    expect(screen.getAllByText("s = v · t").length).toBeGreaterThan(0);
  });

  it("nie powtarza zadań w obu seriach", () => {
    expect(new Set(DISTANCE_VEHICLE_TASKS.map((task) => task.id)).size).toBe(DISTANCE_VEHICLE_TASKS.length);
    expect(new Set(DISTANCE_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(DISTANCE_PRACTICE_TASKS.length);
  });

  it("pola nie otwierają klawiatury urządzenia", () => {
    render(<DistanceLessonLab activity="distance-vehicles" />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(4);
    for (const input of inputs) {
      expect(input).toHaveAttribute("inputmode", "none");
      expect(input).toHaveAttribute("readonly");
    }
  });

  it("blokuje przejście, gdy nie wszystkie pola są uzupełnione", () => {
    render(<DistanceLessonLab activity="distance-vehicles" />);
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Uzupełnij wszystkie cztery wyniki");
  });

  it("po poprawnym rozwiązaniu przechodzi do następnego pojazdu", () => {
    vi.useFakeTimers();
    render(<DistanceLessonLab activity="distance-vehicles" />);
    const answers = ["80", "160", "40", "20"];
    const inputs = screen.getAllByRole("textbox");
    answers.forEach((answer, index) => {
      fireEvent.click(inputs[index]);
      for (const digit of answer) fireEvent.click(screen.getByRole("button", { name: digit }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("120 km/h")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });
});
