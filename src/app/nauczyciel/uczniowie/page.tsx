import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import {
  createSchoolClassAction,
  createStudentInvitationAction,
} from "@/lib/actions/assignments";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface TeacherStudentsPageProps {
  searchParams: Promise<{ invite?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  school_grade: number;
  schools: { name: string } | null;
};

type ClassMemberRow = {
  student_id: string;
  teacher_classes: { name: string; group_name: string; schools: { name: string } | null } | null;
  profiles: { first_name: string | null; last_name: string | null; display_name: string | null; email: string | null } | null;
};

export default async function TeacherStudentsPage({ searchParams }: TeacherStudentsPageProps) {
  await requireRole("teacher");
  const { invite } = await searchParams;
  const supabase = await createClient();
  const [{ data }, { data: members }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, school_grade, schools(name)")
      .returns<ClassRow[]>(),
    supabase
      .from("class_members")
      .select("student_id, teacher_classes(name, group_name, schools(name)), profiles(first_name, last_name, display_name, email)")
      .returns<ClassMemberRow[]>(),
  ]);
  const classes = data ?? [];
  const inviteUrl = invite ? `/rejestracja?role=student&token=${invite}` : null;

  return (
    <PageShell>
      <DashboardNav
        links={[
          { href: "/nauczyciel", label: "Panel" },
          { href: "/nauczyciel/testy", label: "Testy" },
          { href: "/nauczyciel/zadania", label: "Przypisania" },
        ]}
      />
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
            Link zaproszenia będzie tworzony dla szkoły, klasy i grupy. Uczeń po wejściu w link
            podaje imię, nazwisko i klasę, a system przypisuje go do właściwej grupy.
          </p>
          {inviteUrl && (
            <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Link dla ucznia: {inviteUrl}
            </div>
          )}
          <form action={createStudentInvitationAction} className="mt-6 grid gap-3">
            <select
              name="classId"
              required
              className="rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="">Wybierz klasę/grupę</option>
              {classes.map((teacherClass) => (
                <option key={teacherClass.id} value={teacherClass.id}>
                  {teacherClass.schools?.name ?? "Szkoła"} — {teacherClass.name} /{" "}
                  {teacherClass.group_name}
                </option>
              ))}
            </select>
            <input
              name="email"
              type="email"
              placeholder="Email ucznia (opcjonalnie)"
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
          {(members ?? []).length === 0 && <p className="text-slate-600">Brak uczniów w klasach.</p>}
          {(members ?? []).map((member) => {
            const profile = member.profiles;
            const name =
              [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
              profile?.display_name ||
              profile?.email ||
              "Uczeń";

            return (
              <Link
                key={`${member.student_id}-${member.teacher_classes?.name ?? ""}`}
                href={`/nauczyciel/uczniowie/${member.student_id}/postepy`}
                className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-bold text-slate-900">{name}</span>
                  <span className="text-sm font-semibold text-indigo-700">Zobacz postępy</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {member.teacher_classes?.schools?.name ?? "Szkoła"} ·{" "}
                  {member.teacher_classes?.name ?? "Klasa"} / {member.teacher_classes?.group_name ?? "grupa"}
                </p>
              </Link>
            );
          })}
        </div>
      </Card>
    </PageShell>
  );
}
