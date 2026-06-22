import type { SupabaseClient } from "@supabase/supabase-js";
import {
  endOfDay,
  getAssignmentWindowState,
  kindLabel,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "@/lib/assignments/window";
import { studentDisplayName } from "@/lib/teacher/panelFilters";

export interface RetakeRequestItem {
  requestId: string;
  submissionId: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  assignmentTitle: string;
  createdAt: string;
}

export interface UnreviewedSubmissionItem {
  submissionId: string;
  studentName: string;
  classLabel: string;
  assignmentTitle: string;
  kind: string;
  mark: number | null;
  percentage: number;
  submittedAt: string | null;
}

export interface AssignmentProgressItem {
  assignmentId: string;
  title: string;
  kind: string;
  classLabel: string;
  startsAt: string | null;
  dueAt: string | null;
  submittedCount: number;
  totalCount: number;
  missingStudents: string[];
}

export interface TeacherDashboardData {
  pendingRetakes: RetakeRequestItem[];
  unreviewedSubmissions: UnreviewedSubmissionItem[];
  todayHomework: AssignmentProgressItem[];
  activeAssignments: AssignmentProgressItem[];
  overdueAssignments: AssignmentProgressItem[];
  activity: {
    weekPercent: number;
    monthPercent: number;
    yearPercent: number;
    submissionsWeek: number;
    submissionsMonth: number;
    submissionsYear: number;
  };
  recentGrades: {
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    kind: string;
    mark: number;
    percentage: number;
  }[];
}

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

function classLabelFromStudent(student: StudentRow): string {
  return `${student.school_name} · ${student.class_name} / ${student.group_name}`;
}

function activityPercent(activeStudents: number, totalStudents: number): number {
  if (totalStudents === 0) {
    return 0;
  }

  return Math.round((activeStudents / totalStudents) * 100);
}

type AssignmentRow = {
  id: string;
  title: string;
  kind: string;
  starts_at: string | null;
  due_at: string | null;
  status: string;
  class_id: string | null;
  teacher_classes: {
    name: string;
    group_name: string;
    schools: { name: string } | null;
  } | null;
};

export async function loadTeacherDashboardData(
  supabase: SupabaseClient,
): Promise<TeacherDashboardData> {
  const now = new Date();
  const weekStart = startOfWeek(now).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const yearStart = startOfYear(now).toISOString();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [
    { data: studentsRaw },
    { data: assignments },
    { data: retakeRows },
    { data: submissions },
    { data: scores },
  ] = await Promise.all([
    supabase.rpc("list_teacher_students"),
    supabase
      .from("assignments")
      .select(
        "id, title, kind, starts_at, due_at, status, class_id, teacher_classes(name, group_name, schools(name))",
      )
      .eq("status", "published")
      .returns<AssignmentRow[]>(),
    supabase
      .from("retake_requests")
      .select("id, submission_id, created_at, submissions(id, student_id, assignments(title))")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    supabase
      .from("submissions")
      .select(
        "id, student_id, assignment_id, percentage, submitted_at, reviewed_at, status, assignments(title, kind, class_id, teacher_classes(name, group_name, schools(name)))",
      )
      .in("status", ["submitted", "graded"])
      .order("submitted_at", { ascending: false })
      .limit(200),
    supabase
      .from("submission_scores")
      .select("submission_id, mark_1_6"),
  ]);

  const students = (Array.isArray(studentsRaw) ? studentsRaw : []) as StudentRow[];
  const studentById = new Map(students.map((student) => [student.student_id, student]));
  const totalStudents = new Set(students.map((student) => student.student_id)).size;
  const scoreBySubmission = new Map((scores ?? []).map((row) => [row.submission_id, row.mark_1_6]));

  const assignmentStudentCounts = new Map<string, { total: number; submitted: Set<string> }>();
  const assignmentIds = (assignments ?? []).map((row) => row.id);

  if (assignmentIds.length > 0) {
    const [{ data: assignmentStudents }, { data: allSubmissions }] = await Promise.all([
      supabase.from("assignment_students").select("assignment_id, student_id").in("assignment_id", assignmentIds),
      supabase
        .from("submissions")
        .select("assignment_id, student_id")
        .in("assignment_id", assignmentIds)
        .in("status", ["submitted", "graded"]),
    ]);

    for (const row of assignmentStudents ?? []) {
      const bucket = assignmentStudentCounts.get(row.assignment_id) ?? {
        total: 0,
        submitted: new Set<string>(),
      };
      bucket.total += 1;
      assignmentStudentCounts.set(row.assignment_id, bucket);
    }

    for (const row of allSubmissions ?? []) {
      const bucket = assignmentStudentCounts.get(row.assignment_id);
      if (bucket) {
        bucket.submitted.add(row.student_id);
      }
    }
  }

  function buildProgressItem(assignment: AssignmentRow): AssignmentProgressItem {
    const bucket = assignmentStudentCounts.get(assignment.id) ?? { total: 0, submitted: new Set<string>() };
    const classStudents = students.filter((student) => student.class_id === assignment.class_id);
    const missingStudents = classStudents
      .filter((student) => !bucket.submitted.has(student.student_id))
      .map((student) =>
        studentDisplayName({ ...student, fallbackId: student.student_id }),
      )
      .slice(0, 5);

    const tc = assignment.teacher_classes;
    const classLabel = tc
      ? `${tc.schools?.name ?? "Szkoła"} · ${tc.name} / ${tc.group_name}`
      : "Grupa";

    return {
      assignmentId: assignment.id,
      title: assignment.title,
      kind: kindLabel(assignment.kind as "classwork" | "homework"),
      classLabel,
      startsAt: assignment.starts_at,
      dueAt: assignment.due_at,
      submittedCount: bucket.submitted.size,
      totalCount: bucket.total,
      missingStudents,
    };
  }

  const publishedAssignments = assignments ?? [];

  const todayHomework = publishedAssignments
    .filter(
      (assignment) =>
        assignment.kind === "homework" &&
        assignment.due_at &&
        assignment.due_at >= todayStart &&
        assignment.due_at < todayEnd,
    )
    .map(buildProgressItem);

  const activeAssignments = publishedAssignments
    .filter(
      (assignment) =>
        getAssignmentWindowState({
          status: assignment.status,
          starts_at: assignment.starts_at,
          due_at: assignment.due_at,
          now,
        }) === "active",
    )
    .map(buildProgressItem)
    .slice(0, 6);

  const overdueAssignments = publishedAssignments
    .filter(
      (assignment) =>
        getAssignmentWindowState({
          status: assignment.status,
          starts_at: assignment.starts_at,
          due_at: assignment.due_at,
          now,
        }) === "overdue",
    )
    .map(buildProgressItem)
    .slice(0, 6);

  const pendingRetakes: RetakeRequestItem[] = (retakeRows ?? [])
    .map((row) => {
      const submissionRaw = row.submissions as
        | { id: string; student_id: string; assignments: { title: string } | { title: string }[] | null }
        | { id: string; student_id: string; assignments: { title: string } | { title: string }[] | null }[]
        | null;
      const submission = Array.isArray(submissionRaw) ? submissionRaw[0] : submissionRaw;
      if (!submission) return null;
      const assignmentRaw = submission.assignments;
      const assignmentTitle = Array.isArray(assignmentRaw)
        ? assignmentRaw[0]?.title
        : assignmentRaw?.title;
      const student = studentById.get(submission.student_id);
      return {
        requestId: row.id,
        submissionId: submission.id,
        studentId: submission.student_id,
        studentName: student
          ? studentDisplayName({ ...student, fallbackId: student.student_id })
          : "Uczeń",
        classLabel: student ? classLabelFromStudent(student) : "—",
        assignmentTitle: assignmentTitle ?? "Test",
        createdAt: row.created_at,
      };
    })
    .filter((row): row is RetakeRequestItem => row !== null);

  const unreviewedSubmissions: UnreviewedSubmissionItem[] = (submissions ?? [])
    .filter((row) => !row.reviewed_at)
    .slice(0, 8)
    .map((row) => {
      const student = studentById.get(row.student_id);
      const assignmentRaw = row.assignments;
      const assignment = (Array.isArray(assignmentRaw) ? assignmentRaw[0] : assignmentRaw) as unknown as {
        title: string;
        kind: string;
        teacher_classes: {
          name: string;
          group_name: string;
          schools: { name: string } | null;
        } | null;
      } | null;
      const tc = assignment?.teacher_classes;

      return {
        submissionId: row.id,
        studentName: student
          ? studentDisplayName({ ...student, fallbackId: student.student_id })
          : "Uczeń",
        classLabel: student ? classLabelFromStudent(student) : "—",
        assignmentTitle: assignment?.title ?? "Test",
        kind: assignment ? kindLabel(assignment.kind as "classwork" | "homework") : "—",
        mark: scoreBySubmission.get(row.id) ?? null,
        percentage: row.percentage,
        submittedAt: row.submitted_at,
      };
    });

  const submissionRows = submissions ?? [];
  const activeWeek = new Set(
    submissionRows
      .filter((row) => row.submitted_at && row.submitted_at >= weekStart)
      .map((row) => row.student_id),
  ).size;
  const activeMonth = new Set(
    submissionRows
      .filter((row) => row.submitted_at && row.submitted_at >= monthStart)
      .map((row) => row.student_id),
  ).size;
  const activeYear = new Set(
    submissionRows
      .filter((row) => row.submitted_at && row.submitted_at >= yearStart)
      .map((row) => row.student_id),
  ).size;

  const recentGrades = submissionRows
    .filter((row) => scoreBySubmission.has(row.id))
    .slice(0, 6)
    .map((row) => {
      const student = studentById.get(row.student_id);
      const assignmentRaw = row.assignments;
      const assignment = (Array.isArray(assignmentRaw) ? assignmentRaw[0] : assignmentRaw) as {
        title: string;
        kind: string;
      } | null;

      return {
        submissionId: row.id,
        studentName: student
          ? studentDisplayName({ ...student, fallbackId: student.student_id })
          : "Uczeń",
        assignmentTitle: assignment?.title ?? "Test",
        kind: assignment ? kindLabel(assignment.kind as "classwork" | "homework") : "—",
        mark: scoreBySubmission.get(row.id) ?? 0,
        percentage: row.percentage,
      };
    });

  return {
    pendingRetakes,
    unreviewedSubmissions,
    todayHomework,
    activeAssignments,
    overdueAssignments,
    activity: {
      weekPercent: activityPercent(activeWeek, totalStudents),
      monthPercent: activityPercent(activeMonth, totalStudents),
      yearPercent: activityPercent(activeYear, totalStudents),
      submissionsWeek: submissionRows.filter((row) => row.submitted_at && row.submitted_at >= weekStart)
        .length,
      submissionsMonth: submissionRows.filter((row) => row.submitted_at && row.submitted_at >= monthStart)
        .length,
      submissionsYear: submissionRows.filter((row) => row.submitted_at && row.submitted_at >= yearStart)
        .length,
    },
    recentGrades,
  };
}
