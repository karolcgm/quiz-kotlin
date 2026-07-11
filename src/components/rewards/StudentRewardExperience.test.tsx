// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudentRewardExperience } from "@/components/rewards/StudentRewardExperience";

const markSeen = vi.fn().mockResolvedValue(undefined);

vi.mock("@/lib/actions/rewards", () => ({
  getUnseenRewardNotificationsAction: vi.fn().mockResolvedValue([]),
  markRewardNotificationsSeenAction: (...args: unknown[]) => markSeen(...args),
  recordRewardClicksAction: vi.fn().mockResolvedValue({ clickCount: 10, unlocked: [] }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({ on() { return this; }, subscribe() { return this; } }),
    removeChannel: vi.fn().mockResolvedValue(undefined),
  }),
}));

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

afterEach(() => {
  cleanup();
  markSeen.mockClear();
});

describe("StudentRewardExperience", () => {
  it("pokazuje nagrody po kolei i oznacza jako przeczytane dopiero po zamknięciu", async () => {
    render(<StudentRewardExperience studentId="student-1" notifications={[
      { id: "n1", kind: "sticker", reward_key: "45", title: "Nowa naklejka!", message: "Pierwsza nagroda" },
      { id: "n2", kind: "achievement", reward_key: "click-100", title: "Brązowy Klikacz", message: "Drugie osiągnięcie" },
    ]} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Pierwsza nagroda")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Otwórz klaser" })).toHaveAttribute("href", "/uczen/klaser?collection=2#sticker-45");
    expect(markSeen).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Pokaż następną →" }));
    await waitFor(() => expect(markSeen).toHaveBeenCalledWith(["n1"]));
    expect(screen.getByText("Brązowy Klikacz")).toBeInTheDocument();
    expect(screen.getByText("Drugie osiągnięcie")).toBeInTheDocument();
  });
});
