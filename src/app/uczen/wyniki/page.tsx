import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { gradeEmoji } from "@/lib/grading/celebration";

export const dynamic = "force-dynamic";

type SubmissionRow = {
  id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  submitted_at: string | null;
  assignments: { title: string } | null;
  submission_scores: { mark_1_6: number; retake_allowed: boolean } | null;
};

type LiveGradeRow = {
  id: string;
  session_id: string;
  lesson_title: string;
  section_id: string | null;
  total_score: number;
  max_score: number;
  percentage: number;
  descriptive_feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
};

function formatSubmittedAt(value: string | null): string {
  if (!value) {
    return "Data niedostępna";
  }

  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function StudentResultsPage() {
  await requireRole("student");
  const supabase = await createClient();
  const [{ data }, { data: liveGradeData }] = await Promise.all([
    supabase.from("submissions")
      .select("id, total_score, max_score, percentage, submitted_at, assignments(title), submission_scores(mark_1_6, retake_allowed)")
      .order("submitted_at", { ascending: false })
      .returns<SubmissionRow[]>(),
    supabase.from("lesson_session_grades")
      .select("id, session_id, lesson_title, section_id, total_score, max_score, percentage, descriptive_feedback, strengths, improvements, created_at")
      .order("created_at", { ascending: false })
      .returns<LiveGradeRow[]>(),
  ]);
  const submissions = data ?? [];
  const liveGrades = liveGradeData ?? [];

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Moje wyniki</h1>
      <p className="mt-3 text-slate-600">
        Zaliczone testy, ocena 1-6, opis mocnych stron i możliwość poproszenia o poprawę.
      </p>
      <div className="mt-6 space-y-3">
        {submissions.length === 0 && liveGrades.length === 0 && <p className="text-slate-600">Nie masz jeszcze wyników.</p>}
        {liveGrades.map((grade) => (
          <article key={grade.id} className="rounded-xl border-2 border-violet-100 bg-violet-50/40 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-bold text-slate-950">{grade.lesson_title}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-violet-700">Ocena opisowa · {grade.section_id ?? "dział"}</p></div>
              <span className="rounded-full bg-violet-700 px-3 py-1 font-black text-white">{grade.percentage}%</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">Punkty: {grade.total_score}/{grade.max_score}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{grade.descriptive_feedback}</p>
            {grade.improvements.length > 0 ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950"><strong>Do poprawy:</strong> {grade.improvements.join(", ")}</p> : null}
          </article>
        ))}
        {submissions.map((submission) => (
          <Link
            key={submission.id}
            href={`/uczen/wyniki/${submission.id}`}
            className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-900">
                  {submission.assignments?.title ?? "Test bez nazwy"}{" "}
                  {submission.submission_scores && (
                    <span aria-hidden="true">
                      {gradeEmoji(
                        submission.submission_scores.mark_1_6,
                        submission.percentage,
                      )}
                    </span>
                  )}
                </span>
                <p className="mt-1 text-sm text-slate-500">
                  Oddano: {formatSubmittedAt(submission.submitted_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {submission.submission_scores?.retake_allowed && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    Poprawa
                  </span>
                )}
                <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-800">
                  {submission.percentage}%
                </span>
              </div>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Punkty: {submission.total_score}/{submission.max_score}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
