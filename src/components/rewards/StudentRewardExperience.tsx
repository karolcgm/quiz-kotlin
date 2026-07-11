"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import {
  getUnseenRewardNotificationsAction,
  markRewardNotificationsSeenAction,
  recordRewardClicksAction,
} from "@/lib/actions/rewards";
import { achievementPresentation, getSticker } from "@/lib/rewards/catalog";
import { createClient } from "@/lib/supabase/client";
import type { RewardNotification } from "@/types/rewards";

export function celebrateCorrectAnswer() {
  window.dispatchEvent(new CustomEvent("lekcjalab:celebrate-correct"));
}

function Confetti() {
  return <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>{Array.from({ length: 32 }, (_, index) => <span key={index} className="reward-confetti absolute -top-8 text-2xl" style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 9) * 80}ms`, animationDuration: `${1.4 + (index % 5) * .18}s` }}>{["★", "✦", "●", "■", "🎉"][index % 5]}</span>)}</div>;
}

function RewardThumbnail({ notification }: { notification: RewardNotification }) {
  if (notification.kind === "sticker") {
    return <div className="mx-auto w-fit"><AnimatedSticker stickerId={Number(notification.reward_key)} size="md" selected /></div>;
  }
  if (notification.kind === "theme") {
    return <div className="mx-auto h-36 w-52 rounded-3xl border-4 border-white bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(/rewards/themes/${notification.reward_key}.jpg)` }} role="img" aria-label={`Miniatura motywu ${notification.title}`} />;
  }
  if (notification.kind === "points") {
    return <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-7xl shadow-2xl ring-4 ring-white" aria-hidden>⭐</div>;
  }
  const achievement = achievementPresentation(notification.reward_key);
  return <div className={`mx-auto grid h-36 w-36 place-items-center rounded-[2.25rem] bg-gradient-to-br ${achievement.color} text-7xl shadow-2xl ring-4 ring-white`} role="img" aria-label={`Odznaka ${achievement.title}`}>{achievement.emoji}</div>;
}

function RewardPopup({ notification, queueLength, onDismiss }: { notification: RewardNotification; queueLength: number; onDismiss: () => void }) {
  const sticker = notification.kind === "sticker" ? getSticker(Number(notification.reward_key)) : null;
  const achievement = notification.kind === "achievement" ? achievementPresentation(notification.reward_key) : null;
  const displayTitle = sticker?.name ?? achievement?.title ?? notification.title;
  const albumHref = sticker ? `/uczen/klaser?collection=${sticker.collectionId}#sticker-${sticker.id}` : "/uczen/klaser";
  return <>
    <Confetti />
    <div className="fixed inset-0 z-[99] bg-slate-950/45 backdrop-blur-sm" aria-hidden />
    <section data-reward-popup className="fixed left-1/2 top-1/2 z-[100] w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 animate-[reward-pop_.35s_ease-out] overflow-hidden rounded-[2.5rem] border-4 border-white bg-slate-950 p-6 text-center text-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="reward-popup-title">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-fuchsia-600/45 via-indigo-500/30 to-cyan-400/30" aria-hidden />
      <button type="button" onClick={onDismiss} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl font-black hover:bg-white/25" aria-label="Zamknij popup nagrody">×</button>
      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">{notification.kind === "sticker" ? "Nowa naklejka!" : "Nowe osiągnięcie!"}</p>
        <div className="mt-5"><RewardThumbnail notification={notification} /></div>
        <h2 id="reward-popup-title" className="mt-5 text-2xl font-black leading-tight sm:text-3xl">{displayTitle}</h2>
        {sticker ? <p className="mt-1 text-xs font-bold uppercase tracking-wide text-fuchsia-300">Kolekcja: {sticker.collectionName}</p> : null}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-200">{notification.message}</p>
        {queueLength > 1 ? <p className="mt-3 text-xs font-bold text-yellow-300">Czekają jeszcze {queueLength - 1} {queueLength === 2 ? "nagroda" : "nagrody"}!</p> : null}
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={onDismiss} className="min-h-12 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 font-black text-slate-950">{queueLength > 1 ? "Pokaż następną →" : "Super!"}</button>
          <Link href={albumHref} onClick={onDismiss} className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white/10 px-5 font-black text-white hover:bg-white/20">Otwórz klaser</Link>
        </div>
      </div>
    </section>
  </>;
}

export function StudentRewardExperience({ studentId, notifications = [] }: { studentId: string; notifications?: RewardNotification[] }) {
  const router = useRouter();
  const [queue, setQueue] = useState<RewardNotification[]>(notifications);
  const [correctVisible, setCorrectVisible] = useState(false);
  const pendingClicks = useRef(0);
  const sending = useRef(false);
  const dismissedIds = useRef(new Set<string>());

  const refreshNotifications = useCallback(async () => {
    const incoming = await getUnseenRewardNotificationsAction();
    if (incoming.length === 0) return;
    setQueue((current) => {
      const known = new Set(current.map((item) => item.id));
      return [...current, ...incoming.filter((item) => !known.has(item.id) && !dismissedIds.current.has(item.id))];
    });
    router.refresh();
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`student-rewards-${studentId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "student_reward_notifications",
        filter: `student_id=eq.${studentId}`,
      }, (payload) => {
        const notification = payload.new as RewardNotification;
        if (!notification.id || dismissedIds.current.has(notification.id)) return;
        setQueue((current) => current.some((item) => item.id === notification.id) ? current : [...current, notification]);
        router.refresh();
      })
      .subscribe();
    // Awaryjne odświeżenie, gdy przeglądarka lub sieć zablokuje Realtime.
    const timer = window.setInterval(() => void refreshNotifications(), 30000);
    const onFocus = () => void refreshNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      void supabase.removeChannel(channel);
    };
  }, [refreshNotifications, router, studentId]);

  useEffect(() => {
    const celebrate = () => {
      setCorrectVisible(true);
      window.setTimeout(() => setCorrectVisible(false), 1800);
      window.setTimeout(() => void refreshNotifications(), 350);
    };
    window.addEventListener("lekcjalab:celebrate-correct", celebrate);
    return () => window.removeEventListener("lekcjalab:celebrate-correct", celebrate);
  }, [refreshNotifications]);

  useEffect(() => {
    const flush = async () => {
      if (sending.current || pendingClicks.current < 10) return;
      sending.current = true;
      const delta = Math.min(25, pendingClicks.current);
      pendingClicks.current -= delta;
      await recordRewardClicksAction(delta);
      sending.current = false;
      await refreshNotifications();
      if (pendingClicks.current >= 10) void flush();
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("button") || event.target.closest("[data-reward-popup]")) return;
      pendingClicks.current += 1;
      if (pendingClicks.current >= 10) void flush();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [refreshNotifications]);

  const dismissCurrent = () => {
    const current = queue[0];
    if (!current) return;
    dismissedIds.current.add(current.id);
    setQueue((items) => items.slice(1));
    void markRewardNotificationsSeenAction([current.id]).then(() => router.refresh());
  };

  if (queue[0]) return <RewardPopup notification={queue[0]} queueLength={queue.length} onDismiss={dismissCurrent} />;
  if (!correctVisible) return null;
  return <><Confetti /><div className="fixed inset-x-3 top-4 z-[100] mx-auto max-w-md animate-[reward-pop_.35s_ease-out] rounded-[2rem] border-4 border-white bg-slate-950 p-5 text-center text-white shadow-2xl" role="status" aria-live="polite"><div className="text-7xl">🎉</div><p className="mt-3 text-2xl font-black">Brawo! Poprawna odpowiedź</p><p className="mt-1 text-sm text-slate-200">Zdobywasz punkty. Naklejkę otrzymasz za 100% całego tematu, 100% pracy domowej albo od nauczyciela.</p></div></>;
}
