import { cn } from "@/lib/cn";
import { DashboardNav } from "@/components/layout/DashboardNav";
import type { MainNavLink } from "@/data/dashboardNav";

interface PanelShellProps {
  children: React.ReactNode;
  links: MainNavLink[];
  className?: string;
}

export function PanelShell({ children, links, className }: PanelShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8", className)}>
      <DashboardNav links={links} />
      <div className="mt-6 min-w-0">{children}</div>
    </main>
  );
}
