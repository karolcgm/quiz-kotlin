import { grades } from "@/data/grades";
import { mathCurriculum } from "@/data/mathCurriculum";
import { Card } from "@/components/ui/Card";
import type { GradeBand } from "@/lib/routes";
import type { GradeLevel } from "@/types/curriculum";
import type { SimulationStatus, SimulationVisualKind } from "@/types/simulation";

interface SimulationFiltersProps {
  selectedGrade?: GradeLevel;
  selectedBand?: GradeBand;
  selectedSectionId?: string;
  selectedStatus?: SimulationStatus;
  selectedVisualKind?: SimulationVisualKind;
  query?: string;
}

const statuses: { value: SimulationStatus; label: string }[] = [
  { value: "ready", label: "Gotowe" },
  { value: "mvp", label: "MVP" },
  { value: "planned", label: "Planowane" },
];

const visualKinds: { value: SimulationVisualKind; label: string }[] = [
  { value: "number-line", label: "Oś liczbowa" },
  { value: "fraction", label: "Ułamki / części" },
  { value: "geometry", label: "Geometria" },
  { value: "measurement", label: "Pomiary" },
  { value: "chart", label: "Wykresy / dane" },
  { value: "algebra", label: "Algebra" },
  { value: "game", label: "Klocki / gra" },
];

export function SimulationFilters({
  selectedGrade,
  selectedBand,
  selectedSectionId,
  selectedStatus,
  selectedVisualKind,
  query,
}: SimulationFiltersProps) {
  const sections = selectedGrade
    ? mathCurriculum.filter((section) => section.grade === selectedGrade)
    : mathCurriculum;

  return (
    <Card className="bg-white/90">
      <form action="/symulacje" className="grid gap-4 lg:grid-cols-[1fr_1.4fr_1fr_1fr]">
        {selectedBand && <input type="hidden" name="band" value={selectedBand} />}
        <div className="space-y-2">
          <label htmlFor="grade" className="text-sm font-semibold text-slate-700">
            Klasa
          </label>
          <select
            id="grade"
            name="grade"
            defaultValue={selectedGrade ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm"
          >
            <option value="">Wszystkie klasy</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="section" className="text-sm font-semibold text-slate-700">
            Dział
          </label>
          <select
            id="section"
            name="section"
            defaultValue={selectedSectionId ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm"
          >
            <option value="">Wszystkie działy</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.grade}. klasa — {section.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={selectedStatus ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm"
          >
            <option value="">Wszystkie</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="visualKind" className="text-sm font-semibold text-slate-700">
            Grafika
          </label>
          <select
            id="visualKind"
            name="visualKind"
            defaultValue={selectedVisualKind ?? ""}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm"
          >
            <option value="">Wszystkie typy</option>
            {visualKinds.map((visualKind) => (
              <option key={visualKind.value} value={visualKind.value}>
                {visualKind.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-3">
          <label htmlFor="q" className="text-sm font-semibold text-slate-700">
            Szukaj po tytule, tagach lub opisie
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query ?? ""}
            placeholder="np. ułamki, kąty, egzamin, oś..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-900 shadow-sm"
          />
        </div>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Filtruj
          </button>
          <a
            href="/symulacje"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Wyczyść
          </a>
        </div>
      </form>
    </Card>
  );
}
