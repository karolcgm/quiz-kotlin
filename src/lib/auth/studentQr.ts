const STUDENT_QR_PREFIX = "lekcjalab:student-login:v1:";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function createStudentQrPayload(token: string): string {
  if (!TOKEN_PATTERN.test(token)) {
    throw new Error("Nieprawidłowy token QR ucznia.");
  }

  return `${STUDENT_QR_PREFIX}${token}`;
}

/** Odczytuje wyłącznie kody QR wygenerowane przez LekcjaLab. */
export function extractStudentQrToken(payload: string): string | null {
  const value = payload.trim();
  if (!value.startsWith(STUDENT_QR_PREFIX)) return null;

  const token = value.slice(STUDENT_QR_PREFIX.length);
  return TOKEN_PATTERN.test(token) ? token : null;
}

export function isFourDigitPin(value: string): boolean {
  return /^\d{4}$/.test(value);
}
