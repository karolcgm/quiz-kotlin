import { NotificationBell } from "@/components/notifications/NotificationBell";
import { getNotificationSummary } from "@/lib/actions/notifications";
import type { UserRole } from "@/types/auth";

interface NotificationBellWrapperProps {
  role: UserRole;
}

export async function NotificationBellWrapper({ role }: NotificationBellWrapperProps) {
  const { unreadCount, recent } = await getNotificationSummary();
  const notificationsPath =
    role === "teacher" ? "/nauczyciel/powiadomienia" : "/uczen/powiadomienia";

  return (
    <NotificationBell
      unreadCount={unreadCount}
      recent={recent}
      notificationsPath={notificationsPath}
    />
  );
}
