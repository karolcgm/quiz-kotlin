"use client";

import Link from "next/link";
import { useState } from "react";
import { LessonStageRail } from "@/components/lessons/LessonStageRail";
import { TeacherGuidePanel } from "@/components/lessons/TeacherGuidePanel";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { LessonCapabilities } from "@/lib/lessons/capabilities";
import type { LessonPackage } from "@/types/lessonPackage";

interface LessonPackagePlayerProps { lesson: LessonPackage; mode: "play" | "prep"; capabilities: LessonCapabilities; }

/** Przygotowanie nie symuluje drugiej lekcji tablicowej. Jedynym trybem prowadzenia jest Live. */
export function LessonPackagePlayer({ lesson, mode, capabilities }: LessonPackagePlayerProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = lesson.stages[stageIndex]!;
  const liveStages = lesson.stages.filter((item) => item.live?.enabled);
  const liveMinutes = liveStages.reduce((sum, item) => sum + (item.live?.minutes ?? 0), 0);

  if (mode === "play" && lesson.id === "m5-diag-stacje-startowe-v1") {
    const taskCount = liveStages.reduce((sum, item) => sum + item.questions.length, 0);
    return <div className="mx-auto max-w-4xl space-y-5">
      <header className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-cyan-50 p-6 sm:p-9">
        <Badge tone="learn">Lekcja multimedialna · klasa IV</Badge>
        <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl">{lesson.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-700">
          10 stacji i {taskCount} losowanych zadań. Uczniowie odpowiadają na swoich urządzeniach, a nauczyciel widzi ich postęp i wyniki na żywo.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {capabilities.hasLivePilot ? <Link href={`/nauczyciel/lekcje/${lesson.id}/sesja`} className="inline-flex min-h-14 items-center rounded-2xl bg-emerald-600 px-6 text-base font-black text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700">Uruchom lekcję live</Link> : null}
          <Link href={capabilities.hasAssessmentBlueprint ? `/nauczyciel/lekcje/${lesson.id}/generator` : `/nauczyciel/testy/nowy?lessonId=${lesson.id}&kind=homework`} className="inline-flex min-h-14 items-center rounded-2xl bg-fuchsia-600 px-5 text-sm font-black text-white">Zadaj misję domową + punkty</Link>
          <Link href="/nauczyciel/lekcje" className="inline-flex min-h-14 items-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700">Wróć do lekcji</Link>
        </div>
      </header>
      <Card className="grid gap-3 sm:grid-cols-3">
        <div><p className="text-2xl font-black text-indigo-700">10</p><p className="text-sm text-slate-600">stacji zadaniowych</p></div>
        <div><p className="text-2xl font-black text-indigo-700">{taskCount}</p><p className="text-sm text-slate-600">odpowiedzi na ucznia</p></div>
        <div><p className="text-2xl font-black text-indigo-700">{liveMinutes} min</p><p className="text-sm text-slate-600">planowany czas</p></div>
      </Card>
    </div>;
  }

  return <div className="space-y-5">
    <header className="space-y-3"><div className="flex flex-wrap items-center gap-2"><Badge tone="learn">Plan nauczyciela</Badge><Badge tone="brand">{lesson.topicId}</Badge><Badge tone="success">{lesson.estimatedMinutes} min</Badge></div><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><h2 className="text-2xl font-bold text-[var(--ink)]">{lesson.title}</h2><p className="mt-1 max-w-3xl text-sm text-[var(--ink-muted)]">{lesson.studentGoal}</p></div><div className="flex flex-wrap gap-2">{capabilities.hasLivePilot ? <Link href={`/nauczyciel/lekcje/${lesson.id}/sesja`} className="inline-flex min-h-12 items-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700">Uruchom lekcję Live</Link> : null}<Link href={capabilities.hasAssessmentBlueprint ? `/nauczyciel/lekcje/${lesson.id}/generator` : `/nauczyciel/testy/nowy?lessonId=${lesson.id}&kind=homework`} className="inline-flex min-h-12 items-center rounded-xl bg-fuchsia-600 px-4 text-sm font-black text-white">Zadaj domową misję</Link>{capabilities.hasPrintResources ? <Link href={`/nauczyciel/lekcje/${lesson.id}/druk`} className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-800">Materiały drukowane</Link> : null}<Link href="/nauczyciel/lekcje" className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700">← Biblioteka</Link></div></div></header>

    <Card className="border-emerald-200 bg-emerald-50"><p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Jedna lekcja, jeden ekran prowadzący</p><p className="mt-1 text-sm text-emerald-950">Live trwa {liveMinutes || "—"} min i może zostać wyświetlony na ekranie nauczyciela lub tablicy. Nauczyciel sam wybiera: tablety dla uczniów włączone albo tryb „tylko tablica”. Nie ma osobnej lekcji tablicowej.</p></Card>

    {mode === "prep" ? <TeacherGuidePanel lesson={lesson} activeStageId={stage.id} /> : null}
    <LessonStageRail stages={lesson.stages} activeIndex={stageIndex} completedThrough={stageIndex} onSelect={setStageIndex} />
    <Card className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Plan 45 minut · {stage.estimatedMinutes} min</p>{stage.live?.enabled ? <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">Live: {stage.live.minutes} min · {stage.live.kind === "exercise" ? "widget" : "prowadzenie"}</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Praca nauczyciela / podręcznik</span>}</div><h3 className="text-xl font-bold text-slate-900">{stage.title}</h3><p className="text-sm leading-relaxed text-slate-700">{stage.teacherInstruction}</p>{lesson.teacherGuide.stageNotes[stage.id] ? <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{lesson.teacherGuide.stageNotes[stage.id]}</p> : null}</Card>
  </div>;
}
