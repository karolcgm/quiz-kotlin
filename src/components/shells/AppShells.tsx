import { cn } from "@/lib/cn";
import { ShellNav } from "@/components/shells/ShellNav";
import type { MainNavLink } from "@/data/dashboardNav";

interface TeacherShellProps {
  children: React.ReactNode;
  links: MainNavLink[];
  title?: string;
  className?: string;
}

export function TeacherShell({ children, links, title, className }: TeacherShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8", className)}>
      <div className="teacher-shell-chrome mb-4 flex flex-col gap-1 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            Panel nauczyciela
          </p>
          {title ? <h1 className="text-2xl font-bold text-[var(--ink)]">{title}</h1> : null}
        </div>
        <p className="text-sm text-[var(--ink-muted)]">
          Matematyka · klasa V · plan <span className="font-mono text-xs">2026/2027</span>
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[var(--shell-sidebar-width)_minmax(0,1fr)]">
        <aside className="teacher-shell-chrome hidden xl:block">
          <div className="sticky top-6 rounded-[var(--radius-card)] border border-slate-200 bg-[var(--surface)] p-3 shadow-sm">
            <ShellNav links={links} variant="sidebar" />
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="teacher-shell-chrome xl:hidden">
            <ShellNav links={links} variant="tabs" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

interface StudentShellProps {
  children: React.ReactNode;
  links: MainNavLink[];
  title?: string;
  className?: string;
}

export function StudentShell({ children, links, title, className }: StudentShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8", className)}>
      {title ? (
        <header className="mb-4 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-[var(--ink)]">{title}</h1>
        </header>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[var(--shell-sidebar-width)_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-6 rounded-[var(--radius-card)] border border-slate-200 bg-[var(--surface)] p-3 shadow-sm">
            <ShellNav links={links} variant="sidebar" />
          </div>
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="xl:hidden">
            <ShellNav links={links} variant="tabs" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Widok tablicy — bez globalnego header/footer (spec §10.3) */
export function BoardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col">{children}</div>
    </div>
  );
}

/** Layout druku A4 — bez nawigacji portalu (spec §18.4, §33) */
export function PrintShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-shell print-document bg-white text-black" role="document">
      {children}
    </div>
  );
}
