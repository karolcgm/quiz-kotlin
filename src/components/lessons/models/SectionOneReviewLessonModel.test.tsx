// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NUMBER_DECODER_TASKS,
  REVIEW_MENTAL_TASKS,
  REVIEW_NUMBER_LINE_TASKS,
  REVIEW_ORDER_TASKS,
  REVIEW_REMAINDER_TASKS,
  REVIEW_SORT_TASKS,
  SectionOneReviewLessonModel,
} from "@/components/lessons/models/SectionOneReviewLessonModel";

afterEach(cleanup);

describe("SectionOneReviewLessonModel", () => {
  it("renderuje siedem różnych misji po cztery mini-stacje", () => {
    for (let seed = 1; seed <= 7; seed += 1) {
      const { container, unmount } = render(
        <SectionOneReviewLessonModel seed={seed} questionNumber={1} questionCount={4} />,
      );
      expect(container.querySelector(`[data-section-one-review-station="${seed}"]`)).not.toBeNull();
      expect(screen.getByText("Mini-stacja 1/4")).toBeInTheDocument();
      unmount();
    }
  });

  it("siódma misja zawiera kolejno cztery rodzaje działań pisemnych", () => {
    const expectedHeadings = [
      "Dodawanie pisemne",
      "Odejmowanie pisemne",
      "Mnożenie pisemne piętrami",
      "Dzielenie pisemne bez reszty",
    ];

    expectedHeadings.forEach((heading, index) => {
      const { unmount } = render(
        <SectionOneReviewLessonModel seed={7} questionNumber={index + 1} questionCount={4} />,
      );
      expect(screen.getByText(heading)).toBeInTheDocument();
      unmount();
    });
  });

  it("dekoder przyjmuje poprawne grupowanie i zapis słowny", () => {
    const reporter = vi.fn();
    const task = NUMBER_DECODER_TASKS[0]!;
    render(
      <SectionOneReviewLessonModel
        seed={1}
        taskSeed={101}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    fireEvent.click(screen.getByRole("button", { name: task.correct }));

    expect(reporter).toHaveBeenLastCalledWith(true, task.correct);
    expect(screen.getByRole("status")).toHaveTextContent("grupy po trzy");
  });

  it("kolejka akceptuje wartość wynikającą ze skali osi", () => {
    const reporter = vi.fn();
    const task = REVIEW_NUMBER_LINE_TASKS[0]!;
    const answer = task.start + task.step * task.markerIndex;
    render(
      <SectionOneReviewLessonModel
        seed={2}
        taskSeed={202}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    fireEvent.click(screen.getByRole("button", { name: `Odpowiedź ${answer}` }));

    expect(reporter).toHaveBeenLastCalledWith(true, String(answer));
    expect(screen.getByRole("status")).toHaveTextContent(`wartość ${task.step}`);
  });

  it("sortownia wymaga pełnej kolejności rosnącej", () => {
    const reporter = vi.fn();
    const values = [...REVIEW_SORT_TASKS[0]!].sort((a, b) => a - b);
    render(
      <SectionOneReviewLessonModel
        seed={3}
        taskSeed={303}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    values.forEach((value) => {
      fireEvent.click(screen.getByRole("button", { name: `Wybierz liczbę ${value}` }));
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź kolejność" }));

    expect(reporter).toHaveBeenLastCalledWith(
      true,
      values.map((value) => value.toLocaleString("pl-PL")).join(" < "),
    );
  });

  it("reaktor sprawdza wpisany wynik działania pamięciowego", () => {
    const reporter = vi.fn();
    const task = REVIEW_MENTAL_TASKS[0]!;
    render(
      <SectionOneReviewLessonModel
        seed={4}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    fireEvent.change(screen.getByLabelText("Wynik działania pamięciowego"), {
      target: { value: String(task.answer) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Uruchom reaktor" }));

    expect(reporter).toHaveBeenLastCalledWith(true, String(task.answer));
  });

  it("sterownia ocenia końcowy wynik zgodnie z kolejnością działań", () => {
    const reporter = vi.fn();
    const task = REVIEW_ORDER_TASKS[0]!;
    render(
      <SectionOneReviewLessonModel
        seed={5}
        taskSeed={505}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    fireEvent.click(screen.getByRole("button", { name: task.correct }));

    expect(reporter).toHaveBeenLastCalledWith(true, task.correct);
  });

  it("pakowalnia przyjmuje poprawny iloraz i resztę", () => {
    const reporter = vi.fn();
    const task = REVIEW_REMAINDER_TASKS[0]!;
    render(
      <SectionOneReviewLessonModel
        seed={6}
        questionNumber={1}
        questionCount={4}
        onResultChange={reporter}
      />,
    );
    reporter.mockClear();

    expect(screen.queryByText(`${task.quotient} pełnych`)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Liczba pełnych pojemników"), {
      target: { value: String(task.quotient) },
    });
    fireEvent.change(screen.getByLabelText("Reszta z dzielenia"), {
      target: { value: String(task.remainder) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź pakowanie" }));

    expect(reporter).toHaveBeenLastCalledWith(true, `${task.quotient} r ${task.remainder}`);
    expect(screen.getByRole("status")).toHaveTextContent(`${task.total} = ${task.divisor}`);
  });
});
