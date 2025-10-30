// app/admin/apologies/[id]/page.jsx
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  UserCircle,
  Calendar,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";
import RequireAuth from "@/components/guard/RequireAuth";

export default function ApologyDetailPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const apologyId = unwrappedParams.id;
  const [newComment, setNewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState("reviewed");
  const [apology, setApology] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? getToken() : null;

  useEffect(() => {
    if (!token || !apologyId) return;

    // Try to fetch single apology first, fall back to list if not available
    api(`/admin/apologies/${apologyId}`, { method: "GET" }, token)
      .then((data) => {
        setApology(data);
        setReviewStatus(data.status || "reviewed");
        setLoading(false);
      })
      .catch((firstError) => {
        // If single apology fetch fails, try to get from list
        api(`/admin/apologies`, { method: "GET" }, token)
          .then((response) => {
            const apologies = response?.data || response || [];
            const found = Array.isArray(apologies)
              ? apologies.find((a) => a.id === apologyId)
              : null;
            if (found) {
              setApology(found);
              setReviewStatus(found.status || "reviewed");
            } else {
              toast.error("Apology not found");
            }
            setLoading(false);
          })
          .catch((e) => {
            toast.error(e?.message || "Failed to load apology");
            setLoading(false);
          });
      });
  }, [apologyId, token]);

  const handleStatusChange = (status) => {
    setReviewStatus(status);
    if (!token) return;

    api(
      `/admin/apologies/${apologyId}/review`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      token
    )
      .then(() => {
        toast.success(`Apology ${status}`);
        setApology((prev) => ({ ...prev, status }));
      })
      .catch((e) => toast.error(e?.message || "Failed to update status"));
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    if (!token) return;

    // Send comment with status using the review endpoint
    api(
      `/admin/apologies/${apologyId}/review`,
      {
        method: "PUT",
        body: JSON.stringify({
          status: reviewStatus,
          comment: newComment.trim(),
        }),
      },
      token
    )
      .then(() => {
        toast.success("Comment added");
        setNewComment("");
        setApology((prev) => ({ ...prev, comment: newComment.trim() }));
      })
      .catch((e) => toast.error(e?.message || "Failed to send comment"));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Rejected
          </Badge>
        );
      case "reviewed":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Reviewed
          </Badge>
        );
      case "submitted":
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Submitted
          </Badge>
        );
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      outing: "bg-blue-100 text-blue-800",
      misconduct: "bg-red-100 text-red-800",
      miscellaneous: "bg-purple-100 text-purple-800",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-card-foreground"}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || "Unknown"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <RequireAuth roles={["admin"]}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading apology details...</p>
          </div>
        </div>
      </RequireAuth>
    );
  }

  if (!apology) {
    return (
      <RequireAuth roles={["admin"]}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Apology Not Found
            </h2>
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth roles={["admin"]}>
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center text-indigo-600  mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Apology Review
                </h1>
                <p className="text-gray-600">
                  Review and respond to student apology letter
                </p>
              </div>
              <div className="flex gap-2">
                {getStatusBadge(apology.status)}
                {getTypeBadge(apology.type)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Apology Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Apology Letter
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Message
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {apology.message || "No message provided"}
                    </p>
                  </div>
                  {apology.description && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        Additional Details
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {apology.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Review Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Review & Respond</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Update Status
                    </label>
                    <Select
                      value={reviewStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Comment (Optional)
                    </label>
                    <Textarea
                      placeholder="Add your review comments..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <Button
                      onClick={handleSendComment}
                      disabled={!newComment.trim()}
                      className="mt-2"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Student Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          apology.student?.user?.avatar ||
                          "/avatars/student.svg"
                        }
                        alt="Student"
                      />
                      <AvatarFallback>
                        {apology.student?.user?.name?.charAt(0) || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {apology.student?.user?.name ||
                          apology.student?.name ||
                          "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {apology.student_id || apology.student?.id || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">
                        {apology.student?.roomNo ||
                          apology.student?.room_no ||
                          "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Block:</span>
                      <span className="font-medium">
                        {apology.student?.block || "—"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Submitted
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(apology.created_at || apology.createdAt)}
                      </p>
                    </div>
                  </div>

                  {apology.status !== "submitted" && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {apology.status?.charAt(0).toUpperCase() +
                            apology.status?.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(apology.updated_at || apology.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
