import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { SimulationGrid } from "@/components/navigation/SimulationGrid";
import { PageShell } from "@/components/layout/PageShell";
import {
  getGradeById,
  getSectionsForGrade,
  getSimulationCountsBySection,
  getSimulationsByGrade,
  isValidGrade,
} from "@/lib/routes";
import { Card } from "@/components/ui/Card";

interface GradePageProps {
  params: Promise<{ grade: string }>;
}

export async function generateMetadata({ params }: GradePageProps): Promise<Metadata> {
  const { grade: gradeParam } = await params;
  const gradeId = Number(gradeParam);
  const grade = getGradeById(gradeId);

  if (!grade) {
    return { title: "Klasa nie znaleziona" };
  }

  return {
    title: grade.name,
    description: grade.description,
  };
}

export default async function GradePage({ params }: GradePageProps) {
  const { grade: gradeParam } = await params;
  const gradeId = Number(gradeParam);

  if (!isValidGrade(gradeId)) {
    notFound();
  }

  const grade = getGradeById(gradeId)!;
  const simulations = getSimulationsByGrade(gradeId);
  const sections = getSectionsForGrade(gradeId);
  const sectionCounts = getSimulationCountsBySection();
  const recommendedSimulations = simulations.filter((simulation) => simulation.featured).slice(0, 6);
  const visibleSimulations =
    recommendedSimulations.length > 0 ? recommendedSimulations : simulations.slice(0, 6);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Strona główna", href: "/" },
          { label: "Klasy", href: "/klasy" },
          { label: grade.name },
        ]}
      />
      <h1 className="text-4xl font-bold text-slate-900">{grade.name}</h1>
      <p className="mt-3 max-w-3xl text-lg text-slate-600">{grade.description}</p>

      {sections.length > 0 && (
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Działy matematyki</h2>
              <p className="mt-2 text-slate-600">
                Wybierz dział, aby przejść do katalogu z filtrem dla tej klasy.
              </p>
            </div>
            <Link
              href={`/symulacje?grade=${grade.id}`}
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Wszystkie symulacje klasy
            </Link>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`/symulacje?grade=${grade.id}&section=${section.id}`}
                className="group"
              >
                <Card className="h-full transition group-hover:border-indigo-300 group-hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
                      <p className="mt-2 text-slate-600">{section.description}</p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
                      {sectionCounts[section.id] ?? 0}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {section.topics.map((topic) => (
                      <li key={topic.id} className="text-sm text-slate-700">
                        <span className="font-semibold">{topic.title}</span>
                        {" — "}
                        {topic.description}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-semibold text-indigo-700">
                    Przejdź do działu w katalogu
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900">
          Rekomendowane symulacje dla {grade.name.toLowerCase()}
        </h2>
        <p className="mt-2 text-slate-600">
          Pokazujemy kilka najważniejszych pozycji. Pełną listę znajdziesz przez filtr klasy.
        </p>
        <div className="mt-4">
          <SimulationGrid
            items={visibleSimulations}
            emptyMessage="Dla tej klasy nie ma jeszcze przypisanych symulacji."
          />
        </div>
      </section>
    </PageShell>
  );
}
