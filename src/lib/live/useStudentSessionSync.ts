"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapStudentViewPayload } from "@/lib/live/studentView";
import type { LessonSessionStudentView } from "@/types/lessonSession";

export type StudentConnectionState = "live" | "syncing" | "offline";

const POLL_MS = 3000;

export function useStudentSessionSync(sessionId: string, initialView: LessonSessionStudentView) {
  const [view, setView] = useState(initialView);
  const [connection, setConnection] = useState<StudentConnectionState>("live");
  const lastSequenceRef = useRef(initialView.sequenceNumber);

  const refresh = useCallback(async () => {
    setConnection("syncing");
    const supabase = createClient();
    await supabase.rpc("expire_lesson_sessions");

    const [viewResult] = await Promise.all([
      supabase.rpc("get_lesson_session_student_view", { target_session_id: sessionId }),
      supabase.rpc("heartbeat_lesson_participant", { target_session_id: sessionId }).then(() => null),
    ]);

    const { data, error } = viewResult;

    if (error || !data) {
      setConnection("offline");
      return null;
    }

    const next = mapStudentViewPayload(data as Record<string, unknown>);
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

  return { view, connection, refresh };
}
