"use client";

import { useEffect, useState } from "react";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import {
  AREA_CONVERSION_TASKS,
  LENGTH_CONVERSION_TASKS,
  formatPolishDecimal,
  parsePolishDecimal,
  type AreaUnitConversionActivity,
  type UnitConversionTask,
} from "@/lib/math/area/unitConversion";

interface AreaUnitConversionLabProps {
  activity: AreaUnitConversionActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

function UnitTile({ symbol, name }: { symbol: string; name: string }) {
  return (
    <div className="rounded-2xl border-2 border-indigo-300 bg-white px-2 py-4 text-center shadow-sm">
      <strong className="block text-2xl font-black text-indigo-950">{symbol}</strong>
      <span className="mt-1 block text-xs font-bold text-slate-600">{name}</span>
    </div>
  );
}

function RelationStep({ from, to, factor }: { from: string; to: string; factor: "10" | "100" | "1000" }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-2 py-3 text-center" aria-label={`Z ${from} na ${to} razy ${factor}, z ${to} na ${from} podzielić przez ${factor}`}>
      <span className="block text-xs font-bold text-slate-600">{from} ↔ {to}</span>
      <span className="mt-1 block text-sm font-black text-emerald-800">w prawo: · {factor}</span>
      <span className="block text-sm font-black text-rose-800">w lewo: : {factor}</span>
    </div>
  );
}

function LengthRelationsSlide() {
  const [direction, setDirection] = useState<"smaller" | "larger">("smaller");

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 2"
      heading="Zależności między jednostkami długości"
      description="Gdy przechodzimy do mniejszej jednostki, mnożymy. Gdy przechodzimy do większej jednostki, dzielimy."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="img" aria-label="Schemat jednostek długości od kilometra do milimetra">
          <UnitTile symbol="km" name="kilometr" />
          <UnitTile symbol="m" name="metr" />
          <UnitTile symbol="dm" name="decymetr" />
          <UnitTile symbol="cm" name="centymetr" />
          <UnitTile symbol="mm" name="milimetr" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Kroki między jednostkami długości">
          <RelationStep from="km" to="m" factor="1000" />
          <RelationStep from="m" to="dm" factor="10" />
          <RelationStep from="dm" to="cm" factor="10" />
          <RelationStep from="cm" to="mm" factor="10" />
        </div>
        <section className="rounded-3xl bg-indigo-50 p-4 sm:p-5" aria-label="Interaktywna zasada zamiany jednostek długości">
          <div className="grid gap-2 sm:grid-cols-2">
            <LessonTaskChoice type="button" selected={direction === "smaller"} onClick={() => setDirection("smaller")}>
              Do mniejszej jednostki →
            </LessonTaskChoice>
            <LessonTaskChoice type="button" selected={direction === "larger"} onClick={() => setDirection("larger")}>
              ← Do większej jednostki
            </LessonTaskChoice>
          </div>
          <div className={`mt-4 rounded-2xl p-4 text-center ${direction === "smaller" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`} data-unit-relation-direction={direction}>
            <p className="text-xl font-black">{direction === "smaller" ? "Mnożymy" : "Dzielimy"}</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{direction === "smaller" ? "3 m = 3 · 100 cm = 300 cm" : "560 cm = 560 : 100 m = 5,6 m"}</p>
          </div>
        </section>
        <div className="grid gap-2 rounded-3xl bg-indigo-50 p-5 text-center font-black text-indigo-950 sm:grid-cols-2 lg:grid-cols-4">
          <span>1 km = 1000 m</span>
          <span>1 m = 10 dm</span>
          <span>1 dm = 10 cm</span>
          <span>1 cm = 10 mm</span>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function AreaChain({ units }: { units: { symbol: string; name: string }[] }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {units.map((unit) => <UnitTile key={unit.symbol} symbol={unit.symbol} name={unit.name} />)}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {units.slice(0, -1).map((unit, index) => <RelationStep key={`${unit.symbol}-${units[index + 1]!.symbol}`} from={unit.symbol} to={units[index + 1]!.symbol} factor="100" />)}
      </div>
    </>
  );
}

function AreaRelationsSlide() {
  const [direction, setDirection] = useState<"smaller" | "larger">("smaller");

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 2"
      heading="Zależności między jednostkami pola"
      description="W jednostkach pola każdy krok do mniejszej jednostki oznacza mnożenie przez 100, a każdy krok do większej — dzielenie przez 100."
    >
      <div className="space-y-6">
        <section aria-label="Większe jednostki pola" className="space-y-3 rounded-3xl bg-amber-50 p-5">
          <h3 className="text-center text-lg font-black text-amber-950">Duże powierzchnie</h3>
          <AreaChain units={[
            { symbol: "km²", name: "kilometr kwadratowy" },
            { symbol: "ha", name: "hektar" },
            { symbol: "a", name: "ar" },
            { symbol: "m²", name: "metr kwadratowy" },
          ]} />
        </section>
        <section aria-label="Mniejsze jednostki pola" className="space-y-3 rounded-3xl bg-cyan-50 p-5">
          <h3 className="text-center text-lg font-black text-cyan-950">Mniejsze powierzchnie</h3>
          <AreaChain units={[
            { symbol: "m²", name: "metr kwadratowy" },
            { symbol: "dm²", name: "decymetr kwadratowy" },
            { symbol: "cm²", name: "centymetr kwadratowy" },
            { symbol: "mm²", name: "milimetr kwadratowy" },
          ]} />
          <div className="grid gap-2 pt-2 text-center font-black text-cyan-950 sm:grid-cols-3">
            <span>1 m² = 100 dm²</span>
            <span>1 dm² = 100 cm²</span>
            <span>1 cm² = 100 mm²</span>
          </div>
        </section>
        <section className="rounded-3xl bg-indigo-50 p-4 sm:p-5" aria-label="Interaktywna zasada zamiany jednostek pola">
          <div className="grid gap-2 sm:grid-cols-2">
            <LessonTaskChoice type="button" selected={direction === "smaller"} onClick={() => setDirection("smaller")}>
              Do mniejszej jednostki →
            </LessonTaskChoice>
            <LessonTaskChoice type="button" selected={direction === "larger"} onClick={() => setDirection("larger")}>
              ← Do większej jednostki
            </LessonTaskChoice>
          </div>
          <div className={`mt-4 rounded-2xl p-4 text-center ${direction === "smaller" ? "bg-emerald-100 text-emerald-950" : "bg-rose-100 text-rose-950"}`} data-area-relation-direction={direction}>
            <p className="text-xl font-black">Każdy krok: {direction === "smaller" ? "mnożymy przez 100" : "dzielimy przez 100"}</p>
            <p className="mt-2 text-2xl font-black sm:text-3xl">{direction === "smaller" ? "2 ha = 2 · 100 a = 200 a" : "750 a = 750 : 100 ha = 7,5 ha"}</p>
          </div>
        </section>
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl bg-indigo-50 p-4 text-center font-black text-indigo-950">1 a = 100 m²</p>
          <p className="rounded-2xl bg-indigo-50 p-4 text-center font-black text-indigo-950">1 ha = 100 a = 10 000 m²</p>
          <p className="rounded-2xl bg-indigo-50 p-4 text-center font-black text-indigo-950">1 km² = 100 ha</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function ConversionTaskSeries({
  tasks,
  heading,
  description,
  readOnly,
  kind,
  onResultChange,
}: {
  tasks: UnitConversionTask[];
  heading: string;
  description: string;
  readOnly: boolean;
  kind: "length" | "area";
  onResultChange?: AreaUnitConversionLabProps["onResultChange"];
}) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const task = tasks[taskIndex];

  useEffect(() => {
    if (!solved || taskIndex >= tasks.length - 1) return;
    const timeout = window.setTimeout(() => {
      setTaskIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
      setSolved(false);
      onResultChange?.(null);
    }, 650);
    return () => window.clearTimeout(timeout);
  }, [onResultChange, solved, taskIndex, tasks.length]);

  const onKey = (key: string) => {
    if (readOnly || solved) return;
    setAnswer((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 10));
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (readOnly || solved) return;
    const parsed = parsePolishDecimal(answer);
    if (parsed === null) {
      setFeedback("Wpisz liczbę w pustą kratkę.");
      onResultChange?.(false, answer || "brak odpowiedzi");
      return;
    }
    if (Math.abs(parsed - task.answer) > 1e-9) {
      setFeedback("Jeszcze nie. Sprawdź kierunek zamiany i liczbę wykonanych kroków między jednostkami.");
      onResultChange?.(false, answer);
      return;
    }
    setSolved(true);
    setFeedback(taskIndex === tasks.length - 1 ? `${task.explanation} Cała seria jest ukończona.` : `${task.explanation} Za chwilę następne zadanie.`);
    onResultChange?.(taskIndex === tasks.length - 1 ? true : null, `${formatPolishDecimal(task.answer)} ${task.toUnit}`);
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 6 · Temat 2"
      heading={heading}
      description={description}
      questionNumber={taskIndex + 1}
      questionCount={tasks.length}
      data-unit-conversion-series={kind}
      data-series-complete={solved && taskIndex === tasks.length - 1 ? "true" : "false"}
    >
      <div className="space-y-5">
        <div className="flex min-h-40 flex-nowrap items-center justify-center gap-2 rounded-3xl bg-indigo-50 px-3 py-5 text-2xl font-black text-slate-950 sm:gap-3 sm:px-5 sm:text-4xl" aria-label={`${task.value} ${task.fromUnit} równa się ile ${task.toUnit}`} data-unit-conversion-expression>
          <span className="inline-flex shrink-0 items-baseline gap-1 whitespace-nowrap">
            <span>{task.value}</span>
            <span>{task.fromUnit}</span>
          </span>
          <span className="shrink-0">=</span>
          <input
            aria-label="Wynik zamiany jednostki"
            inputMode="none"
            readOnly
            value={answer}
            className="h-14 min-w-0 w-28 shrink rounded-2xl border-4 border-violet-400 bg-white text-center text-2xl font-black text-slate-950 outline-none focus:border-violet-700 sm:h-16 sm:w-40 sm:text-4xl"
          />
          <span className="shrink-0 whitespace-nowrap">{task.toUnit}</span>
        </div>
        {feedback ? <p role="status" className={`rounded-2xl px-4 py-3 text-center font-black ${solved ? "bg-emerald-100 text-emerald-950" : "bg-amber-100 text-amber-950"}`}>{feedback}</p> : null}
        <LessonNumericKeypad
          onKey={onKey}
          onConfirm={check}
          disabled={readOnly || solved}
          allowSeparator
          label="Kalkulator do zamiany jednostek"
          helperText="Wpisz tylko liczbę. Jednostka jest już podana obok kratki."
        />
      </div>
    </LessonTaskFrame>
  );
}

export function AreaUnitConversionLab({ activity, readOnly = false, onResultChange }: AreaUnitConversionLabProps) {
  if (activity === "length-relations") return <LengthRelationsSlide />;
  if (activity === "area-relations") return <AreaRelationsSlide />;
  if (activity === "length-conversions") {
    return <ConversionTaskSeries tasks={LENGTH_CONVERSION_TASKS} heading="Zamiana jednostek długości" description="Zamieniaj jednostki. Samodzielnie zdecyduj, czy należy mnożyć, czy dzielić." readOnly={readOnly} kind="length" onResultChange={onResultChange} />;
  }
  return <ConversionTaskSeries tasks={AREA_CONVERSION_TASKS} heading="Zamiana jednostek pola" description="Wykonuj kolejne zamiany jednostek kwadratowych, arów i hektarów." readOnly={readOnly} kind="area" onResultChange={onResultChange} />;
}
