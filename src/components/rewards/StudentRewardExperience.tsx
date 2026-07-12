"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import {
  getUnseenRewardNotificationsAction,
  markRewardNotificationsSeenAction,
  recordRewardClicksAction,
} from "@/lib/actions/rewards";
import { achievementPresentation, getRewardFanfare, getSticker } from "@/lib/rewards/catalog";
import { createClient } from "@/lib/supabase/client";
import type { RewardNotification } from "@/types/rewards";

export function celebrateCorrectAnswer() {
  window.dispatchEvent(new CustomEvent("lekcjalab:celebrate-correct"));
}

function Confetti({ fanfareId }: { fanfareId?: string }) {
  const fanfare = getRewardFanfare(fanfareId);
  return <div className={`pointer-events-none fixed inset-0 z-[90] overflow-hidden fanfare-${fanfare.id}`} aria-hidden>{Array.from({ length: 36 }, (_, index) => <span key={index} className="reward-confetti absolute -top-8 text-2xl" style={{ left: `${(index * 37) % 100}%`, color: fanfare.colors[index % fanfare.colors.length], animationDelay: `${(index % 9) * 80}ms`, animationDuration: `${1.4 + (index % 5) * .18}s` }}>{fanfare.pieces[index % fanfare.pieces.length]}</span>)}</div>;
}

function RewardLayer({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    const updateTarget = () => setTarget(document.fullscreenElement ?? document.body);
    updateTarget();
    document.addEventListener("fullscreenchange", updateTarget);
    return () => document.removeEventListener("fullscreenchange", updateTarget);
  }, []);
  return target ? createPortal(children, target) : null;
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

function RewardPopup({ notification, queueLength, fanfareId, onDismiss }: { notification: RewardNotification; queueLength: number; fanfareId?: string; onDismiss: () => void }) {
  const sticker = notification.kind === "sticker" ? getSticker(Number(notification.reward_key)) : null;
  const achievement = notification.kind === "achievement" ? achievementPresentation(notification.reward_key) : null;
  const displayTitle = sticker?.name ?? achievement?.title ?? notification.title;
  const albumHref = sticker ? `/uczen/klaser?collection=${sticker.collectionId}#sticker-${sticker.id}` : "/uczen/klaser";
  return <RewardLayer><>
    <Confetti fanfareId={fanfareId} />
    <section data-reward-popup className="reward-toast fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] right-3 z-[100] flex w-[min(calc(100vw-1.5rem),440px)] items-center gap-4 overflow-hidden rounded-[1.5rem] border-2 border-white bg-slate-950 p-4 pr-12 text-left text-white shadow-2xl sm:bottom-5 sm:right-5" role="status" aria-live="polite" aria-labelledby="reward-popup-title">
      <button type="button" onClick={onDismiss} className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-black hover:bg-white/25" aria-label="Zamknij powiadomienie o nagrodzie">×</button>
      <div className="hidden w-28 shrink-0 scale-75 sm:block"><RewardThumbnail notification={notification} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">{notification.kind === "sticker" ? "Nowa naklejka!" : "Nowa nagroda!"}</p>
        <h2 id="reward-popup-title" className="mt-1 text-lg font-black leading-tight">{displayTitle}</h2>
        {sticker ? <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-fuchsia-300">{sticker.collectionName}</p> : null}
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-200">{notification.message}</p>
        <Link href={albumHref} onClick={onDismiss} className="mt-2 inline-flex min-h-9 items-center rounded-xl bg-white/10 px-3 text-xs font-black text-white hover:bg-white/20">Zobacz w klaserze</Link>
        {queueLength > 1 ? <span className="ml-2 text-[10px] font-bold text-yellow-300">+{queueLength - 1}</span> : null}
      </div>
    </section>
  </></RewardLayer>;
}

export function StudentRewardExperience({ studentId, notifications = [], fanfareId = "classic" }: { studentId: string; notifications?: RewardNotification[]; fanfareId?: string }) {
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

  const dismissCurrent = useCallback(() => {
    const current = queue[0];
    if (!current) return;
    dismissedIds.current.add(current.id);
    setQueue((items) => items.slice(1));
    void markRewardNotificationsSeenAction([current.id]).then(() => router.refresh());
  }, [queue, router]);

  useEffect(() => {
    if (!queue[0]) return;
    const timer = window.setTimeout(dismissCurrent, 3000);
    return () => window.clearTimeout(timer);
  }, [dismissCurrent, queue]);

  if (queue[0]) return <RewardPopup notification={queue[0]} queueLength={queue.length} fanfareId={fanfareId} onDismiss={dismissCurrent} />;
  if (!correctVisible) return null;
  return <RewardLayer><><Confetti fanfareId={fanfareId} /><div className="reward-toast fixed bottom-[max(.75rem,env(safe-area-inset-bottom))] right-3 z-[100] w-[min(calc(100vw-1.5rem),380px)] rounded-[1.5rem] border-2 border-white bg-slate-950 p-4 text-left text-white shadow-2xl sm:bottom-5 sm:right-5" role="status" aria-live="polite"><div className="text-4xl">{getRewardFanfare(fanfareId).emoji}</div><p className="mt-1 text-lg font-black">Brawo! Poprawna odpowiedź</p><p className="mt-1 text-xs text-slate-200">Punkty zapisane — tak trzymaj!</p></div></></RewardLayer>;
}
