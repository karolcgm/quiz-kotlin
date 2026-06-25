import type { SupabaseClient } from "@supabase/supabase-js";
import { getAssignmentWindowState, kindLabel } from "@/lib/assignments/window";
import { formatSubmittedAt, studentDisplayName } from "@/lib/teacher/panelFilters";

export interface AssignmentStudentStatus {
  studentId: string;
  name: string;
  submitted: boolean;
  submissionId?: string;
  submittedAt?: string | null;
  percentage?: number;
}

export interface AssignmentProgressDetail {
  assignmentId: string;
  title: string;
  kind: string;
  classLabel: string;
  startsAt: string | null;
  dueAt: string | null;
  windowState: ReturnType<typeof getAssignmentWindowState>;
  submitted: AssignmentStudentStatus[];
  pending: AssignmentStudentStatus[];
  submittedCount: number;
  totalCount: number;
}

type StudentRow = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};

type AssignmentRow = {
  id: string;
  title: string;
  kind: string;
  starts_at: string | null;
  due_at: string | null;
  status: string;
  teacher_classes: {
    name: string;
    group_name: string;
    schools: { name: string } | null;
  } | null;
};

export async function loadAssignmentProgressDetail(
  supabase: SupabaseClient,
  assignmentId: string,
): Promise<AssignmentProgressDetail | null> {
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, kind, starts_at, due_at, status, teacher_classes(name, group_name, schools(name))")
    .eq("id", assignmentId)
    .maybeSingle()
    .returns<AssignmentRow>();

  if (!assignment) {
    return null;
  }

  const row = assignment;
  const tc = row.teacher_classes;
  const classLabel = tc
    ? `${tc.schools?.name ?? "Szkoła"} · ${tc.name} / ${tc.group_name}`
    : "Grupa";

  const [{ data: assignedRows }, { data: submissionRows }, { data: studentsRaw }] = await Promise.all([
    supabase.from("assignment_students").select("student_id").eq("assignment_id", assignmentId),
    supabase
      .from("submissions")
      .select("id, student_id, percentage, submitted_at, status, attempt_number")
      .eq("assignment_id", assignmentId)
      .in("status", ["submitted", "graded"])
      .order("attempt_number", { ascending: false }),
    supabase.rpc("list_teacher_students"),
  ]);

  const studentIds = (assignedRows ?? []).map((entry) => entry.student_id);
  const allStudents = (Array.isArray(studentsRaw) ? studentsRaw : []) as StudentRow[];
  const studentById = new Map(allStudents.map((student) => [student.student_id, student]));

  const latestSubmissionByStudent = new Map<
    string,
    { id: string; percentage: number; submitted_at: string | null }
  >();
  for (const submission of submissionRows ?? []) {
    if (!latestSubmissionByStudent.has(submission.student_id)) {
      latestSubmissionByStudent.set(submission.student_id, {
        id: submission.id,
        percentage: submission.percentage,
        submitted_at: submission.submitted_at,
      });
    }
  }

  const submitted: AssignmentStudentStatus[] = [];
  const pending: AssignmentStudentStatus[] = [];

  for (const studentId of studentIds) {
    const profile = studentById.get(studentId);
    const name = profile
      ? studentDisplayName({ ...profile, fallbackId: studentId })
      : `Uczeń ${studentId.slice(0, 8)}`;
    const latest = latestSubmissionByStudent.get(studentId);

    if (latest) {
      submitted.push({
        studentId,
        name,
        submitted: true,
        submissionId: latest.id,
        submittedAt: latest.submitted_at,
        percentage: latest.percentage,
      });
    } else {
      pending.push({
        studentId,
        name,
        submitted: false,
      });
    }
  }

  submitted.sort((left, right) => left.name.localeCompare(right.name, "pl"));
  pending.sort((left, right) => left.name.localeCompare(right.name, "pl"));

  return {
    assignmentId: row.id,
    title: row.title,
    kind: kindLabel(row.kind as "classwork" | "homework"),
    classLabel,
    startsAt: row.starts_at,
    dueAt: row.due_at,
    windowState: getAssignmentWindowState({
      status: row.status,
      starts_at: row.starts_at,
      due_at: row.due_at,
    }),
    submitted,
    pending,
    submittedCount: submitted.length,
    totalCount: studentIds.length,
  };
}

export interface AssignmentProgressSummary {
  assignmentId: string;
  submittedCount: number;
  totalCount: number;
}

export async function loadAssignmentProgressSummaries(
  supabase: SupabaseClient,
  assignmentIds: string[],
): Promise<Map<string, AssignmentProgressSummary>> {
  const result = new Map<string, AssignmentProgressSummary>();

  if (assignmentIds.length === 0) {
    return result;
  }

  const [{ data: assignedRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("assignment_students")
      .select("assignment_id, student_id")
      .in("assignment_id", assignmentIds),
    supabase
      .from("submissions")
      .select("assignment_id, student_id")
      .in("assignment_id", assignmentIds)
      .in("status", ["submitted", "graded"]),
  ]);

  const assignedByAssignment = new Map<string, Set<string>>();
  for (const row of assignedRows ?? []) {
    const bucket = assignedByAssignment.get(row.assignment_id) ?? new Set<string>();
    bucket.add(row.student_id);
    assignedByAssignment.set(row.assignment_id, bucket);
  }

  const submittedByAssignment = new Map<string, Set<string>>();
  for (const row of submissionRows ?? []) {
    const bucket = submittedByAssignment.get(row.assignment_id) ?? new Set<string>();
    bucket.add(row.student_id);
    submittedByAssignment.set(row.assignment_id, bucket);
  }

  for (const assignmentId of assignmentIds) {
    const assigned = assignedByAssignment.get(assignmentId) ?? new Set<string>();
    const submitted = submittedByAssignment.get(assignmentId) ?? new Set<string>();
    let submittedCount = 0;

    for (const studentId of assigned) {
      if (submitted.has(studentId)) {
        submittedCount += 1;
      }
    }

    result.set(assignmentId, {
      assignmentId,
      submittedCount,
      totalCount: assigned.size,
    });
  }

  return result;
}

export function formatAssignmentWindow(detail: AssignmentProgressDetail): string {
  const start = detail.startsAt ? formatSubmittedAt(detail.startsAt) : "bez limitu startu";
  const end = detail.dueAt ? formatSubmittedAt(detail.dueAt) : "bez terminu";
  return `${start} → ${end}`;
}
