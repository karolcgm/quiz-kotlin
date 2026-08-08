"use client";

import { useState, type ReactNode } from "react";
import { LessonNumericKeypad } from "@/components/lessons/models/LessonNumericKeypad";
import { LessonTaskFrame } from "@/components/lessons/LessonTaskFrame";

export type Grade4ClockTimeActivity = "information" | "quarters-day" | "read-clock" | "convert" | "opening-hours";

export function grade4ClockTimeActivityFromStageId(stageId: string): Grade4ClockTimeActivity {
  if (stageId.endsWith("-information")) return "information";
  if (stageId.endsWith("-quarters-day")) return "quarters-day";
  if (stageId.endsWith("-read-clock")) return "read-clock";
  if (stageId.endsWith("-convert")) return "convert";
  return "opening-hours";
}

interface Props {
  activity: Grade4ClockTimeActivity;
  taskSeed?: number;
  questionNumber?: number;
  questionCount?: number;
  readOnly?: boolean;
  onResultChange?: (correct: boolean | null, answer?: string) => void;
}

type Feedback = "correct" | "incorrect" | "missing" | null;

export const CLOCK_READING_TASKS = [
  { hour: 7, minute: 0, context: "rano", answer: ["7", "0"] },
  { hour: 15, minute: 15, context: "po południu", answer: ["15", "15"] },
  { hour: 10, minute: 30, context: "rano", answer: ["10", "30"] },
  { hour: 16, minute: 45, context: "po południu", answer: ["16", "45"] },
  { hour: 12, minute: 20, context: "w południe", answer: ["12", "20"] },
] as const;

export const CLOCK_CONVERSION_TASKS = [
  { prompt: "3 min", unit: "s", answer: "180", hint: "Każda minuta ma 60 sekund." },
  { prompt: "2 h", unit: "min", answer: "120", hint: "Każda godzina ma 60 minut." },
  { prompt: "5 kwadransów", unit: "min", answer: "75", hint: "Jeden kwadrans ma 15 minut." },
  { prompt: "2 doby", unit: "h", answer: "48", hint: "Jedna doba ma 24 godziny." },
  { prompt: "360 s", unit: "min", answer: "6", hint: "Podziel liczbę sekund przez 60." },
  { prompt: "1 h 30 min", unit: "min", answer: "90", hint: "Najpierw zamień godzinę na minuty." },
] as const;

export const OPENING_HOURS_TASKS = [
  { place: "Biblioteka", icon: "📚", open: "8:00", close: "16:00", answer: ["8", "0"] },
  { place: "Pływalnia", icon: "🏊", open: "9:30", close: "18:00", answer: ["8", "30"] },
  { place: "Muzeum", icon: "🏛️", open: "10:15", close: "17:45", answer: ["7", "30"] },
  { place: "Piekarnia", icon: "🥐", open: "6:00", close: "14:30", answer: ["8", "30"] },
  { place: "Hala sportowa", icon: "🏀", open: "15:45", close: "21:00", answer: ["5", "15"] },
  { place: "Nocna apteka", icon: "💊", open: "20:00", close: "2:00", answer: ["6", "0"], nextDay: true },
] as const;

function handEnd(angle: number, length: number) {
  const radians = (angle * Math.PI) / 180;
  return { x: 120 + Math.sin(radians) * length, y: 120 - Math.cos(radians) * length };
}

export function ClockFace({ hour, minute, label }: { hour: number; minute: number; label?: string }) {
  const minuteEnd = handEnd(minute * 6, 72);
  const hourEnd = handEnd((hour % 12) * 30 + minute * 0.5, 50);
  return (
    <svg role="img" aria-label={label ?? `Zegar wskazujący ${hour}:${String(minute).padStart(2, "0")}`} viewBox="0 0 240 240" className="mx-auto h-auto w-full max-w-64">
      <circle cx="120" cy="120" r="105" fill="#fff" stroke="#312e81" strokeWidth="6" />
      {Array.from({ length: 60 }, (_, index) => {
        const angle = index * 6;
        const outer = handEnd(angle, 97);
        const inner = handEnd(angle, index % 5 === 0 ? 86 : 92);
        return <line key={index} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={index % 5 === 0 ? "#312e81" : "#94a3b8"} strokeWidth={index % 5 === 0 ? 4 : 1.5} strokeLinecap="round" />;
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const number = index + 1;
        const point = handEnd(number * 30, 75);
        return <text key={number} x={point.x} y={point.y + 6} textAnchor="middle" className="fill-slate-950 text-[17px] font-black">{number}</text>;
      })}
      <line x1="120" y1="120" x2={hourEnd.x} y2={hourEnd.y} stroke="#111827" strokeWidth="9" strokeLinecap="round" />
      <line x1="120" y1="120" x2={minuteEnd.x} y2={minuteEnd.y} stroke="#7c3aed" strokeWidth="6" strokeLinecap="round" />
      <circle cx="120" cy="120" r="8" fill="#f43f5e" />
    </svg>
  );
}

function FeedbackMessage({ feedback, answer }: { feedback: Feedback; answer: string }) {
  if (feedback === "missing") return <p role="alert" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950">Uzupełnij wszystkie wymagane pola.</p>;
  if (feedback === "correct") return <p role="status" className="rounded-2xl bg-emerald-100 p-3 text-center font-black text-emerald-950">Brawo! Poprawna odpowiedź to {answer}.</p>;
  if (feedback === "incorrect") return <div role="status" className="rounded-2xl bg-amber-100 p-3 text-center font-black text-amber-950"><p>Spróbuj innym razem. Poprawny wynik to {answer}. Dziś bez punktu.</p><p className="mt-1 text-sm">Przejdź dalej bez punktu.</p></div>;
  return null;
}

function InformationSlide() {
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 9" heading="Godziny na zegarach" description="Zegar analogowy ma wskazówki, a zegar cyfrowy zapisuje godzinę za pomocą cyfr.">
      <div className="space-y-4">
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <section className="rounded-3xl bg-cyan-50 p-4 ring-2 ring-cyan-200">
            <ClockFace hour={8} minute={15} />
            <p className="text-center font-black text-cyan-950">Zegar analogowy</p>
          </section>
          <span className="text-center text-4xl font-black text-violet-700">=</span>
          <section className="rounded-3xl bg-slate-950 p-7 text-center text-white shadow-xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-300">Zegar cyfrowy</p>
            <p className="mt-3 whitespace-nowrap font-mono text-6xl font-black">08:15</p>
            <p className="mt-3 font-bold">Jest kwadrans po ósmej.</p>
          </section>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["1 min = 60 s", "1 h = 60 min", "kwadrans = 15 min", "1 doba = 24 h"].map((fact, index) => <p key={fact} className={`rounded-2xl p-4 text-center text-xl font-black ${["bg-rose-100 text-rose-950", "bg-cyan-100 text-cyan-950", "bg-violet-100 text-violet-950", "bg-emerald-100 text-emerald-950"][index]}`}>{fact}</p>)}
        </div>
        <p className="rounded-2xl bg-amber-50 p-4 text-center font-bold text-amber-950 ring-2 ring-amber-200">Krótka wskazówka pokazuje godziny, a długa wskazówka pokazuje minuty.</p>
      </div>
    </LessonTaskFrame>
  );
}

function QuartersDaySlide() {
  const examples = [
    { hour: 3, minute: 0, title: "pełna godzina", text: "3:00" },
    { hour: 3, minute: 15, title: "kwadrans po trzeciej", text: "3:15" },
    { hour: 3, minute: 30, title: "pół godziny po trzeciej", text: "3:30" },
    { hour: 3, minute: 45, title: "za kwadrans czwarta", text: "3:45" },
  ];
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 9" heading="Kwadranse, godziny i doby" description="Tarcza zegara dzieli godzinę na cztery kwadranse po 15 minut.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {examples.map((example) => <section key={example.text} className="rounded-3xl bg-cyan-50 p-3 text-center ring-2 ring-cyan-200"><ClockFace hour={example.hour} minute={example.minute} /><p className="text-2xl font-black text-violet-800">{example.text}</p><p className="mt-1 text-sm font-bold">{example.title}</p></section>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <p className="rounded-2xl bg-violet-100 p-4 text-center font-black text-violet-950">2 kwadranse = 30 min</p>
          <p className="rounded-2xl bg-cyan-100 p-4 text-center font-black text-cyan-950">4 kwadranse = 1 h</p>
          <p className="rounded-2xl bg-emerald-100 p-4 text-center font-black text-emerald-950">24 h = 1 doba</p>
        </div>
        <section className="rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-center text-lg font-black text-cyan-300">Ta sama godzina na tarczy może oznaczać rano albo wieczorem</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center"><p className="rounded-2xl bg-white/10 p-4"><span className="block text-3xl font-black">7:00</span>rano</p><p className="rounded-2xl bg-white/10 p-4"><span className="block text-3xl font-black">19:00</span>wieczorem</p></div>
        </section>
      </div>
    </LessonTaskFrame>
  );
}

function NumericAnswerCard({ title, description, questionNumber, questionCount, expected, labels, answerText, readOnly, onResultChange, children, keypadLabel }: { title: string; description: string; questionNumber: number; questionCount: number; expected: readonly string[]; labels: readonly string[]; answerText: string; readOnly: boolean; onResultChange?: Props["onResultChange"]; children: ReactNode; keypadLabel: string }) {
  const [values, setValues] = useState<string[]>(() => expected.map(() => ""));
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const locked = readOnly || feedback === "correct" || feedback === "incorrect";
  const edit = (key: string) => {
    if (locked) return;
    setValues((current) => current.map((value, index) => index === active ? key === "backspace" ? value.slice(0, -1) : value.length >= 4 ? value : `${value}${key}` : value));
    setFeedback(null);
    onResultChange?.(null);
  };
  const check = () => {
    if (values.some((value) => value === "")) return setFeedback("missing");
    const correct = values.every((value, index) => Number(value) === Number(expected[index]));
    setFeedback(correct ? "correct" : "incorrect");
    onResultChange?.(correct, values.join(":"));
  };
  return (
    <LessonTaskFrame eyebrow="Dział 2 · Temat 9" heading={title} description={description} questionNumber={questionNumber} questionCount={questionCount}>
      <div className="space-y-4">
        {children}
        <section className="flex flex-wrap items-end justify-center gap-3 rounded-3xl bg-violet-50 p-5 ring-2 ring-violet-200">
          {values.map((value, index) => <label key={labels[index]} className="text-center text-sm font-black text-slate-600"><span className="mb-1 block">{labels[index]}</span><input aria-label={labels[index]} value={value} inputMode="none" readOnly onClick={() => setActive(index)} className={`h-16 w-28 rounded-xl border-2 bg-white text-center text-3xl font-black outline-none ${active === index ? "border-violet-700 ring-4 ring-violet-200" : "border-violet-300"}`} /></label>)}
        </section>
        {!readOnly ? <LessonNumericKeypad onKey={edit} onConfirm={check} disabled={locked} label={keypadLabel} helperText="Dotknij wybranej kratki, wpisz liczbę i zatwierdź." /> : null}
        <FeedbackMessage feedback={feedback} answer={answerText} />
      </div>
    </LessonTaskFrame>
  );
}

function ReadClockSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CLOCK_READING_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const displayedHour = task.hour > 12 ? task.hour - 12 : task.hour;
  return <NumericAnswerCard title="Odczytaj godzinę" description={`Zapisz godzinę w systemie 24-godzinnym. Jest ${task.context}.`} questionNumber={questionNumber} questionCount={questionCount} expected={task.answer} labels={["godzina", "minuty"]} answerText={`${task.answer[0]}:${task.answer[1].padStart(2, "0")}`} readOnly={readOnly} onResultChange={onResultChange} keypadLabel="Klawiatura do odczytywania zegara"><section className="rounded-3xl bg-cyan-50 p-4 text-center ring-2 ring-cyan-200"><ClockFace hour={displayedHour} minute={task.minute} label={`Zegar do odczytania, ${task.context}`} /><p className="mt-2 text-xl font-black text-cyan-950">Jest {task.context}.</p></section></NumericAnswerCard>;
}

function ConversionSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof CLOCK_CONVERSION_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  return <NumericAnswerCard title="Zamień jednostkę czasu" description="Skorzystaj z zależności między sekundą, minutą, godziną, kwadransem i dobą." questionNumber={questionNumber} questionCount={questionCount} expected={[task.answer]} labels={[`wynik w ${task.unit}`]} answerText={`${task.answer} ${task.unit}`} readOnly={readOnly} onResultChange={onResultChange} keypadLabel="Klawiatura do zamiany jednostek czasu"><section className="rounded-3xl bg-amber-50 p-7 text-center ring-2 ring-amber-200"><p className="text-4xl font-black text-amber-950"><span className="whitespace-nowrap">{task.prompt}</span> = <span className="inline-block h-12 w-24 rounded-xl border-2 border-dashed border-violet-400 align-middle" /> <span className="whitespace-nowrap">{task.unit}</span></p><p className="mt-4 font-bold text-amber-900">{task.hint}</p></section></NumericAnswerCard>;
}

function OpeningHoursSlide({ task, questionNumber, questionCount, readOnly, onResultChange }: { task: (typeof OPENING_HOURS_TASKS)[number]; questionNumber: number; questionCount: number; readOnly: boolean; onResultChange?: Props["onResultChange"] }) {
  const answerText = task.answer[1] === "0" ? `${task.answer[0]} h` : `${task.answer[0]} h ${task.answer[1]} min`;
  const closesNextDay = "nextDay" in task && task.nextDay;
  return <NumericAnswerCard title="Ile czasu jest otwarte?" description="Oblicz czas od otwarcia do zamknięcia." questionNumber={questionNumber} questionCount={questionCount} expected={task.answer} labels={["godziny", "minuty"]} answerText={answerText} readOnly={readOnly} onResultChange={onResultChange} keypadLabel="Klawiatura do obliczania czasu otwarcia"><section className="overflow-hidden rounded-3xl bg-cyan-50 ring-2 ring-cyan-200"><div className="bg-slate-950 p-5 text-center text-white"><span className="text-5xl" aria-hidden="true">{task.icon}</span><h3 className="mt-2 text-3xl font-black">{task.place}</h3></div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-5 text-center"><div className="rounded-2xl bg-emerald-100 p-4"><p className="text-sm font-black uppercase text-emerald-800">Otwarcie</p><p className="mt-1 whitespace-nowrap text-4xl font-black">{task.open}</p></div><span className="text-4xl font-black text-violet-700">→</span><div className="rounded-2xl bg-rose-100 p-4"><p className="text-sm font-black uppercase text-rose-800">Zamknięcie</p><p className="mt-1 whitespace-nowrap text-4xl font-black">{task.close}</p></div></div>{closesNextDay ? <p className="px-5 pb-5 text-center font-black text-violet-800">Zamknięcie następuje następnego dnia.</p> : null}</section></NumericAnswerCard>;
}

export function Grade4ClockTimeLessonLab({ activity, taskSeed = 0, questionNumber = 1, questionCount = 1, readOnly = false, onResultChange }: Props) {
  if (activity === "information") return <InformationSlide />;
  if (activity === "quarters-day") return <QuartersDaySlide />;
  if (activity === "read-clock") { const task = CLOCK_READING_TASKS[(questionNumber - 1) % CLOCK_READING_TASKS.length] ?? CLOCK_READING_TASKS[Math.abs(taskSeed) % CLOCK_READING_TASKS.length]!; return <ReadClockSlide key={`clock-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  if (activity === "convert") { const task = CLOCK_CONVERSION_TASKS[(questionNumber - 1) % CLOCK_CONVERSION_TASKS.length] ?? CLOCK_CONVERSION_TASKS[Math.abs(taskSeed) % CLOCK_CONVERSION_TASKS.length]!; return <ConversionSlide key={`convert-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />; }
  const task = OPENING_HOURS_TASKS[(questionNumber - 1) % OPENING_HOURS_TASKS.length] ?? OPENING_HOURS_TASKS[Math.abs(taskSeed) % OPENING_HOURS_TASKS.length]!;
  return <OpeningHoursSlide key={`opening-${questionNumber}`} task={task} questionNumber={questionNumber} questionCount={questionCount} readOnly={readOnly} onResultChange={onResultChange} />;
}
