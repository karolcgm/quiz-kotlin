import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { GradeBandTabs } from "@/components/navigation/GradeBandTabs";
import { SimulationFilters } from "@/components/navigation/SimulationFilters";
import { SimulationGrid } from "@/components/navigation/SimulationGrid";
import { PageShell } from "@/components/layout/PageShell";
import { filterSimulations, isValidGrade, type GradeBand } from "@/lib/routes";
import type { GradeLevel } from "@/types/curriculum";
import type { SimulationStatus, SimulationVisualKind } from "@/types/simulation";

export const metadata: Metadata = {
  title: "Pomoce na lekcję",
  description: "Interaktywne symulacje matematyczne do pracy na tablicy — LekcjaLab.",
};

interface SimulationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const statuses: SimulationStatus[] = ["planned", "mvp", "ready"];
const visualKinds: SimulationVisualKind[] = [
  "number-line",
  "fraction",
  "geometry",
  "measurement",
  "chart",
  "algebra",
  "game",
];
const gradeBands: GradeBand[] = ["1-3", "4-6", "7-8", "egzamin", "demo"];

function getSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseGrade(value: string | undefined): GradeLevel | undefined {
  const grade = Number(value);
  return isValidGrade(grade) ? grade : undefined;
}

function parseGradeBand(value: string | undefined): GradeBand | undefined {
  return gradeBands.includes(value as GradeBand) ? (value as GradeBand) : undefined;
}

function parseStatus(value: string | undefined): SimulationStatus | undefined {
  return statuses.includes(value as SimulationStatus) ? (value as SimulationStatus) : undefined;
}

function parseVisualKind(value: string | undefined): SimulationVisualKind | undefined {
  return visualKinds.includes(value as SimulationVisualKind)
    ? (value as SimulationVisualKind)
    : undefined;
}

export default async function SimulationsPage({ searchParams }: SimulationsPageProps) {
  const params = await searchParams;
  const selectedGradeBand = parseGradeBand(getSingleParam(params.band));
  const selectedGrade = parseGrade(getSingleParam(params.grade));
  const selectedStatus = parseStatus(getSingleParam(params.status));
  const selectedVisualKind = parseVisualKind(getSingleParam(params.visualKind));
  const selectedSectionId = getSingleParam(params.section);
  const query = getSingleParam(params.q)?.trim();
  const filteredSimulations = filterSimulations({
    gradeBand: selectedGradeBand,
    grade: selectedGrade,
    sectionId: selectedSectionId,
    status: selectedStatus,
    visualKind: selectedVisualKind,
    query,
  });

  return (
    <PageShell>
      <Breadcrumbs
        items={[{ label: "Strona główna", href: "/" }, { label: "Pomoce na lekcję" }]}
      />
      <h1 className="text-4xl font-bold text-slate-900">Pomoce na lekcję</h1>
      <p className="mt-3 max-w-3xl text-lg text-slate-600">
        LekcjaLab — matematyka, którą widać. Najpierw pokaż symulację na tablicy, potem zadaj
        pytanie, utwórz ćwiczenie albo dodaj widget do testu.
      </p>

      <div className="mt-8">
        <GradeBandTabs selectedBand={selectedGradeBand} />
      </div>

      <div className="mt-8">
        <SimulationFilters
          selectedGrade={selectedGrade}
          selectedSectionId={selectedSectionId}
          selectedStatus={selectedStatus}
          selectedVisualKind={selectedVisualKind}
          query={query}
          selectedBand={selectedGradeBand}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold text-slate-800">
          Wyniki: {filteredSimulations.length}
        </p>
        <p className="text-sm text-slate-600">
          Symulacja → pytanie → test → przypisanie → wynik → poprawa
        </p>
      </div>

      <div className="mt-8">
        <SimulationGrid items={filteredSimulations} />
      </div>
    </PageShell>
  );
}
