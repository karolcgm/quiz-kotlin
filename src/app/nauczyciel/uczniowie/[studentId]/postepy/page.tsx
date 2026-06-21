import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { SkillProgressPanel } from "@/components/grading/SkillProgressPanel";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { aggregateProgress } from "@/lib/grading/progress";

export const dynamic = "force-dynamic";

interface TeacherStudentProgressPageProps {
  params: Promise<{ studentId: string }>;
}

type ProfileRow = {
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
};

type SubmissionRow = {
  id: string;
};

type AnswerRow = {
  skill: string;
  score: number;
  max_score: number;
};

export default async function TeacherStudentProgressPage({ params }: TeacherStudentProgressPageProps) {
  await requireRole("teacher");
  const { studentId } = await params;
  const supabase = await createClient();

  const [{ data: canView }, { data: studentsRaw }] = await Promise.all([
    supabase.rpc("teacher_can_view_student", { target_student_id: studentId }),
    supabase.rpc("list_teacher_students"),
  ]);

  if (!canView) {
    notFound();
  }

  type StudentListRow = {
    student_id: string;
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    email: string | null;
  };

  const students = Array.isArray(studentsRaw) ? studentsRaw : [];
  const member = students.find((row) => row.student_id === studentId) as StudentListRow | undefined;
  const profile: ProfileRow | null = member
    ? {
        first_name: member.first_name,
        last_name: member.last_name,
        display_name: member.display_name,
        email: member.email,
      }
    : null;

  if (!profile) {
    notFound();
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id")
    .eq("student_id", studentId)
    .returns<SubmissionRow[]>();
  const submissionIds = (submissions ?? []).map((submission) => submission.id);

  const [{ data: classworkAnswers }, { data: practiceAttempts }] = await Promise.all([
    submissionIds.length > 0
      ? supabase
          .from("submission_answers")
          .select("skill, score, max_score")
          .in("submission_id", submissionIds)
          .returns<AnswerRow[]>()
      : Promise.resolve({ data: [] as AnswerRow[] }),
    supabase.from("practice_attempts").select("id").eq("student_id", studentId).returns<SubmissionRow[]>(),
  ]);
  const practiceIds = (practiceAttempts ?? []).map((attempt) => attempt.id);
  const { data: practiceAnswers } =
    practiceIds.length > 0
      ? await supabase
          .from("practice_answers")
          .select("skill, score, max_score")
          .in("practice_attempt_id", practiceIds)
          .returns<AnswerRow[]>()
      : { data: [] as AnswerRow[] };

  const studentName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.display_name ||
    profile.email ||
    "Uczeń";
  const progress = aggregateProgress([
    ...(classworkAnswers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
    ...(practiceAnswers ?? []).map((answer) => ({ ...answer, source: "practice" as const })),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Statystyki ucznia</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{studentName}</h1>
          <p className="mt-3 text-slate-600">
            Widok łączy wyniki klasówek przypisanych przez nauczyciela z szybkimi testami ucznia.
          </p>
        </Card>
        <SkillProgressPanel
          title="Postępy ucznia"
          description="Podgląd pomaga dobrać kolejne zadania i zdecydować, które obszary wymagają powtórki."
          progress={progress}
        />
    </div>
  );
}
