import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const profile = await getCurrentProfile();
  const redirectTo = profile?.role === "teacher" && requestedNext === "/konto/oferta"
    ? "/konto/oferta"
    : profile ? getRoleHomePath(profile) : "/";

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
}
