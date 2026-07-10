export function BoardPauseOverlay() {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm"
      role="status"
      aria-live="assertive"
    >
      <div className="mx-4 max-w-lg rounded-3xl border border-white/10 bg-slate-900 px-8 py-10 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">Pauza</p>
        <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Poczekaj na nauczyciela</h2>
        <p className="mt-4 text-lg text-slate-300">Lekcja wkrótce ruszy dalej. Twoje odpowiedzi są zapisane.</p>
      </div>
    </div>
  );
}
