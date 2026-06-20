import Link from "next/link";

interface DashboardNavProps {
  links: { href: string; label: string }[];
}

export function DashboardNav({ links }: DashboardNavProps) {
  return (
    <nav className="mb-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-xl border border-indigo-100 bg-white px-4 py-2 font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
