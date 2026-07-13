// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BeaverDamGame, formatBeaverDamTime } from "@/components/materials/games/beaver-dam/BeaverDamGame";

const { claimPerfectRewardMock } = vi.hoisted(() => ({
  claimPerfectRewardMock: vi.fn(async () => ({ awarded: true, totalPoints: 5 })),
}));

vi.mock("@/lib/actions/rewards", () => ({
  claimBeaverDamPerfectRewardAction: claimPerfectRewardMock,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  claimPerfectRewardMock.mockClear();
});

describe("Chrupek i Tama Liczb", () => {
  it("zaczyna od czytelnego intro i pokazuje cztery różne kłody", () => {
    render(<BeaverDamGame />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));

    expect(screen.getByText("Która kłoda daje wynik 786?")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((button) => /[+−·:]/.test(button.textContent ?? ""))).toHaveLength(4);
  });

  it("daje spokojną wskazówkę po błędzie i akceptuje poprawną kłodę", () => {
    render(<BeaverDamGame />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));
    fireEvent.click(screen.getByRole("button", { name: "120 + 450" }));
    expect(screen.getByText(/Jeszcze nie ta kłoda/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "325 + 461" }));
    expect(screen.getByText(/Kłoda pasuje/)).toBeInTheDocument();
  });

  it("pokazuje działający timer", () => {
    vi.useFakeTimers();
    render(<BeaverDamGame />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));
    expect(screen.getByText("00:00")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("00:03")).toBeInTheDocument();
    expect(formatBeaverDamTime(125)).toBe("02:05");
  });

  it("zgłasza jednorazową nagrodę po bezbłędnym ukończeniu przez ucznia", async () => {
    vi.useFakeTimers();
    render(<BeaverDamGame rewardEnabled />);
    fireEvent.click(screen.getByRole("button", { name: "Rozpocznij misję →" }));

    for (const answer of ["325 + 461", "67 + 48", "47 · 18", "2415 : 5", "860 − 630"]) {
      fireEvent.click(screen.getByRole("button", { name: answer }));
      await act(async () => vi.advanceTimersByTime(850));
    }

    expect(claimPerfectRewardMock).toHaveBeenCalledOnce();
    await act(async () => Promise.resolve());
    expect(screen.getByText(/zdobywasz 5 punktów/i)).toBeInTheDocument();
  });
});
