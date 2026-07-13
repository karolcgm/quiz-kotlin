import { describe, expect, it } from "vitest";
import { AVATAR_FRAMES, getRewardFanfare, getStickerArtwork, getStickerCatalog, getStickerImage, REWARD_FANFARES, REWARD_THEMES, STICKER_COUNT, STICKER_MISSIONS } from "@/lib/rewards/catalog";

describe("katalog nagród", () => {
  it("zawiera osobne grafiki w kolekcjach", () => {
    const catalog = getStickerCatalog();
    expect(catalog).toHaveLength(STICKER_COUNT);
    expect(new Set(catalog.map((item) => item.id)).size).toBe(STICKER_COUNT);
    expect(new Set(catalog.map((item) => item.name)).size).toBe(STICKER_COUNT);
    expect(catalog).toHaveLength(80);
    expect(new Set(catalog.map((item) => item.collectionId)).size).toBe(4);
    expect(getStickerImage(0)).toBe("/rewards/stickers/beavers/beaver-01.png");
    expect(getStickerImage(59)).toBe("/rewards/stickers/cats/cat-20.png");
    expect(getStickerImage(60)).toBe("/api/rewards/stickers/60");
    expect(getStickerImage(STICKER_COUNT - 1)).toBe("/api/rewards/stickers/79");
    expect(getStickerArtwork(59)).toMatchObject({ protected: false });
    expect(getStickerArtwork(60)).toMatchObject({ protected: true });
    expect(catalog.slice(60).every((sticker) => sticker.rarity === "premium")).toBe(true);
    expect(catalog.slice(0, 60).every((sticker) => sticker.rarity === "standard")).toBe(true);
  });

  it("motywy mają rosnące progi punktowe", () => {
    expect(REWARD_THEMES.map((theme) => theme.points)).toEqual([0, 100, 300, 800, 1600]);
  });

  it("fanfary mają rosnące progi i bezpieczny wariant startowy", () => {
    expect(REWARD_FANFARES.map((fanfare) => fanfare.points)).toEqual([0, 120, 350, 700, 1400]);
    expect(getRewardFanfare("unknown").id).toBe("classic");
  });

  it("ma 15 ramek i warunek dla każdej tajemniczej kolekcji", () => {
    expect(AVATAR_FRAMES).toHaveLength(15);
    expect(new Set(AVATAR_FRAMES.map((frame) => frame.id)).size).toBe(15);
    expect(AVATAR_FRAMES.map((frame) => frame.points)).toEqual([...AVATAR_FRAMES].map((frame) => frame.points).sort((a, b) => a - b));
    expect(STICKER_MISSIONS).toHaveLength(4);
  });
});
