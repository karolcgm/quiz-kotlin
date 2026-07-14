// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  createOrderSeriesTask,
  createOrderTask,
  OrderOfOperationsLessonModel,
} from "@/components/lessons/models/OrderOfOperationsLessonModel";

afterEach(cleanup);

describe("OrderOfOperationsLessonModel", () => {
  it("pokazuje pełną regułę kolejności działań", () => {
    render(<OrderOfOperationsLessonModel seed={1} />);
    expect(screen.getByRole("button", { name: "Nawiasy" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Potęgowanie" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mnożenie i dzielenie" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Dodawanie i odejmowanie" }),
    ).toBeInTheDocument();
  });

  it("generuje wyłącznie różne operatory i liczby najwyżej dwucyfrowe", () => {
    for (let seed = 1; seed <= 100; seed += 1) {
      for (const count of [2, 3] as const) {
        const task = createOrderTask(seed, count);
        expect(task.operators).toHaveLength(count);
        expect(new Set(task.operators).size).toBe(count);
        expect(task.executionOrder).toHaveLength(count);
        expect(
          task.numbers.every((number) => number >= 0 && number <= 99),
        ).toBe(true);
        expect(Number.isInteger(task.result)).toBe(true);
      }
    }
  });

  it("nie powtarza wyrażeń w serii zadań", () => {
    const expressions = [1, 2, 3, 4, 5].map(
      (number) => createOrderSeriesTask(2, number).expression,
    );
    expect(new Set(expressions).size).toBe(expressions.length);
  });

  it("trzecie zadanie różni się konstrukcją i wymaga rozpoczęcia od nawiasu", () => {
    const first = createOrderSeriesTask(2, 1);
    const third = createOrderSeriesTask(2, 3);

    expect(first.expression).not.toContain("(");
    expect(third.expression).toContain("(");
    expect(third.operators).toHaveLength(3);
    expect(third.executionOrder[0]).toBe("+");
  });

  it("na ostatnim slajdzie wpisuje wynik klawiaturą kalkulatora", () => {
    render(<OrderOfOperationsLessonModel seed={3} taskSeed={123} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "← Usuń" })).toBeInTheDocument();
  });
});
