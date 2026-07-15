// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CancelLessonReviewButton } from "@/components/student/CancelLessonReviewButton";
import { cancelStudentLessonReviewAction } from "@/lib/actions/studentLearningPlan";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/lib/actions/studentLearningPlan", () => ({ cancelStudentLessonReviewAction: vi.fn() }));

const cancelAction = vi.mocked(cancelStudentLessonReviewAction);

afterEach(cleanup);

describe("CancelLessonReviewButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
  });

  it("zamyka podejście i odświeża plan", async () => {
    cancelAction.mockResolvedValue({ ok: true });
    render(<CancelLessonReviewButton reviewId="review-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Zamknij podejście" }));

    await waitFor(() => expect(cancelAction).toHaveBeenCalledWith("review-1"));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("pokazuje błąd bez przechodzenia na stronę 404", async () => {
    cancelAction.mockResolvedValue({ ok: false, error: "Nie udało się zamknąć podejścia." });
    render(<CancelLessonReviewButton reviewId="review-2" />);

    fireEvent.click(screen.getByRole("button", { name: "Zamknij podejście" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Nie udało się zamknąć podejścia.");
    expect(refresh).not.toHaveBeenCalled();
  });
});
