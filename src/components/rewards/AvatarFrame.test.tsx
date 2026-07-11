// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnimatedSticker } from "@/components/rewards/AnimatedSticker";
import { AvatarFrame } from "@/components/rewards/AvatarFrame";

describe("AvatarFrame", () => {
  it("wybrana ramka zastępuje złoty pierścień naklejki", () => {
    render(
      <AvatarFrame frameId="frame-6">
        <AnimatedSticker stickerId={0} size="sm" selected />
      </AvatarFrame>,
    );

    const frame = screen.getByLabelText("Ramka: Kocie łapki");
    const sticker = screen.getByRole("img");

    expect(frame).toHaveAttribute("data-frame", "frame-6");
    expect(frame.className).toContain("ring-pink-400");
    expect(sticker.className).not.toContain("ring-yellow-300");
  });
});
