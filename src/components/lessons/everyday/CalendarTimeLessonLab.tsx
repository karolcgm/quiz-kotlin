"use client";

import { useMemo, useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";
import {
  CALENDAR_TASKS,
  CENTURY_TASKS,
  CONVERSION_TASKS,
  ELAPSED_TASKS,
  MONTHS,
  WEEKDAY_TASKS,
  type CalendarChoiceTask,
  type CalendarNumericTask,
  type CalendarTimeActivity,
} from "@/lib/math/everyday/calendarTime";

interface Props {
  activity: CalendarTimeActivity;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answerLabel?: string) => void;
}

type Feedback = "missing" | "correct" | "incorrect" | null;

function ClockFace({ hours, minutes, label }: { hours: number; minutes: number; label: string }) {
  const minuteAngle = minutes * 6;
  const hourAngle = (hours % 12) * 30 + minutes / 2;
  return (
    <figure className="grid justify-items-center gap-2">
      <div className="relative size-36 rounded-full border-[10px] border-indigo-700 bg-white shadow-xl">
        {Array.from({ length: 12 }, (_, index) => {
          const angle = index * 30;
          return <i key={index} className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-indigo-300" style={{ transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-52px)` }} />;
        })}
        <span className="absolute left-1/2 top-1/2 h-12 w-1.5 origin-bottom rounded-full bg-violet-700" style={{ transform: `translate(-50%,-100%) rotate(${hourAngle}deg)` }} />
        <span className="absolute left-1/2 top-1/2 h-14 w-1 origin-bottom rounded-full bg-cyan-500" style={{ transform: `translate(-50%,-100%) rotate(${minuteAngle}deg)` }} />
        <span className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
      </div>
      <figcaption className="rounded-xl bg-indigo-50 px-3 py-1 text-sm font-black text-indigo-950">{label}</figcaption>
    </figure>
  );
}

function CalendarGuide() {
  return (
    <LessonTaskFrame
      eyebrow="Dział 3 · Temat 1"
      heading="Kalendarz i czas"
      description="Rok zwykły ma 365 dni, a rok przestępny 366 dni. W roku przestępnym luty ma 29 dni."
      data-calendar-time="calendar-guide"
    >
      <div className="grid gap-5">
        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Miesiące i liczba dni">
          {MONTHS.map((month, index) => (
            <article key={month.name} className={`rounded-2xl border-2 p-3 text-center shadow-sm ${month.days === 31 ? "border-cyan-200 bg-cyan-50" : month.name === "luty" ? "border-violet-300 bg-violet-50" : "border-amber-200 bg-amber-50"}`}>
              <span className="text-xs font-black text-slate-500">{index + 1}</span>
              <h3 className="font-black capitalize text-slate-950">{month.name}</h3>
              <p className="mt-1 text-2xl font-black text-indigo-800">{month.days}{"leapDays" in month ? " lub 29" : ""} dni</p>
            </article>
          ))}
        </section>
        <section className="grid gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 sm:grid-cols-2">
          <div><b className="text-emerald-950">Jak rozpoznać rok przestępny?</b><p className="mt-1 text-sm font-semibold text-slate-700">Zwykle dzieli się przez 4. Rok kończący wiek musi dzielić się przez 400.</p></div>
          <div><b className="text-emerald-950">Jak odczytać wiek?</b><p className="mt-1 text-sm font-semibold text-slate-700">Lata 1401–1500 to XV wiek. Rok 1500 nadal należy do XV wieku.</p></div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function ChoiceSeries({ activity, tasks, heading, description, readOnly, onResultChange }: Props & { tasks: CalendarChoiceTask[]; heading: string; description: string }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);
  const task = tasks[index];

  const advance = (currentCorrect = false) => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, selected);
      return;
    }
    setIndex((current) => current + 1);
    setSelected("");
    setFeedback(null);
    onResultChange?.(null);
  };

  const check = () => {
    if (!selected) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = selected === task.answer;
    setFeedback(correct ? "correct" : "incorrect");
    if (!correct) setMistakeMade(true);
    if (correct) window.setTimeout(() => advance(true), 650);
    else onResultChange?.(null, selected);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 3 · Temat 1" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length} data-calendar-time={activity}>
      <div className="grid gap-5">
        {activity === "weekdays" ? (
          <div className="grid grid-cols-7 gap-1 rounded-2xl bg-indigo-50 p-3 text-center text-xs font-black text-indigo-950 sm:text-sm">
            {["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."].map((day) => <span key={day} className="rounded-lg bg-white py-2 shadow-sm">{day}</span>)}
          </div>
        ) : null}
        <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-6 text-center">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
          {task.detail ? <p className="mx-auto mt-3 max-w-2xl font-semibold text-slate-700">{task.detail}</p> : null}
        </section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" role="group" aria-label="Wybierz odpowiedź">
          {task.choices.map((choice) => <LessonTaskChoice key={choice} selected={selected === choice} disabled={readOnly || feedback === "correct"} onClick={() => { setSelected(choice); setFeedback(null); }}>{choice}</LessonTaskChoice>)}
        </div>
        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Wybierz odpowiedź przed zatwierdzeniem.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">{index === tasks.length - 1 ? "✓ Dobrze. Ukończono serię zadań." : "✓ Dobrze. Za chwilę pojawi się następne zadanie."}</p> : null}
        {feedback === "incorrect" ? <div className="grid gap-3"><p role="status" className="rounded-xl bg-rose-100 p-3 text-center font-black text-rose-950">Jeszcze nie. {task.hint}</p><button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
        {!readOnly && feedback !== "correct" && feedback !== "incorrect" ? <button type="button" onClick={check} className="min-h-14 rounded-2xl bg-cyan-300 px-5 font-black text-cyan-950">Zatwierdź</button> : null}
      </div>
    </LessonTaskFrame>
  );
}

function emptyValues(task: CalendarNumericTask) {
  return Object.fromEntries(task.fields.map((field) => [field.id, ""])) as Record<string, string>;
}

function NumericSeries({ activity, tasks, heading, description, readOnly, onResultChange }: Props & { tasks: CalendarNumericTask[]; heading: string; description: string }) {
  const [index, setIndex] = useState(0);
  const task = tasks[index];
  const [values, setValues] = useState<Record<string, string>>(() => emptyValues(tasks[0]));
  const [active, setActive] = useState(tasks[0].fields[0].id);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [mistakeMade, setMistakeMade] = useState(false);

  const advance = (currentCorrect = false) => {
    if (index === tasks.length - 1) {
      onResultChange?.(!mistakeMade && currentCorrect, Object.values(values).join(":"));
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setValues(emptyValues(tasks[nextIndex]));
    setActive(tasks[nextIndex].fields[0].id);
    setFeedback(null);
    onResultChange?.(null);
  };

  const edit = (key: string) => {
    if (readOnly || feedback === "correct") return;
    setValues((current) => {
      const previous = current[active] ?? "";
      const next = key === "backspace" ? previous.slice(0, -1) : `${previous}${key}`.slice(0, 4);
      return { ...current, [active]: next };
    });
    setFeedback(null);
  };

  const check = () => {
    if (task.fields.some((field) => !(values[field.id] ?? "").trim())) {
      setFeedback("missing");
      onResultChange?.(null, "brak odpowiedzi");
      return;
    }
    const correct = task.fields.every((field) => Number(values[field.id]) === field.answer);
    setFeedback(correct ? "correct" : "incorrect");
    if (!correct) {
      setMistakeMade(true);
      onResultChange?.(null, Object.values(values).join(":"));
    } else window.setTimeout(() => advance(true), 650);
  };

  return (
    <LessonTaskFrame eyebrow="Dział 3 · Temat 1" heading={heading} description={description} questionNumber={index + 1} questionCount={tasks.length} data-calendar-time={activity}>
      <div className="grid gap-5">
        {activity === "elapsed" && task.id === "elapsed-school" ? <div className="flex flex-wrap justify-center gap-8"><ClockFace hours={8} minutes={15} label="godzina rozpoczęcia" /><ClockFace hours={9} minutes={0} label="godzina zakończenia" /></div> : null}
        <section className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-cyan-50 p-6 text-center">
          <h3 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h3>
          {task.detail ? <p className="mt-3 font-semibold text-slate-700">{task.detail}</p> : null}
        </section>
        <div className={`grid gap-3 ${task.fields.length > 1 ? "grid-cols-2" : "mx-auto w-full max-w-sm"}`}>
          {task.fields.map((field) => <label key={field.id} className={`grid min-h-28 place-items-center gap-2 rounded-2xl border-2 p-3 text-center ${active === field.id ? "border-violet-700 bg-violet-50 ring-4 ring-violet-100" : "border-slate-200 bg-white"}`}>
            <span className="font-black text-slate-700">{field.label}</span>
            <span className="flex items-center gap-2">
              <input aria-label={field.label} inputMode="none" readOnly value={values[field.id] ?? ""} onClick={() => setActive(field.id)} onFocus={() => setActive(field.id)} className="h-14 w-24 rounded-xl border-2 border-violet-300 bg-white text-center text-2xl font-black text-slate-950 outline-none" />
              {field.unit ? <b className="text-lg text-slate-950">{field.unit}</b> : null}
            </span>
          </label>)}
        </div>
        {feedback === "missing" ? <p role="status" className="rounded-xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wyniki.</p> : null}
        {feedback === "correct" ? <p role="status" className="rounded-xl bg-emerald-100 p-3 text-center font-black text-emerald-950">{index === tasks.length - 1 ? "✓ Dobrze. Ukończono serię zadań." : "✓ Dobrze. Za chwilę pojawi się następne zadanie."}</p> : null}
        {feedback === "incorrect" ? <div className="grid gap-3"><p role="status" className="rounded-xl bg-rose-100 p-3 text-center font-black text-rose-950">Sprawdź obliczenie. {task.hint}</p><button type="button" onClick={() => advance(false)} className="min-h-12 rounded-xl bg-slate-700 px-4 font-black text-white">Przejdź dalej bez punktu</button></div> : null}
        {!readOnly && feedback !== "correct" && feedback !== "incorrect" ? <LessonNumericKeypad onKey={edit} onConfirm={check} label="Klawiatura do obliczeń czasu" helperText="Dotknij wybranej kratki, wpisz wynik i zatwierdź." /> : null}
      </div>
    </LessonTaskFrame>
  );
}

export function CalendarTimeLessonLab(props: Props) {
  const { activity } = props;
  const choiceContent = useMemo(() => {
    if (activity === "calendar") return { tasks: CALENDAR_TASKS, heading: "Miesiące i rok przestępny", description: "Wybierz liczbę dni albo rozpoznaj rok przestępny." };
    if (activity === "centuries") return { tasks: CENTURY_TASKS, heading: "Lata i wieki", description: "Ustal, do którego wieku należy podany rok." };
    return { tasks: WEEKDAY_TASKS, heading: "Dni tygodnia", description: "Pełne tygodnie nie zmieniają dnia tygodnia. Liczy się reszta z dzielenia liczby dni przez 7." };
  }, [activity]);
  if (activity === "calendar-guide") return <CalendarGuide />;
  if (activity === "calendar" || activity === "centuries" || activity === "weekdays") return <ChoiceSeries key={activity} {...props} {...choiceContent} />;
  if (activity === "conversions") return <NumericSeries key={activity} {...props} tasks={CONVERSION_TASKS} heading="Godziny i minuty" description="Pamiętaj: 1 godzina to 60 minut, kwadrans to 15 minut, a doba to 24 godziny." />;
  return <NumericSeries key={activity} {...props} tasks={ELAPSED_TASKS} heading="Ile czasu upływa?" description="Podziel przedział na wygodne części: do pełnej godziny, pełne godziny i pozostałe minuty." />;
}
