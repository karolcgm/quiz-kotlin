import type { BoardConnectionState } from "@/lib/live/useBoardSessionSync";

const LABELS: Record<BoardConnectionState, string> = {
  live: "Połączono",
  syncing: "Synchronizacja…",
  offline: "Brak połączenia",
};

const TONES: Record<BoardConnectionState, string> = {
  live: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/40",
  syncing: "bg-amber-500/20 text-amber-100 ring-amber-400/40",
  offline: "bg-rose-500/20 text-rose-100 ring-rose-400/40",
};

interface BoardConnectionBadgeProps {
  state: BoardConnectionState;
}

export function BoardConnectionBadge({ state }: BoardConnectionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${TONES[state]}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          state === "live" ? "bg-emerald-400" : state === "syncing" ? "animate-pulse bg-amber-300" : "bg-rose-400"
        }`}
        aria-hidden
      />
      {LABELS[state]}
    </span>
  );
}
