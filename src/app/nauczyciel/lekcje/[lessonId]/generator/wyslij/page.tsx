import Link from "next/link";
import { notFound } from "next/navigation";
import { SendBlueprintForm } from "@/components/assessment/SendBlueprintForm";
import { Card } from "@/components/ui/Card";
import { getBlueprintById } from "@/lib/assessment/registry";
import {
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
} from "@/lib/assessment/generateVersionSnapshot";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import { getLessonPackageById } from "@/data/lessons/registry";
import type { SendTestStudent } from "@/components/tests/SendTestForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ blueprint?: string; version?: string; error?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

type TeacherStudentRow = {
  student_id: string;
  class_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  class_name: string;
  group_name: string;
  school_name: string;
};

function parseVersion(version?: string): AssessmentVersionCode {
  if (version === "B" || version === "C") return version;
  return "A";
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Wyślij: ${lesson.title}` : "Wyślij pracę" };
}

export default async function SendBlueprintPage({ params, searchParams }: PageProps) {
  const teacher = await requireRole("teacher");
  const { lessonId } = await params;
  const { blueprint: blueprintId, version, error } = await searchParams;
  const lesson = getLessonPackageById(lessonId);

  if (!lesson || lesson.status !== "published") {
    notFound();
  }

  const blueprint = blueprintId ? getBlueprintById(blueprintId) : undefined;
  if (!blueprint || blueprint.lessonPackageId !== lessonId) {
    notFound();
  }

  const versionCode = parseVersion(version);
  const versionSeed = resolveVersionSeed(blueprint, versionCode);
  const bundle = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);

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

  const classIds = classOptions.map((c) => c.id);
  let students: SendTestStudent[] = [];
  let studentsLoadError: string | null = null;

  if (classIds.length > 0) {
    const { data: membersRaw, error: membersError } = await supabase.rpc("list_teacher_students");
    const members = Array.isArray(membersRaw) ? (membersRaw as TeacherStudentRow[]) : [];
    if (membersError) studentsLoadError = membersError.message;

    students = members
      .filter((member) => classIds.includes(member.class_id))
      .map((member) => ({
        student_id: member.student_id,
        first_name: member.first_name,
        last_name: member.last_name,
        display_name: member.display_name,
        email: member.email,
        class_id: member.class_id,
        class_name: member.class_name,
        group_name: member.group_name,
        school_name: member.school_name,
      }));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <Link
          href={`/nauczyciel/lekcje/${lessonId}/generator?blueprint=${blueprint.id}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Generator A/B
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Wyślij pracę z blueprintu</h1>
        <p className="mt-3 text-slate-600">
          <strong>{blueprint.title}</strong> · wersja {versionCode} · {bundle.snapshot.items.length} zadań ·{" "}
          {bundle.snapshot.maxScore} pkt
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
          </div>
        ) : null}

        {studentsLoadError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            Nie udało się wczytać uczniów: {studentsLoadError}
          </div>
        ) : null}

        {classOptions.length === 0 ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-900">
            Najpierw utwórz grupę uczniów w panelu Uczniowie.
          </p>
        ) : (
          <SendBlueprintForm
            lessonId={lessonId}
            blueprintId={blueprint.id}
            blueprintTitle={blueprint.title}
            versionCode={versionCode}
            maxScore={bundle.snapshot.maxScore}
            checksum={bundle.snapshot.checksum}
            classes={classOptions}
            students={students}
          />
        )}
      </Card>
    </div>
  );
}
