import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Potwierdź email",
  description: "Potwierdzenie adresu email w LekcjaLab.",
};

interface ConfirmEmailPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function ConfirmEmailPage({ searchParams }: ConfirmEmailPageProps) {
  const { email } = await searchParams;

  return (
    <PageShell className="max-w-2xl">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Sprawdź skrzynkę email</h1>
        <p className="mt-4 text-slate-600">
          Wysłaliśmy link aktywacyjny{email ? ` na adres ${email}` : ""}. Kliknij go, aby dokończyć rejestrację
          i zalogować się do konta.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Jeśli wiadomość nie przyszła w kilka minut, sprawdź folder spam. W razie problemów poproś nauczyciela o
          ponowne wygenerowanie zaproszenia.
        </p>
        <Link
          href="/logowanie"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Przejdź do logowania
        </Link>
      </Card>
    </PageShell>
  );
}
