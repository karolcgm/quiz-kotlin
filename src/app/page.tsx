import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <PageShell className="flex min-h-[calc(100vh-13rem)] max-w-3xl items-center py-12 sm:py-20">
      <Card className="w-full p-8 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-700">LekcjaLab</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          Matematyka prowadzona przez nauczyciela.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Krótkie prezentacje, aktywności na tabletach, kartkówki i materiały do druku — zawsze w kontekście Twojej klasy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/logowanie" className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">
            Zaloguj się
          </Link>
          <Link href="/rejestracja?role=teacher" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
            Załóż konto nauczyciela
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
