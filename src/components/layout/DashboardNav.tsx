"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MainNavLink } from "@/data/dashboardNav";

interface DashboardNavProps {
  links: MainNavLink[];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/nauczyciel" || href === "/uczen") {
    return pathname === href;
  }

  if (href === "/symulacje") {
    return pathname.startsWith("/symulacje");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ links }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="overflow-x-auto rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
      aria-label="Menu panelu"
    >
      <ul className="flex min-w-max items-center gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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
