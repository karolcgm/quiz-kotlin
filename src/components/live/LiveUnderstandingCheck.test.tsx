// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiveUnderstandingCheck } from "@/components/live/LiveUnderstandingCheck";
import { submitLiveLessonUnderstandingAction } from "@/lib/actions/lessonSessions";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/actions/lessonSessions", () => ({
  submitLiveLessonUnderstandingAction: vi.fn(),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("LiveUnderstandingCheck", () => {
  it("zapisuje dopiero po użyciu przycisku i pokazuje potwierdzenie", async () => {
    vi.mocked(submitLiveLessonUnderstandingAction).mockResolvedValue({
      ok: true,
      understandingLevel: "partial",
    });
    render(<LiveUnderstandingCheck sessionId="session-1" />);

    fireEvent.click(screen.getByRole("radio", { name: "Potrzebuję jednej wskazówki" }));
    expect(submitLiveLessonUnderstandingAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Zapisz samoocenę" }));

    await waitFor(() => expect(submitLiveLessonUnderstandingAction).toHaveBeenCalledWith("session-1", "partial"));
    expect(await screen.findByText("Samoocena zapisana. Punkty za zadanie nie zostały zmienione.")).toBeInTheDocument();
  });
});
