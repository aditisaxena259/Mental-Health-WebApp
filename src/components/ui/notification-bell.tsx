"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/formatters";
import { toast } from "sonner";
import type { Notification, NotificationResponse } from "@/types/notification";

interface NotificationBellProps {
  role: "student" | "admin";
}

export function NotificationBell({ role }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = async (showToast = false) => {
    if (!token) return;

    try {
      // TODO: API - Implement /api/notifications endpoint
      // const data = await api<NotificationResponse>(
      //   "/notifications",
      //   { method: "GET" },
      //   token
      // );
      // setNotifications(data.data);
      // setUnreadCount(data.unreadCount);

      // Placeholder: Show that notifications are ready
      if (showToast) {
        toast.info("Notifications will be available when backend is ready");
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      // TODO: API - Implement PATCH /api/notifications/:id/read
      // await api(
      //   `/notifications/${notificationId}/read`,
      //   { method: "PATCH" },
      //   token
      // );

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      // TODO: API - Implement PATCH /api/notifications/read-all
      // await api("/notifications/read-all", { method: "PATCH" }, token);

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      // TODO: API - Implement DELETE /api/notifications/:id
      // await api(
      //   `/notifications/${notificationId}`,
      //   { method: "DELETE" },
      //   token
      // );

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (!notifications.find((n) => n.id === notificationId)?.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (!notification.relatedId || !notification.relatedType) return "#";

    const basePath = role === "admin" ? "/admin" : "/student";
    const type =
      notification.relatedType === "complaint" ? "complaints" : "apologies";
    return `${basePath}/${type}/${notification.relatedId}`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "complaint_updated":
      case "complaint_resolved":
        return "🔧";
      case "apology_updated":
      case "apology_approved":
        return "✅";
      case "apology_rejected":
        return "❌";
      case "new_complaint":
        return "🆕";
      case "new_apology":
        return "📝";
      default:
        return "🔔";
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">You'll be notified of updates here</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-accent/50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          setIsOpen(false);
                        }}
                      >
                        <h4 className="text-sm font-medium text-foreground hover:text-primary">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </Link>
                    </div>
                    <div className="flex flex-col gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-600"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted">
            <Link href={`/${role}/notifications`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

