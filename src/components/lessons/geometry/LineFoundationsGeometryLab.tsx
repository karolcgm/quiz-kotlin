"use client";

import { useState } from "react";
import { AccessibleMathSvg } from "@/components/lessons/AccessibleMathSvg";
import { getLineFoundationsActivity } from "@/lib/math/geometry/lineFoundations";
import type { GeometryLabMode } from "@/types/geometry";

const OBJECTS = [
  { id: "point", label: "punkt P", rule: "Punkt oznaczamy wielką literą: P." },
  { id: "line", label: "prosta a", rule: "Prostą oznaczamy małą literą: a. Nie ma początku ani końca." },
  { id: "ray", label: "półprosta AB", rule: "Półprostą oznaczamy dwiema wielkimi literami. A jest jej początkiem." },
  { id: "segment", label: "odcinek CD", rule: "Odcinek oznaczamy wielkimi literami jego końców: CD." },
] as const;

type ObjectId = typeof OBJECTS[number]["id"];

export function LineFoundationsGeometryLab({ seed, readOnly = false }: { seed: number; mode?: GeometryLabMode; readOnly?: boolean }) {
  const activity = getLineFoundationsActivity(seed);
  const [selectedObject, setSelectedObject] = useState<ObjectId>("point");
  const [answer, setAnswer] = useState<string | null>(null);
  const locked = readOnly;
  const selected = OBJECTS.find((item) => item.id === selectedObject)!;

  if (activity === "objects") {
    return <section className="grid gap-4" data-line-foundations-lab data-activity={activity}>
      <header className="rounded-2xl bg-indigo-950 p-4 text-white">
        <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Słownik geometrii</p>
        <h2 className="mt-1 text-2xl font-black">Punkt, prosta, półprosta i odcinek</h2>
        <p className="mt-2 font-semibold text-indigo-100">Kliknij nazwę i odczytaj, jak oznaczamy każdy obiekt.</p>
      </header>
      <div className="grid gap-4">
        <div data-line-objects-figure>
        <AccessibleMathSvg
          title="Punkt, prosta, półprosta i odcinek"
          description="Punkt P, prosta a bez początku i końca, półprosta AB z początkiem A oraz odcinek CD z dwoma końcami."
          viewBox="0 0 720 390"
          className="min-h-[480px] w-full rounded-2xl border-2 border-indigo-200 bg-slate-50"
          columns={[{ key: "obiekt", label: "Obiekt" }, { key: "oznaczenie", label: "Oznaczenie" }]}
          rows={OBJECTS.map((item) => ({ obiekt: item.label, oznaczenie: item.rule }))}
        >
          <rect width="720" height="390" rx="24" fill="#f8fafc" />
          <g opacity={selectedObject === "point" ? 1 : .42}>
            <circle cx="110" cy="82" r="9" fill="#e11d48" /><text x="128" y="90" fontSize="28" fontWeight="900" fill="#881337">P</text>
            <text x="36" y="38" fontSize="20" fontWeight="900" fill="#334155">PUNKT P</text>
          </g>
          <g opacity={selectedObject === "line" ? 1 : .42}>
            <line data-line-object="line" x1="70" y1="165" x2="650" y2="165" stroke="#4338ca" strokeWidth="8" strokeLinecap="round" />
            <text x="616" y="143" fontSize="28" fontStyle="italic" fontWeight="900" fill="#312e81">a</text>
            <text x="36" y="135" fontSize="20" fontWeight="900" fill="#334155">PROSTA a</text>
          </g>
          <g opacity={selectedObject === "ray" ? 1 : .42}>
            <circle cx="90" cy="250" r="9" fill="#0f766e" /><text x="70" y="235" fontSize="24" fontWeight="900" fill="#115e59">A</text>
            <line data-line-object="ray" x1="90" y1="250" x2="650" y2="250" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
            <circle cx="315" cy="250" r="7" fill="#0f766e" /><text x="302" y="235" fontSize="24" fontWeight="900" fill="#115e59">B</text>
            <text x="36" y="218" fontSize="20" fontWeight="900" fill="#334155">PÓŁPROSTA AB</text>
          </g>
          <g opacity={selectedObject === "segment" ? 1 : .42}>
            <line x1="155" y1="338" x2="535" y2="338" stroke="#c2410c" strokeWidth="8" strokeLinecap="round" />
            <circle cx="155" cy="338" r="9" fill="#c2410c" /><circle cx="535" cy="338" r="9" fill="#c2410c" />
            <text x="142" y="320" fontSize="24" fontWeight="900" fill="#9a3412">C</text><text x="524" y="320" fontSize="24" fontWeight="900" fill="#9a3412">D</text>
            <text x="36" y="304" fontSize="20" fontWeight="900" fill="#334155">ODCINEK CD</text>
          </g>
        </AccessibleMathSvg>
        </div>
        <aside className="grid content-start gap-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 sm:grid-cols-2 lg:grid-cols-4" data-line-objects-choices>
          {OBJECTS.map((item) => <button key={item.id} type="button" className={`min-h-12 rounded-xl px-3 text-left font-black ${selectedObject === item.id ? "bg-indigo-700 text-white" : "bg-white text-slate-900"}`} onClick={() => setSelectedObject(item.id)}>{item.label}</button>)}
          <p role="status" className="rounded-xl bg-white p-3 font-bold text-indigo-950 sm:col-span-2 lg:col-span-4">{selected.rule}</p>
        </aside>
      </div>
    </section>;
  }

  if (activity === "segmentRelations") {
    return <section className="grid gap-4" data-line-foundations-lab data-activity={activity}>
      <header className="rounded-2xl bg-indigo-950 p-4 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Rozpoznawanie i zapis</p><h2 className="mt-1 text-2xl font-black">Odcinki równoległe i prostopadłe</h2><p className="mt-2 font-semibold text-indigo-100">Symbol ∥ czytamy „jest równoległy do”, a symbol ⟂ — „jest prostopadły do”.</p></header>
      <AccessibleMathSvg title="Dwie pary odcinków" description="Odcinki AB i CD są równoległe. Odcinki EF i GH są prostopadłe i tworzą kąt prosty oznaczony łukiem z kropką." viewBox="0 0 720 350" className="w-full rounded-2xl border-2 border-indigo-200 bg-slate-50" columns={[{ key: "para", label: "Para" }, { key: "relacja", label: "Relacja" }]} rows={[{ para: "AB i CD", relacja: "AB ∥ CD" }, { para: "EF i GH", relacja: "EF ⟂ GH" }]}>
        <rect width="720" height="350" rx="24" fill="#f8fafc" />
        <g data-parallel-example><text x="48" y="45" fontSize="21" fontWeight="900" fill="#334155">RÓWNOLEGŁE</text><line data-segment-line x1="70" y1="105" x2="300" y2="65" stroke="#2563eb" strokeWidth="5" /><line data-end-mark x1="68" y1="94" x2="72" y2="116" stroke="#2563eb" strokeWidth="4" /><line data-end-mark x1="298" y1="54" x2="302" y2="76" stroke="#2563eb" strokeWidth="4" /><line data-segment-line x1="88" y1="200" x2="318" y2="160" stroke="#2563eb" strokeWidth="5" /><line data-end-mark x1="86" y1="189" x2="90" y2="211" stroke="#2563eb" strokeWidth="4" /><line data-end-mark x1="316" y1="149" x2="320" y2="171" stroke="#2563eb" strokeWidth="4" /><text x="48" y="116" fontSize="22" fontWeight="900">A</text><text x="308" y="64" fontSize="22" fontWeight="900">B</text><text x="66" y="214" fontSize="22" fontWeight="900">C</text><text x="326" y="164" fontSize="22" fontWeight="900">D</text><text x="142" y="268" fontSize="32" fontWeight="900" fill="#1e3a8a">AB ∥ CD</text></g>
        <line x1="360" y1="28" x2="360" y2="320" stroke="#cbd5e1" strokeWidth="3" />
        <g><text x="400" y="45" fontSize="21" fontWeight="900" fill="#334155">PROSTOPADŁE</text><line data-segment-line x1="420" y1="188" x2="655" y2="102" stroke="#e11d48" strokeWidth="5" /><line data-end-mark x1="416" y1="178" x2="424" y2="198" stroke="#e11d48" strokeWidth="4" /><line data-end-mark x1="651" y1="92" x2="659" y2="112" stroke="#e11d48" strokeWidth="4" /><line data-segment-line x1="493" y1="65" x2="580" y2="298" stroke="#e11d48" strokeWidth="5" /><line data-end-mark x1="483" y1="69" x2="503" y2="61" stroke="#e11d48" strokeWidth="4" /><line data-end-mark x1="570" y1="302" x2="590" y2="294" stroke="#e11d48" strokeWidth="4" /><text x="397" y="205" fontSize="22" fontWeight="900">E</text><text x="663" y="105" fontSize="22" fontWeight="900">F</text><text x="466" y="92" fontSize="22" fontWeight="900">G</text><text x="596" y="288" fontSize="22" fontWeight="900">H</text><path data-right-angle-arc d="M515 121 A30 30 0 0 1 554 139" fill="none" stroke="#881337" strokeWidth="4" strokeLinecap="round" /><circle data-right-angle-dot cx="537" cy="127" r="5" fill="#881337" /><text x="482" y="330" fontSize="32" fontWeight="900" fill="#881337">EF ⟂ GH</text></g>
      </AccessibleMathSvg>
    </section>;
  }

  const pointDistance = activity === "pointDistance";
  const options = pointDistance ? ["PA", "PB", "PC"] : ["AD", "BE", "CF"];
  const correct = pointDistance ? "PB" : "BE";
  const correctChosen = answer === correct;

  return <section className="grid gap-4" data-line-foundations-lab data-activity={activity}>
    <header className="rounded-2xl bg-indigo-950 p-4 text-white">
      <p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Najkrótszy odcinek</p>
      <h2 className="mt-1 text-2xl font-black">{pointDistance ? "Odległość punktu od prostej" : "Odległość między prostymi równoległymi"}</h2>
      <p className="mt-2 font-semibold text-indigo-100">{pointDistance ? "Wybierz najkrótszy odcinek łączący punkt P z prostą a." : "Wybierz najkrótszy odcinek łączący proste a i b."}</p>
    </header>
    <AccessibleMathSvg
      title={pointDistance ? "Odległość punktu P od prostej a" : "Odległość między prostymi a i b"}
      description={pointDistance ? "Spośród odcinków PA, PB i PC najkrótszy jest PB, prostopadły do prostej a." : "Spośród odcinków AD, BE i CF najkrótszy jest BE, prostopadły do obu prostych równoległych."}
      viewBox="0 0 720 390"
      className="w-full rounded-2xl border-2 border-indigo-200 bg-slate-50"
      columns={[{ key: "odcinek", label: "Odcinek" }, { key: "wniosek", label: "Wniosek" }]}
      rows={options.map((option) => ({ odcinek: option, wniosek: option === correct ? "najkrótszy i prostopadły" : "dłuższy" }))}
    >
      <rect width="720" height="390" rx="24" fill="#f8fafc" />
      {pointDistance ? <>
        <line x1="65" y1="300" x2="655" y2="300" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" /><text x="640" y="280" fontSize="26" fontStyle="italic" fontWeight="900" fill="#312e81">a</text>
        <circle cx="360" cy="65" r="10" fill="#e11d48" /><text x="378" y="74" fontSize="28" fontWeight="900" fill="#881337">P</text>
        <line x1="360" y1="65" x2="145" y2="300" stroke="#f59e0b" strokeWidth="7" strokeDasharray="12 9" /><line x1="360" y1="65" x2="360" y2="300" stroke={correctChosen ? "#059669" : "#0f766e"} strokeWidth="9" /><line x1="360" y1="65" x2="585" y2="300" stroke="#f59e0b" strokeWidth="7" strokeDasharray="12 9" />
        <circle cx="145" cy="300" r="7" fill="#f59e0b" /><circle cx="360" cy="300" r="7" fill="#059669" /><circle cx="585" cy="300" r="7" fill="#f59e0b" /><text x="128" y="330" fontSize="24" fontWeight="900">A</text><text x="350" y="330" fontSize="24" fontWeight="900">B</text><text x="578" y="330" fontSize="24" fontWeight="900">C</text>
        {correctChosen ? <path d="M360 300v-25h25v25" fill="white" stroke="#047857" strokeWidth="5" data-distance-right-angle /> : null}
      </> : <>
        <line x1="80" y1="105" x2="640" y2="55" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" /><line x1="80" y1="325" x2="640" y2="275" stroke="#4338ca" strokeWidth="9" strokeLinecap="round" /><text x="645" y="58" fontSize="26" fontStyle="italic" fontWeight="900" fill="#312e81">a</text><text x="645" y="280" fontSize="26" fontStyle="italic" fontWeight="900" fill="#312e81">b</text>
        <line x1="155" y1="98" x2="245" y2="310" stroke="#f59e0b" strokeWidth="7" strokeDasharray="12 9" /><line x1="350" y1="81" x2="369" y2="300" stroke={correctChosen ? "#059669" : "#0f766e"} strokeWidth="9" /><line x1="535" y1="64" x2="610" y2="278" stroke="#f59e0b" strokeWidth="7" strokeDasharray="12 9" />
        <text x="135" y="88" fontSize="22" fontWeight="900">A</text><text x="235" y="338" fontSize="22" fontWeight="900">D</text><text x="330" y="70" fontSize="22" fontWeight="900">B</text><text x="360" y="330" fontSize="22" fontWeight="900">E</text><text x="520" y="53" fontSize="22" fontWeight="900">C</text><text x="612" y="302" fontSize="22" fontWeight="900">F</text>
        {correctChosen ? <g data-distance-right-angle><path d="m350 81 3 26 26-2-3-26Z" fill="white" stroke="#047857" strokeWidth="5" /><path d="m369 300-3-26 26-2 3 26Z" fill="white" stroke="#047857" strokeWidth="5" /></g> : null}
      </>}
    </AccessibleMathSvg>
    <div role="group" aria-label="Wybierz najkrótszy odcinek" className="grid grid-cols-3 gap-3">{options.map((option) => <button key={option} type="button" disabled={locked} className={`min-h-12 rounded-xl border-2 px-3 font-black ${answer === option ? option === correct ? "border-emerald-700 bg-emerald-100 text-emerald-950" : "border-rose-600 bg-rose-100 text-rose-950" : "border-indigo-300 bg-white text-indigo-950"}`} onClick={() => setAnswer(option)}>{option}</button>)}</div>
    <p role="status" className={`rounded-2xl p-4 font-bold ${correctChosen ? "bg-emerald-100 text-emerald-950" : answer ? "bg-rose-100 text-rose-950" : "bg-indigo-50 text-indigo-950"}`}>{correctChosen ? pointDistance ? "Tak. PB jest najkrótszy i tworzy z prostą a kąt prosty. Długość PB to odległość punktu P od prostej a." : "Tak. BE jest prostopadły do obu prostych. Jego długość to odległość między prostymi równoległymi." : answer ? "To nie jest najkrótsze połączenie. Szukaj odcinka tworzącego kąt prosty." : "Wybierz odcinek. Oznaczenie kąta prostego pojawi się dopiero po poprawnej decyzji."}</p>
  </section>;
}
