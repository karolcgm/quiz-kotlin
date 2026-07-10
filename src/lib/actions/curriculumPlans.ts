"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { plMath5Classic2026 } from "@/data/curriculum/pl-math-5-2026-classic";
import { createClient } from "@/lib/supabase/server";
import type { TopicPlanEntryStatus } from "@/types/program";

export interface CreatePlanEntryInput {
  sectionId: string;
  topicId: string;
  position: number;
}

export async function createClassCurriculumPlanAction(input: {
  classId: string;
  schoolYear?: string;
}) {
  await requireRole("teacher");
  const supabase = await createClient();
  const schoolYear = input.schoolYear ?? plMath5Classic2026.schoolYearLabel;

  const entries: CreatePlanEntryInput[] = [];
  let position = 0;
  for (const section of plMath5Classic2026.sections) {
    for (const topic of section.topics) {
      entries.push({
        sectionId: section.id,
        topicId: topic.id,
        position,
      });
      position += 1;
    }
  }

  const { data: planId, error } = await supabase.rpc("create_class_curriculum_plan", {
    p_class_id: input.classId,
    p_curriculum_id: plMath5Classic2026.id,
    p_curriculum_version: 1,
    p_school_year: schoolYear,
    p_entries: entries.map((entry) => ({
      section_id: entry.sectionId,
      topic_id: entry.topicId,
      position: entry.position,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/nauczyciel/program", "layout");
  return planId as string;
}

export async function updateTopicPlanEntryStatusAction(input: {
  entryId: string;
  status: TopicPlanEntryStatus;
  teacherNote?: string;
}) {
  await requireRole("teacher");
  const supabase = await createClient();

  const { error } = await supabase.rpc("update_topic_plan_entry_status", {
    p_entry_id: input.entryId,
    p_status: input.status,
    p_teacher_note: input.teacherNote ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/nauczyciel/program", "layout");
}

export async function getActiveClassCurriculumPlan(classId: string) {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data: plan, error: planError } = await supabase
    .from("class_curriculum_plans")
    .select("*")
    .eq("class_id", classId)
    .eq("status", "active")
    .maybeSingle();

  if (planError) {
    throw new Error(planError.message);
  }

  if (!plan) {
    return null;
  }

  const { data: entries, error: entriesError } = await supabase
    .from("topic_plan_entries")
    .select("*")
    .eq("plan_id", plan.id)
    .order("position", { ascending: true });

  if (entriesError) {
    throw new Error(entriesError.message);
  }

  return { plan, entries: entries ?? [] };
}

/** Kończy temat w planie dokładnie dla klasy przypisanej do sesji Live. */
export async function completeTopicFromLessonSessionAction(sessionId: string) {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data: session, error: sessionError } = await supabase
    .from("lesson_sessions")
    .select("class_id, lesson_id, stage_snapshot")
    .eq("id", sessionId)
    .maybeSingle();
  if (sessionError || !session) throw new Error(sessionError?.message ?? "Nie znaleziono sesji Live.");

  const topicId = (session.stage_snapshot as { topicId?: string } | null)?.topicId;
  if (!topicId) throw new Error("Sesja nie zawiera identyfikatora tematu.");

  const { data: plan, error: planError } = await supabase
    .from("class_curriculum_plans")
    .select("id")
    .eq("class_id", session.class_id)
    .eq("status", "active")
    .maybeSingle();
  if (planError) throw new Error(planError.message);
  if (!plan) return { ok: false, reason: "no-active-plan" as const };

  const { data: entry, error: entryError } = await supabase
    .from("topic_plan_entries")
    .select("id")
    .eq("plan_id", plan.id)
    .eq("topic_id", topicId)
    .maybeSingle();
  if (entryError) throw new Error(entryError.message);
  if (!entry) return { ok: false, reason: "no-topic-entry" as const };

  const { error } = await supabase.rpc("update_topic_plan_entry_status", {
    p_entry_id: entry.id,
    p_status: "completed",
    p_teacher_note: null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/nauczyciel/program", "layout");
  return { ok: true as const };
}
