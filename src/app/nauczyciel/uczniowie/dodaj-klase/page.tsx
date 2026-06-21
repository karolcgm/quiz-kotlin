import { Card } from "@/components/ui/Card";
import { createSchoolClassAction } from "@/lib/actions/assignments";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

interface AddClassPageProps {
  searchParams: Promise<{ added?: string }>;
}

export default async function AddClassPage({ searchParams }: AddClassPageProps) {
  await requireRole("teacher");
  const { added } = await searchParams;

  return (
    <Card>
      <h1 className="text-3xl font-bold text-slate-900">Dodaj szkołę i klasę</h1>
      <p className="mt-3 text-slate-600">
        Nauczyciel może prowadzić kilka szkół. Klasa i grupa są zawsze przypisane do konkretnej
        szkoły, więc dwie klasy 5 w różnych szkołach nie mieszają uczniów.
      </p>

      {added === "1" && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-900">
          Szkoła i klasa zostały dodane. Możesz teraz wygenerować link zaproszenia.
        </div>
      )}

      <form action={createSchoolClassAction} className="mt-6 grid max-w-2xl gap-3">
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
  );
}
