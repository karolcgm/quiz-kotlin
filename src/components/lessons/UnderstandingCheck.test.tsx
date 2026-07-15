// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UnderstandingCheck } from "@/components/lessons/UnderstandingCheck";

afterEach(cleanup);

describe("UnderstandingCheck", () => {
  it("pokazuje trzy tekstowo i ikoną oznaczone poziomy samooceny", () => {
    const onChange = vi.fn();
    render(<UnderstandingCheck value={null} onChange={onChange} />);

    expect(screen.getByRole("radio", { name: "Umiem samodzielnie" })).toHaveTextContent("✓");
    expect(screen.getByRole("radio", { name: "Potrzebuję jednej wskazówki" })).toHaveTextContent("💡");
    expect(screen.getByRole("radio", { name: "Potrzebuję wspólnego przykładu" })).toHaveTextContent("👥");

    fireEvent.click(screen.getByRole("radio", { name: "Potrzebuję jednej wskazówki" }));
    expect(onChange).toHaveBeenCalledWith("partial");
    expect(screen.getByText(/Samoocena nie zmienia punktów za zadanie/)).toBeInTheDocument();
  });
});
