import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { registerStudentAction, registerTeacherAction } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Rejestracja",
  description: "Rejestracja nauczyciela lub ucznia w LekcjaLab.",
};

interface RegisterPageProps {
  searchParams: Promise<{
    role?: string;
    token?: string;
    error?: string;
  }>;
}

type InvitationPreview = {
  valid: boolean;
  school_name: string;
  class_name: string;
  group_name: string;
  school_grade: number;
  expires_at: string;
};

async function loadInvitation(token: string): Promise<InvitationPreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_invitation_token", {
    target_token: token,
  });

  if (error || !data?.length) {
    return null;
  }

  return data[0] as InvitationPreview;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const role = params.role === "student" ? "student" : "teacher";
  const studentMissingInvitation = role === "student" && !params.token;
  const invitation =
    role === "student" && params.token ? await loadInvitation(params.token) : null;
  const invitationInvalid = role === "student" && params.token && !invitation;

  return (
    <PageShell className="max-w-3xl">
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">
          {role === "teacher" ? "Rejestracja nauczyciela" : "Rejestracja ucznia"}
        </h1>
        <p className="mt-3 text-slate-600">
          {role === "teacher"
            ? "Konto nauczyciela wymaga ręcznej aktywacji przez admina przed dostępem do panelu."
            : "Uczeń może założyć konto tylko z linku zaproszenia od nauczyciela."}
        </p>

        {invitation && (
          <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-950">
            <p className="font-bold">Zaproszenie do:</p>
            <p className="mt-1">
              {invitation.school_name} — {invitation.class_name} / {invitation.group_name} (klasa{" "}
              {invitation.school_grade})
            </p>
          </div>
        )}

        {params.error && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            {params.error}
          </p>
        )}

        {studentMissingInvitation && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-800">
            Ten formularz działa tylko z pełnego linku zaproszenia od nauczyciela.
          </p>
        )}

        {invitationInvalid && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            Link zaproszenia jest nieprawidłowy, wygasł lub został już użyty. Poproś nauczyciela o nowy link.
          </p>
        )}

        {!studentMissingInvitation && !invitationInvalid && (
          <form
            action={role === "teacher" ? registerTeacherAction : registerStudentAction}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
              Imię
            </label>
            <input
              id="firstName"
              name="firstName"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
              Nazwisko
            </label>
            <input
              id="lastName"
              name="lastName"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Hasło
            </label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          {role === "student" && (
            <>
              <input type="hidden" name="invitationToken" value={params.token ?? ""} />
              <div className="space-y-2">
                <label htmlFor="schoolGrade" className="text-sm font-semibold text-slate-700">
                  Klasa
                </label>
                <select
                  id="schoolGrade"
                  name="schoolGrade"
                  required
                  defaultValue={invitation?.school_grade ?? 5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                    <option key={grade} value={grade}>
                      Klasa {grade}
                    </option>
                  ))}
                </select>
                {invitation && (
                  <p className="text-xs text-slate-500">
                    Wybierz klasę zgodną z zaproszeniem ({invitation.school_grade}).
                  </p>
                )}
              </div>
            </>
          )}

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 sm:col-span-2"
            >
              {role === "teacher" ? "Zarejestruj i czekaj na aktywację" : "Utwórz konto ucznia"}
            </button>
          </form>
        )}
      </Card>
    </PageShell>
  );
}
