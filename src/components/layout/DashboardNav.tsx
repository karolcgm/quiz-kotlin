"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardNavCategory } from "@/data/dashboardNav";

interface DashboardNavProps {
  categories: DashboardNavCategory[];
  variant?: "full" | "compact";
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/nauczyciel" || href === "/uczen") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ categories, variant = "compact" }: DashboardNavProps) {
  const pathname = usePathname();

  if (variant === "full") {
    return (
      <nav className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Menu panelu">
        {categories.map((category) => (
          <section
            key={category.title}
            className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-4 shadow-sm"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {category.title}
            </h2>
            <ul className="mt-3 space-y-1">
              {category.links.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block rounded-xl px-3 py-2 transition ${
                        active
                          ? "bg-indigo-600 text-white shadow-md"
                          : "text-slate-800 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <span className="font-semibold">{link.label}</span>
                      {link.description && (
                        <span
                          className={`mt-0.5 block text-xs ${active ? "text-indigo-100" : "text-slate-500"}`}
                        >
                          {link.description}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      aria-label="Menu panelu"
    >
      {categories.map((category) => (
        <div
          key={category.title}
          className="flex min-w-[12rem] flex-1 flex-col gap-2 rounded-xl bg-slate-50/80 p-3"
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-indigo-600">
            {category.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {category.links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-white text-indigo-800 ring-1 ring-indigo-100 hover:bg-indigo-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
