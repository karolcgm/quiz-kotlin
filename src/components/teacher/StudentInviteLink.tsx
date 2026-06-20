"use client";

import { useState } from "react";

interface StudentInviteLinkProps {
  inviteUrl: string;
  studentEmail?: string | null;
}

export function StudentInviteLink({ inviteUrl, studentEmail }: StudentInviteLinkProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Skopiuj link zaproszenia:", inviteUrl);
    }
  }

  const mailto =
    studentEmail?.trim() &&
    `mailto:${encodeURIComponent(studentEmail.trim())}?subject=${encodeURIComponent("Zaproszenie do LekcjaLab")}&body=${encodeURIComponent(
      `Cześć!\n\nNauczyciel zaprasza Cię do LekcjaLab. Kliknij link, aby założyć konto ucznia:\n\n${inviteUrl}\n\nLink jest ważny 14 dni.`,
    )}`;

  return (
    <div className="mt-4 space-y-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
      <p className="text-sm font-bold text-emerald-950">Link zaproszenia — wyślij go uczniowi</p>
      <p className="text-sm text-emerald-900">
        System <strong>nie wysyła emaila automatycznie</strong>. Skopiuj pełny link poniżej i prześlij uczniowi
        (WhatsApp, wiadomość szkolna, email).
      </p>
      <a
        href={inviteUrl}
        target="_blank"
        rel="noreferrer"
        className="block break-all rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-700 underline"
      >
        {inviteUrl}
      </a>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          {copied ? "Skopiowano!" : "Kopiuj link"}
        </button>
        {mailto && (
          <a
            href={mailto}
            className="rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            Otwórz email do ucznia
          </a>
        )}
      </div>
    </div>
  );
}
