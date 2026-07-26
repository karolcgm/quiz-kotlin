"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { claimGeometryGameScoreAction } from "@/lib/actions/rewards";
import type { GeometryArenaVariant } from "./GeometryArenaScene";

const GeometryArenaScene = dynamic(() => import("./GeometryArenaScene").then((m) => m.GeometryArenaScene), { ssr:false, loading:()=> <div className="grid h-[430px] place-items-center rounded-3xl bg-indigo-950 font-black text-cyan-200">Uruchamiam planszę 3D…</div> });
export type GeometryGameKey = "laser-lab"|"polygon-forge"|"triangle-shipyard"|"quadrilateral-arena"|"symmetry-temple"|"geometry-inspector";
type Round = { prompt:string; options:string[]; correct:number; hint:string };
type Config = {
  title:string;
  eyebrow:string;
  description:string;
  variant:GeometryArenaVariant;
  rounds:Round[];
  boardInstruction?:string;
  checkLabel?:string;
  successLabel?:string;
};

export const GEOMETRY_GAMES: Record<GeometryGameKey,Config> = {
  "laser-lab": { title:"Laboratorium laserów", eyebrow:"Proste i kąty", description:"Skieruj wiązkę do portalu opisującego układ na planszy.", variant:"laser", rounds:[
    {prompt:"Dwie wiązki nigdy się nie przetną. Jaka to relacja?",options:["Prostopadłe","Równoległe","Przecinające","Pokrywające"],correct:1,hint:"Zachowują stałą odległość."},
    {prompt:"Wiązki przecinają się pod kątem prostym.",options:["Równoległe","Prostopadłe","Ostre","Rozwarte"],correct:1,hint:"Kąt prosty ma 90°."},
    {prompt:"Wybierz portal kąta ostrego.",options:["120°","90°","45°","180°"],correct:2,hint:"Kąt ostry jest mniejszy niż 90°."},
    {prompt:"Jeden kąt przy przecięciu ma 65°. Ile ma kąt wierzchołkowy?",options:["25°","65°","115°","180°"],correct:1,hint:"Kąty wierzchołkowe są równe."},
    {prompt:"Kąt przyległy ma 35°. Wybierz drugi kąt.",options:["55°","145°","35°","215°"],correct:1,hint:"Kąty przyległe sumują się do 180°."}]},
  "polygon-forge": {title:"Kuźnia wielokątów",eyebrow:"Wielokąty",description:"Aktywuj portal pasujący do energetycznego wielokąta.",variant:"polygon",rounds:[
    {prompt:"Figura ma 5 boków. Jak się nazywa?",options:["Trójkąt","Czworokąt","Pięciokąt","Sześciokąt"],correct:2,hint:"Nazwa mówi o liczbie boków."},
    {prompt:"Co łączy dwa niesąsiednie wierzchołki?",options:["Bok","Przekątna","Promień","Oś"],correct:1,hint:"To odcinek wewnątrz wielokąta."},
    {prompt:"Która figura nie jest wielokątem?",options:["Domknięta z odcinków","Ma łuk","Pięciokąt wklęsły","Ośmiokąt"],correct:1,hint:"Wielokąt ma wyłącznie odcinki."},
    {prompt:"Sześciokąt ma ile wierzchołków?",options:["4","5","6","8"],correct:2,hint:"Boków i wierzchołków jest tyle samo."},
    {prompt:"Boki mają długości 3, 4, 5 i 6. Obwód wynosi:",options:["12","15","18","20"],correct:2,hint:"Dodaj długości wszystkich boków."}]},
  "triangle-shipyard": {title:"Stocznia trójkątów",eyebrow:"Trójkąty",description:"Dobierz właściwy portal konstrukcyjny dla trzech ramion.",variant:"triangle",rounds:[
    {prompt:"Trzy równe boki tworzą trójkąt:",options:["Równoboczny","Równoramienny","Różnoboczny","Prostokątny"],correct:0,hint:"Wszystkie boki są równe."},
    {prompt:"Boki 2, 3 i 6 — czy konstrukcja jest możliwa?",options:["Tak","Nie","Tylko prostokątny","Tylko rozwarty"],correct:1,hint:"Dwa krótsze boki muszą mieć sumę większą od trzeciego."},
    {prompt:"Kąty 50° i 60°. Trzeci kąt ma:",options:["70°","80°","90°","110°"],correct:0,hint:"Suma kątów trójkąta to 180°."},
    {prompt:"Trójkąt ma jeden kąt 90°. Jest:",options:["Ostry","Rozwarty","Prostokątny","Równoboczny"],correct:2,hint:"Nazwa pochodzi od kąta prostego."},
    {prompt:"Dwa równe boki oznaczają trójkąt:",options:["Różnoboczny","Równoramienny","Rozwartokątny","Niemożliwy"],correct:1,hint:"Równe ramiona nadają nazwę."}]},
  "quadrilateral-arena": {title:"Arena czworokątów",eyebrow:"Czworokąty",description:"Rozpoznaj własności figury zbudowanej przez cztery pylony.",variant:"quadrilateral",rounds:[
    {prompt:"Cztery kąty proste i równe boki:",options:["Prostokąt","Kwadrat","Romb","Trapez"],correct:1,hint:"Ma własności prostokąta i rombu."},
    {prompt:"Dwie pary boków równoległych:",options:["Równoległobok","Trapez","Deltoid","Trójkąt"],correct:0,hint:"Nazwa wskazuje równoległość."},
    {prompt:"Wszystkie boki równe, kąty nie muszą być proste:",options:["Prostokąt","Romb","Trapez","Kwadrat zawsze"],correct:1,hint:"To podstawowa własność rombu."},
    {prompt:"Co najmniej jedna para boków równoległych:",options:["Trapez","Trójkąt","Okrąg","Pięciokąt"],correct:0,hint:"Tak definiujemy trapez."},
    {prompt:"Każdy kwadrat jest także:",options:["Tylko trapezem","Prostokątem i rombem","Tylko rombem","Żadnym"],correct:1,hint:"Sprawdź kąty i długości boków."}]},
  "symmetry-temple": {title:"Świątynia symetrii",eyebrow:"Oś symetrii",description:"Odbij kryształy względem świetlnej osi i wybierz właściwy portal.",variant:"symmetry",rounds:[
    {prompt:"Punkt leży 2 pola na lewo od osi. Odbicie leży:",options:["2 pola w prawo","1 pole w prawo","Na osi","4 pola w prawo"],correct:0,hint:"Odległość od osi się nie zmienia."},
    {prompt:"Kwadrat ma ile osi symetrii?",options:["1","2","4","8"],correct:2,hint:"Dwie przez środki boków i dwie przekątne."},
    {prompt:"Prostokąt niebędący kwadratem ma:",options:["0 osi","1 oś","2 osie","4 osie"],correct:2,hint:"Osie przechodzą przez środki przeciwległych boków."},
    {prompt:"Punkt leżący na osi po odbiciu:",options:["Zmienia stronę","Nie zmienia położenia","Znika","Oddala się"],correct:1,hint:"Odległość od osi wynosi zero."},
    {prompt:"Która figura może nie mieć osi symetrii?",options:["Kwadrat","Okrąg","Trójkąt różnoboczny","Prostokąt"],correct:2,hint:"Brak równych boków i kątów usuwa symetrię."}]}
  ,"geometry-inspector": {
    title:"Inspektor geometrii",
    eyebrow:"Misja diagnostyczna",
    description:"Znajduj wadliwe elementy bezpośrednio w przestrzennej konstrukcji i uruchamiaj ich naprawę.",
    variant:"inspector",
    boardInstruction:"Dotknij bezpośrednio wadliwej konstrukcji na planszy. Przyciski poniżej są alternatywą.",
    checkLabel:"Uruchom skaner",
    successLabel:"Usterka znaleziona — moduł został naprawiony!",
    rounds:[
      {prompt:"Trzy pary torów są równoległe. Znajdź parę, która nie jest równoległa.",options:["Moduł turkusowy","Moduł różowy","Moduł bursztynowy","Moduł zielony"],correct:2,hint:"Proste równoległe zachowują tę samą odległość na całej długości."},
      {prompt:"Trzy kąty są ostre. Znajdź kąt, który nie jest ostry.",options:["Moduł turkusowy","Moduł różowy","Moduł bursztynowy","Moduł zielony"],correct:2,hint:"Kąt ostry ma mniej niż 90°."},
      {prompt:"Która rama nie jest zamkniętym wielokątem?",options:["Moduł turkusowy","Moduł różowy","Moduł bursztynowy","Moduł zielony"],correct:1,hint:"W wielokącie koniec ostatniego boku łączy się z początkiem pierwszego."},
      {prompt:"Trzy ramy są równoległobokami. Znajdź tę, która nim nie jest.",options:["Moduł turkusowy","Moduł różowy","Moduł bursztynowy","Moduł zielony"],correct:3,hint:"Równoległobok ma dwie pary boków równoległych."},
      {prompt:"Znajdź moduł, w którym kryształy nie są symetryczne względem osi.",options:["Moduł turkusowy","Moduł różowy","Moduł bursztynowy","Moduł zielony"],correct:0,hint:"Po odbiciu oba kryształy muszą leżeć w tej samej odległości od osi i na tej samej wysokości."},
    ],
  }
};

export function GeometryArcadeGame({gameKey,rewardEnabled=true}:{gameKey:GeometryGameKey;rewardEnabled?:boolean}) {
  const config=GEOMETRY_GAMES[gameKey]; const [round,setRound]=useState(0); const [selected,setSelected]=useState<number|null>(null); const [score,setScore]=useState(0); const [answered,setAnswered]=useState(false); const [done,setDone]=useState(false); const [saved,setSaved]=useState<string|null>(null);
  const current=config.rounds[round];
  const check=()=>{if(selected===null)return;setAnswered(true);if(selected===current.correct)setScore(v=>v+1)};
  const next=()=>{const finalScore=score+(selected===current.correct&&!answered?1:0);if(round===config.rounds.length-1){setDone(true);if(!rewardEnabled){setSaved("Gra ukończona w trybie nauczyciela — wynik nie jest zapisywany.");return}void claimGeometryGameScoreAction(gameKey,finalScore,config.rounds.length).then(r=>setSaved(r.error??(r.awardedPoints>0?`Zdobywasz ${r.awardedPoints} pkt!`:"Ten wynik był już zapisany — punktów nie dublujemy.")));return}setRound(v=>v+1);setSelected(null);setAnswered(false)};
  if(done)return <section className="mx-auto max-w-3xl rounded-[2rem] bg-gradient-to-br from-indigo-950 to-cyan-900 p-8 text-center text-white"><p className="text-sm font-black uppercase tracking-widest text-cyan-200">Misja ukończona</p><h1 className="mt-2 text-4xl font-black">{config.title}</h1><p className="mt-5 text-6xl font-black text-amber-300">{score}/{config.rounds.length}</p><p className="mt-4 font-bold">{saved??"Zapisuję najlepszy wynik…"}</p><button onClick={()=>{setRound(0);setScore(0);setDone(false);setSaved(null);setSelected(null);setAnswered(false)}} className="mt-6 min-h-12 rounded-xl bg-cyan-300 px-6 font-black text-indigo-950">Zagraj ponownie</button></section>;
  return <section className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 p-4 text-white shadow-2xl sm:p-6"><header className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-200">Dział 4 · {config.eyebrow}</p><h1 className="text-3xl font-black">{config.title}</h1><p className="mt-1 text-sm text-indigo-100">{config.description}</p></div><span className="rounded-full bg-white/10 px-4 py-2 font-black">Runda {round+1}/{config.rounds.length}</span></header><div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px]"><GeometryArenaScene variant={config.variant} round={round} selected={selected} answered={answered} correctIndex={current.correct} choiceCount={current.options.length} onSelect={(i)=>{if(!answered)setSelected(i)}}/><aside className="rounded-3xl bg-white p-5 text-slate-950"><h2 className="text-xl font-black">{current.prompt}</h2><p className="mt-2 text-sm font-bold text-slate-600">{config.boardInstruction??"Dotknij kolorowego portalu na planszy albo odpowiedzi poniżej."}</p><div className="mt-4 grid gap-2">{current.options.map((option,i)=><button key={option} disabled={answered} onClick={()=>setSelected(i)} className={`min-h-12 rounded-xl border-2 px-3 text-left font-black ${selected===i?"border-indigo-600 bg-indigo-100":"border-slate-200 bg-white"}`}><span style={{color:["#0891b2","#db2777","#d97706","#059669"][i]}}>◆</span> {option}</button>)}</div>{!answered?<button disabled={selected===null} onClick={check} className="mt-4 min-h-12 w-full rounded-xl bg-indigo-600 font-black text-white disabled:opacity-40">{config.checkLabel??"Sprawdź portal"}</button>:<div className={`mt-4 rounded-xl p-3 font-bold ${selected===current.correct?"bg-emerald-100 text-emerald-900":"bg-rose-100 text-rose-900"}`}><p>{selected===current.correct?(config.successLabel??"Portal aktywny — dobra odpowiedź!"):"To nie ten element. Punkt za tę rundę nie został przyznany."}</p><p className="mt-1 text-sm">{current.hint}</p><button onClick={next} className="mt-3 min-h-11 w-full rounded-xl bg-slate-950 text-white">{round===config.rounds.length-1?"Zakończ misję":"Następna runda →"}</button></div>}</aside></div></section>;
}
