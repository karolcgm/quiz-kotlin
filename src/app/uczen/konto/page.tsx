import type { Metadata } from "next";
import { StudentQrSettings } from "@/components/student/StudentQrSettings";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Konto ucznia",
  description: "Ustawienia logowania ucznia kodem QR i PIN-em.",
};

type StudentQrStatusRow = {
  configured: boolean;
  updated_at: string | null;
  locked_until: string | null;
};

export default async function StudentAccountPage() {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("student_qr_login_status");
  const status = !error && Array.isArray(data) ? (data[0] as StudentQrStatusRow | undefined) : undefined;

  return (
    <StudentQrSettings
      initialConfigured={Boolean(status?.configured)}
      configuredAt={status?.updated_at ?? null}
      lockedUntil={status?.locked_until ?? null}
    />
  );
}
