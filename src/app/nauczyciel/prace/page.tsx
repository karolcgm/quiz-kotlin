import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Prace",
};

const workModules = [
  {
    href: "/nauczyciel/prace/testy",
    title: "Sprawdziany i testy",
    description: "Twórz testy z widgetów, wysyłaj klasie, zbieraj wyniki cyfrowo.",
    tone: "assess" as const,
    status: "Dostępne",
  },
  {
    href: "/nauczyciel/prace/zadania",
    title: "Zadania i praca domowa",
    description: "Okno OD–DO, raport oddań, przypisanie do klasy lub uczniów.",
    tone: "learn" as const,
    status: "Dostępne",
  },
  {
    href: "/nauczyciel/lekcje/m5-1-4-rezyser-dzialan-v1/generator",
    title: "Generator A/B — M5-1.4",
    description: "Kartkówka z blueprintu: wersje A/B, checksum, klucz nauczyciela i druk A4.",
    tone: "assess" as const,
    status: "Pilotaż",
  },
  {
    href: "/nauczyciel/lekcje/m5-1-4-rezyser-dzialan-v1/generator/wyniki?blueprint=m514-kartkowka-v1&version=A",
    title: "Wyniki papierowe M5-1.4",
    description: "Szybkie wpisywanie punktów z arkusza A/B — Tab, autosave, zatwierdzenie.",
    tone: "assess" as const,
    status: "Pilotaż",
  },
  {
    href: "/nauczyciel/lekcje/m5-1-4-rezyser-dzialan-v1/druk",
    title: "Materiały statyczne M5-1.4",
    description: "Karty kroków, bilet wyjścia i praca bez urządzeń — gotowe arkusze lekcji.",
    tone: "neutral" as const,
    status: "Dostępne",
  },
];

export default function TeacherWorksPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--ink)]">Prace</h2>
        <p className="text-sm text-[var(--ink-muted)]">
          Jedno miejsce na zadania cyfrowe, sprawdziany, generator A/B i wpisywanie wyników papierowych.
          Stare adresy <code className="text-xs">/testy</code> i <code className="text-xs">/zadania</code>{" "}
          przekierowują tutaj.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {workModules.map((module) => (
          <Link key={module.href} href={module.href} className="group block">
            <Card className="flex h-full flex-col transition group-hover:border-[var(--brand-600)] group-hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={module.tone}>{module.status}</Badge>
              </div>
              <h3 className="mt-3 text-lg font-bold text-[var(--ink)]">{module.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                {module.description}
              </p>
              <span className="mt-4 text-sm font-semibold text-[var(--brand-600)]">Przejdź →</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
