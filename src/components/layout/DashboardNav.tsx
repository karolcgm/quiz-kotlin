"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavCategory, DashboardNavLink } from "@/data/dashboardNav";

interface DashboardNavProps {
  categories: DashboardNavCategory[];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/nauczyciel" || href === "/uczen") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinkItem({ link, pathname }: { link: DashboardNavLink; pathname: string }) {
  if (link.soon || !link.href) {
    return (
      <span className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400">
        <span>{link.label}</span>
        <span className="text-[0.65rem] font-semibold uppercase tracking-wide">wkrótce</span>
      </span>
    );
  }

  const active = isActive(pathname, link.href);

  return (
    <Link
      href={link.href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {link.label}
    </Link>
  );
}

export function DashboardNav({ categories }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label="Menu panelu"
    >
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">Menu</p>
      <div className="space-y-5">
        {categories.map((category) => (
          <section key={category.title}>
            <h2 className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-wider text-indigo-600">
              {category.title}
            </h2>
            <ul className="space-y-0.5">
              {category.links.map((link) => (
                <li key={`${category.title}-${link.label}`}>
                  <NavLinkItem link={link} pathname={pathname} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
