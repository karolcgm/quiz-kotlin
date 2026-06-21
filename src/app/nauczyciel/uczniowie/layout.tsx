import { StudentsSectionNav } from "@/components/teacher/StudentsSectionNav";

export default function TeacherStudentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <StudentsSectionNav />
      {children}
    </div>
  );
}
