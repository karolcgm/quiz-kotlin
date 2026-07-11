import type { ReactNode } from "react";
import { AVATAR_FRAMES } from "@/lib/rewards/catalog";

export function AvatarFrame({ frameId, children, size = "xl" }: { frameId?: string | null; children: ReactNode; size?: "sm" | "xl" }) {
  const frame = AVATAR_FRAMES.find((item) => item.id === frameId) ?? AVATAR_FRAMES[0];
  const frameLevel = Number(frame.id.slice(6));
  return <div
    className={`avatar-frame relative w-fit rounded-[31%] ${frame.className}`}
    data-frame={frame.id}
    data-size={size}
    aria-label={`Ramka: ${frame.name}`}
  >
    <span className="avatar-frame-glint pointer-events-none absolute inset-0 z-10 rounded-[30%]" aria-hidden />
    <span className="pointer-events-none absolute -right-3 -top-4 z-20 text-3xl drop-shadow-lg" aria-hidden>{frame.id === "frame-14" ? "👑" : frameLevel >= 8 ? "✦" : ""}</span>
    {children}
  </div>;
}
