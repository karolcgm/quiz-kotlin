import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Konto oczekuje na aktywację",
};

export default function PendingAccountPage() {
  return (
    <PageShell className="max-w-2xl">
      <Card className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
          Konto nauczyciela
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Oczekuje na aktywację</h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Rejestracja została przyjęta. Admin musi ręcznie aktywować konto nauczyciela, zanim panel
          testów i uczniów będzie dostępny.
        </p>
      </Card>
    </PageShell>
  );
}
