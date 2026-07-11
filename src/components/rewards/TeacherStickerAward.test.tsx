// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TeacherStickerAward } from "@/components/rewards/TeacherStickerAward";

const award = vi.fn().mockResolvedValue({ ok: true, stickerId: 42 });

vi.mock("@/lib/actions/rewards", () => ({
  awardStudentStickerAction: (...args: unknown[]) => award(...args),
}));

afterEach(() => {
  cleanup();
  award.mockClear();
});

describe("TeacherStickerAward", () => {
  it("pozwala nauczycielowi wybrać kolekcję i wysłać nagrodę uczniowi", async () => {
    render(<TeacherStickerAward studentId="student-1" studentName="Ala" sessionId="session-1" />);
    fireEvent.click(screen.getByRole("button", { name: "🎁 Przyznaj naklejkę" }));
    expect(screen.getByRole("dialog", { name: "Naklejka dla Ala" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Kocie Liczydła/ }));
    await waitFor(() => expect(award).toHaveBeenCalledWith({
      studentId: "student-1",
      collectionId: 2,
      reason: "Za zaangażowanie i pracę na lekcji",
      sessionId: "session-1",
    }));
    expect(await screen.findByText(/Przyznano losową naklejkę/)).toBeInTheDocument();
  });
});
