import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/session", () => ({ requireRole: mocks.requireRole }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));

import { endLessonSessionAction, getLessonSessionBookwork } from "@/lib/actions/lessonSessions";

describe("endLessonSessionAction — zapis pracy z podręcznikiem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({ id: "teacher-1", role: "teacher" });
  });

  it("zapisuje stronę i wiele zadań bezpośrednio, gdy RPC nie ma jeszcze w pamięci schematu", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: null });
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const update = vi.fn(() => ({ eq: firstEq }));
    const from = vi.fn(() => ({ update }));
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: null, error: { code: "PGRST202", message: "Could not find the function public.update_lesson_session_bookwork(target_exercises, target_page, target_session_id) in the schema cache" } })
      .mockResolvedValueOnce({ data: { sessionId: "session-1", status: "ended", sequenceNumber: 7 }, error: null });
    mocks.createClient.mockResolvedValue({ rpc, from });

    const result = await endLessonSessionAction("session-1", true, {
      textbookPage: 42,
      coveredExercises: ["1", " 2a ", "1", "3"],
    });

    expect(result).toMatchObject({ ok: true, sessionId: "session-1", status: "ended" });
    expect(update).toHaveBeenCalledWith({ textbook_page: 42, covered_exercises: ["1", "2a", "3"] });
    expect(firstEq).toHaveBeenCalledWith("id", "session-1");
    expect(secondEq).toHaveBeenCalledWith("teacher_id", "teacher-1");
    expect(rpc).toHaveBeenNthCalledWith(2, "end_lesson_session", {
      target_session_id: "session-1",
      record_skill_evidence: true,
    });
  });

  it("nie kończy sesji, gdy awaryjny zapis danych również się nie powiedzie", async () => {
    const secondEq = vi.fn().mockResolvedValue({ error: { message: "Brak kolumn pracy z podręcznikiem." } });
    const firstEq = vi.fn(() => ({ eq: secondEq }));
    const update = vi.fn(() => ({ eq: firstEq }));
    const from = vi.fn(() => ({ update }));
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST202", message: "schema cache update_lesson_session_bookwork" } });
    mocks.createClient.mockResolvedValue({ rpc, from });

    const result = await endLessonSessionAction("session-1", true, {
      textbookPage: 42,
      coveredExercises: ["1", "2"],
    });

    expect(result).toEqual({ ok: false, error: "Brak kolumn pracy z podręcznikiem." });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("po ponownym wczytaniu zwraca zapisaną stronę i wszystkie numery zadań", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { textbook_page: 42, covered_exercises: ["1", "2a", "3"] },
      error: null,
    });
    const teacherEq = vi.fn(() => ({ maybeSingle }));
    const sessionEq = vi.fn(() => ({ eq: teacherEq }));
    const select = vi.fn(() => ({ eq: sessionEq }));
    const from = vi.fn(() => ({ select }));
    mocks.createClient.mockResolvedValue({ from });

    const result = await getLessonSessionBookwork("session-1");

    expect(result).toEqual({ textbookPage: 42, coveredExercises: ["1", "2a", "3"] });
    expect(sessionEq).toHaveBeenCalledWith("id", "session-1");
    expect(teacherEq).toHaveBeenCalledWith("teacher_id", "teacher-1");
  });
});
