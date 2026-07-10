"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MainNavLink } from "@/data/dashboardNav";
import { cn } from "@/lib/cn";

interface ShellNavProps {
  links: MainNavLink[];
  variant?: "sidebar" | "tabs";
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/nauczyciel" || href === "/uczen") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ShellNav({ links, variant = "sidebar" }: ShellNavProps) {
  const pathname = usePathname();

  if (variant === "tabs") {
    return (
      <nav
        className="rounded-[var(--radius-card)] border border-slate-200 bg-[var(--surface)] p-1.5 shadow-sm"
        aria-label="Menu panelu"
      >
        <ul className="grid grid-cols-2 gap-1 min-[480px]:grid-cols-3 sm:flex sm:flex-wrap">
          {links.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <li key={link.href} className="min-w-0">
                <Link
                  href={link.href}
                  className={cn(
                    "block rounded-[var(--radius-button)] px-3 py-2 text-center text-xs font-semibold transition min-[480px]:text-sm sm:text-left",
                    active
                      ? "bg-[var(--brand-600)] text-white shadow-sm"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
                  )}
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

  return (
    <nav aria-label="Menu główne" className="min-w-0">
      <ul className="space-y-1">
        {links.map((link) => {
          const active = isNavActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "block rounded-[var(--radius-button)] px-3 py-2.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]",
                  active
                    ? "bg-[var(--brand-600)] text-white shadow-sm"
                    : "text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
                )}
              >
                <span className="block text-sm font-semibold">{link.label}</span>
                {link.description ? (
                  <span
                    className={cn(
                      "mt-0.5 block text-xs font-normal",
                      active ? "text-indigo-100" : "text-slate-500",
                    )}
                  >
                    {link.description}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
