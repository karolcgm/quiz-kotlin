"use client";

import Image from "next/image";
import { useState } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskChoice, LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4CalendarActivity = "information" | "quarter-leap" | "write-date" | "age" | "weekday" | "story";

export function grade4CalendarActivityFromStageId(stageId: string): Grade4CalendarActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-quarter-leap")) return "quarter-leap";
  if (stageId.endsWith("-write-date")) return "write-date";
  if (stageId.endsWith("-age")) return "age";
  if (stageId.endsWith("-weekday")) return "weekday";
  return "story";
}

interface Props {
  activity: Grade4CalendarActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;

const MONTHS = [
  { name: "styczeń", days: "31", quarter: "I" },
  { name: "luty", days: "28 lub 29", quarter: "I" },
  { name: "marzec", days: "31", quarter: "I" },
  { name: "kwiecień", days: "30", quarter: "II" },
  { name: "maj", days: "31", quarter: "II" },
  { name: "czerwiec", days: "30", quarter: "II" },
  { name: "lipiec", days: "31", quarter: "III" },
  { name: "sierpień", days: "31", quarter: "III" },
  { name: "wrzesień", days: "30", quarter: "III" },
  { name: "październik", days: "31", quarter: "IV" },
  { name: "listopad", days: "30", quarter: "IV" },
  { name: "grudzień", days: "31", quarter: "IV" },
] as const;

export const CALENDAR_DATE_TASKS = [
  { text: "Narodowe Święto Niepodległości obchodzimy jedenastego listopada 2026 roku. Zapisz datę cyframi.", answer: ["11", "11", "2026"] },
  { text: "Pierwszy dzień kalendarzowej wiosny przypada dwudziestego pierwszego marca 2027 roku. Zapisz datę cyframi.", answer: ["21", "3", "2027"] },
  { text: "Wigilia przypada dwudziestego czwartego grudnia 2026 roku. Zapisz datę cyframi.", answer: ["24", "12", "2026"] },
  { text: "Dzień Dziecka obchodzimy pierwszego czerwca 2027 roku. Zapisz datę cyframi.", answer: ["1", "6", "2027"] },
  { text: "Pierwszy dzień roku 2028 zapisz cyframi.", answer: ["1", "1", "2028"] },
] as const;

export const CALENDAR_AGE_TASKS = [
  { born: "12.05.2015", today: "20.06.2026", answer: 11 },
  { born: "28.11.2014", today: "10.10.2026", answer: 11 },
  { born: "01.01.2016", today: "01.01.2027", answer: 11 },
  { born: "30.08.2015", today: "29.08.2026", answer: 10 },
  { born: "07.03.2017", today: "08.03.2027", answer: 10 },
] as const;

export const WEEKDAYS = ["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"] as const;

export const CALENDAR_WEEKDAY_TASKS = [
  { start: "poniedziałek", after: 10, answer: "czwartek" },
  { start: "piątek", after: 9, answer: "niedziela" },
  { start: "środa", after: 14, answer: "środa" },
  { start: "niedziela", after: 15, answer: "poniedziałek" },
  { start: "wtorek", after: 30, answer: "czwartek" },
] as const;

export const CALENDAR_STORY_TASKS = [
  {
    image: "/images/lessons/grade4/calendar/summer-camp.webp",
    imageAlt: "Dzieci przychodzące na letni obóz",
    text: "Obóz rozpoczął się 27 czerwca. Po 7 dniach dzieci wyruszyły na całodniową wycieczkę. Podaj datę wycieczki.",
    answer: ["4", "7"],
  },
  {
    image: "/images/lessons/grade4/calendar/library-return.webp",
    imageAlt: "Uczeń wypożyczający książki w bibliotece",
    text: "Olek wypożyczył książki 22 kwietnia. Ma je oddać po 10 dniach. Podaj datę zwrotu.",
    answer: ["2", "5"],
  },
  {
    image: "/images/lessons/grade4/calendar/school-garden.webp",
    imageAlt: "Dzieci sadzące rośliny w szkolnym ogrodzie",
    text: "Uczniowie posadzili rośliny 25 maja. Pierwsze kwiaty pojawiły się po 12 dniach. Podaj datę pojawienia się kwiatów.",
    answer: ["6", "6"],
  },
  {
    image: "/images/lessons/grade4/calendar/adventure-race.webp",
    imageAlt: "Dzieci podczas terenowego biegu przygodowego",
    text: "Bieg przygodowy rozpoczął się 29 sierpnia. Wręczenie nagród odbyło się po 5 dniach. Podaj datę wręczenia nagród.",
    answer: ["3", "9"],
  },
] as const;

function FeedbackMessage({ feedback, answer }: { feedback: Feedback; answer: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź to {answer}.</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 8" heading="Kalendarz — miesiące i dni" description="Rok ma 12 miesięcy. Liczba dni w miesiącu nie zawsze jest taka sama.">
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          {["I", "II", "III", "IV"].map((quarter) => (
            <section key={quarter} className="rounded-3xl bg-cyan-50 p-4 ring-2 ring-cyan-200">
              <h3 className="text-center text-lg font-black text-cyan-950">{quarter} kwartał</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {MONTHS.filter((month) => month.quarter === quarter).map((month) => (
                  <div key={month.name} className="rounded-2xl bg-white p-2 text-center shadow-sm">
                    <p className="text-sm font-black capitalize text-violet-900">{month.name}</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{month.days}</p>
                    <p className="text-xs font-bold text-slate-500">dni</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">7 miesięcy ma 31 dni</p>
          <p className="rounded-2xl bg-amber-100 p-4 text-center font-black text-amber-950">4 miesiące mają 30 dni</p>
          <p className="rounded-2xl bg-violet-100 p-4 text-center font-black text-violet-950">Luty ma 28 albo 29 dni</p>
        </div>
      </div>
    </LessonTaskFrame>
  );
}

function QuarterLeapSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 8" heading="Kwartał i rok przestępny" description="Kwartał to trzy kolejne miesiące, czyli jedna z czterech równych części roku.">
      <div className="space-y-4">
        <section className="rounded-3xl bg-cyan-50 p-5 ring-2 ring-cyan-200">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["I", "styczeń · luty · marzec"], ["II", "kwiecień · maj · czerwiec"],
              ["III", "lipiec · sierpień · wrzesień"], ["IV", "październik · listopad · grudzień"],
            ].map(([quarter, months]) => <div key={quarter} className="rounded-2xl bg-white p-3 text-center shadow"><p className="text-2xl font-black text-violet-800">{quarter}</p><p className="mt-1 text-sm font-bold leading-relaxed">{months}</p></div>)}
          </div>
        </section>
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-3xl bg-emerald-50 p-5 text-center ring-2 ring-emerald-200"><p className="text-xl font-black text-emerald-950">Rok zwykły</p><p className="mt-2 text-4xl font-black">365 dni</p><p className="mt-2 font-bold">Luty ma 28 dni.</p></section>
          <section className="rounded-3xl bg-violet-50 p-5 text-center ring-2 ring-violet-200"><p className="text-xl font-black text-violet-950">Rok przestępny</p><p className="mt-2 text-4xl font-black">366 dni</p><p className="mt-2 font-bold">Luty ma 29 dni.</p></section>
        </div>
        <section className="rounded-3xl bg-amber-50 p-5 ring-2 ring-amber-200">
          <h3 className="text-center text-lg font-black text-amber-950">Jak rozpoznać rok przestępny?</h3>
          <p className="mt-2 text-center font-bold">Najczęściej jest podzielny przez 4. Rok kończący wiek musi być dodatkowo podzielny przez 400.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2"><span className="rounded-xl bg-emerald-200 px-4 py-2 font-black">2024 — przestępny</span><span className="rounded-xl bg-white px-4 py-2 font-black">2025 — zwykły</span><span className="rounded-xl bg-emerald-200 px-4 py-2 font-black">2000 — przestępny</span><span className="rounded-xl bg-rose-100 px-4 py-2 font-black">2100 — zwykły</span></div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function DateFields({ values, active, labels, onActivate }: { values: readonly string[]; active: number; labels: readonly string[]; onActivate: (index: number) => void }) {
  return <div className="flex flex-wrap items-end justify-center gap-2" aria-label="Pola daty">{values.map((value, index) => <div key={labels[index]} className="flex items-end gap-2"><label className="block text-center text-xs font-black uppercase tracking-wide text-slate-600"><span className="mb-1 block">{labels[index]}</span><input aria-label={labels[index]} value={value} inputMode="none" readOnly onClick={() => onActivate(index)} className={`h-14 rounded-xl border-2 bg-white text-center text-2xl font-black outline-none ${index === active ? "w-24 border-violet-700 ring-4 ring-violet-200" : "w-24 border-violet-300"} ${index === 2 ? "sm:w-32" : ""}`} /></label>{index < values.length - 1 ? <span className="pb-3 text-2xl font-black">.</span> : null}</div>)}</div>;
}

function DateAnswerCard({ title, description, expected, labels, questionNumber, questionCount, readOnly, onResultChange, children }: { title: string; description: string; expected: readonly string[]; labels: readonly string[]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"]; children: React.ReactNode }) {
  const [values, setValues] = useState<string[]>(() => expected.map(() => ""));
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === active ? key === "backspace" ? value.slice(0, -1) : value.length >= (index === 2 ? 4 : 2) ? value : `${value}${key}` : value));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) return setFeedback("missing");
    const correct = values.every((value, index) => Number(value) === Number(expected[index]));
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join("."));
  };
  const answer = expected.map((value) => value.padStart(value.length === 4 ? 4 : 2, "0")).join(".");
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 8" heading={title} description={description} questionNumber={questionNumber} questionCount={questionCount}><div className="space-y-4">{children}<section className="rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200"><DateFields values={values} active={active} labels={labels} onActivate={setActive} /></section>{!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do zapisywania daty" helperText="Dotknij kratki dnia, miesiąca lub roku i wpisz liczbę." /> : null}<FeedbackMessage feedback={feedback} answer={answer} /></div></LessonTaskFrame>;
}

function WriteDateSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CALENDAR_DATE_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  return <DateAnswerCard title="Zapisz datę cyframi" description="Wpisz dzień, miesiąc i rok w osobnych kratkach." expected={task.answer} labels={["dzień", "miesiąc", "rok"]} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange}><p className="rounded-3xl bg-amber-50 p-6 text-center text-xl font-black leading-relaxed ring-2 ring-amber-200">{task.text}</p></DateAnswerCard>;
}

function AgeSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CALENDAR_AGE_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => { if (locked) return; setValue((current) => key === "backspace" ? current.slice(0, -1) : current.length >= 3 ? current : `${current}${key}`); setFeedback(null); onResultChange?.(null); };
  const check = () => { if (!value) return setFeedback("missing"); const correct = Number(value) === task.answer; setFeedback(correct ? "correct" : "incorrect"); onResultChange?.(correct, value); };
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 8" heading="Określ wiek" description="Sprawdź, czy urodziny w podanym roku już były." questionNumber={questionNumber} questionCount={questionCount}><div className="space-y-4"><section className="rounded-3xl bg-cyan-50 p-6 text-center ring-2 ring-cyan-200"><div className="grid gap-3 sm:grid-cols-2"><p className="rounded-2xl bg-white p-4 font-black"><span className="block text-sm text-slate-500">Data urodzenia</span><span className="mt-1 block whitespace-nowrap text-3xl">{task.born}</span></p><p className="rounded-2xl bg-white p-4 font-black"><span className="block text-sm text-slate-500">Dzisiejsza data</span><span className="mt-1 block whitespace-nowrap text-3xl">{task.today}</span></p></div><label className="mt-5 inline-flex items-center gap-3 text-xl font-black">Wiek: <input aria-label="Wiek w latach" value={value} inputMode="none" readOnly className="h-14 w-28 rounded-xl border-2 border-violet-400 bg-white text-center text-2xl font-black outline-none" /> lat</label></section>{!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label="Klawiatura do obliczania wieku" helperText="Wpisz pełne lata i zatwierdź." /> : null}<FeedbackMessage feedback={feedback} answer={`${task.answer} lat`} /></div></LessonTaskFrame>;
}

function WeekdaySlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CALENDAR_WEEKDAY_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const check = () => { if (!selected) return setFeedback("missing"); const correct = selected === task.answer; setFeedback(correct ? "correct" : "incorrect"); onResultChange?.(correct, selected); };
  return <LessonTaskFrame eyebrow="Dział 2 · Temat 8" heading="Jaki to będzie dzień tygodnia?" description="Po każdych 7 dniach wracamy do tej samej nazwy dnia." questionNumber={questionNumber} questionCount={questionCount}><div className="space-y-4"><section className="rounded-3xl bg-cyan-50 p-5 text-center ring-2 ring-cyan-200"><p className="text-xl font-black">Dzisiaj jest <span className="text-violet-800">{task.start}</span>.</p><p className="mt-2 text-2xl font-black">Jaki dzień tygodnia będzie za {task.after} dni?</p><div className="mt-4 grid grid-cols-7 gap-1">{WEEKDAYS.map((day) => <span key={day} title={day} className={`rounded-xl px-1 py-2 text-center text-xs font-black sm:text-sm ${day === task.start ? "bg-violet-700 text-white" : "bg-white text-slate-700"}`}>{day.slice(0, 3)}</span>)}</div></section><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{WEEKDAYS.map((day) => <LessonTaskChoice key={day} selected={selected === day} disabled={locked} onClick={() => { setSelected(day); setFeedback(null); onResultChange?.(null); }}>{day}</LessonTaskChoice>)}</div>{!readOnly ? <button type="button" disabled={locked} onClick={check} className="min-h-12 w-full rounded-xl bg-violet-700 px-4 font-black text-white disabled:opacity-40">Zatwierdź</button> : null}<FeedbackMessage feedback={feedback} answer={task.answer} /></div></LessonTaskFrame>;
}

function StorySlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CALENDAR_STORY_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  return <DateAnswerCard title="Kalendarz w zadaniu tekstowym" description="Przeczytaj treść, przejdź przez koniec miesiąca i wpisz datę." expected={task.answer} labels={["dzień", "miesiąc"]} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange}><section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200"><Image src={task.image} alt={task.imageAlt} width={1536} height={1024} className="h-auto w-full object-contain" /><p className="p-5 text-center text-xl font-black leading-relaxed">{task.text}</p></section></DateAnswerCard>;
}

export function Grade4CalendarLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "quarter-leap") return <QuarterLeapSlide />;
  if (activity === "write-date") { const task = CALENDAR_DATE_TASKS[(questionNumber - 1) % CALENDAR_DATE_TASKS.length] ?? CALENDAR_DATE_TASKS[Math.abs(taskSeed) % CALENDAR_DATE_TASKS.length]!; return <WriteDateSlide key={`date-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  if (activity === "age") { const task = CALENDAR_AGE_TASKS[(questionNumber - 1) % CALENDAR_AGE_TASKS.length] ?? CALENDAR_AGE_TASKS[Math.abs(taskSeed) % CALENDAR_AGE_TASKS.length]!; return <AgeSlide key={`age-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  if (activity === "weekday") { const task = CALENDAR_WEEKDAY_TASKS[(questionNumber - 1) % CALENDAR_WEEKDAY_TASKS.length] ?? CALENDAR_WEEKDAY_TASKS[Math.abs(taskSeed) % CALENDAR_WEEKDAY_TASKS.length]!; return <WeekdaySlide key={`weekday-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  const task = CALENDAR_STORY_TASKS[(questionNumber - 1) % CALENDAR_STORY_TASKS.length] ?? CALENDAR_STORY_TASKS[Math.abs(taskSeed) % CALENDAR_STORY_TASKS.length]!;
  return <StorySlide key={`story-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
