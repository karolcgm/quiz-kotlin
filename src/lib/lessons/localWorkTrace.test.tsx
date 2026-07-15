// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearLocalWorkTrace,
  queueLocalWorkSubmission,
  readLocalWorkTrace,
  writeLocalWorkDraft,
  type LocalWorkIdentity,
  type LocalWorkTrace,
} from "@/lib/lessons/localWorkTrace";
import { useIdempotentSubmission } from "@/lib/lessons/useIdempotentSubmission";

const identity: LocalWorkIdentity = {
  channel: "live",
  scopeId: "session-1",
  stageId: "stage-1",
  itemId: "question-1",
};

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("WP-CONTEXT-04 — lokalny ślad i idempotencja", () => {
  it("zamraża payload i clientAttemptId po skierowaniu odpowiedzi do wysłania", () => {
    const draft = writeLocalWorkDraft(identity, { answer: 7 });
    const first = queueLocalWorkSubmission(identity, { answer: 7 });
    const retry = queueLocalWorkSubmission(identity, { answer: 99 });

    expect(first.clientAttemptId).toBe(draft.clientAttemptId);
    expect(retry.clientAttemptId).toBe(first.clientAttemptId);
    expect(retry.payload).toEqual({ answer: 7 });
    clearLocalWorkTrace(identity, "inna-próba");
    expect(readLocalWorkTrace(identity)).not.toBeNull();
    clearLocalWorkTrace(identity, first.clientAttemptId);
    expect(readLocalWorkTrace(identity)).toBeNull();
  });

  it("po reconnect wysyła ten sam ślad i usuwa go dopiero po potwierdzeniu", async () => {
    const attempts: LocalWorkTrace<{ answer: number }>[] = [];
    const send = vi.fn(async (trace: LocalWorkTrace<{ answer: number }>) => {
      attempts.push(trace);
      if (attempts.length === 1) throw new Error("offline");
      return { ok: true as const };
    });
    const onSuccess = vi.fn();

    function Probe() {
      const submission = useIdempotentSubmission<{ answer: number }, { ok: true }>({
        identity,
        send,
        onSuccess,
      });
      return (
        <div>
          <button type="button" onClick={() => submission.submit({ answer: 7 })}>Wyślij próbę</button>
          {submission.error ? <p role="alert">{submission.error}</p> : null}
        </div>
      );
    }

    render(<Probe />);
    fireEvent.click(screen.getByRole("button", { name: "Wyślij próbę" }));
    await screen.findByRole("alert");
    const pendingTrace = readLocalWorkTrace<{ answer: number }>(identity);
    expect(pendingTrace?.status).toBe("pending");

    act(() => window.dispatchEvent(new Event("online")));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());

    expect(attempts).toHaveLength(2);
    expect(attempts[1]?.clientAttemptId).toBe(attempts[0]?.clientAttemptId);
    expect(attempts[1]?.payload).toEqual(attempts[0]?.payload);
    expect(readLocalWorkTrace(identity)).toBeNull();
  });
});
