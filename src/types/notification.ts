export type NotificationKind =
  | "assignment"
  | "retake_request"
  | "retake_approved"
  | "grade_updated"
  | "message"
  | "test_submitted";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  linkHref: string | null;
  readAt: string | null;
  createdAt: string;
}

export type RetakeRequestStatus = "pending" | "approved" | "rejected";

export interface RetakeRequest {
  id: string;
  submissionId: string;
  message: string | null;
  status: RetakeRequestStatus;
  createdAt: string;
}
