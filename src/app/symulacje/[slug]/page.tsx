import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { PageShell } from "@/components/layout/PageShell";
import { NumberLinePremiumSimulator } from "@/components/simulations/premium/NumberLinePremiumSimulator";
import { BalanceScalePremiumSimulator } from "@/components/simulations/premium/BalanceScalePremiumSimulator";
import { GeometryMemorySimulator } from "@/components/simulations/premium/GeometryMemorySimulator";
import { AssessmentWidgetSimulator } from "@/components/simulations/AssessmentWidgetSimulator";
import { isCatalogVisibleSlug } from "@/data/publicSimulations";
import { getSimulationBySlug } from "@/lib/routes";
import { Badge, statusLabel, statusToBadgeVariant } from "@/components/ui/Badge";

interface SimulationPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
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

export default async function SimulationPage({ params, searchParams }: SimulationPageProps) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const simulation = getSimulationBySlug(slug);

  if (!simulation) {
    notFound();
  }

  const isPremium = isCatalogVisibleSlug(slug);
  const initialMode = mode === "task" ? "task" : "demo";

  function renderSimulator() {
    if (slug === "os-liczbowa") return <NumberLinePremiumSimulator />;
    if (slug === "waga") return <BalanceScalePremiumSimulator />;
    if (slug === "memory-figury") return <GeometryMemorySimulator />;
    return <AssessmentWidgetSimulator slug={slug} initialMode={initialMode} />;
  }

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Strona główna", href: "/" },
          { label: "Pomoce na lekcję", href: "/symulacje" },
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

      {isPremium ? renderSimulator() : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="font-bold">Moduł developerski</p>
          <p className="mt-2 text-sm">
            Ta symulacja jest ukryta w katalogu publicznym i służy do dalszego kodowania.
          </p>
          <div className="mt-4">
            <AssessmentWidgetSimulator slug={slug} initialMode={initialMode} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
