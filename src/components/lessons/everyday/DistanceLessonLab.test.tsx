// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DistanceLessonLab } from "@/components/lessons/everyday/DistanceLessonLab";
import {
  DISTANCE_PRACTICE_TASKS,
  DISTANCE_VEHICLE_TASKS,
  SPEED_PRACTICE_TASKS,
  TIME_PRACTICE_TASKS,
} from "@/lib/math/everyday/distance";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Droga i prędkość — klasa VI", () => {
  it("pokazuje trójkąt zależności i słowny sposób obliczania drogi", () => {
    render(<DistanceLessonLab activity="distance-guide" />);
    expect(screen.getByLabelText("Trójkąt: droga, prędkość i czas")).toBeInTheDocument();
    expect(screen.getAllByText("droga = prędkość · czas").length).toBeGreaterThan(0);
    expect(screen.queryByText("s = v · t")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Obliczam: droga" })).toBeInTheDocument();
  });

  it("nie powtarza zadań w obu seriach o drodze", () => {
    expect(new Set(DISTANCE_VEHICLE_TASKS.map((task) => task.id)).size).toBe(DISTANCE_VEHICLE_TASKS.length);
    expect(new Set(DISTANCE_VEHICLE_TASKS.map((task) => task.fields.map((field) => field.label).join("|"))).size).toBe(DISTANCE_VEHICLE_TASKS.length);
    expect(new Set(DISTANCE_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(DISTANCE_PRACTICE_TASKS.length);
    expect(new Set(DISTANCE_PRACTICE_TASKS.map((task) => task.imageSrc)).size).toBe(DISTANCE_PRACTICE_TASKS.length);
  });

  it("nie podaje gotowej zamiany minut i zawiera czas 2,5 godziny", () => {
    const labels = DISTANCE_VEHICLE_TASKS.flatMap((task) => task.fields.map((field) => field.label));
    expect(labels.some((label) => label.includes("2,5 godziny"))).toBe(true);
    expect(labels.every((label) => !label.includes("="))).toBe(true);
    expect(DISTANCE_PRACTICE_TASKS.every((task) => !task.timeLabel.includes("="))).toBe(true);
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
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByLabelText("kilometry na godzinę")).toBeInTheDocument();
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
  });

  it("pokazuje słowny sposób obliczania prędkości", () => {
    render(<DistanceLessonLab activity="speed-guide" />);
    expect(screen.getAllByText("prędkość = droga : czas").length).toBeGreaterThan(0);
    expect(screen.queryByText("v = s : t")).not.toBeInTheDocument();
    expect(document.querySelector("[data-distance-lab='speed-guide']")).toBeInTheDocument();
  });

  it("pokazuje pełny przykład obliczenia prędkości bez wzoru literowego", () => {
    render(<DistanceLessonLab activity="speed-worked-example" />);
    expect(screen.getByText("2400 : 4 = 600")).toBeInTheDocument();
    expect(screen.getAllByLabelText("kilometry na godzinę").length).toBeGreaterThan(0);
    expect(screen.getByText(/w każdą godzinę pokonywał 600 km/)).toBeInTheDocument();
    expect(screen.queryByText("v = s : t")).not.toBeInTheDocument();
  });

  it("podaje wymaganą jednostkę i blokuje klawiaturę urządzenia", () => {
    render(<DistanceLessonLab activity="speed-practice" />);
    expect(screen.getByLabelText("kilometry na godzinę")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
  });

  it("po obliczeniu prędkości przechodzi dalej bez przenoszenia wyniku", () => {
    vi.useFakeTimers();
    render(<DistanceLessonLab activity="speed-practice" />);
    fireEvent.click(screen.getByRole("textbox"));
    for (const digit of "180") fireEvent.click(screen.getByRole("button", { name: digit }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.queryByText("450 : 3")).not.toBeInTheDocument();
  });

  it("nie powtarza treści w serii zadań o prędkości", () => {
    expect(new Set(SPEED_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(SPEED_PRACTICE_TASKS.length);
    expect(new Set(SPEED_PRACTICE_TASKS.map((task) => task.imageSrc)).size).toBe(SPEED_PRACTICE_TASKS.length);
  });

  it("pokazuje słowną zasadę obliczania czasu i właściwe jednostki", () => {
    render(<DistanceLessonLab activity="time-guide" />);
    expect(screen.getByText("czas = droga : prędkość")).toBeInTheDocument();
    expect(screen.getByLabelText("kilometry na godzinę")).toBeInTheDocument();
    expect(screen.getByLabelText("metry na minutę")).toBeInTheDocument();
    expect(screen.getByLabelText("metry na sekundę")).toBeInTheDocument();
  });

  it("w serii o czasie podpowiada działanie tylko w pierwszym zadaniu", () => {
    vi.useFakeTimers();
    render(<DistanceLessonLab activity="time-practice" />);
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("Pierwszy przykład: droga podzielona przez prędkość")).toBeInTheDocument();
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    fireEvent.click(input);
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    fireEvent.click(screen.getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dobrze");
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/5")).toBeInTheDocument();
    expect(screen.getByText("Wpisz obliczony czas")).toBeInTheDocument();
    expect(screen.queryByText("96 : 32")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("nie powtarza treści ani ilustracji w serii o czasie", () => {
    expect(new Set(TIME_PRACTICE_TASKS.map((task) => task.prompt)).size).toBe(TIME_PRACTICE_TASKS.length);
    expect(new Set(TIME_PRACTICE_TASKS.map((task) => task.imageSrc)).size).toBe(TIME_PRACTICE_TASKS.length);
  });
});
