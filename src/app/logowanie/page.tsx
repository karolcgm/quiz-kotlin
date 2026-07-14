import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { StudentQrLogin } from "@/components/auth/StudentQrLogin";
import { SharedDevicePasswordLogin } from "@/components/auth/SharedDevicePasswordLogin";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Logowanie do panelu nauczyciela lub ucznia LekcjaLab.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : undefined;

  return (
    <PageShell className="max-w-6xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Logowanie</h1>
        <p className="mt-3 text-slate-600">
          Wybierz zwykłe logowanie albo — jeśli jesteś uczniem — użyj swojego kodu QR i PIN-u.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-black uppercase tracking-wide text-indigo-700">Każdy użytkownik</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Email i hasło</h2>

          <SharedDevicePasswordLogin nextPath={safeNext} error={error} />

          <div className="mt-6 space-y-2 text-sm text-slate-600">
            <p>
              Jesteś nauczycielem?{" "}
              <Link href="/rejestracja?role=teacher" className="font-semibold text-indigo-700">
                Zarejestruj konto do aktywacji.
              </Link>
            </p>
            <p>Uczeń rejestruje się tylko przez link zaproszenia od nauczyciela.</p>
          </div>
        </Card>

        <Card className="border-emerald-200">
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Tylko uczeń</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Kod QR i 4-cyfrowy PIN</h2>
          <p className="mt-2 text-sm text-slate-600">Nie musisz pamiętać ani wpisywać adresu e-mail.</p>
          <div className="mt-5">
            <StudentQrLogin />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
