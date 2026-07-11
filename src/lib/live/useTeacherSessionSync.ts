"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapTeacherViewPayload } from "@/lib/live/teacherView";
import type { LessonSessionTeacherView } from "@/types/lessonSession";

export type TeacherConnectionState = "live" | "syncing" | "offline";

const POLL_MS = 3000;

export function useTeacherSessionSync(sessionId: string, initialView: LessonSessionTeacherView) {
  const [view, setView] = useState(initialView);
  const [connection, setConnection] = useState<TeacherConnectionState>("live");
  const lastSequenceRef = useRef(initialView.sequenceNumber);

  const refresh = useCallback(async () => {
    setConnection("syncing");
    const supabase = createClient();
    await supabase.rpc("expire_lesson_sessions");
    const { data, error } = await supabase.rpc("get_lesson_session_teacher_view", {
      target_session_id: sessionId,
    });

    if (error || !data) {
      setConnection("offline");
      return null;
    }

    const next = mapTeacherViewPayload(data as Record<string, unknown>);
    if (next.sequenceNumber >= lastSequenceRef.current) {
      lastSequenceRef.current = next.sequenceNumber;
      setView(next);
    }
    setConnection("live");
    return next;
  }, [sessionId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => {
      void refresh();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [refresh]);

  const applyView = useCallback((next: Partial<LessonSessionTeacherView> & { sequenceNumber: number }) => {
    if (next.sequenceNumber >= lastSequenceRef.current) {
      lastSequenceRef.current = next.sequenceNumber;
      setView((current) => ({ ...current, ...next }));
    }
  }, []);

  return { view, connection, refresh, applyView, lastSequenceRef };
}
