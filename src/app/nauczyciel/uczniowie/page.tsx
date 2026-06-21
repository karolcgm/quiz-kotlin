import Link from "next/link";
import { PanelFilterBar } from "@/components/teacher/PanelFilterBar";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { buildPanelUrl, classDisplayName, studentDisplayName } from "@/lib/teacher/panelFilters";

export const dynamic = "force-dynamic";

interface TeacherStudentsPageProps {
  searchParams: Promise<{ classId?: string }>;
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
  class_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  class_name: string;
  group_name: string;
  school_name: string;
};

function classGroupLabel(student: TeacherStudentRow): string {
  return `${student.school_name} · ${student.class_name} / ${student.group_name}`;
}

export default async function TeacherStudentsPage({ searchParams }: TeacherStudentsPageProps) {
  await requireRole("teacher");
  const { classId } = await searchParams;
  const supabase = await createClient();

  const [{ data: classes, error: classesError }, { data: members, error: membersError }] =
    await Promise.all([
      supabase
        .from("teacher_classes")
        .select("id, name, group_name, school_grade, schools(name)")
        .order("school_grade")
        .order("name")
        .returns<ClassRow[]>(),
      supabase.rpc("list_teacher_students"),
    ]);

  const classList = classes ?? [];
  const studentList = (Array.isArray(members) ? members : []) as TeacherStudentRow[];
  const loadError = classesError?.message ?? membersError?.message ?? null;

  const filteredStudents = classId
    ? studentList.filter((student) => student.class_id === classId)
    : studentList;

  const classOptions = [
    {
      id: "all",
      label: "Wszyscy uczniowie",
      href: buildPanelUrl("/nauczyciel/uczniowie", { classId: undefined }),
      count: studentList.length,
    },
    ...classList.map((classRow) => ({
      id: classRow.id,
      label: classDisplayName(classRow),
      href: buildPanelUrl("/nauczyciel/uczniowie", { classId: classRow.id }),
      count: studentList.filter((student) => student.class_id === classRow.id).length,
    })),
  ];

  const groupedStudents = new Map<string, TeacherStudentRow[]>();
  for (const student of filteredStudents) {
    const groupKey = classId ? "single" : student.class_id;
    const bucket = groupedStudents.get(groupKey) ?? [];
    bucket.push(student);
    groupedStudents.set(groupKey, bucket);
  }

  const displayGroups = classId
    ? [{ key: "single", title: null as string | null, students: filteredStudents }]
    : classList
        .map((classRow) => ({
          key: classRow.id,
          title: classDisplayName(classRow),
          students: groupedStudents.get(classRow.id) ?? [],
        }))
        .filter((group) => group.students.length > 0);

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Uczniowie</h1>
      <p className="mt-3 text-slate-600">
        Lista uczniów pogrupowana według klas. Dodawanie szkół i zaproszenia są w osobnych
        zakładkach powyżej.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-700">Klasa</p>
        <PanelFilterBar
          ariaLabel="Filtr klas uczniów"
          activeId={classId ?? "all"}
          options={classOptions}
        />
      </div>

      <div className="mt-6 space-y-6">
        {loadError && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            Nie udało się wczytać listy uczniów: {loadError}
          </p>
        )}

        {filteredStudents.length === 0 && !loadError && (
          <p className="text-slate-600">
            Brak uczniów{classId ? " w tej klasie" : ""}.{" "}
            <Link href="/nauczyciel/uczniowie/zaproszenia" className="font-semibold text-indigo-700">
              Wygeneruj link zaproszenia
            </Link>
            , aby dodać pierwszego ucznia.
          </p>
        )}

        {displayGroups.map((group) => (
          <section key={group.key}>
            {group.title && (
              <h2 className="mb-3 text-lg font-bold text-slate-900">{group.title}</h2>
            )}
            <div className="space-y-3">
              {group.students.map((member) => {
                const name = studentDisplayName({
                  ...member,
                  fallbackId: member.student_id,
                });

                return (
                  <Link
                    key={`${member.student_id}-${member.class_id}`}
                    href={`/nauczyciel/uczniowie/${member.student_id}/postepy`}
                    className="block rounded-xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="font-bold text-slate-900">{name}</span>
                      <span className="text-sm font-semibold text-indigo-700">Zobacz postępy</span>
                    </div>
                    {!classId && (
                      <p className="mt-1 text-sm text-slate-600">{classGroupLabel(member)}</p>
                    )}
                    {member.email && (
                      <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Card>
  );
}
