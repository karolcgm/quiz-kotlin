import Link from "next/link";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Postępy",
};

const modules = [
  {
    href: "/nauczyciel/postepy/wyniki",
    title: "Wyniki testów",
    description: "Przegląd oddanych prac, oceny, feedback i poprawy.",
  },
  {
    href: "/nauczyciel/postepy/dziennik",
    title: "Dziennik",
    description: "Notatki do ocen i obserwacje o uczniach.",
  },
  {
    href: "/nauczyciel/prace/zadania",
    title: "Raport oddań",
    description: "Kto oddał zadanie, kto jeszcze nie — widok per przypisanie.",
  },
];

export default function TeacherProgressHubPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--ink)]">Postępy</h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Wyniki, dziennik i mapa umiejętności. Stare adresy <code className="text-xs">/wyniki</code> i{" "}
          <code className="text-xs">/dziennik</code> przekierowują tutaj.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <Link key={module.href} href={module.href} className="group block">
            <Card className="h-full transition group-hover:border-[var(--brand-600)] group-hover:shadow-md">
              <h3 className="text-lg font-bold text-[var(--ink)]">{module.title}</h3>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{module.description}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand-600)]">
                Otwórz →
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
