import { cn } from "@/lib/cn";
import { DashboardNav } from "@/components/layout/DashboardNav";
import type { DashboardNavCategory } from "@/data/dashboardNav";

interface PanelShellProps {
  children: React.ReactNode;
  categories: DashboardNavCategory[];
  className?: string;
}

export function PanelShell({ children, categories, className }: PanelShellProps) {
  return (
    <main className={cn("mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8", className)}>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64 xl:w-72">
          <DashboardNav categories={categories} />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}
