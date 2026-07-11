import type { ReactNode } from "react";
import { AVATAR_FRAMES } from "@/lib/rewards/catalog";

export function AvatarFrame({ frameId, children, size = "xl" }: { frameId?: string | null; children: ReactNode; size?: "sm" | "xl" }) {
  const frame = AVATAR_FRAMES.find((item) => item.id === frameId) ?? AVATAR_FRAMES[0];
  return <div className={`avatar-frame relative w-fit rounded-[31%] ${frame.className} ${size === "sm" ? "scale-[.82]" : ""}`} data-frame={frame.id} aria-label={`Ramka: ${frame.name}`}><span className="pointer-events-none absolute -right-3 -top-4 z-10 text-3xl" aria-hidden>{frame.id === "frame-14" ? "👑" : Number(frame.id.slice(6)) >= 8 ? "✦" : ""}</span>{children}</div>;
}
