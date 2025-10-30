"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RequireAuth from "@/components/guard/RequireAuth";
import { getToken } from "@/lib/auth";
import { formatRelativeTime, formatDateTime } from "@/lib/formatters";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import type { Notification } from "@/types/notification";

export const dynamic = "force-dynamic";

function AdminNotificationsInner() {
  const router = useRouter();
  const token = getToken();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      // TODO: API - Implement GET /api/notifications
      setNotifications([]);
      toast.info("Notifications will load when backend is ready");
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const markAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const clearAllRead = async () => {
    if (!token) return;

    try {
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      toast.success("Read notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_complaint":
        return "🆕";
      case "new_apology":
        return "📝";
      case "complaint_updated":
        return "🔧";
      case "apology_updated":
        return "✏️";
      default:
        return "🔔";
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (!notification.relatedId || !notification.relatedType) return "#";

    const type =
      notification.relatedType === "complaint" ? "complaints" : "apologies";
    return `/admin/${type}/${notification.relatedId}`;
  };

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900 dark:hover:to-purple-900 transition-all rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Notifications
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount !== 1 ? "s" : ""
                          }`
                        : "All caught up!"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="rounded-xl border-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950 dark:hover:to-emerald-950 transition-all"
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Mark all read
                    </Button>
                  )}
                  {notifications.filter((n) => n.isRead).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllRead}
                      className="text-red-600 hover:text-red-700 rounded-xl border-2 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear read
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as "all" | "unread")}
          >
            <TabsList className="mb-4 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-1">
              <TabsTrigger value="all" className="rounded-lg">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-lg">
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter}>
              {isLoading ? (
                <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Loading notifications...
                    </p>
                  </CardContent>
                </Card>
              ) : filteredNotifications.length === 0 ? (
                <Card className="rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10">
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {filter === "unread"
                        ? "No unread notifications"
                        : "No notifications yet"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filter === "unread"
                        ? "You're all caught up!"
                        : "You'll receive notifications about new complaints and apologies here"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`rounded-2xl border-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all ${
                        !notification.isRead
                          ? "border-l-4 border-l-indigo-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/50 dark:to-indigo-950/30"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={getNotificationLink(notification)}
                              className="block group"
                            >
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <Badge
                                    variant="default"
                                    className="flex-shrink-0 rounded-lg"
                                  >
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span>
                                  {formatRelativeTime(notification.createdAt)}
                                </span>
                                <span>•</span>
                                <span>
                                  {formatDateTime(notification.createdAt)}
                                </span>
                              </div>
                            </Link>
                          </div>
                          <div className="flex flex-col gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950 dark:hover:to-emerald-950 transition-all"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                deleteNotification(notification.id)
                              }
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-all"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function AdminNotificationsPage() {
  return <AdminNotificationsInner />;
}
