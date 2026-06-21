"use client";

import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "@/components/ui/BellIcon";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { AppNotification } from "@/types/notification";

interface NotificationBellProps {
  unreadCount: number;
  recent: AppNotification[];
  notificationsPath: string;
}

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function NotificationBell({
  unreadCount,
  recent,
  notificationsPath,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Powiadomienia${unreadCount > 0 ? `, ${unreadCount} nieprzeczytanych` : ""}`}
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-red-600 px-1 text-[0.65rem] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Zamknij powiadomienia"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="font-bold text-slate-900">Powiadomienia</p>
              {unreadCount > 0 && (
                <form action={markAllNotificationsReadAction}>
                  <button
                    type="submit"
                    className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    Oznacz wszystkie
                  </button>
                </form>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 && (
                <p className="px-4 py-6 text-sm text-slate-500">Brak powiadomień.</p>
              )}
              {recent.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-slate-100 px-4 py-3 ${notification.readAt ? "bg-white" : "bg-indigo-50/60"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{notification.body}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatWhen(notification.createdAt)}</p>
                      {notification.linkHref && (
                        <Link
                          href={notification.linkHref}
                          className="mt-2 inline-block text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                          onClick={() => setOpen(false)}
                        >
                          Otwórz
                        </Link>
                      )}
                    </div>
                    {!notification.readAt && (
                      <form action={markNotificationReadAction}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button
                          type="submit"
                          className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-800"
                        >
                          ✓
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 px-4 py-3">
              <Link
                href={notificationsPath}
                className="text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                onClick={() => setOpen(false)}
              >
                Zobacz wszystkie
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
