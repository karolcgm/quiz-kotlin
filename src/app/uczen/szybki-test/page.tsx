import type { Metadata } from "next";
import { QuickPracticeBuilder } from "@/components/practice/QuickPracticeBuilder";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Szybki test ucznia",
  description: "Uczeń komponuje własny szybki test z widgetów LekcjaLab.",
};

export default async function StudentQuickPracticePage() {
  const student = await requireRole("student");
  const supabase = await createClient();
  const { data: memberships } = await supabase
    .from("class_members")
    .select("teacher_classes(school_grade)")
    .eq("student_id", student.id)
    .limit(1);
  const membership = memberships?.[0] as { teacher_classes: { school_grade: number } | null } | undefined;
  const grade = membership?.teacher_classes?.school_grade ?? 5;

  return (
    <>
      <section className="mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Nauka własna · dodatkowe punkty</p>
        <h1 className="mt-3 text-4xl font-bold">Krótka powtórka</h1>
        <p className="mt-4 max-w-2xl text-lg text-emerald-50">
          Kilka pytań z Twojej klasy, jedno na ekranie. Poprawiaj wynik w domu, zdobywaj dodatkowe punkty i kolekcję Domowych Odkrywców.
        </p>
      </section>
      <QuickPracticeBuilder grade={grade} />
    </>
  );
}
