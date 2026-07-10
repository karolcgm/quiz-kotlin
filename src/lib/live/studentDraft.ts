export interface StudentDraftValue {
  selectedOperatorIndex: number | null;
  updatedAt: string;
}

function draftKey(sessionId: string, stageId: string, questionInstanceId: string): string {
  return `lekcjalab-student-draft:${sessionId}:${stageId}:${questionInstanceId}`;
}

export function readStudentDraft(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
): StudentDraftValue | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(draftKey(sessionId, stageId, questionInstanceId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StudentDraftValue;
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      selectedOperatorIndex:
        parsed.selectedOperatorIndex === null ? null : Number(parsed.selectedOperatorIndex),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeStudentDraft(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
  selectedOperatorIndex: number | null,
): void {
  if (typeof window === "undefined") return;
  const value: StudentDraftValue = {
    selectedOperatorIndex,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(draftKey(sessionId, stageId, questionInstanceId), JSON.stringify(value));
}

export function clearStudentDraft(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKey(sessionId, stageId, questionInstanceId));
}

export function attemptKey(sessionId: string, stageId: string, questionInstanceId: string): string {
  return `lekcjalab-student-attempt:${sessionId}:${stageId}:${questionInstanceId}`;
}

export function readStoredAttemptId(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(attemptKey(sessionId, stageId, questionInstanceId));
}

export function storeAttemptId(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
  attemptId: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(attemptKey(sessionId, stageId, questionInstanceId), attemptId);
}

export function clearStoredAttemptId(
  sessionId: string,
  stageId: string,
  questionInstanceId: string,
): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(attemptKey(sessionId, stageId, questionInstanceId));
}
