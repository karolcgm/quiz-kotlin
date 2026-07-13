import Link from "next/link";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBellWrapper } from "@/components/notifications/NotificationBellWrapper";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth/session";

export async function AppHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="relative z-20 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group">
          <LekcjaLabLogo size="sm" variant="color" showTagline animated />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {profile ? (
            <>
              {(profile.role === "teacher" || profile.role === "student") &&
                profile.status === "active" && (
                  <NotificationBellWrapper role={profile.role} />
                )}
              <Link
                href={getRoleHomePath(profile)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:text-base"
              >
                Panel
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:px-4 sm:text-base"
                >
                  Wyloguj
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="hidden items-center gap-1 lg:flex">
                <Link href={{ pathname: "/", hash: "jak-dziala" }} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">Jak działa</Link>
                <Link href={{ pathname: "/", hash: "nagrody" }} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">Nagrody</Link>
                <Link href={{ pathname: "/", hash: "dla-szkoly" }} className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">Dla szkoły</Link>
              </div>
              <Link href="/logowanie" className="rounded-xl px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:text-base">Zaloguj</Link>
              <Link href="/rejestracja?role=teacher" className="hidden rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 sm:inline-flex">Załóż konto</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
