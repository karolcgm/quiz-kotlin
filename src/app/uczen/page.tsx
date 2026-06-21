import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const profile = await requireRole("student");

  return (
    <>
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-indigo-600 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-50">Panel ucznia</p>
        <h1 className="mt-3 text-4xl font-bold">
          Cześć, {profile.firstName ?? profile.displayName ?? "uczniu"}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-emerald-50">
          Testy od nauczyciela, wyniki z emotkami, powiadomienia i prośby o poprawę — wszystko w jednym miejscu.
        </p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <p className="mt-2 text-slate-600">Zobacz ocenę, emotkę i poproś o poprawę.</p>
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
        <Card>
          <h2 className="text-xl font-bold text-slate-900">Powiadomienia</h2>
          <p className="mt-2 text-slate-600">Nowe testy, decyzje o poprawie i wiadomości od nauczyciela.</p>
          <Link href="/uczen/powiadomienia" className="mt-4 inline-block font-semibold text-indigo-700">
            Otwórz powiadomienia
          </Link>
        </Card>
      </div>
    </>
  );
}
