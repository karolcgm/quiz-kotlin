"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface TestTimerProps {
  expiresAt: string | null;
  onExpire: () => void;
}

function formatRemaining(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function TestTimer({ expiresAt, onExpire }: TestTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const expiredRef = useRef(false);

  const handleExpire = useCallback(() => {
    if (!expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [onExpire]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    expiredRef.current = false;

    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemainingSeconds(secondsLeft);
      if (secondsLeft <= 0) {
        handleExpire();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 250);
    return () => window.clearInterval(intervalId);
  }, [expiresAt, handleExpire]);

  if (!expiresAt || remainingSeconds === null) {
    return null;
  }

  const urgent = remainingSeconds <= 60;

  return (
    <div
      className={`rounded-2xl border px-5 py-4 ${
        urgent
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-amber-300 bg-amber-50 text-amber-950"
      }`}
      aria-live="polite"
    >
      <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Pozostały czas</p>
      <p className="mt-1 text-3xl font-black tabular-nums">{formatRemaining(remainingSeconds)}</p>
      {remainingSeconds === 0 && (
        <p className="mt-2 text-sm font-semibold">Czas minął — wysyłam odpowiedzi…</p>
      )}
    </div>
  );
}
