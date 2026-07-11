// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MentalMulDivLessonModel } from "@/components/lessons/models/MentalMulDivLessonModel";

afterEach(cleanup);

describe("MentalMulDivLessonModel", () => {
  it("pokazuje nazwy mnożenia i dzielenia", () => {
    render(<MentalMulDivLessonModel seed={1} />);
    expect(screen.getAllByText("czynnik")).toHaveLength(2);
    expect(screen.getByText("iloczyn")).toBeInTheDocument();
    expect(screen.getByText("dzielna")).toBeInTheDocument();
    expect(screen.getByText("dzielnik")).toBeInTheDocument();
    expect(screen.getByText("iloraz")).toBeInTheDocument();
  });

  it("ma pięć pozycji wyniku dla obliczeń pamięciowych", () => {
    render(<MentalMulDivLessonModel seed={2} taskSeed={33} questionNumber={1} questionCount={5} onResultChange={() => undefined} />);
    expect(screen.getByText("dziesiątki tysięcy")).toBeInTheDocument();
    expect(screen.getByText("jedności")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(10);
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
  });

  it("wykonuje długość i masę w obu kierunkach", () => {
    const first = render(<MentalMulDivLessonModel seed={6} taskSeed={61} questionNumber={1} questionCount={2} />);
    expect(first.container.textContent).toContain("m = □ cm");
    first.unmount();
    const second = render(<MentalMulDivLessonModel seed={6} taskSeed={62} questionNumber={2} questionCount={2} />);
    expect(second.container.textContent).toContain("cm = □ m");
    second.unmount();
    const mass = render(<MentalMulDivLessonModel seed={7} taskSeed={71} questionNumber={1} questionCount={2} />);
    expect(mass.container.textContent).toContain("kg = □ g");
  });
});
