export type NotificationType =
  | "complaint_updated"
  | "apology_updated"
  | "new_complaint"
  | "new_apology"
  | "complaint_resolved"
  | "apology_approved"
  | "apology_rejected";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // ID of complaint/apology
  relatedType?: "complaint" | "apology";
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationResponse {
  count: number;
  unreadCount: number;
  data: Notification[];
}
