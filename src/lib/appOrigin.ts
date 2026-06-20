import { headers } from "next/headers";

/** Public base URL of the app (no trailing slash). Used for invite links and auth redirects. */
export async function getAppOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) {
    return configured;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}

export function buildStudentInvitePath(token: string, studentEmail?: string | null): string {
  const params = new URLSearchParams({ role: "student", token });
  if (studentEmail?.trim()) {
    params.set("studentEmail", studentEmail.trim());
  }
  return `/rejestracja?${params.toString()}`;
}

export async function buildStudentInviteUrl(token: string, studentEmail?: string | null): Promise<string> {
  const origin = await getAppOrigin();
  return `${origin}${buildStudentInvitePath(token, studentEmail)}`;
}
