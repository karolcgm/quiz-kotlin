// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StartLiveLessonForm } from "@/components/live/StartLiveLessonForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/actions/lessonSessions", () => ({
  createLessonSessionAction: vi.fn(),
  endLessonSessionAction: vi.fn(),
}));

afterEach(cleanup);

describe("StartLiveLessonForm", () => {
  it("blokuje tworzenie nowej sesji i pokazuje powrót oraz zamknięcie", () => {
    render(<StartLiveLessonForm
      lessonId="new-lesson"
      classes={[{ id: "class-1", name: "5A", group_name: "A", school_name: "Szkoła" }]}
      activeSession={{
        id: "active-session",
        lessonId: "old-lesson",
        lessonTitle: "Trwająca lekcja",
        status: "live",
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
        classLabel: "Szkoła · 5A / A",
      }}
    />);

    expect(screen.getByRole("button", { name: "Wróć do sesji" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zamknij sesję" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Uruchom aktywność live" })).not.toBeInTheDocument();
  });
});
