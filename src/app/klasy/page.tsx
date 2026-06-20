import type { Metadata } from "next";
import { GradeGrid } from "@/components/navigation/GradeGrid";
import { PageShell } from "@/components/layout/PageShell";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";

export const metadata: Metadata = {
  title: "Klasy",
  description: "Przeglądaj interaktywne pomoce naukowe według klas szkoły podstawowej.",
};

export default function GradesPage() {
  return (
    <PageShell>
      <Breadcrumbs items={[{ label: "Strona główna", href: "/" }, { label: "Klasy" }]} />
      <h1 className="text-4xl font-bold text-slate-900">Klasy 1–8</h1>
      <p className="mt-3 max-w-3xl text-lg text-slate-600">
        Wybierz klasę, aby zobaczyć opis etapu edukacyjnego i listę symulacji dopasowanych do
        programu nauczania.
      </p>
      <div className="mt-8">
        <GradeGrid />
      </div>
    </PageShell>
  );
}
