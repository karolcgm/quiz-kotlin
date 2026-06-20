import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { activateTeacherAction } from "@/lib/actions/admin";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PendingTeacher = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  created_at: string;
};

export default async function AdminTeachersPage() {
  await requireRole("admin");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, display_name, email, created_at")
    .eq("role", "teacher")
    .eq("status", "pending_admin")
    .order("created_at", { ascending: true })
    .returns<PendingTeacher[]>();

  const teachers = data ?? [];

  return (
    <PageShell>
      <h1 className="text-3xl font-bold text-slate-900">Nauczyciele do aktywacji</h1>
      <p className="mt-3 text-slate-600">
        Dopiero po ręcznej aktywacji nauczyciel dostanie dostęp do panelu i danych szkół.
      </p>

      <div className="mt-8 grid gap-4">
        {teachers.length === 0 && <Card>Brak kont oczekujących na aktywację.</Card>}
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {teacher.display_name ??
                  [teacher.first_name, teacher.last_name].filter(Boolean).join(" ") ??
                  "Nauczyciel"}
              </h2>
              <p className="text-slate-600">{teacher.email}</p>
            </div>
            <form action={activateTeacherAction}>
              <input type="hidden" name="teacherId" value={teacher.id} />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Aktywuj
              </button>
            </form>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
