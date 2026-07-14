import { GAME_DIFFICULTY_LABELS, type GameDifficulty } from "@/lib/materials/gameDifficulty";

interface GameDifficultyPickerProps {
  value: GameDifficulty;
  onChange: (difficulty: GameDifficulty) => void;
  descriptions: Record<GameDifficulty, string>;
  accent?: "cyan" | "violet" | "indigo";
}

const ACCENT_CLASSES = {
  cyan: "border-cyan-500 bg-cyan-50 text-cyan-950 ring-cyan-200",
  violet: "border-violet-500 bg-violet-50 text-violet-950 ring-violet-200",
  indigo: "border-indigo-500 bg-indigo-50 text-indigo-950 ring-indigo-200",
};

export function GameDifficultyPicker({
  value,
  onChange,
  descriptions,
  accent = "cyan",
}: GameDifficultyPickerProps) {
  return <fieldset className="mt-5">
    <legend className="mx-auto text-sm font-black uppercase tracking-[.14em] text-slate-700">Poziom trudności</legend>
    <div className="mt-2 grid grid-cols-3 gap-2">
      {(Object.keys(GAME_DIFFICULTY_LABELS) as GameDifficulty[]).map((difficulty) => {
        const selected = value === difficulty;
        return <button
          key={difficulty}
          type="button"
          aria-pressed={selected}
          onClick={() => onChange(difficulty)}
          className={`min-h-16 rounded-xl border-2 px-2 py-2 text-center transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${selected ? `${ACCENT_CLASSES[accent]} ring-2` : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
        >
          <span className="block text-sm font-black sm:text-base">{GAME_DIFFICULTY_LABELS[difficulty]}</span>
          <span className="mt-0.5 block text-[10px] font-semibold leading-tight sm:text-xs">{descriptions[difficulty]}</span>
        </button>;
      })}
    </div>
  </fieldset>;
}
