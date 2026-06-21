import Link from "next/link";
import type { Simulation } from "@/types/simulation";
import { Card } from "@/components/ui/Card";
import { Badge, statusLabel, statusToBadgeVariant } from "@/components/ui/Badge";
import { SimulationCardVisual } from "@/components/navigation/SimulationCardVisual";

interface SimulationGridProps {
  items: Simulation[];
  emptyMessage?: string;
}

export function SimulationGrid({
  items,
  emptyMessage = "Brak symulacji dla tego wyboru.",
}: SimulationGridProps) {
  if (items.length === 0) {
    return <p className="text-lg text-slate-600">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((simulation) => (
        <Card
          key={simulation.slug}
          className="flex h-full flex-col gap-4 transition hover:border-indigo-300 hover:shadow-md"
        >
            <SimulationCardVisual kind={simulation.visualKind} />
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-slate-900">{simulation.title}</h3>
              <Badge variant={statusToBadgeVariant(simulation.status)}>
                {statusLabel(simulation.status)}
              </Badge>
            </div>
            <p className="flex-1 text-slate-600">{simulation.shortDescription}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                Klasy: {simulation.grades.join(", ")}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {simulation.interactionKind}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {simulation.difficulty}
              </span>
            </div>
            <p className="mt-2 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
              {simulation.teacherHint}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Link
                href={`/symulacje/${simulation.slug}`}
                className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Pokaż
              </Link>
              <Link
                href={`/symulacje/${simulation.slug}?mode=task`}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
              >
                Zadaj pytanie
              </Link>
              <Link
                href={`/nauczyciel/testy/nowy?widget=${simulation.slug}&purpose=exercise`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Utwórz ćwiczenie
              </Link>
              <Link
                href={`/nauczyciel/testy/nowy?widget=${simulation.slug}`}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
              >
                Dodaj do testu
              </Link>
            </div>
          </Card>
      ))}
    </div>
  );
}
