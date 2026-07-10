"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface Props { seed: number; readOnly?: boolean; presentationMode?: boolean; onResultChange?: (correct: boolean) => void; }
interface FrameProps { index: number; title: string; instruction: string; accent: string; children: ReactNode; }

function Frame({ index, title, instruction, accent, children }: FrameProps) {
  return <section data-review-widget={index} className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-2xl sm:p-7">
    <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${accent} opacity-25`} />
    <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-black tracking-[.22em] text-cyan-200">POWTÓRKA · KLASA IV</p><h3 className="mt-1 text-3xl font-black sm:text-5xl">{title}</h3><p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-lg">{instruction}</p></div><span className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-lg font-black">{index}/10</span></header>
    <div className="mt-6">{children}</div>
  </section>;
}

const ResultReporterContext = createContext<((correct: boolean) => void) | undefined>(undefined);

function Result({ ok, children }: { ok: boolean; children: ReactNode }) {
  const report = useContext(ResultReporterContext);
  useEffect(() => report?.(ok), [ok, report]);
  return <p role="status" className={`mt-5 rounded-2xl px-4 py-3 text-center font-bold ${ok ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>{children}</p>;
}

export function ClassFourReviewModel({ seed, readOnly = false, presentationMode = false, onResultChange }: Props) {
  const index = ((Math.abs(seed) - 1) % 10) + 1;
  let widget: ReactNode;
  if (index === 1) widget = <PlaceValueLab readOnly={readOnly} teacher={presentationMode} />;
  else if (index === 2) widget = <NumberOrderLab readOnly={readOnly} />;
  else if (index === 3) widget = <NumberLineLab readOnly={readOnly} teacher={presentationMode} />;
  else if (index === 4) widget = <RoundingLab readOnly={readOnly} />;
  else if (index === 5) widget = <BridgeLab readOnly={readOnly} />;
  else if (index === 6) widget = <ArrayLab readOnly={readOnly} teacher={presentationMode} />;
  else if (index === 7) widget = <DivisionLab readOnly={readOnly} />;
  else if (index === 8) widget = <FractionLab readOnly={readOnly} teacher={presentationMode} />;
  else if (index === 9) widget = <ShapeLab readOnly={readOnly} />;
  else widget = <ChartLab readOnly={readOnly} teacher={presentationMode} />;
  return <ResultReporterContext.Provider value={onResultChange}>{widget}</ResultReporterContext.Provider>;
}

function PlaceValueLab({ readOnly, teacher }: { readOnly: boolean; teacher: boolean }) {
  const [digits, setDigits] = useState(teacher ? [5, 7, 2] : [0, 0, 0]);
  const change = (place: number, delta: number) => !readOnly && setDigits((current) => current.map((v, i) => i === place ? (v + delta + 10) % 10 : v));
  const value = digits[0]! * 100 + digits[1]! * 10 + digits[2]!;
  return <Frame index={1} title="Fabryka wartości" instruction={teacher ? "Zmieniaj cyfry przyciskami +/− i pytaj, o ile zmieniła się liczba." : "Ustaw na maszynie liczbę 572."} accent="from-violet-600 to-indigo-800">
    <div className="grid gap-4 md:grid-cols-3">{["SETKI", "DZIESIĄTKI", "JEDNOŚCI"].map((label, i) => <div key={label} className="rounded-3xl border border-white/15 bg-white/10 p-4 text-center"><p className="text-xs font-black tracking-widest text-white/70">{label}</p><p className="my-3 text-7xl font-black">{digits[i]}</p><div className="grid grid-cols-2 gap-2"><button disabled={readOnly} onClick={() => change(i, -1)} className="touch-manipulation min-h-14 rounded-xl bg-white/10 text-3xl font-black">−</button><button disabled={readOnly} onClick={() => change(i, 1)} className="touch-manipulation min-h-14 rounded-xl bg-white text-3xl font-black text-slate-950">+</button></div></div>)}</div>
    <div className="mt-5 rounded-3xl bg-slate-950/60 p-4 text-center"><p className="text-5xl font-black tabular-nums">{value}</p><p className="mt-2 text-sm text-slate-300">{digits[0]} × 100 + {digits[1]} × 10 + {digits[2]} × 1</p></div>
    {!teacher && value === 572 ? <Result ok>Maszyna zbudowała właściwą liczbę.</Result> : null}
  </Frame>;
}

function NumberOrderLab({ readOnly }: { readOnly: boolean }) {
  const pool = [405, 450, 440, 409]; const [order, setOrder] = useState<number[]>([]);
  const add = (value: number) => !readOnly && setOrder((current) => current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  const correct = order.join() === "405,409,440,450";
  return <Frame index={2} title="Wyścig liczb" instruction="Przeciągnij albo dotykaj liczby od najmniejszej do największej." accent="from-fuchsia-600 to-purple-900">
    <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => add(Number(e.dataTransfer.getData("text/plain")))} className="flex min-h-28 flex-wrap items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/30 p-4">{order.map((v, i) => <button key={v} onClick={() => add(v)} className="touch-manipulation min-h-16 rounded-2xl bg-white px-5 text-3xl font-black text-slate-950"><span className="mr-2 text-sm text-slate-400">{i + 1}</span>{v}</button>)}</div>
    <div className="mt-5 flex flex-wrap justify-center gap-3">{pool.filter((v) => !order.includes(v)).map((v) => <button key={v} draggable={!readOnly} onDragStart={(e) => e.dataTransfer.setData("text/plain", String(v))} onClick={() => add(v)} className="touch-manipulation min-h-16 rounded-2xl border-2 border-white/20 bg-white/10 px-5 text-3xl font-black">{v}</button>)}</div>
    {order.length === 4 ? <Result ok={correct}>{correct ? "Właściwa kolejność." : "Porównaj najpierw setki, potem dziesiątki."}</Result> : null}
  </Frame>;
}

function NumberLineLab({ readOnly, teacher }: { readOnly: boolean; teacher: boolean }) {
  const [point, setPoint] = useState(30); const values = [30, 40, 50, 60, 70, 80];
  return <Frame index={3} title="Skok po osi" instruction={teacher ? "Dotykaj punktów i pokazuj różne skoki." : "Start 30, skok +40. Dotknij miejsca lądowania."} accent="from-cyan-500 to-blue-900">
    <div className="rounded-3xl bg-white/10 px-4 py-10"><div className="relative mx-auto flex max-w-4xl justify-between border-t-8 border-cyan-200 pt-5">{values.map((v) => <button key={v} disabled={readOnly} onClick={() => setPoint(v)} className={`touch-manipulation relative min-h-16 min-w-14 rounded-xl text-xl font-black ${point === v ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-slate-900/70"}`}><span className="absolute -top-8 left-1/2 h-6 w-1 -translate-x-1/2 bg-cyan-200" />{v}</button>)}</div></div>
    {!teacher && point !== 30 ? <Result ok={point === 70}>{point === 70 ? "Skok zakończył się na 70." : "Policz cztery dziesiątki w prawo."}</Result> : null}
  </Frame>;
}

function RoundingLab({ readOnly }: { readOnly: boolean }) {
  const [choice, setChoice] = useState<number | null>(null);
  return <Frame index={4} title="Zaokrąglarka" instruction="347 leży między 300 i 400. Dotknij bliższej setki." accent="from-sky-500 to-cyan-900">
    <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]"><button disabled={readOnly} onClick={() => setChoice(300)} className={`touch-manipulation min-h-32 rounded-3xl text-5xl font-black ${choice === 300 ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>300</button><div className="rounded-full bg-white px-5 py-4 text-3xl font-black text-slate-950">347</div><button disabled={readOnly} onClick={() => setChoice(400)} className={`touch-manipulation min-h-32 rounded-3xl text-5xl font-black ${choice === 400 ? "bg-cyan-300 text-slate-950 ring-4 ring-white" : "bg-white/10"}`}>400</button></div>
    {choice ? <Result ok={choice === 300}>{choice === 300 ? "347 jest bliżej 300." : "Od 347 do 300 są 47, a do 400 aż 53."}</Result> : null}
  </Frame>;
}

function BridgeLab({ readOnly }: { readOnly: boolean }) {
  const [steps, setSteps] = useState<number[]>([]); const add = (v: number) => !readOnly && setSteps((s) => [...s, v].slice(0, 2)); const sum = 47 + steps.reduce((a, b) => a + b, 0);
  return <Frame index={5} title="Most do dziesiątki" instruction="Rozłóż +6 na dwa skoki. Najpierw dotrzyj do 50." accent="from-emerald-500 to-teal-900">
    <div className="flex flex-wrap items-center justify-center gap-3 text-3xl font-black"><span className="rounded-2xl bg-white/10 p-5">47</span>{steps.map((v, i) => <span key={i} className="rounded-2xl bg-emerald-300 p-5 text-emerald-950">+{v}</span>)}<span className="rounded-2xl bg-white p-5 text-slate-950">{sum}</span></div><div className="mt-6 flex justify-center gap-3">{[1,2,3,4,5,6].map((v) => <button key={v} disabled={readOnly || steps.length >= 2} onClick={() => add(v)} className="touch-manipulation h-16 w-16 rounded-2xl bg-white/10 text-2xl font-black">+{v}</button>)}</div><button onClick={() => setSteps([])} className="mx-auto mt-4 block rounded-xl px-4 py-2 text-sm font-bold">Wyczyść</button>
    {steps.length === 2 ? <Result ok={steps[0] === 3 && steps[1] === 3}>{steps[0] === 3 && steps[1] === 3 ? "47 + 3 = 50, potem +3 = 53." : "Pierwszy skok powinien zakończyć się na pełnej dziesiątce."}</Result> : null}
  </Frame>;
}

function ArrayLab({ readOnly, teacher }: { readOnly: boolean; teacher: boolean }) {
  const [rows, setRows] = useState(teacher ? 4 : 3); const [cols, setCols] = useState(teacher ? 6 : 5); const change = (setter: (v: number) => void, v: number, d: number) => !readOnly && setter(Math.max(1, Math.min(8, v + d)));
  return <Frame index={6} title="Rzędy i kolumny" instruction={teacher ? "Zmieniaj wymiary prostokąta i pokazuj iloczyn jako pole." : "Zbuduj 4 rzędy po 6 pól."} accent="from-amber-500 to-orange-900">
    <div className="grid gap-5 lg:grid-cols-[auto_1fr]"><div className="space-y-3">{[["Rzędy",rows,setRows],["Kolumny",cols,setCols]].map(([label,value,setter]) => <div key={String(label)} className="rounded-2xl bg-white/10 p-3"><p className="text-center text-xs font-black">{String(label)}</p><div className="mt-2 flex items-center gap-3"><button onClick={() => change(setter as (v:number)=>void, value as number,-1)} className="h-12 w-12 rounded-xl bg-white/10 text-2xl">−</button><b className="w-8 text-center text-2xl">{String(value)}</b><button onClick={() => change(setter as (v:number)=>void, value as number,1)} className="h-12 w-12 rounded-xl bg-white text-2xl text-slate-950">+</button></div></div>)}</div><div style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }} className="grid gap-2 rounded-3xl bg-amber-950/50 p-4 [perspective:700px]">{Array.from({ length: rows * cols }).map((_, i) => <span key={i} className="aspect-square rounded-lg border border-amber-100/40 bg-gradient-to-br from-amber-200 to-orange-500 shadow-[inset_-5px_-5px_0_rgba(120,53,15,.3)] [transform:rotateX(8deg)]" />)}</div></div><p className="mt-5 text-center text-3xl font-black">{rows} × {cols} = {rows * cols}</p>{!teacher ? <Result ok={rows === 4 && cols === 6}>{rows === 4 && cols === 6 ? "Zbudowano 4 rzędy po 6 pól." : "Ustaw 4 rzędy i 6 kolumn."}</Result> : null}
  </Frame>;
}

function DivisionLab({ readOnly }: { readOnly: boolean }) {
  const [remainder, setRemainder] = useState<number | null>(null);
  return <Frame index={7} title="Paczki z resztą" instruction="48 cukierków mieści się w 6 pełnych paczkach po 8. Policz czerwone cukierki poza paczkami." accent="from-orange-500 to-rose-900">
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({length:6}).map((_,p)=><div key={p} className="grid grid-cols-4 gap-1 rounded-2xl border border-white/20 bg-white/10 p-3">{Array.from({length:8}).map((__,i)=><span key={i} className="aspect-square rounded-full bg-orange-300" />)}</div>)}</div><div className="mt-5 flex justify-center gap-2">{Array.from({length:5}).map((_,i)=><span key={i} className="h-9 w-9 rounded-full bg-rose-400" />)}</div><div className="mt-6 flex justify-center gap-3">{[3,5,8].map(v=><button key={v} disabled={readOnly} onClick={()=>setRemainder(v)} className={`h-16 w-20 rounded-2xl text-2xl font-black ${remainder===v?"bg-rose-300 text-slate-950":"bg-white/10"}`}>{v}</button>)}</div>{remainder ? <Result ok={remainder===5}>{remainder===5?"53 = 6 × 8 + 5":"Policz tylko cukierki poza paczkami."}</Result>:null}
  </Frame>;
}

function FractionLab({ readOnly, teacher }: { readOnly: boolean; teacher: boolean }) {
  const [parts, setParts] = useState<boolean[]>([false,false,false,false]); const selected=parts.filter(Boolean).length; const toggle=(i:number)=>!readOnly&&setParts(p=>p.map((v,j)=>j===i?!v:v));
  return <Frame index={8} title="Pizza ułamków" instruction={teacher?"Zaznaczaj kawałki i pytaj, jaki ułamek pizzy widać.":"Zaznacz dokładnie jedną czwartą pizzy."} accent="from-pink-500 to-rose-900"><div className="mx-auto grid h-64 w-64 grid-cols-2 overflow-hidden rounded-full border-8 border-amber-100 bg-amber-100 shadow-[0_18px_0_#9a3412]">{parts.map((on,i)=><button key={i} disabled={readOnly} onClick={()=>toggle(i)} className={`touch-manipulation border-2 border-amber-900/40 ${on?"bg-rose-500":"bg-gradient-to-br from-amber-200 to-orange-400"}`} aria-label={`Kawałek ${i+1}`} />)}</div><p className="mt-5 text-center text-4xl font-black">{selected}/4</p>{!teacher&&selected>0?<Result ok={selected===1}>{selected===1?"To dokładnie jedna z czterech równych części.":"Zostaw zaznaczony jeden kawałek."}</Result>:null}</Frame>;
}

function ShapeLab({ readOnly }: { readOnly: boolean }) {
  const [selected,setSelected]=useState<string|null>(null); const shapes=[{id:"rect",label:"Prostokąt",symbol:"▭"},{id:"square",label:"Kwadrat",symbol:"□"},{id:"triangle",label:"Trójkąt",symbol:"△"}];
  return <Frame index={9} title="Park figur" instruction="Przenieś figurę z czterema równymi bokami do podświetlonej strefy." accent="from-lime-500 to-emerald-900"><div onDragOver={e=>e.preventDefault()} onDrop={e=>setSelected(e.dataTransfer.getData("text/plain"))} className="mx-auto min-h-28 max-w-xl rounded-3xl border-4 border-dashed border-lime-300 bg-lime-300/10 p-5 text-center"><p className="font-black text-lime-200">4 RÓWNE BOKI</p>{selected?<div className="mt-2 text-7xl">{shapes.find(s=>s.id===selected)?.symbol}</div>:null}</div><div className="mt-6 grid grid-cols-3 gap-3">{shapes.map(s=><button key={s.id} draggable={!readOnly} onDragStart={e=>e.dataTransfer.setData("text/plain",s.id)} onClick={()=>setSelected(s.id)} className="touch-manipulation rounded-2xl bg-white/10 p-4"><span className="block text-7xl">{s.symbol}</span><b>{s.label}</b></button>)}</div>{selected?<Result ok={selected==="square"}>{selected==="square"?"Kwadrat ma cztery równe boki.":"Obejrzyj długości wszystkich boków."}</Result>:null}</Frame>;
}

function ChartLab({ readOnly, teacher }: { readOnly: boolean; teacher: boolean }) {
  const [bars,setBars]=useState([3,5,7]); const [selected,setSelected]=useState<number|null>(null); const change=(i:number,d:number)=>!readOnly&&setBars(b=>b.map((v,j)=>j===i?Math.max(1,Math.min(9,v+d)):v)); const highest=bars.indexOf(Math.max(...bars));
  return <Frame index={10} title="Wykres odkrywcy" instruction={teacher?"Zmieniaj wysokość słupków i zadawaj pytania o dane.":"Dotknij najwyższego słupka."} accent="from-indigo-500 to-violet-900"><div className="flex h-64 items-end justify-around gap-4 rounded-3xl border-b-4 border-white/40 bg-white/5 px-4 pt-6">{bars.map((v,i)=><div key={i} className="flex h-full flex-1 flex-col items-center justify-end"><button disabled={readOnly} onClick={()=>setSelected(i)} style={{height:`${v*10}%`}} className={`touch-manipulation w-full max-w-28 rounded-t-2xl ${selected===i?"bg-cyan-300 ring-4 ring-white":"bg-gradient-to-t from-indigo-600 to-violet-300"}`} aria-label={`Słupek ${String.fromCharCode(65+i)}: ${v}`} /><b className="mt-2 text-xl">{String.fromCharCode(65+i)}</b>{teacher?<div className="mt-2 flex gap-1"><button onClick={()=>change(i,-1)} className="h-10 w-10 rounded-lg bg-white/10">−</button><button onClick={()=>change(i,1)} className="h-10 w-10 rounded-lg bg-white text-slate-950">+</button></div>:null}</div>)}</div>{!teacher&&selected!==null?<Result ok={selected===highest}>{selected===highest?"To najwyższy słupek.":"Porównaj wysokości od wspólnej dolnej linii."}</Result>:null}</Frame>;
}
