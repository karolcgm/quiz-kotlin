import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";
import { teacherNavCategories } from "@/data/dashboardNav";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const profile = await requireRole("teacher");

  return (
    <PageShell>
      <DashboardNav categories={teacherNavCategories} variant="full" />
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-100">
          Panel nauczyciela
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          Dzień dobry, {profile.displayName ?? profile.email}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-100">
          Twórz testy, wysyłaj powiadomienia, zatwierdzaj POPRAW i analizuj wyniki uczniów.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Composer testów</h2>
          <p className="mt-2 text-slate-600">Buduj sprawdziany z gotowych widgetów.</p>
          <Link href="/nauczyciel/testy/nowy" className="mt-4 inline-block font-semibold text-indigo-700">
            Utwórz test
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Uczniowie i klasy</h2>
          <p className="mt-2 text-slate-600">
            Zapraszaj uczniów linkiem do konkretnej szkoły, klasy i grupy.
          </p>
          <Link href="/nauczyciel/uczniowie" className="mt-4 inline-block font-semibold text-indigo-700">
            Zarządzaj uczniami
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Wyniki i POPRAW</h2>
          <p className="mt-2 text-slate-600">
            Sprawdź wyniki, zatwierdź poprawę i odpowiedz na prośby uczniów.
          </p>
          <Link href="/nauczyciel/wyniki" className="mt-4 inline-block font-semibold text-indigo-700">
            Zobacz wyniki
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Wyślij powiadomienie</h2>
          <p className="mt-2 text-slate-600">Wiadomość do całej grupy lub wybranych uczniów.</p>
          <Link
            href="/nauczyciel/powiadomienia/wyslij"
            className="mt-4 inline-block font-semibold text-indigo-700"
          >
            Napisz do uczniów
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Przypisania testów</h2>
          <p className="mt-2 text-slate-600">Historia wysłanych zadań i terminy.</p>
          <Link href="/nauczyciel/zadania" className="mt-4 inline-block font-semibold text-indigo-700">
            Zobacz przypisania
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
