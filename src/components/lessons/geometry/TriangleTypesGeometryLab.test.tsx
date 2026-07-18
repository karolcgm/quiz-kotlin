// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { GeometryLab } from "@/components/lessons/geometry/GeometryLab";
import { triangleClassifications } from "@/lib/math/geometry/triangleTypes";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("WP-S4-06 — Trójkątny plac zabaw", () => {
  it("ukrywa dwie nazwy do chwili przewidywania i udziela konkretnego feedbacku", () => {
    render(<GeometryLab seed={460201} />);
    expect(screen.getByText(/Nazwy są ukryte/u)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Według boków"), { target: { value: "isosceles" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obie klasyfikacje" }));
    expect(screen.getAllByText("Brakuje jednej z dwóch klasyfikacji.").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText("Według kątów"), { target: { value: "acute" } });
    fireEvent.click(screen.getByRole("button", { name: "Sprawdź obie klasyfikacje" }));
    expect(screen.getAllByText("równoramienny").length).toBeGreaterThan(1);
    expect(screen.getAllByText("ostrokątny").length).toBeGreaterThan(1);
  });

  it("rysuje duży plac zabaw nad wyborem i pokazuje proste długości równych boków", () => {
    const { container } = render(<GeometryLab seed={460101} />);
    expect(container.querySelector('[data-geometry-theme="playground"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-geometry-angle]")).toHaveLength(3);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(3);
    expect(screen.getAllByText("6 cm").length).toBeGreaterThanOrEqual(3);
    expect(Array.from(container.querySelectorAll("[data-geometry-angle] text")).every((node) => !node.textContent?.includes("∠"))).toBe(true);
    expect(screen.queryByText("Przesuń wierzchołek bez przeciągania")).not.toBeInTheDocument();
    expect(screen.queryByText(/√/u)).not.toBeInTheDocument();
  });

  it("zmienia kształt i długości po wybraniu nazwy trójkąta", () => {
    const onStateChange = vi.fn();
    const { container } = render(<GeometryLab seed={460101} onStateChange={onStateChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Trójkąt różnoboczny" }));
    expect(onStateChange).toHaveBeenCalled();
    expect(screen.getAllByText("3 cm").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("4 cm").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("5 cm").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt równoramienny" }));
    expect(screen.getAllByText("5 cm").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelectorAll("[data-equal-side-mark]")).toHaveLength(2);
  });

  it("opisuje rodzaje według długości boków bez odwołania do kresek", () => {
    render(<GeometryLab seed={460101} />);

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt równoboczny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie boki mają tę samą długość.");

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt równoramienny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Dwa boki są tej samej długości.");

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt różnoboczny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie boki są różnej długości.");
    expect(screen.getByRole("status")).not.toHaveTextContent("kreski na bokach");
  });

  it("pokazuje osobny podział trójkątów ze względu na kąty", () => {
    const onStateChange = vi.fn();
    const { container } = render(<GeometryLab seed={461201} onStateChange={onStateChange} />);
    expect(screen.getAllByRole("heading", { name: "Podział trójkątów ze względu na kąty" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Trójkąt ostrokątny" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt prostokątny" }));
    expect(triangleClassifications(onStateChange.mock.calls.at(-1)?.[0])?.angle).toBe("right");
    expect(container.querySelector("[data-right-angle-arc]")).toBeInTheDocument();
    expect(container.querySelector("[data-right-angle-dot]")).toBeInTheDocument();
    expect(container.querySelector("[data-geometry-angle] text")?.textContent).not.toContain("∠");
    expect(container.querySelector("[data-geometry-angle] text")?.textContent).not.toMatch(/\.\d°/u);

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt rozwartokątny" }));
    expect(triangleClassifications(onStateChange.mock.calls.at(-1)?.[0])?.angle).toBe("obtuse");
    expect(screen.getByText(/O rodzaju decyduje największy kąt/u)).toBeInTheDocument();
  });

  it("opisuje rodzaje według kątów analogicznie do podziału według boków", () => {
    render(<GeometryLab seed={461201} />);

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt ostrokątny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Wszystkie kąty są ostre.");

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt prostokątny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Jeden kąt jest prosty.");

    fireEvent.click(screen.getByRole("button", { name: "Trójkąt rozwartokątny" }));
    expect(screen.getByRole("status")).toHaveTextContent("Jeden kąt jest rozwarty.");
    expect(screen.getByRole("status")).not.toHaveTextContent("Porównaj miary kątów z 90°");
  });

  it("po przejściu do następnego slajdu wczytuje nową aktywność zamiast zachowywać pierwszy model", () => {
    const { container, rerender } = render(<GeometryLab seed={460101} />);
    expect(container.querySelector('[data-activity="playground"]')).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Podział trójkątów ze względu na boki" }).length).toBeGreaterThan(0);

    rerender(<GeometryLab seed={461201} />);
    expect(container.querySelector('[data-activity="angle-playground"]')).toBeInTheDocument();
    expect(container.querySelector('[data-activity="playground"]')).not.toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Podział trójkątów ze względu na kąty" }).length).toBeGreaterThan(0);

    rerender(<GeometryLab seed={461101} />);
    expect(screen.getAllByRole("heading", { name: "Obwód trójkąta" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
  });

  it("blokuje manipulację w widoku tylko do odczytu", () => {
    render(<GeometryLab seed={460101} readOnly />);
    expect(screen.getByRole("button", { name: "Następne zadanie →" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Wierzchołek C/u })).not.toBeInTheDocument();
  });

  it("wyjaśnia nazwy boków trójkąta prostokątnego", () => {
    render(<GeometryLab seed={460901} />);
    expect(screen.getAllByRole("heading", { name: "Boki trójkąta prostokątnego" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("przyprostokątna")).toHaveLength(2);
    expect(screen.getAllByText("przeciwprostokątna").length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector("[data-right-angle-arc]")).toBeInTheDocument();
    expect(document.querySelector("[data-right-angle-dot]")).toBeInTheDocument();
  });

  it("klasyfikuje ponumerowane trójkąty jednocześnie według boków i kątów", () => {
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={461001} onResultChange={onResultChange} />);
    expect(container.querySelectorAll("[data-triangle-number]")).toHaveLength(7);
    expect(container.querySelectorAll("[data-triangle-number] text")).toHaveLength(7);
    expect(container.querySelectorAll("[data-side-label]")).toHaveLength(0);
    expect(container.querySelectorAll("[data-right-angle-arc]")).toHaveLength(2);
    expect(container.querySelectorAll("[data-right-angle-dot]")).toHaveLength(2);
    expect(screen.getByRole("table", { name: "Klasyfikacja trójkątów według boków i kątów" })).toBeInTheDocument();
    expect(screen.getAllByText("nie istnieje")).toHaveLength(2);
    expect(container.querySelectorAll('[data-lesson-numeric-keypad="shared"]')).toHaveLength(1);

    const keypad = screen.getByLabelText("Klawiatura do tabeli rodzajów trójkątów");
    const answers = [
      ["równoramienne, ostrokątne", "2"],
      ["równoramienne, prostokątne", "7"],
      ["równoramienne, rozwartokątne", "5"],
      ["równoboczne, ostrokątne", "4"],
      ["różnoboczne, ostrokątne", "6"],
      ["różnoboczne, prostokątne", "3"],
      ["różnoboczne, rozwartokątne", "1"],
    ] as const;
    answers.forEach(([label, value]) => {
      fireEvent.click(screen.getByLabelText(label));
      fireEvent.click(within(keypad).getByRole("button", { name: value }));
    });
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByRole("status")).toHaveTextContent("Każdy trójkąt został sklasyfikowany jednocześnie według boków i kątów.");
    expect(onResultChange).toHaveBeenLastCalledWith(true, "uzupełniono tabelę dwóch klasyfikacji");
  });

  it("prowadzi pięć tekstowych ćwiczeń bez gotowych rysunków", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={460701} onResultChange={onResultChange} />);
    const series = container.querySelector("[data-triangle-text-perimeter-series]");

    expect(series).toBeInTheDocument();
    expect(within(series as HTMLElement).queryByRole("img")).not.toBeInTheDocument();
    expect(series?.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.getByText("Zadanie 1/5")).toBeInTheDocument();
    expect(screen.getByText("Bok trójkąta równobocznego ma 5 cm. Oblicz obwód tego trójkąta.")).toBeInTheDocument();
    expect(container.querySelectorAll('[data-lesson-numeric-keypad="shared"]')).toHaveLength(1);

    ["15", "16", "25", "24", "12"].forEach((value, index) => {
      const keypad = screen.getByLabelText("Kalkulator do pięciu ćwiczeń z obwodu");
      value.split("").forEach((digit) => fireEvent.click(within(keypad).getByRole("button", { name: digit })));
      fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));

      if (index < 4) {
        expect(screen.getByText(/Za chwilę pojawi się następne zadanie/u)).toBeInTheDocument();
        act(() => vi.advanceTimersByTime(700));
        expect(screen.getByText(`Zadanie ${index + 2}/5`)).toBeInTheDocument();
      }
    });

    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono pięć tekstowych zadań o obwodzie trójkąta");
    expect(screen.getByText(/Rozwiązałeś pięć zadań bez korzystania z gotowych rysunków/u)).toBeInTheDocument();
    expect(screen.queryByLabelText("Kalkulator do pięciu ćwiczeń z obwodu")).not.toBeInTheDocument();
  });

  it("prowadzi serię obwodów na jednym slajdzie i używa jednej klawiatury ekranowej", () => {
    vi.useFakeTimers();
    const onResultChange = vi.fn();
    const { container } = render(<GeometryLab seed={461101} onResultChange={onResultChange} />);
    expect(screen.getByText("Zadanie 1/6")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trójkąt równoboczny" })).toBeInTheDocument();
    expect(container.querySelector("[data-equal-side-marks]")).not.toBeInTheDocument();
    const input = screen.getByLabelText("Obwód trójkąta równobocznego");
    expect(input).toHaveAttribute("inputmode", "none");
    expect(input).toHaveAttribute("readonly");
    expect(container.querySelectorAll('[data-lesson-numeric-keypad="shared"]')).toHaveLength(1);

    const keypad = screen.getByLabelText("Kalkulator do obwodów trójkątów");
    fireEvent.click(within(keypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "2" }));
    fireEvent.click(within(keypad).getByRole("button", { name: "Zatwierdź" }));
    expect(screen.getByText(/Za chwilę pojawi się następne zadanie/u)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("Zadanie 2/6")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trójkąt równoramienny" })).toBeInTheDocument();
    expect(container.querySelector("[data-equal-side-marks]")).toBeInTheDocument();

    ["19", "24", "34", "9"].forEach((value, offset) => {
      const currentKeypad = screen.getByLabelText("Kalkulator do obwodów trójkątów");
      value.split("").forEach((digit) => fireEvent.click(within(currentKeypad).getByRole("button", { name: digit })));
      fireEvent.click(within(currentKeypad).getByRole("button", { name: "Zatwierdź" }));
      expect(onResultChange).not.toHaveBeenLastCalledWith(true, expect.anything());
      act(() => vi.advanceTimersByTime(700));
      expect(screen.getByText(`Zadanie ${offset + 3}/6`)).toBeInTheDocument();
    });

    const finalKeypad = screen.getByLabelText("Kalkulator do obwodów trójkątów");
    fireEvent.click(within(finalKeypad).getByRole("button", { name: "1" }));
    fireEvent.click(within(finalKeypad).getByRole("button", { name: "0" }));
    fireEvent.click(within(finalKeypad).getByRole("button", { name: "Zatwierdź" }));
    expect(onResultChange).toHaveBeenLastCalledWith(true, "ukończono sześć zadań o obwodzie trójkąta");
    expect(screen.getByText(/Umiesz obliczyć obwód trójkąta i brakujący bok/u)).toBeInTheDocument();
  });
});
