"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sectionLinks = [
  { href: "/nauczyciel/uczniowie", label: "Lista uczniów", exact: true },
  { href: "/nauczyciel/uczniowie/dodaj-klase", label: "Dodaj szkołę i klasę" },
  { href: "/nauczyciel/uczniowie/zaproszenia", label: "Zaproszenia" },
];

function isSectionActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentsSectionNav() {
  const pathname = usePathname();

  return (
    <nav
      className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5"
      aria-label="Sekcja uczniów"
    >
      <ul className="grid grid-cols-1 gap-1 min-[480px]:grid-cols-3 sm:flex sm:flex-wrap sm:gap-1">
        {sectionLinks.map((link) => {
          const active = isSectionActive(pathname, link.href, link.exact);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block rounded-lg px-2 py-2 text-center text-xs font-semibold transition min-[480px]:text-sm sm:px-3 sm:text-left ${
                  active
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
