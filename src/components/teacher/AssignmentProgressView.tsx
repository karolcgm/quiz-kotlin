"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";
import type { AssignmentProgressDetail } from "@/lib/teacher/assignmentProgress";
import type { AssignmentWindowState } from "@/lib/assignments/window";
import { formatSubmittedAt } from "@/lib/teacher/panelFilters";

interface AssignmentProgressViewProps {
  detail: AssignmentProgressDetail;
  windowLabel: string;
  windowFormatted: string;
}

const RING_RADIUS = 58;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const THEME: Record<
  AssignmentWindowState,
  { hero: string; accent: string; glow: string; badge: string }
> = {
  active: {
    hero: "from-indigo-700 via-violet-700 to-cyan-600",
    accent: "text-cyan-300",
    glow: "shadow-indigo-500/40",
    badge: "bg-emerald-400/20 text-emerald-100 border-emerald-300/30",
  },
  planned: {
    hero: "from-indigo-800 via-blue-700 to-violet-600",
    accent: "text-indigo-200",
    glow: "shadow-indigo-500/35",
    badge: "bg-blue-400/20 text-blue-100 border-blue-300/30",
  },
  overdue: {
    hero: "from-rose-700 via-orange-600 to-amber-500",
    accent: "text-amber-200",
    glow: "shadow-orange-500/45",
    badge: "bg-rose-400/20 text-rose-100 border-rose-300/30",
  },
  closed: {
    hero: "from-slate-700 via-slate-800 to-slate-900",
    accent: "text-slate-300",
    glow: "shadow-slate-500/25",
    badge: "bg-slate-400/20 text-slate-200 border-slate-300/30",
  },
};

function studentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function scoreGradient(percentage: number): string {
  if (percentage >= 80) return "from-emerald-400 via-teal-400 to-cyan-400";
  if (percentage >= 50) return "from-amber-400 via-orange-400 to-yellow-400";
  return "from-rose-400 via-red-400 to-orange-400";
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2.5}s`,
        duration: `${3 + Math.random() * 2.5}s`,
        color: ["#6366f1", "#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#fb7185"][index % 6],
        size: 5 + Math.random() * 10,
        rotation: Math.random() * 360,
      })),
    [],
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute top-0 rounded-sm"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 0.55,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function ProgressRing({ percent, accentClass }: { percent: number; accentClass: string }) {
  const targetOffset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  const [strokeOffset, setStrokeOffset] = useState(RING_CIRCUMFERENCE);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setStrokeOffset(targetOffset));
    return () => cancelAnimationFrame(frame);
  }, [targetOffset]);

  return (
    <div className="relative mx-auto size-48 sm:size-56">
      <div className="absolute inset-2 rounded-full bg-white/5 blur-2xl" />
      <div className={`absolute inset-0 rounded-full border border-white/10 ${accentClass}`} />
      <svg className="relative size-full -rotate-90 drop-shadow-lg" viewBox="0 0 128 128" aria-hidden>
        <circle cx="64" cy="64" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          stroke="url(#progressRingGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          className="transition-[stroke-dashoffset] duration-[1600ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
        <defs>
          <linearGradient id="progressRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="40%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="animate-count-pop text-5xl font-black tabular-nums text-white sm:text-6xl">
          <AnimatedCounter value={Math.round(percent)} suffix="%" />
        </span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          frekwencja
        </span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EmptyInboxIllustration() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto h-20 w-32 opacity-80" aria-hidden>
      <rect x="20" y="20" width="80" height="50" rx="8" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="2" />
      <path d="M20 28 L60 52 L100 28" fill="none" stroke="#10b981" strokeWidth="2" />
      <circle cx="60" cy="14" r="6" fill="#6366f1" className="animate-float" />
    </svg>
  );
}

function TrophyIllustration() {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto size-24" aria-hidden>
      <defs>
        <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <path
        d="M30 24h40v20c0 14-8 24-20 24S30 58 30 44V24z"
        fill="url(#trophyGrad)"
        className="animate-float"
      />
      <rect x="38" y="68" width="24" height="8" rx="2" fill="#6366f1" />
      <rect x="32" y="76" width="36" height="6" rx="3" fill="#8b5cf6" />
      <path d="M30 30H18c0 8 4 14 12 16M70 30h12c0 8-4 14-12 16" stroke="#fbbf24" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function AssignmentProgressView({
  detail,
  windowLabel,
  windowFormatted,
}: AssignmentProgressViewProps) {
  const [mounted, setMounted] = useState(false);
  const percent =
    detail.totalCount > 0 ? (detail.submittedCount / detail.totalCount) * 100 : 0;
  const isComplete = detail.totalCount > 0 && detail.submittedCount === detail.totalCount;
  const theme = THEME[detail.windowState];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="assignment-page-bg -mx-4 -mt-2 px-4 pb-8 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="assignment-page-grid" aria-hidden />
      <ConfettiBurst active={mounted && isComplete} />

      {/* Top bar */}
      <header className="assignment-slide-up mb-6 flex flex-wrap items-center justify-between gap-4">
        <LekcjaLabLogo size="md" variant="color" showTagline animated />
        <div className="flex flex-wrap gap-2">
          <Link
            href="/nauczyciel/zadania"
            className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200/80 bg-white/80 px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-sm backdrop-blur-sm transition hover:border-indigo-400 hover:bg-white hover:shadow-md"
          >
            ← Zadania
          </Link>
          <Link
            href="/nauczyciel"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white hover:shadow-md"
          >
            Panel
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className={`assignment-slide-up assignment-hero-glow relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${theme.hero} animate-gradient-shift p-6 text-white sm:p-10 lg:p-12 ${theme.glow}`}
        style={{ animationDelay: "60ms" }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-cyan-400/20 blur-3xl animate-float-delayed" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 grid gap-10 xl:grid-cols-[1fr_auto_280px] xl:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md ${theme.badge}`}
              >
                {windowLabel}
              </span>
              <span className="rounded-full border border-white/20 bg-black/15 px-4 py-1.5 text-xs font-semibold backdrop-blur-md">
                {detail.kind}
              </span>
            </div>

            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.accent}`}>
                Raport oddań
              </p>
              <h1 className="mt-2 text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                {detail.title}
              </h1>
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-white/90 sm:text-lg">{detail.classLabel}</p>
              <p className="flex items-center gap-2 text-sm text-white/65">
                <svg viewBox="0 0 16 16" className="size-4 shrink-0 opacity-70" fill="currentColor" aria-hidden>
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zm-.25 2v3.25l2.5 1.5.75-1.25-1.75-1V4.5H7.75z" />
                </svg>
                {windowFormatted}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="assignment-stat-pop rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Oddali</p>
                <p className="text-3xl font-black text-emerald-300">
                  <AnimatedCounter value={detail.submittedCount} />
                </p>
              </div>
              <div
                className="assignment-stat-pop rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md"
                style={{ animationDelay: "80ms" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Czekają</p>
                <p className="text-3xl font-black text-amber-300">
                  <AnimatedCounter value={detail.pending.length} />
                </p>
              </div>
              <div
                className="assignment-stat-pop rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md"
                style={{ animationDelay: "160ms" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Razem</p>
                <p className="text-3xl font-black">
                  <AnimatedCounter value={detail.totalCount} />
                </p>
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <LekcjaLabLogo size="xl" variant="light" showTagline animated />
          </div>

          <ProgressRing percent={percent} accentClass={theme.accent} />
        </div>

        <div className="relative z-10 mt-10">
          <div className="mb-2.5 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/55">
            <span>Postęp oddań</span>
            <span>
              {detail.submittedCount} / {detail.totalCount}
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-black/25 backdrop-blur-sm">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 transition-all duration-[1600ms] ease-out"
              style={{ width: `${percent}%` }}
            >
              <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Lists */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Submitted */}
        <section
          className="assignment-slide-up assignment-glass overflow-hidden rounded-[1.75rem] p-6 sm:p-7"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/35">
                <CheckIcon />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Oddali</h2>
                <p className="text-sm font-medium text-slate-500">Kliknij kartę, aby zobaczyć wynik</p>
              </div>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-black text-white shadow-lg shadow-emerald-500/30">
              {detail.submitted.length}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {detail.submitted.length === 0 && (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-12 text-center">
                <EmptyInboxIllustration />
                <p className="mt-4 text-lg font-bold text-emerald-900">Jeszcze pusto</p>
                <p className="mt-1 text-sm text-emerald-700">Pierwsze oddania pojawią się tutaj na żywo</p>
              </div>
            )}
            {detail.submitted.map((student, index) => (
              <Link
                key={student.studentId}
                href={`/nauczyciel/wyniki/${student.submissionId}`}
                className="assignment-card-shine assignment-slide-up group flex items-center gap-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-white to-emerald-50/60 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100"
                style={{ animationDelay: `${180 + index * 50}ms` }}
              >
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-md">
                  {studentInitials(student.name)}
                  <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white ring-2 ring-white">
                    ✓
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900 group-hover:text-indigo-700">
                    {student.name}
                  </p>
                  {student.submittedAt && (
                    <p className="text-xs font-medium text-slate-500">
                      {formatSubmittedAt(student.submittedAt)}
                    </p>
                  )}
                </div>
                <div
                  className={`rounded-xl bg-gradient-to-br px-3.5 py-2 text-sm font-black text-white shadow-md ${scoreGradient(student.percentage ?? 0)}`}
                >
                  {student.percentage}%
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Pending */}
        <section
          className="assignment-slide-up assignment-glass overflow-hidden rounded-[1.75rem] p-6 sm:p-7"
          style={{ animationDelay: "180ms" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="animate-pulse-glow flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/35">
                <ClockIcon />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">Nie oddali</h2>
                <p className="text-sm font-medium text-slate-500">Uczniowie bez przesłanej pracy</p>
              </div>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-black text-white shadow-lg shadow-amber-500/30">
              {detail.pending.length}
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            {detail.pending.length === 0 && (
              <div className="rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 px-6 py-12 text-center">
                <TrophyIllustration />
                <p className="mt-4 text-lg font-bold text-indigo-900">Pełna frekwencja!</p>
                <p className="mt-1 text-sm text-indigo-700">Każdy przypisany uczeń oddał pracę</p>
              </div>
            )}
            {detail.pending.map((student, index) => (
              <div
                key={student.studentId}
                className="assignment-slide-up flex items-center gap-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-white to-amber-50/50 p-4"
                style={{ animationDelay: `${220 + index * 50}ms` }}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-black text-slate-600">
                  {studentInitials(student.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-900">{student.name}</p>
                  <p className="text-xs font-medium text-amber-700">Oczekuje na oddanie</p>
                </div>
                <span className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
                  </span>
                  Brak
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Brand footer strip */}
      <footer
        className="assignment-slide-up mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100/80 bg-white/60 px-6 py-4 backdrop-blur-md"
        style={{ animationDelay: "280ms" }}
      >
        <LekcjaLabLogo size="sm" variant="color" animated />
        <p className="text-xs font-medium text-slate-500">
          LekcjaLab · Raport oddań · {detail.title}
        </p>
      </footer>
    </div>
  );
}
