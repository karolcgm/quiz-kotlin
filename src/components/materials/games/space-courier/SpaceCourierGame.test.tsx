// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpaceCourierGame } from "@/components/materials/games/space-courier/SpaceCourierGame";

const { claimPerfectRewardMock } = vi.hoisted(() => ({
  claimPerfectRewardMock: vi.fn(async () => ({ awarded: true, totalPoints: 5 })),
}));

vi.mock("@/lib/actions/rewards", () => ({
  claimVisualGamePerfectRewardAction: claimPerfectRewardMock,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  claimPerfectRewardMock.mockClear();
});

describe("Kosmiczny Kurier", () => {
  it("pozwala wybrać trasę z dużymi liczbami na trudnym poziomie", () => {
    render(<SpaceCourierGame />);
    fireEvent.click(screen.getByRole("button", { name: /Trudny/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij lot →" }));

    expect(screen.getByText("(125 + 87) · 36 − 432")).toBeInTheDocument();
  });

  it("zrywa błędną trasę i pozwala rozpocząć układanie od nowa", () => {
    render(<SpaceCourierGame />);
    fireEvent.click(screen.getByRole("button", { name: /Średni/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij lot →" }));

    fireEvent.click(screen.getByRole("button", { name: /20 · 3 = 60/ }));
    expect(screen.getByText(/To była pułapka/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /12 \+ 8 = 20/ }));
    expect(screen.getByLabelText("Zbudowana trasa: 1 z 3 etapów")).toBeInTheDocument();
  });

  it("przechodzi cztery trasy w poprawnej kolejności i zgłasza nagrodę", async () => {
    vi.useFakeTimers();
    render(<SpaceCourierGame rewardEnabled />);
    fireEvent.click(screen.getByRole("button", { name: /Średni/ }));
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij lot →" }));

    const routes = [
      ["12 + 8 = 20", "20 · 3 = 60", "60 − 10 = 50"],
      ["5 + 3 = 8", "72 : 8 = 9", "9 + 11 = 20"],
      ["15 − 7 = 8", "4 · 8 = 32", "32 + 6 = 38"],
      ["6 · 9 = 54", "100 − 54 = 46", "46 + 14 = 60"],
    ];

    for (const route of routes) {
      for (const step of route) fireEvent.click(screen.getByRole("button", { name: new RegExp(step.replace(/[+]/g, "\\+")) }));
      await act(async () => vi.advanceTimersByTime(750));
    }

    expect(claimPerfectRewardMock).toHaveBeenCalledWith("space-courier", expect.any(Number));
    await act(async () => Promise.resolve());
    expect(screen.getByText(/zdobywasz 5 punktów/i)).toBeInTheDocument();
  });
});
