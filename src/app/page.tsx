import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GradeGrid } from "@/components/navigation/GradeGrid";
import { SimulationGrid } from "@/components/navigation/SimulationGrid";
import { PageShell } from "@/components/layout/PageShell";
import { getFeaturedSimulations } from "@/lib/routes";

export default function HomePage() {
  const featuredSimulations = getFeaturedSimulations(3);

  return (
    <PageShell>
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 px-6 py-12 text-white shadow-lg sm:px-10 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">LekcjaLab</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Matematyka, którą widać
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100 sm:text-xl">
          Pomoce na lekcję dla tablicy i tabletu. Symulacja → pytanie → test → wynik → poprawa.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/symulacje" className="bg-white text-indigo-700 hover:bg-indigo-50">
            Pomoce na lekcję
          </Button>
          <Button href="/klasy" variant="secondary" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            Przeglądaj klasy
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Klasy 1–8</h2>
            <p className="mt-2 text-slate-600">Wybierz klasę, aby zobaczyć dopasowane symulacje.</p>
          </div>
        </div>
        <GradeGrid />
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Najważniejsze symulacje</h2>
          <p className="mt-2 text-slate-600">Gotowe moduły do pracy na lekcji matematyki.</p>
        </div>
        <SimulationGrid items={featuredSimulations} />
      </section>

      <section className="mt-12">
        <Card className="bg-indigo-50/60">
          <h2 className="text-2xl font-bold text-slate-900">Jak używać na lekcji?</h2>
          <ul className="mt-4 space-y-3 text-lg leading-relaxed text-slate-700">
            <li>1. Wejdź w klasę i wybierz temat.</li>
            <li>2. Otwórz symulację na pełnym ekranie przeglądarki.</li>
            <li>3. Ustaw wartości suwakami i pytaj uczniów o wynik.</li>
            <li>4. Powtarzaj przykłady, aż pojęcie stanie się oczywiste.</li>
          </ul>
        </Card>
      </section>
    </PageShell>
  );
}
