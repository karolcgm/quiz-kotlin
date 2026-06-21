import Link from "next/link";
import { ClassStudentPicker } from "@/components/teacher/ClassStudentPicker";
import { PanelFilterBar } from "@/components/teacher/PanelFilterBar";
import {
  ResultsStatsDashboard,
  buildResultsStats,
} from "@/components/teacher/ResultsStatsDashboard";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  buildPanelUrl,
  classDisplayName,
  formatSubmittedAt,
  parseResultsViewFilter,
  studentDisplayName,
} from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

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
};

type SubmissionRow = {
  id: string;
  student_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  submitted_at: string | null;
  attempt_number: number;
  assignments: { title: string } | null;
};

interface TeacherResultsPageProps {
  searchParams: Promise<{ classId?: string; studentId?: string; view?: string }>;
}

export default async function TeacherResultsPage({ searchParams }: TeacherResultsPageProps) {
  await requireRole("teacher");
  const params = await searchParams;
  const selectedClassId = params.classId;
  const selectedStudentId = params.studentId;
  const viewFilter = parseResultsViewFilter(params.view);
  const supabase = await createClient();

  const [{ data: classes }, { data: allStudents }, { data: pendingRequests }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, schools(name)")
      .order("school_grade")
      .order("name")
      .returns<ClassRow[]>(),
    supabase.rpc("list_teacher_students"),
    supabase.from("retake_requests").select("submission_id").eq("status", "pending"),
  ]);

  const classList = classes ?? [];
  const studentRows = (Array.isArray(allStudents) ? allStudents : []) as StudentRow[];
  const pendingSubmissionIds = new Set((pendingRequests ?? []).map((row) => row.submission_id));

  const classOptions = classList.map((classRow) => ({
    id: classRow.id,
    label: classDisplayName(classRow),
  }));

  const studentsInClass = selectedClassId
    ? studentRows.filter((student) => student.class_id === selectedClassId)
    : [];

  const studentOptions = studentsInClass.map((student) => ({
    id: student.student_id,
    label: studentDisplayName({ ...student, fallbackId: student.student_id }),
  }));

  let submissions: SubmissionRow[] = [];
  let statsScopeLabel = "Wybierz klasę, aby zobaczyć statystyki";

  if (selectedClassId) {
    const classStudentIds = studentsInClass.map((student) => student.student_id);
    const scopedStudentIds = selectedStudentId
      ? classStudentIds.filter((id) => id === selectedStudentId)
      : classStudentIds;

    statsScopeLabel = selectedStudentId
      ? studentOptions.find((student) => student.id === selectedStudentId)?.label ?? "Uczeń"
      : classOptions.find((classOption) => classOption.id === selectedClassId)?.label ?? "Klasa";

    if (scopedStudentIds.length > 0) {
      const { data } = await supabase
        .from("submissions")
        .select(
          "id, student_id, total_score, max_score, percentage, submitted_at, attempt_number, assignments(title)",
        )
        .in("student_id", scopedStudentIds)
        .order("submitted_at", { ascending: false })
        .returns<SubmissionRow[]>();

      submissions = (data ?? []).filter((submission) => {
        if (viewFilter === "retake") {
          return pendingSubmissionIds.has(submission.id);
        }

        return true;
      });
    }
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const profilesById = new Map(
    studentsInClass.map((student) => [
      student.student_id,
      studentDisplayName({ ...student, fallbackId: student.student_id }),
    ]),
  );

  let stats = buildResultsStats({
    submissions: submissions.map((row) => ({ id: row.id, percentage: row.percentage })),
    marks: [],
    answers: [],
    pendingRetakeSubmissionIds: pendingSubmissionIds,
  });

  if (submissionIds.length > 0) {
    const [{ data: marks }, { data: answers }] = await Promise.all([
      supabase
        .from("submission_scores")
        .select("submission_id, mark_1_6")
        .in("submission_id", submissionIds),
      supabase
        .from("submission_answers")
        .select("skill, score, max_score, submission_id")
        .in("submission_id", submissionIds),
    ]);

    stats = buildResultsStats({
      submissions: submissions.map((row) => ({ id: row.id, percentage: row.percentage })),
      marks: marks ?? [],
      answers: (answers ?? []).map((row) => ({
        skill: row.skill,
        score: row.score,
        max_score: row.max_score,
      })),
      pendingRetakeSubmissionIds: pendingSubmissionIds,
    });
  }

  const viewOptions = [
    {
      id: "all",
      label: "Wszystkie wyniki",
      href: buildPanelUrl("/nauczyciel/wyniki", {
        classId: selectedClassId,
        studentId: selectedStudentId,
      }),
    },
    {
      id: "retake",
      label: "Prośby o poprawę",
      href: buildPanelUrl("/nauczyciel/wyniki", {
        classId: selectedClassId,
        studentId: selectedStudentId,
        view: "retake",
      }),
      count: stats.pendingRetakes,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Dziennik wyników</h1>
        <p className="mt-3 text-slate-600">
          Wybierz klasę i ucznia. Prośby o poprawę (POPRAW) są na tej samej stronie — użyj filtra
          poniżej.
        </p>
      </Card>

      <ClassStudentPicker
        basePath="/nauczyciel/wyniki"
        classes={classOptions}
        students={studentOptions}
        selectedClassId={selectedClassId}
        selectedStudentId={selectedStudentId}
        extraParams={{ view: viewFilter === "retake" ? "retake" : undefined }}
      />

      {selectedClassId && (
        <>
          <PanelFilterBar
            ariaLabel="Filtr wyników"
            activeId={viewFilter}
            options={viewOptions}
          />

          <ResultsStatsDashboard stats={stats} scopeLabel={statsScopeLabel} />

          <Card>
            <h2 className="text-xl font-bold text-slate-900">
              {viewFilter === "retake" ? "Prośby o poprawę" : "Lista oddanych testów"}
            </h2>
            <div className="mt-4 space-y-3">
              {submissions.length === 0 && (
                <p className="text-slate-600">
                  {viewFilter === "retake"
                    ? "Brak oczekujących próśb o poprawę w tym zakresie."
                    : "Brak oddanych testów w tym zakresie."}
                </p>
              )}
              {submissions.map((submission) => {
                const title = submission.assignments?.title ?? "Test bez nazwy";
                const student =
                  profilesById.get(submission.student_id) ??
                  `Uczeń ${submission.student_id.slice(0, 8)}`;

                return (
                  <Link
                    key={submission.id}
                    href={`/nauczyciel/wyniki/${submission.id}`}
                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{title}</p>
                        <p className="mt-1 text-sm text-slate-600">{student}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Oddano: {formatSubmittedAt(submission.submitted_at)}
                          {submission.attempt_number > 1
                            ? ` · Próba ${submission.attempt_number}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {pendingSubmissionIds.has(submission.id) && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                            Prośba o poprawę
                          </span>
                        )}
                        <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">
                          {submission.percentage}%
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Punkty: {submission.total_score}/{submission.max_score}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {!selectedClassId && (
        <Card className="border-dashed border-slate-300 bg-slate-50">
          <p className="text-slate-600">
            Najpierw wybierz klasę powyżej — potem ucznia i zobacz wyniki ze statystykami.
          </p>
        </Card>
      )}
    </div>
  );
}
