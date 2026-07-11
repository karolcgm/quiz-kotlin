import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  canStudentOpenAssignment,
  getAssignmentWindowState,
  kindLabel,
} from "@/lib/assignments/window";
import { gradeEmoji } from "@/lib/grading/celebration";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { AvatarFrame } from "@/components/rewards/AvatarFrame";
import { STICKER_COUNT } from "@/lib/rewards/catalog";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await requireRole("student");
  const supabase = await createClient();
  await supabase.rpc("expire_lesson_sessions");
  const now = new Date();

  const [{ data: assignmentRows }, { data: submissions }, { data: latestGrade }, { data: liveSessions }, { data: rewardProfile }, { count: stickerCount }] = await Promise.all([
    supabase
      .from("assignment_students")
      .select("assignments(id, title, starts_at, due_at, status, kind, max_attempts)")
      .returns<{ assignments: { id: string; title: string; starts_at: string | null; due_at: string | null; status: string; kind: string; max_attempts: number } | null }[]>(),
    supabase
      .from("submissions")
      .select("assignment_id, status")
      .eq("student_id", profile.id),
    supabase
      .from("submissions")
      .select("id, percentage, submitted_at, assignments(title, kind), submission_scores(mark_1_6)")
      .eq("student_id", profile.id)
      .in("status", ["submitted", "graded"])
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.rpc("list_active_student_lesson_sessions"),
    supabase.from("student_reward_profiles").select("total_points, featured_sticker_id, avatar_frame_id").eq("student_id", profile.id).maybeSingle(),
    supabase.from("student_stickers").select("sticker_id", { count: "exact", head: true }).eq("student_id", profile.id).gte("sticker_id", 0).lt("sticker_id", STICKER_COUNT),
  ]);

  const assignments = (assignmentRows ?? [])
    .map((row) => row.assignments)
    .filter((a): a is NonNullable<typeof a> => Boolean(a && a.status === "published"));

  const submissionList = submissions ?? [];
  let activeCount = 0;
  let plannedCount = 0;
  let overdueCount = 0;

  for (const assignment of assignments) {
    const state = getAssignmentWindowState({
      status: assignment.status,
      starts_at: assignment.starts_at,
      due_at: assignment.due_at,
      now,
    });
    const inProgress = submissionList.some(
      (s) => s.assignment_id === assignment.id && s.status === "in_progress",
    );
    const completed = submissionList.some(
      (s) =>
        s.assignment_id === assignment.id &&
        (s.status === "submitted" || s.status === "graded"),
    );

    if (state === "planned") plannedCount += 1;
    if (state === "overdue" && !completed) overdueCount += 1;
    if (canStudentOpenAssignment(state, { inProgress }) && !completed) activeCount += 1;
  }

  const lastGrade = latestGrade as {
    id: string;
    percentage: number;
    submitted_at: string | null;
    assignments: { title: string; kind: string } | null;
    submission_scores: { mark_1_6: number } | null;
  } | null;
  const activeLiveSessions = (Array.isArray(liveSessions) ? liveSessions : []) as {
    session_id: string;
    lesson_title: string;
    topic_id: string | null;
    status: "lobby" | "live" | "paused";
    class_name: string;
    group_name: string;
  }[];

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-6 text-white sm:p-8"><div className="grid items-center gap-6 md:grid-cols-[1fr_300px]"><div>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Panel ucznia</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Cześć, {profile.firstName ?? profile.displayName ?? "uczniu"}</h1>
        <p className="mt-3 max-w-2xl text-emerald-50">Zadania, nagrody, oceny i powtórki — w jednym miejscu.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Link href="/uczen/klaser" className="rounded-full bg-white px-4 py-2 text-sm font-black text-indigo-700">⭐ {Number(rewardProfile?.total_points ?? 0).toLocaleString("pl-PL")} pkt</Link><Link href="/uczen/klaser" className="rounded-full bg-slate-950/30 px-4 py-2 text-sm font-black">🎟️ {stickerCount ?? 0}/{STICKER_COUNT} naklejek</Link></div>
        </div><div className="mx-auto hidden md:block">{rewardProfile?.featured_sticker_id != null ? <AvatarFrame frameId={rewardProfile.avatar_frame_id}><AnimatedSticker stickerId={Number(rewardProfile.featured_sticker_id)} size="xl" selected /></AvatarFrame> : <Link href="/uczen/klaser" className="grid h-[300px] w-[300px] place-items-center rounded-[30%] border-4 border-dashed border-white/50 bg-white/10 p-8 text-center font-black">Tu pojawi się Twoja ulubiona naklejka</Link>}</div></div></section>

      {activeLiveSessions.length > 0 ? (
        <section className="mt-6 space-y-3" aria-labelledby="live-title">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Teraz w klasie</p>
            <h2 id="live-title" className="text-2xl font-bold text-slate-950">Aktywność od nauczyciela</h2>
          </div>
          {activeLiveSessions.map((session) => (
            <Card key={session.session_id} className="border-emerald-200 bg-emerald-50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-emerald-950">{session.lesson_title}</p>
                  <p className="mt-1 text-sm text-emerald-800">{session.class_name} / {session.group_name} · {session.status === "lobby" ? "nauczyciel przygotowuje" : session.status === "paused" ? "chwilowa przerwa" : "trwa teraz"}</p>
                </div>
                <Link href={`/uczen/sesja/${session.session_id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800">
                  Otwórz aktywność
                </Link>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-800">Do zrobienia teraz</p>
          <p className="mt-2 text-4xl font-bold text-emerald-950">{activeCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-emerald-800">
            Aktywne sprawdziany →
          </Link>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <p className="text-sm font-semibold text-indigo-800">Zaplanowane</p>
          <p className="mt-2 text-4xl font-bold text-indigo-950">{plannedCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-indigo-800">
            Zobacz harmonogram →
          </Link>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Zaległe</p>
          <p className="mt-2 text-4xl font-bold text-amber-950">{overdueCount}</p>
          <Link href="/uczen/testy" className="mt-3 inline-block text-sm font-semibold text-amber-900">
            Sprawdź terminy →
          </Link>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-slate-600">Ostatnia ocena</p>
          {lastGrade?.submission_scores ? (
            <>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {lastGrade.submission_scores.mark_1_6}{" "}
                <span aria-hidden="true">
                  {gradeEmoji(lastGrade.submission_scores.mark_1_6, lastGrade.percentage)}
                </span>
              </p>
              <p className="text-sm text-slate-600">
                {lastGrade.assignments?.title ?? "Test"} ·{" "}
                {lastGrade.assignments ? kindLabel(lastGrade.assignments.kind as "classwork" | "homework") : ""}
              </p>
              <Link href={`/uczen/wyniki/${lastGrade.id}`} className="mt-2 inline-block text-sm font-semibold text-indigo-700">
                Szczegóły →
              </Link>
            </>
          ) : (
            <p className="mt-2 text-slate-500">Brak ocen</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-cyan-200 bg-cyan-50">
          <h2 className="text-xl font-bold text-slate-900">Mój plan nauki</h2>
          <p className="mt-2 text-slate-600">Przerobione lekcje, punkty i samodzielne zaliczenia bez sesji Live.</p>
          <Link href="/uczen/plan" className="mt-4 inline-block font-semibold text-cyan-800">Otwórz plan nauki</Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Krótka powtórka</h2>
          <p className="mt-2 text-slate-600">Poćwicz samodzielnie i uzupełnij punkty do puli najlepszego wyniku. Za 100% całego tematu otrzymasz jedną tajemniczą naklejkę.</p>
          <Link href="/uczen/szybki-test" className="mt-4 inline-block font-semibold text-indigo-700">
            Rozpocznij powtórkę
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Moje wyniki</h2>
          <p className="mt-2 text-slate-600">Wszystkie oceny i prośby o poprawę.</p>
          <Link href="/uczen/wyniki" className="mt-4 inline-block font-semibold text-indigo-700">
            Zobacz wyniki
          </Link>
        </Card>
      </div>
    </>
  );
}
