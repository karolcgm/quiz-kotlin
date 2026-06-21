import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { teacherNavCategories } from "@/data/dashboardNav";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { StudentInviteLink } from "@/components/teacher/StudentInviteLink";
import {
  createSchoolClassAction,
  createStudentInvitationAction,
} from "@/lib/actions/assignments";
import { buildStudentInviteUrl } from "@/lib/appOrigin";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface TeacherStudentsPageProps {
  searchParams: Promise<{ invite?: string; email?: string; emailSent?: string; emailError?: string; error?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  school_grade: number;
  schools: { name: string } | null;
};

type TeacherStudentRow = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  class_name: string;
  group_name: string;
  school_name: string;
};

export default async function TeacherStudentsPage({ searchParams }: TeacherStudentsPageProps) {
  const teacher = await requireRole("teacher");
  const { invite, email: inviteEmail, emailSent, emailError, error } = await searchParams;
  const supabase = await createClient();
  const [{ data: classes, error: classesError }, { data: members, error: membersError }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, school_grade, schools(name)")
      .eq("teacher_id", teacher.id)
      .returns<ClassRow[]>(),
    supabase.rpc("list_teacher_students"),
  ]);
  const classList = classes ?? [];
  const studentList = Array.isArray(members) ? (members as TeacherStudentRow[]) : [];
  const inviteUrl = invite ? await buildStudentInviteUrl(invite, inviteEmail) : null;
  const loadError = classesError?.message ?? membersError?.message ?? null;

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h1 className="text-3xl font-bold text-slate-900">Szkoły, klasy i grupy</h1>
          <p className="mt-3 text-slate-600">
            Nauczyciel może prowadzić kilka szkół. Klasa i grupa są zawsze przypisane do konkretnej
            szkoły, więc dwie klasy 5 w różnych szkołach nie mieszają uczniów.
          </p>
          <form action={createSchoolClassAction} className="mt-6 grid gap-3">
            <input
              name="schoolName"
              required
              placeholder="Nazwa szkoły"
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <input
              name="city"
              placeholder="Miasto"
              className="rounded-xl border border-slate-200 px-4 py-3"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <input
                name="className"
                required
                placeholder="Klasa, np. 5A"
                className="rounded-xl border border-slate-200 px-4 py-3"
              />
              <input
                name="groupName"
                required
                placeholder="Grupa, np. matematyka"
                className="rounded-xl border border-slate-200 px-4 py-3"
              />
              <select
                name="schoolGrade"
                defaultValue="5"
                className="rounded-xl border border-slate-200 px-4 py-3"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((grade) => (
                  <option key={grade} value={grade}>
                    Klasa {grade}
                  </option>
                ))}
              </select>
            </div>
            <button className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white">
              Dodaj szkołę i klasę
            </button>
          </form>
        </Card>
        <Card>
          <h2 className="text-2xl font-bold text-slate-900">Zaproszenie ucznia</h2>
          <p className="mt-3 text-slate-600">
            Wygeneruj link dla szkoły, klasy i grupy. Jeśli podasz email ucznia, system spróbuje wysłać zaproszenie
            (wymaga RESEND_API_KEY w Vercel). Zawsze możesz też skopiować link ręcznie.
          </p>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{decodeURIComponent(error)}</p>
          )}
          {emailSent === "1" && inviteEmail && (
            <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Email z linkiem wysłany na {inviteEmail}.
            </p>
          )}
          {emailError && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Link wygenerowany, ale email nie poszedł: {decodeURIComponent(emailError)}. Skopiuj link poniżej.
            </p>
          )}
          {inviteUrl && <StudentInviteLink inviteUrl={inviteUrl} studentEmail={inviteEmail} />}
          <form action={createStudentInvitationAction} className="mt-6 grid gap-3">
            <select
              name="classId"
              required
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="">Wybierz klasę/grupę</option>
              {classList.map((teacherClass) => (
                <option key={teacherClass.id} value={teacherClass.id}>
                  {teacherClass.schools?.name ?? "Szkoła"} — {teacherClass.name} /{" "}
                  {teacherClass.group_name}
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
        </Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-2xl font-bold text-slate-900">Uczniowie i postępy</h2>
        <p className="mt-2 text-slate-600">
          Wejdź w ucznia, aby zobaczyć statystyki z klasówek i szybkich testów.
        </p>
        <div className="mt-4 space-y-3">
          {loadError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
              Nie udało się wczytać listy uczniów: {loadError}
            </p>
          )}
          {studentList.length === 0 && !loadError && <p className="text-slate-600">Brak uczniów w klasach.</p>}
          {studentList.map((member) => {
            const name =
              [member.first_name, member.last_name].filter(Boolean).join(" ") ||
              member.display_name ||
              member.email ||
              "Uczeń";

            return (
              <Link
                key={`${member.student_id}-${member.class_name}`}
                href={`/nauczyciel/uczniowie/${member.student_id}/postepy`}
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-bold text-slate-900">{name}</span>
                  <span className="text-sm font-semibold text-indigo-700">Zobacz postępy</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {member.school_name} · {member.class_name} / {member.group_name}
                </p>
              </Link>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}
