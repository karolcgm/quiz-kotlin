import { describe, expect, it } from "vitest";
import { AVATAR_FRAMES, getStickerCatalog, getStickerImage, REWARD_THEMES, STICKER_COUNT, STICKER_MISSIONS } from "@/lib/rewards/catalog";

describe("katalog nagród", () => {
  it("zawiera osobne grafiki w kolekcjach", () => {
    const catalog = getStickerCatalog();
    expect(catalog).toHaveLength(STICKER_COUNT);
    expect(new Set(catalog.map((item) => item.id)).size).toBe(STICKER_COUNT);
    expect(new Set(catalog.map((item) => item.name)).size).toBe(STICKER_COUNT);
    expect(new Set(catalog.map((item) => item.collectionId)).size).toBe(3);
    expect(getStickerImage(0)).toBe("/rewards/stickers/beavers/beaver-01.png");
    expect(getStickerImage(STICKER_COUNT - 1)).toBe("/rewards/stickers/cats/cat-20.png");
  });

  it("motywy mają rosnące progi punktowe", () => {
    expect(REWARD_THEMES.map((theme) => theme.points)).toEqual([0, 100, 250, 1000, 5000]);
  });

  it("ma 15 ramek i warunek dla każdej tajemniczej kolekcji", () => {
    expect(AVATAR_FRAMES).toHaveLength(15);
    expect(new Set(AVATAR_FRAMES.map((frame) => frame.id)).size).toBe(15);
    expect(AVATAR_FRAMES.map((frame) => frame.points)).toEqual([...AVATAR_FRAMES].map((frame) => frame.points).sort((a, b) => a - b));
    expect(STICKER_MISSIONS.length).toBeGreaterThanOrEqual(3);
  });
});
