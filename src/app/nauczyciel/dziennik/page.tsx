import Link from "next/link";
import { PanelFilterBar } from "@/components/teacher/PanelFilterBar";
import { Card } from "@/components/ui/Card";
import { saveGradebookNoteAction } from "@/lib/actions/grades";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { kindLabel } from "@/lib/assignments/window";
import { buildPanelUrl, classDisplayName, formatSubmittedAt, studentDisplayName } from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

interface GradebookPageProps {
  searchParams: Promise<{ classId?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

type StudentRow = {
  student_id: string;
  class_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  class_name: string;
  group_name: string;
  school_name: string;
};

export default async function GradebookPage({ searchParams }: GradebookPageProps) {
  const teacher = await requireRole("teacher");
  const { classId } = await searchParams;
  const supabase = await createClient();

  const [{ data: classes }, { data: studentsRaw }, { data: submissions }, { data: notes }] =
    await Promise.all([
      supabase
        .from("teacher_classes")
        .select("id, name, group_name, schools(name)")
        .eq("teacher_id", teacher.id)
        .returns<ClassRow[]>(),
      supabase.rpc("list_teacher_students"),
      supabase
        .from("submissions")
        .select(
          "id, student_id, percentage, submitted_at, reviewed_at, assignments(title, kind), submission_scores(mark_1_6)",
        )
        .in("status", ["submitted", "graded"])
        .order("submitted_at", { ascending: false })
        .limit(300),
      supabase
        .from("gradebook_notes")
        .select("id, student_id, note, updated_at")
        .eq("teacher_id", teacher.id)
        .order("updated_at", { ascending: false }),
    ]);

  const students = (Array.isArray(studentsRaw) ? studentsRaw : []) as StudentRow[];
  const filteredStudents = classId ? students.filter((s) => s.class_id === classId) : students;
  const studentIds = new Set(filteredStudents.map((s) => s.student_id));

  const gradesByStudent = new Map<
    string,
    {
      submissionId: string;
      title: string;
      kind: string;
      mark: number;
      percentage: number;
      submittedAt: string | null;
      reviewed: boolean;
    }[]
  >();

  for (const row of submissions ?? []) {
    if (!studentIds.has(row.student_id)) continue;
    const scores = row.submission_scores as { mark_1_6: number } | { mark_1_6: number }[] | null;
    const mark = Array.isArray(scores) ? scores[0]?.mark_1_6 : scores?.mark_1_6;
    if (mark === undefined) continue;
    const assignmentRaw = row.assignments;
    const assignment = (Array.isArray(assignmentRaw) ? assignmentRaw[0] : assignmentRaw) as
      | { title: string; kind: string }
      | null
      | undefined;
    const list = gradesByStudent.get(row.student_id) ?? [];
    list.push({
      submissionId: row.id,
      title: assignment?.title ?? "Test",
      kind: assignment ? kindLabel(assignment.kind as "classwork" | "homework") : "—",
      mark,
      percentage: row.percentage,
      submittedAt: row.submitted_at,
      reviewed: Boolean(row.reviewed_at),
    });
    gradesByStudent.set(row.student_id, list);
  }

  const notesByStudent = new Map<string, { id: string; note: string; updatedAt: string }[]>();
  for (const note of notes ?? []) {
    if (!studentIds.has(note.student_id)) continue;
    const list = notesByStudent.get(note.student_id) ?? [];
    list.push({ id: note.id, note: note.note, updatedAt: note.updated_at });
    notesByStudent.set(note.student_id, list);
  }

  const classOptions = [
    {
      id: "all",
      label: "Wszystkie klasy",
      href: buildPanelUrl("/nauczyciel/dziennik", { classId: undefined }),
    },
    ...(classes ?? []).map((classRow) => ({
      id: classRow.id,
      label: classDisplayName(classRow),
      href: buildPanelUrl("/nauczyciel/dziennik", { classId: classRow.id }),
    })),
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Elektroniczny dziennik</h1>
        <p className="mt-3 text-slate-600">
          Oceny dodają się automatycznie po oddaniu testu. Kliknij ocenę, aby zobaczyć szczegóły i
          dział. Dodawaj notatki dla uczniów.
        </p>
        <div className="mt-6">
          <PanelFilterBar ariaLabel="Filtr klas dziennika" activeId={classId ?? "all"} options={classOptions} />
        </div>
      </Card>

      <div className="space-y-4">
        {filteredStudents.length === 0 && (
          <Card><p className="text-slate-600">Brak uczniów w tym filtrze.</p></Card>
        )}
        {filteredStudents.map((student) => {
          const name = studentDisplayName({ ...student, fallbackId: student.student_id });
          const grades = gradesByStudent.get(student.student_id) ?? [];
          const studentNotes = notesByStudent.get(student.student_id) ?? [];

          return (
            <Card key={student.student_id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{name}</h2>
                  <p className="text-sm text-slate-600">
                    {student.school_name} · {student.class_name} / {student.group_name}
                  </p>
                </div>
                <Link
                  href={`/nauczyciel/uczniowie/${student.student_id}/postepy`}
                  className="text-sm font-semibold text-indigo-700"
                >
                  Postępy →
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {grades.length === 0 && (
                  <p className="text-sm text-slate-500">Brak ocen.</p>
                )}
                {grades.slice(0, 12).map((grade) => (
                  <Link
                    key={grade.submissionId}
                    href={`/nauczyciel/wyniki/${grade.submissionId}`}
                    className={`rounded-xl border px-3 py-2 text-sm transition hover:border-indigo-300 ${
                      grade.reviewed ? "border-slate-200 bg-white" : "border-amber-300 bg-amber-50"
                    }`}
                    title={grade.title}
                  >
                    <span className="font-bold text-indigo-700">{grade.mark}</span>
                    <span className="ml-2 text-slate-700">{grade.kind}</span>
                    {!grade.reviewed && <span className="ml-1 text-amber-700">· do sprawdzenia</span>}
                  </Link>
                ))}
              </div>

              {studentNotes.length > 0 && (
                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Notatki</p>
                  {studentNotes.slice(0, 3).map((note) => (
                    <p key={note.id} className="text-sm text-slate-700">
                      {note.note}
                      <span className="ml-2 text-xs text-slate-400">
                        {formatSubmittedAt(note.updatedAt)}
                      </span>
                    </p>
                  ))}
                </div>
              )}

              <form action={saveGradebookNoteAction} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input type="hidden" name="studentId" value={student.student_id} />
                <input
                  name="note"
                  required
                  placeholder="Dodaj notatkę dla ucznia…"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
                <button type="submit" className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
                  Zapisz notatkę
                </button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
