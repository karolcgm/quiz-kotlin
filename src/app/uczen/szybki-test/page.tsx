import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { studentNavCategories } from "@/data/dashboardNav";
import { QuickPracticeBuilder } from "@/components/practice/QuickPracticeBuilder";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Szybki test ucznia",
  description: "Uczeń komponuje własny szybki test z widgetów LekcjaLab.",
};

export default async function StudentQuickPracticePage() {
  await requireRole("student");

  return (
    <PageShell>
      <DashboardNav categories={studentNavCategories} />
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Nauka własna</p>
        <h1 className="mt-3 text-4xl font-bold">Szybki test z widgetów</h1>
        <p className="mt-4 max-w-2xl text-lg text-emerald-50">
          Wybierz tematy, rozwiąż kilka interaktywnych pytań i zapisz wynik do swoich postępów.
        </p>
      </section>
      <QuickPracticeBuilder />
    </PageShell>
  );
}
