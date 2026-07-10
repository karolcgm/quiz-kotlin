"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapBoardViewPayload } from "@/lib/live/boardView";
import type { LessonSessionBoardView } from "@/types/lessonSession";

export type BoardConnectionState = "live" | "syncing" | "offline";

const POLL_MS = 3000;

export function useBoardSessionSync(sessionId: string, initialView: LessonSessionBoardView) {
  const [view, setView] = useState(initialView);
  const [connection, setConnection] = useState<BoardConnectionState>("live");
  const lastSequenceRef = useRef(initialView.sequenceNumber);

  const refresh = useCallback(async () => {
    setConnection("syncing");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_lesson_session_board_view", {
      target_session_id: sessionId,
    });

    if (error || !data) {
      setConnection("offline");
      return;
    }

    const next = mapBoardViewPayload(data as Record<string, unknown>);
    if (next.sequenceNumber >= lastSequenceRef.current) {
      lastSequenceRef.current = next.sequenceNumber;
      setView(next);
    }
    setConnection("live");
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await refresh();
    };

    const intervalId = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => {
      void refresh();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh]);

  return { view, connection, refresh };
}
