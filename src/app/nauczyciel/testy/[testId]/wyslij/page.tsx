import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import { SendTestForm, type SendTestStudent } from "@/components/tests/SendTestForm";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface SendTestPageProps {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ published?: string; error?: string }>;
}

type ClassRow = {
  id: string;
  name: string;
  group_name: string;
  schools: { name: string } | null;
};

type MemberRow = {
  student_id: string;
  class_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    email: string | null;
  } | null;
};

export default async function SendTestPage({ params, searchParams }: SendTestPageProps) {
  const teacher = await requireRole("teacher");
  const { testId } = await params;
  const { published, error } = await searchParams;
  const supabase = await createClient();

  const { data: test } = await supabase
    .from("tests")
    .select("id, title, status, class_level")
    .eq("id", testId)
    .eq("teacher_id", teacher.id)
    .single();

  if (!test) {
    notFound();
  }

  if (test.status !== "published") {
    return (
      <PageShell className="max-w-3xl">
        <Card>
          <h1 className="text-3xl font-bold text-slate-900">Najpierw opublikuj test</h1>
          <p className="mt-3 text-slate-600">
            Uczniowie zobaczą test dopiero po wysłaniu. Opublikuj szkic, a potem wróć tutaj.
          </p>
          <Link
            href={`/nauczyciel/testy/${testId}/edytuj`}
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
          >
            Edytuj test
          </Link>
        </Card>
      </PageShell>
    );
  }

  const { data: classes } = await supabase
    .from("teacher_classes")
    .select("id, name, group_name, schools(name)")
    .eq("teacher_id", teacher.id)
    .returns<ClassRow[]>();

  const classOptions =
    (classes ?? []).map((teacherClass) => ({
      id: teacherClass.id,
      name: teacherClass.name,
      group_name: teacherClass.group_name,
      school_name: teacherClass.schools?.name ?? "Szkoła",
    })) ?? [];

  const classIds = classOptions.map((teacherClass) => teacherClass.id);
  let students: SendTestStudent[] = [];

  if (classIds.length > 0) {
    const { data: members } = await supabase
      .from("class_members")
      .select("student_id, class_id, profiles(first_name, last_name, display_name, email)")
      .in("class_id", classIds)
      .returns<MemberRow[]>();

    students = (members ?? []).map((member) => {
      const teacherClass = classOptions.find((c) => c.id === member.class_id);
      return {
        student_id: member.student_id,
        first_name: member.profiles?.first_name ?? null,
        last_name: member.profiles?.last_name ?? null,
        display_name: member.profiles?.display_name ?? null,
        email: member.profiles?.email ?? null,
        class_id: member.class_id,
        class_name: teacherClass?.name ?? "",
        group_name: teacherClass?.group_name ?? "",
        school_name: teacherClass?.school_name ?? "",
      };
    });
  }

  return (
    <PageShell className="max-w-3xl">
      <DashboardNav
        links={[
          { href: "/nauczyciel/testy", label: "Testy" },
          { href: "/nauczyciel/zadania", label: "Przypisania" },
          { href: "/nauczyciel/uczniowie", label: "Uczniowie" },
        ]}
      />
      <Card>
        <h1 className="text-3xl font-bold text-slate-900">Wyślij test uczniom</h1>
        <p className="mt-3 text-slate-600">
          Test <strong>{test.title}</strong> (poziom programu: klasa {test.class_level}) jest
          opublikowany. Wybierz grupę uczniów — dopiero wtedy test pojawi się u ucznia.
        </p>

        {published === "1" && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Test opublikowany. Wybierz teraz grupę lub konkretnych uczniów.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
            {decodeURIComponent(error)}
          </div>
        )}

        {classOptions.length === 0 ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm font-medium text-amber-900">
            Najpierw utwórz grupę uczniów w zakładce{" "}
            <Link href="/nauczyciel/uczniowie" className="underline">
              Uczniowie
            </Link>
            .
          </p>
        ) : (
          <SendTestForm
            testId={test.id}
            testTitle={test.title}
            classes={classOptions}
            students={students}
          />
        )}
      </Card>
    </PageShell>
  );
}
