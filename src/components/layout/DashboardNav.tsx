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
      className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"
      aria-label="Menu panelu"
    >
      <ul className="grid grid-cols-2 gap-1 min-[480px]:grid-cols-3 sm:flex sm:flex-wrap sm:gap-1">
        {links.map((link) => {
          const active = isActive(pathname, link.href);

          return (
            <li key={link.href} className="min-w-0 sm:flex-initial">
              <Link
                href={link.href}
                className={`block rounded-lg px-2 py-2 text-center text-xs font-semibold transition min-[480px]:text-sm sm:px-3 sm:text-left ${
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
