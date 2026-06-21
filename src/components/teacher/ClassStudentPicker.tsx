import Link from "next/link";
import { buildPanelUrl } from "@/lib/teacher/panelFilters";

export interface ClassOption {
  id: string;
  label: string;
}

export interface StudentOption {
  id: string;
  label: string;
}

interface ClassStudentPickerProps {
  basePath: string;
  classes: ClassOption[];
  students: StudentOption[];
  selectedClassId?: string;
  selectedStudentId?: string;
  extraParams?: Record<string, string | undefined>;
}

export function ClassStudentPicker({
  basePath,
  classes,
  students,
  selectedClassId,
  selectedStudentId,
  extraParams = {},
}: ClassStudentPickerProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">1. Wybierz klasę</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {classes.length === 0 && (
          <p className="text-sm text-slate-500">Brak klas — dodaj je w sekcji Uczniowie.</p>
        )}
        {classes.map((classOption) => {
          const active = selectedClassId === classOption.id;

          return (
            <Link
              key={classOption.id}
              href={buildPanelUrl(basePath, {
                ...extraParams,
                classId: classOption.id,
                studentId: undefined,
              })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-indigo-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
              }`}
            >
              {classOption.label}
            </Link>
          );
        })}
      </div>

      {selectedClassId && (
        <>
          <p className="mt-5 text-sm font-semibold text-slate-700">2. Wybierz ucznia</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={buildPanelUrl(basePath, {
                ...extraParams,
                classId: selectedClassId,
                studentId: undefined,
              })}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                !selectedStudentId
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              Wszyscy uczniowie
            </Link>
            {students.map((student) => {
              const active = selectedStudentId === student.id;

              return (
                <Link
                  key={student.id}
                  href={buildPanelUrl(basePath, {
                    ...extraParams,
                    classId: selectedClassId,
                    studentId: student.id,
                  })}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                  }`}
                >
                  {student.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
