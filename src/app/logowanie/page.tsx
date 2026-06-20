import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { signInAction } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Logowanie do panelu nauczyciela lub ucznia LekcjaLab.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <PageShell className="max-w-2xl">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Logowanie</h1>
        <p className="mt-3 text-slate-600">
          Zaloguj się jako nauczyciel albo uczeń, aby przejść do swojego panelu.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <form action={signInAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Zaloguj
          </button>
        </form>

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
    </PageShell>
  );
}
