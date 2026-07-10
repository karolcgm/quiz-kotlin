import Link from "next/link";
import { HomeGradeGrid } from "@/components/home/HomeGradeGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSection, HomeSteps } from "@/components/home/HomeSections";
import { PageShell } from "@/components/layout/PageShell";
import { SimulationGrid } from "@/components/navigation/SimulationGrid";
import { Card } from "@/components/ui/Card";
import { getFeaturedSimulations } from "@/lib/routes";

const LESSON_STEPS = [
  "Wejdź w program klasy V i wybierz dział z planu.",
  "Otwórz gotowy pakiet lekcji — tablica, tablet lub kartę papierową.",
  "Prowadź krok po kroku; uczniowie widzą jedno polecenie naraz.",
  "Wyślij pracę lub wydrukuj sprawdzian A/B — wyniki w jednym miejscu.",
];

export default function HomePage() {
  const featuredSimulations = getFeaturedSimulations(3);

  return (
    <PageShell className="home-page pb-12">
      <HomeHero />

      <HomeSection
        title="Matematyka — klasa V"
        description="Pełny plan roku szkolnego 2026/2027: 8 działów, tematy z rdzeniem lekcji interaktywnej i materiałem papierowym."
        delay="120ms"
        accent="indigo"
      >
        <Link href="/program/klasa-5" className="block">
          <Card className="transition hover:border-[var(--brand-600)] hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-600)]">
              Nowe centrum prowadzenia lekcji
            </p>
            <h3 className="mt-2 text-xl font-bold text-[var(--ink)]">
              Program klasy V — od działu do tematu
            </h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Publiczny podgląd planu. Po zalogowaniu: lekcje, prace, postępy klasy.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-600)]">
              Zobacz mapę programu →
            </span>
          </Card>
        </Link>
      </HomeSection>

      <HomeSection
        title="Klasy 1–8"
        description="Katalog tematów i symulacji demonstracyjnych dla innych klas."
        delay="180ms"
        accent="violet"
      >
        <HomeGradeGrid />
      </HomeSection>

      <HomeSection
        title="Symulacje demonstracyjne"
        description="Publiczny katalog — interaktywne modele do pokazu na tablicy (bez konta)."
        delay="250ms"
        accent="emerald"
      >
        <SimulationGrid items={featuredSimulations} />
      </HomeSection>

      <HomeSection
        title="Lekcja w 60 sekund"
        description="Docelowy przepływ LekcjaLab 5 — od planu do wyniku."
        delay="350ms"
        accent="indigo"
      >
        <HomeSteps steps={LESSON_STEPS} />
      </HomeSection>
    </PageShell>
  );
}
