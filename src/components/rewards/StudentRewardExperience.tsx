"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { markRewardNotificationsSeenAction, recordRewardClicksAction } from "@/lib/actions/rewards";
import { achievementPresentation } from "@/lib/rewards/catalog";

type Notification = { id: string; kind: "sticker" | "achievement" | "theme" | "points"; reward_key: string; title: string; message: string };
type Celebration = { kind: "correct" | "sticker" | "achievement"; title: string; message: string; rewardKey?: string };

export function celebrateCorrectAnswer() {
  window.dispatchEvent(new CustomEvent("lekcjalab:celebrate-correct"));
}

function Confetti() {
  return <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>{Array.from({ length: 28 }, (_, index) => <span key={index} className="reward-confetti absolute -top-8 text-2xl" style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 9) * 80}ms`, animationDuration: `${1.4 + (index % 5) * .18}s` }}>{["★", "✦", "●", "■", "🎉"][index % 5]}</span>)}</div>;
}

export function StudentRewardExperience({ notifications = [] }: { notifications?: Notification[] }) {
  const [celebration, setCelebration] = useState<Celebration | null>(() => {
    const first = notifications[0];
    return first ? { kind: first.kind === "sticker" ? "sticker" : "achievement", title: first.title, message: first.message, rewardKey: first.reward_key } : null;
  });
  const pendingClicks = useRef(0);
  const sending = useRef(false);

  useEffect(() => {
    if (notifications.length > 0) void markRewardNotificationsSeenAction(notifications.map((item) => item.id));
  }, [notifications]);

  useEffect(() => {
    const celebrate = () => {
      setCelebration({ kind: "correct", title: "Brawo! Poprawna odpowiedź", message: "Zdobywasz punkty i masz szansę na nową naklejkę." });
      window.setTimeout(() => setCelebration((current) => current?.kind === "correct" ? null : current), 1800);
    };
    window.addEventListener("lekcjalab:celebrate-correct", celebrate);
    return () => window.removeEventListener("lekcjalab:celebrate-correct", celebrate);
  }, []);

  useEffect(() => {
    const flush = async () => {
      if (sending.current || pendingClicks.current < 10) return;
      sending.current = true;
      const delta = Math.min(25, pendingClicks.current);
      pendingClicks.current -= delta;
      const result = await recordRewardClicksAction(delta);
      sending.current = false;
      const achievement = result.unlocked?.[0];
      if (achievement) {
        const info = achievementPresentation(achievement);
        setCelebration({ kind: "achievement", title: info.title, message: `Nowa ranga za ${result.clickCount?.toLocaleString("pl-PL")} kliknięć!`, rewardKey: achievement });
      }
      if (pendingClicks.current >= 10) void flush();
    };
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("button")) return;
      pendingClicks.current += 1;
      if (pendingClicks.current >= 10) void flush();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!celebration) return null;
  const achievement = celebration.kind === "achievement" ? achievementPresentation(celebration.rewardKey ?? "") : null;
  return <>{celebration.kind === "correct" ? <Confetti /> : null}<div className="fixed inset-x-3 top-4 z-[100] mx-auto max-w-md animate-[reward-pop_.35s_ease-out] rounded-[2rem] border-4 border-white bg-slate-950 p-5 text-center text-white shadow-2xl" role="status" aria-live="polite">
    <button type="button" onClick={() => setCelebration(null)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/10" aria-label="Zamknij">×</button>
    {celebration.kind === "sticker" && celebration.rewardKey ? <div className="mx-auto w-fit"><AnimatedSticker stickerId={Number(celebration.rewardKey)} size="md" /></div> : <div className="text-7xl">{celebration.kind === "correct" ? "🎉" : achievement?.emoji ?? "🏅"}</div>}
    <p className="mt-3 text-2xl font-black">{celebration.title}</p>
    <p className="mt-1 text-sm text-slate-200">{celebration.message}</p>
  </div></>;
}
