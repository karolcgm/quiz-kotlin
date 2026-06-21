"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { sendStudentInviteEmail } from "@/lib/email/sendStudentInviteEmail";
import { createClient } from "@/lib/supabase/server";

function optionalEmail(formData: FormData): string | null {
  const value = formData.get("email")?.toString().trim();
  return value && value.length > 0 ? value : null;
}

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function createSchoolClassAction(formData: FormData) {
  await requireRole("teacher");
  const supabase = await createClient();
  const schoolName = requiredString(formData, "schoolName");
  const city = formData.get("city")?.toString() ?? "";
  const className = requiredString(formData, "className");
  const groupName = requiredString(formData, "groupName");
  const schoolGrade = Number(requiredString(formData, "schoolGrade"));

  if (!Number.isInteger(schoolGrade) || schoolGrade < 1 || schoolGrade > 8) {
    throw new Error("Klasa musi być liczbą od 1 do 8.");
  }

  const { error } = await supabase.rpc("create_school_with_class", {
    school_name: schoolName,
    school_city: city,
    class_name: className,
    group_name: groupName,
    school_grade: schoolGrade,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/nauczyciel/uczniowie");
  revalidatePath("/nauczyciel/uczniowie/dodaj-klase");
  redirect("/nauczyciel/uczniowie/dodaj-klase?added=1");
}

export async function createStudentInvitationAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const classId = requiredString(formData, "classId");
  const email = optionalEmail(formData);

  const { data: teacherClass, error: classError } = await supabase
    .from("teacher_classes")
    .select("id, school_id, name, group_name, schools(name)")
    .eq("id", classId)
    .eq("teacher_id", teacher.id)
    .single();

  if (classError || !teacherClass) {
    redirect(
      `/nauczyciel/uczniowie/zaproszenia?error=${encodeURIComponent(classError?.message ?? "Nie znaleziono klasy.")}`,
    );
  }

  const { data: invitation, error } = await supabase
    .from("student_invitations")
    .insert({
      school_id: teacherClass.school_id,
      class_id: teacherClass.id,
      teacher_id: teacher.id,
      email,
    })
    .select("token")
    .single();

  if (error || !invitation) {
    redirect(
      `/nauczyciel/uczniowie/zaproszenia?error=${encodeURIComponent(error?.message ?? "Nie udało się utworzyć zaproszenia.")}`,
    );
  }

  const inviteQuery = new URLSearchParams({ invite: invitation.token });
  if (email) {
    inviteQuery.set("email", email);
    const schoolName =
      teacherClass.schools && typeof teacherClass.schools === "object" && "name" in teacherClass.schools
        ? String(teacherClass.schools.name)
        : "Szkoła";
    const classLabel = `${schoolName} — ${teacherClass.name} / ${teacherClass.group_name}`;
    const emailResult = await sendStudentInviteEmail(email, invitation.token, classLabel);
    if (emailResult.sent) {
      inviteQuery.set("emailSent", "1");
    } else if (emailResult.error) {
      inviteQuery.set("emailError", emailResult.error);
    }
  }

  redirect(`/nauczyciel/uczniowie/zaproszenia?${inviteQuery.toString()}`);
}

function parseDueAt(raw: string | null): string | null {
  if (!raw || raw.trim().length === 0) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseTimeLimitMinutes(raw: string | null): number | null {
  if (!raw || raw.trim().length === 0) {
    return null;
  }

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 180) {
    return null;
  }

  return value;
}

export async function createAssignmentAction(formData: FormData) {
  await requireRole("teacher");
  const supabase = await createClient();
  const testId = requiredString(formData, "testId");
  const classId = requiredString(formData, "classId");
  const title = requiredString(formData, "title");
  const maxAttempts = Number(requiredString(formData, "maxAttempts"));
  const scope = formData.get("scope")?.toString() ?? "class";
  const dueAt = parseDueAt(formData.get("dueAt")?.toString() ?? null);
  const timeLimitMinutes = parseTimeLimitMinutes(formData.get("timeLimitMinutes")?.toString() ?? null);
  const studentIds =
    scope === "selected"
      ? formData
          .getAll("studentIds")
          .map((value) => value.toString())
          .filter((value) => value.length > 0)
      : null;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
    redirect(
      `/nauczyciel/testy/${testId}/wyslij?error=${encodeURIComponent("Liczba prób musi być od 1 do 5.")}`,
    );
  }

  if (scope === "selected" && (!studentIds || studentIds.length === 0)) {
    redirect(
      `/nauczyciel/testy/${testId}/wyslij?error=${encodeURIComponent("Wybierz co najmniej jednego ucznia.")}`,
    );
  }

  if (formData.get("timeLimitMinutes")?.toString().trim() && timeLimitMinutes === null) {
    redirect(
      `/nauczyciel/testy/${testId}/wyslij?error=${encodeURIComponent("Limit czasu musi być liczbą od 1 do 180 minut.")}`,
    );
  }

  const { data: assignmentId, error } = await supabase.rpc("create_test_assignment", {
    target_test_id: testId,
    target_class_id: classId,
    assignment_title: title,
    max_attempts: maxAttempts,
    due_at: dueAt,
    target_student_ids: studentIds,
    time_limit_minutes: timeLimitMinutes,
  });

  if (error) {
    redirect(
      `/nauczyciel/testy/${testId}/wyslij?error=${encodeURIComponent(error.message)}`,
    );
  }

  await supabase.rpc("notify_assignment_students", {
    target_assignment_id: assignmentId,
  });

  revalidatePath("/nauczyciel/zadania");
  revalidatePath("/nauczyciel/testy");
  revalidatePath("/uczen/testy");
  redirect(`/nauczyciel/zadania?sent=1&testId=${testId}&assignmentId=${assignmentId}`);
}

export async function closeAssignmentAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const assignmentId = requiredString(formData, "assignmentId");
  const supabase = await createClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, test_id, status")
    .eq("id", assignmentId)
    .eq("teacher_id", teacher.id)
    .maybeSingle();

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  if (!assignment) {
    throw new Error("Nie znaleziono przypisania.");
  }

  const { error: closeError } = await supabase
    .from("assignments")
    .update({ status: "closed" })
    .eq("id", assignmentId)
    .eq("teacher_id", teacher.id);

  if (closeError) {
    throw new Error(closeError.message);
  }

  const { count: activeAssignments } = await supabase
    .from("assignments")
    .select("id", { count: "exact", head: true })
    .eq("test_id", assignment.test_id)
    .eq("teacher_id", teacher.id)
    .neq("status", "closed");

  if ((activeAssignments ?? 0) === 0) {
    await supabase
      .from("tests")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", assignment.test_id)
      .eq("teacher_id", teacher.id);
  }

  revalidatePath("/nauczyciel/zadania");
  revalidatePath("/nauczyciel/testy");
  redirect("/nauczyciel/zadania?status=closed&closed=1");
}
