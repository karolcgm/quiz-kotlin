import { buildStudentInviteUrl } from "@/lib/appOrigin";

export interface InviteEmailResult {
  sent: boolean;
  skipped: boolean;
  error?: string;
}

export async function sendStudentInviteEmail(
  to: string,
  token: string,
  classLabel: string,
): Promise<InviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      skipped: true,
      error: "Brak RESEND_API_KEY — skopiuj link ręcznie lub dodaj klucz Resend w Vercel.",
    };
  }

  const from = process.env.RESEND_FROM?.trim() || "LekcjaLab <onboarding@resend.dev>";
  const inviteUrl = await buildStudentInviteUrl(token);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Zaproszenie do LekcjaLab",
        html: `
          <p>Cześć!</p>
          <p>Nauczyciel zaprasza Cię do LekcjaLab (${classLabel}).</p>
          <p><a href="${inviteUrl}">Kliknij tutaj, aby założyć konto ucznia</a></p>
          <p>Link jest ważny 14 dni.</p>
          <p>Jeśli link nie działa, wklej w przeglądarce:<br>${inviteUrl}</p>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        sent: false,
        skipped: false,
        error: `Resend: ${response.status} ${body.slice(0, 200)}`,
      };
    }

    return { sent: true, skipped: false };
  } catch (cause) {
    return {
      sent: false,
      skipped: false,
      error: cause instanceof Error ? cause.message : "Nie udało się wysłać emaila.",
    };
  }
}
