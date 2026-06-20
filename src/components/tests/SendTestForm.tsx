"use client";

import { useMemo, useState } from "react";
import { createAssignmentAction } from "@/lib/actions/assignments";

export type SendTestStudent = {
  student_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  email: string | null;
  class_id: string;
  class_name: string;
  group_name: string;
  school_name: string;
};

interface SendTestFormProps {
  testId: string;
  testTitle: string;
  classes: {
    id: string;
    name: string;
    group_name: string;
    school_name: string;
  }[];
  students: SendTestStudent[];
  defaultClassId?: string;
}

function studentLabel(student: SendTestStudent): string {
  const name =
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    student.display_name ||
    student.email ||
    "Uczeń";
  return `${name} (${student.email ?? "brak email"})`;
}

export function SendTestForm({ testId, testTitle, classes, students, defaultClassId }: SendTestFormProps) {
  const [classId, setClassId] = useState(defaultClassId ?? classes[0]?.id ?? "");
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
    <form action={createAssignmentAction} className="mt-6 grid gap-4">
      <input type="hidden" name="testId" value={testId} />
      <input type="hidden" name="scope" value={scope} />
      {scope === "selected" &&
        selectedIds.map((id) => <input key={id} type="hidden" name="studentIds" value={id} />)}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Grupa uczniów (klasa / przedmiot)</span>
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
        <p className="text-xs text-slate-500">
          To jest grupa z panelu Uczniowie (np. „klasa 1 / mat1”), nie poziom programu testu.
        </p>
      </label>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">Komu wysłać test?</legend>
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
              Wszyscy uczniowie przypisani do wybranej grupy ({classStudents.length}).
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
            <span className="mt-0.5 block text-sm text-slate-600">Zaznacz konkretne osoby z grupy.</span>
          </span>
        </label>
      </fieldset>

      {scope === "selected" && (
        <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          {classStudents.length === 0 && (
            <p className="text-sm text-indigo-900">W tej grupie nie ma jeszcze uczniów.</p>
          )}
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
      )}

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Tytuł widoczny dla ucznia</span>
        <input
          name="title"
          required
          defaultValue={testTitle}
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
        <span className="text-sm font-semibold text-slate-700">Termin (opcjonalnie)</span>
        <input name="dueAt" type="datetime-local" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
      </label>

      {selectedClass && scope === "class" && classStudents.length === 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm font-medium text-amber-900">
          Grupa „{selectedClass.name} / {selectedClass.group_name}” nie ma uczniów. Najpierw zaproś ucznia w
          zakładce Uczniowie.
        </p>
      )}

      <button
        type="submit"
        disabled={scope === "selected" && selectedIds.length === 0}
        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Wyślij test uczniom
      </button>
    </form>
  );
}
