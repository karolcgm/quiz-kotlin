import Link from "next/link";
import type { GradeBand } from "@/lib/routes";

const bands: { id: GradeBand; label: string; description: string }[] = [
  { id: "1-3", label: "Klasa 1–3", description: "Podstawy i wizualizacje" },
  { id: "4-6", label: "Klasa 4–6", description: "Ułamki, geometria, działania" },
  { id: "7-8", label: "Klasa 7–8", description: "Algebra i zaawansowane tematy" },
  { id: "egzamin", label: "Egzamin ósmoklasisty", description: "Typowe zadania egzaminacyjne" },
  { id: "demo", label: "Szybkie demo", description: "Gotowe na tablicę w 30 sekund" },
];

interface GradeBandTabsProps {
  selectedBand?: GradeBand;
}

export function GradeBandTabs({ selectedBand }: GradeBandTabsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {bands.map((band) => {
        const active = selectedBand === band.id;
        const href = active ? "/symulacje" : `/symulacje?band=${band.id}`;

        return (
          <Link
            key={band.id}
            href={href}
            className={`rounded-2xl border p-4 transition ${
              active
                ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                : "border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:bg-indigo-50"
            }`}
          >
            <p className="font-bold">{band.label}</p>
            <p className={`mt-1 text-sm ${active ? "text-indigo-100" : "text-slate-600"}`}>
              {band.description}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
