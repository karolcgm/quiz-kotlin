import { HomeGradeGrid } from "@/components/home/HomeGradeGrid";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeSection, HomeSteps } from "@/components/home/HomeSections";
import { PageShell } from "@/components/layout/PageShell";
import { SimulationGrid } from "@/components/navigation/SimulationGrid";
import { getFeaturedSimulations } from "@/lib/routes";

const LESSON_STEPS = [
  "Wejdź w klasę i wybierz temat dopasowany do programu.",
  "Otwórz symulację na pełnym ekranie — tablica lub tablet.",
  "Zmieniaj wartości suwakami i pytaj uczniów o wynik.",
  "Powtarzaj warianty, aż pojęcie stanie się oczywiste.",
];

export default function HomePage() {
  const featuredSimulations = getFeaturedSimulations(3);

  return (
    <PageShell className="home-page pb-12">
      <HomeHero />

      <HomeSection
        title="Klasy 1–8"
        description="Wybierz klasę i przejdź od razu do tematów dopasowanych do poziomu uczniów."
        delay="150ms"
        accent="indigo"
      >
        <HomeGradeGrid />
      </HomeSection>

      <HomeSection
        title="Najważniejsze symulacje"
        description="Gotowe moduły interaktywne — od razu na lekcję, bez przygotowań."
        delay="250ms"
        accent="violet"
      >
        <SimulationGrid items={featuredSimulations} />
      </HomeSection>

      <HomeSection
        title="Jak używać na lekcji?"
        description="Cztery proste kroki — od pokazania pojęcia do sprawdzenia zrozumienia."
        delay="350ms"
        accent="emerald"
      >
        <HomeSteps steps={LESSON_STEPS} />
      </HomeSection>
    </PageShell>
  );
}
