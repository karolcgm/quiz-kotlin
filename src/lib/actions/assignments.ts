"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function createSchoolClassAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const schoolName = requiredString(formData, "schoolName");
  const city = formData.get("city")?.toString() ?? "";
  const className = requiredString(formData, "className");
  const groupName = requiredString(formData, "groupName");
  const schoolGrade = Number(requiredString(formData, "schoolGrade"));

  if (!Number.isInteger(schoolGrade) || schoolGrade < 1 || schoolGrade > 8) {
    throw new Error("Klasa musi być liczbą od 1 do 8.");
  }

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .insert({
      name: schoolName,
      city,
      created_by: teacher.id,
    })
    .select("id")
    .single();

  if (schoolError || !school) {
    throw new Error(schoolError?.message ?? "Nie udało się utworzyć szkoły.");
  }

  const { error: membershipError } = await supabase.from("teacher_school_memberships").insert({
    school_id: school.id,
    teacher_id: teacher.id,
    created_by: teacher.id,
  });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { error: classError } = await supabase.from("teacher_classes").insert({
    school_id: school.id,
    teacher_id: teacher.id,
    name: className,
    group_name: groupName,
    school_grade: schoolGrade,
  });

  if (classError) {
    throw new Error(classError.message);
  }

  revalidatePath("/nauczyciel/uczniowie");
}

export async function createStudentInvitationAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const classId = requiredString(formData, "classId");
  const email = formData.get("email")?.toString() ?? null;

  const { data: teacherClass } = await supabase
    .from("teacher_classes")
    .select("id, school_id")
    .eq("id", classId)
    .eq("teacher_id", teacher.id)
    .single();

  if (!teacherClass) {
    throw new Error("Nie znaleziono klasy.");
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
    throw new Error(error?.message ?? "Nie udało się utworzyć zaproszenia.");
  }

  redirect(`/nauczyciel/uczniowie?invite=${invitation.token}`);
}

export async function createAssignmentAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const supabase = await createClient();
  const testId = requiredString(formData, "testId");
  const classId = requiredString(formData, "classId");
  const title = requiredString(formData, "title");
  const maxAttempts = Number(requiredString(formData, "maxAttempts"));
  const dueAt = formData.get("dueAt")?.toString() || null;

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) {
    throw new Error("Liczba prób musi być od 1 do 5.");
  }

  const { data: teacherClass } = await supabase
    .from("teacher_classes")
    .select("id, school_id")
    .eq("id", classId)
    .eq("teacher_id", teacher.id)
    .single();

  if (!teacherClass) {
    throw new Error("Nie znaleziono klasy.");
  }

  const { data: test } = await supabase
    .from("tests")
    .select("id, school_id, teacher_id, status")
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .single();

  if (!test || test.school_id !== teacherClass.school_id) {
    throw new Error("Test i klasa muszą należeć do tej samej szkoły.");
  }

  if (test.status !== "published") {
    throw new Error("Przypisać można tylko opublikowany test.");
  }

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      test_id: testId,
      teacher_id: teacher.id,
      school_id: teacherClass.school_id,
      class_id: teacherClass.id,
      title,
      max_attempts: maxAttempts,
      due_at: dueAt,
      status: "published",
      published_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !assignment) {
    throw new Error(error?.message ?? "Nie udało się przypisać testu.");
  }

  const { data: members } = await supabase
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);

  if (members && members.length > 0) {
    const { error: studentsError } = await supabase.from("assignment_students").insert(
      members.map((member) => ({
        assignment_id: assignment.id,
        student_id: member.student_id,
      })),
    );

    if (studentsError) {
      throw new Error(studentsError.message);
    }
  }

  redirect("/nauczyciel/zadania");
}
