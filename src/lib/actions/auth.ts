"use server";

import { redirect } from "next/navigation";
import { getAppOrigin } from "@/lib/appOrigin";
import { formatAuthError } from "@/lib/auth/errors";
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
  const origin = await getAppOrigin();

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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/rejestracja?role=teacher&error=${encodeURIComponent(formatAuthError(error))}`);
  }

  redirect("/konto/oczekuje");
}

export async function registerStudentAction(formData: FormData) {
  const email = requiredString(formData, "email");
  const password = requiredString(formData, "password");
  const firstName = requiredString(formData, "firstName");
  const lastName = requiredString(formData, "lastName");
  const invitationToken = requiredString(formData, "invitationToken");
  const supabase = await createClient();
  const origin = await getAppOrigin();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(invitationToken)) {
    redirect("/rejestracja?role=student&error=Rejestracja ucznia wymaga poprawnego linku zaproszenia.");
  }

  const { data: invitationRows, error: invitationError } = await supabase.rpc("validate_invitation_token", {
    target_token: invitationToken,
  });

  if (invitationError || !invitationRows?.length) {
    redirect(
      `/rejestracja?role=student&token=${invitationToken}&error=${encodeURIComponent("Link zaproszenia wygasł lub został już użyty.")}`,
    );
  }

  const invitation = invitationRows[0] as { school_grade: number };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "student",
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
        school_grade: invitation.school_grade,
        invitation_token: invitationToken,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(
      `/rejestracja?role=student&token=${invitationToken}&error=${encodeURIComponent(formatAuthError(error))}`,
    );
  }

  if (!data.session) {
    redirect(`/konto/potwierdz-email?email=${encodeURIComponent(email)}`);
  }

  redirect("/uczen");
}
