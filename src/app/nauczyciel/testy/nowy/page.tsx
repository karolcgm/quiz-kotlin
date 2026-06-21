import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import { TestComposer } from "@/components/tests/TestComposer";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface NewTestPageProps {
  searchParams: Promise<{ widget?: string }>;
}

type SchoolOption = {
  id: string;
  name: string;
};

export default async function NewTestPage({ searchParams }: NewTestPageProps) {
  await requireRole("teacher");
  const { widget } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("id, name").returns<SchoolOption[]>();
  const schools = data ?? [];

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">Nowy test</h1>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">
          Composer buduje test z gotowych widgetów symulacji. Na start obsługuje pytania z osi
          liczbowej.
        </p>
      </div>

      {schools.length === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <h2 className="text-xl font-bold text-amber-900">Brak szkoły w profilu nauczyciela</h2>
          <p className="mt-2 text-amber-800">
            Test musi być przypisany do konkretnej szkoły, aby uczniowie z różnych szkół się nie
            mieszali. Dodaj szkołę w panelu uczniów lub przez Supabase, zanim zapiszesz test.
          </p>
        </Card>
      )}

      <TestComposer schools={schools} initialWidget={widget} />
    </PageShell>
  );
}
