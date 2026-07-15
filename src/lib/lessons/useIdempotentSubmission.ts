"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearLocalWorkTrace,
  queueLocalWorkSubmission,
  readLocalWorkTrace,
  type LocalWorkIdentity,
  type LocalWorkTrace,
} from "@/lib/lessons/localWorkTrace";

interface SubmissionResult {
  ok: boolean;
  error?: string;
}

export function useIdempotentSubmission<Payload, Result extends SubmissionResult>(input: {
  identity: LocalWorkIdentity;
  disabled?: boolean;
  send: (trace: LocalWorkTrace<Payload>) => Promise<Result>;
  onSuccess: (result: Result, trace: LocalWorkTrace<Payload>) => void | Promise<void>;
}) {
  const { identity, disabled = false, send, onSuccess } = input;
  const [pending, setPending] = useState(false);
  const [queued, setQueued] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const sendTrace = useCallback(async (trace: LocalWorkTrace<Payload>) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPending(true);
    setQueued(true);
    setError(null);
    try {
      const result = await send(trace);
      if (!result.ok) {
        setError(result.error ?? "Nie udało się zsynchronizować odpowiedzi.");
        return;
      }
      clearLocalWorkTrace(trace, trace.clientAttemptId);
      setQueued(false);
      await onSuccess(result, trace);
    } catch {
      setError("Brak połączenia. Odpowiedź czeka na bezpieczną synchronizację.");
    } finally {
      inFlightRef.current = false;
      setPending(false);
    }
  }, [onSuccess, send]);

  const submit = useCallback((payload: Payload) => {
    const trace = queueLocalWorkSubmission(identity, payload);
    void sendTrace(trace);
  }, [identity, sendTrace]);

  useEffect(() => {
    if (disabled) return;
    const retry = () => {
      const trace = readLocalWorkTrace<Payload>(identity);
      if (trace?.status === "pending") void sendTrace(trace);
    };
    window.addEventListener("online", retry);
    const pendingAtMount = readLocalWorkTrace<Payload>(identity);
    const retryId = pendingAtMount?.status === "pending"
      ? window.setTimeout(() => void sendTrace(pendingAtMount), 0)
      : null;
    return () => {
      window.removeEventListener("online", retry);
      if (retryId !== null) window.clearTimeout(retryId);
    };
  }, [disabled, identity, sendTrace]);

  return { submit, pending, queued, error };
}
