"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapSnapshotToRpcPayload } from "@/lib/assessment/mapSnapshotToRpcPayload";
import {
  generateFrozenVersionSnapshot,
  resolveVersionSeed,
} from "@/lib/assessment/generateVersionSnapshot";
import { getBlueprintById } from "@/lib/assessment/registry";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

function parseDueAt(raw: string | null): string | null {
  if (!raw || raw.trim().length === 0) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseTimeLimitMinutes(raw: string | null): number | null {
  if (!raw || raw.trim().length === 0) return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 180) return null;
  return value;
}

function parseVersionCode(raw: string): AssessmentVersionCode {
  if (raw === "B" || raw === "C") return raw;
  return "A";
}

export async function createBlueprintAssignmentAction(formData: FormData) {
  await requireRole("teacher");
  const supabase = await createClient();

  const lessonId = requiredString(formData, "lessonId");
  const blueprintId = requiredString(formData, "blueprintId");
  const classId = requiredString(formData, "classId");
  const title = requiredString(formData, "title");
  const versionCode = parseVersionCode(formData.get("versionCode")?.toString() ?? "A");
  const maxAttempts = Number(requiredString(formData, "maxAttempts"));
  const scope = formData.get("scope")?.toString() ?? "class";
  const dueAt = parseDueAt(formData.get("dueAt")?.toString() ?? null);
  const startsAt = parseDueAt(formData.get("startsAt")?.toString() ?? null);
  const assignmentKind = formData.get("assignmentKind")?.toString() === "homework" ? "homework" : "classwork";
  const timeLimitMinutes = parseTimeLimitMinutes(formData.get("timeLimitMinutes")?.toString() ?? null);
  const returnPath = `/nauczyciel/lekcje/${lessonId}/generator/wyslij?blueprint=${blueprintId}&version=${versionCode}`;

  const studentIds =
    scope === "selected"
      ? formData
          .getAll("studentIds")
          .map((value) => value.toString())
          .filter((value) => value.length > 0)
      : null;

  const blueprint = getBlueprintById(blueprintId);
  if (!blueprint || blueprint.lessonPackageId !== lessonId) {
    redirect(`${returnPath}&error=${encodeURIComponent("Nie znaleziono blueprintu.")}`);
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
    redirect(`${returnPath}&error=${encodeURIComponent("Liczba prób musi być od 1 do 5.")}`);
  }

  if (scope === "selected" && (!studentIds || studentIds.length === 0)) {
    redirect(`${returnPath}&error=${encodeURIComponent("Wybierz co najmniej jednego ucznia.")}`);
  }

  if (formData.get("timeLimitMinutes")?.toString().trim() && timeLimitMinutes === null) {
    redirect(
      `${returnPath}&error=${encodeURIComponent("Limit czasu musi być liczbą od 1 do 180 minut.")}`,
    );
  }

  if (startsAt && dueAt && new Date(startsAt) > new Date(dueAt)) {
    redirect(
      `${returnPath}&error=${encodeURIComponent("Data rozpoczęcia nie może być późniejsza niż termin zakończenia.")}`,
    );
  }

  const versionSeed = resolveVersionSeed(blueprint, versionCode);
  const bundle = generateFrozenVersionSnapshot(blueprint, versionCode, versionSeed);
  const payload = mapSnapshotToRpcPayload(bundle);

  const { data: assignmentId, error } = await supabase.rpc("create_blueprint_assignment", {
    target_class_id: classId,
    assignment_title: title,
    max_attempts: maxAttempts,
    due_at: dueAt,
    target_student_ids: studentIds,
    time_limit_minutes: timeLimitMinutes,
    starts_at: startsAt,
    assignment_kind: assignmentKind,
    blueprint_id: blueprint.id,
    blueprint_version: blueprint.version,
    version_code: versionCode,
    version_seed: versionSeed,
    assessment_kind: blueprint.kind,
    delivery_mode: blueprint.deliveryMode,
    curriculum_id: blueprint.curriculumId,
    section_id: blueprint.sectionId,
    topic_ids: blueprint.topicIds,
    skill_ids: blueprint.skillIds,
    snapshot: payload.snapshot,
    answer_key: payload.answer_key,
    content_checksum: payload.content_checksum,
    max_score: payload.max_score,
  });

  if (error) {
    redirect(`${returnPath}&error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("notify_assignment_students", {
    target_assignment_id: assignmentId,
  });

  revalidatePath("/nauczyciel/zadania");
  revalidatePath("/nauczyciel/prace");
  revalidatePath("/uczen/testy");
  redirect(`/nauczyciel/zadania?sent=1&assignmentId=${assignmentId}&blueprint=1`);
}
