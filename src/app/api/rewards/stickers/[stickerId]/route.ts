import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const FIRST_PREMIUM_STICKER_ID = 60;
const LAST_PREMIUM_STICKER_ID = 79;

function hiddenResponse() {
  return new Response(null, {
    status: 404,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ stickerId: string }> },
) {
  const { stickerId: rawStickerId } = await context.params;
  const stickerId = Number(rawStickerId);

  if (!Number.isInteger(stickerId) || stickerId < FIRST_PREMIUM_STICKER_ID || stickerId > LAST_PREMIUM_STICKER_ID) {
    return hiddenResponse();
  }

  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") {
    return hiddenResponse();
  }

  let canSeeSticker = profile.role === "admin";
  if (profile.role === "student") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("student_stickers")
      .select("sticker_id")
      .eq("student_id", profile.id)
      .eq("sticker_id", stickerId)
      .maybeSingle();
    canSeeSticker = Boolean(data);
  }

  if (!canSeeSticker) {
    return hiddenResponse();
  }

  const fileName = `chrupek-premium-${String(stickerId - FIRST_PREMIUM_STICKER_ID + 1).padStart(2, "0")}.png`;
  const filePath = path.join(process.cwd(), "private-assets", "rewards", "chrupek-premium", fileName);

  try {
    const image = await readFile(filePath);
    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return hiddenResponse();
  }
}
