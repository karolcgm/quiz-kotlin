"use client";

import { Card } from "@/components/ui/Card";
import { ClockFaceVisual } from "@/components/simulations/shared/ClockFaceVisual";
import { NumericStepper, TaskAnswerPanel } from "@/components/simulations/shared/NumericStepper";
import {
  allowedMinutes,
  clockMinuteStep,
  formatDigitalTime,
  normalizeHour,
  normalizeMinute,
} from "@/lib/math/clock";
import { isClockParams } from "@/lib/simulations/simulatorTaskMode";
import type { ClockQuestionParams, TestWidgetParams } from "@/types/testWidget";

function LessonNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
      {children}
    </div>
  );
}

interface InteractiveClockVisualProps {
  slug: string;
  params: TestWidgetParams;
  targetParams: TestWidgetParams | null;
  mode: "demo" | "task";
  showSolution: boolean;
  compactChrome?: boolean;
  numericResult: number | null;
  onNumericResultChange: (value: number) => void;
  onChange: (params: TestWidgetParams) => void;
}

export function InteractiveClockVisual({
  slug,
  params,
  targetParams,
  mode,
  showSolution,
  compactChrome = false,
  numericResult,
  onNumericResultChange,
  onChange,
}: InteractiveClockVisualProps) {
  if (!isClockParams(params)) {
    return null;
  }

  const display: ClockQuestionParams =
    mode === "task" && targetParams && isClockParams(targetParams) ? targetParams : params;
  const fullHoursOnly = allowedMinutes(slug).length === 1;
  const minuteStep = clockMinuteStep(slug);
  const userAnswer = numericResult ?? 0;
  const hideSolution = mode === "task" && !showSolution;
  const expected =
    display.ask === "minute" ? normalizeMinute(display.minute, minuteStep) : normalizeHour(display.hour);
  const answerMin = display.ask === "minute" ? 0 : 1;
  const answerMax = display.ask === "minute" ? 45 : 12;
  const answerStep = display.ask === "minute" ? minuteStep : 1;

  const setHour = (hour: number) => {
    onChange({ ...params, hour: normalizeHour(hour), minute: fullHoursOnly ? 0 : params.minute });
  };

  const setMinute = (minute: number) => {
    const allowed = allowedMinutes(slug);
    const normalized = normalizeMinute(minute, minuteStep);
    const snapped = allowed.includes(normalized)
      ? normalized
      : allowed.reduce((best, candidate) =>
          Math.abs(candidate - normalized) < Math.abs(best - normalized) ? candidate : best,
        allowed[0]);
    onChange({ ...params, minute: snapped });
  };

  return (
    <Card className="space-y-4">
      {!compactChrome && (
        <>
          <h3 className="text-2xl font-bold text-slate-900">
            {fullHoursOnly ? "Zegar — pełne godziny" : "Zegar — odczyt czasu"}
          </h3>
          <p className="text-sm font-semibold text-slate-600">
            {mode === "task"
              ? display.ask === "minute"
                ? "Odczytaj, ile minut wskazuje długa wskazówka."
                : "Odczytaj, którą godzinę wskazuje krótka wskazówka."
              : "Przesuwaj wskazówki i obserwuj zapis cyfrowy."}
          </p>
        </>
      )}

      <ClockFaceVisual
        hour={display.hour}
        minute={display.minute}
        showDigital={mode === "demo" || showSolution}
      />

      {mode === "demo" && !compactChrome && (
        <div className="grid gap-3 sm:grid-cols-2">
          <NumericStepper
            label="Godzina (krótka wskazówka)"
            value={params.hour}
            onChange={setHour}
            step={1}
            min={1}
          />
          {!fullHoursOnly && (
            <NumericStepper
              label="Minuty (długa wskazówka)"
              value={params.minute}
              onChange={setMinute}
              step={15}
              min={0}
            />
          )}
          {!fullHoursOnly && (
            <label className="space-y-1 text-sm font-semibold text-slate-700 sm:col-span-2">
              Typ pytania
              <select
                value={params.ask}
                onChange={(event) =>
                  onChange({ ...params, ask: event.target.value as ClockQuestionParams["ask"] })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                <option value="hour">Odczyt godziny</option>
                <option value="minute">Odczyt minut</option>
              </select>
            </label>
          )}
        </div>
      )}

      <TaskAnswerPanel
        mode={mode}
        label={display.ask === "minute" ? "Ile minut?" : "Która godzina?"}
        value={userAnswer}
        onChange={(value) => {
          if (display.ask === "minute") {
            onNumericResultChange(normalizeMinute(value, minuteStep));
            return;
          }
          onNumericResultChange(normalizeHour(value));
        }}
        showSolution={showSolution}
        expected={expected}
        step={answerStep}
        min={answerMin}
        max={answerMax}
        suffix={display.ask === "minute" ? " min" : undefined}
        compactChrome={compactChrome}
      />

      {!hideSolution && !compactChrome && (
        <p className="text-center text-lg font-bold text-indigo-700">
          {display.ask === "minute"
            ? `${display.minute} minut`
            : `Godzina ${normalizeHour(display.hour)} (${formatDigitalTime(display.hour, display.minute)})`}
        </p>
      )}

      {!compactChrome && (
        <LessonNote>
          {fullHoursOnly
            ? "Przy pełnych godzinach długa wskazówka stoi na 12, a krótka wskazuje godzinę. Użyj + / −, aby wpisać odpowiedź."
            : "Długa wskazówka pokazuje minuty (0, 15, 30, 45), krótka — godzinę. Ćwicz odczyt przed zapisem cyfrowym."}
        </LessonNote>
      )}
    </Card>
  );
}
