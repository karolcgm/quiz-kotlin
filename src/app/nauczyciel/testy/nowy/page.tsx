import { Card } from "@/components/ui/Card";
import { TestComposer } from "@/components/tests/TestComposer";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getLessonPackageById } from "@/data/lessons/registry";

export const dynamic = "force-dynamic";

interface NewTestPageProps {
  searchParams: Promise<{ widget?: string; lessonId?: string; kind?: string }>;
}

type SchoolOption = {
  id: string;
  name: string;
};

export default async function NewTestPage({ searchParams }: NewTestPageProps) {
  await requireRole("teacher");
  const { widget, lessonId, kind } = await searchParams;
  const lesson = lessonId ? getLessonPackageById(lessonId) : undefined;
  const lessonWidget: Record<string, string> = {
    "M5-1.1": "porownywanie-liczb-waga",
    "M5-1.2": "os-liczbowa",
    "M5-1.3": "jednostki-dlugosci",
    "M5-1.4": "os-liczbowa",
  };
  const initialWidget = widget ?? (lesson ? lessonWidget[lesson.topicId] : undefined);
  const supabase = await createClient();
  const { data } = await supabase.from("schools").select("id, name").returns<SchoolOption[]>();
  const schools = data ?? [];

  return (
    <>
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

      <TestComposer schools={schools} initialWidget={initialWidget} initialTitle={lesson ? `Domowa misja: ${lesson.title}` : undefined} homeworkMode={kind === "homework"} />
    </>
  );
}
