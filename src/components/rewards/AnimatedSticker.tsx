import Image from "next/image";
import { getSticker, getStickerArtwork } from "@/lib/rewards/catalog";

export function AnimatedSticker({ stickerId, size = "md", selected = false }: { stickerId: number; size?: "sm" | "md" | "xl"; selected?: boolean }) {
  const sticker = getSticker(stickerId);
  const artwork = getStickerArtwork(stickerId);
  const sizeClass = size === "xl" ? "h-[300px] w-[300px] text-9xl" : size === "sm" ? "h-20 w-20 text-4xl" : "h-32 w-32 text-6xl";
  const imageSizes = size === "xl" ? "300px" : size === "sm" ? "80px" : "128px";
  return <div className={`reward-sticker relative grid shrink-0 place-items-center overflow-hidden rounded-[30%] border-4 bg-white shadow-xl ${sticker.rarity === "premium" ? "border-amber-200 ring-2 ring-amber-400/60" : "border-white"} ${sizeClass}`} data-selected={selected || undefined} data-rarity={sticker.rarity} role="img" aria-label={`${sticker.name}, kolekcja ${sticker.collectionName}`}>
    {artwork.atlasCell ? <Image src={artwork.imagePath} alt="" width={1254} height={1254} sizes={imageSizes} className="absolute max-w-none object-cover" style={{ width: "200%", height: "200%", left: `${artwork.atlasCell.x * -100}%`, top: `${artwork.atlasCell.y * -100}%` }} /> : <Image src={artwork.imagePath} alt="" fill sizes={imageSizes} className="scale-[1.02] object-cover" />}
    <span className="reward-sticker-sparkle absolute left-[8%] top-[6%] text-xl text-yellow-300 drop-shadow">✦</span>
    <span className="reward-sticker-sparkle absolute bottom-[9%] right-[7%] text-2xl text-white drop-shadow [animation-delay:.5s]">★</span>
    <span className="absolute bottom-1 rounded-full bg-slate-950/70 px-2 py-0.5 text-[9px] font-black text-white">#{String(sticker.id + 1).padStart(4, "0")}</span>
    {sticker.rarity === "premium" ? <span className="absolute right-1 top-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[7px] font-black tracking-wide text-amber-950">PREMIUM</span> : null}
  </div>;
}
