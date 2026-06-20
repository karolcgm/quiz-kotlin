import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
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

  const { data: member } = await supabase
    .from("class_members")
    .select("student_id, profiles(first_name, last_name, display_name, email)")
    .eq("student_id", studentId)
    .limit(1)
    .single<{ student_id: string; profiles: ProfileRow | null }>();

  if (!member) {
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

  const profile = member.profiles;
  const studentName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    profile?.display_name ||
    profile?.email ||
    "Uczeń";
  const progress = aggregateProgress([
    ...(classworkAnswers ?? []).map((answer) => ({ ...answer, source: "classwork" as const })),
    ...(practiceAnswers ?? []).map((answer) => ({ ...answer, source: "practice" as const })),
  ]);

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/nauczyciel", label: "Panel" },
          { href: "/nauczyciel/uczniowie", label: "Uczniowie" },
          { href: "/nauczyciel/wyniki", label: "Wyniki" },
        ]}
      />
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
    </PageShell>
  );
}
