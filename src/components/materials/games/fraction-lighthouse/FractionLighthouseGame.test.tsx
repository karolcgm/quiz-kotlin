// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FractionLighthouseGame } from "@/components/materials/games/fraction-lighthouse/FractionLighthouseGame";

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

describe("Latarnia Ułamków", () => {
  it("pokazuje cztery różne spadające odpowiedzi i wskazówkę po błędzie", () => {
    render(<FractionLighthouseGame />);
    fireEvent.click(screen.getByRole("button", { name: "Uruchom latarnię →" }));

    expect(screen.getByText("Kliknij wszystkie ułamki równe 1/2.")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((button) => /\d+\/\d+/.test(button.textContent ?? ""))).toHaveLength(4);

    fireEvent.click(screen.getByRole("button", { name: "4/6" }));
    expect(screen.getByText(/To światło nie pasuje/)).toBeInTheDocument();
  });

  it("kończy cztery fale i zgłasza jednorazową nagrodę za bezbłędną grę", async () => {
    vi.useFakeTimers();
    render(<FractionLighthouseGame rewardEnabled />);
    fireEvent.click(screen.getByRole("button", { name: "Uruchom latarnię →" }));

    for (const answers of [["2/4", "3/6"], ["6/8", "9/12"], ["14/21", "16/24"], ["6/10", "12/20"]]) {
      for (const answer of answers) fireEvent.click(screen.getByRole("button", { name: answer }));
      await act(async () => vi.advanceTimersByTime(650));
    }

    expect(claimPerfectRewardMock).toHaveBeenCalledWith("fraction-lighthouse", expect.any(Number));
    await act(async () => Promise.resolve());
    expect(screen.getByText(/zdobywasz 5 punktów/i)).toBeInTheDocument();
  });
});
