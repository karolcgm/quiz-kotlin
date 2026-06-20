import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileStatus, UserProfile, UserRole } from "@/types/auth";

type ProfileRow = {
  id: string;
  role: UserRole;
  status: ProfileStatus;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    role: row.role,
    status: row.status,
    firstName: row.first_name,
    lastName: row.last_name,
    displayName: row.display_name,
    email: row.email,
  };
}

export function getRoleHomePath(profile: Pick<UserProfile, "role" | "status">): string {
  if (profile.status === "blocked") {
    return "/konto/zablokowane";
  }

  if (profile.role === "teacher") {
    return profile.status === "active" ? "/nauczyciel" : "/konto/oczekuje";
  }

  if (profile.role === "student") {
    return "/uczen";
  }

  return "/admin";
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, role, status, first_name, last_name, display_name, email")
    .eq("id", user.id)
    .single<ProfileRow>();

  return data ? mapProfile(data) : null;
}

export async function requireProfile(): Promise<UserProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/logowanie");
  }

  return profile;
}

export async function requireRole(role: UserRole): Promise<UserProfile> {
  const profile = await requireProfile();

  if (profile.status === "blocked") {
    redirect("/konto/zablokowane");
  }

  if (profile.role !== role) {
    redirect(getRoleHomePath(profile));
  }

  if (profile.role === "teacher" && profile.status !== "active") {
    redirect("/konto/oczekuje");
  }

  if (profile.role === "admin" && profile.status !== "active") {
    redirect("/logowanie?error=Konto admina nie jest aktywne.");
  }

  return profile;
}
