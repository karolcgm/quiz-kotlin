import { notFound } from "next/navigation";
import { AssignmentProgressView } from "@/components/teacher/AssignmentProgressView";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { windowStateLabel } from "@/lib/assignments/window";
import {
  formatAssignmentWindow,
  loadAssignmentProgressDetail,
} from "@/lib/teacher/assignmentProgress";

export const dynamic = "force-dynamic";

interface AssignmentProgressPageProps {
  params: Promise<{ assignmentId: string }>;
}

export default async function AssignmentProgressPage({ params }: AssignmentProgressPageProps) {
  await requireRole("teacher");
  const { assignmentId } = await params;
  const supabase = await createClient();
  const detail = await loadAssignmentProgressDetail(supabase, assignmentId);

  if (!detail) {
    notFound();
  }

  return (
    <AssignmentProgressView
      detail={detail}
      windowLabel={windowStateLabel(detail.windowState)}
      windowFormatted={formatAssignmentWindow(detail)}
    />
  );
}
