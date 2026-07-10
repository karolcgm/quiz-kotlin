import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperResultsGrid } from "@/components/assessment/PaperResultsGrid";
import { Card } from "@/components/ui/Card";
import { getBlueprintById } from "@/lib/assessment/registry";
import {
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
} from "@/lib/assessment/generateVersionSnapshot";
import {
  ensureAssessmentVersionForClass,
  loadPaperResults,
} from "@/lib/actions/paperResults";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import type { PaperResultsStudent } from "@/types/paperResults";
import { getLessonPackageById } from "@/data/lessons/registry";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{
    blueprint?: string;
    version?: string;
    classId?: string;
    error?: string;
  }>;
}

type TeacherStudentRow = {
  student_id: string;
  class_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
};

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

function parseVersion(version?: string): AssessmentVersionCode {
  if (version === "B" || version === "C") return version;
  return "A";
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = getLessonPackageById(lessonId);
  return { title: lesson ? `Wyniki papierowe: ${lesson.title}` : "Wyniki papierowe" };
}

export default async function PaperResultsPage({ params, searchParams }: PageProps) {
  const teacher = await requireRole("teacher");
  const { lessonId } = await params;
  const { blueprint: blueprintId, version, classId, error } = await searchParams;

  const lesson = getLessonPackageById(lessonId);
  if (!lesson || lesson.status !== "published") notFound();

  const blueprint = blueprintId ? getBlueprintById(blueprintId) : undefined;
  if (!blueprint || blueprint.lessonPackageId !== lessonId) notFound();

  const versionCode = parseVersion(version);
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("teacher_classes")
    .select("id, name, group_name, schools(name)")
    .eq("teacher_id", teacher.id)
    .returns<ClassRow[]>();

  const classOptions = (classes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    group_name: c.group_name,
    school_name: c.schools?.name ?? "Szkoła",
  }));

  const resolvedClassId = classId && classOptions.some((c) => c.id === classId)
    ? classId
    : classOptions[0]?.id;

  if (!resolvedClassId) {
    return (
      <Card>
        <p className="text-sm text-amber-900">Najpierw utwórz grupę uczniów.</p>
      </Card>
    );
  }

  const ensure = await ensureAssessmentVersionForClass(resolvedClassId, blueprint.id, versionCode);
  if (!ensure.ok || !ensure.assessmentVersionId) {
    return (
      <Card>
        <p className="text-sm text-red-800">{ensure.error ?? "Nie udało się przygotować wersji oceny."}</p>
      </Card>
    );
  }

  const versionSeed = resolveVersionSeed(blueprint, versionCode);
  const bundle = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);

  const slots = bundle.snapshot.items.map((item) => ({
    slotId: item.slotId,
    position: item.position,
    skillId: item.skillId,
    maxScore: item.maxScore,
    label: item.expression,
  }));

  const { data: membersRaw } = await supabase.rpc("list_teacher_students");
  const members = Array.isArray(membersRaw) ? (membersRaw as TeacherStudentRow[]) : [];
  const students: PaperResultsStudent[] = members
    .filter((m) => m.class_id === resolvedClassId)
    .map((m) => ({
      student_id: m.student_id,
      first_name: m.first_name,
      last_name: m.last_name,
      display_name: m.display_name,
      email: m.email,
    }));

  const initialResults = await loadPaperResults(ensure.assessmentVersionId, resolvedClassId);
  const selectedClass = classOptions.find((c) => c.id === resolvedClassId);

  return (
    <div className="space-y-6">
      <Card className="space-y-3">
        <Link
          href={`/nauczyciel/lekcje/${lessonId}/generator?blueprint=${blueprint.id}`}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          ← Generator A/B
        </Link>
        <h1 className="text-2xl font-bold text-[var(--ink)]">Wyniki papierowe</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          {blueprint.title} · wersja {versionCode} · {selectedClass?.school_name} —{" "}
          {selectedClass?.name} / {selectedClass?.group_name}
        </p>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {decodeURIComponent(error)}
          </p>
        ) : null}

        <form method="get" className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="blueprint" value={blueprint.id} />
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Grupa</span>
            <select
              name="classId"
              defaultValue={resolvedClassId}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.school_name} — {c.name} / {c.group_name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Wersja arkusza</span>
            <select
              name="version"
              defaultValue={versionCode}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Pokaż
          </button>
        </form>
      </Card>

      {students.length === 0 ? (
        <Card>
          <p className="text-sm text-amber-900">Brak uczniów w wybranej grupie.</p>
        </Card>
      ) : (
        <PaperResultsGrid
          lessonId={lessonId}
          classId={resolvedClassId}
          assessmentVersionId={ensure.assessmentVersionId}
          versionCode={versionCode}
          maxScore={bundle.snapshot.maxScore}
          slots={slots}
          students={students}
          initialResults={initialResults}
        />
      )}
    </div>
  );
}
