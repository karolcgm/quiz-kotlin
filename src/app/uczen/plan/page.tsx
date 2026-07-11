import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getStudentLearningPlan, startStudentLessonReviewAction } from "@/lib/actions/studentLearningPlan";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function StudentLearningPlanPage() {
  await requireRole("student");
  const lessons = await getStudentLearningPlan();
  const earned = lessons.reduce((sum, lesson) => sum + lesson.score, 0);
  const available = lessons.reduce((sum, lesson) => sum + lesson.maxScore, 0);
  const grouped = lessons.reduce((map, lesson) => {
    const key = lesson.sectionId || "Inne";
    map.set(key, [...(map.get(key) ?? []), lesson]);
    return map;
  }, new Map<string, typeof lessons>());

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
    <main className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-cyan-500 via-indigo-600 to-fuchsia-600 p-6 text-white sm:p-9"><p className="text-sm font-black uppercase tracking-[.2em] text-cyan-100">Mój plan edukacyjny</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Lekcje, które już znam</h1><p className="mt-3 max-w-2xl text-indigo-100">Pojawiają się tutaj tylko tematy zakończone przez nauczyciela w Twojej klasie. Możesz zaliczyć je samodzielnie jeszcze raz — bez sesji Live.</p></section>

      {lessons.length === 0 ? <Card className="py-12 text-center"><div className="text-6xl">📚</div><h2 className="mt-3 text-2xl font-black text-slate-950">Plan czeka na pierwszą lekcję</h2><p className="mt-2 text-slate-600">Gdy nauczyciel zakończy lekcję w Twojej klasie, temat automatycznie pojawi się tutaj.</p></Card> : null}

      {Array.from(grouped.entries()).map(([sectionId, sectionLessons]) => <section key={sectionId} className="space-y-3"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wide text-indigo-600">{sectionId}</p><h2 className="text-2xl font-black text-slate-950">Przerobione tematy</h2></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-700">{sectionLessons.length} {sectionLessons.length === 1 ? "lekcja" : "lekcje"}</span></div>{sectionLessons.map((lesson, index) => { const percent = lesson.maxScore > 0 ? Math.round(lesson.score / lesson.maxScore * 100) : 0; return <Card key={lesson.lessonId} className="overflow-hidden border-indigo-100"><div className="grid gap-4 sm:grid-cols-[70px_1fr_auto] sm:items-center"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-indigo-600 text-3xl font-black text-white">{index + 1}</div><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black uppercase text-indigo-600">{lesson.topicId}</span>{lesson.completedAttempts > 0 ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-800">zaliczono {lesson.completedAttempts}×</span> : null}</div><h3 className="mt-1 text-xl font-black text-slate-950">{lesson.lessonTitle}</h3><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" style={{ width: `${percent}%` }} /></div><p className="mt-1 text-xs font-bold text-slate-500">Najlepszy wynik: {lesson.score}/{lesson.maxScore} pkt</p></div><div>{lesson.inProgressReviewId ? <Link href={`/uczen/plan/powtorka/${lesson.inProgressReviewId}`} className="inline-flex min-h-12 items-center rounded-xl bg-amber-500 px-5 text-sm font-black text-white">Wróć do zaliczenia</Link> : <form action={startStudentLessonReviewAction}><input type="hidden" name="lessonId" value={lesson.lessonId}/><button className="min-h-12 rounded-xl bg-indigo-600 px-5 text-sm font-black text-white">{lesson.completedAttempts > 0 ? "Zalicz ponownie" : "Zalicz"}</button></form>}</div></div></Card>; })}</section>)}
    </main>

    <aside className="lg:sticky lg:top-4 lg:h-fit"><Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl"><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Licznik punktów</p><p className="mt-3 text-5xl font-black tabular-nums">{earned}<span className="text-2xl text-slate-400">/{available}</span></p><p className="mt-2 text-sm text-slate-300">Punkty z przerobionych tematów</p><div className="mt-4 h-4 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500" style={{ width: `${available > 0 ? Math.min(100, earned / available * 100) : 0}%` }} /></div><div className="mt-6 rounded-2xl bg-white/10 p-4"><div className="text-4xl">🎯</div><p className="mt-2 font-black">Twój następny cel</p><p className="mt-1 text-xs text-slate-300">Popraw jeden temat, aby zwiększyć najlepszy wynik i zdobyć bonusowe punkty.</p></div><Link href="/uczen/klaser" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-white text-sm font-black text-indigo-700">Zobacz nagrody</Link></Card></aside>
  </div>;
}
