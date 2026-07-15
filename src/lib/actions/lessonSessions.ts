"use server";

import { revalidatePath } from "next/cache";
import { buildLessonSessionSnapshot } from "@/lib/lessons/buildSessionSnapshot";
import { getLessonPackageById } from "@/data/lessons/registry";
import { requireRole } from "@/lib/auth/session";
import { mapBoardViewPayload } from "@/lib/live/boardView";
import { mapStudentViewPayload } from "@/lib/live/studentView";
import { mapTeacherSummaryPayload, mapStudentSummaryPayload } from "@/lib/live/sessionSummary";
import { mapTeacherViewPayload } from "@/lib/live/teacherView";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateLessonSessionResult,
  JoinLessonSessionResult,
  LessonSessionBoardView,
  LessonSessionCommandResult,
  LessonPaceMode,
  LessonSessionStatus,
  LessonSessionStudentView,
  LessonSessionStudentSummary,
  LessonSessionTeacherSummary,
  LessonSessionTeacherView,
  LessonBookwork,
  LessonSessionTeacherResultRow,
  LessonSessionDescriptiveGrade,
  SubmitLessonStageResponseResult,
} from "@/types/lessonSession";
import type {
  LessonUnderstandingSessionStats,
  TeacherLessonUnderstandingRow,
  UnderstandingLevel,
} from "@/types/understanding";

function mapDescriptiveGrade(row: Record<string, unknown>): LessonSessionDescriptiveGrade {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    studentId: row.student_id as string,
    lessonTitle: row.lesson_title as string,
    sectionId: (row.section_id as string | null) ?? null,
    totalScore: Number(row.total_score ?? 0),
    maxScore: Number(row.max_score ?? 0),
    percentage: Number(row.percentage ?? 0),
    descriptiveFeedback: row.descriptive_feedback as string,
    strengths: (row.strengths as string[]) ?? [],
    improvements: (row.improvements as string[]) ?? [],
    createdAt: row.created_at as string,
  };
}

function mapCommandResult(data: Record<string, unknown>): LessonSessionCommandResult {
  return {
    ok: true,
    sessionId: data.sessionId as string,
    status: data.status as LessonSessionStatus,
    activeStageIndex: data.activeStageIndex as number | undefined,
    solutionRevealed: data.solutionRevealed as boolean | undefined,
    sequenceNumber: Number(data.sequenceNumber),
  };
}

export async function createLessonSessionAction(input: {
  classId: string;
  lessonId: string;
  paceMode?: LessonPaceMode;
}): Promise<CreateLessonSessionResult> {
  await requireRole("teacher");
  const lesson = getLessonPackageById(input.lessonId);

  if (!lesson) {
    return { ok: false, error: "Nie znaleziono pakietu lekcji." };
  }

  const { stageSnapshot, answerKey } = buildLessonSessionSnapshot(lesson);
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_lesson_session", {
    target_class_id: input.classId,
    lesson_id: lesson.id,
    lesson_version: lesson.version,
    stage_snapshot: stageSnapshot,
    answer_key: answerKey,
    pace_mode: input.paceMode ?? "teacher",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  revalidatePath(`/nauczyciel/lekcje/${lesson.id}`);

  return {
    ok: true,
    sessionId: payload.sessionId as string,
    joinCode: payload.joinCode as string,
    joinCodeExpiresAt: payload.joinCodeExpiresAt as string,
    status: payload.status as LessonSessionStatus,
    sequenceNumber: Number(payload.sequenceNumber),
  };
}

export async function rotateLessonJoinCodeAction(
  sessionId: string,
): Promise<CreateLessonSessionResult> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("rotate_lesson_join_code", {
    target_session_id: sessionId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  return {
    ok: true,
    sessionId: payload.sessionId as string,
    joinCode: payload.joinCode as string,
    joinCodeExpiresAt: payload.joinCodeExpiresAt as string,
    sequenceNumber: Number(payload.sequenceNumber),
  };
}

export async function joinLessonSessionAction(input: {
  sessionId: string;
  joinCode: string;
  deviceLabel?: string;
}): Promise<JoinLessonSessionResult> {
  await requireRole("student");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("join_lesson_session", {
    target_session_id: input.sessionId,
    join_code_plain: input.joinCode.trim(),
    device_label: input.deviceLabel ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  return {
    ok: true,
    sessionId: payload.sessionId as string,
    status: payload.status as LessonSessionStatus,
    activeStageIndex: payload.activeStageIndex as number,
    paceMode: payload.paceMode as LessonPaceMode,
    solutionRevealed: payload.solutionRevealed as boolean,
    boardOnlyMode: payload.boardOnlyMode as boolean,
    stageSnapshot: payload.stageSnapshot as JoinLessonSessionResult["stageSnapshot"],
    sequenceNumber: Number(payload.sequenceNumber),
  };
}

export async function startLessonSessionAction(sessionId: string): Promise<LessonSessionCommandResult> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_lesson_session", { target_session_id: sessionId });

  if (error) {
    return { ok: false, error: error.message };
  }

  return mapCommandResult(data as Record<string, unknown>);
}

export async function pauseLessonSessionAction(sessionId: string): Promise<LessonSessionCommandResult> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("pause_lesson_session", { target_session_id: sessionId });

  if (error) {
    return { ok: false, error: error.message };
  }

  return mapCommandResult(data as Record<string, unknown>);
}

export async function changeLessonSessionStageAction(input: {
  sessionId: string;
  stageIndex: number;
  revealSolution?: boolean;
}): Promise<LessonSessionCommandResult> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("change_lesson_session_stage", {
    target_session_id: input.sessionId,
    target_stage_index: input.stageIndex,
    reveal_solution: input.revealSolution ?? false,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return mapCommandResult(data as Record<string, unknown>);
}

export async function endLessonSessionAction(
  sessionId: string,
  recordSkillEvidence = true,
  bookwork?: LessonBookwork,
): Promise<LessonSessionCommandResult> {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  if (bookwork) {
    const textbookPage = Math.trunc(bookwork.textbookPage);
    const coveredExercises = Array.from(new Set(bookwork.coveredExercises.map((value) => value.trim()).filter(Boolean)));
    if (textbookPage < 1 || textbookPage > 999 || coveredExercises.length === 0 || coveredExercises.length > 50) {
      return { ok: false, error: "Podaj stronę od 1 do 999 oraz co najmniej jedno przerobione zadanie." };
    }
    const { error: bookworkError } = await supabase.rpc("update_lesson_session_bookwork", {
      target_session_id: sessionId,
      target_page: textbookPage,
      target_exercises: coveredExercises,
    });
    if (bookworkError) {
      const missingFromSchemaCache = bookworkError.code === "PGRST202"
        || /update_lesson_session_bookwork.*schema cache/i.test(bookworkError.message);
      if (!missingFromSchemaCache) return { ok: false, error: bookworkError.message };

      const { error: fallbackError } = await supabase
        .from("lesson_sessions")
        .update({ textbook_page: textbookPage, covered_exercises: coveredExercises })
        .eq("id", sessionId)
        .eq("teacher_id", teacher.id);
      if (fallbackError) return { ok: false, error: fallbackError.message };
    }
  }
  const { data, error } = await supabase.rpc("end_lesson_session", {
    target_session_id: sessionId,
    record_skill_evidence: recordSkillEvidence,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/nauczyciel/sesje/${sessionId}/podsumowanie`);
  revalidatePath("/uczen/plan");
  return mapCommandResult(data as Record<string, unknown>);
}

export async function getLessonSessionBookwork(sessionId: string): Promise<LessonBookwork> {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_sessions")
    .select("textbook_page, covered_exercises")
    .eq("id", sessionId)
    .eq("teacher_id", teacher.id)
    .maybeSingle<{ textbook_page: number | null; covered_exercises: string[] | null }>();
  return {
    textbookPage: data?.textbook_page ?? 1,
    coveredExercises: data?.covered_exercises?.length ? data.covered_exercises : ["1"],
  };
}

export async function getLessonSessionTeacherSummary(
  sessionId: string,
): Promise<LessonSessionTeacherSummary | null> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_lesson_session_teacher_summary", {
    target_session_id: sessionId,
  });

  if (error || !data) {
    return null;
  }

  const summary = mapTeacherSummaryPayload(data as Record<string, unknown>);
  const { data: bookwork } = await supabase.from("lesson_sessions")
    .select("textbook_page, covered_exercises")
    .eq("id", sessionId)
    .maybeSingle<{ textbook_page: number | null; covered_exercises: string[] | null }>();
  return {
    ...summary,
    textbookPage: bookwork?.textbook_page ?? null,
    coveredExercises: bookwork?.covered_exercises ?? [],
  };
}

export async function getLessonSessionTeacherResults(
  sessionId: string,
): Promise<LessonSessionTeacherResultRow[]> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_lesson_session_teacher_results", {
    target_session_id: sessionId,
  });
  if (error || !data) return [];
  const rows = ((data as Record<string, unknown>).rows as Array<Record<string, unknown>>) ?? [];
  return rows.map((row) => ({
    studentId: row.studentId as string,
    displayName: row.displayName as string,
    stageId: row.stageId as string,
    stageTitle: row.stageTitle as string,
    submittedCount: Number(row.submittedCount ?? 0),
    correctCount: Number(row.correctCount ?? 0),
    taskCount: Number(row.taskCount ?? 0),
  }));
}

export async function getLessonSessionDescriptiveGrades(
  sessionId: string,
): Promise<LessonSessionDescriptiveGrade[]> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.from("lesson_session_grades")
    .select("id, session_id, student_id, lesson_title, section_id, total_score, max_score, percentage, descriptive_feedback, strengths, improvements, created_at")
    .eq("session_id", sessionId)
    .order("percentage", { ascending: false });
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map(mapDescriptiveGrade);
}

export async function getLessonSessionStudentSummary(
  sessionId: string,
): Promise<LessonSessionStudentSummary | null> {
  await requireRole("student");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_lesson_session_student_summary", {
    target_session_id: sessionId,
  });

  if (error || !data) {
    return null;
  }

  return mapStudentSummaryPayload(data as Record<string, unknown>);
}

export async function getMyLiveLessonUnderstanding(
  sessionId: string,
): Promise<UnderstandingLevel | null> {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_live_lesson_understanding", {
    target_session_id: sessionId,
  });
  if (error || !data) return null;
  return data as UnderstandingLevel;
}

export async function submitLiveLessonUnderstandingAction(
  sessionId: string,
  understandingLevel: UnderstandingLevel,
): Promise<{ ok: true; understandingLevel: UnderstandingLevel } | { ok: false; error: string }> {
  await requireRole("student");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_live_lesson_understanding", {
    target_session_id: sessionId,
    target_understanding_level: understandingLevel,
  });
  if (error || !data) return { ok: false, error: error?.message ?? "Nie udało się zapisać odpowiedzi." };
  revalidatePath(`/uczen/sesja/${sessionId}`);
  revalidatePath(`/uczen/sesja/${sessionId}/podsumowanie`);
  revalidatePath(`/nauczyciel/sesje/${sessionId}/podsumowanie`);
  return {
    ok: true,
    understandingLevel: (data as Record<string, unknown>).understandingLevel as UnderstandingLevel,
  };
}

export async function getLessonSessionUnderstandingStats(
  sessionId: string,
): Promise<LessonUnderstandingSessionStats | null> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_lesson_session_understanding_statistics", {
    target_session_id: sessionId,
  });
  if (error || !data) return null;
  const payload = data as Record<string, unknown>;
  const students = Array.isArray(payload.students) ? payload.students as Array<Record<string, unknown>> : [];
  return {
    totalStudents: Number(payload.totalStudents ?? 0),
    submittedCount: Number(payload.submittedCount ?? 0),
    understoodCount: Number(payload.understoodCount ?? 0),
    partialCount: Number(payload.partialCount ?? 0),
    notUnderstoodCount: Number(payload.notUnderstoodCount ?? 0),
    needsReviewCount: Number(payload.needsReviewCount ?? 0),
    needsReviewPercent: Number(payload.needsReviewPercent ?? 0),
    students: students.map((row) => ({
      studentId: String(row.studentId),
      displayName: String(row.displayName ?? "Uczeń"),
      understandingLevel: (row.understandingLevel as UnderstandingLevel | null) ?? null,
      updatedAt: row.updatedAt ? String(row.updatedAt) : null,
    })),
  };
}

export async function getTeacherLessonUnderstanding(
  classId?: string,
): Promise<TeacherLessonUnderstandingRow[]> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_teacher_lesson_understanding", {
    target_class_id: classId ?? null,
  });
  if (error || !Array.isArray(data)) return [];
  return (data as Array<Record<string, unknown>>).map((row) => ({
    checkId: String(row.check_id),
    studentId: String(row.student_id),
    displayName: String(row.display_name ?? "Uczeń"),
    classId: String(row.class_id),
    className: String(row.class_name ?? "Klasa"),
    groupName: String(row.group_name ?? ""),
    lessonId: String(row.lesson_id),
    lessonTitle: String(row.lesson_title ?? "Lekcja"),
    sectionId: String(row.section_id ?? "Bez działu"),
    topicId: String(row.topic_id ?? "Bez tematu"),
    sourceType: row.source_type as "live" | "review",
    understandingLevel: row.understanding_level as UnderstandingLevel,
    checkedAt: String(row.checked_at),
  }));
}

export async function submitLessonStageResponseAction(input: {
  sessionId: string;
  stageId: string;
  questionInstanceId: string;
  clientAttemptId: string;
  selectedOperatorIndex: number | null;
  answerLabel?: string;
}): Promise<SubmitLessonStageResponseResult> {
  await requireRole("student");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("submit_lesson_stage_response", {
    target_session_id: input.sessionId,
    stage_id: input.stageId,
    question_instance_id: input.questionInstanceId,
    client_attempt_id: input.clientAttemptId,
    public_answer: { selectedOperatorIndex: input.selectedOperatorIndex, answerLabel: input.answerLabel ?? null },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  return {
    ok: true,
    responseId: payload.responseId as string,
    status: payload.status as "submitted",
    score: Number(payload.score),
    maxScore: Number(payload.maxScore),
    gradeStatus: payload.gradeStatus as SubmitLessonStageResponseResult["gradeStatus"],
    errorCodes: Array.isArray(payload.errorCodes) ? payload.errorCodes.map(String) : [],
    feedbackKey: typeof payload.feedbackKey === "string" ? payload.feedbackKey : undefined,
    submittedAt: payload.submittedAt as string,
    idempotent: payload.idempotent as boolean,
    sequenceNumber: payload.sequenceNumber ? Number(payload.sequenceNumber) : undefined,
  };
}

export async function getLessonSessionStudentView(
  sessionId: string,
): Promise<LessonSessionStudentView | null> {
  await requireRole("student");
  const supabase = await createClient();
  await supabase.rpc("expire_lesson_sessions");

  const { data, error } = await supabase.rpc("get_lesson_session_student_view", {
    target_session_id: sessionId,
  });

  if (error || !data) {
    return null;
  }

  return mapStudentViewPayload(data as Record<string, unknown>);
}

export async function requestLessonSessionHelpAction(
  sessionId: string,
  cancel = false,
): Promise<{ ok: boolean; helpStatus?: "none" | "requested"; error?: string }> {
  await requireRole("student");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("request_lesson_session_help", {
    target_session_id: sessionId,
    cancel_request: cancel,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  return {
    ok: true,
    helpStatus: payload.helpStatus as "none" | "requested",
  };
}

export async function getLessonSessionBoardView(sessionId: string): Promise<LessonSessionBoardView | null> {
  await requireRole("teacher");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_lesson_session_board_view", {
    target_session_id: sessionId,
  });

  if (error || !data) {
    return null;
  }

  const payload = data as Record<string, unknown>;
  return mapBoardViewPayload(payload);
}

export async function getLessonSessionTeacherView(
  sessionId: string,
): Promise<LessonSessionTeacherView | null> {
  await requireRole("teacher");
  const supabase = await createClient();
  await supabase.rpc("expire_lesson_sessions");

  const { data, error } = await supabase.rpc("get_lesson_session_teacher_view", {
    target_session_id: sessionId,
  });

  if (error || !data) {
    return null;
  }

  const payload = data as Record<string, unknown>;
  return mapTeacherViewPayload(payload);
}

export async function getLessonSessionExpiryAction(sessionId: string): Promise<string | null> {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  await supabase.rpc("expire_lesson_sessions");
  const { data } = await supabase.from("lesson_sessions")
    .select("expires_at")
    .eq("id", sessionId)
    .eq("teacher_id", teacher.id)
    .maybeSingle<{ expires_at: string | null }>();
  return data?.expires_at ?? null;
}

export async function setLessonSessionBoardOnlyModeAction(
  sessionId: string,
  enabled: boolean,
): Promise<LessonSessionCommandResult> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("set_lesson_session_board_only_mode", {
    target_session_id: sessionId,
    enabled,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const payload = data as Record<string, unknown>;
  return {
    ok: true,
    sessionId: payload.sessionId as string,
    sequenceNumber: Number(payload.sequenceNumber),
  };
}

export async function heartbeatLessonParticipantAction(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  await requireRole("student");
  const supabase = await createClient();
  const { error } = await supabase.rpc("heartbeat_lesson_participant", {
    target_session_id: sessionId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
