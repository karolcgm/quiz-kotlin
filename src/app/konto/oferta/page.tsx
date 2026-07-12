import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";
import { requireProfile } from "@/lib/auth/session";

export default async function TeacherOfferPage() {
  const profile = await requireProfile();
  if (profile.role !== "teacher") return <PageShell className="max-w-2xl"><Card><h1 className="text-2xl font-black text-slate-950">Ta oferta jest przeznaczona dla nauczycieli.</h1></Card></PageShell>;

  return <PageShell className="max-w-5xl py-10">
    <section className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-violet-700 to-cyan-700 p-7 text-white shadow-2xl sm:p-12"><p className="text-sm font-black uppercase tracking-[.18em] text-cyan-100">Witamy w LekcjaLab</p><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Twoje konto otwiera klasie drogę do aktywnej matematyki.</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-indigo-100">Lekcje na tablicy, praca uczniów na tabletach, poprawki we własnym tempie i czytelny obraz postępów — w jednym środowisku.</p></section>
    <div className="mt-6 grid gap-5 md:grid-cols-3"><Card className="border-indigo-200"><p className="text-sm font-black uppercase text-indigo-700">Start</p><h2 className="mt-2 text-3xl font-black text-slate-950">240 zł / rok</h2><p className="mt-2 text-slate-600">Dostęp nauczyciela oraz do 20 uczniów.</p></Card><Card className="border-emerald-200"><p className="text-sm font-black uppercase text-emerald-700">Rozwój klasy</p><h2 className="mt-2 text-3xl font-black text-slate-950">+2 zł / rok</h2><p className="mt-2 text-slate-600">Za każdego ucznia powyżej podstawowych 20 miejsc.</p></Card><Card className="border-violet-200"><p className="text-sm font-black uppercase text-violet-700">Elastycznie</p><h2 className="mt-2 text-3xl font-black text-slate-950">Pakiet Flex</h2><p className="mt-2 text-slate-600">Dobierasz liczbę miejsc do faktycznej wielkości swoich klas.</p></Card></div>
    <Card className="mt-6 bg-slate-950 text-white"><h2 className="text-2xl font-black">Co zyskujesz od pierwszej lekcji?</h2><div className="mt-4 grid gap-3 text-slate-200 sm:grid-cols-2"><p>✓ Gotowe prezentacje i aktywności</p><p>✓ Konta uczniów w ramach pakietu</p><p>✓ Lekcje Live, prace i poprawki</p><p>✓ Wyniki oraz samoocena zrozumienia</p></div>{profile.status === "active" ? <Link href="/nauczyciel/rozliczenia" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-black text-indigo-700">Przejdź do rozliczeń →</Link> : <p className="mt-6 text-indigo-200">Konto oczekuje teraz na aktywację administratora. Po aktywacji wejdziesz do panelu i rozliczeń.</p>}</Card>
  </PageShell>;
}
