/**
 * Shared utility functions for date formatting
 */

/**
 * Format a date string or Date object to a localized date string
 * @param date - Date string or Date object
 * @param includeTime - Whether to include time in the formatted string
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  includeTime = false
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  if (includeTime) {
    return dateObj.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string or Date object to include time
 * Alias for formatDate with includeTime=true
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  return formatDate(date, true);
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function getRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  return formatDate(date);
}

/**
 * Alias for getRelativeTime for consistency
 */
export const formatRelativeTime = getRelativeTime;

/**
 * Normalize status values from backend (pending, in-review -> open, inprogress)
 * Ensures consistent status handling across the application
 */
export function normalizeStatus(
  status: string | undefined | null
):
  | "open"
  | "inprogress"
  | "resolved"
  | "accepted"
  | "rejected"
  | "reviewed"
  | "submitted" {
  if (!status) return "open";

  const normalized = status.toLowerCase().replace(/[-_]/g, "");

  // Map variations to standard statuses
  if (normalized === "pending") return "open";
  if (normalized === "inreview" || normalized === "inprogress")
    return "inprogress";

  // Return as-is if already standard
  const validStatuses = [
    "open",
    "inprogress",
    "resolved",
    "accepted",
    "rejected",
    "reviewed",
    "submitted",
  ];
  if (validStatuses.includes(normalized)) {
    return normalized as any;
  }

  return "open"; // fallback
}

/**
 * Get human-readable label for status
 */
export function getStatusLabel(status: string | undefined | null): string {
  const normalized = normalizeStatus(status);

  const labels: Record<string, string> = {
    open: "Open",
    inprogress: "In Progress",
    resolved: "Resolved",
    accepted: "Accepted",
    rejected: "Rejected",
    reviewed: "Reviewed",
    submitted: "Submitted",
  };

  return labels[normalized] || status || "Unknown";
}
