import { cn } from "@/lib/cn";

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
}: SliderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-base font-medium text-slate-800 sm:text-lg">
          {label}
        </label>
        <span className="min-w-12 rounded-lg bg-indigo-50 px-3 py-1 text-center text-lg font-bold text-indigo-700">
          {value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-3 w-full cursor-pointer accent-indigo-600"
      />
    </div>
  );
}
