"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  FIND_SCALE_TASKS,
  MAP_DISTANCE_TASKS,
  READ_SCALE_TASKS,
  REAL_DISTANCE_TASKS,
  type MapScaleActivity,
  type MapScaleTask,
} from "@/lib/math/everyday/mapScale";

interface Props {
  activity: MapScaleActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

const formatNumber = (value: number) => new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 4,
}).format(value);

function ScaleStrip({
  mapLabel,
  realLabel,
  scaleDenominator,
}: {
  mapLabel: string;
  realLabel: string;
  scaleDenominator?: number;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-sky-50 via-emerald-50 to-amber-50 p-4 shadow-sm" data-scale-strip>
      <div className="relative mx-auto h-36 max-w-2xl" role="img" aria-label={`${mapLabel} na mapie odpowiada ${realLabel} w terenie`}>
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "linear-gradient(30deg, transparent 48%, #94a3b8 49%, #94a3b8 51%, transparent 52%), linear-gradient(150deg, transparent 48%, #cbd5e1 49%, #cbd5e1 51%, transparent 52%)", backgroundSize: "76px 76px" }} />
        <div className="absolute left-[10%] right-[10%] top-1/2 h-3 -translate-y-1/2 rounded-full bg-violet-700 shadow-lg">
          <span className="absolute -left-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-4 border-white bg-rose-500 shadow" />
          <span className="absolute -right-3 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full border-4 border-white bg-emerald-500 shadow" />
        </div>
        <div className="absolute inset-x-0 bottom-1 flex justify-between px-[6%] text-center text-sm font-black text-slate-950 sm:text-base">
          <span className="rounded-xl bg-white/90 px-3 py-2 shadow">{mapLabel}<small className="block text-slate-600">na mapie</small></span>
          <span className="rounded-xl bg-white/90 px-3 py-2 shadow">{realLabel}<small className="block text-slate-600">w terenie</small></span>
        </div>
      </div>
      {scaleDenominator ? <p className="mt-2 text-center text-lg font-black text-indigo-950">Skala 1 : {scaleDenominator.toLocaleString("pl-PL")}</p> : null}
    </div>
  );
}

function ScaleGuide() {
  const [denominator, setDenominator] = useState(30000);
  const centimeters = denominator;
  const meters = centimeters / 100;
  const kilometers = centimeters / 100000;

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 3"
      heading="Co oznacza skala?"
      description="W zapisie 1 : n obie liczby opisują tę samą jednostkę. Najwygodniej zacząć od centymetrów."
      data-map-scale="scale-guide"
    >
      <div className="grid gap-5">
        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center">
          <p className="text-lg font-black text-slate-950">Skala 1 : 30 000 oznacza:</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xl font-black">
            <span className="rounded-2xl bg-white px-4 py-3 shadow">1 cm na mapie</span>
            <span>=</span>
            <span className="rounded-2xl bg-white px-4 py-3 shadow">30 000 cm w terenie</span>
            <span>=</span>
            <span className="rounded-2xl bg-white px-4 py-3 shadow">300 m</span>
            <span>=</span>
            <span className="rounded-2xl bg-white px-4 py-3 shadow">0,3 km</span>
          </div>
        </section>

        <section className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-5">
          <h3 className="text-center text-xl font-black text-amber-950">Zawsze pracuj w trzech krokach</h3>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            <li className="rounded-2xl bg-white p-4 font-bold shadow-sm"><b className="block text-violet-700">1. Odczytaj</b> 1 cm na mapie odpowiada liczbie centymetrów zapisanej po dwukropku.</li>
            <li className="rounded-2xl bg-white p-4 font-bold shadow-sm"><b className="block text-violet-700">2. Zamień</b> 100 cm = 1 m, a 100 000 cm = 1 km.</li>
            <li className="rounded-2xl bg-white p-4 font-bold shadow-sm"><b className="block text-violet-700">3. Sprawdź</b> Im większa liczba po dwukropku, tym większy obszar pokazuje mapa.</li>
          </ol>
        </section>

        <section className="grid gap-3">
          <h3 className="text-center text-xl font-black text-slate-950">Zmieniaj skalę i obserwuj znaczenie 1 cm</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {[5000, 30000, 100000, 200000].map((value) => (
              <LessonTaskChoice key={value} selected={denominator === value} onClick={() => setDenominator(value)}>
                1 : {value.toLocaleString("pl-PL")}
              </LessonTaskChoice>
            ))}
          </div>
          <ScaleStrip
            mapLabel="1 cm"
            realLabel={kilometers >= 1 ? `${formatNumber(kilometers)} km` : `${formatNumber(meters)} m`}
            scaleDenominator={denominator}
          />
        </section>

        <aside className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">
          W drugą stronę: jeśli 1 cm odpowiada 2 km, zamień 2 km na 200 000 cm. Otrzymasz skalę 1 : 200 000.
        </aside>
      </div>
    </LessonTaskFrame>
  );
}

function taskSet(activity: Exclude<MapScaleActivity, "scale-guide">) {
  if (activity === "read-scale") return READ_SCALE_TASKS;
  if (activity === "find-scale") return FIND_SCALE_TASKS;
  if (activity === "real-distance") return REAL_DISTANCE_TASKS;
  return MAP_DISTANCE_TASKS;
}

function seriesTitle(activity: Exclude<MapScaleActivity, "scale-guide">) {
  if (activity === "read-scale") return ["Odczytywanie skali", "Odczytaj, jakiej odległości w terenie odpowiada 1 cm."];
  if (activity === "find-scale") return ["Wyznaczanie skali", "Zamień odległość rzeczywistą na centymetry i uzupełnij skalę 1 : n."];
  if (activity === "real-distance") return ["Odległość w terenie", "Pomnóż długość na mapie przez liczbę zapisaną w skali, a potem zamień jednostkę."];
  return ["Odległość na mapie", "Zamień odległość rzeczywistą na centymetry i podziel przez liczbę zapisaną w skali."];
}

function ScaleTaskVisual({ task }: { task: MapScaleTask }) {
  const mapLabel = task.mapCentimeters ? `${task.mapCentimeters} cm` : "? cm";
  const realLabel = task.realDistance ?? (task.answerKind === "distance" && task.answerUnit !== "cm" ? `? ${task.answerUnit}` : "odległość w terenie");
  return <ScaleStrip mapLabel={mapLabel} realLabel={realLabel} scaleDenominator={task.scaleDenominator} />;
}

function ScaleSeries({ activity, readOnly = false, onResultChange }: Props & { activity: Exclude<MapScaleActivity, "scale-guide"> }) {
  const tasks = taskSet(activity);
  const [heading, description] = seriesTitle(activity);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [workValues, setWorkValues] = useState(["", ""]);
  const [activeField, setActiveField] = useState<"answer" | "work-0" | "work-1">(
    activity === "real-distance" || activity === "map-distance" ? "work-0" : "answer",
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index];
  const hasWorkspace = activity === "real-distance" || activity === "map-distance";
  const guidedStep = index === 0 && hasWorkspace
    ? activity === "real-distance"
      ? { label: "Najpierw oblicz: 1 cm na mapie to", answer: 0.5, unit: "km" }
      : { label: "Najpierw oblicz: 1 cm na mapie to", answer: 2, unit: "km" }
    : null;
  const correctAnswerLabel = task.answerKind === "scale"
    ? `1 : ${task.answer.toLocaleString("pl-PL")}`
    : `${formatNumber(task.answer)}${task.answerUnit ? ` ${task.answerUnit}` : ""}`;

  const showTask = (nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(tasks.length - 1, nextIndex));
    setIndex(safeIndex);
    setValue("");
    setWorkValues(["", ""]);
    setActiveField(activity === "real-distance" || activity === "map-distance" ? "work-0" : "answer");
    setFeedback(null);
    setMistakeMade(false);
    onResultChange?.(null);
  };

  const advance = (currentCorrect: boolean) => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, value);
      return;
    }
    setIndex((current) => current + 1);
    setValue("");
    setWorkValues(["", ""]);
    setActiveField(hasWorkspace ? "work-0" : "answer");
    setFeedback(null);
    onResultChange?.(null);
  };

  const edit = (key: string) => {
    if (readOnly || feedback === "correct") return;
    const editCurrent = (current: string) => {
      if (key === "backspace") return current.slice(0, -1);
      if (key === "," && current.includes(",")) return current;
      if (key === "," && !current) return "0,";
      return `${current}${key}`.slice(0, 8);
    };
    if (activeField === "answer") {
      setValue(editCurrent);
    } else {
      const workIndex = activeField === "work-0" ? 0 : 1;
      setWorkValues((current) => current.map((entry, position) => position === workIndex ? editCurrent(entry) : entry));
    }
    setFeedback(null);
  };

  const check = () => {
    if (!value.trim() || (guidedStep && !workValues[0].trim())) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const parsed = Number(value.replace(",", "."));
    const guidedValue = Number(workValues[0].replace(",", "."));
    const guidedCorrect = !guidedStep || (Number.isFinite(guidedValue) && Math.abs(guidedValue - guidedStep.answer) < 0.000001);
    const correct = guidedCorrect && Number.isFinite(parsed) && Math.abs(parsed - task.answer) < 0.000001;
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 650);
    else {
      setMistakeMade(true);
      onResultChange?.(null, value);
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 3"
      heading={heading}
      description={description}
      questionNumber={index + 1}
      questionCount={tasks.length}
      data-map-scale={activity}
    >
      <div className="grid gap-5">
        {readOnly ? (
          <nav
            aria-label="Nawigacja po zadaniach"
            className="grid grid-cols-2 gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-3"
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={() => showTask(index - 1)}
              className="min-h-11 rounded-xl border border-indigo-200 bg-white px-3 font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Poprzednie zadanie
            </button>
            <button
              type="button"
              disabled={index === tasks.length - 1}
              onClick={() => showTask(index + 1)}
              className="min-h-11 rounded-xl border border-indigo-200 bg-white px-3 font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Następne zadanie →
            </button>
          </nav>
        ) : null}
        <section className="rounded-3xl border-2 border-indigo-200 bg-white p-5 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
        </section>

        <ScaleTaskVisual task={task} />

        {hasWorkspace ? (
          <section className="grid gap-3 rounded-3xl border-2 border-cyan-200 bg-cyan-50 p-4">
            <h3 className="text-center text-lg font-black text-cyan-950">
              {guidedStep ? "Podpowiedź — zacznij od jednego centymetra" : "Miejsce na obliczenia pomocnicze"}
            </h3>
            {guidedStep ? (
              <label className={`mx-auto grid w-full max-w-md gap-2 rounded-2xl border-2 bg-white p-4 text-center ${activeField === "work-0" ? "border-cyan-600 ring-4 ring-cyan-100" : "border-cyan-200"}`}>
                <span className="font-black text-slate-800">{guidedStep.label}</span>
                <span className="flex items-center justify-center gap-2">
                  <input
                    aria-label="Pierwszy krok obliczenia"
                    inputMode="none"
                    readOnly
                    value={workValues[0]}
                    onClick={() => setActiveField("work-0")}
                    onFocus={() => setActiveField("work-0")}
                    className="h-14 w-32 rounded-xl border-2 border-cyan-300 bg-white text-center text-2xl font-black text-slate-950 outline-none"
                  />
                  <b className="text-lg text-slate-950">{guidedStep.unit}</b>
                </span>
              </label>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {workValues.map((workValue, workIndex) => {
                  const fieldId = workIndex === 0 ? "work-0" : "work-1";
                  return (
                    <label
                      key={fieldId}
                      className={`grid gap-2 rounded-2xl border-2 bg-white p-3 text-center ${activeField === fieldId ? "border-cyan-600 ring-4 ring-cyan-100" : "border-cyan-200"}`}
                    >
                      <span className="font-black text-slate-700">Obliczenie {workIndex + 1}</span>
                      <input
                        aria-label={`Obliczenie pomocnicze ${workIndex + 1}`}
                        inputMode="none"
                        readOnly
                        value={workValue}
                        onClick={() => setActiveField(fieldId)}
                        onFocus={() => setActiveField(fieldId)}
                        className="h-14 w-full rounded-xl border-2 border-cyan-300 bg-white text-center text-2xl font-black text-slate-950 outline-none"
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        ) : null}

        <label className="mx-auto grid w-full max-w-md gap-2 rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-center">
          <span className="font-black text-violet-950">{task.answerKind === "scale" ? "Uzupełnij skalę" : "Wpisz odległość"}</span>
          <span className="flex items-center justify-center gap-2 text-2xl font-black text-slate-950">
            {task.answerKind === "scale" ? <span>1 :</span> : null}
            <input
              aria-label={task.answerKind === "scale" ? "Liczba po dwukropku w skali" : "Wynik"}
              inputMode="none"
              readOnly
              value={value}
              onClick={() => setActiveField("answer")}
              onFocus={() => setActiveField("answer")}
              className="h-14 w-36 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black outline-none focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
            />
            {task.answerUnit ? <span>{task.answerUnit}</span> : null}
          </span>
        </label>

        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wynik przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">✓ Dobrze. {index === tasks.length - 1 ? "Seria jest ukończona." : "Za chwilę pojawi się następne zadanie."}</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3">
            <div role="status" className="rounded-xl bg-rose-100 p-3 text-center text-rose-950">
              <p className="text-lg font-black">Spróbuj innym razem. Poprawny wynik to {correctAnswerLabel}. Dziś bez punktu.</p>
              <p className="mt-1 font-bold">{task.hint}</p>
            </div>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}

        {!readOnly && feedback !== "correct" && feedback !== "incorrect" ? (
          <LessonNumericKeypad
            onKey={edit}
            onConfirm={check}
            allowSeparator={task.answerKind === "distance"}
            label="Kalkulator do skali"
            helperText="Wpisz samą liczbę. Jednostka lub zapis 1 : są już podane."
          />
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

export function MapScaleLessonLab(props: Props) {
  if (props.activity === "scale-guide") return <ScaleGuide />;
  return <ScaleSeries key={props.activity} {...props} activity={props.activity} />;
}
