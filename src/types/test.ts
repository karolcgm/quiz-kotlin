import type { GradeLevel } from "@/types/curriculum";
import type { TestSkill, TestWidgetParams } from "@/types/testWidget";

export type TestStatus = "draft" | "published" | "archived";

export interface TestItem {
  id: string;
  position: number;
  simulationSlug: string;
  widgetKind: string;
  skill: TestSkill;
  title: string;
  prompt: string;
  points: number;
  params: TestWidgetParams;
}

export interface TeacherTest {
  id: string;
  teacherId: string;
  schoolId: string;
  title: string;
  description: string | null;
  instruction: string | null;
  classLevel: GradeLevel;
  status: TestStatus;
  maxPoints: number;
  items: TestItem[];
}

export interface TestDraftInput {
  title: string;
  description?: string;
  instruction?: string;
  schoolId: string;
  classLevel: GradeLevel;
  items: Omit<TestItem, "id">[];
}
