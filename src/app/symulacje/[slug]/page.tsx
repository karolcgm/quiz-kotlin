import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageShell } from "@/components/layout/PageShell";
import { NumberLineSimulator } from "@/components/simulations/NumberLineSimulator";
import { AssessmentWidgetSimulator } from "@/components/simulations/AssessmentWidgetSimulator";
import { IMPLEMENTED_SIMULATIONS } from "@/data/simulations";
import { getSimulationBySlug } from "@/lib/routes";
import { Badge, statusLabel, statusToBadgeVariant } from "@/components/ui/Badge";

interface SimulationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SimulationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const simulation = getSimulationBySlug(slug);

  if (!simulation) {
    return { title: "Symulacja nie znaleziona" };
  }

  return {
    title: `${simulation.title} — interaktywna symulacja`,
    description: simulation.shortDescription,
  };
}

export default async function SimulationPage({ params }: SimulationPageProps) {
  const { slug } = await params;
  const simulation = getSimulationBySlug(slug);

  if (!simulation) {
    notFound();
  }

  const isImplemented = IMPLEMENTED_SIMULATIONS.has(slug);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Strona główna", href: "/" },
          { label: "Symulacje", href: "/symulacje" },
          { label: simulation.title },
        ]}
      />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{simulation.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-slate-600">{simulation.shortDescription}</p>
        </div>
        <Badge variant={statusToBadgeVariant(simulation.status)}>
          {statusLabel(simulation.status)}
        </Badge>
      </div>

      {slug === "os-liczbowa" && isImplemented ? (
        <NumberLineSimulator />
      ) : (
        <AssessmentWidgetSimulator slug={slug} />
      )}
    </PageShell>
  );
}
