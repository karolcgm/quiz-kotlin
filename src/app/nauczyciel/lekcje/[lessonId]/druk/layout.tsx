import type { ReactNode } from "react";

/** Layout druku — bez TeacherShell (auth z nauczyciel/layout.tsx) */
export default function LessonPrintLayout({ children }: { children: ReactNode }) {
  return <div className="print-route-root -mx-4 -my-6 bg-slate-100 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">{children}</div>;
}
