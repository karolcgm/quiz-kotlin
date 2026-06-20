import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

const links = [
  { href: "/uczen/testy", label: "Testy do wykonania" },
  { href: "/uczen/szybki-test", label: "Szybki test" },
  { href: "/uczen/postepy", label: "Postępy" },
  { href: "/uczen/wyniki", label: "Moje wyniki" },
];

export default async function StudentDashboardPage() {
  const profile = await requireRole("student");

  return (
    <PageShell>
      <DashboardNav links={links} />
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Panel ucznia</p>
        <h1 className="mt-3 text-4xl font-bold">
          Cześć, {profile.firstName ?? profile.displayName ?? "uczniu"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-emerald-50">
          Tutaj znajdziesz testy od nauczyciela, wyniki, oceny opisowe i informacje o poprawach.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Testy do wykonania</h2>
          <p className="mt-2 text-slate-600">Rozwiąż przypisane zadania i sprawdź wynik.</p>
          <Link href="/uczen/testy" className="mt-4 inline-block font-semibold text-indigo-700">
            Przejdź do testów
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Szybki test</h2>
          <p className="mt-2 text-slate-600">Sam wybierz tematy i poćwicz z interaktywnych widgetów.</p>
          <Link href="/uczen/szybki-test" className="mt-4 inline-block font-semibold text-indigo-700">
            Ułóż szybki test
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Moje oceny</h2>
          <p className="mt-2 text-slate-600">Zobacz opis, ocenę 1-6 i historię prób.</p>
          <Link href="/uczen/wyniki" className="mt-4 inline-block font-semibold text-indigo-700">
            Zobacz wyniki
          </Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Postępy</h2>
          <p className="mt-2 text-slate-600">Zobacz, które umiejętności są mocne, a które wymagają ćwiczeń.</p>
          <Link href="/uczen/postepy" className="mt-4 inline-block font-semibold text-indigo-700">
            Pokaż postępy
          </Link>
        </Card>
      </div>
    </PageShell>
  );
}
