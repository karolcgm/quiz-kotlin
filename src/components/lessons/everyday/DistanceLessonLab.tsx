"use client";

import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  DISTANCE_PRACTICE_TASKS,
  DISTANCE_VEHICLE_TASKS,
  SPEED_PRACTICE_TASKS,
  type DistanceActivity,
  type DistanceField,
  type DistanceVehicleTask,
} from "@/lib/math/everyday/distance";

interface Props {
  activity: DistanceActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

function FormulaTriangle({ focus = "s" }: { focus?: "s" | "v" | "t" }) {
  const [covered, setCovered] = useState<"s" | "v" | "t">(focus);
  const formulas = {
    s: { label: "droga", formula: "droga = prędkość · czas", note: "Prędkość pomnóż przez czas." },
    v: { label: "prędkość", formula: "prędkość = droga : czas", note: "Drogę podziel przez czas." },
    t: { label: "czas", formula: "czas = droga : prędkość", note: "Drogę podziel przez prędkość." },
  } as const;
  const triangleLabels = { s: "droga", v: "prędkość", t: "czas" } as const;

  return (
    <LessonTaskFrame
      eyebrow={`Dział 4 · Temat ${focus === "s" ? "1" : "2"}`}
      heading="Droga, prędkość i czas"
      description="Kliknij nazwę wielkości, którą chcesz obliczyć. Pod trójkątem pojawi się właściwe działanie zapisane słowami."
      data-distance-lab={focus === "v" ? "speed-guide" : "distance-guide"}
    >
      <div className="grid gap-5">
        <section className="grid place-items-center rounded-3xl bg-gradient-to-br from-sky-100 via-white to-emerald-100 p-4 sm:p-6">
          <p className="mb-2 text-center text-sm font-black uppercase tracking-[.16em] text-indigo-700">
            Wybierz wielkość do obliczenia
          </p>
          <div className="relative aspect-[1.35/1] w-full max-w-[34rem]" aria-label="Trójkąt: droga, prędkość i czas">
            <svg viewBox="0 0 560 410" className="h-full w-full drop-shadow-xl" role="img" aria-label="Droga znajduje się u góry, a prędkość i czas u dołu">
              <path d="M280 24 34 382h492Z" fill="#fff" />
              <path d="M280 34 45 222h470Z" fill={covered === "s" ? "#fbbf24" : "#a7f3d0"} />
              <path d="M45 238 270 373V238Z" fill={covered === "v" ? "#fbbf24" : "#bfdbfe"} />
              <path d="M290 238v135l225-135Z" fill={covered === "t" ? "#fbbf24" : "#ddd6fe"} />
              <path d="M280 24 34 382h492Z" fill="none" stroke="#312e81" strokeWidth="9" strokeLinejoin="round" />
              <path d="M34 230h492M280 230v152" stroke="#6366f1" strokeWidth="6" />
              <text x="280" y="150" textAnchor="middle" fontSize="48" fontWeight="900" fill="#172554">{triangleLabels.s}</text>
              <text x="158" y="316" textAnchor="middle" fontSize="31" fontWeight="900" fill="#172554">{triangleLabels.v}</text>
              <text x="402" y="316" textAnchor="middle" fontSize="40" fontWeight="900" fill="#172554">{triangleLabels.t}</text>
            </svg>
          </div>
          <div className="grid w-full max-w-[40rem] grid-cols-1 gap-2 sm:grid-cols-3">
            {(["s", "v", "t"] as const).map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => setCovered(symbol)}
                className={`min-h-12 rounded-xl border-2 px-2 font-black ${covered === symbol ? "border-amber-500 bg-amber-300 text-amber-950" : "border-indigo-200 bg-white text-indigo-950"}`}
              >
                Obliczam: {triangleLabels[symbol]}
              </button>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center">
          <p className="text-sm font-black uppercase tracking-wider text-indigo-600">Obliczamy: {formulas[covered].label}</p>
          <p className="mt-3 text-2xl font-black text-indigo-950 sm:text-4xl">{formulas[covered].formula}</p>
          <p className="mt-3 font-bold text-slate-700">{formulas[covered].note}</p>
        </section>
        <section className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center font-bold text-emerald-950">Droga — długość przebytej trasy</p>
          <p className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 text-center font-bold text-sky-950">Prędkość — droga pokonana w określonym czasie</p>
          <p className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-center font-bold text-violet-950">Czas — długość trwania ruchu</p>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function SpeedWordTriangle() {
  return (
    <div className="mx-auto w-full max-w-[34rem]" aria-label="Trójkąt: droga, prędkość i czas">
      <svg viewBox="0 0 620 430" className="h-auto w-full drop-shadow-xl" role="img">
        <path d="M310 28 45 394h530Z" fill="#ffffff" stroke="#312e81" strokeWidth="10" strokeLinejoin="round" />
        <path d="M310 38 54 228h512Z" fill="#a7f3d0" />
        <path d="M54 244 300 385V244Z" fill="#bfdbfe" />
        <path d="M320 244v141l246-141Z" fill="#ddd6fe" />
        <path d="M45 236h530M310 28v366" fill="none" stroke="#6366f1" strokeWidth="7" />
        <text x="310" y="156" textAnchor="middle" fontSize="54" fontWeight="900" fill="#172554">droga</text>
        <text x="176" y="324" textAnchor="middle" fontSize="34" fontWeight="900" fill="#172554">prędkość</text>
        <text x="445" y="324" textAnchor="middle" fontSize="42" fontWeight="900" fill="#172554">czas</text>
      </svg>
    </div>
  );
}

function SpeedGuide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 4 · Temat 2"
      heading="Jak obliczyć prędkość?"
      description="Prędkość mówi, jaką drogę obiekt pokonuje w jednej jednostce czasu."
      data-distance-lab="speed-guide"
    >
      <div className="grid gap-6">
        <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:p-6 lg:grid-cols-[minmax(18rem,1fr)_minmax(16rem,.8fr)]">
          <SpeedWordTriangle />
          <div className="grid content-center gap-4">
            <div className="rounded-3xl border-2 border-violet-300 bg-white p-5 text-center shadow-md">
              <p className="text-sm font-black uppercase tracking-[.16em] text-violet-700">Zakrywamy pole „prędkość”</p>
              <p className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">prędkość = droga : czas</p>
              <p className="mt-3 font-bold text-slate-700">Drogę dzielimy przez czas.</p>
            </div>
            <div className="grid gap-2 rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 font-bold text-slate-800">
              <p><b className="text-cyan-900">km/h</b> — liczba kilometrów pokonywanych w godzinę</p>
              <p><b className="text-cyan-900">m/min</b> — liczba metrów pokonywanych w minutę</p>
              <p><b className="text-cyan-900">m/s</b> — liczba metrów pokonywanych w sekundę</p>
            </div>
          </div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function SpeedWorkedExample() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 4 · Temat 2"
      heading="Prędkość samolotu — przykład"
      description="Zobacz kolejno: dane, wybór działania, obliczenie i odpowiedź."
      data-distance-lab="speed-worked-example"
    >
      <div className="grid gap-5">
        <section className="grid gap-4 rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="grid h-28 w-full place-items-center rounded-3xl bg-white text-7xl shadow-sm sm:w-36" aria-hidden>✈️</div>
          <div>
            <p className="text-sm font-black uppercase tracking-[.15em] text-sky-700">Przykład</p>
            <h3 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">Samolot przeleciał 2400 km w ciągu 4 godzin. Z jaką prędkością leciał?</h3>
          </div>
        </section>
        <div className="grid gap-3 lg:grid-cols-3">
          <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <b className="text-indigo-800">1. Odczytujemy dane</b>
            <p className="mt-3 text-lg font-black">droga: 2400 km</p>
            <p className="text-lg font-black">czas: 4 h</p>
          </section>
          <section className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4">
            <b className="text-violet-800">2. Wybieramy działanie</b>
            <p className="mt-3 text-xl font-black">prędkość = droga : czas</p>
          </section>
          <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
            <b className="text-emerald-800">3. Obliczamy</b>
            <p className="mt-3 text-2xl font-black">2400 : 4 = 600 km/h</p>
          </section>
        </div>
        <p className="rounded-2xl bg-amber-100 p-4 text-center text-lg font-black text-amber-950">
          Odpowiedź: samolot leciał z prędkością 600 km/h, czyli w każdą godzinę pokonywał 600 km.
        </p>
      </div>
    </LessonTaskFrame>
  );
}

function SpeedPractice({ readOnly = false, onResultChange }: Props) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = SPEED_PRACTICE_TASKS[index];

  const advance = (currentCorrect: boolean) => {
    if (index === SPEED_PRACTICE_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, `${value} ${task.answerUnit}`);
      return;
    }
    setIndex((current) => current + 1);
    setValue("");
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!value.trim()) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = Number(value) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 700);
    else {
      setMistakeMade(true);
      onResultChange?.(null, value);
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 4 · Temat 2"
      heading="Obliczanie prędkości"
      description="Zakryj w trójkącie pole „prędkość”, a następnie podziel drogę przez czas. Zwróć uwagę na jednostkę wyniku."
      questionNumber={index + 1}
      questionCount={SPEED_PRACTICE_TASKS.length}
      data-distance-lab="speed-practice"
    >
      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(14rem,.65fr)_minmax(0,1.35fr)]">
          <VehiclePicture vehicle={task.vehicle} />
          <section className="grid content-center gap-4 rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-5 text-center">
            <p className="text-sm font-black uppercase tracking-wider text-indigo-600">{task.vehicleLabel}</p>
            <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
            <div className="grid grid-cols-2 gap-3">
              <p className="rounded-2xl bg-white p-4 text-xl font-black text-indigo-950">droga: {task.distance} {task.distanceUnit}</p>
              <p className="rounded-2xl bg-white p-4 text-xl font-black text-indigo-950">czas: {task.time} {task.timeUnit}</p>
            </div>
          </section>
        </div>
        <section className="grid gap-3 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
          <p className="text-center text-lg font-black text-emerald-950">Skorzystaj z trójkąta: zakryj pole „prędkość”</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-slate-950">
            <span>prędkość = droga : czas =</span>
            <span>{task.distance}</span>
            <span>:</span>
            <span>{task.time}</span>
            <span>=</span>
            <input
              aria-label={`Prędkość w ${task.answerUnit}`}
              inputMode="none"
              readOnly
              value={value}
              onClick={() => setFeedback(null)}
              className="h-14 w-28 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black outline-none"
            />
            <span className="rounded-xl bg-white px-3 py-2 text-violet-800">{task.answerUnit}</span>
          </div>
        </section>
        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij prędkość przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze. Za chwilę pojawi się następne zadanie.</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3">
            <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer} {task.answerUnit}. Dziś bez punktu.</p>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}
        {!readOnly && !feedback ? (
          <LessonNumericKeypad
            onKey={(key) => setValue((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 5))}
            onConfirm={check}
            label="Klawiatura do obliczania prędkości"
            helperText={`Wynik podaj w ${task.answerUnit}.`}
          />
        ) : null}
      </div>
    </LessonTaskFrame>
  );
}

function VehiclePicture({ vehicle }: { vehicle: DistanceVehicleTask["vehicle"] }) {
  const symbol = {
    car: "🚗",
    train: "🚆",
    bicycle: "🚲",
    bus: "🚌",
    scooter: "🛴",
    plane: "✈️",
    runner: "🏃",
    swimmer: "🏊",
    robot: "🤖",
    ship: "🚢",
  }[vehicle];
  return (
    <div className="relative grid min-h-44 place-items-center overflow-hidden rounded-3xl bg-gradient-to-b from-sky-200 via-sky-50 to-emerald-100" aria-label={`Ilustracja pojazdu: ${vehicle}`}>
      <span className="absolute left-5 top-5 text-4xl">☀️</span>
      <div className="absolute bottom-5 h-3 w-full bg-slate-600" />
      <div className="absolute bottom-2 h-2 w-full bg-emerald-500" />
      <span className="relative z-10 text-8xl drop-shadow-xl" role="img" aria-hidden>{symbol}</span>
    </div>
  );
}

function emptyVehicleValues(task: DistanceVehicleTask) {
  return Object.fromEntries(task.fields.map((field) => [field.id, ""])) as Record<string, string>;
}

function VehicleSeries({ readOnly = false, onResultChange }: Props) {
  const [index, setIndex] = useState(0);
  const task = DISTANCE_VEHICLE_TASKS[index];
  const [values, setValues] = useState<Record<string, string>>(() => emptyVehicleValues(DISTANCE_VEHICLE_TASKS[0]));
  const [active, setActive] = useState(DISTANCE_VEHICLE_TASKS[0].fields[0].id);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);

  const advance = (currentCorrect: boolean) => {
    if (index === DISTANCE_VEHICLE_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, Object.values(values).join(", "));
      return;
    }
    const next = index + 1;
    setIndex(next);
    setValues(emptyVehicleValues(DISTANCE_VEHICLE_TASKS[next]));
    setActive(DISTANCE_VEHICLE_TASKS[next].fields[0].id);
    setFeedback(null);
    onResultChange?.(null);
  };

  const edit = (key: string) => {
    if (readOnly || feedback) return;
    setValues((current) => {
      const previous = current[active] ?? "";
      return { ...current, [active]: key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 4) };
    });
  };

  const check = () => {
    if (task.fields.some((field) => !(values[field.id] ?? "").trim())) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = task.fields.every((field) => Number(values[field.id]) === field.answer);
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 700);
    else {
      setMistakeMade(true);
      onResultChange?.(null, Object.values(values).join(", "));
    }
  };

  return (
    <LessonTaskFrame
      eyebrow="Dział 4 · Temat 1"
      heading="Jaką drogę pokona pojazd?"
      description="Prędkość jest stała. Uzupełnij drogę przebytą w każdym podanym czasie."
      questionNumber={index + 1}
      questionCount={DISTANCE_VEHICLE_TASKS.length}
      data-distance-lab="distance-vehicles"
    >
      <div className="grid gap-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,.75fr)_minmax(0,1.25fr)]">
          <VehiclePicture vehicle={task.vehicle} />
          <section className="grid content-center gap-3 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-5 text-center">
            <p className="text-sm font-black uppercase tracking-wider text-indigo-600">{task.vehicleLabel}</p>
            <p className="text-4xl font-black text-indigo-950">{task.speed} km/h</p>
            <p className="font-bold text-slate-700">W ciągu 1 godziny pojazd pokonuje {task.speed} km.</p>
            <p className="rounded-xl bg-white p-3 text-xl font-black text-violet-800">droga = prędkość · czas</p>
          </section>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {task.fields.map((field: DistanceField) => (
            <label key={field.id} className={`grid min-h-28 gap-2 rounded-2xl border-2 p-3 ${active === field.id ? "border-violet-700 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 bg-white"}`}>
              <span className="text-center font-black text-slate-800">{field.label}</span>
              <span className="flex items-center justify-center gap-2">
                <input
                  aria-label={`Droga po czasie: ${field.label}`}
                  inputMode="none"
                  readOnly
                  value={values[field.id] ?? ""}
                  onClick={() => { setActive(field.id); setFeedback(null); }}
                  onFocus={() => setActive(field.id)}
                  className="h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none"
                />
                <b>km</b>
              </span>
            </label>
          ))}
        </div>
        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie cztery wyniki.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze. Za chwilę pojawi się następny pojazd.</p> : null}
        {feedback === "incorrect" ? (
          <div className="grid gap-3">
            <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">
              Spróbuj przy następnym pojeździe. Poprawne odległości to {task.fields.map((field) => `${field.answer} km`).join(", ")}. Dziś bez punktu.
            </p>
            <button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button>
          </div>
        ) : null}
        {!readOnly && !feedback ? <LessonNumericKeypad onKey={edit} onConfirm={check} label="Klawiatura do obliczania drogi" helperText="Dotknij kratki, wpisz liczbę kilometrów i zatwierdź wszystkie wyniki." /> : null}
      </div>
    </LessonTaskFrame>
  );
}

function DistancePractice({ readOnly = false, onResultChange }: Props) {
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = DISTANCE_PRACTICE_TASKS[index];

  const advance = (currentCorrect: boolean) => {
    if (index === DISTANCE_PRACTICE_TASKS.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, value);
      return;
    }
    setIndex((current) => current + 1);
    setValue("");
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (!value.trim()) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = Number(value) === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    if (correct) window.setTimeout(() => advance(true), 700);
    else {
      setMistakeMade(true);
      onResultChange?.(null, value);
    }
  };

  return (
    <LessonTaskFrame eyebrow="Dział 4 · Temat 1" heading="Obliczanie drogi" description="Odczytaj prędkość i czas, a następnie pomnóż prędkość przez czas." questionNumber={index + 1} questionCount={DISTANCE_PRACTICE_TASKS.length} data-distance-lab="distance-practice">
      <div className="grid gap-5">
        <section className="rounded-3xl border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-emerald-50 p-6 text-center">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <p className="rounded-2xl bg-white p-4 font-black text-indigo-950">prędkość: {task.speed} km/h</p>
            <p className="rounded-2xl bg-white p-4 font-black text-indigo-950">czas: {task.timeLabel}</p>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xl font-black">
            <span>droga =</span><span>{task.speed}</span><span>·</span><span>{String(task.timeHours).replace(".", ",")}</span><span>=</span>
            <input aria-label="Droga w kilometrach" inputMode="none" readOnly value={value} onClick={() => setFeedback(null)} className="h-14 w-24 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black outline-none" />
            <span>km</span>
          </div>
        </section>
        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wynik przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Dobrze. Za chwilę pojawi się następne zadanie.</p> : null}
        {feedback === "incorrect" ? <div className="grid gap-3"><p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Spróbuj innym razem. Poprawny wynik to {task.answer} km. Dziś bez punktu.</p><button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
        {!readOnly && !feedback ? <LessonNumericKeypad onKey={(key) => setValue((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.slice(0, 4))} onConfirm={check} label="Klawiatura do obliczania drogi" /> : null}
      </div>
    </LessonTaskFrame>
  );
}

export function DistanceLessonLab(props: Props) {
  if (props.activity === "distance-guide") return <FormulaTriangle focus="s" />;
  if (props.activity === "speed-guide") return <SpeedGuide />;
  if (props.activity === "speed-worked-example") return <SpeedWorkedExample />;
  if (props.activity === "speed-practice") return <SpeedPractice key="speed-practice" {...props} />;
  if (props.activity === "distance-vehicles") return <VehicleSeries key="distance-vehicles" {...props} />;
  return <DistancePractice key="distance-practice" {...props} />;
}
