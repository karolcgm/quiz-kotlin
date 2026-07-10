import Link from "next/link";
import { notFound } from "next/navigation";
import { StartLiveLessonForm } from "@/components/live/StartLiveLessonForm";
import { Card } from "@/components/ui/Card";
import { getLessonPackageById } from "@/data/lessons/registry";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

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
  const { data: classes } = await supabase
    .from("teacher_classes")
    .select("id, name, group_name, schools(name)")
    .eq("teacher_id", teacher.id)
    .returns<ClassRow[]>();

  const classOptions =
    (classes ?? []).map((teacherClass) => ({
      id: teacherClass.id,
      name: teacherClass.name,
      group_name: teacherClass.group_name,
      school_name: teacherClass.schools?.name ?? "Szkoła",
    })) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="space-y-2">
        <Link
          href={`/nauczyciel/lekcje/${lesson.id}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← {lesson.title}
        </Link>
        <h1 className="text-2xl font-bold text-[var(--ink)]">Rozpocznij lekcję na żywo</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Utworzysz sesję w stanie lobby, otworzysz tablicę z kodem QR i poprowadzisz etapy z pulpitu.
        </p>
      </header>

      <StartLiveLessonForm lessonId={lesson.id} classes={classOptions} />

      <Card muted className="text-sm text-slate-600">
        <p className="font-semibold text-slate-800">Przepływ 60 sekund</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Wybierz klasę i kliknij start.</li>
          <li>Otwórz tablicę w nowej karcie — kod dla uczniów.</li>
          <li>Kliknij „Start lekcji”, potem „Dalej” między etapami.</li>
        </ol>
      </Card>
    </div>
  );
}
