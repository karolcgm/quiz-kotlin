"use server";

import { revalidatePath } from "next/cache";
import { getBlueprintById } from "@/lib/assessment/registry";
import {
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
} from "@/lib/assessment/generateVersionSnapshot";
import { mapSnapshotToRpcPayload } from "@/lib/assessment/mapSnapshotToRpcPayload";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import type { PaperResultItemInput, PaperResultRow } from "@/types/paperResults";

export interface EnsureAssessmentVersionResult {
  ok: boolean;
  assessmentVersionId?: string;
  error?: string;
}

export async function ensureAssessmentVersionForClass(
  classId: string,
  blueprintId: string,
  versionCode: AssessmentVersionCode,
): Promise<EnsureAssessmentVersionResult> {
  await requireRole("teacher");
  const supabase = await createClient();
  const blueprint = getBlueprintById(blueprintId);

  if (!blueprint) {
    return { ok: false, error: "Nie znaleziono blueprintu." };
  }

  const versionSeed = resolveVersionSeed(blueprint, versionCode);
  const bundle = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);
  const payload = mapSnapshotToRpcPayload(bundle);

  const { data, error } = await supabase.rpc("ensure_assessment_version", {
    target_class_id: classId,
    blueprint_id: blueprint.id,
    blueprint_version: blueprint.version,
    version_code: versionCode,
    version_seed: versionSeed,
    snapshot: payload.snapshot,
    answer_key: payload.answer_key,
    content_checksum: payload.content_checksum,
    max_score: payload.max_score,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, assessmentVersionId: data as string };
}

export async function loadPaperResults(
  assessmentVersionId: string,
  classId: string,
): Promise<PaperResultRow[]> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("list_paper_results", {
    target_assessment_version_id: assessmentVersionId,
    target_class_id: classId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const rows = Array.isArray(data) ? data : [];
  return rows.map((row: Record<string, unknown>) => ({
    id: row.id as string | undefined,
    studentId: row.studentId as string,
    status: row.status as PaperResultRow["status"],
    totalScore: row.totalScore as number | null,
    maxScore: row.maxScore as number,
    percentage: row.percentage as number | null,
    mark: row.mark as number | null,
    comment: (row.comment as string | null) ?? null,
    versionCode: row.versionCode as string,
    items: ((row.items as PaperResultItemInput[]) ?? []).map((item) => ({
      slotId: item.slotId,
      position: item.position,
      skillId: item.skillId,
      score: Number(item.score),
      maxScore: Number(item.maxScore),
    })),
  }));
}

export async function savePaperResultDraftAction(input: {
  assessmentVersionId: string;
  classId: string;
  studentId: string;
  versionCode: AssessmentVersionCode;
  status: "draft" | "absent";
  items: PaperResultItemInput[];
  comment?: string;
  correctionReason?: string;
}): Promise<{ ok: boolean; error?: string }> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { error } = await supabase.rpc("save_paper_result_draft", {
    target_assessment_version_id: input.assessmentVersionId,
    target_class_id: input.classId,
    target_student_id: input.studentId,
    target_version_code: input.versionCode,
    target_status: input.status,
    target_items: input.items,
    target_comment: input.comment ?? null,
    correction_reason: input.correctionReason ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/nauczyciel/lekcje");
  return { ok: true };
}

export async function confirmPaperResultsAction(input: {
  assessmentVersionId: string;
  classId: string;
  lessonId: string;
}): Promise<{ ok: boolean; count?: number; error?: string }> {
  await requireRole("teacher");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("confirm_paper_results", {
    target_assessment_version_id: input.assessmentVersionId,
    target_class_id: input.classId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/nauczyciel/lekcje/${input.lessonId}/generator/wyniki`);
  revalidatePath("/nauczyciel/postepy");
  return { ok: true, count: data as number };
}
