"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth/session";

function requiredString(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Brak wymaganego pola: ${key}`);
  }
  return value.trim();
}

export async function signInAction(formData: FormData) {
  const email = requiredString(formData, "email");
  const password = requiredString(formData, "password");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/logowanie?error=${encodeURIComponent(error.message)}`);
  }

  const profile = await getCurrentProfile();
  redirect(profile ? getRoleHomePath(profile) : "/");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function registerTeacherAction(formData: FormData) {
  const email = requiredString(formData, "email");
  const password = requiredString(formData, "password");
  const firstName = requiredString(formData, "firstName");
  const lastName = requiredString(formData, "lastName");
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "teacher",
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
      },
    },
  });

  if (error) {
    redirect(`/rejestracja?role=teacher&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/konto/oczekuje");
}

export async function registerStudentAction(formData: FormData) {
  const email = requiredString(formData, "email");
  const password = requiredString(formData, "password");
  const firstName = requiredString(formData, "firstName");
  const lastName = requiredString(formData, "lastName");
  const schoolGrade = requiredString(formData, "schoolGrade");
  const invitationToken = requiredString(formData, "invitationToken");
  const supabase = await createClient();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invitationToken)) {
    redirect("/rejestracja?role=student&error=Rejestracja ucznia wymaga poprawnego linku zaproszenia.");
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "student",
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        school_grade: schoolGrade,
        invitation_token: invitationToken,
      },
    },
  });

  if (error) {
    redirect(`/rejestracja?role=student&token=${invitationToken}&error=${encodeURIComponent(error.message)}`);
  }

  redirect("/uczen");
}
