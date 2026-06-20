import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { registerStudentAction, registerTeacherAction } from "@/lib/actions/auth";

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

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const role = params.role === "student" ? "student" : "teacher";
  const studentMissingInvitation = role === "student" && !params.token;

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

        {!studentMissingInvitation && (
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                    <option key={grade} value={grade}>
                      Klasa {grade}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="tokenDisplay" className="text-sm font-semibold text-slate-700">
                  Token zaproszenia
                </label>
                <input
                  id="tokenDisplay"
                  value={params.token ?? ""}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
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
