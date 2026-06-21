import { Card } from "@/components/ui/Card";
import { StudentInviteLink } from "@/components/teacher/StudentInviteLink";
import { createStudentInvitationAction } from "@/lib/actions/assignments";
import { buildStudentInviteUrl } from "@/lib/appOrigin";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { classDisplayName } from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

interface InvitationsPageProps {
  searchParams: Promise<{
    invite?: string;
    email?: string;
    emailSent?: string;
    emailError?: string;
    error?: string;
  }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

export default async function StudentInvitationsPage({ searchParams }: InvitationsPageProps) {
  const teacher = await requireRole("teacher");
  const { invite, email: inviteEmail, emailSent, emailError, error } = await searchParams;
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("teacher_classes")
    .select("id, name, group_name, schools(name)")
    .eq("teacher_id", teacher.id)
    .order("name")
    .returns<ClassRow[]>();

  const classList = classes ?? [];
  const inviteUrl = invite ? await buildStudentInviteUrl(invite, inviteEmail) : null;

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Zaproszenia uczniów</h1>
      <p className="mt-3 text-slate-600">
        Wygeneruj link dla szkoły, klasy i grupy. Jeśli podasz email ucznia, system spróbuje wysłać
        zaproszenie (wymaga RESEND_API_KEY w Vercel). Zawsze możesz też skopiować link ręcznie.
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}
      {emailSent === "1" && inviteEmail && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Email z linkiem wysłany na {inviteEmail}.
        </p>
      )}
      {emailError && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Link wygenerowany, ale email nie poszedł: {decodeURIComponent(emailError)}. Skopiuj link
          poniżej.
        </p>
      )}
      {inviteUrl && <StudentInviteLink inviteUrl={inviteUrl} studentEmail={inviteEmail} />}

      {classList.length === 0 ? (
        <p className="mt-6 text-slate-600">
          Najpierw dodaj szkołę i klasę w zakładce „Dodaj szkołę i klasę”.
        </p>
      ) : (
        <form action={createStudentInvitationAction} className="mt-6 grid max-w-2xl gap-3">
          <select
            name="classId"
            required
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="">Wybierz klasę/grupę</option>
            {classList.map((teacherClass) => (
              <option key={teacherClass.id} value={teacherClass.id}>
                {classDisplayName(teacherClass)}
              </option>
            ))}
          </select>
          <input
            name="email"
            type="email"
            placeholder="Email ucznia (opcjonalnie — wyślemy zaproszenie)"
            className="rounded-xl border border-slate-200 px-4 py-3"
          />
          <button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white">
            Wygeneruj link zaproszenia
          </button>
        </form>
      )}
    </Card>
  );
}
