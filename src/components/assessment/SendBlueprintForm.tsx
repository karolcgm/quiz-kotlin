"use client";

import { useMemo, useState } from "react";
import { createBlueprintAssignmentAction } from "@/lib/actions/assessments";
import type { AssessmentVersionCode } from "@/types/assessmentBlueprint";
import type { SendTestStudent } from "@/components/tests/SendTestForm";

interface SendBlueprintFormProps {
  lessonId: string;
  blueprintId: string;
  blueprintTitle: string;
  versionCode: AssessmentVersionCode;
  maxScore: number;
  checksum: string;
  classes: {
    id: string;
    name: string;
    group_name: string;
    school_name: string;
  }[];
  students: SendTestStudent[];
}

function studentLabel(student: SendTestStudent): string {
  const name =
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    student.display_name ||
    student.email ||
    "Uczeń";
  return `${name} (${student.email ?? "brak email"})`;
}

export function SendBlueprintForm({
  lessonId,
  blueprintId,
  blueprintTitle,
  versionCode,
  maxScore,
  checksum,
  classes,
  students,
}: SendBlueprintFormProps) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [scope, setScope] = useState<"class" | "selected">("class");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const classStudents = useMemo(
    () => students.filter((student) => student.class_id === classId),
    [students, classId],
  );

  const selectedClass = classes.find((c) => c.id === classId);

  function toggleStudent(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  return (
    <form action={createBlueprintAssignmentAction} className="mt-6 grid gap-4">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="blueprintId" value={blueprintId} />
      <input type="hidden" name="versionCode" value={versionCode} />
      <input type="hidden" name="scope" value={scope} />
      {scope === "selected" &&
        selectedIds.map((id) => <input key={id} type="hidden" name="studentIds" value={id} />)}

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
        <p className="font-semibold">Snapshot wersji {versionCode}</p>
        <p className="mt-1">
          {maxScore} pkt · checksum{" "}
          <span className="break-all font-mono text-xs">{checksum.slice(0, 16)}…</span>
        </p>
        <p className="mt-2 text-xs text-violet-800">
          Po wysłaniu pytania są zamrożone — nie można ich edytować po rozpoczęciu prób.
        </p>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Grupa uczniów</span>
        <select
          name="classId"
          required
          value={classId}
          onChange={(event) => {
            setClassId(event.target.value);
            setSelectedIds([]);
          }}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value="">Wybierz grupę</option>
          {classes.map((teacherClass) => (
            <option key={teacherClass.id} value={teacherClass.id}>
              {teacherClass.school_name} — {teacherClass.name} / {teacherClass.group_name}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Komu wysłać pracę?</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="scopePicker"
            checked={scope === "class"}
            onChange={() => setScope("class")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold text-slate-900">Cała grupa</span>
            <span className="mt-0.5 block text-sm text-slate-600">
              Wszyscy uczniowie ({classStudents.length}).
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="scopePicker"
            checked={scope === "selected"}
            onChange={() => setScope("selected")}
            className="mt-1"
          />
          <span>
            <span className="font-semibold text-slate-900">Wybrani uczniowie</span>
          </span>
        </label>
      </fieldset>

      {scope === "selected" ? (
        <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          {classStudents.map((student) => (
            <label key={student.student_id} className="flex items-center gap-3 text-sm font-medium text-slate-800">
              <input
                type="checkbox"
                checked={selectedIds.includes(student.student_id)}
                onChange={() => toggleStudent(student.student_id)}
              />
              {studentLabel(student)}
            </label>
          ))}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Tytuł widoczny dla ucznia</span>
        <input
          name="title"
          required
          defaultValue={`${blueprintTitle} · wersja ${versionCode}`}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Maksymalna liczba prób</span>
        <input
          name="maxAttempts"
          type="number"
          min={1}
          max={5}
          defaultValue={1}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Limit czasu (minuty, opcjonalnie)</span>
        <input
          name="timeLimitMinutes"
          type="number"
          min={1}
          max={180}
          defaultValue={15}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Rodzaj zadania</span>
        <select name="assignmentKind" defaultValue="classwork" className="w-full rounded-xl border border-slate-200 px-4 py-3">
          <option value="classwork">Kartkówka / test na lekcji</option>
          <option value="homework">Praca domowa</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Dostępne od (opcjonalnie)</span>
        <input name="startsAt" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Termin zakończenia (opcjonalnie)</span>
        <input name="dueAt" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>

      {selectedClass && scope === "class" && classStudents.length === 0 ? (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">
          Grupa nie ma uczniów — najpierw zaproś uczniów.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={scope === "selected" && selectedIds.length === 0}
        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Opublikuj pracę z snapshotem
      </button>
    </form>
  );
}
