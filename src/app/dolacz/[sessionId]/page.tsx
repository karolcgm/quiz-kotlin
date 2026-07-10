import Link from "next/link";
import { StudentJoinSessionForm } from "@/components/live/StudentJoinSessionForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  return { title: `Dołącz do lekcji · ${sessionId.slice(0, 8)}…` };
}

export default async function JoinSessionPage({ params }: PageProps) {
  const { sessionId } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Dołącz do lekcji</h1>
        <p className="text-sm text-[var(--ink-muted)]">
          Wpisz kod z tablicy. Musisz być zalogowany jako uczeń tej klasy.
        </p>
      </div>
      <StudentJoinSessionForm sessionId={sessionId} />
      <p className="text-center text-sm text-[var(--ink-muted)]">
        <Link href="/logowanie" className="font-semibold text-indigo-600 hover:underline">
          Zaloguj się
        </Link>
        {" · "}
        <Link href="/uczen" className="font-semibold text-indigo-600 hover:underline">
          Panel ucznia
        </Link>
      </p>
    </main>
  );
}
