import { Card } from "@/components/ui/Card";
import { SendNotificationForm } from "@/components/notifications/SendNotificationForm";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SendNotificationsPageProps {
  searchParams: Promise<{ error?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

type TeacherStudentRow = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
};

export default async function SendNotificationsPage({ searchParams }: SendNotificationsPageProps) {
  const teacher = await requireRole("teacher");
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: classes }, { data: members }] = await Promise.all([
    supabase
      .from("teacher_classes")
      .select("id, name, group_name, schools(name)")
      .eq("teacher_id", teacher.id)
      .returns<ClassRow[]>(),
    supabase.rpc("list_teacher_students"),
  ]);

  const classOptions = (classes ?? []).map((item) => ({
    id: item.id,
    label: `${item.schools?.name ?? "Szkoła"} — ${item.name} / ${item.group_name}`,
  }));

  const studentList = Array.isArray(members) ? (members as TeacherStudentRow[]) : [];
  const studentOptions = studentList.map((student) => ({
    id: student.student_id,
    label:
      student.display_name ??
      [student.first_name, student.last_name].filter(Boolean).join(" ") ??
      student.student_id.slice(0, 8),
  }));

  return (
    <Card>
        <h1 className="text-3xl font-bold text-slate-900">Wyślij powiadomienie</h1>
        <p className="mt-3 text-slate-600">
          Wyślij wiadomość do całej grupy lub wybranych uczniów. Uczniowie zobaczą ją w dzwonku
          powiadomień.
        </p>
        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
          </div>
        )}
        <div className="mt-6">
          {classOptions.length === 0 ? (
            <p className="text-slate-600">Najpierw utwórz klasę i dodaj uczniów.</p>
          ) : (
            <SendNotificationForm classes={classOptions} students={studentOptions} />
          )}
        </div>
      </Card>
  );
}
