"use client";

import { AssessmentWidgetSimulator } from "@/components/simulations/AssessmentWidgetSimulator";
import { Card } from "@/components/ui/Card";

function NumberLineLessonSection() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <h3 className="text-xl font-bold text-slate-900">Co pokazuje ta symulacja?</h3>
        <p className="mt-3 leading-relaxed text-slate-700">
          Dodawanie liczby dodatniej przesuwa punkt w prawo. Odejmowanie liczby dodatniej przesuwa
          punkt w lewo. Liczby ujemne działają odwrotnie: dodanie ujemnej liczby to ruch w lewo, a
          odjęcie ujemnej — ruch w prawo.
        </p>
      </Card>
      <Card>
        <h3 className="text-xl font-bold text-slate-900">Jak użyć na lekcji?</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed text-slate-700">
          <li>W trybie prezentacji ustaw przykład i omów ruch na osi.</li>
          <li>Przełącz na zadanie na tablicy i wylosuj polecenie.</li>
          <li>Poproś ucznia, by kliknął punkt końcowy na osi.</li>
          <li>Sprawdź odpowiedź lub pokaż rozwiązanie.</li>
        </ol>
      </Card>
    </div>
  );
}

export function NumberLineSimulator() {
  return (
    <>
      <AssessmentWidgetSimulator slug="os-liczbowa" />
      <NumberLineLessonSection />
    </>
  );
}
