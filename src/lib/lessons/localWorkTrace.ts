import type { LessonRuntimeChannel } from "@/types/lessonRuntime";

export interface LocalWorkIdentity {
  channel: Extract<LessonRuntimeChannel, "live" | "self_paced">;
  scopeId: string;
  stageId: string;
  itemId: string;
}

export interface LocalWorkTrace<Payload = Record<string, unknown>> extends LocalWorkIdentity {
  version: 1;
  clientAttemptId: string;
  status: "draft" | "pending";
  payload: Payload;
  updatedAt: string;
  expiresAt: string;
}

const PREFIX = "lekcjalab:work-trace:v1";
const TRACE_TTL_MS = 24 * 60 * 60 * 1000;

function traceKey(identity: LocalWorkIdentity): string {
  return `${PREFIX}:${identity.channel}:${identity.scopeId}:${identity.stageId}:${identity.itemId}`;
}

function newAttemptId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sameIdentity(trace: LocalWorkTrace, identity: LocalWorkIdentity): boolean {
  return trace.channel === identity.channel && trace.scopeId === identity.scopeId
    && trace.stageId === identity.stageId && trace.itemId === identity.itemId;
}

function writeTrace<Payload>(trace: LocalWorkTrace<Payload>): LocalWorkTrace<Payload> {
  if (typeof window === "undefined") return trace;
  try {
    window.localStorage.setItem(traceKey(trace), JSON.stringify(trace));
  } catch {
    // Pełny lub zablokowany storage nie może uniemożliwić pracy w bieżącej karcie.
  }
  return trace;
}

export function readLocalWorkTrace<Payload = Record<string, unknown>>(
  identity: LocalWorkIdentity,
): LocalWorkTrace<Payload> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(traceKey(identity));
    if (!raw) return null;
    const trace = JSON.parse(raw) as LocalWorkTrace<Payload>;
    if (trace.version !== 1 || !sameIdentity(trace as LocalWorkTrace, identity)) return null;
    if (Date.parse(trace.expiresAt) <= Date.now()) {
      window.localStorage.removeItem(traceKey(identity));
      return null;
    }
    return trace;
  } catch {
    return null;
  }
}

export function writeLocalWorkDraft<Payload>(
  identity: LocalWorkIdentity,
  payload: Payload,
): LocalWorkTrace<Payload> {
  const existing = readLocalWorkTrace<Payload>(identity);
  if (existing?.status === "pending") return existing;
  const now = new Date();
  return writeTrace({
    ...identity,
    version: 1,
    clientAttemptId: existing?.clientAttemptId ?? newAttemptId(),
    status: "draft",
    payload,
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TRACE_TTL_MS).toISOString(),
  });
}

/** Zamraża payload i identyfikator; każde ponowienie wysyła dokładnie tę samą próbę. */
export function queueLocalWorkSubmission<Payload>(
  identity: LocalWorkIdentity,
  payload: Payload,
): LocalWorkTrace<Payload> {
  const existing = readLocalWorkTrace<Payload>(identity);
  if (existing?.status === "pending") return existing;
  const draft = existing ?? writeLocalWorkDraft(identity, payload);
  return writeTrace({ ...draft, status: "pending", payload, updatedAt: new Date().toISOString() });
}

export function clearLocalWorkTrace(identity: LocalWorkIdentity, clientAttemptId?: string): void {
  if (typeof window === "undefined") return;
  const existing = readLocalWorkTrace(identity);
  if (clientAttemptId && existing?.clientAttemptId !== clientAttemptId) return;
  try {
    window.localStorage.removeItem(traceKey(identity));
  } catch {
    // Brak możliwości sprzątnięcia nie zmienia potwierdzonego wyniku serwera.
  }
}

export function clearLocalWorkScope(channel: LocalWorkIdentity["channel"], scopeId: string): void {
  if (typeof window === "undefined") return;
  const prefix = `${PREFIX}:${channel}:${scopeId}:`;
  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(prefix)) window.localStorage.removeItem(key);
    }
  } catch {
    // Czyszczenie jest pomocnicze; rekordy i tak mają krótki termin ważności.
  }
}
