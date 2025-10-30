import { Badge } from "@/components/ui/badge";
import { normalizeStatus } from "@/lib/formatters";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

/**
 * Shared status badge component for complaints
 */
export function ComplaintStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "resolved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </Badge>
      );
    case "inprogress":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case "open":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Open
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

/**
 * Shared status badge component for apologies
 */
export function ApologyStatusBadge({
  status,
}: {
  status: string | null | undefined;
}) {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "reviewed":
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          Reviewed
        </Badge>
      );
    case "submitted":
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Submitted
        </Badge>
      );
  }
}

/**
 * Shared priority badge component
 */
export function PriorityBadge({ priority }: { priority?: string | null }) {
  if (!priority) return null;

  switch (priority.toLowerCase()) {
    case "high":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          High Priority
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Low
        </Badge>
      );
    default:
      return null;
  }
}

/**
 * Apology type badge component
 */
export function ApologyTypeBadge({ type }: { type?: string | null }) {
  if (!type) return null;

  const colors: Record<string, string> = {
    outing: "bg-blue-100 text-blue-800",
    misconduct: "bg-red-100 text-red-800",
    miscellaneous: "bg-purple-100 text-purple-800",
  };

  const typeValue = type.toLowerCase();
  const colorClass = colors[typeValue] || "bg-gray-100 text-gray-800";

  return (
    <Badge className={colorClass}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
}
