"use client";

import { useEffect, useMemo, useState } from "react";
import {
  gradeEmoji,
  gradeEmojiLabel,
  resultCelebrationMessage,
  shouldShowConfetti,
} from "@/lib/grading/celebration";

interface TestResultCelebrationProps {
  mark1To6: number;
  percentage: number;
}

const CONFETTI_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6"];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.8}s`,
        duration: `${2.2 + Math.random() * 1.5}s`,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        rotate: Math.random() * 360,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece absolute top-0 block rounded-sm opacity-90"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.4,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function TestResultCelebration({ mark1To6, percentage }: TestResultCelebrationProps) {
  const [message] = useState(() => resultCelebrationMessage(percentage));
  const emoji = gradeEmoji(mark1To6, percentage);
  const label = gradeEmojiLabel(mark1To6, percentage);
  const showConfetti = shouldShowConfetti(percentage);

  useEffect(() => {
    if (!showConfetti) {
      return;
    }
    document.documentElement.classList.add("celebration-active");
    return () => document.documentElement.classList.remove("celebration-active");
  }, [showConfetti]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 text-center ${
        showConfetti
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-indigo-50"
          : "border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50"
      }`}
    >
      {showConfetti && <ConfettiBurst />}
      <p className="text-6xl" role="img" aria-label={label}>
        {emoji}
      </p>
      <p className="mt-2 text-xl font-bold text-slate-900">{label}</p>
      <p className="mt-3 text-lg leading-relaxed text-slate-700">{message}</p>
      {showConfetti && (
        <p className="mt-2 text-sm font-semibold text-emerald-700">Gratulacje — świetny wynik!</p>
      )}
    </div>
  );
}
