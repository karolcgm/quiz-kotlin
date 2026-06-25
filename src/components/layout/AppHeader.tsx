import Link from "next/link";
import { LekcjaLabLogo } from "@/components/brand/LekcjaLabLogo";
import { signOutAction } from "@/lib/actions/auth";
import { NotificationBellWrapper } from "@/components/notifications/NotificationBellWrapper";
import { getCurrentProfile, getRoleHomePath } from "@/lib/auth/session";

const navLinks = [
  { href: "/klasy", label: "Klasy" },
  { href: "/symulacje", label: "Pomoce na lekcję" },
];

export async function AppHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group">
          <LekcjaLabLogo size="sm" variant="color" showTagline animated />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700 sm:px-4 sm:text-base"
            >
              {link.label}
            </Link>
          ))}
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
            <Link
              href="/logowanie"
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:px-4 sm:text-base"
            >
              Zaloguj
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
