import type { GradeLevel } from "@/types/curriculum";

export type UserRole = "admin" | "teacher" | "student";
export type ProfileStatus = "pending_admin" | "active" | "blocked";

export interface UserProfile {
  id: string;
  role: UserRole;
  status: ProfileStatus;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  email: string | null;
}

export interface School {
  id: string;
  name: string;
  city: string | null;
}

export interface TeacherClass {
  id: string;
  schoolId: string;
  teacherId: string;
  name: string;
  groupName: string;
  schoolGrade: GradeLevel;
}

export interface StudentInvitation {
  id: string;
  token: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  email: string | null;
  status: "open" | "used" | "revoked";
  expiresAt: string;
}
