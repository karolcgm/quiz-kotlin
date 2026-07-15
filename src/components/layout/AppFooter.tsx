import Link from "next/link";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <LekcjaLabLogo size="sm" variant="light" showTagline animated={false} />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">Gotowe lekcje, aktywna praca ucznia i czytelny obraz postępów — od tablicy w klasie po samodzielną powtórkę w domu.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-slate-300">
          <Link href={{ pathname: "/", hash: "jak-dziala" }} className="hover:text-cyan-300">Jak działa</Link>
          <Link href={{ pathname: "/", hash: "nagrody" }} className="hover:text-cyan-300">Nagrody</Link>
          <Link href="/logowanie" className="hover:text-cyan-300">Logowanie</Link>
          <Link href="/rejestracja?role=teacher" className="hover:text-cyan-300">Konto nauczyciela</Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
        <p>LekcjaLab — pokaż matematykę, zamiast tylko o niej mówić.</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          Portal stworzony przez Piotra Peszko i Aleksandrę Peszko · © 2026 LekcjaLab · Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
