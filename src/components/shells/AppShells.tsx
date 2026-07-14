import { cn } from "@/lib/cn";
import { ShellNav } from "@/components/shells/ShellNav";
import type { MainNavLink } from "@/data/dashboardNav";
import { TeacherContextSwitcher } from "@/components/teacher/TeacherContextSwitcher";
import type { SelectedTeacherContext, TeacherClassContext } from "@/lib/teacher/context";
import { signOutAction } from "@/lib/actions/auth";
import { SharedDeviceSessionGuard } from "@/components/auth/SharedDeviceSessionGuard";

interface TeacherShellProps {
  children: React.ReactNode;
  links: MainNavLink[];
  title?: string;
  className?: string;
  context?: { classes: TeacherClassContext[]; selected: SelectedTeacherContext };
}

export function TeacherShell({ children, links, title, className, context }: TeacherShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8", className)}>
      <div className="teacher-shell-chrome mb-4 flex flex-col gap-1 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            Panel nauczyciela
          </p>
          {title ? <h1 className="text-2xl font-bold text-[var(--ink)]">{title}</h1> : null}
        </div>
        {context ? <TeacherContextSwitcher classes={context.classes} selected={context.selected} /> : null}
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
  style?: React.CSSProperties;
}

export function StudentShell({ children, links, title, className, style }: StudentShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8", className)} style={style}>
      <SharedDeviceSessionGuard />
      {title ? (
        <header className="mb-4 border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-bold text-[var(--ink)]">{title}</h1>
        </header>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[var(--shell-sidebar-width)_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-6 rounded-[var(--radius-card)] border border-slate-200 bg-[var(--surface)] p-3 shadow-sm">
            <ShellNav links={links} variant="sidebar" />
            <form action={signOutAction} className="mt-4 border-t-2 border-slate-100 pt-4">
              <button
                type="submit"
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-red-200 transition hover:-translate-y-0.5 hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <span aria-hidden="true">↪</span>
                Wyloguj z tabletu
              </button>
            </form>
          </div>
        </aside>
        <div className="min-w-0 space-y-6">
          <div className="xl:hidden">
            <ShellNav links={links} variant="tabs" />
            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-red-200 transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <span aria-hidden="true">↪</span>
                Wyloguj z tabletu
              </button>
            </form>
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
    <div data-board-shell className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col">{children}</div>
    </div>
  );
}

/** Layout druku A4 — bez nawigacji portalu (spec §18.4, §33) */
export function PrintShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-print-shell className="print-shell print-document bg-white text-black" role="document">
      {children}
    </div>
  );
}
