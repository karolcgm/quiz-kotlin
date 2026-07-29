// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistanceLessonLab } from "@/components/lessons/everyday/DistanceLessonLab";
import {
  DISTANCE_PRACTICE_TASKS,
  DISTANCE_VEHICLE_TASKS,
  SPEED_PRACTICE_TASKS,
} from "@/lib/math/everyday/distance";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Droga i prędkość — klasa VI", () => {
  it("pokazuje trójkąt zależności i wzór na drogę", () => {
    render(<DistanceLessonLab activity="distance-guide" />);
    expect(screen.getByLabelText("Trójkąt droga prędkość czas")).toBeInTheDocument();
    expect(screen.getAllByText("s = v · t").length).toBeGreaterThan(0);
  });

  it("nie powtarza zadań w obu seriach o drodze", () => {
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

  it("pokazuje słowny sposób obliczania prędkości", () => {
    render(<DistanceLessonLab activity="speed-guide" />);
    expect(screen.getAllByText("prędkość = droga : czas").length).toBeGreaterThan(0);
    expect(screen.queryByText("v = s : t")).not.toBeInTheDocument();
    expect(document.querySelector("[data-distance-lab='speed-guide']")).toBeInTheDocument();
  });

  it("podaje wymaganą jednostkę i blokuje klawiaturę urządzenia", () => {
    render(<DistanceLessonLab activity="speed-practice" />);
    expect(screen.getByText("km/h")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
  });

  it("po obliczeniu prędkości przechodzi dalej bez przenoszenia wyniku", () => {
    vi.useFakeTimers();
    render(<DistanceLessonLab activity="speed-practice" />);
    fireEvent.click(screen.getByRole("textbox"));
    for (const digit of "600") fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/8")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("nie powtarza treści w serii zadań o prędkości", () => {
    expect(new Set(SPEED_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(SPEED_PRACTICE_TASKS.length);
  });
});
