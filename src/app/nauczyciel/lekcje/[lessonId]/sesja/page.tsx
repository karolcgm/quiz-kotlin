import Link from "next/link";
import { notFound } from "next/navigation";
import { StartLiveLessonForm } from "@/components/live/StartLiveLessonForm";
import { Card } from "@/components/ui/Card";
import { getLessonPackageById } from "@/data/lessons/registry";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getTeacherContext } from "@/lib/teacher/context";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Sesja na żywo: ${lesson.title}` : "Sesja na żywo" };
}

export default async function StartLiveLessonPage({ params }: PageProps) {
  const teacher = await requireRole("teacher");
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const supabase = await createClient();
  const context = await getTeacherContext();
  const { data: classes } = await supabase
    .from("teacher_classes")
    .select("id, name, group_name, schools(name)")
    .eq("teacher_id", teacher.id)
    .returns<ClassRow[]>();

  const allClassOptions = (classes ?? []).map((teacherClass) => ({
      id: teacherClass.id,
      name: teacherClass.name,
      group_name: teacherClass.group_name,
      school_name: teacherClass.schools?.name ?? "Szkoła",
    }));
  const lockedClassId = context.selected.mode === "class" ? context.selected.class.id : undefined;
  const classOptions = lockedClassId
    ? allClassOptions.filter((item) => item.id === lockedClassId)
    : allClassOptions;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="space-y-2">
        <Link
          href={`/nauczyciel/lekcje/${lesson.id}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← {lesson.title}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--ink)]">Uruchom aktywność live</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Krótki segment (prezentacja, ćwiczenie lub kartkówka) automatycznie pojawi się na kontach uczniów wybranej klasy.
        </p>
      </header>

      <StartLiveLessonForm lessonId={lesson.id} classes={classOptions} lockedClassId={lockedClassId} />

      <Card muted className="text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Krótka aktywność, nie cała lekcja na ekranie</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>W kontekście klasy kliknij start — uczniowie są przypisani automatycznie.</li>
          <li>Otwórz tablicę; kod QR jest tylko opcją awaryjną.</li>
          <li>Poprowadź 3–20 minut i wróć do podręcznika lub zeszytu.</li>
        </ol>
      </Card>
    </div>
  );
}
